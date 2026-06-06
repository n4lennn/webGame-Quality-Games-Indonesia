export const keys = {};
export const touch = { left: false, right: false, turbo: false };

export function initInput() {
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    // Prevent arrow keys from scrolling the page
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  // Touch controls
  const btnLeft  = document.getElementById('touch-left');
  const btnRight = document.getElementById('touch-right');
  const btnTurbo = document.getElementById('touch-turbo');

  const hold = (el, prop) => {
    el.addEventListener('touchstart', e => { e.preventDefault(); touch[prop] = true; }, { passive: false });
    el.addEventListener('touchend',   () => { touch[prop] = false; });
    el.addEventListener('touchcancel',() => { touch[prop] = false; });
  };

  hold(btnLeft,  'left');
  hold(btnRight, 'right');
  hold(btnTurbo, 'turbo');
}

export function isLeft()  { return keys['ArrowLeft']  || keys['a'] || keys['A'] || touch.left;  }
export function isRight() { return keys['ArrowRight'] || keys['d'] || keys['D'] || touch.right; }
export function isUp()    { return keys['ArrowUp']    || keys['w'] || keys['W']; }
export function isDown()  { return keys['ArrowDown']  || keys['s'] || keys['S']; }
export function isTurbo() { return keys[' '] || touch.turbo; }