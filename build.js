/* ============================================================
   build.js: builds the site into _site/ for deploy
   Copies the site, then writes one page per release (flame.html
   and so on), so every release has a short address like
   sywavy.com/flame with its own title and cover art for link
   previews. The deploy workflow runs this on every push.

   Preview locally:  node build.js && npx serve _site
   ============================================================ */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT = __dirname;
const OUT  = path.join(ROOT, '_site');
const SKIP = new Set(['_site', 'build.js', 'node_modules']);

// data.js sets window.SYWAVY, so run it against a stand-in window
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), sandbox);
const D = sandbox.window.SYWAVY;

/* Copy the site, leaving out hidden files and the build itself */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for (const name of fs.readdirSync(ROOT)) {
  if (name.startsWith('.') || SKIP.has(name)) continue;
  fs.cpSync(path.join(ROOT, name), path.join(OUT, name), {
    recursive: true,
    filter: src => !path.basename(src).startsWith('.')
  });
}

/* Same wording as the helpers in main.js */
const TYPE_LABEL = { album: 'Album', ep: 'EP', single: 'Single' };
const typeLabel = t => TYPE_LABEL[t] || t;

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (d === 1 && m === 1) return String(y);
  if (d === 1) return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Swap one piece of the template, and stop the build if it is missing so a
// changed release.html can't quietly ship pages with the wrong previews
function swap(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`release.html no longer has ${pattern}`);
  return html.replace(pattern, replacement);
}

const metaContent = (html, attr, key, value) =>
  swap(html, new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${escapeHTML(value)}$2`);

/* One page per release */
const template = fs.readFileSync(path.join(ROOT, 'release.html'), 'utf8');
const taken = new Set(fs.readdirSync(OUT).map(n => n.replace(/\.html$/, '')));

for (const r of D.releases) {
  if (!/^[a-z0-9-]+$/.test(r.id)) throw new Error(`Release id "${r.id}" can only use lowercase letters, numbers, and dashes`);
  if (taken.has(r.id)) throw new Error(`Release id "${r.id}" is already used by another page or release`);
  taken.add(r.id);

  const url   = `https://sywavy.com/${r.id}`;
  const image = `https://sywavy.com/assets/covers/${r.cover}-1000.webp`;
  const title = `${r.title} by SyWavy`;
  const kind  = typeLabel(r.type);
  const desc  = `${r.title}, ${kind === 'EP' ? kind : kind.toLowerCase()} by SyWavy${r.date ? ` (${formatDate(r.date)})` : ''}. Stream on Spotify, Apple Music, and more.`;

  let html = template;
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${escapeHTML(title)}</title>`);
  html = metaContent(html, 'name', 'description', desc);
  html = metaContent(html, 'property', 'og:title', title);
  html = metaContent(html, 'property', 'og:description', desc);
  html = metaContent(html, 'property', 'og:image', image);
  html = metaContent(html, 'property', 'og:image:width', '1000');
  html = metaContent(html, 'property', 'og:image:height', '1000');
  html = metaContent(html, 'name', 'twitter:image', image);
  html = swap(html, /(<meta property="og:site_name"[^>]*>)/,
    `$1\n  <meta property="og:url" content="${url}" />\n  <link rel="canonical" href="${url}" />`);
  html = swap(html, /<body>/, `<body data-release="${r.id}">`);

  fs.writeFileSync(path.join(OUT, `${r.id}.html`), html);
}

console.log(`Built _site with ${D.releases.length} release pages.`);
