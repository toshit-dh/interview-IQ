import express from "express";
import DiscussController from "../../controllers/CommunityController/DiscussController.js";

const router = express.Router();

router.post("/posts", DiscussController.addPost);
router.delete("/posts/:post_id", DiscussController.deletePost);

router.post("/posts/:post_id/comments", DiscussController.addComment);
router.post(
  "/posts/:post_id/comments/:comment_id/replies",
  DiscussController.addReply
);

export default router;
