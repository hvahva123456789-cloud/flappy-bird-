class FlappyBird {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.bird = document.getElementById('bird');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // Game state
        this.birdY = 300;
        this.velocity = 0;
        this.gravity = 0.6;
        this.jumpPower = -11;
        this.score = 0;
        this.gameRunning = true;
        this.pipes = [];
        
        // Pipe settings
        this.pipeWidth = 60;
        this.pipeGap = 160;
        this.pipeSpeed = 2.5;
        this.pipeInterval = 220;
        this.lastPipeX = 400;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.gameContainer.addEventListener('click', () => this.jump());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Create initial pipe
        this.createPipe(400);
        this.gameLoop();
    }
    
    jump() {
        if (this.gameRunning) {
            this.velocity = this.jumpPower;
            this.bird.style.transform = 'rotate(-20deg)';
            setTimeout(() => {
                this.bird.style.transform = 'rotate(0deg)';
            }, 200);
        }
    }
    
    createPipe(x) {
        const gapY = Math.random() * 180 + 120; // Random gap position
        const topHeight = gapY - this.pipeGap / 2;
        const bottomHeight = 520 - gapY - this.pipeGap / 2;
        
        // Create top pipe
        const pipeTop = document.createElement('div');
        pipeTop.className = 'pipe pipe-top';
        pipeTop.style.left = x + 'px';
        pipeTop.style.height = topHeight + 'px';
        pipeTop.innerHTML = '<div class="pipe-cap"></div>';
        
        // Create bottom pipe
        const pipeBottom = document.createElement('div');
        pipeBottom.className = 'pipe pipe-bottom';
        pipeBottom.style.left = x + 'px';
        pipeBottom.style.height = bottomHeight + 'px';
        pipeBottom.innerHTML = '<div class="pipe-cap"></div>';
        
        this.gameContainer.appendChild(pipeTop);
        this.gameContainer.appendChild(pipeBottom);
        
        this.pipes.push({
            top: pipeTop,
            bottom: pipeBottom,
            x: x,
            scored: false
        });
    }
    
    updatePipes() {
        // Generate new pipes at right edge
        if (this.lastPipeX <= 400 - this.pipeInterval) {
            this.createPipe(400);
            this.lastPipeX = 400;
        }
        
        // Update all pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            pipe.top.style.left = pipe.x + 'px';
            pipe.bottom.style.left = pipe.x + 'px';
            
            // Score logic
            if (!pipe.scored && pipe.x + this.pipeWidth < 100) {
                this.score++;
                this.scoreElement.textContent = this.score;
                pipe.scored = true;
            }
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < -10) {
                pipe.top.remove();
                pipe.bottom.remove();
                this.pipes.splice(i, 1);
            }
        }
        
        this.lastPipeX -= this.pipeSpeed;
    }
    
    updateBird() {
        this.velocity += this.gravity;
        this.birdY += this.velocity;
        
        // Boundary checks
        if (this.birdY < 10) {
            this.birdY = 10;
            this.velocity = 0;
        }
        if (this.birdY > 496) { // 600 - 80(ground) - 24(bird height)
            this.gameOver();
            return;
        }
        
        this.bird.style.top = this.birdY + 'px';
    }
    
    checkCollisions() {
        for (let pipe of this.pipes) {
            if (pipe.x < 134 && pipe.x + this.pipeWidth > 100) {
                const topPipeBottom = parseInt(pipe.top.style.height);
                const bottomPipeTop = 520 - parseInt(pipe.bottom.style.height);
                
                if (this.birdY < topPipeBottom || this.birdY + 24 > bottomPipeTop) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.updateBird();
            this.updatePipes();
            this.checkCollisions();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global game instance and functions
let game;

function startGame() {
    // Clean up existing pipes
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
    game = new FlappyBird();
}

function restartGame() {
    game.gameOverElement.style.display = 'none';
    startGame();
}

// Initialize game on load
window.addEventListener('load', startGame);