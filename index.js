// jshint esversion: 9

const fs = require("fs");
const protocol = require("http");
// const protocol = require("https");

const Room = require("./Room.js");

let options = {};
// options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/medievo.de-0001/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/medievo.de-0001/cert.pem"),
//   ca: fs.readFileSync("/etc/letsencrypt/live/medievo.de-0001/chain.pem"),
//   rejectUnauthorized: false,
// };
const server = protocol.createServer(options);
const io = require("socket.io")(server);

var Rooms = {};
var Users = {};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  Users[socket.id] = socket;
  socket.emit("connected", socket.id);
  socket.on("joinRoom", (id) => {
    let room;
    if (Rooms[id]) room = Rooms[id];
    else room = new Room(id);
    if (room.players.length < 2) {
      socket.joinedRoom = id;
      socket.placedBoats = 0;
      socket.hits = 0;
      socket.misses = 0;
      room.joinPlayer(socket);
      Rooms[id] = room;
      socket.join(id);
      if (room.players[0]) io.in(room.id).emit("getTable", room.players[0].field, room.players[0].id);
      if (room.players[1]) io.in(room.id).emit("getTable", room.players[1].field, room.players[1].id);
      console.log(`${socket.id} joined room ${id}.`);
    }
  });
  socket.emit("getTable", genField(socket), socket.id);
  socket.on("turn", (data) => {
    let room = Rooms[socket.joinedRoom];
    if (room) {
      if (room.phase == "prepare" && data.player == 1) {
        let player = room.players.find((p) => p.id == socket.id);
        if (player.field[data.x][data.y] == 0 && room.checkBoats(socket.id)) {
          player.field[data.x][data.y] = 1;
          player.placedBoats++;
        } else if (player.field[data.x][data.y] == 1) {
          player.field[data.x][data.y] = 0;
          player.placedBoats--;
        }
      } else if (room.phase == "run" && data.player == 2) {
        let op = room.players.find((p) => p.id != socket.id);
        if (op) {
          if (op.field[data.x][data.y] == 1) {
            socket.hits++;
            op.field[data.x][data.y] = 2;
          } else if (op.field[data.x][data.y] == 0) {
            socket.misses++;
            op.field[data.x][data.y] = 3;
          }
        }
      }
      if (room.players[0]) {
        io.in(room.id).emit("updateHitOrMiss", room.players[0].id, room.players[0].hits, room.players[0].misses);
        io.in(room.id).emit("getTable", room.players[0].field, room.players[0].id);
      }
      if (room.players[1]) {
        io.in(room.id).emit("updateHitOrMiss", room.players[1].id, room.players[1].hits, room.players[1].misses);
        io.in(room.id).emit("getTable", room.players[1].field, room.players[1].id);
      }
      if (room.phase != "run") if (room.start()) io.in(room.id).emit("start");
    }
  });
  socket.on("disconnect", () => {
    io.in(socket.joinedRoom).emit("left", socket.id);
    Rooms[socket.joinedRoom].removePlayer(socket.id);
  });
});

function genField(socket = null) {
  let field = {};
  for (let x = 1; x <= 10; x++) {
    field[x] = {};
    for (let y = 1; y <= 10; y++) {
      field[x][y] = 0;
    }
  }
  if (socket) socket.field = field;
  return field;
}

server.listen(3000, function () {
  console.log("Server started.");
});
