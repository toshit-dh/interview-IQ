import mongoose from "mongoose";

const pathSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Name of the exam/path
  modules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module", // reference to Module model
    },
  ],
  description: String, // Short description
  category: String, // Optional category (e.g., Technical, Government)
  icon: { type: String }, // Icon name as string
  color: String, // Gradient color
  bgColor: String, // Background color class
  borderColor: String, // Border color class
  textColor: String, // Text color class
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Path = mongoose.model("Path", pathSchema);

export default Path;
