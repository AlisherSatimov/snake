const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const initialSpeed = 140;

let snake;
let direction;
let nextDirection;
let food;
let score;
let gameLoop;
let speed;
let isRunning = false;
let isPaused = false;

const bestScoreKey = "snake-best-score";
const savedBest = Number(localStorage.getItem(bestScoreKey)) || 0;
bestScoreEl.textContent = savedBest;

function randomCell() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };
}

function placeFood() {
  let nextFood = randomCell();

  while (snake.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y)) {
    nextFood = randomCell();
  }

  food = nextFood;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speed = initialSpeed;
  isPaused = false;
  scoreEl.textContent = score;
  placeFood();
  draw();
}

function startGame() {
  clearInterval(gameLoop);
  resetGame();
  isRunning = true;
  messageEl.textContent = "O'yin boshlandi";
  gameLoop = setInterval(update, speed);
}

function updateBestScore() {
  const currentBest = Number(localStorage.getItem(bestScoreKey)) || 0;

  if (score > currentBest) {
    localStorage.setItem(bestScoreKey, String(score));
    bestScoreEl.textContent = score;
  }
}

function endGame() {
  clearInterval(gameLoop);
  isRunning = false;
  updateBestScore();
  messageEl.textContent = "Yutqazdingiz. Qayta boshlang.";
}

function restartLoop() {
  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

function update() {
  if (isPaused) {
    return;
  }

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitsWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount;

  const hitsSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitsWall || hitsSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    placeFood();

    if (speed > 70) {
      speed -= 6;
      restartLoop();
    }
  } else {
    snake.pop();
  }

  draw();
}

function drawCell(x, y, color, radius = 6) {
  const padding = 2;
  const px = x * gridSize + padding;
  const py = y * gridSize + padding;
  const size = gridSize - padding * 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(px, py, size, size, radius);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCell(food.x, food.y, "#d62828", 10);

  snake.forEach((segment, index) => {
    const color = index === 0 ? "#1f6b2f" : "#2b8a3e";
    drawCell(segment.x, segment.y, color, 6);
  });
}

function canTurn(newDirection) {
  return (
    direction.x + newDirection.x !== 0 ||
    direction.y + newDirection.y !== 0
  );
}

document.addEventListener("keydown", (event) => {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  if (event.code === "Space" && isRunning) {
    isPaused = !isPaused;
    messageEl.textContent = isPaused ? "Pauza" : "Davom etmoqda";
    return;
  }

  const newDirection = keyMap[event.key];

  if (!newDirection || !isRunning) {
    return;
  }

  if (canTurn(newDirection)) {
    nextDirection = newDirection;
    messageEl.textContent = "";
  }
});

startBtn.addEventListener("click", startGame);

resetGame();
