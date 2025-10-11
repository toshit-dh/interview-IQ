import os
import time
import random
from typing import Dict, List, Optional, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from groq import Groq
    groq_client = Groq() if os.getenv('GROQ_API_KEY') else None
except ImportError:
    groq_client = None
    logger.warning("Groq not available, using fallback questions")

class InterviewQuestionGenerator: 
    def __init__(self):
        self.fallback_questions = {
            "Easy": {
                "javascript": {
                    "introduction": [
                        "Tell me about your experience with JavaScript programming.",
                        "What got you interested in JavaScript development?",
                        "Can you walk me through a JavaScript project you've worked on?"
                    ],
                    "technical": [
                        "What's the difference between 'let', 'const', and 'var' in JavaScript?",
                        "How do you handle asynchronous operations in JavaScript?",
                        "What are JavaScript closures and can you give an example?",
                        "Explain the concept of hoisting in JavaScript.",
                        "What's the difference between '==' and '===' in JavaScript?"
                    ],
                    "practical": [
                        "How would you debug a JavaScript error in the browser?",
                        "What tools do you use for JavaScript development?",
                        "How do you handle form validation in JavaScript?",
                        "Explain how you would make an API call in JavaScript."
                    ]
                },
                "python": {
                    "introduction": [
                        "Tell me about your Python programming experience.",
                        "What Python projects have you worked on recently?",
                        "Why do you prefer Python for certain tasks?"
                    ],
                    "technical": [
                        "What's the difference between a list and a tuple in Python?",
                        "How do you handle exceptions in Python?",
                        "What are Python decorators and how do you use them?",
                        "Explain the concept of list comprehensions.",
                        "What's the difference between 'is' and '==' in Python?"
                    ],
                    "practical": [
                        "How would you read and process a CSV file in Python?",
                        "What Python frameworks have you used for web development?",
                        "How do you debug Python code?",
                        "Explain how you would connect to a database in Python."
                    ]
                },
                "general": {
                    "introduction": [
                        "Tell me about your programming background and experience.",
                        "What programming languages are you most comfortable with?",
                        "Can you describe a challenging problem you solved recently?"
                    ],
                    "technical": [
                        "What's the difference between frontend and backend development?",
                        "How do you approach debugging when something isn't working?",
                        "What version control systems have you used?",
                        "Explain what an API is and how it works.",
                        "What's the difference between HTTP and HTTPS?"
                    ],
                    "practical": [
                        "How do you stay updated with new technologies?",
                        "What development tools do you use regularly?",
                        "How do you test your code?",
                        "Describe your typical development workflow."
                    ]
                },
                "backend": {
                    "introduction": [
                        "Tell me about your backend development experience.",
                        "What backend technologies and frameworks have you worked with?",
                        "Can you describe a backend system you've built or contributed to?"
                    ],
                    "technical": [
                        "What's the difference between GET and POST HTTP methods?",
                        "How do you handle database connections in backend applications?",
                        "What is REST and how do you design RESTful APIs?",
                        "Explain the concept of middleware in backend frameworks.",
                        "How do you handle authentication and authorization?"
                    ],
                    "practical": [
                        "How would you structure a simple API endpoint?",
                        "What tools do you use for API testing and debugging?",
                        "How do you handle errors and exceptions in backend code?",
                        "Explain how you would implement logging in a backend service."
                    ]
                },
                "frontend": {
                    "introduction": [
                        "Tell me about your frontend development experience.",
                        "What frontend frameworks and libraries have you used?",
                        "Can you describe a user interface you've built recently?"
                    ],
                    "technical": [
                        "What's the difference between HTML, CSS, and JavaScript?",
                        "How do you make web pages responsive for different devices?",
                        "What are CSS preprocessors and why use them?",
                        "Explain the DOM and how to manipulate it.",
                        "What's the difference between client-side and server-side rendering?"
                    ],
                },
                "system_design": {
                    "introduction": [
                        "Tell me about your experience with system design.",
                        "What large-scale systems have you worked on or studied?",
                        "How do you approach designing scalable applications?"
                    ],
                    "technical": [
                        "What's the difference between horizontal and vertical scaling?",
                        "How do caching strategies improve system performance?",
                        "What are the trade-offs between SQL and NoSQL databases?",
                        "Explain the concept of load balancing.",
                        "What is eventual consistency in distributed systems?"
                    ],
                    "practical": [
                        "How would you design a simple URL shortener service?",
                        "What factors do you consider when choosing a database?",
                        "How would you handle high traffic spikes in a web application?",
                        "Explain how you would implement basic monitoring for a service."
                    ]
                },
                "dsa": {
                    "introduction": [
                        "Tell me about your experience with data structures and algorithms.",
                        "What got you interested in competitive programming or DSA?",
                        "Can you walk me through a challenging DSA problem you solved recently?"
                    ],
                    "technical": [
                        "What's the difference between an array and a linked list?",
                        "Explain how a stack data structure works with an example.",
                        "What is the time complexity of searching in a binary search tree?",
                        "How does a hash table handle collisions?",
                        "What's the difference between BFS and DFS traversal?"
                    ],
                    "practical": [
                        "How would you find the middle element of a linked list?",
                        "Implement a function to check if a string is a palindrome.",
                        "How would you detect a cycle in a linked list?",
                        "Explain how you would reverse an array in-place."
                    ]
                }
            },
            "Medium": {
                "javascript": {
                    "technical": [
                        "Explain the JavaScript event loop and how it works.",
                        "What are promises and how do they differ from callbacks?",
                        "How does prototypal inheritance work in JavaScript?",
                        "What's the difference between function declarations and expressions?",
                        "Explain how 'this' binding works in JavaScript."
                    ],
                    "problem_solving": [
                        "How would you implement a debounce function?",
                        "Design a simple JavaScript module system.",
                        "How would you optimize a slow-running JavaScript function?",
                        "Implement a basic pub-sub pattern in JavaScript."
                    ],
                    "architectural": [
                        "How would you structure a large JavaScript application?",
                        "What design patterns do you use in JavaScript development?",
                        "How do you handle state management in complex applications?",
                        "Explain your approach to error handling in JavaScript apps."
                    ]
                },
                "python": {
                    "technical": [
                        "Explain the Global Interpreter Lock (GIL) in Python.",
                        "What are generators and when would you use them?",
                        "How does Python's garbage collection work?",
                        "What's the difference between deep and shallow copying?",
                        "Explain metaclasses in Python."
                    ],
                    "problem_solving": [
                        "How would you implement a caching mechanism in Python?",
                        "Design a Python class for managing database connections.",
                        "How would you handle large file processing in Python?",
                        "Implement a retry mechanism for API calls."
                    ],
                    "architectural": [
                        "How would you design a scalable Python web application?",
                        "What design patterns do you use in Python development?",
                        "How do you handle configuration management in Python apps?",
                        "Explain your approach to testing Python applications."
                    ]
                },
                "dsa": {
                    "technical": [
                        "Explain the difference between a min-heap and max-heap.",
                        "What are the advantages of using a balanced binary search tree?",
                        "How does quicksort work and what's its average time complexity?",
                        "Explain the concept of dynamic programming with an example.",
                        "What's the difference between merge sort and heap sort?"
                    ],
                    "problem_solving": [
                        "How would you find the kth largest element in an array?",
                        "Implement an algorithm to find the longest common subsequence.",
                        "How would you detect if two strings are anagrams?",
                        "Design an algorithm to find all paths in a binary tree."
                    ],
                    "architectural": [
                        "How would you design a data structure for LRU cache?",
                        "Explain your approach to solving graph traversal problems.",
                        "How do you optimize recursive algorithms using memoization?",
                        "Design an efficient algorithm for finding shortest paths."
                    ]
                },
                "backend": {
                    "technical": [
                        "Explain the difference between synchronous and asynchronous programming.",
                        "How do you implement caching strategies in backend applications?",
                        "What are database transactions and why are they important?",
                        "How do you handle API rate limiting and throttling?",
                        "Explain the concept of microservices vs monolithic architecture."
                    ],
                    "problem_solving": [
                        "How would you design a user authentication system?",
                        "Design an API for a simple e-commerce application.",
                        "How would you handle file uploads in a backend service?",
                        "Implement a basic job queue system for background tasks."
                    ],
                    "architectural": [
                        "How would you design a scalable backend API?",
                        "What patterns do you use for error handling in APIs?",
                        "How do you ensure data consistency across multiple services?",
                        "Explain your approach to API versioning and backwards compatibility."
                    ]
                },
                "frontend": {
                    "technical": [
                        "Explain the virtual DOM and how it improves performance.",
                        "How do you manage state in complex frontend applications?",
                        "What are the differences between various CSS methodologies (BEM, CSS-in-JS)?",
                        "How do you implement responsive design across different devices?",
                        "Explain browser rendering pipeline and performance optimization."
                    ],
                    "problem_solving": [
                        "How would you implement infinite scrolling?",
                        "Design a reusable component library architecture.",
                        "How would you handle real-time data updates in a frontend app?",
                        "Implement a client-side routing solution."
                    ],
                    "architectural": [
                        "How would you structure a large-scale frontend application?",
                        "What strategies do you use for code splitting and lazy loading?",
                        "How do you handle cross-browser compatibility issues?",
                        "Explain your approach to frontend testing strategies."
                    ]
                },
                "system_design": {
                    "technical": [
                        "Explain the CAP theorem and its implications.",
                        "How do you design for fault tolerance and high availability?",
                        "What are the trade-offs between different consistency models?",
                        "How do you implement distributed caching systems?",
                        "Explain the concept of database sharding and partitioning."
                    ],
                    "problem_solving": [
                        "Design a chat application for millions of users.",
                        "How would you build a notification system?",
                        "Design a content delivery network (CDN).",
                        "How would you implement a distributed logging system?"
                    ],
                    "architectural": [
                        "How would you design a microservices architecture?",
                        "What patterns do you use for inter-service communication?",
                        "How do you handle data synchronization across services?",
                        "Explain your approach to monitoring and observability."
                    ]
                },
                "general": {
                    "technical": [
                        "Explain the principles of object-oriented programming.",
                        "What are microservices and their advantages?",
                        "How do you approach database design?",
                        "What's the difference between SQL and NoSQL databases?",
                        "Explain the concept of RESTful APIs."
                    ],
                    "problem_solving": [
                        "How would you design a scalable web application?",
                        "Describe how you would approach performance optimization.",
                        "How do you handle security in web applications?",
                        "Design a system for handling user authentication."
                    ],
                    "architectural": [
                        "What architectural patterns have you worked with?",
                        "How do you approach code organization in large projects?",
                        "Explain your strategy for handling technical debt.",
                        "How do you ensure code quality in a team environment?"
                    ]
                }
            },
            "Hard": {
                "javascript": {
                    "advanced_technical": [
                        "Explain the intricacies of JavaScript's memory management.",
                        "How would you implement a custom JavaScript framework?",
                        "Design a JavaScript engine optimization strategy.",
                        "Explain advanced concepts in functional programming with JavaScript."
                    ],
                    "system_design": [
                        "Design a real-time collaborative editing system using JavaScript.",
                        "How would you build a JavaScript-based microservice architecture?",
                        "Design a client-side routing system from scratch.",
                        "Create a JavaScript-based state management library."
                    ],
                },
                "python": {
                    "advanced_technical": [
                        "Explain Python's import system and how to optimize it.",
                        "How would you implement a custom Python decorator with arguments?",
                        "Design a Python-based distributed computing system.",
                        "Explain advanced concepts in Python asyncio."
                    ],
                    "system_design": [
                        "Design a Python-based microservices architecture.",
                        "How would you build a high-performance Python API?",
                        "Design a Python-based data processing pipeline.",
                        "Create a Python framework for machine learning workflows."
                    ],
                },
                "dsa": {
                    "advanced_technical": [
                        "Explain advanced tree algorithms like AVL or Red-Black trees.",
                        "How would you implement a suffix tree for string matching?",
                        "Design an algorithm for finding strongly connected components.",
                        "Explain advanced graph algorithms like Dijkstra's or Floyd-Warshall."
                    ],
                    "system_design": [
                        "Design a distributed hash table using consistent hashing.",
                        "How would you implement a load balancer using data structures?",
                        "Design an efficient search engine indexing system.",
                        "Create an algorithm for real-time data stream processing."
                    ],
                },
            }
        }

    def generate_question(self, difficulty: str, subject: str, persona: str, 
                         question_number: int, previous_answers: Optional[List[str]] = None,
                         performance_metrics: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        
        original_subject = subject  
        if groq_client:
            try:
                dynamic_question = self._generate_groq_question(
                    difficulty, original_subject, persona, question_number, previous_answers, performance_metrics
                )
                if dynamic_question:
                    return dynamic_question
            except Exception as e:
                logger.warning(f"Groq generation failed for {original_subject}, using fallback: {e}")
        
        
        known_subjects = ['dsa', 'backend', 'frontend', 'system_design', 'javascript', 'python']
        subject_lower = original_subject.lower()
        
        if 'data structures' in subject_lower or 'dsa' in subject_lower or 'algorithm' in subject_lower:
            fallback_subject = 'dsa'
        elif 'backend' in subject_lower or 'server' in subject_lower or 'api' in subject_lower:
            fallback_subject = 'backend'
        elif 'frontend' in subject_lower or 'ui' in subject_lower or 'react' in subject_lower:
            fallback_subject = 'frontend'
        elif 'system' in subject_lower and 'design' in subject_lower:
            fallback_subject = 'system_design'
        elif 'javascript' in subject_lower or 'js' in subject_lower:
            fallback_subject = 'javascript'
        elif 'python' in subject_lower:
            fallback_subject = 'python'
        else:
            fallback_subject = 'general'
        
        return self._get_fallback_question(difficulty, fallback_subject, question_number, previous_answers, performance_metrics)
    
    def _generate_groq_question(self, difficulty: str, subject: str, persona: str,
                               question_number: int, previous_answers: Optional[List[str]] = None,
                               performance_metrics: Optional[Dict[str, float]] = None) -> Optional[Dict[str, Any]]:
        
        context = ""
        if previous_answers:
            context = "Previous answers:\n"
            for i, answer in enumerate(previous_answers[-2:]):  
                context += f"Q{i+1}: {answer[:150]}...\n"
        
        performance_note = ""
        if performance_metrics:
            confidence = performance_metrics.get('confidence_score', 30)
            if confidence < 60:
                performance_note = "The candidate seems to need more fundamental questions."
            elif confidence > 85:
                performance_note = "The candidate is performing well, increase complexity."
        
        subject_focus = subject  
        logger.info(f"🎯 Generating dynamic question for subject: '{subject_focus}' (Question {question_number})")
        
        if question_number <= 2:
            phase = "introduction and experience"
            focus = f"Ask about their background and experience with {subject_focus}"
        elif question_number <= 5:
            phase = "core technical concepts"
            focus = f"Focus on fundamental concepts, technologies, and principles in {subject_focus}"
        elif question_number <= 7:
            phase = "practical application and problem-solving" 
            focus = f"Ask about real-world scenarios, challenges, and problem-solving in {subject_focus}"
        else:
            phase = "advanced topics and architecture"
            focus = f"Explore advanced concepts, best practices, and system design in {subject_focus}"
        
        requirements = f"""Current Phase: {phase}
- {focus}
- Make questions specific to {subject_focus} domain
- Adjust complexity based on {difficulty} level
- Build on previous responses when available
- Keep questions practical and relevant to industry needs"""

        prompt = f"""Generate a {difficulty} level {subject_focus} interview question.
        
Question number: {question_number}/10.
Refer to {context} if applicable. (Use it to build on prior answers.)
{performance_note}
Only asks such question which doesnt require code execution or mathematical calculations.Ask  theory related or interview-speicific questions.
Requirements:
{requirements}
- Build on previous answers when possible
- Keep it concise and professional

Generate ONLY the question text, nothing else."""

        try:
            system_message = f"You are a senior technical expert and interviewer specializing in {subject_focus}. You conduct professional technical interviews with deep knowledge of {subject_focus} concepts, technologies, best practices, and industry standards."
            
            response = groq_client.chat.completions.create( # pyright: ignore[reportOptionalMemberAccess]
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            question_text = response.choices[0].message.content.strip()
            if len(question_text) > 10:
                return self._format_question_response(question_text, difficulty, question_number)
        
        except Exception as e:
            logger.warning(f"Groq API call failed: {e}")
            time.sleep(1)
        
        return None
    
    def _get_fallback_question(self, difficulty: str, subject: str, question_number: int,
                              previous_answers: Optional[List[str]] = None,
                              performance_metrics: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        if question_number <= 2:
            category = "introduction"
        elif question_number <= 5:
            category = "technical"
        elif question_number <= 7:
            category = "problem_solving" if difficulty != "Easy" else "practical"
        else:
            category = "advanced_technical" if difficulty == "Hard" else "architectural"
        questions = self.fallback_questions.get(difficulty, {}).get(subject, {}).get(category, [])
        
        if not questions:
            questions = self.fallback_questions.get(difficulty, {}).get("general", {}).get("technical", [
                "Can you tell me about your experience with programming?",
                "What challenges have you faced in your development work?",
                "How do you approach learning new technologies?"
            ])
        
        question_index = (question_number - 1) % len(questions)
        question_text = questions[question_index]
        
        if performance_metrics:
            confidence = performance_metrics.get('confidence_score', 30)
            if confidence < 60 and difficulty != "Easy":
                question_text = f"Let's focus on fundamentals: {question_text}"
            elif confidence > 85 and question_number > 5:
                question_text = f"Building on your strong responses: {question_text}"
        
        return self._format_question_response(question_text, difficulty, question_number)
    
    def _format_question_response(self, question_text: str, difficulty: str, question_number: int) -> Dict[str, Any]:
        if question_number <= 2:
            category = "introduction"
            base_duration = 60
        elif question_number <= 5:
            category = "technical"
            base_duration = 90
        elif question_number <= 7:
            category = "problem_solving"
            base_duration = 120
        else:
            category = "advanced"
            base_duration = 150
        
        duration_multiplier = {"Easy": 1.0, "Medium": 1.3, "Hard": 1.6}
        expected_duration = int(base_duration * duration_multiplier.get(difficulty, 1.0))
        
        return {
            "question_text": question_text,
            "category": category,
            "difficulty_level": difficulty,
            "expected_duration": expected_duration,
            "question_type": "generated",
            "follow_up_potential": question_number < 8
        }


class SpeechAnalyzer:
    
    def __init__(self):
        self.filler_words = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically','yeah','eeh','hmm','yea']
        self.pace_thresholds = {
            'too_slow': 50,    # words per minute
            'optimal_min': 120,
            'optimal_max': 160,
            'too_fast': 200
        }
    
    def analyze_speech(self, transcript: str, duration: float, 
                      question_context: Dict[str, Any]) -> Dict[str, Any]:
        
        if not transcript or duration <= 0:
            return {
                "confidence_score": 50,
                "speaking_pace": "normal",
                "filler_words_count": 0,
                "clarity_score": 50,
                "overall_score": 50
            }
        
        words = transcript.split()
        word_count = len(words)
        
        pace_wpm = (word_count / duration) * 60 if duration > 0 else 0
        filler_count = sum(transcript.lower().count(filler) for filler in self.filler_words)
        filler_ratio = filler_count / word_count if word_count > 0 else 0
        
        if pace_wpm < self.pace_thresholds['too_slow']:
            pace_category = "too_slow"
            pace_score = max(30, 70 - (self.pace_thresholds['too_slow'] - pace_wpm) * 2)
        elif pace_wpm > self.pace_thresholds['too_fast']:
            pace_category = "too_fast"
            pace_score = max(40, 90 - (pace_wpm - self.pace_thresholds['too_fast']) * 1.5)
        elif self.pace_thresholds['optimal_min'] <= pace_wpm <= self.pace_thresholds['optimal_max']:
            pace_category = "optimal"
            pace_score = 95
        else:
            pace_category = "normal"
            pace_score = 80
        confidence_score = self._calculate_confidence_score(
            word_count, duration, filler_ratio, pace_score, transcript
        )
        clarity_score = self._calculate_clarity_score(transcript, filler_ratio, word_count)
        overall_score = (confidence_score * 0.4 + pace_score * 0.3 + clarity_score * 0.3)
        
        return {
            "confidence_score": round(confidence_score, 1),
            "speaking_pace": pace_category,
            "pace_wpm": round(pace_wpm, 1),
            "filler_words_count": filler_count,
            "filler_ratio": round(filler_ratio, 3),
            "clarity_score": round(clarity_score, 1),
            "word_count": word_count,
            "duration": duration,
            "overall_score": round(overall_score, 1),
            "analysis_details": {
                "pace_score": round(pace_score, 1),
                "has_pauses": duration > word_count * 0.8,  # Rough pause detection
                "response_length": "appropriate" if 30 <= word_count <= 200 else "needs_adjustment"
            }
        }
    
    def _calculate_confidence_score(self, word_count: int, duration: float, 
                                   filler_ratio: float, pace_score: float, transcript: str) -> float:
        
        base_score = 70
        if word_count < 10:
            base_score -= 20  # Too brief
        elif word_count > 300:
            base_score -= 10  # Too lengthy
        elif 50 <= word_count <= 150:
            base_score += 10  # Good length
        
        if filler_ratio > 0.15:
            base_score -= 25  
        elif filler_ratio < 0.05:
            base_score += 15  
        base_score += (pace_score - 70) * 0.3
        
       
        if len(transcript.split('.')) > 1:  
            base_score += 5
        
        return max(10, min(100, base_score))
    
    def _calculate_clarity_score(self, transcript: str, filler_ratio: float, word_count: int) -> float:
        
        base_score = 70
        sentences = [s.strip() for s in transcript.split('.') if s.strip()]
        avg_sentence_length = word_count / len(sentences) if sentences else word_count
        
        if 8 <= avg_sentence_length <= 20:
            base_score += 15  
        elif avg_sentence_length > 30:
            base_score -= 10  
        base_score -= filler_ratio * 50
        
        unique_words = len(set(transcript.lower().split()))
        variety_ratio = unique_words / word_count if word_count > 0 else 0
        
        if variety_ratio > 0.7:
            base_score += 10  
        elif variety_ratio < 0.4:
            base_score -= 5   
        
        return max(20, min(100, base_score))

    def generate_real_time_feedback(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
 
        feedback = []
    
        pace = analysis.get('speaking_pace', 'normal')
        if pace == 'too_slow':
            feedback.append({
                'type': 'pace',
                'level': 'warning',
                'message': 'Speaking too slowly. Try to maintain a steady pace.'
            })
        elif pace == 'too_fast':
            feedback.append({
                'type': 'pace',
                'level': 'warning', 
                'message': 'Speaking too quickly. Take your time to explain clearly.'
            })
        
        filler_count = analysis.get('filler_words_count', 0)
        if filler_count > 3:
            feedback.append({
                'type': 'fillers',
                'level': 'info',
                'message': f'Try to reduce filler words ({filler_count} detected). Pause briefly instead.'
            })
        
        confidence = analysis.get('confidence_score', 70)
        if confidence < 60:
            feedback.append({
                'type': 'confidence',
                'level': 'encouragement',
                'message': 'Take your time and speak with confidence. You\'re doing fine!'
            })
        
        return feedback


class InterviewAISystem: 
    def __init__(self):
        self.question_generator = InterviewQuestionGenerator()
        self.speech_analyzer = SpeechAnalyzer()
        logger.info("✅ Simplified AI system initialized (no CrewAI dependency)")
    
    def generate_question(self, difficulty: str, subject: str, persona: str,
                         question_number: int, previous_answers: Optional[List[str]] = None) -> Dict[str, Any]:
        return self.question_generator.generate_question(
            difficulty, subject, persona, question_number, previous_answers
        )
    
    def analyze_response(self, transcript: str, duration: float,
                        question_context: Dict[str, Any]) -> Dict[str, Any]:
        return self.speech_analyzer.analyze_speech(transcript, duration, question_context)
    
    def get_real_time_feedback(self, transcript: str, duration: float) -> List[Dict[str, str]]:
        analysis = self.speech_analyzer.analyze_speech(transcript, duration, {})
        return self.speech_analyzer.generate_real_time_feedback(analysis)

interview_ai = InterviewAISystem()