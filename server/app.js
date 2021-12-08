const app = require('express');
const http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('new client connected', socket.id);

  // join general room when you connect
  socket.join("general");

  socket.on('user_join', (name) => {
    io.to("general").emit('user_join', name);
    
  });
  
  // adding rooms
  socket.on('room_join', (name,room) => {
    socket.join(room);
    socket.to(room).emit('room_join',name);
  });
  // send message to specific room
  socket.on('message', ({ name, message },room) => {
    console.log(room, name, message, socket.id);
    io.to(room).emit('message', { name, message });
  });
  // const count = io.engine.clientsCount;
  // console.log('num clients: ',count);

  socket.on('message', ({ name, message }) => {
    console.log(name, message, socket.id);
    io.to("general").emit('message', { name, message });
  });

  socket.on('disconnect', () => {
    console.log('Disconnect Fired');
  });
});

http.listen(4000, () => {
  console.log(`listening on *:${4000}`);
});