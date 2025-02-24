let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 360;
const CELL_SIZE = 20;
const GRID_SIZE = 110;
const MARGINS = 15;

function drawBigTable(x,y) {
    ctx.reset();
    ctx.fillStyle = "#303030";
    ctx.fillRect(0, 0,canvas.width,canvas.height);
    ctx.font = "20px monospace";

    ctx.strokeStyle = "aliceblue";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGINS + GRID_SIZE, MARGINS);
    ctx.lineTo(MARGINS + GRID_SIZE, MARGINS + 3*GRID_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(MARGINS + 2*GRID_SIZE, MARGINS);
    ctx.lineTo(MARGINS + 2*GRID_SIZE, MARGINS + 3*GRID_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(MARGINS, MARGINS + GRID_SIZE);
    ctx.lineTo(MARGINS + 3*GRID_SIZE, MARGINS + GRID_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(MARGINS, MARGINS + 2*GRID_SIZE);
    ctx.lineTo(MARGINS + 3*GRID_SIZE, MARGINS + 2*GRID_SIZE);
    ctx.stroke();
}

function drawTables(x,y) {
    ctx.strokeStyle = "aliceblue";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(
        MARGINS + x*GRID_SIZE + 10 + 30,
        MARGINS + y*GRID_SIZE + 10);
    ctx.lineTo(
        MARGINS + x*GRID_SIZE + 10 + 30, 
        MARGINS + y*GRID_SIZE + 10 + 3*30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
        MARGINS + x*GRID_SIZE + 10 + 2*30,
        MARGINS + y*GRID_SIZE + 10);
    ctx.lineTo(
        MARGINS + x*GRID_SIZE + 10 + 2*30, 
        MARGINS + y*GRID_SIZE + 10 + 3*30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
        MARGINS + x*GRID_SIZE + 10,
        MARGINS + y*GRID_SIZE + 10 + 30);
    ctx.lineTo(
        MARGINS + x*GRID_SIZE + 10 + 3*30, 
        MARGINS + y*GRID_SIZE + 10 + 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
        MARGINS + x*GRID_SIZE + 10,
        MARGINS + y*GRID_SIZE + 10 + 2*30);
    ctx.lineTo(
        MARGINS + x*GRID_SIZE + 10 + 3*30, 
        MARGINS + y*GRID_SIZE + 10 + 2*30);
    ctx.stroke();
}

class Box {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.state = -999;
    }

    drawBox() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, 20, 20);
        ctx.stroke();
    }

    fillBox() {
        if (this.state === 10) {
            ctx.strokeStyle = "#DD4124";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x+2, this.y+2);
            ctx.lineTo(this.x+18, this.y+18);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x+2, this.y+18);
            ctx.lineTo(this.x+18, this.y+2);
            ctx.stroke();
        } else if (this.state === -10) {
            ctx.strokeStyle = "#6B5B95";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x+10, this.y+10,10,0,2*Math.PI);
            ctx.stroke();
        }
    }

    highlight() {
        ctx.beginPath();
        ctx.fillStyle = "rgba(1,55,127,0.5)";
        ctx.fillRect(this.x,this.y,20,20);
    }
}

class Boxes {
    constructor(x,y) {
        this.boxes = [];
        this.x = x;
        this.y = y;
    }

    addBox(box) {
        this.boxes.push(box);
    }

    init() {
        let offset_x = MARGINS + 15 + this.x*GRID_SIZE;
        let offset_y = MARGINS + 15 + this.y*GRID_SIZE;
        for(let i=0; i<3; i++) {
            for(let j=0; j<3; j++) {
                this.addBox(new Box(
                    offset_x + i*30, 
                    offset_y + j*30));
                this.boxes[i*3+j].drawBox();
            }
        }
    }

    drawBoxes() {
        for(let i=0; i<3; i++) {
            for(let j=0; j<3; j++) {
                this.boxes[i*3+j].drawBox();
            }
        }
    }
    highlight() {
        let moves = findMoves(this);
        for(let i=0; i<moves.length; i++) {
            this.boxes[moves[i]].highlight();
        }
    }
};

function checkLoc(game,x,y) { //for determining where the player clicks
    for(let i=0; i<9; i++) {
        if (x < game.boxes[i].x + 20 &&
            x > game.boxes[i].x &&
            y < game.boxes[i].y + 20 &&
            y > game.boxes[i].y &&
            game.boxes[i].state < -100
        ) {
        return i;
    }
    }
    return -1;
}

function compTurn(game) { 
    for(let j=0; j<50; j++){
        let k = Math.floor(Math.random()*8);
        if (game.boxes[k].state === -999) {
            return k;
        }
    }
    return -1;
};

