import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid
import re
import tempfile
import base64
import binascii
import whisper
import threading
import time
from collections import Counter

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit # pyright: ignore[reportMissingModuleSource]
from flask_cors import CORS
import sqlite3


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Feature flags
# When False, we disable all live coaching (no interim processing, no live warnings)
LIVE_COACHING = False


def get_db_connection(timeout=10.0):
    conn = sqlite3.connect('interview_iq.db', timeout=timeout, check_same_thread=False)
    conn.execute('PRAGMA journal_mode=WAL') 
    return conn

try:
    from ai_agents_simple import interview_ai
    AI_AVAILABLE = True
    logger.info("✅ Simplified AI system loaded successfully (no CrewAI)")
except Exception as e:
    logger.warning(f"⚠️ AI system not available: {str(e)}")
    interview_ai = None
    AI_AVAILABLE = False


app = Flask(__name__)
app.config['SECRET_KEY'] = 'interview-iq-secret-key-2024'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
CORS(app)


active_interviews = {}
pause_monitors = {}

def _pause_monitor(client_id: str):
    if not LIVE_COACHING:
        return
    try:
        while True:
            sess = active_interviews.get(client_id)
            if not sess:
                break
            if not sess.get('is_recording'):
                break
            tracker = (sess or {}).get('warning_tracker', {})
            last_speech = tracker.get('last_speech_time') or sess.get('recording_start_time') or time.time()
            last_warn = tracker.get('last_pause_warning', 0)
            now = time.time()
            if (now - last_speech) >= 8 and (now - last_warn) > 5 and (tracker.get('consecutive_empty', 0) >= 3):
                try:
                    socketio.emit('live-warning', {'message': 'Long pause detected - keep speaking', 'type': 'long_pause'}, to=client_id)
                except Exception:
                    pass
                tracker['last_pause_warning'] = now
                tracker['pause_events'] = tracker.get('pause_events', 0) + 1
                sess['warning_tracker'] = tracker
                active_interviews[client_id] = sess
            time.sleep(0.4)
    except Exception as mon_err:
        logger.warning(f"Pause monitor ended for {client_id}: {mon_err}")

sessions_by_id: Dict[str, Dict[str, Any]] = {}
interview_sessions = {}


try:
    logger.info("Loading Whisper model...")
    whisper_model = whisper.load_model("base")
    whisper_lock = threading.Lock()
    logger.info("✅ Whisper model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load Whisper model: {str(e)}")
    whisper_model = None
    whisper_lock = threading.Lock()

