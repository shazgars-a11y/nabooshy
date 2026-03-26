// hero.js
import './hero-trailer.js';
import './hero-volume.js';
import './hero-tmdb.js';

let hi = 0, hInt = null;

function showPoster(url) {
  const bg = document.querySelector('.hero-bg'), vig = document.querySelector('.hero-vignette');
  if (bg)  { bg.style.backgroundImage = `url('${url}')`; bg.style.opacity = '1'; }
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
