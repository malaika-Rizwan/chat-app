"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChatList } from "@/components/ChatList";
import { ChatWindow } from "@/components/ChatWindow";
import { NewChatModal } from "@/components/NewChatModal";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useSocketContext } from "@/context/SocketContext";

export default function ChatPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const { socket } = useSocketContext();
  const {
    chats,
    messages,
    selectedChat,
    typingUsers,
    setSelectedChat,
    fetchChats,
    fetchMessages,
    sendMessage,
    fetchAllUsers,
    createChat,
    allUsers,
  } = useChat();
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchChats().catch(() => toast.error("Failed to load chats"));
    fetchAllUsers().catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!selectedChat) return;
    fetchMessages(selectedChat._id).catch(() => toast.error("Failed to load messages"));
  }, [selectedChat?._id]);

  const typing = useMemo(() => {
    if (!selectedChat) return false;
    return typingUsers.length > 0;
  }, [typingUsers, selectedChat?._id]);

  return (
    <main className="h-screen bg-gray-100">
      <div className="grid h-full grid-cols-1 md:grid-cols-[330px_1fr]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b bg-white p-4">
            <div>
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-semibold">{user?.name || user?.email || "User"}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-lg border px-3 py-1 text-sm"
            >
              Logout
            </button>
          </div>
          <ChatList
            chats={chats}
            selectedChatId={selectedChat?._id}
            onSelect={setSelectedChat}
            onNewChat={() => setShowNewChat(true)}
          />
        </div>

        <ChatWindow
          chat={selectedChat}
          messages={messages}
          currentUserId={user?._id || user?.id}
          typing={typing}
          onTyping={() => {
            if (!selectedChat || !socket) return;
            socket.emit("typing", { chatId: selectedChat._id });
          }}
          onStopTyping={() => {
            if (!selectedChat || !socket) return;
            socket.emit("stop_typing", { chatId: selectedChat._id });
          }}
          onSend={async (text) => {
            if (!selectedChat) return;
            await sendMessage({ chatId: selectedChat._id, text });
          }}
        />
      </div>

      <NewChatModal
        open={showNewChat}
        users={allUsers}
        onClose={() => setShowNewChat(false)}
        onCreate={async (otherUserId) => {
          await createChat(otherUserId);
          setShowNewChat(false);
          toast.success("Chat created");
        }}
      />
    </main>
  );
}
