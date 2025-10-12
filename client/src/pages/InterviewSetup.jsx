import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mic,
  Video,
  CheckCircle,
  AlertCircle,
  Play,
  Maximize,
  Lock,
  Clock,
  User,
  Brain,
  Target,
  Shield,
  Check
} from "lucide-react";
import { connectSocket } from "../services/socket";
import toast, { Toaster } from "react-hot-toast";
import { toastStyle } from "../../utils/toastStyle";

export function InterviewSetup() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
        difficulty,
        llm,
        interviewType,
        persona,
        module,
        path,
        pdfMode,
        pdfFile,
        pdfContainsAnswers,
      } =
    location.state || {};

  // Interview configuration from state/props
  const interviewConfig = {
    difficulty,
    llm,
    interviewType,
    persona,
    module,
    path,
    pdfMode,
    pdfFile,
    pdfContainsAnswers
  };

  console.log(interviewConfig);
  

  const [micPermission, setMicPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [creatingInterview, setCreatingInterview] = useState(false);
  useEffect(() => {
    if (!difficulty || !llm || !interviewType || !persona || !module || !path) {
      navigate("/explore");
    }
  }, [difficulty, llm, interviewType, persona, module, path, navigate]);

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
      console.error("Microphone access denied:", error);
      alert("Microphone access denied. Please allow access to continue.");
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Camera access denied. Please allow access to continue.");
    }
  };

  // Create interview with Flask Socket.IO backend (no Express rooms)
  const createInterview = async () => {
    if (!canStart) return;

    try {
      setCreatingInterview(true);
      const socket = connectSocket();
      const sessionData = {
        action: "start-interview",
        config: {
          difficulty,
          llm,
          interviewType,
          persona,
          // IDs if present, else defaults
          moduleId: module?.id || module?._id || "default",
          pathId: path?.id || path?._id || "default",
          // Subject used by Flask to generate domain-specific questions
          subject: module?.name || path?.name || "general",
          interviewMode: "ai-powered",
          maxQuestions: 10,
          expectedDuration:
            difficulty === "Easy" ? 15 : difficulty === "Medium" ? 25 : 35,
        },
        metadata: {
          sessionId:
            "interview_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11),
          startTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        aiConfig: {
          primaryLLM: llm,
          fallbackLLM: llm === "ChatGPT" ? "Claude" : "ChatGPT",
          temperature: difficulty === "Easy" ? 0.3 : difficulty === "Medium" ? 0.5 : 0.7,
          enableFollowUps: true,
          enableFeedback: true,
          evaluationCriteria: [
            "technical_accuracy",
            "communication_clarity",
            "problem_solving",
            "confidence",
            "speaking_quality",
          ],
        },
      };
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const onSessionStarted = (data) => {
        console.log("✅ Interview session started:", data);
        setCreatingInterview(false);
        toast.success("Interview session started!", toastStyle(true));
        navigate("/audio-interview", {
          state: {
            sessionId: data?.sessionId,
            path: path?.name,
            module: module?.name,
            difficulty,
            llm,
            interviewType,
            persona,
          },
        });
        socket.off("interview-session-started", onSessionStarted);
      };

      const onError = (err) => {
        console.error("❌ Flask server error:", err);
        setCreatingInterview(false);
        toast.error(err?.message || "Failed to start interview", toastStyle(false));
        socket.off("error", onError);
      };

      socket.once("interview-session-started", onSessionStarted);
      socket.once("error", onError);

      // Ensure connected then emit
      if (socket.connected) {
        socket.emit("start-interview-session", sessionData);
      } else {
        socket.once("connect", () => {
          console.log("✅ Socket connected to Flask; starting session...");
          socket.emit("start-interview-session", sessionData);
        });
      }
    } catch (error) {
      setCreatingInterview(false);
      console.error("Error starting Flask interview:", error);
      toast.error("An error occurred while creating the interview.", toastStyle(false));
    }
  };


  // Enter fullscreen
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  // Start interview

  const canStart =
    isFullscreen &&
    micPermission &&
    (interviewConfig.interviewType === "audio" || cameraPermission);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <Toaster
        position="bottom-left"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: "",
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 4000,
            theme: {
              primary: "#10B981",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: "#EF4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <div className="max-w-6xl w-full">
        {/* Main Container */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Interview System Check
                </h1>
                <p className="text-purple-100">
                  Verify all requirements before starting
                </p>
              </div>
              <Shield className="w-16 h-16 text-white/20" />
            </div>
          </div>

          <div className="p-8">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center gap-4 mb-8">
              <p className="text-2xl font-bold text-white mb-2">{path.name}</p>
              <p className="text-lg text-purple-300 font-semibold mb-3">
                {module.name}
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {module.description}
              </p>
            </div>
            {/* Interview Details Banner */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Difficulty</p>
                <p className="text-white font-semibold">
                  {interviewConfig.difficulty}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">AI Model</p>
                <p className="text-white font-semibold">
                  {interviewConfig.llm}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                {interviewConfig.interviewType === "audio" ? (
                  <Mic className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                ) : (
                  <Video className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                )}
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-white font-semibold capitalize">
                  {interviewConfig.interviewType}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <User className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Interviewer</p>
                <p className="text-white font-semibold text-sm">
                  {interviewConfig.persona}
                </p>
              </div>
            </div>

            {/* System Requirements Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Left: System Checks */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-purple-400 mr-2" />
                  System Requirements
                </h2>

                {/* Microphone */}
                <div
                  className={`bg-slate-700/30 rounded-xl p-5 border-2 transition-all ${
                    micPermission ? "border-green-500/50" : "border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          micPermission ? "bg-green-500/20" : "bg-slate-600/50"
                        }`}
                      >
                        <Mic
                          className={`w-7 h-7 ${
                            micPermission ? "text-green-400" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          Microphone Access
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Required for audio recording
                        </p>
                      </div>
                    </div>
                    {micPermission ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <button
                        onClick={requestMicPermission}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all"
                      >
                        Allow
                      </button>
                    )}
                  </div>
                </div>

                {/* Camera */}
                {interviewConfig.interviewType === "video" && (
                  <div
                    className={`bg-slate-700/30 rounded-xl p-5 border-2 transition-all ${
                      cameraPermission
                        ? "border-green-500/50"
                        : "border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            cameraPermission
                              ? "bg-green-500/20"
                              : "bg-slate-600/50"
                          }`}
                        >
                          <Video
                            className={`w-7 h-7 ${
                              cameraPermission
                                ? "text-green-400"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            Camera Access
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Required for video recording
                          </p>
                        </div>
                      </div>
                      {cameraPermission ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <button
                          onClick={requestCameraPermission}
                          className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-semibold transition-all"
                        >
                          Allow
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Fullscreen */}
                <div
                  className={`bg-slate-700/30 rounded-xl p-5 border-2 transition-all ${
                    isFullscreen ? "border-green-500/50" : "border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          isFullscreen ? "bg-green-500/20" : "bg-slate-600/50"
                        }`}
                      >
                        <Maximize
                          className={`w-7 h-7 ${
                            isFullscreen ? "text-green-400" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          Fullscreen Mode
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Mandatory for security
                        </p>
                      </div>
                    </div>
                    {isFullscreen ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <button
                        onClick={enterFullscreen}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Instructions & Start */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                  Important Instructions
                </h2>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-medium">
                          No Tab Switching
                        </p>
                        <p className="text-gray-400 text-sm">
                          Stay on this page throughout the interview
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Maximize className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-medium">
                          Fullscreen Required
                        </p>
                        <p className="text-gray-400 text-sm">
                          Must remain in fullscreen mode
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Mic className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-medium">Clear Audio</p>
                        <p className="text-gray-400 text-sm">
                          Speak clearly in a quiet environment
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-medium">Answer</p>
                        <p className="text-gray-400 text-sm">
                          You can answer after 5 sec of question display. Recording will auto start
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-medium">Auto Recording</p>
                        <p className="text-gray-400 text-sm">
                          Interview is automatically recorded & analyzed
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Start Button */}
                <div className="space-y-4">
                  <button
                    onClick={createInterview}
                    disabled={!canStart || creatingInterview}
                    className={`w-full py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-3 ${
                      canStart && !creatingInterview
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50 transform hover:scale-105"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {creatingInterview ? (
                      <svg
                        className="animate-spin w-6 h-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                    <span>
                      {creatingInterview ? "Creating ..." : "Start Interview"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}