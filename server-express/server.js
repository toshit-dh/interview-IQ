// server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

// Folder imports
import routes from "./routes/route.js"
import { connectDB } from "./utils/connectDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// Middleware
// =======================
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
); // Enable CORS for all routes
app.use(morgan("dev")); // Logger
app.use(express.json()); // Parse JSON bodies

// =======================
// MongoDB Connection
// =======================
connectDB();

// =======================
// Routes
// =======================
app.use("/api",routes);

// =======================
// HTTP + Socket.io setup
// =======================
const server = createServer(app);
const io = new SocketServer(server, {
  cors: { origin: "*" },
});
app.set('io',io)
// =======================
// Start Server
// =======================
server.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
