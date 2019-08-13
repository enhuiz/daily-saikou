let initHp = 10;
let width = 400;
let height = 550;
let curses = [
  "啊啊啊",
  "疼",
  "我想回家",
  "好疼",
  "呜呜呜",
  "我错了",
  "再也不敢了"
];
let curseProb = 0.3;
let beatEffectFrames = 7;
let curseEffectFrames = 100;
let curseSpeed = 2;
let bloodEffectFrames = 100;
let bloodInitSpeed = 10;
let gravity = 3;
let vibrationAmp = 5;
let vibrationBaseFreq = 0.08;
let bulletSpeed = 60;
let bulletLength = 30;
let bulletWidth = 10;

// rendering

let bossPos = [250, 200];
let gunThetaOffset = 0.095;
let cursePos = [bossPos[0] - 80, bossPos[1] - 50];
let gunPos = [100, 500];

let initGameState = function() {
  return {
    frame: 0,
    hp: initHp,
    beats: 0,
    curses: [],
    bloods: [],
    bullets: [],
    beatFrame: -beatEffectFrames
  };
};

let gameState;

let update = function() {
  gameState.frame += 1;

  gameState.curses = gameState.curses.filter(function(curses) {
    return gameState.frame - curses.startFrame < curseEffectFrames;
  });

  gameState.bloods = gameState.bloods.filter(function(blood) {
    return gameState.frame - blood.startFrame < bloodEffectFrames;
  });

  gameState.bullets = gameState.bullets.filter(function(bullet) {
    let deltaBulletFrame = gameState.frame - bullet.startFrame;
    let dir = bullet.direction;
    let x = bullet.x + bulletSpeed * Math.cos(dir) * deltaBulletFrame;
    let y = bullet.y + bulletSpeed * Math.sin(dir) * deltaBulletFrame;
    return x < bullet.end_x || y > bullet.end_y;
  });
};

let beat = function(x, y) {
  // head
  let x1 = bossPos[0] - x;
  let y1 = bossPos[1] - 64 - y;
  let r1 = 112;

  // body
  let x2 = bossPos[0] - x;
  let y2 = bossPos[1] + 98 - y;
  let r2 = 91;

  // crucial
  let x3 = bossPos[0] - x;
  let y3 = bossPos[1] + 180 - y;
  let r3 = 13;

  if (render.loaded) {
    if (
      x1 * x1 + y1 * y1 < r1 * r1 ||
      x2 * x2 + y2 * y2 < r2 * r2 ||
      x3 * x3 + y3 * y3 < r3 * r3
    ) {
      gameState.beats += 1;
      gameState.beatFrame = gameState.frame;
      gameState.bullets.push({
        x: gunPos[0],
        y: gunPos[1],
        end_x: x,
        end_y: y,
        startFrame: gameState.frame,
        direction: Math.atan((y - gunPos[1]) / (x - gunPos[0]))
      });
      gameState.bloods.push({
        x: x,
        y: y,
        startFrame: gameState.frame,
        direction: Math.random() * 2 * Math.PI
      });
      if (Math.random() < curseProb) {
        if (x3 * x3 + y3 * y3 < r3 * r3) {
          gameState.curses.push({
            content: ["？？", "啊！"][Math.floor(Math.random() * 2)],
            startFrame: gameState.frame
          });
        } else {
          gameState.curses.push({
            content: curses[Math.floor(Math.random() * curses.length)],
            startFrame: gameState.frame
          });
        }
      }
    }
  }
};

let getCanvasPos = function(cvs, e) {
  let bound = cvs.getBoundingClientRect();

  let x = e.clientX - bound.left * (cvs.width / bound.width);
  let y = e.clientY - bound.top * (cvs.height / bound.height);

  return {
    x: x,
    y: y
  };
};

