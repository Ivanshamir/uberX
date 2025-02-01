import mongoose from 'mongoose';
import { createClient } from 'redis';
import amqp from 'amqplib';
import logger from '../config/logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info('MongoDB Connected Successfully');
    
    // Insert sample data
    const Trip = mongoose.model('Trip', new mongoose.Schema({
      userId: String,
      driverId: String,
      status: String,
      createdAt: Date
    }));

    await Trip.create({
      userId: 'user123',
      driverId: 'driver456',
      status: 'completed',
      createdAt: new Date()
    });
    
    logger.info('Sample MongoDB data inserted');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const connectRedis = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URI
    });

    await client.connect();
    await client.set('test_key', 'Connection successful');
    logger.info('Redis Connected Successfully');
    
    return client;
  } catch (error) {
    logger.error('Redis connection error:', error);
    process.exit(1);
  }
};

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();
    
    // Create a test queue
    await channel.assertQueue('test_queue', { durable: true });
    await channel.sendToQueue('test_queue', Buffer.from('Test message'));
    
    logger.info('RabbitMQ Connected Successfully');
    return { connection, channel };
  } catch (error) {
    logger.error('RabbitMQ connection error:', error);
    process.exit(1);
  }
};