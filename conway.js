GRID_WIDTH = 256;
const GAME_SIZE = GRID_WIDTH*GRID_WIDTH;

let grid = new Uint8Array(GAME_SIZE);

function translate(x, y) {
  return ((x*GRID_WIDTH)+y);
}

function loop_over(grid, f) {
  for(let x=0;x<GRID_WIDTH;x++) {
    for(let y=0;y<GRID_WIDTH;y++) {
      f(grid[translate(x,y)], x, y);
    }
  }
}

/* 
let print_function = (cell,x,y) => { 
  if (cell == 1) {
    process.stdout.write("#") 
  } else {
    process.stdout.write(" ") 
  }
  if (y == 0 && x > 0) {
    console.log("");
  }
}
*/

let init_function = (cell,x,y) => {
  if (Math.round(Math.random()*5)==3) {
    grid[translate(x,y)] = 1;
  } else {
    grid[translate(x,y)] = 0;
  }
}

let survive_function = (cell, x, y) => {

  let neighbours = (grid, x1, y1) => {
    let score = 0;
    for (let i=-1;i<2;i++) {
      for (let j=-1;j<2;j++) {
        if (i == 0 && j == 0) {
          // skip self
        } else {
          score += grid[translate(parseInt(x1)+i,parseInt(y1)+j) % GAME_SIZE];
        }
      }
    }
    return score;
  }

  let neighbour_count = neighbours(grid, x, y);
  let state = cell;


  if (cell == 1) {

    if (neighbour_count > 3 || neighbour_count < 2) {
      state = 0;
    } else if (neighbour_count == 2 || neighbour_count == 3) {
      state = 1;
    }

  } else {

    if (neighbour_count == 3) {
      state = 1;
    }

  }

  grid[translate(x,y)] = state;
}

loop_over(grid, init_function);

class PixelRenderer {
  constructor() {

  }
  render(grid) {
    let imagedata = ctx.createImageData(GRID_WIDTH, GRID_WIDTH);
    for(let x=0;x<GRID_WIDTH;x++) {
      for(let y=0;y<GRID_WIDTH;y++) {
        let pixelindex = translate(x,y);
        imagedata.data[pixelindex*4] = grid[pixelindex]*255;
        imagedata.data[pixelindex*4+1] = grid[pixelindex]*255;
        imagedata.data[pixelindex*4+2] = grid[pixelindex]*255;
        imagedata.data[pixelindex*4+3] = 255;
      }
    }
    ctx.putImageData(imagedata, 0, 0);
  }
}

class RectangleRenderer {
  constructor(background="#ffffff",foreground="#ff0000") {
    this.background = background;
    this.foreground = foreground;
  }
  render(grid) {
    ctx.clearRect(0, 0, GRID_WIDTH*2, GRID_WIDTH*2);
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, GRID_WIDTH*2, GRID_WIDTH*2);
    for (var j = 1; j < GRID_WIDTH; j++) {
      for (var k = 1; k < GRID_WIDTH; k++) {
        if (grid[translate(j,k)] === 1) {
          ctx.fillStyle = this.foreground;
          ctx.fillRect(j, k, 1, 1);
        }
      }
    }
  }
}

const renderer = RectangleRenderer;

render = new renderer

main_loop = function() {
  loop_over(grid, survive_function);
  render.render(grid);
}

var ctx;

$(document).ready(function() {

  ctx = $("#game-view")[0].getContext('2d');

  for (x=0;x<1000;x++) {

    setTimeout(main_loop, 200*x);
  
  }
    
});


