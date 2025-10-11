// services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER2_DOMAIN; // Flask backend URL (no /api needed)

console.log("🔌 SOCKET: Connecting to:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

// Debug socket connection
socket.on("connect", () => {
  console.log("✅ SOCKET: Connected successfully to", SOCKET_URL);
});

socket.on("disconnect", () => {
  console.log("❌ SOCKET: Disconnected from", SOCKET_URL);
});

socket.on("connect_error", (error) => {
  console.error("🚫 SOCKET: Connection error:", error);
});
