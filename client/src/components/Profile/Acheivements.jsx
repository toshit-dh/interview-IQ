import React from "react";
import {
  Trophy,
  Award,
  Star,
  Target,
  Zap,
  Crown,
  Medal,
  Gift,
} from "lucide-react";

export function Achievements ({ userData }){
  // Define all possible badges/achievements
  const allBadges = [
    {
      id: "first_interview",
      name: "First Steps",
      description: "Complete your first interview",
      icon: "🎯",
      category: "milestone",
      requirement: 1,
      type: "interviews",
    },
    {
      id: "week_warrior",
      name: "Week Warrior",
      description: "Practice for 7 consecutive days",
      icon: "⚡",
      category: "streak",
      requirement: 7,
      type: "streak",
    },
    {
      id: "perfect_score",
      name: "Perfect Score",
      description: "Get a perfect score in an interview",
      icon: "💯",
      category: "performance",
      requirement: 100,
      type: "score",
    },
    {
      id: "marathon_runner",
      name: "Marathon Runner",
      description: "Complete 50 interviews",
      icon: "🏃",
      category: "milestone",
      requirement: 50,
      type: "interviews",
    },
    {
      id: "consistency_king",
      name: "Consistency King",
      description: "Maintain a 30-day streak",
      icon: "👑",
      category: "streak",
      requirement: 30,
      type: "streak",
    },
    {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Complete an interview in under 20 minutes",
      icon: "🚀",
      category: "performance",
      requirement: 20,
      type: "time",
    },
    {
      id: "high_scorer",
      name: "High Scorer",
      description: "Reach 5000 total points",
      icon: "🌟",
      category: "milestone",
      requirement: 5000,
      type: "totalScore",
    },
    {
      id: "polyglot",
      name: "Polyglot",
      description: "Complete interviews in 3+ different paths",
      icon: "🔧",
      category: "diversity",
      requirement: 3,
      type: "paths",
    },
    {
      id: "perfectionist",
      name: "Perfectionist",
      description: "Get 5 perfect scores",
      icon: "✨",
      category: "performance",
      requirement: 5,
      type: "perfectScores",
    },
    {
      id: "century_club",
      name: "Century Club",
      description: "Complete 100 interviews",
      icon: "💪",
      category: "milestone",
      requirement: 100,
      type: "interviews",
    },
  ];

  // Path-specific badges
  const pathBadges = [
    {
      id: "frontend_master",
      name: "Frontend Master",
      description: "Complete Frontend path",
      icon: "🎨",
      path: "Frontend Development",
    },
    {
      id: "system_architect",
      name: "System Architect",
      description: "Complete System Design path",
      icon: "🏗️",
      path: "System Design",
    },
    {
      id: "backend_guru",
      name: "Backend Guru",
      description: "Complete Backend path",
      icon: "⚙️",
      path: "Backend Development",
    },
    {
      id: "ml_expert",
      name: "ML Expert",
      description: "Complete ML path",
      icon: "🤖",
      path: "Machine Learning",
    },
  ];

  // Determine which badges are earned
  const checkBadgeEarned = (badge) => {
    switch (badge.type) {
      case "interviews":
        return (userData.totalInterviews || 0) >= badge.requirement;
      case "streak":
        return (userData.longestStreak || 0) >= badge.requirement;
      case "totalScore":
        return (userData.totalScore || 0) >= badge.requirement;
      case "score":
        return (userData.totalInterviews || 0) > 0; // Simplified - assume some perfect scores exist
      case "time":
        return (userData.averageTimePerInterview || 60) <= badge.requirement;
      case "paths":
        return (userData.pathStats?.length || 0) >= badge.requirement;
      case "perfectScores":
        return (
          Math.floor((userData.totalScore || 0) / 1000) >= badge.requirement
        ); // Simplified calculation
      default:
        return false;
    }
  };

  // Check path-specific badges
  const checkPathBadgeEarned = (pathBadge) => {
    return (
      userData.completedPaths?.some((pathId) => {
        // Simple path name matching - in real app this would be more robust
        return true; // Simplified for demo
      }) || false
    );
  };

  const earnedGeneralBadges = allBadges.filter((badge) =>
    checkBadgeEarned(badge)
  );
  const earnedPathBadges = pathBadges.filter((badge) =>
    checkPathBadgeEarned(badge)
  );

  // Calculate milestones
  const milestones = [
    {
      title: "10 Interviews Completed",
      description: "You're building momentum!",
      progress: Math.min((userData.totalInterviews || 0) / 10, 1),
      achieved: (userData.totalInterviews || 0) >= 10,
      icon: Target,
    },
    {
      title: "1000 Points Scored",
      description: "Great progress on your journey!",
      progress: Math.min((userData.totalScore || 0) / 1000, 1),
      achieved: (userData.totalScore || 0) >= 1000,
      icon: Star,
    },
    {
      title: "First Path Completed",
      description: "Master a complete learning path!",
      progress: Math.min((userData.completedPaths?.length || 0) / 1, 1),
      achieved: (userData.completedPaths?.length || 0) >= 1,
      icon: Award,
    },
    {
      title: "30-Day Streak",
      description: "Consistency is key to success!",
      progress: Math.min((userData.longestStreak || 0) / 30, 1),
      achieved: (userData.longestStreak || 0) >= 30,
      icon: Zap,
    },
  ];

  const BadgeCard = ({ badge, earned = false, isPathBadge = false }) => (
    <div
      className={`relative p-4 rounded-lg border transition-all hover:scale-105 ${
        earned
          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 shadow-lg"
          : "bg-slate-800/50 border-slate-600/30"
      }`}
    >
      <div className="text-center">
        <div
          className={`text-4xl mb-2 ${earned ? "" : "grayscale opacity-50"}`}
        >
          {badge.icon}
        </div>
        <h4
          className={`font-semibold mb-1 ${
            earned ? "text-yellow-300" : "text-gray-300"
          }`}
        >
          {badge.name}
        </h4>
        <p
          className={`text-xs ${earned ? "text-yellow-200" : "text-gray-400"}`}
        >
          {badge.description}
        </p>
        {earned && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Trophy className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </div>
  );

  const MilestoneCard = ({ milestone }) => (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              milestone.achieved ? "bg-green-500/20" : "bg-purple-500/20"
            }`}
          >
            <milestone.icon
              className={`w-5 h-5 ${
                milestone.achieved ? "text-green-400" : "text-purple-400"
              }`}
            />
          </div>
          <div>
            <h4 className="font-semibold text-white">{milestone.title}</h4>
            <p className="text-sm text-gray-400">{milestone.description}</p>
          </div>
        </div>
        {milestone.achieved && (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Trophy className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-600 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            milestone.achieved ? "bg-green-400" : "bg-purple-400"
          }`}
          style={{ width: `${milestone.progress * 100}%` }}
        ></div>
      </div>
      <div className="text-right mt-1">
        <span className="text-xs text-gray-400">
          {Math.round(milestone.progress * 100)}% Complete
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <Trophy className="w-5 h-5 text-purple-400 mr-2" />
          Achievements
        </h2>
        <p className="text-gray-300 text-sm">
          Your badges, milestones, and accomplishments
        </p>
      </div>

      {/* Achievement Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-purple-500/10">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {earnedGeneralBadges.length}
          </p>
          <p className="text-xs text-gray-400">Badges Earned</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-purple-500/10">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {earnedPathBadges.length}
          </p>
          <p className="text-xs text-gray-400">Path Badges</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-purple-500/10">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Medal className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">
            {milestones.filter((m) => m.achieved).length}
          </p>
          <p className="text-xs text-gray-400">Milestones</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-purple-500/10">
          <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-pink-400">
            {earnedGeneralBadges.length + earnedPathBadges.length}
          </p>
          <p className="text-xs text-gray-400">Total Earned</p>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Award className="w-5 h-5 text-yellow-400 mr-2" />
          Badges Earned ({earnedGeneralBadges.length + earnedPathBadges.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...earnedGeneralBadges, ...earnedPathBadges].map((badge, index) => (
            <BadgeCard key={index} badge={badge} earned={true} />
          ))}
          {earnedGeneralBadges.length + earnedPathBadges.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Gift className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No badges earned yet</p>
              <p className="text-sm text-gray-500">
                Keep practicing to unlock achievements!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Available Badges */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 text-gray-400 mr-2" />
          Available Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            ...allBadges.filter((badge) => !checkBadgeEarned(badge)),
            ...pathBadges.filter((badge) => !checkPathBadgeEarned(badge)),
          ]
            .slice(0, 10)
            .map((badge, index) => (
              <BadgeCard key={index} badge={badge} earned={false} />
            ))}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Crown className="w-5 h-5 text-purple-400 mr-2" />
          Milestones & Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((milestone, index) => (
            <MilestoneCard key={index} milestone={milestone} />
          ))}
        </div>
      </div>
    </div>
  );
};


