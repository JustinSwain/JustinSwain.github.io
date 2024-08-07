class GameView {
    constructor() {
        let canvas =document.querySelector("#canvas");
        canvas.style.width = "100%";
        canvas.width = canvas.offsetWidth;
        const image = document.getElementById("source");
        this.image = image;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.offset = canvas.offsetTop;
    }

    draw(...entities) {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
        entities.forEach(entity => entity.draw(this.ctx));
    }

    drawScores(scores) {
        this.ctx.fillStyle = "white";
        this.ctx.font = "30px monospace";
        this.ctx.textAlign = "left";
        this.ctx.fillText(scores.leftScore.toString(), 50, 50);
        this.ctx.textAlign = "right";
        this.ctx.fillText(scores.rightScore.toString(), this.width - 50, 50);
    }

    drawGameOver(scores) {
        this.ctx.fillStyle = "white";
        this.ctx.font = "30px monospace";
        this.ctx.textAlign = "center";
        if (scores.leftScore > scores.rightScore){
            this.ctx.fillText("You win!", this.width/2, this.height/2);
        } else {
            this.ctx.fillText("You lose!", this.width/2, this.height/2);
        }
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
    
    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Paddle extends Entity {
    static WIDTH = 5;
    static HEIGHT = 30;
    static OFFSET = 20;

    constructor (x, y) {
        super(x, y, Paddle.WIDTH, Paddle.HEIGHT);
    }
}

class Ball extends Entity {
    static SIZE = 5;

    constructor() {
        super(0, 0, Ball.SIZE, Ball.SIZE);
        this.init();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
    }

    init() {
        this.x = 100;
        this.y = 50;
        this.xSpeed = 1.5*input.valueAsNumber;
        this.ySpeed = input.valueAsNumber;
    }

    update() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    adjustAngle(distanceFromTop, distanceFromBottom) {
        if (distanceFromTop < 0) {
            this.ySpeed -= 0.5;
        }
        else if (distanceFromBottom < 0) {
            this.ySpeed += 0.5;
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

        if (ballBox.left < 0) {
            scores.rightScore++;
            this.init();
        }
        if (ballBox.right > width) {
            scores.leftScore++;
            this.init();
        }
        if (ballBox.top < 0 || ballBox.bottom > height) {
            this.ySpeed = -this.ySpeed;
        }
    }
}

class Scores {
    constructor() {
        this.leftScore = 0;
        this.rightScore = 0;
    }
}

class Computer {
    static followBall(paddle, ball, speed) {
        const MAX_SPEED = speed;
        let ballBox = ball.boundingBox();
        let paddleBox = paddle.boundingBox();

        if (ballBox.top < paddleBox.top) {
            paddle.y -= MAX_SPEED;
        } else if (ballBox.bottom > paddleBox.bottom) {
            paddle.y += MAX_SPEED;
        }
    }
}

class Game {
    constructor(difficulty) {
        this.gameView = new GameView();
        this.ball = new Ball(difficulty);
        this.leftPaddle = new Paddle(Paddle.OFFSET, 10);
        this.rightPaddle = new Paddle(this.gameView.width - Paddle.OFFSET - Paddle.WIDTH, 30);

        this.scores = new Scores();
        this.gameOver = false;
        this.pause = false;

        document.addEventListener("mousemove", e=> {
            this.leftPaddle.y = e.y - this.gameView.offset;
        });
    }

    init() {
        this.ball.init();
        this.scores.leftScore = 0;
        this.scores.rightScore = 0;
        this.gameOver = 0;
        this.draw();
        this.update();
        this.pause = true;
    }

    draw() {
        this.gameView.draw(
            this.ball,
            this.leftPaddle,
            this.rightPaddle,
        );

    this.gameView.drawScores(this.scores);
    }

    checkCollision() {
        this.ball.checkPaddleCollision(this.leftPaddle, Math.abs(this.ball.xSpeed));
        this.ball.checkPaddleCollision(this.rightPaddle, -Math.abs(this.ball.xSpeed));

        this.ball.checkWallCollision(
            this.gameView.width,
            this.gameView.height,
            this.scores,
            this.difficulty
        );

        if (this.scores.leftScore > 2 || this.scores.rightScore > 2) {
            this.gameOver = true;
        }
    }

    update() {
        this.difficulty = input.valueAsNumber;
        this.ball.update();
        Computer.followBall(this.rightPaddle, this.ball, this.difficulty+3);
    }

    loop() {
        if(!this.pause) {
            this.draw();
            this.update();
            this.checkCollision();

            if (this.gameOver) {
                this.draw();
                this.gameView.drawGameOver(this.scores);
            } else {
                setTimeout(() => this.loop(), 20);
            }
        } else {
            return;
        }
    }

    restart() {
        this.draw();
        this.scores.leftScore = 0;
        this.scores.rightScore = 0; 
        this.ball.reset();
        this.gameOver = false;
    }
}

let input = document.querySelector("#select");
let value = document.querySelector("#value");
value.textContent = input.value;
addEventListener("input", () => {
    value.textContent = input.value;
})
let game = new Game(input.valueAsNumber);
game.init();

let i=0;
document.querySelector("#start").addEventListener("click", ()=> {
    i++;
    if(i===1) {
        game.pause = false;
        game.loop();
    }
})

document.querySelector("#restart").addEventListener("click", ()=> {
    game.init();
    i = 0;
});


