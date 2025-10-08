// route.js
import express from "express";
const router = express.Router();
import verifyToken from "../middlewares/VerifyToken.js";
import errorHandler from "../middlewares/ErrorHandler.js";

router.use(verifyToken);
router.get("/", (_, res) => {
  res.send("🚀 Welcome to Interview IQ");
});

// ----------------- User Routes -----------------
import userRoutes from "./User/UserRoutes.js";
import statsRoutes from "./User/StatsRoutes.js";
import badgesRoutes from "./User/BadgesRoutes.js";

router.use("/users", userRoutes);
router.use("/stats", statsRoutes);
router.use("/badges", badgesRoutes);

// ----------------- Admin Routes -----------------
import planRoutes from "./Admin/PlanRoutes.js";

router.use("/premium", planRoutes);

// ----------------- Interview Routes -----------------
import pathRoutes from "./Interview/PathRoutes.js";
import moduleRoutes from "./Interview/ModuleRoutes.js"
router.use("/path", pathRoutes);
router.use('/module',moduleRoutes)

// ----------------- Community Routes -----------------
import friendRoutes from "./CommunityRoutes/FriendRoutes.js";
import discussRoutes from "./CommunityRoutes/DiscussRoutes.js"
router.use("/friend", friendRoutes);
router.use("/discuss",discussRoutes);

// ----------------- Payment Routes -----------------
import paymentRoutes from "./PaymentRoutes.js";
router.use("/payment", paymentRoutes);

router.use(errorHandler);

export default router;
