const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Badge name
  description: String, // Description of achievement
  iconUrl: String, // Optional icon for UI
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge