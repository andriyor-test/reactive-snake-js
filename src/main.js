import { BehaviorSubject, animationFrameScheduler,  interval,  fromEvent,  combineLatest,  of } from 'rxjs';
import {
  map,
  filter,
  scan,
  startWith,
  distinctUntilChanged,
  share,
  withLatestFrom,
  tap,
  skip,
  switchMap,
  takeWhile,
  first
} from 'rxjs/operators';

import { DIRECTIONS, SPEED, SNAKE_LENGTH, FPS, APPLE_COUNT, POINTS_PER_APPLE } from './constants';

import {
  createCanvasElement,
  renderScene,
  renderGameOver,
} from './canvas';

import {
  isGameOver,
  nextDirection,
  move,
  eat,
  generateSnake,
  generateApples
} from './utils';

let canvas = createCanvasElement();
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
const INITIAL_DIRECTION = DIRECTIONS.ArrowRight;

let ticks$ = interval(SPEED);

let click$ = fromEvent(document, 'click');
let keydown$ = fromEvent(document, 'keydown');
const scoreFiled = document.getElementById('score');

function createGame(fps$) {

  let direction$ = keydown$.pipe(
    map(event => DIRECTIONS[event.code]),
    filter(direction => !!direction),
    startWith(INITIAL_DIRECTION),
    scan(nextDirection),
    distinctUntilChanged()
  );

  let length$ = new BehaviorSubject(SNAKE_LENGTH);

  let snakeLength$ = length$.pipe(
    scan((step, snakeLength) => snakeLength + step),
    share()
  );
  
  let score$ = snakeLength$.pipe(
    startWith(0),
    scan((score, _) => score + POINTS_PER_APPLE),
    tap(score => scoreFiled.innerText = `Score: ${score}`)
  );
  
  let snake$ = ticks$.pipe(
    withLatestFrom(direction$, snakeLength$, (_, direction, snakeLength) => [direction, snakeLength]),
    scan(move, generateSnake()),
    share()
  );

  let apples$ = snake$.pipe(
    scan(eat, generateApples()),
    distinctUntilChanged(),
    share()
  );

  let appleEaten$ = apples$.pipe(
    skip(1),
    tap(() => length$.next(POINTS_PER_APPLE))
  ).subscribe();

  let scene$ = combineLatest(snake$, apples$, score$, (snake, apples, score) => ({ snake, apples, score }));

  return fps$.pipe(withLatestFrom(scene$, (_, scene) => scene));
}

let game$ = of('Start Game').pipe(
  map(() => interval(1000 / FPS, animationFrameScheduler)),
  switchMap(createGame),
  takeWhile(scene => !isGameOver(scene))
);

const startGame = () => game$.subscribe({
  next: (scene) => renderScene(ctx, scene),
  complete: () => {
    renderGameOver(ctx);

    click$.pipe(first()).subscribe(startGame);
  }
});

startGame();
