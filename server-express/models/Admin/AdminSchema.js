import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User full name
  email: { type: String, required: true, unique: true }, // Email for login
  password: { type: String, required: true }, // Hashed password
  avatar: String, // Profile picture URL
  bio: String, // Short bio
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
