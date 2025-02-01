import express from 'express';
import dotenv from 'dotenv';
import { connectDB, connectRedis, connectRabbitMQ } from './config/database';
import userRoutes from './routes/userRoutes';
import logger from './config/logger';
import { setupPassengerQueue } from './exchange/PassengerEvent';
import { setupDriverQueue } from './exchange/DriverEvent';

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Connect to databases
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();
    // passanger queue
    await setupPassengerQueue(); // Add this line

    await setupDriverQueue();


    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();