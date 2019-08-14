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
let curseProb = 0.5;
let shakeEffectFrames = 7;
let curseEffectFrames = 100;
let curseSpeed = 2;
let bloodEffectFrames = 100;
let bloodInitSpeed = 10;
let maxBulletFrames = 200;
let gravity = 3;
let shakeAmp = 5;
let shakeBaseFreq= 0.08;
let bulletSpeed = 10;
let bulletLength = 15;
let bulletWidth = 5;
let gunEffectFrames = 10;

// rendering
let bossPos = [250, 200];
let gunThetaOffset = 0.095;
let cursePos = [bossPos[0] - 80, bossPos[1] - 50];
let gunPos = [100, 500];

let initGameState = function() {
  return {
    frame: 0,
    curses: [],
    bloods: [],
    bullets: [],
    shakes: [],
    events: []
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

  gameState.shakes = gameState.shakes.filter(function(shake) {
    return gameState.frame - shake.startFrame < shakeEffectFrames;
  });

  gameState.bullets = gameState.bullets.filter(function(bullet) {
    return !(
      bullet.hit && gameState.frame - bullet.startFrame < maxBulletFrames
    );
  });

  gameState.events = gameState.events.filter(event => {
    if (event[0] <= gameState.frame) {
      // event happens
      event[1](gameState.frame);
      return false;
    } else {
      return true;
    }
  });
};

let circleHitTest = (pos, center, radius) => {
  let dx = center[0] - pos[0];
  let dy = center[1] - pos[1];
  return dx * dx + dy * dy < radius * radius;
};

let squareHitTest = (pos, center, halfSideLength) => {
  let lower = [center[0] - halfSideLength, center[1] - halfSideLength];
  let upper = [center[0] + halfSideLength, center[1] + halfSideLength];
  return (
    pos[0] >= lower[0] &&
    pos[1] >= lower[1] &&
    pos[0] < upper[0] &&
    pos[1] < upper[1]
  );
};

let fire = pos => {
  if (render.loaded) {
    let bullet = {
      pos: gunPos,
      target: pos,
      startFrame: gameState.frame,
      direction: Math.atan((pos[1] - gunPos[1]) / (pos[0] - gunPos[0])),
      distance: Math.hypot(pos[0] - gunPos[0], pos[1] - gunPos[1])
    };

    gameState.bullets.push(bullet);

    if (
      // head
      circleHitTest(pos, [bossPos[0], bossPos[1] - 40], 110) ||
      squareHitTest(pos, [bossPos[0], bossPos[1] + 120], 70)
    ) {
      let hitFrame = gameState.frame + Math.ceil(bullet.distance / bulletSpeed);

      gameState.events.push([
        hitFrame,
        frame => {
          gameState.shakes.push({
            startFrame: frame
          });

          gameState.bloods.push({
            pos: pos,
            startFrame: frame,
            direction: Math.random() * 2 * Math.PI
          });

          bullet.hit = true;

          if (Math.random() < curseProb) {
            if (circleHitTest(pos, [bossPos[0], bossPos[1] + 185], 10)) {
              gameState.curses.push({
                content: ["？？", "啊！"][Math.floor(Math.random() * 2)],
                startFrame: frame
              });
            } else {
              gameState.curses.push({
                content: curses[Math.floor(Math.random() * curses.length)],
                startFrame: frame
              });
            }
          }
        }
      ]);
    }
  }
};

let getCanvasPos = function(cvs, e) {
  let bound = cvs.getBoundingClientRect();
  let x = e.clientX - bound.left * (cvs.width / bound.width);
  let y = e.clientY - bound.top * (cvs.height / bound.height);

  return [x, y];
};

let render = function() {
  if (!render.loaded) return;

  const draw = render.draw;
  const ctx = render.ctx;
  const frame = gameState.frame;

  render.clear();

  // draw boss
  if (gameState.shakes.length === 0) {
    draw("idle", bossPos);
  } else {
    gameState.shakes.forEach(shake => {
      let deltaShakeFrame = frame - shake.startFrame;
      let dx =
        shakeAmp *
        Math.sin(
          deltaShakeFrame *
            2 *
            Math.PI *
            shakeBaseFreq *
            gameState.bloods.length
        );
      let dy =
        shakeAmp *
        Math.cos(
          deltaShakeFrame *
            2 *
            Math.PI *
            shakeBaseFreq *
            gameState.bloods.length
        );
      draw("hit", [bossPos[0] + dx, bossPos[1] + dy]);
    });
  }

  // draw gun and crosshair
  let lastBullet = gameState.bullets[gameState.bullets.length - 1];
  if (lastBullet && frame - lastBullet.startFrame < gunEffectFrames) {
    draw("crosshair", lastBullet.target);
    draw(
      "gun",
      gunPos,
      Math.atan(
        (lastBullet.target[1] - gunPos[1]) / (lastBullet.target[0] - gunPos[0])
      ) + gunThetaOffset
    );
  } else {
    draw("gun", gunPos, gunThetaOffset);
  }

  // draw bullet
  gameState.bullets.forEach(function(bullet) {
    let deltaBulletFrame = frame - bullet.startFrame;

    let cosD = Math.cos(bullet.direction);
    let sinD = Math.sin(bullet.direction);

    let x0 =
      bullet.pos[0] + (bulletSpeed * deltaBulletFrame - bulletLength) * cosD;
    let y0 =
      bullet.pos[1] + (bulletSpeed * deltaBulletFrame - bulletLength) * sinD;

    let x1 = bullet.pos[0] + bulletSpeed * deltaBulletFrame * cosD;
    let y1 = bullet.pos[1] + bulletSpeed * deltaBulletFrame * sinD;

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
    let x = blood.pos[0] + bloodInitSpeed * Math.cos(dir) * deltaBloodFrame;
    let y =
      blood.pos[1] +
      bloodInitSpeed * Math.sin(dir) * deltaBloodFrame +
      0.5 * gravity * deltaBloodFrame * deltaBloodFrame;
    draw("blood", [x, y]);
  });

  // draw curses
  gameState.curses.forEach(function(curses) {
    let deltaCurseFrame = frame - curses.startFrame;
    if (deltaCurseFrame > 0) {
      ctx.fillStyle =
        "rgba(255, 20, 20, " + (1 - deltaCurseFrame / curseEffectFrames) + ")";
      ctx.fillText(
        curses.content,
        cursePos[0],
        cursePos[1] - deltaCurseFrame * curseSpeed
      );
    }
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

  render.draw = function(atlas, pos, theta) {
    let [x, y] = pos;
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
    fire(pos);
  });

  document.addEventListener("touchdown", function(e) {
    e.preventDefault();
    let pos = getCanvasPos(cvs, e);
    fire(pos);
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
