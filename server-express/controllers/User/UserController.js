// controllers/UserController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verificationEmailTemplate } from "../../utils/mails/verifyEmail.js";
import User from "../../models/User/UserSchema.js";
import Admin from "../../models/Admin/AdminSchema.js";
import { sendEmail } from "../../utils/sendEmail.js";

const UserController = {
  // Register new user
  register: async (req, res, next) => {
    let newUser;
    try {
      const { username, name, email, password } = req.body;

      // Check required fields
      if (!username || !name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      newUser = await User.create({
        username,
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
      // if (newUser && newUser._id) {
      //   await User.findByIdAndDelete(newUser._id);
      // }
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
    try {
      const userId = req.user.userId;
      
      const user = await User.findById(userId).populate("stats").lean();
      console.log(user);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      delete user.password;

      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  // Update user profile
  updateUserProfile: async (req, res, next) => {
    try {
      const { id } = req.user;
      const updates = req.body;

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (req.file) {
        // If user already had an avatar, delete it first
        if (user.avatar.public_id) {
          await cloudinary.uploader.destroy(user.avatar.public_id);
        }
        // Save new avatar
        updates.avatar = {
          public_id: req.file.filename, // Cloudinary public_id
          url: req.file.path, // Cloudinary secure URL
        };
      } else if (updates.removeAvatar === "true") {
        // Remove avatar if requested
        if (user.avatar.public_id) {
          await cloudinary.uploader.destroy(user.avatar.public_id);
        }
        updates.avatar = { public_id: null, url: null };
      }

      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
      });

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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
