const KEY = 'nusantara_leaderboard';

export function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveScore(name, score) {
  const board = getLeaderboard();
  board.push({ name, score, date: new Date().toLocaleDateString('id-ID') });
  board.sort((a, b) => b.score - a.score);
  const top10 = board.slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(top10));
  return top10;
}

export function getBestScore() {
  const board = getLeaderboard();
  return board.length > 0 ? board[0].score : 0;
}