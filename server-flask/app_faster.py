
from __future__ import annotations
import os, time, uuid, base64, threading, queue, logging, tempfile, math, re, json
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import sqlite3

try:
    from faster_whisper import WhisperModel  # type: ignore
except Exception as e:  # pragma: no cover
    raise RuntimeError("faster-whisper not installed. Install via: pip install faster-whisper") from e

try:
    import webrtcvad  # type: ignore
    HAVE_VAD = True
except Exception:
    HAVE_VAD = False
    webrtcvad = None  # type: ignore
    logging.warning("⚠️ webrtcvad not available – energy fallback will be used (pip install webrtcvad for higher accuracy)")

try:
    import soundfile as sf
    import numpy as np
except Exception as e:  # pragma: no cover
    raise RuntimeError("soundfile and numpy required. Install via: pip install soundfile numpy") from e


try:
    import av  # type: ignore
    HAVE_AV = True
except Exception:
    HAVE_AV = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app_faster")

# Structured logging helper (parity style with original app.py for easier tailing)
def log_event(event: str, **fields):
    try:
        import json as _json
        payload = {k: v for k, v in fields.items() if v is not None}
        logger.info(f"[{event}] {_json.dumps(payload, ensure_ascii=False)}")
    except Exception as _e:  # pragma: no cover
        logger.info(f"[{event}] (log-failed {_e}) {fields}")


def _normalize_filler_term(term: str) -> str:
    try:
        t = term.lower().strip()
        t = re.sub(r"\s+", " ", t)
        return t
    except Exception:
        return term

def _emit_filler_warning(client_id: str, st: "InterviewState", detected_terms: List[str], source: str, text: Optional[str] = None):
    if not detected_terms:
        return False
    now = time.time()
    wt = st.warning_tracker
    norm_terms = [_normalize_filler_term(t) for t in detected_terms]
    new_terms: List[str] = []
    for t in set(norm_terms):
        last = wt.last_filler_terms.get(t, 0.0)
        if (now - last) >= FILLER_DEDUP_SEC:
            new_terms.append(t)
            wt.last_filler_terms[t] = now
    should_emit = bool(new_terms)
    if not should_emit:
        strong = any(t in STRONG_FILLERS for t in norm_terms)
        if strong and (now - wt.last_filler_warning) > FILLER_WARNING_COOLDOWN:
            should_emit = True
    if should_emit:
        payload = {
            'type': 'filler_words',
            'message': 'Filler word detected.' if len(norm_terms) == 1 else 'Filler words detected.',
            'words': norm_terms,
            'newWords': new_terms,
            'source': source
        }
        if text:
            payload['context'] = text
        socketio.emit('live-warning', payload, to=client_id)
        socketio.emit('filler-detected', payload, to=client_id)
        wt.last_filler_warning = now
        log_event('warning.emit', kind='filler_words', source=source, words=norm_terms, newWords=new_terms)
        return True
    return False

DB_PATH = 'interview_iq.db'
SAMPLE_RATE = 16000
FRAME_MS = 20  
FRAME_BYTES = int(SAMPLE_RATE * (FRAME_MS/1000.0) * 2)  
VAD_AGGRESSIVENESS = int(os.getenv('IQ_VAD_AGGR','2'))
SEGMENT_MAX_SECONDS = float(os.getenv('IQ_SEGMENT_MAX','1.25'))  
SEGMENT_MIN_SECONDS = float(os.getenv('IQ_SEGMENT_MIN','0.30'))
EMIT_ENDED_EVENT = os.getenv('IQ_EMIT_ENDED','1') == '1'
SILENCE_TAIL_MS = int(os.getenv('IQ_SILENCE_TAIL_MS','450'))
PAUSE_SOFT_SEC = float(os.getenv('IQ_PAUSE_SOFT','10.0'))
PAUSE_HARD_SEC = float(os.getenv('IQ_PAUSE_HARD','10.0'))
LONG_PAUSE_THRESHOLD = float(os.getenv('IQ_LONG_PAUSE_SEC', str(PAUSE_HARD_SEC)))  # unified threshold for background monitor
FILLER_WARNING_COOLDOWN = float(os.getenv('IQ_FILLER_COOLDOWN','2.0'))
PAUSE_WARNING_COOLDOWN = float(os.getenv('IQ_PAUSE_COOLDOWN','3.0'))
REPETITION_UNIQ_RATIO = float(os.getenv('IQ_REPETITION_UNIQ_RATIO','0.55'))
STRONG_FILLERS = set(['um','uh','umm','hmm','erm','er','uhh','uhmmm','the the','and and','so so','ehm','um','om','Ando','doo','ando'])  

FILLER_PATTERNS = [
   
    r'u+m+', r'u+h+', r'a+h+', r'h+m+', r'erm+', r'er+', r'um+', r'uh+', r'ah+',
    r'\byeah\b', r'\bso\b', r'\bwell\b', r'\blike\b', r'\byou\s+know\b', r"\bi\s+mean\b",
    r'\bactually\b', r'\bbasically\b', r'\bliterally\b', r'\bsort\s+of\b', r'\bkind\s+of\b'
]
FILLER_REGEX = re.compile(r'(' + '|'.join(FILLER_PATTERNS) + r')', re.IGNORECASE)


PARTIAL_MIN_DUR = float(os.getenv('IQ_PARTIAL_MIN_DUR','0.35')) 
PARTIAL_EMIT_INTERVAL = float(os.getenv('IQ_PARTIAL_EMIT_INTERVAL','0.5'))  

FILLER_DEDUP_SEC = float(os.getenv('IQ_FILLER_DEDUP_SEC','2.5'))
MIN_SPEECH_ENERGY = float(os.getenv('IQ_MIN_SPEECH_ENERGY','180'))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'interview-iq-secret-key-2025'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
CORS(app)


