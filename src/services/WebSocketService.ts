// src/services/WebSocketService.ts
import WebSocket from 'ws';
import logger from '../config/logger';

export class WebSocketService {
  private wss: WebSocket.Server;
  
  constructor(server: any) {
    // Create WebSocket server without path restriction
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws) => {
      logger.info('New WebSocket connection established');
      
      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        message: 'Connected to price updates service'
      }));
      
      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });

    logger.info('WebSocket service initialized');
  }

  broadcastPrice(priceData: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log('Sending price update to client:', client);
        client.send(JSON.stringify({
          type: 'PRICE_UPDATE',
          data: priceData,
          timestamp: Date.now()
        }));
      } else {
        console.log('Client is not open:', client);
      }
    });
  }

  // Add a method to send a message to a specific client
  sendMessageToClient(client: WebSocket, message: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    } else {
      logger.error('Client is not open:', client);
    }
  }

  // Add a method to close the WebSocket server
  close() {
    this.wss.close();
  }
}