import React from "react";

export default function WaveCircle({ isSpeaking, label, icon: Icon, color }) {
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
}