logger.info("Loading faster-whisper streaming model (tiny.en) ...")
fw_model_fast = WhisperModel("tiny.en", device="cpu", compute_type="int8")
logger.info("Loaded tiny.en model")


FINAL_PASS = False
fw_model_final = None
if FINAL_PASS:
    logger.info("Loading final-pass model (base.en)...")
    fw_model_final = WhisperModel("base.en", device="cpu", compute_type="int8")


def get_db_connection(timeout=10.0):
    conn = sqlite3.connect(DB_PATH, timeout=timeout, check_same_thread=False)
    conn.execute('PRAGMA journal_mode=WAL')
    return conn

def init_database():
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                difficulty TEXT NOT NULL,
                llm TEXT NOT NULL,
                interview_type TEXT NOT NULL,
                persona TEXT NOT NULL,
                subject TEXT NOT NULL,
                module_id TEXT NOT NULL,
                path_id TEXT NOT NULL,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                total_questions INTEGER DEFAULT 0,
                completed_questions INTEGER DEFAULT 0,
                overall_score REAL,
                status TEXT DEFAULT 'active'
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS interview_questions (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                question_number INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                answer_text TEXT,
                transcription_result TEXT,
                analysis_result TEXT,
                quality_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                question_category TEXT DEFAULT 'general',
                difficulty_level TEXT DEFAULT 'Medium',
                expected_duration INTEGER DEFAULT 120,
                FOREIGN KEY (session_id) REFERENCES interview_sessions (id)
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS interview_answers (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                question_id TEXT,
                audio_transcript TEXT,
                answer_duration REAL,
                filler_words_count INTEGER,
                confidence_score REAL,
                clarity_score REAL,
                technical_accuracy REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES interview_sessions (id)
            )
        ''')
        conn.commit()
        logger.info("✅ Database initialized (streaming)")
    finally:
        conn.close()

init_database()

# Optional AI system (reusing simplified agent if present)
try:
    from ai_agents_simple import interview_ai  # type: ignore
    AI_AVAILABLE = True
    logger.info("✅ AI agent available for question generation (streaming)")
except Exception as e:  # pragma: no cover
    AI_AVAILABLE = False
    interview_ai = None  # type: ignore
    logger.warning(f"AI system not available in streaming server: {e}")

def map_subject_id_to_name(subject_id: str) -> str:
    subject_mappings = {
        'frontend': 'frontend development', 'Frontend Development': 'frontend development',
        'react': 'React.js development','javascript': 'JavaScript development', 'html-css': 'HTML/CSS development',
        'backend': 'backend development','nodejs': 'Node.js development','python': 'Python development',
        'java': 'Java development','spring': 'Spring Framework','django': 'Django development','flask': 'Flask development',
        'database': 'database management','sql': 'SQL and database design','mongodb': 'MongoDB development',
        'dsa': 'data structures and algorithms','system-design': 'system design and architecture',
        'cloud': 'cloud computing','aws': 'Amazon Web Services (AWS)','azure': 'Microsoft Azure','gcp': 'Google Cloud Platform',
        'docker': 'Docker containerization','kubernetes': 'Kubernetes orchestration','devops': 'DevOps practices',
        'machine-learning': 'machine learning','ml': 'machine learning','ai': 'artificial intelligence',
        'data-science': 'data science','deep-learning': 'deep learning','nlp': 'natural language processing'
    }
    return subject_mappings.get(subject_id, subject_id)


@dataclass
class WarningTracker:
    last_filler_warning: float = 0.0
    last_pause_warning_soft: float = 0.0
    last_pause_warning_hard: float = 0.0
    last_speech_time: float = field(default_factory=time.time)
    filler_count_session: int = 0
    repetition_count_session: int = 0
    last_filler_terms: Dict[str, float] = field(default_factory=dict)

@dataclass
class AudioSegmentTask:
    session_id: str
    client_id: str
    segment_id: str
    pcm: bytes  
    started_at: float = field(default_factory=time.time)

@dataclass
class InterviewState:
    session_id: str
    module_name: str
    difficulty: str
    current_question: int = 1
    max_questions: int = 10
    cumulative_transcript: str = ""
    segments: List[Dict[str, Any]] = field(default_factory=list)
    answers: List[Dict[str, Any]] = field(default_factory=list)
    is_recording: bool = False
    recording_start_time: Optional[float] = None
    last_recording_stop_time: Optional[float] = None
    warning_tracker: WarningTracker = field(default_factory=WarningTracker)
    last_voice_time: float = field(default_factory=time.time)
    vad_state: str = "silence"  
    current_pcm_buffer: bytearray = field(default_factory=bytearray)
    last_silence_start: Optional[float] = None
    prefetch: Dict[int, str] = field(default_factory=dict)
    transcripts: List[str] = field(default_factory=list)
    analyses: List[Dict[str, Any]] = field(default_factory=list)
    last_saved_question_id: Optional[str] = None
   
    raw_answer_pcm: bytearray = field(default_factory=bytearray)
    last_partial_emit: float = field(default_factory=lambda: 0.0)
    partial_sequence: int = 0
    finished: bool = False


def analyze_speech_basic(transcript: str) -> Dict[str, Any]:
    words = re.findall(r"[a-zA-Z']+", transcript.lower())
    wc = len(words)
    fillers = FILLER_REGEX.findall(transcript)
    filler_count = len(fillers)
    ratio = filler_count / wc if wc else 0.0
    quality = 'green'
    if wc < 8 or ratio > 0.18:
        quality = 'red'
    elif ratio > 0.1:
        quality = 'yellow'
    return {
        'wordCount': wc,
        'fillerWords': filler_count,
        'fillerRatio': round(ratio,3),
        'quality': quality
    }

def _extended_analytics(answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    total_words = 0
    total_fillers = 0
    filler_breakdown: Dict[str,int] = {}
    for a in answers:
        tr = (a.get('transcript') or '').lower()
        words = re.findall(r"[a-zA-Z']+", tr)
        total_words += len(words)
        seg_fillers = FILLER_REGEX.findall(tr)
        total_fillers += len(seg_fillers)
        for f in seg_fillers:
            k = f.lower().strip()
            filler_breakdown[k] = filler_breakdown.get(k,0)+1
    ratio = (total_fillers/total_words) if total_words else 0.0
    strengths = []
    improvements = []
    recommendations = []
    if ratio < 0.05:
        strengths.append('Excellent clarity with minimal filler words.')
    elif ratio > 0.12:
        improvements.append('High filler density — practice concise answers.')
        recommendations.append('Record short mock answers focusing on reducing fillers like um/uh.')
    avg_conf = round(sum(a.get('confidenceScore',0) for a in answers)/max(len(answers),1),1) if answers else 0
    if avg_conf >= 70:
        strengths.append('Good confidence level across responses.')
    elif avg_conf and avg_conf < 55:
        improvements.append('Confidence can improve — maintain steady pace and projection.')
    overall_feedback = 'Balanced performance.'
    if improvements and not strengths:
        overall_feedback = 'Focus on reducing fillers and improving delivery consistency.'
    elif strengths and not improvements:
        overall_feedback = 'Strong communication foundations — keep refining depth and structure.'
    return {
        'aggregate': {
            'wordCount': total_words,
            'fillerWords': total_fillers,
            'fillerRatio': round(ratio,3),
            'fillerBreakdown': sorted([{ 'filler': k, 'count': v } for k,v in filler_breakdown.items()], key=lambda x: x['count'], reverse=True)
        },
        'strengths': strengths,
        'improvements': improvements,
        'recommendations': recommendations,
        'overallFeedback': overall_feedback
    }

def build_completion_payload(session_id: str) -> Dict[str, Any]:
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM interview_sessions WHERE id=?', (session_id,))
        session_row = cur.fetchone()
        if not session_row:
            return {'sessionId': session_id, 'message': 'Session not found'}
        cur.execute('SELECT question_number, question_text FROM interview_questions WHERE session_id=? ORDER BY question_number',(session_id,))
        questions = [{'questionNumber': r[0], 'questionText': r[1]} for r in cur.fetchall()]
        cur.execute('''SELECT question_id, audio_transcript, filler_words_count, confidence_score, clarity_score, technical_accuracy
                       FROM interview_answers WHERE session_id=? ORDER BY id''', (session_id,))
        answers_rows = cur.fetchall()
        answers = []
        total_duration_sec = 0.0
        for qid, tr, fw, conf, clar, tech in answers_rows:
            tr_l = (tr or '')
            per_fillers = FILLER_REGEX.findall(tr_l)
            per_breakdown: Dict[str,int] = {}
            for f in per_fillers:
                k = str(f).lower().strip()
                per_breakdown[k] = per_breakdown.get(k,0)+1
            answers.append({
                'questionId': qid,
                'transcript': tr_l,
                'fillerWordsCount': fw or len(per_fillers),
                'fillerWords': sorted([{ 'word': k, 'count': v } for k,v in per_breakdown.items()], key=lambda x: x['count'], reverse=True),
                'confidenceScore': conf or 0,
                'clarityScore': clar or 0,
                'technicalAccuracy': tech or 0
            })
       
        try:
            cur.execute('SELECT COALESCE(SUM(answer_duration),0) FROM interview_answers WHERE session_id=?', (session_id,))
            total_duration_sec = float(cur.fetchone()[0] or 0.0)
        except Exception:
            total_duration_sec = 0.0
        overall_conf = round(sum(a['confidenceScore'] for a in answers)/max(len(answers),1),1) if answers else 0
        overall_clarity = round(sum(a['clarityScore'] for a in answers)/max(len(answers),1),1) if answers else 0
        overall_tech = round(sum(a['technicalAccuracy'] for a in answers)/max(len(answers),1),1) if answers else 0
        overall_comm = round((overall_conf+overall_clarity)/2,1) if answers else 0
        agg = _extended_analytics(answers)
        filler_total = agg['aggregate']['fillerWords']
        filler_breakdown = [{ 'word': x['filler'], 'count': x['count'] } for x in agg['aggregate']['fillerBreakdown']]
        def _fmt(sec: float) -> str:
            s = int(round(sec))
            m = s // 60
            ss = s % 60
            return f"{m:02d}:{ss:02d}"
        base = {
            'sessionId': session_id,
            'message': 'Interview completed successfully!',
            'totalQuestions': session_row[11] or len(questions) or 10,
            'answeredQuestions': len(answers),
            'completedQuestions': len(answers),
            'overallScore': overall_comm,
            'duration': _fmt(total_duration_sec),
            'scores': {
                'overallCommunication': overall_comm,
                'confidence': overall_conf,
                'clarity': overall_clarity,
                'technical_accuracy': overall_tech
            },
            'fillerWords': {
                'total': filler_total,
                'breakdown': filler_breakdown,
                'realtime_count': 0
            },
            'questions': questions,
            'answers': answers
        }
        base.update(agg)
        return base
    except Exception as e:  
        logger.error(f"Completion payload failed: {e}")
        return {'sessionId': session_id, 'message': 'Error building completion payload'}
    finally:
        try: conn.close()
        except Exception: pass

active_interviews: Dict[str, InterviewState] = {}
sessions_by_id: Dict[str, InterviewState] = {}


segment_queue: "queue.Queue[AudioSegmentTask]" = queue.Queue(maxsize=64)


def transcription_worker():
    while True:
        task: AudioSegmentTask = segment_queue.get()
        try:
            log_event('segment.dequeue', segmentId=task.segment_id, queueSize=segment_queue.qsize())
            # Convert bytes -> float32 numpy
            pcm16 = np.frombuffer(task.pcm, dtype=np.int16)
            audio = pcm16.astype('float32') / 32768.0
            # faster-whisper expects either file path or numpy array
            segments, _info = fw_model_fast.transcribe(audio, language='en', beam_size=1, vad_filter=False)
            text_parts = []
            word_list = []
            for seg in segments:
                text_parts.append(seg.text)
                if getattr(seg, 'words', None):
                    for w in seg.words:
                        word_list.append({'word': w.word, 'start': w.start, 'end': w.end})
            text = ' '.join(t.strip() for t in text_parts).strip()
            if not word_list and text:
                tokens = re.findall(r"[a-zA-Z']+", text)
                t_step = max(0.15, len(task.pcm)/(2*SAMPLE_RATE)/max(len(tokens),1))
                for i, tok in enumerate(tokens):
                    word_list.append({'word': tok, 'start': i*t_step, 'end': (i+1)*t_step})

            state = active_interviews.get(task.client_id)
            if not state or state.session_id != task.session_id:
                continue
            if text:
                if state.cumulative_transcript:
                    state.cumulative_transcript += ' ' + text
                else:
                    state.cumulative_transcript = text
                state.transcripts.append(text)
                log_event('segment.transcribed', segmentId=task.segment_id, chars=len(text), cumulativeChars=len(state.cumulative_transcript))
            fillers_found = FILLER_REGEX.findall(text)
            unique_fillers = list(set(f.lower().strip() for f in fillers_found))
            filler_count = len(fillers_found)
            state.warning_tracker.filler_count_session += filler_count

        
            last_tokens = re.findall(r"[a-zA-Z']+", state.cumulative_transcript.lower())[-40:]
            uniq_ratio = len(set(last_tokens)) / max(len(last_tokens),1)    
            if fillers_found:
                _emit_filler_warning(task.client_id, state, [str(f) for f in fillers_found], source='segment', text=text)

            if len(last_tokens) >= 12 and uniq_ratio < REPETITION_UNIQ_RATIO:
                socketio.emit('live-warning', {'type': 'repetition', 'message': 'You are repeating yourself—try adding new details.'}, to=task.client_id)
                log_event('warning.emit', kind='repetition', uniqueRatio=round(uniq_ratio,3), windowSize=len(last_tokens))

            socketio.emit('partial-transcript', {
                'segmentId': task.segment_id,
                'text': text,
                'isFinal': True,
                'cumulativeTranscript': state.cumulative_transcript,
                'fillersDetected': unique_fillers,
                'fillerCountSegment': filler_count,
                'fillerCountSession': state.warning_tracker.filler_count_session
            }, to=task.client_id)
            log_event('partial.emit', segmentId=task.segment_id, fillerCount=filler_count, queueSize=segment_queue.qsize())
        except Exception as e:
            logger.error(f"Segment transcription failed: {e}")
        finally:
            segment_queue.task_done()

threading.Thread(target=transcription_worker, daemon=True).start()



def transcribe_pcm_bytes(pcm: bytes) -> str:

    try:
        pcm16 = np.frombuffer(pcm, dtype=np.int16).astype('float32')/32768.0
        segs, _ = fw_model_fast.transcribe(pcm16, language='en', beam_size=1, vad_filter=False)
        return ' '.join(s.text.strip() for s in segs if getattr(s, 'text', None)).strip()
    except Exception as e1:
        log_event('transcribe.numpy_error', error=str(e1))
        try:
            import soundfile as sf
            import tempfile as _tf
            import numpy as _np
            float_audio = _np.frombuffer(pcm, dtype=_np.int16).astype('float32')/32768.0
            with _tf.NamedTemporaryFile(suffix='.wav', delete=False) as wf:
                wav_path = wf.name
            sf.write(wav_path, float_audio, SAMPLE_RATE, subtype='PCM_16')
            try:
                segs, _ = fw_model_fast.transcribe(wav_path, language='en', beam_size=1, vad_filter=False)
                return ' '.join(s.text.strip() for s in segs if getattr(s, 'text', None)).strip()
            finally:
                try:
                    os.unlink(wav_path)
                except Exception:
                    pass
        except Exception as e2:
            log_event('transcribe.wav_fallback_error', error=str(e2))
            return ''

def decode_audio_chunk(b64_data: str) -> bytes:

    raw = base64.b64decode(b64_data)
    if len(raw) % 2 == 0 and len(raw) > 400 and not raw.startswith(b'RIFF') and raw[:4] != b'\x1aE\xdf\xa3':
        return raw  
    decoded = b''
    if HAVE_AV:
        try:
            import io
            with av.open(io.BytesIO(raw)) as container:  # type: ignore
                stream = next((s for s in container.streams if s.type == 'audio'), None)
                if stream is None:
                    raise RuntimeError('No audio stream in container')
                resampler = av.audio.resampler.AudioResampler(format='s16', layout='mono', rate=SAMPLE_RATE)
                pcm_parts = []
                for frame in container.decode(audio=stream.index):
                    frame16 = resampler.resample(frame)
                    pcm_parts.append(bytes(frame16.planes[0]))
                decoded = b''.join(pcm_parts)
        except Exception as e:
            log_event('audio.av_decode_error', error=str(e))
            decoded = b''
    if not decoded:
        tmp_in = None
        tmp_out = None
        try:
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as f:
                f.write(raw)
                tmp_in = f.name
            tmp_out = tmp_in + '.pcm'
            cmd = f"ffmpeg -y -i \"{tmp_in}\" -ar {SAMPLE_RATE} -ac 1 -f s16le \"{tmp_out}\" 2>nul"
            os.system(cmd)
            with open(tmp_out,'rb') as fr:
                decoded = fr.read()
        except Exception as e:
            log_event('audio.ffmpeg_decode_error', error=str(e))
        finally:
            try:
                if tmp_in and os.path.exists(tmp_in):
                    os.unlink(tmp_in)
                if tmp_out and os.path.exists(tmp_out):
                    os.unlink(tmp_out)
            except Exception:
                pass
    return decoded


if 'HAVE_VAD' in globals() and HAVE_VAD:
    vad = webrtcvad.Vad(int(os.getenv('IQ_VAD_AGGR','3')))  # type: ignore
else:
    vad = None  # type: ignore

def frame_is_speech(frame: bytes) -> bool:
    """Return True if frame likely contains speech (VAD + energy gate or energy fallback)."""
    try:
        if vad is not None:
            ok = vad.is_speech(frame, SAMPLE_RATE)  # type: ignore
            if not ok:
                return False
            import struct, math as _m
            samples = struct.unpack('<' + 'h'*(len(frame)//2), frame)
            rms = _m.sqrt(sum(s*s for s in samples)/max(len(samples),1))
            return rms >= MIN_SPEECH_ENERGY
        import struct, math as _m
        samples = struct.unpack('<' + 'h'*(len(frame)//2), frame)
        rms = _m.sqrt(sum(s*s for s in samples)/max(len(samples),1))
        thr = float(os.getenv('IQ_ENERGY_THRESHOLD','320'))
        return rms >= thr
    except Exception:
        return False

def process_incoming_audio(client_id: str, session_id: str, pcm: bytes):
    state = active_interviews.get(client_id)
    if not state or state.session_id != session_id:
        return
    wt = state.warning_tracker
    i = 0
    now = time.time()
    frame_index = 0
    while i + FRAME_BYTES <= len(pcm):
        frame = pcm[i:i+FRAME_BYTES]
        i += FRAME_BYTES
        is_speech = frame_is_speech(frame)
        if frame_index % 10 == 0:  
            log_event('vad.frame', idx=frame_index, speech=is_speech, state=state.vad_state, bufMs=round(len(state.current_pcm_buffer)/(2*SAMPLE_RATE)*1000))
        if is_speech:
            state.last_voice_time = time.time()
            wt.last_speech_time = state.last_voice_time
            if state.vad_state == 'silence':
                state.vad_state = 'voice'
        else:

            if state.vad_state == 'voice':
                state.vad_state = 'tail'
                state.last_silence_start = time.time()
            elif state.vad_state == 'tail':
                if state.last_silence_start and (time.time() - state.last_silence_start) * 1000 >= SILENCE_TAIL_MS:
                    close_current_segment(client_id)
                    state.vad_state = 'silence'
        if state.vad_state in ('voice','tail'):
            state.current_pcm_buffer.extend(frame)
            seg_dur = len(state.current_pcm_buffer)/(2*SAMPLE_RATE)
            now_local = time.time()
            if (
                seg_dur >= PARTIAL_MIN_DUR and
                (now_local - state.last_partial_emit) >= PARTIAL_EMIT_INTERVAL and
                os.getenv('IQ_DEBUG_DIRECT_TRANSCRIBE','0') != '1'
            ):
                try:
                    pcm16_full = np.frombuffer(bytes(state.current_pcm_buffer), dtype=np.int16).astype('float32')/32768.0
                    take_samples = int(min(len(pcm16_full), 1.2 * SAMPLE_RATE))
                    slice_audio = pcm16_full[-take_samples:]
                    segs, _ = fw_model_fast.transcribe(slice_audio, language='en', beam_size=1, vad_filter=False)
                    partial_text = ' '.join(s.text.strip() for s in segs if s.text).strip()
                    if partial_text:
                        fillers_partial = FILLER_REGEX.findall(partial_text)
                        if fillers_partial:
                            _emit_filler_warning(client_id, state, [str(f) for f in fillers_partial], source='partial', text=partial_text)
                        socketio.emit('partial-transcript', {
                            'segmentId': f'partial-{state.partial_sequence}',
                            'text': partial_text,
                            'isFinal': False,
                            'cumulativeTranscript': state.cumulative_transcript,
                            'preview': True,
                            'fillersDetected': list(set(f.lower().strip() for f in fillers_partial)) if fillers_partial else []
                        }, to=client_id)
                        state.partial_sequence += 1
                        state.last_partial_emit = now_local
                except Exception as pe:  # pragma: no cover
                    log_event('partial.error', error=str(pe))
            
            dur = len(state.current_pcm_buffer)/(2*SAMPLE_RATE)
            if dur >= SEGMENT_MAX_SECONDS:
                close_current_segment(client_id)
                state.vad_state = 'silence'
        frame_index += 1
    silence_duration = now - state.last_voice_time
    if state.vad_state == 'silence':
        if silence_duration > PAUSE_HARD_SEC and (now - wt.last_pause_warning_hard) > PAUSE_WARNING_COOLDOWN:
            socketio.emit('live-warning', {'type':'long_pause','severity':'hard','message':'Long pause detected — resume speaking.'}, to=client_id)
            wt.last_pause_warning_hard = now
        elif silence_duration > PAUSE_SOFT_SEC and (now - wt.last_pause_warning_soft) > PAUSE_WARNING_COOLDOWN:
            socketio.emit('live-warning', {'type':'long_pause','severity':'soft','message':'Try to continue your answer.'}, to=client_id)
            wt.last_pause_warning_soft = now


def close_current_segment(client_id: str):
    state = active_interviews.get(client_id)
    if not state:
        return
    pcm = bytes(state.current_pcm_buffer)
    state.current_pcm_buffer.clear()
    dur = len(pcm)/(2*SAMPLE_RATE)
    if len(pcm) == 0:
        log_event('segment.discard', reason='empty', dur=0.0)
        return
    if dur < SEGMENT_MIN_SECONDS:
        log_event('segment.discard', reason='too_short', dur=round(dur,3))
        return
    segment_id = str(uuid.uuid4())
   
    try:
        segment_queue.put_nowait(AudioSegmentTask(session_id=state.session_id, client_id=client_id, segment_id=segment_id, pcm=pcm))
    except queue.Full:
        logger.warning("Segment queue full; dropping segment")



def generate_first_question(module_name: str) -> str:
    return f"Tell me about your experience with {module_name}."

def _pause_monitor_loop():
    while True:
        try:
            now = time.time()
            for client_id, st in list(active_interviews.items()):
                if not st.is_recording:
                    continue
                wt = st.warning_tracker
                silence_dur = now - st.last_voice_time
                if silence_dur >= LONG_PAUSE_THRESHOLD and (now - wt.last_pause_warning_hard) > PAUSE_WARNING_COOLDOWN:
                    socketio.emit('live-warning', {'type':'long_pause','severity':'hard','message':'You have been silent for a while — continue your answer.'}, to=client_id)
                    wt.last_pause_warning_hard = now
                    log_event('pause.monitor.emit', sessionId=st.session_id, silenceSec=round(silence_dur,2))
        except Exception as e:  
            log_event('pause.monitor.error', error=str(e))
        time.sleep(1.0)

threading.Thread(target=_pause_monitor_loop, daemon=True).start()


@socketio.on('connect')
def on_connect():
    client_id = request.sid  # type: ignore[attr-defined]
    log_event('socket.connect', clientId=client_id)
    emit('connected', {'clientId': client_id})

@socketio.on('start-interview-session')
def start_interview_session(data):
    client_id = request.sid  # type: ignore[attr-defined]
    config = data.get('config', {}) if isinstance(data, dict) else {}
    metadata = data.get('metadata', {}) if isinstance(data, dict) else {}
    session_id = str(uuid.uuid4())
    module_name = config.get('subject','General')
    difficulty = config.get('difficulty','Medium')
    log_event('interview.start', clientId=client_id, sessionId=session_id, module=module_name, difficulty=difficulty)
 
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('''INSERT INTO interview_sessions (id, difficulty, llm, interview_type, persona, subject, module_id, path_id)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', (
            session_id,
            difficulty,
            config.get('llm','ChatGPT'),
            config.get('interviewType','general'),
            config.get('persona','professional_man'),
            module_name,
            config.get('moduleId','default'),
            config.get('pathId','default')
        ))
        conn.commit()
    finally:
        try: conn.close()
        except Exception: pass
    state = InterviewState(session_id=session_id, module_name=module_name, difficulty=difficulty)
    active_interviews[client_id] = state
    sessions_by_id[session_id] = state
    emit('interview-session-started', {'sessionId': session_id, 'status':'Session created successfully'})
    log_event('session.created', sessionId=session_id)
    q1 = None
    if AI_AVAILABLE and interview_ai:
        try:
            subject_name = map_subject_id_to_name(module_name)
            qres = interview_ai.generate_question(difficulty=difficulty, subject=subject_name, persona='professional_man', question_number=1, previous_answers=[])
            if qres and (qres.get('question') or qres.get('question_text')):
                q1 = qres.get('question') or qres.get('question_text')
        except Exception as e:
            logger.warning(f"AI question gen failed: {e}")
    if not q1:
        q1 = generate_first_question(module_name)
    qid = str(uuid.uuid4())
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('''INSERT INTO interview_questions (id, session_id, question_number, question_text, question_category, difficulty_level, expected_duration)
                       VALUES (?, ?, ?, ?, ?, ?, ?)''', (
            qid, session_id, 1, q1, module_name, difficulty, 120
        ))
        conn.commit()
    finally:
        try: conn.close()
        except Exception: pass
    state.last_saved_question_id = f"q1_{session_id}"
    state.prefetch[1] = q1
    emit('interview-question', {'questionText': q1, 'questionNumber':1, 'totalQuestions': state.max_questions, 'category': module_name, 'questionId': f"{session_id}_q1"})
    log_event('question.emit', sessionId=session_id, questionNumber=1, chars=len(q1))

