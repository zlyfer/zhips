// jshint esversion: 9

class Room {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.phase = "prepare";
    this.turn = 1;
  }

  start() {
    let count = 0;
    this.players.forEach((p) => {
      if (p.placedBoats == 8) count++;
    });
    if (count == 2) {
      this.phase = "run";
      return true;
    } else return false;
  }
  checkBoats(id) {
    let player = this.players.find((p) => p.id == id);
    if (player) {
      if (player.placedBoats <= 7) return true;
      else return false;
    } else return false;
  }
  joinPlayer(socket) {
    this.players.push(socket);
  }
  removePlayer(id) {
    this.players = [
      this.players.find((p) => {
        if (p.id) return p.id != id;
      }),
    ];
  }
  reset() {
    this.players.forEach((p) => {
      p.placeBoats = 0;
      p.hits = 0;
      p.misses = 0;
    });
    this.phase = "prepare";
  }
}
module.exports = Room;
