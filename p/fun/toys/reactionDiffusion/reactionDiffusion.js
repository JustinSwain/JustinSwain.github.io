let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = 200;
canvas.height = 200;

let R_A = 0;
let R_B = 0;
let FEED = 0;
let KILL = 0;
let old = [];
let next = [];

let list = document.getElementById("initialConfig");
function listQ(){
    init();
    drawFrame();
}
list.onchange = listQ;

let param = document.getElementById("paramConfig");
function paramQ(){
    paramInit();
}
param.onchange = paramQ;

let colorConfig = document.getElementById("colorConfig");

init();
paramInit();

function paramInit() {
    if (param.value === "Default" || param.value === "") {
        //Default
        R_A = 1.0;
        R_B = 0.5;
        FEED = 0.055;
        KILL = 0.062;
        } else if (param.value === "Bacteria") {    
        //coefficients from https://rajeshrinet.github.io/blog/2016/gray-scott/
        //Bacteria
        R_A = 1.4;
        R_B = 0.6;
        FEED = 0.035;
        KILL = 0.065;
        } else if (param.value === "Coral") {
        //Coral
        R_A = 0.12;
        R_B = 0.08;
        FEED = 0.02;
        KILL = 0.05;
        } else if (param.value === "Spirals") {
        // Sprials
        R_A = 0.8;
        R_B = 0.4;
        FEED = 0.060;
        KILL = 0.062;
        } else if (param.value === "Zebrafish") {
        //Zebrafish
        R_A = 0.16;
        R_B = 0.08;
        FEED = 0.035;
        KILL = 0.06;
        }
}


function init() {
    for (let x = 0; x < canvas.width; x++) {
        old[x] = [];
        next[x] = [];
        for (let y = 0; y < canvas.height; y++) {
          old[x][y] = {
            a: 1,
            b: 0.05*Math.random(1),
          };
        }
    }

    if (list.value === "Square" || list.value === "") {
        for(let x=80; x<120; x++) {
            for(let y=80; y<120; y++) {
                old[x][y].b = 1.0;
            }
        }
    } else if (list.value === "X") {
        for (let x=0; x< canvas.height; x++) {
            old[x][x].b = 1.0;
            old[x][199 - x].b = 1.0
        }
    } else if (list.value === "Smile") {
        for(let x=80; x<90; x++) {
        for(let y=80; y<90; y++) {
            old[x][y].b = 1.0;
            old[200 - x][y].b = 1.0;
            old[x - 20][y + 30].b = 1.0;
            old[200 - x + 20][y + 30].b = 1.0;
            }
        }
        for(let x=60; x<141; x++) {
            for(let y=120; y<130; y++) {
                old[x][y].b = 1.0;
            }
        }
    } else if (list.value === "Random") {
        for(let x=0; x<canvas.width; x++) {
            for(let y=0; y<canvas.height; y++) {
                old[x][y].b = 0.2 + 0.02*Math.random(1);
            }
        }
    }
    next = old;
}

function clamp(a, min = 0, max = 1) {
    return Math.min(max, Math.max(min, a));
} 
function invlerp(x, y, a) {
    return clamp((a - x) / (y - x));
}

function update() {
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          let a = old[x][y].a;
          let b = old[x][y].b;
          let aa;
          let bb;
           aa= a +
            (R_A * laplaceA(x, y)) -
            (a * b * b) +
            (FEED * (1 - a));
           bb= b +
            (R_B * laplaceB(x, y)) +
            (a * b * b) -
            ((KILL + FEED) * b);
            
            next[x][y].a = clamp(aa, 0, 1);
            next[x][y].b = clamp(bb, 0, 1);
        }
      }
}

function laplaceA(x,y) {
    let xm = ((x - 1 % 200) + 200) % 200;
    let ym = ((y - 1 % 200) + 200) % 200;
    let xp = ((x + 1 % 200) + 200) % 200;
    let yp = ((y + 1 % 200) + 200) % 200;
    return (-1*old[x][y].a
         + 0.2*old[xm][y].a
         + 0.2*old[xp][y].a
         + 0.2*old[x][ym].a
         + 0.2*old[x][yp].a
         + 0.05*old[xm][ym].a
         + 0.05*old[xm][yp].a
         + 0.05*old[xp][ym].a
         + 0.05*old[xp][yp].a
    );
}
function laplaceB(x,y) {
    let xm = ((x - 1 % 200) + 200) % 200;
    let ym = ((y - 1 % 200) + 200) % 200;
    let xp = ((x + 1 % 200) + 200) % 200;
    let yp = ((y + 1 % 200) + 200) % 200;
    return (-1*old[x][y].b
         + 0.2*old[xm][y].b
         + 0.2*old[xp][y].b
         + 0.2*old[x][ym].b
         + 0.2*old[x][yp].b
         + 0.05*old[xm][ym].b
         + 0.05*old[xm][yp].b
         + 0.05*old[xp][ym].b
         + 0.05*old[xp][yp].b
    );
}

function drawFrame() {
    for (let x = 0; x < canvas.width ; x++) {
        for (let y = 0; y < canvas.height ; y++) {
            let a = old[x][y].a;
            let b = old[x][y].b;
            let diff = clamp(a-b);
            let color = [];
            // let color = getColorGS(diff);
            if (colorConfig.value === "Rainbow" || colorConfig.value === "") {
                color = getColorRainbow(diff);
            } else if (colorConfig.value === "Grayscale") {
                color = getColorGS(diff);
            }
            ctx.fillStyle = `rgba(
                ${color[0]}, 
                ${color[1]}, 
                ${color[2]}, 
                1)`;
            ctx.beginPath();
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

//colormap credits - start 
function getColorRainbow(val) {
    let m = 4;
    let num = clamp(Math.floor(val*m),0,3);

    let s = (val - num/m) * m;
    let r = 0;
    let g = 0;
    let b = 0;

    switch (num) {
        case 0: r=0; g=s; b=1; break;
        case 1: r=0; g=1; b=1-s; break;
        case 2: r=s; g=1; b=0; break;
        case 3: r=1; g=1-s; b-0; break;
    }

    return [255*r, 255*g, 255*b, 1];
}

function getColorGS(val) {
    let grayScale = (invlerp(0,1,val));
    grayScale = grayScale;
    return [255*grayScale, 255*grayScale, 255*grayScale, 1];
}
//colormap credits - end
//https://blog.habrador.com/2023/04/colormaps-overview-code-implementations-rainbow-virids.html

function loop() {
    ctx.reset();
    
    for (let i=0; i<15; i++ ){
        update();
        old = next;
    }
    
    drawFrame();
    
    if (!pause) {
        window.requestAnimationFrame(loop);
    } else if (pause) {
        ctx.fillStyle = "aliceblue";
        ctx.font = "24px monospace";
        ctx.fillText("Pause",12,188);
    }
}

drawFrame();

let pause = true;
canvas.addEventListener("click", e => {
    if(pause === false) {
        pause = true;
    } else if (pause === true) {
        pause = false;
        window.requestAnimationFrame(loop);
    }
    console.log(pause);
});