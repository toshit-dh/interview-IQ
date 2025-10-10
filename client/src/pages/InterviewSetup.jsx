import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Mic,
  Video,
  CheckCircle,
  AlertCircle,
  Loader,
  Play,
  Maximize,
  Lock,
  Clock,
  User,
  Brain,
  Target,
  XCircle,
} from "lucide-react";

export function InterviewSetup () {
  // Interview configuration from state/props
  const { difficulty, llm, interviewType, persona, module } =
    location.state || {};

  const interviewConfig = {
    difficulty,
    llm,
    interviewType,
    persona,
    module,
  };

  const [micPermission, setMicPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCreatingInterview, setIsCreatingInterview] = useState(false);
  const [interviewCreated, setInterviewCreated] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Check fullscreen status
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", checkFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", checkFullscreen);
  }, []);

  // Request permissions
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      alert("Microphone access denied. Please allow access to continue.");
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      alert("Camera access denied. Please allow access to continue.");
    }
  };

  // Create interview with loading
  const createInterview = async () => {
    setIsCreatingInterview(true);
    setLoadingProgress(0);

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCreatingInterview(false);
          setInterviewCreated(true);
          return 100;
        }
        return prev + 20;
      });
    }, 1000);
  };

  // Enter fullscreen
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  // Start interview
  const startInterview = () => {
    if (canStart) {
      alert("Starting interview...");
      // Navigate to interview screen
    }
  };

  const canStart =
    isFullscreen &&
    micPermission &&
    (interviewConfig.interviewType === "audio" || cameraPermission) &&
    interviewCreated;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Interview Setup
          </h1>
          <p className="text-gray-400">
            Complete all requirements before starting your interview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Interview Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Interview Configuration
              </h2>

              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300 text-sm">Difficulty</span>
                    </div>
                    <span className="text-white font-semibold">
                      {interviewConfig.difficulty}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300 text-sm">AI Model</span>
                    </div>
                    <span className="text-white font-semibold">
                      {interviewConfig.llm}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {interviewConfig.interviewType === "audio" ? (
                        <Mic className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Video className="w-5 h-5 text-purple-400" />
                      )}
                      <span className="text-gray-300 text-sm">Type</span>
                    </div>
                    <span className="text-white font-semibold capitalize">
                      {interviewConfig.interviewType}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300 text-sm">Persona</span>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {interviewConfig.persona}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Permissions & Setup */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-6">
                System Checks
              </h2>

              <div className="space-y-4">
                {/* Microphone Permission */}
                <div
                  className={`bg-slate-800/50 rounded-lg p-4 border ${
                    micPermission
                      ? "border-green-500/20"
                      : "border-purple-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${
                          micPermission ? "bg-green-500/20" : "bg-purple-500/20"
                        } rounded-full flex items-center justify-center`}
                      >
                        <Mic
                          className={`w-5 h-5 ${
                            micPermission ? "text-green-400" : "text-purple-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          Microphone
                        </h3>
                        <p className="text-xs text-gray-400">Required</p>
                      </div>
                    </div>
                    {micPermission ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  {!micPermission && (
                    <button
                      onClick={requestMicPermission}
                      className="w-full py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-semibold"
                    >
                      Grant Access
                    </button>
                  )}
                </div>

                {/* Camera Permission */}
                {interviewConfig.interviewType === "video" && (
                  <div
                    className={`bg-slate-800/50 rounded-lg p-4 border ${
                      cameraPermission
                        ? "border-green-500/20"
                        : "border-purple-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 ${
                            cameraPermission
                              ? "bg-green-500/20"
                              : "bg-pink-500/20"
                          } rounded-full flex items-center justify-center`}
                        >
                          <Video
                            className={`w-5 h-5 ${
                              cameraPermission
                                ? "text-green-400"
                                : "text-pink-400"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">
                            Camera
                          </h3>
                          <p className="text-xs text-gray-400">Required</p>
                        </div>
                      </div>
                      {cameraPermission ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    {!cameraPermission && (
                      <button
                        onClick={requestCameraPermission}
                        className="w-full py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-all text-sm font-semibold"
                      >
                        Grant Access
                      </button>
                    )}
                  </div>
                )}

                {/* Fullscreen */}
                <div
                  className={`bg-slate-800/50 rounded-lg p-4 border ${
                    isFullscreen
                      ? "border-green-500/20"
                      : "border-purple-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${
                          isFullscreen ? "bg-green-500/20" : "bg-blue-500/20"
                        } rounded-full flex items-center justify-center`}
                      >
                        <Maximize
                          className={`w-5 h-5 ${
                            isFullscreen ? "text-green-400" : "text-blue-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          Fullscreen
                        </h3>
                        <p className="text-xs text-gray-400">Required</p>
                      </div>
                    </div>
                    {isFullscreen ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  {!isFullscreen && (
                    <button
                      onClick={enterFullscreen}
                      className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold"
                    >
                      Enable Fullscreen
                    </button>
                  )}
                </div>

                {/* Interview Creation */}
                <div
                  className={`bg-slate-800/50 rounded-lg p-4 border ${
                    interviewCreated
                      ? "border-green-500/20"
                      : "border-purple-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${
                          interviewCreated
                            ? "bg-green-500/20"
                            : "bg-purple-500/20"
                        } rounded-full flex items-center justify-center`}
                      >
                        {isCreatingInterview ? (
                          <Loader className="w-5 h-5 text-purple-400 animate-spin" />
                        ) : interviewCreated ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          Interview Setup
                        </h3>
                        <p className="text-xs text-gray-400">
                          {isCreatingInterview
                            ? "Creating..."
                            : interviewCreated
                            ? "Ready"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                    {interviewCreated && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                  </div>

                  {isCreatingInterview && (
                    <div className="space-y-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-purple-400 text-center">
                        {loadingProgress}%
                      </p>
                    </div>
                  )}

                  {!interviewCreated && !isCreatingInterview && (
                    <button
                      onClick={createInterview}
                      disabled={
                        !micPermission ||
                        (interviewConfig.interviewType === "video" &&
                          !cameraPermission)
                      }
                      className={`w-full py-2 rounded-lg transition-all text-sm font-semibold ${
                        micPermission &&
                        (interviewConfig.interviewType === "audio" ||
                          cameraPermission)
                          ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                          : "bg-gray-600/20 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Create Interview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Instructions & Start */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Instructions
              </h2>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-400 font-semibold mb-3 flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Important Guidelines
                </h3>
                <ul className="space-y-3 text-gray-300 text-sm">
                  <li className="flex items-start space-x-2">
                    <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Do not exit fullscreen during interview</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Maximize className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Keep browser window maximized</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Mic className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Speak clearly and audibly</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Interview will be recorded & analyzed</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={startInterview}
                  disabled={!canStart}
                  className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                    canStart
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 cursor-pointer shadow-lg"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Play className="w-5 h-5" />
                  <span>Start Interview</span>
                </button>

                {!canStart && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10">
                    <p className="text-sm text-gray-400 text-center">
                      Complete all system checks to start
                    </p>
                  </div>
                )}

                {canStart && (
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-400 text-center font-semibold">
                      ✓ All systems ready! You can start now
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

