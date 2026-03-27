export type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
};

export type LatestMessage = {
  text: string;
  sender: string;
};

export type Chat = {
  _id: string;
  users: string[];
  latestMessage?: LatestMessage;
  unseenCount?: number;
  user?: User;
};

export type Message = {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  messageType?: "text" | "image" | "video" | "audio" | "document";
  createdAt: string;
  seen?: boolean;
};
