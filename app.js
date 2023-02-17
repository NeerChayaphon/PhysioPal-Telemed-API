const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Socket.io connection
const io = require('socket.io');
const cors = require('cors');

// cors
io.origins('*:*'); // Allow all origins
io.use(cors()); // Enable CORS

app.use(express.json());

const useSocket = require('./useSocket');
useSocket(io);

server.listen(8080, () => {
  console.log('listening on *:8080');
});
