const express = require('express');
const http = require('http');
const path = require('path');
const { PORT, MONGODB_URI } = require('./config/config');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const setupWebSocket = require('./websocket/chatHandler');

const app = express();
const server = http.createServer(app);

connectDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

setupWebSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));