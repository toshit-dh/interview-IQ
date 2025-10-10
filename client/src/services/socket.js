// services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER2_DOMAIN + "/api";

let socketInstance = null;

export const connectSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, { transports: ["websocket"] });
    console.log("Socket connected:", SOCKET_URL);
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    console.log("Socket disconnected");
    socketInstance = null;
  }
};
