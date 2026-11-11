/* ============================================================
   build-pages.js: the markup for the lyrics pages, for build.js
   - a page per song (sywavy.com/lyrics/3am) with its notes
   - the lyrics hub (sywavy.com/lyrics/)
   - every reference across the songs (sywavy.com/references)
   - the Florida places the songs name, on a map (sywavy.com/florida)
   - a "track by track" section for albums with an arc
   The words come from lyrics/ and the notes from lyrics/notes/.
   ============================================================ */

const PLACE_FILE = 'places.json';

// Featured artists, from the credits on each release
const FEATURES = {
  overture: 'Jett2Fly',
  'intrusive-thoughts': 'Kuy',
  'botanical-gardens': 'The Part Time Models',
  'catch-flights-and-cry': 'The Part Time Models',
  shadows: 'The Part Time Models',
  'put-it-on': 'The Part Time Models'
};

// The picture each album's track by track is drawn with
const ARC_MOTIF = {
  'japanese-cherry-blossom': 'blossom',
  'wavy-life': 'tide',
  'flight-370': 'flight'
};

const KIND_LABEL = { reference: 'Reference', story: 'The story', studio: 'From the studio' };

const CATEGORY_LABEL = {
  athlete: 'Athletes',
  team: 'Teams',
  musician: 'Artists and songs',
  'film-tv': 'Film and TV',
  'anime-cartoon': 'Anime and cartoons',
  game: 'Games',
  place: 'Places',
  brand: 'Brands and fashion',
  person: 'People',
  other: 'Everything else'
};

// The same kinds, one at a time, for the label on a note
const CATEGORY_ONE = {
  athlete: 'Athlete',
  team: 'Team',
  musician: 'Music',
  'film-tv': 'Film and TV',
  'anime-cartoon': 'Animation',
  game: 'Game',
  place: 'Place',
  brand: 'Brand',
  person: 'Person',
  other: 'Reference'
};

// The same hue at half lightness and strong saturation (for tinted fills)
function deepen([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const s = 0.8, l = 0.5, c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r1, g1, b1].map(v => Math.round((v + m) * 255));
}

const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CLOSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const BACK  = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

