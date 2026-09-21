const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME CONFIG & STATE ---
let score = 0;
let gameOver = false;
const keys = {};

// --- LOAD SPRITES ---
// Using placeholder character and coin sprite sheets from OpenGameArt / public assets
const playerSprite = new Image();
playerSprite.src = 'https://githubusercontent.com'; 

const coinSprite = new Image();
coinSprite.src = 'https://githubusercontent.com'; 

// --- PLAYER OBJECT ---
const player = {
    x: 100,
    y: 350,
    width: 64,       // Rendered width
    height: 64,      // Rendered height
    speed: 5,
    // Sprite animation variables
    spriteWidth: 32, // The width of a single frame in the sprite sheet
    spriteHeight: 32,// The height of a single frame in the sprite sheet
    frameX: 0,       // Current column frame
    frameY: 0,       // Current row frame (e.g., 0 = Idle, 1 = Move Right, 2 = Move Left)
    gameFrame: 0,
    staggerFrames: 6 // Slows down animation speed
};

// --- COIN OBJECT ---
const coin = {
    x: Math.random() * (canvas.width - 50),
    y: Math.random() * (canvas.height - 50),
    width: 40,
    height: 40
};

// --- INPUT LISTENERS ---
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// --- COLLISION DETECTION ---
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// --- UPDATE GAME LOGIC ---
function update() {
    let isMoving = false;

    // Movement & Frame Rows (frameY) mapping
    if (keys['ArrowLeft'] || keys['a']) {
        player.x -= player.speed;
        player.frameY = 2; // Assume Row 2 is facing left
        isMoving = true;
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.x += player.speed;
        player.frameY = 1; // Assume Row 1 is facing right
        isMoving = true;
    }
    if (keys['ArrowUp'] || keys['w']) {
        player.y -= player.speed;
        isMoving = true;
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y += player.speed;
        isMoving = true;
    }

    // Boundary constraints
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;

    // Handle Sprite Sheets Animation Loops
    if (isMoving) {
        player.gameFrame++;
        if (player.gameFrame % player.staggerFrames === 0) {
            // Assume 4 animation frames per row, cycle back to 0
            if (player.frameX < 3) player.frameX++;
            else player.frameX = 0;
        }
    } else {
        player.frameX = 0; // Default to standard idle pose when stopped
    }

    // Check Coin Capture
    if (checkCollision(player, coin)) {
        score += 10;
        // Relocate coin randomly
        coin.x = Math.random() * (canvas.width - coin.width);
        coin.y = Math.random() * (canvas.height - coin.height);
    }
}

// --- RENDER IMAGES TO CANVAS ---
function draw() {
    // 1. Clear previous canvas frames
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw simple decorative background grid
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 400, canvas.width, 100);

    // 3. Draw static UI text
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Score: ${score}`, 20, 35);

    // 4. Draw the Coin target
    ctx.drawImage(coinSprite, coin.x, coin.y, coin.width, coin.height);

    // 5. Draw the Player Animated Sprite using the 9-argument version of drawImage()
    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.drawImage(
        playerSprite, 
        player.frameX * player.spriteWidth,  // Crop starting X coordinate
        player.frameY * player.spriteHeight, // Crop starting Y coordinate
        player.spriteWidth,                  // Width of source crop frame
        player.spriteHeight,                 // Height of source crop frame
        player.x,                            // Target X on Canvas
        player.y,                            // Target Y on Canvas
        player.width,                        // Width to stretch/draw player on canvas
        player.height                        // Height to stretch/draw player on canvas
    );
}

// --- THE RECURSIVE ENGINE LOOP ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game after image elements pull remote data assets safely
playerSprite.onload = () => {
    coinSprite.onload = () => {
        gameLoop();
    };
};
