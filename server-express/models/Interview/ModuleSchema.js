import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    path_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Path",
      required: true,
    },
    interviews_to_complete: { type: Number, default: 0 }, // number of interviews needed to complete module
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;