module.exports = function pages({ D, R, songs, byRelease, arcs, places = {}, colors = {} }) {
  const { escapeHTML: esc, typeLabel, formatDate } = R;
  const byId = new Map(D.releases.map(r => [r.id, r]));
  const year = r => (r.date || '').slice(0, 4);
  const pad = n => String(n).padStart(2, '0');
  const lineLabel = ([a, b]) => (a === b ? `Line ${a}` : `Lines ${a} to ${b}`);
  const songHref = s => `/lyrics/${s.slug}`;
  const hasLyrics = s => s.lines.length > 0;
  const notesOf = s => s.notes || [];

  // The release a song's page belongs to: the album, unless it's only a single
  const homeOf = s => byId.get(s.releaseId);
  const singleOf = s => s.releaseIds.map(id => byId.get(id)).find(r => r.type === 'single' && r.id !== s.releaseId);

  const cover = (r, size, cls = '') =>
    `<img src="/assets/covers/${r.cover}-480.webp" alt="" class="${cls}" width="${size}" height="${size}" loading="lazy" decoding="async" />`;

  // Each release's color, picked from its cover by build-colors.py. Pages set it
  // as --art (and --art-rgb for see-through tints) on the part that belongs to it.
  // --art-deep is the same hue, darker and stronger: a light color thinned over
  // black turns muddy, so see-through fills use this one instead.
  const artVars = r => {
    const hex = (r && colors[r.cover]) || '#56e2d3';
    const n = parseInt(hex.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return `--art: ${hex}; --art-rgb: ${rgb.join(', ')}; --art-deep: ${deepen(rgb).join(', ')}`;
  };
  // The cover again, blurred, as colored light behind it
  const glow = r => `<span class="art-glow" aria-hidden="true">${cover(r, 480)}</span>`;

  const noteCount = s => {
    const n = notesOf(s).length;
    return n ? `<span class="lyrics-note-count">${n} ${n === 1 ? 'note' : 'notes'}</span>` : '';
  };

  /* ----------------------------------------------------------
     SONG PAGE
  ---------------------------------------------------------- */
  function songPage(song) {
    const rel = homeOf(song);
    const single = singleOf(song);
    const list = byRelease.get(song.releaseId) || [song];
    const i = list.indexOf(song);
    const prev = list[i - 1], next = list[i + 1];
    const notes = notesOf(song);
    const feat = FEATURES[song.slug];

    // Which notes cover each line
    const covering = song.lines.map(l => notes.map((n, k) => (l.n >= n.lines[0] && l.n <= n.lines[1] ? k : -1)).filter(k => k >= 0));

    const verses = [];
    for (const l of song.lines) {
      if (l.verseStart || !verses.length) verses.push([]);
      verses[verses.length - 1].push(l);
    }

    const lineHTML = l => {
      const on = covering[l.n - 1];
      if (!on.length) return `<span class="line" id="line-${l.n}" data-line="${l.n}">${esc(l.text)}</span>`;
      return `<span class="line noted" id="line-${l.n}" data-line="${l.n}" data-notes="${on.join(' ')}" tabindex="0" role="button" aria-controls="${on.map(k => `note-${k}`).join(' ')}">${esc(l.text)}</span>`;
    };

    const lyricsHTML = hasLyrics(song)
      ? `<div class="lyrics" id="lyrics">${verses.map(v => `${v[0].tag ? `<p class="verse-tag">${esc(v[0].tag)}</p>` : ''}<p class="verse">${v.map(lineHTML).join('')}</p>`).join('')}</div>`
      : `<p class="lyrics-missing">The lyrics for this one aren't up yet.</p>`;

    const noteHTML = (n, k) => `
          <article class="note note-${n.kind}" id="note-${k}" data-from="${n.lines[0]}" data-to="${n.lines[1]}">
            <p class="note-meta">${n.kind === 'reference'
              ? `<span class="note-kind" data-cat="${n.ref.category}">${CATEGORY_ONE[n.ref.category] || KIND_LABEL.reference}</span>`
              : `<span class="note-kind">${KIND_LABEL[n.kind]}</span>`}<span>${lineLabel(n.lines)}</span>${n.draft ? '<span class="note-draft">Draft</span>' : ''}</p>
            ${n.title ? `<h3 class="note-title">${esc(n.title)}</h3>` : ''}
            <p class="note-body">${esc(n.body)}</p>
          </article>`;

    const notesHTML = notes.length ? `
      <aside class="song-notes" id="songNotes" aria-label="Notes on the lyrics">
        <div class="song-notes-panel">
          <div class="song-notes-head">
            <p class="song-notes-hint">${notes.length} ${notes.length === 1 ? 'note' : 'notes'}. Tap a highlighted line to read it.</p>
            <button class="song-notes-close" type="button" aria-label="Close notes">${CLOSE}</button>
          </div>
          <div class="song-notes-list">${notes.map(noteHTML).join('')}</div>
        </div>
      </aside>` : '';

    const kicker = `Lyrics<span>Track ${song.track} on ${esc(rel.title)}</span>${single && single.id !== rel.id ? `<span>Single, ${esc(formatDate(single.date))}</span>` : ''}`;
    const listenOn = single || rel;
    const links = R.streamLinks ? R.streamLinks(listenOn, `Stream ${song.title}`) : '';

    const step = (s, dir) => {
      if (!s) return '<span></span>';
      const arrow = `<span class="song-step-arrow" aria-hidden="true">${dir === 'prev' ? BACK : ARROW}</span>`;
      const text = `<span class="song-step-text"><span class="song-step-label">${dir === 'prev' ? 'Previous song' : 'Next song'}</span><span class="song-step-title">${esc(s.title)}</span></span>`;
      return `
        <a href="${songHref(s)}" class="song-step song-step-${dir}" rel="${dir}">${dir === 'prev' ? arrow + text : text + arrow}</a>`;
    };

    const tracklist = list.length > 1 ? `
      <section class="release-section" aria-labelledby="tracksHeading">
        <div class="section-head"><h2 id="tracksHeading" class="section-heading section-heading-sm">${esc(rel.title)}</h2><a href="/${rel.id}" class="text-link">The ${typeLabel(rel.type) === 'EP' ? 'EP' : typeLabel(rel.type).toLowerCase()} ${ARROW}</a></div>
        ${tracksHTML(rel, song)}
      </section>` : '';

    return `
      <div class="song-page" style="${artVars(rel)}">
      <a href="/${rel.id}" class="back-link">${BACK}${esc(rel.title)}</a>
      <div class="song-head animate-on-scroll">
        <a href="/${rel.id}" class="song-cover" aria-label="${esc(rel.title)}">${glow(rel)}${cover(rel, 480, 'song-cover-img')}</a>
        <div class="song-head-text">
          <p class="kicker">${kicker}</p>
          <h1 class="song-title">${esc(song.title)}</h1>
          <p class="song-artist">SyWavy${feat ? `<span> feat. ${esc(feat)}</span>` : ''}</p>
        </div>
        ${links ? `<div class="stream-links">${links}</div>` : ''}
      </div>
      <div class="song-body${notes.length ? ' has-notes' : ''}">
        ${lyricsHTML}
        ${notesHTML}
      </div>
      ${prev || next ? `<nav class="song-steps" aria-label="More songs">${step(prev, 'prev')}${step(next, 'next')}</nav>` : ''}
      ${tracklist}
      </div>`;
  }

  /* A release's songs, each linking to its lyrics */
  function tracksHTML(release, current) {
    const list = byRelease.get(release.id) || [];
    return `<ol class="tracklist lyrics-tracklist">${list.map(s => {
      const inner = `<span class="track-num">${pad(s.track)}</span><span class="track-title">${esc(s.title)}</span>${noteCount(s)}`;
      if (!hasLyrics(s)) return `<li class="track-item"><span class="track-link is-empty">${inner}<span class="lyrics-note-count">Lyrics soon</span></span></li>`;
      const here = current && s === current;
      return `<li class="track-item${here ? ' is-current' : ''}"><a href="${songHref(s)}" class="track-link"${here ? ' aria-current="page"' : ''}>${inner}</a></li>`;
    }).join('')}</ol>`;
  }

  /* What a release page adds: its lyrics, and its track by track if it has one */
  function releaseExtras(release) {
    const list = byRelease.get(release.id) || [];
    if (!list.length) return {};
    const tracks = list.length === 1
      ? (hasLyrics(list[0]) ? `<a href="${songHref(list[0])}" class="text-link release-lyrics-link">Read the lyrics${notesOf(list[0]).length ? ` and ${notesOf(list[0]).length} notes` : ''} ${ARROW}</a>` : '')
      : `<div class="release-tracklist"><h2 class="tracklist-heading">Tracklist and lyrics</h2>${tracksHTML(release)}</div>`;
    return { tracks, arc: arcSection(release) };
  }

  /* ----------------------------------------------------------
     TRACK BY TRACK (albums with an arc)
  ---------------------------------------------------------- */
  function arcSection(release) {
    const arc = arcs.get(release.id);
    if (!arc) return '';
    const list = byRelease.get(release.id) || [];
    const motif = ARC_MOTIF[release.id] || 'tide';
    return `
    <section class="release-section arc" data-motif="${motif}" style="${artVars(release)}" aria-labelledby="arcHeading">
      <div class="section-head"><h2 id="arcHeading" class="section-heading section-heading-sm">Track by track</h2>${arc.draft ? '<span class="note-draft">Draft</span>' : ''}</div>
      ${arc.summary ? `<p class="arc-summary">${esc(arc.summary)}</p>` : ''}
      <div class="arc-body">
        <svg class="arc-path" aria-hidden="true"><path class="arc-path-base" /><path class="arc-path-drawn" /></svg>
        <ol class="arc-list">${list.map(s => `
          <li class="arc-stop animate-on-scroll">
            <span class="arc-mark" aria-hidden="true"></span>
            <a href="${songHref(s)}" class="arc-title"><span class="track-num">${pad(s.track)}</span>${esc(s.title)}</a>
            ${arc.tracks && arc.tracks[s.track] ? `<p class="arc-line">${esc(arc.tracks[s.track])}</p>` : ''}
          </li>`).join('')}
        </ol>
      </div>
    </section>`;
  }

  /* ----------------------------------------------------------
     LYRICS HUB
  ---------------------------------------------------------- */
  // References and the map only go up once they have published notes on them
  const refCount = () => collectRefs().length;
  const floridaCount = () => collectRefs().filter(e => e.category === 'place' && e.place && e.place.florida).length;

  function hubPage() {
    const shown = D.releases.filter(r => (byRelease.get(r.id) || []).some(s => s.releaseId === r.id));
    const total = songs.filter(hasLyrics).length;
    const noted = songs.reduce((n, s) => n + notesOf(s).length, 0);
    const studio = songs.some(s => notesOf(s).some(n => n.kind === 'studio'));
    return `
      <header class="page-head animate-on-scroll">
        <h1 class="section-heading">Lyrics<span class="section-count">${total}</span></h1>
        <p class="page-intro">Every SyWavy song${noted ? `, with ${noted} notes on the lines: who and what he's naming${studio ? ', the stories behind them, and how they were made' : ' and the stories behind them'}` : ''}.</p>
        ${refCount() || floridaCount() ? `<div class="page-links">
          ${refCount() ? '<a href="/references" class="btn-outline">References</a>' : ''}
          ${floridaCount() ? `<a href="/florida" class="btn-outline">SyWavy's Florida</a>` : ''}
        </div>` : ''}
      </header>
      <div class="lyrics-releases">${shown.map(r => `
        <section class="lyrics-release animate-on-scroll" style="${artVars(r)}" aria-labelledby="lr-${r.id}">
          <a href="/${r.id}" class="lyrics-release-cover" tabindex="-1" aria-hidden="true">${glow(r)}${cover(r, 480, 'lyrics-release-img')}</a>
          <div class="lyrics-release-text">
            <p class="kicker">${typeLabel(r.type)}<span>${year(r)}</span></p>
            <h2 class="lyrics-release-title" id="lr-${r.id}"><a href="/${r.id}">${esc(r.title)}</a></h2>
            ${tracksHTML(r)}
          </div>
        </section>`).join('')}
      </div>`;
  }

  /* ----------------------------------------------------------
     REFERENCES
  ---------------------------------------------------------- */
  function collectRefs() {
    const map = new Map();
    for (const s of songs) {
      for (const n of notesOf(s)) {
        if (n.kind !== 'reference') continue;
        const key = n.ref.name.toLowerCase();
        if (!map.has(key)) map.set(key, { name: n.ref.name, category: n.ref.category, body: n.body, draft: n.draft, place: n.ref.place, uses: [] });
        const e = map.get(key);
        if (!e.uses.some(u => u.song === s)) e.uses.push({ song: s, line: n.lines[0] });
      }
    }
    return [...map.values()];
  }

  // Each song wears its release's color, so a list of them shows where they come from
  const useLinks = e => e.uses.map(u => `<a href="${songHref(u.song)}" data-line="${u.line}" class="ref-song" style="${artVars(homeOf(u.song))}">${esc(u.song.title)}</a>`).join('');

  function referencesPage() {
    const refs = collectRefs();
    const cats = Object.keys(CATEGORY_LABEL).filter(c => refs.some(r => r.category === c));
    return `
      <header class="page-head animate-on-scroll">
        <a href="/lyrics/" class="back-link">${BACK}Lyrics</a>
        <h1 class="section-heading">References<span class="section-count">${refs.length}</span></h1>
        <p class="page-intro">Every athlete, artist, show, game, brand and place SyWavy names in his songs, and where to find them.</p>
        <div class="ref-filters" role="group" aria-label="Show one kind">
          <button type="button" class="ref-filter is-on" data-cat="" aria-pressed="true">All</button>
          ${cats.map(c => `<button type="button" class="ref-filter" data-cat="${c}" aria-pressed="false">${CATEGORY_LABEL[c]}</button>`).join('')}
        </div>
      </header>
      ${cats.map(c => `
      <section class="ref-group" data-cat="${c}" aria-labelledby="ref-${c}">
        <h2 class="ref-group-title" id="ref-${c}">${CATEGORY_LABEL[c]}</h2>
        <div class="ref-grid">${refs.filter(r => r.category === c).sort((a, b) => a.name.localeCompare(b.name)).map(e => `
          <article class="ref animate-on-scroll">
            <h3 class="ref-name">${esc(e.name)}${e.draft ? '<span class="note-draft">Draft</span>' : ''}</h3>
            <p class="ref-body">${esc(e.body)}</p>
            <p class="ref-songs">${useLinks(e)}</p>
          </article>`).join('')}
        </div>
      </section>`).join('')}`;
  }

  /* ----------------------------------------------------------
     SYWAVY'S FLORIDA
     A fine-line outline of the state, drawn from rough coastline
     points (longitude, latitude), with a pin for each place.
  ---------------------------------------------------------- */
  const FLORIDA = [
    [-87.63, 30.99], [-86.5, 31.0], [-85.0, 31.0], [-84.86, 30.71], [-83.6, 30.65], [-82.22, 30.57],
    [-82.04, 30.75], [-81.7, 30.75], [-81.44, 30.71], [-81.39, 30.4], [-81.3, 29.9], [-81.2, 29.6],
    [-81.02, 29.21], [-80.9, 28.95], [-80.6, 28.6], [-80.53, 28.47], [-80.6, 28.1], [-80.45, 27.75],
    [-80.2, 27.2], [-80.03, 26.7], [-80.07, 26.3], [-80.1, 26.1], [-80.12, 25.78], [-80.2, 25.6],
    [-80.33, 25.4], [-80.42, 25.22], [-80.65, 25.2], [-80.92, 25.14], [-81.09, 25.12], [-81.15, 25.35],
    [-81.35, 25.8], [-81.73, 25.93], [-81.8, 26.13], [-81.95, 26.45], [-82.17, 26.5], [-82.25, 26.75],
    [-82.4, 27.0], [-82.58, 27.35], [-82.72, 27.5], [-82.68, 27.58], [-82.45, 27.7], [-82.42, 27.94],
    [-82.62, 27.99], [-82.62, 27.8], [-82.64, 27.68], [-82.73, 27.62], [-82.74, 27.72], [-82.83, 27.97],
    [-82.8, 28.15], [-82.68, 28.45], [-82.65, 28.7], [-82.75, 28.9], [-83.03, 29.13], [-83.15, 29.3],
    [-83.4, 29.65], [-83.7, 29.95], [-84.05, 30.1], [-84.35, 29.95], [-84.55, 29.85], [-84.98, 29.72],
    [-85.35, 29.67], [-85.4, 29.85], [-85.65, 30.1], [-86.0, 30.25], [-86.5, 30.39], [-86.9, 30.37],
    [-87.2, 30.33], [-87.5, 30.28], [-87.6, 30.5]
  ];
  const KEYS = [[-80.45, 25.1], [-80.7, 24.9], [-81.05, 24.72], [-81.4, 24.62], [-81.78, 24.55]];

  const W = 1000, H = 920;
  const LON0 = -87.8, LON1 = -79.8, LAT0 = 24.3, LAT1 = 31.2;
  const kx = W / (LON1 - LON0);
  const ky = kx / Math.cos(27.5 * Math.PI / 180);
  const px = ([lon, lat]) => [((lon - LON0) * kx).toFixed(1), ((LAT1 - lat) * ky).toFixed(1)];
  const VIEW_H = Math.ceil((LAT1 - LAT0) * ky);

  function floridaPage() {
    const all = collectRefs().filter(e => e.category === 'place' && e.place && e.place.florida);
    const pinned = all.filter(e => places[e.name]);
    const outline = 'M' + FLORIDA.map(p => px(p).join(' ')).join(' L') + ' Z';
    const keys = 'M' + KEYS.map(p => px(p).join(' ')).join(' L');
    const home = px([-82.64, 27.77]);

    // Places closer than a pin's width on the map (the Trop is in St. Pete) share one pin
    const clusters = [];
    pinned.forEach((e, k) => {
      const [lat, lon] = places[e.name];
      const [x, y] = px([lon, lat]).map(Number);
      const near = clusters.find(c => Math.hypot(c.x - x, c.y - y) < 26);
      if (near) { near.keys.push(k); near.names.push(e.name); } else clusters.push({ x, y, keys: [k], names: [e.name] });
    });
    const pins = clusters.map(c => `<g class="fl-pin" data-place="${c.keys.join(' ')}" transform="translate(${c.x} ${c.y})" tabindex="0" role="button" aria-label="${esc(c.names.length > 1 ? `${c.names.slice(0, -1).join(', ')} and ${c.names[c.names.length - 1]}` : c.names[0])}"><circle r="16" class="fl-pin-hit" /><circle r="6" class="fl-pin-dot" /></g>`).join('');

    return `
      <header class="page-head animate-on-scroll">
        <a href="/lyrics/" class="back-link">${BACK}Lyrics</a>
        <h1 class="section-heading">SyWavy's Florida<span class="section-count">${all.length}</span></h1>
        <p class="page-intro">The Florida places his songs name, from the Trop to the beach. Tap a place to see the songs.</p>
      </header>
      <div class="fl-layout">
        <figure class="fl-map animate-on-scroll">
          <svg viewBox="0 0 ${W} ${VIEW_H}" role="img" aria-label="Map of Florida with the places SyWavy's songs name">
            <path class="fl-outline" d="${outline}" />
            <path class="fl-keys" d="${keys}" />
            <g class="fl-home" transform="translate(${home[0]} ${home[1]})"><circle r="14" /><text x="22" y="6">St. Pete</text></g>
            ${pins}
          </svg>
        </figure>
        <ol class="fl-places">${pinned.concat(all.filter(e => !places[e.name])).map((e, k) => `
          <li class="fl-place${k < pinned.length ? '' : ' is-unpinned'}" data-place="${k < pinned.length ? k : ''}">
            <h2 class="fl-place-name">${esc(e.name)}${e.draft ? '<span class="note-draft">Draft</span>' : ''}</h2>
            <p class="fl-place-body">${esc(e.body)}</p>
            <p class="ref-songs">${useLinks(e)}</p>
          </li>`).join('')}
        </ol>
      </div>`;
  }

  return { songPage, hubPage, referencesPage, floridaPage, releaseExtras, collectRefs, refCount, floridaCount, PLACE_FILE };
};
