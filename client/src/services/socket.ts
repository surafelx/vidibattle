import { io } from "socket.io-client";
import { env } from "../env";
import {  getUserId } from "../services/auth";

const userId = getUserId();

const socket = io(env.VITE_WEB_SOCKET_URL, {
  query: { user_id: userId ?? "" },
});

export function initializeSocket() {
  if (userId) {
    const socket = io(env.VITE_WEB_SOCKET_URL, { query: { user_id: userId } }); // Connect to the server's WebSocket endpoint
    // establish connection
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }
}

export default socket;
