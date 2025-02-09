import amqp from 'amqplib';
import logger from '../config/logger';

export const rideRequestEventPublisher = async (rideRequestBody: any) => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Declare exchange and routing key
    const exchange = process.env.RIDE_REQUEST_EXCHANGE!;
    const routingKey = process.env.RIDE_REQUEST_ROUTING_KEY!;

    try {
        // First try to check if exchange exists
        await channel.checkExchange(exchange);
        logger.info(`Exchange ${exchange} already exists`);
      } catch (error) {
        // If exchange doesn't exist, create it
        await channel.assertExchange(exchange, 'direct', { 
          durable: true,
          autoDelete: false
        });
        logger.info(`Exchange ${exchange} created`);
      }

    // Publish the message
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(rideRequestBody)), {
      persistent: true,
    });

    logger.info('Ride request published to RabbitMQ');

    // Close resources
    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error('Error publishing ride request:', error);
  }
};
