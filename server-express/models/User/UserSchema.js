import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User full name
  email: { type: String, required: true, unique: true }, // Email for login
  password: { type: String, required: true }, // Hashed password
  avatar: String, // Profile picture URL
  bio: String, // Short bio
  isVerified: {
    type: Boolean,
    default: false,
  },

  // Paths & Premium
  paths: [{ type: mongoose.Schema.Types.ObjectId, ref: "Path", default: [] }], // User-selected paths
  premiumPlan: { type: mongoose.Schema.Types.ObjectId, ref: "PremiumPlan" }, // Reference to user's plan

  // Social features
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ], // Users who follow this user
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ], // Users this user follows
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], // Mutual friends

  // Stats reference
  stats: { type: mongoose.Schema.Types.ObjectId, ref: "Stats" },

  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
