var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//
var firm = [0,1];
var user = true;
var snake = [[0, 0],[1, 0],[2, 0]];
var allColors = [[255,0,0],[255,0,0],[255,0,0]];
var nx = 0;
var ny = 0;
var allClients = [];
var userNames = [];
var prime = true;

server.listen(process.env.PORT || 5000);

app.use(express.static('public'));

io.on('connection', function (socket) {
  allClients.push(socket);
  userNames.push("The Monkey");

  socket.on('input name', function(data) {
    var index = allClients.indexOf(socket);
    if(data === ""){

    } else {
      userNames.splice(index,1,data);
    }
  });

  socket.emit('hold', firm);
  console.log(firm);

  if(allClients.indexOf(socket) == 0) {
    socket.emit('host', prime);
  } else {
    allClients[0].emit('new guy', allClients.indexOf(socket));
  }

  socket.on('check host', function() {
    if(allClients.indexOf(socket) == 0) {
      socket.emit('host', prime);
    }
  });

  socket.on('host report', function(info) {
    var data = info.dir;
    var index = info.who;

    allClients[index].emit('serverQ', data);
    allClients[index].emit('server color', allColors);

  });

  socket.on('target', function(loc) {
    console.log(loc);

    allColors.push(loc);

    socket.emit('locked', allColors);
    socket.broadcast.emit('locked', allColors);
  });

  socket.on('receiveB', function(info) {
    var data = info.bod;
    var index = info.who;

    allClients[index].emit('current', data);
  });


  socket.on('keyEvent', function (data) {
    //console.log(data);
    var directionX = data.dirX;
    var directionY = data.dirY;

    if(directionX != -firm[0] && directionY != -firm[1]) {
      socket.emit('add', {dirX:directionX,dirY:directionY});
      socket.broadcast.emit('add', {dirX:directionX,dirY:directionY});
      firm[0] = directionX;
      firm[1] = directionY;
    }
  });

  socket.on('notify', function(data) {
    var index = allClients.indexOf(socket);
    var note = userNames[index] + ":         " +data.com;
    var loc = data.col;

    socket.emit('update messages', {mes:note,col:loc});
    socket.broadcast.emit('update messages', {mes:note,col:loc});
  });

  socket.on('disconnect', function() {
      console.log('Got disconnect!');

      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
      if(i == 0) {
        socket.broadcast.emit('new host');
      }
   });

});
