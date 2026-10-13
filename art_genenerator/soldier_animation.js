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

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

function preload() {
  framePaths.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      // capture natural size from the first loaded frame for alignment
      if (!spriteSizeSet) {
        spriteW = img.naturalWidth || img.width || 64;
        spriteH = img.naturalHeight || img.height || 64;
        drawW = Math.round(spriteW * drawScale);
        drawH = Math.round(spriteH * drawScale);
        baselineY = canvas.height - drawH - groundOffset;
        spriteSizeSet = true;
      }
      loaded++;
      if (loaded === frameCount) start();
    };
    img.onerror = () => {
      console.error('Failed to load', src);
      loaded++;
      if (loaded === frameCount) start();
    };
    img.src = src;
    frames[i] = img;
  });
}

let spriteW = 64;
let spriteH = 64;
const drawScale = 1.5; // scale up the sprite for visibility
let drawW = Math.round(spriteW * drawScale);
let drawH = Math.round(spriteH * drawScale);
let spriteSizeSet = false;
const groundOffset = 20; // px from bottom baseline
let baselineY = canvas.height - drawH - groundOffset;

let last = 0;
let frameIndex = 0;
const fps = 12;
const frameDuration = 1000 / fps;
let acc = 0;

// position and movement
let x = Math.round((canvas.width - drawW) / 2);
let y = baselineY;
const speed = 180; // px per second
const keys = new Set();
let facingLeft = false;

function start() {
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
});
window.addEventListener('keyup', (e) => {
  keys.delete(e.key.toLowerCase());
});

function loop(ts) {
  if (!last) last = ts;
  const dt = ts - last;
  last = ts;

  // movement vector from input (WASD and arrow keys)
  let vx = 0, vy = 0;
  if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
  if (keys.has('d') || keys.has('arrowright')) vx += 1;
  if (keys.has('w') || keys.has('arrowup')) vy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) vy += 1;

  const moving = vx !== 0 || vy !== 0;
  // normalize diagonal speed
  if (vx !== 0 && vy !== 0) {
    const inv = 1 / Math.sqrt(2);
    vx *= inv; vy *= inv;
  }

  const dtSec = dt / 1000;
  x += vx * speed * dtSec;
  y += vy * speed * dtSec;

  // keep character on the canvas and aligned to baseline when not moving vertically
  x = clamp(x, 0, canvas.width - drawW);
  y = clamp(y, 0, canvas.height - drawH);

  if (!moving) {
    // lock to baseline (so feet stay aligned across frames) unless player explicitly moves vertically
    y = baselineY;
    frameIndex = 0; // idle frame
  } else {
    // advance animation frames while moving
    acc += dt;
    if (acc >= frameDuration) {
      const steps = Math.floor(acc / frameDuration);
      frameIndex = (frameIndex + steps) % frameCount;
      acc -= steps * frameDuration;
    }
  }

  if (vx < 0) facingLeft = true;
  else if (vx > 0) facingLeft = false;

  // draw
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
    if (facingLeft) {
      ctx.save();
      ctx.translate(x + drawW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, spriteW, spriteH, 0, y, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(img, 0, 0, spriteW, spriteH, x, y, drawW, drawH);
    }
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, drawW, drawH);
  }

  ctx.fillStyle = '#f8fafc';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Frame ${String(frameIndex + 1).padStart(2, '0')}`, 12, 22);
  ctx.fillText('Use WASD / Arrow keys to move', 12, 40);

  requestAnimationFrame(loop);
}

preload();
