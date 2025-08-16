// routes/core/premiumRoutes.js
import express from "express";
const router = express.Router();
import PlanController from "../../controllers/Admin/PlanController.js";

// List all premium plans
router.get("/", PlanController.getAllPlans);

// Get a specific plan by ID
router.get("/:id", PlanController.getPlanById);

// Admin: Create a new premium plan
router.post("/", PlanController.createPlan);

// Admin: Update an existing plan
router.put("/:id", PlanController.updatePlan);

// Admin: Delete a premium plan
router.delete("/:id", PlanController.deletePlan);

export default router;
