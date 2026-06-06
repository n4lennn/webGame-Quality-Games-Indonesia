import { isLeft, isRight, isUp, isDown, isTurbo } from '../utils/input.js';
import { roundRect } from '../engine/renderer.js';

// Vehicle definitions — each has unique physics feel
export const VEHICLES = {
  bajaj: {
    label: 'Bajaj',
    desc: 'Lincah & ringan',
    color: '#f5c518',
    bodyColor: '#d4a800',
    width: 28,
    height: 44,
    maxSpeed: 7,
    acceleration: 0.35,
    braking: 0.5,
    friction: 0.92,   // High friction = snappy stop
    turnSpeed: 3.5,
    turboMultiplier: 1.6,
    turboCap: 100,
    turboRegen: 0.4,
    turboDrain: 1.2,
    stats: { speed: 3, handling: 5, turbo: 3 }
  },
  angkot: {
    label: 'Angkot',
    desc: 'Kuat tapi berat',
    color: '#e74c3c',
    bodyColor: '#c0392b',
    width: 36,
    height: 56,
    maxSpeed: 5.5,
    acceleration: 0.25,
    braking: 0.35,
    friction: 0.88,   // Low friction = slides more
    turnSpeed: 2.5,
    turboMultiplier: 1.5,
    turboCap: 80,
    turboRegen: 0.3,
    turboDrain: 1.5,
    stats: { speed: 2, handling: 2, turbo: 2 }
  },
  becak: {
    label: 'Becak Motor',
    desc: 'Gesit & turbo kuat',
    color: '#2ecc71',
    bodyColor: '#27ae60',
    width: 24,
    height: 40,
    maxSpeed: 6.5,
    acceleration: 0.3,
    braking: 0.45,
    friction: 0.95,   // Very responsive
    turnSpeed: 4,
    turboMultiplier: 1.9,
    turboCap: 120,
    turboRegen: 0.5,
    turboDrain: 1.0,
    stats: { speed: 4, handling: 4, turbo: 5 }
  }
};

export class Vehicle {
  constructor(type, startX, startY) {
    const cfg = VEHICLES[type];
    Object.assign(this, cfg);
    this.type = type;

    this.x = startX - cfg.width / 2;
    this.y = startY - cfg.height / 2;
    this.vx = 0;
    this.vy = -2;              // Start moving forward slightly
    this.angle = 0;            // Rotation in degrees for visual tilt
    this.turbo = cfg.turboCap; // Current turbo fuel
    this.isTurboActive = false;
    this.hp = 3;               // Lives/health
    this.invincible = 0;       // Invincibility frames after hit
    this.distance = 0;         // Total distance traveled (score)
    this.shake = 0;            // Screen shake timer after hit
  }

  get hitbox() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  get centerX() { return this.x + this.width / 2; }
  get centerY() { return this.y + this.height / 2; }

  update(roadLeft, roadRight) {
    const turboActive = isTurbo() && this.turbo > 0;
    this.isTurboActive = turboActive;

    const speedMult = turboActive ? this.turboMultiplier : 1;
    const maxSpd = this.maxSpeed * speedMult;

    // Always move forward (upward on screen)
    this.vy -= this.acceleration * speedMult;
    if (this.vy < -maxSpd) this.vy = -maxSpd;

    // Brake / slow down
    if (isDown()) this.vy += this.braking;
    if (this.vy > 0) this.vy = 0;

    // Steer left / right
    if (isLeft())  this.vx -= this.turnSpeed * 0.1;
    if (isRight()) this.vx += this.turnSpeed * 0.1;

    // Apply friction to horizontal movement
    this.vx *= this.friction;

    // Visual tilt
    if (isLeft())       this.angle = Math.max(this.angle - 3, -18);
    else if (isRight()) this.angle = Math.min(this.angle + 3, 18);
    else                this.angle *= 0.8;

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Keep on road
    if (this.x < roadLeft)              { this.x = roadLeft;         this.vx *= -0.4; }
    if (this.x + this.width > roadRight){ this.x = roadRight - this.width; this.vx *= -0.4; }

    // Turbo drain / regen
    if (turboActive) {
      this.turbo = Math.max(0, this.turbo - this.turboDrain);
    } else {
      this.turbo = Math.min(this.turboCap, this.turbo + this.turboRegen);
    }

    // Invincibility countdown
    if (this.invincible > 0) this.invincible--;
    if (this.shake > 0) this.shake--;

    // Score: distance traveled
    this.distance += Math.abs(this.vy);
  }