def init_database():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
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

        cursor.execute('''
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
                FOREIGN KEY (session_id) REFERENCES interview_sessions (id)
            )
        ''')
      
        try:
            cursor.execute("PRAGMA table_info('interview_questions')")
            cols = {row[1] for row in cursor.fetchall()} 
           
            if 'question_category' not in cols:
                cursor.execute("ALTER TABLE interview_questions ADD COLUMN question_category TEXT DEFAULT 'general'")
            if 'difficulty_level' not in cols:
                cursor.execute("ALTER TABLE interview_questions ADD COLUMN difficulty_level TEXT DEFAULT 'Medium'")
            if 'expected_duration' not in cols:
                cursor.execute("ALTER TABLE interview_questions ADD COLUMN expected_duration INTEGER DEFAULT 120")
        except Exception as alter_err:
            logger.warning(f"⚠️ Could not ensure interview_questions columns: {alter_err}")
        cursor.execute('''
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
        logger.info("✅ Database initialized successfully")
    finally:
        conn.close()

def map_subject_id_to_name(subject_id: str) -> str:
    subject_mappings = {
      
        'frontend': 'frontend development',
        'Frontend Development': 'frontend development',
        'react': 'React.js development',
        'React Development': 'React.js development',
        'javascript': 'JavaScript development',
        'JavaScript Fundamentals': 'JavaScript development',
        'html-css': 'HTML/CSS development',
        'vue': 'Vue.js development',
        'angular': 'Angular development',
        
        # Backend subjects
        'backend': 'backend development',
        'Backend Development': 'backend development',
        'nodejs': 'Node.js development',
        'python': 'Python development',
        'java': 'Java development',
        'spring': 'Spring Framework',
        'django': 'Django development',
        'flask': 'Flask development',
        'express': 'Express.js development',
        
      
        'database': 'database management',
        'sql': 'SQL and database design',
        'mongodb': 'MongoDB development',
        'postgresql': 'PostgreSQL development',
        'mysql': 'MySQL development',
        
      
        'dsa': 'data structures and algorithms',
        'Data Structures and Algorithms': 'data structures and algorithms',
        'algorithms': 'algorithms and problem solving',
        'data-structures': 'data structures',
        
       
        'system-design': 'system design and architecture',
        'System Design': 'system design and architecture',
        'microservices': 'microservices architecture',
        'distributed-systems': 'distributed systems',
        
       
        'cloud': 'cloud computing',
        'Cloud Computing': 'cloud computing',
        'aws': 'Amazon Web Services (AWS)',
        'azure': 'Microsoft Azure',
        'gcp': 'Google Cloud Platform',
        'docker': 'Docker containerization',
        'kubernetes': 'Kubernetes orchestration',
        
       
        'devops': 'DevOps practices',
        'ci-cd': 'CI/CD pipelines',
        'terraform': 'Terraform infrastructure',
        
       
    'machine-learning': 'machine learning',
    'Machine Learning': 'machine learning',
    'ml': 'machine learning',
    'ai-ml': 'artificial intelligence and machine learning',
    'AI/ML': 'artificial intelligence and machine learning',
    'AIML': 'artificial intelligence and machine learning',
    'aiml': 'artificial intelligence and machine learning',
    'ai': 'artificial intelligence',
        'data-science': 'data science',
        'deep-learning': 'deep learning',
        'nlp': 'natural language processing',
        
        'mobile': 'mobile development',
        'react-native': 'React Native development',
        'flutter': 'Flutter development',
        'ios': 'iOS development',
        'android': 'Android development',
    }
    
   
    return subject_mappings.get(subject_id, subject_id)

def analyze_speech(transcript):
    if not transcript:
        return {
            'quality': 'red',
            'fillerWords': 0,
            'wordCount': 0,
            'warnings': ['Empty or very short response']
        }

    words = (transcript or '').lower().split()
    word_count = len(words)
    filler_words = ['uh', 'um', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'yeah', 'eeh', 'aah','the the','oh','ohh','hmm','om']
   
    token_filler_count = 0
    for f in filler_words:
        if ' ' not in f:
            token_filler_count += sum(1 for w in words if w == f)
    text = ' '.join(words)
    phrase_filler_count = 0
    for f in filler_words:
        if ' ' in f:
            phrase_filler_count += text.count(f)
    filler_count = token_filler_count + phrase_filler_count
    filler_ratio = filler_count / word_count if word_count > 0 else 0.0

    warnings = []
    if word_count < 10:
        quality = 'red'
        warnings.append('Response too short')
    elif filler_ratio > 0.15:
        quality = 'red'
        warnings.append('Too many filler words')
    elif filler_ratio > 0.08:
        quality = 'yellow'
        warnings.append('Some filler words detected')
    elif word_count > 20:
        quality = 'green'
    else:
        quality = 'yellow'

    return {
        'quality': quality,
        'fillerWords': filler_count,
        'wordCount': word_count,
        'fillerRatio': round(filler_ratio, 3),
        'warnings': warnings
    }

init_database()


@socketio.on('connect')
def handle_connect():
    
    client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
    logger.info(f"🔌 Client connected: {client_id}")
    emit('connected', {'clientId': client_id})

def _send_current_question(client_id: str, session_id: str):
    try:
        if client_id not in active_interviews:
            return
        sess = active_interviews[client_id]
        current_q = int(sess.get('current_question') or 1)
        total = int(sess.get('max_questions') or 10)
        question_text = None
        
        if isinstance(sess.get('questions'), dict) and current_q in sess['questions']:
            question_text = sess['questions'][current_q]
        else:
           
            try:
                conn = get_db_connection()
                try:
                    cursor = conn.cursor()
                    cursor.execute('''
                        SELECT question_text FROM interview_questions
                        WHERE session_id = ? AND question_number = ?
                    ''', (session_id, current_q))
                    row = cursor.fetchone()
                    if row:
                        question_text = row[0]
                finally:
                    conn.close()
            except Exception as db_err:
                logger.error(f"❌ Failed to fetch current question from DB: {db_err}")
        if question_text:
            emit('interview-question', {
                'questionText': question_text,
                'questionNumber': current_q,
                'totalQuestions': total,
                'category': sess.get('module_name') or sess.get('config', {}).get('subject') or 'General',
                'questionId': f"{session_id}_q{current_q}"
            })
    except Exception as e:
        logger.error(f"❌ _send_current_question failed: {e}")

@socketio.on('get-current-question')
def handle_get_current_question(data):
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        session_id = (data or {}).get('sessionId') or (data or {}).get('session_id')
        if not session_id:
          
            sess = active_interviews.get(client_id)
            session_id = sess.get('session_id') if sess else None
        if not session_id:
            emit('error', {'message': 'No session to fetch current question'})
            return
        _send_current_question(client_id, session_id)
    except Exception as e:
        logger.error(f"Error in get-current-question: {e}")
        emit('error', {'message': f'Failed to get current question: {str(e)}'})

@socketio.on('disconnect')
def handle_disconnect():
    
    client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
    logger.info(f"🔌 Client disconnected: {client_id}")
    
    
    if client_id in active_interviews:
        session_id = active_interviews[client_id].get('session_id')
        if session_id:
           
            sessions_by_id[session_id] = active_interviews[client_id]
            sessions_by_id[session_id]['last_client_id'] = client_id
            logger.info(f"🧹 Detached client {client_id} from session {session_id} (session preserved for resume)")
        del active_interviews[client_id]


@socketio.on('audio-chunk') 
def handle_audio_chunk(data):
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        audio_data = (data or {}).get('audioData')
        provided_session_id = (data or {}).get('sessionId')
        
        if not audio_data:
            return
        if client_id not in active_interviews:
            logger.warning(f"⚠️ Client {client_id} not in active_interviews, skipping chunk")
            return


        if 'chunk_buffer' not in active_interviews[client_id]:
            active_interviews[client_id]['chunk_buffer'] = []
            active_interviews[client_id]['buffer_start_time'] = time.time()
            active_interviews[client_id]['warning_tracker'] = {
                'last_filler_warning': 0,
                'last_pause_warning': 0,
                'last_speech_time': time.time(),
                'filler_count_session': 0
            }

        try:
            clean_audio_data = audio_data.strip()
            if clean_audio_data.startswith('data:'):
                clean_audio_data = clean_audio_data.split(',')[1]
            
            audio_bytes = base64.b64decode(clean_audio_data)
            active_interviews[client_id]['chunk_buffer'].append(audio_bytes)
            
            current_time = time.time()
            buffer_duration = current_time - active_interviews[client_id]['buffer_start_time']
            
            if buffer_duration >= 3.0:  
               
                combined_audio = b''.join(active_interviews[client_id]['chunk_buffer'])
                logger.info(f"🎤 Processed 3s buffer: {len(combined_audio)} bytes (no heuristic warnings)")
                active_interviews[client_id]['chunk_buffer'] = []
                active_interviews[client_id]['buffer_start_time'] = current_time
                
        except Exception as decode_error:
            logger.error(f"❌ Chunk decode failed: {decode_error}")
            
    except Exception as e:
        logger.error(f"❌ Chunk processing failed: {e}")

@socketio.on('process-interim-audio')
def handle_process_interim_audio(data):
  
    if not LIVE_COACHING:
        return
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        audio_data = (data or {}).get('audioData')
        if not audio_data:
            return

        clean_audio_data = audio_data.strip()
        if clean_audio_data.startswith('data:'):
            clean_audio_data = clean_audio_data.split(',')[1]

        audio_bytes = base64.b64decode(clean_audio_data)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name

        transcript = ""
        try:
            if whisper_model:
                with whisper_lock:
                    result = whisper_model.transcribe(
                        temp_file_path,
                        language='en',
                        fp16=False,
                        condition_on_previous_text=False
                    )
                raw_text = result.get('text', '')
                if isinstance(raw_text, list):
                    transcript = ' '.join(str(t) for t in raw_text).strip()
                else:
                    transcript = (raw_text or '').strip()
        except Exception as e:
            logger.error(f"❌ Interim transcription failed: {e}")
        finally:
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass

        sess = active_interviews.get(client_id, {})
        tracker = sess.get('warning_tracker', {
            'last_filler_warning': 0,
            'last_pause_warning': 0,
            'last_speech_time': time.time(),
            'last_length_warning': 0,
            'last_repeat_warning': 0,
            'filler_count_session': 0,
            'consecutive_empty': 0,
            'pause_events': 0
        })
        now = time.time()
        if not transcript:
            tracker['consecutive_empty'] = tracker.get('consecutive_empty', 0) + 1
            last_speech = tracker.get('last_speech_time') or now
           
            if (now - last_speech) >= 6 and (now - tracker.get('last_pause_warning', 0)) > 5:
                emit('live-warning', {'message': 'Long pause detected - keep speaking', 'type': 'long_pause'})
                tracker['last_pause_warning'] = now
                tracker['pause_events'] = tracker.get('pause_events', 0) + 1
            sess['warning_tracker'] = tracker
            active_interviews[client_id] = sess
            return
        else:
            tracker['consecutive_empty'] = 0

        lower = transcript.lower()
        words = lower.split()
        word_count = len(words)
        fillers = re.findall(r"\b(um+|uh+|uhm+|umm+|hmm+|er+|ah+|yeah|so|well|like|you know|i mean|actually|basically|literally|sort of|kind of)\b", lower)
        tracker['filler_count_session'] = tracker.get('filler_count_session', 0) + len(fillers)
        if word_count >= 1:
            tracker['last_speech_time'] = now
       
        bigrams = list(zip(words, words[1:]))
        from collections import Counter as _Ctr
        bc = _Ctr(bigrams)
        top_bg = max(bc.values()) if bc else 0
        consec = sum(1 for i in range(1, len(words)) if words[i] == words[i-1])
        repetition_hits = (sum(1 for c in bc.values() if c >= 2)) + consec
        tracker['repetition_count_session'] = tracker.get('repetition_count_session', 0) + repetition_hits
        
        token_runs = 0
        run_len = 1
        for i in range(1, len(words)):
            if words[i] == words[i-1]:
                run_len += 1
            else:
                if run_len >= 3:
                    token_runs += (run_len - 2)
                run_len = 1
        if run_len >= 3:
            token_runs += (run_len - 2)
        if token_runs:
            tracker['filler_count_session'] = tracker.get('filler_count_session', 0) + token_runs

        
        filler_density = (len(fillers) / max(word_count, 1)) if word_count else 0
        if (now - tracker.get('last_filler_warning', 0)) > 3:
            if (len(fillers) >= 1) or (filler_density >= 0.12) or (consec >= 2):
                emit('live-warning', {'message': 'Too many filler words detected', 'type': 'filler_words'})
                tracker['last_filler_warning'] = now

        
        if word_count <= 2:
            
            last_speech = tracker.get('last_speech_time') or now
            if (now - tracker.get('last_pause_warning', 0)) > 5 and (now - last_speech) >= 6:
                emit('live-warning', {'message': 'Long pause detected - keep speaking', 'type': 'long_pause'})
                tracker['last_pause_warning'] = now
                tracker['pause_events'] = tracker.get('pause_events', 0) + 1

       
        if (top_bg >= 3 or consec >= 2) and (now - tracker.get('last_repeat_warning', 0)) > 8:
            emit('live-warning', {'message': 'You seem to be repeating—try rephrasing', 'type': 'repetition'})
            tracker['last_repeat_warning'] = now

        start_ts = sess.get('recording_start_time')
        if start_ts and (now - start_ts) > 40 and (now - tracker.get('last_length_warning', 0)) > 20:
            emit('live-warning', {'message': 'Answer is getting long, start wrapping up', 'type': 'length'})
            tracker['last_length_warning'] = now

        # Repetition heuristic: many repeated tokens (cooldown 10s)
        unique_ratio = len(set(words)) / max(word_count, 1)
        if word_count >= 10 and unique_ratio < 0.5 and (now - tracker.get('last_repeat_warning', 0)) > 10:
            emit('live-warning', {'message': 'You seem to be repeating words—try rephrasing', 'type': 'repetition'})
            tracker['last_repeat_warning'] = now

        sess['warning_tracker'] = tracker
        active_interviews[client_id] = sess
    except Exception as e:
        logger.error(f"❌ Process interim audio failed: {e}")

@socketio.on('process-complete-audio')
def handle_complete_audio(data):
    """Process a single complete audio blob sent by the client for the latest answer."""
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        audio_data = (data or {}).get('audioData')
        provided_session_id = (data or {}).get('sessionId') or (data or {}).get('session_id')

        
        try:
            session_id_check = provided_session_id
            if not session_id_check and client_id in active_interviews:
                session_id_check = active_interviews[client_id].get('session_id')
            if session_id_check:
                conn = get_db_connection()
                try:
                    cur = conn.cursor()
                    cur.execute("SELECT status FROM interview_sessions WHERE id = ?", (session_id_check,))
                    row = cur.fetchone()
                    if row and str(row[0]).lower() == 'completed':
                        logger.info(f"🛑 Ignoring complete-audio: session {session_id_check} already completed")
                        return
                finally:
                    conn.close()
        except Exception as _guard_err:
            logger.warning(f"Guard check failed: {_guard_err}")

        if not audio_data:
            emit('audio-error', {'message': 'No audio data received'})
            return

        logger.info(f"🎤 Processing complete audio from {client_id}: {len(audio_data)} chars")

        # Clean base64 payload
        clean_audio_data = audio_data.strip()
        if clean_audio_data.startswith('data:'):
            clean_audio_data = clean_audio_data.split(',')[1]

       
        audio_bytes = base64.b64decode(clean_audio_data)
        logger.info(f"🎤 Decoded audio: {len(audio_bytes)} bytes")

        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name

        transcript = ""
        try:
            if whisper_model:
                audio_size = os.path.getsize(temp_file_path)
                logger.info(f"🎤 Audio file size: {audio_size} bytes")

                if audio_size < 5000:
                    logger.warning(f"⚠️ Audio file too small ({audio_size} bytes), skipping transcription")
                else:
                    logger.info(f"🎤 Starting Whisper transcription...")
                    
                    with whisper_lock:
                        result = whisper_model.transcribe(
                            temp_file_path,
                            language='en',
                            fp16=False,
                            condition_on_previous_text=False
                        )
                    logger.info(f"🎤 Whisper result type: {type(result)}")
                    logger.info(f"🎤 Whisper result keys: {result.keys() if isinstance(result, dict) else 'N/A'}")
                    logger.info(f"🎤 Raw text from Whisper: '{result.get('text', 'NO TEXT KEY')}' (type: {type(result.get('text'))})")
                    raw_text = result.get('text', '')
                    if isinstance(raw_text, list):
                        transcript = ' '.join(str(t) for t in raw_text).strip()
                    else:
                        transcript = (raw_text or '').strip()
                    
                    logger.info(f"🎤 Transcript length: {len(transcript)} chars")
                    print(f"🗣️ TRANSCRIBED TEXT: '{transcript}'")
                    logger.info(f"🗣️ Complete transcript: '{transcript}'")
                    
                    # Check if audio has speech
                    if not transcript:
                        logger.warning(f"⚠️ Empty transcript! Audio might be silent or corrupted")
                        logger.warning(f"⚠️ Try speaking louder or check microphone")
        except Exception as whisper_error:
            logger.error(f"❌ Whisper transcription failed: {whisper_error}")
            import traceback
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")

       
        insights = []
        analysis = {}
        try:
            if transcript and AI_AVAILABLE and interview_ai:
                analysis_result = interview_ai.analyze_response(str(transcript), 30.0, {})
                analysis = analysis_result if analysis_result else {}
                if analysis.get('filler_words_count', 0) > 3:
                    insights.append("Try to reduce filler words like 'um', 'ah' for clearer communication")
                if analysis.get('confidence_score', 70) < 60:
                    insights.append("Speak with more confidence and conviction")
                if analysis.get('clarity_score', 70) < 60:
                    insights.append("Try to speak more clearly and structure your thoughts")
                logger.info(f"🤖 AI Analysis: {analysis}")
                logger.info(f"💡 Insights: {insights}")
        except Exception as ai_error:
            logger.error(f"❌ AI analysis failed: {ai_error}")

        
        try:
            if client_id in active_interviews:
                active_interviews[client_id].setdefault('transcripts', []).append(transcript)
                if insights or analysis:
                    active_interviews[client_id].setdefault('analyses', []).append({
                        'transcript': transcript,
                        'analysis': analysis,
                        'insights': insights
                    })
                logger.info("📝 Stored transcript for active session")
            elif provided_session_id and provided_session_id in sessions_by_id:
                sess = sessions_by_id[provided_session_id]
                sess.setdefault('transcripts', []).append(transcript)
                if insights or analysis:
                    sess.setdefault('analyses', []).append({
                        'transcript': transcript,
                        'analysis': analysis,
                        'insights': insights
                    })
                logger.info(f"📝 Stored transcript for resumed session {provided_session_id}")
            else:
                logger.warning(f"⚠️ No session found for client {client_id} during transcript storage (sessionId={provided_session_id})")
        except Exception as store_err:
            logger.error(f"❌ Failed to store transcript: {store_err}")

       
        simple_analysis = analyze_speech(transcript)
        emit('audio-transcription', {
            'transcript': transcript,
            'analysis': simple_analysis,
            'success': True
        })

       
        try:
            sess = active_interviews.get(client_id) or (sessions_by_id.get(provided_session_id) if provided_session_id else None)
            if sess:
                qid = sess.get('last_saved_question_id')
                if not qid:
                 
                    try:
                        cq = int(sess.get('current_question') or 1)
                        qid = f"q{max(1, cq-1)}_{sess.get('session_id')}"
                    except Exception:
                        qid = None
                if qid:
                    fillers = int(simple_analysis.get('fillerWords', 0) or 0)
                    
                    qnum = None
                    try:
                        import re as _re
                        m = _re.match(r"q(\d+)_", qid)
                        if m:
                            qnum = int(m.group(1))
                    except Exception:
                        qnum = None
                    with get_db_connection() as conn:
                        cur = conn.cursor()
                        cur.execute(
                            """
                            UPDATE interview_answers
                            SET audio_transcript = ?, filler_words_count = COALESCE(?, filler_words_count)
                            WHERE session_id = ? AND question_id = ?
                            """,
                            (transcript, fillers, sess.get('session_id'), qid)
                        )
                        conn.commit()
                        logger.info(f"📝 Updated answer row with final transcript (qid={qid}, fillers={fillers})")
                   
                    try:
                        
                        insights_list = []
                        try:
                            if qnum is not None:
                                if fillers is not None:
                                    insights_list.append(f"Q{qnum}: {fillers} filler word(s) detected")
                        except Exception:
                            pass
                        
                        repetition = int(simple_analysis.get('repetitionCount', 0) or 0)
                        if qnum is not None and repetition >= 2:
                            insights_list.append(f"Q{qnum}: repetition detected ({repetition})")
                        payload = {
                            'isUpdate': True,
                            'questionNumber': qnum or max(1, int(sess.get('current_question') or 1) - 1),
                            'scores': {
                                'filler_words_count': fillers,
                                'repetition_count': repetition,
                            }
                        }
                        if insights_list:
                            payload['insights'] = insights_list
                        socketio.emit('interview-feedback', payload, to=client_id)
                    except Exception as emit_err:
                        logger.warning(f"Could not emit feedback update: {emit_err}")
        except Exception as upd_err:
            logger.warning(f"Could not update answer with transcript: {upd_err}")

        try:
            os.unlink(temp_file_path)
        except Exception:
            pass

    except Exception as e:
        logger.error(f"Error in complete audio processing: {str(e)}")
        emit('audio-error', {'message': f'Server error: {str(e)}'})

@socketio.on('start-interview')
def handle_start_interview(data):
    try:
        client_id = request.sid # pyright: ignore[reportAttributeAccessIssue]
        module_name = data.get('moduleName', 'General Interview')
        difficulty = data.get('difficulty', 'Medium')
        
        logger.info(f"🎯 Starting interview for {client_id}: {module_name} ({difficulty})")
        
        
        session_id = str(uuid.uuid4())
        
        active_interviews[client_id] = {
            'session_id': session_id,
            'module_name': module_name,
            'difficulty': difficulty,
            'start_time': datetime.utcnow(),
            'current_question': 0,
            'questions': [],
            'answers': [],
            'is_recording': False
        }
        
        emit('interview-started', {
            'sessionId': session_id,
            'firstQuestion': f'Tell me about your experience with {module_name}.',
            'totalQuestions': 10
        })
        
        logger.info(f"⚠️ Warning: Using legacy start-interview handler")
            
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        emit('error', {'message': f'Failed to start interview: {str(e)}'})

@socketio.on('next-question')
def handle_next_question(data):
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        
        if client_id not in active_interviews:
            emit('error', {'message': 'No active interview session'})
            return
        
        interview_data = active_interviews[client_id]
        current_q = interview_data['current_question']
        questions = interview_data['questions']
        next_q = current_q + 1
        
        if next_q < len(questions):
            interview_data['current_question'] = next_q
            emit('next-question', {
                'questionText': questions[next_q],
                'questionNumber': next_q + 1,
                'totalQuestions': len(questions)
            })
        else:
            emit('interview-complete', {
                'message': 'Interview completed successfully!',
                'sessionId': interview_data['session_id']
            })
            
    except Exception as e:
        logger.error(f"Error getting next question: {str(e)}")
        emit('error', {'message': f'Failed to get next question: {str(e)}'})

@socketio.on('recording-start')
def handle_recording_start(data):
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        session_id = (data or {}).get('sessionId') or (data or {}).get('session_id')
        sess = None
        if client_id in active_interviews:
            sess = active_interviews[client_id]
        elif session_id and session_id in sessions_by_id:
            sess = sessions_by_id[session_id]
            active_interviews[client_id] = sess
        if sess is not None:
            sess['is_recording'] = True
            sess['recording_start_time'] = time.time()
           
            sess['warning_tracker'] = {
                'last_filler_warning': 0,
                'last_pause_warning': 0,
                'last_speech_time': time.time(),
                'last_length_warning': 0,
                'last_repeat_warning': 0,
                'filler_count_session': 0,
                'consecutive_empty': 0,
                'pause_events': 0
            }
            logger.info(f"🎤 Recording started for client {client_id} (session {sess.get('session_id')})")
            emit('recording-started', {'status': 'Recording started'})
            # start pause monitor thread
            if LIVE_COACHING:
                try:
                    if client_id not in pause_monitors or not pause_monitors[client_id].is_alive():
                        t = threading.Thread(target=_pause_monitor, args=(client_id,), daemon=True)
                        pause_monitors[client_id] = t
                        t.start()
                except Exception as mon_err:
                    logger.warning(f"Could not start pause monitor: {mon_err}")
    except Exception as e:
        logger.error(f"Error starting recording: {str(e)}")

@socketio.on('recording-stop')
def handle_recording_stop(data):
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        session_id = (data or {}).get('sessionId') or (data or {}).get('session_id')
        sess = None
        if client_id in active_interviews:
            sess = active_interviews[client_id]
        elif session_id and session_id in sessions_by_id:
            sess = sessions_by_id[session_id]
            active_interviews[client_id] = sess
        if sess is not None:
            sess['is_recording'] = False
            try:
                sess['last_recording_stop_time'] = time.time()
            except Exception:
                pass
            logger.info(f"🎤 Recording stopped for client {client_id} (session {sess.get('session_id')})")
            emit('recording-stopped', {'status': 'Recording stopped'})
           
    except Exception as e:
        logger.error(f"Error stopping recording: {str(e)}")

@socketio.on('resume-interview-session')
def handle_resume_interview_session(data):
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        session_id = (data or {}).get('sessionId') or (data or {}).get('session_id')
        if not session_id:
            emit('error', {'message': 'Missing sessionId for resume'})
            return
       
        if session_id not in sessions_by_id:
            try:
                conn = get_db_connection()
                try:
                    cursor = conn.cursor()
                    cursor.execute('SELECT id, difficulty, subject FROM interview_sessions WHERE id = ?', (session_id,))
                    row = cursor.fetchone()
                    if row:
                       
                        cursor.execute('SELECT COUNT(1) FROM interview_answers WHERE session_id = ?', (session_id,))
                        count_row = cursor.fetchone()
                        answered = count_row[0] if count_row else 0
                        reconstructed = {
                            'session_id': session_id,
                            'difficulty': row[1] or 'Medium',
                            'module_name': row[2] or 'General',
                            'current_question': max(1, answered + 1),
                            'max_questions': 10,
                            'answers': [],
                            'transcripts': [],
                            'is_recording': False
                        }
                        sessions_by_id[session_id] = reconstructed
                        logger.info(f"🧩 Reconstructed session {session_id} from DB for resume (answered={answered})")
                finally:
                    conn.close()
            except Exception as recon_err:
                logger.error(f"❌ Resume reconstruction failed for {session_id}: {recon_err}")
        if session_id not in sessions_by_id:
            emit('error', {'message': 'Session not found for resume'})
            return
        # Block resuming completed sessions
        try:
            meta = sessions_by_id.get(session_id) or {}
            if (meta.get('status') or '').lower() == 'completed':
                emit('error', {'message': 'Cannot resume a completed session'})
                return
        except Exception:
            pass
        active_interviews[client_id] = sessions_by_id[session_id]
        active_interviews[client_id]['client_id'] = client_id
        logger.info(f"🔗 Session {session_id} resumed for client {client_id}")
        emit('interview-session-started', {'sessionId': session_id, 'status': 'Session resumed successfully'})
       
        try:
            _send_current_question(client_id, session_id)
        except Exception as qerr:
            logger.error(f"❌ Failed to send current question on resume: {qerr}")
    except Exception as e:
        logger.error(f"Error resuming interview session: {str(e)}")
        emit('error', {'message': f'Failed to resume interview session: {str(e)}'})

@socketio.on('start-interview-session')
def handle_start_interview_session(data):
   
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        logger.info(f"🚀 Start interview session called by {client_id} with data: {data}")
        
        config = data.get('config', {})
        metadata = data.get('metadata', {})

        
        # If there's an existing active session, mark it complete & detach so new session starts clean
        if client_id in active_interviews and active_interviews[client_id].get('session_id'):
            prev_sid = active_interviews[client_id].get('session_id')
            logger.info(f"♻️ Completing previous session {prev_sid} for client {client_id} before new start")
            try:
                conn_prev = get_db_connection()
                try:
                    cur_prev = conn_prev.cursor()
                    cur_prev.execute('''UPDATE interview_sessions SET end_time = CURRENT_TIMESTAMP, status = 'completed' WHERE id = ?''', (prev_sid,))
                    conn_prev.commit()
                finally:
                    conn_prev.close()
            except Exception as end_prev_err:
                logger.warning(f"Could not finalize previous session {prev_sid}: {end_prev_err}")
            try:
                del active_interviews[client_id]
            except Exception:
                pass
        
        
        session_id = str(uuid.uuid4())
        
        
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO interview_sessions 
                (id, difficulty, llm, interview_type, persona, subject, module_id, path_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                session_id,
                config.get('difficulty', 'Medium'),
                config.get('llm', 'ChatGPT'),
                config.get('interviewType', 'general'),
                config.get('persona', 'professional_man'),
                config.get('subject', 'general'),
                config.get('moduleId', 'default'),
                config.get('pathId', 'default')
            ))
            conn.commit()
        finally:
            conn.close()
        
      
        module_name = config.get('subject', 'General Interview')
        difficulty = config.get('difficulty', 'Medium')
        
        
        first_question = None
        if AI_AVAILABLE and interview_ai:
            try:
                subject_name = map_subject_id_to_name(module_name)
                question_result = interview_ai.generate_question(
                    difficulty=difficulty,
                    subject=subject_name,
                    persona='professional_man',
                    question_number=1,
                    previous_answers=[]
                )
                if question_result and (question_result.get('question') or question_result.get('question_text')):
                    first_question = question_result.get('question') or question_result.get('question_text')
                
                logger.info(f"✅ Generated first question for {subject_name}")
            except Exception as ai_error:
                logger.error(f"AI question generation failed: {ai_error}")
                first_question = None
        
        
        if not first_question:
            first_question = f"Tell me about your experience with {module_name}."
            logger.info(f"✅ Using fallback first question for {module_name}")
        
       
        active_interviews[client_id] = {
            'session_id': session_id,
            'config': config,
            'metadata': metadata,
            'start_time': datetime.utcnow(),
            'current_question': 1,
            'max_questions': 10,
            'answers': [],
            'transcripts': [],
            'is_recording': False,
            'module_name': module_name,
            'difficulty': difficulty,
            'client_id': client_id
        }
        sessions_by_id[session_id] = active_interviews[client_id]
        
      
        logger.info(f"🔍 DEBUG: Created session for client_id: {client_id}")
        logger.info(f"🔍 DEBUG: active_interviews now has keys: {list(active_interviews.keys())}")
        
       
        emit('interview-session-started', {
            'sessionId': session_id,
            'status': 'Session created successfully'
        })
        
        
        if first_question:
            
            try:
                qid = str(uuid.uuid4())
                conn = get_db_connection()
                try:
                    cursor = conn.cursor()
                 
                    cursor.execute("PRAGMA table_info('interview_questions')")
                    cols = {row[1] for row in cursor.fetchall()}
                    base_values = [
                        ('id', qid),
                        ('session_id', session_id),
                        ('question_number', 1),
                        ('question_text', first_question)
                    ]
                    if 'question_category' in cols:
                        base_values.append(('question_category', module_name or config.get('subject', 'general')))
                    if 'difficulty_level' in cols:
                        base_values.append(('difficulty_level', difficulty or config.get('difficulty', 'Medium')))
                    if 'expected_duration' in cols:
                      
                        exp = (data.get('config', {}).get('expectedDuration') if isinstance(data, dict) else None)
                        if not isinstance(exp, (int, float)):
                            exp = 90 if (difficulty or '').lower() == 'easy' else 120 if (difficulty or '').lower() == 'medium' else 150
                        base_values.append(('expected_duration', int(exp)))
                    col_names = ", ".join(name for name, _ in base_values)
                    placeholders = ", ".join(['?'] * len(base_values))
                    values = [val for _, val in base_values]
                    cursor.execute(f"INSERT INTO interview_questions ({col_names}) VALUES ({placeholders})", values)
                    conn.commit()
                finally:
                    conn.close()
            except Exception as dbq_err:
                logger.error(f"❌ Failed to persist first question: {dbq_err}")

           
            active_interviews[client_id]['questions'] = {1: first_question}

            emit('interview-question', {
                'questionText': first_question,
                'questionNumber': 1,
                'totalQuestions': 10,
                'category': module_name,
                'questionId': f"{session_id}_q1"
            })
            logger.info(f"🎯 Sent first question: {first_question[:50]}...")

           
            try:
                if AI_AVAILABLE and interview_ai:
                    subject_name = map_subject_id_to_name(module_name)
                    def _prefetch_first(sess_key: str, subject: str, diff: str):
                        try:
                            prefetch = interview_ai.generate_question(  # pyright: ignore[reportOptionalMemberAccess]
                                difficulty=diff,
                                subject=subject,
                                persona='professional_man',
                                question_number=2,
                                previous_answers=[]
                            )
                            if prefetch and (prefetch.get('question') or prefetch.get('question_text')):
                                ai = active_interviews.get(sess_key)
                                if ai:
                                    ai.setdefault('prefetch', {})[2] = prefetch.get('question') or prefetch.get('question_text')
                                    logger.info("⚡ Prefetched question 2")
                        except Exception as e:
                            logger.warning(f"Prefetch failed: {e}")
                    threading.Thread(target=_prefetch_first, args=(client_id, subject_name, difficulty), daemon=True).start()
            except Exception as pre_err:
                logger.warning(f"Prefetch setup failed: {pre_err}")
        
        logger.info(f"✅ Interview session {session_id} created and first question sent to client {client_id}")
        
    except Exception as e:
        logger.error(f"Error starting interview session: {str(e)}")
        emit('error', {'message': f'Failed to start interview session: {str(e)}'})

@socketio.on('initialize-interview')
def handle_initialize_interview(data):
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        module_name = data.get('moduleName', 'General Interview')
        difficulty = data.get('difficulty', 'Medium')
        
        logger.info(f"🎯 Initialize interview for {client_id}: {module_name} ({difficulty})")
        
        if client_id not in active_interviews:
            emit('error', {'message': 'No active interview session'})
            return
        
        questions = []
        if AI_AVAILABLE and interview_ai:
            try:
              
                subject_name = map_subject_id_to_name(module_name)
                for i in range(5):
                    question_result = interview_ai.generate_question(
                        difficulty=difficulty,
                        subject=subject_name,
                        persona='professional_man',
                        question_number=i + 1,
                        previous_answers=[]
                    )
                    if question_result and (question_result.get('question') or question_result.get('question_text')):
                        questions.append(question_result.get('question') or question_result.get('question_text'))
                
                logger.info(f"✅ Generated {len(questions)} questions for {subject_name}")
            except Exception as ai_error:
                logger.error(f"AI question generation failed: {ai_error}")
                questions = []
        
     
        if not questions:
            questions = [
                f"Tell me about your experience with {module_name}.",
                f"What are the key concepts in {module_name} that you're familiar with?",
                f"Describe a challenging project you worked on involving {module_name}.",
                f"What are some best practices you follow when working with {module_name}?",
                f"How would you explain {module_name} to someone who's new to it?"
            ]
        
      
        active_interviews[client_id]['questions'] = questions
        active_interviews[client_id]['module_name'] = module_name
        active_interviews[client_id]['difficulty'] = difficulty
        
        emit('interview-question', {
            'questionText': questions[0],
            'questionNumber': 1,
            'totalQuestions': len(questions),
            'category': module_name,
            'questionId': f"{active_interviews[client_id]['session_id']}_q1"
        })
        
        logger.info(f"✅ Interview initialized with {len(questions)} questions")
        
    except Exception as e:
        logger.error(f"Error initializing interview: {str(e)}")
        emit('error', {'message': f'Failed to initialize interview: {str(e)}'})

@socketio.on('answer-complete')
def handle_answer_complete(data):
   
    try:
        client_id = request.sid  # pyright: ignore[reportAttributeAccessIssue]
        provided_session_id = (data or {}).get('sessionId') or (data or {}).get('session_id')

        logger.info(f"🔍 DEBUG: answer-complete called by client_id: {client_id}, sessionId={provided_session_id}")
        logger.info(f"🔍 DEBUG: active_interviews keys: {list(active_interviews.keys())}")

        interview_data = None
        if client_id in active_interviews:
            interview_data = active_interviews[client_id]
        elif provided_session_id and provided_session_id in sessions_by_id:
            interview_data = sessions_by_id[provided_session_id]
            active_interviews[client_id] = interview_data
            logger.info(f"🔗 Bound existing session {provided_session_id} to client {client_id}")
        elif provided_session_id:
           
            try:
                conn = get_db_connection()
                try:
                    cursor = conn.cursor()
                    cursor.execute('SELECT id, difficulty, subject FROM interview_sessions WHERE id = ?', (provided_session_id,))
                    row = cursor.fetchone()
                    if row:
                       
                        cursor.execute('SELECT COUNT(1) FROM interview_answers WHERE session_id = ?', (provided_session_id,))
                        count_row = cursor.fetchone()
                        answered = count_row[0] if count_row else 0
                        interview_data = {
                            'session_id': provided_session_id,
                            'difficulty': row[1] or 'Medium',
                            'module_name': row[2] or 'General',
                            'current_question': max(1, answered + 1),
                            'max_questions': 10,
                            'answers': [],
                            'transcripts': [],
                            'is_recording': False
                        }
                        sessions_by_id[provided_session_id] = interview_data
                        active_interviews[client_id] = interview_data
                        logger.info(f"🧩 Reconstructed minimal session state for {provided_session_id} (answered={answered})")
                finally:
                    conn.close()
            except Exception as recon_err:
                logger.error(f"❌ Failed to reconstruct session {provided_session_id}: {recon_err}")

        if interview_data is None:
            logger.error(f"❌ Session not found for client {client_id} (sessionId={provided_session_id})")
            emit('error', {'message': 'No active interview session'})
            return
        current_q = interview_data['current_question']
        max_questions = interview_data['max_questions']
        
        logger.info(f"📝 Answer completed for question {current_q}")

        try:
            pre_len = len(interview_data.get('transcripts', []))
            deadline = time.time() + 2.0
            while time.time() < deadline:
                now_len = len(interview_data.get('transcripts', []))
                if now_len > pre_len:
                    break
                time.sleep(0.05)
        except Exception:
            pass
        
      
        transcripts = interview_data.get('transcripts', [])
        analyses = interview_data.get('analyses', [])
        
        latest_transcript = transcripts[-1] if transcripts else ""
        latest_analysis = analyses[-1] if analyses else None
        
        
        if latest_analysis and latest_analysis.get('analysis'):
            analysis_data = latest_analysis['analysis']
            confidence_score = analysis_data.get('confidence_score', 60)
            clarity_score = analysis_data.get('clarity_score', 60)
            technical_accuracy = analysis_data.get('technical_accuracy', 70)
            filler_words_count = analysis_data.get('filler_words_count', 0)
        else:
           
            confidence_score = 40 if not latest_transcript else 70
            clarity_score = 40 if not latest_transcript else 70
            technical_accuracy = 40 if not latest_transcript else 70
            filler_words_count = 0

        
        tracker = interview_data.get('warning_tracker', {}) if isinstance(interview_data, dict) else {}
        interim_fillers = int(tracker.get('filler_count_session', 0) or 0)
        interim_pauses = int(tracker.get('pause_events', 0) or 0)
        interim_repetition = int(tracker.get('repetition_count_session', 0) or 0)
        filler_words_count = max(int(filler_words_count or 0), interim_fillers)
        start_ts = interview_data.get('recording_start_time') if isinstance(interview_data, dict) else None
        stop_ts = interview_data.get('last_recording_stop_time') if isinstance(interview_data, dict) else None
        if not stop_ts:
            try:
                stop_ts = time.time()
            except Exception:
                stop_ts = None
        answer_duration = round(max(0.0, (stop_ts - start_ts)), 1) if start_ts else 30.0
        
        try:
            clarity_penalty = min(10, filler_words_count * 1) + min(12, interim_pauses * 3) + min(10, interim_repetition * 1)
            clarity_score = max(0, min(100, clarity_score - clarity_penalty))
        except Exception:
            pass
        empty_answer = False
        try:
            empty_answer = not (latest_transcript or '').strip()
            if empty_answer:
                try:
                    emit('live-warning', {
                        'message': 'No answer detected for this question. Try to speak at least a full sentence next time.',
                        'type': 'no_answer'
                    })
                except Exception:
                    pass
        except Exception:
            empty_answer = False
        
        try:
            answer_id = str(uuid.uuid4())
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                
               
                question_id = f"q{current_q}_{interview_data['session_id']}"
                
                cursor.execute('''
                    INSERT INTO interview_answers 
                    (id, session_id, question_id, audio_transcript, answer_duration, 
                     filler_words_count, confidence_score, clarity_score, technical_accuracy)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    answer_id,
                    interview_data['session_id'],
                    question_id,
                    latest_transcript,
                    float(answer_duration),
                    filler_words_count,
                    confidence_score,
                    clarity_score,
                    technical_accuracy
                ))
                conn.commit()
                
                logger.info(f"💾 Stored answer in database with scores: confidence={confidence_score}, clarity={clarity_score}")
                try:
                    
                    interview_data['last_saved_question_id'] = question_id
                except Exception:
                    pass
            finally:
                conn.close()
            
        except Exception as db_error:
            logger.error(f"❌ Database storage failed: {db_error}")
        
     
        answer_data = {
            'questionNumber': current_q,
            'transcript': latest_transcript,
            'timestamp': datetime.utcnow().isoformat(),
            'analysis': {
                'confidence_score': confidence_score,
                'clarity_score': clarity_score,
                'technical_accuracy': technical_accuracy,
                'filler_words_count': filler_words_count
            },
            'duration': answer_duration,
            'processed': True
        }
        
        if 'answers' not in interview_data:
            interview_data['answers'] = []
        interview_data['answers'].append(answer_data)
        
        
        feedback = {
            'insights': [],
            'scores': {
                'overall_communication_score': confidence_score,
                'filler_words_count': filler_words_count,
                'confidence_score': confidence_score,
                'clarity_score': clarity_score,
                'technical_accuracy': technical_accuracy,
               
                'pause_events': interim_pauses,
                'repetition_count': interim_repetition,
                'answer_duration': answer_duration,
                'empty_answer': empty_answer
            },
            'suggestions': [
                'Great job providing specific examples' if confidence_score >= 80 else 'Try to speak with more confidence',
                'Clear communication' if clarity_score >= 80 else 'Try to structure your thoughts more clearly'
            ],
            'pause_events': interim_pauses,
            'answer_duration': answer_duration,
            'repetition_count': interim_repetition,
            'emptyAnswer': empty_answer
        }
        emit('interview-feedback', feedback)
        
        try:
            wt = interview_data.get('warning_tracker') or {}
            wt['filler_count_session'] = 0
            wt['pause_events'] = 0
            wt['consecutive_empty'] = 0
            wt['repetition_count_session'] = 0
            interview_data['warning_tracker'] = wt
        except Exception:
            pass
        logger.info(f"📊 Sent feedback with scores: overall={confidence_score}, filler={filler_words_count}")
        
        
        time.sleep(0.3)

        
        if current_q < max_questions:
           
            next_question = None
            next_q_number = current_q + 1
            
            if interview_data.get('prefetch') and interview_data['prefetch'].get(next_q_number):
                next_question = interview_data['prefetch'][next_q_number]
                logger.info(f"⚡ Using prefetched question {next_q_number}")
            elif AI_AVAILABLE and interview_ai:
                try:
                    subject_name = map_subject_id_to_name(interview_data.get('module_name') or interview_data.get('config', {}).get('subject', 'general'))
                    previous_transcripts = interview_data.get('transcripts', [])
                    question_result = interview_ai.generate_question(
                        difficulty=interview_data.get('difficulty', 'Medium'),
                        subject=subject_name,
                        persona='professional_man',
                        question_number=next_q_number,
                        previous_answers=previous_transcripts
                    )
                    logger.info(f"🎯 AI Result: {question_result}")
                    if question_result and (question_result.get('question') or question_result.get('question_text')):
                        next_question = question_result.get('question') or question_result.get('question_text')
                        logger.info(f"✅ Generated AI question {next_q_number}: {(next_question or '')[:100]}...")
                    else:
                        logger.warning(f"⚠️ AI returned invalid result: {question_result}")
                        next_question = None
                except Exception as ai_error:
                    logger.error(f"❌ AI question generation failed: {ai_error}")
                    import traceback
                    logger.error(f"❌ Full traceback: {traceback.format_exc()}")
                    next_question = None
            else:
                logger.warning(f"⚠️ AI not available - AI_AVAILABLE: {AI_AVAILABLE}, interview_ai: {interview_ai}")
                next_question = None
            
          
            if not next_question:
                fallbacks = [
                    f"Can you elaborate more on your experience with {interview_data['module_name']}?",
                    f"What challenges have you faced when working with {interview_data['module_name']}?",
                    f"How would you approach a complex problem in {interview_data['module_name']}?",
                    f"What are some advanced concepts in {interview_data['module_name']} you're familiar with?",
                    f"Describe a project where you successfully implemented {interview_data['module_name']} solutions."
                ]
                next_question = fallbacks[(next_q_number - 2) % len(fallbacks)]
                logger.info(f"✅ Using fallback question {next_q_number}")
            
            
            interview_data['current_question'] = next_q_number

            
            try:
                qid = str(uuid.uuid4())
                conn = get_db_connection()
                try:
                    cursor = conn.cursor()
                   
                    cursor.execute("PRAGMA table_info('interview_questions')")
                    cols = {row[1] for row in cursor.fetchall()}
                    base_values = [
                        ('id', qid),
                        ('session_id', interview_data['session_id']),
                        ('question_number', next_q_number),
                        ('question_text', next_question)
                    ]
                    if 'question_category' in cols:
                        base_values.append(('question_category', interview_data.get('module_name') or interview_data.get('config', {}).get('subject', 'general')))
                    if 'difficulty_level' in cols:
                        base_values.append(('difficulty_level', interview_data.get('difficulty', 'Medium')))
                    if 'expected_duration' in cols:
                       
                        diff = (interview_data.get('difficulty') or '').lower()
                        exp = 90 if diff == 'easy' else 120 if diff == 'medium' else 150
                        base_values.append(('expected_duration', exp))
                    col_names = ", ".join(name for name, _ in base_values)
                    placeholders = ", ".join(['?'] * len(base_values))
                    values = [val for _, val in base_values]
                    cursor.execute(f"INSERT INTO interview_questions ({col_names}) VALUES ({placeholders})", values)
                    conn.commit()
                finally:
                    conn.close()
            except Exception as dbq_err:
                logger.error(f"❌ Failed to persist question {next_q_number}: {dbq_err}")

            try:
                if 'questions' not in interview_data or not isinstance(interview_data['questions'], dict):
                    interview_data['questions'] = {}
                interview_data['questions'][next_q_number] = next_question
            except Exception:
                pass

            emit('interview-question', {
                'questionText': next_question,
                'questionNumber': next_q_number,
                'totalQuestions': max_questions,
                'category': interview_data['module_name'],
                'questionId': f"{interview_data['session_id']}_q{next_q_number}"
            })
            logger.info(f"➡️ Sent question {next_q_number}: {next_question[:50]}...")

           
            try:
                following_q = next_q_number + 1
                if following_q <= max_questions and AI_AVAILABLE and interview_ai:
                    subject_name = map_subject_id_to_name(interview_data['module_name'])
                    def _prefetch_following(sess_id: str, subject: str, diff: str, qn: int, prev_answers: list):
                        try:
                            prefetch = interview_ai.generate_question(  # pyright: ignore[reportOptionalMemberAccess]
                                difficulty=diff,
                                subject=subject,
                                persona='professional_man',
                                question_number=qn,
                                previous_answers=prev_answers
                            )
                            if prefetch and (prefetch.get('question') or prefetch.get('question_text')):
                                sess = sessions_by_id.get(sess_id)
                                if sess:
                                    sess.setdefault('prefetch', {})[qn] = prefetch.get('question') or prefetch.get('question_text')
                                    logger.info(f"⚡ Prefetched question {qn}")
                        except Exception as e:
                            logger.warning(f"Prefetch failed: {e}")
                    threading.Thread(
                        target=_prefetch_following,
                        args=(
                            interview_data['session_id'],
                            subject_name,
                            interview_data['difficulty'],
                            following_q,
                            interview_data.get('transcripts', [])
                        ),
                        daemon=True
                    ).start()
            except Exception as pre_err:
                logger.warning(f"Prefetch setup failed: {pre_err}")
        else:
           
            completion_data = {
                'message': 'Interview completed successfully!',
                'sessionId': interview_data['session_id'],
                'session_id': interview_data['session_id'],  
                'totalQuestions': max_questions,
                'answeredQuestions': len(interview_data['answers']),
                'completedQuestions': len(interview_data['answers'])
            }
            emit('interview-complete', completion_data)
            logger.info(f"🎉 Interview completed for session {interview_data['session_id']} - {max_questions} questions asked")
        
        try:
            if 'completion_data' in locals():
                logger.info(f"📤 Sent completion data: {completion_data}")
        except Exception:
            pass

    except Exception as e:
        logger.error(f"Error completing answer: {str(e)}")
        emit('error', {'message': f'Failed to process answer completion: {str(e)}'})

