/* ============================================================
   release.js: individual release page
   Shows the release named in <body data-release>, which
   build.js writes into each release page (sywavy.com/flame)
   along with the page itself. Old ?id= links land on
   release.html and forward from there.
   Requires data.js, render.js, and main.js loaded first.
   ============================================================ */

(function () {
  'use strict';

  const D = window.SYWAVY;
  const R = window._SWR;
  const U = window._SW;
  if (!D || !R || !U) return;

  const baked   = document.body.dataset.release;
  const id      = baked || new URLSearchParams(window.location.search).get('id');
  const release = D.releases.find(r => r.id === id);

  if (!baked || !release) {
    window.location.replace(release ? `/${release.id}` : '/');
    return;
  }

  const container = document.getElementById('releaseContent');
  if (!container) return;

  // build.js writes the page ahead of time, so this only runs when it didn't.
  // main.js has already watched everything that was on the page for scrolling.
  if (!container.hasChildNodes()) {
    container.innerHTML = R.releasePage(release, D.releases);
    U.observeCards();
  }

  U.playOnClick(container);

})();
