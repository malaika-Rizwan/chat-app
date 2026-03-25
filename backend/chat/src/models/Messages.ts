import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    chatId:Types.ObjectId;
    sender:string;
    text?:string;
    image?:{
        url:string;
        publicId:string;
    };
    video?:{
        url:string;
        publicId:string;
    };
    audio?:{
        url:string;
        publicId:string;
    };
    document?:{
        url:string;
        publicId:string;
    };
    messageType: "text" | "image" | "video" | "audio" | "document";
    seen:boolean;
    seenAt?:Date;
    createdAt:Date;
    updatedAt:Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "chat", required: true },
    sender: { type: String, required: true },
    text: { type: String },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    video: {
      url: { type: String },
      publicId: { type: String },
    },
    audio: {
      url: { type: String },
      publicId: { type: String },
    },
    document: {
      url: { type: String },
      publicId: { type: String },
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "document"],
      default: "text",
      required: true,
    },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
  },
  { timestamps: true },
);

export const Message=mongoose.model<IMessage>("Message",messageSchema);
