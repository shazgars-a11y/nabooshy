// games.js
import './games-data.js';
import './games-cards.js';

let gamesBuilt = false;

window.buildGamesRow = function() {
  const el = document.getElementById('rowGames');
  if (!el) return;
  el.innerHTML = '';
  window.GAMES_LIST.slice(0, 10).forEach(g => el.appendChild(window.makeGamePosterCard(g)));
};

window.buildGamesPage = function() {
  if (gamesBuilt) return;
  gamesBuilt = true;
  const bar = document.getElementById('gameGenreBar');
  if (!bar) return;
  bar.innerHTML = '';
  window.GAME_CATS.forEach((c, i) => {
    const pill = document.createElement('button');
    pill.className = 'gpill' + (i === 0 ? ' on' : '');
    pill.textContent = c.label;
    pill.onclick = () => { bar.querySelectorAll('.gpill').forEach(p => p.classList.remove('on')); pill.classList.add('on'); renderGamesGrid(c.key); };
    bar.appendChild(pill);
  });
  renderGamesGrid('');
};

function renderGamesGrid(catKey) {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!catKey) {
    window.GAME_SECTIONS.forEach((sec, idx) => {
      const title = document.createElement('div');
      title.style.cssText = 'font-size:18px;font-weight:700;color:#fff;margin:24px 0 12px;';
      title.textContent = sec.label;
      grid.appendChild(title);
      const rowWrap = document.createElement('div'); rowWrap.className = 'row-wrap';
      const rowId = 'gameRow_' + sec.key;
      const btnL = document.createElement('button'); btnL.className = 'scroll-btn left'; btnL.innerHTML = '❮'; btnL.onclick = () => scrollRow(rowId, -600);
      const row = document.createElement('div'); row.className = 'scroll-row'; row.id = rowId;
      const btnR = document.createElement('button'); btnR.className = 'scroll-btn right'; btnR.innerHTML = '❯'; btnR.onclick = () => scrollRow(rowId, 600);
      window.GAMES_LIST.filter(g => g.cat === sec.key).forEach(g => row.appendChild(window.makeGamePosterCard(g)));
      rowWrap.append(btnL, row, btnR);
      grid.appendChild(rowWrap);
      if (idx < window.GAME_SECTIONS.length - 1) {
        const adSlot = document.createElement('div'); adSlot.style.cssText = 'width:100%;margin:10px 0;display:block;';
        grid.appendChild(adSlot);
        setTimeout(() => {
          if (window._zarInjectCSS) window._zarInjectCSS();
          const ads = (window.MY_ADS || []).filter(a => a.isActive && a.label?.startsWith('GAME AD'));
          const ad = ads[idx] || { isActive:true, label:'GAME AD '+(idx+1) };
          if (window._zarBuildEl) adSlot.appendChild(window._zarBuildEl(ad));
        }, 200);
      }
    });
  } else {
    window.GAMES_LIST.filter(g => g.cat === catKey).forEach(g => grid.appendChild(window.makeGameListCard(g)));
  }
}

window.openGame = function(g) {
  if (!window.currentUser) { window.openAuth('login'); return window.toast('Тоглохын тулд нэвтэрнэ үү 🔐'); }
  document.getElementById('gmFrame').src = g.embed;
  document.getElementById('gameModal').classList.add('open');
};
