"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { disconnectSocket, initSocket } from "@/lib/socket";
import { useAuth } from "./AuthContext";
import type { Socket } from "socket.io-client";

type SocketContextValue = {
  socket: Socket | null;
  onlineUsers: string[];
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    const s = initSocket(token);
    setSocket(s);

    s.on("online_users", (users: string[]) => {
      setOnlineUsers(users || []);
    });

    return () => {
      s.off("online_users");
    };
  }, [token]);

  const value = useMemo(() => ({ socket, onlineUsers }), [socket, onlineUsers]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketContext must be used inside SocketProvider");
  return ctx;
}
