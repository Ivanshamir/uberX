import amqp from "amqplib";
import logger from "../config/logger";
import { IQueueService } from "./interfaces/IQueueService";

export class RabbitMQService implements IQueueService {
  private channel!: amqp.Channel;
  private connection!: amqp.Connection;

  constructor(private rabbitMqUrl: string = process.env.RABBITMQ_URI!) {}

  async initialize(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.rabbitMqUrl);
      this.channel = await this.connection.createChannel();
      logger.info("RabbitMQ connection established.");
    } catch (error) {
      logger.error("Failed to initialize RabbitMQ:", error);
      throw error;
    }
  }

  async publish(exchange: string, message: any): Promise<void> {
    try {
      await this.channel.assertExchange(exchange, "fanout", { durable: true });
      this.channel.publish(exchange, "", Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      logger.info(`Message published to exchange: ${exchange}`);
    } catch (error) {
      logger.error(`Failed to publish message to exchange ${exchange}:`, error);
      throw error;
    }
  }

  async consume(
    exchange: string,
    queue: string,
    callback: (message: any) => void
  ): Promise<void> {
    try {
      await this.channel.assertExchange(exchange, "fanout", { durable: true });
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, "");

      this.channel.consume(queue, (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          this.channel.ack(msg);
          logger.info(
            `Message consumed from queue: ${queue}, exchange: ${exchange}`
          );
        }
      });
      logger.info(
        `Started consuming from queue: ${queue}, exchange: ${exchange}`
      );
    } catch (error) {
      logger.error(
        `Failed to consume from queue ${queue}, exchange ${exchange}:`,
        error
      );
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.channel.close();
      await this.connection.close();
      logger.info("RabbitMQ connection closed.");
    } catch (error) {
      logger.error("Failed to close RabbitMQ connection:", error);
      throw error;
    }
  }
}
