import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDB, connectRedis, connectRabbitMQ } from './config/database';
import passengerRideRoutes from './routes/passengerRideRoute';
import rideStatusRoutes from './routes/rideStatusRoutes';
import logger from './config/logger';
import { setupPassengerQueue } from './exchange/PassengerEvent';
import { setupDriverQueue } from './exchange/DriverEvent';
import rideRouter from './routes/RideRoute';
import { WebSocketService } from './services/WebSocketService';
import { setupPriceConsumer } from './exchange/FareConsumeEvent';
import { listenToDriverMatchingResponse } from './exchange/DriverMatchingEvent';

dotenv.config();

const app = express();
app.use(express.json());

// Create WebSocket server
const server = createServer(app);
const wsService = new WebSocketService(server);

// Routes
app.use('/api/ride', rideRouter);
app.use('/api/passenger-ride', passengerRideRoutes);
app.use('/api/ride_status', rideStatusRoutes);

// Connect to databases
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();
    // passenger queue
    await setupPassengerQueue();
    await setupDriverQueue();
    // await setupPriceConsumer(wsService);
    await listenToDriverMatchingResponse();


    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`WebSocket server is running on ws://localhost:${PORT}`);
        logger.info(`WebSocket test page available at http://localhost:${PORT}/ws-test`);
      });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();