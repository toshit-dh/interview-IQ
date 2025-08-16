const mongoose = require("mongoose");

const pathSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Name of the exam/path
  description: String, // Short description
  category: String, // Optional category (e.g., Technical, Government)
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Path = mongoose.model("Path", pathSchema);

export default Path