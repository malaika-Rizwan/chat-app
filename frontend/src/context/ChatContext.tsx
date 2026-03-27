"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { chatApi, userApi } from "@/lib/api";
import type { Chat, Message, User } from "@/types/chat";
import { useSocketContext } from "./SocketContext";

type ChatContextValue = {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  loadingChats: boolean;
  loadingMessages: boolean;
  typingUsers: string[];
  setSelectedChat: (chat: Chat | null) => void;
  fetchChats: () => Promise<void>;
  createChat: (otherUserId: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (payload: {
    chatId: string;
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
    document?: string;
  }) => Promise<void>;
  allUsers: User[];
  fetchAllUsers: () => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocketContext();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const { data } = await chatApi.get("/chat/all");
      setChats(data.chats ?? []);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchAllUsers = async () => {
    const { data } = await userApi.get("/user/all");
    setAllUsers(data.users ?? []);
  };

  const createChat = async (otherUserId: string) => {
    await chatApi.post("/chat/new", { otherUserId });
    await fetchChats();
  };

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const { data } = await chatApi.post("/message/getchatmessages", { chatId });
      setMessages(data.messages ?? []);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (payload: {
    chatId: string;
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
    document?: string;
  }) => {
    const { data } = await chatApi.post("/message", payload);
    const created = data.data as Message;
    setMessages((prev) => [...prev, created]);
    socket?.emit("send_message", created);
  };

  useEffect(() => {
    if (!socket) return;

    const onReceive = (incoming: Message) => {
      if (!selectedChat || incoming.chatId !== selectedChat._id) return;
      setMessages((prev) => [...prev, incoming]);
    };
    const onTyping = (userId: string) => {
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    };
    const onStopTyping = (userId: string) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };
    const onNewChatCreated = () => {
      fetchChats().catch(() => undefined);
    };

    socket.on("receive_message", onReceive);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("new_chat_created", onNewChatCreated);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("new_chat_created", onNewChatCreated);
    };
  }, [socket, selectedChat?._id]);

  const value = useMemo(
    () => ({
      chats,
      selectedChat,
      messages,
      loadingChats,
      loadingMessages,
      typingUsers,
      setSelectedChat,
      fetchChats,
      createChat,
      fetchMessages,
      sendMessage,
      allUsers,
      fetchAllUsers,
    }),
    [chats, selectedChat, messages, loadingChats, loadingMessages, typingUsers, allUsers]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
