import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, Zap } from 'lucide-react';

export function LoadingPage({ text = "Loading..." }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo/Icon with Animation */}
        <div className="relative">
          {/* Rotating Outer Ring */}
          <div className="absolute inset-0 w-32 h-32 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          
          {/* Pulsing Middle Ring */}
          <div className="absolute inset-2 w-28 h-28 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin-slow"></div>
          
          {/* Center Icon */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
            <Brain className="w-16 h-16 text-white animate-pulse" />
            
            {/* Sparkles around icon */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-blue-400 animate-bounce delay-300" />
            <Zap className="absolute top-0 -left-4 w-5 h-5 text-purple-400 animate-bounce delay-150" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center space-x-2">
            <span>{text}</span>
            <span className="w-12 inline-block text-left text-purple-400">{dots}</span>
          </h2>
          
          {/* Progress Bar */}
          <div className="w-80 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-progress"></div>
          </div>

          <p className="text-gray-400 text-sm">Please wait while we prepare your experience</p>
        </div>

        {/* Loading Indicators */}
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <span className="text-xs text-gray-500">Initializing</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-150"></div>
            <span className="text-xs text-gray-500">Processing</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300"></div>
            <span className="text-xs text-gray-500">Loading</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

