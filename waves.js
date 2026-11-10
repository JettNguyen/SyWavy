/* ============================================================
   waves.js: the swell behind every page
   A band of thin lines in the brand's teal and blue, drawn on a
   canvas fixed behind the page. The lines drift like open water.
   They run behind the name at the top, then settle into a faint
   horizon at the bottom of the screen once you scroll, so they
   never cross what you are reading. The water behind the page
   gets deeper the further down you go.
   Stands alone, so the 404 page can use it without the rest.
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('waves');
  const depthEl = document.getElementById('waveDepth');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pages with a hero (the home page, and the 404 which asks for it) start with the
  // lines up behind the name. Every other page starts with them already settled low.
  const heroMode = !!document.getElementById('hero') || document.body.dataset.waves === 'hero';

  const LINES = 9;
  const TEAL = [86, 226, 211];
  const BLUE = [79, 141, 232];

  let w = 0, h = 0, dpr = 1, step = 8;
  let depth = 0, targetDepth = 0;   // 0 at the top of the page, 1 at the bottom
  let settle = 0, targetSettle = 0; // 0 at the top, 1 once the first screen is scrolled past
  let last = 0, running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    step = w < 700 ? 6 : 8;
  }

  function measureDepth() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    targetDepth = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    targetSettle = heroMode ? Math.min(window.scrollY / (window.innerHeight * 0.9), 1) : 1;
  }

  function draw(time) {
    const t = time / 1000;
    ctx.clearRect(0, 0, w, h);

    // Behind the name at first, then low and quiet at the bottom of the screen
    const small = w < 700;
    const base = h * ((small ? 0.8 : 0.79) + settle * 0.13);
    const fade = 1 - settle * 0.45;
    const gap = small ? 7 : 10;
    const amp1 = small ? 16 : 26;
    const amp2 = small ? 7 : 11;
    const k1 = (Math.PI * 2) / Math.max(w * 0.95, 520);
    const k2 = (Math.PI * 2) / Math.max(w * 0.38, 240);

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, `rgb(${TEAL})`);
    grad.addColorStop(1, `rgb(${BLUE})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;

    for (let i = 0; i < LINES; i++) {
      const c = (i - (LINES - 1) / 2) / ((LINES - 1) / 2); // -1 at the top line, 1 at the bottom
      ctx.globalAlpha = (0.07 + 0.3 * (1 - Math.abs(c)) ** 1.6) * fade;
      const y0 = base + c * gap * (LINES / 2) * (1 + 0.18 * Math.sin(t * 0.21 + i));
      const p1 = t * 0.32 + i * 0.22;
      const p2 = -t * 0.55 + i * 0.41;

      ctx.beginPath();
      for (let x = -step; x <= w + step; x += step) {
        const y = y0 + amp1 * Math.sin(x * k1 + p1) + amp2 * Math.sin(x * k2 + p2) * (0.6 + 0.4 * c);
        if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (depthEl) depthEl.style.opacity = (depth * 0.75).toFixed(3);
  }

  function frame(time) {
    depth += (targetDepth - depth) * 0.08;
    settle += (targetSettle - settle) * 0.08;
    // About 30 frames a second is plenty for something this slow, and easier on phones
    if (time - last > 32) { draw(time); last = time; }
    if (reduceMotion) { running = false; return; }
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  resize();
  measureDepth();
  depth = targetDepth;
  settle = targetSettle;

  window.addEventListener('resize', () => { resize(); measureDepth(); if (reduceMotion) draw(performance.now()); }, { passive: true });
  window.addEventListener('scroll', () => {
    measureDepth();
    if (reduceMotion) { depth = targetDepth; settle = targetSettle; draw(0); }
  }, { passive: true });

  if (reduceMotion) draw(0);
  else start();
})();
