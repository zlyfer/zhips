// jshint esversion: 9

class Table {
  constructor(player, size, offsets, field) {
    this.player = player;
    this.field = field;
    this.size = size;
    this.offsets = offsets;
  }

  draw() {
    for (let x = 1; x <= 10; x++)
      for (let y = 1; y <= 10; y++) {
        push();
        stroke(100);
        strokeWeight(2);
        // TODO: fill() Teamcolor
        noFill(); // TODO: Remove
        let xp = (x - 1) * this.size + this.offsets.x;
        let yp = (y - 1) * this.size + this.offsets.y;
        rect(xp, yp, this.size, this.size);
        translate(xp + this.size / 2, yp + this.size / 2);
        switch (this.field[x][y]) {
          case 0: // Empty
            break;
          case 1: // Filled
            if (this.player == 1) {
              push();
              // TODO: Border (directional)
              strokeWeight(0);
              fill(50, 50, 210, 150);
              rect(-this.size / 2, -this.size / 2, this.size, this.size);
              pop();
            }
            break;
          case 2: // Destroyed
            push();
            strokeWeight(0);
            fill(50, 50, 210, 150);
            rect(-this.size / 2, -this.size / 2, this.size, this.size);
            stroke(210, 50, 50);
            strokeWeight(4);
            line(-this.size / 2 + 10, -this.size / 2 + 10, this.size / 2 - 10, this.size / 2 - 10);
            line(-this.size / 2 + 10, this.size / 2 - 10, this.size / 2 - 10, -this.size / 2 + 10);
            pop();
            break;
          case 3: // Missed
            push();
            strokeWeight(5);
            point(0, 0);
            pop();
            break;
          default:
            break;
        }
        pop();
      }
  }
}
