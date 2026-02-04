import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const sessionId = location.state?.sessionId || 'mock-session-' + Date.now();
      console.log('🔍 Analytics page loaded');
      console.log('📍 location.state:', location.state);
      console.log('📍 sessionId:', sessionId);
      
      if (location.state?.interviewData) {
        console.log('✅ interviewData present in location.state');
        const hasAnswers = location.state.interviewData.answers && location.state.interviewData.answers.length > 0;
        console.log('📊 Has answers:', hasAnswers, 'Count:', location.state.interviewData.answers?.length || 0);
        
        if (hasAnswers) {
          console.log('✅ Using interviewData from socket event:', location.state.interviewData);
          setAnalyticsData(location.state.interviewData);
          setIsLive(location.state.interviewData.realtime?.isLive || false);
          setLoading(false);
          return;
        }
      }
      console.log('🔄 Fetching analytics from API for sessionId:', sessionId);
      const response = await fetch(`http://localhost:5000/api/analytics/${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Analytics data received from API:');
        console.log('   - Questions:', data.questions?.length || 0);
        console.log('   - Answers:', data.answers?.length || 0);
        console.log('   - Session:', data.sessionId);
        console.log('   Full data:', data);
        setAnalyticsData(data);
        setIsLive(data.realtime?.isLive || false);
        setLoading(false);
        return;
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      console.log('Using mock data due to API error:', error);
      const mockData = {
        sessionId: 'interview-123-456',
        overallScore: 78.5,
        duration: '25:34',
        totalQuestions: 10,
        completedQuestions: 10,
        realtime: {
          isLive: false,
          currentQuestion: 0,
          isRecording: false,
          realtimeIssues: {
            filler_count: 3,
            long_pauses: 2,
            speaking_too_fast: 1
          }
        },
        scores: {
          confidence: 82,
          clarity: 75,
          fluency: 80,
          technical_accuracy: 76,
          communication: 78
        },
        fillerWords: {
          total: 12,
          breakdown: [
            { word: 'um', count: 5 },
            { word: 'uh', count: 3 },
            { word: 'like', count: 2 },
            { word: 'you know', count: 2 }
          ],
          realtime_count: 3
        },
        speakingMetrics: {
          averageSpeed: 145,
          totalWords: 850,
          longestPause: 4.2,
          averagePause: 1.3,
          realtimeMetrics: {
            longPauses: 2,
            fastSpeaking: 1,
            paceIssues: 3
          }
        },
        timeline: [
          { time: 0, confidence: 80, clarity: 75, pace: 140, fillerWords: 0, issues: 0 },
          { time: 5, confidence: 75, clarity: 80, pace: 160, fillerWords: 1, issues: 1 },
          { time: 10, confidence: 70, clarity: 70, pace: 180, fillerWords: 2, issues: 2 },
          { time: 15, confidence: 85, clarity: 85, pace: 150, fillerWords: 0, issues: 0 },
          { time: 20, confidence: 78, clarity: 82, pace: 145, fillerWords: 1, issues: 1 }
        ],
        
        questionPerformance: [
          { question: 'Q1', confidence: 85, clarity: 80, technical: 75, overall: 80 },
          { question: 'Q2', confidence: 78, clarity: 82, technical: 85, overall: 82 },
          { question: 'Q3', confidence: 80, clarity: 75, technical: 70, overall: 75 },
          { question: 'Q4', confidence: 82, clarity: 85, technical: 80, overall: 82 },
          { question: 'Q5', confidence: 75, clarity: 78, technical: 82, overall: 78 }
        ],
        
        feedback: {
          strengths: [
            'Clear articulation and good pace',
            'Strong technical knowledge',
            'Confident delivery',
            'Good use of examples'
          ],
          improvements: [
            'Reduce filler words',
            'Avoid long pauses',
            'Be more concise',
            'Practice complex explanations'
          ],
          recommendations: [
            'Practice mock interviews',
            'Record yourself speaking',
            'Review technical concepts',
            'Work on communication skills'
          ]
        }
      };
      
      setAnalyticsData(mockData);
      setIsLive(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    let interval = null;
    if (isLive) {
      interval = setInterval(fetchAnalytics, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, location.state?.sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your interview analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Failed to load analytics data</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const safeData = {
    sessionId: analyticsData.sessionId || 'unknown',
    overallScore: analyticsData.overallScore || analyticsData.scores?.overallCommunication || 0,
    duration: analyticsData.duration || '00:00',
    completedQuestions: analyticsData.completedQuestions || analyticsData.answeredQuestions || 0,
    totalQuestions: analyticsData.totalQuestions || 10,
    fillerWords: analyticsData.fillerWords || { total: 0, breakdown: [], realtime_count: 0 },
    questions: analyticsData.questions || [],
    answers: analyticsData.answers || [],
    timeline: analyticsData.timeline || [],
    feedback: {
      strengths: analyticsData.strengths || [],
      improvements: analyticsData.improvements || [],
      recommendations: analyticsData.recommendations || []
    },
    scores: {
      confidence: analyticsData.scores?.confidence || 0,
      clarity: analyticsData.scores?.clarity || 0,
      technical_accuracy: analyticsData.scores?.technical_accuracy || 0,
      communication: analyticsData.scores?.overallCommunication || 0
    }
  };

  const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

  const renderHighlightedTranscript = (transcript, fillerPositions) => {
    if (!transcript) return 'No transcript available';
    if (!fillerPositions || fillerPositions.length === 0) {
      return <span className="text-gray-100">{transcript}</span>;
    }

    const segments = [];
    let lastEnd = 0;

  
    const sortedFillers = [...fillerPositions].sort((a, b) => a.start - b.start);

    sortedFillers.forEach((filler) => {
      if (lastEnd < filler.start) {
        segments.push(
          <span key={`text-${lastEnd}`} className="text-gray-100">
            {transcript.substring(lastEnd, filler.start)}
          </span>
        );
      }

      segments.push(
        <span
          key={`filler-${filler.start}`}
          className="bg-red-500 text-white px-1 py-0.5 rounded border-2 border-red-600 font-semibold mx-0.5"
          title={`Filler word: "${filler.word}"`}
        >
          {transcript.substring(filler.start, filler.end)}
        </span>
      );

      lastEnd = filler.end;
    });

    if (lastEnd < transcript.length) {
      segments.push(
        <span key={`text-${lastEnd}`} className="text-gray-100">
          {transcript.substring(lastEnd)}
        </span>
      );
    }

    return segments;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Interview Analytics
              {isLive && (
                <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded-full animate-pulse">
                  🔴 LIVE
                </span>
              )}
            </h1>
            <p className="text-purple-200">Session ID: {safeData.sessionId}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
          >
            Back to Home
          </button>
        </div>

        {analyticsData.realtime?.isLive && (
          <div className="bg-purple-800/30 border border-purple-600/30 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">🔴 Live Interview Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-purple-300">Current Question:</span>
                <span className="text-white ml-2">{analyticsData.realtime.currentQuestion}/10</span>
              </div>
              <div>
                <span className="text-purple-300">Recording:</span>
                <span className={`ml-2 ${analyticsData.realtime.isRecording ? 'text-red-400' : 'text-gray-400'}`}>
                  {analyticsData.realtime.isRecording ? 'Active' : 'Paused'}
                </span>
              </div>
              <div>
                <span className="text-purple-300">Live Issues:</span>
                <span className="text-yellow-400 ml-2">
                  {(analyticsData.realtime.realtimeIssues?.filler_count || 0) + 
                   (analyticsData.realtime.realtimeIssues?.long_pauses || 0)}
                </span>
              </div>
              <div>
                <span className="text-purple-300">Auto-refresh:</span>
                <span className="text-green-400 ml-2">Every 3s</span>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">{safeData.overallScore}%</div>
              <div className="text-white font-medium">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{safeData.duration}</div>
              <div className="text-purple-300">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{safeData.completedQuestions}/{safeData.totalQuestions}</div>
              <div className="text-purple-300">Questions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{safeData.fillerWords.total}</div>
              <div className="text-purple-300">
                Filler Words
                {safeData.fillerWords.realtime_count > 0 && (
                  <span className="text-yellow-400 text-sm ml-1">
                    (+{safeData.fillerWords.realtime_count} live)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {safeData.timeline && safeData.timeline.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">🔴 Real-time Performance Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safeData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} name="Confidence" />
                <Line type="monotone" dataKey="clarity" stroke="#06b6d4" strokeWidth={2} name="Clarity" />
                <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} name="Issues" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Performance Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Confidence', score: safeData.scores.confidence },
                { name: 'Clarity', score: safeData.scores.clarity },
                { name: 'Technical', score: safeData.scores.technical_accuracy },
                { name: 'Communication', score: safeData.scores.communication }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Filler Words Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={safeData.fillerWords.breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ word, count }) => `${word}: ${count}`}
                  outerRadius={100}
                  fill="#8b5cf6"
                  dataKey="count"
                >
                  {safeData.fillerWords.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-green-400 mb-4">✅ Strengths</h3>
            {safeData.feedback.strengths && safeData.feedback.strengths.length > 0 ? (
              <ul className="space-y-2">
                {safeData.feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-green-100 text-sm">• {strength}</li>
                ))}
              </ul>
            ) : (
              <p className="text-green-100 text-sm italic">No specific strengths identified. Keep working on consistency!</p>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">⚠️ Areas to Improve</h3>
            {safeData.feedback.improvements && safeData.feedback.improvements.length > 0 ? (
              <ul className="space-y-2">
                {safeData.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="text-yellow-100 text-sm">• {improvement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-yellow-100 text-sm italic">Well done! No major areas of improvement identified.</p>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">💡 Recommendations</h3>
            {safeData.feedback.recommendations && safeData.feedback.recommendations.length > 0 ? (
              <ul className="space-y-2">
                {safeData.feedback.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-blue-100 text-sm">• {recommendation}</li>
                ))}
              </ul>
            ) : (
              <p className="text-blue-100 text-sm italic">Keep practicing and maintaining your current performance level.</p>
            )}
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">📋 Questions & Your Answers</h2>
          <div className="space-y-4">
            {safeData.questions && safeData.questions.length > 0 ? (
              safeData.questions.map((question, index) => {
                const answer = safeData.answers && 
                  safeData.answers.find(a => a.questionNumber === question.questionNumber);
                const isExpanded = expandedQuestion === index;

              return (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
                  <div
                    onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                    className="p-6 cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">
                          Question {question.questionNumber}
                        </h4>
                        <p className="text-purple-200">{question.questionText}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/20 p-6 bg-black/20">
                      {answer ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-gray-400 text-sm mb-1">Answer Duration</p>
                              <p className="text-white font-semibold">
                                {answer.answerDuration?.toFixed(1) || '0'} sec
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-gray-400 text-sm mb-1">Filler Words Count</p>
                              <p className="text-orange-400 font-semibold">
                                {answer.fillerWordsCount || 0}
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-gray-400 text-sm mb-1">Pauses Detected</p>
                              <p className="text-yellow-400 font-semibold">
                                {answer.pauseCount || 0}
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-gray-400 text-sm mb-1">Technical Accuracy</p>
                              <p className="text-purple-400 font-semibold">
                                {answer.technicalAccuracy || 0}%
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 border-t border-white/10 pt-6">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                              <p className="text-gray-400 text-sm mb-2">Confidence Score</p>
                              <p className="text-cyan-400 font-semibold text-lg">
                                {answer.confidenceScore || 0}%
                              </p>
                              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-cyan-400 h-2 rounded-full" 
                                  style={{width: `${answer.confidenceScore || 0}%`}}
                                ></div>
                              </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                              <p className="text-gray-400 text-sm mb-2">Clarity Score</p>
                              <p className="text-green-400 font-semibold text-lg">
                                {answer.clarityScore || 0}%
                              </p>
                              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-green-400 h-2 rounded-full" 
                                  style={{width: `${answer.clarityScore || 0}%`}}
                                ></div>
                              </div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                              <p className="text-gray-400 text-sm mb-2">Overall Quality</p>
                              <p className="text-purple-400 font-semibold text-lg">
                                {Math.round(((answer.confidenceScore || 0) + (answer.clarityScore || 0)) / 2)}%
                              </p>
                              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-purple-400 h-2 rounded-full" 
                                  style={{width: `${Math.round(((answer.confidenceScore || 0) + (answer.clarityScore || 0)) / 2)}%`}}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {answer.fillerWords && answer.fillerWords.length > 0 && (
                            <div className="mb-6">
                          <h5 className="text-sm font-semibold text-orange-300 mb-3">
                            🚨 Detected Filler Words:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {answer.fillerWords.map((filler, i) => (
                              <div
                                key={i}
                                className="bg-red-500/20 border border-red-500/50 rounded px-3 py-1 text-sm"
                              >
                                <span className="text-red-300 font-semibold">
                                  {filler.word}
                                </span>
                                <span className="text-red-200 text-xs ml-2">
                                  ({filler.count}x)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6">
                        <h5 className="text-sm font-semibold text-white mb-3">
                          📝 Your Answer (Filler words highlighted):
                        </h5>
                        <div className="bg-black/30 rounded-lg p-4 border border-white/10 leading-relaxed">
                          {renderHighlightedTranscript(
                            answer.transcript,
                            answer.fillerPositions
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          ℹ️ Red highlighted boxes indicate detected filler words
                        </p>
                      </div>
                      {answer.pauseCount > 0 && (
                        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-yellow-300 mb-2">
                            ⏸️ Pause Analysis
                          </h5>
                          <p className="text-yellow-100 text-sm">
                            Number of pauses detected: <span className="font-semibold">{answer.pauseCount}</span>
                          </p>
                          {answer.pauseDurations && answer.pauseDurations.length > 0 && (
                            <p className="text-yellow-100 text-sm mt-2">
                              Average pause duration:{' '}
                              <span className="font-semibold">
                                {(
                                  answer.pauseDurations.reduce((a, b) => a + b, 0) /
                                  answer.pauseDurations.length
                                ).toFixed(2)}
                                s
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </>
                      ) : (
                        <div className="py-6">
                          <p className="text-yellow-300">❌ No transcript recorded for this question</p>
                        </div>
                      )}
                    </div>
                  )}
                  {!isExpanded && answer && (
                    <div className="px-6 py-4 bg-black/20 border-t border-white/20 text-sm">
                      <div className="flex flex-wrap gap-4">
                        <span className="text-gray-300">⏱️ <span className="text-white font-semibold">{answer.answerDuration?.toFixed(1) || '0'}s</span></span>
                        <span className="text-gray-300">🚨 Fillers: <span className="text-orange-400 font-semibold">{answer.fillerWordsCount || 0}</span></span>
                        <span className="text-gray-300">🎯 Confidence: <span className="text-cyan-400 font-semibold">{answer.confidenceScore || 0}%</span></span>
                        <span className="text-gray-300">💬 Clarity: <span className="text-green-400 font-semibold">{answer.clarityScore || 0}%</span></span>
                        <span className="text-gray-300">⏸️ Pauses: <span className="text-yellow-400 font-semibold">{answer.pauseCount || 0}</span></span>
                      </div>
                    </div>
                  )}
                  {!isExpanded && !answer && (
                    <div className="px-6 py-3 bg-black/20 border-t border-white/20 text-sm text-yellow-300">
                      ⚠️ No answer recorded for this question
                    </div>
                  )}
                </div>
              );
              })
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <p className="text-yellow-300">No questions and answers data available yet. Complete your interview to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;