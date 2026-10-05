const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');

const config = {
    width: 800,
    height: 400,
    groundY: 300,
    groundHeight: 36,
    baseSpeed: 5,
    gravity: 0.62,
    jumpForce: -12,
    spawnInterval: 80,
    maxObstacles: 3,
};

const state = {
    running: true,
    score: 0,
    speed: config.baseSpeed,
    obstacles: [],
    spawnTimer: 0,
    lastTime: 0,
    animationId: null,
};

const player = {
    x: 50,
    y: config.groundY,
    width: 52,
    height: 64,
    spriteWidth: 64,
    spriteHeight: 64,
    frameX: 0,
    frameY: 0,
    vy: 0,
    gravity: config.gravity,
    jumpForce: config.jumpForce,
    grounded: true,
    animationTick: 0,
    staggerFrames: 6,
};

function createPlayerSpriteSheet() {
    const spriteSheet = document.createElement('canvas');
    spriteSheet.width = 256;
    spriteSheet.height = 64;
    const spriteCtx = spriteSheet.getContext('2d');

    for (let frame = 0; frame < 4; frame++) {
        const offsetX = frame * 64;

        spriteCtx.fillStyle = '#2d3748';
        spriteCtx.fillRect(offsetX + 18, 18, 28, 30);

        spriteCtx.fillStyle = '#f4d35e';
        spriteCtx.fillRect(offsetX + 20, 10, 26, 18);

        spriteCtx.fillStyle = '#111827';
        spriteCtx.fillRect(offsetX + 27, 16, 4, 4);
        spriteCtx.fillRect(offsetX + 35, 16, 4, 4);

        spriteCtx.fillStyle = '#ef4444';
        spriteCtx.fillRect(offsetX + 10, 24, 12, 8);

        spriteCtx.fillStyle = '#f97316';
        spriteCtx.fillRect(offsetX + 38, 42, 10, 16);

        spriteCtx.fillStyle = '#f97316';
        spriteCtx.fillRect(offsetX + 16, 42, 10, 16);

        if (frame === 0 || frame === 2) {
            spriteCtx.fillStyle = '#d1d5db';
            spriteCtx.fillRect(offsetX + 18, 48, 8, 14);
            spriteCtx.fillRect(offsetX + 38, 48, 8, 14);
        } else {
            spriteCtx.fillStyle = '#d1d5db';
            spriteCtx.fillRect(offsetX + 18, 48, 6, 18);
            spriteCtx.fillRect(offsetX + 40, 48, 6, 18);
        }
    }

    return spriteSheet;
}

const playerSprite = createPlayerSpriteSheet();

function resetGame() {
    state.running = true;
    state.score = 0;
    state.speed = config.baseSpeed;
    state.obstacles = [];
    state.spawnTimer = 0;
    player.y = config.groundY;
    player.vy = 0;
    player.grounded = true;
    player.frameX = 0;
    player.animationTick = 0;
    scoreEl.textContent = state.score;
    gameOverEl.classList.add('hidden');
    if (!state.animationId) {
        state.animationId = requestAnimationFrame(gameLoop);
    }
}

function handleKeydown(event) {
    if (event.code !== 'Space') return;

    if (!state.running) {
        resetGame();
        return;
    }

    if (player.grounded) {
        player.vy = player.jumpForce;
        player.grounded = false;
    }
}

function spawnObstacle() {
    if (state.obstacles.length >= config.maxObstacles) return;

    const height = 24 + Math.random() * 28;
    state.obstacles.push({
        x: canvas.width + 10,
        y: config.groundY + config.groundHeight - height,
        width: 18 + Math.random() * 18,
        height,
        color: '#f97316',
    });
}

function handlePhysics(delta) {
    player.vy += player.gravity * delta;
    player.y += player.vy * delta;

    if (player.y >= config.groundY) {
        player.y = config.groundY;
        player.vy = 0;
        player.grounded = true;
    }
}

function animatePlayer() {
    const frame = player.grounded ? player.frameX : 1;
    ctx.drawImage(
        playerSprite,
        frame * player.spriteWidth,
        0,
        player.spriteWidth,
        player.spriteHeight,
        player.x,
        player.y,
        player.width,
        player.height
    );

    if (player.grounded) {
        player.animationTick += 1;
        if (player.animationTick >= player.staggerFrames) {
            player.frameX = (player.frameX + 1) % 4;
            player.animationTick = 0;
        }
    }
}

function drawBackground() {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#7dd3fc');
    skyGradient.addColorStop(1, '#dbeafe');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 5; i++) {
        const cloudX = (i * 170 + (state.score * 0.3)) % (canvas.width + 100) - 50;
        const cloudY = 40 + (i % 3) * 28;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 18, 0, Math.PI * 2);
        ctx.arc(cloudX + 20, cloudY - 10, 22, 0, Math.PI * 2);
        ctx.arc(cloudX + 42, cloudY, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.quadraticCurveTo(180, 240, 350, 300);
    ctx.quadraticCurveTo(560, 240, 800, 310);
    ctx.lineTo(800, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, config.groundY + config.groundHeight, canvas.width, canvas.height - (config.groundY + config.groundHeight));
}

function updateObstacles(delta) {
    const speedBoost = Math.floor(state.score / 5) * 0.5;
    state.speed = config.baseSpeed + speedBoost;

    state.spawnTimer -= delta;
    if (state.spawnTimer <= 0) {
        spawnObstacle();
        state.spawnTimer = 80 - Math.min(40, state.score * 0.7) + Math.random() * 30;
    }

    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obstacle = state.obstacles[i];
        obstacle.x -= state.speed * delta;

        const playerBox = {
            left: player.x + 12,
            right: player.x + player.width - 12,
            top: player.y + 8,
            bottom: player.y + player.height,
        };

        const obstacleBox = {
            left: obstacle.x,
            right: obstacle.x + obstacle.width,
            top: obstacle.y,
            bottom: obstacle.y + obstacle.height,
        };

        const intersects =
            playerBox.left < obstacleBox.right &&
            playerBox.right > obstacleBox.left &&
            playerBox.top < obstacleBox.bottom &&
            playerBox.bottom > obstacleBox.top;

        if (intersects) {
            endGame();
            return;
        }

        if (obstacle.x + obstacle.width < 0) {
            state.obstacles.splice(i, 1);
            state.score += 1;
            scoreEl.textContent = state.score;
        }
    }
}

function drawObstacles() {
    for (const obstacle of state.obstacles) {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

function endGame() {
    state.running = false;
    gameOverEl.classList.remove('hidden');
}

function gameLoop(timestamp) {
    state.animationId = null;

    if (!state.running) return;

    const delta = Math.min((timestamp - state.lastTime) / 16.67 || 1, 2.2);
    state.lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    handlePhysics(delta);
    updateObstacles(delta);
    animatePlayer();
    drawObstacles();

    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, config.groundY, canvas.width, config.groundHeight);

    if (state.running) {
        state.animationId = requestAnimationFrame(gameLoop);
    }
}

window.addEventListener('keydown', handleKeydown);
canvas.width = config.width;
canvas.height = config.height;
resetGame();
