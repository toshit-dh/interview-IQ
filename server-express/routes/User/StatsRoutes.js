import express from "express";
const router = express.Router();
import StatsController from "../../controllers/User/StatsController.js";

router.get("/:userId", StatsController.getUserStats);
router.put("/:userId", StatsController.updateUserStats);

// Leaderboard
router.get("/leaderboard/global", StatsController.getGlobalLeaderboard);
router.get("/leaderboard/path/:pathId", StatsController.getPathLeaderboard);

export default router;
