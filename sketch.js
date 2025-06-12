// sketch.js

/**
 * I extracted the colours from the Broadway images and added them to my design.
 * --------------------------
 * gridSize     : Size of each cell in the grid (pixels).
 * cols, rows   : Number of columns and rows of the grid.
 * canvasWidth  : Width of the canvas in pixels (cols * gridSize).
 * canvasHeight : Height of the canvas in pixels (rows * gridSize).
 * colours      : Object mapping single-letter keys to hex color values.
 */
const gridSize     = 20;
const cols         = 34;
const rows         = 34;
const canvasWidth  = cols * gridSize;
const canvasHeight = rows * gridSize;
const colours      = {
  W: '#ffffff', // White background
  Y: '#f6e64b', // Yellow grid lines
  R: '#b33025', // Red blocks / sand
  B: '#2d59b5', // Blue blocks / sand
  G: '#d8d8d8'  // Gray blocks / sand
};

/**
 * Mondrian base structure（Some of this comes from our group code.）
 * --------------------------------
 * vLines       : Array of column indices for vertical yellow lines.
 * hLines       : Array of row indices for horizontal yellow lines.
 * baseBlocks   : Array of static block objects {col, row, w, h, c} that
 *                define the initial composition from Piet Mondrian's work.
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
 * Dynamic blocks & sand state
 * -----------------------------------
 * randomBlocks  : Array to hold dynamically spawned blocks.
 * sandGrid      : 2D array to track sand particle IDs at each cell.
 * sandPalette   : Array of p5.Color objects used by sand particles.
 * spawnCount    : Number of blocks to spawn each interval.
 * spawnInterval : Frames between automatic spawns.
 * lastSpawn     : Frame count when we last spawned blocks.
 * fireworks     : Array of active Firework instances.
 * Reference: YouTube 
 * 1. Demonstrates how to move a value proportionally towards a target value in each frame (https://www.youtube.com/watch?v=8uLVnM36XUc)  
 * 2. Step-by-step guide to animation timing (https://www.youtube.com/watch?v=JHB_-bDdzAo)
 */
let randomBlocks = [];
let sandGrid;
let sandPalette = [];
let spawnCount    = 1;
let spawnInterval = 60;
let lastSpawn     = 0;
let fireworks     = [];

/**
 * p5.js setup()*（Here you can set the frame rate: frameRate(60) (default 60 fps). 
 * Changing the frame rate directly affects the animation speed.）
 * ----------------------
 * - createCanvas sets up the drawing area.
 * - pixelDensity(1) ensures 1:1 mapping between canvas and pixels[].
 * - Initialize sandGrid with zeros (empty).
 * - Define sandPalette with five key colors.
 * - Perform initial spawn of dynamic blocks.
 */
function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);
  sandGrid = Array.from({length:cols}, () => Array(rows).fill(0));
  sandPalette = [colours.R, colours.B, colours.W, colours.Y, colours.G];
  spawnBlocks(spawnCount);
}

/**
 * draw()
 * ---------------
 * Called every frame:
 * 1. Clear background and update sand physics.
 * 2. Auto-spawn new blocks if autoSpawn is true.
 * 3. Draw yellow grid lines, base blocks, and dynamic blocks.
 * 4. Render sand particles on top.
 * 5. Trigger & display fireworks + message when complete.
 * Reference： Youtube
 * 1. Introduction to building a classic ‘falling sand’ particle system in p5.js (https://www.youtube.com/watch?v=L4u7Zy_b868)
 * 2. Demonstration of how to use p5.js particle objects to create a fireworks explosion (https://www.youtube.com/watch?v=YPKidHmretc)
 */
