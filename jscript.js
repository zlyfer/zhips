// jshint esversion: 9

/* -------------------------------------------------------------------------- */
/*                              GLOBAL VARIABLES                              */
/* -------------------------------------------------------------------------- */

var myTable;
var opTable;
var positions;
var texts = {
  roomId: "Room ID: ",
  roomPhase: "Phase: Preparing",
  myHitOrMiss: "Your hits: 0, misses: 0",
  opHitOrMiss: "Opponents hits: 0, misses: 0",
  turn: "",
};
const size = 75;
var mousePos = {
  x: 0,
  y: 0,
};
var hoveredField;
var toJoinRoom = new URLSearchParams(window.location.search).get("room");
var myID;

/* -------------------------------------------------------------------------- */
/*                                    P5.JS                                   */
/* -------------------------------------------------------------------------- */

function preload() {}

function setup() {
  createCanvas(windowWidth, windowHeight);

  playerPositions = {
    1: { x: 50, y: windowHeight / 2 - (size * 10) / 2 },
    2: { x: windowWidth - size * 10 - 50, y: windowHeight / 2 - (size * 10) / 2 },
  };
  /* -------------------------------------------------------------------------- */
  /*                                 SocketIO.IO                                */
  /* -------------------------------------------------------------------------- */

  // let server = "https://zlyfer.net:3000";
  let server = "http://localhost:3000";
  socket = io(server, {
    rejectUnauthorized: false,
  });

  socket.on("connected", (id) => {
    myID = id;
    console.log("Connected!");
    socket.emit("joinRoom", toJoinRoom || id);
    this.texts.roomId = "Room ID: " + toJoinRoom || id;
  });
  socket.on("getTable", (field, id) => {
    if (myID == id) {
      myTable = new Table(1, size, playerPositions[1], field);
    } else {
      opTable = new Table(2, size, playerPositions[2], field);
    }
  });
  socket.on("left", (id) => {
    if (myID != id) opTable = null;
  });
  socket.on("start", () => {
    texts.roomPhase = "Phase: Running";
  });
  socket.on("updateHitOrMiss", (id, hits, misses) => {
    if (myID == id) texts.myHitOrMiss = `Your hits: ${hits}, misses: ${misses}`;
    else texts.opHitOrMiss = `Opponents hits: ${hits}, misses: ${misses}`;
  });

  /* -------------------------------------------------------------------------- */
  /*                                                                            */
  /* -------------------------------------------------------------------------- */
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function mouseMoved() {
  mousePos = {
    x: mouseX,
    y: mouseY,
  };
}
function mouseClicked() {
  if (hoveredField) {
    if (hoveredField.table.field[hoveredField.x][hoveredField.y] == 0) {
      hoveredField.table.field[hoveredField.x][hoveredField.y] = 3;
      socket.emit("turn", {
        player: hoveredField.table.player,
        x: hoveredField.x,
        y: hoveredField.y,
      });
    } else if (hoveredField.table.field[hoveredField.x][hoveredField.y] == 1) {
      hoveredField.table.field[hoveredField.x][hoveredField.y] = 2;
      socket.emit("turn", {
        player: hoveredField.table.player,
        x: hoveredField.x,
        y: hoveredField.y,
      });
    }
  }
}

function draw() {
  background(220);
  text(texts.roomId, 5, 15);
  text(texts.roomPhase, 5, 26);
  text(texts.myHitOrMiss, 5, 37);
  text(texts.opHitOrMiss, 5, 48);
  text(texts.turn, 5, 59);
  [myTable, opTable].forEach((t) => {
    if (t) {
      t.draw();

      for (let x = 1; x <= 10; x++)
        for (let y = 1; y <= 10; y++) {
          let x1 = (x - 1) * size + t.offsets.x;
          let y1 = (y - 1) * size + t.offsets.y;
          let x2 = (x - 1) * size + t.offsets.x + size;
          let y2 = (y - 1) * size + t.offsets.y + size;
          if (mousePos.x > x1 && mousePos.x < x2 && mousePos.y > y1 && mousePos.y < y2) {
            hoveredField = {
              table: t,
              x,
              y,
            };
            cursor("pointer");
            push();
            strokeWeight(2);
            fill(0, 100);
            translate(x1, y1);
            rect(0 + 5, 0 + 5, size - 10, size - 10);
            pop();
          }
        }
    }
  });
}
