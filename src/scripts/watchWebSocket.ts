// src/scripts/watchWebSocket.ts
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const watchWebSocket = () => {
  // Connect to root WebSocket endpoint without path
  const PORT = process.env.PORT || 3000;
  const ws = new WebSocket(`ws://localhost:${PORT}`);

  console.log(`Connecting to WebSocket server at ws://localhost:${PORT}`);

  ws.on('open', () => {
    console.log('\n🟢 Connected to WebSocket server');
    console.log('Waiting for price updates...\n');
  });

  ws.on('message', (data) => {
    try {
      const parsedData = JSON.parse(data.toString());
      
      if (parsedData.type === 'CONNECTION_ESTABLISHED') {
        console.log('✅', parsedData.message);
        return;
      }

      console.log('\n🔔 New Price Update:');
      console.log('Timestamp:', new Date().toLocaleString());
      console.log('Data:', JSON.stringify(parsedData, null, 2));
      console.log('------------------------');
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('\n🔴 Disconnected from WebSocket server');
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(watchWebSocket, 5000);
  });

  ws.on('error', (error) => {
    if ((error as any).code === 'ECONNREFUSED') {
      console.log('❌ Connection refused. Is the server running?');
    } else {
      console.error('❌ WebSocket error:', error);
    }
  });
};

// Clear console and start
console.clear();
console.log('🚀 Starting WebSocket watcher...');
watchWebSocket();