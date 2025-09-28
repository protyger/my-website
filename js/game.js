const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Load images (if available)
const imgPlayer = new Image();
imgPlayer.src = 'assets/player.png';
const imgBoat = new Image();
imgBoat.src = 'assets/boat.png';
const imgNpc = new Image();
imgNpc.src = 'assets/npc.png';
const imgBullet = new Image();
imgBullet.src = 'assets/bullet.png';

class Entity {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  drawRect(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
  drawImage(img) {
    // if image loaded (has width), draw, else fallback
    if (img && img.width) {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else {
      this.drawRect('magenta');
    }
  }
}

class Player extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.speed = 2;
    this.onBoat = false;
  }
  update() {
    let sp = this.speed;
    if (this.onBoat) sp *= 1.5;

    if (keys['w'] || keys['ArrowUp']) this.y -= sp;
    if (keys['s'] || keys['ArrowDown']) this.y += sp;
    if (keys['a'] || keys['ArrowLeft']) this.x -= sp;
    if (keys['d'] || keys['ArrowRight']) this.x += sp;

    // Keep inside canvas
    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.h, this.y));
  }

  draw() {
    this.drawImage(imgPlayer);
  }
}

class Boat extends Entity {
  constructor(x, y) {
    super(x, y, 64, 48);
  }
  update() {
    // you can add move logic later
  }
  draw() {
    this.drawImage(imgBoat);
  }
}

class NPC extends Entity {
  constructor(x, y) {
    super(x, y, 28, 28);
  }
  update() {
    // simple behavior: move downwards slowly
    this.y += 0.5;
    if (this.y > canvas.height) {
      this.y = -this.h;
    }
  }
  draw() {
    this.drawImage(imgNpc);
  }
}

class Bullet extends Entity {
  constructor(x, y, dx, dy) {
    super(x, y, 8, 8);
    this.dx = dx;
    this.dy = dy;
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;
  }
  draw() {
    this.drawImage(imgBullet);
  }
}

const player = new Player(50, 50);
const boat = new Boat(300, 300);

const npcs = [];
for (let i = 0; i < 5; i++) {
  const npc = new NPC(50 + i * 100, 20);
  npcs.push(npc);
}

const bullets = [];

function checkBoarding() {
  if (player.x + player.w > boat.x &&
      player.x < boat.x + boat.w &&
      player.y + player.h > boat.y &&
      player.y < boat.y + boat.h) {
    player.onBoat = true;
  } else {
    player.onBoat = false;
  }
}

function shoot() {
  // shoots upward
  const bx = player.x + player.w / 2 - 4;
  const by = player.y;
  const b = new Bullet(bx, by, 0, -5);
  bullets.push(b);
}

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    shoot();
  }
});

function update() {
  player.update();
  boat.update();
  npcs.forEach(n => n.update());
  bullets.forEach(b => b.update());
  checkBoarding();

  // collision: bullet hits NPC
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    for (let j = npcs.length - 1; j >= 0; j--) {
      const n = npcs[j];
      if (b.x < n.x + n.w && b.x + b.w > n.x &&
          b.y < n.y + n.h && b.y + b.h > n.y) {
        // collision!
        bullets.splice(i, 1);
        npcs.splice(j, 1);
        break;
      }
    }
  }

  // remove off-screen bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  boat.draw();
  player.draw();
  npcs.forEach(n => n.draw());
  bullets.forEach(b => b.draw());
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
