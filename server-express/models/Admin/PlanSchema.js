const mongoose = require("mongoose");

const premiumPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Basic", "Pro", "Elite"],
    required: true,
    unique: true,
  }, // Plan name
  maxPaths: { type: Number, default: 1 }, // Maximum paths allowed (0 for unlimited)
  price: { type: Number, default: 0 }, // Price for the plan
  description: String, // Optional description
});

const Plan = mongoose.model("PremiumPlan", premiumPlanSchema);

export default Plan