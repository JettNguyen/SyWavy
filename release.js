/* ============================================================
   release.js — Individual release landing page
   Reads ?id=<release-id> from URL, renders full release view.
   Requires data.js and main.js loaded first.
   ============================================================ */

(function () {
  'use strict';

  const D = window.SYWAVY;
  const utils = window._SW;
  if (!D || !utils) return;

  const { icon, formatDate, observeCards } = utils;

  const params = new URLSearchParams(window.location.search);
  const releaseId = params.get('id');
  const release = D.releases.find(r => r.id === releaseId);

  if (!release) {
    window.location.replace('/');
    return;
  }

  // Update page title + meta
  document.title = `${release.title} — SyWavy`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = `${release.title} by SyWavy — stream on Spotify, Apple Music, and more.`;
  }

  const container = document.getElementById('releaseContent');
  if (!container) return;

  const typeLabel = { album: 'Album', ep: 'EP', single: 'Single' }[release.type] || release.type;

  // Active streaming links only (skip placeholder #)
  const activeLinks = (release.links || []).filter(l => l.url && l.url !== '#');

  const linksHTML = activeLinks.length
    ? activeLinks.map(l => `
        <a href="${l.url}"
           class="btn-outline release-stream-btn"
           data-platform="${l.platform}"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="Stream ${release.title} on ${l.platform}">
          <span class="btn-platform-icon" aria-hidden="true">${icon(l.platform)}</span>
          ${l.platform}
        </a>
      `).join('')
    : `<p class="release-coming-soon">Coming soon to all platforms.</p>`;

  // Tracklist — only shown for albums/EPs when data is provided
  const tracklist = release.tracklist;
  const showTracklist = release.type !== 'single' && Array.isArray(tracklist) && tracklist.length > 0;

  const tracklistHTML = showTracklist ? `
    <div class="release-tracklist">
      <h2 class="tracklist-heading">Tracklist</h2>
      <ol class="tracklist">
        ${tracklist.map((track, i) => {
          const title = typeof track === 'string' ? track : track.title;
          const dur = (typeof track === 'object' && track.duration) ? track.duration : '';
          const feat = (typeof track === 'object' && track.features) ? `<span class="track-features"> feat. ${track.features}</span>` : '';
          return `
            <li class="track-item">
              <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
              <span class="track-title">${title}${feat}</span>
              ${dur ? `<span class="track-duration">${dur}</span>` : ''}
            </li>
          `;
        }).join('')}
      </ol>
    </div>
  ` : '';

  // Music video — only shown when musicVideoId is set
  const musicVideoHTML = release.musicVideoId ? `
    <div class="release-music-video">
      <h2 class="release-music-video-heading">Featured Music Video</h2>
      <div class="release-video-thumb-wrap"
           data-videoid="${release.musicVideoId}"
           role="button"
           tabindex="0"
           aria-label="Play ${release.title} music video">
        <img
          src="https://img.youtube.com/vi/${release.musicVideoId}/hqdefault.jpg"
          alt="${release.title} music video thumbnail"
          class="video-thumb"
        />
        <div class="video-play-btn" aria-hidden="true">
          <div class="video-play-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="release-page-inner animate-on-scroll">
      <div class="release-page-cover">
        <img
          src="${release.coverArt}"
          alt="${release.title} cover art"
          class="release-cover-img"
          width="600"
          height="600"
          onerror="this.style.opacity='0'"
        />
      </div>
      <div class="release-page-info">
        <span class="featured-badge">${typeLabel}</span>
        <h1 class="release-page-title">${release.title}</h1>
        <p class="release-page-artist-date">
          SyWavy${release.date ? ` · ${formatDate(release.date)}` : ''}
        </p>
        <div class="release-page-links">
          ${linksHTML}
        </div>
        ${tracklistHTML}
      </div>
    </div>
    ${musicVideoHTML}
  `;

  observeCards();

  // Click-to-play music video
  const thumbWrap = container.querySelector('.release-video-thumb-wrap');
  if (thumbWrap) {
    const loadVideo = () => {
      const videoId = thumbWrap.dataset.videoid;
      const iframeWrap = document.createElement('div');
      iframeWrap.className = 'video-iframe-wrap';
      iframeWrap.innerHTML = `<iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        title="${release.title} music video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>`;
      thumbWrap.replaceWith(iframeWrap);
    };
    thumbWrap.addEventListener('click', loadVideo);
    thumbWrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadVideo(); } });
  }

})();
