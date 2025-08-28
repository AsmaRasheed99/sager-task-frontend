import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_SOCKETS_URL;

let socket: Socket | null = null;

// connect socket to server
export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["polling"],
      timeout: 60000, 
    });

    socket.on("connect_error", (err) => {
      toast.error(
        `Connection failed: ${err.message}. My free instance may be spinning down due to inactivity. This can delay requests by 50 seconds or more.`
      );
    });

    socket.on("connect_timeout", () => {
      toast.warning(
        "Connection timed out. I am using a free instance, the server may be waking up (can take ~50s). Please wait and try again."
      );
    });
  }
  return socket;
};

// disconnect socket from server
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
