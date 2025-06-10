let grid   = 20;
let wide   = 34 * grid;
let height = wide;

// Colour palette
const colour = {
  W: '#ffffff',
  Y: '#f6e64b',
  R: '#b33025',
  B: '#2d59b5',
  G: '#d8d8d8',
};

// Positions of main grid lines
const vLines = [1, 3, 7, 12, 21, 29, 32];
const hLines = [1, 5, 11, 13, 16, 19, 27, 32];

// Solid blocks
const blocks = [
  {col:1, row:4,  w:1, h:1, colour:colour.G},
  {col:1, row:10, w:3, h:3, colour:colour.R},
  {col:1, row:26, w:3, h:3, colour:colour.R},
  {col:5, row:22, w:1, h:1, colour:colour.G},
  {col:9, row:1,  w:1, h:1, colour:colour.G},
  {col:10,row:4,  w:1, h:1, colour:colour.R},
  {col:11,row:7,  w:3, h:6, colour:colour.B},
  {col:11,row:9,  w:1, h:2, colour:colour.R},
  {col:11,row:15, w:1, h:1, colour:colour.G},
  {col:11,row:22, w:3, h:3, colour:colour.R},
  {col:11,row:28, w:1, h:1, colour:colour.G},
  {col:15,row:28, w:1, h:1, colour:colour.B},
];

// Animation flags & modes
let animateDashes = true;
let dashProbability = 0.33;
let colorShift = false;

function setup() {
  createCanvas(wide, height);
  frameRate(30);
}

function draw() {
  background(colour.W);
  drawGrid();
  drawDashes();
  drawBlocks();
}

// Draw static yellow grid lines
function drawGrid() {
  fill(colour.Y);
  vLines.forEach(c => rect(c * grid, 0, grid, height));
  hLines.forEach(r => rect(0, r * grid, wide, grid));                        
}

// Draw accent dashes with optional animation    
function drawDashes() {  
  const accent = [colour.Y, colour.R, colour.B, colour.G];  
  // vertical  
  vLines.forEach((c, idx) => {  
    for (let r = 0; r < height / grid; r++) {  
      if (!animateDashes || random() < dashProbability) {  
        let colorIndex = (r + idx + (colorShift ? frameCount : 0)) % accent.length;  
        fill(accent[colorIndex]);  
        rect(c * grid, r * grid, grid, grid);  
      }
    }
  });
  // horizontal  
  hLines.forEach((r, idx) => {  
    for (let c = 0; c < wide / grid; c++) {  
      if (!animateDashes || random() < dashProbability) {    
        let colorIndex = (c + idx + 2 + (colorShift ? floor(frameCount/10) : 0)) % accent.length;    
        fill(accent[colorIndex]);    
        rect(c * grid, r * grid, grid, grid);    
      }
    }
  });
}

// Draw solid blocks  
function drawBlocks() {  
  blocks.forEach(b => {  
    fill(b.colour);  
    rect(b.col * grid, b.row * grid, b.w * grid, b.h * grid);  
  });
}

// Mouse toggles dash animation on/off
function mousePressed() {
  animateDashes = !animateDashes;
}

// Keys: Up/Down change dash probability, Space toggles hue-shift mode
function keyPressed() {
  if (keyCode === UP_ARROW) {
    dashProbability = min(1, dashProbability + 0.05);
  } else if (keyCode === DOWN_ARROW) {
    dashProbability = max(0, dashProbability - 0.05);
  } else if (key === ' ') {
    colorShift = !colorShift;
  }
}