// sketch.js

const gridSize     = 20;
const cols         = 34;
const rows         = 34;
const canvasWidth  = cols * gridSize;
const canvasHeight = rows * gridSize;
const colours      = {
  W: '#ffffff',  // white background
  Y: '#f6e64b',  // yellow lines
  R: '#b33025',  // red blocks
  B: '#2d59b5',  // blue blocks
  G: '#d8d8d8'   // gray blocks
};

/**
 * Mondrian base structure
 */
const vLines = [1,3,7,12,21,29,32];
const hLines = [1,5,11,13,16,19,27,32];
let baseBlocks = [
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
 * Dynamic blocks and sand state
 */
let randomBlocks = [];
let blockCount   = 5;
let sandGrid;
let sandPalette = [];

/**
 * Step 3: p5.js setup
 */
function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);

  // initialize empty grid
  sandGrid = Array.from({length:cols}, () => Array(rows).fill(0));

  // sand colors: red, blue, white, yellow, gray
  sandPalette = [colours.R, colours.B, colours.W, colours.Y, colours.G];

  // initial dynamic blocks anywhere
  generateRandomBlocks(blockCount);
}

/**
 * Step 4: draw loop
 */
function draw() {
  background(colours.W);
  updateSand();

  noStroke();
  // draw yellow grid lines
  fill(colours.Y);
  vLines.forEach(x => rect(x*gridSize,0,gridSize,canvasHeight));
  hLines.forEach(y => rect(0,y*gridSize,canvasWidth,gridSize));

  // draw base blocks
  baseBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize,b.row*gridSize,b.w*gridSize,b.h*gridSize);
  });

  // draw dynamic blocks
  randomBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize,b.row*gridSize,b.w*gridSize,b.h*gridSize);
  });

  // draw sand particles
  for (let x=0; x<cols; x++) {
    for (let y=0; y<rows; y++) {
      let id = sandGrid[x][y];
      if (id>0) {
        fill(sandPalette[id-1]);
        rect(x*gridSize,y*gridSize,gridSize,gridSize);
      }
    }
  }
}

/**
 * Step 5: generateRandomBlocks(N)
 * - create N blocks with random size/position anywhere
 * - colors: red, blue, gray
 */
function generateRandomBlocks(N) {
  randomBlocks = [];
  for (let i=0; i<N; i++) {
    let w = floor(random(1,5));
    let h = floor(random(1,5));
    let colIndex = floor(random(0, cols - w));
    let rowIndex = floor(random(0, rows - h));
    let c = random([colours.R, colours.B, colours.G]);
    randomBlocks.push({col:colIndex,row:rowIndex,w:w,h:h,c:c});
  }
}

/**
 * Step 6: updateSand()
 * - particles fall straight, then diagonally
 * - remove both on same-color collision
 */
function updateSand() {
  for (let x=cols-1; x>=0; x--) {
    for (let y=rows-1; y>=0; y--) {
      let id = sandGrid[x][y];
      if (!id) continue;
      // fall down if empty
      if (y+1<rows && sandGrid[x][y+1]===0) {
        sandGrid[x][y]=0;
        sandGrid[x][y+1]=id;
      }
      // remove on collision
      else if (y+1<rows && sandGrid[x][y+1]===id) {
        sandGrid[x][y]=0;
        sandGrid[x][y+1]=0;
      }
      // diagonal
      else {
        let dx = random()<0.5?-1:1;
        let nx = x+dx;
        if (nx>=0 && nx<cols && y+1<rows) {
          if (sandGrid[nx][y+1]===id) {
            sandGrid[x][y]=0;
            sandGrid[nx][y+1]=0;
          } else if (sandGrid[nx][y+1]===0) {
            sandGrid[x][y]=0;
            sandGrid[nx][y+1]=id;
          }
        }
      }
    }
  }
}

/**
 * Step 7: mousePressed()
 * - click dynamic block or base block to turn into sand cluster
 */
function mousePressed() {
  let mx = floor(mouseX/gridSize);
  let my = floor(mouseY/gridSize);
  // check dynamic blocks
  for (let i=randomBlocks.length-1; i>=0; i--) {
    let b = randomBlocks[i];
    if (mx>=b.col && mx< b.col+b.w && my>=b.row && my< b.row+b.h) {
      createCluster(b);
      randomBlocks.splice(i,1);
      return;
    }
  }
  // check base blocks
  for (let i=baseBlocks.length-1; i>=0; i--) {
    let b = baseBlocks[i];
    if (mx>=b.col && mx< b.col+b.w && my>=b.row && my< b.row+b.h) {
      createCluster(b);
      baseBlocks.splice(i,1);
      return;
    }
  }
}

// helper: create a sand cluster from block b
function createCluster(b) {
  for (let dx=-1; dx<=b.w; dx++) {
    for (let dy=-1; dy<=b.h; dy++) {
      let x = b.col+dx, y = b.row+dy;
      if (x>=0 && x<cols && y>=0 && y<rows) {
        let id = floor(random(1, sandPalette.length+1));
        sandGrid[x][y] = id;
      }
    }
  }
}

/**
 * Step 8: keyPressed()
 * - UP_ARROW: add one block
 * - DOWN_ARROW: remove last block
 */
function keyPressed() {
  if (keyCode===UP_ARROW) {
    blockCount++;
    generateRandomBlocks(blockCount);
  } else if (keyCode===DOWN_ARROW && blockCount>0) {
    blockCount--;
    generateRandomBlocks(blockCount);
  }
}
