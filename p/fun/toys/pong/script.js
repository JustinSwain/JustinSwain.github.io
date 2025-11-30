class GameView {
    constructor() {
        let canvas = document.querySelector("#canvas");
        canvas.width = canvas.offsetWidth;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
    }

    draw(entities) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Animated midline
        this.ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
        this.ctx.lineWidth = 2;
        this.ctx.lineDashOffset = -(Date.now() / 50 % 30);
        this.ctx.setLineDash([12, 12]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        entities.forEach(entity => entity.draw(this.ctx));
    }

    drawScores(scores) {
        this.ctx.save();
        this.ctx.shadowColor = "white";
        this.ctx.shadowBlur = 25;
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 50px Dos, monospace";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(scores.leftScore.toString(), 80, this.height / 2);
        this.ctx.textAlign = "right";
        this.ctx.fillText(scores.rightScore.toString(), this.width - 80, this.height / 2);
        this.ctx.restore();
    }

    drawGameOver(scores) {
        this.ctx.save();
        this.ctx.shadowColor = "white";
        this.ctx.shadowBlur = 35;
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 72px Dos, monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        const msg = scores.leftScore >= 3 ? "You Win!" : "You Lose!";
        this.ctx.fillText(msg, this.width / 2, this.height * 0.42);
        this.ctx.font = "bold 36px Dos, monospace";
        this.ctx.shadowBlur = 20;
        this.ctx.fillText("Click RESTART to play again", this.width / 2, this.height * 0.6);
        this.ctx.restore();
    }
}

class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    boundingBox() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

class Paddle extends Entity {
    static WIDTH = 12;
    static HEIGHT = 60;
    static OFFSET = 30;

    constructor(x, y) {
        super(x, y, Paddle.WIDTH, Paddle.HEIGHT);
        this.color = "#00ffff";
        this.targetY = y;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 25;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color + "44";
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        ctx.restore();
    }
}

class Ball extends Entity {
    static SIZE = 8;

    constructor() {
        super(0, 0, Ball.SIZE, Ball.SIZE);
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.trail = [];
    }

