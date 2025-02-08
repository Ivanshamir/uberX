// src/publishers/locationServicePublisher.ts
import amqp from 'amqplib';
import logger from '../config/logger';

export const locationServicePublisher = async (data: any) => {
  let connection;
  let channel;

  try {
    // Connect to RabbitMQ
    connection = await amqp.connect(process.env.RABBITMQ_URI!);
    channel = await connection.createChannel();

    // Queue configuration
    const queue = process.env.LOCATION_PUBLISH_QUEUE!;

    // Assert queue
    await channel.assertQueue(queue, { 
      durable: true    // Queue survives broker restart
    });

    // Send message directly to queue
    const sent = channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,         // Message survives broker restart
        messageId: `loc-${Date.now()}`,
        timestamp: Date.now(),
        contentType: 'application/json'
      }
    );

    if (sent) {
      logger.info('Location data published to queue:', {
        queue,
        messageId: `loc-${Date.now()}`
      });
    } else {
      throw new Error('Failed to publish message to queue');
    }

  } catch (error) {
    logger.error('Error publishing location data:', error);
    throw error;
  } finally {
    try {
      // Clean up resources
      if (channel) await channel.close();
      if (connection) await connection.close();
    } catch (closeError) {
      logger.error('Error closing connections:', closeError);
    }
  }
};
