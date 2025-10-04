import React, { useState, useEffect,useRef} from "react";
import {
  User,
  Bot,
} from "lucide-react";
import { socket } from "../services/socket";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/AudioInterview/TopBar";
import WaveCircle from "../components/AudioInterview/WaveCircle";
import AIInsightsPanel from "../components/AudioInterview/AIInsightsPanel";
import CurrentQuestionDisplay from "../components/AudioInterview/CurrentQuestionDisplay";
import InterviewInfoPanel from "../components/AudioInterview/InterviewInfoPanel";
import EndInterviewModal from "../components/AudioInterview/EndInterviewModal";
import InterviewCancelledModal from "../components/AudioInterview/InterviewCancelledModal";

export function AudioInterview() {
  const navigate = useNavigate();
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [insights, setInsights] = useState([
    { insightType: "clarity", text: "Speak clearly and at a moderate pace" },
    {
      insightType: "fillerWords",
      text: "Avoid filler words like 'um' and 'uh'",
    },
    { insightType: "pause", text: "Take a brief pause before answering" },
    {
      insightType: "examples",
      text: "Use specific examples in your responses",
    },
    { insightType: "confidence", text: "Maintain a confident tone throughout" },
  ]);

  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowCancelledModal(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInterviewerSpeaking((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Connect to socket
    checkMicrophonePermission();
    socket.on("connect", () => {
      console.log("Connected to backend via WebSocket");
      // checkMicrophonePermission()
    });

    socket.on("insights", (data) => {
      console.log("Insights received:", data);
      setInsights(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from backend");
    });

    return () => {
      socket.off("connect");
      socket.off("insights");
      socket.off("disconnect");
    };
  }, []);

  
  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "microphone" });
      console.log("Microphone permission state:", result.state);

      if (result.state === "granted") {
        startRecording();
      } else if (result.state === "prompt") {
        requestMicrophoneAccess();
      } else {
        alert(
          "Microphone access denied. Please enable it in browser settings."
        );
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted", stream);
      startRecording(stream);
    } catch (err) {
      console.error("Microphone access denied", err);
      setShowCancelledModal(true)
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          socket.emit("audio-chunk", event.data);
        }
      });

      mediaRecorderRef.current.start(1000); // send chunk every 1s
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

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
        questionText="Tell me about a time when you had to work with a difficult team
            member. How did you handle the situation?"
      />
      <InterviewInfoPanel
        duration="12:34"
        questionCount="3/10"
        path="Frontend"
      />
      {showEndConfirm && (
        <EndInterviewModal onCancel={() => setShowEndConfirm(false)} />
      )}
      {showCancelledModal && <InterviewCancelledModal />}
    </div>
  );
}
