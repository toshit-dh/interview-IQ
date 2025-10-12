"""
Advanced Audio Processing for Interview IQ
Handles speech-to-text, filler word detection, and real-time audio analysis
"""

import os
import io
import wave
import tempfile
import logging
from typing import Dict, List, Tuple, Optional, Any
import asyncio
from datetime import datetime, timedelta
import json

# Lightweight version without heavy dependencies
# import whisper
# import numpy as np
# import speech_recognition as sr
# from pydub import AudioSegment
# from pydub.silence import split_on_silence, detect_nonsilent
# import torch
# import librosa
# import soundfile as sf

# For basic functionality without heavy dependencies
import base64
import struct

# Configure logging
logger = logging.getLogger(__name__)

class AdvancedAudioProcessor:
    """Advanced audio processing with real-time capabilities"""
    
    def __init__(self, model_size: str = "base"):
        """
        Initialize the audio processor
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
        """
        self.whisper_model = whisper.load_model(model_size)
        self.recognizer = sr.Recognizer()
        self.chunk_duration = 5  # seconds for real-time processing
        
        # Filler words and patterns
        self.filler_words = {
            'basic': ['um', 'uh', 'like', 'you know', 'so', 'well', 'right'],
            'advanced': [
                'actually', 'basically', 'literally', 'obviously', 'definitely',
                'probably', 'generally', 'typically', 'essentially', 'particularly',
                'specifically', 'honestly', 'frankly', 'clearly', 'apparently'
            ],
            'hesitation': [
                'i mean', 'i think', 'i guess', 'i suppose', 'kind of', 'sort of',
                'you see', 'you know what i mean', 'if you will', 'as it were'
            ],
            'repetitive': [
                'and and', 'the the', 'but but', 'so so', 'like like',
                'i i', 'we we', 'it it', 'that that'
            ]
        }
        
        # Speech quality thresholds
        self.quality_thresholds = {
            'excellent': {'filler_ratio': 0.02, 'pause_ratio': 0.15, 'speed_range': (140, 160)},
            'good': {'filler_ratio': 0.05, 'pause_ratio': 0.25, 'speed_range': (120, 180)},
            'fair': {'filler_ratio': 0.08, 'pause_ratio': 0.35, 'speed_range': (100, 200)},
            'poor': {'filler_ratio': 0.12, 'pause_ratio': 0.45, 'speed_range': (80, 220)}
        }
    
    def process_audio_chunk(self, audio_data: bytes, format: str = "webm") -> Dict[str, Any]:
        """
        Process audio chunk for real-time analysis
        
        Args:
            audio_data: Raw audio data
            format: Audio format (webm, wav, mp3, etc.)
            
        Returns:
            Processing results with transcript and analysis
        """
        try:
            # Convert audio data to processable format
            audio_segment = self.convert_audio_data(audio_data, format)
            
            if audio_segment is None:
                return {"error": "Failed to process audio data"}
            
            # Save to temporary file for Whisper
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                audio_segment.export(temp_file.name, format="wav")
                temp_path = temp_file.name
            
            try:
                # Transcribe with Whisper
                result = self.whisper_model.transcribe(
                    temp_path,
                    language="en",
                    word_timestamps=True,
                    verbose=False
                )
                
                transcript = result["text"].strip()
                segments = result.get("segments", [])
                
                # Real-time analysis
                analysis = self._analyze_speech_realtime( # pyright: ignore[reportAttributeAccessIssue]
                    transcript, 
                    segments, 
                    audio_segment.duration_seconds
                )
                
                return {
                    "transcript": transcript,
                    "segments": segments,
                    "duration": audio_segment.duration_seconds,
                    "analysis": analysis,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            logger.error(f"Error processing audio chunk: {str(e)}")
            return {"error": f"Audio processing failed: {str(e)}""}
    
    def process_complete_audio(self, audio_data: bytes, format: str = "webm") -> Dict[str, Any]:
        """
        Process complete audio for comprehensive analysis
        
        Args:
            audio_data: Complete audio recording
            format: Audio format
            
        Returns:
            Comprehensive analysis results
        """
        try:
            audio_segment = self._convert_audio_data(audio_data, format)
            
            if audio_segment is None:
                return {"error": "Failed to process audio data"}
            
            # Enhanced processing for complete audio
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                # Export with specific parameters for better quality
                audio_segment.export(
                    temp_file.name, 
                    format="wav",
                    parameters=["-ac", "1", "-ar", "16000"]  # Mono, 16kHz
                )
                temp_path = temp_file.name
            
            try:
                # Advanced Whisper transcription
                result = self.whisper_model.transcribe(
                    temp_path,
                    language="en",
                    word_timestamps=True,
                    verbose=False,
                    temperature=0.0,  # More deterministic
                    compression_ratio_threshold=2.4,
                    logprob_threshold=-1.0,
                    no_speech_threshold=0.6
                )
                
                transcript = result["text"].strip()
                segments = result.get("segments", [])
                words = result.get("words", [])
                
                # Comprehensive analysis
                analysis = self._comprehensive_speech_analysis(
                    transcript, 
                    segments, 
                    words,
                    audio_segment
                )
                
                return {
                    "transcript": transcript,
                    "segments": segments,
                    "words": words,
                    "duration": audio_segment.duration_seconds,
                    "analysis": analysis,
                    "audio_quality": self._assess_audio_quality(audio_segment),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
            finally:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            logger.error(f"Error processing complete audio: {str(e)}")
            return {"error": f"Complete audio processing failed: {str(e)}"}
    
    def convert_audio_data(self, audio_data: bytes, format: str) -> Optional[AudioSegment]:
        """Convert raw audio data to AudioSegment"""
        try:
            if format.lower() in ['webm', 'ogg']:
                # Handle WebM/OGG format
                audio_segment = AudioSegment.from_file(
                    io.BytesIO(audio_data), 
                    format="webm"
                )
            elif format.lower() == 'wav':
                audio_segment = AudioSegment.from_wav(io.BytesIO(audio_data))
            elif format.lower() == 'mp3':
                audio_segment = AudioSegment.from_mp3(io.BytesIO(audio_data))
            else:
                # Try to auto-detect format
                audio_segment = AudioSegment.from_file(io.BytesIO(audio_data))
            
            return audio_segment
            
        except Exception as e:
            logger.error(f"Error converting audio data: {str(e)}")
            return None
    
    def _analyze_speech_realtime(self, transcript: str, segments: List[Dict], duration: float) -> Dict[str, Any]:
        """Real-time speech analysis for immediate feedback"""
        if not transcript or duration <= 0:
            return {"error": "Invalid input for analysis"}
        
        words = transcript.lower().split()
        word_count = len(words)
        
        # Quick filler word detection
        filler_count = 0
        filler_details = {}
        
        for category, fillers in self.filler_words.items():
            for filler in fillers:
                count = transcript.lower().count(filler)
                if count > 0:
                    filler_details[filler] = count
                    filler_count += count
        
        # Speaking rate
        speaking_rate = (word_count / duration) * 60 if duration > 0 else 0
        
        # Quick confidence assessment
        uncertainty_words = ['maybe', 'probably', 'i think', 'i guess']
        uncertainty_count = sum(transcript.lower().count(word) for word in uncertainty_words)
        
        # Basic scores for real-time feedback
        filler_ratio = filler_count / word_count if word_count > 0 else 0
        confidence_score = max(0, 100 - (filler_count * 5) - (uncertainty_count * 3))
        clarity_score = max(0, 100 - (filler_count * 3))
        
        # Determine quality level
        quality_level = 'poor'
        for level, thresholds in self.quality_thresholds.items():
            if (filler_ratio <= thresholds['filler_ratio'] and
                thresholds['speed_range'][0] <= speaking_rate <= thresholds['speed_range'][1]):
                quality_level = level
                break
        
        return {
            "word_count": word_count,
            "filler_count": filler_count,
            "filler_details": filler_details,
            "filler_ratio": round(filler_ratio, 3),
            "speaking_rate": round(speaking_rate, 1),
            "confidence_score": round(confidence_score, 1),
            "clarity_score": round(clarity_score, 1),
            "quality_level": quality_level,
            "analysis_type": "realtime"
        }
    
    def _comprehensive_speech_analysis(self, transcript: str, segments: List[Dict], 
                                     words: List[Dict], audio_segment: AudioSegment) -> Dict[str, Any]:
        """Comprehensive speech analysis for final evaluation"""
        
        if not transcript:
            return {"error": "No transcript available for analysis"}
        
        # Basic metrics
        word_list = transcript.lower().split()
        word_count = len(word_list)
        duration = audio_segment.duration_seconds
        
        # Advanced filler word analysis
        filler_analysis = self._analyze_filler_words(transcript, words)
        
        # Pause analysis
        pause_analysis = self._analyze_pauses(segments, audio_segment)
        
        # Speech rhythm analysis
        rhythm_analysis = self._analyze_speech_rhythm(words, duration)
        
        # Pronunciation and clarity
        clarity_analysis = self._analyze_clarity(transcript, segments)
        
        # Confidence indicators
        confidence_analysis = self._analyze_confidence_indicators(transcript)
        
        # Overall scoring
        scores = self._calculate_comprehensive_scores(
            filler_analysis, pause_analysis, rhythm_analysis, 
            clarity_analysis, confidence_analysis, word_count, duration
        )
        
        return {
            "comprehensive_analysis": True,
            "word_count": word_count,
            "duration": duration,
            "filler_analysis": filler_analysis,
            "pause_analysis": pause_analysis,
            "rhythm_analysis": rhythm_analysis,
            "clarity_analysis": clarity_analysis,
            "confidence_analysis": confidence_analysis,
            "scores": scores,
            "recommendations": self._generate_recommendations(scores),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
    
    def _analyze_filler_words(self, transcript: str, words: List[Dict]) -> Dict[str, Any]:
        """Detailed filler word analysis"""
        filler_count = 0
        filler_details = {}
        filler_positions = []
        
        # Analyze by category
        for category, fillers in self.filler_words.items():
            category_count = 0
            for filler in fillers:
                count = transcript.lower().count(filler)
                if count > 0:
                    filler_details[filler] = {
                        'count': count,
                        'category': category
                    }
                    category_count += count
                    filler_count += count
            
            if category_count > 0:
                filler_details[f'{category}_total'] = category_count
        
        # Find filler word positions in timeline
        if words:
            for word_info in words:
                word_text = word_info.get('word', '').lower().strip()
                if any(word_text == filler for fillers in self.filler_words.values() for filler in fillers):
                    filler_positions.append({
                        'word': word_text,
                        'start': word_info.get('start', 0),
                        'end': word_info.get('end', 0)
                    })
        
        word_count = len(transcript.split())
        filler_ratio = filler_count / word_count if word_count > 0 else 0
        
        return {
            "total_filler_count": filler_count,
            "filler_details": filler_details,
            "filler_positions": filler_positions,
            "filler_ratio": round(filler_ratio, 4),
            "filler_frequency": round(filler_count / (len(transcript.split()) / 100), 2) if word_count > 0 else 0
        }
    
    def _analyze_pauses(self, segments: List[Dict], audio_segment: AudioSegment) -> Dict[str, Any]:
        """Analyze pauses and silence patterns"""
        if not segments:
            return {"error": "No segments available for pause analysis"}
        
        pauses = []
        total_pause_time = 0
        
        # Find pauses between segments
        for i in range(len(segments) - 1):
            current_end = segments[i].get('end', 0)
            next_start = segments[i + 1].get('start', 0)
            
            if next_start > current_end:
                pause_duration = next_start - current_end
                if pause_duration > 0.1:  # Minimum pause threshold
                    pauses.append({
                        'start': current_end,
                        'end': next_start,
                        'duration': pause_duration
                    })
                    total_pause_time += pause_duration
        
        # Analyze pause patterns
        if pauses:
            pause_durations = [p['duration'] for p in pauses]
            avg_pause_duration = sum(pause_durations) / len(pause_durations)
            max_pause = max(pause_durations)
            long_pauses = [p for p in pauses if p['duration'] > 2.0]  # Pauses longer than 2 seconds
        else:
            avg_pause_duration = max_pause = 0
            long_pauses = []
        
        pause_ratio = total_pause_time / audio_segment.duration_seconds if audio_segment.duration_seconds > 0 else 0
        
        return {
            "total_pauses": len(pauses),
            "total_pause_time": round(total_pause_time, 2),
            "pause_ratio": round(pause_ratio, 3),
            "average_pause_duration": round(avg_pause_duration, 2),
            "max_pause_duration": round(max_pause, 2),
            "long_pauses": len(long_pauses),
            "pause_details": pauses[:10]  # Limit for performance
        }
    
    def _analyze_speech_rhythm(self, words: List[Dict], duration: float) -> Dict[str, Any]:
        """Analyze speech rhythm and pacing"""
        if not words or duration <= 0:
            return {"error": "Insufficient data for rhythm analysis"}
        
        word_count = len(words)
        speaking_rate = (word_count / duration) * 60  # words per minute
        
        # Analyze word timing variations
        word_durations = []
        for word_info in words:
            start = word_info.get('start', 0)
            end = word_info.get('end', 0)
            if end > start:
                word_durations.append(end - start)
        
        if word_durations:
            avg_word_duration = sum(word_durations) / len(word_durations)
            rhythm_consistency = 1.0 - (np.std(word_durations) / np.mean(word_durations)) if np.mean(word_durations) > 0 else 0
        else:
            avg_word_duration = rhythm_consistency = 0
        
        # Classify speaking rate
        if speaking_rate < 100:
            rate_category = "very_slow"
        elif speaking_rate < 130:
            rate_category = "slow"
        elif speaking_rate < 160:
            rate_category = "normal"
        elif speaking_rate < 200:
            rate_category = "fast"
        else:
            rate_category = "very_fast"
        
        return {
            "speaking_rate": round(speaking_rate, 1),
            "rate_category": rate_category,
            "word_count": word_count,
            "average_word_duration": round(avg_word_duration, 3),
            "rhythm_consistency": round(rhythm_consistency, 3),
            "optimal_rate_range": (140, 160)
        }
    
    def _analyze_clarity(self, transcript: str, segments: List[Dict]) -> Dict[str, Any]:
        """Analyze speech clarity and articulation"""
        
        # Count unclear words (based on confidence if available)
        unclear_words = 0
        total_confidence = 0
        confidence_scores = []
        
        for segment in segments:
            words = segment.get('words', [])
            for word in words:
                confidence = word.get('probability', 1.0)
                confidence_scores.append(confidence)
                total_confidence += confidence
                if confidence < 0.7:  # Low confidence threshold
                    unclear_words += 1
        
        avg_confidence = total_confidence / len(confidence_scores) if confidence_scores else 1.0
        
        # Text-based clarity indicators
        sentences = [s.strip() for s in transcript.split('.') if s.strip()]
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        # Repetition analysis
        words = transcript.lower().split()
        word_repetitions = {}
        for word in words:
            if len(word) > 3:  # Only count significant words
                word_repetitions[word] = word_repetitions.get(word, 0) + 1
        
        repeated_words = {k: v for k, v in word_repetitions.items() if v > 2}
        
        return {
            "unclear_words": unclear_words,
            "average_confidence": round(avg_confidence, 3),
            "confidence_scores": confidence_scores[:20],  # Limit for performance
            "sentence_count": len(sentences),
            "average_sentence_length": round(avg_sentence_length, 1),
            "repeated_words": repeated_words,
            "clarity_score": round(avg_confidence * 100, 1)
        }
    
    def _analyze_confidence_indicators(self, transcript: str) -> Dict[str, Any]:
        """Analyze confidence indicators in speech"""
        
        # Confidence boosters
        strong_words = [
            'definitely', 'certainly', 'absolutely', 'clearly', 'obviously',
            'confident', 'sure', 'positive', 'believe', 'know'
        ]
        
        # Confidence reducers
        weak_words = [
            'maybe', 'perhaps', 'possibly', 'probably', 'might', 'could',
            'i think', 'i guess', 'i suppose', 'not sure', 'unsure'
        ]
        
        # Hedging phrases
        hedging_phrases = [
            'kind of', 'sort of', 'more or less', 'pretty much', 'i believe',
            'in my opinion', 'it seems', 'it appears', 'i would say'
        ]
        
        strong_count = sum(transcript.lower().count(word) for word in strong_words)
        weak_count = sum(transcript.lower().count(word) for word in weak_words)
        hedging_count = sum(transcript.lower().count(phrase) for phrase in hedging_phrases)
        
        confidence_ratio = (strong_count - weak_count - hedging_count) / len(transcript.split()) if transcript else 0
        
        return {
            "strong_indicators": strong_count,
            "weak_indicators": weak_count,
            "hedging_phrases": hedging_count,
            "confidence_ratio": round(confidence_ratio, 4),
            "confidence_level": "high" if confidence_ratio > 0.01 else "medium" if confidence_ratio > -0.01 else "low"
        }
    
    def _calculate_comprehensive_scores(self, filler_analysis: Dict, pause_analysis: Dict, 
                                      rhythm_analysis: Dict, clarity_analysis: Dict, 
                                      confidence_analysis: Dict, word_count: int, duration: float) -> Dict[str, float]:
        """Calculate comprehensive scoring"""
        
        # Fluency score (based on filler words and pauses)
        filler_penalty = min(30, filler_analysis.get('filler_count', 0) * 2)
        pause_penalty = min(20, pause_analysis.get('long_pauses', 0) * 5)
        fluency_score = max(0, 100 - filler_penalty - pause_penalty)
        
        # Pace score (based on speaking rate)
        speaking_rate = rhythm_analysis.get('speaking_rate', 150)
        optimal_range = rhythm_analysis.get('optimal_rate_range', (140, 160))
        if optimal_range[0] <= speaking_rate <= optimal_range[1]:
            pace_score = 100
        else:
            deviation = min(abs(speaking_rate - optimal_range[0]), abs(speaking_rate - optimal_range[1]))
            pace_score = max(0, 100 - deviation * 0.5)
        
        # Clarity score
        clarity_score = clarity_analysis.get('clarity_score', 80)
        
        # Confidence score
        confidence_ratio = confidence_analysis.get('confidence_ratio', 0)
        confidence_base = 75
        if confidence_ratio > 0:
            confidence_score = min(100, confidence_base + confidence_ratio * 1000)
        else:
            confidence_score = max(0, confidence_base + confidence_ratio * 500)
        
        # Content completeness (based on word count and duration)
        expected_words = duration * 2.5  # ~150 words per minute
        completeness_ratio = word_count / expected_words if expected_words > 0 else 0
        if 0.8 <= completeness_ratio <= 1.2:
            completeness_score = 100
        else:
            completeness_score = max(0, 100 - abs(completeness_ratio - 1.0) * 50)
        
        # Overall score
        overall_score = (
            fluency_score * 0.25 +
            pace_score * 0.20 +
            clarity_score * 0.25 +
            confidence_score * 0.20 +
            completeness_score * 0.10
        )
        
        return {
            "fluency_score": round(fluency_score, 1),
            "pace_score": round(pace_score, 1),
            "clarity_score": round(clarity_score, 1),
            "confidence_score": round(confidence_score, 1),
            "completeness_score": round(completeness_score, 1),
            "overall_communication_score": round(overall_score, 1)
        }
    
    def _generate_recommendations(self, scores: Dict[str, float]) -> List[str]:
        """Generate improvement recommendations based on scores"""
        recommendations = []
        
        # Fluency recommendations
        if scores.get('fluency_score', 0) < 70:
            recommendations.append("Practice reducing filler words like 'um', 'uh', and 'like' by pausing briefly instead.")
        
        # Pace recommendations
        pace_score = scores.get('pace_score', 0)
        if pace_score < 70:
            recommendations.append("Work on speaking at a more natural pace - aim for 140-160 words per minute.")
        
        # Clarity recommendations
        if scores.get('clarity_score', 0) < 70:
            recommendations.append("Focus on clear articulation and pronunciation of words.")
        
        # Confidence recommendations
        if scores.get('confidence_score', 0) < 70:
            recommendations.append("Use more definitive language and avoid hedging phrases like 'I think' or 'maybe'.")
        
        # Completeness recommendations
        if scores.get('completeness_score', 0) < 70:
            recommendations.append("Provide more comprehensive answers with examples and details.")
        
        # Positive reinforcement
        if scores.get('overall_communication_score', 0) >= 80:
            recommendations.append("Excellent communication skills! Keep up the great work.")
        elif scores.get('overall_communication_score', 0) >= 70:
            recommendations.append("Good communication overall with room for minor improvements.")
        
        return recommendations
    
    def _assess_audio_quality(self, audio_segment: AudioSegment) -> Dict[str, Any]:
        """Assess technical audio quality"""
        
        # Basic audio metrics
        sample_rate = audio_segment.frame_rate
        channels = audio_segment.channels
        duration = audio_segment.duration_seconds
        
        # Convert to numpy for analysis
        audio_data = np.array(audio_segment.get_array_of_samples())
        if channels == 2:
            audio_data = audio_data.reshape((-1, 2)).mean(axis=1)  # Convert to mono
        
        # Normalize
        if len(audio_data) > 0:
            audio_data = audio_data / np.max(np.abs(audio_data))
        
        # Basic quality metrics
        rms_level = np.sqrt(np.mean(audio_data**2)) if len(audio_data) > 0 else 0
        peak_level = np.max(np.abs(audio_data)) if len(audio_data) > 0 else 0
        
        # Quality assessment
        quality_issues = []
        if sample_rate < 16000:
            quality_issues.append("Low sample rate may affect transcription accuracy")
        if rms_level < 0.01:
            quality_issues.append("Audio level very low - may cause transcription issues")
        if peak_level > 0.95:
            quality_issues.append("Audio may be clipped or distorted")
        
        quality_score = max(0, 100 - len(quality_issues) * 20)
        
        return {
            "sample_rate": sample_rate,
            "channels": channels,
            "duration": round(duration, 2),
            "rms_level": round(rms_level, 4),
            "peak_level": round(peak_level, 4),
            "quality_score": quality_score,
            "quality_issues": quality_issues
        }

# Global audio processor instance
audio_processor = AdvancedAudioProcessor("base")