import mongoose from "mongoose";

const socialActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User performing activity
  type: {
    type: String,
    enum: ["newInterview", "badgeEarned", "post", "comment"],
    required: true,
  }, // Activity type
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // Optional: interview, badge, post, or comment
  createdAt: { type: Date, default: Date.now },
});

const Activity = mongoose.model("SocialActivity", socialActivitySchema);

export default Activity;
