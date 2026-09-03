/* ============================================================
   release.js — Individual release page
   Reads ?id=<release-id> from the URL and renders the release.
   Requires data.js and main.js loaded first.
   ============================================================ */

(function () {
  'use strict';

  const D = window.SYWAVY;
  const U = window._SW;
  if (!D || !U) return;

  const { formatDate, typeLabel, escapeHTML, coverImg, streamLinks, buildCard, observeCards } = U;

  const params  = new URLSearchParams(window.location.search);
  const id      = params.get('id');
  const index   = D.releases.findIndex(r => r.id === id);
  const release = D.releases[index];

  if (!release) {
    window.location.replace('/');
    return;
  }

  const container = document.getElementById('releaseContent');
  if (!container) return;

  /* Page metadata */
  const kind = typeLabel(release.type);
  document.title = `${release.title} — SyWavy`;
  const desc = `${release.title}, ${kind.toLowerCase()} by SyWavy${release.date ? ` (${formatDate(release.date)})` : ''}. Stream on Spotify, Apple Music, and more.`;
  const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
  setMeta('meta[name="description"]', desc);
  setMeta('meta[property="og:title"]', `${release.title} — SyWavy`);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[property="og:image"]', `https://sywavy.com/assets/covers/${release.cover}-1000.webp`);
  setMeta('meta[name="twitter:image"]', `https://sywavy.com/assets/covers/${release.cover}-1000.webp`);

  /* Streaming links */
  const links = streamLinks(release, `Stream ${release.title}`);

  /* Spotify player, derived from the Spotify link (no extra data needed) */
  const spotify = (release.links || []).find(l => l.platform === 'Spotify' && /open\.spotify\.com\/(album|track)\/([A-Za-z0-9]+)/.test(l.url));
  let embedHTML = '';
  if (spotify) {
    const [, type, sid] = spotify.url.match(/open\.spotify\.com\/(album|track)\/([A-Za-z0-9]+)/);
    const height = release.type === 'single' ? 152 : 352;
    embedHTML = `
      <div class="release-embed" style="height:${height}px">
        <iframe
          src="https://open.spotify.com/embed/${type}/${sid}?utm_source=generator&theme=0"
          height="${height}"
          title="${escapeHTML(release.title)} on Spotify"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      </div>`;
  }

  /* Optional tracklist (only when data is provided) */
  const tracklist = Array.isArray(release.tracklist) && release.tracklist.length ? release.tracklist : null;
  const tracklistHTML = tracklist ? `
    <div class="release-tracklist">
      <h2 class="tracklist-heading">Tracklist</h2>
      <ol class="tracklist">
        ${tracklist.map((t, i) => {
          const title = typeof t === 'string' ? t : t.title;
          const dur   = typeof t === 'object' && t.duration ? `<span class="track-duration">${escapeHTML(t.duration)}</span>` : '';
          const feat  = typeof t === 'object' && t.features ? `<span class="track-features"> feat. ${escapeHTML(t.features)}</span>` : '';
          return `<li class="track-item"><span class="track-num">${String(i + 1).padStart(2, '0')}</span><span class="track-title">${escapeHTML(title)}${feat}</span>${dur}</li>`;
        }).join('')}
      </ol>
    </div>` : '';

  /* Music video */
  const videoHTML = release.musicVideoId ? `
    <section class="release-section" aria-labelledby="releaseVideoHeading">
      <div class="section-head"><h2 id="releaseVideoHeading" class="section-heading">Music video</h2></div>
      <div class="video-thumb-wrap release-video-thumb-wrap" role="button" tabindex="0" aria-label="Play the ${escapeHTML(release.title)} music video">
        <img src="https://img.youtube.com/vi/${release.musicVideoId}/maxresdefault.jpg"
             data-fallback="https://img.youtube.com/vi/${release.musicVideoId}/hqdefault.jpg"
             alt="" class="video-thumb" width="1280" height="720" decoding="async"
             onload="if(this.naturalWidth<400&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback}"
               onerror="if(this.src!==this.dataset.fallback){this.src=this.dataset.fallback}" />
        <div class="video-play-btn" aria-hidden="true">
          <div class="video-play-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
        </div>
      </div>
    </section>` : '';

  container.innerHTML = `
    <div class="release-page-inner animate-on-scroll">
      <div class="release-page-cover">
        ${coverImg(release, { sizes: '(min-width: 1024px) 340px, (min-width: 640px) 260px, 80vw', cls: 'release-cover-img', extra: 'loading="eager" fetchpriority="high"' })}
      </div>
      <div class="release-page-info">
        <p class="eyebrow">${kind}</p>
        <h1 class="release-page-title">${escapeHTML(release.title)}</h1>
        <p class="release-page-meta">SyWavy${release.date ? ` · ${formatDate(release.date)}` : ''}</p>
        <div class="release-page-links">
          ${links || '<p class="release-coming-soon">Coming soon to all platforms.</p>'}
        </div>
        ${embedHTML}
        ${tracklistHTML}
      </div>
    </div>
    ${videoHTML}
    <section class="release-section" aria-labelledby="relatedHeading">
      <div class="section-head"><h2 id="relatedHeading" class="section-heading">More from SyWavy</h2></div>
      <div class="related-grid" id="relatedGrid"></div>
    </section>`;

  /* Related: the two releases on either side of this one, filled to four */
  const related = [];
  for (let step = 1; related.length < 4 && step < D.releases.length; step++) {
    if (D.releases[index - step]) related.push(D.releases[index - step]);
    if (related.length < 4 && D.releases[index + step]) related.push(D.releases[index + step]);
  }
  related.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const relatedGrid = document.getElementById('relatedGrid');
  related.forEach(r => relatedGrid.appendChild(buildCard(r)));

  observeCards();

  /* Click-to-play music video */
  const thumbWrap = container.querySelector('.release-video-thumb-wrap');
  if (thumbWrap) {
    const loadVideo = () => {
      const wrap = document.createElement('div');
      wrap.className = 'video-iframe-wrap release-video-thumb-wrap';
      wrap.innerHTML = `<iframe
        src="https://www.youtube-nocookie.com/embed/${release.musicVideoId}?autoplay=1&rel=0"
        title="SyWavy – ${escapeHTML(release.title)} (Official Music Video)"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
      thumbWrap.replaceWith(wrap);
    };
    thumbWrap.addEventListener('click', loadVideo);
    thumbWrap.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadVideo(); }
    });
  }

})();
