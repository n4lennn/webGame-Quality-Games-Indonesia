import { initInput }     from './utils/input.js';
import { MenuScene }     from './scenes/menu.js';
import { GameScene }     from './scenes/game.js';
import { GameOverScene } from './scenes/gameover.js';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = 600;
  canvas.height = 800;
  const scale = Math.min(window.innerWidth / 600, window.innerHeight / 800);
  canvas.style.width  = (600 * scale) + 'px';
  canvas.style.height = (800 * scale) + 'px';
}
resize();
window.addEventListener('resize', resize);

const menu     = new MenuScene(canvas);
const game     = new GameScene(canvas);
const gameover = new GameOverScene(canvas);

let state       = 'MENU';
let lastVehicle = 'bajaj';

menu.onStart = (vehicleType) => {
  lastVehicle = vehicleType;
  game.start(vehicleType);
  state = 'PLAYING';
};

game.onGameOver = (score, vehicleType) => {
  lastVehicle = vehicleType;
  gameover.show(score, vehicleType);
  state = 'GAMEOVER';
};

gameover.onRestart = () => {
  game.start(lastVehicle);
  state = 'PLAYING';
};

gameover.onMenu = () => {
  menu.show(); // aktifkan kembali menu listener
  state = 'MENU';
};

initInput();

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (state) {
    case 'MENU':
      menu.draw();
      break;
    case 'PLAYING':
      game.update();
      game.draw();
      break;
    case 'GAMEOVER':
      game.draw();
      gameover.draw();
      break;
  }
  requestAnimationFrame(loop);
}

loop();