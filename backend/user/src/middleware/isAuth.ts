import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/user.js";
import type { Iuser } from "../model/user.js";

type JwtPayload = {
  userId: string;
};

export interface AuthenticatedRequest extends Request {
  user?: Iuser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { userId } = decoded as JwtPayload;
    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Please login - jwt error", error });
  }
};

export const myProfile = async (req: AuthenticatedRequest, res: Response) => {
  return res.json(req.user);
};