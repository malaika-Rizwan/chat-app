"use client";

import type { User } from "@/types/chat";

export function NewChatModal({
  open,
  users,
  onClose,
  onCreate,
}: {
  open: boolean;
  users: User[];
  onClose: () => void;
  onCreate: (userId: string) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">Start a new chat</h3>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user._id}
              className="w-full rounded-lg border px-3 py-2 text-left hover:bg-gray-50"
              onClick={() => user._id && onCreate(user._id)}
            >
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
