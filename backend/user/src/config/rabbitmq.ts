import amqplib from "amqplib";

let channel: amqplib.Channel | null = null;

export const connectToRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST || "localhost",
      port: Number(process.env.RABBITMQ_PORT || 5672),
      username: process.env.RABBITMQ_USERNAME || "guest",
      password: process.env.RABBITMQ_PASSWORD || "guest",
    });

    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
};

export const getRabbitMQChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }
  return channel;
};

export const publishMessage = async (queueName: string, message: string) => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }
  await channel.assertQueue(queueName, {
    durable: true,
  });
  await channel.sendToQueue(queueName, Buffer.from(message));
  console.log(`Message sent to ${queueName}`);
};