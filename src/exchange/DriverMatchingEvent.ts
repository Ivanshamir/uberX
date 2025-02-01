import amqp from "amqplib";
import { DriverMatchingRequestEvent } from "../dto/DriverMatchingRequest";

export const publishDriverMatchingRequestEvent = async (
  event: DriverMatchingRequestEvent
) => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Exchange configuration
    const exchange = process.env.DRIVER_MATCHING_REQUEST_EXCHANGE!;

    // Assert exchange
    await channel.assertExchange(exchange, "fanout", { durable: true });

    // Publish the driver matching request event
    channel.publish(exchange, "", Buffer.from(JSON.stringify(event)));

    console.log(`Published driver matching request event`);

    // Close the channel and connection
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error publishing driver matching request event:", error);
  }
};

export const listenToDriverMatchingResponse = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    const exchange = process.env.DRIVER_MATCHING_RESPONSE_EXCHANGE!;
    const queue = process.env.DRIVER_MATCHING_RESPONSE_QUEUE!;

    await channel.assertExchange(exchange, "fanout", { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, "");

    channel.prefetch(1);

    console.log("Waiting for driver matching response...");

    channel.consume(queue, (msg) => {
      if (msg) {
        const response = JSON.parse(msg.content.toString());
        console.log("Received driver matching response:", response);
        // Process the response as needed
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error setting up driver matching response listener:", error);
  }
};
