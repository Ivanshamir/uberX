import amqp from 'amqplib';
import logger from '../config/logger';
import { Fare } from '../models/Fare';
import { WebSocketService } from '../services/WebSocketService';

export const setupPriceConsumer = async (wsService: WebSocketService) => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    const exchange = process.env.FARE_EXCHANGE!;
    const queue = process.env.FARE_QUEUE!;
    const routingKey = process.env.FARE_ROUTING_KEY!;

    try {
      await channel.checkExchange(exchange);
    } catch (error) {
      await channel.assertExchange(exchange, 'direct', { 
        durable: true,
        autoDelete: false
      });
    }

    await channel.assertQueue(queue, { 
      durable: true,
      autoDelete: false
    });

    await channel.bindQueue(queue, exchange, routingKey);
    channel.prefetch(1);

    logger.info('RabbitMQ price consumer setup completed');

    // Consume messages
    await channel.consume(queue, async (msg) => {
      if (!msg) {
        logger.warn('Received null message');
        return;
      }

      try {
        // Parse and log the message
        const priceData = JSON.parse(msg.content.toString());
        logger.info('Received price data:', priceData);

        // Save to MongoDB
        const price = new Fare(priceData);
        await price.save();
        logger.info(`Saved price data with ID: ${price._id}`);

        // Broadcast via WebSocket
        wsService.broadcastPrice(priceData);

        // Acknowledge the message
        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing price message:', error);
        channel.nack(msg, false, true);
      }
    });

    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
      setTimeout(() => setupPriceConsumer(wsService), 5000);
    });

  } catch (error) {
    logger.error('Error setting up price consumer:', error);
    setTimeout(() => setupPriceConsumer(wsService), 5000);
  }
};
