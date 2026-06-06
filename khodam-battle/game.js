const KHODAMS = [
  // — dari Cek Khodam —
  { name: 'Reungit Pertamina', emoji: '🦟', atk: 55, def: 45, lck: 85 },
  { name: 'Tuyul Beranak', emoji: '👶', atk: 40, def: 35, lck: 95 },
  { name: 'Ki Retas Syber', emoji: '💻', atk: 70, def: 50, lck: 80 },
  { name: 'Macan Cacat', emoji: '🐯', atk: 75, def: 40, lck: 65 },
  { name: 'Jimat Lintas Alam', emoji: '🧿', atk: 60, def: 80, lck: 70 },
  { name: 'Kuda Berkokok', emoji: '🐴', atk: 72, def: 55, lck: 60 },
  { name: 'Prabu Oray Piton', emoji: '🐍', atk: 85, def: 65, lck: 50 },
  { name: 'Raden Pawang Saiber', emoji: '🧙', atk: 65, def: 60, lck: 85 },
  { name: 'Musang Bercicit', emoji: '🦡', atk: 50, def: 55, lck: 90 },
  { name: 'Laba-Laba Sunda', emoji: '🕷️', atk: 68, def: 72, lck: 68 },
  // — khodam unik tambahan —
  { name: 'Gondoruwo Kesiangan', emoji: '👹', atk: 90, def: 40, lck: 45 },
  { name: 'Pocong Nyangkut WiFi', emoji: '👻', atk: 45, def: 55, lck: 100 },
  { name: 'Kuntilanak Deadline', emoji: '🧟', atk: 78, def: 62, lck: 55 },
  { name: 'Wewe Gombel Upgrade', emoji: '🧌', atk: 55, def: 90, lck: 50 },
  { name: 'Babi Ngepet Investasi', emoji: '🐗', atk: 60, def: 60, lck: 88 },
  { name: 'Genderuwo Overthink', emoji: '🗿', atk: 80, def: 75, lck: 35 },
  { name: 'Leak Bali Ngebut', emoji: '🌪️', atk: 92, def: 38, lck: 70 },
  { name: 'Jelangkung Out of Office', emoji: '🪆', atk: 48, def: 85, lck: 78 },
  { name: 'Banaspati Kesiapan', emoji: '🔥', atk: 88, def: 45, lck: 60 },
  { name: 'Tuyul Saham', emoji: '💰', atk: 42, def: 48, lck: 99 },
  // — khodam terlangka — (peluang 1 dari 100 roll)
  { name: 'Vancin', emoji: 'V', atk: 99, def: 99, lck: 99, isVancin: true, rare: true },
];

const BATTLE_COMMENTS = {
  attackWin: ['Serangan telak!', 'Terkena sabetan!', 'Tidak bisa ditangkis!'],
  defendWin: ['Bertahan sempurna, balas serangan!', 'Serangan diredam, lalu balas!', 'Tangkisan maut!'],
  luckWin: ['Keberuntungan berpihak!', 'Nasib sedang bagus hari ini!', 'Dewi fortuna tersenyum!'],
  draw: ['Seri! Keduanya seimbang!', 'Tidak ada yang menang ronde ini!', 'Kekuatan setara!'],
  cpu: ['CPU berpikir keras...', 'CPU merasakan aura kamu...', 'CPU memilih dengan insting!'],
};

let state = {};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function startGame(mode) {
  state = { mode, p1: null, p2: null, rolled: [false, false] };
  document.getElementById('roll-p1-label').textContent = 'Player 1';
  document.getElementById('roll-p2-label').textContent = mode === 'solo' ? 'CPU' : 'Player 2';
  document.getElementById('btn-roll-p2').textContent = mode === 'solo' ? '🎲 Cek Khodam CPU' : '🎲 Cek Khodam';
  document.getElementById('roll-title').textContent = 'Siapa khodam kamu?';
  ['p1','p2'].forEach(p => {
    document.getElementById(`khodam-${p}`).textContent = '?';
    document.getElementById(`khodam-name-${p}`).textContent = '—';
    document.getElementById(`stats-${p}`).textContent = '';
    document.getElementById(`roll-${p}`).classList.remove('revealed');
  });
  document.getElementById('btn-roll-p1').disabled = false;
  document.getElementById('btn-roll-p2').disabled = false;
  document.getElementById('btn-start-battle').classList.add('hidden');
  showScreen('screen-roll');
}

