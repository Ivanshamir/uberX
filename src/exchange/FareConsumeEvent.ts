import amqp from 'amqplib';
import logger from '../config/logger';
import { Fare } from '../models/Fare';
import { WebSocketService } from '../services/WebSocketService';
import RideRequestService from '../services/RideRequestService';

// export const setupPriceConsumer = async (wsService: WebSocketService) => {
  export const setupPriceConsumer = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    const exchange = process.env.FARE_EXCHANGE!;
    const queue = process.env.FARE_QUEUE!;
    const routingKey = process.env.FARE_ROUTING_KEY!;

    // try {
    //   await channel.checkExchange(exchange);
    // } catch (error) {
    //   await channel.assertExchange(exchange, 'direct', { 
    //     durable: true,
    //     autoDelete: false
    //   });
    // }

    // await channel.assertQueue(queue, { 
    //   durable: true,
    //   autoDelete: false
    // });

    // await channel.assertExchange(exchange, 'direct', { 
    //   durable: true,
    //   autoDelete: false
    // });
    // logger.info(`Exchange ${exchange} ready`);

    // Assert queue
    await channel.assertQueue(queue, { 
      durable: true,
      autoDelete: false
    });
    logger.info(`Queue ${queue} ready`);

    // Assert queue (this is safe to call even if queue exists)
    const queueResult = await channel.assertQueue(queue, { 
      durable: true,
      autoDelete: false
    });
    logger.info(`Queue ${queue} asserted with ${queueResult.messageCount} messages`);

    // Bind queue to exchange (this is idempotent)
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
        const ride = new RideRequestService();
        await ride.consumeFareServiceData(priceData);

        // Broadcast via WebSocket
        // wsService.broadcastPrice(priceData);

        // Acknowledge the message
        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing price message:', error);
        channel.nack(msg, false, true);
      }
    });

    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
      setTimeout(() => setupPriceConsumer(), 5000);
    });

  } catch (error) {
    logger.error('Error setting up price consumer:', error);
    setTimeout(() => setupPriceConsumer(), 5000);
  }
};
