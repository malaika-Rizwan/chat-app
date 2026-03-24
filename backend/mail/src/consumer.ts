import amqplib from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const QUEUE_NAME = "send-otp";
const RABBITMQ_RETRY_MS = 5000;

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASSWORD must be set");
  }

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? user,
    to,
    subject,
    text: body,
  });
}

export const startSendOtpConsumer = async (): Promise<void> => {
  try {
    const url = process.env.RABBITMQ_URL?.trim();
    const connection = url
      ? await amqplib.connect(url)
      : await amqplib.connect({
          protocol: "amqp",
          hostname: process.env.RABBITMQ_HOST || "localhost",
          port: Number(process.env.RABBITMQ_PORT || 5672),
          username: process.env.RABBITMQ_USERNAME || "guest",
          password: process.env.RABBITMQ_PASSWORD || "guest",
        });

    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    await channel.consume(
      QUEUE_NAME,
      (message) => {
        if (!message) return;

        void (async () => {
          try {
            const payload = JSON.parse(message.content.toString()) as {
              to?: string;
              subject?: string;
              body?: string;
            };
            const { to, subject, body } = payload;
            if (!to || !subject || body === undefined) {
              throw new Error("Invalid message: expected { to, subject, body }");
            }

            await sendEmail(to, subject, body);
            console.log(`Email sent to ${to}`);
            channel.ack(message);
          } catch (err) {
            console.error("Failed to process OTP email message", err);
            channel.nack(message, false, false);
          }
        })();
      },
      { noAck: false }
    );

    console.log(`RabbitMQ OTP consumer listening on queue: ${QUEUE_NAME}`);
  } catch (error) {
    console.error(
      `RabbitMQ unavailable. Retrying in ${RABBITMQ_RETRY_MS / 1000}s...`,
      error
    );
    setTimeout(() => {
      void startSendOtpConsumer();
    }, RABBITMQ_RETRY_MS);
  }
};
