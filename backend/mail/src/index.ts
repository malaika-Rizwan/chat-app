import express from "express";
import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";
dotenv.config();

void startSendOtpConsumer();

const app = express();

const port = Number(process.env.PORT || 5001);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});