import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
  reply_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const CommentSchema = new mongoose.Schema({
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  replies: [ReplySchema],
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author_type: { type: String, enum: ["platform", "user"], required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null if platform post
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ["career", "contest", "feedback"],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  comments: {
    type: [CommentSchema],
    validate: [arrayLimit, "{PATH} exceeds the limit of 100"],
  },
  comments_count: { type: Number, default: 0 },
});

// Limit comments to 100
function arrayLimit(val) {
  return val.length <= 100;
}

// TTL index for auto-deletion after 30 days
PostSchema.index({ created_at: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model("Post", PostSchema);
