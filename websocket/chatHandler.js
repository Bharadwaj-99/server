const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const connectedClients = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const token = req.url.split('=')[1];
    if (!token) {
      ws.close();
      return;
    }

    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      connectedClients.set(decoded.userId, ws);

      ws.on('message', async (message) => {
        const data = JSON.parse(message);
        const newMessage = new Message({
          sender: decoded.userId,
          content: data.content,
        });
        await newMessage.save();

        broadcastMessage(newMessage);
      });

      

      ws.on('close', () => {
        connectedClients.delete(decoded.userId);
      });
    } catch (error) {
      ws.close();
    }
  });
}

function broadcastMessage(message) {
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

module.exports = setupWebSocket;