@socketio.on('recording-start')
def recording_start(data):
    client_id = request.sid  # type: ignore[attr-defined]
    session_id = (data or {}).get('sessionId')
    st = active_interviews.get(client_id)
    if not st or st.session_id != session_id:
        return
    st.is_recording = True
    st.recording_start_time = time.time()
    now_ts = time.time()

    st.warning_tracker.last_speech_time = now_ts
    st.last_voice_time = now_ts
    st.warning_tracker.last_pause_warning_soft = now_ts
    st.warning_tracker.last_pause_warning_hard = now_ts
    emit('recording-started', {'status':'Recording started'})
    log_event('recording.start', sessionId=session_id, clientId=client_id)

@socketio.on('recording-stop')
def recording_stop(data):
    client_id = request.sid  # type: ignore[attr-defined]
    st = active_interviews.get(client_id)
    if not st:
        return
    st.is_recording = False
    st.last_recording_stop_time = time.time()
   
    if st.current_pcm_buffer:
       
        if len(st.current_pcm_buffer)/(2*SAMPLE_RATE) < SEGMENT_MIN_SECONDS:
            pcm = bytes(st.current_pcm_buffer)
            st.current_pcm_buffer.clear()
            segment_id = str(uuid.uuid4())
            try:
                segment_queue.put_nowait(AudioSegmentTask(session_id=st.session_id, client_id=client_id, segment_id=segment_id, pcm=pcm))
                log_event('segment.force_flush', segmentId=segment_id, dur=round(len(pcm)/(2*SAMPLE_RATE),3))
            except queue.Full:
                logger.warning('Segment queue full; dropping forced flush segment')
        else:
            close_current_segment(client_id)
    emit('recording-stopped', {'status':'Recording stopped'})
    log_event('recording.stop', sessionId=st.session_id, clientId=client_id)

