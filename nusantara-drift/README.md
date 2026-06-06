# 🛺 Nusantara Drift

Game endless runner berbasis Canvas — kendaraan khas Indonesia melaju di jalanan, hindari rintangan, raih skor setinggi mungkin!

## Cara Main

> ⚠️ **Game ini menggunakan ES Modules (`type="module"`), jadi tidak bisa dibuka langsung dengan double-click file HTML.**
> Harus dijalankan lewat local server.

### Cara Tercepat (pakai VS Code)
1. Install ekstensi **Live Server** di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
3. Browser otomatis terbuka dan game langsung bisa dimainkan

### Cara Lain (terminal)
```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```
Lalu buka `http://localhost:8000` di browser.

## Kontrol

| Platform | Kiri | Kanan | Turbo |
|----------|------|-------|-------|
| Keyboard | `←` / `A` | `→` / `D` | `↑` / `W` / `Space` |
| Mobile | Tombol ◀ | Tombol ▶ | Tombol TURBO |

## Pilihan Kendaraan

Pilih kendaraan sebelum mulai — masing-masing punya physics berbeda:

| Kendaraan | Kecepatan | Handling | Turbo | Karakter |
|-----------|-----------|----------|-------|----------|
| 🟡 Bajaj | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Lincah & ringan, cocok untuk pemula |
| 🔴 Angkot | ⭐⭐ | ⭐⭐ | ⭐⭐ | Kuat tapi berat, butuh skill lebih |
| 🟢 Becak | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Seimbang, turbo paling kencang |

## Fitur

- Tingkat kesulitan naik otomatis setiap ~5 detik
- Sistem **Turbo** — isi ulang otomatis, habis saat digunakan
- **High Score** tersimpan di localStorage
- Mendukung touch controls untuk mobile
- Kamera mengikuti kendaraan (top-down scrolling)

## Struktur Proyek

```
nusantara-drift/
├── index.html
├── style.css
└── src/
    ├── main.js              # Entry point, game loop, state machine
    ├── scenes/
    │   ├── menu.js          # Layar pemilihan kendaraan
    │   ├── game.js          # Scene utama gameplay
    │   └── gameover.js      # Layar game over & skor
    ├── entities/
    │   ├── vehicle.js       # Fisika & definisi kendaraan
    │   └── obstacle.js      # Spawn & manajemen rintangan
    ├── engine/
    │   ├── renderer.js      # Fungsi render track & UI
    │   ├── camera.js        # Sistem kamera follow
    │   └── physics.js       # Helper fisika
    └── utils/
        ├── input.js         # Keyboard & touch input
        └── storage.js       # High score (localStorage)
```

## Teknologi

- HTML5 Canvas API
- JavaScript ES Modules (vanilla, tanpa framework)
- CSS3