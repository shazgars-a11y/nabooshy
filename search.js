// ============================================================
// search.js — Хайлтын функц
// ============================================================

window.doSearch = (q) => {
  q = q.toLowerCase().trim();
  if (!q) return window.gotoPage('home');

  window.gotoPage('movies');

  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';

  const results = [
    ...window.MOVIES.filter((m) => m.title.toLowerCase().includes(q)),
    ...window.SERIES.filter((s) => s.title.toLowerCase().includes(q)),
  ].slice(0, 60);

  const cnt = document.getElementById('moviesCount');
  if (cnt) cnt.textContent = `"${q}" — ${results.length} үр дүн`;

  results.forEach((m) => grid.appendChild(window.makeMovieCard(m)));
};
