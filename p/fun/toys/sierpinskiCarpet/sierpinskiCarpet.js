canvas = document.querySelector("#canvas");
ctx = canvas.getContext("2d");
width = canvas.width = 600;
height = canvas.height = 600;

// Cosmic background stars
const stars = [];
for (let i = 0; i < 300; i++) {
  stars.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2,
    speed: 0.2 + Math.random() * 0.5
  });
}

// Camera
let camera = { x: 0, y: 0, zoom: 1, targetZoom: 1 };
let velocity = { x: 0, y: 0 };

// Colors
const COLORS = [
  "#ff00ff", "#00ffff", "#ffff00", "#ff0066", 
  "#00ff99", "#6600ff", "#ff6600", "#33ffcc"
];
let hue = 0;

// Boxes
class Box { constructor(x, y, size) { this.x = x; this.y = y; this.size = size; } }

class Boxes {
  constructor() { this.boxes = []; }
  add(x, y, size) { this.boxes.push(new Box(x, y, size)); }
  draw() {
    hue += 0.5;
    const time = performance.now() * 0.001;

    for (let i = 0; i < this.boxes.length; i++) {
      const b = this.boxes[i];
      const screenX = (b.x - camera.x) * camera.zoom + width / 2;
      const screenY = (b.y - camera.y) * camera.zoom + height / 2;
      const size = b.size * camera.zoom;

      if (screenX + size < 0 || screenX > width || screenY + size < 0 || screenY > height) continue;

      // Pulsing glow
      const pulse = Math.sin(time * 3 + i * 0.1) * 0.3 + 0.7;
      const color = `hsl(${(hue + i * 5) % 360}, 100%, ${50 + pulse * 30}%)`;

      // Neon glow
      ctx.shadowBlur = 20 + pulse * 30;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.fillRect(screenX, screenY, size, size);

      // Inner dark core for depth
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(screenX + size * 0.1, screenY + size * 0.1, size * 0.8, size * 0.8);
    }
  }

  generate(type = "carpet") {
    const next = new Boxes();
    const s = this.boxes[0].size / 3;

    for (const box of this.boxes) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (type === "carpet" && i === 0 && j === 0) continue;
          if (type === "cross" && i !== 0 && j !== 0) continue;

          next.add(box.x + (i + 1) * s, box.y + (j + 1) * s, s);
        }
      }
    }
    return next;
  }
}

// Animation loop
let currentIteration = 0;
let boxes = new Boxes();
boxes.add(-0.2*canvas.width, -0.2*canvas.height, 250);
let fractalType = "carpet";

function drawStars() {
  ctx.fillStyle = "white";
  for (const s of stars) {
    ctx.globalAlpha = Math.sin(performance.now() * 0.001 + s.x) * 0.3 + 0.7;
    ctx.fillRect(s.x, s.y, s.size, s.size);
    s.x -= s.speed;
    if (s.x < 0) s.x = width;
  }
  ctx.globalAlpha = 1;
}

function animate() {
  ctx.fillStyle = "#000011";
  ctx.fillRect(0, 0, width, height);
  
  drawStars();
  
  // Nebula glow
  const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, 300);
  grad.addColorStop(0, "rgba(100,0,200,0.1)");
  grad.addColorStop(1, "rgba(0,50,100,0.3)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  boxes.draw();

  // Smooth zoom
  camera.zoom += (camera.targetZoom - camera.zoom) * 0.1;

  requestAnimationFrame(animate);
}

// Controls
canvas.addEventListener("click", () => {
  if (currentIteration < 7) {
    boxes = boxes.generate(fractalType);
    currentIteration++;
    console.log("Iteration:", currentIteration);
  }
});

addEventListener("keydown", e => {
  const speed = 300 / camera.zoom;
  if (e.key === "ArrowUp") camera.targetZoom *= 1.3;
  if (e.key === "ArrowDown") camera.targetZoom /= 1.3;
  if (e.key === "w") camera.y -= speed;
  if (e.key === "s") camera.y += speed;
  if (e.key === "a") camera.x -= speed;
  if (e.key === "d") camera.x += speed;
  if (e.key === "c") hue += 60;
  if (e.key === "f") {
    fractalType = fractalType === "carpet" ? "cross" : "carpet";
    boxes = new Boxes(); boxes.add(0,0,250);
    currentIteration = 0;
  }
  if (e.key === "r") {
    boxes = new Boxes(); boxes.add(0,0,250);
    camera = { x: 0, y: 0, zoom: 1, targetZoom: 1 };
    currentIteration = 0;const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { alpha: false });
canvas.width = 700;
canvas.height = 700;

// Offscreen caches for each iteration
const layerCanvases = [];
let currentIteration = 0;
let fractalType = "carpet";
let hueOffset = 0;

// Camera
let camera = { x: 0, y: 0, zoom: 1, targetZoom: 1 };

// Pre-compute all iterations once
class FractalGenerator {
  static generateAll(maxIter = 8) {
    const layers = [];
    let boxes = [{ x: 0, y: 0, size: 243 }]; // 243 = 3^5

    for (let iter = 0; iter <= maxIter; iter++) {
      const offscreen = document.createElement("canvas");
      offscreen.width = 800;
      offscreen.height = 800;
      const octx = offscreen.getContext("2d", { alpha: false });

      // Cosmic background once
      if (iter === 0) this.drawBackground(octx);

      // Draw all boxes for this iteration with glow
      this.drawIteration(octx, boxes, iter);

      layers.push(offscreen);
      if (iter === maxIter) break;

      // Generate next iteration
      const newBoxes = [];
      const s = boxes[0].size / 3;
      for (const b of boxes) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (fractalType === "carpet" && i === 0 && j === 0) continue;
            if (fractalType === "cross" && i !== 0 && j !== 0) continue;
            newBoxes.push({
              x: b.x + (i + 1) * s,
              y: b.y + (j + 1) * s,
              size: s
            });
          }
        }
      }
      boxes = newBoxes;
    }
    return layers;
  }

  static drawBackground(ctx) {
    ctx.fillStyle = "#000814";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Stars
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 400; i++) {
      const x = (i * 137.5) % 800;
      const y = (i * 213.7) % 800;
      ctx.globalAlpha = 0.5 + Math.sin(i) * 0.5;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;

    // Nebula glow
    const grad = ctx.createRadialGradient(400, 400, 0, 400, 400, 400);
    grad.addColorStop(0, "rgba(120, 0, 255, 0.15)");
    grad.addColorStop(0.7, "rgba(0, 200, 255, 0.1)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 800);
  }

  static drawIteration(ctx, boxes, iter) {
    const time = iter; // Use iteration as "time" for color variation
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      const hue = (hueOffset + i * 0.1 + time * 20) % 360;
      const color = `hsl(${hue}, 100%, 65%)`;

      // Fake neon glow
      ctx.fillStyle = color + "44";
      ctx.fillRect(b.x - 8, b.y - 8, b.size + 16, b.size + 16);
      ctx.fillRect(b.x - 4, b.y - 4, b.size + 8, b.size + 8);

      ctx.fillStyle = color;
      ctx.fillRect(b.x, b.y, b.size, b.size);

      // Dark core for depth
      ctx.fillStyle = "rgba(0,0,20,0.6)";
      ctx.fillRect(b.x + b.size * 0.15, b.y + b.size * 0.15, b.size * 0.7, b.size * 0.7);
    }
  }
}

// Generate all layers once
layerCanvases.push(...FractalGenerator.generateAll(8));

// Animation loop
function animate() {
  ctx.fillStyle = "#000814";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const layer = layerCanvases[currentIteration];
  if (layer) {
    const scale = camera.zoom;
    const offsetX = canvas.width / 2 + camera.x * scale;
    const offsetY = canvas.height / 2 + camera.y * scale;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      layer,
      0, 0, 800, 800,
      offsetX - 400 * scale, offsetY - 400 * scale,
      800 * scale, 800 * scale
    );
  }

  // Smooth zoom
  camera.zoom += (camera.targetZoom - camera.zoom) * 0.15;

  requestAnimationFrame(animate);
}
animate();

// Controls
canvas.addEventListener("click", () => {
  if (currentIteration < 8) {
    currentIteration++;
    console.log("Iteration:", currentIteration, "Boxes:", Math.pow(8, currentIteration));
  }
});

let isDragging = false, lastX, lastY;
canvas.addEventListener("mousedown", e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener("mousemove", e => {
  if (isDragging) {
    camera.x += (lastX - e.clientX) / camera.zoom;
    camera.y += (lastY - e.clientY) / camera.zoom;
    lastX = e.clientX; lastY = e.clientY;
  }
});
canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  camera.targetZoom *= e.deltaY > 0 ? 0.85 : 1.15;
  camera.targetZoom = Math.max(0.1, Math.min(camera.targetZoom, 100));
});

addEventListener("keydown", e => {
  const speed = 500 / camera.zoom;
  if (e.key === "ArrowUp") camera.targetZoom *= 1.3;
  if (e.key === "ArrowDown") camera.targetZoom /= 1.3;
  if (e.key === "w") camera.y -= speed;
  if (e.key === "s") camera.y += speed;
  if (e.key === "a") camera.x -= speed;
  if (e.key === "d") camera.x += speed;
  if (e.key === "c") hueOffset += 45;
  if (e.key === "f") {
    fractalType = fractalType === "carpet" ? "cross" : "carpet";
    currentIteration = 0;
    camera = { x: 0, y: 0, zoom: 1, targetZoom: 1 };
    layerCanvases.length = 0;
    layerCanvases.push(...FractalGenerator.generateAll(8));
  }
  if (e.key === "r") {
    currentIteration = 0;
    camera = { x: 0, y: 0, zoom: 1, targetZoom: 1 };
  }
});
  }
});

// Mouse drag to pan
let dragging = false, lastX, lastY;
canvas.addEventListener("mousedown", e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener("mousemove", e => {
  if (dragging) {
    camera.x += (lastX - e.clientX) / camera.zoom;
    camera.y += (lastY - e.clientY) / camera.zoom;
    lastX = e.clientX; lastY = e.clientY;
  }
});
canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);

// Wheel zoom
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  camera.targetZoom *= e.deltaY > 0 ? 0.8 : 1.2;
});

animate();