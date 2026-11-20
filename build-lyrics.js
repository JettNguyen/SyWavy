/* ============================================================
   build-lyrics.js: reads the lyrics and notes for build.js
   - lyrics/<date>-<release id>.md holds one release, with
     "## 1. Title" before each song. Every line that isn't blank
     is numbered from 1 within its song, and a blank line starts
     a new verse. A line in square brackets, like [Kuy], names
     who's on the lines after it and isn't numbered.
   - lyrics/notes/<release id>.json holds the notes for that
     release. A note points at line numbers, never at the words,
     so editing a note never touches the lyrics.
   Notes with "draft": true only show when the site is built with
   --drafts, so nothing goes live before it's been read.

   To see a song's line numbers while writing notes:
     node build-lyrics.js number <release id>
   ============================================================ */

const fs   = require('fs');
const path = require('path');

const LYRICS = path.join(__dirname, 'lyrics');
const NOTES  = path.join(LYRICS, 'notes');

const KINDS = ['reference', 'story', 'studio'];
const CATEGORIES = ['athlete', 'team', 'musician', 'film-tv', 'anime-cartoon', 'game', 'place', 'brand', 'person', 'other'];

// "Keys'" becomes keys, "? (Cry)" becomes cry, "3AM" becomes 3am
const slugify = s => String(s).toLowerCase()
  .replace(/['’]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// Titles match across a single and an album even when one adds "(feat. ...)"
const sameSong = (a, b) => slugify(a.replace(/\s*\((feat|ft)\.[^)]*\)/i, '')) === slugify(b.replace(/\s*\((feat|ft)\.[^)]*\)/i, ''));