@socketio.on('end-interview')
def handle_end_interview(data):
   
    try:
        client_id = request.sid # pyright: ignore[reportAttributeAccessIssue]
        provided_session_id = (data or {}).get('sessionId') or (data or {}).get('session_id')
        logger.info(f"🛑 End interview requested by client: {client_id} (sessionId={provided_session_id})")

        session_id = None
        if client_id in active_interviews:
            session_id = active_interviews[client_id].get('session_id')
        if not session_id and provided_session_id:
            session_id = provided_session_id

        if session_id:
            
            try:
                conn = get_db_connection()
                try:
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE interview_sessions 
                        SET end_time = CURRENT_TIMESTAMP, status = 'completed'
                        WHERE id = ?
                    ''', (session_id,))
                    conn.commit()
                    logger.info(f"✅ Interview {session_id} ended by user")
                finally:
                    conn.close()
            except Exception as db_err:
                logger.error(f"❌ Failed to update DB on end interview: {db_err}")

            
            if client_id in active_interviews:
                del active_interviews[client_id]

            try:
                completion_data = build_completion_payload(session_id)
                # Adjust message to reflect manual termination (may be mid-interview)
                if completion_data.get('answeredQuestions', 0) < completion_data.get('totalQuestions', 0):
                    completion_data['message'] = 'Interview ended by user before all questions'
                else:
                    completion_data['message'] = 'Interview ended by user'
            except Exception as build_err:
                logger.error(f"⚠️ Failed to build rich payload on manual end: {build_err}")
                completion_data = {
                    'sessionId': session_id,
                    'message': 'Interview ended successfully',
                    'questions': [],
                    'answers': []
                }

            emit('interview-ended', completion_data)
        else:
            emit('error', {'message': 'No active interview to end'})
            
    except Exception as e:
        logger.error(f"Error ending interview: {str(e)}")
        emit('error', {'message': f'Failed to end interview: {str(e)}'})



@app.route('/')
def index():
    return {'message': 'Interview IQ Server v2.0 - Clean Audio Processing', 'status': 'running'}

@app.route('/health')
def health():
    return {
        'status': 'healthy',
        'whisper_available': whisper_model is not None,
        'ai_available': AI_AVAILABLE,
        'active_interviews': len(active_interviews)
    }

@app.route('/test-question')
def test_question():
    
    try:
        module_name = request.args.get('module', 'General')
        difficulty = request.args.get('difficulty', 'Medium')
        
        if AI_AVAILABLE and interview_ai:
            try:
                subject_name = map_subject_id_to_name(module_name)
                
                questions = []
                for i in range(3): 
                    question_result = interview_ai.generate_question(
                        difficulty=difficulty,
                        subject=subject_name,
                        persona='professional_man',
                        question_number=i + 1,
                        previous_answers=[]
                    )
                    if question_result and (question_result.get('question') or question_result.get('question_text')):
                        questions.append(question_result.get('question') or question_result.get('question_text'))
                
                return {
                    'success': True,
                    'module': module_name,
                    'subject': subject_name,
                    'difficulty': difficulty,
                    'questions': questions
                }
            except Exception as ai_error:
                return {
                    'success': False,
                    'error': f'AI generation failed: {str(ai_error)}',
                    'fallback': True
                }
        else:
            return {
                'success': False,
                'error': 'AI system not available',
                'ai_available': AI_AVAILABLE
            }
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.route('/api/analytics/<session_id>', methods=['GET'])
def get_analytics(session_id):
   
    try:
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM interview_sessions WHERE id = ?
            ''', (session_id,))
            session_data = cursor.fetchone()
            
            if not session_data:
                logger.warning(f"Session {session_id} not found in database")
                return jsonify({'error': 'Session not found'}), 404
            
       
            cursor.execute('''
                SELECT * FROM interview_questions WHERE session_id = ? ORDER BY question_number
            ''', (session_id,))
            questions_data = cursor.fetchall()
            

            cursor.execute('''
                SELECT audio_transcript, confidence_score, clarity_score, technical_accuracy
                FROM interview_answers WHERE session_id = ? ORDER BY id
            ''', (session_id,))
            answers_data = cursor.fetchall()
        finally:
            conn.close()
        

        answers = []
        for answer in answers_data:
            answers.append({
                'transcript': answer[0] or '',
                'analysis': {
                    'confidence_score': answer[1] or 50,
                    'clarity_score': answer[2] or 50,
                    'technical_accuracy': answer[3] or 50
                }
            })
        
        start_time = session_data[9] if session_data[9] else None
        end_time = session_data[10] if session_data[10] else None
        duration = "N/A"
        if start_time and end_time:
            try:
                from datetime import datetime
                start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                duration_seconds = (end - start).total_seconds()
                duration = f"{int(duration_seconds // 60)}m {int(duration_seconds % 60)}s"
            except:
                duration = "N/A"
        
      
        analytics = {
            'sessionId': session_id,
            'difficulty': session_data[2] or 'Medium',
            'subject': session_data[6] or 'General',
            'duration': duration,
            'totalQuestions': session_data[11] or 10,
            'completedQuestions': len(answers),
            'overallScore': session_data[13] or 75,
            'status': session_data[14] or 'completed',
            
       
            'fillerWords': analyze_filler_words(answers),
            'speakingMetrics': calculate_speaking_metrics(answers),
            'questionPerformance': build_question_performance(answers),
            
           
            'scores': {
                'confidence': round(sum(a.get('analysis', {}).get('confidence_score', 50) for a in answers) / max(len(answers), 1), 0),
                'clarity': round(sum(a.get('analysis', {}).get('clarity_score', 50) for a in answers) / max(len(answers), 1), 0),
                'technical_accuracy': round(sum(a.get('analysis', {}).get('technical_accuracy', 50) for a in answers) / max(len(answers), 1), 0),
                # Provide a communication composite for the UI
                'communication': round((
                    (sum(a.get('analysis', {}).get('confidence_score', 50) for a in answers) / max(len(answers), 1)) +
                    (sum(a.get('analysis', {}).get('clarity_score', 50) for a in answers) / max(len(answers), 1))
                ) / 2, 0)
            },
            
          
            'feedback': {
                'strengths': generate_strengths(answers),
                'improvements': generate_improvements(answers),
                'overall': generate_overall_feedback(answers),
                'recommendations': build_recommendations(answers)
            },
            
            
            'questions': []
        }
        
        for q in questions_data:
            analytics['questions'].append({
                'questionNumber': q[2],
                'questionText': q[3],
                'answerText': q[4],
                'qualityScore': q[7] or 70
            })
        
        return jsonify(analytics)
        
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

