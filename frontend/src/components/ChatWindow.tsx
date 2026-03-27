"use client";

import { useEffect, useRef, useState } from "react";
import type { Message, Chat } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export function ChatWindow({
  chat,
  messages,
  currentUserId,
  typing,
  onSend,
  onTyping,
  onStopTyping,
}: {
  chat: Chat | null;
  messages: Message[];
  currentUserId?: string;
  typing: boolean;
  onSend: (text: string) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  const submit = async () => {
    if (!text.trim()) return;
    await onSend(text.trim());
    setText("");
    onStopTyping();
  };

  return (
    <section className="flex h-full flex-col bg-gray-50">
      <header className="border-b bg-white p-4">
        <h3 className="font-semibold">{chat.user?.name || "Chat"}</h3>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages yet</p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m._id}
              message={m}
              mine={currentUserId ? m.sender === currentUserId : false}
            />
          ))
        )}
        <TypingIndicator visible={typing} />
        <div ref={endRef} />
      </div>

      <div className="border-t bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={submit}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
