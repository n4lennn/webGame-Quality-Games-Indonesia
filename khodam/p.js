function khodam() {
  let khodam = Math.random();
  if (khodam < 0.1) {
    khodam = "Reungit Pertamina";
  } else if (khodam >= 0.1 && khodam < 0.2) {
    khodam = "Tuyul Beranak";
  } else if (khodam >= 0.2 && khodam < 0.3) {
    khodam = "Ki retas syber";
  } else if (khodam >= 0.3 && khodam < 0.4) {
    khodam = "Macan Cacat";
  } else if (khodam >= 0.4 && khodam < 0.5) {
    khodam = "Jimat lintas alam";
  } else if (khodam >= 0.5 && khodam < 0.6) {
    khodam = "Kuda Berkokok";
  } else if (khodam >= 0.6 && khodam < 0.7) {
    khodam = "Prabu oray piton";
  } else if (khodam >= 0.7 && khodam < 0.8) {
    khodam = "Raden pawang saiber";
  } else if (khodam >= 0.8 && khodam < 0.9) {
    khodam = "Musang bercicit";
  } else {
    khodam = "Laba-Laba Sunda";
  }
  return khodam;
}
var teks = document.getElementById("teks");
var hasil = document.getElementById("hasil");
var aja = document.getElementById("aja");
var peringatan = document.getElementById("peringatan");
const sedang = document.getElementById("sedang");

sedang.style.display = "none";

function cek() {
  if (teks.value != teks.innerText) {
    sedang.style.display = "flex";
    setTimeout(function nyala() {
      sedang.style.display = "none";
      aja.innerHTML = "" + teks.value;
      hasil.innerHTML = "" + khodam();
      teks.value = "";
    }, 7000);
    peringatan.innerHTML = "";
  } else {
    if (aja.innerHTML && hasil.innerHTML) {
      aja.innerHTML = aja.innerText;
      hasil.innerHTML = hasil.innerText;
      peringatan.innerHTML = "Masukkan nama!!";
    } else {
      aja.innerHTML = "";
      hasil.innerHTML = "";
      peringatan.innerHTML = "Masukkan nama!!";
    }
  }
}

const warna = document.getElementById("warna");

warna.addEventListener("click", function () {
  const r = Math.round(Math.random() * 255 + 1);
  const g = Math.round(Math.random() * 255 + 1);
  const b = Math.round(Math.random() * 255 + 1);
  document.body.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
});

const cerah = document.querySelector("input[name=cerah]");

cerah.addEventListener("input", function () {
  const warna = cerah.value;
  document.body.style.backgroundColor =
    "rgb(" + warna + "," + warna + "," + warna + ")";
});
