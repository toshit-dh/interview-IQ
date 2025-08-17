import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User making the payment
  premiumPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PremiumPlan",
    required: true,
  }, // Purchased plan
  amount: { type: Number, required: true }, // Amount paid
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentMethod: { type: String }, // e.g., "stripe", "razorpay"
  transactionDate: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Transaction", transactionSchema);

export default Payment;
