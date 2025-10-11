"""
Simplified AI functionality without CrewAI agents
Direct function-based approach to reduce API calls and latency
"""

import os
import re
import json
import logging
import random
from typing import Dict, List, Optional, Any
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

class SimpleQuestionGenerator:
    """Generate interview questions without heavy AI agent overhead"""
    
    def __init__(self):
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        self.use_ai = bool(self.groq_api_key)
        
        # Comprehensive question banks organized by subject and difficulty
        self.question_banks = {
            "frontend": {
                "Easy": {
                    "introduction": [
                        "Tell me about your experience with HTML, CSS, and JavaScript.",
                        "What got you interested in frontend development?",
                        "Which frontend frameworks or libraries have you worked with?",
                        "How do you stay updated with frontend technologies?"
                    ],
                    "technical": [
                        "What's the difference between HTML and HTML5?",
                        "How do you make a website responsive?",
                        "Explain the box model in CSS.",
                        "What are CSS selectors and how do they work?",
                        "How do you include JavaScript in an HTML page?",
                        "What's the difference between margin and padding?",
                        "How do you center a div horizontally and vertically?"
                    ],
                    "practical": [
                        "How would you optimize a website's loading speed?",
                        "What tools do you use for frontend development?",
                        "How do you debug CSS issues?",
                        "Explain semantic HTML and why it's important."
                    ]
                },
                "Medium": {
                    "technical": [
                        "Explain event delegation in JavaScript.",
                        "What's the difference between var, let, and const?",
                        "How does the CSS flexbox layout work?",
                        "What are promises in JavaScript and how do you use them?",
                        "Explain the concept of closures in JavaScript.",
                        "What's the difference between == and === in JavaScript?",
                        "How do you handle asynchronous operations in JavaScript?"
                    ],
                    "framework": [
                        "Explain the component lifecycle in React.",
                        "What's the difference between state and props in React?",
                        "How do you manage state in a React application?",
                        "What are React hooks and how do they work?",
                        "Explain virtual DOM in React."
                    ],
                    "problem_solving": [
                        "How would you implement infinite scrolling?",
                        "Design a simple autocomplete feature.",
                        "How would you handle form validation in a large application?",
                        "Explain how you'd optimize rendering performance."
                    ]
                },
                "Hard": {
                    "advanced": [
                        "Explain micro-frontends architecture and its benefits.",
                        "How would you implement server-side rendering?",
                        "Design a scalable frontend state management solution.",
                        "Explain progressive web apps and service workers.",
                        "How would you handle real-time data updates in a React app?"
                    ],
                    "system_design": [
                        "Design the frontend architecture for a large e-commerce site.",
                        "How would you implement a real-time collaborative editor?",
                        "Design a component library for multiple applications.",
                        "Explain how you'd handle internationalization in a large app."
                    ]
                }
            },
            "backend": {
                "Easy": {
                    "introduction": [
                        "What interests you about backend development?",
                        "Which programming languages have you used for backend work?",
                        "Tell me about a backend project you've worked on.",
                        "What databases have you worked with?"
                    ],
                    "technical": [
                        "What is an API and how does it work?",
                        "Explain the difference between GET and POST requests.",
                        "What is a database and why do we need them?",
                        "What's the difference between SQL and NoSQL databases?",
                        "How do servers handle multiple requests?",
                        "What is REST and what are RESTful APIs?"
                    ],
                    "practical": [
                        "How do you handle errors in API responses?",
                        "What tools do you use for backend development?",
                        "How do you test backend APIs?",
                        "Explain basic authentication methods."
                    ]
                },
                "Medium": {
                    "technical": [
                        "Explain database indexing and its importance.",
                        "What are database transactions and ACID properties?",
                        "How do you handle authentication and authorization?",
                        "Explain caching strategies in backend systems.",
                        "What's the difference between synchronous and asynchronous processing?",
                        "How do you design a RESTful API?",
                        "Explain middleware in web frameworks."
                    ],
                    "database": [
                        "How would you optimize a slow database query?",
                        "Explain database normalization.",
                        "What are database migrations?",
                        "How do you handle database connections in production?"
                    ],
                    "problem_solving": [
                        "How would you implement pagination for large datasets?",
                        "Design an API rate limiting system.",
                        "How would you handle file uploads in a web application?",
                        "Explain how you'd implement background job processing."
                    ]
                },
                "Hard": {
                    "advanced": [
                        "Design a microservices architecture for a large application.",
                        "How would you implement distributed transactions?",
                        "Explain event-driven architecture and its benefits.",
                        "How would you handle data consistency in a distributed system?",
                        "Design a scalable notification system."
                    ],
                    "system_design": [
                        "Design the backend for a chat application with millions of users.",
                        "How would you build a real-time analytics system?",
                        "Design a content delivery network (CDN).",
                        "Explain how you'd implement a distributed cache."
                    ]
                }
            },
            "fullstack": {
                "Easy": {
                    "introduction": [
                        "What does full-stack development mean to you?",
                        "Which technologies do you prefer for frontend and backend?",
                        "Tell me about a full-stack project you've built.",
                        "How do you decide between different technology stacks?"
                    ],
                    "technical": [
                        "How do frontend and backend communicate?",
                        "What is the difference between client-side and server-side rendering?",
                        "Explain the role of a database in a web application.",
                        "What are the main components of a web application?"
                    ]
                },
                "Medium": {
                    "integration": [
                        "How do you handle state management across frontend and backend?",
                        "Explain how you'd implement real-time features in a web app.",
                        "How do you handle authentication in a full-stack application?",
                        "What's your approach to API design and integration?"
                    ],
                    "deployment": [
                        "How do you deploy a full-stack application?",
                        "Explain CI/CD pipelines for web applications.",
                        "How do you handle environment variables and configurations?",
                        "What's your approach to monitoring and logging?"
                    ]
                },
                "Hard": {
                    "architecture": [
                        "Design the complete architecture for a social media platform.",
                        "How would you build a scalable e-commerce system?",
                        "Explain your approach to building a real-time collaborative tool.",
                        "Design a multi-tenant SaaS application architecture."
                    ]
                }
            },
            "general": {
                "Easy": {
                    "introduction": [
                        "Tell me about yourself and your programming background.",
                        "What programming languages are you most comfortable with?",
                        "What type of projects do you enjoy working on?",
                        "How do you approach learning new technologies?"
                    ],
                    "basic": [
                        "What is object-oriented programming?",
                        "Explain the difference between a compiler and an interpreter.",
                        "What is version control and why is it important?",
                        "What are the basic principles of good code?"
                    ]
                },
                "Medium": {
                    "concepts": [
                        "Explain the difference between stack and heap memory.",
                        "What are design patterns in software development?",
                        "How do you handle errors and exceptions in your code?",
                        "Explain the concept of algorithmic complexity."
                    ]
                },
                "Hard": {
                    "advanced": [
                        "Explain different software architecture patterns.",
                        "How do you design scalable systems?",
                        "What are your thoughts on code review and best practices?",
                        "How do you approach system optimization?"
                    ]
                }
            }
        }
        
        # Follow-up question templates
        self.follow_up_templates = [
            "Can you elaborate on {topic}?",
            "What challenges did you face with {topic}?",
            "How would you improve your approach to {topic}?",
            "What alternatives to {topic} have you considered?",
            "Can you give me a specific example of {topic}?",
            "How does {topic} compare to similar concepts?",
            "What best practices do you follow for {topic}?"
        ]
    
    def generate_question(self, difficulty: str = "Medium", subject: str = "general", 
                         persona: str = "professional_man", question_number: int = 1,
                         previous_answers: Optional[List[Dict]] = None,
                         performance_metrics: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """Generate contextual interview question"""
        
        # Map subject if it's an ID
        subject_mapped = self._map_subject(subject)
        
        # For first few questions, use introduction
        if question_number <= 2:
            return self._generate_introduction_question(difficulty, subject_mapped, question_number)
        
        # For later questions, check if we should generate follow-up based on previous answers
        if previous_answers and len(previous_answers) > 0 and self.use_ai and question_number <= 6:
            follow_up = self._generate_smart_followup(
                difficulty, subject_mapped, previous_answers[-1], question_number
            )
            if follow_up:
                return follow_up
        
        # Generate regular question from bank
        return self._generate_from_bank(difficulty, subject_mapped, question_number, performance_metrics)
    
    def _map_subject(self, subject: str) -> str:
        """Map subject IDs to readable names"""
        subject_mapping = {
            "68dff7fde3d8324855820682": "frontend",
            "frontend": "frontend",
            "backend": "backend",
            "fullstack": "fullstack",
            "full-stack": "fullstack",
            "javascript": "frontend",
            "react": "frontend",
            "node": "backend",
            "python": "backend",
            "java": "backend",
            "general": "general"
        }
        return subject_mapping.get(subject.lower(), "general")
    
    def _generate_introduction_question(self, difficulty: str, subject: str, question_number: int) -> Dict[str, Any]:
        """Generate introduction questions"""
        
        questions = self.question_banks.get(subject, {}).get(difficulty, {}).get("introduction", [])
        if not questions:
            questions = self.question_banks.get(subject, {}).get("Easy", {}).get("introduction", [])
        if not questions:
            questions = self.question_banks["general"]["Easy"]["introduction"]
        
        question_text = random.choice(questions)
        
        return {
            "question_text": question_text,
            "category": "introduction",
            "difficulty_level": difficulty,
            "expected_duration": 90,
            "persona_tone": "professional",
            "question_type": "introduction",
            "follow_up_potential": True
        }
    
    def _generate_smart_followup(self, difficulty: str, subject: str, 
                                previous_answer: Dict, question_number: int) -> Optional[Dict[str, Any]]:
        """Generate intelligent follow-up questions using minimal AI"""
        
        if not self.use_ai:
            return None
            
        try:
            # Extract key topics from previous answer
            prev_text = previous_answer.get('transcript', '') if isinstance(previous_answer, dict) else str(previous_answer)
            
            if len(prev_text.strip()) < 20:  # Too short to analyze
                return None
            
            # Simple keyword extraction for follow-up
            keywords = self._extract_technical_keywords(prev_text, subject)
            
            if keywords:
                topic = random.choice(keywords)
                follow_up_template = random.choice(self.follow_up_templates)
                question_text = follow_up_template.format(topic=topic)
                
                return {
                    "question_text": question_text,
                    "category": "follow_up",
                    "difficulty_level": difficulty,
                    "expected_duration": 120,
                    "persona_tone": "professional",
                    "question_type": "follow_up",
                    "follow_up_potential": True
                }
        except Exception as e:
            logger.warning(f"Follow-up generation failed: {e}")
            
        return None
    
    def _extract_technical_keywords(self, text: str, subject: str) -> List[str]:
        """Extract technical keywords from text"""
        
        keywords_by_subject = {
            "frontend": ["React", "JavaScript", "CSS", "HTML", "component", "state", "props", "DOM", "responsive", "framework"],
            "backend": ["API", "database", "server", "authentication", "REST", "SQL", "NoSQL", "microservices", "caching"],
            "fullstack": ["frontend", "backend", "API", "database", "deployment", "architecture", "scalability"],
            "general": ["algorithm", "data structure", "performance", "optimization", "design pattern", "testing"]
        }
        
        subject_keywords = keywords_by_subject.get(subject, keywords_by_subject["general"])
        
        found_keywords = []
        text_lower = text.lower()
        
        for keyword in subject_keywords:
            if keyword.lower() in text_lower:
                found_keywords.append(keyword)
        
        return found_keywords[:3]  # Return top 3 relevant keywords
    
    def _generate_from_bank(self, difficulty: str, subject: str, question_number: int,
                           performance_metrics: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """Generate question from static bank with smart selection"""
        
        subject_bank = self.question_banks.get(subject, self.question_banks["general"])
        
        # Adjust difficulty based on performance
        actual_difficulty = difficulty
        if performance_metrics:
            confidence = performance_metrics.get('confidence_score', 70)
            if confidence < 50 and difficulty != "Easy":
                actual_difficulty = "Easy"
            elif confidence > 85 and difficulty == "Easy":
                actual_difficulty = "Medium"
        
        # Select appropriate category based on question number
        if question_number <= 3:
            categories = ["introduction", "technical", "basic"]
        elif question_number <= 6:
            categories = ["technical", "framework", "concepts", "database"]
        elif question_number <= 8:
            categories = ["problem_solving", "practical", "integration"]
        else:
            categories = ["advanced", "system_design", "architecture"]
        
        # Find available questions
        difficulty_bank = subject_bank.get(actual_difficulty, subject_bank.get("Easy", {}))
        
        available_questions = []
        for category in categories:
            if category in difficulty_bank:
                available_questions.extend(difficulty_bank[category])
        
        if not available_questions:
            # Fallback to any available questions
            for cat_questions in difficulty_bank.values():
                available_questions.extend(cat_questions)
        
        if not available_questions:
            available_questions = ["Tell me about your experience with programming."]
        
        question_text = random.choice(available_questions)
        
        # Determine category
        category = "technical"
        if question_number <= 2:
            category = "introduction"
        elif question_number > 7:
            category = "advanced"
        
        return {
            "question_text": question_text,
            "category": category,
            "difficulty_level": actual_difficulty,
            "expected_duration": 90 + (question_number * 10),  # Longer for later questions
            "persona_tone": "professional",
            "question_type": "bank_selected",
            "follow_up_potential": True
        }


class SimpleSpeechAnalyzer:
    """Analyze speech without heavy AI processing"""
    
    def __init__(self):
        self.filler_words = [
            'um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 
            'basically', 'literally', 'right', 'okay', 'yeah'
        ]
        
        self.positive_indicators = [
            'confident', 'experienced', 'skilled', 'proficient', 'successful',
            'efficiently', 'effectively', 'optimized', 'improved', 'solved'
        ]
        
        self.weak_indicators = [
            'maybe', 'perhaps', 'i think', 'probably', 'not sure', 
            'difficult', 'challenging', 'struggle', 'hard to'
        ]
    
    def analyze_transcript(self, transcript: str, duration: float, 
                          question_context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze speech quality without AI agents"""
        
        if not transcript or duration <= 0:
            return self._default_analysis()
        
        words = transcript.lower().split()
        word_count = len(words)
        
        if word_count == 0:
            return self._default_analysis()
        
        # Calculate speaking rate
        speaking_rate = word_count / (duration / 60)  # words per minute
        
        # Count filler words
        filler_count = sum(transcript.lower().count(filler) for filler in self.filler_words)
        filler_ratio = filler_count / word_count
        
        # Analyze confidence indicators
        positive_count = sum(transcript.lower().count(indicator) for indicator in self.positive_indicators)
        weak_count = sum(transcript.lower().count(indicator) for indicator in self.weak_indicators)
        
        # Calculate scores
        clarity_score = max(20, 100 - (filler_ratio * 200))  # Penalize filler words
        confidence_score = max(30, 70 + (positive_count * 10) - (weak_count * 15))
        
        # Speaking pace analysis
        if speaking_rate < 100:
            pace_score = 60
            pace_feedback = "Speaking too slowly"
        elif speaking_rate > 200:
            pace_score = 70
            pace_feedback = "Speaking too fast"
        else:
            pace_score = 90
            pace_feedback = "Good speaking pace"
        
        # Overall communication score
        communication_score = (clarity_score + confidence_score + pace_score) / 3
        
        return {
            "clarity_score": min(100, clarity_score),
            "confidence_score": min(100, confidence_score),
            "communication_score": min(100, communication_score),
            "speaking_rate": speaking_rate,
            "filler_words_count": filler_count,
            "filler_words_details": {"ratio": filler_ratio, "total": filler_count},
            "word_count": word_count,
            "duration": duration,
            "pace_feedback": pace_feedback,
            "analysis_type": "rule_based"
        }
    
    def _default_analysis(self) -> Dict[str, Any]:
        """Return default analysis for empty/invalid input"""
        return {
            "clarity_score": 50,
            "confidence_score": 50,
            "communication_score": 50,
            "speaking_rate": 0,
            "filler_words_count": 0,
            "filler_words_details": {"ratio": 0, "total": 0},
            "word_count": 0,
            "duration": 0,
            "pace_feedback": "No speech detected",
            "analysis_type": "default"
        }
    
    def generate_insights(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate actionable insights based on analysis"""
        
        insights = []
        
        # Clarity insights
        clarity_score = analysis.get('clarity_score', 50)
        if clarity_score < 60:
            insights.append({
                'insightType': 'clarity',
                'text': 'Try to speak more clearly and reduce hesitation.'
            })
        elif clarity_score > 80:
            insights.append({
                'insightType': 'clarity',
                'text': 'Excellent clarity in your speech!'
            })
        
        # Filler words insights
        filler_count = analysis.get('filler_words_count', 0)
        if filler_count > 3:
            insights.append({
                'insightType': 'fillerWords',
                'text': f'Try to reduce filler words (detected {filler_count}). Pause briefly instead of using "um" or "uh".'
            })
        elif filler_count <= 1:
            insights.append({
                'insightType': 'fillerWords',
                'text': 'Great job minimizing filler words!'
            })
        
        # Speaking pace insights
        speaking_rate = analysis.get('speaking_rate', 0)
        if speaking_rate < 100:
            insights.append({
                'insightType': 'pace',
                'text': 'Try to speak a bit faster to maintain engagement.'
            })
        elif speaking_rate > 200:
            insights.append({
                'insightType': 'pace',
                'text': 'Consider slowing down slightly for better clarity.'
            })
        else:
            insights.append({
                'insightType': 'pace',
                'text': 'Perfect speaking pace!'
            })
        
        # Confidence insights
        confidence_score = analysis.get('confidence_score', 50)
        if confidence_score < 60:
            insights.append({
                'insightType': 'confidence',
                'text': 'Try to sound more confident in your responses.'
            })
        elif confidence_score > 80:
            insights.append({
                'insightType': 'confidence',
                'text': 'Great confidence in your delivery!'
            })
        
        return insights


class SimpleTechnicalEvaluator:
    """Evaluate technical content without AI agents"""
    
    def __init__(self):
        # Technical keywords by subject
        self.technical_keywords = {
            "frontend": {
                "basic": ["html", "css", "javascript", "dom", "responsive", "bootstrap"],
                "intermediate": ["react", "vue", "angular", "component", "state", "props", "hooks"],
                "advanced": ["webpack", "redux", "ssr", "pwa", "optimization", "accessibility"]
            },
            "backend": {
                "basic": ["api", "rest", "database", "sql", "server", "http"],
                "intermediate": ["authentication", "authorization", "middleware", "orm", "caching"],
                "advanced": ["microservices", "scalability", "distributed", "performance", "security"]
            },
            "general": {
                "basic": ["algorithm", "function", "variable", "loop", "condition"],
                "intermediate": ["class", "object", "inheritance", "polymorphism", "abstraction"],
                "advanced": ["design pattern", "architecture", "optimization", "complexity"]
            }
        }
    
    def evaluate_answer(self, transcript: str, question_context: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate technical accuracy without AI"""
        
        if not transcript:
            return self._default_evaluation()
        
        subject = question_context.get('subject', 'general')
        difficulty = question_context.get('difficulty', 'Medium')
        
        # Get relevant keywords
        subject_keywords = self.technical_keywords.get(subject, self.technical_keywords["general"])
        
        # Count technical terms mentioned
        transcript_lower = transcript.lower()
        
        basic_count = sum(1 for keyword in subject_keywords["basic"] if keyword in transcript_lower)
        intermediate_count = sum(1 for keyword in subject_keywords["intermediate"] if keyword in transcript_lower)
        advanced_count = sum(1 for keyword in subject_keywords["advanced"] if keyword in transcript_lower)
        
        # Calculate technical depth score
        total_technical_terms = basic_count + intermediate_count + advanced_count
        
        if difficulty == "Easy":
            expected_terms = 2
            technical_score = min(100, (basic_count * 20) + (intermediate_count * 15) + (advanced_count * 10))
        elif difficulty == "Medium":
            expected_terms = 4
            technical_score = min(100, (basic_count * 15) + (intermediate_count * 25) + (advanced_count * 20))
        else:  # Hard
            expected_terms = 6
            technical_score = min(100, (basic_count * 10) + (intermediate_count * 20) + (advanced_count * 30))
        
        # Adjust score based on answer length and structure
        word_count = len(transcript.split())
        if word_count < 20:
            technical_score *= 0.7  # Penalize very short answers
        elif word_count > 100:
            technical_score *= 1.1  # Reward detailed answers
        
        # Calculate completeness
        completeness_score = min(100, (total_technical_terms / expected_terms) * 100)
        
        # Overall technical accuracy
        accuracy_score = (technical_score + completeness_score) / 2
        
        return {
            "technical_accuracy": min(100, accuracy_score),
            "completeness": min(100, completeness_score),
            "technical_depth": min(100, technical_score),
            "technical_terms_used": total_technical_terms,
            "expected_terms": expected_terms,
            "word_count": word_count,
            "evaluation_type": "keyword_based"
        }
    
    def _default_evaluation(self) -> Dict[str, Any]:
        """Default evaluation for empty answers"""
        return {
            "technical_accuracy": 0,
            "completeness": 0,
            "technical_depth": 0,
            "technical_terms_used": 0,
            "expected_terms": 0,
            "word_count": 0,
            "evaluation_type": "default"
        }


# Main interview system without heavy AI agents
class SimpleInterviewSystem:
    """Complete interview system without CrewAI agents"""
    
    def __init__(self):
        self.question_generator = SimpleQuestionGenerator()
        self.speech_analyzer = SimpleSpeechAnalyzer()
        self.technical_evaluator = SimpleTechnicalEvaluator()
        
        logger.info("✅ Simple Interview System initialized (no agents)")
    
    def generate_question(self, **kwargs) -> Dict[str, Any]:
        """Generate next interview question"""
        return self.question_generator.generate_question(**kwargs)
    
    def analyze_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze candidate response comprehensively"""
        
        transcript = response_data.get('transcript', '')
        duration = response_data.get('duration', 0)
        question_context = response_data.get('question_context', {})
        
        # Speech analysis
        speech_analysis = self.speech_analyzer.analyze_transcript(transcript, duration, question_context)
        
        # Technical evaluation
        technical_analysis = self.technical_evaluator.evaluate_answer(transcript, question_context)
        
        # Combine analyses
        overall_score = (
            speech_analysis.get('communication_score', 50) * 0.4 +
            technical_analysis.get('technical_accuracy', 50) * 0.6
        )
        
        # Generate insights
        insights = self.speech_analyzer.generate_insights(speech_analysis)
        
        return {
            "overall_score": min(100, overall_score),
            "speech_analysis": speech_analysis,
            "technical_analysis": technical_analysis,
            "insights": insights,
            "analysis_method": "simple_rules",
            "processing_time": "< 100ms"
        }


# Initialize the simple system
simple_interview_system = SimpleInterviewSystem()

# Export functions for compatibility with existing code
def generate_question(**kwargs) -> Dict[str, Any]:
    """Generate question using simple system"""
    return simple_interview_system.generate_question(**kwargs)

def analyze_response(response_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze response using simple system"""
    return simple_interview_system.analyze_response(response_data)

# For backward compatibility
question_generator = simple_interview_system.question_generator
speech_analyzer = simple_interview_system.speech_analyzer
technical_evaluator = simple_interview_system.technical_evaluator