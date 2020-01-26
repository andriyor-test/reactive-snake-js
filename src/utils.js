import { checkCollision, getRandomPosition } from './canvas';
import { SNAKE_LENGTH, APPLE_COUNT } from './constants';

export function isGameOver(scene) {
  const snake = scene.snake;
  const head = snake[0];
  const body = snake.slice(1, snake.length);
  return body.some(segment => checkCollision(segment, head));
}

export function nextDirection(previous, next) {
  // check opposite direction
  if (next.x === previous.x * -1 || next.y === previous.y * -1) {
    return previous;
  }
  return next;
}

export function move(snake, [direction, snakeLength]) {
  let nx = snake[0].x;
  let ny = snake[0].y;
  nx += 1 * direction.x;
  ny += 1 * direction.y;
  let tail;
  
  if (snakeLength > snake.length) {
    tail = { x: nx, y: ny };
  } else {
    tail = snake.pop();
    tail.x = nx;
    tail.y = ny;
  }
  snake.unshift(tail);
  return snake;
}

export function eat(apples, snake) {
  const head = snake[0];
  for (let i = 0; i < apples.length; i++) {
    if (checkCollision(apples[i], head)) {
      apples.splice(i, 1);
      return [...apples, getRandomPosition(snake)];
    }
  }
  return apples;
}

export function generateSnake() {
  const snake = [];
  for (let i = SNAKE_LENGTH - 1; i >= 0; i--) {
    snake.push({ x: i, y: 0 });
  }
  return snake;
}

export function generateApples(count) {
  const apples = [];
  for (let i = 0; i < count; i++) {
    apples.push(getRandomPosition());
  }
  return apples;
}
