import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";

dotenv.config()
await connectDB();

const app = express();

app.use("/api/v1",chatRoutes);
app.use(express.json());

// Support both `PORT` and `port` from env files; default to 5002.
const port =
  Number(process.env.PORT ?? process.env.port ?? 5002) || 5002;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});