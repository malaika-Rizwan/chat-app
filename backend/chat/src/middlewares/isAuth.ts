import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

type JwtPayloadWithUserId = JwtPayload & { userId?: string };

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayloadWithUserId;

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Please login - jwt error", error });
  }
};

export const myProfile = async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ userId: req.userId ?? null });
};