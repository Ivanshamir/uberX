import amqp from 'amqplib';
import logger from '../config/logger';
import { Passenger } from '../models/Passenger';
import { Driver } from '../models/Driver';

export const setupDriverQueue = async () => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Queue configuration
    const exchange = process.env.DRIVER_EXCHANGE!;
    const queue = process.env.DRIVER_QUEUE!;
    const routingKey = process.env.DRIVER_ROUTING_KEY!;

    // Assert exchange and queue
    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    // Set prefetch to 1 to handle one message at a time
    channel.prefetch(1);

    logger.info('RabbitMQ driver consumer setup completed');

    // Consume messages
    await channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        // Parse message content
        logger.info(`Received Driver data: ${msg.content.toString()}`);
        const driverData = JSON.parse(msg.content.toString());
        logger.info(`Received driver data: ${JSON.stringify(driverData)}`);

        // Save to MongoDB
        const driver = new Driver(driverData);
        await driver.save();
        logger.info(`Saved driver data with ID: ${driver._id}`);

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
      setTimeout(() => setupDriverQueue(), 5000);
    });

    // Handle errors
    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error:', error);
    });

  } catch (error) {
    logger.error('Error setting up RabbitMQ consumer:', error);
    // Attempt to reconnect after 5 seconds
    setTimeout(() => setupDriverQueue(), 5000);
  }
};