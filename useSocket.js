const userSocketIdMap = new Map(); //a map of online usernames and their clients

const useSocket = (io) => {
  let users = {};
  io.on('connection', (socket) => {
    // ** video chat app **
    // join consultation room
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('user-connected', userId);

      // sent message to other to join
      socket.on('message', (message) => {
        io.to(roomId).emit('createMessage', message, userId);
      });

      // disconnect from the room
      socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId);
      });
    });

    // ** physiotherapist availability **
    socket.on('online-user', (socketId, userId) => {
      // physiotherapist join the available physiotherapist room
      users = addClientToMap(userId, socketId);
      io.emit('updatePhysiotherapistList', users);

      // physiotherapist exit the online physiotherapist room
      socket.on('disconnect', () => {
        users = removeClientFromMap(userId, socketId);
        io.emit('updatePhysiotherapistList', users);
      });
    });

    // client get the online physiotherapist list
    socket.on('get-online-physiotherapist', (fillter) => {
      socket.join(fillter);
      io.to(fillter).emit('updatePhysiotherapistList', users);
    });

    // ** video consultation **
    // patient make a call
    socket.on('call', (socketId, message) => {
      let rooms = mapToObject(io.sockets.adapter.rooms); // set request to physiotherapist
      if (!rooms[message.url]) {
        console.log(message.url + ' is Available');
        io.to(socketId).emit('retrieve', message);
        io.to(message.from).emit('availableCall', true);
      } else {
        console.log(message.url + ' is Not Available');
        io.to(message.from).emit('availableCall', false);
      }
    });

    // physiotherapist answer call
    socket.on('answerCall', (fromId, status) => {
      io.to(fromId).emit('retrieveCall', status);
    });
  });
}

// This function is use for adding the physiotherapist to the available physiotherapist room
// Physiotherapist that are in that room are physiotherapist who online and can have consult with patient.
const addClientToMap = (userId, socketId) => {
  if (!userSocketIdMap.has(userId)) {
    //when user is joining first time
    userSocketIdMap.set(userId, new Set([socketId]));
  } else {
    //user had already joined from one client and now joining using another client
    userSocketIdMap.get(userId).add(socketId);
  }
  return mapToObject(userSocketIdMap);
}

// This function is use for removing the physiotherapist to the available physiotherapist room when the physiotherapist is offline
const removeClientFromMap = (userId, socketId) => {
  if (userSocketIdMap.has(userId)) {
    let userSocketIdSet = userSocketIdMap.get(userId);
    userSocketIdSet.delete(socketId);
    //if there are no clients for a user, remove that user from online
    if (userSocketIdSet.size == 0) {
      userSocketIdMap.delete(userId);
    }
  }
  return mapToObject(userSocketIdMap);
}

// This is a reusable function for change the javascript map to object type
const mapToObject = (userSocketIdMap) => {
  const obj = Object.fromEntries(userSocketIdMap);

  Object.keys(obj).forEach((key) => {
    obj[key] = Array.from(obj[key]);
  });
  return obj;
}
module.exports = useSocket;
