import {BehaviorSubject, animationFrameScheduler, interval, fromEvent, combineLatest, of, timer} from 'rxjs';
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
} from 'rxjs/operators';

import { DIRECTIONS, SNAKE_LENGTH, FPS, POINTS_PER_APPLE } from './constants';

import {
  createCanvasElement,
  renderScene,
  renderBackgroundEnd,
} from './canvas';

import {
  isGameOver,
  nextDirection,
  move,
  eat,
  generateSnake,
  generateApples
} from './utils';

const canvas = createCanvasElement();
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
const INITIAL_DIRECTION = DIRECTIONS.ArrowRight;
const keydown$ = fromEvent(document, 'keydown');
const scoreFiled = document.getElementById('score');
const radioInput = document.getElementById('radio');
const input$ = fromEvent(radioInput, 'click');

function createGame(fps$) {
  const speed = new BehaviorSubject(200);
  input$.subscribe(e => {
    if (e.target.tagName === "INPUT") {
      speed.next(Number(e.target.value))
    }
  });
  
  const ticks$ = speed.pipe(
    switchMap(period => interval(period))
  );
  
  const direction$ = keydown$.pipe(
    map(event => DIRECTIONS[event.code]),
    filter(direction => !!direction),
    startWith(INITIAL_DIRECTION),
    scan(nextDirection),
    distinctUntilChanged()
  );

  const length$ = new BehaviorSubject(SNAKE_LENGTH);

  const snakeLength$ = length$.pipe(
    scan((step, snakeLength) => snakeLength + step),
    share()
  );
  
  const score$ = snakeLength$.pipe(
    startWith(0),
    scan((score, _) => score + POINTS_PER_APPLE),
    tap(score => scoreFiled.innerText = `Score: ${score}`)
  );
  
  const snake$ = ticks$.pipe(
    withLatestFrom(direction$, snakeLength$, (_, direction, snakeLength) => [direction, snakeLength]),
    scan(move, generateSnake()),
    share()
  );

  const apples$ = snake$.pipe(
    scan(eat, generateApples()),
    distinctUntilChanged(),
    share()
  );

  const appleEaten$ = apples$.pipe(
    skip(1),
    tap(() => length$.next(POINTS_PER_APPLE))
  ).subscribe();

  const scene$ = combineLatest(snake$, apples$, score$, (snake, apples, score) => ({ snake, apples, score }));

  return fps$.pipe(withLatestFrom(scene$, (_, scene) => scene));
}

const game$ = of('Start Game').pipe(
  map(() => interval(1000 / FPS, animationFrameScheduler)),
  switchMap(createGame),
  takeWhile(scene => !isGameOver(scene))
);

const startGame = () => game$.subscribe({
  next: (scene) => renderScene(ctx, scene),
  complete: () => {
    renderBackgroundEnd(ctx);
    radioInput.getElementsByClassName('medium')[0].checked = true;
    timer(500).subscribe(startGame);
  }
});

startGame();
