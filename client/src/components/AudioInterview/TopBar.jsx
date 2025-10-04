import React from "react";
import { X } from "lucide-react";

export default function TopBar({ onEndClick }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/20 flex items-center justify-between px-8 z-10">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-white font-semibold">Interview in Progress</span>
      </div>
      <button
        onClick={onEndClick}
        className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all border border-red-500/30 flex items-center space-x-2"
      >
        <X className="w-4 h-4" />
        <span>End Interview</span>
      </button>
    </div>
  );
}
