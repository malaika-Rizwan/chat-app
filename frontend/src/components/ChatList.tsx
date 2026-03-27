"use client";

import type { Chat } from "@/types/chat";

export function ChatList({
  chats,
  selectedChatId,
  onSelect,
  onNewChat,
}: {
  chats: Chat[];
  selectedChatId?: string;
  onSelect: (chat: Chat) => void;
  onNewChat: () => void;
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button
          onClick={onNewChat}
          className="rounded-lg bg-emerald-500 px-3 py-1 text-sm text-white"
        >
          + New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No chats yet</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelect(chat)}
              className={`w-full border-b px-4 py-3 text-left hover:bg-gray-50 ${
                selectedChatId === chat._id ? "bg-gray-100" : ""
              }`}
            >
              <p className="font-medium">{chat.user?.name || "Unknown User"}</p>
              <p className="line-clamp-1 text-xs text-gray-500">
                {chat.latestMessage?.text || "No messages yet"}
              </p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
