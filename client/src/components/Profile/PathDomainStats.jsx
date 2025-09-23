import React from "react";
import {
  Target,
  CheckCircle,
  PlayCircle,
  Award,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";
export function PathDomainStats ({ userData }) {
  // Get path names for display
  const getPathName = (pathId) => {
    const pathNames = {
      "60d5ecb54b24a000123456001": "Frontend Development",
      "60d5ecb54b24a000123456002": "System Design",
      "60d5ecb54b24a000123456003": "Backend Development",
      "60d5ecb54b24a000123456004": "Machine Learning",
      "60d5ecb54b24a000123456005": "Data Structures",
      "60d5ecb54b24a000123456006": "DevOps & Cloud",
    };
    return pathNames[pathId] || `Path ${pathId?.slice(-4)}`;
  };

  const completedPaths = userData.completedPaths || [];
  const activePaths = userData.activePaths || [];
  const pathStats = userData.pathStats || [];

  // Calculate completion rate for active paths
  const getCompletionRate = (pathStat) => {
    const totalPossibleInterviews = 50; // Assuming each path has ~50 interviews
    return Math.min(
      (pathStat.interviewsGiven / totalPossibleInterviews) * 100,
      100
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <Target className="w-5 h-5 text-purple-400 mr-2" />
          Path & Domain Stats
        </h2>
        <p className="text-gray-300 text-sm">
          Your progress across different interview domains and learning paths
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Completed Paths */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/10 hover:border-green-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Completed Paths</p>
              <p className="text-3xl font-bold text-green-400">
                {completedPaths.length}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {completedPaths.length > 0 ? (
              completedPaths.slice(0, 3).map((pathId, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-300"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="truncate">{getPathName(pathId)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No completed paths yet</p>
            )}
            {completedPaths.length > 3 && (
              <p className="text-xs text-gray-500">
                +{completedPaths.length - 3} more completed
              </p>
            )}
          </div>
        </div>

        {/* Active Paths */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Active Paths</p>
              <p className="text-3xl font-bold text-purple-400">
                {activePaths.length}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {activePaths.length > 0 ? (
              activePaths.slice(0, 3).map((pathId, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-300"
                >
                  <PlayCircle className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                  <span className="truncate">{getPathName(pathId)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No active paths</p>
            )}
            {activePaths.length > 3 && (
              <p className="text-xs text-gray-500">
                +{activePaths.length - 3} more active
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Path Stats */}
      <div className="bg-slate-800/30 rounded-lg p-5 border border-purple-500/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
          Detailed Path Performance
        </h3>

        {pathStats.length > 0 ? (
          <div className="space-y-4">
            {pathStats.map((pathStat, index) => {
              const completionRate = getCompletionRate(pathStat);
              const isCompleted = completedPaths.includes(pathStat.path);
              const isActive = activePaths.includes(pathStat.path);

              return (
                <div
                  key={index}
                  className="bg-slate-700/30 rounded-lg p-5 border border-slate-600/30 hover:border-purple-500/20 transition-colors"
                >
                  {/* Path Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full flex-shrink-0 ${
                          isCompleted
                            ? "bg-green-400"
                            : isActive
                            ? "bg-purple-400"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-semibold text-white text-lg">
                          {getPathName(pathStat.path)}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          {isCompleted && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                              Completed
                            </span>
                          )}
                          {isActive && !isCompleted && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                          {pathStat.badges && pathStat.badges.length > 0 && (
                            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <Award className="w-3 h-3 mr-1" />
                              {pathStat.badges.length} badges
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {pathStat.averageScore?.toFixed(1) || 0}
                      </p>
                      <p className="text-xs text-gray-400">avg score</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Progress</span>
                      <span>{completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-green-400"
                            : isActive
                            ? "bg-purple-400"
                            : "bg-gray-500"
                        }`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-blue-400 mr-1" />
                      </div>
                      <p className="text-lg font-bold text-white">
                        {pathStat.interviewsGiven || 0}
                      </p>
                      <p className="text-xs text-gray-400">Interviews</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      </div>
                      <p className="text-lg font-bold text-white">
                        {pathStat.totalScore || 0}
                      </p>
                      <p className="text-xs text-gray-400">Total Score</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Award className="w-4 h-4 text-purple-400 mr-1" />
                      </div>
                      <p className="text-lg font-bold text-white">
                        {pathStat.badges?.length || 0}
                      </p>
                      <p className="text-xs text-gray-400">Badges</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No path statistics available</p>
            <p className="text-sm text-gray-500">
              Start practicing interviews to see your progress
            </p>
          </div>
        )}

        {/* Summary Statistics */}
        {pathStats.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {completedPaths.length}
                </p>
                <p className="text-xs text-gray-400">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {activePaths.length}
                </p>
                <p className="text-xs text-gray-400">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {pathStats.reduce(
                    (sum, p) => sum + (p.interviewsGiven || 0),
                    0
                  )}
                </p>
                <p className="text-xs text-gray-400">Total Interviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {pathStats.reduce(
                    (sum, p) => sum + (p.badges?.length || 0),
                    0
                  )}
                </p>
                <p className="text-xs text-gray-400">Total Badges</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

