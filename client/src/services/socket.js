import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER2_DOMAIN + "/api"; // backend URL

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});
