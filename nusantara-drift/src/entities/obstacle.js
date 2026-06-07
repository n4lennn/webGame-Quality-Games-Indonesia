import { roundRect } from "../engine/renderer.js";
import { checkCollision } from "../engine/physics.js";

const LANE_COUNT = 3;

const OBSTACLE_TYPES = [
  { label: "Lubang", color: "#111", w: 40, h: 36, points: 0, isHole: true },
  { label: "Cone", color: "#ff4444", w: 28, h: 28, points: 0, isCone: true },
  {
    label: "MinyakTumpah",
    color: "#222",
    w: 54,
    h: 34,
    points: 0,
    isOil: true,
  },
  { label: "BatuBesar", color: "#666", w: 34, h: 34, points: 0, isRock: true },
  { label: "Bonus", color: "#00e5ff", w: 24, h: 24, points: 0, isBonus: true },
  {
    label: "Kucing",
    color: "#c8a96e",
    w: 26,
    h: 22,
    points: 0,
    isCritter: true,
  },
  {
    label: "Zigzag",
    color: "#f39c12",
    w: 24,
    h: 24,
    points: 0,
    isZigzag: true,
  },
  {
    label: "Gerobak",
    color: "#8B4513",
    w: 32,
    h: 44,
    points: 0,
    isMovingVehicle: true,
    vehicleSpeed: 1.2,
  },
  {
    label: "Angkot",
    color: "#e74c3c",
    w: 38,
    h: 58,
    points: 0,
    isMovingVehicle: true,
    vehicleSpeed: 1.8,
  },
];

export class ObstacleManager {
  constructor(roadLeft, roadWidth, trackWidth) {
    this.obstacles = [];
    this.roadLeft = roadLeft;
    this.roadWidth = roadWidth;
    this.trackWidth = trackWidth;
    this.spawnTimer = 0;
    this.spawnInterval = 80;
    this.minInterval = 28;
  }

  update(cameraY, difficulty) {
    this.spawnInterval = Math.max(this.minInterval, 80 - difficulty * 4);
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this._spawn(cameraY);
    }

    const roadRight = this.roadLeft + this.trackWidth;
    const laneW = this.trackWidth / LANE_COUNT;

    // Update posisi tiap obstacle
    for (const obs of this.obstacles) {
      if (obs.isMovingVehicle) {
        obs.y -= obs.vehicleSpeed; // maju ke atas searah pemain
      }
      if (obs.isCritter) {
        obs.x += Math.sin(obs.wobble) * 2.8;
        obs.wobble += 0.1;
      }
      if (obs.isZigzag) {
        obs.x += Math.sin(obs.wobble) * 4.5;
        obs.wobble += 0.07;
      }

      // Clamp semua obstacle agar tidak tembus batas jalan
      if (obs.x < this.roadLeft) obs.x = this.roadLeft;
      if (obs.x + obs.w > roadRight) obs.x = roadRight - obs.w;
    }

    // AI: kendaraan bergerak cek obstacle di depannya, pindah lajur kalau terhalang
    this._resolveVehicleAI(laneW, roadRight);

    // Hapus obstacle yang sudah jauh di belakang kamera
    this.obstacles = this.obstacles.filter((o) => o.y < cameraY + 900);
  }

  _resolveVehicleAI(laneW, roadRight) {
    // Ambil hanya kendaraan yang bergerak
    const movers = this.obstacles.filter((o) => o.isMovingVehicle);
    // Ambil semua obstacle lain (statis, critter, dll)
    const statics = this.obstacles.filter((o) => !o.isMovingVehicle);

    for (const mover of movers) {
      // Buat hitbox "lookahead" — area di depan kendaraan (lebih jauh ke atas)
      const lookahead = {
        x: mover.x,
        y: mover.y - mover.h - 10, // lihat 1 panjang badan ke depan
        w: mover.w,
        h: mover.h + 10,
      };

      // Cek apakah ada obstacle lain yang menghalangi di depan
      let blocked = false;
      for (const other of [...statics, ...movers]) {
        if (other === mover) continue;
        const otherBox = { x: other.x, y: other.y, w: other.w, h: other.h };
        if (checkCollision(lookahead, otherBox)) {
          blocked = true;
          break;
        }
      }

      if (!blocked) continue;

      // Cari lajur kosong untuk pindah
      const currentLane = this._getLane(mover, laneW);
      const candidates = [];
      for (let l = 0; l < LANE_COUNT; l++) {
        if (l === currentLane) continue;
        const targetX = this.roadLeft + l * laneW + (laneW - mover.w) / 2;
        const targetBox = {
          x: targetX,
          y: mover.y - mover.h - 10,
          w: mover.w,
          h: mover.h * 2,
        };
        let laneBlocked = false;
        for (const other of [...statics, ...movers]) {
          if (other === mover) continue;
          if (
            checkCollision(targetBox, {
              x: other.x,
              y: other.y,
              w: other.w,
              h: other.h,
            })
          ) {
            laneBlocked = true;
            break;
          }
        }
        if (!laneBlocked) candidates.push(l);
      }

      if (candidates.length === 0) {
        // Semua lajur penuh — rem (lambatkan sementara)
        mover.y += mover.vehicleSpeed * 0.8; // mundur sedikit / berhenti
      } else {
        // Pilih lajur terdekat
        const best = candidates.reduce((a, b) =>
          Math.abs(a - currentLane) < Math.abs(b - currentLane) ? a : b,
        );
        const targetX = this.roadLeft + best * laneW + (laneW - mover.w) / 2;

        // Geser smooth ke lajur target
        const diff = targetX - mover.x;
        mover.x += diff * 0.08; // lerp pelan supaya terlihat natural

        // Snap kalau sudah sangat dekat
        if (Math.abs(diff) < 1) mover.x = targetX;
      }
    }
  }

  // Hitung mover ada di lajur berapa berdasarkan posisi X tengahnya
  _getLane(obs, laneW) {
    const center = obs.x + obs.w / 2 - this.roadLeft;
    return Math.max(0, Math.min(LANE_COUNT - 1, Math.floor(center / laneW)));
  }

  _spawn(cameraY) {
    const type =
      OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const roadRight = this.roadLeft + this.trackWidth;
    const laneW = this.trackWidth / LANE_COUNT;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    let x = this.roadLeft + lane * laneW + (laneW - type.w) / 2;
    x = Math.max(this.roadLeft, Math.min(x, roadRight - type.w));

    // Kendaraan bergerak spawn lebih jauh ke depan
    const spawnY = type.isMovingVehicle ? cameraY - 350 : cameraY - 60;

    // Cegah spawn tepat di atas obstacle lain
    const newBox = { x, y: spawnY, w: type.w, h: type.h };
    const tooClose = this.obstacles.some((o) =>
      checkCollision(newBox, { x: o.x, y: o.y - 20, w: o.w, h: o.h + 40 }),
    );
    if (tooClose) return; // skip spawn frame ini

    this.obstacles.push({
      ...type,
      x,
      y: spawnY,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  checkHit(vehicle) {
    const hitbox = vehicle.hitbox;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const obsBox = { x: obs.x, y: obs.y, w: obs.w, h: obs.h };
      if (checkCollision(hitbox, obsBox)) {
        if (obs.isBonus) {
          this.obstacles.splice(i, 1);
          return { isBonus: true, points: obs.points };
        }
        if (obs.isOil) {
          this.obstacles.splice(i, 1);
          return { isOil: true };
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
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.ellipse(
        obs.x + obs.w / 2,
        obs.y + obs.h / 2,
        obs.w / 2,
        obs.h / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (obs.isCone) {
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w / 2, obs.y);
      ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
      ctx.lineTo(obs.x, obs.y + obs.h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(obs.x + 4, obs.y + obs.h * 0.35, obs.w - 8, 5);
    } else if (obs.isCritter) {
      // Kucing — lebih mirip kucing dengan telinga segitiga & ekor
      const x = obs.x,
        y = obs.y,
        w = obs.w,
        h = obs.h;

      // Badan (oval)
      ctx.fillStyle = "#c8a96e";
      ctx.beginPath();
      ctx.ellipse(
        x + w / 2,
        y + h * 0.62,
        w / 2 - 1,
        h * 0.38,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Kepala (lingkaran)
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.32, w * 0.36, 0, Math.PI * 2);
      ctx.fill();

      // Telinga kiri (segitiga)
      ctx.fillStyle = "#b8945a";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.18, y + h * 0.18);
      ctx.lineTo(x + w * 0.08, y);
      ctx.lineTo(x + w * 0.34, y + h * 0.12);
      ctx.closePath();
      ctx.fill();

      // Telinga kanan (segitiga)
      ctx.beginPath();
      ctx.moveTo(x + w * 0.82, y + h * 0.18);
      ctx.lineTo(x + w * 0.92, y);
      ctx.lineTo(x + w * 0.66, y + h * 0.12);
      ctx.closePath();
      ctx.fill();

      // Mata kiri
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(x + w * 0.36, y + h * 0.3, 2.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mata kanan
      ctx.beginPath();
      ctx.ellipse(x + w * 0.64, y + h * 0.3, 2.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Kilap mata
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x + w * 0.37, y + h * 0.28, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + w * 0.65, y + h * 0.28, 1, 0, Math.PI * 2);
      ctx.fill();

      // Hidung
      ctx.fillStyle = "#e8a0b0";
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.37, 2, 0, Math.PI * 2);
      ctx.fill();

      // Kumis kiri
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, y + h * 0.37);
      ctx.lineTo(x + w * 0.1, y + h * 0.33);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, y + h * 0.37);
      ctx.lineTo(x + w * 0.1, y + h * 0.4);
      ctx.stroke();

      // Kumis kanan
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, y + h * 0.37);
      ctx.lineTo(x + w * 0.9, y + h * 0.33);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, y + h * 0.37);
      ctx.lineTo(x + w * 0.9, y + h * 0.4);
      ctx.stroke();

      // Ekor (kurva ke kanan)
      ctx.strokeStyle = "#c8a96e";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.85, y + h * 0.75);
      ctx.quadraticCurveTo(x + w * 1.2, y + h * 0.6, x + w * 1.1, y + h * 0.35);
      ctx.stroke();
    } else if (obs.isBonus) {
      // Bonus turbo — ikon petir berwarna cyan
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#00e5ff";
      // Lingkaran luar
      ctx.beginPath();
      ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Ikon petir di tengah
      ctx.fillStyle = "#003344";
      ctx.beginPath();
      const cx = obs.x + obs.w / 2,
        cy = obs.y + obs.h / 2;
      ctx.moveTo(cx + 2, cy - 7);
      ctx.lineTo(cx - 3, cy);
      ctx.lineTo(cx + 1, cy);
      ctx.lineTo(cx - 2, cy + 7);
      ctx.lineTo(cx + 4, cy - 1);
      ctx.lineTo(cx, cy - 1);
      ctx.closePath();
      ctx.fill();
    } else if (obs.isOil) {
      // Minyak tumpah — oval pelangi mengkilap + animasi berputar
      const cx = obs.x + obs.w / 2,
        cy = obs.y + obs.h / 2;
      const t = Date.now() / 600;

      // Lapisan bawah gelap
      ctx.fillStyle = "rgba(5,5,15,0.85)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Efek pelangi berputar
      const rainbow = ctx.createLinearGradient(
        obs.x + (Math.cos(t) * obs.w) / 2,
        obs.y,
        obs.x + obs.w - (Math.cos(t) * obs.w) / 2,
        obs.y + obs.h,
      );
      rainbow.addColorStop(0, "rgba(255,0,128,0.5)");
      rainbow.addColorStop(0.25, "rgba(0,200,255,0.5)");
      rainbow.addColorStop(0.5, "rgba(128,255,0,0.5)");
      rainbow.addColorStop(0.75, "rgba(255,200,0,0.5)");
      rainbow.addColorStop(1, "rgba(255,0,128,0.5)");
      ctx.fillStyle = rainbow;
      ctx.beginPath();
      ctx.ellipse(cx, cy, obs.w / 2 - 2, obs.h / 2 - 2, t, 0, Math.PI * 2);
      ctx.fill();

      // Label LICIN dengan warna merah
      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 8px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("⚠ LICIN", cx, cy + 3);
    } else if (obs.isRock) {
      ctx.fillStyle = "#555";
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w * 0.5, obs.y);
      ctx.lineTo(obs.x + obs.w, obs.y + obs.h * 0.3);
      ctx.lineTo(obs.x + obs.w * 0.9, obs.y + obs.h);
      ctx.lineTo(obs.x + obs.w * 0.1, obs.y + obs.h);
      ctx.lineTo(obs.x, obs.y + obs.h * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.ellipse(
        obs.x + obs.w * 0.35,
        obs.y + obs.h * 0.3,
        obs.w * 0.18,
        obs.h * 0.12,
        -0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else if (obs.isZigzag) {
      ctx.fillStyle = "#f39c12";
      ctx.shadowColor = "#f39c12";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w / 2, obs.y);
      ctx.lineTo(obs.x + obs.w, obs.y + obs.h / 2);
      ctx.lineTo(obs.x + obs.w / 2, obs.y + obs.h);
      ctx.lineTo(obs.x, obs.y + obs.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("!", obs.x + obs.w / 2, obs.y + obs.h / 2 + 3);
    } else if (obs.isMovingVehicle) {
      // Angkot / Gerobak bergerak
      const isAngkot = obs.label === "Angkot";
      roundRect(
        ctx,
        obs.x,
        obs.y,
        obs.w,
        obs.h,
        4,
        isAngkot ? "#c0392b" : "#7a3b10",
        null,
      );
      ctx.fillStyle = isAngkot ? "#e74c3c" : "#8B4513";
      ctx.fillRect(obs.x, obs.y + obs.h * 0.35, obs.w, obs.h * 0.1);
      // Kaca depan (atas karena maju ke atas)
      ctx.fillStyle = "rgba(180,230,255,0.5)";
      ctx.fillRect(obs.x + 4, obs.y + 4, obs.w - 8, isAngkot ? 14 : 10);
      // Roda
      ctx.fillStyle = "#222";
      ctx.fillRect(obs.x - 4, obs.y + 8, 7, isAngkot ? 13 : 10);
      ctx.fillRect(obs.x + obs.w - 3, obs.y + 8, 7, isAngkot ? 13 : 10);
      ctx.fillRect(obs.x - 4, obs.y + obs.h - 18, 7, isAngkot ? 13 : 10);
      ctx.fillRect(
        obs.x + obs.w - 3,
        obs.y + obs.h - 18,
        7,
        isAngkot ? 13 : 10,
      );
      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 7px Courier New";
      ctx.textAlign = "center";
      ctx.fillText(
        obs.label.toUpperCase(),
        obs.x + obs.w / 2,
        obs.y + obs.h * 0.6,
      );
    } else {
      // Gerobak statis fallback
      roundRect(ctx, obs.x, obs.y, obs.w, obs.h, 3, obs.color, "#5a2d0c");
      ctx.fillStyle = "#5a2d0c";
      ctx.fillRect(obs.x + 4, obs.y + 6, obs.w - 8, 4);
      ctx.fillRect(obs.x + 4, obs.y + obs.h - 10, obs.w - 8, 4);
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(obs.x + 6, obs.y + obs.h - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(obs.x + obs.w - 6, obs.y + obs.h - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawStar(ctx, cx, cy, r, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.45;
      ctx[i === 0 ? "moveTo" : "lineTo"](
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
      );
    }
    ctx.closePath();
    ctx.fill();
  }
}
