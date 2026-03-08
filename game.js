const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");

const state = {
  running: true,
  score: 0,
  best: Number(localStorage.getItem("arcade-best") || 0),
  leftPressed: false,
  rightPressed: false,
  player: {
    x: canvas.width / 2 - 24,
    y: canvas.height - 60,
    width: 48,
    height: 28,
    speed: 340,
  },
  obstacles: [],
  spawnTimer: 0,
  spawnInterval: 0.7,
};

bestEl.textContent = state.best;

function resetGame() {
  state.running = true;
  state.score = 0;
  state.spawnTimer = 0;
  state.spawnInterval = 0.7;
  state.obstacles = [];
  state.player.x = canvas.width / 2 - state.player.width / 2;
  scoreEl.textContent = "0";
}

function spawnObstacle() {
  const width = 30 + Math.random() * 70;
  const speed = 160 + Math.random() * 180 + state.score * 0.8;
  state.obstacles.push({
    x: Math.random() * (canvas.width - width),
    y: -30,
    width,
    height: 20,
    speed,
  });
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update(delta) {
  if (!state.running) return;

  if (state.leftPressed) {
    state.player.x -= state.player.speed * delta;
  }
  if (state.rightPressed) {
    state.player.x += state.player.speed * delta;
  }

  state.player.x = Math.max(0, Math.min(canvas.width - state.player.width, state.player.x));

  state.spawnTimer += delta;
  if (state.spawnTimer >= state.spawnInterval) {
    spawnObstacle();
    state.spawnTimer = 0;
    state.spawnInterval = Math.max(0.22, 0.7 - state.score / 180);
  }

  state.obstacles.forEach((obs) => {
    obs.y += obs.speed * delta;
  });

  state.obstacles = state.obstacles.filter((obs) => obs.y < canvas.height + 40);

  const hit = state.obstacles.some((obs) => intersects(state.player, obs));
  if (hit) {
    state.running = false;
    state.best = Math.max(state.best, Math.floor(state.score));
    localStorage.setItem("arcade-best", String(state.best));
    bestEl.textContent = state.best;
    return;
  }

  state.score += delta * 10;
  scoreEl.textContent = Math.floor(state.score);
}

function drawPlayer() {
  const p = state.player;
  ctx.fillStyle = "#7efcff";
  ctx.fillRect(p.x, p.y, p.width, p.height);
  ctx.fillStyle = "#101425";
  ctx.fillRect(p.x + 7, p.y + 7, p.width - 14, 8);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  drawPlayer();

  state.obstacles.forEach((obs) => {
    ctx.fillStyle = "#ff6b8a";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });

  if (!state.running) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = "20px sans-serif";
    ctx.fillText("다시 시작 버튼을 눌러 재도전하세요", canvas.width / 2, canvas.height / 2 + 30);
  }
}

let lastTime = performance.now();
function gameLoop(now) {
  const delta = Math.min((now - lastTime) / 1000, 0.035);
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") state.leftPressed = true;
  if (event.key === "ArrowRight") state.rightPressed = true;
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") state.leftPressed = false;
  if (event.key === "ArrowRight") state.rightPressed = false;
});

restartBtn.addEventListener("click", resetGame);
resetGame();
requestAnimationFrame(gameLoop);
