// route.js
import express from "express";
const router = express.Router();
import verifyToken from "../middlewares/VerifyToken.js";
import errorHandler from "../middlewares/ErrorHandler.js";

router.use(verifyToken);

// ----------------- User Routes -----------------
import userRoutes from "./User/UserRoutes.js";
import statsRoutes from "./User/StatsRoutes.js";
import badgesRoutes from "./User/BadgesRoutes.js";

router.use("/users", userRoutes);
router.use("/stats", statsRoutes);
router.use("/badges", badgesRoutes);

// ----------------- Admin Routes -----------------
import pathRoutes from "./Admin/PathRoutes.js";
import planRoutes from "./Admin/PlanRoutes.js";

router.use("/paths", pathRoutes);
router.use("/premium", planRoutes);

// ----------------- Interview Routes -----------------
import interviewRoutes from "./InterviewRoutes.js";

router.use("/interviews", interviewRoutes);

// ----------------- Community Routes -----------------
import communityRoutes from "./CommunityRoutes.js";
router.use("/community", communityRoutes);

// ----------------- Payment Routes -----------------
import paymentRoutes from "./PaymentRoutes.js";
router.use("/payment", paymentRoutes);

router.use(errorHandler);

export default router;
