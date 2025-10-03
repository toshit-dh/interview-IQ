import React, { useState } from 'react';
import { Mic, Video, Crown, Star, CheckCircle, Clock, Brain, Eye, MessageCircle, TrendingUp, Play, Settings } from 'lucide-react';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function InterviewOPtions () {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const { pathId, moduleId } = useParams();
  const handleStartInterview = async () => {
    const elem = document.documentElement; // fullscreen entire page

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else {
        alert(
          "Fullscreen mode is not supported in your browser. You cannot proceed."
        );
        return;
      }

      navigate(`/audio/interview/${pathId}/${moduleId}`);
    } catch (err) {
      console.error("Fullscreen request failed:", err);
      alert("Failed to enter fullscreen. You cannot proceed.");
    }
  };

  const InterviewCard = ({ 
    type, 
    title, 
    description, 
    icon: Icon, 
    features, 
    analysisPoints,
    isPremium = false,
    gradientFrom,
    gradientTo,
    accentColor,
    isSelected,
    onClick
  }) => (
    <div 
      className={`relative rounded-xl shadow-lg border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isPremium 
          ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} border-yellow-500/30 hover:border-yellow-400/50` 
          : `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/20 hover:border-purple-500/40`
      } ${isSelected ? 'ring-2 ring-purple-400 scale-105' : ''}`}
      onClick={onClick}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
            <Crown className="w-3 h-3 mr-1" />
            PREMIUM
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 ${isPremium ? 'bg-yellow-400/20' : 'bg-purple-500/20'} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${isPremium ? 'text-yellow-400' : 'text-purple-400'}`} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${isPremium ? 'text-yellow-300' : 'text-white'}`}>
                {title}
              </h3>
              <p className={`text-sm ${isPremium ? 'text-yellow-200/80' : 'text-gray-300'}`}>
                {description}
              </p>
            </div>
          </div>
          
          {isPremium && (
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-xs text-yellow-200">Premium Experience</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className={`font-semibold mb-3 ${isPremium ? 'text-yellow-300' : 'text-white'}`}>
            Key Features
          </h4>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className={`w-4 h-4 ${isPremium ? 'text-yellow-400' : 'text-green-400'} flex-shrink-0`} />
                <span className={`text-sm ${isPremium ? 'text-yellow-100' : 'text-gray-300'}`}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mb-6">
          <h4 className={`font-semibold mb-3 flex items-center ${isPremium ? 'text-yellow-300' : 'text-white'}`}>
            <Brain className={`w-4 h-4 mr-2 ${isPremium ? 'text-yellow-400' : 'text-purple-400'}`} />
            AI Analysis Points
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {analysisPoints.map((point, index) => (
              <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg ${
                isPremium ? 'bg-yellow-500/10' : 'bg-purple-500/10'
              }`}>
                <point.icon className={`w-3 h-3 ${isPremium ? 'text-yellow-400' : 'text-purple-400'}`} />
                <span className={`text-xs ${isPremium ? 'text-yellow-200' : 'text-gray-300'}`}>
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
          isPremium 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 shadow-lg hover:shadow-xl' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400'
        }`}
        onClick={handleStartInterview}
        >
          <Play className="w-5 h-5" />
          <span>Start {type} Interview</span>
        </button>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-600/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className={`w-3 h-3 ${isPremium ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className={isPremium ? 'text-yellow-200' : 'text-gray-400'}>
                  {type === 'Audio' ? '15-30 min' : '20-45 min'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className={`w-3 h-3 ${isPremium ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className={isPremium ? 'text-yellow-200' : 'text-gray-400'}>
                  {type === 'Audio' ? 'Voice Analysis' : 'Full Behavioral Analysis'}
                </span>
              </div>
            </div>
            {isPremium && (
              <div className="text-yellow-400 font-semibold">
                Premium Only
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const audioFeatures = [
    "Voice-only interview experience",
    "Real-time speech-to-text conversion", 
    "AI voice tone analysis",
    "Communication skill evaluation",
    "Hesitation and pace tracking",
    "Professional audio processing"
  ];

  const audioAnalysisPoints = [
    { icon: Mic, label: "Voice Tone" },
    { icon: MessageCircle, label: "Clarity" },
    { icon: Clock, label: "Hesitation" },
    { icon: TrendingUp, label: "Confidence" },
    { icon: Brain, label: "Keywords" },
    { icon: Settings, label: "Pace Analysis" }
  ];

  const videoFeatures = [
    "Full HD video + audio recording",
    "Advanced facial expression analysis",
    "Real-time eye movement tracking", 
    "Emotion and engagement detection",
    "Body language interpretation",
    "Complete behavioral assessment"
  ];

  const videoAnalysisPoints = [
    { icon: Video, label: "Facial Expressions" },
    { icon: Eye, label: "Eye Movement" },
    { icon: Brain, label: "Emotions" },
    { icon: TrendingUp, label: "Focus Level" },
    { icon: Star, label: "Confidence" },
    { icon: MessageCircle, label: "Engagement" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Interview Experience
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Practice with AI-powered interview simulations
          </p>
          <p className="text-gray-400">
            Select the interview type that matches your preparation goals
          </p>
        </div>

        {/* Interview Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Audio Interview */}
          <InterviewCard
            type="Audio"
            title="Audio Interview"
            description="Voice-only communication skills practice"
            icon={Mic}
            features={audioFeatures}
            analysisPoints={audioAnalysisPoints}
            isPremium={false}
            gradientFrom="from-slate-900"
            gradientTo="to-slate-900"
            accentColor="purple"
            isSelected={selectedType === 'audio'}
            onClick={() => setSelectedType('audio')}
          />

          {/* Video Interview */}
          <InterviewCard
            type="Video"
            title="Video Interview" 
            description="Complete behavioral analysis experience"
            icon={Video}
            features={videoFeatures}
            analysisPoints={videoAnalysisPoints}
            isPremium={true}
            gradientFrom="from-yellow-500/10"
            gradientTo="to-orange-500/10"
            accentColor="yellow"
            isSelected={selectedType === 'video'}
            onClick={() => setSelectedType('video')}
          />
        </div>

        {/* Comparison Table */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="pb-4 text-gray-300 font-medium">Feature</th>
                  <th className="pb-4 text-center text-purple-400 font-medium">Audio Interview</th>
                  <th className="pb-4 text-center text-yellow-400 font-medium">Video Interview</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {[
                  { feature: "Voice Analysis", audio: true, video: true },
                  { feature: "Speech Clarity", audio: true, video: true },
                  { feature: "Tone Detection", audio: true, video: true },
                  { feature: "Facial Expression Analysis", audio: false, video: true },
                  { feature: "Eye Tracking", audio: false, video: true },
                  { feature: "Emotion Recognition", audio: false, video: true },
                  { feature: "Body Language Analysis", audio: false, video: true },
                  { feature: "Engagement Scoring", audio: false, video: true },
                  { feature: "Real HR Experience", audio: false, video: true }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 text-white">{row.feature}</td>
                    <td className="py-3 text-center">
                      {row.audio ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 bg-gray-600 rounded-full mx-auto"></div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {row.video ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 bg-gray-600 rounded-full mx-auto"></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Ready to start your AI-powered interview practice?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-400 hover:to-pink-400 transition-all">
              Try Audio Interview Free
            </button>
            <button className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Upgrade to Premium</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

