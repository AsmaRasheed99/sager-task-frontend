import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKETS_URL

let socket: Socket | null = null;

// connect socket to server
export const connectSocket = () =>{
if (!socket) {
    socket = io(SOCKET_URL, {
        transports: ["polling"],
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