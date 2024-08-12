canvas = document.querySelector("#canvas");
ctx = canvas.getContext("2d");
width = canvas.width;
height = canvas.height;

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

class Box {
    constructor(x,y,size){
        this.x = x;
        this.y = y;
        this.size = size;
    }
}

class Boxes {
    constructor(){
      this.boxes = [];
    }

    newBox(x,y,size){
      let b = new Box(x,y,size);
      this.boxes.push(b);
      return b;
    }

    get numberOfBoxes(){
        return this.boxes.length;
    }

    draw(scale) {
        for (let b in this.boxes) {
            let colorMod = 8;
            if (colorFlag){
                ctx.fillStyle = SQUARE_FILLS[b % colorMod];
            } else {
                ctx.fillStyle = "white";
            }
            if(this.boxes[b].x <= width && this.boxes[b].y <= height ){
            ctx.fillRect(
                (this.boxes[b].x - BOX_OFFSET)*scale + BOX_OFFSET,
                (this.boxes[b].y - BOX_OFFSET)*scale + BOX_OFFSET,
                this.boxes[b].size*scale,
                this.boxes[b].size*scale);
            }
        }
    }

    generate() {
        let boxArray = new Boxes();
        // for (let b in this.boxes) {
        //     boxArray.boxes.push(this.boxes[b].generate());
        // }
        let newSize = this.boxes[0].size/3;
        for (let b in this.boxes) {
            for(let i=-1; i<2; i++) {
                for(let j=-1; j<2; j++) {
                    if (!(i === 0 && j=== 0) && fractal === "carpet"){
                        boxArray.newBox(
                        this.boxes[b].x+newSize*(i+1), 
                        this.boxes[b].y+newSize*(j+1),
                        newSize
                        );
                    } else if ((i === 0 || j === 0) && fractal === "cross"){
                        boxArray.newBox(
                            this.boxes[b].x+newSize*(i+1), 
                            this.boxes[b].y+newSize*(j+1),
                            newSize
                            );
                    }
                }
            }
        }
        return boxArray;
    }
  }

function drawCanvas(boxes) {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,width,height);

    boxes.draw(windowScale);
}

function init() {
    let firstBox = new Box(BOX_OFFSET,BOX_OFFSET,200);
    myBoxes.boxes = [firstBox];
    windowScale = 1.0;
    drawCanvas(myBoxes);
    fractal = "carpet";
    i=0;
}

const BOX_OFFSET = 50;
const MAX_ITERATIONS = 6;
const SQUARE_FILLS = [
    "white",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
];
let colorFlag = false;
let fractal = "cross";
let windowScale = 1;
let i=0;
let myBoxes = new Boxes();
let newBoxes = new Boxes();

init();

//Fractal Iteration
canvas.addEventListener("click", () => {
    if(i<MAX_ITERATIONS){
        newBoxes = myBoxes.generate();
        drawCanvas(newBoxes);
        myBoxes = newBoxes;
        i++;
    }
    console.log('Iterations: ' + i)
});

//Handling key presses
//  ArrowUp/Down = zoom in/out
//  WASD = pan camera
//  c = toggles colors
//  r = resets fractal
//  f = toggles fractal calculation
addEventListener("keydown", e => {
    if(e.key === "ArrowUp") {
        windowScale += 0.2;
        drawCanvas(myBoxes);
    } else if (e.key === "ArrowDown" && windowScale > 1) {
        windowScale -= 0.2;
        drawCanvas(myBoxes);
    } else if (e.key === "c") {
        colorFlag = !colorFlag;
        drawCanvas(myBoxes);
    } else if (e.key === "r") {
        // delete myBoxes;
        init();
    } else if (e.key === "f") {
        if (fractal === "carpet"){
            fractal = "cross";
        } else if (fractal === "cross") {
            fractal = "carpet";
        }
        drawCanvas(myBoxes);
    } else if (e.key === "w") {
        for (let b in myBoxes.boxes) {
            myBoxes.boxes[b].y += 20/windowScale;
        }
        drawCanvas(myBoxes);
    }
    else if (e.key === "a") {
        for (let b in myBoxes.boxes) {
            myBoxes.boxes[b].x += 20/windowScale;
        }
        drawCanvas(myBoxes);
    }
    else if (e.key === "s") {
        for (let b in myBoxes.boxes) {
            myBoxes.boxes[b].y -= 20/windowScale;
        }
        drawCanvas(myBoxes);
    }
    else if (e.key === "d") {
        for (let b in myBoxes.boxes) {
            myBoxes.boxes[b].x -= 20/windowScale;
        }
        drawCanvas(myBoxes);
    }
});
