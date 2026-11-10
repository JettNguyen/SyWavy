/* ============================================================
   build.js: builds the site into _site/ for deploy
   Copies the site, then:
   - writes the text of every section into the home page, so
     search engines and AI crawlers can read it without running
     any scripts (main.js only fills a section left empty)
   - writes one page per release (flame.html and so on), so every
     release has a short address like sywavy.com/flame with its
     own title, text, and cover art for link previews
   - adds structured data that says who SyWavy is and what he
     has released, plus a sitemap listing every page
   The deploy workflow runs this on every push.

   Preview locally:  node build.js && npx serve _site
   ============================================================ */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT = __dirname;
const OUT  = path.join(ROOT, '_site');
const SKIP = new Set(['_site', 'build.js', 'node_modules']);
const SITE = 'https://sywavy.com';

// data.js and render.js expect a browser window, so run them against a stand-in
const sandbox = vm.createContext({ window: {} });
for (const file of ['data.js', 'render.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox, { filename: file });
}
const D = sandbox.window.SYWAVY;
const R = sandbox.window._SWR;
const { escapeHTML, typeLabel, formatDate } = R;

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

/* ------------------------------------------------------------
   Page editing helpers. Each one stops the build if the page no
   longer has what it is looking for, so a changed page can't
   quietly ship with missing text or the wrong previews.
------------------------------------------------------------ */
function swap(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`page no longer has ${pattern}`);
  return html.replace(pattern, replacement);
}

const metaContent = (html, attr, key, value) =>
  swap(html, new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), (m, open, close) => open + escapeHTML(value) + close);

// Write markup into the element with this id. It must hold nothing but text
// in the source page, which is how main.js knows to leave it alone.
const setInner = (html, id, markup) =>
  swap(html, new RegExp(`(<(\\w+)\\b[^>]*\\bid="${id}"[^>]*>)[^<]*(</\\2>)`), (m, open, tag, close) => open + markup + close);

// Structured data as a script tag. "<" is escaped so no title can end the tag early.
const jsonLd = data =>
  `  <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', ...data }, null, 2).replace(/</g, '\\u003c')}\n  </script>\n`;

const addToHead = (html, tag) => swap(html, /<\/head>/, () => `${tag}</head>`);

// Streaming pages first, since a follow there counts most
const follow = [...(D.streamingPages || []), ...D.socials];

// The footer is on every page
function fillFooter(html) {
  html = setInner(html, 'footerCopy', escapeHTML(`© ${new Date().getFullYear()} ${D.artist.name}`));
  return setInner(html, 'footerSocials', R.socialLinks(follow));
}

/* ------------------------------------------------------------
   Structured data
------------------------------------------------------------ */
const RELEASE_TYPE = { album: 'AlbumRelease', ep: 'EPRelease', single: 'SingleRelease' };

// The same id on every page tells search engines it is one artist
const artistRef = { '@type': 'MusicGroup', '@id': `${SITE}/#artist`, name: D.artist.name, url: `${SITE}/` };

const albumData = r => ({
  '@type': 'MusicAlbum',
  name: r.title,
  url: `${SITE}/${r.id}`,
  image: `${SITE}/assets/covers/${r.cover}-1000.webp`,
  ...(r.date && { datePublished: r.date }),
  ...(RELEASE_TYPE[r.type] && { albumReleaseType: `https://schema.org/${RELEASE_TYPE[r.type]}` })
});

const artistData = {
  ...artistRef,
  image: `${SITE}/assets/photos/og.jpg`,
  description: D.artist.bio,
  genre: D.artist.genres,
  foundingLocation: { '@type': 'Place', name: 'Saint Petersburg, Florida' },
  sameAs: [...D.socials, ...(D.streamingPages || []), ...(D.musicDatabases || [])].map(p => p.url),
  album: D.releases.map(albumData)
};

/* ------------------------------------------------------------
   Home page
------------------------------------------------------------ */
const featured = R.featuredOf(D.releases);
let home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
home = setInner(home, 'heroName', escapeHTML(D.artist.name));
home = setInner(home, 'heroDescriptor', escapeHTML(D.artist.descriptor));
home = setInner(home, 'heroRelease', R.heroRelease(featured));
home = setInner(home, 'featuredRelease', R.featuredRelease(featured));
home = setInner(home, 'releaseCount', String(D.releases.length));
home = setInner(home, 'discographyGrid', R.discography(D.releases));
home = setInner(home, 'videoCount', String(D.videos.length));
home = setInner(home, 'videosGrid', R.videos(D.videos));
home = setInner(home, 'aboutBio', R.aboutBio(D.artist.bio));
home = setInner(home, 'aboutFacts', R.aboutFacts(D));
home = setInner(home, 'aboutSocials', R.followLinks(follow));
home = fillFooter(home);
home = addToHead(home, jsonLd(artistData));
fs.writeFileSync(path.join(OUT, 'index.html'), home);

/* ------------------------------------------------------------
   One page per release
------------------------------------------------------------ */
const template = fs.readFileSync(path.join(ROOT, 'release.html'), 'utf8');
const taken = new Set(fs.readdirSync(OUT).map(n => n.replace(/\.html$/, '')));

for (const r of D.releases) {
  if (!/^[a-z0-9-]+$/.test(r.id)) throw new Error(`Release id "${r.id}" can only use lowercase letters, numbers, and dashes`);
  if (taken.has(r.id)) throw new Error(`Release id "${r.id}" is already used by another page or release`);
  taken.add(r.id);

  const url   = `${SITE}/${r.id}`;
  const image = `${SITE}/assets/covers/${r.cover}-1000.webp`;
  const title = `${r.title} by SyWavy`;
  const kind  = typeLabel(r.type);
  const desc  = `${r.title}, ${kind === 'EP' ? kind : kind.toLowerCase()} by SyWavy${r.date ? ` (${formatDate(r.date)})` : ''}. Stream on Spotify, Apple Music, and more.`;

  let html = template;
  html = swap(html, /<title>[^<]*<\/title>/, () => `<title>${escapeHTML(title)}</title>`);
  html = metaContent(html, 'name', 'description', desc);
  html = metaContent(html, 'property', 'og:title', title);
  html = metaContent(html, 'property', 'og:description', desc);
  html = metaContent(html, 'property', 'og:image', image);
  html = metaContent(html, 'property', 'og:image:width', '1000');
  html = metaContent(html, 'property', 'og:image:height', '1000');
  html = metaContent(html, 'name', 'twitter:image', image);
  html = swap(html, /(<meta property="og:site_name"[^>]*>)/, m =>
    `${m}\n  <meta property="og:url" content="${url}" />\n  <link rel="canonical" href="${url}" />`);
  html = swap(html, /<body>/, () => `<body data-release="${r.id}">`);
  html = setInner(html, 'releaseContent', R.releasePage(r, D.releases));
  html = fillFooter(html);
  html = addToHead(html, jsonLd({
    ...albumData(r),
    byArtist: artistRef,
    sameAs: (r.links || []).filter(l => l.url && l.url !== '#').map(l => l.url)
  }));

  fs.writeFileSync(path.join(OUT, `${r.id}.html`), html);
}

/* ------------------------------------------------------------
   Sitemap: the home page and every release page
------------------------------------------------------------ */
const urls = [`${SITE}/`, ...D.releases.map(r => `${SITE}/${r.id}`)];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);

console.log(`Built _site with ${D.releases.length} release pages and a sitemap.`);
