import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectToRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";
dotenv.config();
connectToRabbitMQ().catch((err) => {
  console.error("RabbitMQ unavailable (user service will still run)", err);
});

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1/user", userRoutes);
app.use(express.json());
export const redisClient = createClient({
  ...(process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {}),
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    await redisClient.connect();
    console.log("Connected to Redis");

    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start service", err);
    process.exit(1);
  }
};

start();