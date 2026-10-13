const canvas = document.getElementById('soldierCanvas');
const ctx = canvas.getContext('2d');

const frameCount = 10;
const frames = [];
let loaded = 0;
const framePaths = [];
for (let i = 1; i <= frameCount; i++) {
  const n = String(i).padStart(2, '0');
  framePaths.push(`extracted_frames/frame_${n}.png`);
}

function preload() {
  framePaths.forEach((src, i) => {
    const img = new Image();
    img.onload = () => { loaded++; if (loaded === frameCount) start(); };
    img.onerror = () => { console.error('Failed to load', src); loaded++; if (loaded === frameCount) start(); };
    img.src = src;
    frames[i] = img;
  });
}

let last = 0;
let frameIndex = 0;
const fps = 12;
const frameDuration = 1000 / fps;
let acc = 0;
let x = -120;
const speed = 100; // px per second
const spriteW = 64;
const spriteH = 64;
const drawW = 96;
const drawH = 96;

function start() {
  requestAnimationFrame(loop);
}

function loop(ts) {
  if (!last) last = ts;
  const dt = ts - last;
  last = ts;

  acc += dt;
  if (acc >= frameDuration) {
    const steps = Math.floor(acc / frameDuration);
    frameIndex = (frameIndex + steps) % frameCount;
    acc -= steps * frameDuration;
  }

  x += speed * (dt / 1000);
  if (x > canvas.width) x = -drawW;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // subtle grid background
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(148,163,184,0.06)';
  for (let gx = 0; gx < canvas.width; gx += 40) {
    for (let gy = 0; gy < canvas.height; gy += 40) {
      ctx.fillRect(gx, gy, 2, 2);
    }
  }

  const img = frames[frameIndex];
  if (img && img.complete) {
    ctx.drawImage(img, 0, 0, spriteW, spriteH, x, canvas.height - drawH - 20, drawW, drawH);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, canvas.height - drawH - 20, drawW, drawH);
  }

  ctx.fillStyle = '#f8fafc';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Frame ${String(frameIndex + 1).padStart(2, '0')}`, 12, 22);

  requestAnimationFrame(loop);
}

preload();
