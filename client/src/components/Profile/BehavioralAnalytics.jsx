import React from "react";
import {
  Brain,
  Clock,
  MessageCircle,
  TrendingUp,
  Volume2,
  Smile,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function BehavioralAnalytics ({ userData }) {
  const behavioralStats = userData.behavioralStats || {
    avgResponseTime: 0,
    fillerWordsCount: 0,
    avgConfidenceScore: 0,
    sentimentScore: 0,
    speechClarity: 0,
    toneVariation: 0,
  };

  // Helper function to get score color and status
  const getScoreStatus = (score, type) => {
    switch (type) {
      case "responseTime":
        if (score <= 10)
          return {
            color: "text-green-400",
            bg: "bg-green-400/20",
            status: "Excellent",
            icon: CheckCircle,
          };
        if (score <= 20)
          return {
            color: "text-yellow-400",
            bg: "bg-yellow-400/20",
            status: "Good",
            icon: Clock,
          };
        return {
          color: "text-red-400",
          bg: "bg-red-400/20",
          status: "Needs Work",
          icon: AlertTriangle,
        };

      case "fillerWords":
        if (score <= 50)
          return {
            color: "text-green-400",
            bg: "bg-green-400/20",
            status: "Excellent",
            icon: CheckCircle,
          };
        if (score <= 100)
          return {
            color: "text-yellow-400",
            bg: "bg-yellow-400/20",
            status: "Good",
            icon: MessageCircle,
          };
        return {
          color: "text-red-400",
          bg: "bg-red-400/20",
          status: "High Usage",
          icon: AlertTriangle,
        };

      case "percentage":
        if (score >= 80)
          return {
            color: "text-green-400",
            bg: "bg-green-400/20",
            status: "Excellent",
            icon: CheckCircle,
          };
        if (score >= 60)
          return {
            color: "text-yellow-400",
            bg: "bg-yellow-400/20",
            status: "Good",
            icon: TrendingUp,
          };
        return {
          color: "text-red-400",
          bg: "bg-red-400/20",
          status: "Needs Work",
          icon: AlertTriangle,
        };

      case "sentiment":
        if (score >= 0.5)
          return {
            color: "text-green-400",
            bg: "bg-green-400/20",
            status: "Very Positive",
            icon: Smile,
          };
        if (score >= 0)
          return {
            color: "text-yellow-400",
            bg: "bg-yellow-400/20",
            status: "Neutral",
            icon: MessageCircle,
          };
        return {
          color: "text-red-400",
          bg: "bg-red-400/20",
          status: "Negative",
          icon: AlertTriangle,
        };

      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-400/20",
          status: "Unknown",
          icon: Brain,
        };
    }
  };

  // Format sentiment score for display
  const formatSentimentScore = (score) => {
    return (score >= 0 ? "+" : "") + score.toFixed(2);
  };

  // Create circular progress component
  const CircularProgress = ({ percentage, color, size = 60 }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-slate-600"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={color}
            style={{
              transition: "stroke-dashoffset 0.5s ease-in-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{percentage}%</span>
        </div>
      </div>
    );
  };

  const MetricCard = ({
    title,
    value,
    unit,
    type,
    description,
    icon: Icon,
  }) => {
    const status = getScoreStatus(value, type);
    const StatusIcon = status.icon;

    return (
      <div className="bg-slate-800/50 rounded-lg p-5 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 ${status.bg} rounded-lg flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${status.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-white">{title}</h4>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-xs font-medium ${status.color}`}>
              {status.status}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-white">
              {type === "sentiment" ? formatSentimentScore(value) : value}
              {unit && (
                <span className="text-sm font-normal text-gray-400 ml-1">
                  {unit}
                </span>
              )}
            </p>
          </div>

          {type === "percentage" && (
            <CircularProgress
              percentage={value}
              color={status.color.replace("text-", "text-")}
              size={50}
            />
          )}
        </div>

        {/* Progress bar for non-percentage metrics */}
        {type !== "percentage" && type !== "sentiment" && (
          <div className="mt-4">
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${status.color.replace(
                  "text-",
                  "bg-"
                )}`}
                style={{
                  width: `${Math.min(
                    (value /
                      (type === "responseTime"
                        ? 30
                        : type === "fillerWords"
                        ? 200
                        : 100)) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Sentiment bar */}
        {type === "sentiment" && (
          <div className="mt-4">
            <div className="w-full bg-slate-600 rounded-full h-2 relative">
              <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-white opacity-50"></div>
              <div
                className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: "100%" }}
              ></div>
              <div
                className="absolute top-0 w-2 h-2 bg-white rounded-full border-2 border-slate-800 transition-all duration-500"
                style={{
                  left: `${((value + 1) / 2) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>-1.0</span>
              <span>0</span>
              <span>+1.0</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate overall performance score
  const calculateOverallScore = () => {
    const responseTimeScore = Math.max(
      0,
      100 - behavioralStats.avgResponseTime * 3
    );
    const fillerWordsScore = Math.max(
      0,
      100 - behavioralStats.fillerWordsCount / 2
    );
    const confidenceScore = behavioralStats.avgConfidenceScore;
    const sentimentScore = ((behavioralStats.sentimentScore + 1) / 2) * 100;
    const clarityScore = behavioralStats.speechClarity;
    const toneScore = behavioralStats.toneVariation;

    return Math.round(
      (responseTimeScore +
        fillerWordsScore +
        confidenceScore +
        sentimentScore +
        clarityScore +
        toneScore) /
        6
    );
  };

  const overallScore = calculateOverallScore();
  const overallStatus = getScoreStatus(overallScore, "percentage");

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <Brain className="w-5 h-5 text-purple-400 mr-2" />
          Behavioral Analytics
        </h2>
        <p className="text-gray-300 text-sm">
          AI-powered analysis of your interview communication patterns
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-slate-800/30 rounded-lg p-6 mb-8 border border-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Overall Communication Score
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Comprehensive analysis of your interview performance
            </p>
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 ${overallStatus.bg} rounded-lg flex items-center justify-center`}
              >
                <overallStatus.icon
                  className={`w-6 h-6 ${overallStatus.color}`}
                />
              </div>
              <div>
                <p className={`text-lg font-semibold ${overallStatus.color}`}>
                  {overallStatus.status}
                </p>
                <p className="text-gray-400 text-sm">Based on 6 key metrics</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <CircularProgress
              percentage={overallScore}
              color={overallStatus.color}
              size={80}
            />
            <p className="text-sm text-gray-400 mt-2">Communication Score</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Response Time"
          value={behavioralStats.avgResponseTime?.toFixed(1) || 0}
          unit="seconds"
          type="responseTime"
          description="Average time to start responding"
          icon={Clock}
        />

        <MetricCard
          title="Filler Words"
          value={behavioralStats.fillerWordsCount || 0}
          unit="total"
          type="fillerWords"
          description="Um, uh, like, you know, etc."
          icon={MessageCircle}
        />

        <MetricCard
          title="Confidence Score"
          value={Math.round(behavioralStats.avgConfidenceScore || 0)}
          unit=""
          type="percentage"
          description="Voice tone confidence analysis"
          icon={TrendingUp}
        />

        <MetricCard
          title="Sentiment Score"
          value={behavioralStats.sentimentScore || 0}
          unit=""
          type="sentiment"
          description="Positive/negative tone analysis"
          icon={Smile}
        />

        <MetricCard
          title="Speech Clarity"
          value={Math.round(behavioralStats.speechClarity || 0)}
          unit=""
          type="percentage"
          description="Pronunciation and articulation"
          icon={Volume2}
        />

        <MetricCard
          title="Tone Variation"
          value={Math.round(behavioralStats.toneVariation || 0)}
          unit=""
          type="percentage"
          description="Voice modulation and engagement"
          icon={Brain}
        />
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-slate-800/30 rounded-lg p-5 border border-purple-500/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
          AI Insights & Recommendations
        </h3>

        <div className="space-y-4">
          {/* Generate recommendations based on scores */}
          {behavioralStats.avgResponseTime > 15 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">
                  Improve Response Time
                </p>
                <p className="text-gray-300 text-sm">
                  Try to respond more quickly. Practice thinking aloud to reduce
                  pause time.
                </p>
              </div>
            </div>
          )}

          {behavioralStats.fillerWordsCount > 100 && (
            <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <MessageCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Reduce Filler Words</p>
                <p className="text-gray-300 text-sm">
                  High filler word usage detected. Practice pausing instead of
                  using "um" or "uh".
                </p>
              </div>
            </div>
          )}

          {behavioralStats.avgConfidenceScore < 60 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium">Boost Confidence</p>
                <p className="text-gray-300 text-sm">
                  Speak with more conviction. Practice your answers to build
                  confidence.
                </p>
              </div>
            </div>
          )}

          {behavioralStats.speechClarity < 70 && (
            <div className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Volume2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-300 font-medium">
                  Improve Speech Clarity
                </p>
                <p className="text-gray-300 text-sm">
                  Focus on clear pronunciation and speaking at an appropriate
                  pace.
                </p>
              </div>
            </div>
          )}

          {behavioralStats.avgResponseTime <= 15 &&
            behavioralStats.fillerWordsCount <= 50 &&
            behavioralStats.avgConfidenceScore >= 80 &&
            behavioralStats.speechClarity >= 80 && (
              <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 font-medium">
                    Excellent Communication!
                  </p>
                  <p className="text-gray-300 text-sm">
                    Your behavioral metrics are strong. Keep up the great work!
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