def analyze_filler_words(answers, realtime_issues=None):
    filler_words = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually','yeah','ehh','aah','oh','Oh','ohh','uhm','And And','Om','on on','On on','on On',]
    filler_count = {}
    total_fillers = 0
    
  
    for answer in answers:
        if isinstance(answer, dict):
            answer_text = (answer.get('transcript', '') or '').lower()
        elif isinstance(answer, (list, tuple)) and len(answer) > 1:
            answer_text = (answer[1] or '').lower()
        else:
            answer_text = str(answer).lower()
            
        for filler in filler_words:
            count = answer_text.count(filler)
            if count > 0:
                filler_count[filler] = filler_count.get(filler, 0) + count
                total_fillers += count
   
    if realtime_issues and 'filler_count' in realtime_issues:
        total_fillers += realtime_issues['filler_count']
    
    breakdown = [{'word': word, 'count': count} for word, count in filler_count.items()]
    breakdown.sort(key=lambda x: x['count'], reverse=True)
    
    return {
        'total': total_fillers,
        'breakdown': breakdown[:4], 
        'realtime_count': realtime_issues.get('filler_count', 0) if realtime_issues else 0
    }

def calculate_speaking_metrics(answers, realtime_issues=None):
    
    total_words = 0
    total_duration = 0
    
    for answer in answers:
        if isinstance(answer, dict):
            transcript = answer.get('transcript', '')
            duration = answer.get('duration', 30)
        elif isinstance(answer, (list, tuple)) and len(answer) > 1:
            transcript = answer[1] or ''
            duration = 30  # Default duration
        else:
            transcript = str(answer)
            duration = 30
            
        if transcript:
            words = len(transcript.split())
            total_words += words
            total_duration += duration
    

    wpm = (total_words / max(total_duration / 60, 1)) if total_duration > 0 else 0
    
    return {
        'wordsPerMinute': round(wpm, 1),
        'totalWords': total_words,
        'averagePauses': 2.3,  
        'speakingPace': 'optimal' if 120 <= wpm <= 160 else 'needs_improvement'
    }