function draw() {
  // 1. Clear & physics
  background(colours.W);
  updateSand();

  // 2. Auto-spawn logic
  if (frameCount - lastSpawn >= spawnInterval && autoSpawn) {
    spawnBlocks(spawnCount);
    lastSpawn = frameCount;
  }

  // 3. Draw grid lines
  noStroke(); fill(colours.Y);
  vLines.forEach(x => rect(x*gridSize, 0, gridSize, canvasHeight));
  hLines.forEach(y => rect(0, y*gridSize, canvasWidth, gridSize));

  // 4. Draw base & dynamic blocks
  baseBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  });
  randomBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  });

  // 5. Draw sand particles
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let id = sandGrid[x][y];
      if (id > 0) {
        fill(sandPalette[id - 1]);
        rect(x*gridSize, y*gridSize, gridSize, gridSize);
      }
    }
  }

  // 6. Fireworks & message on victory
  if (baseBlocks.length===0 && randomBlocks.length===0 && fireworks.length===0) {
    fireworks.push(new Firework());
  }
  fireworks.forEach(fw => { fw.update(); fw.show(); });
  fireworks = fireworks.filter(fw => !fw.done());
  if (fireworks.length > 0) {
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(colours.R);
    text('Congratulations!', canvasWidth/2, canvasHeight/2);
  }
}

/**
 * spawnBlocks(n)
 * -----------------------
 * Automatically spawn n off-line blocks and n on-line blocks.
 */
function spawnBlocks(n) {
  // Off-line
  for (let i = 0; i < n; i++) {
    let w = floor(random(1,5));
    let h = floor(random(1,5));
    let colIndex = floor(random(0, cols - w));
    let rowIndex = floor(random(0, rows - h));
    let c = random([colours.R, colours.B, colours.G]);
    randomBlocks.push({col:colIndex, row:rowIndex, w:w, h:h, c:c});
  }
  // On-line (yellow lines)
  for (let i = 0; i < n; i++) {
    let w = floor(random(1,5));
    let h = floor(random(1,5));
    let isV = random() < 0.5;
    let colIndex, rowIndex;
    if (isV) {
      colIndex = random(vLines);
      rowIndex = floor(random(0, rows - h));
    } else {
      rowIndex = random(hLines);
      colIndex = floor(random(0, cols - w));
    }
    let c2 = random([colours.R, colours.B, colours.G]);
    randomBlocks.push({col:colIndex, row:rowIndex, w:w, h:h, c:c2});
  }
}

/**
 * updateSand()
 * ---------------------
 * Iterate through sandGrid to implement falling and same-color removal.
 * Reference: YouTube
 * 1. The Coding Train's ‘Falling Sand’ tutorial demonstrates a sand particle simulation approach based on a pixel 
 * grid and simple rules, with code highly similar to this method. (https://www.youtube.com/watch?v=gXEMOfhFDVk)  
 * 2. ‘Simulating sand, water and oil particles in P5JS’ extends multi-material interaction and colour mixing, helping to 
 * optimise the sandPalette and collision logic. (https://www.youtube.com/watch?v=L4u7Zy_b868)
 */
function updateSand() {
  for (let x = cols - 1; x >= 0; x--) {
    for (let y = rows - 1; y >= 0; y--) {
      let id = sandGrid[x][y];
      if (!id) continue;
      // Straight down
      if (y+1 < rows && sandGrid[x][y+1] === 0) {
        sandGrid[x][y] = 0;
        sandGrid[x][y+1] = id;
      }
      // Collision removal
      else if (y+1 < rows && sandGrid[x][y+1] === id) {
        sandGrid[x][y] = 0;
        sandGrid[x][y+1] = 0;
      }
      // Diagonal fall
      else {
        let dx = random() < 0.5 ? -1 : 1;
        let nx = x + dx;
        if (nx >= 0 && nx < cols && y+1 < rows) {
          if (sandGrid[nx][y+1] === id) {
            sandGrid[x][y] = 0;
            sandGrid[nx][y+1] = 0;
          } else if (sandGrid[nx][y+1] === 0) {
            sandGrid[x][y] = 0;
            sandGrid[nx][y+1] = id;
          }
        }
      }
    }
  }
}