@socketio.on('audio-chunk')
def audio_chunk(data):
    client_id = request.sid  # type: ignore[attr-defined]
    session_id = (data or {}).get('sessionId')
    st = active_interviews.get(client_id)
    if not st or st.session_id != session_id or not st.is_recording:
        return
    audio_data = (data or {}).get('audioData')
    if not audio_data:
        return
    clean = audio_data.strip()
    if clean.startswith('data:'):
        clean = clean.split(',')[1]
    if not session_id:
        return
    try:
        pcm = decode_audio_chunk(clean)
    except Exception as e:
        logger.warning(f"Decode failed: {e}")
        log_event('audio.decode_error', sessionId=session_id, error=str(e))
        return
    if st:
        st.raw_answer_pcm.extend(pcm)
    log_event('audio.chunk', sessionId=session_id, bytes=len(pcm))
    if os.getenv('IQ_DEBUG_DIRECT_TRANSCRIBE','0') == '1':
        try:
            pcm16 = np.frombuffer(pcm, dtype=np.int16).astype('float32')/32768.0
            segs, _ = fw_model_fast.transcribe(pcm16, language='en', beam_size=1, vad_filter=False)
            direct_text = ' '.join(s.text.strip() for s in segs if s.text).strip()
            if direct_text:
                if st.cumulative_transcript:
                    st.cumulative_transcript += ' ' + direct_text
                else:
                    st.cumulative_transcript = direct_text
                fillers_direct = FILLER_REGEX.findall(direct_text)
                if fillers_direct:
                    _emit_filler_warning(client_id, st, [str(f) for f in fillers_direct], source='direct', text=direct_text)
                socketio.emit('partial-transcript', {'segmentId':'direct', 'text':direct_text, 'isFinal':False, 'cumulativeTranscript': st.cumulative_transcript, 'fillersDetected': list(set(f.lower().strip() for f in fillers_direct)) if fillers_direct else []}, to=client_id)
        except Exception as de:
            log_event('debug.direct_error', error=str(de))
    else:
        process_incoming_audio(client_id, session_id, pcm)