function checkRows(game) {
    for (let y=0; y<3; y++) {
        if (game.boxes[0 + y].state !== -999 &&
            game.boxes[0 + y].state === game.boxes[3 + y].state &&
            game.boxes[3 + y].state === game.boxes[6 + y].state){
                return game.boxes[0 + y].state;
            }
    }
    return 0;
}
function checkCols(game) {
    for (let x=0; x<3; x++) {
        if (game.boxes[0 + x*3].state !== -999 &&
            game.boxes[0 + x*3].state === game.boxes[1 + x*3].state &&
            game.boxes[1 + x*3].state === game.boxes[2 + x*3].state){
                return game.boxes[0 + x*3].state;
            }
    }
    return 0;
}
function checkDiag(game) {
    if (game.boxes[0].state !== -999 &&
        game.boxes[0].state === game.boxes[4].state &&
        game.boxes[4].state === game.boxes[8].state){
            return game.boxes[0].state;
    } else if (game.boxes[0].state !== -999 &&
        game.boxes[2].state === game.boxes[4].state &&
        game.boxes[4].state === game.boxes[6].state){
            return game.boxes[2].state;
    }
    return 0;
}

function checkWinner(game, player, enemy) {
    if (checkRows(game) === player) return 10;
    if (checkCols(game) === player) return 10;
    if (checkDiag(game) === player) return 10;

    if (checkRows(game) === enemy) return -10;
    if (checkCols(game) === enemy) return -10;
    if (checkDiag(game) === enemy) return -10;

    return 0;
};

function checkBigWinner(game, player, enemy) {
    for (let i=0; i<3; i++) {
        for (let j=0; j<3; j++) {
            bigWinner.boxes[3*i + j].state = checkWinner(game[i][j],player,enemy);
        }
    }
}

function findMoves(game) {
    let moves = [];
    for (let i=0; i<9; i++){
        if(game.boxes[i].state === -999) {
            moves.push(i);
        }
    }
    if (moves.length > 0) return moves;
    return false;
}
function findBoards(game) {
    let boards = [];
    for (i=0; i<9; i++) {
        if (Math.abs(game.boxes[i].state) !== 10) {
            boards.push(i);
        }
    }
    return boards;
}

function minMax(game,depth,isMax) {
    let score = checkWinner(game,-10,10);
    if(score === -10) {
        return score;
    }
    if(score === 10){ 
        return score;
    }
    let moves = findMoves(game);
    let len = moves.length;
    if (moves === false) return 0;
    
    if (isMax) {
        let best = -1000;

        for(let i=0; i<len; i++) {
                game.boxes[moves[i]].state = -10;
                let t = minMax(game,depth+1,!isMax) - depth;
                best = Math.max(best, t);

                game.boxes[moves[i]].state = -999;
                console.log("Tried: " , moves[i], " score: ", t);
            }
        return best;
    } else {
        let best = 1000;
            for(let i=0; i<len; i++) {
                game.boxes[moves[i]].state = 10;
                let t = minMax(game,depth+1,!isMax) + depth;
                best = Math.min(best, t);

                game.boxes[moves[i]].state = -999;
                console.log("Tried: " , moves[i], " score: ", t);
            }
        return best;
    }
}

function findBestMove(game) {
    let bestVal = -1000;
    let bestMove = -1;
    let moves = findMoves(game);
    for(let i=0; i<moves.length; i++) {
        game.boxes[moves[i]].state = -10;
        let moveVal = minMax(game,0,false);
        game.boxes[moves[i]].state = -999;

        if(moveVal > bestVal) {
            bestMove = moves[i];
            bestVal = moveVal;
        }
    }
    console.log("Best move was: ", bestMove, "with score: ", bestVal);
    return bestMove;
}

function startGame() {
    for (i=0; i<3; i++) {
        currentState[i] = [];
        for(let j=0; j<3; j++) {
            currentState[i][j] = new Boxes(i,j);
        }
    }
    for (i=0; i<3; i++) {
        for(let j=0; j<3; j++) {
            currentState[i][j].init();
        }
    }
    drawGame();
    // bigWinner.init();
    for (let i=0; i<3; i++ ) {
        for (let j=0; j<3; j++ ) {
            currentState[i][j].highlight();
        }
    }
    return true;
}

function drawGame() {
    ctx.reset();
    drawBigTable();
    for (i=0; i<3; i++) {
        for(let j=0; j<3; j++) {
            currentState[i][j].drawBoxes();
            for(let k=0; k<9; k++) {
                currentState[i][j].boxes[k].fillBox();
            }
            drawTables(i,j);
        }
    }
    drawBigBoxes();
}

