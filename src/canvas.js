export const COLS = 30;
export const ROWS = 30;
export const GAP_SIZE = 1;
export const CELL_SIZE = 10;
export const CANVAS_WIDTH = COLS * (CELL_SIZE + GAP_SIZE);
export const CANVAS_HEIGHT = ROWS * (CELL_SIZE + GAP_SIZE);

export function createCanvasElement() {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  return canvas;
}

export function renderScene(ctx, scene) {
  renderBackground(ctx);
  renderApples(ctx, scene.apples);
  renderSnake(ctx, scene.snake);
}

export function renderApples(ctx, apples) {
  apples.forEach(apple => paintCell(ctx, apple, '#76302a'));
}

export function renderSnake(ctx, snake) {
  snake.forEach((segment, index) => paintCell(ctx, wrapBounds(segment), 'black'));
}

export function getRandomPosition(snake = []) {
  let position = {
    x: getRandomNumber(0, COLS - 1),
    y: getRandomNumber(0, ROWS - 1)
  };

  if (isEmptyCell(position, snake)) {
    return position;
  }

  return getRandomPosition(snake);
}

export function checkCollision(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isEmptyCell(position, snake) {
  return !snake.some(segment => checkCollision(segment, position));
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function renderBackground(ctx) {
  ctx.fillStyle = '#7d8b6d';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function renderBackgroundEnd(ctx) {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function wrapBounds(point) {
  point.x = point.x >= COLS ? 0 : point.x < 0 ? COLS - 1 : point.x;
  point.y = point.y >= ROWS ? 0 : point.y < 0 ? ROWS - 1 : point.y;

  return point;
}

function paintCell(ctx, point, color) {
  const x = point.x * CELL_SIZE + (point.x * GAP_SIZE);
  const y = point.y * CELL_SIZE + (point.y * GAP_SIZE);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
  ctx.fillStyle = "#859073";
  ctx.fillRect(x + 2, y + 2, 6, 6);
  ctx.fillStyle = color;
  ctx.fillRect(x + 3.5, y + 3.5, 3, 3);
}


