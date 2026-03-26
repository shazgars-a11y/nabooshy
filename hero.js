// hero.js
import './hero-trailer.js';
import './hero-volume.js';
import './hero-tmdb.js';

let hi = 0, hInt = null;

function showPoster(url) {
  const bg = document.querySelector('.hero-bg'), vig = document.querySelector('.hero-vignette');
  if (bg)  { bg.style.backgroundImage = `url('${url}')`; bg.style.background = ''; bg.style.opacity = '1'; }
  if (vig) vig.style.opacity = '1';
}
function hidePoster() {
  const bg = document.querySelector('.hero-bg'), vig = document.querySelector('.hero-vignette');
  if (bg)  bg.style.opacity = '0';
  if (vig) vig.style.opacity = '0';
}

window.setHero = async (i) => {
  hi = i;
  const m = window.HERO_MOVIES?.[i];
  if (!m) return;

  document.querySelectorAll('.hero-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
  const wb = document.getElementById('heroWatch'), mb = document.getElementById('heroMore');
  if (wb) wb.onclick = () => window.openPlayer(m);
  if (mb) mb.onclick = () => window.openMovieDetail(m);
  const te = document.getElementById('heroTitle');
  if (te) te.textContent = m.title;

  window.stopTrailer();
  showPoster(m.poster);
  window.hideVolBtn();
  window._heroMuted = true;
  window.updateVolBtn(true);

  let trailerUrl = m.trailer || null;
  if (!trailerUrl && m.tmdbId) trailerUrl = await window.fetchTrailerKey(m.tmdbId);

  if (trailerUrl) {
    const type = window.detectTrailerType(trailerUrl);
    if (type) {
      window.playTrailer(trailerUrl, type,
        () => { hidePoster(); window.showVolBtn(); },
        () => window.setHero((hi + 1) % window.HERO_MOVIES.length),
        () => { showPoster(m.poster); window.hideVolBtn(); }
      );
    }
  }
};

window.initHero = function() {
  if (!window.HERO_MOVIES?.length) return;
  window.hideVolBtn();

  // Hero tag болон товчнуудыг movies горимд тавих
  const tag = document.getElementById('heroTag');
  if (tag) tag.textContent = '🔥 ДЭЛХИЙН ШИЛДЭГ';

  const heroBtns = document.getElementById('heroBtns');
  if (heroBtns) {
    heroBtns.innerHTML = `
      <button class="btn-watch" id="heroWatch"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Үзэх</button>
      <button class="btn-more" id="heroMore">ℹ Дэлгэрэнгүй</button>
      <button class="btn-volume" id="heroVolumeBtn" onclick="toggleHeroVolume()">🔇 Дууг нээх</button>`;
  }

  const dotsEl = document.getElementById('heroDots');
  if (dotsEl) {
    dotsEl.innerHTML = '';
    window.HERO_MOVIES.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => { clearInterval(hInt); window.setHero(i); startSlide(); };
      dotsEl.appendChild(dot);
    });
  }
  window.setHero(0);
  startSlide();
};

function startSlide() {
  clearInterval(hInt);
  hInt = setInterval(() => {
    const cont = document.getElementById('heroVideoContainer');
    if (!cont?.hasChildNodes()) window.setHero((hi + 1) % window.HERO_MOVIES.length);
  }, 12000);
}

