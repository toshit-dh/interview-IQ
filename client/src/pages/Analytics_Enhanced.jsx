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

  // Fetch analytics data from API
  const fetchAnalytics = async () => {
    try {
      const sessionId = location.state?.sessionId || 'mock-session-' + Date.now();
      
      const response = await fetch(`http://localhost:5000/api/analytics/${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        setIsLive(data.realtime?.isLive || false);
        setLoading(false);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.log('Using mock data due to API error:', error);
      
      // Enhanced mock data with real-time info
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
        
        // Detailed scores
        scores: {
          confidence: 82,
          clarity: 75,
          fluency: 80,
          technical_accuracy: 76,
          communication: 78
        },
        
        // Enhanced filler words analysis
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
        
        // Enhanced speaking metrics
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
        
        // Real-time timeline data
        timeline: [
          { time: 0, confidence: 80, clarity: 75, pace: 140, fillerWords: 0, issues: 0 },
          { time: 5, confidence: 75, clarity: 80, pace: 160, fillerWords: 1, issues: 1 },
          { time: 10, confidence: 70, clarity: 70, pace: 180, fillerWords: 2, issues: 2 },
          { time: 15, confidence: 85, clarity: 85, pace: 150, fillerWords: 0, issues: 0 },
          { time: 20, confidence: 78, clarity: 82, pace: 145, fillerWords: 1, issues: 1 }
        ],
        
        // Question performance
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

  // Set up real-time updates for live sessions
  useEffect(() => {
    fetchAnalytics();
    
    let interval = null;
    if (isLive) {
      interval = setInterval(fetchAnalytics, 3000); // Refresh every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, location.state?.sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyzing your interview performance...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Analytics Data Available</h2>
          <p className="mb-4">Unable to load interview analytics.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Chart colors
  const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
            <p className="text-purple-200">Session ID: {analyticsData.sessionId}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Real-time Status */}
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

        {/* Overall Score Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">{analyticsData.overallScore}%</div>
              <div className="text-white font-medium">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{analyticsData.duration}</div>
              <div className="text-purple-300">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{analyticsData.completedQuestions}/{analyticsData.totalQuestions}</div>
              <div className="text-purple-300">Questions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{analyticsData.fillerWords.total}</div>
              <div className="text-purple-300">
                Filler Words
                {analyticsData.fillerWords.realtime_count > 0 && (
                  <span className="text-yellow-400 text-sm ml-1">
                    (+{analyticsData.fillerWords.realtime_count} live)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Timeline Chart */}
        {analyticsData.timeline && analyticsData.timeline.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">🔴 Real-time Performance Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.timeline}>
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
          {/* Performance Scores */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Performance Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Confidence', score: analyticsData.scores.confidence },
                { name: 'Clarity', score: analyticsData.scores.clarity },
                { name: 'Technical', score: analyticsData.scores.technical_accuracy },
                { name: 'Communication', score: analyticsData.scores.communication }
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

          {/* Filler Words Breakdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Filler Words Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.fillerWords.breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8b5cf6"
                  dataKey="count"
                >
                  {analyticsData.fillerWords.breakdown.map((entry, index) => (
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

        {/* Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Strengths */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-green-400 mb-4">✅ Strengths</h3>
            <ul className="space-y-2">
              {analyticsData.feedback.strengths.map((strength, index) => (
                <li key={index} className="text-green-100 text-sm">• {strength}</li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">⚠️ Areas to Improve</h3>
            <ul className="space-y-2">
              {analyticsData.feedback.improvements.map((improvement, index) => (
                <li key={index} className="text-yellow-100 text-sm">• {improvement}</li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">💡 Recommendations</h3>
            <ul className="space-y-2">
              {analyticsData.feedback.recommendations.map((recommendation, index) => (
                <li key={index} className="text-blue-100 text-sm">• {recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;