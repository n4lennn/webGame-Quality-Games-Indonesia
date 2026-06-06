import { initInput }    from './utils/input.js';
import { MenuScene }    from './scenes/menu.js';
import { GameScene }    from './scenes/game.js';
import { GameOverScene } from './scenes/gameover.js';

// ── Canvas setup ──────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function resize() {
  const size = Math.min(window.innerWidth, window.innerHeight, 600);
  canvas.width  = 600;
  canvas.height = 600;
  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';
}
resize();
window.addEventListener('resize', resize);

// ── Scene instances ───────────────────────────────────────────
const menu     = new MenuScene(canvas);
const game     = new GameScene(canvas);
const gameover = new GameOverScene(canvas);

// ── State machine ─────────────────────────────────────────────
// States: 'MENU' | 'PLAYING' | 'GAMEOVER'
let state = 'MENU';

menu.onStart = (vehicleType) => {
  game.start(vehicleType);
  state = 'PLAYING';
};

game.onGameOver = (score, vehicleType) => {
  gameover.show(score, vehicleType);
  state = 'GAMEOVER';
};

gameover.onRestart = () => {
  // Re-use last selected vehicle
  const lastVehicle = game.vehicle?.type || 'bajaj';
  game.start(lastVehicle);
  state = 'PLAYING';
};

gameover.onMenu = () => {
  state = 'MENU';
};

// ── Input ─────────────────────────────────────────────────────
initInput();

// ── Game loop ─────────────────────────────────────────────────
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
      // Keep game world visible behind gameover overlay
      game.draw();
      gameover.draw();
      break;
  }

  requestAnimationFrame(loop);
}

loop();