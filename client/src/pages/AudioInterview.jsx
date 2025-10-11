import React, { useState, useEffect,useRef} from "react";
import {
  User,
  Bot,
} from "lucide-react";
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
  const { pathId, moduleId } = useParams();
  
  // Get interview configuration from navigation state
  const interviewConfig = location.state || {};
  const { difficulty, llm, interviewType, persona, moduleName, moduleDescription } = interviewConfig;
  
  // Log received configuration for debugging
  useEffect(() => {
    console.log("AudioInterview received config:", interviewConfig);
    if (!difficulty || !llm || !interviewType || !persona) {
      console.warn("Missing interview configuration data!");
    }
  }, [interviewConfig, difficulty, llm, interviewType, persona]);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [canAnswer, setCanAnswer] = useState(false);
  const [answerQuality, setAnswerQuality] = useState(Array(10).fill('grey')); // grey, green, red
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);
  const [liveWarnings, setLiveWarnings] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({
    questionNumber: 1,
    totalQuestions: 10,
    questionText: "Waiting for your first question...",
    category: "introduction"
  });
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
  const sessionIdRef = useRef(null);
  const waitingForTranscriptionRef = useRef(false);
  const pendingAnswerDataRef = useRef(null);

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
    };
    // We intentionally don't include 'navigate' to avoid reruns on navigation object identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Demo: toggle AI speaking animation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setIsInterviewerSpeaking((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Start interview session when component mounts and config is available
  useEffect(() => {
    if (difficulty && llm && interviewType && persona) {
      // Delay starting the session to ensure socket connection is established
      const timer = setTimeout(() => {
        startInterviewSession();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    // startInterviewSession is defined in-scope and stable for our usage; suppress exhaustive-deps to avoid double-start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, llm, interviewType, persona, moduleId, pathId]);

  useEffect(() => {
    // Define all microphone functions inside useEffect to avoid dependency issues
    const startRec = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        // Event listener will be added in startRecording() to avoid duplicates

        mediaRecorderRef.current.start(1000); // send chunk every 1s
      } catch (err) {
        console.error("Error starting recording:", err);
      }
    };

    const requestMicAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted", stream);
        startRec();
      } catch (err) {
        console.error("Microphone access denied", err);
        setShowCancelledModal(true);
      }
    };
    
    const checkMicPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: "microphone" });
        console.log("Microphone permission state:", result.state);

        if (result.state === "granted") {
          startRec();
        } else if (result.state === "prompt") {
          requestMicAccess();
        } else {
          alert("Microphone access denied. Please enable it in browser settings.");
        }
      } catch (err) {
        console.error("Permission check error:", err);
      }
    };
    
    // Connect to socket and check microphone
    checkMicPermission();
    
    socket.on("connect", () => {
      console.log("Connected to backend via WebSocket");
      // If we already have a session, resume it on reconnect
      if (sessionIdRef.current) {
        socket.emit("resume-interview-session", { sessionId: sessionIdRef.current });
      }
    });

    // Backend confirmation of connection
    socket.on("connected", (data) => {
      console.log("Server connection confirmed:", data);
    });

    // Live insights during audio streaming
    socket.on("insights", (data) => {
      console.log("Live insights received:", data);
      setInsights(prev => [...prev, ...data]);
    });

    // Live warnings for filler words and breaks
    socket.on("live-warning", (warningData) => {
      console.log("Live warning received:", warningData);
      setLiveWarnings(warningData.message);
      
      // Clear warning after 3 seconds
      setTimeout(() => {
        setLiveWarnings('');
      }, 3000);
    });

    // Answer quality updates from real-time analysis
    socket.on("answer-quality-update", (qualityData) => {
      console.log("Answer quality update:", qualityData);
      const { blockIndex, quality, reason } = qualityData;
      
      if (blockIndex >= 0 && blockIndex < 10) {
        setAnswerQuality(prev => {
          const updated = [...prev];
          updated[blockIndex] = quality;
          return updated;
        });
        
        console.log(`Block ${blockIndex} marked as ${quality} due to ${reason}`);
      }
    });

    // New questions from backend
    socket.on("interview-question", (questionData) => {
      console.log("🎯 FRONTEND: New question received:", questionData);
      console.log("🎯 FRONTEND: Current question state before update:", currentQuestion);
      
      // Update current question display - backend sends: questionNumber, totalQuestions, questionText, category
      const newQuestion = {
        questionNumber: questionData.questionNumber,
        totalQuestions: questionData.totalQuestions,
        questionText: questionData.questionText,
        category: questionData.category,
        questionId: questionData.questionId
      };
      
      console.log("🎯 FRONTEND: Setting new question:", newQuestion);
      setCurrentQuestion(newQuestion);
      
      // Enable answering for this question
      setCanAnswer(true);
      setIsInterviewerSpeaking(true);
      
      // Stop interviewer speaking after a delay
      setTimeout(() => {
        setIsInterviewerSpeaking(false);
      }, 3000);
      
      // Add system insight
      setInsights(prev => [...prev, {
        insightType: 'system',
        text: `Question ${questionData.questionNumber} loaded. Click "Start Answer" when ready to respond.`
      }]);
    });

    // Feedback after answer analysis
    socket.on("interview-feedback", (feedbackData) => {
      console.log("Answer feedback received:", feedbackData);
      
      // Add feedback insights
      if (feedbackData.insights) {
        setInsights(prev => [...prev, ...feedbackData.insights]);
      }
      
      // Display scores if available
      if (feedbackData.scores) {
        console.log("Speech analysis scores:", feedbackData.scores);
        
        // Determine answer quality based on scores
        const overallScore = feedbackData.scores.overall_communication_score || 70;
        const fillerWordsCount = feedbackData.scores.filler_words_count || 0;
        
        let quality = 'green'; // Default to good
        
        if (fillerWordsCount > 5 || overallScore < 60) {
          quality = 'red'; // Poor quality
        } else if (fillerWordsCount > 2 || overallScore < 75) {
          quality = 'yellow'; // Average quality
        }
        
        // Update answer quality block
        setAnswerQuality(prev => {
          const newQuality = [...prev];
          newQuality[currentAnswerIndex] = quality;
          return newQuality;
        });
        
        // Move to next answer index
        setCurrentAnswerIndex(prev => Math.min(prev + 1, 9));
      }
    });

    // Session started confirmation
    socket.on("interview-session-started", (sessionData) => {
      console.log("Interview session started:", sessionData);
      if (sessionData?.sessionId) {
        sessionIdRef.current = sessionData.sessionId;
      }
    });

    // Interview completion
    socket.on("interview-complete", (completionData) => {
      console.log("Interview completed:", completionData);
      // Navigate directly to analytics when interview naturally completes
      setTimeout(() => {
        navigate("/analytics", { 
          state: { 
            sessionId: completionData.session_id || completionData.sessionId,
            completedQuestions: completionData.completedQuestions,
            interviewData: completionData
          }
        });
      }, 1000);
    });

    // Interview ended by user
    socket.on("interview-ended", (endData) => {
      console.log("Interview ended:", endData);
      // Navigate to analytics page
      setTimeout(() => {
        navigate("/analytics", { 
          state: { 
            sessionId: endData.session_id || endData.sessionId,
            completedQuestions: endData.completedQuestions,
            interviewData: endData
          }
        });
      }, 1000);
    });

    // Audio transcription results
    socket.on("audio-transcription", (data) => {
      console.log("🗣️ Received audio transcription:", data);
      
      if (data.success && data.transcript) {
        // Update UI with transcription results
        console.log(`📝 Transcript: "${data.transcript}"`);
        console.log(`📊 Analysis:`, data.analysis);
        
        // Update answer quality based on analysis
        if (data.analysis && data.analysis.quality) {
          const currentQ = currentAnswerIndex;
          setAnswerQuality(prev => {
            const newQuality = [...prev];
            newQuality[currentQ] = data.analysis.quality;
            return newQuality;
          });
          
          // Show warnings if any
          if (data.analysis.warnings && data.analysis.warnings.length > 0) {
            const warningText = data.analysis.warnings.join('. ');
            setLiveWarnings(`Analysis: ${warningText}`);
            
            // Clear warning after 5 seconds
            setTimeout(() => {
              setLiveWarnings('');
            }, 5000);
          }
        }

        // If we were waiting to finalize the answer until transcription is ready, emit now
        if (waitingForTranscriptionRef.current) {
          const pending = pendingAnswerDataRef.current || {};
          const duration = pending.duration || 30;
          const questionId = pending.questionId || (currentQuestion.questionId || 'current-question');
          const timestamp = pending.timestamp || new Date().toISOString();

          const answerData = {
            transcript: data.transcript,
            duration,
            timestamp,
            questionId
          };
          console.log("📤 Finalizing answer after transcription:", answerData);
          socket.emit("answer-complete", { ...answerData, sessionId: sessionIdRef.current });
          waitingForTranscriptionRef.current = false;
          pendingAnswerDataRef.current = null;

          // Disable answer controls until next question
          setCanAnswer(false);

          // Show feedback that answer was submitted
          setInsights(prev => [...prev, {
            insightType: 'system',
            text: `Answer submitted! Waiting for next question...`
          }]);
        }
      }
    });

    socket.on("audio-error", (errorData) => {
      console.error("Audio processing error:", errorData);
      setLiveWarnings(`Audio processing failed: ${errorData.message}`);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setLiveWarnings('');
      }, 5000);
    });

    // Error handling
    socket.on("error", (errorData) => {
      console.error("Server error:", errorData);
      alert(`Interview Error: ${errorData.message}`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from backend");
    });

    return () => {
      socket.off("connect");
      socket.off("connected");
      socket.off("insights");
      socket.off("live-warning");
      socket.off("answer-quality-update");
      socket.off("interview-question");
      socket.off("interview-feedback");
      socket.off("interview-session-started");
      socket.off("interview-complete");
      socket.off("interview-ended");
      socket.off("audio-transcription");
      socket.off("audio-error");
      socket.off("error");
      socket.off("disconnect");
    };
  }, [navigate, currentAnswerIndex, currentQuestion]);

  // --- Audio recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      // Store complete audio data instead of sending chunks
      const audioChunks = [];
      
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          // Collect audio chunks instead of sending immediately
          audioChunks.push(event.data);
          console.log(`🎤 Collected audio chunk: ${event.data.size} bytes`);
        }
      });

      // Process complete audio when recording stops
      mediaRecorderRef.current.addEventListener("stop", () => {
        if (audioChunks.length > 0) {
          // Combine all chunks into one blob
          const completeAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
          console.log(`🎤 Complete audio size: ${completeAudioBlob.size} bytes`);
          
          // Convert complete audio to base64 and send to server
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
            console.log(`🎤 Sending complete audio: ${base64Data.length} base64 chars`);
            
            // Send complete audio for processing
            socket.emit("process-complete-audio", { 
              audioData: base64Data,
              timestamp: Date.now(),
              sessionId: sessionIdRef.current
            });
          };
          reader.readAsDataURL(completeAudioBlob);
        }
      });

      // Notify server that recording started
  socket.emit("recording-start", { timestamp: Date.now(), sessionId: sessionIdRef.current });
      
      // Start recording - collect all data until stop
      mediaRecorderRef.current.start(); // No chunking - record continuously
      setIsRecording(true);
      setIsUserSpeaking(true);
      setRecordingStartTime(Date.now());
      console.log("🎤 Started recording answer (complete audio mode)");
    } catch (err) {
      console.error("🎙️ Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsUserSpeaking(false);
      console.log("⏹️ Stopped recording");
      
      // Notify server that recording stopped
  socket.emit("recording-stop", { timestamp: Date.now(), sessionId: sessionIdRef.current });
    }
  };

  // Handle answer completion
  const handleAnswerComplete = () => {
    if (!isRecording) {
      console.log("❌ Not currently recording");
      return;
    }

    // Stop current recording; transcription will arrive via socket event
    stopRecording();

    // Calculate recording duration
    const duration = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : 30;

    // Prepare to emit answer-complete when transcription is ready
    waitingForTranscriptionRef.current = true;
    pendingAnswerDataRef.current = {
      duration,
      timestamp: new Date().toISOString(),
      questionId: currentQuestion.questionId || 'current-question'
    };

    // Inform user we're processing their answer
    setInsights(prev => [...prev, {
      insightType: 'system',
      text: `Processing your answer... (${duration.toFixed(1)}s)`
    }]);
  };

  // Handle starting to record answer
  const handleStartAnswer = () => {
    if (!canAnswer) {
      console.log("❌ Cannot answer right now");
      return;
    }
    
    console.log("🎤 Starting to record answer");
    startRecording();
  };

  // Function to start interview session with configuration
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
        // Add interview subject/domain information
        subject: moduleName || pathId || "general", // Use actual module name for subject-specific questions
        interviewMode: "ai-powered",
        maxQuestions: 10,
        expectedDuration: difficulty === "Easy" ? 15 : difficulty === "Medium" ? 25 : 35
      },
      metadata: {
        sessionId: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
          "speaking_quality"
        ]
      }
    };
    
    console.log("Starting comprehensive interview session:", sessionData);
  socket.emit("start-interview-session", sessionData);
    
    // The server will handle initialization and send the first question automatically
  };

  // Handle ending the interview
  const handleEndInterview = () => {
    console.log("Ending interview...");
    
    // Stop recording
    stopRecording();
    
    // Emit end interview event to server
    socket.emit("end-interview", {
      reason: "user_ended",
      timestamp: new Date().toISOString(),
      sessionId: sessionIdRef.current
    });

    // Do not navigate immediately; wait for server to emit 'interview-ended'
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden">
      <TopBar onEndClick={() => setShowEndConfirm(true)} />
      <div className="h-full pt-16 pb-32 flex flex-col items-center justify-center">
        {/* Live Warning Display */}
        {liveWarnings && (
          <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
              ⚠️ {liveWarnings}
            </div>
          </div>
        )}
        
        {/* Answer Quality Blocks */}
        <div className="mb-8">
          <h3 className="text-white text-center mb-4 text-lg font-semibold">Answer Quality Progress</h3>
          <div className="flex space-x-2">
            {answerQuality.map((quality, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-lg border-2 border-white/20 flex items-center justify-center text-sm font-bold ${
                  quality === 'green' ? 'bg-green-500 text-white' :
                  quality === 'yellow' ? 'bg-yellow-500 text-black' :
                  quality === 'red' ? 'bg-red-500 text-white' :
                  'bg-gray-600 text-gray-300'
                }`}
                title={
                  quality === 'green' ? 'Excellent Answer' :
                  quality === 'yellow' ? 'Good Answer' :
                  quality === 'red' ? 'Needs Improvement' :
                  'Not Answered'
                }
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-300">
            <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>Excellent
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-1 ml-4"></span>Good
            <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1 ml-4"></span>Needs Work
            <span className="inline-block w-3 h-3 bg-gray-600 rounded mr-1 ml-4"></span>Pending
          </div>
        </div>

        {/* Wave Circles */}
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
      
      {/* Answer Controls */}
      <div className="absolute top-20 right-4 z-50 space-y-2">
        {/* Test Analytics Button */}
        <button
          onClick={() => navigate("/analytics")}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold w-full shadow-lg"
        >
          📊 View Analytics
        </button>
        
        {!isRecording && canAnswer && (
          <button
            onClick={handleStartAnswer}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold w-full shadow-lg"
          >
            🎤 Start Answer
          </button>
        )}
        
        {isRecording && (
          <div className="space-y-2">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm text-center font-semibold">
              🔴 Recording...
            </div>
            <button
              onClick={handleAnswerComplete}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-semibold w-full shadow-lg"
            >
              ✅ Complete Answer
            </button>
          </div>
        )}
        
        {!canAnswer && !isRecording && (
          <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm text-center">
            Waiting for question...
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

      {/* ⏱ Duration auto-updating every second */}
      <InterviewInfoPanel
        duration={duration}
        questionCount="3/10"
        path="Frontend"
        interviewConfig={{
          difficulty,
          llm,
          interviewType,
          persona
        }}
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
