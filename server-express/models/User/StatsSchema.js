import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User reference

  // Overall metrics
  totalInterviews: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  percentile: { type: Number, default: 0 },

  activityLog: [
    {
      date: { type: Date, required: true },
      interviewsGiven: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 }, // in minutes
      score: { type: Number, default: 0 },
    },
  ],

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
      moduleStats: [
        {
          module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
          interviewsGiven: { type: Number, default: 0 },
        },
      ],
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

  behavioralStats: {
    avgResponseTime: { type: Number, default: 0 }, // in seconds
    fillerWordsCount: { type: Number, default: 0 }, // total fillers used
    avgConfidenceScore: { type: Number, default: 0 }, // 0-100
    sentimentScore: { type: Number, default: 0 }, // -1 (negative) to +1 (positive)
    speechClarity: { type: Number, default: 0 }, // 0-100 clarity metric
    toneVariation: { type: Number, default: 0 }, // 0-100 (monotone vs varied speech)
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

export default Stats;
