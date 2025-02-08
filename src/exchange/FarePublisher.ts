import amqp from 'amqplib';
import logger from '../config/logger';

export const farePublisher = async (data: any) => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Declare exchange and routing key
    const exchange = process.env.FARE_EXCHANGE_PUBLISHER!;
    const routingKey = process.env.FARE_ROUTING_KEY!;

    try {
        // First try to check if exchange exists
        await channel.checkExchange(exchange);
        logger.info(`Exchange ${exchange} already exists`);
      } catch (error) {
        // If exchange doesn't exist, create it
        await channel.assertExchange(exchange, 'fanout', { 
          durable: true,
          autoDelete: false
        });
        logger.info(`Exchange ${exchange} created`);
      }

      logger.info(`fare data publish ${JSON.stringify(data)}`);

    // Publish the message
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });

    logger.info('Fare data published to RabbitMQ');

    // Close resources
    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error('Error publishing fare data:', error);
  }
};
