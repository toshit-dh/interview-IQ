// controllers/UserController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verificationEmailTemplate } from "../../utils/mails/verifyEmail.js";
import User from "../../models/User/UserSchema.js";
import Admin from "../../models/Admin/AdminSchema.js"
import { sendEmail } from "../../utils/sendEmail.js";

const UserController = {
  // Register new user
  register: async (req, res, next) => {
    let newUser;
    try {
      const { name, email, password } = req.body;
      // Check required fields
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "Email already registered" });
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create user (paths, premium, social arrays empty by default)
      newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      // Create verification token
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`;
      // Send email
      await sendEmail({
        to: email,
        subject: "Verify your email",
        html: verificationEmailTemplate(name, verificationLink),
      });
      res.status(201).json({
        message: "User registered. Please check your email to verify.",
      });
    } catch (error) {
      if (newUser && newUser._id) {
        await User.findByIdAndDelete(newUser._id);
      }
      next(error);
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.isVerified)
        return res.status(400).json({ message: "User already verified" });

      user.isVerified = true;
      await user.save();

      res.status(200).json({ message: "Email verified! You can now login." });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  login: async (req, res, next) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res
          .status(400)
          .json({ message: "Email, password, and role are required" });
      }

      let account;

      // Find user/admin based on role
      if (role === "user") {
        account = await User.findOne({ email });
      } else if (role === "admin") {
        account = await Admin.findOne({ email });
      } else {
        return res.status(400).json({ message: "Invalid role" });
      }

      if (!account) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // If user, check if email is verified
      if (role === "user" && !account.isVerified) {
        return res
          .status(403)
          .json({ message: "Please verify your email first" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: account._id, email: account.email, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: account._id,
          name: account.name,
          email: account.email,
          role, // include role in response
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user profile by ID
  getUserProfile: async (req, res, next) => {
    // TODO: Implement get user profile
  },

  // Update user profile
  updateUserProfile: async (req, res, next) => {
    // TODO: Implement update profile
  },

  // List followers of a user
  getFollowers: async (req, res, next) => {
    // TODO: Implement followers list
  },

  // List following of a user
  getFollowing: async (req, res, next) => {
    // TODO: Implement following list
  },

  // Follow a user
  followUser: async (req, res, next) => {
    // TODO: Implement follow
  },

  // Unfollow a user
  unfollowUser: async (req, res, next) => {
    // TODO: Implement unfollow
  },
};

export default UserController;
