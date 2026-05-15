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
  `;

  observeCards();

})();