function parseRelease(file) {
  const text = fs.readFileSync(file, 'utf8');
  const parts = text.split(/^## /m).slice(1);
  return parts.map(part => {
    const [head, ...body] = part.split('\n');
    const m = head.match(/^(\d+)\.\s+(.+?)\s*$/);
    if (!m) throw new Error(`${path.basename(file)}: can't read the song heading "${head}"`);
    const lines = [];
    let gap = false;
    let tag = null;
    for (const raw of body) {
      const t = raw.trim();
      if (!t) { gap = lines.length > 0; continue; }
      // A line in square brackets, like [Kuy], says who's on the next lines. It isn't counted,
      // so adding one never moves the notes.
      const isTag = t.match(/^\[(.+)\]$/);
      if (isTag) { tag = isTag[1].trim(); continue; }
      lines.push({ n: lines.length + 1, text: t, verseStart: gap || lines.length === 0 || Boolean(tag), ...(tag ? { tag } : {}) });
      gap = false;
      tag = null;
    }
    return { track: Number(m[1]), title: m[2], lines };
  });
}

/* Every song, once, with the releases it's on */
function loadSongs(releases) {
  const byId = new Map(releases.map(r => [r.id, r]));
  const songs = [];
  const byRelease = new Map();

  const files = fs.existsSync(LYRICS) ? fs.readdirSync(LYRICS).filter(f => /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(f)) : [];
  for (const f of files) {
    const releaseId = f.slice(11, -3);
    const release = byId.get(releaseId);
    if (!release) throw new Error(`lyrics/${f}: no release "${releaseId}" in data.js`);
    const list = parseRelease(path.join(LYRICS, f)).map(s => ({ ...s, releaseId, releaseIds: [releaseId] }));
    byRelease.set(releaseId, list);
    songs.push(...list);
  }

  // A single whose song is filed under an album points to that song
  for (const r of releases) {
    if (byRelease.has(r.id) || r.type !== 'single') continue;
    const song = songs.find(s => sameSong(s.title, r.title));
    if (song) { song.releaseIds.push(r.id); byRelease.set(r.id, [song]); }
  }

  // Addresses: the title, plus the release if two songs share a title
  const taken = new Map();
  for (const s of songs) {
    let slug = slugify(s.title) || `track-${s.track}`;
    if (taken.has(slug)) slug = `${slug}-${s.releaseId}`;
    taken.set(slug, s);
    s.slug = slug;
  }
  return { songs, byRelease };
}

const isText = t => typeof t === 'string' && t.trim();

/* The beat under a song: its tempo, key and length, a few plain sentences on how
   it's built, and the gear. Keys are written like "F minor" or "Ab major". */
function checkBeat(b, at) {
  if (b.tempo !== undefined && !(typeof b.tempo === 'number' && b.tempo > 0)) throw new Error(`${at}: tempo must be a number`);
  if (b.key !== undefined && !/^[A-G][b#]? (major|minor)$/.test(b.key)) throw new Error(`${at}: key must look like "F minor" or "Ab major"`);
  if (b.length !== undefined && !/^\d+:[0-5]\d$/.test(b.length)) throw new Error(`${at}: length must look like "2:59"`);
  if (b.text !== undefined && !isText(b.text)) throw new Error(`${at}: text is empty`);
  if (b.gear !== undefined && !(Array.isArray(b.gear) && b.gear.length && b.gear.every(isText))) throw new Error(`${at}: gear must be a list of names`);
  if (![b.tempo, b.key, b.length, b.text].some(x => x !== undefined)) throw new Error(`${at}: needs a tempo, key, length or text`);
}

/* Notes, checked against the lyrics so a note can't point past a song */
function loadNotes(byRelease, { drafts = false } = {}) {
  const arcs = new Map();
  const sounds = new Map();
  if (!fs.existsSync(NOTES)) return { arcs, sounds };
  for (const f of fs.readdirSync(NOTES).filter(f => f.endsWith('.json'))) {
    const releaseId = f.slice(0, -5);
    if (releaseId === 'places') continue;
    const where = `lyrics/notes/${f}`;
    const list = byRelease.get(releaseId);
    if (!list) throw new Error(`${where}: no lyrics for release "${releaseId}"`);
    const data = JSON.parse(fs.readFileSync(path.join(NOTES, f), 'utf8'));

    if (data.arc && (drafts || !data.arc.draft)) arcs.set(releaseId, data.arc);
    // A short paragraph on how the project sounds and how it was made. A single
    // can have just its inspirations, with no paragraph.
    if (data.sound) {
      const s = data.sound;
      const insp = s.inspirations || [];
      if (s.text !== undefined && !isText(s.text)) throw new Error(`${where}: sound text is empty`);
      if (s.text === undefined && !insp.length) throw new Error(`${where}: sound needs its text or inspirations`);
      // draftText is new wording for a published text, waiting to be read
      if (s.draftText !== undefined && !(isText(s.draftText) && s.text !== undefined)) throw new Error(`${where}: sound draftText needs text to replace`);
      // What a song's beat came from. No track means the whole project.
      insp.forEach((x, i) => {
        const at = `${where} sound inspiration ${i + 1}`;
        if (!isText(x.text)) throw new Error(`${at}: needs its text`);
        if (x.draftText !== undefined && !isText(x.draftText)) throw new Error(`${at}: draftText is empty`);
        if (x.track !== undefined && !list.some(s => s.track === x.track)) throw new Error(`${at}: no track ${x.track}`);
      });
      const swap = x => (drafts && x.draftText ? { ...x, text: x.draftText, draft: true } : x);
      const sound = {
        ...swap(s),
        inspirations: insp.map(swap).filter(x => drafts || !x.draft)
      };
      if ((drafts || !s.draft) && (sound.text || sound.inspirations.length)) sounds.set(releaseId, sound);
    }

    for (const [track, entry] of Object.entries(data.songs || {})) {
      const song = list.find(s => s.track === Number(track));
      if (!song) throw new Error(`${where}: no track ${track}`);
      if (entry.title && !sameSong(entry.title, song.title)) throw new Error(`${where}: track ${track} is "${song.title}", not "${entry.title}"`);
      if (entry.beat) {
        checkBeat(entry.beat, `${where} track ${track} beat`);
        if (drafts || !entry.beat.draft) song.beat = entry.beat;
      }
      song.notes = (song.notes || []).concat((entry.notes || []).filter(n => drafts || !n.draft).map((n, i) => {
        const at = `${where} track ${track} note ${i + 1}`;
        if (!KINDS.includes(n.kind)) throw new Error(`${at}: kind must be one of ${KINDS.join(', ')}`);
        const [a, b = a] = n.lines || [];
        if (!(a >= 1 && b >= a && b <= song.lines.length)) throw new Error(`${at}: lines ${a}-${b} aren't in the song (it has ${song.lines.length})`);
        if (n.kind === 'reference' && !(n.ref && n.ref.name && CATEGORIES.includes(n.ref.category))) {
          throw new Error(`${at}: a reference needs ref.name and ref.category (${CATEGORIES.join(', ')})`);
        }
        return { ...n, lines: [a, b] };
      }));
      song.notes.sort((x, y) => x.lines[0] - y.lines[0]);
    }
  }
  return { arcs, sounds };
}

module.exports = { loadSongs, loadNotes, slugify, KINDS, CATEGORIES };

/* node build-lyrics.js number <release id>   (line numbers for writing notes)
   node build-lyrics.js check                 (checks every notes file, drafts included) */
if (require.main === module) {
  const [cmd, id] = process.argv.slice(2);
  if (cmd === 'check') {
    const vm = require('vm');
    const sandbox = vm.createContext({ window: {} });
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8'), sandbox);
    const { songs, byRelease } = loadSongs(sandbox.window.SYWAVY.releases);
    const { arcs, sounds } = loadNotes(byRelease, { drafts: true });
    const count = k => songs.reduce((n, s) => n + (s.notes || []).filter(x => x.kind === k).length, 0);
    console.log(`Notes are valid: ${KINDS.map(k => `${count(k)} ${k}`).join(', ')}, on ${songs.filter(s => (s.notes || []).length).length} songs; ${arcs.size} album arcs; ${[...sounds.values()].filter(s => s.text).length} sound paragraphs; ${[...sounds.values()].reduce((n, s) => n + s.inspirations.length, 0)} inspirations; ${songs.filter(s => s.beat).length} beats.`);
    process.exit(0);
  }
  if (cmd !== 'number' || !id) { console.log('usage: node build-lyrics.js number <release id> | check'); process.exit(1); }
  const file = fs.readdirSync(LYRICS).find(f => f.slice(11, -3) === id);
  if (!file) { console.log(`no lyrics file for "${id}"`); process.exit(1); }
  for (const s of parseRelease(path.join(LYRICS, file))) {
    console.log(`\n## ${s.track}. ${s.title} (${s.lines.length} lines)`);
    for (const l of s.lines) console.log(`${l.verseStart && l.n > 1 ? '\n' : ''}${String(l.n).padStart(3)}  ${l.text}`);
  }
}
