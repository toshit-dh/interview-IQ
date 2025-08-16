import express from "express";
const router = express.Router();
import InterviewController from "../controllers/InterviewController.js";

router.post("/", InterviewController.createInterview);
router.get("/:id", InterviewController.getInterviewById);
router.get("/user/:userId", InterviewController.getUserInterviews);
router.post("/feedback", InterviewController.createFeedback);
router.get(
  "/feedback/:interviewId",
  InterviewController.getFeedbackByInterview
);

export default router;
