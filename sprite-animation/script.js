const canvas = document.getElementById('spriteCanvas');
const ctx = canvas.getContext('2d');

const spriteSheet = document.createElement('canvas');
const sctx = spriteSheet.getContext('2d');

const frameWidth = 32;
const frameHeight = 32;
const frameCount = 6;
const fps = 12;

spriteSheet.width = frameWidth * frameCount;
spriteSheet.height = frameHeight;

function drawShadow(x, y) {
  sctx.fillStyle = 'rgba(20, 26, 35, 0.2)';
  sctx.beginPath();
  sctx.ellipse(x + 16, y + 30, 12, 5, 0, 0, Math.PI * 2);
  sctx.fill();
}

function drawCharacter(frameIndex) {
  const step = [0, 4, 0, -4, 0, 4][frameIndex];
  const x = frameIndex * frameWidth;

  sctx.clearRect(x, 0, frameWidth, frameHeight);
  drawShadow(x, 0);

  // legs
  sctx.strokeStyle = '#2d3f52';
  sctx.lineWidth = 4;
  sctx.lineCap = 'round';
  sctx.beginPath();
  sctx.moveTo(x + 12, 22);
  sctx.lineTo(x + 10, 28 + step * 0.5);
  sctx.moveTo(x + 20, 22);
  sctx.lineTo(x + 22, 28 - step * 0.5);
  sctx.stroke();

  // body
  sctx.fillStyle = '#7ad79b';
  sctx.fillRect(x + 9, 11, 14, 11);

  // head
  sctx.fillStyle = '#f5d3a0';
  sctx.fillRect(x + 10, 4, 12, 9);

  // eye
  sctx.fillStyle = '#173046';
  sctx.fillRect(x + 13, 7, 2, 2);
  sctx.fillRect(x + 17, 7, 2, 2);

  // arms
  sctx.strokeStyle = '#f5d3a0';
  sctx.lineWidth = 3;
  sctx.beginPath();
  sctx.moveTo(x + 9, 15);
  sctx.lineTo(x + 6, 18 + step * 0.6);
  sctx.moveTo(x + 23, 15);
  sctx.lineTo(x + 26, 18 - step * 0.6);
  sctx.stroke();

  // highlight / accent
  sctx.fillStyle = '#dffde9';
  sctx.fillRect(x + 12, 16, 4, 3);

  // boots
  sctx.fillStyle = '#1b2d3d';
  sctx.fillRect(x + 8, 28, 6, 3);
  sctx.fillRect(x + 18, 28, 6, 3);
}

function generateSpriteSheet() {
  for (let i = 0; i < frameCount; i += 1) {
    drawCharacter(i);
  }
}

function render() {
  const frameIndex = (Math.floor(Date.now() / 1000 * fps) % frameCount);
  const srcX = frameIndex * frameWidth;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = '#d7bf73';
  ctx.fillRect(0, 170, canvas.width, 50);
  ctx.strokeStyle = '#9c7c4c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 170);
  ctx.lineTo(canvas.width, 170);
  ctx.stroke();

  ctx.drawImage(spriteSheet, srcX, 0, frameWidth, frameHeight, 100, 74, 120, 120);
}

generateSpriteSheet();
setInterval(render, 1000 / fps);
render();
