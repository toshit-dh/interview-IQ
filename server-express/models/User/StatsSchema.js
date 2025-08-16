const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User reference

  // Overall metrics
  totalInterviews: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  percentile: { type: Number, default: 0 },

  // Path progress
  completedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: "Path" }],
  activePaths: [{ type: mongoose.Schema.Types.ObjectId, ref: "Path" }],

  pathStats: [
    {
      path: { type: mongoose.Schema.Types.ObjectId, ref: "Path" },
      interviewsGiven: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
    },
  ],

  // Badges & achievements
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],

  // Streaks & consistency
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivity: { type: Date, default: null },

  // Time metrics
  totalTimeSpent: { type: Number, default: 0 }, // in seconds or minutes
  averageTimePerInterview: { type: Number, default: 0 },

  // Difficulty breakdown
  difficultyStats: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
  },

  // Leaderboard info
  globalRank: { type: Number, default: 0 },
  pathRanks: [
    {
      path: { type: mongoose.Schema.Types.ObjectId, ref: "Path" },
      rank: { type: Number, default: 0 },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update updatedAt before save
statsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Stats = mongoose.model("Stats", statsSchema);

export default Stats
