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
  console.log("Snake " + body);
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
  console.log("got hold");
});

socket.on('add', function(data) {
    var directionX = data.dirX;
    var directionY = data.dirY;

    direction.unshift([directionX, directionY]);
});

socket.on('server color', function(col) {
  allColors = [];
  for(var i = 0; i < col.length; i++) {
    allColors[i] = col[i];
  }
});

socket.on('locked', function(loc) {

  allColors = [];
  for(var i = 0; i < loc.length; i++) {
    allColors[i] = loc[i];
  }
  hits++;
  console.log(allColors);
  console.log("Locked on target..");

});

socket.on('update messages', function(data) {
  var loc = data.col;
  messages.unshift([data.mes,loc[0],loc[1],loc[2]]);
  console.log('update chat');
});

//======================= Begin Sketch ====================

var snake = [[0, 0],[1, 0],[2, 0]];
var allColors = [[255,0,0],[255,0,0],[255,0,0]];
var boxes = [];
var dimentionX;
var dimentionY;
var timed = 0;
var direction = [];
var w;
var h;
var nx = 0;
var ny = 0;
var hold = [1, 0];
var a = new Snake(nx, ny, w, h);
var host = false;
var uColorR, uColorG, uColorB;
var uColors = [];
var hits = 0;
var messages = [];
var name = false;

function setup() {
    //colorMode(HSB);
    var x = 0;
    var y = 0;

    alert("Welcome to Spaz Snake! Please Submit User Name!");

    h = floor((windowHeight-60)/47);
    w = h;

    dimentionX = 63;
    dimentionY = 47;
    createCanvas(windowWidth-60, windowHeight-30);

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

    uColorR = floor(random(255));
    uColorG = floor(random(255));
    uColorB = floor(random(255));
    uColors.push([uColorR,uColorG,uColorB]);
    apple();

    console.log(boxes.length);

    console.log(host);
}

function windowResized() {
  resizeCanvas(windowWidth-60, windowHeight-30);
}

function keyPressed() {
  var directionX; // changes index
  var directionY; // changes index

  if(name === "true") {
    if (keyCode === UP_ARROW) {
        directionX = 0;
        directionY = -1;
        console.log("UP");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
        socket.emit('notify', {com:"Up",col:uColors});
    } else if (keyCode === DOWN_ARROW) {
        directionX = 0;
        directionY = 1;
        console.log("DOWN");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
        socket.emit('notify', {com:"Down",col:uColors});
    } else if (keyCode === RIGHT_ARROW) {
        directionX = 1;
        directionY = 0;
        console.log("RIGHT");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
        socket.emit('notify', {com:"Right",col:uColors});
    } else if (keyCode === LEFT_ARROW) {
        directionX = -1;
        directionY = 0;
        console.log("LEFT");

        socket.emit('keyEvent', {dirX:directionX,dirY:directionY});
        socket.emit('notify', {com:"Left",col:uColors});
    }
  } else {
    if(keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === DOWN_ARROW || keyCode === UP_ARROW) {
      alert("Please Put in userName!");
    }
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

    noFill();
    rect(0,0,dimentionX*w,dimentionY*h);

    for (var i = snake.length-1; i >= 0 ; i--) {
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

        boxes[tx + ty * dimentionX].display(allColors[i]);
    }

    // for(var i = 0; i < boxes.length; i++) {
    //   boxes[i].display();
    // }


    a.display(uColors);
    chat();

    timed++;

}

function time() { //import moves and direction arrays
    direct = direction.length - 1;
    if (timed == 5) {
      //console.log(allColors);
      if (direction.length > 0) {
          //socket.emit('recieveQ', direction);
          snake.unshift([snake[0][0] + direction[direct][0], snake[0][1] + direction[direct][1]]);

          if (snake[0][0] != nx || snake[0][1] != ny) {
            if(hits == 0){
              shorten(snake);
            } else {
              hits--;
            }

          } else {
              apple();
              shorten(snake);
              allColors.push(uColors);
              socket.emit('target', uColors);

          }
          if (direction.length > 0) {

              hold = direction.pop();
              //socket.emit('recieveH', hold);
          }
      } else {
          snake.unshift([snake[0][0] + hold[0], snake[0][1] + hold[1]]);
          if (snake[0][0] != nx || snake[0][1] != ny) {
            if(hits == 0){
              shorten(snake);
            } else {
              hits--;
            }
          } else {
              apple();
              shorten(snake);
              allColors.push(uColors);
              socket.emit('target', uColors);

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

    this.display = function(color) {
        //console.log(color);
        //console.log(color + " uColors " + uColors);
        fill(color[0], color[1], color[2]);
        rect(x, y, w, h);

    }
}

//=============== Apple =================

function apple() {
    nx = int(random(0, dimentionX));
    ny = int(random(0, dimentionY));

    a = new Snake(nx * w, ny * h, w, h);
}

function chat() {
  noFill();
  rect(dimentionX*w+10,0,windowWidth-(dimentionX+4)*w,dimentionY*h);
  textSize(h*2);
  if(messages.length > 0) {
    if(messages.length*h*2+80 > dimentionY*h) {
      shorten(messages);
    }
    for(var i = 0; i < messages.length; i++) {
      fill(messages[i][1],messages[i][2],messages[i][3]);
      text(messages[i][0], dimentionX*w+20, i*h*2+80);
    }
  }
}

function sub(data) {
  if(name === "false") {
    name = true;
    console.log(name);
    var urName = data;

    console.log(urName + " Welcome!");
    socket.emit('input name', urName);
  }
}
