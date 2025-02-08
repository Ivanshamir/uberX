import { Request, Response } from 'express';
import amqp, { Connection, Channel } from 'amqplib/callback_api';

export class RideStatusController {
  constructor() {}

  async start(req: Request, res: Response) {
    console.log(req.body);
    // Update the ride status to 'in_progress' in the database

    // Send ride start event to the event bus
    const exchange = process.env.RIDE_START_EXCHANGE as string;
    const routingKey = process.env.RIDE_START_ROUTING_KEY as string;
    const amqpUrl = process.env.RABBITMQ_URI as string;

    if (!exchange || !routingKey || !amqpUrl) {
      return res.status(500).json({ message: 'Environment variables not set properly' });
    }

    const message = JSON.stringify({ ride_id: req.body.ride_id, status: 'in_progress' });

    amqp.connect(amqpUrl, (error0: any, connection: Connection) => {
      if (error0) {
        throw error0;
      }
      connection.createChannel((error1: any, channel: Channel) => {
        if (error1) {
          throw error1;
        }
        channel.assertExchange(exchange, 'fanout', { durable: true });
        channel.publish(exchange, routingKey, Buffer.from(message));
        console.log(" [x] Sent %s: '%s'", routingKey, message);
      });

      setTimeout(() => {
        connection.close();
      }, 500);
    });

    // Return a response indicating the ride started successfully
    res.status(200).json({ message: 'Ride started successfully', ride_id: req.body.ride_id });
  }

  async end(req: Request, res: Response) {
    console.log(req.body);
    // Update the ride status to 'completed' in the database

    // Send ride end event to the event bus
    const exchange = process.env.RIDE_END_EXCHANGE as string;
    const routingKey = process.env.RIDE_END_ROUTING_KEY as string;
    const amqpUrl = process.env.RABBITMQ_URI as string;

    if (!exchange || !routingKey || !amqpUrl) {
      return res.status(500).json({ message: 'Environment variables not set properly' });
    }

    const message = JSON.stringify({ ride_id: req.body.ride_id, status: 'completed' });

    amqp.connect(amqpUrl, (error0: any, connection: Connection) => {
      if (error0) {
        throw error0;
      }
      connection.createChannel((error1: any, channel: Channel) => {
        if (error1) {
          throw error1;
        }
        channel.assertExchange(exchange, 'fanout', { durable: true });
        channel.publish(exchange, routingKey, Buffer.from(message));
        console.log(" [x] Sent %s: '%s'", routingKey, message);
      });

      setTimeout(() => {
        connection.close();
      }, 500);
    });

    // Return a response indicating the ride ended successfully
    res.status(200).json({ message: 'Ride ended successfully', ride_id: req.body.ride_id });
  }
}