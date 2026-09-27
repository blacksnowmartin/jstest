const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const healthValue = document.getElementById('healthValue');
const waveValue = document.getElementById('waveValue');
const scoreValue = document.getElementById('scoreValue');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');

const keys = {};

const state = {
  started: false,
  gameOver: false,
  time: 0,
  score: 0,
  wave: 1,
  enemyTimer: 0,
  lastTimestamp: 0,
  shake: 0,
};

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 18,
  speed: 230,
  health: 100,
  maxHealth: 100,
  facing: 1,
  invulnerable: 0,
  attackTimer: 0,
  stepTimer: 0,
  slashArc: 0,
};

const enemies = [];
const particles = [];
const pickups = [];

function resetGame() {
  state.started = false;
  state.gameOver = false;
  state.time = 0;
  state.score = 0;
  state.wave = 1;
  state.enemyTimer = 0.6;
  state.lastTimestamp = 0;
  state.shake = 0;

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.health = player.maxHealth;
  player.invulnerable = 0;
  player.attackTimer = 0;
  player.stepTimer = 0;
  player.slashArc = 0;

  enemies.length = 0;
  particles.length = 0;
  pickups.length = 0;

  overlay.classList.remove('visible');
  updateHud();
}

function updateHud() {
  healthValue.textContent = Math.max(0, Math.ceil(player.health));
  waveValue.textContent = state.wave;
  scoreValue.textContent = state.score;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function startGame() {
  resetGame();
  state.started = true;
  overlay.classList.remove('visible');
}

function setKeyState(event, value) {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keys.left = value;
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keys.right = value;
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') keys.up = value;
  if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') keys.down = value;
  if (event.code === 'Space') keys.attack = value;
  if (event.key.toLowerCase() === 'r' && value) startGame();
}

window.addEventListener('keydown', (event) => {
  setKeyState(event, true);
});

window.addEventListener('keyup', (event) => {
  setKeyState(event, false);
});

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  const padding = 30;
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = rand(-padding, canvas.width + padding);
    y = -padding;
  } else if (side === 1) {
    x = canvas.width + padding;
    y = rand(-padding, canvas.height + padding);
  } else if (side === 2) {
    x = rand(-padding, canvas.width + padding);
    y = canvas.height + padding;
  } else {
    x = -padding;
    y = rand(-padding, canvas.height + padding);
  }

  const typeRoll = Math.random();
  const isBat = typeRoll > 0.6 || state.wave > 2;

  enemies.push({
    x,
    y,
    radius: isBat ? 18 : 22,
    speed: rand(55, 90) + state.wave * 4,
    health: isBat ? 1 : 2 + Math.floor(state.wave / 2),
    maxHealth: isBat ? 1 : 2 + Math.floor(state.wave / 2),
    color: isBat ? '#b38cff' : '#74f0b2',
    type: isBat ? 'bat' : 'slime',
    frame: Math.random() * 1000,
    hitFlash: 0,
  });
}

function spawnPickup(x, y) {
  pickups.push({
    x,
    y,
    radius: 9,
    pulse: Math.random() * 100,
    value: 10,
  });
}

function spawnBurst(x, y, color, amount = 10) {
  for (let i = 0; i < amount; i += 1) {
    particles.push({
      x,
      y,
      dx: rand(-100, 100),
      dy: rand(-100, 100),
      life: rand(0.25, 0.75),
      size: rand(2, 5),
      color,
    });
  }
}

function getMovementVector() {
  let dx = 0;
  let dy = 0;

  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

function slashAttack() {
  if (player.attackTimer > 0) {
    return;
  }

  player.attackTimer = 0.28;
  player.slashArc = 1;

  const swingRange = 80;
  const slashAngle = player.facing === 1 ? 0 : Math.PI;

  for (const enemy of enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist < swingRange + enemy.radius) {
      const enemyAngle = Math.atan2(dy, dx);
      const diff = Math.atan2(Math.sin(enemyAngle - slashAngle), Math.cos(enemyAngle - slashAngle));
      if (Math.abs(diff) < 1.2) {
        enemy.health -= 1;
        enemy.hitFlash = 0.16;
        spawnBurst(enemy.x, enemy.y, '#ffd36a', 8);
        state.shake = 5;

        if (enemy.health <= 0) {
          state.score += enemy.type === 'bat' ? 20 : 15;
          spawnPickup(enemy.x, enemy.y);
          spawnBurst(enemy.x, enemy.y, enemy.color, 16);
          const index = enemies.indexOf(enemy);
          if (index >= 0) enemies.splice(index, 1);
        }
      }
    }
  }
}

