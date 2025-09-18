import mongoose from "mongoose";
import Stats from "./StatsSchema.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User full name
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // Email for login
  password: { type: String, required: true }, // Hashed password
  avatar: {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
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

  // Stats reference
  stats: { type: mongoose.Schema.Types.ObjectId, ref: "Stats" },

  createdAt: { type: Date, default: Date.now },
});

userSchema.post("save", async function (doc, next) {
  try {
    let stats = await Stats.findOne({ user: doc._id });
    if (!stats) {
      stats = await Stats.create({ user: doc._id });
    }

    // assign stats ID to user if not set
    if (!doc.stats) {
      doc.stats = stats._id;
      await doc.save();
    }

    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
