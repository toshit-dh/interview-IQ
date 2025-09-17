import React from "react";
import { Flame, Clock, Activity, TrendingUp } from "lucide-react";
import Heatmap from "./HeatMap";

export function GrowthProgress({ userData })  {

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
          Growth & Progress
        </h2>
        <p className="text-gray-300 text-sm">
          Track your learning consistency and progress over time
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Current Streak */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Flame className="w-4 h-4 text-orange-400 mr-2" />
                <span className="text-sm text-gray-300">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {userData.streak || 0}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  days
                </span>
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Activity className="w-4 h-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-300">Longest Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {userData.longestStreak || 0}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  days
                </span>
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Last Active */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-pink-400 mr-2" />
                <span className="text-sm text-gray-300">Last Active</span>
              </div>
              <p className="text-lg font-bold text-white">
                {"from "}
              </p>
            </div>
            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Heatmap */}
      <div className="bg-slate-800/30 rounded-lg p-5 border border-purple-500/10">
        <Heatmap activityLog={userData.activityLog}/>
      </div>
    </>
  );
};



