/* ============================================================
   build-lyrics.js: reads the lyrics and notes for build.js
   - lyrics/<date>-<release id>.md holds one release, with
     "## 1. Title" before each song. Every line that isn't blank
     is numbered from 1 within its song, and a blank line starts
     a new verse.
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
    for (const raw of body) {
      const t = raw.trim();
      if (!t) { gap = lines.length > 0; continue; }
      lines.push({ n: lines.length + 1, text: t, verseStart: gap || lines.length === 0 });
      gap = false;
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

/* Notes, checked against the lyrics so a note can't point past a song */
function loadNotes(byRelease, { drafts = false } = {}) {
  const arcs = new Map();
  if (!fs.existsSync(NOTES)) return { arcs };
  for (const f of fs.readdirSync(NOTES).filter(f => f.endsWith('.json'))) {
    const releaseId = f.slice(0, -5);
    if (releaseId === 'places') continue;
    const where = `lyrics/notes/${f}`;
    const list = byRelease.get(releaseId);
    if (!list) throw new Error(`${where}: no lyrics for release "${releaseId}"`);
    const data = JSON.parse(fs.readFileSync(path.join(NOTES, f), 'utf8'));

    if (data.arc && (drafts || !data.arc.draft)) arcs.set(releaseId, data.arc);

    for (const [track, entry] of Object.entries(data.songs || {})) {
      const song = list.find(s => s.track === Number(track));
      if (!song) throw new Error(`${where}: no track ${track}`);
      if (entry.title && !sameSong(entry.title, song.title)) throw new Error(`${where}: track ${track} is "${song.title}", not "${entry.title}"`);
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
  return { arcs };
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
    const { arcs } = loadNotes(byRelease, { drafts: true });
    const count = k => songs.reduce((n, s) => n + (s.notes || []).filter(x => x.kind === k).length, 0);
    console.log(`Notes are valid: ${KINDS.map(k => `${count(k)} ${k}`).join(', ')}, on ${songs.filter(s => (s.notes || []).length).length} songs; ${arcs.size} album arcs.`);
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
