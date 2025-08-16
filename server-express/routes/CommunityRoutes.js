import express from "express";
const router = express.Router();
import CommunityController from "../controllers/CommunityController.js";

router.post("/friend-request", CommunityController.sendFriendRequest);
router.get("/friend-request/:userId", CommunityController.getFriendRequests);
router.post(
  "/friend-request/:id/accept",
  CommunityController.acceptFriendRequest
);
router.post(
  "/friend-request/:id/reject",
  CommunityController.rejectFriendRequest
);

router.get("/activity/:userId", CommunityController.getUserActivity);

export default router;
