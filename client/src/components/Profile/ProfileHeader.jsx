import React from "react";
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";

export function ProfileHeader({ userData }) {
  // Calculate average score
  const averageScore =
    userData.totalInterviews > 0
      ? (userData.totalScore / userData.totalInterviews).toFixed(1)
      : 0;

  return (
    <div className="flex items-center justify-between">
      {/* Left side - User info */}
      <div className="flex items-center space-x-6">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {userData.fullName
            ? userData.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : userData.username?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* User Details */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {userData.fullName || userData.username || "User"}
          </h1>
          <p className="text-gray-300 mb-2">
            @{userData.username || "username"}
          </p>

          {/* Social Stats */}
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-1 text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                <span className="font-semibold text-white">
                  {userData.followersCount?.toLocaleString() || 0}
                </span>{" "}
                followers
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">
                <span className="font-semibold text-white">
                  {userData.followingCount?.toLocaleString() || 0}
                </span>{" "}
                following
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
              <Trophy className="inline w-3 h-3 mr-1" />
              Rank #{userData.rank?.toLocaleString() || "N/A"}
            </span>
            <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm font-medium border border-pink-500/30">
              Top {userData.percentile || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Stats */}
      <div className="flex items-center space-x-8">
        {/* Global Rank */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Trophy className="w-4 h-4 text-purple-400 mr-1" />
            <span className="text-sm text-gray-300">Global Rank</span>
          </div>
          <p className="text-xl font-bold text-white">
            #
            {userData.globalRank?.toLocaleString() ||
              userData.rank?.toLocaleString() ||
              "N/A"}
          </p>
        </div>

        {/* Total Interviews */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="w-4 h-4 text-pink-400 mr-1" />
            <span className="text-sm text-gray-300">Interviews</span>
          </div>
          <p className="text-xl font-bold text-white">
            {userData.totalInterviews?.toLocaleString() || 0}
          </p>
        </div>

        {/* Total Score */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
            <span className="text-sm text-gray-300">Total Score</span>
          </div>
          <p className="text-xl font-bold text-white">
            {userData.totalScore?.toLocaleString() || 0}
          </p>
        </div>

        {/* Average Score */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <User className="w-4 h-4 text-pink-400 mr-1" />
            <span className="text-sm text-gray-300">Avg Score</span>
          </div>
          <p className="text-xl font-bold text-white">{averageScore}</p>
        </div>
      </div>
    </div>
  );
}
