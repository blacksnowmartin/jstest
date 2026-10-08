const canvas = document.getElementById('spriteCanvas');
const ctx = canvas.getContext('2d');

const spriteSheet = document.createElement('canvas');
const spriteCtx = spriteSheet.getContext('2d');

const frameWidth = 32;
const frameHeight = 32;
const frameCount = 8;
const fps = 12;
const groundY = 170;

const controls = { left: false, right: false };

const character = {
  x: 110,
  y: 95,
  width: 120,
  height: 120,
  facing: 1,
  velocityX: 0,
  moving: false,
};

spriteSheet.width = frameWidth * frameCount;
spriteSheet.height = frameHeight;

function drawShadow(x, y) {
  spriteCtx.fillStyle = 'rgba(18, 26, 36, 0.22)';
  spriteCtx.beginPath();
  spriteCtx.ellipse(x + 16, y + 30, 11.5, 4.5, 0, 0, Math.PI * 2);
  spriteCtx.fill();
}

function drawCharacter(frameIndex) {
  const x = frameIndex * frameWidth;
  const motions = [0, 2.5, 5, 2.5, 0, -2.5, -5, -2.5];
  const step = motions[frameIndex];
  const armSwing = step * 0.8;
  const bodyBob = step * 0.15;

  spriteCtx.clearRect(x, 0, frameWidth, frameHeight);
  drawShadow(x, 0);

  spriteCtx.strokeStyle = '#2d3f52';
  spriteCtx.lineWidth = 4;
  spriteCtx.lineCap = 'round';
  spriteCtx.beginPath();
  spriteCtx.moveTo(x + 12, 22);
  spriteCtx.lineTo(x + 10, 28 + step * 0.8);
  spriteCtx.moveTo(x + 20, 22);
  spriteCtx.lineTo(x + 22, 28 - step * 0.8);
  spriteCtx.stroke();

  spriteCtx.fillStyle = '#73d693';
  spriteCtx.fillRect(x + 8, 11 + bodyBob, 16, 11);
  spriteCtx.fillStyle = '#57bf7d';
  spriteCtx.fillRect(x + 10, 14 + bodyBob, 12, 6);

  spriteCtx.fillStyle = '#f5d3a0';
  spriteCtx.fillRect(x + 10, 4 + bodyBob, 12, 9);

  spriteCtx.fillStyle = '#173046';
  spriteCtx.fillRect(x + 13, 7 + bodyBob, 2, 2);
  spriteCtx.fillRect(x + 17, 7 + bodyBob, 2, 2);

  spriteCtx.fillStyle = '#3b2d24';
  spriteCtx.fillRect(x + 10, 4 + bodyBob, 12, 2);

  spriteCtx.strokeStyle = '#f5d3a0';
  spriteCtx.lineWidth = 3;
  spriteCtx.beginPath();
  spriteCtx.moveTo(x + 9, 15 + bodyBob);
  spriteCtx.lineTo(x + 6, 18 + armSwing);
  spriteCtx.moveTo(x + 23, 15 + bodyBob);
  spriteCtx.lineTo(x + 26, 18 - armSwing);
  spriteCtx.stroke();

  spriteCtx.fillStyle = '#dffde9';
  spriteCtx.fillRect(x + 12, 16 + bodyBob, 4, 3);

  spriteCtx.fillStyle = '#1b2d3d';
  spriteCtx.fillRect(x + 8, 28 + bodyBob, 6, 3);
  spriteCtx.fillRect(x + 18, 28 + bodyBob, 6, 3);
}

function generateSpriteSheet() {
  for (let i = 0; i < frameCount; i += 1) {
    drawCharacter(i);
  }
}

function updateControls() {
  const left = controls.left;
  const right = controls.right;

  character.moving = left || right;

  if (left && !right) {
    character.velocityX = -2.5;
    character.facing = -1;
  } else if (right && !left) {
    character.velocityX = 2.5;
    character.facing = 1;
  } else {
    character.velocityX *= 0.7;
    if (Math.abs(character.velocityX) < 0.05) {
      character.velocityX = 0;
    }
  }

  character.x += character.velocityX;
  character.x = Math.min(Math.max(character.x, 20), canvas.width - 40);
}

function render() {
  const frameIndex = character.moving
    ? Math.floor((performance.now() / 1000) * fps) % frameCount
    : 0;
  const srcX = frameIndex * frameWidth;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, 170);
  sky.addColorStop(0, '#cfe8ff');
  sky.addColorStop(1, '#e8f2c8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, 170);

  ctx.fillStyle = '#d7bf73';
  ctx.fillRect(0, groundY, canvas.width, 50);
  ctx.strokeStyle = '#9c7c4c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();

  const bob = character.moving ? Math.sin((performance.now() / 1000) * fps * 0.75) * 2 : 0;
  const drawX = character.x;
  const drawY = 72 + bob;

  ctx.save();
  ctx.translate(drawX + 60, drawY + 32);
  ctx.scale(character.facing, 1);
  ctx.translate(-60, -32);
  ctx.drawImage(spriteSheet, srcX, 0, frameWidth, frameHeight, 0, 0, 120, 120);
  ctx.restore();
}

function handleKeyPress(event, isPressed) {
  const key = event.key.toLowerCase();

  if (key === 'arrowleft' || key === 'a') {
    controls.left = isPressed;
  }
  if (key === 'arrowright' || key === 'd') {
    controls.right = isPressed;
  }
}

function animate() {
  updateControls();
  render();
  requestAnimationFrame(animate);
}

document.addEventListener('keydown', (event) => handleKeyPress(event, true));
document.addEventListener('keyup', (event) => handleKeyPress(event, false));

generateSpriteSheet();
animate();
