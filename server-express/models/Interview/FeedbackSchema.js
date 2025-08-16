const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
  }, // Interview reference
  aiComments: String, // AI-generated comments
  improvementAreas: [String], // Areas where user can improve
  strengths: [String], // Strengths identified by AI
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback