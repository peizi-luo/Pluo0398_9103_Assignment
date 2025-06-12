# Pluo0398_9103_Assignment
# Mondrian Square Sand Game

**Group:**  
(1) Complete the yellow grid section of the group code  
(2) Complete a 1,200-word design project report, which will be partially revised by other group members  

**Individual:**  
## Section 1: Project Overview  
![Figure 1: Mondrian's work: Broadway Jazz][ readmeImage/WechatIMG218.jpg]
This project is based on Piet Mondrian's Broadway Jazz work, inspired by its geometric shapes, horizontal and vertical lines, and the three primary colours of red, yellow, and blue. The work uses coloured blocks and particles in a grid structure to simulate the interaction of real sand grains falling, including a matching and disappearing effect similar to Tetris. This allows users to participate while viewing the art, adding fun without losing the artistic appreciation.

## Section 2: Interaction Methods  
1. **Mouse Click:** Click any static or dynamic block to transform it into a cluster of randomly coloured sand particles that naturally fall downward. Sand particles of the same colour will automatically disappear upon contact.  
2. **Keyboard Controls:**  
   - Press the Spacebar to start and stop block generation.  
   - Press the Up Arrow key to increase the block generation speed and quantity.  
   - Press the Down Arrow key to decrease the block generation speed and quantity.  
3. **Victory Condition:**  
   When all static and dynamic blocks are cleared, a fireworks animation will appear accompanied by celebratory messages.

## Section 3: Individual Approach to Animating the Group Code
### 3.1 I chose mouse and keyboard interaction to drive my personal code.

### 3.2 Which image attributes will be animated and how will they be animated?  
1. **Colour changes:** Sand particles of the same colour automatically disappear when they collide, with colours dynamically changing. Additionally, blocks of different colours are randomly generated.  
2. **Block size and position changes:** Randomly generate blocks of different sizes and positions to enhance visual interest.  
3. **Physics-based interactivity:** Sand particles fall, stack, and interact with each other through cellular automaton rules.  
4. **Differences:** My work differs from my group members' in terms of time and audio effects, specifically noise. Their works do not require user interaction and have autonomous playback functionality, while my work requires users to actively interact and participate, transforming static art into dynamic interactive particle clouds through interactive clicks, thereby enhancing fun and immersion.

### 3.3 Inspiration References  
1. **Grid-based Sand Simulation (YouTube):** Inspired the realistic particle falling physics effects.  
2. **Cellular Automaton Pixel Grid (YouTube):** Techniques for efficiently managing particles in a grid environment.  
   URL:  
   https://www.youtube.com/watch?v=gXEMOfhFDVk  
   https://www.youtube.com/watch?v=L4u7Zy_b868  

These references significantly influenced the core interaction mechanisms and visual aesthetics of my final work, particularly the realistic particle behaviour and grid efficiency. This directly impacted the output quality of my product, as I had previously struggled with how to incorporate unique and innovative interactive elements into this artistic piece. The YouTube tutorial on sand particle fall guided me in this direction.

## Section 3.4: Technical Explanation  
I made significant changes to the group code. I retained the canvas size and the yellow grid portion, but due to the desired interaction effects, I modified the block generation code and added numerous interactive elements.

**Canvas Size and Grid**  
（1）gridSize, cols, rows define the pixel size of each grid cell and the number of grid rows and columns.  
（2）canvasWidth = cols * gridSize, canvasHeight = rows * gridSize determine the width and height of createCanvas().

**Mondrian Basic Structure**  
（1）vLinesandhLines store the indices of the vertical and horizontal grid lines (in grid units).  
（2）Static module (baseBlocks): Each item in the array {col,row,w,h,c} represents a fixed rectangular block.

**Dynamic blocks and sand particle states**  
（1）randomBlocks: Stores randomly generated colour blocks, which are used to trigger sand particle eruptions when clicked. When initially generated, blocks can be made to fly in ‘from outside the canvas’ and their col/row are updated using linear interpolation (lerp()) to create an entrance animation.  
（2）sandGrid: A 34×34 two-dimensional array, where 0 represents empty and >0 represents different sand particle IDs. sandPalette generates the actual rendering colour corresponding to the ID.  
**Reference: YouTube**  
1. Demonstrates how to move a value proportionally towards a target value in each frame (https://www.youtube.com/watch?v=8uLVnM36XUc)  
2. Step-by-step guide to animation timing (https://www.youtube.com/watch?v=JHB_-bDdzAo)

**p5.js initialisation (setup)**  
Here you can set the frame rate: frameRate(60) (default 60 fps). Changing the frame rate directly affects the animation speed.

**Main loop rendering (draw)**  
（1）Use frameCount to control the timing of generating new blocks:  
（2）You can change the colour intensity based on time when rendering the grid lines; when rendering the text Congratulations!, you can use textSize(map(...)) to achieve a pulsating effect.

**Generate random blocks**  
Random width, height, position, and colour, then push into randomBlocks.

**Sand grain update logic**  
（1）Animation effect: Calculate and render the sand grain positions in real time every frame, using pixel-level updates to create a natural fall.  
**Reference: YouTube**  
1. The Coding Train's ‘Falling Sand’ tutorial demonstrates a sand particle simulation approach based on a pixel grid and simple rules, with code highly similar to this method. (https://www.youtube.com/watch?v=gXEMOfhFDVk)  
2. ‘Simulating sand, water and oil particles in P5JS’ extends multi-material interaction and colour mixing, helping to optimise the sandPalette and collision logic. (https://www.youtube.com/watch?v=L4u7Zy_b868)

**Mouse interaction**  
（1）Cluster animation: createCluster(b) In addition to filling the grid directly with sand particles, you can first place the new cluster particles at the centre of the square, use small ball particles to transition to the corresponding position in the grid, and use lerp() to achieve a diffusion animation.  
**Reference:** ChatGPT Because I really didn't know how to implement mouse clicks on blocks to convert them into sand particles, after some initial testing, I found the conversion process to be very rigid, and I didn't fully understand the tutorials on YouTube, so I chose to use GPT for code debugging to achieve this effect.  
**YouTube:** Demonstrates how to generate a cluster of particles in the centre of the canvas and give each particle a different initial velocity and direction (https://www.youtube.com/watch?v=IPF5lhgoRWM)

**Keyboard control**  
（1）Real-time parameter adjustment: Up and down arrows and space bar are used to adjust parameters.  
（2）Animation extension: You can draw a real-time UI prompt bar in the corner of the screen to display spawnCount and spawnInterval, and use a progress bar or flashing prompt to notify the user that the parameters have been modified.

**Fireworks effect**  
（1）Particle system: Each particle has a position, velocity, and lifetime.  
（2）Velocity decay: vx *= 0.96, vy *= 0.96, simulating air resistance.  
（3）Lifespan Decrease: life -= 4, and link transparency to lifespan in show().  
（4）Animation Extension: Immediately after generation, add an initial velocity in the y direction to each block vy = -random(5,15), then update the position in draw() b.row += vy; vy += gravity;, causing the blocks to explode like fireworks debris.  
**Reference: YouTube**  
Build an HTML5 canvas fireworks simulation from scratch using the p5.js JavaScript library (https://www.youtube.com/watch?v=CKeyIbT3vXI)


[ readmeImage/WechatIMG218.jpg]: readmeImage/WechatIMG218.jpg