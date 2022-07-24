const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');
const app = express();
const SocketIO = require('socket.io');

const io = SocketIO(app.listen(8080),{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

//PEER SERVER
const http = require('http');
const server = http.createServer(app);
const ExpressPeerServer = require('peer').ExpressPeerServer;
const peerServer = ExpressPeerServer(server);

app.use('/peerjs', peerServer);

server.listen(8000);
//PEER SERVER

let messages = [];

//Routes

/*app.get('/', (req, res)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
  app.use(cors());
  res.send(v4());
});*/

//Events
io.on('connect', (socket) => {

  //Join treatment

  const room = socket.handshake.query.room;
  const user = socket.id;

  socket.join(room);
  
  socket.on('newUserConnected', () =>{
    socket.emit('getUser', user);

    let userList= io.sockets.adapter.rooms.get(room);

    let arrUserList = undefined;

    if (userList !== undefined){
      arrUserList = Array.from(userList);
    } else {
      arrUserList = arrUserList;
    }
    
    io.in(room).emit('getUserList', Array.from(userList));

    if(messages[room]){
      io.in(room).emit('getChat', messages[room]);
    }
  });

  socket.on('disconnect', () => {
    let userList = io.sockets.adapter.rooms.get(room);

    let arrUserList = undefined;

    if (userList !== undefined){
      arrUserList = Array.from(userList);
    } else {
      arrUserList = arrUserList;
    }

    io.in(room).emit('getUserList', arrUserList);
    io.in(room).emit('removeVideo', user);
  });

  //Messages treatment

  socket.on('newMessage', (args) => {
    if(messages[room] === undefined){
      messages[room] = [];
      messages[room].push({message: args.message, user: args.user});
    } else {
      messages[room].push({message: args.message, user: args.user});
    }

    io.in(room).emit('getChat', messages[room]);
  });

  io.of("/").adapter.on("delete-room", (room) => {
    if(messages[room] !== undefined){
      delete messages[room];
    }
  });
});