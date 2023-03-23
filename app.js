const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const cors = require('cors');

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

const corsOptions = {
  origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));

// Socket.io connection
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is Running',
  });
});

const useSocket = require('./useSocket');
useSocket(io);

server.listen(8080, () => {
  console.log('listening on *:8080');
});