def build_question_performance(answers):
    
    performance = []
    
    for i, answer in enumerate(answers):
        if isinstance(answer, dict):
            score = answer.get('analysis', {}).get('confidence_score', 70)
            transcript = answer.get('transcript', '')
        elif isinstance(answer, (list, tuple)) and len(answer) > 2:
            score = answer[2] or 70
            transcript = answer[1] or ''
        else:
            score = 70
            transcript = str(answer)
        
        performance.append({
            'questionNumber': i + 1,
            'score': score,
            'wordCount': len(transcript.split()) if transcript else 0,
            'duration': 30  # Placeholder
        })
    
    return performance

def generate_strengths(answers):
    
    strengths = []
    
    if not answers:
        return ["Completed the interview session"]
    
    # Calculate averages
    avg_confidence = sum(a.get('analysis', {}).get('confidence_score', 70) for a in answers) / len(answers)
    avg_clarity = sum(a.get('analysis', {}).get('clarity_score', 70) for a in answers) / len(answers)
    total_words = sum(len(a.get('transcript', '').split()) for a in answers)
    
    if avg_confidence >= 80:
        strengths.append("Demonstrated strong confidence in responses")
    if avg_clarity >= 80:
        strengths.append("Spoke with excellent clarity and articulation")
    if total_words > 200:
        strengths.append("Provided detailed and comprehensive answers")
    if len(answers) >= 8:
        strengths.append("Completed majority of interview questions")
 
    if not strengths:
        strengths.extend([
            "Participated actively in the interview",
            "Attempted to answer all questions asked"
        ])
    
    return strengths