function rollKhodam(player) {
  // Vancin: peluang 1% — khodam terlangka
  const isRareRoll = Math.random() < 0.01;
  const normalPool = KHODAMS.filter(k => !k.rare);
  const result = isRareRoll ? KHODAMS.find(k => k.rare) : rand(normalPool);

  const p = player === 1 ? 'p1' : 'p2';
  const emojiEl = document.getElementById(`khodam-${p}`);
  const nameEl  = document.getElementById(`khodam-name-${p}`);
  const statsEl = document.getElementById(`stats-${p}`);
  const cardEl  = document.getElementById(`roll-${p}`);
  const btnEl   = document.getElementById(`btn-roll-${p}`);

  btnEl.disabled = true;
  cardEl.classList.remove('vancin-reveal', 'vancin-glow');
  cardEl.classList.add('rolling');

  const totalDuration = 3000;
  let elapsed = 0;
  let intervalDelay = 60;

  nameEl.textContent = '???';
  statsEl.textContent = '';

  function tick() {
    const preview = rand(normalPool);
    emojiEl.textContent = preview.emoji;
    emojiEl.classList.add('slot-flash');
    setTimeout(() => emojiEl.classList.remove('slot-flash'), intervalDelay * 0.4);

    elapsed += intervalDelay;

    const progress = elapsed / totalDuration;
    intervalDelay = 60 + Math.floor(progress * progress * 440);

    if (elapsed < totalDuration) {
      setTimeout(tick, intervalDelay);
    } else {
      revealResult(result, p, emojiEl, nameEl, statsEl, cardEl);
    }
  }

  tick();
}

function revealResult(k, p, emojiEl, nameEl, statsEl, cardEl) {
  cardEl.classList.remove('rolling');
  cardEl.classList.add('revealed', 'reveal-pop');
  setTimeout(() => cardEl.classList.remove('reveal-pop'), 600);

  if (k.isVancin) {
    emojiEl.innerHTML = `<img src="vancin.jpg" alt="Vancin" class="vancin-img">`;
    cardEl.classList.add('vancin-reveal');
    setTimeout(() => cardEl.classList.add('vancin-glow'), 150);
  } else {
    emojiEl.textContent = k.emoji;
  }

  nameEl.textContent = k.name;
  statsEl.innerHTML = k.isVancin
    ? `⚔️ Serangan: ${k.atk} &nbsp; 🛡️ Pertahanan: ${k.def} &nbsp; 🍀 Hoki: ${k.lck} &nbsp; <span class="rare-badge">✦ LANGKA</span>`
    : `⚔️ Serangan: ${k.atk} &nbsp; 🛡️ Pertahanan: ${k.def} &nbsp; 🍀 Hoki: ${k.lck}`;

  state[p] = { ...k, hp: 100, maxHp: 100 };
  state.rolled[p === 'p1' ? 0 : 1] = true;

  if (state.rolled[0] && state.rolled[1]) {
    document.getElementById('btn-start-battle').classList.remove('hidden');
  }
}

function startBattle() {
  state.round = 1;
  state.p1Action = null;
  state.p2Action = null;
  state.waitingFor = 'p1';
  state.p1.hp = 100;
  state.p2.hp = 100;

  document.getElementById('battle-name-p1').textContent = state.p1.name;
  document.getElementById('battle-name-p2').textContent = state.p2.name;
  document.getElementById('emoji-p1').textContent = state.p1.emoji;
  document.getElementById('emoji-p2').textContent = state.p2.emoji;
  document.getElementById('fname-p1').textContent = state.p1.name;
  document.getElementById('fname-p2').textContent = state.p2.name;
  updateHP();
  document.getElementById('battle-log').textContent = 'Pilih aksimu!';
  setActionLabel();
  enableActions(true);
  showScreen('screen-battle');
}

function updateHP() {
  const p1Pct = Math.max(0, (state.p1.hp / 100) * 100);
  const p2Pct = Math.max(0, (state.p2.hp / 100) * 100);
  document.getElementById('hp-bar-p1').style.width = p1Pct + '%';
  document.getElementById('hp-bar-p2').style.width = p2Pct + '%';
  document.getElementById('hp-text-p1').textContent = Math.max(0, state.p1.hp) + ' HP';
  document.getElementById('hp-text-p2').textContent = Math.max(0, state.p2.hp) + ' HP';
}

function setActionLabel() {
  const label = document.getElementById('action-label');
  if (state.mode === 'solo') {
    label.textContent = 'Pilih aksimu:';
  } else {
    label.textContent = state.waitingFor === 'p1'
      ? 'Player 1 — Pilih aksi:'
      : 'Player 2 — Pilih aksi:';
  }
}

