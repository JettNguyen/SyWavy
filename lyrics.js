/* ============================================================
   lyrics.js: the lyrics pages, and an album's track by track
   - a song page opens the notes behind a highlighted line
   - links to a line (References, the Florida map) land on that
     line, handed over in sessionStorage so the address stays clean
   - References can show one kind at a time
   - the Florida map and its list point at each other
   - track by track draws its line as the page scrolls
   Everything here reads the page build.js wrote, and the pages
   still read fine without it.
   ============================================================ */

(function () {
  'use strict';

  const LINE_KEY = 'sywavy_line';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = window.matchMedia('(min-width: 900px)');
  const byId = id => document.getElementById(id);

  function take(key) {
    try { const v = sessionStorage.getItem(key); sessionStorage.removeItem(key); return v; } catch (_) { return null; }
  }
  function keep(key, value) {
    try { sessionStorage.setItem(key, value); } catch (_) { /* storage turned off */ }
  }

  /* ----------------------------------------------------------
     LINKS TO A LINE
  ---------------------------------------------------------- */
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[data-line]');
    if (link) keep(LINE_KEY, `${link.pathname}|${link.dataset.line}`);
  });

  /* ----------------------------------------------------------
     SONG PAGE
  ---------------------------------------------------------- */
  const lyrics = byId('lyrics');
  const notesBox = byId('songNotes');

  if (lyrics && notesBox) {
    const body = notesBox.closest('.song-body');
    const notes = [...notesBox.querySelectorAll('.note')];
    const lines = [...lyrics.querySelectorAll('.line')];
    const closeBtn = notesBox.querySelector('.song-notes-close');
    let current = null;

    body.classList.add('notes-ready');
    notes.forEach(n => { n.hidden = true; });

    function close() {
      if (!current) return;
      lines.forEach(l => l.classList.remove('is-active'));
      notes.forEach(n => { n.hidden = true; });
      body.classList.remove('notes-open');
      const back = current;
      current = null;
      if (!wide.matches) back.focus({ preventScroll: true });
    }

    function open(line) {
      if (current === line) { close(); return; }
      const ids = line.dataset.notes.split(' ').map(Number);
      lines.forEach(l => l.classList.remove('is-active'));
      notes.forEach((n, k) => { n.hidden = !ids.includes(k); });
      for (const k of ids) {
        const from = Number(notes[k].dataset.from), to = Number(notes[k].dataset.to);
        for (let i = from; i <= to; i++) { const l = lines[i - 1]; if (l) l.classList.add('is-active'); }
      }
      current = line;
      body.classList.add('notes-open');
      // On a wide screen the notes sit beside the lyrics, level with the line
      if (wide.matches) {
        const top = line.getBoundingClientRect().top - body.getBoundingClientRect().top;
        notesBox.style.setProperty('--note-top', `${Math.max(0, top)}px`);
      }
    }

    lyrics.addEventListener('click', e => {
      const line = e.target.closest('.line.noted');
      if (line) open(line);
    });
    lyrics.addEventListener('keydown', e => {
      const line = e.target.closest('.line.noted');
      if (line && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(line); }
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    wide.addEventListener('change', close);

    // Arriving from a link to one line
    const handoff = take(LINE_KEY);
    if (handoff) {
      const [pathname, n] = handoff.split('|');
      const line = pathname === location.pathname && byId(`line-${n}`);
      if (line) {
        const land = () => {
          document.documentElement.style.scrollBehavior = 'auto';
          line.scrollIntoView({ block: 'center' });
          document.documentElement.style.scrollBehavior = '';
        };
        requestAnimationFrame(() => {
          land();
          if (line.classList.contains('noted')) open(line);
          line.classList.add('is-landed');
          setTimeout(() => line.classList.remove('is-landed'), 2400);
        });
        if (document.fonts) document.fonts.ready.then(land);
      }
    }
  }

  /* ----------------------------------------------------------
     REFERENCES: show one kind at a time
  ---------------------------------------------------------- */
  const filters = [...document.querySelectorAll('.ref-filter')];
  if (filters.length) {
    const groups = [...document.querySelectorAll('.ref-group')];
    filters.forEach(btn => btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      filters.forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      groups.forEach(g => { g.hidden = Boolean(cat) && g.dataset.cat !== cat; });
    }));
  }

  /* ----------------------------------------------------------
     SYWAVY'S FLORIDA: a pin and its place light up together
  ---------------------------------------------------------- */
  const pins = [...document.querySelectorAll('.fl-pin')];
  if (pins.length) {
    // A pin can stand for more than one place ("0 1"), when they're too close to tell apart
    const items = [...document.querySelectorAll('.fl-place[data-place]')].filter(li => li.dataset.place !== '');
    const keysOf = el => el.dataset.place.split(' ');
    const show = (keys, scroll) => {
      pins.forEach(p => p.classList.toggle('is-on', keysOf(p).some(k => keys.includes(k))));
      items.forEach(li => li.classList.toggle('is-on', keys.includes(li.dataset.place)));
      const li = items.find(x => keys.includes(x.dataset.place));
      if (scroll && li) li.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    };
    pins.forEach(p => {
      p.addEventListener('mouseenter', () => show(keysOf(p), false));
      p.addEventListener('focus', () => show(keysOf(p), false));
      p.addEventListener('click', () => show(keysOf(p), true));
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(keysOf(p), true); } });
    });
    items.forEach(li => li.addEventListener('mouseenter', () => show([li.dataset.place], false)));
  }

  /* ----------------------------------------------------------
     TRACK BY TRACK: a line through every song, drawn on scroll.
     Each album has its own: a tide for Wavy Life, a flight path
     for Flight 370, a falling blossom for Japanese Cherry Blossom.
  ---------------------------------------------------------- */
  const arcs = [...document.querySelectorAll('.arc[data-motif]')];
  if (arcs.length) {
    const shapes = arcs.map(arc => ({
      arc,
      motif: arc.dataset.motif,
      svg: arc.querySelector('.arc-path'),
      base: arc.querySelector('.arc-path-base'),
      drawn: arc.querySelector('.arc-path-drawn'),
      list: arc.querySelector('.arc-list'),
      length: 0
    }));

    const X = 20;
    function trace(s) {
      const top = s.list.getBoundingClientRect().top;
      const ys = [...s.list.querySelectorAll('.arc-mark')].map(m => {
        const r = m.getBoundingClientRect();
        return r.top - top + r.height / 2;
      });
      if (ys.length < 2) return;
      const h = s.list.offsetHeight;
      s.svg.setAttribute('viewBox', `0 0 40 ${h}`);
      let d = `M ${X} ${ys[0]}`;
      ys.slice(1).forEach((y, i) => {
        const y0 = ys[i], mid = (y0 + y) / 2;
        if (s.motif === 'tide') {
          const b = i % 2 ? -11 : 11;
          d += ` Q ${X + b} ${(y0 + mid) / 2} ${X} ${mid} T ${X} ${y}`;
        } else if (s.motif === 'blossom') {
          const b = i % 2 ? -6 : 6;
          d += ` C ${X + b} ${y0 + (y - y0) / 3} ${X + b} ${y - (y - y0) / 3} ${X} ${y}`;
        } else {
          d += ` L ${X} ${y}`;
        }
      });
      s.base.setAttribute('d', d);
      s.drawn.setAttribute('d', d);
      s.length = s.drawn.getTotalLength();
      s.drawn.style.strokeDasharray = `${s.length}`;
      draw(s);
    }

    function draw(s) {
      if (!s.length) return;
      if (reduceMotion) { s.drawn.style.strokeDashoffset = '0'; return; }
      const r = s.list.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      s.drawn.style.strokeDashoffset = `${s.length * (1 - progress)}`;
    }

    const traceAll = () => shapes.forEach(trace);
    let frame = 0;
    window.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; shapes.forEach(draw); });
    }, { passive: true });
    window.addEventListener('resize', traceAll, { passive: true });
    if (document.fonts) document.fonts.ready.then(traceAll);
    window.addEventListener('load', traceAll, { once: true });
    traceAll();
  }

})();