function drawBigBoxes() {
    for(let i=0; i<3; i++) {
        for(let j=0; j<3; j++) {
            let k = bigWinner.boxes[3*i + j].state;
            if (k === 10) {
                ctx.strokeStyle = "#DD4124";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(
                    MARGINS + i*GRID_SIZE + 10, MARGINS + j*GRID_SIZE + 10);
                ctx.lineTo(
                    MARGINS + i*GRID_SIZE + 100, MARGINS + j*GRID_SIZE + 100);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(
                    MARGINS + i*GRID_SIZE + 10, MARGINS + j*GRID_SIZE + 100);
                ctx.lineTo(
                    MARGINS + i*GRID_SIZE + 100, MARGINS + j*GRID_SIZE + 10);
                ctx.stroke();
            } else if (k === -10) {
                ctx.strokeStyle = "#6B5B95";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(
                    MARGINS + i*GRID_SIZE + 55, 
                    MARGINS + j*GRID_SIZE + 55,40,0,2*Math.PI);
                ctx.stroke();
            }
        }
    }
}

function drawHighlights(ag) {
    if (ag === -1) {
        drawGame();
        for (let i=0; i<3; i++ ) {
            for (let j=0; j<3; j++ ) {
                if (Math.abs(bigWinner.boxes[3*i + j].state) !== 10) {currentState[i][j].highlight();
                }
            }
        }
    } else {
        drawGame();
        currentState[ag[0]][ag[1]].highlight();
    }
}

let currentState = [];
let bigWinner = new Boxes(0,0);
bigWinner.init();
let players = ["Blue","Nobody","Red"];
let turns = 0;
let winner = 0;
let activeGame = -1;
let cpuTurn = false;
startGame();
document.addEventListener("click", e => {
    if (winner!==0) { //if the game was over, then restart on click
        ctx.reset();
        bigWinner = new Boxes(0,0);
        bigWinner.init();
        startGame();
        drawGame();
        turns = 0;
        winner = 0;
        activeGame = -1;
        return;
    }
    console.log(activeGame);
    let agx = activeGame[0];
    let agy = activeGame[1];
    
    let x = e.offsetX;
    let y = e.offsetY;// + rect.top;
    console.log("x ", x, " y ", y);
    if (activeGame === -1) {
        let k = -1;
        for (let i=0; i<3; i++ ) {
            for (let j=0; j<3; j++ ) {
                k = checkLoc(currentState[i][j],x,y);
                if (k >= 0 && Math.abs(bigWinner.boxes[3*i + j].state) === 10) {
                    k = -1;
                }
                if ( k >= 0 ) {
                    currentState[i][j].boxes[k].state = 10;
                    currentState[i][j].boxes[k].fillBox();
                    activeGame = [(k - k%3)/3,k%3];
                    cpuTurn = true;
                }
            }
        }
    } else {
        k = checkLoc(currentState[agx][agy],x,y);
        if (k >= 0) {
            currentState[agx][agy].boxes[k].state = 10;
            currentState[agx][agy].boxes[k].fillBox();
            activeGame = [(k - k%3)/3,k%3];
            cpuTurn = true;
        }
    }

    console.log(agx,agy);
    agx = activeGame[0];
    agy = activeGame[1];
    checkBigWinner(currentState,10,-10);
    winner = 0.1*checkWinner(bigWinner,10,-10);
    if (activeGame !== -1 && Math.abs(bigWinner.boxes[3*agx + agy].state) === 10) {
        activeGame = -1;
    }      

    drawGame();
    // drawBigBoxes();
    drawHighlights(activeGame);

    setTimeout(() => {
    if (cpuTurn && turns < 81 && winner === 0) {
        let k = -1;
        if(activeGame === -1) {
            let openBoards = findBoards(bigWinner);
            let t = openBoards[Math.floor(Math.random()*(openBoards.length))];
            agy = t%3;
            agx = (t - t%3)/3;
            console.log("did check", openBoards, t)
        }
        console.log("agx: ", agx, "agy: ", agy);
        if(agx !== undefined && agy !== undefined && findMoves(currentState[agx][agy]).length === 9){
            k = compTurn(currentState[agx][agy]);
        } else {
            k = findBestMove(currentState[agx][agy],-10,10);
        }
        currentState[agx][agy].boxes[k].state = -10;
        currentState[agx][agy].boxes[k].fillBox();
        cpuTurn = false;
        activeGame = [(k - k%3)/3,k%3];
    }
    agx = activeGame[0];
    agy = activeGame[1];
    checkBigWinner(currentState,10,-10);
    winner = 0.1*checkWinner(bigWinner,10,-10);
    if (activeGame !== -1 && Math.abs(bigWinner.boxes[3*agx + agy].state) === 10) {
        activeGame = -1;
    }

    if (winner!==0 || turns>=81) {
        drawGame();
        ctx.fillStyle = "aliceblue";
        ctx.fillText(`${players[1 + winner]} wins.`, 20, 20);
        winner = 2;
    } else {
        drawHighlights(activeGame);
}
console.log("Delayed for 0.5 second.");
}, "1000");
});