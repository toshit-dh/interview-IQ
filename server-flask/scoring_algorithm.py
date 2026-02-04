
import math
import re
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass

@dataclass
class ScoringThresholds:
   
    FILLER_CRITICAL = 5.0         
    FILLER_HIGH = 3.0             
    FILLER_MODERATE = 1.5          
    FILLER_IDEAL = 0.5            
    
    
    PAUSE_CRITICAL = 5.0           
    PAUSE_LONG = 3.0               
    PAUSE_NORMAL = 1.5            
    PAUSE_SHORT = 0.5             
    
   
    SPEECH_RATE_SLOW = 100        
    SPEECH_RATE_NORMAL_LOW = 120   
    SPEECH_RATE_IDEAL = 150       
    SPEECH_RATE_IDEAL_HIGH = 160  
    SPEECH_RATE_FAST = 180         
    SPEECH_RATE_VERY_FAST = 200   
    
 
    DURATION_TOO_SHORT = 15       
    DURATION_SHORT = 30            
    DURATION_IDEAL = 60           
    DURATION_LONG = 180            
    DURATION_TOO_LONG = 300       


class AnswerScorer:
    """Scores individual question answers"""
    
    def __init__(self, thresholds: ScoringThresholds = None): # type: ignore
        self.thresholds = thresholds or ScoringThresholds()
        
    def calculate_answer_scores(self, 
                               transcript: str,
                               duration: float,
                               filler_count: int,
                               pause_count: int,
                               pause_durations: List[float]) -> Dict[str, Any]:

        word_count = self._calculate_word_count(transcript)
        speech_rate = self._calculate_speech_rate(word_count, duration)
        filler_density = self._calculate_filler_density(filler_count, duration, word_count)
        pause_quality = self._analyze_pauses(pause_durations)
        content_length_score = self._score_answer_length(duration, word_count)
        
      
        confidence_score = self._calculate_confidence(
            filler_density, pause_quality, word_count, duration
        )
        clarity_score = self._calculate_clarity(
            filler_density, speech_rate, pause_quality
        )
        technical_accuracy = self._estimate_technical_accuracy(word_count, duration)
        fluency_score = self._calculate_fluency(
            filler_density, pause_quality, speech_rate
        )
        
        overall_quality = self._calculate_overall_quality(
            confidence_score, clarity_score, fluency_score
        )
        
        return {
            'confidenceScore': round(confidence_score, 1),
            'clarityScore': round(clarity_score, 1),
            'technicalAccuracy': round(technical_accuracy, 1),
            'fluencyScore': round(fluency_score, 1),
            'overallAnswerQuality': round(overall_quality, 1),
            'wordCount': word_count,
            'speechRate': round(speech_rate, 1),
            'fillerDensity': round(filler_density, 2),
            'pauseQuality': pause_quality['qualityScore'],
            'contentLengthScore': round(content_length_score, 1),
            'analysis': {
                'wordCountAnalysis': self._analyze_word_count(word_count, duration),
                'fillerAnalysis': self._analyze_filler_words(filler_count, filler_density),
                'pauseAnalysis': pause_quality['analysis'],
                'speedAnalysis': self._analyze_speech_rate(speech_rate)
            }
        }
    
    def _calculate_word_count(self, transcript: str) -> int:
      
        if not transcript:
            return 0
        words = re.findall(r"\b[a-zA-Z]+(?:\'[a-zA-Z]+)?\b", transcript)
        return len(words)
    
    def _calculate_speech_rate(self, word_count: int, duration: float) -> float:
       
        if duration < 1:
            return 0
        return (word_count / duration) * 60
    
    def _calculate_filler_density(self, filler_count: int, duration: float, word_count: int) -> float:
       
        if duration < 1:
            return 0
        fillers_per_minute = (filler_count / duration) * 60
        return fillers_per_minute
    
    def _analyze_pauses(self, pause_durations: List[float]) -> Dict[str, Any]:
       
        if not pause_durations or len(pause_durations) == 0:
            return {
                'qualityScore': 100.0,
                'averagePause': 0,
                'analysis': 'Excellent - no extended pauses detected'
            }
        
        avg_pause = sum(pause_durations) / len(pause_durations)
        max_pause = max(pause_durations)
        
        
        quality_score = 100.0
        analysis = []
        
      
        if max_pause > self.thresholds.PAUSE_CRITICAL:
            quality_score -= 25
            analysis.append(f"Very long pauses ({max_pause}s) detected")
        elif max_pause > self.thresholds.PAUSE_LONG:
            quality_score -= 15
            analysis.append(f"Long pauses ({max_pause}s) detected")
        
        
        pause_count = len(pause_durations)
        if pause_count > 5:
            quality_score -= min(20, pause_count * 2)
            analysis.append(f"Many pauses ({pause_count}) detected - consider pacing better")
        
      
        if avg_pause < self.thresholds.PAUSE_SHORT and pause_count < 3:
            quality_score = min(100, quality_score + 10)
            analysis.append("Natural pause pattern")
        
        quality_score = max(0, min(100, quality_score))
        analysis_text = analysis[0] if analysis else "Good pause control"
        
        return {
            'qualityScore': quality_score,
            'averagePause': round(avg_pause, 2),
            'maxPause': max_pause,
            'pauseCount': pause_count,
            'analysis': analysis_text
        }
    
    def _score_answer_length(self, duration: float, word_count: int) -> float:
        
        score = 75.0  
        
        if duration < self.thresholds.DURATION_TOO_SHORT:
            score = 30 + (duration / self.thresholds.DURATION_TOO_SHORT) * 40
        elif duration < self.thresholds.DURATION_SHORT:
            score = 70
        elif duration <= self.thresholds.DURATION_IDEAL:
            score = 95
        elif duration <= self.thresholds.DURATION_LONG:
            score = 90
        elif duration <= self.thresholds.DURATION_TOO_LONG:
            score = 80
        else:
            score = 50 + max(0, 50 - (duration - self.thresholds.DURATION_TOO_LONG) / 60)
        
        return min(100, score)
    
    def _calculate_confidence(self, filler_density: float, pause_quality: Dict, 
                             word_count: int, duration: float) -> float:
      
        base_score = 75.0
        
       
        if filler_density >= self.thresholds.FILLER_CRITICAL:
            base_score -= 40
        elif filler_density >= self.thresholds.FILLER_HIGH:
            base_score -= 25
        elif filler_density >= self.thresholds.FILLER_MODERATE:
            base_score -= 12
        elif filler_density >= self.thresholds.FILLER_IDEAL:
            base_score -= 5
        
        base_score += (pause_quality['qualityScore'] - 80) * 0.3
        
       
        if word_count >= 150:
            base_score += 15
        elif word_count >= 100:
            base_score += 10
        elif word_count < 30:
            base_score -= 20
        
        return min(100, max(10, base_score))
    
    def _calculate_clarity(self, filler_density: float, speech_rate: float, 
                          pause_quality: Dict) -> float:
        base_score = 75.0
        if filler_density >= self.thresholds.FILLER_CRITICAL:
            base_score -= 40
        elif filler_density >= self.thresholds.FILLER_HIGH:
            base_score -= 25
        elif filler_density >= self.thresholds.FILLER_MODERATE:
            base_score -= 12
        
        
        if speech_rate < self.thresholds.SPEECH_RATE_SLOW:
            base_score -= 15
        elif speech_rate <= self.thresholds.SPEECH_RATE_NORMAL_LOW:
            base_score -= 5
        elif speech_rate > self.thresholds.SPEECH_RATE_VERY_FAST:
            base_score -= 20
        elif speech_rate > self.thresholds.SPEECH_RATE_FAST:
            base_score -= 10
        else:
            base_score += 5  
        
       
        base_score += (pause_quality['qualityScore'] - 75) * 0.2
        
        return min(100, max(10, base_score))
    
    def _calculate_fluency(self, filler_density: float, pause_quality: Dict, 
                          speech_rate: float) -> float:
      
        base_score = 75.0
        if filler_density >= self.thresholds.FILLER_CRITICAL:
            base_score -= 35
        elif filler_density >= self.thresholds.FILLER_HIGH:
            base_score -= 20
        elif filler_density >= self.thresholds.FILLER_MODERATE:
            base_score -= 10
        
        base_score += (pause_quality['qualityScore'] - 80) * 0.25
        
        if speech_rate > self.thresholds.SPEECH_RATE_VERY_FAST:
            base_score -= 15
        elif speech_rate > self.thresholds.SPEECH_RATE_FAST:
            base_score -= 8
        
        return min(100, max(10, base_score))
    
    def _estimate_technical_accuracy(self, word_count: int, duration: float) -> float:
        if word_count >= 200:
            return 85.0
        elif word_count >= 150:
            return 80.0
        elif word_count >= 100:
            return 75.0
        elif word_count >= 50:
            return 65.0
        else:
            return 50.0
    
    def _calculate_overall_quality(self, confidence: float, clarity: float, 
                                  fluency: float) -> float:
        return (clarity * 0.4) + (confidence * 0.35) + (fluency * 0.25)
    
    def _analyze_word_count(self, word_count: int, duration: float) -> str:
        if word_count < 30:
            return "Very brief answer - provide more detail"
        elif word_count < 50:
            return "Brief answer - consider expanding"
        elif word_count < 150:
            return "Adequate response length"
        else:
            return "Comprehensive and detailed response"
    
    def _analyze_filler_words(self, filler_count: int, filler_density: float) -> str:
        
        if filler_count == 0:
            return "Excellent - no filler words detected"
        elif filler_density < self.thresholds.FILLER_IDEAL:
            return "Very good - minimal filler words"
        elif filler_density < self.thresholds.FILLER_MODERATE:
            return "Good - acceptable filler word usage"
        elif filler_density < self.thresholds.FILLER_HIGH:
            return "Moderate - consider reducing filler words"
        else:
            return "High filler word density - practice speaking more naturally"
    
    def _analyze_speech_rate(self, speech_rate: float) -> str:
        if speech_rate < self.thresholds.SPEECH_RATE_SLOW:
            return "Too slow - speak more fluidly"
        elif speech_rate < self.thresholds.SPEECH_RATE_NORMAL_LOW:
            return "Slightly slow - consider picking up pace"
        elif speech_rate <= self.thresholds.SPEECH_RATE_IDEAL_HIGH:
            return "Ideal speaking pace"
        elif speech_rate <= self.thresholds.SPEECH_RATE_FAST:
            return "Slightly fast - consider slowing down slightly"
        else:
            return "Too fast - speaking rushed, slow down"


