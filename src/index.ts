import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDB, connectRedis, connectRabbitMQ } from './config/database';
import passengerRide from './routes/passengerRide';
import rideStatusRoutes from './routes/rideStatusRoutes';
import logger from './config/logger';
import { setupPassengerQueue } from './exchange/PassengerEvent';
import passengerRideRoutes from "./routes/passengerRideRoute";
import { setupDriverQueue } from './exchange/DriverEvent';
import rideRouter from './routes/RideRoute';
import { WebSocketService } from './services/WebSocketService';
import { setupPriceConsumer } from './exchange/FareConsumeEvent';
import { listenToDriverMatchingResponse } from './exchange/DriverMatchingEvent';
import { farePublisher } from './exchange/FarePublisher';
import { locationConsumer } from './exchange/LocationConsumer';
import { setupRideRequestConsumerQueue } from './exchange/RideRequesConsumer';
import { RabbitMQService } from "./services/RabbitMQService";

dotenv.config();

const app = express();
app.use(express.json());

// Create WebSocket server
const server = createServer(app);
const wsService = new WebSocketService(server);
const rabbitMQService = new RabbitMQService();

// Routes
app.use("/api/ride", rideRouter);
app.use("/api/passenger-ride", passengerRideRoutes);
app.use("/api/ride_status", rideStatusRoutes);

// Connect to databases
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();
    await rabbitMQService.initialize();
    // passenger queue
    await setupPassengerQueue();
    await setupDriverQueue();
    // await setupPriceConsumer(wsService);
    await listenToDriverMatchingResponse();
    await locationConsumer();
    await setupRideRequestConsumerQueue();
    await setupPriceConsumer(wsService);

    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`WebSocket server is running on ws://localhost:${PORT}`);
      logger.info(
        `WebSocket test page available at http://localhost:${PORT}/ws-test`
      );
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("Shutting down server...");
      await rabbitMQService.close();
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
