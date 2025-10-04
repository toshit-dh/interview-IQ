import React from "react";
import {
  Brain,
  Volume2,
  Mic,
  CheckCircle,
  TrendingUp,
  Star,
} from "lucide-react";

export default function AIInsightsPanel({ insights }) {
  const getIcon = (type) => {
    switch (type) {
      case "clarity":
        return <Volume2 className="w-4 h-4 text-purple-400" />;
      case "fillerWords":
        return <Mic className="w-4 h-4 text-blue-400" />;
      case "pause":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "examples":
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      case "confidence":
        return <Star className="w-4 h-4 text-pink-400" />;
      default:
        return <Brain className="w-4 h-4 text-gray-400" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "clarity":
        return "bg-purple-500/10";
      case "fillerWords":
        return "bg-blue-500/10";
      case "pause":
        return "bg-green-500/10";
      case "examples":
        return "bg-yellow-500/10";
      case "confidence":
        return "bg-pink-500/10";
      default:
        return "bg-gray-500/10";
    }
  };

  return (
    <div className="absolute top-20 right-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 max-w-sm">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Brain className="w-5 h-5 text-purple-400 mr-2" />
        AI Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-3 ${getColor(
              insight.insightType
            )} rounded-lg`}
          >
            {getIcon(insight.insightType)}
            <p className="text-sm text-gray-300">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
