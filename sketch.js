// sketch.js

/**
 * Step 0: Global definitions
 * - gridSize: size of each cell in pixels
 * - cols, rows: number of columns and rows
 * - canvasWidth, canvasHeight: canvas dimensions
 * - colours: Mondrian palette colors
 */
const gridSize     = 20;
const cols         = 34;
const rows         = 34;
const canvasWidth  = cols * gridSize;
const canvasHeight = rows * gridSize;
const colours      = {
  W: '#ffffff',  // white background
  Y: '#f6e64b',  // yellow grid lines
  R: '#b33025',  // red blocks
  B: '#2d59b5',  // blue blocks
  G: '#d8d8d8'   // gray blocks
};

/**
 * Step 1: Mondrian base structure
 * - vLines, hLines: positions of thick yellow lines
 * - baseBlocks: static large colored rectangles matching the image
 */
const vLines = [1,3,7,12,21,29,32];
const hLines = [1,5,11,13,16,19,27,32];
const baseBlocks = [
  {col:1,row:4,  w:1,h:1,c:colours.G},
  {col:1,row:10, w:3,h:3,c:colours.R},
  {col:1,row:26, w:3,h:3,c:colours.R},
  {col:5,row:22, w:1,h:1,c:colours.G},
  {col:9,row:1,  w:1,h:1,c:colours.G},
  {col:10,row:4, w:1,h:1,c:colours.R},
  {col:11,row:7, w:3,h:6,c:colours.B},
  {col:11,row:9, w:1,h:2,c:colours.R},
  {col:11,row:15,w:1,h:1,c:colours.G},
  {col:11,row:22,w:3,h:3,c:colours.R},
  {col:11,row:28,w:1,h:1,c:colours.G},
  {col:15,row:28,w:1,h:1,c:colours.B}
];

/**
 * Step 2: Dynamic red/blue blocks and sand state
 * - randomBlocks: runtime-generated red/blue blocks
 * - blockCount: number of dynamic blocks, adjustable via keys
 * - sandGrid: grid storing particle IDs
 * - sandPalette: random colors for sand particles
 */
let randomBlocks = [];
let blockCount   = 5;
let sandGrid;
let sandPalette = [];

/**
 * Step 3: p5.js setup
 * - createCanvas: initialize drawing surface
 * - pixelDensity(1): map pixels[] to screen pixels 1:1
 * - initialize sandGrid and sandPalette
 * - generate initial random blocks
 */
function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);

  sandGrid = Array.from({length:cols}, () => Array(rows).fill(0));
  for (let i = 0; i < 5; i++) {
    sandPalette.push(color(random(50,255), random(50,255), random(50,255)));
  }
  generateRandomBlocks(blockCount);
}

/**
 * Step 4: draw loop
 * - clear background
 * - update sand physics
 * - draw Mondrian grid, base blocks, dynamic blocks, and sand
 */
function draw() {
  background(colours.W);
  updateSand();

  noStroke();
  fill(colours.Y);
  vLines.forEach(x => rect(x*gridSize, 0, gridSize, canvasHeight));
  hLines.forEach(y => rect(0, y*gridSize, canvasWidth, gridSize));

  baseBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  });

  randomBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  });

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let id = sandGrid[x][y];
      if (id > 0) {
        fill(sandPalette[id-1]);
        rect(x*gridSize, y*gridSize, gridSize, gridSize);
      }
    }
  }
}

/**
 * Step 5: generateRandomBlocks(N)
 * - create N red/blue blocks anywhere in the grid
 */
function generateRandomBlocks(N) {
  randomBlocks = [];
  for (let i = 0; i < N; i++) {
    let w = floor(random(1,5));
    let h = floor(random(1,5));
    let colIndex = floor(random(0, cols-w));
    let rowIndex = floor(random(0, rows-h));
    let c = random([colours.R, colours.B]);
    randomBlocks.push({col:colIndex, row:rowIndex, w:w, h:h, c:c});
  }
}

/**
 * Step 6: updateSand()
 * - particles fall down or diagonally
 * - same-color collision removes both
 */
function updateSand() {
  for (let x = cols-1; x >= 0; x--) {
    for (let y = rows-1; y >= 0; y--) {
      let id = sandGrid[x][y];
      if (!id) continue;
      if (y+1<rows && sandGrid[x][y+1]===0) {
        sandGrid[x][y]=0; sandGrid[x][y+1]=id;
      } else if (y+1<rows && sandGrid[x][y+1]===id) {
        sandGrid[x][y]=0; sandGrid[x][y+1]=0;
      } else {
        let dx = random()<0.5?-1:1;
        let nx = x+dx;
        if (nx>=0 && nx<cols && y+1<rows) {
          if (sandGrid[nx][y+1]===id) {
            sandGrid[x][y]=0; sandGrid[nx][y+1]=0;
          } else if (sandGrid[nx][y+1]===0) {
            sandGrid[x][y]=0; sandGrid[nx][y+1]=id;
          }
        }
      }
    }
  }
}

/**
 * Step 7: mousePressed()
 * - clicking a dynamic block removes it and creates a sand cluster
 */
function mousePressed() {
  let mx = floor(mouseX/gridSize);
  let my = floor(mouseY/gridSize);
  for (let i = randomBlocks.length-1; i >= 0; i--) {
    let b = randomBlocks[i];
    if (mx>=b.col && mx<b.col+b.w && my>=b.row && my<b.row+b.h) {
      for (let dx=-1; dx<=b.w; dx++) {
        for (let dy=-1; dy<=b.h; dy++) {
          let x = b.col+dx, y = b.row+dy;
          if (x>=0 && x<cols && y>=0 && y<rows) {
            sandGrid[x][y] = floor(random(1, sandPalette.length+1));
          }
        }
      }
      randomBlocks.splice(i,1);
      break;
    }
  }
}

/**
 * Step 8: keyPressed()
 * - UP_ARROW: add a block
 * - DOWN_ARROW: remove a block
 */
function keyPressed() {
  if (keyCode === UP_ARROW) {
    blockCount++; generateRandomBlocks(blockCount);
  } else if (keyCode === DOWN_ARROW && blockCount > 0) {
    blockCount--; generateRandomBlocks(blockCount);
  }
}
