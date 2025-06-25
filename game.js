const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game dimensions
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 20;
const PADDLE_SPEED = 6;

// Ball settings
const BALL_SIZE = 16;
const BALL_SPEED = 6;

// Game objects
const player = {
  x: PADDLE_MARGIN,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  score: 0,
};

const ai = {
  x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  score: 0,
  speed: 5,
};

const ball = {
  x: WIDTH / 2 - BALL_SIZE / 2,
  y: HEIGHT / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  speedX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  speedY: BALL_SPEED * (Math.random() * 2 - 1),
};

// Mouse control for player paddle
canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = mouseY - player.height / 2;
  // Clamp within bounds
  player.y = Math.max(0, Math.min(HEIGHT - player.height, player.y));
});

// Reset ball to center
function resetBall() {
  ball.x = WIDTH / 2 - BALL_SIZE / 2;
  ball.y = HEIGHT / 2 - BALL_SIZE / 2;
  ball.speedX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ball.speedY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Draw paddles, ball, scores
function draw() {
  // Clear
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw net
  ctx.fillStyle = "#444";
  for (let i = 0; i < HEIGHT; i += 24) {
    ctx.fillRect(WIDTH / 2 - 2, i, 4, 16);
  }

  // Draw paddles
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

  // Draw ball
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);

  // Draw scores
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText(player.score, WIDTH / 2 - 60, 50);
  ctx.fillText(ai.score, WIDTH / 2 + 60, 50);
}

// Collision detection between ball and paddle
function collide(paddle) {
  return (
    ball.x < paddle.x + paddle.width &&
    ball.x + ball.size > paddle.x &&
    ball.y < paddle.y + paddle.height &&
    ball.y + ball.size > paddle.y
  );
}

// Update game logic
function update() {
  // Move ball
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Ball collision with top/bottom
  if (ball.y <= 0) {
    ball.y = 0;
    ball.speedY *= -1;
  }
  if (ball.y + ball.size >= HEIGHT) {
    ball.y = HEIGHT - ball.size;
    ball.speedY *= -1;
  }

  // Ball collision with player paddle
  if (collide(player)) {
    ball.x = player.x + player.width;
    ball.speedX *= -1;
    // Add some "spin" based on where the ball hits the paddle
    let collidePoint = ball.y + ball.size / 2 - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);
    ball.speedY = BALL_SPEED * collidePoint;
  }

  // Ball collision with AI paddle
  if (collide(ai)) {
    ball.x = ai.x - ball.size;
    ball.speedX *= -1;
    let collidePoint = ball.y + ball.size / 2 - (ai.y + ai.height / 2);
    collidePoint = collidePoint / (ai.height / 2);
    ball.speedY = BALL_SPEED * collidePoint;
  }

  // Ball out of bounds (left or right)
  if (ball.x < 0) {
    ai.score++;
    resetBall();
  }
  if (ball.x + ball.size > WIDTH) {
    player.score++;
    resetBall();
  }

  // Basic AI movement (follow ball with a bit of delay)
  let target = ball.y + ball.size / 2 - ai.height / 2;
  if (ai.y < target) {
    ai.y += ai.speed;
    if (ai.y > target) ai.y = target;
  } else if (ai.y > target) {
    ai.y -= ai.speed;
    if (ai.y < target) ai.y = target;
  }
  // Clamp
  ai.y = Math.max(0, Math.min(HEIGHT - ai.height, ai.y));
}

// Main game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start game
loop();
