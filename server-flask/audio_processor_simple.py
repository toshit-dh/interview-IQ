import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import re

logger = logging.getLogger(__name__)

class SimplifiedAudioProcessor:
    
    
    def __init__(self):
        self.filler_words = {
            'basic': ['um', 'uh', 'like', 'you know', 'so', 'well', 'right','hmm','eeh','aah'],
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
        
        self.quality_thresholds = {
            'excellent': {'filler_ratio': 0.02, 'speed_range': (140, 160)},
            'good': {'filler_ratio': 0.05, 'speed_range': (120, 180)},
            'fair': {'filler_ratio': 0.08, 'speed_range': (100, 200)},
            'poor': {'filler_ratio': 0.12, 'speed_range': (80, 220)}
        }
    
    def analyze_transcript(self, transcript: str, duration: float) -> Dict[str, Any]:
        try:
            if not transcript or duration <= 0:
                return {"error": "Invalid input for analysis"}
            
            words = transcript.lower().split()
            word_count = len(words)
            
            filler_analysis = self._analyze_filler_words(transcript)
            speaking_rate = (word_count / duration) * 60 if duration > 0 else 0
            confidence_analysis = self._analyze_confidence_indicators(transcript)
            scores = self._calculate_scores(
                filler_analysis, confidence_analysis, speaking_rate, word_count, duration, transcript
            )
            
            return {
                "word_count": word_count,
                "duration": duration,
                "speaking_rate": round(speaking_rate, 1),
                "filler_analysis": filler_analysis,
                "confidence_analysis": confidence_analysis,
                "scores": scores,
                "recommendations": self._generate_recommendations(scores),
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing transcript: {str(e)}")
            return {"error": f"Analysis failed: {str(e)}"}
    
    def _analyze_filler_words(self, transcript: str) -> Dict[str, Any]:
        filler_count = 0
        filler_details = {}
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
        
        word_count = len(transcript.split())
        filler_ratio = filler_count / word_count if word_count > 0 else 0
        
        return {
            "total_filler_count": filler_count,
            "filler_details": filler_details,
            "filler_ratio": round(filler_ratio, 4),
            "filler_frequency": round(filler_count / (word_count / 100), 2) if word_count > 0 else 0
        }
    
    def _analyze_confidence_indicators(self, transcript: str) -> Dict[str, Any]:
        
        strong_words = [
            'definitely', 'certainly', 'absolutely', 'clearly', 'obviously',
            'confident', 'sure', 'positive', 'believe', 'know'
        ]
        
        weak_words = [
            'maybe', 'perhaps', 'possibly', 'probably', 'might', 'could',
            'i think', 'i guess', 'i suppose', 'not sure', 'unsure'
        ]
        
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
    
    def _calculate_scores(self, filler_analysis: Dict, confidence_analysis: Dict, 
                         speaking_rate: float, word_count: int, duration: float, transcript: str = "") -> Dict[str, float]:
        filler_count = filler_analysis.get('total_filler_count', 0)
        filler_penalty = min(40, filler_count * 4)
        fluency_score = max(0, 100 - filler_penalty)
        optimal_range = (140, 160)
        if optimal_range[0] <= speaking_rate <= optimal_range[1]:
            pace_score = 100
        else:
            deviation = min(abs(speaking_rate - optimal_range[0]), abs(speaking_rate - optimal_range[1]))
            pace_score = max(0, 100 - deviation * 0.5)
        
        confidence_ratio = confidence_analysis.get('confidence_ratio', 0)
        confidence_base = 75
        if confidence_ratio > 0:
            confidence_score = min(100, confidence_base + confidence_ratio * 1000)
        else:
            confidence_score = max(0, confidence_base + confidence_ratio * 500)
        
        expected_words = duration * 2.5  
        completeness_ratio = word_count / expected_words if expected_words > 0 else 0
        if 0.8 <= completeness_ratio <= 1.2:
            completeness_score = 100
        else:
            completeness_score = max(0, 100 - abs(completeness_ratio - 1.0) * 50)
    
        sentences = [s.strip() for s in transcript.split('.') if s.strip()]
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        if 8 <= avg_sentence_length <= 20:
            clarity_score = 90
        elif 5 <= avg_sentence_length <= 25:
            clarity_score = 75
        else:
            clarity_score = 60
        
        clarity_score = max(0, clarity_score - (filler_count * 2))
        overall_score = (
            fluency_score * 0.30 +
            pace_score * 0.20 +
            confidence_score * 0.25 +
            completeness_score * 0.15 +
            clarity_score * 0.10
        )
        
        return {
            "fluency_score": round(fluency_score, 1),
            "pace_score": round(pace_score, 1),
            "confidence_score": round(confidence_score, 1),
            "completeness_score": round(completeness_score, 1),
            "clarity_score": round(clarity_score, 1),
            "overall_communication_score": round(overall_score, 1)
        }
    
    def _generate_recommendations(self, scores: Dict[str, float]) -> List[str]:
        recommendations = []
        
        if scores.get('fluency_score', 0) < 70:
            recommendations.append("Practice reducing filler words like 'um', 'uh', and 'like' by pausing briefly instead.")
 
        pace_score = scores.get('pace_score', 0)
        if pace_score < 70:
            recommendations.append("Work on speaking at a more natural pace - aim for 140-160 words per minute.")
        
        if scores.get('clarity_score', 0) < 70:
            recommendations.append("Focus on clear articulation and use well-structured sentences.")
        
        if scores.get('confidence_score', 0) < 70:
            recommendations.append("Use more definitive language and avoid hedging phrases like 'I think' or 'maybe'.")
        
        if scores.get('completeness_score', 0) < 70:
            recommendations.append("Provide more comprehensive answers with examples and details.")
        
        overall_score = scores.get('overall_communication_score', 0)
        if overall_score >= 85:
            recommendations.append("Excellent communication skills! Keep up the great work.")
        elif overall_score >= 75:
            recommendations.append("Very good communication with minor areas for improvement.")
        elif overall_score >= 65:
            recommendations.append("Good communication overall - focus on the areas highlighted above.")
        
        return recommendations
    
    def generate_live_insights(self, transcript: str, duration: float) -> List[Dict[str, str]]:
        insights = []
        
        if not transcript:
            return insights
    
        words = transcript.lower().split()
        word_count = len(words)
        filler_count = 0
        for category, fillers in self.filler_words.items():
            for filler in fillers:
                filler_count += transcript.lower().count(filler)
        
        if filler_count > 3 and word_count > 20:
            insights.append({
                'insightType': 'fillerWords',
                'text': f'Try to reduce filler words (detected {filler_count}). Pause briefly instead of using "um" or "uh".'
            })
        elif filler_count <= 1 and word_count > 20:
            insights.append({
                'insightType': 'fillerWords',
                'text': 'Great job minimizing filler words!'
            })
        
        
        if duration > 10:  
            speaking_rate = (word_count / duration) * 60
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
        
        uncertainty_words = ['maybe', 'probably', 'i think', 'i guess']
        uncertainty_count = sum(transcript.lower().count(word) for word in uncertainty_words)
        
        if uncertainty_count > 2:
            insights.append({
                'insightType': 'confidence',
                'text': 'Try to sound more definitive. Use confident language.'
            })
        elif word_count > 30:
            insights.append({
                'insightType': 'confidence',
                'text': 'You sound confident and clear!'
            })
        
        return insights
audio_processor = SimplifiedAudioProcessor()