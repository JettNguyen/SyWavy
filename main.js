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
    Spotify: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.52 17.32c-.21.33-.65.44-.98.23-2.68-1.64-6.06-2.01-10.03-1.1-.38.09-.77-.15-.86-.54-.09-.38.15-.77.54-.86 4.35-1 8.1-.57 11.1 1.28.33.21.44.65.23.99zm1.47-3.27c-.27.42-.83.55-1.24.28-3.07-1.89-7.75-2.43-11.38-1.33-.46.14-.94-.12-1.08-.58-.14-.46.12-.94.58-1.08 4.15-1.26 9.31-.65 12.84 1.52.41.27.54.83.28 1.24zm.13-3.4C15.6 8.4 9.97 8.23 6.65 9.23c-.55.17-1.13-.15-1.3-.7-.17-.55.15-1.13.7-1.3 3.83-1.16 10.2-.94 14.22 1.54.5.3.66.94.37 1.43-.29.5-.94.66-1.43.37z"/></svg>`,
    'Apple Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208A6.38 6.38 0 00.05 5.08c-.02.316-.03.634-.05.95v12c.02.317.03.634.05.95.058 1.082.35 2.088.93 3.001.72 1.14 1.715 1.895 3.025 2.258.539.148 1.09.222 1.646.24.278.01.556.014.834.018H18.48c.278-.004.556-.009.834-.018a7.01 7.01 0 001.647-.24c1.31-.363 2.303-1.12 3.025-2.258.578-.913.87-1.919.928-3.001.02-.316.03-.633.05-.95V7.073c-.02-.316-.03-.633-.05-.95zM15.39 14.05v-5.1l-5.51 1.384v5.92c0 .776-.44 1.46-1.13 1.78-.263.122-.55.183-.838.18-.952-.012-1.72-.786-1.71-1.748.013-.95.78-1.713 1.73-1.713.28.004.557.068.81.187v-7.62l7.37-1.852v6.832c0 .776-.44 1.46-1.13 1.78-.262.12-.548.183-.836.18-.952-.012-1.72-.786-1.71-1.748.013-.95.78-1.713 1.73-1.713.28.004.558.067.812.187V14.05z"/></svg>`,
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
      <a href="${l.url}" class="btn-outline" target="_blank" rel="noopener noreferrer" aria-label="Stream on ${l.platform}">
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
      <a href="${l.url}" class="btn-outline" target="_blank" rel="noopener noreferrer" aria-label="Stream ${release.title} on ${l.platform}">
        <span aria-hidden="true">${icon(l.platform)}</span>
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
