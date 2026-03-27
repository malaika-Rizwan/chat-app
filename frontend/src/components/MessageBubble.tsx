import type { Message } from "@/types/chat";

export function MessageBubble({
  message,
  mine,
}: {
  message: Message;
  mine: boolean;
}) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${
          mine ? "bg-emerald-500 text-white" : "bg-white text-gray-900"
        }`}
      >
        <p>{message.text || `[${message.messageType || "message"}]`}</p>
        <p
          className={`mt-1 text-[10px] ${
            mine ? "text-emerald-50" : "text-gray-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