    update() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        this.trail.push({ x: centerX, y: centerY });
        if (this.trail.length > 25) {
            this.trail.shift();
        }
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    draw(ctx) {
        // Trail
        for (let j = 0; j < this.trail.length; j++) {
            const alpha = (j + 1) / this.trail.length;
            const sz = Ball.SIZE * alpha * 0.8;
            ctx.save();
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = sz * 1.5;
            ctx.beginPath();
            ctx.arc(this.trail[j].x, this.trail[j].y, sz / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Main ball
        ctx.save();
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    reset(width, height) {
        this.x = width / 2 - this.width / 2;
        this.y = height / 2 - this.height / 2;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.trail = [];
    }

    adjustAngle(distanceFromTop, distanceFromBottom) {
        if (distanceFromTop < 0) {
            this.ySpeed -= 0.6;
        } else if (distanceFromBottom < 0) {
            this.ySpeed += 0.6;
        }
    }

    checkPaddleCollision(paddle, xSpeedAfterBounce) {
        let ballBox = this.boundingBox();
        let paddleBox = paddle.boundingBox();

        let collisionOccurred = (
            ballBox.left < paddleBox.right &&
            ballBox.right > paddleBox.left &&
            ballBox.top < paddleBox.bottom &&
            ballBox.bottom > paddleBox.top
        );

        if (collisionOccurred) {
            let distanceFromTop = ballBox.top - paddleBox.top;
            let distanceFromBottom = paddleBox.bottom - ballBox.bottom;
            this.adjustAngle(distanceFromTop, distanceFromBottom);
            this.xSpeed = xSpeedAfterBounce;
        }
    }

    checkWallCollision(width, height, scores) {
        let ballBox = this.boundingBox();
        let scored = false;

        if (ballBox.left < 0) {
            scores.rightScore++;
            this.reset(width, height);
            scored = true;
        } else if (ballBox.right > width) {
            scores.leftScore++;
            this.reset(width, height);
            scored = true;
        }
        if (ballBox.top < 0 || ballBox.bottom > height) {
            this.ySpeed = -this.ySpeed;
        }
        return scored;
    }
}

class Scores {
    constructor() {
        this.leftScore = 0;
        this.rightScore = 0;
    }
}

class Computer {
    static followBall(paddle, ball, maxSpeed, canvasWidth, canvasHeight, difficulty) {
        let rawTargetY;
        if (ball.xSpeed > 0) {
            // Predict
            const timeToPaddleX = canvasWidth - Paddle.OFFSET - Paddle.WIDTH - ball.x;
            const timeToPaddle = timeToPaddleX / ball.xSpeed;
            rawTargetY = ball.y + ball.ySpeed * timeToPaddle;
        } else {
            // Follow current
            rawTargetY = ball.y;
        }

        // YOUR RANDOM JITTTER: Add this line wherever you put it (recommended here)
        rawTargetY += (Math.random() - 0.5) * 27 * difficulty;  // Tune 35px spread, scales w/ diff

        // Clamp raw target to paddle bounds
        rawTargetY = Math.max(Paddle.HEIGHT / 2, Math.min(canvasHeight - Paddle.HEIGHT / 2, rawTargetY));
        rawTargetY -= Paddle.HEIGHT / 2;  // Target top of paddle

        // NEW: Smooth the target (eliminates jitter/oscillation)
        const lerpFactor = 0.18;  // Tune: 0.1=slower/smoother, 0.3=more responsive
        paddle.targetY += (rawTargetY - paddle.targetY) * lerpFactor;

        // NEW: Proportional movement (no overshoot/oscillation)
        const error = paddle.targetY - paddle.y;
        const deadzone = 1.5;  // Ignore tiny errors
        if (Math.abs(error) > deadzone) {
            // Proportional speed: full maxSpeed at 28px error, scales down closer
            const propFactor = Math.min(1, Math.abs(error) / 28);
            const moveSpeed = maxSpeed * propFactor;
            paddle.y += Math.sign(error) * moveSpeed;
        }
    }
}
class Game {
    constructor() {
        this.gameView = new GameView();
        this.width = this.gameView.width;
        this.height = this.gameView.height;
        this.canvas = this.gameView.canvas;
        this.ball = new Ball();
        this.leftPaddle = new Paddle(Paddle.OFFSET, this.height / 2 - Paddle.HEIGHT / 2);
        this.leftPaddle.color = "#00ffff";
        this.rightPaddle = new Paddle(this.width - Paddle.OFFSET - Paddle.WIDTH, this.height / 2 - Paddle.HEIGHT / 2);
        this.rightPaddle.color = "#ff6600";
        this.scores = new Scores();
        this.gameOver = false;
        this.pause = true;
        this.difficulty = 1;
        this.lastResetTime = 0;

        // Mouse control for left paddle (center on mouse)
        document.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            this.leftPaddle.y = Math.max(0, Math.min(this.height - Paddle.HEIGHT, mouseY - Paddle.HEIGHT / 2));
        });

        this.clampPaddle(this.leftPaddle);
        this.clampPaddle(this.rightPaddle);
    }

    clampPaddle(paddle) {
        paddle.y = Math.max(0, Math.min(this.height - Paddle.HEIGHT, paddle.y));
    }

    restart() {
        this.scores.leftScore = 0;
        this.scores.rightScore = 0;
        this.ball.reset(this.width, this.height);
        this.leftPaddle.y = this.height / 2 - Paddle.HEIGHT / 2;
        this.rightPaddle.y = this.leftPaddle.y;
        this.rightPaddle.targetY = this.rightPaddle.y;
        this.clampPaddle(this.leftPaddle);
        this.clampPaddle(this.rightPaddle);
        this.gameOver = false;
        this.lastResetTime = Date.now();
        this.pause = true;
        this.draw();
    }

    draw() {
        this.gameView.draw([this.ball, this.leftPaddle, this.rightPaddle]);
        this.gameView.drawScores(this.scores);
    }

    update() {
        this.difficulty = input.valueAsNumber;
        this.ball.update();
        Computer.followBall(this.rightPaddle, this.ball, this.difficulty * 1.3 + 1.5, this.width, this.height, this.difficulty);
        this.clampPaddle(this.rightPaddle);

        // Auto-serve after delay
        if (Date.now() - this.lastResetTime > 1300 && Math.abs(this.ball.xSpeed) < 0.1) {
            const diff = this.difficulty;
            const serveDir = Math.random() < 0.6 ? 1 : -1;  // Slightly favor right
            this.ball.xSpeed = serveDir * 1.6 * diff;
            this.ball.ySpeed = (Math.random() - 0.5) * diff * 1.8;
        }
    }

    checkCollision() {
        this.ball.checkPaddleCollision(this.leftPaddle, Math.abs(this.ball.xSpeed));
        this.ball.checkPaddleCollision(this.rightPaddle, -Math.abs(this.ball.xSpeed));
        const scored = this.ball.checkWallCollision(this.width, this.height, this.scores);
        if (scored) {
            this.lastResetTime = Date.now();
        }
        if (this.scores.leftScore >= 3 || this.scores.rightScore >= 3) {
            this.gameOver = true;
        }
    }

    loop() {
        if (this.pause) return;

        this.update();
        this.checkCollision();

        if (this.gameOver) {
            this.draw();
            this.gameView.drawGameOver(this.scores);
            return;
        }

        this.draw();
        setTimeout(() => this.loop(), 16);
    }
}

let input = document.querySelector("#select");
let value = document.querySelector("#value");
value.textContent = input.value;
addEventListener("input", () => {
    value.textContent = input.value;
});

let game = new Game();
game.restart();

document.querySelector("#start").addEventListener("click", () => {
    game.pause = false;
    game.loop();
});

document.querySelector("#restart").addEventListener("click", () => {
    game.restart();
});