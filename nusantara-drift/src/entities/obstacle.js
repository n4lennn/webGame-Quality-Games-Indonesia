import { roundRect } from '../engine/renderer.js';
import { checkCollision } from '../engine/physics.js';

const OBSTACLE_TYPES = [
  { label: 'Gerobak',  color: '#8B4513', w: 32, h: 44, points: 0 },
  { label: 'Lubang',   color: '#111',    w: 40, h: 36, points: 0, isHole: true },
  { label: 'Polisi',   color: '#ff4444', w: 28, h: 28, points: 0, isCone: true },
  { label: 'Kucing',   color: '#888',    w: 20, h: 20, points: 0, isCritter: true },
  { label: 'Bonus',    color: '#f5c518', w: 22, h: 22, points: 50, isBonus: true },
];

export class ObstacleManager {
  constructor(roadLeft, roadWidth, trackWidth) {
    this.obstacles = [];
    this.roadLeft   = roadLeft;
    this.roadWidth  = roadWidth;
    this.trackWidth = trackWidth;
    this.spawnTimer = 0;
    this.spawnInterval = 80;   // frames between spawns
    this.baseSpeed  = 3;
    this.currentSpeed = 3;
    this.minInterval = 28;
  }

  // Called every frame
  update(cameraY, difficulty) {
    // Increase speed and spawn rate with difficulty
    this.currentSpeed  = this.baseSpeed + difficulty * 0.5;
    this.spawnInterval = Math.max(this.minInterval, 80 - difficulty * 4);

    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this._spawn(cameraY);
    }

    // Move obstacles downward (toward player)
    for (const obs of this.obstacles) {
      obs.y += this.currentSpeed;
      if (obs.isCritter) {
        obs.x += Math.sin(obs.wobble) * 1.2;
        obs.wobble += 0.08;
      }
    }

    // Remove off-screen obstacles (below camera view)
    this.obstacles = this.obstacles.filter(o => o.y < cameraY + 800);
  }

  _spawn(cameraY) {
    const type  = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const lanes = [0, 1, 2];
    const lane  = lanes[Math.floor(Math.random() * lanes.length)];
    const laneW = this.trackWidth / 3;
    const x = this.roadLeft + lane * laneW + (laneW - type.w) / 2;

    this.obstacles.push({
      ...type,
      x,
      y: cameraY - 50,
      wobble: 0,
    });
  }

  // Check collision with vehicle, return hit obstacle or null
  checkHit(vehicle) {
    const hitbox = vehicle.hitbox;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const obsBox = { x: obs.x, y: obs.y, w: obs.w, h: obs.h };
      if (checkCollision(hitbox, obsBox)) {
        if (obs.isBonus) {
          // Collect bonus — remove it and return points
          this.obstacles.splice(i, 1);
          return { isBonus: true, points: obs.points };
        }
        return { isBonus: false, obs };
      }
    }
    return null;
  }

  draw(ctx, camera) {
    for (const obs of this.obstacles) {
      if (!camera.isVisible(obs.x, obs.y, obs.w, obs.h)) continue;
      this._drawObstacle(ctx, obs);
    }
  }

  _drawObstacle(ctx, obs) {
    ctx.save();

    if (obs.isHole) {
      // Pothole — dark oval with cracked edges
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.w/2, obs.y + obs.h/2, obs.w/2, obs.h/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (obs.isCone) {
      // Traffic cone
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w/2, obs.y);
      ctx.lineTo(obs.x + obs.w,   obs.y + obs.h);
      ctx.lineTo(obs.x,           obs.y + obs.h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(obs.x + 4, obs.y + obs.h * 0.35, obs.w - 8, 5);

    } else if (obs.isCritter) {
      // Cat / critter — simple pixel-art style
      ctx.fillStyle = '#999';
      roundRect(ctx, obs.x, obs.y, obs.w, obs.h, 4, '#888', null);
      ctx.fillStyle = '#555';
      ctx.fillRect(obs.x + 2, obs.y + 2, 6, 6);  // Eyes area
      ctx.fillRect(obs.x + obs.w - 8, obs.y + 2, 6, 6);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(obs.x + 4, obs.y + 8, obs.w - 8, obs.h - 12);

    } else if (obs.isBonus) {
      // Bonus coin — glowing star
      ctx.shadowColor = obs.color;
      ctx.shadowBlur  = 14;
      ctx.fillStyle   = obs.color;
      this._drawStar(ctx, obs.x + obs.w/2, obs.y + obs.h/2, obs.w/2 - 2, 5);
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = '#fff';
      ctx.font        = 'bold 8px Courier New';
      ctx.textAlign   = 'center';
      ctx.fillText('+50', obs.x + obs.w/2, obs.y + obs.h/2 + 3);

    } else {
      // Gerobak (cart)
      roundRect(ctx, obs.x, obs.y, obs.w, obs.h, 3, obs.color, '#5a2d0c');
      ctx.fillStyle = '#5a2d0c';
      ctx.fillRect(obs.x + 4, obs.y + 6, obs.w - 8, 4);
      ctx.fillRect(obs.x + 4, obs.y + obs.h - 10, obs.w - 8, 4);
      // Wheels
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(obs.x + 6,          obs.y + obs.h - 4, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(obs.x + obs.w - 6,  obs.y + obs.h - 4, 5, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();
  }

  _drawStar(ctx, cx, cy, r, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle  = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.45;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius
      );
    }
    ctx.closePath();
    ctx.fill();
  }
}