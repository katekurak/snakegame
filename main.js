class Game {
    constructor() {
        this.app = new PIXI.Application({ width: 400, height: 400, backgroundColor: 0x34495e });
        document.getElementById('game').appendChild(this.app.view);

        this.bestScore = 0;
        this.currentScore = 0;
        this.mode = 'classic';

        this.snake = [];
        this.food = [];
        this.walls = [];
        this.direction = 'right';
        this.speed = 500;
        this.initialSpeed = 500;
        this.isPlaying = false;

        this.init();
    }

    init() {
        document.getElementById('play-button').addEventListener('click', () => this.startGame());
        document.getElementById('exit-button').addEventListener('click', () => this.exitGame());
        document.getElementById('menu-button').addEventListener('click', () => this.showMenu());

        document.querySelectorAll('input[name="mode"]').forEach(input => {
            input.addEventListener('change', (event) => {
                this.mode = event.target.value;
                this.speed = this.initialSpeed;  // Reset speed on mode change
            });
        });

        window.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

    startGame() {
        this.isPlaying = true;
        document.getElementById('play-button').style.display = 'none';
        document.getElementById('exit-button').style.display = 'none';
        document.getElementById('menu-button').style.display = 'block';
        document.getElementById('modes').style.display = 'none';

        this.currentScore = 0;
        this.updateScores();

        this.snake = [{ x: 10, y: 10 }];
        this.walls = [];
        this.spawnFood();

        this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
    }

    exitGame() {
        this.isPlaying = false;
        alert('Exit Game');
    }

    showMenu() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        this.app.stage.removeChildren();

        document.getElementById('play-button').style.display = 'block';
        document.getElementById('exit-button').style.display = 'block';
        document.getElementById('modes').style.display = 'block';
        document.getElementById('menu-button').style.display = 'none';

    }

    spawnFood() {
        if (this.mode === 'portal') {
            this.food = [];
            while (this.food.length < 2) {
                let foodX = Math.floor(Math.random() * 20);
                let foodY = Math.floor(Math.random() * 20);
                let foodCell = { x: foodX, y: foodY };
                if (!this.snake.some(segment => segment.x === foodX && segment.y === foodY) &&
                    !this.food.some(f => f.x === foodX && f.y === foodY) &&
                    !this.walls.some(w => w.x === foodX && w.y === foodY)) {
                    this.food.push(foodCell);
                }
            }
        } else {
            let foodX = Math.floor(Math.random() * 20);
            let foodY = Math.floor(Math.random() * 20);
            this.food = [{ x: foodX, y: foodY }];
        }
    }

    spawnWall() {
        let wallX = Math.floor(Math.random() * 20);
        let wallY = Math.floor(Math.random() * 20);
        let wallCell = { x: wallX, y: wallY };
        if (!this.snake.some(segment => segment.x === wallX && segment.y === wallY) &&
            !this.food.some(f => f.x === wallX && f.y === wallY) &&
            !this.walls.some(w => w.x === wallX && w.y === wallY)) {
            this.walls.push(wallCell);
        } else {
            this.spawnWall();
        }
    }

    gameLoop() {
        this.updateSnake();
        this.checkCollisions();
        this.render();
    }

    updateSnake() {
        let head = { ...this.snake[0] };

        switch (this.direction) {
            case 'left': head.x--; break;
            case 'right': head.x++; break;
            case 'up': head.y--; break;
            case 'down': head.y++; break;
        }

        this.snake.unshift(head);

        let ateFood = false;
        for (let i = 0; i < this.food.length; i++) {
            if (head.x === this.food[i].x && head.y === this.food[i].y) {
                this.currentScore++;
                this.updateScores();
                this.food.splice(i, 1);
                ateFood = true;
                if (this.mode === 'speed') {
                    this.speed *= 0.9;
                    clearInterval(this.gameInterval);
                    this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
                }
                if (this.mode === 'portal') {
                    this.snake[0] = this.food[0];
                    this.spawnFood();
                } else if (this.mode === 'walls') {
                    this.spawnWall();
                    this.spawnFood();
                } else {
                    this.spawnFood();
                }
                break;
            }
        }

        if (!ateFood) {
            this.snake.pop();
        }
    }

    checkCollisions() {
        let head = this.snake[0];

        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            if (this.mode === 'noDie') {
                if (head.x < 0) head.x = 19;
                if (head.x >= 20) head.x = 0;
                if (head.y < 0) head.y = 19;
                if (head.y >= 20) head.y = 0;
            } else {
                this.endGame();
            }
        }

        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                if (this.mode !== 'noDie') {
                    this.endGame();
                }
            }
        }

        for (let wall of this.walls) {
            if (head.x === wall.x && head.y === wall.y) {
                this.endGame();
            }
        }
    }

    render() {
        this.app.stage.removeChildren();

        let snakeGraphics = new PIXI.Graphics();
        snakeGraphics.beginFill(0x2ecc71);
        this.snake.forEach(segment => {
            snakeGraphics.drawRect(segment.x * 20, segment.y * 20, 20, 20);
        });
        snakeGraphics.endFill();
        this.app.stage.addChild(snakeGraphics);



        let foodGraphics = new PIXI.Graphics();
        foodGraphics.beginFill(0xe74c3c);
        this.food.forEach(f => {
            foodGraphics.drawRect(f.x * 20, f.y * 20, 20, 20);
        });
        foodGraphics.endFill();
        this.app.stage.addChild(foodGraphics);



        let wallGraphics = new PIXI.Graphics();
        wallGraphics.beginFill(0x7f8c8d);
        this.walls.forEach(wall => {
            wallGraphics.drawRect(wall.x * 20, wall.y * 20, 20, 20);
        });
        wallGraphics.endFill();
        this.app.stage.addChild(wallGraphics);
    }

    handleKeyPress(event) {
        switch (event.key) {
            case 'ArrowLeft':
                if (this.direction !== 'right') this.direction = 'left';
                break;
            case 'ArrowUp':
                if (this.direction !== 'down') this.direction = 'up';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.direction = 'right';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.direction = 'down';
                break;
        }
    }

    updateScores() {
        document.getElementById('current-score').textContent = this.currentScore;
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            document.getElementById('best-score').textContent = this.bestScore;
        }
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        alert('Game Over');
        this.showMenu();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
