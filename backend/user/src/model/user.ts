import mongoose, { Schema } from "mongoose";
 
export interface Iuser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

const schema = new Schema<Iuser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const User=mongoose.model<Iuser>("User",schema);