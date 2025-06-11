/*** The following content is excerpted from ChatGPT. 
 * We need a *Mondrian-style* interactive canvas. 
 * The canvas contains a static yellow grid and large colour blocks, 
 * as well as dynamically generated red/blue blocks. Clicking on a red/blue block will 
 * generate a cluster of sand particles that can fall and eliminate 
 * collisions with particles of the same colour at its location.
***/

/**
 * Step 0: Global definitions
 * - gridSize: pixel size of each cell
 * - cols, rows: number of columns and rows
 * - canvasWidth, canvasHeight: canvas dimensions in pixels
 * - colours: Mondrian palette
 */
const gridSize     = 20;
const cols         = 34;
const rows         = 34;
const canvasWidth  = cols * gridSize;
const canvasHeight = rows * gridSize;
const colours      = {
  W: '#ffffff',
  Y: '#f6e64b',
  R: '#b33025',
  B: '#2d59b5',
  G: '#d8d8d8'
};

/**
 * Step 1: Mondrian structure
 * - vLines, hLines: positions of yellow grid lines
 * - baseBlocks: static large blocks
 */
const vLines = [1,3,7,12,21,29,32];
const hLines = [1,5,11,13,16,19,27,32];
const baseBlocks = [
  {col:1,  row:4,  w:1, h:1, c:colours.G},
  // … (other base blocks here) …
  {col:15, row:28, w:1, h:1, c:colours.B}
];

/**
 * Step 2: Dynamic red/blue blocks
 * - randomBlocks: array of generated blocks
 * - blockCount: number of blocks (modifiable by ↑/↓)
 */
let randomBlocks = [];
let blockCount   = 5;

/**
 * Step 3: Falling sand
 * - sandGrid: grid storing particle IDs
 * - sandPalette: random colors for particles
 */
let sandGrid;
let sandPalette = [];

/**
 * Step 4: p5.js setup
 */
function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);

  // Initialize sandGrid (all zeros = empty)
  sandGrid = Array.from({length: cols}, () => Array(rows).fill(0));

  // Build a small palette of random sand-colors
  for (let i = 0; i < 5; i++) {
    sandPalette.push(
      color(random(50,255), random(50,255), random(50,255))
    );
  }

  // Generate the initial red/blue blocks
  generateRandomBlocks(blockCount);
}

/**
 * Step 5: draw loop
 */
function draw() {
  background(colours.W);     // white background
  updateSand();              // physics update

  noStroke();
  fill(colours.Y);
  // Draw thick yellow grid lines
  vLines.forEach(x => rect(x * gridSize, 0, gridSize, canvasHeight));
  hLines.forEach(y => rect(0, y * gridSize, canvasWidth, gridSize));

  // Draw static Mondrian blocks
  for (let b of baseBlocks) {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  }

  // Draw dynamic red/blue blocks
  for (let b of randomBlocks) {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  }

  // Draw all sand particles
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let id = sandGrid[x][y];
      if (id > 0) {
        fill(sandPalette[id - 1]);
        rect(x*gridSize, y*gridSize, gridSize, gridSize);
      }
    }
  }
}

/**
 * Step 6: Generate N red/blue blocks on yellow lines
 */
function generateRandomBlocks(N) {
  randomBlocks = [];
  for (let i = 0; i < N; i++) {
    let isVertical = random() < 0.5;
    let blockColor = random([colours.R, colours.B]);
    if (isVertical) {
      let c   = random(vLines);
      let h   = floor(random(1,4));
      let r   = floor(random(0, rows - h));
      randomBlocks.push({col:c, row:r, w:1, h:h, c:blockColor});
    } else {
      let r   = random(hLines);
      let w   = floor(random(1,4));
      let c   = floor(random(0, cols - w));
      randomBlocks.push({col:c, row:r, w:w, h:1, c:blockColor});
    }
  }
}

/**
 * Step 7: Update sand physics
 * - particles fall straight, then diagonally
 * - same-color collision removes both
 */
function updateSand() {
  for (let x = cols - 1; x >= 0; x--) {
    for (let y = rows - 1; y >= 0; y--) {
      let id = sandGrid[x][y];
      if (!id) continue;

      // Try straight down
      if (y+1 < rows && sandGrid[x][y+1] === 0) {
        sandGrid[x][y]   = 0;
        sandGrid[x][y+1] = id;
      }
      // Same-color collision downwards?
      else if (y+1 < rows && sandGrid[x][y+1] === id) {
        sandGrid[x][y]   = 0;
        sandGrid[x][y+1] = 0;
      }
      // Else try diagonal
      else {
        let dx = random() < 0.5 ? -1 : 1;
        let nx = x + dx;
        if (nx >= 0 && nx < cols && y+1 < rows) {
          if (sandGrid[nx][y+1] === id) {
            sandGrid[x][y]   = 0;
            sandGrid[nx][y+1] = 0;
          } else if (sandGrid[nx][y+1] === 0) {
            sandGrid[x][y]   = 0;
            sandGrid[nx][y+1] = id;
          }
        }
      }
    }
  }
}

/**
 * Step 8: Mouse press → turn clicked block into a sand cluster
 */
function mousePressed() {
  let mx = floor(mouseX / gridSize);
  let my = floor(mouseY / gridSize);

  for (let i = randomBlocks.length - 1; i >= 0; i--) {
    let b = randomBlocks[i];
    if (mx >= b.col && mx < b.col + b.w &&
        my >= b.row && my < b.row + b.h) {
      // Generate a larger cluster around the block
      for (let dx = -1; dx <= b.w; dx++) {
        for (let dy = -1; dy <= b.h; dy++) {
          let x = b.col + dx;
          let y = b.row + dy;
          if (x >= 0 && x < cols && y >= 0 && y < rows) {
            sandGrid[x][y] = floor(random(1, sandPalette.length + 1));
          }
        }
      }
      randomBlocks.splice(i, 1);
      break;
    }
  }
}

/**
 * Step 9: Key press → ↑ add block, ↓ remove block
 */
function keyPressed() {
  if (keyCode === UP_ARROW) {
    blockCount++;
    generateRandomBlocks(blockCount);
  } else if (keyCode === DOWN_ARROW && blockCount > 0) {
    blockCount--;
    generateRandomBlocks(blockCount);
  }
}