  takeDamage() {
    if (this.invincible > 0) return false;
    this.hp--;
    this.invincible = 90; // ~1.5 seconds at 60fps
    this.shake = 20;
    this.vy *= 0.3;
    return true;
  }

  draw(ctx) {
    const cx = this.centerX;
    const cy = this.centerY;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((this.angle * Math.PI) / 180);

    // Blink when invincible
    if (this.invincible > 0 && Math.floor(this.invincible / 6) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Turbo exhaust glow
    if (this.isTurboActive) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 18;
    }

    this._drawShape(ctx);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _drawShape(ctx) {
    const w = this.width;
    const h = this.height;
    const hw = w / 2;
    const hh = h / 2;

    if (this.type === 'bajaj') {
      // Body — rounded box
      roundRect(ctx, -hw, -hh, w, h, 6, this.bodyColor, null);
      // Roof dome
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, -hh + 10, hw - 4, 10, 0, Math.PI, 0);
      ctx.fill();
      // Windows
      ctx.fillStyle = 'rgba(180,230,255,0.5)';
      ctx.fillRect(-hw + 4, -hh + 4, w - 8, 10);
      // Front stripe
      ctx.fillStyle = this.color;
      ctx.fillRect(-hw, -hh + 18, w, 4);
      // Wheels
      ctx.fillStyle = '#222';
      ctx.fillRect(-hw - 3, -hh + 6,  6, 10); // FL
      ctx.fillRect( hw - 3, -hh + 6,  6, 10); // FR
      ctx.fillRect(-hw - 3,  hh - 16, 6, 10); // RL
      ctx.fillRect( hw - 3,  hh - 16, 6, 10); // RR
      // Exhaust (turbo active)
      if (this.isTurboActive) {
        ctx.fillStyle = '#ff6b00';
        ctx.fillRect(-4, hh, 8, 10);
      }

    } else if (this.type === 'angkot') {
      // Big boxy body
      roundRect(ctx, -hw, -hh, w, h, 4, this.bodyColor, null);
      // Stripe
      ctx.fillStyle = this.color;
      ctx.fillRect(-hw, -hh + h * 0.35, w, h * 0.12);
      // Windshield
      ctx.fillStyle = 'rgba(180,230,255,0.5)';
      ctx.fillRect(-hw + 4, -hh + 4, w - 8, 14);
      // Rear glass
      ctx.fillRect(-hw + 4, hh - 18, w - 8, 10);
      // Wheels (bigger)
      ctx.fillStyle = '#222';
      ctx.fillRect(-hw - 4, -hh + 8,  7, 13);
      ctx.fillRect( hw - 3, -hh + 8,  7, 13);
      ctx.fillRect(-hw - 4,  hh - 21, 7, 13);
      ctx.fillRect( hw - 3,  hh - 21, 7, 13);
      if (this.isTurboActive) {
        ctx.fillStyle = '#ff6b00';
        ctx.fillRect(-6, hh, 12, 12);
      }

    } else {
      // Becak motor — narrower, three-wheel feel
      roundRect(ctx, -hw, -hh, w, h, 5, this.bodyColor, null);
      // Hood
      ctx.fillStyle = this.color;
      roundRect(ctx, -hw + 2, -hh, w - 4, h * 0.4, 5, this.color, null);
      // Windshield
      ctx.fillStyle = 'rgba(180,230,255,0.5)';
      ctx.fillRect(-hw + 4, -hh + 4, w - 8, 8);
      // Single rear wheel (center)
      ctx.fillStyle = '#222';
      ctx.fillRect(-hw - 3, -hh + 5,  6, 9);
      ctx.fillRect( hw - 3, -hh + 5,  6, 9);
      ctx.fillRect(-4,       hh - 12, 8, 12); // Single center rear
      if (this.isTurboActive) {
        ctx.fillStyle = '#ff6b00';
        ctx.fillRect(-3, hh, 6, 9);
      }
    }
  }
}