import mongoose from "mongoose";

const DiscussSchema = new mongoose.Schema({
  title: { type: String, default: "Discussion Board" },
  description: {
    type: String,
    default: "Central place for all posts from platform and users",
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

export default mongoose.model("Discuss", DiscussSchema);