@socketio.on('process-complete-audio')
def process_complete_audio(data):
    client_id = request.sid  # type: ignore[attr-defined]
    session_id = (data or {}).get('sessionId')
    st = active_interviews.get(client_id)
    if not st or st.session_id != session_id:
        return
    audio_data = (data or {}).get('audioData')
    if not audio_data:
        return
    clean = audio_data.strip()
    if clean.startswith('data:'):
        clean = clean.split(',')[1]
    try:
        pcm = decode_audio_chunk(clean)
        if not pcm:
            log_event('audio.decode_empty', sessionId=session_id)
            emit('audio-transcription', { 'success': False, 'message': 'Empty audio after decode' })
            return
        st.raw_answer_pcm = bytearray(pcm)
        text = transcribe_pcm_bytes(pcm)
        if text:
            st.cumulative_transcript = text
            emit('audio-transcription', { 'success': True, 'transcript': text })
            log_event('audio.transcribe_complete_blob', sessionId=session_id, chars=len(text))
            
            log_event('transcript.text', kind='final_blob', sessionId=session_id, chars=len(text), snippet=text[:200])
        else:
            emit('audio-transcription', { 'success': False, 'message': 'No speech detected' })
            log_event('audio.transcribe_empty', sessionId=session_id)
    except Exception as e:
        log_event('audio.transcribe_error', sessionId=session_id, error=str(e))
        emit('audio-transcription', { 'success': False, 'message': 'Transcription failed' })

