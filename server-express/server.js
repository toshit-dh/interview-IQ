// server.js

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

// Folder imports
import { connectDB } from "./utils/connectDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// Middleware
// =======================
app.use(cors()); // Enable CORS for all routes
app.use(morgan("dev")); // Logger
app.use(express.json()); // Parse JSON bodies

// =======================
// MongoDB Connection
// =======================
connectDB();

// =======================
// Routes
// =======================
app.get("/", (req, res) => {
  res.send("🚀 Welcome to Interview IQ");
});

// =======================
// HTTP + Socket.io setup
// =======================
const server = createServer(app);
const io = new SocketServer(server, {
  cors: { origin: "*" },
});

// =======================
// Socket.io Logic
// =======================
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// =======================
// Start Server
// =======================
server.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
