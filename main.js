/* ============================================================
   main.js: SyWavy artist site
   Reads from window.SYWAVY (data.js) and writes markup with
   window._SWR (render.js), then adds the clicks, filters, and
   scroll effects. waves.js draws the background on its own.
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
  const byId = id => document.getElementById(id);

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
        const delay = stagger ? Math.min(i, 7) * 0.05 : 0;
        if (delay) el.style.transitionDelay = `${delay}s`;
        el.classList.add('visible');
        if (delay) setTimeout(() => { el.style.transitionDelay = ''; }, delay * 1000 + 900);
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
     NAV
  ---------------------------------------------------------- */
  const nav       = byId('nav');
  const hamburger = byId('navHamburger');
  const navMenu   = byId('navMenu');
  const root      = document.documentElement;

  function updateActiveNav() {
    if (!navMenu) return;
    const scrollMid = window.scrollY + window.innerHeight * 0.45;
    const ids = ['music', 'videos', 'about', 'contact'];
    let current = '';
    for (const id of ids) {
      const el = byId(id);
      if (el && el.offsetTop <= scrollMid) current = id;
    }
    // Discography belongs to Music. Links to other pages (Lyrics) keep the
    // active state their page was built with.
    navMenu.querySelectorAll('.nav-link[href*="#"]').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('nav-link-active', current !== '' && (href === `#${current}` || href === `/#${current}`));
    });
  }

  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
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
    nav.classList.remove('menu-open');
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
        nav.classList.add('menu-open');
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

  const heroNameEl = byId('heroName');
  const heroDescEl = byId('heroDescriptor');
  if (heroNameEl) heroNameEl.textContent = D.artist.name;
  if (heroDescEl) heroDescEl.textContent = D.artist.descriptor;
  if (featured) fill(byId('heroRelease'), R.heroRelease(featured));

  /* ----------------------------------------------------------
     FEATURED RELEASE
  ---------------------------------------------------------- */
  if (featured) fill(byId('featuredRelease'), R.featuredRelease(featured));

  /* ----------------------------------------------------------
     DISCOGRAPHY: filter + show more
  ---------------------------------------------------------- */
  const grid       = byId('discographyGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const moreBtn    = byId('releasesMore');
  const RELEASE_LIMIT = R.RELEASE_LIMIT;
  const FILTER_NOUN = { all: 'releases', album: 'albums', ep: 'EPs', single: 'singles' };

  fill(byId('releaseCount'), String(D.releases.length));
  fill(byId('videoCount'), String(D.videos.length));

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
     VIDEOS: click-to-load embeds + show more
  ---------------------------------------------------------- */
  const videosGrid = byId('videosGrid');
  const videosMore = byId('videosMore');

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
  fill(byId('aboutBio'), R.aboutBio(D.artist.bio));
  fill(byId('aboutFacts'), R.aboutFacts(D));
  fill(byId('aboutSocials'), R.followLinks([...(D.streamingPages || []), ...D.socials]));

  /* ----------------------------------------------------------
     CONTACT: opens the visitor's email app with a prefilled message
  ---------------------------------------------------------- */
  const emailLink = byId('contactEmail');
  if (emailLink) {
    emailLink.href = `mailto:${D.artist.bookingEmail}`;
    emailLink.textContent = D.artist.bookingEmail;
  }

  const form = byId('contactForm');
  const feedback = byId('formFeedback');

  if (form && feedback) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const name    = form.name.value.trim();
      const email   = form.email.value.trim();
      const message = form.message.value.trim();

      const subject = `Booking / collab inquiry from ${name}`;
      const body = [`Hi ${D.artist.name},`, '', message, '', name, email].join('\r\n');
      const mailto = `mailto:${D.artist.bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      feedback.textContent = 'Opening your email app. If nothing happens, write to the address on the left.';
      window.location.href = mailto;
    });
  }

  /* ----------------------------------------------------------
     FOOTER
  ---------------------------------------------------------- */
  const footerCopy = byId('footerCopy');
  if (footerCopy) footerCopy.textContent = `© ${new Date().getFullYear()} ${D.artist.name}`;
  fill(byId('footerSocials'), R.socialLinks([...(D.streamingPages || []), ...D.socials]));

  /* ----------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------- */
  observeCards();

  /* ----------------------------------------------------------
     SECTION LINKS WITHOUT A # IN THE ADDRESS
     Links to a section (#music, or /#discography on a release
     page) keep their # so they still work without scripts and in
     a new tab. A plain click scrolls there and leaves the address
     clean. Between pages the section is handed over in
     sessionStorage, and a # that still arrives (an old or shared
     link) is scrolled to and then taken off the address.
     The browser keeps its own scroll memory, so a reload or the
     back button returns to the same spot instead of the top.
  ---------------------------------------------------------- */
  const GOTO_KEY = 'sywavy_goto';
  const SPOT_KEY = 'sywavy_scroll';
  const isHomePath = p => p === '/' || p === '/index.html';
  const hashId = hash => {
    try { return decodeURIComponent(hash.slice(1)); } catch (_) { return ''; }
  };

  function take(key) {
    try {
      const value = sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
      return value;
    } catch (_) { return null; }
  }
  function keep(key, value) {
    try { sessionStorage.setItem(key, value); } catch (_) { /* storage turned off */ }
  }

  // The stylesheet makes scrolling glide, but landing on a spot as a page opens shouldn't
  function jump(scroll) {
    root.style.scrollBehavior = 'auto';
    scroll();
    root.style.scrollBehavior = '';
  }

  // Scroll to a section, or the top for no id, and move keyboard focus
  // there the way following a #link does
  function goToSection(id, glide) {
    const target = id ? byId(id) : null;
    const behavior = glide && !reduceMotion ? 'smooth' : 'auto';
    const scroll = () => target
      ? target.scrollIntoView({ behavior, block: 'start' })
      : window.scrollTo({ top: 0, behavior });
    if (behavior === 'smooth') scroll(); else jump(scroll);

    const focusTo = target || document.querySelector('.skip-link');
    if (!focusTo) return;
    if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    focusTo.focus({ preventScroll: true });
  }

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href*="#"]');
    if (!link || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    const id = hashId(url.hash);
    const samePage = url.pathname === location.pathname ||
      (isHomePath(url.pathname) && isHomePath(location.pathname));

    if (samePage) {
      if (id && !byId(id)) return;
      e.preventDefault();
      closeMenu();
      goToSection(id, true);
    } else if (id && isHomePath(url.pathname)) {
      e.preventDefault();
      keep(GOTO_KEY, id);
      location.href = url.pathname + url.search;
    }
  });

  // Land on a spot as the page opens. Fonts and images that arrive afterwards
  // can still move things, so land again once they're in, unless the visitor
  // has started scrolling by then.
  function landOn(scroll) {
    let touched = false;
    const stop = () => { touched = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(type =>
      window.addEventListener(type, stop, { once: true, passive: true }));
    const land = () => {
      if (touched) return;
      jump(scroll);
      updateActiveNav();
    };
    requestAnimationFrame(() => requestAnimationFrame(land));
    if (document.fonts) document.fonts.ready.then(land);
    window.addEventListener('load', land, { once: true });
  }

  const dropHash = () => history.replaceState(history.state, '', location.pathname + location.search);

  if (grid) {
    const goto = take(GOTO_KEY) || hashId(location.hash);
    if (location.hash) dropHash();

    // A # typed into the address while already on the page
    window.addEventListener('hashchange', () => {
      if (byId(hashId(location.hash))) dropHash();
    });

    // Going back to Discography from a release page returns to the card that was clicked
    const spot = take(SPOT_KEY);
    document.addEventListener('click', e => {
      if (e.target.closest('.release-card-link')) keep(SPOT_KEY, String(window.scrollY));
    });

    if (goto === 'discography' && spot !== null) {
      const y = parseInt(spot, 10);
      // Cards past the first few may need showing before that spot exists
      if (moreBtn && !moreBtn.hidden && y > root.scrollHeight - window.innerHeight) moreBtn.click();
      landOn(() => window.scrollTo(0, y));
    } else if (goto && byId(goto)) {
      const target = byId(goto);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      landOn(() => target.scrollIntoView({ block: 'start' }));
    }
  }

  /* ----------------------------------------------------------
     BACK LINKS
     The arrow link at the top of a song, a release, References
     and SyWavy's Florida goes back to the page the visitor came
     from, and to the same spot on it, like the browser's back
     button. Lyrics opened from the Lyrics page go back to Lyrics,
     and lyrics opened from a release go back to that release.
     Next song and Previous song, or another release under More
     from SyWavy, keep the same way back. A visitor who came from
     anywhere else (a search, a shared link, the home page) gets
     the link the page was built with: Lyrics on a song, All
     releases on a release.
     Each page's way back, name, and spot are kept for the tab in
     sessionStorage. The way back also goes in the page's history
     entry, so a reload or the back and forward buttons keep it.
  ---------------------------------------------------------- */
  const PAGES_KEY  = 'sywavy_pages';
  const RETURN_KEY = 'sywavy_return';

  // The address a page goes by, however it was typed
  const pagePath = p => p.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/^\/lyrics$/, '/lyrics/');
  const releaseNames = new Map(D.releases.map(r => [`/${r.id}`, r.title]));
  const kindOf = p => p === '/lyrics/' ? 'hub'
    : p.startsWith('/lyrics/') ? 'song'
    : p === '/references' || p === '/florida' ? 'list'
    : releaseNames.has(p) ? 'release'
    : p === '/' ? 'home' : 'other';

  // The kinds of page each one's back link can lead to. Moving on to a page
  // of its own kind (the next song, another release) keeps the way back.
  const LEADS_TO = { song: ['hub', 'list', 'release'], release: ['hub', 'song'], list: ['hub'] };
  const ALONG = ['song', 'release'];

  const here = pagePath(location.pathname);
  const kind = kindOf(here);

  function pagesSeen() {
    try { return JSON.parse(sessionStorage.getItem(PAGES_KEY)) || {}; } catch (_) { return {}; }
  }
  const seen = path => pagesSeen()[path] || {};
  function remember(path, facts) {
    const all = pagesSeen();
    all[path] = Object.assign(all[path] || {}, facts);
    keep(PAGES_KEY, JSON.stringify(all));
  }

  const NAMES = { '/lyrics/': 'Lyrics', '/references': 'References', '/florida': "SyWavy's Florida" };
  const nameOf = path => NAMES[path] || releaseNames.get(path) || seen(path).name || '';

  // A song's title, for the back link of a release page opened from it
  const songTitle = kind === 'song' && document.querySelector('.song-title');
  if (songTitle) remember(here, { name: songTitle.textContent.trim() });

  // How far down the page was when the visitor left it
  if (kind !== 'home' && kind !== 'other') {
    window.addEventListener('pagehide', () => remember(here, { y: Math.round(window.scrollY) }));
  }

  // The page on this site that opened this one
  function cameFrom() {
    try {
      const url = new URL(document.referrer);
      return url.origin === location.origin ? pagePath(url.pathname) : '';
    } catch (_) { return ''; }
  }

  // The page before this one in the tab's history: null when the browser
  // can't say, and '' when there isn't one on this site
  function pageBefore() {
    const nav = window.navigation;
    if (!nav || !nav.currentEntry || typeof nav.entries !== 'function') return null;
    const prev = nav.entries()[nav.currentEntry.index - 1];
    return prev && prev.url ? pagePath(new URL(prev.url).pathname) : '';
  }

  // Brought here by a back link: land where the visitor left this page, or
  // else on the link to the page they came back from (that song's row)
  let returned = null;
  try { returned = JSON.parse(take(RETURN_KEY)); } catch (_) { /* nothing handed over */ }
  if (returned && returned.to !== here) returned = null;

  if (returned) {
    const y = returned.spot ? seen(here).y : undefined;
    const link = typeof y === 'number' ? null
      : [...document.querySelectorAll('main a[href]')].find(a => a.origin === location.origin && pagePath(a.pathname) === returned.from);
    if (typeof y === 'number') {
      landOn(() => window.scrollTo(0, y));
    } else if (link) {
      landOn(() => link.scrollIntoView({ block: 'center' }));
      link.classList.add('is-landed');
      setTimeout(() => link.classList.remove('is-landed'), 2400);
    }
  }

  const backLink = document.querySelector('.back-link');
  if (backLink && LEADS_TO[kind]) {
    let back = history.state && history.state.sywavyBack;
    if (!back) {
      const from = cameFrom();
      back = { to: '', direct: false };
      if (returned) back.to = seen(here).back || '';
      else if (from && from !== here && kindOf(from) === kind && ALONG.includes(kind)) back.to = seen(from).back || '';
      else if (from && from !== here && LEADS_TO[kind].includes(kindOf(from))) back = { to: from, direct: history.length > 1 };
      try { history.replaceState({ ...(history.state || {}), sywavyBack: back }, ''); } catch (_) { /* a reload just forgets it */ }
    }
    const to = back.to && nameOf(back.to) ? back.to : '';
    remember(here, { back: to });
    // A page the browser kept in memory may have been left with another way back
    window.addEventListener('pageshow', e => { if (e.persisted) remember(here, { back: to }); });

    if (to) {
      backLink.href = to;
      const text = [...backLink.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()).pop();
      if (text) text.textContent = nameOf(to);
    }

    backLink.addEventListener('click', e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const dest = pagePath(new URL(backLink.href, location.href).pathname);
      if (kindOf(dest) === 'home') return; // All releases: the section links above take it from here
      const before = pageBefore();
      if (before === null ? to === dest && back.direct : before === dest) {
        // The page before this one is where the link goes, so step back to it
        // the way the browser's back button does, right where it was left
        e.preventDefault();
        history.back();
        return;
      }
      keep(RETURN_KEY, JSON.stringify({ to: dest, from: here, spot: Boolean(to) }));
    });
  }

})();