def generate_improvements(answers):
   
    improvements = []
    
    if not answers:
        return ["Try to provide more detailed responses"]
    
    
    avg_confidence = sum(a.get('analysis', {}).get('confidence_score', 70) for a in answers) / len(answers)
    avg_clarity = sum(a.get('analysis', {}).get('clarity_score', 70) for a in answers) / len(answers)
    empty_answers = sum(1 for a in answers if not a.get('transcript', '').strip())
    total_words = sum(len(a.get('transcript', '').split()) for a in answers)
    
    if avg_confidence < 60:
        improvements.append("Practice speaking with more confidence and conviction")
    if avg_clarity < 60:
        improvements.append("Work on clearer articulation and speech pace")
    if empty_answers > 2:
        improvements.append("Try to provide verbal responses to all questions")
    if total_words < 100:
        improvements.append("Provide more detailed and comprehensive answers")
    
   
    if not improvements:
        improvements.extend([
            "Continue practicing technical interview skills",
            "Consider providing more specific examples in responses"
        ])
    
    return improvements

def generate_overall_feedback(answers):
 
    if not answers:
        return "Thank you for participating in the interview. Keep practicing!"
    
    avg_score = sum(a.get('analysis', {}).get('confidence_score', 70) for a in answers) / len(answers)
    
    if avg_score >= 85:
        return "Excellent performance! You demonstrated strong technical knowledge and communication skills."
    elif avg_score >= 70:
        return "Good interview performance with room for improvement in some areas."
    elif avg_score >= 55:
        return "Fair performance. Focus on building confidence and providing more detailed responses."
    else:
        return "Keep practicing! Regular mock interviews will help improve your performance."

