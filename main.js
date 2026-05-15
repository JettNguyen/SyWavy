/* ============================================================
   main.js — SyWavy artist site
   Reads from window.SYWAVY (defined in data.js)
   ============================================================ */

window._SW = {};

(function () {
  'use strict';

  const D = window.SYWAVY;
  if (!D) {
    console.error('SyWavy data not loaded.');
    return;
  }

  /* ----------------------------------------------------------
     SVG ICONS
  ---------------------------------------------------------- */
  const ICONS = {
    Spotify: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,

    'Apple Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.05 3H6.95A3.95 3.95 0 003 6.95v10.1A3.95 3.95 0 006.95 21h10.1A3.95 3.95 0 0021 17.05V6.95A3.95 3.95 0 0017.05 3zM15.9 8.1v5.58a2.32 2.32 0 01-1.42 2.14 2.35 2.35 0 01-2.59-.5 2.3 2.3 0 01.35-3.55c.38-.24.82-.36 1.27-.34.21.01.42.05.62.12V9.02l-4.27 1.06v4.73a2.32 2.32 0 01-1.42 2.14 2.35 2.35 0 01-2.59-.5 2.3 2.3 0 01.35-3.55c.38-.24.82-.36 1.27-.34.21.01.42.05.62.12V7.2L15.9 5.4V8.1z"/></svg>`,

    'YouTube Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`,

    'Amazon Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.075-1.047-.871-1.234-1.276-1.814-2.106-1.734 1.768-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.642-.383-2.294-.385-.579-1.124-.818-1.775-.818-1.203 0-2.278.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.331c-.259-.057-.547-.266-.472-.66.641-3.38 3.844-4.397 6.722-4.397 1.461 0 3.371.39 4.524 1.494 1.462 1.364 1.322 3.182 1.322 5.163v4.682c0 1.407.583 2.025 1.133 2.786.19.272.232.593-.01.79l-2.265 1.976zm4.51 1.474c-1.806 1.35-4.43 2.073-6.688 2.073-3.162 0-6.006-1.17-8.158-3.119-.169-.153-.018-.361.185-.242 2.322 1.35 5.194 2.162 8.161 2.162 2.001 0 4.202-.414 6.227-1.27.306-.13.562.2.273.396z"/></svg>`,

    Tidal: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004zM8.008 16.004l-4.004-4.004L0 16.004 4.004 20.008l4.004-4.004zm4.004 0l4.004 4.004 4.004-4.004-4.004-4.004-4.004 4.004zm4.004-8.008l-4.004 4.004 4.004 4.004L24 12l-4.004-4.004z"/></svg>`,

    Deezer: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.81 13.17h2.38v1.96h-2.38zm0-3.5h2.38v1.96h-2.38zm-4.06.5h2.38v1.96h-2.38zm0 3h2.38v1.96h-2.38zm-4.06-1h2.38v1.96H10.7zm0 3h2.38v1.96H10.7zm-4.06-2h2.38v1.96H6.63zm0 3h2.38v1.96H6.63zm-4.06-1h2.38v1.96H2.57zm0 3h2.38v1.96H2.57zm16.24-8.5h2.38v1.96h-2.38zm-4.06 1h2.38v1.96h-2.38z"/></svg>`,

    SoundCloud: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.175 12.225c-.015 0-.03.005-.044.007.004-.228.063-.45.163-.635a.98.98 0 01.56-.455c.051-.017.104-.03.158-.038C1.688 11.46 1.38 11.8 1.175 12.225zM24 13.174a3.99 3.99 0 00-3.99-3.99c-.336 0-.662.043-.973.123A5.985 5.985 0 0013.555 5.31a5.985 5.985 0 00-5.985 5.985c0 .132.006.263.016.393H7.57a2.394 2.394 0 000 4.788H20.01A3.99 3.99 0 0024 13.174zM2.38 12.507a1.37 1.37 0 01-.018-.207c0-.756.613-1.37 1.37-1.37.756 0 1.37.614 1.37 1.37v2.387H2.394a1.37 1.37 0 01-.014-2.18zm-1.944.85a1.37 1.37 0 010-2.739c.24 0 .464.063.659.172a2.738 2.738 0 00-.032.417v2.15H.436z"/></svg>`,

    Pandora: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 2.4v19.2h7.459c5.379 0 9.733-4.354 9.733-9.733V2.4H0zm14.984 9.467c0 4.159-3.366 7.525-7.525 7.525H2.208V4.608h12.776v7.259z"/><path d="M5.533 7.467h3.985a2.266 2.266 0 010 4.532H5.533V7.467z"/></svg>`,

    Instagram: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,

    TikTok: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/></svg>`,

    YouTube: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
  };

  function icon(platform) {
    return ICONS[platform] || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  /* ----------------------------------------------------------
     DATE FORMATTER
  ---------------------------------------------------------- */
  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (d === 1 && m === 1) return String(y);
    if (d === 1) return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER — scroll animations
  ---------------------------------------------------------- */
  function observeCards() {
    const targets = document.querySelectorAll('.animate-on-scroll:not(.visible), .video-item:not(.visible)');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      const intersecting = entries.filter(e => e.isIntersecting);
      intersecting.forEach((entry, batchIdx) => {
        const el = entry.target;
        const isCard = el.classList.contains('release-card') || el.classList.contains('video-item');
        const delay = isCard ? batchIdx * 0.07 : 0;

        if (delay > 0) el.style.transitionDelay = `${delay}s`;
        el.classList.add('visible');

        // Clear delay after animation so hover transitions are never deferred
        if (delay > 0) {
          setTimeout(() => { el.style.transitionDelay = ''; }, delay * 1000 + 850);
        }

        observer.unobserve(el);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  // Expose shared utilities for release.js
  window._SW.icon = icon;
  window._SW.formatDate = formatDate;
  window._SW.observeCards = observeCards;

  /* ----------------------------------------------------------
     NAV — scroll class + hamburger toggle
  ---------------------------------------------------------- */
  const nav        = document.getElementById('nav');
  const hamburger   = document.getElementById('navHamburger');
  const navMenu     = document.getElementById('navMenu');
  const waveDepthEl = document.getElementById('waveDepth');
  const root        = document.documentElement;

  /* ----------------------------------------------------------
     WAVE ENGINE — smooth depth-driven RAF loop
  ---------------------------------------------------------- */
  let scrollDepth  = 0;
  let currentDepth = 0;
  let waveRafId    = null;

  function tickWaves() {
    currentDepth += (scrollDepth - currentDepth) * 0.08;

    const backY  = (-20 + currentDepth * -28).toFixed(2);
    const midY   = (-20 + currentDepth * -34).toFixed(2);
    const frontY = (-20 + currentDepth * -40).toFixed(2);

    root.style.setProperty('--back-tf',  `translateY(${backY}vh)`);
    root.style.setProperty('--mid-tf',   `translateY(${midY}vh)`);
    root.style.setProperty('--front-tf', `translateY(${frontY}vh)`);

    if (waveDepthEl) waveDepthEl.style.opacity = (currentDepth * 0.5).toFixed(4);

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
      link.classList.toggle('nav-link-active',
        current !== '' && (href === `#${current}` || href === `/#${current}`)
      );
    });
  }

  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);

    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollDepth = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;

    if (!waveRafId) waveRafId = requestAnimationFrame(tickWaves);

    updateActiveNav();
  }, { passive: true });

  tickWaves();
  updateActiveNav();

  function closeMenu() {
    if (!navMenu || !hamburger) return;
    navMenu.classList.remove('mobile-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('mobile-open');
      if (isOpen) {
        closeMenu();
      } else {
        navMenu.classList.add('mobile-open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Close menu');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (navMenu) {
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ----------------------------------------------------------
     HERO
  ---------------------------------------------------------- */
  const heroNameEl = document.getElementById('heroName');
  const heroDescEl = document.getElementById('heroDescriptor');
  if (heroNameEl) heroNameEl.textContent = D.artist.name;
  if (heroDescEl) heroDescEl.textContent = D.artist.descriptor;

  /* ----------------------------------------------------------
     FEATURED RELEASE
  ---------------------------------------------------------- */
  const featured = D.releases.find(r => r.featured);
  const featuredWrap = document.getElementById('featuredRelease');

  if (featured && featuredWrap) {
    const linksHTML = featured.links
      .filter(l => l.url && l.url !== '#')
      .map(l => `
        <a href="${l.url}" class="btn-outline" data-platform="${l.platform}" target="_blank" rel="noopener noreferrer" aria-label="Stream on ${l.platform}">
          <span class="btn-platform-icon" aria-hidden="true">${icon(l.platform)}</span>
          ${l.platform}
        </a>
      `).join('');

    featuredWrap.innerHTML = `
      <div class="featured-cover-wrap">
        <a href="release.html?id=${featured.id}" class="featured-cover-link" aria-label="View ${featured.title}">
          <img
            src="${featured.coverArt}"
            alt="${featured.title} cover art"
            class="featured-cover"
            width="600"
            height="600"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          />
          <div class="featured-cover-fallback" style="display:none" aria-hidden="true"></div>
        </a>
      </div>
      <div class="featured-info">
        <span class="featured-badge">${featured.type}</span>
        <h2 class="featured-title">${featured.title}</h2>
        ${featured.date ? `<p class="featured-year">${formatDate(featured.date)}</p>` : ''}
        <div class="featured-links">
          ${linksHTML || '<p style="color:var(--color-text-muted);font-size:.9rem">Coming soon to all platforms.</p>'}
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     DISCOGRAPHY
  ---------------------------------------------------------- */
  const grid = document.getElementById('discographyGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function buildCard(release) {
    const card = document.createElement('article');
    card.className = 'release-card animate-on-scroll';
    card.dataset.type = release.type;

    card.innerHTML = `
      <a href="release.html?id=${release.id}" class="release-card-link" aria-label="View ${release.title}">
        <div class="release-card-img-wrap">
          <img
            src="${release.coverArt}"
            alt="${release.title} cover art"
            class="release-card-img"
            width="400"
            height="400"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          />
          <div class="release-card-img-fallback" aria-hidden="true" style="display:none">♪</div>
          <div class="release-card-hover-overlay" aria-hidden="true"><span>Listen</span></div>
        </div>
        <div class="release-card-body">
          <div class="release-card-meta">
            <span class="release-card-type">${release.type}</span>
            <span class="release-card-year">${formatDate(release.date)}</span>
          </div>
          <h3 class="release-card-title">${release.title}</h3>
        </div>
      </a>
    `;

    return card;
  }

  if (grid) {
    D.releases.forEach(r => grid.appendChild(buildCard(r)));

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;
        grid.querySelectorAll('.release-card').forEach(card => {
          const show = filter === 'all' || card.dataset.type === filter;
          card.classList.toggle('hidden', !show);
        });

        observeCards();
      });
    });
  }

  /* ----------------------------------------------------------
     VIDEOS
  ---------------------------------------------------------- */
  const videosGrid = document.getElementById('videosGrid');

  if (videosGrid) {
    D.videos.forEach(v => {
      const item = document.createElement('div');
      item.className = 'video-item';

      const thumbUrl = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
      const isPlaceholder = v.youtubeId === 'YOUTUBE_ID_HERE';

      item.innerHTML = `
        <div class="video-thumb-wrap" role="button" tabindex="0" aria-label="Play ${v.title}">
          ${isPlaceholder
            ? `<div class="video-thumb" style="background:var(--color-surface-2);width:100%;height:100%;display:block;"></div>`
            : `<img src="${thumbUrl}" alt="${v.title} thumbnail" class="video-thumb" loading="lazy" width="480" height="270" />`
          }
          <div class="video-play-btn" aria-hidden="true">
            <div class="video-play-icon">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
        <div class="video-meta">
          <p class="video-title">${v.title}</p>
          ${v.date ? `<p class="video-year">${formatDate(v.date)}</p>` : ''}
        </div>
      `;

      const thumbWrap = item.querySelector('.video-thumb-wrap');

      function loadIframe() {
        if (isPlaceholder) return;
        const iframeWrap = document.createElement('div');
        iframeWrap.className = 'video-iframe-wrap';
        iframeWrap.innerHTML = `<iframe
          src="https://www.youtube.com/embed/${v.youtubeId}?autoplay=1"
          title="${v.title}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>`;
        thumbWrap.replaceWith(iframeWrap);
      }

      thumbWrap.addEventListener('click', loadIframe);
      thumbWrap.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          loadIframe();
        }
      });

      videosGrid.appendChild(item);
    });
  }

  /* ----------------------------------------------------------
     ABOUT
  ---------------------------------------------------------- */
  const aboutBio = document.getElementById('aboutBio');
  const aboutLocation = document.getElementById('aboutLocation');
  const aboutSocials = document.getElementById('aboutSocials');

  if (aboutBio) aboutBio.textContent = D.artist.bio;
  if (aboutLocation) aboutLocation.textContent = D.artist.location;

  if (aboutSocials) {
    D.socials.forEach(s => {
      const a = document.createElement('a');
      a.href = s.url;
      a.className = 'social-icon-link';
      a.dataset.platform = s.platform;
      a.setAttribute('aria-label', s.platform);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.innerHTML = icon(s.platform);
      aboutSocials.appendChild(a);
    });
  }

  /* ----------------------------------------------------------
     CONTACT
  ---------------------------------------------------------- */
  const emailLink = document.getElementById('contactEmail');
  if (emailLink) {
    emailLink.href = `mailto:${D.artist.bookingEmail}`;
    emailLink.textContent = D.artist.bookingEmail;
  }

  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if (form && feedback) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      feedback.className = 'form-feedback';
      feedback.textContent = '';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          feedback.className = 'form-feedback success';
          feedback.textContent = "Message sent — I'll be in touch soon.";
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Something went wrong. Try emailing directly.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  /* ----------------------------------------------------------
     FOOTER
  ---------------------------------------------------------- */
  const year = new Date().getFullYear();
  const footerCopy = document.getElementById('footerCopy');
  if (footerCopy) footerCopy.textContent = `© ${year} ${D.artist.name}. All rights reserved.`;

  const footerSocials = document.getElementById('footerSocials');
  if (footerSocials) {
    D.socials.forEach(s => {
      const a = document.createElement('a');
      a.href = s.url;
      a.className = 'social-icon-link';
      a.dataset.platform = s.platform;
      a.setAttribute('aria-label', s.platform);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.innerHTML = icon(s.platform);
      footerSocials.appendChild(a);
    });
  }

  /* ----------------------------------------------------------
     SCROLL ANIMATIONS
  ---------------------------------------------------------- */
  observeCards();

  /* ----------------------------------------------------------
     SCROLL POSITION — save before leaving, restore on return
  ---------------------------------------------------------- */
  if (document.getElementById('discographyGrid')) {
    // Prevent browser from racing against our manual restore
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    // Save position whenever a release card or featured cover is clicked
    document.addEventListener('click', e => {
      if (e.target.closest('.release-card-link, .featured-cover-link')) {
        sessionStorage.setItem('sywavy_scroll', String(window.scrollY));
      }
    });

    // Restore position after dynamic content is in the DOM
    const saved = sessionStorage.getItem('sywavy_scroll');
    if (saved !== null) {
      sessionStorage.removeItem('sywavy_scroll');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(saved, 10));
        updateActiveNav();
      }));
    }
  }

})();
