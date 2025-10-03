import React, { useState, useEffect } from "react";
import {
  X,
  Mic,
  Volume2,
  User,
  Bot,
  CheckCircle,
  TrendingUp,
  Star,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
export function AudioInterview() {
  const navigate = useNavigate();
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(true); // Recording from start
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        alert("You exited fullscreen. Interview will end.");
        navigate("/"); // or redirect to another safe page
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  // Simulate interviewer speaking
  useEffect(() => {
    const interval = setInterval(() => {
      setIsInterviewerSpeaking((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Wave animation component
  const WaveCircle = ({ isSpeaking, label, icon: Icon, color }) => {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {/* Outer waves */}
          {isSpeaking && (
            <>
              <div
                className={`absolute inset-0 rounded-full ${color} opacity-20 animate-ping`}
                style={{ animationDuration: "1.5s" }}
              ></div>
              <div
                className={`absolute -inset-4 rounded-full ${color} opacity-10 animate-ping`}
                style={{ animationDuration: "2s" }}
              ></div>
              <div
                className={`absolute -inset-8 rounded-full ${color} opacity-5 animate-ping`}
                style={{ animationDuration: "2.5s" }}
              ></div>
            </>
          )}

          {/* Main circle */}
          <div
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
              isSpeaking
                ? `${color} shadow-2xl scale-110`
                : "bg-slate-800 shadow-lg"
            }`}
          >
            <Icon
              className={`w-24 h-24 transition-colors duration-300 ${
                isSpeaking ? "text-white" : "text-gray-400"
              }`}
            />

            {/* Inner pulse effect */}
            {isSpeaking && (
              <div
                className={`absolute inset-4 rounded-full ${color} opacity-30 animate-pulse`}
              ></div>
            )}
          </div>

          {/* Audio bars visualization */}
          {isSpeaking && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-end space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 ${color} rounded-full animate-pulse`}
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.6s",
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Label */}
        <div className="text-center">
          <p
            className={`text-2xl font-bold transition-colors duration-300 ${
              isSpeaking ? "text-white" : "text-gray-400"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-sm mt-2 transition-colors duration-300 ${
              isSpeaking ? "text-green-400" : "text-gray-500"
            }`}
          >
            {isSpeaking ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Speaking...</span>
              </span>
            ) : (
              "Listening..."
            )}
          </p>
        </div>
      </div>
    );
  };

  const EndConfirmModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl p-8 max-w-md mx-4 border border-purple-500/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">End Interview?</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to end this interview? Your progress will be
          saved and analyzed.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowEndConfirm(false)}
            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => alert("Interview ended! Redirecting to results...")}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/20 flex items-center justify-between px-8 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white font-semibold">
            Interview in Progress
          </span>
        </div>

        <button
          onClick={() => setShowEndConfirm(true)}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all border border-red-500/30 flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>End Interview</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="h-full pt-16 pb-32 flex items-center justify-center">
        <div className="flex items-center justify-center space-x-32">
          {/* AI Interviewer */}
          <WaveCircle
            isSpeaking={isInterviewerSpeaking}
            label="AI Interviewer"
            icon={Bot}
            color="bg-purple-500"
          />

          {/* User */}
          <WaveCircle
            isSpeaking={isUserSpeaking}
            label="You"
            icon={User}
            color="bg-pink-500"
          />
        </div>
      </div>

      {/* Right Panel - AI Insights */}
      <div className="absolute top-20 right-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 max-w-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 text-purple-400 mr-2" />
          AI Insights
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-lg">
            <Volume2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Speak clearly and at a moderate pace
            </p>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg">
            <Mic className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Avoid filler words like "um" and "uh"
            </p>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Take a brief pause before answering
            </p>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Use specific examples in your responses
            </p>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-pink-500/10 rounded-lg">
            <Star className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Maintain a confident tone throughout
            </p>
          </div>
        </div>
      </div>

      {/* Current Question Display - Bottom Center */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 max-w-2xl w-full px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <p className="text-sm text-purple-400 mb-2">Question 3 of 10</p>
          <p className="text-lg text-white">
            Tell me about a time when you had to work with a difficult team
            member. How did you handle the situation?
          </p>
        </div>
      </div>

      {/* Interview Info Panel - Top Left */}
      <div className="absolute top-20 left-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">Duration: 12:34</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">Questions: 3/10</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">Path: Frontend</span>
          </div>
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && <EndConfirmModal />}
    </div>
  );
}
