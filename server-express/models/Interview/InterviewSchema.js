const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who took the interview
  path: { type: mongoose.Schema.Types.ObjectId, ref: "Path", required: true }, // Path/exam reference
  questions: [
    {
      question: String,
      userAnswer: String,
      aiFeedback: String,
      score: Number,
    },
  ],
  totalScore: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  }, // Optional difficulty tag
  interviewDate: { type: Date, default: Date.now },
});

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview