import { Vehicle } from "../entities/vehicle.js";
import { ObstacleManager } from "../entities/obstacle.js";
import { Camera } from "../engine/camera.js";
import { drawTrack } from "../engine/renderer.js";
import { roundRect } from "../engine/renderer.js";

const TRACK_WIDTH = 480;
const ROAD_LEFT = 300 - TRACK_WIDTH / 2;
const ROAD_RIGHT = ROAD_LEFT + TRACK_WIDTH;

export class GameScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.vehicle = null;
    this.obstacles = null;
    this.camera = null;
    this.score = 0;
    this.bonusScore = 0;
    this.difficulty = 0;
    this.diffTimer = 0;
    this.active = false;
    this.onGameOver = null;
  }

  start(vehicleType) {
    const startX = 300;
    const startY = 600;
    this.vehicle = new Vehicle(vehicleType, startX, startY);
    this.obstacles = new ObstacleManager(ROAD_LEFT, TRACK_WIDTH, TRACK_WIDTH);
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.camera.x = startX - this.canvas.width / 2;
    this.camera.y = startY - this.canvas.height / 2;
    this.score = 0;
    this.bonusScore = 0;
    this.difficulty = 0;
    this.diffTimer = 0;
    this.active = true;
  }

  update() {
    if (!this.active) return;

    const v = this.vehicle;

    this.diffTimer++;
    if (this.diffTimer >= 300) {
      this.diffTimer = 0;
      this.difficulty = Math.min(this.difficulty + 1, 10);
    }

    v.update(ROAD_LEFT, ROAD_RIGHT);
    this.camera.follow(v);
    this.obstacles.update(this.camera.y, this.difficulty);

    const hit = this.obstacles.checkHit(v);
    if (hit) {
      if (hit.isBonus) {
        // Bonus: isi turbo penuh seketika
        v.turbo = v.turboCap;
        this.bonusScore += 30; // tetap kasih poin juga
      } else if (hit.isOil) {
        // Oleng tidak terkendali selama ~2 detik (120 frame)
        v.skid = 60;
        v.shake = 45;
        // Reset vx supaya sin wave mulai dari 0
        v.vx = 0;
      } else {
        v.takeDamage();
        if (v.hp <= 0) {
          this.active = false;
          const total = Math.floor(v.distance / 10) + this.bonusScore;
          if (this.onGameOver) this.onGameOver(total, v.type);
        }
      }
    }

    this.score = Math.floor(v.distance / 10) + this.bonusScore;
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const v = this.vehicle;

    if (v.shake > 0) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    }

    ctx.fillStyle = "#0d1f0d";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#1a1a0a";
    ctx.fillRect(0, 0, ROAD_LEFT - this.camera.x, H);
    ctx.fillRect(ROAD_RIGHT - this.camera.x, 0, W, H);

    this.camera.begin(ctx);
    drawTrack(ctx, this.camera, TRACK_WIDTH, 10000);
    this.obstacles.draw(ctx, this.camera);
    v.draw(ctx);
    this.camera.end(ctx);

    if (v.shake > 0) ctx.restore();

    this._drawHUD(ctx, W);
  }

  _drawHUD(ctx, W) {
    const v = this.vehicle;

    roundRect(ctx, W / 2 - 80, 14, 160, 38, 8, "rgba(0,0,0,0.5)", null);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`${this.score} m`, W / 2, 38);

    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < v.hp ? "#e74c3c" : "rgba(255,255,255,0.15)";
      ctx.font = "20px serif";
      ctx.fillText("♥", 20 + i * 28, 36);
    }

    const barW = 140;
    const barX = W - barW - 16;
    const barY = 16;
    const fillW = (v.turbo / v.turboCap) * barW;

    roundRect(
      ctx,
      barX - 4,
      barY - 4,
      barW + 8,
      28,
      6,
      "rgba(0,0,0,0.5)",
      null,
    );
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(barX, barY + 4, barW, 12);

    const turboPct = v.turbo / v.turboCap;
    ctx.fillStyle = v.isTurboActive
      ? "#ff6b00"
      : turboPct > 0.5
        ? "#f5c518"
        : "#e74c3c";
    ctx.fillRect(barX, barY + 4, fillW, 12);

    ctx.fillStyle = v.isTurboActive ? "#ff6b00" : "rgba(255,255,255,0.5)";
    ctx.font = "10px Courier New";
    ctx.textAlign = "left";
    ctx.fillText("TURBO", barX, barY + 3);

    if (this.difficulty > 0) {
      roundRect(ctx, W / 2 - 40, 58, 80, 20, 4, "rgba(231,76,60,0.15)", null);
      ctx.fillStyle = "#e74c3c";
      ctx.font = "10px Courier New";
      ctx.textAlign = "center";
      ctx.fillText(`LVL ${this.difficulty}`, W / 2, 72);
    }
  }
}
