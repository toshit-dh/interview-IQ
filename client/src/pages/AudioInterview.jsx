import React, { useState, useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";
import { disconnectSocket } from "../services/socket";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/AudioInterview/TopBar";
import WaveCircle from "../components/AudioInterview/WaveCircle";
import AIInsightsPanel from "../components/AudioInterview/AIInsightsPanel";
import CurrentQuestionDisplay from "../components/AudioInterview/CurrentQuestionDisplay";
import InterviewInfoPanel from "../components/AudioInterview/InterviewInfoPanel";
import EndInterviewModal from "../components/AudioInterview/EndInterviewModal";
import InterviewCancelledModal from "../components/AudioInterview/InterviewCancelledModal";

export function AudioInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, path, module,socket } = location.state || {};

  // --- Refs ---
  const mediaRecorderRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // --- States ---
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [duration, setDuration] = useState("00:00");
  const [insights,setInsights] = useState([
    { insightType: "pause", text: "Take a brief pause before answering" },
    {
      insightType: "examples",
      text: "Use specific examples in your responses",
    },
    { insightType: "confidence", text: "Maintain a confident tone throughout" },
  ]);

  // --- Helper: format seconds to mm:ss ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // --- Handle exiting fullscreen ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowCancelledModal(true);
        setTimeout(() => navigate("/"), 3000);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [navigate]);

  // --- Demo: toggle AI speaking animation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setIsInterviewerSpeaking((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- Connect to socket once ---
  useEffect(() => {
    if(!socket || !roomId) return;
    socket.emit("joinRoom",roomId)
    socket.on("insights", (newInsight) => {
      setInsights((prev) => [...prev, newInsight]); 
    });
    return () => {
      disconnectSocket();
    };
  }, []);

  // --- Interview Timer (optimized) ---
  useEffect(() => {
    startTimeRef.current = Date.now();
    let lastSeconds = 0;

    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      if (elapsedSeconds !== lastSeconds) {
        setDuration(formatTime(elapsedSeconds));
        lastSeconds = elapsedSeconds;
      }
    }, 500);

    return () => clearInterval(timerRef.current);
  }, []);

  // --- Audio recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0 && socket) {
          socket.current.emit("audio-chunk", event.data);
        }
      });

      mediaRecorderRef.current.start(1000); // send chunk every 1s
    } catch (err) {
      console.error("🎙️ Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden">
      <TopBar onEndClick={() => setShowEndConfirm(true)} />

      <div className="h-full pt-16 pb-32 flex items-center justify-center">
        <div className="flex items-center justify-center space-x-32">
          <WaveCircle
            isSpeaking={isInterviewerSpeaking}
            label="AI Interviewer"
            icon={Bot}
            color="bg-purple-500"
          />
          <WaveCircle
            isSpeaking={isUserSpeaking}
            label="You"
            icon={User}
            color="bg-pink-500"
          />
        </div>
      </div>

      <AIInsightsPanel insights={insights} />

      <CurrentQuestionDisplay
        questionNumber={3}
        totalQuestions={10}
        questionText="Tell me about a time when you had to work with a difficult team member. How did you handle the situation?"
      />

      {/* ⏱ Duration auto-updating every second */}
      <InterviewInfoPanel
        duration={duration}
        questionCount="3/10"
        path={path}
        module={module}
      />

      {showEndConfirm && (
        <EndInterviewModal onCancel={() => setShowEndConfirm(false)} />
      )}
      {showCancelledModal && <InterviewCancelledModal />}
    </div>
  );
}
