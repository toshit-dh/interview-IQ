import { useState } from "react";

export function ProfileHeader ({ userData, onEditProfile })  {
  console.log(userData);
  
  const [expanded, setExpanded] = useState(false);
  const averageScore =
    userData.totalInterviews > 0
      ? (userData.totalScore / userData.totalInterviews).toFixed(1)
      : 0;

  return (
    <div className="flex items-center justify-between">
      {/* Left side - User info */}
      <div className="flex items-center space-x-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden">
            {userData.avatar.url ? (
              <img
                src={userData.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : userData.name ? (
              userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            ) : (
              userData.username?.charAt(0).toUpperCase() || "U"
            )}
          </div>
        </div>

        {/* User Details */}
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-white">
              {userData.name || userData.username || "User"}
            </h1>
            <button
              onClick={onEditProfile}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
              title="Edit Profile"
            >
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
          <p className="text-gray-300 mb-2">
            @{userData.username || "username"}
          </p>

          {/* Bio */}
          {userData.bio && (
            <div className="max-w-md">
              <p
                className={`text-gray-300 text-sm mb-2 transition-all duration-300 ${
                  expanded ? "" : "line-clamp-2"
                }`}
              >
                {userData.bio}
              </p>
              {userData.bio.length > 80 && ( // show toggle only if bio is long
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-purple-400 text-xs font-medium hover:text-purple-300 transition-colors"
                >
                  {expanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          )}
          {/* Social Stats */}
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-1 text-gray-300">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-sm">
                <span className="font-semibold text-white">
                  {userData.followersCount?.toLocaleString() || 0}
                </span>{" "}
                followers
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
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
              <svg
                className="inline w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
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
            <svg
              className="w-4 h-4 text-purple-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
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
            <svg
              className="w-4 h-4 text-pink-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-300">Interviews</span>
          </div>
          <p className="text-xl font-bold text-white">
            {userData.totalInterviews?.toLocaleString() || 0}
          </p>
        </div>

        {/* Total Score */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <svg
              className="w-4 h-4 text-purple-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-sm text-gray-300">Total Score</span>
          </div>
          <p className="text-xl font-bold text-white">
            {userData.totalScore?.toLocaleString() || 0}
          </p>
        </div>

        {/* Average Score */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <svg
              className="w-4 h-4 text-pink-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm text-gray-300">Avg Score</span>
          </div>
          <p className="text-xl font-bold text-white">{averageScore}</p>
        </div>
      </div>
    </div>
  );
};
