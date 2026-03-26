// ============================================================
// app.js — Гол entry point
// ============================================================

import './firebase-config.js';
import './auth.js';
import './player.js';
import './config.js';
import './weather.js';
import './games.js';
import './hero.js';

import { fillRow }         from './utils.js';
import { buildMoviesPage, buildSeriesPage as buildSeriesGrid } from './movies.js';
import { buildSeriesPage } from './series.js';
import './search.js';

// ── Глобал өгөгдлийн сан ────────────────────────────────────
window.MOVIES = [];
window.SERIES = [];

// ── Navbar scroll эффект ─────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ── Өгөгдөл татах ───────────────────────────────────────────
async function loadData() {
  try {
    window.MOVIES = [];
    window.SERIES = [];

    const res  = await fetch('data.json?t=' + new Date().getTime(), { cache: 'no-store' });
    const json = await res.json();
    const raw  = json.data || json;

    raw.forEach((item, i) => {
      const isSeries = item.type?.toLowerCase().includes('series');
      const base = {
        id:       (isSeries ? 's' : 'm') + i,
        title:    item.mongolian_title || item.title,
        title_en: item.title,
        year:     item.year || 2024,
        rating:   item.ratings?.imdb ? parseFloat(item.ratings.imdb) : 7.0,
        poster:   (item.poster_link || '').replace(
          /http(s)?:\/\/www\.themoviedb\.org\/t\/p\/(original|w500)\//g,
          'https://image.tmdb.org/t/p/w500/'
        ),
        cat: (
          Array.isArray(item.genre)
            ? item.genre.join(',')
            : item.genre || ''
        ).toLowerCase(),
      };

      if (isSeries) {
        window.SERIES.push({ ...base, episodes: item.episodes || [] });
      } else {
        window.MOVIES.push({ ...base, embed: item.embed_links?.[0] || '' });
      }
    });

    buildHomeRows();
    if (window.fetchTMDBNowPlaying) window.fetchTMDBNowPlaying();
  } catch (e) {
    window.toast('Өгөгдөл татахад алдаа!');
    console.error(e);
  }
}

// ── Кино хуудасны мөрүүд ─────────────────────────────────────
function buildHomeRows() {
  fillRow('rowFeatured', window.MOVIES.slice(0, 30));
  fillRow('rowSeries',   window.SERIES.slice(0, 20), true);

  const dynamicContainer = document.getElementById('dynamicRows');
  if (dynamicContainer && window.HOME_ROWS) {
    dynamicContainer.innerHTML = '';
    window.HOME_ROWS.forEach(({ id, title, keys }) => {
      const filteredMovies = window.MOVIES.filter(m => keys.some(k => m.cat.includes(k))).slice(0, 25);
      if (filteredMovies.length > 0) {
        const section = document.createElement('section');
        section.className = 'sec';
        section.innerHTML = `
          <div class="sec-head"><div class="sec-title">${title}</div></div>
          <div class="row-wrap">
            <button class="scroll-btn left" onclick="scrollRow('${id}',-600)">❮</button>
            <div class="scroll-row" id="${id}"></div>
            <button class="scroll-btn right" onclick="scrollRow('${id}',600)">❯</button>
          </div>`;
        dynamicContainer.appendChild(section);
        fillRow(id, filteredMovies);
      }
    });
  }

  if (window.buildGamesRow) window.buildGamesRow();
  setTimeout(() => { if (window.insertAds) window.insertAds(); }, 500);
}

// ── Бүх кино grid харуулах (мөрүүдийн хуудсаас "Бүгд" дарахад) ──
window.showMoviesGrid = function() {
  const s = document.getElementById('moviesFullSection');
  const rows = document.querySelectorAll('#page-movies > main > .sec, #dynamicRows');
  if (!s) return;

  const isVisible = s.style.display !== 'none';
  if (isVisible) {
    s.style.display = 'none';
    rows.forEach(el => el.style.display = '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    s.style.display = '';
    // Genre bar + grid дүүргэх
    buildMoviesPage();
    s.scrollIntoView({ behavior: 'smooth' });
  }
};

// ── Бүх цуврал grid харуулах ──────────────────────────────────
window.showSeriesGrid = function() {
  const s = document.getElementById('seriesFullSection');
  if (!s) return;
  const isVisible = s.style.display !== 'none';
  if (isVisible) {
    s.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    s.style.display = '';
    buildSeriesPage();
    s.scrollIntoView({ behavior: 'smooth' });
  }
};

// ── Scroll хэрэгсэл ──────────────────────────────────────────
window.scrollRow = function(id, dx) {
  document.getElementById(id)?.scrollBy({ left: dx, behavior: 'smooth' });
};

// ── Хуудас солих ─────────────────────────────────────────────
window.gotoPage = function(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + p)?.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('t-' + p)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Hero хуудас бүрт тохируулах
  if (window.setPageHero) window.setPageHero(p);

  if (p === 'games'   && window.buildGamesPage) window.buildGamesPage();
  if (p === 'weather' && window.loadWeather)    window.loadWeather();
  if (p === 'search') {
    setTimeout(() => document.getElementById('searchPageInput')?.focus(), 300);
  }
};

// ── Эхлүүлэх ────────────────────────────────────────────────
loadData();
