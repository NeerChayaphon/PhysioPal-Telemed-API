const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Socket.io connection
const io = require('socket.io')(server, {
  cors: 'localhost:3000',
});
// cor
const cors = require('cors');
app.use(cors());

app.use(express.json());

const useSocket = require('./useSocket');
useSocket(io);

server.listen(8080, () => {
  console.log('listening on *:8080');
});
