GRID_WIDTH = 32;
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

let print_function = (cell,x,y) => { 
  process.stdout.write(cell.toString()) 
  if (y == 0 && x > 0) {
    console.log("");
  }
}

let init_function = (cell,x,y) => {
  grid[translate(x,y)] = Math.random()*2;
}

let survive_function = (cell, x, y) => {

  let neighbours = (grid, x1, y1) => {
    let score = 0;
    for (let i=-1;i<2;i++) {
      for (let j=-1;j<2;j++) {
        score += grid[translate(parseInt(x1)+i,parseInt(y1)+j) % GAME_SIZE];
      }
    }
    return score;
  }

  let neighbour_count = neighbours(grid, x, y);
  let state = cell;

  if (cell == 1) {
    if (neighbour_count > 3) {
      state = 0;
    } else if (neighbour_count == 2 || neighbour_count == 3) {
      state = 1;
    } else if (neighbour_count < 2) {
      state = 0;
    }
  } else {
    if (neighbour_count == 3) {
      state = 1;
    }
  }
  grid[translate(x,y)] = state;
}

console.reset = function () {
  return process.stdout.write('\033c');
}

loop_over(grid, print_function);
loop_over(grid, init_function);
loop_over(grid, print_function);

main_loop = function() {
  console.reset();
  loop_over(grid, survive_function);
  loop_over(grid, print_function);
}

for (x=0;x<100;x++) {

  setTimeout(main_loop, 1000*x);
  
}