class InterviewSessionScorer:
    def __init__(self, answer_scorer: AnswerScorer = None): # type: ignore
        self.answer_scorer = answer_scorer or AnswerScorer()
    
    def calculate_session_scores(self, 
                                answers: List[Dict[str, Any]],
                                questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not answers or len(answers) == 0:
            return self._get_empty_session_scores()
        total_confidence = sum(a.get('confidenceScore', 0) for a in answers)
        total_clarity = sum(a.get('clarityScore', 0) for a in answers)
        total_fluency = sum(a.get('fluencyScore', 0) for a in answers)
        total_technical = sum(a.get('technicalAccuracy', 0) for a in answers)
        total_quality = sum(a.get('overallAnswerQuality', 0) for a in answers)
        
        answer_count = len(answers)
        
        avg_confidence = total_confidence / answer_count
        avg_clarity = total_clarity / answer_count
        avg_fluency = total_fluency / answer_count
        avg_technical = total_technical / answer_count
        avg_quality = total_quality / answer_count

        communication_score = (avg_confidence * 0.4) + (avg_clarity * 0.6)
        overall_score = (
            communication_score * 0.35 +
            avg_technical * 0.35 +
            avg_fluency * 0.30
        )
        
        total_filler_words = sum(a.get('fillerWordsCount', 0) for a in answers)
        avg_filler_density = sum(
            a.get('fillerDensity', 0) for a in answers
        ) / answer_count if answer_count > 0 else 0
        
        total_pauses = sum(a.get('pauseCount', 0) for a in answers)
        strengths = self._identify_strengths(
            avg_confidence, avg_clarity, avg_fluency, total_filler_words, total_pauses
        )
        improvements = self._identify_improvements(
            avg_confidence, avg_clarity, avg_fluency, total_filler_words, total_pauses, answer_count
        )
        recommendations = self._generate_recommendations(
            strengths, improvements, avg_confidence, avg_clarity
        )
        
        return {
            'overallScore': round(overall_score, 1),
            'communicationScore': round(communication_score, 1),
            'scores': {
                'confidence': round(avg_confidence, 1),
                'clarity': round(avg_clarity, 1),
                'technical_accuracy': round(avg_technical, 1),
                'fluency': round(avg_fluency, 1),
                'overallCommunication': round(communication_score, 1)
            },
            'aggregateMetrics': {
                'totalFillerWords': total_filler_words,
                'averageFillerDensity': round(avg_filler_density, 2),
                'totalPauses': total_pauses,
                'questionsAnswered': answer_count,
                'questionsTotal': len(questions) if questions else answer_count
            },
            'strengths': strengths,
            'improvements': improvements,
            'recommendations': recommendations,
            'overallFeedback': self._generate_overall_feedback(
                overall_score, total_filler_words, avg_confidence
            )
        }
    
    def _get_empty_session_scores(self) -> Dict[str, Any]:
        return {
            'overallScore': 0,
            'communicationScore': 0,
            'scores': {
                'confidence': 0,
                'clarity': 0,
                'technical_accuracy': 0,
                'fluency': 0,
                'overallCommunication': 0
            },
            'aggregateMetrics': {
                'totalFillerWords': 0,
                'averageFillerDensity': 0,
                'totalPauses': 0,
                'questionsAnswered': 0,
                'questionsTotal': 0
            },
            'strengths': [],
            'improvements': [],
            'recommendations': [],
            'overallFeedback': 'No interview data available'
        }
    
    def _identify_strengths(self, confidence: float, clarity: float, fluency: float,
                           total_fillers: int, total_pauses: int) -> List[str]:
        strengths = []
        
        if confidence >= 75:
            strengths.append("Confident delivery and strong composure")
        
        if clarity >= 75:
            strengths.append("Clear and articulate communication")
        
        if fluency >= 75:
            strengths.append("Smooth and natural speech flow")
        
        if total_fillers <= 5:
            strengths.append("Excellent filler word control")
        
        if total_pauses < 3:
            strengths.append("Good pacing and minimal hesitation")
        
        if (confidence + clarity + fluency) / 3 >= 80:
            strengths.append("Outstanding overall communication skills")
        
        return strengths if strengths else ["Consistent performance throughout interview"]
    
    def _identify_improvements(self, confidence: float, clarity: float, fluency: float,
                              total_fillers: int, total_pauses: int, answer_count: int) -> List[str]:
        improvements = []
        
        if confidence < 70:
            improvements.append("Build more confidence in your answers")
        
        if clarity < 70:
            improvements.append("Focus on clearer articulation and expression")
        
        if fluency < 70:
            improvements.append("Work on smoother speech transitions")
        
        if total_fillers > 10:
            improvements.append("Reduce filler words like 'um', 'uh', 'like'")
        
        avg_fillers = total_fillers / answer_count if answer_count > 0 else 0
        if avg_fillers > 2:
            improvements.append("High filler word density - practice speaking without fillers")
        
        if total_pauses > 5:
            improvements.append("Minimize long pauses - practice continuous speaking")
        
        return improvements if improvements else []
    
    def _generate_recommendations(self, strengths: List[str], improvements: List[str],
                                 confidence: float, clarity: float) -> List[str]:
        recommendations = []
        recommendations.append("Record yourself and review your performance")
        
        if len(improvements) > 0:
            recommendations.append("Practice mock interviews regularly to improve")
        
        if "filler" in " ".join(improvements).lower():
            recommendations.append("Practice speaking exercises to reduce filler words")
        
        if confidence < 70:
            recommendations.append("Build confidence through topic mastery and preparation")
        
        if clarity < 70:
            recommendations.append("Work on clear pronunciation and pacing")
        
        if len(strengths) >= 3:
            recommendations.append("Maintain your current strengths and continue improving")
        
        return recommendations[:5]  
    
    def _generate_overall_feedback(self, overall_score: float, total_fillers: int,
                                  avg_confidence: float) -> str:
        if overall_score >= 85:
            return "Excellent interview performance - you demonstrated strong communication skills and confidence!"
        elif overall_score >= 75:
            if total_fillers > 8:
                return "Good performance overall - focus on reducing filler words to further improve your score."
            else:
                return "Strong communication with consistent delivery - keep up the good work!"
        elif overall_score >= 65:
            return "Decent performance - work on clarity and reducing hesitations to improve your interview skills."
        else:
            return "Interview needs improvement - practice your responses and focus on confident, clear delivery."


def calculate_answer_scores(transcript: str, duration: float, filler_count: int,
                          pause_count: int, pause_durations: List[float]) -> Dict[str, Any]:
    scorer = AnswerScorer()
    return scorer.calculate_answer_scores(
        transcript, duration, filler_count, pause_count, pause_durations
    )


def calculate_session_scores(answers: List[Dict[str, Any]], 
                            questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    scorer = InterviewSessionScorer()
    return scorer.calculate_session_scores(answers, questions)
