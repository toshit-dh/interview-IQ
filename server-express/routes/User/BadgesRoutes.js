// routes/core/badgeRoutes.js
import express from "express";
const router = express.Router();
import BadgeController from "../../controllers/User/BadgeController.js";

// List all badges
router.get("/", BadgeController.getAllBadges);

// Get a specific badge by ID
router.get("/:id", BadgeController.getBadgeById);

// Admin: Create a new badge
router.post("/", BadgeController.createBadge);

// Admin: Update an existing badge
router.put("/:id", BadgeController.updateBadge);

// Admin: Delete a badge
router.delete("/:id", BadgeController.deleteBadge);

export default router;
