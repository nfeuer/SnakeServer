var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//
var direction = new Array();
var firm = [];
var user = true;
var snake = [[0, 0],[1, 0],[2, 0]];
var nx = 0;
var ny = 0;
var allClients = [];
var prime = true;

server.listen(process.env.PORT || 5000);

app.use(express.static('public'));

io.on('connection', function (socket) {
  allClients.push(socket);

  if(allClients.indexOf(socket) == 0) {
    socket.emit('host', prime);
  }

  socket.on('check host', function() {
    if(allClients.indexOf(socket) == 0) {
      socket.emit('host', prime);
    }
  });

  //socket.broadcast.emit('request', user);

  socket.on('target', function(loc) {
    nx = loc.x;
    ny = loc.y;
    if(loc.hit) {
      nx = Math.floor(Math.random()*50);
      ny = Math.floor(Math.random()*50);
      console.log("New Apple");
    }
    console.log("Send Target Location");
    socket.emit('locked', {x:nx,y:ny});
    socket.broadcast.emit('locked', {x:nx,y:ny});
  });

  socket.on('receiveB', function(data) {
    //console.log("Got to B");
    //console.log("Snake: "+snake);
    socket.broadcast.emit('current', data);
  });

  if(direction.length > 0) {
    socket.emit('tail', direction);
    console.log("happens once emit tail")
  } else {
    socket.emit('hold', firm);
    console.log("Updated Hold");
  }

  socket.on('keyEvent', function (data) {
    //console.log(data);
    var directionX = data.dirX;
    var directionY = data.dirY;
    var guy = allClients[0];

    guy.emit('queueH', {dirX:directionX,dirY:directionY});

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
