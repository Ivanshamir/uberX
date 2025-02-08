import amqp from 'amqplib';
import logger from '../config/logger';
import { Passenger } from '../models/Passenger';
import RideRequestService from '../services/RideRequestService';

export const locationConsumer = async () => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Queue configuration
    const exchange = process.env.LOCATION_PUBLISH_EXCHANGE!;
    const routingKey = process.env.LOCATION_PUBLISH_ROUTING_KEY!;
    const queue = process.env.LOCATION_CONSUME_QUEUE!;

    // try {
    //   // First try to check if exchange exists
    //   await channel.checkExchange(exchange);
    //   logger.info(`Exchange ${exchange} already exists`);
    // } catch (error) {
    //   // If exchange doesn't exist, create it
    //   await channel.assertExchange(exchange, 'fanout', { 
    //     durable: true,
    //     autoDelete: false
    //   });
    //   logger.info(`Exchange ${exchange} created`);
    // }
    await channel.assertExchange(exchange, 'fanout', { 
      durable: true,
      autoDelete: false
    });
    logger.info(`Exchange ${exchange} ready`);

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
    logger.info(`Queue ${queue} bound to exchange ${exchange} with routing key ${routingKey}`);

    // Set prefetch to 1 to handle one message at a time
    channel.prefetch(1);

    // Consume messages
    await channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        let locationData;
        const content = msg.content.toString();
        
        try {
          // First try parsing once
          locationData = JSON.parse(content);
          // If it's still a string, parse again
          if (typeof locationData === 'string') {
            locationData = JSON.parse(locationData);
          }
        } catch (parseError) {
          logger.error('Error parsing message:', parseError);
          // Reject message without requeue if it's unparseable
          channel.nack(msg, false, false);
          return;
        }

        logger.info('Processing location data:', locationData);

        const location = new RideRequestService();
        await location.consumeLocationServiceData(locationData);
        
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
      setTimeout(() => locationConsumer(), 5000);
    });

    // Handle errors
    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error:', error);
    });

  } catch (error) {
    logger.error('Error setting up RabbitMQ consumer:', error);
    // Attempt to reconnect after 5 seconds
    setTimeout(() => locationConsumer(), 5000);
  }
};