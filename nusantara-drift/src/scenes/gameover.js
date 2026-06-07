import { roundRect } from "../engine/renderer.js";
import { saveScore, getLeaderboard } from "../utils/storage.js";
import { keys } from "../utils/input.js";

export class GameOverScene {
  constructor(canvas) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext("2d");
    this.score     = 0;
    this.vehicle   = null;
    this.name      = "";
    this.saved     = false;
    this.board     = [];
    this.onRestart = null;
    this.onMenu    = null;

    // Simpan referensi agar bisa di-removeEventListener dengan benar
    this._boundKey   = (e) => this._handleKey(e);
    this._boundClick = (e) => this._handleClick(e);
    this._active     = false;
  }

  show(score, vehicleType) {
    this.score   = Math.floor(score);
    this.vehicle = vehicleType;
    this.name    = "";
    this.saved   = false;
    this._active = true;

    // Bersihkan semua key yang mungkin masih tertekan dari gameplay
    ['Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].forEach(k => {
      keys[k] = false;
    });

    // Selalu remove dulu baru add — tidak akan numpuk
    window.removeEventListener("keydown", this._boundKey);
    this.canvas.removeEventListener("click", this._boundClick);
    window.addEventListener("keydown", this._boundKey);
    this.canvas.addEventListener("click", this._boundClick);

    this.board = getLeaderboard();
  }

  _deactivate() {
    this._active = false;
    window.removeEventListener("keydown", this._boundKey);
    this.canvas.removeEventListener("click", this._boundClick);
  }

  _handleKey(e) {
    if (!this._active) return;

    // Enter HANYA untuk simpan nama — tidak untuk restart/menu sama sekali
    if (e.key === "Enter") {
      e.preventDefault();
      if (!this.saved && this.name.trim()) {
        this._save();
      }
      // Setelah saved: Enter tidak melakukan APAPUN
      // Pemain wajib klik tombol
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      this._deactivate();
      if (this.onMenu) this.onMenu();
      return;
    }

    // Ketik nama — hanya boleh sebelum saved
    if (!this.saved) {
      if (e.key === "Backspace") {
        this.name = this.name.slice(0, -1);
      } else if (e.key.length === 1 && this.name.length < 10) {
        this.name += e.key;
      }
    }
  }

  _handleClick(e) {
    if (!this._active) return;

    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx     = (e.clientX - rect.left) * scaleX;
    const my     = (e.clientY - rect.top)  * scaleY;
    const W      = this.canvas.width;

    if (!this.saved) {
      // Tombol SIMPAN
      if (mx > W/2 - 100 && mx < W/2 + 100 && my > 280 && my < 336) {
        this._save();
      }
    } else {
      // Tombol MAIN LAGI
      if (mx > W/2 - 220 && mx < W/2 - 20 && my > 462 && my < 510) {
        this._deactivate();
        if (this.onRestart) this.onRestart();
      }
      // Tombol MENU UTAMA
      if (mx > W/2 + 20 && mx < W/2 + 220 && my > 462 && my < 510) {
        this._deactivate();
        if (this.onMenu) this.onMenu();
      }
    }
  }

  _save() {
    if (!this.name.trim()) return;
    this.board = saveScore(this.name.trim(), this.score);
    this.saved = true;
  }

  draw() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    ctx.fillStyle = "rgba(0,0,0,0.92)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle  = "#e74c3c";
    ctx.shadowColor = "#e74c3c";
    ctx.shadowBlur  = 16;
    ctx.font        = "bold 38px Courier New";
    ctx.textAlign   = "center";
    ctx.fillText("GAME OVER", W/2, 70);
    ctx.shadowBlur  = 0;

    ctx.fillStyle = "#f5c518";
    ctx.font      = "bold 22px Courier New";
    ctx.fillText(`${this.score} METER`, W/2, 112);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font      = "12px Courier New";
    ctx.fillText(`Kendaraan: ${this.vehicle}`, W/2, 138);

    if (!this.saved) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font      = "13px Courier New";
      ctx.fillText("Masukkan nama kamu:", W/2, 210);

      roundRect(ctx, W/2 - 110, 222, 220, 42, 6,
        "rgba(255,255,255,0.06)", "rgba(255,255,255,0.3)");
      ctx.fillStyle = "#fff";
      ctx.font      = "bold 18px Courier New";
      ctx.fillText(
        (this.name || " ") + (Math.floor(Date.now() / 500) % 2 ? "|" : " "),
        W/2, 248
      );

      const canSave = this.name.trim().length > 0;
      roundRect(ctx, W/2 - 100, 280, 200, 48, 8,
        canSave ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.04)",
        canSave ? "#f5c518"               : "rgba(255,255,255,0.2)"
      );
      ctx.fillStyle = canSave ? "#f5c518" : "rgba(255,255,255,0.3)";
      ctx.font      = "bold 14px Courier New";
      ctx.fillText("SIMPAN SKOR", W/2, 310);

      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font      = "11px Courier New";
      ctx.fillText("ketik nama → Enter atau klik Simpan", W/2, 356);

    } else {
      ctx.fillStyle = "#f5c518";
      ctx.font      = "bold 14px Courier New";
      ctx.fillText("LEADERBOARD", W/2, 210);

      this.board.slice(0, 5).forEach((entry, i) => {
        const isMe = entry.name === this.name && entry.score === this.score;
        const y    = 232 + i * 38;
        if (isMe) roundRect(ctx, W/2 - 160, y - 14, 320, 30, 4, "rgba(245,197,24,0.12)", null);
        ctx.fillStyle = i === 0 ? "#f5c518" : isMe ? "#fff" : "rgba(255,255,255,0.55)";
        ctx.font      = `${isMe ? "bold " : ""}13px Courier New`;
        ctx.textAlign = "left";
        ctx.fillText(`${i + 1}. ${entry.name}`, W/2 - 150, y + 6);
        ctx.textAlign = "right";
        ctx.fillText(`${entry.score} m`, W/2 + 150, y + 6);
        ctx.textAlign = "center";
      });

      // Info — tidak ada keyboard shortcut untuk restart, harus klik
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font      = "11px Courier New";
      ctx.fillText("Klik tombol di bawah  |  Esc → Menu", W/2, 452);

      roundRect(ctx, W/2 - 220, 462, 200, 46, 8, "rgba(46,204,113,0.12)", "#2ecc71");
      ctx.fillStyle = "#2ecc71";
      ctx.font      = "bold 13px Courier New";
      ctx.fillText("▶ MAIN LAGI", W/2 - 120, 490);

      roundRect(ctx, W/2 + 20, 462, 200, 46, 8, "rgba(255,255,255,0.06)", "rgba(255,255,255,0.3)");
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("⌂ MENU UTAMA", W/2 + 120, 490);
    }
  }
}