def build_recommendations(answers: List[dict]) -> List[str]:
    """Derive actionable recommendations for the client UI."""
    recs: List[str] = []
    if not answers:
        return [
            "Practice a short 2-minute introduction and record it",
            "Review fundamentals of your chosen subject before retrying",
            "Ensure your microphone and environment are set up for clear audio"
        ]

    avg_conf = sum(a.get('analysis', {}).get('confidence_score', 70) for a in answers) / len(answers)
    avg_clarity = sum(a.get('analysis', {}).get('clarity_score', 70) for a in answers) / len(answers)
    avg_tech = sum(a.get('analysis', {}).get('technical_accuracy', 70) for a in answers) / len(answers)
    total_words = sum(len(a.get('transcript', '').split()) for a in answers)

    if avg_conf < 70:
        recs.append("Practice speaking with steady pace and confident tone (mirror or record yourself)")
    if avg_clarity < 70:
        recs.append("Structure answers using STAR (Situation, Task, Action, Result) for clarity")
    if avg_tech < 70:
        recs.append("Revise key concepts and prepare 2-3 concrete examples per topic")
    if total_words < 150:
        recs.append("Expand answers with brief context and impact to show depth")

    if not recs:
        recs = [
            "Continue mock interviews weekly and iterate using feedback",
            "Maintain concise yet complete answers (45–90 seconds per question)",
            "Highlight measurable outcomes in your examples"
        ]

    return recs[:4]

