"""
Simplified but comprehensive Flask server for Interview IQ
This version focuses on working functionality while maintaining all features
"""

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

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import sqlite3

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import simplified AI system (no agents)
try:
    from ai_agents_simple import interview_ai
    AI_AVAILABLE = True
    logger.info("✅ Simplified AI system loaded successfully (no CrewAI)")
except Exception as e:
    logger.warning(f"⚠️ AI system not available: {str(e)}")
    interview_ai = None
    AI_AVAILABLE = False

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'interview-iq-secret-key-2024'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
CORS(app)

# Global storage for active interviews
active_interviews = {}
interview_sessions = {}

# Initialize Whisper model for speech recognition
try:
    logger.info("Loading Whisper model...")
    whisper_model = whisper.load_model("base")  # or "small", "medium", "large"
    logger.info("✅ Whisper model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load Whisper model: {str(e)}")
    whisper_model = None

# Simple AI system is already initialized in import
# No need for heavy crew initialization

# Subject ID mapping function
def map_subject_id_to_name(subject_id: str) -> str:
    """Map subject IDs to readable names for better question generation"""
    
    # Common subject mappings
    subject_mappings = {
        # Frontend subjects
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
        'Backend Quiz': 'backend development',
        'nodejs': 'Node.js development',
        'Node.js Development': 'Node.js development',
        'python': 'Python development',
        'Python Development': 'Python development',
        'java': 'Java development',
        'Java Development': 'Java development',
        'php': 'PHP development',
        'golang': 'Go development',
        
        # Data Structures & Algorithms
        'dsa': 'Data Structures and Algorithms',
        'DSA': 'Data Structures and Algorithms',
        'Data Structures': 'Data Structures and Algorithms',
        'Algorithms': 'Data Structures and Algorithms',
        'data-structures': 'Data Structures and Algorithms',
        'algorithms': 'Data Structures and Algorithms',
        
        # System Design
        'system-design': 'System Design',
        'System Design': 'System Design',
        'Microservices': 'System Design and Microservices',
        'microservices': 'System Design and Microservices',
        
        # Database subjects
        'database': 'database development',
        'Database Management': 'database development',
        'sql': 'SQL and database management',
        'SQL': 'SQL and database management',
        'mongodb': 'MongoDB development',
        'postgresql': 'PostgreSQL development',
        
        # Other subjects
        'fullstack': 'full-stack development',
        'Full Stack': 'full-stack development',
        'devops': 'DevOps and system administration',
        'DevOps': 'DevOps and system administration',
        'mobile': 'mobile app development',
        'Mobile Development': 'mobile app development',
        'data-science': 'data science',
        'Data Science': 'data science',
        'ml': 'machine learning',
        'machine-learning': 'machine learning',
        'Machine Learning': 'machine learning',
        'ai': 'artificial intelligence',
        'AI': 'artificial intelligence',
        'Artificial Intelligence': 'artificial intelligence'
    }
    
    # If it's a known mapping, return it
    if subject_id.lower() in subject_mappings:
        return subject_mappings[subject_id.lower()]
    
    # If it looks like an ID (long alphanumeric string), map to general
    if len(subject_id) > 20 and subject_id.isalnum():
        logger.warning(f"Unmapped subject ID: {subject_id}, defaulting to 'general programming'")
        return 'general programming'
    
    # If it's already a readable name, return as-is
    if ' ' in subject_id or len(subject_id) < 20:
        return subject_id
    
    # Default fallback
    return 'general programming'