// ── Хуудас бүрт hero тохируулах ──────────────────────────────
window.setPageHero = function(page) {
  const heroWrap = document.getElementById('heroWrap');

  // ХАЙХ хуудсанд hero нуух
  if (page === 'search') {
    if (heroWrap) heroWrap.style.display = 'none';
    window.stopTrailer?.();
    clearInterval(hInt);
    return;
  }

  // Бусад хуудсанд hero харуулах
  if (heroWrap) heroWrap.style.display = '';

  if (page === 'movies') {
    // ── КИНО hero: TMDB slideshow ────────────────────────────
    if (window.HERO_MOVIES?.length) {
      window.initHero();
    } else if (window.fetchTMDBNowPlaying) {
      window.fetchTMDBNowPlaying();
    }

  } else if (page === 'games') {
    // ── ТОГЛООМ hero ────────────────────────────────────────
    window.stopTrailer?.();
    clearInterval(hInt);

    const games = window.GAMES_LIST || [];
    // Онцлох тоглоомуудаас санамсаргүй нэгийг сонгох
    const featured = games[Math.floor(Math.random() * Math.min(games.length, 6))];
    const colors = featured?.color || ['#0f3460', '#16213e', '#1a1a2e'];

    const bg = document.querySelector('.hero-bg');
    if (bg) {
      bg.style.backgroundImage = '';
      bg.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1] || '#16213e'}, ${colors[2] || '#1a1a2e'})`;
      bg.style.opacity = '1';
    }
    const vig = document.querySelector('.hero-vignette');
    if (vig) vig.style.opacity = '1';

    const tag = document.getElementById('heroTag');
    if (tag) tag.textContent = '🎮 ОНЛАЙН ТОГЛООМУУД';

    const title = document.getElementById('heroTitle');
    if (title) title.textContent = featured ? featured.title : 'Онлайн Тоглоомууд';

    const meta = document.getElementById('heroMeta');
    if (meta) meta.innerHTML = featured
      ? `<span>${featured.emoji} ${featured.desc}</span>`
      : `<span>16 тоглоом нэн даруй тоглох боломжтой</span>`;

    const desc = document.getElementById('heroDesc');
    if (desc) desc.textContent = '';

    const dots = document.getElementById('heroDots');
    if (dots) {
      dots.innerHTML = '';
      // Категорийн цэгүүд харуулах
      (window.GAME_CATS || []).slice(1, 6).forEach((cat, i) => {
        const dot = document.createElement('div');
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.title = cat.label;
        dots.appendChild(dot);
      });
    }

    const btns = document.getElementById('heroBtns');
    if (btns) {
      btns.innerHTML = `
        <button class="btn-watch" onclick="if(window.GAMES_LIST?.[0])window.openGame(window.GAMES_LIST[0])">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Тоглох
        </button>
        <button class="btn-more" onclick="document.getElementById('gameGenreBar')?.scrollIntoView({behavior:'smooth'})">
          🎮 Бүгд харах
        </button>`;
    }
    window.hideVolBtn?.();

    // Тоглоомуудыг rotate хийх
    if (games.length > 1) {
      let gi = 0;
      hInt = setInterval(() => {
        gi = (gi + 1) % Math.min(games.length, 6);
        const g = games[gi];
        if (!g) return;
        const c = g.color || ['#0f3460', '#16213e'];
        const b = document.querySelector('.hero-bg');
        if (b) b.style.background = `linear-gradient(135deg, ${c[0]}, ${c[1] || '#16213e'}, ${c[2] || '#1a1a2e'})`;
        const t = document.getElementById('heroTitle');
        if (t) t.textContent = g.title;
        const m = document.getElementById('heroMeta');
        if (m) m.innerHTML = `<span>${g.emoji} ${g.desc}</span>`;
        // Цэгүүд идэвхжүүлэх
        const ds = document.querySelectorAll('.hero-dot');
        ds.forEach((d, idx) => d.classList.toggle('active', idx === gi));
      }, 4000);
    }

  } else if (page === 'weather') {
    // ── ЦАГ АГААР hero ───────────────────────────────────────
    window.stopTrailer?.();
    clearInterval(hInt);

    const bg = document.querySelector('.hero-bg');
    if (bg) {
      bg.style.backgroundImage = '';
      bg.style.background = 'linear-gradient(135deg, #1a237e 0%, #0277bd 50%, #01579b 100%)';
      bg.style.opacity = '1';
    }
    const vig = document.querySelector('.hero-vignette');
    if (vig) vig.style.opacity = '1';

    const tag = document.getElementById('heroTag');
    if (tag) tag.textContent = '🌤 ЦАГ АГААРЫН МЭДЭЭЛЭЛ';

    const title = document.getElementById('heroTitle');
    if (title) title.textContent = 'Монгол улс';

    const meta = document.getElementById('heroMeta');
    if (meta) meta.innerHTML = '<span>21 аймаг, хотын цаг агаар</span>';

    const desc = document.getElementById('heroDesc');
    if (desc) desc.textContent = '';

    const dots = document.getElementById('heroDots');
    if (dots) dots.innerHTML = '';

    const btns = document.getElementById('heroBtns');
    if (btns) {
      btns.innerHTML = `
        <button class="btn-watch" onclick="window.loadWeather?.()">
          ☁️ Цаг агаар харах
        </button>
        <button class="btn-more" onclick="window.refreshWeather?.()">
          🔄 Шинэчлэх
        </button>`;
    }
    window.hideVolBtn?.();

    // Улаанбаатарын цаг агаарыг hero-д харуулах
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Ulaanbaatar&appid=${window.OW_KEY}&units=metric`)
      .then(r => r.json())
      .then(d => {
        if (!d?.main) return;
        const temp = Math.round(d.main.temp);
        const feel = Math.round(d.main.feels_like);
        const icons = { clear: '☀️', cloud: '☁️', rain: '🌧️', snow: '❄️', thunder: '⛈️', mist: '🌫️' };
        const cond = d.weather[0].main.toLowerCase();
        let icon = '🌤';
        if (cond.includes('clear')) icon = '☀️';
        else if (cond.includes('cloud')) icon = '⛅';
        else if (cond.includes('rain')) icon = '🌧️';
        else if (cond.includes('snow')) icon = '❄️';
        else if (cond.includes('thunder')) icon = '⛈️';
        else if (cond.includes('mist') || cond.includes('fog')) icon = '🌫️';

        const t = document.getElementById('heroTitle');
        if (t) t.textContent = `${icon} Улаанбаатар  ${temp > 0 ? '+' : ''}${temp}°C`;

        const m = document.getElementById('heroMeta');
        if (m) m.innerHTML = `
          <span>${d.weather[0].description}</span>
          <span>·</span>
          <span>🌡️ Мэдрэгдэх ${feel > 0 ? '+' : ''}${feel}°C</span>
          <span>·</span>
          <span>💧 ${d.main.humidity}%</span>
          <span>·</span>
          <span>💨 ${(d.wind.speed * 3.6).toFixed(0)} км/ц</span>`;

        // Температурт тохируулж градиент өнгийг солих
        let gradient = 'linear-gradient(135deg, #1a237e 0%, #0277bd 50%, #01579b 100%)';
        if (temp < -20) gradient = 'linear-gradient(135deg, #0d1b2a 0%, #1b2a3b 50%, #4fc3f7 100%)';
        else if (temp < -5) gradient = 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #81d4fa 100%)';
        else if (temp > 20) gradient = 'linear-gradient(135deg, #4a0000 0%, #b71c1c 50%, #ff8f00 100%)';
        else if (temp > 10) gradient = 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #66bb6a 100%)';

        const b = document.querySelector('.hero-bg');
        if (b) b.style.background = gradient;
      })
      .catch(() => {});
  }
};
