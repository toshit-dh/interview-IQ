import express from "express";
const router = express.Router();
import UserController from "../../controllers/User/UserController.js";
import { upload, uploadToCloudinary} from "../../middlewares/FileUpload.js"

// Auth
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/verify-email/:token", UserController.verifyEmail);

// Profile
router.get("/:id", UserController.getUserProfile);
router.put("/", upload.single("avatar"),uploadToCloudinary, UserController.updateUserProfile);

// Social
router.get("/:id/followers", UserController.getFollowers);
router.get("/:id/following", UserController.getFollowing);
router.post("/:id/follow", UserController.followUser);
router.post("/:id/unfollow", UserController.unfollowUser);

export default router;
