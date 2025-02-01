import amqp from 'amqplib';
import logger from '../config/logger';
import { Passenger } from '../models/Passenger';

export const setupPassengerQueue = async () => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Queue configuration
    const exchange = process.env.PASSENGER_EXCHANGE!;
    const queue = process.env.PASSENGER_QUEUE!;
    const routingKey = process.env.PASSENGER_ROUTING_KEY!;

    // Assert exchange and queue
    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    // Set prefetch to 1 to handle one message at a time
    channel.prefetch(1);

    logger.info('RabbitMQ passenger consumer setup completed');

    // Consume messages
    await channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        // Parse message content
        logger.info(`Received passenger data: ${msg.content.toString()}`);
        const passengerData = JSON.parse(msg.content.toString());
        logger.info(`Received passenger data: ${JSON.stringify(passengerData)}`);

        // Save to MongoDB
        const passenger = new Passenger(passengerData);
        await passenger.save();
        logger.info(`Saved passenger data with ID: ${passenger._id}`);

        // Acknowledge the message
        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing message:', error);
        // Reject the message and requeue
        channel.nack(msg, false, true);
      }
    });

    // Handle connection closure
    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => setupPassengerQueue(), 5000);
    });

    // Handle errors
    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error:', error);
    });

  } catch (error) {
    logger.error('Error setting up RabbitMQ consumer:', error);
    // Attempt to reconnect after 5 seconds
    setTimeout(() => setupPassengerQueue(), 5000);
  }
};