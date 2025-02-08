export interface IQueueService {
  publish(exchange: string, message: any): Promise<void>;
  consume(
    exchange: string,
    queue: string,
    callback: (message: any) => void
  ): Promise<void>;
}
