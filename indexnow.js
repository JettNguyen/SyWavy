/*
  Tells Bing (and the other IndexNow search engines) which pages changed on a
  deploy, so they read the new version the same day instead of whenever they
  next come around. Bing's index feeds ChatGPT's search and Copilot.

  The deploy workflow runs it twice:

    node indexnow.js check   after the build, before the deploy. Compares each
                             page in _site/sitemap.xml with what sywavy.com
                             serves now and writes down the ones that differ.
    node indexnow.js send    after the deploy. Sends that list to IndexNow.

  IndexNow checks that the site owns the key by loading https://sywavy.com/<KEY>.txt,
  so that file must stay at the root of the repo with the key as its only text.
*/
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const HOST = 'sywavy.com';
const SITE = `https://${HOST}`;
const KEY  = '1003eac3760a7342514e3f46e6a23f27';
const OUT  = path.join(__dirname, '_site');
const LIST = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'sywavy-indexnow.txt');

// /flame is _site/flame.html, and / or /lyrics/ is that folder's index.html
function builtFile(url) {
  const p = new URL(url).pathname;
  return path.join(OUT, p.endsWith('/') ? `${p}index.html` : `${p}.html`);
}

async function differs(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return true; // a new page, not live yet
    const live = Buffer.from(await res.arrayBuffer());
    return !live.equals(fs.readFileSync(builtFile(url)));
  } catch {
    return true; // couldn't load it, so let the search engines look
  }
}

async function check() {
  const sitemap = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const changed = [];
  for (let i = 0; i < urls.length; i += 8) {
    const batch = urls.slice(i, i + 8);
    const results = await Promise.all(batch.map(differs));
    batch.forEach((u, j) => results[j] && changed.push(u));
  }
  fs.writeFileSync(LIST, changed.join('\n'));
  console.log(`${changed.length} of ${urls.length} pages changed.`);
  changed.forEach(u => console.log(`  ${u}`));
}

async function send() {
  const urlList = fs.existsSync(LIST) ? fs.readFileSync(LIST, 'utf8').split('\n').filter(Boolean) : [];
  if (!urlList.length) return console.log('No changed pages to send.');
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
    signal: AbortSignal.timeout(30000)
  });
  // 200 and 202 both mean it was taken; 202 means the key is still being checked
  console.log(`IndexNow answered ${res.status} for ${urlList.length} pages.`);
  if (!res.ok) {
    console.log(await res.text());
    process.exit(1);
  }
}

const step = { check, send }[process.argv[2]];
if (!step) {
  console.error('Usage: node indexnow.js check|send');
  process.exit(1);
}
step();