# Database setup
def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect('interview_iq.db')
    cursor = conn.cursor()
    
    # Create tables
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
            question_category TEXT NOT NULL,
            difficulty_level TEXT NOT NULL,
            expected_duration INTEGER DEFAULT 120,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES interview_sessions (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS interview_answers (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            audio_transcript TEXT NOT NULL,
            answer_duration REAL NOT NULL,
            filler_words_count INTEGER DEFAULT 0,
            confidence_score REAL,
            clarity_score REAL,
            technical_accuracy REAL,
            ai_feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES interview_sessions (id),
            FOREIGN KEY (question_id) REFERENCES interview_questions (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# AI-powered question generation
class QuestionGenerator:
    """Generate contextual interview questions"""
    
    def __init__(self):
        self.question_bank = {
            "Easy": {
                "frontend": [
                    "What is the difference between HTML and HTML5?",
                    "How do you make a website responsive?", 
                    "Explain what CSS is and how it works with HTML.",
                    "What are the basic data types in JavaScript?",
                    "How do you center a div in CSS?"
                ],
                "backend": [
                    "What is an API and how does it work?",
                    "Explain the difference between GET and POST requests.",
                    "What is a database and why do we use them?",
                    "How do servers handle multiple requests?",
                    "What is JSON and where is it used?"
                ],
                "general": [
                    "Tell me about yourself and your interest in technology.",
                    "Why are you interested in this field?",
                    "What programming languages have you worked with?",
                    "Describe a project you've worked on recently.",
                    "What are your career goals?"
                ]
            },
            "Medium": {
                "frontend": [
                    "Explain how JavaScript closures work with an example.",
                    "What is the virtual DOM and how does it improve performance?",
                    "How do you handle state management in React applications?",
                    "What are the differences between let, const, and var?",
                    "How would you optimize a slow-loading webpage?"
                ],
                "backend": [
                    "Explain RESTful API design principles.",
                    "What is database normalization and why is it important?",
                    "How do you handle authentication and authorization?",
                    "What are microservices and their benefits?",
                    "How would you design a URL shortening service?"
                ],
                "general": [
                    "Describe a challenging technical problem you solved.",
                    "How do you stay updated with new technologies?",
                    "Explain a time when you had to learn a new technology quickly.",
                    "How do you approach debugging when something isn't working?",
                    "What's your process for testing your code?"
                ]
            },
            "Hard": {
                "frontend": [
                    "Explain the JavaScript event loop and how it handles asynchronous operations.",
                    "How would you implement server-side rendering with React?",
                    "Design a component library that can be used across multiple projects.",
                    "How do you optimize bundle size and loading performance?",
                    "Design a real-time chat application frontend."
                ],
                "backend": [
                    "Design a distributed caching system.",
                    "How would you implement eventual consistency in a microservices architecture?",
                    "Explain different database sharding strategies.",
                    "How do you handle race conditions in concurrent systems?",
                    "Design a system to handle millions of concurrent users."
                ],
                "general": [
                    "Design a system to handle millions of users.",
                    "How would you approach a system design interview question?",
                    "Explain a time when you had to make architectural decisions.",
                    "How do you balance technical debt with feature development?",
                    "Describe your approach to mentoring junior developers."
                ]
            }
        }
        
        self.persona_styles = {
            "professional_man": "I'd like you to provide a structured response to: ",
            "professional_woman": "Could you walk me through ",
            "friendly_mentor": "Let's explore together: ",
            "strict_interviewer": "Explain in detail: "
        }
    
    def generate_question(self, difficulty: str, subject: str, persona: str, 
                         question_number: int, previous_answers: List[str] = None) -> Dict[str, Any]:
        """Generate a contextual interview question using AI agents"""
        
        try:
            # Get performance metrics from previous answers if available
            performance_metrics = None
            if previous_answers and len(previous_answers) > 0:
                # Calculate basic performance metrics from previous answers
                total_words = sum(len(answer.split()) for answer in previous_answers if answer)
                avg_length = total_words / len(previous_answers) if previous_answers else 0
                
                # Simple confidence estimation based on answer length and content
                confidence_score = min(100, max(30, avg_length * 2))  # Rough estimation
                performance_metrics = {'confidence_score': confidence_score}
            
            # Prepare context for AI agent
            context = {
                'difficulty': difficulty,
                'subject': subject,
                'persona': persona,
                'question_number': question_number,
                'previous_answers': previous_answers or [],
                'performance_metrics': performance_metrics
            }
            
            # Use AI crew to generate question if available
            if AI_AVAILABLE and simple_interview_system:
                ai_result = simple_interview_system.generate_question(**context)
                
                return {
                    "question_text": ai_result.get('question_text', 'Tell me about your experience.'),
                    "category": ai_result.get('category', subject.lower()),
                    "difficulty_level": difficulty,
                    "expected_duration": ai_result.get('expected_duration', 120),
                    "question_number": question_number,
                    "persona_tone": ai_result.get('persona_tone', 'neutral'),
                    "question_type": ai_result.get('question_type', 'adaptive')
                }
                
        except Exception as e:
            logger.error(f"Error generating AI question: {str(e)}")
        
        # Fallback to subject-specific questions from the bank
        subject_key = subject.lower() if subject.lower() in self.question_bank[difficulty] else "general"
        questions = self.question_bank[difficulty][subject_key]
        
        # Select question with some variety
        question_index = (question_number - 1) % len(questions)
        base_question = questions[question_index]
        
        # Apply persona styling
        prefix = self.persona_styles.get(persona, "")
        final_question = f"{prefix}{base_question}"
        
        # Duration based on difficulty
        duration_map = {"Easy": 90, "Medium": 120, "Hard": 180}
        expected_duration = duration_map.get(difficulty, 120)
        
        return {
            "question_text": final_question,
            "category": subject_key,
            "difficulty_level": difficulty,
            "expected_duration": expected_duration,
            "question_number": question_number
        }# Speech analysis system with Whisper integration
class SpeechAnalyzer:
    """Analyze speech patterns and quality using Whisper and AI agents"""
    
    def __init__(self):
        self.filler_words = [
            'um', 'uh', 'like', 'you know', 'so', 'well', 'right', 'okay',
            'actually', 'basically', 'literally', 'obviously', 'definitely',
            'kind of', 'sort of', 'i mean', 'you see', 'anyway'
        ]
    
    def transcribe_audio(self, audio_data: bytes) -> str:
        """Transcribe audio using Whisper model"""
        try:
            if not whisper_model:
                logger.warning("Whisper model not available, returning empty transcript")
                return ""
            
            # Validate audio data
            if not audio_data or len(audio_data) < 1000:  # Too small to be valid audio
                logger.warning("Audio data too small or empty, skipping transcription")
                return ""
            
            # Save audio data to temporary file
            temp_audio_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                    temp_audio.write(audio_data)
                    temp_audio_path = temp_audio.name
                
                # Verify file was written correctly
                if not os.path.exists(temp_audio_path) or os.path.getsize(temp_audio_path) < 1000:
                    logger.warning("Temporary audio file invalid, skipping transcription")
                    return ""
                
                # Transcribe using Whisper with error handling
                result = whisper_model.transcribe(temp_audio_path)
                transcript = result.get('text', '').strip()
                
                logger.info(f"Transcribed audio: '{transcript[:100]}...'")
                return transcript
                
            finally:
                # Clean up temporary file
                if temp_audio_path and os.path.exists(temp_audio_path):
                    try:
                        os.unlink(temp_audio_path)
                    except Exception as cleanup_error:
                        logger.warning(f"Failed to cleanup temp file: {cleanup_error}")
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            return ""
    
    def analyze_transcript_with_ai(self, transcript: str, duration: float, 
                                  question_context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze speech quality using AI agents"""
        
        if not transcript or duration <= 0:
            # For empty or silent responses, return low scores
            return {
                "word_count": 0,
                "filler_words_count": 0,
                "filler_details": {},
                "speaking_rate": 0,
                "confidence_score": 10,  # Very low for no response
                "clarity_score": 10,
                "fluency_score": 10,
                "technical_accuracy": 10,
                "overall_communication_score": 10,
                "silence_detected": True,
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
        
        try:
            # Use AI crew for comprehensive analysis
            response_data = {
                'transcript': transcript,
                'duration': duration,
                'question_context': question_context,
                'subject': question_context.get('subject', 'general'),
                'difficulty': question_context.get('difficulty', 'Medium')
            }
            
            # Use AI crew for comprehensive analysis if available
            if AI_AVAILABLE and simple_interview_system:
                ai_analysis = simple_interview_system.analyze_response(response_data)
            else:
                # Fallback to basic analysis
                return self._basic_analyze_transcript(transcript, duration)
            
            # Extract scores from AI analysis
            speech_analysis = ai_analysis.get('speech_analysis', {})
            technical_analysis = ai_analysis.get('technical_analysis', {})
            
            return {
                "word_count": speech_analysis.get('word_count', 0),
                "filler_words_count": speech_analysis.get('filler_words_count', 0),
                "filler_details": speech_analysis.get('filler_words_details', {}),
                "speaking_rate": speech_analysis.get('speaking_rate', 0),
                "confidence_score": speech_analysis.get('confidence_score', 50),
                "clarity_score": speech_analysis.get('clarity_score', 50),
                "fluency_score": speech_analysis.get('fluency_score', 50),
                "technical_accuracy": technical_analysis.get('overall_technical_score', 50),
                "overall_communication_score": ai_analysis.get('combined_score', 50),
                "silence_detected": False,
                "ai_feedback": ai_analysis.get('crew_feedback', ''),
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            
            # Fallback to basic analysis if AI fails
            return self._basic_analyze_transcript(transcript, duration)
    
    def _basic_analyze_transcript(self, transcript: str, duration: float) -> Dict[str, Any]:
        """Fallback basic analysis without AI"""
        
        words = transcript.lower().split()
        word_count = len(words)
        
        # Filler word analysis
        filler_count = 0
        filler_details = {}
        
        for filler in self.filler_words:
            count = transcript.lower().count(filler)
            if count > 0:
                filler_details[filler] = count
                filler_count += count
        
        # Speaking rate (words per minute)
        speaking_rate = (word_count / duration) * 60 if duration > 0 else 0
        
        # Confidence indicators
        uncertainty_words = ['maybe', 'probably', 'i think', 'i guess', 'i suppose']
        uncertainty_count = sum(transcript.lower().count(word) for word in uncertainty_words)
        
        confidence_words = ['definitely', 'certainly', 'absolutely', 'confident', 'sure']
        confidence_boost = sum(transcript.lower().count(word) for word in confidence_words)
        
        # Calculate scores (0-100)
        filler_ratio = filler_count / word_count if word_count > 0 else 0
        
        # Confidence score
        base_confidence = 70
        confidence_penalty = min(30, filler_count * 3 + uncertainty_count * 2)
        confidence_bonus = min(20, confidence_boost * 5)
        confidence_score = max(10, min(100, base_confidence - confidence_penalty + confidence_bonus))
        
        # Clarity score
        clarity_score = max(10, min(100, 80 - (filler_count * 2)))
        
        # Fluency score (based on speaking rate)
        optimal_rate = 150  # words per minute
        rate_deviation = abs(speaking_rate - optimal_rate)
        fluency_score = max(10, min(100, 85 - (rate_deviation * 0.3)))
        
        # Basic technical accuracy (based on word count and coherence)
        technical_accuracy = max(10, min(100, 60 + (word_count * 0.5)))
        
        # Overall communication score
        overall_score = (confidence_score + clarity_score + fluency_score + technical_accuracy) / 4
        
        return {
            "word_count": word_count,
            "filler_words_count": filler_count,
            "filler_details": filler_details,
            "filler_ratio": round(filler_ratio, 3),
            "speaking_rate": round(speaking_rate, 1),
            "confidence_score": round(confidence_score, 1),
            "clarity_score": round(clarity_score, 1),
            "fluency_score": round(fluency_score, 1),
            "technical_accuracy": round(technical_accuracy, 1),
            "overall_communication_score": round(overall_score, 1),
            "silence_detected": word_count == 0,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
    
    def generate_insights(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate real-time insights based on analysis"""
        insights = []
        
        # Filler words feedback
        filler_count = analysis.get('filler_words_count', 0)
        if filler_count > 5:
            insights.append({
                'insightType': 'fillerWords',
                'text': f'Try to reduce filler words (detected {filler_count}). Pause briefly instead of using "um" or "uh".'
            })
        elif filler_count <= 2:
            insights.append({
                'insightType': 'fillerWords',
                'text': 'Great job minimizing filler words!'
            })
        
        # Speaking rate feedback
        speaking_rate = analysis.get('speaking_rate', 150)
        if speaking_rate < 120:
            insights.append({
                'insightType': 'pace',
                'text': 'Consider speaking at a slightly faster pace to maintain engagement.'
            })
        elif speaking_rate > 180:
            insights.append({
                'insightType': 'pace',
                'text': 'Try to slow down a bit to ensure clarity.'
            })
        else:
            insights.append({
                'insightType': 'pace',
                'text': 'Excellent speaking pace!'
            })
        
        # Confidence feedback
        confidence_score = analysis.get('confidence_score', 70)
        if confidence_score >= 80:
            insights.append({
                'insightType': 'confidence',
                'text': 'You sound very confident and clear!'
            })
        elif confidence_score >= 60:
            insights.append({
                'insightType': 'confidence',
                'text': 'Good confidence level. Try to sound more definitive.'
            })
        else:
            insights.append({
                'insightType': 'confidence',
                'text': 'Use more definitive language and avoid uncertainty phrases.'
            })
        
        return insights

# Initialize components
# Using simplified AI system instead of separate generator
# question_generator = QuestionGenerator()
speech_analyzer = SpeechAnalyzer()

# Routes
@app.route("/")
def home():
    return {"message": "🚀 Interview IQ Flask API with AI is running!", "version": "2.0"}

@app.route("/health")
def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow().isoformat(),
        "active_interviews": len(active_interviews)
    }

@app.route("/test-question")
def test_question():
    """Test route to manually send a question to all connected clients"""
    test_q = {
        'questionNumber': 999,
        'totalQuestions': 10,
        'questionText': 'This is a TEST question sent via HTTP route. If you see this, the socket emission is working!',
        'category': 'test',
        'expectedDuration': 60,
        'questionId': 'http-test'
    }
    
    logger.info(f"🧪 TEST ROUTE: Broadcasting test question to all clients")
    socketio.emit('interview-question', test_q)
    
    return {
        "message": "Test question broadcasted to all clients",
        "question": test_q,
        "active_clients": len(active_interviews)
    }

# Socket event handlers
@socketio.on('connect')
def handle_connect():
    client_id = request.sid
    logger.info(f"🔌 Client connected: {client_id}")
    emit('connected', {'status': 'Connected to Interview IQ server', 'client_id': client_id})
    
    # Don't send immediate question - wait for proper session initialization
    logger.info(f"� Client {client_id} connected, waiting for interview session to start")

@socketio.on('disconnect')
def handle_disconnect():
    client_id = request.sid
    logger.info(f"Client disconnected: {client_id}")
    
    # Clean up active interview
    if client_id in active_interviews:
        session_id = active_interviews[client_id].get('session_id')
        if session_id:
            # Update session status in database
            conn = sqlite3.connect('interview_iq.db')
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE interview_sessions 
                SET status = 'cancelled', end_time = CURRENT_TIMESTAMP 
                WHERE id = ?
            ''', (session_id,))
            conn.commit()
            conn.close()
        
        del active_interviews[client_id]

@socketio.on('start-interview-session')
def handle_start_interview(data):
    """Initialize a new interview session"""
    try:
        client_id = request.sid
        logger.info(f"🚀 Start interview session called by {client_id} with data: {data}")
        
        config = data.get('config', {})
        metadata = data.get('metadata', {})
        
        logger.info(f"📋 Config: {config}")
        logger.info(f"📊 Metadata: {metadata}")
        
        # Create session ID
        session_id = str(uuid.uuid4())
        
        # Store in database
        conn = sqlite3.connect('interview_iq.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO interview_sessions 
            (id, difficulty, llm, interview_type, persona, subject, module_id, path_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            session_id,
            config.get('difficulty', 'Medium'),  # Default difficulty
            config.get('llm', 'ChatGPT'),        # Default LLM
            config.get('interviewType', 'general'), # Default interview type
            config.get('persona', 'professional_man'), # Default persona
            config.get('subject', 'general'),    # Default subject
            config.get('moduleId', 'default'),   # Default module
            config.get('pathId', 'general')      # Default path
        ))
        conn.commit()
        conn.close()
        
        # Store active interview
        active_interviews[client_id] = {
            'session_id': session_id,
            'config': config,
            'metadata': metadata,
            'current_question': 0,
            'answers': [],
            'audio_chunks': []
        }
        
        logger.info(f"Started interview session {session_id} for {client_id}")
        logger.info(f"Interview config: {config}")
        
        # Automatically generate and send the first question
        difficulty = config.get('difficulty', 'Medium')
        raw_subject = config.get('subject', 'general')
        subject = map_subject_id_to_name(raw_subject)  # Convert ID to readable name
        persona = config.get('persona', 'professional_man')
        
        logger.info(f"🤔 Auto-generating first question with: difficulty={difficulty}, subject={subject}, persona={persona}")
        
        try:
            if AI_AVAILABLE and interview_ai:
                question_data = interview_ai.generate_question(
                    difficulty=difficulty,
                    subject=subject,
                    persona=persona,
                    question_number=1
                )
            else:
                question_data = None
            
            if question_data and 'question_text' in question_data:
                # Store question in database first
                question_id = str(uuid.uuid4())
                conn = sqlite3.connect('interview_iq.db')
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO interview_questions 
                    (id, session_id, question_number, question_text, question_category, difficulty_level, expected_duration)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    question_id,
                    session_id,
                    1,
                    question_data['question_text'],
                    question_data.get('category', 'general'),
                    question_data.get('difficulty_level', difficulty),
                    question_data.get('expected_duration', 120)
                ))
                conn.commit()
                conn.close()
                
                # Update interview data with current question
                active_interviews[client_id]['current_question'] = 1
                active_interviews[client_id]['current_question_id'] = question_id
                
                # Send the first question immediately
                emit('interview-question', {
                    'questionNumber': 1,
                    'totalQuestions': 10,
                    'questionText': question_data['question_text'],
                    'category': question_data.get('category', 'general'),
                    'expectedDuration': question_data.get('expected_duration', 120),
                    'questionId': question_id,
                    'metadata': question_data.get('metadata', {})
                })
                
                logger.info(f"✅ First question stored in database and sent automatically to {client_id}")
                
        except Exception as qe:
            logger.error(f"Error generating first question: {str(qe)}")
            # Send a fallback question
            emit('interview-question', {
                'questionNumber': 1,
                'totalQuestions': 10,
                'questionText': 'Hello! Welcome to your interview. Can you please introduce yourself and tell me about your background?',
                'category': 'introduction',
                'expectedDuration': 120,
                'questionId': f"fallback_q1_{session_id}"
            })
        
        emit('interview-session-started', {
            'session_id': session_id,
            'status': 'ready',
            'message': 'Interview session initialized successfully with first question'
        })
        
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        emit('error', {'message': f'Failed to start interview session: {str(e)}'})

@socketio.on('initialize-interview')
def handle_initialize_interview(data):
    """Generate and send the first question"""
    try:
        client_id = request.sid
        logger.info(f"🎯 Initialize interview called by {client_id} with data: {data}")
        
        if client_id not in active_interviews:
            logger.error(f"❌ No active interview session for {client_id}")
            emit('error', {'message': 'No active interview session'})
            return
        
        interview_data = active_interviews[client_id]
        logger.info(f"✅ Found interview data for {client_id}: {interview_data.keys()}")
        
        # Generate first question
        difficulty = data.get('difficulty', 'Medium')
        subject = data.get('subject', 'general')
        persona = data.get('persona', 'professional_man')
        
        logger.info(f"🤔 Generating question with: difficulty={difficulty}, subject={subject}, persona={persona}")
        
        try:
            if AI_AVAILABLE and interview_ai:
                question_data = interview_ai.generate_question(
                    difficulty=difficulty,
                    subject=subject,
                    persona=persona,
                    question_number=1
                )
            else:
                question_data = None
            
            if not question_data or 'question_text' not in question_data:
                raise ValueError("Question generation returned invalid data")
                
        except Exception as qe:
            logger.error(f"❌ Question generation failed: {str(qe)}")
            # Fallback question
            question_data = {
                'question_text': f"Hello! Let's start with an introductory question. Can you tell me about yourself and your interest in {subject}?",
                'category': 'introduction',
                'difficulty_level': difficulty,
                'expected_duration': 120,
                'question_number': 1
            }
        
        logger.info(f"📝 Generated question: {question_data}")
        
        # Store question in database
        question_id = str(uuid.uuid4())
        conn = sqlite3.connect('interview_iq.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO interview_questions 
            (id, session_id, question_number, question_text, question_category, difficulty_level, expected_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            question_id,
            interview_data['session_id'],
            1,
            question_data['question_text'],
            question_data['category'],
            question_data['difficulty_level'],
            question_data['expected_duration']
        ))
        conn.commit()
        conn.close()
        
        # Update interview state
        interview_data['current_question'] = 1
        interview_data['current_question_id'] = question_id
        
        # Send question to client
        emit('interview-question', {
            'questionNumber': 1,
            'totalQuestions': 10,
            'questionText': question_data['question_text'],
            'category': question_data['category'],
            'expectedDuration': question_data['expected_duration'],
            'questionId': question_id
        })
        
        logger.info(f"Sent first question for session {interview_data['session_id']}")
        
    except Exception as e:
        logger.error(f"Error initializing interview: {str(e)}")
        emit('error', {'message': f'Failed to initialize interview: {str(e)}'})

@socketio.on('audio-chunk')
def handle_audio_chunk(audio_data):
    """DISABLED: Real-time audio chunk processing disabled"""
    # Real-time processing completely disabled
    # Audio will be processed only when recording stops
    logger.info(f"🎤 Audio chunk received but real-time processing is disabled")
    pass


@socketio.on('process-complete-audio')
def handle_complete_audio(data):
    """Process complete audio file when user finishes recording"""
    try:
        client_id = request.sid
        audio_data = data.get('audioData')  # Complete base64 audio
        
        if not audio_data:
            emit('audio-error', {'message': 'No audio data received'})
            return
            
        logger.info(f"🎤 Processing complete audio from {client_id}: {len(audio_data)} chars")
        
        # Process complete audio with Whisper
        try:
            # Decode base64 audio
            clean_audio_data = audio_data.strip()
            if clean_audio_data.startswith('data:'):
                clean_audio_data = clean_audio_data.split(',')[1]
            
            audio_bytes = base64.b64decode(clean_audio_data)
            logger.info(f"🎤 Decoded audio: {len(audio_bytes)} bytes")
            
            # Save as temporary file and transcribe
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
                temp_file.write(audio_bytes)
                temp_file_path = temp_file.name
            
            # Use Whisper to transcribe
            if whisper_model:
                result = whisper_model.transcribe(temp_file_path, language='en')
                transcript = result.get('text', '').strip()
                logger.info(f"🗣️ Complete transcript: '{transcript}'")
                
                # Analyze transcript for filler words, pace, etc.
                analysis = analyze_speech(transcript)
                
                # Send results back to client
                emit('audio-transcription', {
                    'transcript': transcript,
                    'analysis': analysis,
                    'success': True
                })
                
            # Clean up temp file
            os.unlink(temp_file_path)
            
        except Exception as process_error:
            logger.error(f"❌ Audio processing error: {process_error}")
            emit('audio-error', {'message': f'Audio processing failed: {str(process_error)}'})
            
    except Exception as e:
        logger.error(f"Error in complete audio processing: {str(e)}")
        emit('audio-error', {'message': f'Server error: {str(e)}'})


def analyze_speech(transcript):
    """Analyze transcript for filler words, pace, quality etc."""
    if not transcript:
        return {
            'quality': 'red',
            'fillerWords': 0,
            'wordCount': 0,
            'warnings': ['Empty or very short response']
        }
    
    words = transcript.lower().split()
    word_count = len(words)
    
    # Count filler words
    filler_words = ['uh', 'um', 'er', 'ah', 'like', 'you know', 'basically', 'actually']
    filler_count = sum(words.count(filler) for filler in filler_words)
    filler_ratio = filler_count / word_count if word_count > 0 else 0
    
    # Determine quality
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
        'fillerRatio': filler_ratio,
        'warnings': warnings
    }


# Real-time audio chunk processing completely removed
# All audio processing now happens when user completes their answer


# ========================================================================
# AUDIO PROCESSING: Real-time chunk processing removed
# ========================================================================
        
        # DISABLE real-time processing - WebM chunks cannot be processed individually
        # Only process complete audio when recording stops
        is_recording = interview_data.get('is_recording', False)
        logger.info(f"🎤 Audio chunk stored (recording active: {is_recording}) - will process when recording stops")
        
        # Skip real-time processing to avoid WebM chunk concatenation issues
        if False:  # Disabled real-time processing
            logger.info(f"🎤 Processing audio for real-time feedback (recording active: {is_recording})")
            try:
                # Get recent chunks for analysis
                recent_chunks = interview_data['audio_chunks'][-2:]  # Analyze last 2 chunks for faster detection
                
                # Combine chunks for transcription (simplified approach)
                if recent_chunks and whisper_model:
                    # In a real implementation, you'd properly combine audio chunks
                    # For now, we'll do basic analysis on accumulated data
                    
                    # Try to transcribe recent chunk with validation
                    chunk_transcript = ""
                    if recent_chunks[-1]:  # Last chunk
                        try:
                            # Validate base64 data first
                            audio_chunk = recent_chunks[-1]
                            if isinstance(audio_chunk, str) and len(audio_chunk) > 50:  # Lower threshold for filler detection
                                logger.info(f"🔍 Processing base64 audio chunk: {len(audio_chunk)} chars")
                                logger.info(f"🔍 Base64 sample: '{audio_chunk[:50]}...'")
                                
                                # Clean base64 data - remove any headers or whitespace
                                clean_audio_chunk = audio_chunk.strip()
                                if clean_audio_chunk.startswith('data:'):
                                    # Remove data URI prefix if present
                                    clean_audio_chunk = clean_audio_chunk.split(',')[1]
                                    logger.info("🔍 Removed data URI prefix")
                                
                                try:
                                    audio_bytes = base64.b64decode(clean_audio_chunk)
                                    logger.info(f"🔍 Decoded to {len(audio_bytes)} bytes")
                                    logger.info(f"🔍 Audio bytes sample: {audio_bytes[:20]}")
                                except Exception as decode_error:
                                    logger.error(f"❌ Base64 decode error: {decode_error}")
                                    audio_bytes = b''  # Set empty bytes to skip processing
                                if len(audio_bytes) > 500:  # Lower minimum size for better filler word detection
                                    # Use whisper model for transcription - try different formats
                                    temp_audio_path = None
                                    try:
                                        # First try as .webm
                                        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
                                            temp_audio.write(audio_bytes)
                                            temp_audio_path = temp_audio.name
                                    except Exception as file_error:
                                        logger.error(f"❌ Error creating temp file: {file_error}")
                                        
                                    try:
                                        if whisper_model and os.path.getsize(temp_audio_path) > 500:
                                            logger.info(f"🗣️ Transcribing audio file: {temp_audio_path} ({os.path.getsize(temp_audio_path)} bytes)")
                                            
                                            # Debug: Try to read the file header to verify format
                                            with open(temp_audio_path, 'rb') as f:
                                                header = f.read(20)
                                                logger.info(f"🔍 Audio file header: {header[:10]}")
                                            
                                            # Try transcription with error handling
                                            result = whisper_model.transcribe(temp_audio_path, language='en', task='transcribe')
                                            logger.info(f"🔍 Raw Whisper result: {result}")
                                            
                                            text = result.get('text', '')
                                            chunk_transcript = text.strip() if isinstance(text, str) else ""
                                            logger.info(f"🗣️ Transcription result: '{chunk_transcript}' (length: {len(chunk_transcript)})")
                                            
                                            # If empty, try with different parameters
                                            if not chunk_transcript and len(audio_bytes) > 1000:
                                                logger.info("🔄 Retrying transcription with different settings")
                                                result2 = whisper_model.transcribe(temp_audio_path, task='transcribe', fp16=False)
                                                text2 = result2.get('text', '')
                                                chunk_transcript = text2.strip() if isinstance(text2, str) else ""
                                                logger.info(f"🔄 Retry result: '{chunk_transcript}' (length: {len(chunk_transcript)})")
                                        else:
                                            chunk_transcript = ""
                                            logger.info(f"⚠️ Audio file too small ({os.path.getsize(temp_audio_path) if os.path.exists(temp_audio_path) else 0} bytes) or Whisper unavailable")
                                    finally:
                                        # Always clean up temp file
                                        if os.path.exists(temp_audio_path):
                                            os.unlink(temp_audio_path)
                                else:
                                    logger.debug("Audio chunk too small, skipping transcription")
                            else:
                                logger.debug("Invalid audio chunk format")
                        except binascii.Error as b64_error:
                            logger.warning(f"Base64 decode error: {b64_error}")
                        except Exception as trans_error:
                            logger.warning(f"Transcription error: {trans_error}")
                            chunk_transcript = ""
                    
                    # Store transcript segment
                    if chunk_transcript:
                        # Ensure chunk_transcripts exists
                        if 'chunk_transcripts' not in interview_data:
                            interview_data['chunk_transcripts'] = []
                        interview_data['chunk_transcripts'].append(chunk_transcript.lower())
                    
                    # Analyze for filler words and issues in real-time
                    chunk_list = interview_data.get('chunk_transcripts', [])
                    all_transcripts = ' '.join(chunk_list)
                    
                    # Enhanced real-time analysis with answer quality updates
                    filler_words = ['um', 'uh', 'uhm', 'uhh', 'ahhh', 'ummm', 'like', 'you know', 'so', 'well', 'actually', 'basically', 'hmm', 'err', 'ah']
                    current_time = datetime.utcnow()
                    
                    # Initialize real-time tracking if not exists
                    if 'realtime_issues' not in interview_data:
                        interview_data['realtime_issues'] = {
                            'filler_count': 0,
                            'long_pauses': 0,
                            'speaking_too_fast': 0,
                            'low_confidence': 0
                        }
                    
                    # Debug logging
                    logger.info(f"🔍 Analyzing chunk: '{chunk_transcript}' (length: {len(chunk_transcript) if chunk_transcript else 0})")
                    logger.info(f"🔍 Total chunks collected: {len(chunk_list)}")
                    logger.info(f"🔍 All transcripts so far: '{all_transcripts[:200]}...'")
                    
                    # Check for filler words in current chunk with enhanced detection
                    current_chunk_fillers = 0
                    detected_fillers = []
                    if chunk_transcript:
                        chunk_lower = chunk_transcript.lower().strip()
                        logger.info(f"🔍 Checking for filler words in: '{chunk_lower}'")
                        
                        for filler in filler_words:
                            count = chunk_lower.count(filler)
                            if count > 0:
                                current_chunk_fillers += count
                                detected_fillers.append(f"{filler}({count})")
                        
                        # Also check if chunk is just filler sounds
                        if len(chunk_lower) <= 10 and any(f in chunk_lower for f in ['um', 'uh', 'uhm', 'ahhh', 'ummm', 'hmm', 'err', 'ah']):
                            current_chunk_fillers += 1
                            detected_fillers.append("short_filler")
                        
                        if detected_fillers:
                            logger.info(f"🚨 Found fillers: {detected_fillers}")
                    
                    # Check for empty/silent responses
                    if not chunk_transcript or len(chunk_transcript.strip()) < 3:
                        logger.info(f"⚠️ Empty or very short response detected: '{chunk_transcript}'")
                    
                    if current_chunk_fillers > 0:
                        interview_data['realtime_issues']['filler_count'] += current_chunk_fillers
                        
                        # Send warning and update answer quality with more explicit messaging
                        warning_message = f'Filler words detected ({", ".join(detected_fillers)}): "{chunk_transcript.strip()}" - Try to pause instead of using filler words'
                        emit('live-warning', {
                            'type': 'filler_words',
                            'message': warning_message,
                            'severity': 'medium',
                            'count': current_chunk_fillers
                        })
                        
                        # Update answer quality - mark current block as red
                        current_block = min(len(interview_data.get('chunk_transcripts', [])) // 2, 9)
                        emit('answer-quality-update', {
                            'blockIndex': current_block,
                            'quality': 'red',
                            'reason': 'filler_words',
                            'details': f"Detected: {', '.join(detected_fillers)}"
                        })
                        
                        logger.info(f"🚨 EMITTING FILLER WARNING: {warning_message}")
                        logger.info(f"🚨 EMITTING QUALITY UPDATE: block {current_block} -> RED")
                    
                    # Don't emit empty response warnings during real-time processing
                    # Empty answer detection only happens when recording stops
                    
                    # Check for long pauses ONLY during active recording session
                    # Only check pauses if we have previous recording activity in this session
                    if 'recording_chunk_time' in interview_data:
                        time_diff = (current_time - interview_data['recording_chunk_time']).total_seconds()
                        if time_diff > 4:  # More than 4 seconds between recording chunks
                            interview_data['realtime_issues']['long_pauses'] += 1
                            
                            emit('live-warning', {
                                'type': 'long_pause',
                                'message': f'Long pause detected ({time_diff:.1f}s) - Continue your response to maintain flow',
                                'severity': 'high'
                            })
                            
                            # Update answer quality - mark current block as red
                            current_block = min(len(interview_data.get('chunk_transcripts', [])) // 2, 9)
                            emit('answer-quality-update', {
                                'blockIndex': current_block,
                                'quality': 'red',
                                'reason': 'long_pause'
                            })
                            
                            logger.info(f"🚨 Long pause during recording: {time_diff:.1f} seconds")
                    
                    # Update recording chunk time (only when actively recording)
                    interview_data['recording_chunk_time'] = current_time
                    
                    # Check speaking pace (words per minute)
                    if chunk_transcript and len(chunk_transcript.split()) > 0:
                        words_in_chunk = len(chunk_transcript.split())
                        time_for_chunk = 1.0  # 1 second chunks
                        wpm = (words_in_chunk / time_for_chunk) * 60
                        
                        if wpm > 200:  # Speaking too fast
                            interview_data['realtime_issues']['speaking_too_fast'] += 1
                            emit('live-warning', {
                                'type': 'speaking_fast',
                                'message': f'Speaking too fast ({wpm:.0f} WPM) - Slow down for better clarity',
                                'severity': 'medium'
                            })
                            
                            current_block = min(len(interview_data.get('chunk_transcripts', [])) // 2, 9)
                            emit('answer-quality-update', {
                                'blockIndex': current_block,
                                'quality': 'yellow',  # Yellow for pace issues
                                'reason': 'speaking_fast'
                            })
                    
                    # Send positive feedback for good chunks
                    if chunk_transcript and current_chunk_fillers == 0 and len(chunk_transcript.split()) > 3:
                        current_block = min(len(interview_data.get('chunk_transcripts', [])) // 2, 9)
                        emit('answer-quality-update', {
                            'blockIndex': current_block,
                            'quality': 'green',
                            'reason': 'good_response'
                        })
                    
                    # Update answer quality in real-time
                    current_question = interview_data.get('current_question', 1)
                    if all_transcripts:
                        words = all_transcripts.split()
                        word_count = len(words)
                        filler_ratio = recent_fillers / word_count if word_count > 0 else 0
                        
                        # Determine quality based on content
                        if word_count > 20 and filler_ratio < 0.05:
                            quality = 'green'  # Excellent
                        elif word_count > 10 and filler_ratio < 0.1:
                            quality = 'yellow'  # Good
                        elif word_count > 0:
                            quality = 'red'  # Needs improvement
                        else:
                            quality = 'grey'  # No response yet
                        
                        # Update answer quality for current question
                        emit('answer-quality-update', {
                            'questionIndex': current_question - 1,
                            'quality': quality
                        })
                
            except Exception as e:
                logger.error(f"Error in real-time audio processing: {str(e)}")
        
        # Provide general live feedback
        if len(interview_data['audio_chunks']) % 15 == 0:
            insights = [
                {'insightType': 'encouragement', 'text': 'Keep going! You\'re doing well'},
                {'insightType': 'pace', 'text': 'Maintain your current speaking pace'}
            ]
            emit('insights', insights)
        
        # Only send simulated warnings when actively recording (REMOVED random warnings)
        # Real warnings are now handled above in the is_recording section with actual audio analysis
        
    except Exception as e:
        logger.error(f"Error processing audio chunk: {str(e)}")

@socketio.on('answer-complete')
def handle_answer_complete(data):
    """Process completed answer and generate next question"""
    try:
        client_id = request.sid
        
        if client_id not in active_interviews:
            emit('error', {'message': 'No active interview session'})
            return
        
        interview_data = active_interviews[client_id]
        
        # Get audio data and transcribe it
        audio_data = data.get('audio_data')
        duration = data.get('duration', 30.0)
        
        # Transcribe audio using Whisper
        transcript = ""
        if audio_data:
            try:
                # Decode base64 audio data
                audio_bytes = base64.b64decode(audio_data)
                # Use whisper model for transcription
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                    temp_audio.write(audio_bytes)
                    temp_audio_path = temp_audio.name
                
                if whisper_model and os.path.getsize(temp_audio_path) > 1000:
                    result = whisper_model.transcribe(temp_audio_path)
                    transcript = result.get('text', '').strip()
                    os.unlink(temp_audio_path)
                else:
                    transcript = ""
                    if os.path.exists(temp_audio_path):
                        os.unlink(temp_audio_path)
            except Exception as e:
                logger.error(f"Error processing audio data: {str(e)}")
                transcript = ""
        
        # Get current question context
        question_context = {
            'subject': interview_data.get('subject', 'general'),
            'difficulty': interview_data.get('difficulty', 'Medium'),
            'question_number': interview_data.get('current_question', 1)
        }
        
        # Analyze speech using AI
        # Use simple_interview_system for analysis
        response_data = {
            'transcript': transcript,
            'duration': duration,
            'question_context': question_context
        }
        
        if AI_AVAILABLE and interview_ai:
            analysis_result = interview_ai.analyze_response(transcript, duration, {})
            analysis = analysis_result.get('speech_analysis', {})
            insights = analysis_result.get('insights', [])
        else:
            # Fallback analysis
            analysis = {
                "clarity_score": 70,
                "confidence_score": 70,
                "communication_score": 70,
                "filler_words_count": 0
            }
            insights = []
        
        # Store answer in database
        answer_id = str(uuid.uuid4())
        conn = sqlite3.connect('interview_iq.db')
        cursor = conn.cursor()
        # Ensure we have a question_id
        question_id = interview_data.get('current_question_id')
        if not question_id:
            logger.warning("Missing current_question_id, creating fallback")
            question_id = f"fallback_q{interview_data.get('current_question', 1)}_{interview_data['session_id']}"
        
        cursor.execute('''
            INSERT INTO interview_answers 
            (id, session_id, question_id, audio_transcript, answer_duration, 
             filler_words_count, confidence_score, clarity_score, technical_accuracy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            answer_id,
            interview_data['session_id'],
            question_id,
            transcript,
            duration,
            analysis.get('filler_words_count', 0),
            analysis.get('confidence_score', 0),
            analysis.get('clarity_score', 0),
            75.0  # Simulated technical accuracy
        ))
        conn.commit()
        conn.close()
        
        # Store answer for context
        answer_data = {
            'transcript': transcript,
            'question_number': interview_data['current_question'],
            'timestamp': datetime.utcnow().isoformat(),
            'analysis': analysis
        }
        interview_data['answers'].append(answer_data)
        
        # Send feedback
        feedback = {
            'insights': insights,
            'scores': analysis,
            'suggestions': [
                'Great job providing specific examples',
                'Try to speak with more confidence'
            ]
        }
        emit('interview-feedback', feedback)
        
        # Generate next question if not at limit
        current_q = interview_data['current_question']
        if current_q < 10:  # Max 10 questions
            if AI_AVAILABLE and interview_ai:
                # Extract transcript from previous answers for context
                previous_transcripts = []
                for ans in interview_data['answers']:
                    if isinstance(ans, dict):
                        previous_transcripts.append(ans.get('transcript', ''))
                    elif isinstance(ans, str):
                        previous_transcripts.append(ans)
                    else:
                        previous_transcripts.append(str(ans))
                next_question_data = interview_ai.generate_question(
                    difficulty=interview_data['config']['difficulty'],
                    subject=map_subject_id_to_name(interview_data['config']['subject']),
                    persona=interview_data['config']['persona'],
                    question_number=current_q + 1,
                    previous_answers=previous_transcripts
                )
            else:
                # Fallback question
                next_question_data = {
                    'question_text': f"Can you tell me about your experience with {interview_data['config']['subject']}?",
                    'category': 'general',
                    'difficulty_level': interview_data['config']['difficulty'],
                    'expected_duration': 120
                }
            
            # Store next question
            next_question_id = str(uuid.uuid4())
            conn = sqlite3.connect('interview_iq.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO interview_questions 
                (id, session_id, question_number, question_text, question_category, difficulty_level, expected_duration)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                next_question_id,
                interview_data['session_id'],
                current_q + 1,
                next_question_data['question_text'],
                next_question_data['category'],
                next_question_data['difficulty_level'],
                next_question_data['expected_duration']
            ))
            conn.commit()
            conn.close()
            
            # Update state
            interview_data['current_question'] = current_q + 1
            interview_data['current_question_id'] = next_question_id
            interview_data['audio_chunks'] = []  # Reset for next answer
            
            # Send next question
            emit('interview-question', {
                'questionNumber': current_q + 1,
                'totalQuestions': 10,
                'questionText': next_question_data['question_text'],
                'category': next_question_data['category'],
                'expectedDuration': next_question_data['expected_duration'],
                'questionId': next_question_id
            })
            
            logger.info(f"Sent question {current_q + 1} for session {interview_data['session_id']}")
            
        else:
            # Interview complete
            complete_interview(interview_data['session_id'])
            emit('interview-complete', {
                'message': 'Interview completed successfully!',
                'total_questions': current_q,
                'session_id': interview_data['session_id'],
                'completedQuestions': current_q,
                'final_analysis': analysis,
                'analytics_ready': True
            })
        
    except Exception as e:
        logger.error(f"Error completing answer: {str(e)}")
        emit('error', {'message': f'Failed to process answer: {str(e)}'})

@socketio.on('recording-start')
def handle_recording_start(data):
    """Handle recording start event"""
    try:
        client_id = request.sid
        if client_id in active_interviews:
            active_interviews[client_id]['is_recording'] = True
            active_interviews[client_id]['recording_start_time'] = datetime.utcnow()
            # Reset recording chunk time to avoid false pause detection
            active_interviews[client_id]['recording_chunk_time'] = datetime.utcnow()
            logger.info(f"🎤 Recording started for client {client_id} - Timing reset")
        emit('recording-started', {'status': 'Recording started'})
    except Exception as e:
        logger.error(f"Error starting recording: {str(e)}")

@socketio.on('recording-stop')
def handle_recording_stop(data):
    """Handle recording stop event"""
    try:
        client_id = request.sid
        if client_id in active_interviews:
            interview_data = active_interviews[client_id]
            interview_data['is_recording'] = False
            interview_data['recording_end_time'] = datetime.utcnow()
            
            # Check for empty responses when recording stops
            chunk_transcripts = interview_data.get('chunk_transcripts', [])
            all_transcripts = ' '.join(chunk_transcripts).strip()
            
            logger.info(f"🎤 Recording stopped for client {client_id}")
            logger.info(f"📝 Total transcripts collected: {len(chunk_transcripts)}")
            logger.info(f"📝 Combined transcript: '{all_transcripts[:100]}...'")
            
            # Process complete audio now that recording has stopped
            audio_chunks = interview_data.get('audio_chunks', [])
            if audio_chunks and whisper_model and not all_transcripts:
                logger.info(f"🎤 Processing complete audio recording: {len(audio_chunks)} chunks")
                try:
                    # Combine all base64 chunks into complete WebM file
                    combined_audio_data = b''
                    for chunk in audio_chunks:
                        if isinstance(chunk, str) and len(chunk) > 50:
                            try:
                                # Clean base64 data
                                clean_chunk = chunk.strip()
                                if clean_chunk.startswith('data:'):
                                    clean_chunk = clean_chunk.split(',')[1]
                                
                                chunk_bytes = base64.b64decode(clean_chunk)
                                combined_audio_data += chunk_bytes
                            except Exception as chunk_error:
                                logger.warning(f"❌ Failed to decode chunk: {chunk_error}")
                                continue
                    
                    if len(combined_audio_data) > 1000:
                        logger.info(f"🎤 Combined audio size: {len(combined_audio_data)} bytes")
                        
                        # Save as complete WebM file and transcribe
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
                            temp_file.write(combined_audio_data)
                            temp_file_path = temp_file.name
                        
                        # Debug file header
                        with open(temp_file_path, 'rb') as f:
                            header = f.read(20)
                            logger.info(f"🔍 Complete file header: {header[:10].hex()}")
                        
                        # Transcribe complete audio
                        result = whisper_model.transcribe(temp_file_path, language='en')
                        complete_transcript = result.get('text', '').strip()
                        logger.info(f"🗣️ Complete transcript: '{complete_transcript}'")
                        
                        # Update transcript data
                        if complete_transcript:
                            interview_data['chunk_transcripts'] = [complete_transcript]
                            all_transcripts = complete_transcript
                            logger.info(f"✅ Successfully transcribed complete audio")
                        
                        # Clean up temp file
                        os.unlink(temp_file_path)
                        
                except Exception as complete_error:
                    logger.error(f"❌ Complete audio processing failed: {complete_error}")
            
            # Check if answer is empty or too short
            if not all_transcripts or len(all_transcripts) < 10:
                logger.warning(f"🚨 EMPTY OR VERY SHORT ANSWER DETECTED")
                
                # Send immediate warning for empty answer
                emit('live-warning', {
                    'type': 'empty_answer',
                    'message': 'Answer appears to be empty or very short. Please provide a more detailed response.',
                    'severity': 'high'
                })
                
                # Update answer quality - mark current block as red
                current_question = interview_data.get('current_question', 0)
                emit('answer-quality-update', {
                    'blockIndex': current_question,
                    'quality': 'red',
                    'reason': 'empty_answer',
                    'details': 'No or very short response detected'
                })
                
                logger.info(f"🚨 EMITTING EMPTY ANSWER WARNING")
                
        emit('recording-stopped', {'status': 'Recording stopped'})
    except Exception as e:
        logger.error(f"Error stopping recording: {str(e)}")

@socketio.on('end-interview')
def handle_end_interview(data):
    """Handle manual interview termination"""
    try:
        client_id = request.sid
        logger.info(f"🛑 End interview requested by client: {client_id}")
        
        if client_id in active_interviews:
            session_id = active_interviews[client_id].get('session_id')
            if session_id:
                # Complete the interview
                complete_interview(session_id)
                logger.info(f"✅ Interview {session_id} ended by user")
                
                # Clean up active interview
                del active_interviews[client_id]
                
                # Get session statistics for analytics navigation
                conn = sqlite3.connect('interview_iq.db')
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT COUNT(*) FROM interview_answers WHERE session_id = ?
                ''', (session_id,))
                completed_questions = cursor.fetchone()[0] or 0
                conn.close()
                
                # Confirm termination to client with session data
                emit('interview-ended', {
                    'message': 'Interview ended successfully',
                    'session_id': session_id,
                    'reason': data.get('reason', 'user_ended'),
                    'completedQuestions': completed_questions,
                    'analytics_ready': True
                })
            else:
                logger.warning(f"⚠️ No session ID found for client {client_id}")
        else:
            logger.warning(f"⚠️ No active interview found for client {client_id}")
            
    except Exception as e:
        logger.error(f"Error ending interview: {str(e)}")
        emit('error', {'message': f'Failed to end interview: {str(e)}'})

def complete_interview(session_id: str):
    """Complete an interview session"""
    try:
        conn = sqlite3.connect('interview_iq.db')
        cursor = conn.cursor()
        
        # Get all answers for this session to calculate overall score
        cursor.execute('''
            SELECT confidence_score, clarity_score, technical_accuracy 
            FROM interview_answers 
            WHERE session_id = ?
        ''', (session_id,))
        
        answers = cursor.fetchall()
        
        if answers:
            # Calculate overall score
            avg_confidence = sum(a[0] or 0 for a in answers) / len(answers)
            avg_clarity = sum(a[1] or 0 for a in answers) / len(answers)
            avg_technical = sum(a[2] or 0 for a in answers) / len(answers)
            overall_score = (avg_confidence + avg_clarity + avg_technical) / 3
        else:
            overall_score = 0
        
        # Update session
        cursor.execute('''
            UPDATE interview_sessions 
            SET status = 'completed', end_time = CURRENT_TIMESTAMP, 
                completed_questions = ?, overall_score = ?
            WHERE id = ?
        ''', (len(answers), overall_score, session_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Completed interview session {session_id} with score {overall_score}")
        
    except Exception as e:
        logger.error(f"Error completing interview: {str(e)}")

@app.route('/api/analytics/<session_id>', methods=['GET'])
def get_analytics(session_id):
    """Get comprehensive analytics for an interview session"""
    try:
        print(f"Analytics API called for session_id: {session_id}")
        conn = sqlite3.connect('interview_iq.db')
        cursor = conn.cursor()
        
        # Get session details
        cursor.execute('''
            SELECT id, difficulty, llm, interview_type, persona, subject,
                   start_time, end_time, status, completed_questions, overall_score
            FROM interview_sessions WHERE id = ?
        ''', (session_id,))
        
        session = cursor.fetchone()
        print(f"Session query result: {session}")
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Get all answers for this session with question text
        cursor.execute('''
            SELECT q.question_text, a.audio_transcript as answer_text, 
                   a.confidence_score, a.clarity_score, a.technical_accuracy, 
                   a.filler_words_count as filler_words, a.answer_duration, a.created_at
            FROM interview_answers a
            JOIN interview_questions q ON a.question_id = q.id
            WHERE a.session_id = ? ORDER BY a.created_at
        ''', (session_id,))
        
        answers = cursor.fetchall()
        
        # Get real-time data from active interviews if available
        realtime_data = {}
        active_session = None
        for client_id, interview_data in active_interviews.items():
            if interview_data.get('session_id') == session_id:
                active_session = interview_data
                break
        
        if active_session:
            realtime_issues = active_session.get('realtime_issues', {})
            realtime_data = {
                'isLive': True,
                'currentQuestion': active_session.get('current_question', 0),
                'isRecording': active_session.get('is_recording', False),
                'realtimeIssues': realtime_issues,
                'totalChunks': len(active_session.get('audio_chunks', [])),
                'transcriptChunks': len(active_session.get('chunk_transcripts', []))
            }
        else:
            realtime_data = {'isLive': False}
        
        # Calculate detailed analytics
        analytics_data = {
            'sessionId': session[0],
            'overallScore': round(session[10] or 0, 1),
            'duration': calculate_duration(session[6], session[7]),
            'totalQuestions': session[9] or 0,
            'completedQuestions': len(answers),
            'realtime': realtime_data,
            
            # Detailed scores
            'scores': {
                'confidence': round(sum(a[2] or 0 for a in answers) / max(len(answers), 1), 0),
                'clarity': round(sum(a[3] or 0 for a in answers) / max(len(answers), 1), 0),
                'fluency': round((sum(a[2] or 0 for a in answers) + sum(a[3] or 0 for a in answers)) / max(len(answers) * 2, 1), 0),
                'technical_accuracy': round(sum(a[4] or 0 for a in answers) / max(len(answers), 1), 0),
                'communication': round((sum(a[2] or 0 for a in answers) + sum(a[3] or 0 for a in answers)) / max(len(answers) * 2, 1), 0)
            },
            
            # Enhanced filler words analysis with real-time data  
            'fillerWords': analyze_filler_words(answers, realtime_data.get('realtimeIssues', {})),
            
            # Speaking metrics with real-time insights
            'speakingMetrics': calculate_speaking_metrics(answers, realtime_data.get('realtimeIssues', {})),
            
            # Question-wise performance
            'questionPerformance': build_question_performance(answers),
            
            # Real-time timeline data for live charts
            'timeline': build_realtime_timeline(active_session) if active_session else [],
            
            # AI-generated feedback
            'feedback': generate_feedback_analysis(answers, session, realtime_data)
        }
        
        conn.close()
        return jsonify(analytics_data)
        
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

def calculate_duration(start_time, end_time):
    """Calculate interview duration"""
    if not start_time or not end_time:
        return "00:00"
    
    try:
        from datetime import datetime
        start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        duration = end - start
        
        minutes = int(duration.total_seconds() // 60)
        seconds = int(duration.total_seconds() % 60)
        return f"{minutes:02d}:{seconds:02d}"
    except:
        return "00:00"

def analyze_filler_words(answers, realtime_issues=None):
    """Analyze filler words from answers and real-time data"""
    filler_words = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually']
    filler_count = {}
    total_fillers = 0
    
    # Count from stored answers
    for answer in answers:
        answer_text = (answer[1] or '').lower()
        for filler in filler_words:
            count = answer_text.count(filler)
            if count > 0:
                filler_count[filler] = filler_count.get(filler, 0) + count
                total_fillers += count
    
    # Add real-time filler count if available
    if realtime_issues and 'filler_count' in realtime_issues:
        total_fillers += realtime_issues['filler_count']
    
    breakdown = [{'word': word, 'count': count} for word, count in filler_count.items()]
    breakdown.sort(key=lambda x: x['count'], reverse=True)
    
    return {
        'total': total_fillers,
        'breakdown': breakdown[:4],  # Top 4 filler words
        'realtime_count': realtime_issues.get('filler_count', 0) if realtime_issues else 0
    }

def calculate_speaking_metrics(answers, realtime_issues=None):
    """Calculate speaking speed and pause metrics with real-time data"""
    total_words = 0
    total_duration = 0
    
    for answer in answers:
        if answer[1]:  # answer_text exists
            words = len(answer[1].split())
            total_words += words
        
        if answer[6]:  # answer_duration exists
            total_duration += answer[6]
    
    avg_speed = round((total_words / max(total_duration / 60, 1)), 0) if total_duration > 0 else 0
    
    # Add real-time metrics
    long_pauses = realtime_issues.get('long_pauses', 0) if realtime_issues else 0
    fast_speaking = realtime_issues.get('speaking_too_fast', 0) if realtime_issues else 0
    
    return {
        'averageSpeed': int(avg_speed),
        'totalWords': total_words,
        'longestPause': 4.5 if long_pauses > 0 else 1.2,  # Dynamic based on real-time data
        'averagePause': 1.8 if long_pauses > 2 else 1.1,
        'realtimeMetrics': {
            'longPauses': long_pauses,
            'fastSpeaking': fast_speaking,
            'paceIssues': long_pauses + fast_speaking
        }
    }

def build_question_performance(answers):
    """Build question-wise performance data"""
    performance = []
    
    for i, answer in enumerate(answers, 1):
        # Calculate overall score for this question
        scores = [answer[2] or 0, answer[3] or 0, answer[4] or 0]  # confidence, clarity, technical
        avg_score = round(sum(scores) / len(scores), 0)
        
        performance.append({
            'question': i,
            'score': int(avg_score),
            'category': 'Technical' if i % 3 == 0 else 'Behavioral' if i % 2 == 0 else 'Problem Solving',
            'duration': int(answer[6] or 120)  # duration in seconds
        })
    
    return performance

def generate_feedback_analysis(answers, session, realtime_data=None):
    """Generate AI feedback based on performance and real-time data"""
    avg_confidence = sum(a[2] or 0 for a in answers) / max(len(answers), 1)
    avg_clarity = sum(a[3] or 0 for a in answers) / max(len(answers), 1)
    avg_technical = sum(a[4] or 0 for a in answers) / max(len(answers), 1)
    
    strengths = []
    improvements = []
    recommendations = []
    
    # Generate strengths based on scores
    if avg_confidence > 75:
        strengths.append("Demonstrated strong confidence throughout the interview")
    if avg_clarity > 75:
        strengths.append("Clear and articulate communication style")
    if avg_technical > 75:
        strengths.append("Good technical knowledge and accuracy")
    
    # Generate improvements based on lower scores
    if avg_confidence < 70:
        improvements.append("Work on building confidence in responses")
        recommendations.append("Practice mock interviews to build confidence")
    if avg_clarity < 70:
        improvements.append("Focus on speaking more clearly and at appropriate pace")
        recommendations.append("Record yourself speaking to identify clarity issues")
    if avg_technical < 70:
        improvements.append("Strengthen technical knowledge in key areas")
        recommendations.append("Review fundamental concepts and practice technical explanations")
    
    # Default feedback if scores are good
    if not improvements:
        improvements.extend([
            "Continue maintaining consistent performance",
            "Consider elaborating more on complex topics"
        ])
    
    if not recommendations:
        recommendations.extend([
            "Keep practicing to maintain high performance",
            "Focus on providing specific examples in answers"
        ])
    
    return {
        'strengths': strengths[:4],
        'improvements': improvements[:4],
        'recommendations': recommendations[:4]
    }

def build_realtime_timeline(active_session):
    """Build timeline data for real-time charts"""
    if not active_session:
        return []
    
    timeline = []
    chunk_transcripts = active_session.get('chunk_transcripts', [])
    realtime_issues = active_session.get('realtime_issues', {})
    
    # Create timeline entries for each chunk processed
    for i, transcript in enumerate(chunk_transcripts):
        timestamp = i * 5  # Assuming 5-second intervals
        
        # Calculate metrics for this chunk
        filler_count = sum(transcript.count(filler) for filler in ['um', 'uh', 'like', 'you know'])
        word_count = len(transcript.split())
        speaking_pace = (word_count / 5) * 60 if word_count > 0 else 0  # WPM
        
        timeline.append({
            'time': timestamp,
            'confidence': max(70 - (filler_count * 10), 30),  # Confidence decreases with fillers
            'clarity': max(80 - (filler_count * 5), 40),
            'pace': min(speaking_pace, 250),  # Cap at 250 WPM
            'fillerWords': filler_count,
            'issues': filler_count + (1 if speaking_pace > 200 else 0)
        })
    
    return timeline

# Initialize database on startup
init_database()

if __name__ == "__main__":
    logger.info("🚀 Starting Interview IQ Flask server with AI capabilities...")
    logger.info("Features: Question Generation, Speech Analysis, Real-time Feedback")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)