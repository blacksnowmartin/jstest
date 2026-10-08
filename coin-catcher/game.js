const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const config = {
  boardWidth: canvas.width,
  boardHeight: canvas.height,
  playerSpeed: 5,
  pickupValue: 10,
};

const state = {
  score: 0,
  lastTime: 0,
};

const keys = new Set();

const player = {
  x: 100,
  y: 350,
  width: 64,
  height: 64,
  speed: config.playerSpeed,
  spriteWidth: 32,
  spriteHeight: 32,
  frameX: 0,
  frameY: 0,
  gameFrame: 0,
  staggerFrames: 6,
};

const coin = {
  x: 0,
  y: 0,
  width: 40,
  height: 40,
};

function cloneSpriteSheet() {
  const sheet = document.createElement('canvas');
  sheet.width = 256;
  sheet.height = 64;
  const spriteCtx = sheet.getContext('2d');

  for (let frame = 0; frame < 4; frame += 1) {
    const x = frame * 64;

    spriteCtx.fillStyle = '#1f2937';
    spriteCtx.fillRect(x + 18, 30, 28, 18);

    spriteCtx.fillStyle = '#f5d76b';
    spriteCtx.fillRect(x + 16, 20, 30, 18);

    spriteCtx.fillStyle = '#0f172a';
    spriteCtx.fillRect(x + 24, 26, 4, 4);
    spriteCtx.fillRect(x + 36, 26, 4, 4);

    spriteCtx.fillStyle = '#f97316';
    spriteCtx.fillRect(x + 10, 36, 12, 14);
    spriteCtx.fillRect(x + 42, 36, 12, 14);

    spriteCtx.fillStyle = '#d1d5db';
    spriteCtx.fillRect(x + 18, 48, 8, 12);
    spriteCtx.fillRect(x + 38, 48, 8, 12);
  }

  const coinCanvas = document.createElement('canvas');
  coinCanvas.width = 40;
  coinCanvas.height = 40;
  const coinCtx = coinCanvas.getContext('2d');

  coinCtx.fillStyle = '#facc15';
  coinCtx.beginPath();
  coinCtx.arc(20, 20, 14, 0, Math.PI * 2);
  coinCtx.fill();

  coinCtx.fillStyle = '#fef3c7';
  coinCtx.beginPath();
  coinCtx.arc(16, 16, 6, 0, Math.PI * 2);
  coinCtx.fill();

  return { player: sheet, coin: coinCanvas };
}

const spriteSheet = cloneSpriteSheet();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function respawnCoin() {
  coin.x = Math.random() * (canvas.width - coin.width);
  coin.y = Math.random() * (canvas.height - coin.height);
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function update(dt) {
  let isMoving = false;

  if (keys.has('arrowleft') || keys.has('a')) {
    player.x -= player.speed * dt;
    player.frameY = 2;
    isMoving = true;
  }
  if (keys.has('arrowright') || keys.has('d')) {
    player.x += player.speed * dt;
    player.frameY = 1;
    isMoving = true;
  }
  if (keys.has('arrowup') || keys.has('w')) {
    player.y -= player.speed * dt;
    isMoving = true;
  }
  if (keys.has('arrowdown') || keys.has('s')) {
    player.y += player.speed * dt;
    isMoving = true;
  }

  player.x = clamp(player.x, 0, canvas.width - player.width);
  player.y = clamp(player.y, 0, canvas.height - player.height);

  if (isMoving) {
    player.gameFrame += 1;
    if (player.gameFrame % player.staggerFrames === 0) {
      player.frameX = (player.frameX + 1) % 4;
    }
  } else {
    player.frameX = 0;
  }

  if (checkCollision(player, coin)) {
    state.score += config.pickupValue;
    respawnCoin();
  }
}

function drawBackground() {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
  for (let x = 0; x < canvas.width; x += 40) {
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${state.score}`, 20, 35);

  ctx.drawImage(spriteSheet.coin, coin.x, coin.y, coin.width, coin.height);

  ctx.drawImage(
    spriteSheet.player,
    player.frameX * player.spriteWidth,
    player.frameY * player.spriteHeight,
    player.spriteWidth,
    player.spriteHeight,
    player.x,
    player.y,
    player.width,
    player.height
  );
}

function gameLoop(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }

  const delta = Math.min((timestamp - state.lastTime) / 16.67, 2);
  state.lastTime = timestamp;

  update(delta);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
});

respawnCoin();
requestAnimationFrame(gameLoop);
