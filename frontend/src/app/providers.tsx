"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ChatProvider } from "@/context/ChatContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          {children}
          <Toaster position="top-right" />
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
