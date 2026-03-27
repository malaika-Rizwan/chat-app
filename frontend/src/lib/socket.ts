import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initSocket(token: string) {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5002", {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