def _fetch_session_detail(session_id: str):
    try:
        conn = get_db_connection()
        try:
            c = conn.cursor()
            c.execute('SELECT * FROM interview_sessions WHERE id = ?', (session_id,))
            session_row = c.fetchone()
            if not session_row:
                return None
            c.execute('''SELECT question_number, question_text FROM interview_questions WHERE session_id = ? ORDER BY question_number''', (session_id,))
            questions = c.fetchall()
            c.execute('''SELECT question_id, audio_transcript, filler_words_count, confidence_score, clarity_score, technical_accuracy FROM interview_answers WHERE session_id = ? ORDER BY id''', (session_id,))
            answers = c.fetchall()
            return session_row, questions, answers
        finally:
            conn.close()
    except Exception as e:
        logger.error(f"❌ Failed fetching session detail {session_id}: {e}")
        return None

def build_completion_payload(session_id: str, interview_data: dict | None = None):
    db_data = _fetch_session_detail(session_id)
    if not db_data:
        return {
            'sessionId': session_id,
            'message': 'Interview completed',
            'questions': [],
            'answers': []
        }
    session_row, questions_rows, answers_rows = db_data
    difficulty = session_row[2]
    llm = session_row[3]
    interview_type = session_row[4]
    persona = session_row[5]
    subject = session_row[6]
    module_id = session_row[7]
    path_id = session_row[8]
    start_time = session_row[9]
    end_time = session_row[10]
    total_questions = session_row[11] or len(questions_rows) or 10
    status = session_row[14] or 'completed'


    questions_list = []
    for q in questions_rows:
        questions_list.append({
            'questionNumber': q[0],
            'questionText': q[1]
        })

    answers_list = []
    for a in answers_rows:
        qid, transcript, fillers, conf, clar, tech = a
        fillers = fillers or 0
        answers_list.append({
            'questionId': qid,
            'transcript': transcript or '',
            'fillerWordsCount': fillers,
            'fillerFlag': 1 if fillers > 0 else 0,
            'confidenceScore': conf or 0,
            'clarityScore': clar or 0,
            'technicalAccuracy': tech or 0
        })

    overall_conf = round(sum(a['confidenceScore'] for a in answers_list) / max(len(answers_list),1), 1) if answers_list else 0
    overall_clarity = round(sum(a['clarityScore'] for a in answers_list) / max(len(answers_list),1), 1) if answers_list else 0
    overall_tech = round(sum(a['technicalAccuracy'] for a in answers_list) / max(len(answers_list),1), 1) if answers_list else 0
    overall_comm = round(((overall_conf + overall_clarity)/2),1) if answers_list else 0

    return {
        'sessionId': session_id,
        'message': 'Interview completed successfully!',
        'difficulty': difficulty,
        'llm': llm,
        'interviewType': interview_type,
        'persona': persona,
        'subject': subject,
        'moduleId': module_id,
        'pathId': path_id,
        'startTime': start_time,
        'endTime': end_time,
        'status': status,
        'totalQuestions': total_questions,
        'answeredQuestions': len(answers_list),
        'completedQuestions': len(answers_list),
        'scores': {
            'overallCommunication': overall_comm,
            'confidence': overall_conf,
            'clarity': overall_clarity,
            'technical_accuracy': overall_tech
        },
        'questions': questions_list,
        'answers': answers_list
    }

if __name__ == '__main__':
    logger.info("🚀 Starting Interview IQ Server v2.0 (Clean Audio Processing)")
    logger.info(f"🎤 Whisper model: {'✅ Available' if whisper_model else '❌ Not available'}")
    logger.info(f"🤖 AI system: {'✅ Available' if AI_AVAILABLE else '❌ Not available'}")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)