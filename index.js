// Dependencies
const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const app = express();
const WebSocket = require('ws');

// Middleware
app.use(express.json()); // Parse incoming JSON
dotenv.config(); // Load .env into environment variables

// Welcome
app.get('/', (req, res) => {
  res.send('Maritime Port Management API is running.');
});

// Start the HTTP server on PORT 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket server on a different port (3002)
const WEBSOCKET_PORT = process.env.WS_PORT || 3002;
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });

let clients = [];

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.push(ws);

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

const broadcastMessage = () => {
    const message = JSON.stringify({ message: 'Hello from the server', timestamp: new Date() });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

setInterval(broadcastMessage, 5000);

console.log(`WebSocket server started on ws://localhost:${WEBSOCKET_PORT}`);
