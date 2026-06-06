# ⚔️ Khodam Battle

Game pertarungan berbasis giliran di browser — adu khodam kamu melawan CPU atau teman!

Khodam-khodam yang ada di game ini diambil langsung dari proyek **Cek Khodam** (folder `/khodam`) yang dibuat saat SMK, lalu dikembangkan jadi sistem battle dengan mekanik lebih dalam.

## Cara Main

1. Buka `index.html` di browser (tidak perlu server)
2. Pilih mode: **Solo** (lawan CPU) atau **Duo** (lawan teman di device yang sama)
3. Kocok khodam kamu — animasi slot machine akan berjalan selama ~3 detik
4. Pilih aksi tiap ronde: **⚔️ Serang**, **🛡️ Bertahan**, atau **🍀 Keberuntungan**
5. Kalahkan lawan sebelum HP-mu habis!

## Mekanik Battle

Sistem aksi menggunakan logika **rock-paper-scissors**:

| Aksi | Mengalahkan |
|------|-------------|
| ⚔️ Serang | 🍀 Keberuntungan |
| 🛡️ Bertahan | ⚔️ Serang |
| 🍀 Keberuntungan | 🛡️ Bertahan |

Damage dihitung dari stat khodam yang sesuai dengan aksi yang dipilih (ATK / DEF / LCK).

## Daftar Khodam

### Dari Cek Khodam (asli)
| Khodam | ⚔️ ATK | 🛡️ DEF | 🍀 LCK |
|--------|--------|--------|--------|
| Reungit Pertamina 🦟 | 55 | 45 | 85 |
| Tuyul Beranak 👶 | 40 | 35 | 95 |
| Ki Retas Syber 💻 | 70 | 50 | 80 |
| Macan Cacat 🐯 | 75 | 40 | 65 |
| Jimat Lintas Alam 🧿 | 60 | 80 | 70 |
| Kuda Berkokok 🐴 | 72 | 55 | 60 |
| Prabu Oray Piton 🐍 | 85 | 65 | 50 |
| Raden Pawang Saiber 🧙 | 65 | 60 | 85 |
| Musang Bercicit 🦡 | 50 | 55 | 90 |
| Laba-Laba Sunda 🕷️ | 68 | 72 | 68 |

### Khodam Tambahan
| Khodam | ⚔️ ATK | 🛡️ DEF | 🍀 LCK |
|--------|--------|--------|--------|
| Gondoruwo Kesiangan 👹 | 90 | 40 | 45 |
| Pocong Nyangkut WiFi 👻 | 45 | 55 | 100 |
| Kuntilanak Deadline 🧟 | 78 | 62 | 55 |
| Wewe Gombel Upgrade 🧌 | 55 | 90 | 50 |
| Babi Ngepet Investasi 🐗 | 60 | 60 | 88 |
| Genderuwo Overthink 🗿 | 80 | 75 | 35 |
| Leak Bali Ngebut 🌪️ | 92 | 38 | 70 |
| Jelangkung Out of Office 🪆 | 48 | 85 | 78 |
| Banaspati Kesiapan 🔥 | 88 | 45 | 60 |
| Tuyul Saham 💰 | 42 | 48 | 99 |

### ✦ Khodam Terlangka
| Khodam | ⚔️ ATK | 🛡️ DEF | 🍀 LCK | Peluang |
|--------|--------|--------|--------|---------|
| Vancin 👁️ | 99 | 99 | 99 | 1% |

Vancin adalah khodam terlangka — peluang mendapatkannya hanya **1 dari 100 roll**. Jika berhasil, kartu akan menyala dengan glow merah.

## Teknologi

- HTML5 / CSS3 / JavaScript Vanilla
- Tidak ada framework, tidak ada dependency

## File Penting

```
khodam-battle/
├── index.html      # Struktur halaman
├── game.js         # Semua logika game & data khodam
├── style.css       # Styling & animasi
└── vancin.jpg      # Gambar khodam Vancin (terlangka)
```