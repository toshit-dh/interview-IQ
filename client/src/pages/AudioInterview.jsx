import React, { useState, useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";
import { socket } from "../services/socket";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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

  const interviewConfig = location.state || {};
  const { difficulty, llm, interviewType, persona, path, module } =
    interviewConfig;

  const [countdown, setCountdown] = useState(null);  
  const [duration, setDuration] = useState("00:00");
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [canAnswer, setCanAnswer] = useState(false);
  const [answerQuality, setAnswerQuality] = useState(Array(10).fill("grey"));
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);
  const currentAnswerIndexRef = useRef(0);
  const [liveWarnings, setLiveWarnings] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState({
    questionNumber: 1,
    totalQuestions: 10,
    questionText: "Waiting for your first question...",
    category: "introduction",
  });
  const [insights, setInsights] = useState([
    { insightType: "clarity", text: "Speak clearly and at a moderate pace" },
    {
      insightType: "fillerWords",
      text: "Avoid filler words like 'um' and 'uh'",
    },
    { insightType: "pause", text: "Take a brief pause before answering" },
    { insightType: "confidence", text: "Maintain a confident tone throughout" },
  ]);

  const mediaRecorderRef = useRef(null);
  const mainStreamRef = useRef(null);
  const sessionIdRef = useRef(null);
  const questionRetryRef = useRef(null);
  const waitingForTranscriptionRef = useRef(false);
  const pendingAnswerDataRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const hasStartedSessionRef = useRef(false);
  const listenersRegisteredRef = useRef(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInterviewerSpeaking((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    currentAnswerIndexRef.current = currentAnswerIndex;
  }, [currentAnswerIndex]);

  useEffect(() => {
    if (listenersRegisteredRef.current) {
      return;
    }
    listenersRegisteredRef.current = true;
    console.log("🔌 Setting up socket listeners");

    socket.on("connect", () => {
      console.log("✅ Connected to server, socket ID:", socket.id);
      if (sessionIdRef.current) {
        socket.emit("resume-interview-session", {
          sessionId: sessionIdRef.current,
        });
      }
    });

    socket.on("connected", (data) => {
      console.log("✅ Server confirmed connection:", data);
    });

    socket.on("live-warning", (warningData) => {
      console.log("⚠️ Live warning:", warningData);
      const type = warningData?.type;
      const message = warningData?.message || String(warningData || "");
      if (message) {
        setLiveWarnings(message);
        const timeoutMs = type === "no_answer" ? 5000 : 3000;
        setTimeout(() => setLiveWarnings(""), timeoutMs);
      }
    });

    socket.on("interview-question", (questionData) => {
      console.log("🎯 New question:", questionData);
      setCurrentQuestion({
        questionNumber: questionData.questionNumber,
        totalQuestions: questionData.totalQuestions,
        questionText: questionData.questionText,
        category: questionData.category,
        questionId: questionData.questionId,
      });

      if (questionRetryRef.current) {
        clearInterval(questionRetryRef.current);
        questionRetryRef.current = null;
      }
      setCanAnswer(true);
      setIsInterviewerSpeaking(true);
      setTimeout(() => setIsInterviewerSpeaking(false), 3000);
    });

    socket.on("interview-feedback", (feedbackData) => {
      console.log("📊 Feedback:", feedbackData);
      if (feedbackData.insights) {
        setInsights((prev) => [...prev, ...feedbackData.insights]);
        const first = Array.isArray(feedbackData.insights)
          ? feedbackData.insights[0]
          : null;
        const text = typeof first === "string" ? first : first?.text;
        if (feedbackData.isUpdate && text) {
          setLiveWarnings(text);
          setTimeout(() => setLiveWarnings(""), 3000);
        }
      }
      if (feedbackData.scores) {
        const s = feedbackData.scores || {};
        const commScore =
          s.overall_communication_score ??
          (typeof s.confidence_score === "number" &&
          typeof s.clarity_score === "number"
            ? (s.confidence_score + s.clarity_score) / 2
            : undefined);
        const overallScore = commScore ?? s.overall ?? 70;
        const fillerWordsCount = s.filler_words_count ?? s.fillerCount ?? 0;
        const pauseEvents =
          s.pause_events ?? s.pauseEvents ?? feedbackData.pause_events ?? 0;
        const repetitionCount =
          s.repetition_count ??
          s.repetitionCount ??
          feedbackData.repetition_count ??
          0;
        const emptyAnswer =
          (feedbackData.emptyAnswer ??
            s.empty_answer ??
            s.emptyAnswer ??
            false) === true;

        let quality = "green";
        const isFillerHeavy = fillerWordsCount >= 5;
        const hasLongPauseRed = pauseEvents >= 2;
        const hasLongPauseYellow = pauseEvents === 1;
        const strongRepetition = repetitionCount >= 3;
        const weakRepetition = repetitionCount === 1;
        const lowScore = overallScore < 55;
        const mediumScore = overallScore < 70;

        if (
          emptyAnswer ||
          isFillerHeavy ||
          hasLongPauseRed ||
          strongRepetition ||
          lowScore
        ) {
          quality = "red";
        } else if (
          fillerWordsCount >= 2 ||
          weakRepetition ||
          mediumScore ||
          hasLongPauseYellow
        ) {
          quality = "yellow";
        }

        if (emptyAnswer) {
          setLiveWarnings(
            "No answer detected. Try to speak at least a full sentence."
          );
          setTimeout(() => setLiveWarnings(""), 5000);
          setInsights((prev) => [
            ...prev,
            {
              insightType: "warning",
              text: "No answer detected for the last question.",
            },
          ]);
        }

        const isUpdate = feedbackData.isUpdate === true;
        const qn = Number.isInteger(feedbackData.questionNumber)
          ? feedbackData.questionNumber
          : null;
        const idxToUpdate =
          isUpdate && qn
            ? Math.max(0, Math.min(9, qn - 1))
            : currentAnswerIndexRef.current;

        setAnswerQuality((prev) => {
          const newQuality = [...prev];
          newQuality[idxToUpdate] = quality;
          return newQuality;
        });
        if (!isUpdate) {
          setCurrentAnswerIndex((prev) => Math.min(prev + 1, 9));
        }
      }
    });

    socket.on("interview-session-started", (sessionData) => {
      console.log("🎬 Session started:", sessionData);
      const incomingSessionId =
        sessionData?.sessionId || sessionData?.session_id;
      if (incomingSessionId) {
        sessionIdRef.current = incomingSessionId;

        socket.emit("get-current-question", {
          sessionId: sessionIdRef.current,
        });
      }
    });

    socket.on("interview-complete", (completionData) => {
      console.log("🎉 Interview complete:", completionData);

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.warn("Failed to exit fullscreen:", err);
        });
      }

      setTimeout(() => {
        navigate("/analytics", {
          state: {
            sessionId: completionData.session_id || completionData.sessionId,
            completedQuestions: completionData.completedQuestions,
            interviewData: completionData,
          },
        });
      }, 1000);
    });


    socket.on("interview-ended", (endData) => {
      console.log("🛑 Interview ended:", endData);
      setTimeout(() => {
        navigate("/analytics", {
          state: {
            sessionId: endData.session_id || endData.sessionId,
            completedQuestions: endData.completedQuestions,
            interviewData: endData,
          },
        });
      }, 1000);
    });

    socket.on("audio-transcription", (data) => {
      console.log("🗣️ Transcription:", data);

      if (data && data.success && data.transcript) {
        setInsights((prev) => [
          ...prev,
          {
            insightType: "transcript",
            text: `Received transcription (${data.transcript.length} chars)`,
          },
        ]);
      }
    });

    socket.on("error", (errorData) => {
      console.error("❌ Server error:", errorData);
      alert(`Error: ${errorData.message}`);
    });

    return () => {
      socket.off("connect");
      socket.off("connected");
      socket.off("live-warning");
      socket.off("interview-question");
      socket.off("interview-feedback");
      socket.off("interview-session-started");
      socket.off("interview-complete");
      socket.off("interview-ended");
      socket.off("audio-transcription");
      socket.off("error");
      listenersRegisteredRef.current = false;
    };
  }, []);

  useEffect(() => {
    const isWaiting =
      !currentQuestion?.questionText ||
      /waiting for/i.test(currentQuestion.questionText);
    if (!sessionIdRef.current) return;
    if (!isWaiting) {
      if (questionRetryRef.current) {
        clearInterval(questionRetryRef.current);
        questionRetryRef.current = null;
      }
      return;
    }
    if (!questionRetryRef.current) {
      questionRetryRef.current = setInterval(() => {
        console.log("⏳ Still waiting for question – requesting again...");
        socket.emit("get-current-question", {
          sessionId: sessionIdRef.current,
        });
      }, 2000);
    }
    return () => {
      if (questionRetryRef.current) {
        clearInterval(questionRetryRef.current);
        questionRetryRef.current = null;
      }
    };
  }, [currentQuestion?.questionText]);

  useEffect(() => {
    if (
      !difficulty ||
      !llm ||
      !interviewType ||
      !persona ||
      hasStartedSessionRef.current
    )
      return;

    const incomingSessionId = interviewConfig.sessionId || sessionIdRef.current;
    if (incomingSessionId) {
      sessionIdRef.current = incomingSessionId;
      if (socket.connected) {
        console.log("🔁 Resuming existing session", incomingSessionId);
        socket.emit("resume-interview-session", {
          sessionId: incomingSessionId,
        });
        socket.emit("get-current-question", { sessionId: incomingSessionId });
      } else {
        socket.once("connect", () => {
          console.log(
            "🔁 Resuming existing session after connect",
            incomingSessionId
          );
          socket.emit("resume-interview-session", {
            sessionId: incomingSessionId,
          });
          socket.emit("get-current-question", { sessionId: incomingSessionId });
        });
      }
      hasStartedSessionRef.current = true;
      return;
    }

    const startSession = () => {
      if (socket.connected) {
        console.log("✅ Socket is connected, starting new session now");
        hasStartedSessionRef.current = true;
        startInterviewSession();
      } else {
        console.log("⏳ Socket not connected yet, waiting to start session...");
        socket.once("connect", () => {
          console.log("✅ Socket connected, starting new session now");
          hasStartedSessionRef.current = true;
          startInterviewSession();
        });
      }
    };
    const timer = setTimeout(startSession, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, llm, interviewType, persona, navigate]);

  useEffect(() => {
    if (!canAnswer) {
      setCountdown(null);
      return;
    }

    const isWaiting =
      !currentQuestion?.questionText ||
      /waiting for/i.test(currentQuestion.questionText);
    if (isWaiting) return;

    let counter = 10; // 5 seconds countdown
    setCountdown(counter);

    const interval = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter <= 0) {
        clearInterval(interval);
        setCountdown(null);
        handleStartAnswer(); // auto-start recording
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion?.questionText, canAnswer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && isRecording) {
        e.preventDefault(); // prevent scrolling
        handleAnswerComplete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording]);


  const startRecording = async () => {
    try {
      const preferredType =
        window.MediaRecorder &&
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm"
          : "audio/webm;codecs=opus";
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mainStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: preferredType,
      });

      const audioChunks = [];

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          console.log(`🎤 Chunk: ${event.data.size} bytes`);
        }
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        if (audioChunks.length > 0) {
          const completeBlob = new Blob(audioChunks, { type: preferredType });
          console.log(`🎤 Complete audio: ${completeBlob.size} bytes`);

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(",")[1];
            socket.emit("process-complete-audio", {
              audioData: base64Data,
              timestamp: Date.now(),
              sessionId: sessionIdRef.current,
            });
          };
          reader.readAsDataURL(completeBlob);
        }

        stream.getTracks().forEach((track) => track.stop());
      });

      socket.emit("recording-start", {
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
      });

      mediaRecorderRef.current.start(1000);

      setIsRecording(true);
      setIsUserSpeaking(true);
      setRecordingStartTime(Date.now());
      console.log("🎤 Recording started with codecs opus if supported");
    } catch (err) {
      console.error("❌ Recording error:", err);
      alert("Microphone access failed. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* no-op */
      }
      setIsRecording(false);
      setIsUserSpeaking(false);
      socket.emit("recording-stop", {
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
      });
      console.log("⏹️ Recording stopped");
    }
  };

  const handleAnswerComplete = () => {
    if (!isRecording) {
      console.log("❌ Not recording");
      return;
    }

    stopRecording();
    const duration = recordingStartTime
      ? (Date.now() - recordingStartTime) / 1000
      : 30;

    const answerPayload = {
      transcript: "",
      duration,
      timestamp: new Date().toISOString(),
      questionId: currentQuestion.questionId || "current-question",
      sessionId: sessionIdRef.current,
    };
    console.log("📤 Submitting answer immediately:", answerPayload);
    socket.emit("answer-complete", answerPayload);
    setCanAnswer(false);
    waitingForTranscriptionRef.current = false;
    pendingAnswerDataRef.current = null;
    setInsights((prev) => [
      ...prev,
      {
        insightType: "system",
        text: `Answer submitted (${duration.toFixed(
          1
        )}s). Generating next question...`,
      },
    ]);
  };

  const handleStartAnswer = () => {
    if (!canAnswer) {
      console.log("❌ Cannot answer yet");
      return;
    }
    console.log("🎤 Starting answer");
    startRecording();
  };

  const startInterviewSession = () => {
    const sessionData = {
      action: "start-interview",
      config: {
        difficulty,
        llm,
        interviewType,
        persona,
        moduleId,
        pathId,
        subject: moduleNameFromState || moduleId || pathId || "general",
        interviewMode: "ai-powered",
        maxQuestions: 10,
        expectedDuration:
          difficulty === "Easy" ? 15 : difficulty === "Medium" ? 25 : 35,
      },
      metadata: {
        sessionId: `interview_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      aiConfig: {
        primaryLLM: llm,
        fallbackLLM: llm === "ChatGPT" ? "Claude" : "ChatGPT",
        temperature:
          difficulty === "Easy" ? 0.3 : difficulty === "Medium" ? 0.5 : 0.7,
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

    console.log("🚀 Starting session:", sessionData);
    socket.emit("start-interview-session", sessionData);

    setTimeout(() => {
      try {
        socket.emit("get-current-question", {});
      } catch {
        /* no-op */
      }
    }, 200);
  };

  const handleEndInterview = () => {
    console.log("🛑 Ending interview");
    if (isRecording) {
      stopRecording();
    }
    socket.emit("end-interview", {
      reason: "user_ended",
      timestamp: new Date().toISOString(),
      sessionId: sessionIdRef.current,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden">
      <TopBar onEndClick={() => setShowEndConfirm(true)} />
      <div className="h-full pt-16 pb-32 flex flex-col items-center justify-center">
        {liveWarnings && (
          <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
              ⚠️ {liveWarnings}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-white text-center mb-4 text-lg font-semibold">
            Answer Quality Progress
          </h3>
          <div className="flex space-x-2">
            {answerQuality.map((quality, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-lg border-2 border-white/20 flex items-center justify-center text-sm font-bold ${
                  quality === "green"
                    ? "bg-green-500 text-white"
                    : quality === "yellow"
                    ? "bg-yellow-500 text-black"
                    : quality === "red"
                    ? "bg-red-500 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-300">
            <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>
            Excellent
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-1 ml-4"></span>
            Good
            <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1 ml-4"></span>
            Needs Work
            <span className="inline-block w-3 h-3 bg-gray-600 rounded mr-1 ml-4"></span>
            Pending
          </div>
        </div>

        <div className="flex items-center justify-center space-x-32">
          <WaveCircle
            isSpeaking={isInterviewerSpeaking}
            label="AI Interviewer"
            icon={Bot}
            color="bg-purple-500"
          />
          <WaveCircle
            isSpeaking={isUserSpeaking && isRecording}
            label={isRecording ? "You (Recording)" : "You"}
            icon={User}
            color={isRecording ? "bg-red-500" : "bg-pink-500"}
          />
        </div>
      </div>

      <div className="fixed bottom-8 right-4 z-50 w-72 space-y-2">
        <div className="bg-gray-800 text-white px-6 py-3 rounded-full text-center font-semibold shadow-lg">
          {isRecording ? (
            <span className="text-red-400">🔴 Recording...</span>
          ) : countdown !== null ? (
            <span>⏳ You can answer in {countdown}s</span>
          ) : !canAnswer ? (
            <span>⏳ Waiting for question...</span>
          ) : (
            <button
              onClick={handleStartAnswer}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-full font-semibold shadow"
            >
              🎤 Start Answer
            </button>
          )}
        </div>

        {isRecording && (
          <div>
            <button
              onClick={handleAnswerComplete}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold w-full shadow"
            >
              ✅ Complete Answer Or Click Space Bar
            </button>
          </div>
        )}
      </div>

      <AIInsightsPanel insights={insights} />
      <CurrentQuestionDisplay
        questionNumber={currentQuestion.questionNumber}
        totalQuestions={currentQuestion.totalQuestions}
        questionText={currentQuestion.questionText}
        category={currentQuestion.category}
      />
      <InterviewInfoPanel
        duration={duration}
        questionCount={`${currentQuestion.questionNumber}/${currentQuestion.totalQuestions}`}
        path={path}
        module={module}
        interviewConfig={{ difficulty, llm, interviewType, persona }}
      />

      {showEndConfirm && (
        <EndInterviewModal
          onCancel={() => setShowEndConfirm(false)}
          onConfirm={handleEndInterview}
        />
      )}
      {showCancelledModal && <InterviewCancelledModal />}
    </div>
  );
}
