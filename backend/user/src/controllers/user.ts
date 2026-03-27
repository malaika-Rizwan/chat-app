import TryCatch from "../config/TryCatch.js";
import type { Request, Response } from "express";
import { User } from "../model/user.js";
import { redisClient } from "../index.js";
import { publishMessage } from "../config/rabbitmq.js";
import { generateToken } from "../config/generateToken.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

const OTP_QUEUE = "send-otp";
const OTP_EXPIRE_SECONDS = 60 * 5;
const RATE_LIMIT_SECONDS = 60;

export const loginUser = TryCatch(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const ratelimitkey = `otp:ratelimit:${normalizedEmail}`;
  const rateLimit = await redisClient.get(ratelimitkey);
  if (rateLimit) {
    return res.status(429).json({ message: "Too many requests" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${normalizedEmail}`;
  await redisClient.set(otpKey, otp, { EX: OTP_EXPIRE_SECONDS });
  await redisClient.set(ratelimitkey, "true", { EX: RATE_LIMIT_SECONDS });

  const message = {
    to: normalizedEmail,
    subject: "OTP for login",
    body: `Your OTP for login is ${otp}. It is valid for 5 minutes.`,
  };
  await publishMessage(OTP_QUEUE, JSON.stringify(message));

  return res.status(200).json({
    message: "OTP sent successfully",
  });
});

export const verifyOTP = TryCatch(async (req: Request, res: Response) => {
  const { email, otp: enteredOTP } = req.body as {
    email?: string;
    otp?: string;
  };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !enteredOTP) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  const otpKey = `otp:${normalizedEmail}`;
  const storedOTP = await redisClient.get(otpKey);
  if (!storedOTP || storedOTP !== enteredOTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  await redisClient.del(otpKey);
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const name = normalizedEmail.slice(0, 8);
    user = await User.create({ email: normalizedEmail, name });
  }

  const token = generateToken(user._id.toString());
  return res.status(200).json({
    message: "OTP verified successfully",
    token,
    user,
  });
});


export const updateName = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ message: "User not found, please login" });
      return;
    }

    user.name = req.body.name;
    await user.save();

    const token = generateToken(user._id.toString());
    return res
      .status(200)
      .json({ message: "Name updated successfully", user, token });
  }
);

export const getAllUsers = TryCatch(
  async (_req: AuthenticatedRequest, res: Response) => {
    const users = await User.find();
    return res.status(200).json({ users });
  }
);

export const getAUser = TryCatch(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ user });
});