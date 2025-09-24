import express from "express";
const router = express.Router();
import FriendController from "../../controllers/CommunityController/FriendController.js";

// Friend request routes
router.post("/friend-request", FriendController.sendFriendRequest);
router.get("/friend-request/:userId", FriendController.getFriendRequests);
router.post("/friend-request/:id/accept", FriendController.acceptFriendRequest);
router.post("/friend-request/:id/reject", FriendController.rejectFriendRequest);

export default router;
