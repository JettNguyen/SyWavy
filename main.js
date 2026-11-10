/* ============================================================
   main.js: SyWavy artist site
   Reads from window.SYWAVY (data.js) and writes markup with
   window._SWR (render.js), then adds the clicks, filters, and
   scroll effects
   ============================================================ */

window._SW = {};

/* Old links to release.html or index.html still load, so swap the address bar
   to the clean url the site links to now. Only on the live site, since a local
   server would not find the page again on reload. */
if (location.hostname === 'sywavy.com' && location.pathname.endsWith('.html')) {
  const clean = location.pathname.replace(/(index)?\.html$/, '');
  history.replaceState(null, '', clean + location.search + location.hash);
}

(function () {
  'use strict';

  const D = window.SYWAVY;
  const R = window._SWR;
  if (!D || !R) {
    console.error('SyWavy data not loaded.');
    return;
  }

  // build.js writes each section into the page ahead of time. A page served
  // straight from the repo still has them empty, so they get written here.
  function fill(el, html) {
    if (el && !el.hasChildNodes()) el.innerHTML = html;
  }

  /* ----------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function observeCards() {
    const targets = document.querySelectorAll('.animate-on-scroll:not(.visible), .video-item:not(.visible)');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.filter(e => e.isIntersecting).forEach((entry, i) => {
        const el = entry.target;
        const stagger = el.classList.contains('release-card') || el.classList.contains('video-item');
        const delay = stagger ? Math.min(i, 7) * 0.06 : 0;
        if (delay) el.style.transitionDelay = `${delay}s`;
        el.classList.add('visible');
        if (delay) setTimeout(() => { el.style.transitionDelay = ''; }, delay * 1000 + 800);
        observer.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     VIDEO PLAYERS
     A thumbnail turns into the YouTube player when clicked
  ---------------------------------------------------------- */
  function playOnClick(container) {
    if (!container) return;
    const play = thumb => {
      const wrap = document.createElement('div');
      wrap.className = 'video-iframe-wrap' + (thumb.classList.contains('release-video-thumb-wrap') ? ' release-video-thumb-wrap' : '');
      wrap.innerHTML = R.videoIframe(thumb.dataset.youtubeId, thumb.dataset.title);
      thumb.replaceWith(wrap);
    };
    container.addEventListener('click', e => {
      const thumb = e.target.closest('.video-thumb-wrap[data-youtube-id]');
      if (thumb) play(thumb);
    });
    container.addEventListener('keydown', e => {
      const thumb = e.target.closest('.video-thumb-wrap[data-youtube-id]');
      if (thumb && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); play(thumb); }
    });
  }

  // Shared with release.js
  Object.assign(window._SW, { observeCards, playOnClick });

  /* ----------------------------------------------------------
     NAV + WAVE ENGINE
  ---------------------------------------------------------- */
  const nav         = document.getElementById('nav');
  const hamburger   = document.getElementById('navHamburger');
  const navMenu     = document.getElementById('navMenu');
  const waveDepthEl = document.getElementById('waveDepth');
  const root        = document.documentElement;

  let scrollDepth  = 0;
  let currentDepth = 0;
  let waveRafId    = null;

  // Waves rise with scroll depth but stay in the lower half of the viewport,
  // while the deep-water overlay darkens everything behind the content.
  function tickWaves() {
    currentDepth += (scrollDepth - currentDepth) * 0.08;

    const backY  = (-20 + currentDepth * -14).toFixed(2);
    const midY   = (-20 + currentDepth * -18).toFixed(2);
    const frontY = (-20 + currentDepth * -22).toFixed(2);

    root.style.setProperty('--back-tf',  `translateY(${backY}vh)`);
    root.style.setProperty('--mid-tf',   `translateY(${midY}vh)`);
    root.style.setProperty('--front-tf', `translateY(${frontY}vh)`);

    if (waveDepthEl) waveDepthEl.style.opacity = (currentDepth * 0.6).toFixed(4);

    waveRafId = Math.abs(scrollDepth - currentDepth) < 0.0005
      ? null
      : requestAnimationFrame(tickWaves);
  }

  function updateActiveNav() {
    if (!navMenu) return;
    const scrollMid = window.scrollY + window.innerHeight * 0.45;
    const ids = ['music', 'videos', 'about', 'contact'];
    let current = '';
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollMid) current = id;
    }
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('nav-link-active', current !== '' && (href === `#${current}` || href === `/#${current}`));
    });
  }

  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    const maxScroll = root.scrollHeight - window.innerHeight;
    scrollDepth = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    if (!waveRafId) waveRafId = requestAnimationFrame(tickWaves);
    updateActiveNav();
  }

  // iOS Safari only applies :active pressed states once a touchstart listener exists
  document.addEventListener('touchstart', () => {}, { passive: true });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!navMenu || !hamburger) return;
    navMenu.classList.remove('mobile-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      if (navMenu.classList.contains('mobile-open')) {
        closeMenu();
      } else {
        navMenu.classList.add('mobile-open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Close menu');
        document.body.style.overflow = 'hidden';
      }
    });
    navMenu.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ----------------------------------------------------------
     HERO
  ---------------------------------------------------------- */
  const featured = R.featuredOf(D.releases);

  const heroNameEl = document.getElementById('heroName');
  const heroDescEl = document.getElementById('heroDescriptor');
  const heroCta    = document.getElementById('heroCta');
  if (heroNameEl) heroNameEl.textContent = D.artist.name;
  if (heroDescEl) heroDescEl.textContent = D.artist.descriptor;
  if (heroCta && featured) heroCta.textContent = `Listen to ${featured.title}`;

  /* ----------------------------------------------------------
     FEATURED RELEASE
  ---------------------------------------------------------- */
  const featuredWrap = document.getElementById('featuredRelease');

  if (featured && featuredWrap) fill(featuredWrap, R.featuredRelease(featured));

  /* ----------------------------------------------------------
     DISCOGRAPHY — filter + show more
  ---------------------------------------------------------- */
  const grid       = document.getElementById('discographyGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const moreBtn    = document.getElementById('releasesMore');
  const RELEASE_LIMIT = R.RELEASE_LIMIT;
  const FILTER_NOUN = { all: 'releases', album: 'albums', ep: 'EPs', single: 'singles' };

  if (grid) {
    fill(grid, R.discography(D.releases));
    const cards = [...grid.querySelectorAll('.release-card')];
    let filter = 'all';
    let expanded = false;

    function applyReleases() {
      let matching = 0, shown = 0;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.type === filter;
        if (match) matching++;
        const show = match && (expanded || shown < RELEASE_LIMIT);
        if (show) shown++;
        card.classList.toggle('hidden', !show);
      });
      if (moreBtn) {
        moreBtn.hidden = expanded || matching <= RELEASE_LIMIT;
        moreBtn.textContent = `Show all ${matching} ${FILTER_NOUN[filter] || 'releases'}`;
      }
      observeCards();
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        filter = btn.dataset.filter;
        applyReleases();
      });
    });

    if (moreBtn) moreBtn.addEventListener('click', () => { expanded = true; applyReleases(); });

    applyReleases();
  }

  /* ----------------------------------------------------------
     VIDEOS — click-to-load embeds + show more
  ---------------------------------------------------------- */
  const videosGrid = document.getElementById('videosGrid');
  const videosMore = document.getElementById('videosMore');

  if (videosGrid) {
    fill(videosGrid, R.videos(D.videos));
    playOnClick(videosGrid);

    if (videosMore) {
      videosMore.hidden = D.videos.length <= R.VIDEO_LIMIT;
      videosMore.textContent = `Show all ${D.videos.length} videos`;
      videosMore.addEventListener('click', () => {
        videosGrid.querySelectorAll('.video-item.hidden').forEach(el => el.classList.remove('hidden'));
        videosMore.hidden = true;
        observeCards();
      });
    }
  }

  /* ----------------------------------------------------------
     ABOUT
  ---------------------------------------------------------- */
  const aboutBio      = document.getElementById('aboutBio');
  const aboutLocation = document.getElementById('aboutLocation');
  const aboutSocials  = document.getElementById('aboutSocials');

  if (aboutBio) aboutBio.textContent = D.artist.bio;
  if (aboutLocation) aboutLocation.textContent = D.artist.location;
  fill(aboutSocials, R.socialLinks(D.socials));

  /* ----------------------------------------------------------
     CONTACT — opens the visitor's email app with a prefilled message
  ---------------------------------------------------------- */
  const emailLink = document.getElementById('contactEmail');
  if (emailLink) {
    emailLink.href = `mailto:${D.artist.bookingEmail}`;
    emailLink.textContent = D.artist.bookingEmail;
  }

  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if (form && feedback) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const name    = form.name.value.trim();
      const email   = form.email.value.trim();
      const message = form.message.value.trim();

      const subject = `Booking / collab inquiry from ${name}`;
      const body = [`Hi ${D.artist.name},`, '', message, '', `— ${name}`, email].join('\r\n');
      const mailto = `mailto:${D.artist.bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      feedback.textContent = 'Opening your email app… if nothing happens, use the address below.';
      window.location.href = mailto;
    });
  }

  /* ----------------------------------------------------------
     FOOTER
  ---------------------------------------------------------- */
  const footerCopy = document.getElementById('footerCopy');
  if (footerCopy) footerCopy.textContent = `© ${new Date().getFullYear()} ${D.artist.name}`;

  const footerSocials = document.getElementById('footerSocials');
  fill(footerSocials, R.socialLinks(D.socials));

  /* ----------------------------------------------------------
     SCROLL REVEAL + POSITION RESTORE
  ---------------------------------------------------------- */
  observeCards();

  if (grid) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    document.addEventListener('click', e => {
      if (e.target.closest('.release-card-link, .featured-cover-link, .featured-title a')) {
        sessionStorage.setItem('sywavy_scroll', String(window.scrollY));
      }
    });

    const saved = sessionStorage.getItem('sywavy_scroll');
    if (saved !== null) {
      sessionStorage.removeItem('sywavy_scroll');
      // Cards past the initial limit may need revealing before we can restore
      const y = parseInt(saved, 10);
      if (moreBtn && !moreBtn.hidden && y > root.scrollHeight - window.innerHeight) moreBtn.click();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.scrollTo(0, y);
        updateActiveNav();
      }));
    }
  }

})();
