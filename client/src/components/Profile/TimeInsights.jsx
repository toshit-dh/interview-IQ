import React from "react";
import { Clock, Timer, BarChart3, TrendingUp } from "lucide-react";

export function TimeInsights ({ userData }) {
  // Helper function to format time in minutes to readable format
  const formatTime = (minutes) => {
    if (!minutes) return "0m";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Helper function to format time in seconds to readable format
  const formatTimeFromSeconds = (seconds) => {
    if (!seconds) return "0m";
    return formatTime(Math.floor(seconds / 60));
  };

  // Calculate time spent per path from pathStats
  const getTimePerPath = () => {
    if (!userData.pathStats || !userData.activityLog) return [];

    // Create a map of total time per path (this is simplified - in real app you'd track this properly)
    return userData.pathStats.map((pathStat) => {
      // Estimate time based on interviews given and average time
      const estimatedTime =
        (pathStat.interviewsGiven || 0) *
        (userData.averageTimePerInterview || 45);
      return {
        path: pathStat.pathName || `Path ${pathStat.path?.slice(-4)}`,
        timeSpent: estimatedTime,
        interviews: pathStat.interviewsGiven || 0,
        avgTimePerInterview:
          pathStat.interviewsGiven > 0
            ? estimatedTime / pathStat.interviewsGiven
            : 0,
      };
    });
  };

  const pathTimeData = getTimePerPath();
  const maxPathTime = Math.max(...pathTimeData.map((p) => p.timeSpent), 1);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <Clock className="w-5 h-5 text-purple-400 mr-2" />
          Time Insights
        </h2>
        <p className="text-gray-300 text-sm">
          Analyze your time investment and efficiency patterns
        </p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Time Spent */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Total Time Invested</p>
              <p className="text-3xl font-bold text-white">
                {formatTimeFromSeconds(userData.totalTimeSpent)}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Across {userData.totalInterviews || 0} interviews
          </div>
        </div>

        {/* Average Time per Interview */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-pink-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Average per Interview</p>
              <p className="text-3xl font-bold text-white">
                {formatTime(userData.averageTimePerInterview)}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Consistent practice duration
          </div>
        </div>
      </div>

      {/* Time Spent per Path/Domain */}
      <div className="bg-slate-800/30 rounded-lg p-5 border border-purple-500/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 text-purple-400 mr-2" />
          Time Spent per Path / Domain
        </h3>

        {pathTimeData.length > 0 ? (
          <div className="space-y-4">
            {pathTimeData.map((pathData, index) => (
              <div
                key={index}
                className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0
                          ? "bg-purple-400"
                          : index === 1
                          ? "bg-pink-400"
                          : index === 2
                          ? "bg-blue-400"
                          : "bg-green-400"
                      }`}
                    ></div>
                    <h4 className="font-semibold text-white">
                      {pathData.path}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {formatTime(pathData.timeSpent)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {pathData.interviews} interviews
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0
                        ? "bg-purple-400"
                        : index === 1
                        ? "bg-pink-400"
                        : index === 2
                        ? "bg-blue-400"
                        : "bg-green-400"
                    }`}
                    style={{
                      width: `${(pathData.timeSpent / maxPathTime) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>
                    Avg: {formatTime(pathData.avgTimePerInterview)}/interview
                  </span>
                  <span>
                    {(
                      (pathData.timeSpent /
                        (userData.totalTimeSpent / 60 || 1)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No path data available</p>
            <p className="text-sm text-gray-500">
              Complete some interviews to see time insights
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {pathTimeData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-600">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {pathTimeData.length}
                </p>
                <p className="text-xs text-gray-400">Active Paths</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-400">
                  {formatTime(
                    Math.max(...pathTimeData.map((p) => p.timeSpent))
                  )}
                </p>
                <p className="text-xs text-gray-400">Most Time Spent</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-2xl font-bold text-blue-400">
                  {formatTime(
                    pathTimeData.reduce(
                      (sum, p) => sum + p.avgTimePerInterview,
                      0
                    ) / pathTimeData.length
                  )}
                </p>
                <p className="text-xs text-gray-400">Avg Across Paths</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

