var socket = io.connect(window.location.origin);

// =========================== Socket functions =================

socket.on('request', function(data) {
  if(data == true){
    if(direction.length > 0) {
      socket.emit('recieveQ', direction);
      console.log("Sent Direction");
    } else {
      socket.emit('recieveH', hold);
      console.log("Sent Hold");
    }
    socket.emit('target', {x:nx,y:ny,hit:false});
    socket.emit('reciveB', snake);
    console.log("Sending current status "+ snake);
    socket.emit('timer', timed);
  } else {
  console.log("Did not send data");
}
});

socket.on('tail', function(entries) {
  direction = [];
  console.log("IMPORTANT: "+direction);
  if(entries[0][0] === undefined && entries.length == 2){
    direction.push([entries[0],entries[1]]);
  } else {
    for(var i = 0; i < entries.length; i++){
      direction.push(entries[i]);
    }
  }
  console.log("Welcome to Spaz Snake!!");
});

socket.on('hold', function(data) {
  hold[0] = data[0];
  hold[1] = data[1];
  console.log("Updated Hold to "+hold);
});

socket.on('current', function(body) {
  //console.log(body);
  snake = [];
  for(var i = 0; i < body.length; i++){
      snake.push(body[i]);
  }
  console.log("Init body "+ snake);
});

socket.on('queue', function(entries) {
  direction = [];
  if(entries[0][0] === undefined && entries.length == 2){
    direction.push([entries[0],entries[1]]);
  } else {
    for(var i = 0; i < entries.length; i++){
      direction.push(entries[i]);
    }
  }
  console.log("Update Queue"+direction);
  //if a new direction array is received, overwrite existing direction array!
});

socket.on('locked', function(loc) {
  nx = loc.x;
  ny = loc.y;
  console.log("Locked on target..");

  a = new Snake(nx*w, ny*h, w, h);
});

socket.on('set', function(data) {
  timed = data;
});

//======================= Begin Sketch ====================

var snake = [[0, 0],[1, 0],[2, 0]];
var boxes = [];
var dimention = 50;
var timed = 0;
var direction = [[1,0],[0,1]];
var w = 10;
var h = 10;
var nx = 0;
var ny = 0;
var hold = [1, 0];
var a = new Snake(nx, ny, w, h);

function setup() {
    var x = 0;
    var y = 0;
    createCanvas(600, 600);

    for (var i = 0; i < dimention * dimention; i++) {
        boxes[i] = new Snake(x, y, w, h);
        //console.log(x);
        x += w;

        if ((i + 1) % (dimention) == 0 && i != 0) {
            //console.log("i: "+i+" x: "+x+" y: "+y);
            y += h;
            x = 0;
        }
    }
}

function keyPressed() {
  var directionX; // changes index
  var directionY; // changes index

    if (keyCode === UP_ARROW) {
        directionX = 0;
        directionY = -1;
        console.log("UP");
        direction.unshift([directionX, directionY]);
        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    } else if (keyCode === DOWN_ARROW) {
        directionX = 0;
        directionY = 1;
        console.log("DOWN");
        direction.unshift([directionX, directionY]);
        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    } else if (keyCode === RIGHT_ARROW) {
        directionX = 1;
        directionY = 0;
        console.log("RIGHT");
        direction.unshift([directionX, directionY]);
        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    } else if (keyCode === LEFT_ARROW) {
        directionX = -1;
        directionY = 0;
        console.log("LEFT");
        direction.unshift([directionX, directionY]);
        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
    }

}

function draw() {

    time();

    background(255);
    for (var i = 0; i < 500; i += w) {
        line(i, 0, i, 500);
        line(0, i, 500, i);
    }

    for (var i = 0; i < snake.length; i++) {
        var tx = snake[i][0];
        var ty = snake[i][1];

        if (tx == 50) {
            tx = 0;
            snake[i][0] = 0;
        }
        if (tx == -1) {
            tx = 49;
            snake[i][0] = 49;
        }
        if (ty == 50) {
            ty = 0;
            snake[i][1] = 0;
        }
        if (ty == -1) {
            ty = 49;
            snake[i][1] = 49;
        }
        // console.log(ty);
        // console.log(tx);
        boxes[tx + ty * dimention].display();
    }

    // for(var i = 0; i < boxes.length; i++) {
    //  	boxes[i].display();
    // }

    a.display();
    timed++;

}

function time() { //import moves and direction arrays
    direct = direction.length - 1;

    if (timed == 5) {
        while (direction.length > 0 && direction[direct][0] == -hold[0] && direction[direct][1] == -hold[1]) {
            shorten(direction);
            direct = direction.length - 1;
            console.log("work");
        }
        //console.log("move");
        if (direction.length > 0) {
            socket.emit('recieveQ', direction);
            snake.unshift([snake[0][0] + direction[direct][0], snake[0][1] + direction[direct][1]]);
            if (snake[0][0] != nx || snake[0][1] != ny) {
                shorten(snake);
            } else {
                //apple();
                socket.emit('target', {x:nx,y:ny,hit:true});
                socket.emit('reciveB', snake);
            }
            if (direction.length > 0) {

                hold = direction.pop();
                console.log(hold);
            }
        } else {
            snake.unshift([snake[0][0] + hold[0], snake[0][1] + hold[1]]);
            if (snake[0][0] != nx || snake[0][1] != ny) {
                shorten(snake);
            } else {
                //apple();
                socket.emit('target', {x:nx,y:ny,hit:true});
                socket.emit('reciveB', snake);
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
