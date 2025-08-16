import express from "express";
const router = express.Router();
import PaymentController from "../controllers/PaymentController.js";

router.post("/", PaymentController.createTransaction);
router.get("/user/:userId", PaymentController.getUserTransactions);
router.get("/:id", PaymentController.getTransactionById);
router.post("/upgrade", PaymentController.upgradePremiumPlan);

export default router;
