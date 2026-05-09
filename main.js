/* ============================================================
   main.js — SyWavy artist site
   Reads from window.SYWAVY (defined in data.js)
   ============================================================ */

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
    // Spotify — circle with three sound-wave arcs (Simple Icons canonical path)
    Spotify: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
    // Apple Music — rounded square badge with beamed music notes cut through (evenodd)
    'Apple Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.05 3H6.95A3.95 3.95 0 003 6.95v10.1A3.95 3.95 0 006.95 21h10.1A3.95 3.95 0 0021 17.05V6.95A3.95 3.95 0 0017.05 3zM15.9 8.1v5.58a2.32 2.32 0 01-1.42 2.14 2.35 2.35 0 01-2.59-.5 2.3 2.3 0 01.35-3.55c.38-.24.82-.36 1.27-.34.21.01.42.05.62.12V9.02l-4.27 1.06v4.73a2.32 2.32 0 01-1.42 2.14 2.35 2.35 0 01-2.59-.5 2.3 2.3 0 01.35-3.55c.38-.24.82-.36 1.27-.34.21.01.42.05.62.12V7.2L15.9 5.4V8.1z"/></svg>`,
    // Instagram — rounded square with circle lens and dot flash
    Instagram: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    // TikTok — musical-note silhouette (Simple Icons canonical path)
    TikTok: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/></svg>`,
    // YouTube — rounded rectangle with play triangle
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
    // Parse as local date to avoid timezone shifts
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    // If day is the 1st, treat as year-only placeholder
    if (d === 1 && m === 1) {
      return String(y);
    }
    if (d === 1) {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

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

    // Base offset raises waves in hero; depth multiplier takes them to near-fullscreen
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

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);

    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollDepth = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;

    if (!waveRafId) waveRafId = requestAnimationFrame(tickWaves);
  }, { passive: true });

  // Position waves immediately on load — don't wait for first scroll event
  tickWaves();

  function closeMenu() {
    navMenu.classList.remove('mobile-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

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

  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ----------------------------------------------------------
     HERO
  ---------------------------------------------------------- */
  document.getElementById('heroName').textContent = D.artist.name;
  document.getElementById('heroDescriptor').textContent = D.artist.descriptor;

  /* ----------------------------------------------------------
     FEATURED RELEASE
  ---------------------------------------------------------- */
  const featured = D.releases.find(r => r.featured);

  if (featured) {
    const wrap = document.getElementById('featuredRelease');

    const linksHTML = featured.links.map(l => `
      <a href="${l.url}" class="btn-outline" data-platform="${l.platform}" target="_blank" rel="noopener noreferrer" aria-label="Stream on ${l.platform}">
        <span class="btn-platform-icon" aria-hidden="true">${icon(l.platform)}</span>
        ${l.platform}
      </a>
    `).join('');

    wrap.innerHTML = `
      <div class="featured-cover-wrap">
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
      </div>
      <div class="featured-info">
        <span class="featured-badge">${featured.type}</span>
        <h2 class="featured-title">${featured.title}</h2>
        ${featured.date ? `<p class="featured-year">${formatDate(featured.date)}</p>` : ''}
        <div class="featured-links">${linksHTML}</div>
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

    const linksHTML = release.links.map(l => `
      <a href="${l.url}" class="btn-outline" data-platform="${l.platform}" target="_blank" rel="noopener noreferrer" aria-label="Stream ${release.title} on ${l.platform}">
        <span class="btn-platform-icon" aria-hidden="true">${icon(l.platform)}</span>
        ${l.platform}
      </a>
    `).join('');

    card.innerHTML = `
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
        <div class="release-card-links">${linksHTML}</div>
      </div>
      <div class="release-card-body">
        <div class="release-card-meta">
          <span class="release-card-type">${release.type}</span>
          <span class="release-card-year">${formatDate(release.date)}</span>
        </div>
        <h3 class="release-card-title">${release.title}</h3>
      </div>
    `;

    return card;
  }

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

  /* ----------------------------------------------------------
     VIDEOS
  ---------------------------------------------------------- */
  const videosGrid = document.getElementById('videosGrid');

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

  /* ----------------------------------------------------------
     ABOUT
  ---------------------------------------------------------- */
  document.getElementById('aboutBio').textContent = D.artist.bio;
  document.getElementById('aboutLocation').textContent = D.artist.location;

  const aboutSocials = document.getElementById('aboutSocials');
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

  /* ----------------------------------------------------------
     CONTACT
  ---------------------------------------------------------- */
  const emailLink = document.getElementById('contactEmail');
  emailLink.href = `mailto:${D.artist.bookingEmail}`;
  emailLink.textContent = D.artist.bookingEmail;

  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

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

  /* ----------------------------------------------------------
     FOOTER
  ---------------------------------------------------------- */
  const year = new Date().getFullYear();
  document.getElementById('footerCopy').textContent =
    `© ${year} ${D.artist.name}. All rights reserved.`;

  const footerSocials = document.getElementById('footerSocials');
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

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER — scroll animations
  ---------------------------------------------------------- */
  function observeCards() {
    const targets = document.querySelectorAll('.animate-on-scroll:not(.visible), .video-item:not(.visible)');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  observeCards();

})();
