"""
AI Agents for Interview IQ System
Using CrewAI for advanced interview management and evaluation
"""

import os
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime

from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from groq import Groq


# Initialize Groq (if API key is available)
groq_client = Groq(api_key=os.getenv('GROQ_API_KEY', ''))
GROQ_MODEL = "llama-3.1-8b-instant"  # Current supported Groq model

def call_groq_api(prompt: str, system_message: str = None, max_retries: int = 3) -> str:
    """Direct call to Groq API with rate limiting and retry logic"""
    import time
    
    for attempt in range(max_retries):
        try:
            messages = []
            if system_message:
                messages.append({"role": "system", "content": system_message})
            messages.append({"role": "user", "content": prompt})
            
            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            error_str = str(e)
            print(f"Groq API error (attempt {attempt + 1}/{max_retries}): {error_str}")
            
            # Check if it's a rate limit error
            if "rate_limit_exceeded" in error_str or "429" in error_str:
                if attempt < max_retries - 1:  # Don't wait on last attempt
                    # Extract wait time from error message or use exponential backoff
                    wait_time = 2 ** attempt  # 1s, 2s, 4s...
                    if "try again in" in error_str:
                        try:
                            # Extract seconds from error message
                            import re
                            match = re.search(r'try again in (\d+\.?\d*)s', error_str)
                            if match:
                                wait_time = float(match.group(1)) + 1  # Add 1 second buffer
                        except:
                            pass
                    
                    print(f"Rate limited. Waiting {wait_time} seconds before retry...")
                    time.sleep(wait_time)
                    continue
            
            # For non-rate-limit errors, don't retry
            if attempt == 0:
                break
                
    return ""

