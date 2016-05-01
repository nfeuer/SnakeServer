var socket = io.connect(window.location.origin);

// =========================== Socket functions =================

socket.on('host', function(data) {
  host = data;
  console.log("You are new host");
});

socket.on('new host', function() {
  socket.emit('check host');
});

socket.on('new guy', function(data) {

  socket.emit('host report', {dir:direction,who:data});
  socket.emit('receiveB', {bod:snake,who:data});

  console.log("Sent");

});

socket.on('current', function(body) {
  console.log(body);
  snake = [];
  for(var i = 0; i < body.length; i++){
      snake.push(body[i]);
  }
});

socket.on('serverQ', function(entries) {
  direction = [];
  if(entries.length != 0) {
    if(entries[0][0] === undefined){
      direction.push([entries[0],entries[1]]);
    } else {
        for(var i = 0; i < entries.length; i++){
          direction.push(entries[i]);
        }
      }
  }

  console.log("Got serverQ");
});

socket.on('hold', function(data) {
  hold[0] = data[0];
  hold[1] = data[1];
});

socket.on('add', function(data) {
    var directionX = data.dirX;
    var directionY = data.dirY;

    direction.unshift([directionX, directionY]);
});

socket.on('locked', function(loc) {
  nx = loc.x;
  ny = loc.y;
  console.log("Locked on target..");

  a = new Snake(nx*w, ny*h, w, h);
});

//======================= Begin Sketch ====================

var snake = [[0, 0],[1, 0],[2, 0]];
var boxes = [];
var dimentionX;
var dimentionY;
var timed = 0;
var direction = [[1,0],[0,1]];
var w;
var h;
var nx = 0;
var ny = 0;
var hold = [1, 0];
var a = new Snake(nx, ny, w, h);
var host = false;

function setup() {
    var x = 0;
    var y = 0;

    h = floor(windowHeight/48);
    w = h;

    dimentionX = 64;
    dimentionY = 48;
    createCanvas(windowWidth, windowHeight);

    console.log(w);
    console.log(h);

    for (var i = 0; i < dimentionX * dimentionY; i++) {
        boxes[i] = new Snake(x, y, w, h);
        //console.log(x);
        x += w;

        if ((i + 1) % (dimentionX) == 0 && i != 0) {
            //console.log("i: "+i+" x: "+x+" y: "+y);
            y += h;
            x = 0;
        }
    }

    console.log(boxes.length);

    console.log(host);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  var directionX; // changes index
  var directionY; // changes index

    if (keyCode === UP_ARROW) {
        directionX = 0;
        directionY = -1;
        console.log("UP");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    } else if (keyCode === DOWN_ARROW) {
        directionX = 0;
        directionY = 1;
        console.log("DOWN");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    } else if (keyCode === RIGHT_ARROW) {
        directionX = 1;
        directionY = 0;
        console.log("RIGHT");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    } else if (keyCode === LEFT_ARROW) {
        directionX = -1;
        directionY = 0;
        console.log("LEFT");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    }

}

function draw() {

    time();

    background(255);
    for (var i = 0; i < dimentionX*w; i += w) {
        line(i, 0, i, dimentionY*h);
    }

    for (var i = 0; i < dimentionY*h; i += h) {
        line(0, i, dimentionX*w, i);
    }

    for (var i = 0; i < snake.length; i++) {
        var tx = snake[i][0];
        var ty = snake[i][1];

        if (tx == dimentionX) {
            tx = 0;
            snake[i][0] = 0;
        }
        if (tx == -1) {
            tx = dimentionX-1;
            snake[i][0] = tx;
        }
        if (ty == dimentionY) {
            ty = 0;
            snake[i][1] = 0;
        }
        if (ty == -1) {
            ty = dimentionY-1;
            snake[i][1] = ty;
        }

        boxes[tx + ty * dimentionY].display();
    }

    // for(var i = 0; i < boxes.length; i++) {
    //   boxes[i].display();
    // }
    a.display();
    timed++;

}

function time() { //import moves and direction arrays
    direct = direction.length - 1;

    if (timed == 5) {

      if (direction.length > 0) {
          //socket.emit('recieveQ', direction);
          snake.unshift([snake[0][0] + direction[direct][0], snake[0][1] + direction[direct][1]]);

          if (snake[0][0] != nx || snake[0][1] != ny) {
              shorten(snake);
          } else {
              //apple();
              socket.emit('target', {x:nx,y:ny,hit:true});

          }
          if (direction.length > 0) {

              hold = direction.pop();
              //socket.emit('recieveH', hold);
          }
      } else {
          snake.unshift([snake[0][0] + hold[0], snake[0][1] + hold[1]]);
          if (snake[0][0] != nx || snake[0][1] != ny) {
              shorten(snake);
              //console.log("should send");

          } else {
              //apple();
              socket.emit('target', {x:nx,y:ny,hit:true});

          }
      }

        timed = 0;
    }
}

//================= Snake body class =====================

function Snake(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.display = function() {
        fill(255, 0, 0);
        rect(x, y, w, h);
    }
}

//=============== Apple =================

// function apple() {
//     nx = int(random(0, 50));
//     ny = int(random(0, 50));
//
//     a = new Snake(nx * w, ny * h, w, h);
// }
