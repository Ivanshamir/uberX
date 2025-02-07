import amqp from 'amqplib';
import logger from '../config/logger';
import { Passenger } from '../models/Passenger';

export const setupPassengerQueue = async () => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URI!);
    const channel = await connection.createChannel();

    // Queue configuration
    const exchange = process.env.PASSENGER_EXCHANGE!;
    const queue = process.env.PASSENGER_QUEUE!;
    const routingKey = process.env.PASSENGER_ROUTING_KEY!;

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
        let passengerData;
        const content = msg.content.toString();
        
        try {
          // First try parsing once
          passengerData = JSON.parse(content);
          // If it's still a string, parse again
          if (typeof passengerData === 'string') {
            passengerData = JSON.parse(passengerData);
          }
        } catch (parseError) {
          logger.error('Error parsing message:', parseError);
          // Reject message without requeue if it's unparseable
          channel.nack(msg, false, false);
          return;
        }

        logger.info('Processing passenger data:', passengerData);

        // Check for required fields
        if (!passengerData.firstName || !passengerData.lastName || 
          !passengerData.email || !passengerData.phone) {
        logger.error('Missing required fields:', {
          firstName: !passengerData.firstName,
          lastName: !passengerData.lastName,
          email: !passengerData.email,
          phone: !passengerData.phone
        });
        channel.nack(msg, false, false);
        return;
      }

      // First check if email exists
      const existingPassenger = await Passenger.findOne({ email: passengerData.email });
      
      if (existingPassenger) {
        logger.info(`Passenger with email ${passengerData.email} already exists. Updating record...`);
        
        // Update existing passenger
        const updatedPassenger = await Passenger.findOneAndUpdate(
          { email: passengerData.email },
          {
            $set: {
              firstName: passengerData.firstName,
              lastName: passengerData.lastName,
              phone: passengerData.phone,
              identificationType: passengerData.identificationType || existingPassenger.identificationType,
              identificationNumber: passengerData.identificationNumber || existingPassenger.identificationNumber,
              identificationDocuments: passengerData.identificationDocuments || existingPassenger.identificationDocuments,
              presentAddress: passengerData.presentAddress || existingPassenger.presentAddress,
              permanentAddress: passengerData.permanentAddress || existingPassenger.permanentAddress,
              status: passengerData.status || existingPassenger.status,
              rating: passengerData.rating || existingPassenger.rating,
              updatedAt: Date.now()
            }
          },
          { new: true }
        );

        logger.info(`Updated passenger with ID: ${updatedPassenger?._id}`);
        channel.ack(msg);
        return;
      }

        // Save to MongoDB
        const passenger = new Passenger(passengerData);
        await passenger.save();
        logger.info(`Saved passenger data with ID: ${passenger._id}`);

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
      setTimeout(() => setupPassengerQueue(), 5000);
    });

    // Handle errors
    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error:', error);
    });

  } catch (error) {
    logger.error('Error setting up RabbitMQ consumer:', error);
    // Attempt to reconnect after 5 seconds
    setTimeout(() => setupPassengerQueue(), 5000);
  }
};