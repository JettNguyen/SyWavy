/* ============================================================
   fiveserver.config.js: the preview behind VS Code's Go Live
   button (the Five Server extension)
   Serves _site, the built site, so the lyrics pages, the release
   pages, and short addresses like /lyrics/keys work the way they
   do on sywavy.com. Save any file and the page reloads; before it
   loads, the site is built again with draft notes showing
   (node build.js --drafts). The build takes a fraction of a
   second, so there is nothing to wait for.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = __dirname;
const LEAVE_OUT = new Set(['_site', 'node_modules']);

// The newest change to anything the build reads. Folders count too,
// so deleting or renaming a file also starts a build.
function newestChange(dir) {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || LEAVE_OUT.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    newest = Math.max(newest, fs.statSync(file).mtimeMs, entry.isDirectory() ? newestChange(file) : 0);
  }
  return newest;
}

let builtAt = 0;      // when the last build started; 0 builds on the first visit
let building = null;  // the build in progress, so requests that arrive meanwhile wait for it
let failure = null;   // what the last build printed when it stopped

// Five Server runs inside VS Code, where process.execPath is VS Code's
// own copy of Node. ELECTRON_RUN_AS_NODE makes it act like plain node.
function build() {
  builtAt = Date.now();
  return new Promise(done => {
    execFile(process.execPath, ['build.js', '--drafts'], {
      cwd: ROOT,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
    }, (err, stdout, stderr) => {
      failure = err ? (stderr || err.message).trim() : null;
      done();
    });
  });
}

const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

// When the build stops, say so on the page instead of showing a missing
// page. The Five Server script reloads it once the file is fixed.
function showFailure(res) {
  res.status(500).type('html').send(`<!DOCTYPE html>
<meta charset="utf-8">
<title>The site didn't build</title>
<body style="font: 16px/1.5 system-ui, sans-serif; max-width: 44rem; margin: 3rem auto; padding: 0 1rem">
<h1 style="font-size: 1.4rem">The site didn't build</h1>
<p>The message below says what went wrong. Fix it and save the file, and this page reloads by itself once the site builds again.</p>
<pre style="white-space: pre-wrap; background: #f3f3f3; padding: 1rem; border-radius: 6px">${esc(failure)}</pre>
<script async data-id="five-server" type="application/javascript" src="/fiveserver.js"></script>
</body>`);
}

async function buildWhenChanged(req, res, next) {
  try {
    if (!building && newestChange(ROOT) > builtAt) {
      building = build().finally(() => { building = null; });
    }
    if (building) await building;
  } catch (err) {
    failure = err.message;
  }
  if (failure) return showFailure(res);
  next();
}

module.exports = {
  root: '_site',
  open: '/',
  middleware: [buildWhenChanged],
  // Watch the files you edit, not _site, or every build would
  // reload the page a second time
  ignore: [/(^|[\/\\])_site([\/\\]|$)/]
};
