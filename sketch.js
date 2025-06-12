// sketch.js

/**
 * Step 0: Global definitions
 */
const gridSize     = 20;
const cols         = 34;
const rows         = 34;
const canvasWidth  = cols * gridSize;
const canvasHeight = rows * gridSize;
const colours      = {
  W: '#ffffff', Y: '#f6e64b', R: '#b33025',
  B: '#2d59b5', G: '#d8d8d8'
};

/**
 * Step 1: Mondrian base structure
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
 * Step 2: Dynamic blocks and sand state
 */
let randomBlocks = [];
let sandGrid;
let sandPalette = [];
let spawnCount    = 1;    // blocks per interval
let spawnInterval = 60;   // frames between spawns
let lastSpawn     = 0;
let fireworks     = [];

/**
 * Step 3: p5.js setup
 */
function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);
  // initialize sand grid
  sandGrid = Array.from({length:cols}, () => Array(rows).fill(0));
  // sand colors: red, blue, white, yellow, gray
  sandPalette = [colours.R, colours.B, colours.W, colours.Y, colours.G];
  // initial spawn
  spawnBlocks(spawnCount);
}

/**
 * Step 4: draw loop
 */
function draw() {
  background(colours.W);
  updateSand();
  // auto spawn over time
  if (frameCount - lastSpawn >= spawnInterval) {
    spawnBlocks(spawnCount);
    lastSpawn = frameCount;
  }
  noStroke();
  // draw grid lines
  fill(colours.Y);
  vLines.forEach(x => rect(x*gridSize, 0, gridSize, canvasHeight));
  hLines.forEach(y => rect(0, y*gridSize, canvasWidth, gridSize));
  // draw base blocks
  baseBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  });
  // draw dynamic blocks
  randomBlocks.forEach(b => {
    fill(b.c);
    rect(b.col*gridSize, b.row*gridSize, b.w*gridSize, b.h*gridSize);
  });
  // draw sand
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let id = sandGrid[x][y];
      if (id > 0) {
        fill(sandPalette[id - 1]);
        rect(x*gridSize, y*gridSize, gridSize, gridSize);
      }
    }
  }
  // launch fireworks when all blocks gone
  if (baseBlocks.length===0 && randomBlocks.length===0 && fireworks.length===0) {
    fireworks.push(new Firework());
  }
  fireworks.forEach(fw=>{fw.update();fw.show();});
  fireworks = fireworks.filter(fw=>!fw.done());
  if (fireworks.length>0) {
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(colours.R);
    text('Congratulations!', canvasWidth/2, canvasHeight/2);
  }
}

/**
 * Step 5: spawnBlocks(n)
 * - spawn n off-line + n on-line blocks
 */
function spawnBlocks(n) {
  for (let i = 0; i < n; i++) {
    // off-line block
    let w = floor(random(1,5)), h = floor(random(1,5));
    let colIndex = floor(random(0, cols - w));
    let rowIndex = floor(random(0, rows - h));
    let c = random([colours.R, colours.B, colours.G]);
    randomBlocks.push({col:colIndex, row:rowIndex, w:w, h:h, c:c});
    // on-line block
    let isV = random()<0.5;
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
 * Step 6: updateSand()
 */
function updateSand() {
  for (let x = cols - 1; x >= 0; x--) {
    for (let y = rows - 1; y >= 0; y--) {
      let id = sandGrid[x][y]; if (!id) continue;
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
 */
function mousePressed() {
  let mx = floor(mouseX / gridSize), my = floor(mouseY / gridSize);
  for (let i = randomBlocks.length - 1; i >= 0; i--) {
    let b = randomBlocks[i];
    if (mx>=b.col && mx<b.col+b.w && my>=b.row && my<b.row+b.h) {
      createCluster(b);
      randomBlocks.splice(i,1);
      return;
    }
  }
  for (let i = baseBlocks.length - 1; i >= 0; i--) {
    let b = baseBlocks[i];
    if (mx>=b.col && mx<b.col+b.w && my>=b.row && my<b.row+b.h) {
      createCluster(b);
      baseBlocks.splice(i,1);
      return;
    }
  }
}

// helper: create sand cluster
function createCluster(b) {
  for (let dx=-1; dx<=b.w; dx++) {
    for (let dy=-1; dy<=b.h; dy++) {
      let x=b.col+dx, y=b.row+dy;
      if (x>=0&&x<cols&&y>=0&&y<rows) {
        sandGrid[x][y] = floor(random(1, sandPalette.length+1));
      }
    }
  }
}

/**
 * Step 8: keyPressed() => adjust spawnCount and spawnInterval
 */
function keyPressed() {
  if (keyCode === UP_ARROW) {
    spawnCount++;
    spawnInterval = max(10, spawnInterval - 5);
  } else if (keyCode === DOWN_ARROW && spawnCount>0) {
    spawnCount--;
    spawnInterval = min(120, spawnInterval + 5);
  }
}

/**
 * Step 9: Firework class
 */
class Firework {
  constructor() {
    this.particles = [];
    for (let i = 0; i < 100; i++) {
      let angle = random(TWO_PI);
      let speed = random(2,8);
      this.particles.push({
        x:canvasWidth/2, y:canvasHeight/2,
        vx:cos(angle)*speed,
        vy:sin(angle)*speed,
        life:255
      });
    }
  }
  update() {
    this.particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      p.vx*=0.96; p.vy*=0.96;
      p.life-=4;
    });
  }
  done() {
    return this.particles.every(p=>p.life<=0);
  }
  show() {
    noStroke();
    this.particles.forEach(p=>{
      fill(255,150,0,p.life);
      ellipse(p.x,p.y,4);
    });
  }
}
