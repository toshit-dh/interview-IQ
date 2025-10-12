// services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER2_DOMAIN || "http://localhost:5000";

// Create socket instance with better configuration
export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], 
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 10000,
  autoConnect: true,
  forceNew: false, // Reuse connection
  withCredentials: false
});

// Log connection events
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected:", reason);
});

// Legacy functions for compatibility
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  socket.disconnect();
};