/**
 * mousePressed()
 * -----------------------
 * Convert clicked block into a sand cluster and remove it.
 * Reference: ChatGPT Because I really didn't know how to implement mouse clicks on blocks to convert them into sand particles, 
 * after some initial testing, I found the conversion process to be very rigid, and I didn't fully understand the tutorials on YouTube, 
 * so I chose to use GPT for code debugging to achieve this effect.  
 * YouTube:Demonstrates how to generate a cluster of particles in the centre of the canvas and give each particle a 
 * different initial velocity and direction (https://www.youtube.com/watch?v=IPF5lhgoRWM)
 */
function mousePressed() {
  let mx = floor(mouseX/gridSize);
  let my = floor(mouseY/gridSize);
  // Dynamic
  for (let i = randomBlocks.length - 1; i >= 0; i--) {
    let b = randomBlocks[i];
    if (mx >= b.col && mx < b.col + b.w && my >= b.row && my < b.row + b.h) {
      createCluster(b);
      randomBlocks.splice(i, 1);
      return;
    }
  }
  // Base
  for (let i = baseBlocks.length - 1; i >= 0; i--) {
    let b = baseBlocks[i];
    if (mx >= b.col && mx < b.col + b.w && my >= b.row && my < b.row + b.h) {
      createCluster(b);
      baseBlocks.splice(i, 1);
      return;
    }
  }
}

/**
 * Helper: createCluster(b)
 * ------------------------
 * Fill a block area with sand particle IDs for falling effect.
 * Reference:ChatGPT Because I really didn't know how to implement mouse clicks on blocks to convert them into sand particles, 
 * after some initial testing, I found the conversion process to be very rigid, and I didn't fully understand the tutorials on
 * YouTube, so I chose to use GPT for code debugging to achieve this effect.  
 * YouTube: Demonstrates how to generate a cluster of particles in the centre of the canvas and give each particle a different 
 * initial velocity and direction (https://www.youtube.com/watch?v=IPF5lhgoRWM)
 */
function createCluster(b) {
  for (let dx = -1; dx <= b.w; dx++) {
    for (let dy = -1; dy <= b.h; dy++) {
      let x = b.col + dx;
      let y = b.row + dy;
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        sandGrid[x][y] = floor(random(1, sandPalette.length + 1));
      }
    }
  }
}

/**
 * keyPressed()
 * ---------------------
 * - Spacebar toggles auto-spawn on/off.
 * - UP_ARROW increases spawnCount and speed.
 * - DOWN_ARROW decreases spawnCount and speed.
 */
let autoSpawn = true;
function keyPressed() {
  if (key === ' ') autoSpawn = !autoSpawn;
  else if (keyCode === UP_ARROW) {
    spawnCount++;
    spawnInterval = max(10, spawnInterval - 5);
  } else if (keyCode === DOWN_ARROW && spawnCount > 0) {
    spawnCount--;
    spawnInterval = min(120, spawnInterval + 5);
  }
}

/**
 * Firework class
 * ----------------------
 * Creates and animates a burst of particles as a celebration.
 * **Reference: YouTube**  
 * Build an HTML5 canvas fireworks simulation from scratch using 
 * the p5.js JavaScript library (https://www.youtube.com/watch?v=CKeyIbT3vXI)
 */
class Firework {
  constructor() {
    this.particles = [];
    for (let i = 0; i < 100; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 8);
      this.particles.push({
        x: canvasWidth/2,
        y: canvasHeight/2,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        life: 255
      });
    }
  }
  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= 4;
    });
  }
  done() {
    return this.particles.every(p => p.life <= 0);
  }
  show() {
    noStroke();
    this.particles.forEach(p => {
      fill(255, 150, 0, p.life);
      ellipse(p.x, p.y, 4);
    });
  }
}
