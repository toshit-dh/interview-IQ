import { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap, Target, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoNoBg from '../assets/Interview-iq-logo-nobg.png';
import logoRegular from '../assets/Interview-iq-logo.png';

export default function Welcome() {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  const slogans = [
    "🎯 Where Preparation Meets Opportunity",
    "🚀 Ace Every Interview with AI Confidence", 
    "💡 Your Success Story Starts Here",
    "⭐ Dream Big, Practice Smart, Land Your Job",
    "🔥 Master the Art of Interviewing"
  ];

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    const sloganInterval = setInterval(() => {
      setCurrentSlogan(prev => (prev + 1) % slogans.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => navigate('/'), 1500);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => {
      clearInterval(sloganInterval);
      clearInterval(progressInterval);
    };
  }, [navigate, slogans.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
        
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center px-6 transform transition-all duration-1000 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-3 border-transparent border-t-purple-500 border-r-pink-500 rounded-full animate-spin-slow"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-44 h-44 border-2 border-purple-400/20 rounded-full animate-ping-slow"></div>
            </div>
            <div className="relative z-10 w-36 h-36 mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-full flex items-center justify-center shadow-xl border border-white/20">
              <img 
                src={logoNoBg}
                alt="Interview-IQ Logo" 
                className="w-28 h-28 object-contain animate-float"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = logoRegular;
                }}
              />
              
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
              <Zap className="absolute -bottom-2 -left-2 w-6 h-6 text-blue-400 animate-bounce delay-300" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-52 h-52">
                <div className="absolute inset-0 animate-spin-reverse">
                  <Brain className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 w-8 h-8 text-purple-400" />
                  <Target className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 w-8 h-8 text-pink-400" />
                  <Award className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-8 h-8 text-yellow-400" />
                  <TrendingUp className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient mb-2">
              Interview-IQ
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
              <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl lg:text-2xl text-white font-light mb-2">
              🎯 Master Your Interview.{' '}
              <span className="text-purple-400 font-semibold">Unlock Your Future.</span>
            </h2>
            <p className="text-lg text-gray-300 mb-2">
              🤖 AI-Powered Mock Interview Platform
            </p>
            <p className="text-sm text-purple-300 italic">
              "Practice Like a Pro, Perform Like a Champion"
            </p>
          </div>
          <div className="mb-4 h-10 flex items-center justify-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/10">
              <p className="text-lg text-white font-medium animate-glow transition-all duration-500">
                {slogans[currentSlogan]}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              <div className="text-center animate-float">
                <div className="text-2xl font-bold text-purple-400 mb-1">95%</div>
                <div className="text-gray-400 text-xs">Success</div>
              </div>
              <div className="text-center animate-float delay-300">
                <div className="text-2xl font-bold text-pink-400 mb-1">10K+</div>
                <div className="text-gray-400 text-xs">Users</div>
              </div>
              <div className="text-center animate-float delay-500">
                <div className="text-2xl font-bold text-blue-400 mb-1">AI</div>
                <div className="text-gray-400 text-xs">Powered</div>
              </div>
            </div>
          </div>
          <div className="max-w-sm mx-auto">
            <div className="mb-2">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-lg">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>Loading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
            
            <div className="text-gray-400 animate-pulse text-sm">
              {progress < 20 && "🤖 Initializing AI..."}
              {progress >= 20 && progress < 40 && "🎯 Preparing Questions..."}
              {progress >= 40 && progress < 60 && "📊 Setting Analytics..."}
              {progress >= 60 && progress < 80 && "✨ Customizing..."}
              {progress >= 80 && progress < 100 && "🚀 Almost Ready..."}
              {progress >= 100 && "🎉 Welcome!"}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 animate-float">
          <div className="bg-purple-500/20 backdrop-blur-lg rounded-lg p-2 border border-purple-500/30">
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </div>
        </div>
        <div className="absolute top-20 right-16 animate-float delay-300">
          <div className="bg-pink-500/20 backdrop-blur-lg rounded-lg p-2 border border-pink-500/30">
            <Target className="w-4 h-4 text-pink-400" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20 animate-float delay-500">
          <div className="bg-blue-500/20 backdrop-blur-lg rounded-lg p-2 border border-blue-500/30">
            <Brain className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        <div className="absolute bottom-16 right-20 animate-float delay-700">
          <div className="bg-green-500/20 backdrop-blur-lg rounded-lg p-2 border border-green-500/30">
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { text-shadow: 0 0 30px rgba(139, 92, 246, 0.8), 0 0 40px rgba(236, 72, 153, 0.5); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 12s linear infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}