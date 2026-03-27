import type { Response } from "express";
import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/Messages.js";

export const createNewChat = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { otherUserId } = req.body as { otherUserId?: string };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    if (otherUserId === userId) {
      return res.status(400).json({ message: "Cannot create chat with self" });
    }

    const existingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId] },
    }).select("_id");

    if (existingChat) {
      return res.json({
        message: "Chat already exists",
        chatId: existingChat._id,
      });
    }

    const newChat = await Chat.create({
      users: [userId, otherUserId],
      latestMessage: {
        text: "",
        sender: userId,
      },
    });

    return res.status(201).json({
      message: "New chat created successfully",
      chatId: newChat._id,
    });
  },
);
export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "user id missing" });
  }
  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });
  const chatsWithMeta = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);
      if (!otherUserId) {
        return { chat, unseenCount: 0, otherUser: null };
      }

      const unseenCount = await Message.countDocuments({
        chatId: chat._id,
        seen: false,
        sender: { $ne: userId },
      });

      let otherUser: unknown = null;
      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/user/user/${otherUserId}`,
        );
        return{
          user:data,
          chat:{
            ...chat.toObject(),
            latestMessageText:chat.latestMessage || null,
            unseenCount,
            latestMessage:chat.latestMessage || null,
          }
        }
      } catch {
        console.error("Error fetching other user data");
        return {
           user:{_id:otherUserId,name:"Unknown user"},
           chat:{
            ...chat.toObject(),
            latestMessageText:chat.latestMessage || null,
            unseenCount,
            latestMessage:chat.latestMessage || null,
           }
        
        };
      }
    }),
  );
  return res.json({ chats: chatsWithMeta });
});

export const sendMessage = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const senderId = req.userId;
    const { chatId, text, image, video, audio, document } = req.body as {
      chatId?: string;
      text?: string;
      image?: string;
      video?: string;
      audio?: string;
      document?: string;
    };

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }
    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }
    if (!text && !image && !video && !audio && !document) {
      return res.status(400).json({
        message: "text, image, video, audio, or document is required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (!chat.users.includes(senderId)) {
      return res
        .status(403)
        .json({ message: "You are not a part of this chat" });
    }

    const messageType = text
      ? "text"
      : image
        ? "image"
        : video
          ? "video"
          : audio
            ? "audio"
            : "document";

    const messagePayload: Record<string, unknown> = {
      chatId: chat._id,
      sender: senderId,
      messageType,
      seen: false,
    };
    if (text !== undefined) messagePayload.text = text;
    if (image) messagePayload.image = { url: image, publicId: "" };
    if (video) messagePayload.video = { url: video, publicId: "" };
    if (audio) messagePayload.audio = { url: audio, publicId: "" };
    if (document) messagePayload.document = { url: document, publicId: "" };

    const created = await Message.create(messagePayload);

    const latestMessageText =
      messageType === "text" ? text ?? "" : `[${messageType}]`;

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: { text: latestMessageText, sender: senderId },
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data: created,
    });
  },
);

export const getMessagesByChat = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { chatId } = req.body as { chatId?: string };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }
    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (!chat.users.includes(userId)) {
      return res.status(403).json({ message: "You are not a part of this chat" });
    }

    const messages = await Message.find({ chatId: chat._id }).sort({
      createdAt: -1,
    });

    // Mark other user's unseen messages as seen
    await Message.updateMany(
      {
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      },
      { $set: { seen: true, seenAt: new Date() } },
    );

    return res.status(200).json({ messages });
  },
);