let render = function() {
  if (!render.loaded) return;

  let draw = render.draw;
  let ctx = render.ctx;
  let frame = gameState.frame;

  render.clear();

  // draw boss
  let deltaBeatFrame = gameState.frame - gameState.beatFrame;
  if (deltaBeatFrame < beatEffectFrames) {
    let dx =
      vibrationAmp *
      Math.sin(
        deltaBeatFrame *
          2 *
          Math.PI *
          vibrationBaseFreq *
          gameState.bloods.length
      );
    let dy =
      vibrationAmp *
      Math.cos(
        deltaBeatFrame *
          2 *
          Math.PI *
          vibrationBaseFreq *
          gameState.bloods.length
      );

    draw("hit", bossPos[0] + dx, bossPos[1] + dy);

    // draw mark
    let lastBlood = gameState.bloods[gameState.bloods.length - 1];
    draw("mark", lastBlood.x, lastBlood.y);
    draw(
      "gun",
      gunPos[0],
      gunPos[1],
      Math.atan((lastBlood.y - gunPos[1]) / (lastBlood.x - gunPos[0])) +
        gunThetaOffset
    );
  } else {
    draw("idle", bossPos[0], bossPos[1]);
    draw("gun", gunPos[0], gunPos[1], gunThetaOffset);
  }

  // draw bullet
  gameState.bullets.forEach(function(bullet) {
    let deltaBulletFrame = frame - bullet.startFrame;
    let dir = bullet.direction;
    let x0 =
      bullet.x +
      (bulletSpeed * deltaBulletFrame + bulletLength) * Math.cos(dir);
    let y0 =
      bullet.y +
      (bulletSpeed * deltaBulletFrame + bulletLength) * Math.sin(dir);

    let x1 = bullet.x + bulletSpeed * Math.cos(dir) * deltaBulletFrame;
    let y1 = bullet.y + bulletSpeed * Math.sin(dir) * deltaBulletFrame;

    ctx.lineWidth = bulletWidth;
    ctx.strokeStyle = "#f0dd92";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  });

  // draw blood
  gameState.bloods.forEach(function(blood) {
    let deltaBloodFrame = frame - blood.startFrame;
    let dir = blood.direction;
    let x = blood.x + bloodInitSpeed * Math.cos(dir) * deltaBloodFrame;
    let y =
      blood.y +
      bloodInitSpeed * Math.sin(dir) * deltaBloodFrame +
      0.5 * gravity * deltaBloodFrame * deltaBloodFrame;
    draw("blood", x, y);
  });

  // draw curses
  gameState.curses.forEach(function(curses) {
    let deltaCurseFrame = frame - curses.startFrame;
    ctx.fillStyle =
      "rgba(255, 20, 20, " + (1 - deltaCurseFrame / curseEffectFrames) + ")";
    ctx.fillText(
      curses.content,
      cursePos[0],
      cursePos[1] - deltaCurseFrame * curseSpeed
    );
  });
};

let initRenderer = (cvsId, atlas) => {
  let cvs = document.getElementById(cvsId);
  let ctx = cvs.getContext("2d");

  cvs.width = width;
  cvs.height = height;

  render.cvs = cvs;
  render.ctx = ctx;

  ctx.font = "50px Arial bold";

  render.draw = function(atlas, x, y, theta) {
    let image = render.images[atlas];
    ctx.translate(x, y);
    ctx.rotate(theta);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.rotate(-theta);
    ctx.translate(-x, -y);
  };

  render.clear = function() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
  };

  render.loaded = false;
  render.images = {};

  Promise.all(
    Object.keys(atlas).map(key => {
      return new Promise((resolve, reject) => {
        let img = new Image();
        render.images[key] = img;
        img.addEventListener("load", function() {
          resolve();
        });
        img.src = atlas[key];
      });
    })
  ).then(() => {
    render.loaded = true;
  });
};

let initKeyboardEvents = () => {
  document.addEventListener("mousedown", function(e) {
    e.preventDefault();
    let pos = getCanvasPos(cvs, e);
    beat(pos.x, pos.y);
  });

  document.addEventListener("touchdown", function(e) {
    e.preventDefault();
    let pos = getCanvasPos(cvs, e);
    beat(pos.x, pos.y);
  });
};

let gameLoop = function() {
  update();
  render();
  window.requestAnimationFrame(gameLoop);
};

gameLoop.init = function(cvs, atlas) {
  gameState = initGameState();
  initRenderer(cvs, atlas);
  initKeyboardEvents();
};

gameLoop.start = function() {
  window.requestAnimationFrame(gameLoop);
};

export default gameLoop;
