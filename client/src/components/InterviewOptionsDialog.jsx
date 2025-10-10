import React, { useState } from "react";
import {
  Play,
  X,
  Sparkles,
  Crown,
  Mic,
  Video,
  Zap,
  FileText,
  Upload,
  AlertTriangle,
  CheckSquare,
  Square,
  TrendingUp,
  Cpu,
  Radio,
  Users,
  MessageSquare,
  Gem,
  Drama,
  UserCircle,
  Heart,
  AlertCircle,
} from "lucide-react";

export default function InterviewOptionsDialog({ module, path, onClose }) {
  const [difficulty, setDifficulty] = useState("");
  const [pdfModeEnabled, setPdfModeEnabled] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [pdfContainsAnswers, setPdfContainsAnswers] = useState(false);
  const [llm, setLlm] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [persona, setPersona] = useState("");

  const difficulties = ["Easy", "Medium", "Hard", "Expert"];

  const llms = [
    { name: "ChatGPT", icon: MessageSquare },
    { name: "Claude", icon: Sparkles },
    { name: "Gemini", icon: Gem },
    { name: "Llama", icon: Drama },
  ];

  const personas = [
    {
      id: "professional_man",
      name: "Professional Man",
      icon: UserCircle,
      description: "Formal and detail-oriented",
    },
    {
      id: "professional_woman",
      name: "Professional Woman",
      icon: UserCircle,
      description: "Structured and analytical",
    },
    {
      id: "friendly_mentor",
      name: "Friendly Mentor",
      icon: Heart,
      description: "Supportive and encouraging",
    },
    {
      id: "strict_interviewer",
      name: "Strict Interviewer",
      icon: AlertCircle,
      description: "Challenging and thorough",
    },
  ];

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedPdf(file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const handleStartInterview = async () => {
    const isValid =
      difficulty &&
      interviewType &&
      persona &&
      (!pdfModeEnabled || uploadedPdf) &&
      (pdfModeEnabled && pdfContainsAnswers ? true : llm);

    if (isValid) {
      navigate(`/interview-setup`,{
        difficulty,
        llm: pdfModeEnabled && pdfContainsAnswers ? "PDF" : llm,
        interviewType,
        persona,
        module,
        path,
        pdfMode: pdfModeEnabled,
        pdfFile: uploadedPdf,
        pdfContainsAnswers,
      });
    }
  };

  const isFormComplete =
    difficulty &&
    interviewType &&
    persona &&
    (!pdfModeEnabled || uploadedPdf) &&
    (pdfModeEnabled && pdfContainsAnswers ? true : llm);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-purple-500/30">
        {/* Dialog Header */}
        <div className="bg-gradient-to-r from-purple-900/40 via-slate-900/80 to-blue-900/40 border-b border-purple-500/30 p-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mr-4 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              Setup Your Interview
            </h2>
            <p className="text-gray-400 text-base mt-2 ml-16">
              Configure your interview preferences to get started
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-xl p-2 transition-all"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Difficulty Level */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-800/30 flex items-center justify-center border border-purple-500/30">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <label className="text-2xl font-bold text-white">
                Difficulty Level
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {difficulties.map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-5 px-4 rounded-xl font-semibold text-base transition-all duration-200 transform ${
                    difficulty === level
                      ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/40 scale-105 border-2 border-purple-400"
                      : "bg-slate-700/60 text-gray-300 hover:bg-slate-600/80 hover:scale-102 border border-slate-600/50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* PDF Q&A Mode */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600/30 to-orange-800/30 flex items-center justify-center border border-orange-500/30">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
              <label className="text-2xl font-bold text-white">
                PDF Q&A Interview Mode
              </label>
            </div>

            {/* Enable PDF Mode Checkbox */}
            <button
              onClick={() => {
                setPdfModeEnabled(!pdfModeEnabled);
                if (pdfModeEnabled) {
                  setUploadedPdf(null);
                  setPdfContainsAnswers(false);
                }
              }}
              className="flex items-center space-x-3 p-4 bg-slate-700/60 hover:bg-slate-600/80 rounded-xl transition-all border border-slate-600/50 w-full text-left"
            >
              {pdfModeEnabled ? (
                <CheckSquare className="w-6 h-6 text-purple-400 flex-shrink-0" />
              ) : (
                <Square className="w-6 h-6 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-white font-semibold">
                Enable PDF Q&A Interview Mode?
              </span>
            </button>

            {pdfModeEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                {/* Disclaimer */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-semibold text-sm mb-2">
                        Important Disclaimer
                      </p>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        The PDF Q&A Interview Mode extracts questions and
                        answers based on the content of your uploaded PDF. We do
                        not guarantee the accuracy or completeness of the
                        extracted questions or answers. If the PDF contains
                        incorrect or incomplete information, the results may be
                        affected. The PDF must contain the content of the
                        selected module or path; otherwise, your submission may
                        be rejected. Please review carefully before proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PDF Upload */}
                <div className="bg-slate-700/40 rounded-xl p-6 border-2 border-dashed border-slate-600/50 hover:border-purple-500/50 transition-all">
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-purple-400" />
                      </div>
                      {uploadedPdf ? (
                        <>
                          <p className="text-green-400 font-semibold">
                            {uploadedPdf.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Click to change file
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-white font-semibold">
                            Upload PDF File
                          </p>
                          <p className="text-sm text-gray-400">
                            Click to browse or drag and drop
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* PDF Contains Answers Checkbox */}
                {uploadedPdf && (
                  <button
                    onClick={() => setPdfContainsAnswers(!pdfContainsAnswers)}
                    className="flex items-center space-x-3 p-4 bg-slate-700/60 hover:bg-slate-600/80 rounded-xl transition-all border border-slate-600/50 w-full text-left"
                  >
                    {pdfContainsAnswers ? (
                      <CheckSquare className="w-6 h-6 text-purple-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        This PDF contains answers
                      </p>
                      <p className="text-xs text-gray-400">
                        Skip AI model selection
                      </p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* LLM Selection - Hidden if PDF contains answers */}
          {!(pdfModeEnabled && pdfContainsAnswers) && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-800/30 flex items-center justify-center border border-blue-500/30">
                  <Cpu className="w-6 h-6 text-blue-400" />
                </div>
                <label className="text-2xl font-bold text-white">
                  Evaluation AI Model
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {llms.map((model) => {
                  const LlmIcon = model.icon;
                  return (
                    <button
                      key={model.name}
                      onClick={() => setLlm(model.name)}
                      className={`py-6 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 transform ${
                        llm === model.name
                          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/40 scale-105 border-2 border-purple-400"
                          : "bg-slate-700/60 text-gray-300 hover:bg-slate-600/80 hover:scale-102 border border-slate-600/50"
                      }`}
                    >
                      <LlmIcon className="w-6 h-6" />
                      <span className="text-lg">{model.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interview Type */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-cyan-800/30 flex items-center justify-center border border-cyan-500/30">
                <Radio className="w-6 h-6 text-cyan-400" />
              </div>
              <label className="text-2xl font-bold text-white">
                Interview Type
              </label>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {/* Audio Interview */}
              <button
                onClick={() => setInterviewType("audio")}
                className={`relative py-10 px-6 rounded-2xl font-semibold transition-all duration-200 flex flex-col items-center space-y-3 transform ${
                  interviewType === "audio"
                    ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-500/50 scale-105 border-2 border-blue-400"
                    : "bg-slate-700/60 text-gray-300 hover:bg-slate-600/80 hover:scale-102 border border-slate-600/50"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    interviewType === "audio"
                      ? "bg-white/20"
                      : "bg-slate-600/50"
                  }`}
                >
                  <Mic className="w-9 h-9" />
                </div>
                <span className="text-xl font-bold">Audio Interview</span>
                <span className="text-sm opacity-90">
                  Voice-based interaction
                </span>
              </button>

              {/* Video Interview - Premium */}
              <button
                onClick={() => setInterviewType("video")}
                className={`relative py-10 px-6 rounded-2xl font-semibold transition-all duration-200 flex flex-col items-center space-y-3 overflow-hidden transform ${
                  interviewType === "video"
                    ? "bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-white shadow-2xl shadow-amber-500/60 scale-105 border-2 border-amber-300"
                    : "bg-gradient-to-br from-amber-600/20 via-yellow-600/20 to-amber-700/20 text-amber-300 hover:from-amber-600/30 hover:via-yellow-600/30 hover:to-amber-700/30 hover:scale-102 border-2 border-amber-500/50"
                }`}
              >
                <div className="absolute top-3 right-3">
                  <Crown className="w-6 h-6 text-amber-300" />
                </div>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    interviewType === "video"
                      ? "bg-white/20"
                      : "bg-amber-600/30"
                  }`}
                >
                  <Video className="w-9 h-9" />
                </div>
                <span className="text-xl font-bold">Video Interview</span>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold tracking-wider">
                    PREMIUM
                  </span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Persona Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/30 to-pink-800/30 flex items-center justify-center border border-pink-500/30">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <label className="text-2xl font-bold text-white">
                Interviewer Persona
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {personas.map((p) => {
                const PersonaIcon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`py-6 px-5 rounded-xl font-semibold transition-all duration-200 text-left transform ${
                      persona === p.id
                        ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/40 scale-105 border-2 border-purple-400"
                        : "bg-slate-700/60 text-gray-300 hover:bg-slate-600/80 hover:scale-102 border border-slate-600/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <PersonaIcon className="w-6 h-6" />
                      <span className="font-bold text-lg">{p.name}</span>
                    </div>
                    <p className="text-sm opacity-90">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-6">
            <button
              onClick={handleStartInterview}
              disabled={!isFormComplete}
              className={`w-full py-6 rounded-2xl font-bold text-xl transition-all duration-200 flex items-center justify-center space-x-3 transform ${
                isFormComplete
                  ? "bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white hover:shadow-2xl hover:shadow-green-500/40 hover:scale-105 border-2 border-green-400"
                  : "bg-slate-700/40 text-gray-500 cursor-not-allowed border border-slate-600/30"
              }`}
            >
              {isFormComplete ? (
                <>
                  <Zap className="w-6 h-6" />
                  <span>Start Interview</span>
                  <Play className="w-6 h-6" />
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 opacity-50" />
                  <span>Start Interview</span>
                </>
              )}
            </button>
            {!isFormComplete && (
              <p className="text-center text-gray-400 text-sm mt-3">
                Please complete all selections to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
