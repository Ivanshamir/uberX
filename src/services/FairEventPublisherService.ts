import amqp from 'amqplib';
import logger from '../config/logger';

export const publishRideFareCalculationRequest = async (rideFindInformation: any) => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Declare exchange and routing key
    const exchange = process.env.FAIR_EXCHANGE!;
    const routingKey = process.env.FARE_ROUTING_KEY!;

    try {
      // Try to check if exchange exists (passive mode)
      await channel.assertExchange(exchange, 'fanout', { passive: true });
    } catch (error: any) {
      if (error.code === 404) {
        // Exchange does not exist, so create it
        await channel.assertExchange(exchange, 'fanout', { durable: true });
        logger.info(`Exchange '${exchange}' created.`);
      } else {
        throw error; // If another error occurs, throw it
      }
    }

    // Publish the message
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(rideFindInformation)), {
      persistent: true,
    });

    logger.info('Ride fare calculation request published to RabbitMQ');

    // Close resources
    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error('Error publishing ride fare calculation request:', error);
  }
};
