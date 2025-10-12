import React from "react";

export default function CurrentQuestionDisplay({
  questionNumber,
  totalQuestions,
  questionText,
}) {
  return (
    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 max-w-2xl w-full px-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
        <p className="text-sm text-purple-400 mb-2">
          Question {questionNumber} of {totalQuestions}
        </p>
        <p className="text-lg text-white">{questionText}</p>
      </div>
    </div>
  );
}