@socketio.on('answer-complete')
def answer_complete(data):
    client_id = request.sid  # type: ignore[attr-defined]
    st = active_interviews.get(client_id)
    if not st:
        return

    if st.current_pcm_buffer:
        if len(st.current_pcm_buffer)/(2*SAMPLE_RATE) < SEGMENT_MIN_SECONDS:
            pcm = bytes(st.current_pcm_buffer)
            st.current_pcm_buffer.clear()
            sid = str(uuid.uuid4())
            try:
                segment_queue.put_nowait(AudioSegmentTask(session_id=st.session_id, client_id=client_id, segment_id=sid, pcm=pcm))
                log_event('segment.force_flush', segmentId=sid, dur=round(len(pcm)/(2*SAMPLE_RATE),3), context='answer_complete')
            except queue.Full:
                logger.warning('Segment queue full; dropping forced flush (answer_complete)')
        else:
            close_current_segment(client_id)
     
    deadline = time.time() + 2.0
    while time.time() < deadline and not segment_queue.empty():
        time.sleep(0.05)
    transcript = st.cumulative_transcript.strip()
    if not transcript and len(st.raw_answer_pcm) > 0:
        try:
            fb_text = transcribe_pcm_bytes(bytes(st.raw_answer_pcm))
            if fb_text:
                transcript = fb_text
                st.cumulative_transcript = fb_text
                log_event('answer.fallback_transcribe', sessionId=st.session_id, chars=len(fb_text))
        except Exception as fe:
            log_event('answer.fallback_error', error=str(fe))
    log_event('answer.complete', sessionId=st.session_id, question=st.current_question, transcriptChars=len(transcript))
   
    if transcript:
        log_event('transcript.text', kind='final_answer', sessionId=st.session_id, question=st.current_question, chars=len(transcript), snippet=transcript[:200])
    words = re.findall(r"[a-zA-Z']+", transcript)
    filler_hits = FILLER_REGEX.findall(transcript)
    filler_count = len(filler_hits)
    duration = 0.0
    if st.recording_start_time and st.last_recording_stop_time:
        duration = st.last_recording_stop_time - st.recording_start_time
    wpm = (len(words)/(duration/60.0)) if duration > 1 else 0
    confidence_score = 70 if words else 40
    clarity_score = 70 - min(20, filler_count*2)
    technical_accuracy = 70
  
    question_id = f"q{st.current_question}_{st.session_id}"
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute('''INSERT INTO interview_answers (id, session_id, question_id, audio_transcript, answer_duration, filler_words_count, confidence_score, clarity_score, technical_accuracy)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
            str(uuid.uuid4()), st.session_id, question_id, transcript, float(round(duration,2)), filler_count, confidence_score, clarity_score, technical_accuracy
        ))
       
        cur.execute("UPDATE interview_sessions SET completed_questions = COALESCE(completed_questions,0) + 1 WHERE id=?", (st.session_id,))
        conn.commit()
    finally:
        try: conn.close()
        except Exception: pass
    st.last_saved_question_id = question_id
    feedback = {
        'scores': {
            'filler_words_count': filler_count,
            'answer_duration': round(duration,1),
            'words_per_minute': round(wpm,1),
            'filler_density': round(filler_count/max(len(words),1),3),
            'confidence_score': confidence_score,
            'clarity_score': clarity_score,
            'technical_accuracy': technical_accuracy
        },
        'transcript': transcript,
        'questionNumber': st.current_question
    }
    emit('interview-feedback', feedback)
    log_event('feedback.emit', sessionId=st.session_id, question=st.current_question, fillerWords=filler_count)
    if st.current_question < st.max_questions:
        next_q_number = st.current_question + 1
        next_q = None
        if AI_AVAILABLE and interview_ai:
            try:
                subject_name = map_subject_id_to_name(st.module_name)
                qres = interview_ai.generate_question(difficulty=st.difficulty, subject=subject_name, persona='professional_man', question_number=next_q_number, previous_answers=[transcript])
                if qres and (qres.get('question') or qres.get('question_text')):
                    next_q = qres.get('question') or qres.get('question_text')
            except Exception as e:
                logger.warning(f"AI next question failed: {e}")
        if not next_q:
            next_q = f"Describe a challenge related to {st.module_name} (Q{next_q_number})."
        
        try:
            conn = get_db_connection(); cur = conn.cursor()
            cur.execute('''INSERT INTO interview_questions (id, session_id, question_number, question_text, question_category, difficulty_level, expected_duration)
                           VALUES (?, ?, ?, ?, ?, ?, ?)''', (
                str(uuid.uuid4()), st.session_id, next_q_number, next_q, st.module_name, st.difficulty, 120
            ))
            conn.commit()
        finally:
            try: conn.close()
            except Exception: pass
        st.current_question = next_q_number
        emit('interview-question', {
            'questionText': next_q,
            'questionNumber': st.current_question,
            'totalQuestions': st.max_questions,
            'category': st.module_name,
            'questionId': f"{st.session_id}_q{st.current_question}"
        })
        log_event('question.emit', sessionId=st.session_id, questionNumber=st.current_question, chars=len(next_q))
        st.cumulative_transcript = ""
    else:
        try:
            conn = get_db_connection(); cur = conn.cursor()
            cur.execute("UPDATE interview_sessions SET end_time=CURRENT_TIMESTAMP, status='completed' WHERE id=?", (st.session_id,))
            conn.commit()
        finally:
            try: conn.close()
            except Exception: pass
        completion = build_completion_payload(st.session_id)
        emit('interview-complete', completion)
        log_event('interview.complete', sessionId=st.session_id, answered=completion.get('answeredQuestions'))

@socketio.on('end-interview')
def end_interview(data):
    client_id = request.sid  # type: ignore[attr-defined]
    st = active_interviews.get(client_id)
    if not st:
        return
    if st.finished:
        return
    close_current_segment(client_id)

    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute("UPDATE interview_sessions SET end_time=CURRENT_TIMESTAMP, status='completed' WHERE id=?", (st.session_id,))
        conn.commit()
    finally:
        try: conn.close()
        except Exception: pass
    if EMIT_ENDED_EVENT:
        payload = build_completion_payload(st.session_id)
        emit('interview-ended', payload)
        log_event('interview.ended', sessionId=st.session_id, answered=payload.get('answeredQuestions'))
    del active_interviews[client_id]

@app.route('/api/analytics/<session_id>', methods=['GET'])
def analytics(session_id: str):
    return jsonify(build_completion_payload(session_id))

@app.route('/')
def root():
    return {'message':'Interview IQ Streaming Server (faster-whisper)', 'status':'running'}

@app.route('/health')
def health():
    return {'status':'healthy', 'active': len(active_interviews), 'queueSize': segment_queue.qsize()}

if __name__ == '__main__':
    port = int(os.getenv('INTERVIEW_IQ_PORT', '5000'))
    logger.info(f'🚀 Starting Streaming Interview Server (faster-whisper + VAD) on port {port}')
    logger.info('➡️  Set INTERVIEW_IQ_PORT=5000 to run on the legacy port expected by your frontend.')
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
