let initHp = 10;
let width = 800;
let height = 600;
let curses = ["啊", "疼", "我想回家", "好疼", "呜呜"];
let beatEffectFrames = 7;
let curseEffectFrames = 100;
let curseSpeed = 2;
let bloodEffectFrames = 100;
let bloodInitSpeed = 10;
let gravity = 3;
let vibrationAmp = 5;
let vibrationBaseFreq = 0.08;

// rendering

let bossPos = [250, 200];
let gunThetaOffset = 0.1;
let cursePos = [bossPos[0] - 100, bossPos[1] - 50];

let initGameState = function() {
  return {
    frame: 0,
    hp: initHp,
    beats: 0,
    curses: [],
    bloods: [],
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
};

let beat = function(x, y) {
  // head
  let x1 = bossPos[0] - x;
  let y1 = bossPos[1] - 40 - y;
  let r1 = 6400;

  // body
  let x2 = bossPos[0] - x;
  let y2 = bossPos[1] + 70 - y;
  let r2 = 3000;

  // crucial
  let x3 = bossPos[0] - x;
  let y3 = bossPos[1] + 120 - y;
  let r3 = 100;

  if (render.loaded) {
    if (x3 * x3 + y3 * y3 < r3) {
      // hidden state
      gameState.beats += 1;
      gameState.beatFrame = gameState.frame;
      gameState.bloods.push({
        x: x,
        y: y,
        startFrame: gameState.frame,
        direction: Math.random() * 2 * Math.PI
      });
      gameState.curses.push({
        content: ["我！", "啊！"][Math.floor(Math.random() * 2)],
        startFrame: gameState.frame
      });
    } else if (x1 * x1 + y1 * y1 < r1 || x2 * x2 + y2 * y2 < r2) {
      gameState.beats += 1;
      gameState.beatFrame = gameState.frame;
      gameState.bloods.push({
        x: x,
        y: y,
        startFrame: gameState.frame,
        direction: Math.random() * 2 * Math.PI
      });
      gameState.curses.push({
        content: curses[Math.floor(Math.random() * curses.length)],
        startFrame: gameState.frame
      });
    }
  }
};

let getCanvasPos = function(cvs, e) {
  let bound = cvs.getBoundingClientRect();

  let x = e.clientX - bound.left * (cvs.width / bound.width);
  let y = e.clientY - bound.top * (cvs.height / bound.height);

  console.log(x, y);

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
  // draw all things here

  // draw renzha
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
      75,
      height - 100,
      Math.atan((lastBlood.y - height + 100) / (lastBlood.x - 75)) +
        gunThetaOffset
    );
  } else {
    draw("idle", bossPos[0], bossPos[1]);
    draw("gun", 75, height - 100, gunThetaOffset);
  }

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
      "rgba(255, 0, 0, " + (1 - deltaCurseFrame / curseEffectFrames) + ")";
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

  ctx.font = "35px Arial bold";

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
