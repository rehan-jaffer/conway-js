GRID_WIDTH = 250;
const GRID_SIZE = GRID_WIDTH * GRID_WIDTH;

function translate(x, y) {
  return GRID_WIDTH * y + x;
}

function random_byte() {
  let el = Math.round(Math.random() * 1024);
  let bits = [];

  while (el > 1) {
    let bit = Math.floor(el % 2);
    bits.push(bit);
    el = el / 2;
  }

  return bits;
}

function fast_random(size) {
  let array = [];

  while (array.length < size) {
    let c = random_byte();
    array = array.concat(c);
  }

  return array;
}

class PixelRenderer {
  constructor() {}
  render(grid) {
    let imagedata = ctx.createImageData(GRID_WIDTH, GRID_WIDTH);
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_WIDTH; y++) {
        let pixelindex = translate(x, y);
        imagedata.data[pixelindex * 4] = grid[pixelindex] * 255;
        imagedata.data[pixelindex * 4 + 1] = grid[pixelindex] * 255;
        imagedata.data[pixelindex * 4 + 2] = grid[pixelindex] * 255;
        imagedata.data[pixelindex * 4 + 3] = 255;
      }
    }
    ctx.putImageData(imagedata, 0, 0);
  }
}

class RectangleRenderer {
  constructor(background = "#ffffff", foreground = "#ff0000") {
    this.background = background;
    this.foreground = foreground;
  }

  render(grid) {
    ctx.clearRect(0, 0, GRID_WIDTH, GRID_WIDTH);
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, GRID_WIDTH, GRID_WIDTH);
    for (var j = 1; j < GRID_WIDTH; j++) {
      for (var k = 1; k < GRID_WIDTH; k++) {
        if (grid[translate(j, k)] === 1) {
          ctx.fillStyle = this.foreground;
          ctx.fillRect(j, k, 1, 1);
        }
      }
    }
  }
}

class TextRenderer {
  render(grid) {
    for (var j = 1; j < GRID_WIDTH; j++) {
      for (var k = 1; k < GRID_WIDTH; k++) {
        if (cell == 1) {
          process.stdout.write("#");
        } else {
          process.stdout.write(" ");
        }
        if (y == 0 && x > 0) {
          console.log("");
        }
      }
    }
  }
}

const DENSITY_FACTOR = 5; // defines the initial density of cells, higher = sparser, lower = denser

class Grid {
  constructor() {
    this.grid = new Uint8Array(GRID_SIZE);
    this.next = new Uint8Array(GRID_SIZE);
    this.init();
  }

  dump() {
    return this.next;
  }
  swap() {
    this.grid = this.next;
    this.next = new Uint8Array(GRID_SIZE);
  }
  at(x, y) {
    if (x < 0) {
      x = GRID_WIDTH - x;
    }
    if (y < 0) {
      y = GRID_WIDTH - y;
    }
    return y * GRID_WIDTH + x;
  }
  init() {
    let random_map = fast_random(GRID_SIZE);
    this.grid = random_map.slice(0, GRID_SIZE);
  }

  update() {
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_WIDTH; y++) {
        let score = 0;
        const CURRENT_LOCATION = this.at(x, y);
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
              // skip self
            } else {
              score += this.grid[this.at(x + i, y + j) % GRID_SIZE];
            }
          }
        }

        switch (this.grid[CURRENT_LOCATION]) {
          case 0:
            if (score == 3) {
              this.next[CURRENT_LOCATION] = 1;
            } else {
              this.next[CURRENT_LOCATION] = 0;
            }
            break;
          case 1:
            if (score > 3 || score < 2) {
              this.next[CURRENT_LOCATION] = 0;
            } else {
              this.next[CURRENT_LOCATION] = 1;
            }
            break;
        }
      }
    }
  }
}

const renderer = RectangleRenderer;

render = new renderer();

let grid = new Grid();

function iterate() {
  grid.update();
  render.render(grid.dump());
  grid.swap();
  requestAnimationFrame(iterate);
}

var ctx;

$(document).ready(function() {
  ctx = $("#game-view")[0].getContext("2d");
  iterate();
});