function enableActions(on) {
  document.querySelectorAll('.action-buttons button').forEach(b => b.disabled = !on);
}

function chooseAction(action) {
  if (state.mode === 'solo') {
    state.p1Action = action;
    const cpuActions = ['attack', 'defend', 'luck'];
    state.p2Action = rand(cpuActions);
    resolveBattle();
  } else {
    if (state.waitingFor === 'p1') {
      state.p1Action = action;
      state.waitingFor = 'p2';
      setActionLabel();
      document.getElementById('battle-log').textContent = 'Player 1 sudah pilih. Giliran Player 2!';
    } else {
      state.p2Action = action;
      resolveBattle();
    }
  }
}

function actionLabel(a) {
  return { attack: '⚔️ Serang', defend: '🛡️ Bertahan', luck: '🍀 Keberuntungan' }[a];
}

function resolveBattle() {
  enableActions(false);
  const p1 = state.p1, p2 = state.p2;
  const a1 = state.p1Action, a2 = state.p2Action;

  let dmg1 = 0, dmg2 = 0;
  let logMsg = `${p1.name} pilih ${actionLabel(a1)} | ${p2.name} pilih ${actionLabel(a2)}\n`;

  const beats = (a, b) => (a==='attack'&&b==='luck') || (a==='defend'&&b==='attack') || (a==='luck'&&b==='defend');

  if (a1 === a2) {
    dmg1 = randInt(5, 12);
    dmg2 = randInt(5, 12);
    logMsg += rand(BATTLE_COMMENTS.draw);
  } else if (beats(a1, a2)) {
    const statMap = { attack: p1.atk, defend: p1.def, luck: p1.lck };
    dmg2 = Math.floor(randInt(15, 28) * (statMap[a1] / 100));
    logMsg += rand(BATTLE_COMMENTS[a1 + 'Win'] || BATTLE_COMMENTS.attackWin);
    logMsg += `\n${p1.name} menang ronde! (-${dmg2} HP ${p2.name})`;
    shakeEmoji('p2');
  } else {
    const statMap = { attack: p2.atk, defend: p2.def, luck: p2.lck };
    dmg1 = Math.floor(randInt(15, 28) * (statMap[a2] / 100));
    logMsg += rand(BATTLE_COMMENTS[a2 + 'Win'] || BATTLE_COMMENTS.attackWin);
    logMsg += `\n${p2.name} menang ronde! (-${dmg1} HP ${p1.name})`;
    shakeEmoji('p1');
  }

  p1.hp -= dmg1;
  p2.hp -= dmg2;
  updateHP();
  document.getElementById('round-num').textContent = state.round;
  document.getElementById('battle-log').textContent = logMsg;

  state.round++;
  state.p1Action = null;
  state.p2Action = null;
  state.waitingFor = 'p1';

  setTimeout(() => {
    if (p1.hp <= 0 || p2.hp <= 0) {
      endBattle();
    } else {
      setActionLabel();
      document.getElementById('battle-log').textContent = state.mode === 'duo'
        ? 'Player 1 — Pilih aksi berikutnya!'
        : 'Pilih aksimu!';
      enableActions(true);
    }
  }, 1800);
}

function shakeEmoji(player) {
  const el = document.getElementById(`emoji-${player}`);
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}

function endBattle() {
  const p1 = state.p1, p2 = state.p2;
  let emoji, title, desc;

  if (p1.hp <= 0 && p2.hp <= 0) {
    emoji = '🤝'; title = 'SERI!';
    desc = `${p1.name} dan ${p2.name} sama-sama jatuh. Pertarungan berakhir imbang!`;
  } else if (p1.hp <= 0) {
    emoji = '💀';
    title = state.mode === 'solo' ? 'KALAH!' : `${p2.name} MENANG!`;
    desc = `${p2.name} mengalahkan ${p1.name}. ${state.mode === 'solo' ? 'Coba lagi!' : 'Player 2 menang!'}`;
  } else {
    emoji = '🏆';
    title = state.mode === 'solo' ? 'MENANG!' : `${p1.name} MENANG!`;
    desc = `${p1.name} mengalahkan ${p2.name}. ${state.mode === 'solo' ? 'Khodam kamu kuat!' : 'Player 1 menang!'}`;
  }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-desc').textContent = desc;
  showScreen('screen-result');
}

function rerollBattle() {
  startGame(state.mode);
}