function updatePlayer(dt) {
  const movement = getMovementVector();
  const nextX = player.x + movement.x * player.speed * dt;
  const nextY = player.y + movement.y * player.speed * dt;

  player.x = clamp(nextX, player.radius, canvas.width - player.radius);
  player.y = clamp(nextY, player.radius + 40, canvas.height - player.radius);

  if (movement.x !== 0 || movement.y !== 0) {
    player.facing = movement.x >= 0 ? 1 : -1;
  }

  if (keys.attack) {
    slashAttack();
  }

  player.attackTimer = Math.max(0, player.attackTimer - dt);
  player.slashArc = Math.max(0, player.slashArc - dt * 5);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;

    enemy.x += (dx / dist) * enemy.speed * dt;
    enemy.y += (dy / dist) * enemy.speed * dt;
    enemy.frame += dt * 14;

    if (dist < player.radius + enemy.radius + 4) {
      if (player.invulnerable <= 0) {
        player.health -= 10;
        player.invulnerable = 0.8;
        state.shake = 12;
        spawnBurst(player.x, player.y, '#ff6e7d', 18);
      }
    }

    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    if (enemy.x < -80 || enemy.x > canvas.width + 80 || enemy.y < -80 || enemy.y > canvas.height + 80) {
      enemies.splice(i, 1);
    }
  }
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    const pickup = pickups[i];
    pickup.pulse += dt * 7;

    const dx = pickup.x - player.x;
    const dy = pickup.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist < pickup.radius + player.radius) {
      state.score += pickup.value;
      spawnBurst(pickup.x, pickup.y, '#74d9ff', 12);
      pickups.splice(i, 1);
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.dx * dt;
    particle.y += particle.dy * dt;
    particle.dx *= 0.96;
    particle.dy *= 0.96;
    particle.life -= dt;

    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function updateWave(dt) {
  state.enemyTimer -= dt;
  if (state.enemyTimer <= 0) {
    const spawnCount = Math.min(1 + state.wave, 4);
    for (let i = 0; i < spawnCount; i += 1) {
      spawnEnemy();
    }
    state.wave += 1;
    state.enemyTimer = Math.max(0.7, 2.5 - state.wave * 0.07);
  }
}

function updateGame(dt) {
  if (!state.started || state.gameOver) {
    return;
  }

  state.time += dt;
  state.shake = Math.max(0, state.shake - dt * 35);

  updatePlayer(dt);
  updateEnemies(dt);
  updatePickups(dt);
  updateParticles(dt);
  updateWave(dt);

  if (player.health <= 0) {
    state.gameOver = true;
    overlay.classList.add('visible');
    overlay.innerHTML = `
      <div class="dialog">
        <p class="eyebrow">Run ended</p>
        <h2>Game Over</h2>
        <p>You reached <strong>${state.score}</strong> points and survived to wave <strong>${state.wave}</strong>.</p>
        <button id="restartButton" type="button">Try again</button>
      </div>
    `;
    document.getElementById('restartButton').addEventListener('click', () => {
      startGame();
    });
  }

  updateHud();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#0c1a2a');
  sky.addColorStop(0.65, '#173154');
  sky.addColorStop(1, '#1d2f3a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 150; i += 1) {
    const x = (i * 131.3 + state.time * 7) % (canvas.width + 50);
    const y = (i * 73.17 + state.time * 12) % (canvas.height * 0.7);
    ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.12})`;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = '#0d1d2a';
  for (let i = 0; i < 6; i += 1) {
    const baseX = i * 180 - 40;
    const baseY = canvas.height - 140;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY + 120);
    ctx.lineTo(baseX + 50, baseY + 20);
    ctx.lineTo(baseX + 100, baseY + 120);
    ctx.fill();
  }

  ctx.fillStyle = '#1a2936';
  ctx.fillRect(0, canvas.height - 90, canvas.width, 90);
  ctx.fillStyle = '#223040';
  for (let x = -20; x < canvas.width; x += 32) {
    ctx.fillRect(x, canvas.height - 90, 18, 18);
  }
}

function drawShadow(x, y, radius) {
  ctx.fillStyle = 'rgba(8, 12, 20, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y + radius - 2, radius + 8, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSlashEffect() {
  if (player.slashArc <= 0) return;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.facing === 1 ? 0 : Math.PI);
  ctx.strokeStyle = 'rgba(255, 211, 106, 0.8)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 52, -0.9, 0.9);
  ctx.stroke();
  ctx.restore();
}

function drawPlayerSprite() {
  const walking = Math.hypot(keys.left || keys.right ? 1 : 0, keys.up || keys.down ? 1 : 0) > 0;
  const frame = walking ? Math.floor((state.time * 12) % 4) : 0;
  const bob = walking ? Math.sin(state.time * 14) * 3 : 0;

  ctx.save();
  ctx.translate(player.x, player.y + bob);
  ctx.scale(player.facing, 1);

  drawShadow(0, 0, 18);

  const legLift = walking ? Math.sin(state.time * 14) * 7 : 0;
  const armSwing = walking ? Math.sin(state.time * 14 + 1.5) * 7 : 0;

  ctx.strokeStyle = '#8cc8ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-7, 14);
  ctx.lineTo(-8, 22 + legLift);
  ctx.moveTo(7, 14);
  ctx.lineTo(8, 22 - legLift);
  ctx.stroke();

  ctx.fillStyle = '#98e1ff';
  ctx.fillRect(-11, -4, 22, 18);

  ctx.fillStyle = '#b3f6ff';
  ctx.fillRect(-7, -12, 14, 11);

  ctx.fillStyle = '#0d2034';
  ctx.fillRect(-4, -10, 2, 2);
  ctx.fillRect(2, -10, 2, 2);

  ctx.strokeStyle = '#f6d783';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-18, 5 + armSwing);
  ctx.moveTo(11, 0);
  ctx.lineTo(18, 5 - armSwing);
  ctx.stroke();

  ctx.fillStyle = '#ffd36a';
  ctx.fillRect(-4, 6, 8, 4);

  ctx.fillStyle = '#7dffb6';
  ctx.fillRect(-10 + frame * 1.5, 15, 5, 7);
  ctx.fillRect(5 - frame * 1.5, 15, 5, 7);

  if (player.invulnerable > 0 && Math.floor(state.time * 20) % 2 === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -18, 36, 42);
  }

  ctx.restore();
}

function drawEnemySprite(enemy) {
  const animation = Math.sin(enemy.frame) * 5;
  ctx.save();
  ctx.translate(enemy.x, enemy.y + animation);
  drawShadow(0, 0, enemy.radius);

  if (enemy.type === 'bat') {
    ctx.fillStyle = enemy.hitFlash > 0 ? '#ffe8b8' : '#d9b3ff';
    ctx.beginPath();
    ctx.ellipse(-8, 0, 10, 5, -0.8, 0, Math.PI * 2);
    ctx.ellipse(8, 0, 10, 5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b38cff';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a0f2b';
    ctx.fillRect(-4, -3, 2, 2);
    ctx.fillRect(2, -3, 2, 2);
  } else {
    ctx.fillStyle = enemy.hitFlash > 0 ? '#dfffee' : '#75f0b2';
    ctx.beginPath();
    ctx.ellipse(0, 0, enemy.radius, enemy.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1d473e';
    ctx.fillRect(-5, -3, 2, 2);
    ctx.fillRect(3, -3, 2, 2);
    ctx.fillStyle = '#b0ffcd';
    ctx.fillRect(-7, 6, 4, 3);
    ctx.fillRect(3, 6, 4, 3);
  }

  ctx.restore();
}

function drawPickup(pickup) {
  const pulse = 1 + Math.sin(pickup.pulse) * 0.18;
  ctx.save();
  ctx.translate(pickup.x, pickup.y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#74d9ff';
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(7, 0);
  ctx.lineTo(0, 9);
  ctx.lineTo(-7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  for (const particle of particles) {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life * 1.3);
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    ctx.globalAlpha = 1;
  }
}

function drawHudText() {
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`Health ${Math.ceil(player.health)}/${player.maxHealth}`, 28, 32);
  ctx.fillText(`Wave ${state.wave}`, 28, 58);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  ctx.save();
  if (state.shake > 0) {
    ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
  }

  for (const pickup of pickups) {
    drawPickup(pickup);
  }

  drawPlayerSprite();
  drawSlashEffect();

  for (const enemy of enemies) {
    drawEnemySprite(enemy);
  }

  drawParticles();
  drawHudText();
  ctx.restore();
}

function loop(timestamp) {
  if (!state.lastTimestamp) {
    state.lastTimestamp = timestamp;
  }

  const dt = Math.min((timestamp - state.lastTimestamp) / 1000, 0.032);
  state.lastTimestamp = timestamp;

  updateGame(dt);
  render();
  requestAnimationFrame(loop);
}

startButton.addEventListener('click', () => {
  startGame();
});

resetGame();
overlay.classList.add('visible');
requestAnimationFrame(loop);
