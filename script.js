const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Game State Variables
let gameLive = true;
let score = 0;
let gameSpeed = 5;

// Load Sprite Sheet (Assumes a row of 4 running frames)
const playerSprite = new Image();
playerSprite.src = 'https://imgur.com'; // Sample running sprite sheet URL

// Character Configuration
const player = {
    x: 50,
    y: 300,
    width: 64,       // Render size width
    height: 64,      // Render size height
    spriteWidth: 64, // Width of a single frame in the sprite sheet
    spriteHeight: 64,// Height of a single frame in the sprite sheet
    frameX: 0,       // Current column frame [0, 1, 2, 3]
    frameY: 0,       // Current row frame
    vy: 0,           // Velocity Y
    gravity: 0.6,
    jumpForce: -12,
    isGrounded: true,
    staggerFrames: 5,// Slows down the sprite frame changes
    gameFrame: 0
};

// Obstacle Array
let obstacles = [];

// Track Inputs
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameLive) {
            resetGame();
        } else if (player.isGrounded) {
            player.vy = player.jumpForce;
            player.isGrounded = false;
        }
    }
});

function spawnObstacle() {
    if (Math.random() < 0.015 && obstacles.length < 3) {
        obstacles.push({
            x: canvas.width,
            y: 330,
            width: 20,
            height: 34,
            color: '#e67e22'
        });
    }
}

function handlePhysics() {
    // Apply gravity
    player.vy += player.gravity;
    player.y += player.vy;

    // Floor collision
    if (player.y >= 300) {
        player.y = 300;
        player.vy = 0;
        player.isGrounded = true;
    }
}

function animatePlayer() {
    // 9-argument pattern: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
        playerSprite,
        player.frameX * player.spriteWidth, player.frameY * player.spriteHeight, // Crop position
        player.spriteWidth, player.spriteHeight,                               // Crop dimensions
        player.x, player.y,                                                     // Render position
        player.width, player.height                                             // Render dimensions
    );

    // Only cycle frames while on the ground
    if (player.isGrounded) {
        if (player.gameFrame % player.staggerFrames === 0) {
            // Loop through 4 horizontal frames (0 to 3)
            player.frameX = (player.frameX + 1) % 4; 
        }
        player.gameFrame++;
    } else {
        // Use a static frame while jumping
        player.frameX = 1;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear screen

    // Draw Floor
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 364, canvas.width, 36);

    // Handle character logic
    handlePhysics();
    animatePlayer();

    // Handle obstacles
    spawnObstacle();
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        // Draw Obstacle
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision Check (AABB box mapping)
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width - 15 > obs.x && // Buffer padding for sprite accuracy
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            endGame();
        }

        // Delete past screen elements & count score
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            scoreEl.innerText = score;
            if (score % 5 === 0) gameSpeed += 0.5; // Accelerate game difficulty
        }
    }

    if (gameLive) {
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    gameLive = false;
    gameOverEl.classList.remove('hidden');
}

function resetGame() {
    gameLive = true;
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    player.y = 300;
    scoreEl.innerText = score;
    gameOverEl.classList.add('hidden');
    gameLoop();
}

// Start game after image loads
playerSprite.onload = () => {
    gameLoop();
};