class AdvancedSpeechAnalysisTool(BaseTool):
    """Advanced speech analysis with detailed metrics"""
    name: str = "advanced_speech_analysis"
    description: str = "Perform comprehensive speech analysis including filler words, pace, confidence, and communication quality"
    
    def _run(self, transcript: str, audio_duration: float, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Comprehensive speech analysis
        """
        if not transcript or audio_duration <= 0:
            return {"error": "Invalid input parameters"}
        
        # Basic metrics
        words = transcript.split()
        word_count = len(words)
        sentences = re.split(r'[.!?]+', transcript)
        sentence_count = len([s for s in sentences if s.strip()])
        
        # Filler words analysis
        filler_words = [
            'um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally',
            'so', 'well', 'right', 'okay', 'yeah', 'kind of', 'sort of'
        ]
        filler_count = 0
        filler_details = {}
        
        for filler in filler_words:
            count = transcript.lower().count(filler)
            if count > 0:
                filler_details[filler] = count
                filler_count += count
        
        # Speaking rate (words per minute)
        speaking_rate = (word_count / audio_duration) * 60 if audio_duration > 0 else 0
        
        # Pause analysis (simplified)
        pause_indicators = transcript.count('...') + transcript.count(',') * 0.5
        long_pauses = transcript.count('...')
        
        # Confidence indicators
        confidence_phrases = ['i think', 'maybe', 'probably', 'i guess', 'i suppose']
        uncertainty_count = sum(transcript.lower().count(phrase) for phrase in confidence_phrases)
        
        # Positive confidence indicators
        strong_phrases = ['i believe', 'i am confident', 'definitely', 'certainly', 'absolutely']
        confidence_boost = sum(transcript.lower().count(phrase) for phrase in strong_phrases)
        
        # Calculate scores (0-100)
        # Confidence score
        base_confidence = 80
        confidence_penalty = min(30, filler_count * 3 + uncertainty_count * 2)
        confidence_bonus = min(20, confidence_boost * 5)
        confidence_score = max(0, min(100, base_confidence - confidence_penalty + confidence_bonus))
        
        # Clarity score (based on structure and coherence)
        avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
        clarity_base = 75
        
        # Penalize very short or very long sentences
        if avg_words_per_sentence < 5:
            clarity_penalty = 10
        elif avg_words_per_sentence > 25:
            clarity_penalty = 15
        else:
            clarity_penalty = 0
            
        clarity_score = max(0, min(100, clarity_base - (filler_count * 2) - clarity_penalty))
        
        # Fluency score (based on speaking rate and pauses)
        optimal_rate = 150  # words per minute
        rate_deviation = abs(speaking_rate - optimal_rate)
        fluency_base = 80
        rate_penalty = min(30, rate_deviation * 0.2)
        pause_penalty = min(20, long_pauses * 5)
        fluency_score = max(0, min(100, fluency_base - rate_penalty - pause_penalty))
        
        # Overall communication score
        overall_score = (confidence_score + clarity_score + fluency_score) / 3
        
        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "speaking_rate": round(speaking_rate, 1),
            "avg_words_per_sentence": round(avg_words_per_sentence, 1),
            "filler_words_count": filler_count,
            "filler_words_details": filler_details,
            "pause_count": pause_indicators,
            "long_pauses": long_pauses,
            "uncertainty_indicators": uncertainty_count,
            "confidence_indicators": confidence_boost,
            "confidence_score": round(confidence_score, 1),
            "clarity_score": round(clarity_score, 1),
            "fluency_score": round(fluency_score, 1),
            "overall_communication_score": round(overall_score, 1),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }

class ContextualQuestionGeneratorTool(BaseTool):
    """Generate contextual interview questions with follow-up capabilities"""
    name: str = "contextual_question_generator"
    description: str = "Generate interview questions based on context, previous answers, and adaptive difficulty"
    
    def _run(self, 
             difficulty: str, 
             subject: str, 
             persona: str, 
             question_number: int, 
             previous_answers: Optional[List[str]] = None,
             performance_metrics: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """
        Generate contextual questions with adaptive difficulty using Groq AI
        """
        
        # Handle None values by converting to empty structures
        if previous_answers is None:
            previous_answers = []
        if performance_metrics is None:
            performance_metrics = {}
        
        # Try to generate dynamic question using Groq first
        if os.getenv('GROQ_API_KEY'):
            try:
                dynamic_question = self._generate_groq_question(
                    difficulty, subject, persona, question_number, previous_answers, performance_metrics
                )
                if dynamic_question:
                    return dynamic_question
            except Exception as e:
                print(f"Groq question generation failed, falling back to static bank: {e}")
        
        # Fallback to static question bank if Groq fails
        
        # Advanced question database
        question_bank = {
            "Easy": {
                "frontend": {
                    "introduction": [
                        "Tell me about your experience with HTML and CSS.",
                        "What got you interested in frontend development?",
                        "Which frontend frameworks have you worked with?"
                    ],
                    "technical": [
                        "What is the difference between HTML and HTML5?",
                        "How do you make a website responsive?",
                        "Explain what the DOM is in simple terms.",
                        "What are CSS selectors and how do they work?",
                        "How do you include JavaScript in an HTML page?"
                    ],
                    "practical": [
                        "How would you center a div horizontally and vertically?",
                        "What's the difference between margin and padding?",
                        "How do you debug CSS issues?",
                        "What tools do you use for frontend development?"
                    ]
                },
                "backend": {
                    "introduction": [
                        "What interests you about backend development?",
                        "Which programming languages have you used for backend work?",
                        "Tell me about a backend project you've worked on."
                    ],
                    "technical": [
                        "What is an API and how does it work?",
                        "Explain the difference between GET and POST requests.",
                        "What is a database and why do we need them?",
                        "What is the difference between frontend and backend?",
                        "How do servers handle multiple requests?"
                    ],
                    "practical": [
                        "How would you store user passwords securely?",
                        "What is JSON and where is it used?",
                        "How do you handle errors in your backend code?",
                        "What databases have you worked with?"
                    ]
                }
            },
            "Medium": {
                "frontend": {
                    "technical": [
                        "Explain how JavaScript closures work with an example.",
                        "What is the virtual DOM and how does it improve performance?",
                        "How do you handle state management in React applications?",
                        "What are the differences between let, const, and var?",
                        "How does CSS specificity work?"
                    ],
                    "problem_solving": [
                        "How would you optimize a slow-loading webpage?",
                        "Describe how you would implement a search feature.",
                        "How do you ensure your website works across different browsers?",
                        "What's your approach to making websites accessible?"
                    ],
                    "architectural": [
                        "How do you structure a large React application?",
                        "What build tools do you use and why?",
                        "How do you manage dependencies in your projects?",
                        "Explain your CSS organization strategy."
                    ]
                },
                "backend": {
                    "technical": [
                        "Explain RESTful API design principles.",
                        "What is database normalization and why is it important?",
                        "How do you handle authentication and authorization?",
                        "What are microservices and their benefits?",
                        "How do you ensure data consistency in distributed systems?"
                    ],
                    "problem_solving": [
                        "How would you design a URL shortening service?",
                        "How do you handle high traffic loads?",
                        "What's your approach to API versioning?",
                        "How do you monitor and log application performance?"
                    ],
                    "architectural": [
                        "How do you design scalable database schemas?",
                        "What caching strategies have you implemented?",
                        "How do you handle database migrations?",
                        "Explain your testing strategy for backend services."
                    ]
                }
            },
            "Hard": {
                "frontend": {
                    "advanced_technical": [
                        "Explain the JavaScript event loop and how it handles asynchronous operations.",
                        "How would you implement server-side rendering with React?",
                        "Design a component library that can be used across multiple projects.",
                        "How do you optimize bundle size and loading performance?",
                        "Explain browser rendering pipeline and how to optimize it."
                    ],
                    "system_design": [
                        "Design a real-time chat application frontend.",
                        "How would you build a frontend for a collaborative editing tool?",
                        "Design a micro-frontend architecture for a large organization.",
                        "How would you implement offline-first functionality?"
                    ],
                    "leadership": [
                        "How do you establish frontend development standards in a team?",
                        "Describe a time when you had to refactor a large codebase.",
                        "How do you mentor junior frontend developers?",
                        "What's your approach to technical decision making?"
                    ]
                },
                "backend": {
                    "advanced_technical": [
                        "Design a distributed caching system.",
                        "How would you implement eventual consistency in a microservices architecture?",
                        "Explain different database sharding strategies.",
                        "How do you handle race conditions in concurrent systems?",
                        "Design a message queue system for high throughput."
                    ],
                    "system_design": [
                        "Design a system to handle millions of concurrent users.",
                        "How would you architect a global content delivery system?",
                        "Design a payment processing system with high reliability.",
                        "How would you build a real-time analytics platform?"
                    ],
                    "leadership": [
                        "How do you balance technical debt with feature development?",
                        "Describe your approach to system architecture decisions.",
                        "How do you ensure system reliability and uptime?",
                        "What's your strategy for scaling engineering teams?"
                    ]
                }
            }
        }
        
        # Determine question category based on progress
        if question_number <= 2:
            category = "introduction"
        elif question_number <= 6:
            category = "technical"
        elif question_number <= 8:
            category = "problem_solving" if difficulty != "Easy" else "practical"
        else:
            category = "leadership" if difficulty == "Hard" else "architectural" if difficulty == "Medium" else "practical"
        
        # Get subject questions
        subject_key = subject.lower() if subject.lower() in question_bank[difficulty] else "frontend"
        
        # Handle missing categories gracefully
        if category not in question_bank[difficulty][subject_key]:
            category = "technical"  # fallback
        
        questions = question_bank[difficulty][subject_key][category]
        
        # Select question (with some variety)
        question_index = (question_number - 1) % len(questions)
        base_question = questions[question_index]
        
        # Adapt based on performance metrics
        if performance_metrics:
            confidence = performance_metrics.get('confidence_score', 70)
            if confidence < 60 and difficulty != "Easy":
                # Make question slightly easier
                base_question = f"Let's start with something fundamental: {base_question}"
            elif confidence > 85 and question_number > 3:
                # Make question more challenging
                base_question = f"Building on your strong responses: {base_question}"
        
        # Apply persona styling
        persona_styles = {
            "professional_man": {
                "prefix": "I'd like you to provide a structured response to: ",
                "tone": "formal"
            },
            "professional_woman": {
                "prefix": "Could you walk me through ",
                "tone": "collaborative"
            },
            "friendly_mentor": {
                "prefix": "Let's explore together: ",
                "tone": "supportive"
            },
            "strict_interviewer": {
                "prefix": "Explain in detail: ",
                "tone": "challenging"
            }
        }
        
        style = persona_styles.get(persona, {"prefix": "", "tone": "neutral"})
        
        # Use Groq to enhance the question if API is available
        try:
            if os.getenv('GROQ_API_KEY'):
                enhancement_prompt = f"""
                Enhance this interview question for a {difficulty} level {subject} interview:
                Base question: {base_question}
                Persona: {persona}
                Question number: {question_number}
                
                Make it more engaging and specific to {subject} while maintaining {difficulty} difficulty.
                Keep it concise and professional. Return only the enhanced question.
                """
                
                enhanced_question = call_groq_api(
                    enhancement_prompt,
                    f"You are an expert technical interviewer specializing in {subject} interviews."
                )
                
                if enhanced_question.strip():
                    final_question = enhanced_question.strip()
                else:
                    final_question = f"{style['prefix']}{base_question}"
            else:
                final_question = f"{style['prefix']}{base_question}"
        except:
            final_question = f"{style['prefix']}{base_question}"
        
        # Expected duration based on difficulty and category
        duration_map = {
            "Easy": {"introduction": 60, "technical": 90, "practical": 75},
            "Medium": {"technical": 120, "problem_solving": 150, "architectural": 180},
            "Hard": {"advanced_technical": 180, "system_design": 240, "leadership": 200}
        }
        
        expected_duration = duration_map.get(difficulty, {}).get(category, 120)
        
        return {
            "question_text": final_question,
            "category": category,
            "difficulty_level": difficulty,
            "expected_duration": expected_duration,
            "persona_tone": style['tone'],
            "question_type": "adaptive" if performance_metrics else "standard",
            "follow_up_potential": category in ["problem_solving", "system_design", "leadership"]
        }
    
    def _generate_groq_question(self, difficulty: str, subject: str, persona: str, 
                               question_number: int, previous_answers: Optional[List[str]] = None,
                               performance_metrics: Optional[Dict[str, float]] = None) -> Optional[Dict[str, Any]]:
        """Generate dynamic questions using Groq API"""
        
        # Build context from previous answers
        context = ""
        if previous_answers and len(previous_answers) > 0:
            context = "Previous answers in this interview:\n"
            for i, answer in enumerate(previous_answers[-3:]):  # Last 3 answers for context
                answer_text = answer.get('transcript', '') if isinstance(answer, dict) else str(answer)
                context += f"Q{i+1} Answer: {answer_text[:200]}...\n"
        
        # Performance context
        performance_context = ""
        if performance_metrics:
            confidence = performance_metrics.get('confidence_score', 70)
            technical_score = performance_metrics.get('technical_accuracy', 70)
            performance_context = f"Candidate performance so far: Confidence {confidence}%, Technical accuracy {technical_score}%"
        
        # Question generation prompt
        prompt = f"""
        You are an expert technical interviewer. Generate a {difficulty} level interview question for a {subject} position.
        
        Context:
        - Question number: {question_number} of 10
        - Interview subject: {subject}
        - Difficulty level: {difficulty}
        - Interviewer persona: {persona}
        
        {context}
        
        {performance_context}
        
        Requirements:
        1. If this is question 1-2, focus on introduction/background
        2. If previous answers show gaps, ask clarifying questions
        3. If candidate is performing well, increase complexity
        4. For questions 8-10, focus on advanced scenarios
        5. Make each question unique and build on previous responses
        6. Keep questions concise but comprehensive
        
        Generate ONLY the interview question, no additional text.
        """
        
        try:
            question_text = call_groq_api(
                prompt,
                f"You are a senior {subject} interviewer with 10+ years of experience."
            )
            
            if not question_text or len(question_text.strip()) < 10:
                return None
                
            # Determine category based on question number and content
            if question_number <= 2:
                category = "introduction"
            elif question_number <= 5:
                category = "technical"
            elif question_number <= 7:
                category = "problem_solving"
            else:
                category = "advanced_technical"
            
            # Duration based on difficulty and question number
            base_duration = {"Easy": 90, "Medium": 120, "Hard": 180}
            duration = base_duration.get(difficulty, 120)
            if question_number > 7:
                duration += 30  # More time for advanced questions
            
            return {
                "question_text": question_text.strip(),
                "category": category,
                "difficulty_level": difficulty,
                "expected_duration": duration,
                "persona_tone": "professional",
                "question_type": "ai_generated",
                "follow_up_potential": True
            }
            
        except Exception as e:
            print(f"Error generating Groq question: {e}")
            return None

class TechnicalEvaluatorTool(BaseTool):
    """Evaluate technical accuracy and depth of answers"""
    name: str = "technical_evaluator"
    description: str = "Evaluate technical content, accuracy, and depth of interview responses"
    
    def _run(self, 
             transcript: str, 
             question_context: Dict[str, Any], 
             difficulty: str,
             subject: str) -> Dict[str, Any]:
        """
        Evaluate technical content of the answer
        """
        
        # Key technical terms by subject and difficulty
        technical_terms = {
            "frontend": {
                "Easy": ["html", "css", "javascript", "dom", "responsive", "selector"],
                "Medium": ["react", "virtual dom", "closure", "async", "promise", "state"],
                "Hard": ["ssr", "optimization", "bundle", "performance", "architecture"]
            },
            "backend": {
                "Easy": ["api", "database", "server", "http", "json", "rest"],
                "Medium": ["authentication", "microservices", "caching", "scaling", "middleware"],
                "Hard": ["distributed", "consistency", "sharding", "concurrency", "architecture"]
            }
        }
        
        # Analyze content
        words = transcript.lower().split()
        word_count = len(words)
        
        # Check for technical terminology
        subject_key = subject.lower() if subject.lower() in technical_terms else "frontend"
        expected_terms = technical_terms[subject_key].get(difficulty, [])
        
        terms_mentioned = []
        for term in expected_terms:
            if term in transcript.lower():
                terms_mentioned.append(term)
        
        terminology_score = min(100, (len(terms_mentioned) / len(expected_terms)) * 100) if expected_terms else 50
        
        # Check for examples and explanations
        example_indicators = ["for example", "such as", "like when", "in my experience", "i once"]
        examples_count = sum(transcript.lower().count(indicator) for indicator in example_indicators)
        
        # Check for structure and completeness
        structure_indicators = ["first", "second", "finally", "in conclusion", "to summarize"]
        structure_count = sum(transcript.lower().count(indicator) for indicator in structure_indicators)
        
        # Depth analysis
        depth_indicators = ["because", "therefore", "however", "additionally", "furthermore"]
        depth_count = sum(transcript.lower().count(indicator) for indicator in depth_indicators)
        
        # Calculate scores
        content_completeness = min(100, max(20, (word_count / 50) * 100))  # Based on expected length
        
        technical_accuracy = terminology_score
        
        explanation_quality = min(100, examples_count * 20 + depth_count * 10)
        
        structure_score = min(100, 50 + structure_count * 15)
        
        overall_technical_score = (
            technical_accuracy * 0.3 + 
            explanation_quality * 0.3 + 
            content_completeness * 0.2 + 
            structure_score * 0.2
        )
        
        return {
            "technical_accuracy": round(technical_accuracy, 1),
            "content_completeness": round(content_completeness, 1),
            "explanation_quality": round(explanation_quality, 1),
            "structure_score": round(structure_score, 1),
            "overall_technical_score": round(overall_technical_score, 1),
            "terms_mentioned": terms_mentioned,
            "examples_provided": examples_count,
            "depth_indicators": depth_count,
            "word_count": word_count,
            "evaluation_timestamp": datetime.utcnow().isoformat()
        }

class InterviewCrew:
    """Main CrewAI crew for managing the interview process"""
    
    def __init__(self):
        # Initialize tools
        self.speech_tool = AdvancedSpeechAnalysisTool()
        self.question_tool = ContextualQuestionGeneratorTool()
        self.evaluator_tool = TechnicalEvaluatorTool()
        
        # Configure Groq LLM for CrewAI if API key is available
        groq_llm = None
        try:
            if os.getenv('GROQ_API_KEY'):
                from crewai import LLM
                groq_llm = LLM(
                    model="groq/llama-3.1-8b-instant",
                    api_key=os.getenv('GROQ_API_KEY')
                )
        except Exception as e:
            print(f"Groq LLM initialization failed: {e}")
            groq_llm = None
        
        # Create agents with or without Groq LLM
        if groq_llm:
            self.question_master = Agent(
                role='Senior Technical Interviewer',
                goal='Generate contextual, progressive interview questions that accurately assess candidate skills',
                backstory="""You are a seasoned technical interviewer with 10+ years of experience. 
                You know how to ask the right questions to evaluate both technical skills and soft skills. 
                You adapt your questioning style based on the candidate's responses and performance.""",
                tools=[self.question_tool],
                verbose=True,
                allow_delegation=False,
                llm=groq_llm
            )
            
            self.speech_analyst = Agent(
                role='Communication Expert',
                goal='Analyze speech patterns, clarity, confidence, and overall communication effectiveness',
                backstory="""You are a professional communication coach who specializes in helping people 
                improve their speaking skills. You can identify areas for improvement while providing 
                constructive and encouraging feedback.""",
                tools=[self.speech_tool],
                verbose=True,
                allow_delegation=False,
                llm=groq_llm
            )
            
            self.technical_judge = Agent(
                role='Technical Content Evaluator',
                goal='Assess the technical accuracy, depth, and completeness of candidate responses',
                backstory="""You are a senior technical expert who can evaluate the quality of technical 
                explanations. You look for accuracy, depth of understanding, and practical knowledge.""",
                tools=[self.evaluator_tool],
                verbose=True,
                allow_delegation=False,
                llm=groq_llm
            )
            
            self.interview_coordinator = Agent(
                role='Interview Process Manager',
                goal='Coordinate the overall interview flow and provide comprehensive feedback',
                backstory="""You are responsible for managing the entire interview process, ensuring 
                smooth flow, and providing final evaluations that help candidates improve.""",
                verbose=True,
                allow_delegation=True,
                llm=groq_llm
            )
        else:
            # Fallback agents without LLM specification
            self.question_master = Agent(
                role='Senior Technical Interviewer',
                goal='Generate contextual, progressive interview questions that accurately assess candidate skills',
                backstory="""You are a seasoned technical interviewer with 10+ years of experience. 
                You know how to ask the right questions to evaluate both technical skills and soft skills. 
                You adapt your questioning style based on the candidate's responses and performance.""",
                tools=[self.question_tool],
                verbose=False,
                allow_delegation=False
            )
            
            self.speech_analyst = Agent(
                role='Communication Expert',
                goal='Analyze speech patterns, clarity, confidence, and overall communication effectiveness',
                backstory="""You are a professional communication coach who specializes in helping people 
                improve their speaking skills. You can identify areas for improvement while providing 
                constructive and encouraging feedback.""",
                tools=[self.speech_tool],
                verbose=False,
                allow_delegation=False
            )
            
            self.technical_judge = Agent(
                role='Technical Content Evaluator',
                goal='Assess the technical accuracy, depth, and completeness of candidate responses',
                backstory="""You are a senior technical expert who can evaluate the quality of technical 
                explanations. You look for accuracy, depth of understanding, and practical knowledge.""",
                tools=[self.evaluator_tool],
                verbose=False,
                allow_delegation=False
            )
            
            self.interview_coordinator = Agent(
                role='Interview Process Manager',
                goal='Coordinate the overall interview flow and provide comprehensive feedback',
                backstory="""You are responsible for managing the entire interview process, ensuring 
                smooth flow, and providing final evaluations that help candidates improve.""",
                verbose=False,
                allow_delegation=True
            )
    
    def generate_question(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate next interview question"""
        task = Task(
            description=f"""Generate the next interview question based on:
            - Difficulty: {context.get('difficulty')}
            - Subject: {context.get('subject')}
            - Question number: {context.get('question_number')}
            - Previous performance: {context.get('performance_metrics')}
            - Persona: {context.get('persona')}
            
            Make sure the question is appropriate for the difficulty level and builds on previous responses.""",
            agent=self.question_master,
            expected_output="A contextual interview question with metadata"
        )
        
        crew = Crew(
            agents=[self.question_master],
            tasks=[task],
            verbose=True,
            process=Process.sequential
        )
        
        result = crew.kickoff()
        return self.question_tool._run(**context)
    
    def analyze_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze candidate response comprehensively"""
        
        # Speech analysis task
        speech_task = Task(
            description=f"""Analyze the speech quality of this response:
            Transcript: {response_data.get('transcript')}
            Duration: {response_data.get('duration')} seconds
            
            Provide detailed analysis of communication skills, confidence, and clarity.""",
            agent=self.speech_analyst,
            expected_output="Comprehensive speech analysis with scores and recommendations"
        )
        
        # Technical evaluation task
        tech_task = Task(
            description=f"""Evaluate the technical content of this response:
            Transcript: {response_data.get('transcript')}
            Question context: {response_data.get('question_context')}
            Subject: {response_data.get('subject')}
            Difficulty: {response_data.get('difficulty')}
            
            Assess technical accuracy, depth, and completeness.""",
            agent=self.technical_judge,
            expected_output="Technical evaluation with accuracy and depth scores"
        )
        
        # Coordination task
        coord_task = Task(
            description="""Based on the speech analysis and technical evaluation, provide:
            1. Overall assessment of the response
            2. Specific areas for improvement
            3. Positive feedback and strengths
            4. Recommendations for the next question difficulty
            
            Be constructive and encouraging while being honest about areas for improvement.""",
            agent=self.interview_coordinator,
            expected_output="Comprehensive feedback and recommendations"
        )
        
        crew = Crew(
            agents=[self.speech_analyst, self.technical_judge, self.interview_coordinator],
            tasks=[speech_task, tech_task, coord_task],
            verbose=True,
            process=Process.sequential
        )
        
        # Execute analysis
        crew_result = crew.kickoff()
        
        # Get individual tool results
        speech_analysis = self.speech_tool._run(
            response_data.get('transcript', ''), 
            response_data.get('duration', 0)
        )
        
        technical_analysis = self.evaluator_tool._run(
            response_data.get('transcript', ''),
            response_data.get('question_context', {}),
            response_data.get('difficulty', 'Medium'),
            response_data.get('subject', 'general')
        )
        
        return {
            'speech_analysis': speech_analysis,
            'technical_analysis': technical_analysis,
            'crew_feedback': str(crew_result),
            'combined_score': (
                speech_analysis.get('overall_communication_score', 0) * 0.4 +
                technical_analysis.get('overall_technical_score', 0) * 0.6
            ),
            'analysis_timestamp': datetime.utcnow().isoformat()
        }

# Global interview crew instance
interview_crew = InterviewCrew()