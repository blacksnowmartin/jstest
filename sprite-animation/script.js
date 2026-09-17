const canvas = document.getElementById('spriteCanvas');
const ctx = canvas.getContext('2d');

const spriteSheet = document.createElement('canvas');
const sctx = spriteSheet.getContext('2d');

const frameWidth = 32;
const frameHeight = 32;
const frameCount = 8;
const fps = 12;

const groundY = 170;
const character = {
  x: 110,
  y: 95,
  width: 120,
  height: 120,
  facing: 1,
  velocityX: 0,
  walkCycle: 0,
  moving: false,
};

const keys = {
  left: false,
  right: false,
};

spriteSheet.width = frameWidth * frameCount;
spriteSheet.height = frameHeight;

function drawShadow(x, y) {
  sctx.fillStyle = 'rgba(18, 26, 36, 0.22)';
  sctx.beginPath();
  sctx.ellipse(x + 16, y + 30, 11.5, 4.5, 0, 0, Math.PI * 2);
  sctx.fill();
}

function drawCharacter(frameIndex) {
  const x = frameIndex * frameWidth;
  const motions = [0, 2.5, 5, 2.5, 0, -2.5, -5, -2.5];
  const step = motions[frameIndex];
  const armSwing = step * 0.8;
  const bodyBob = step * 0.15;

  sctx.clearRect(x, 0, frameWidth, frameHeight);
  drawShadow(x, 0);

  // legs
  sctx.strokeStyle = '#2d3f52';
  sctx.lineWidth = 4;
  sctx.lineCap = 'round';
  sctx.beginPath();
  sctx.moveTo(x + 12, 22);
  sctx.lineTo(x + 10, 28 + step * 0.8);
  sctx.moveTo(x + 20, 22);
  sctx.lineTo(x + 22, 28 - step * 0.8);
  sctx.stroke();

  // torso
  sctx.fillStyle = '#73d693';
  sctx.fillRect(x + 8, 11 + bodyBob, 16, 11);
  sctx.fillStyle = '#57bf7d';
  sctx.fillRect(x + 10, 14 + bodyBob, 12, 6);

  // head
  sctx.fillStyle = '#f5d3a0';
  sctx.fillRect(x + 10, 4 + bodyBob, 12, 9);

  // eyes
  sctx.fillStyle = '#173046';
  sctx.fillRect(x + 13, 7 + bodyBob, 2, 2);
  sctx.fillRect(x + 17, 7 + bodyBob, 2, 2);

  // hair
  sctx.fillStyle = '#3b2d24';
  sctx.fillRect(x + 10, 4 + bodyBob, 12, 2);

  // arms
  sctx.strokeStyle = '#f5d3a0';
  sctx.lineWidth = 3;
  sctx.beginPath();
  sctx.moveTo(x + 9, 15 + bodyBob);
  sctx.lineTo(x + 6, 18 + armSwing);
  sctx.moveTo(x + 23, 15 + bodyBob);
  sctx.lineTo(x + 26, 18 - armSwing);
  sctx.stroke();

  // accent
  sctx.fillStyle = '#dffde9';
  sctx.fillRect(x + 12, 16 + bodyBob, 4, 3);

  // boots
  sctx.fillStyle = '#1b2d3d';
  sctx.fillRect(x + 8, 28 + bodyBob, 6, 3);
  sctx.fillRect(x + 18, 28 + bodyBob, 6, 3);
}

function generateSpriteSheet() {
  for (let i = 0; i < frameCount; i += 1) {
    drawCharacter(i);
  }
}

function updateControls() {
  const left = keys.left;
  const right = keys.right;

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
  if (character.x < 20) {
    character.x = 20;
  }
  if (character.x > canvas.width - 40) {
    character.x = canvas.width - 40;
  }
}

function render() {
  const frameIndex = character.moving
    ? Math.floor((performance.now() / 1000) * fps) % frameCount
    : 0;
  const srcX = frameIndex * frameWidth;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // sky and far ground
  const sky = ctx.createLinearGradient(0, 0, 0, 170);
  sky.addColorStop(0, '#cfe8ff');
  sky.addColorStop(1, '#e8f2c8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, 170);

  // ground
  ctx.fillStyle = '#d7bf73';
  ctx.fillRect(0, groundY, canvas.width, 50);
  ctx.strokeStyle = '#9c7c4c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();

  // slight character bobbing to suggest motion
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

function animate() {
  updateControls();
  render();
  requestAnimationFrame(animate);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    keys.left = true;
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    keys.right = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    keys.left = false;
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    keys.right = false;
  }
});

generateSpriteSheet();
animate();
