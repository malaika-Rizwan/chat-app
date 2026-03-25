import type { RequestHandler } from "express";

const TryCatch =
  (handler: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Internal server error",
        error: errMessage,
      });
    }
  };

export default TryCatch;
