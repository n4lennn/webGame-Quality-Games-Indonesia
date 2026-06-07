import { VEHICLES } from '../entities/vehicle.js';
import { roundRect } from '../engine/renderer.js';
import { getBestScore } from '../utils/storage.js';

export class MenuScene {
  constructor(canvas) {
    this.canvas        = canvas;
    this.ctx           = canvas.getContext('2d');
    this.selectedIndex = 0;
    this.vehicleKeys   = Object.keys(VEHICLES);
    this.onStart       = null;
    this._active       = true; // mulai aktif karena game buka di menu

    // Simpan referensi agar bisa dikontrol lewat flag _active
    this._boundClick = (e) => {
      if (!this._active) return; // abaikan klik kalau bukan giliran menu
      this._handleClick(e);
    };
    this._boundTouch = (e) => {
      if (!this._active) return;
      e.preventDefault();
      const t = e.changedTouches[0];
      this._handleClick({ clientX: t.clientX, clientY: t.clientY });
    };
    this._boundKey = (e) => {
      if (!this._active) return; // abaikan key kalau bukan giliran menu
      if (e.key === 'ArrowLeft')  this.selectedIndex = (this.selectedIndex - 1 + 3) % 3;
      if (e.key === 'ArrowRight') this.selectedIndex = (this.selectedIndex + 1) % 3;
      if (e.key === 'Enter')      this._startGame();
    };

    this.canvas.addEventListener('click',    this._boundClick);
    this.canvas.addEventListener('touchend', this._boundTouch, { passive: false });
    window.addEventListener('keydown',       this._boundKey);
  }

  // Panggil ini saat masuk ke menu (dari gameover.onMenu)
  show() {
    this._active = true;
  }

  // Panggil ini saat keluar dari menu (sebelum mulai game)
  hide() {
    this._active = false;
  }

  _handleClick(e) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx     = (e.clientX - rect.left) * scaleX;
    const my     = (e.clientY - rect.top)  * scaleY;
    const W      = this.canvas.width;

    // Cek klik kartu kendaraan
    const cardW = 130, cardH = 160, cardY = 190;
    for (let i = 0; i < 3; i++) {
      const cx = W/2 - 210 + i * 150;
      if (mx >= cx && mx <= cx + cardW && my >= cardY && my <= cardY + cardH) {
        this.selectedIndex = i;
        return;
      }
    }

    // Cek klik tombol mulai
    const btnX = W/2 - 100, btnY = 400, btnW = 200, btnH = 52;
    if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
      this._startGame();
    }
  }

  _startGame() {
    this.hide(); // nonaktifkan dulu sebelum callback
    if (this.onStart) {
      this.onStart(this.vehicleKeys[this.selectedIndex]);
    }
  }

  draw() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#111';
    ctx.fillRect(W/2 - 200, 0, 400, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.setLineDash([40, 30]);
    ctx.lineWidth = 2;
    for (let x = W/2 - 67; x < W/2 + 68; x += 133) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle  = '#f5c518';
    ctx.shadowColor = '#f5c518';
    ctx.shadowBlur  = 14;
    ctx.font        = 'bold 40px Courier New';
    ctx.textAlign   = 'center';
    ctx.fillText('NUSANTARA', W/2, 70);
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = '#fff';
    ctx.font        = 'bold 22px Courier New';
    ctx.fillText('D R I F T', W/2, 100);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font      = '12px Courier New';
    ctx.fillText('Pilih kendaraan dan buktikan siapa yang paling ngebut!', W/2, 128);

    const best = getBestScore();
    if (best > 0) {
      ctx.fillStyle = 'rgba(245,197,24,0.6)';
      ctx.font      = '12px Courier New';
      ctx.fillText(`BEST: ${Math.floor(best)} m`, W/2, 156);
    }

    const cardW = 130, cardH = 160, cardY = 190;
    for (let i = 0; i < 3; i++) {
      const key = this.vehicleKeys[i];
      const v   = VEHICLES[key];
      const cx  = W/2 - 210 + i * 150;
      const sel = i === this.selectedIndex;

      roundRect(ctx, cx, cardY, cardW, cardH, 10,
        sel ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.04)',
        sel ? v.color                 : 'rgba(255,255,255,0.1)');

      if (sel) { ctx.shadowColor = v.color; ctx.shadowBlur = 12; }
      roundRect(ctx, cx + 35, cardY + 12, 60, 70, 6, v.bodyColor, null);
      ctx.shadowBlur = 0;

      ctx.fillStyle = sel ? v.color : '#aaa';
      ctx.font      = `${sel ? 'bold ' : ''}13px Courier New`;
      ctx.textAlign = 'center';
      ctx.fillText(v.label, cx + cardW/2, cardY + 100);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font      = '10px Courier New';
      ctx.fillText(v.desc, cx + cardW/2, cardY + 116);

      const stats = [
        { label: 'SPD', val: v.stats.speed },
        { label: 'HDL', val: v.stats.handling },
        { label: 'TRB', val: v.stats.turbo },
      ];
      stats.forEach((s, si) => {
        const barX = cx + 10;
        const barY = cardY + 126 + si * 12;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(barX, barY, 110, 6);
        ctx.fillStyle = sel ? v.color : '#666';
        ctx.fillRect(barX, barY, 110 * (s.val / 5), 6);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font      = '8px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(s.label, barX, barY - 1);
      });
    }
    ctx.textAlign = 'center';

    const btnX = W/2 - 100, btnY = 400;
    roundRect(ctx, btnX, btnY, 200, 52, 8, 'rgba(245,197,24,0.15)', '#f5c518');
    ctx.fillStyle     = '#f5c518';
    ctx.font          = 'bold 16px Courier New';
    ctx.letterSpacing = '3px';
    ctx.fillText('MULAI BALAPAN', W/2, btnY + 32);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '11px Courier New';
    ctx.fillText('← → pilih   Enter / klik mulai   Spasi turbo', W/2, H - 20);
  }
}