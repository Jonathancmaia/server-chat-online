const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');
const app = express();
const SocketIO = require('socket.io');
const https = require('https');
const fs = require('fs');

const httpsServer = https
  .createServer(
    {
      cert: fs.readFileSync(
        '/etc/letsencrypt/live/vps49384.publiccloud.com.br/fullchain.pem',
      ),
      key: fs.readFileSync(
        '/etc/letsencrypt/live/vps49384.publiccloud.com.br/privkey.pem',
      ),
    },
    app,
  )
  .listen(7000);

const io = SocketIO(httpsServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let messages = [];
let nicknames = [];

//Routes
app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  app.use(cors());
  res.send(v4());
});

//Io Events
io.on('connect', (socket) => {
  //Join treatment
  const room = socket.handshake.query.room;
  const user = socket.id;
  let myNickname = false;

  socket.join(room);

  io.in(room).emit('getNickname', nicknames[room]);

  socket.on('newUserConnected', () => {
    socket.emit('getUser', user);

    let userList = io.sockets.adapter.rooms.get(room);

    let arrUserList = undefined;

    if (userList !== undefined) {
      arrUserList = Array.from(userList);
    } else {
      arrUserList = arrUserList;
    }

    io.in(room).emit('getUserList', Array.from(userList));

    if (messages[room]) {
      io.in(room).emit('getChat', messages[room]);
    }
  });

  //disconect treatment
  socket.on('disconnect', () => {
    let userList = io.sockets.adapter.rooms.get(room);

    let arrUserList = undefined;

    if (userList !== undefined) {
      arrUserList = Array.from(userList);
    } else {
      arrUserList = arrUserList;
    }

    if (myNickname) {
      delete nicknames[room][myNickname];
    }

    io.in(room).emit('getUserList', arrUserList);
    io.in(room).emit('removeVideo', user);
  });

  //Messages treatment
  socket.on('newMessage', (args) => {
    if (messages[room] === undefined) {
      messages[room] = [];
      messages[room].push({ message: args.message, user: args.user });
    } else {
      messages[room].push({ message: args.message, user: args.user });
    }

    io.in(room).emit('getChat', messages[room]);
  });

  //Nickname change
  socket.on('sendNickname', (arg) => {
    if (nicknames[room] === undefined) {
      nicknames[room] = [];
      nicknames[room].push(arg);
      myNickname = 0;
    } else {
      let index = false;
      for (let i = -1; i <= nicknames[room].length; ) {
        if (nicknames[room][i] !== undefined) {
          if (nicknames[room][i].user === user) {
            index = i;
          }
        }
        i++;
      }

      if (index !== false) {
        nicknames[room][index] = arg;
        myNickname = index;
      } else {
        nicknames[room].push(arg);
        myNickname = nicknames[room].length;
      }
    }
    io.in(room).emit('getNickname', nicknames[room]);
  });

  //Empty room treatment
  io.of('/').adapter.on('delete-room', (room) => {
    if (messages[room] !== undefined) {
      delete messages[room];
    }
  });
});
