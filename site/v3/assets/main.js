/* Da Vinci Clinic, design 3 (Tigris): page behaviour. The particle stage itself lives in pt.js. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);
  root.classList.add('js');
  // opened straight from Finder (file://) the particle module can't load: show the still fallbacks instead of empty space
  setTimeout(() => { if (!root.classList.contains('has-gl')) root.classList.add('no-gl'); }, location.protocol === 'file:' ? 600 : 6000);
  if (reduced) root.classList.add('reduced-motion');

  /* ---------- smooth scroll (Lenis on the window, as on the template) ---------- */
  let lenis = null;
  const startLenis = () => {
    if (reduced || !window.Lenis || lenis) return;
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .9 });
    lenis.updateClassName = () => {};     // Lenis rewrites the <html> class on every scroll start/stop; nothing styles those classes
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };
  window.Lenis ? startLenis() : addEventListener('load', startLenis);
  const scrollToY = y => lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });

  /* ---------- preloader: the wordmark gathers, the lids open, the particles are born ---------- */
  const pre = $('.preloader');
  let first = false;
  try { first = !sessionStorage.getItem('dv3-seen'); sessionStorage.setItem('dv3-seen', '1'); } catch (e) {}
  const begin = () => dispatchEvent(new Event('dv:start'));
  if (pre) {
    if (!first || reduced) { pre.classList.add('is-done'); begin(); }
    else {
      root.style.overflow = 'hidden';
      requestAnimationFrame(() => pre.classList.add('is-word'));
      setTimeout(() => { pre.classList.add('is-open'); begin(); root.style.overflow = ''; }, 2100);
      setTimeout(() => pre.classList.add('is-done'), 3300);
    }
  } else begin();

  /* ---------- nav: hide on scroll down, show on scroll up; phone menu ---------- */
  const nav = $('.nav'); let lastY = 0;
  const menuBtn = $('.nav__menu');
  if (menuBtn) menuBtn.addEventListener('click', () => {
    const open = !root.classList.contains('menu-open'); root.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', open);
    open ? lenis?.stop() : lenis?.start();
  });
  $$('.menu__big a').forEach((a, i) => a.style.transitionDelay = (.15 + i * .05) + 's');

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv, [data-reveal], .card__media').forEach(el => io.observe(el));
  // every picture gets an entrance (the user: after the films, still pictures felt static). Pictures that a section already
  // animates with the scroll (film, study, face study, takeover, lookbook, heritage, before/after) keep their own motion.
  const SKIP = '.sfilm, .pt-fb, .study, .pmap, .takeover, .lookbook, .heritage, .cmp, .pmq, .orbit, .nav, .overlay, .film, .footer';
  const iio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); iio.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  if (!reduced) $$('main img').forEach(im => { if (im.closest(SKIP)) return; im.classList.add('rvi'); iio.observe(im); });

  /* ---------- scroll-linked sections ---------- */
  const heroes = $$('.hero, .phero');
  const manifestos = $$('[data-words]');
  const stripes = $$('[data-stripes]');
  const takeovers = $$('[data-takeover]');
  const cuffs = $$('[data-cuff]');
  const orbits = $$('[data-orbit]');
  const studies = $$('[data-study]');
  const pmaps = $$('[data-pmap]');
  const awardsEls = $$('[data-awards]');
  const chapters = $$('[data-chapter]');
  const scenes = $$('[data-scenes]');
  const heritage = $$('[data-heritage]');
  const looks = $$('[data-lookbook]');
  const pars = $$('.par');
  const decks = $$('[data-stack]');

  /* decks (services cards on the home page, runs of plain sections on inner pages): each card is pinned by CSS sticky; here its
     top is set so a card taller than the screen sticks by its bottom edge instead (nothing is ever cut off), and --q says how far
     the next card has slid over it, so the one underneath sinks back and dims */
  const rem = () => parseFloat(getComputedStyle(root).fontSize) || 16;
  const sizeDecks = () => decks.forEach(dk => {
    const cs = dk._c || (dk._c = [...dk.children]), svc = dk.classList.contains('stk__list'), R = rem();
    cs.forEach((c, i) => { const base = svc ? R * (innerWidth < 768 ? 4.6 : 6) + i * R * (innerWidth < 768 ? .8 : 1.4) : Math.min(i, 4) * 10;
      const t = Math.min(base, innerHeight - c.offsetHeight - (svc ? R : 0)); c.style.top = t + 'px'; c._t = t; });
  });
  sizeDecks(); addEventListener('resize', sizeDecks); addEventListener('load', sizeDecks);
  if (window.ResizeObserver) new ResizeObserver(sizeDecks).observe(document.body);

  const sizeStripes = () => stripes.forEach(s => {
    const track = $('.stripes__track', s), extra = Math.max(0, track.scrollWidth - innerWidth);
    s.style.height = (innerHeight + extra * (+s.dataset.speed || 1)) + 'px'; s._extra = extra;     // data-speed < 1: the track moves faster than the page
  });
  sizeStripes(); addEventListener('resize', sizeStripes); addEventListener('load', sizeStripes);

  // awards: one row the scroll pulls sideways (desktop). Its overflow only changes on resize/load, so measure it then.
  const sizeAwards = () => awardsEls.forEach(a => {
    const tr = a._tr || (a._tr = $('.awards__track', a)), extra = innerWidth < 768 ? 0 : Math.max(0, tr.scrollWidth - innerWidth);
    a._extra = extra; a.style.height = innerWidth < 768 ? '' : (innerHeight * 1.15 + extra * .9) + 'px';
  });
  sizeAwards(); addEventListener('resize', sizeAwards); addEventListener('load', sizeAwards);

  // put(): write a style only when it changed. Redundant writes still invalidate styles, and on a long page that adds up.
  const put = (el, k, v) => { const c = el._v || (el._v = {}); if (c[k] === v) return; c[k] = v; if (k[0] === '-') el.style.setProperty(k, v); else el.style[k] = v; };
  const geo = new Map();
  const R = el => geo.get(el) || el.getBoundingClientRect();
  const prog = el => { const r = R(el); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  const near = (r, H, m = 0) => r && r.bottom > -m && r.top < H + m;
  const TRACK = [...heroes, ...manifestos, ...stripes, ...takeovers, ...cuffs, ...orbits, ...studies, ...awardsEls, ...pmaps, ...chapters, ...scenes, ...heritage, ...looks, ...pars, ...decks];
  function tick() {
    const H = innerHeight, W = innerWidth, y = scrollY;
    // READ first: every position this frame needs is measured before anything is written. Reading after a write forces the
    // browser to recalculate styles and layout on the spot, and doing that over and over inside one frame is what stuttered.
    geo.clear();
    for (const el of TRACK) geo.set(el, el.getBoundingClientRect());
    for (const s of stripes) if (near(geo.get(s), H)) for (const pc of s._p || (s._p = $$('.piece', s))) geo.set(pc, pc.getBoundingClientRect());
    if (W >= 768) for (const a of awardsEls) if (near(geo.get(a), H)) for (const w of a._aw || (a._aw = $$('.award', a))) geo.set(w, w.getBoundingClientRect());
    for (const dk of decks) if (dk._c && near(geo.get(dk), H)) for (const c of dk._c) geo.set(c, c.getBoundingClientRect());
    // ...then WRITE
    if (nav) { nav.classList.toggle('is-scrolled', y > 40); if (!root.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY + 4 && y > H * .6); if (y < lastY - 4) nav.classList.remove('is-hidden'); }
    lastY = y;
    heroes.forEach(h => {
      const r = geo.get(h); if (!near(r, H, H)) return;
      const p = prog(h), copy = h._cp !== undefined ? h._cp : (h._cp = $('[data-hero-copy]', h) || $('.phero__copy', h)), hint = h._hn !== undefined ? h._hn : (h._hn = $('[data-hero-hint]', h)), ring = h._rg !== undefined ? h._rg : (h._rg = $('[data-hero-ring]', h));
      if (copy) { const o = h.classList.contains('hero') ? 1 - smooth(clamp(p / .2)) : 1 - smooth(clamp(-r.top / (H * .5))); put(copy, 'opacity', o.toFixed(3)); put(copy, 'transform', `translate3d(0,${((1 - o) * -30).toFixed(1)}px,0) scale(${(1 + (1 - o) * .22).toFixed(3)})`); }
      if (hint) put(hint, 'opacity', (1 - clamp(p / .08)).toFixed(3));
      if (ring) put(ring, 'opacity', (smooth(clamp((p - .6) / .14)) * (1 - smooth(clamp((p - .93) / .07)))).toFixed(3));
    });
    manifestos.forEach(m => {
      const r = geo.get(m); if (!near(r, H, H * .3)) return;
      const ws = m._ws || (m._ws = $$('.w', m)), n = Math.round(clamp((H * .82 - r.top) / (r.height + H * .25)) * ws.length * 1.1);
      if (m._n !== n) { m._n = n; ws.forEach((w, i) => w.classList.toggle('off', i >= n)); }
    });
    stripes.forEach(s => {
      const track = s._tr || (s._tr = $('.stripes__track', s)), x = -prog(s) * (s._extra || 0), dx = x - (s._x || 0); s._x = x;
      put(track, 'transform', `translate3d(${x.toFixed(1)}px,0,0)`);
      if (!near(geo.get(s), H)) return;
      // a lens across the track: the piece in the middle is fully lit, its picture drifts against the motion (parallax)
      s._p.forEach(pc => { const b = geo.get(pc); if (!b) return; if (pc._still === undefined) pc._still = pc.matches('.piece--photo, .piece--wide'); const f = clamp((b.left + dx + b.width / 2 - W / 2) / (W * .6), -1.4, 1.4), im = pc._im !== undefined ? pc._im : (pc._im = $('.piece__media img', pc));
        put(pc, 'opacity', (1 - Math.min(1, Math.abs(f)) * .3).toFixed(3)); if (im && !pc._still) put(im, 'translate', `${(f * -4.5).toFixed(2)}% 0`); });
    });
    takeovers.forEach(t => {     // the window opening to full screen: transforms only (a clip-path redrawn every frame was too heavy)
      if (!near(geo.get(t), H, H)) return;
      const p = prog(t), open = smooth(clamp(p / .55)), cap = smooth(clamp((p - .5) / .2)) * (1 - smooth(clamp((p - .92) / .08)));
      const sx = 1 - (1 - open) * (W < 768 ? .2 : .52), sy = 1 - (1 - open) * .36, sc = 1.14 - open * .14;
      const fig = t._f || (t._f = $('.takeover__fig', t)), im = t._i || (t._i = $('.takeover__fig img', t));
      put(fig, 'transform', `scale(${sx.toFixed(4)},${sy.toFixed(4)})`); put(fig, 'borderRadius', open > .995 ? '0px' : `${Math.round(24 / sx)}px / ${Math.round(24 / sy)}px`);
      if (im) put(im, 'transform', `scale(${(sc / sx).toFixed(4)},${(sc / sy).toFixed(4)})`);
      put(t, '--cap', cap.toFixed(3));
    });
    cuffs.forEach(c => { if (near(geo.get(c), H, H)) put(c, '--c', (smooth(clamp((prog(c) - .06) / .2)) * (1 - smooth(clamp((prog(c) - .86) / .12)))).toFixed(3)); });
    orbits.forEach(o => {
      if (!near(geo.get(o), H, H)) return;
      const p = prog(o), ring = o._ring || (o._ring = $('[data-orbit-ring]', o)), cards = o._cards || (o._cards = $$('.ocard', o)), caps = o._caps || (o._caps = $$('.orbit__cap', o)), dots = o._dots || (o._dots = $$('.orbit__dots span', o));
      const n = cards.length, intro = smooth(clamp(p / .14)), outro = smooth(clamp((p - .9) / .1)), q = clamp((p - .14) / .72);
      const ry = 30 * (1 - intro) - q * (n - 1) / n * 360;
      put(ring, '--ry', ry.toFixed(2) + 'deg'); put(ring, '--s', (.7 + .3 * intro - .15 * outro).toFixed(3)); put(ring, '--o', (intro * (1 - .6 * outro)).toFixed(3));
      cards.forEach((c, i) => { const f = Math.cos((i * 360 / n + ry) * Math.PI / 180); put(c, '--f', (.4 + .6 * clamp(f + .25)).toFixed(3)); put(c, '--b', (.72 + .4 * clamp(f)).toFixed(3)); });
      const i = Math.min(n - 1, Math.round(q * (n - 1)));
      caps.forEach((c, k) => c.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i));
    });
    studies.forEach(s => {     // sketch → marble: a curtain made of two opposite transforms (no per-frame clip-path repaint)
      if (!near(geo.get(s), H, H)) return;
      const p = prog(s), q = clamp((p - .08) / .66), tags = s._tags || (s._tags = $$('.study__tag', s)), steps = s._steps || (s._steps = $$('.study__steps li', s));
      const mw = s._mw || (s._mw = $('.study__mw', s)), mi = s._mi || (s._mi = $('.study__marble', s));
      if (mw && mi) { put(mw, 'transform', `translate3d(0,${(-(1 - q) * 100).toFixed(2)}%,0)`); put(mi, 'transform', `translate3d(0,${((1 - q) * 100).toFixed(2)}%,0)`); }
      put(s, '--q', q.toFixed(4)); put(s, '--l', q > 0 && q < 1 ? '1' : '0'); put(s, '--z', p > .82 ? '1.04' : '1');
      tags.forEach((t, i) => t.classList.toggle('on', q > .2 + i * .17));
      steps.forEach((li, i) => li.classList.toggle('on', p > i * (.78 / steps.length) + .04 && (p < (i + 1) * (.78 / steps.length) + .04 || i === steps.length - 1)));
    });
    awardsEls.forEach(a => {     // one row of trophies pulled sideways while the stage is pinned (desktop); phones swipe it
      const p = prog(a); a.classList.toggle('in', p > .02 || W < 768);
      if (W < 768) return;
      const tr = a._tr || (a._tr = $('.awards__track', a)), x = -clamp((p - .06) / .9) * (a._extra || 0), dx = x - (a._x || 0); a._x = x;
      put(tr, 'transform', `translate3d(${x.toFixed(1)}px,0,0)`);
      if (!near(geo.get(a), H)) return;
      // a lens along the row: the trophy crossing the middle comes forward, the ones toward the edges sink back
      (a._aw || []).forEach(w => { const b = geo.get(w); if (!b) return; const f = clamp(Math.abs(b.left + dx + b.width / 2 - W / 2) / (W * .55));
        put(w, 'scale', (1.04 - f * f * .14).toFixed(3)); put(w, 'opacity', (1 - f * f * .5).toFixed(3)); });
    });
    pmaps.forEach(m => {     // design 2's face study, same beats: words, face, steps, proportion lines, markers, then the panel
      if (!near(geo.get(m), H, H)) return;
      const p = prog(m), words = m._w || (m._w = $$('.pmap__words div', m));
      const fade = (a, b, c, d) => p < a ? 0 : p < b ? (p - a) / (b - a) : p < c ? 1 : p < d ? 1 - (p - c) / (d - c) : 0;
      const w0 = p < .02 ? 1 : fade(-1, 0, .08, .12), w1 = fade(.12, .15, .2, .24);
      [w0, w1].forEach((o, i) => { put(words[i], 'opacity', o.toFixed(3)); put(words[i], 'transform', `translateY(${((1 - o) * 1.2).toFixed(3)}rem)`); });
      const im = m._im || (m._im = $('.pmap__fig img', m));
      put(im, 'opacity', (p < .22 ? 0 : p < .3 ? (p - .22) / .08 * .35 : p < .38 ? .35 + (p - .3) / .08 * .65 : 1).toFixed(3));
      const g = clamp((p - .4) / .12);
      (m._g || (m._g = $$('.pmap__fig .guide', m))).forEach((el, i) => put(el, 'strokeDashoffset', (1 - clamp(g * 1.6 - i * .15)).toFixed(3)));
      m.classList.toggle('g-on', g > .5);
      (m._z || (m._z = $$('.pzone', m))).forEach((z, i) => z.classList.toggle('on', p > .54 + i * .03));
      const cap = p < .38 ? 0 : p < .52 ? 1 : p < .66 ? 2 : p < .78 ? 3 : 'z';
      (m._c || (m._c = $$('.pmap__cap p', m))).forEach(el => el.classList.toggle('on', el.dataset.i == String(cap) && p > .24));
      const desk = W > 767;
      put(m._cb || (m._cb = $('.pmap__cap', m)), 'opacity', desk ? (cap === 'z' ? '1' : '0') : (p > .24 && p < .82 ? '1' : '0'));
      if (desk) {     // the steps stay on screen and build up side by side; the newest one carries the gold rule
        const st = m._st || (m._st = $$('.pstep', m)), row = m._row || (m._row = $('.pmap__steps', m)), th = [.24, .38, .52, .66];
        st.forEach((li, i) => { li.classList.toggle('in', p >= th[i]); li.classList.toggle('cur', cap === i); });
        put(row, '--se', p >= .24 ? '1' : '0'); put(row, '--so', (1 - smooth(clamp((p - .76) / .05))).toFixed(3));
      }
      const open = clamp((p - .8) / .1), stage = m._s || (m._s = $('.pmap__stage', m));
      if (desk) { put(stage, 'gridTemplateColumns', `1fr ${(open * 39).toFixed(2)}vw`); put(stage, 'gridTemplateRows', ''); }
      else { put(stage, 'gridTemplateRows', `1fr ${(open * 62).toFixed(2)}svh`); put(stage, 'gridTemplateColumns', ''); }
    });
    chapters.forEach(c => {
      if (!near(geo.get(c), H, H)) return;
      const p = prog(c), items = c._it || (c._it = $$('.chapter__item', c)), i = Math.min(items.length - 1, Math.floor(p * items.length * .999));
      items.forEach((el, k) => el.classList.toggle('on', k === i)); put(c._pb || (c._pb = $('.chapter__progress span', c)) || c, 'transform', `scaleX(${p.toFixed(4)})`);
    });
    scenes.forEach(s => {
      if (!near(geo.get(s), H, H)) return;
      const p = prog(s), t = s._t || (s._t = $$('.scenes__title > div', s)), n = t.length, i = Math.min(n - 1, Math.floor(p * n * .999));
      const local = p * n - i, show = n === 1 || (local > .12 || i === 0) && (local < .9 || i === n - 1);
      t.forEach((el, k) => el.classList.toggle('on', k === i && show)); put(s._pb || (s._pb = $('.scenes__line span', s)) || s, 'transform', `scaleX(${p.toFixed(4)})`); s._i = i;
    });
    heritage.forEach(h => { const r = geo.get(h); if (near(r, H, H)) put(h, '--g', smooth(clamp((H * .7 - r.top) / (H * .9))).toFixed(3)); });
    looks.forEach(l => { const r = geo.get(l); if (near(r, H, H)) put(l, '--sc', (1.12 - clamp((H - r.top) / (H + r.height)) * .1).toFixed(3)); });
    pars.forEach(el => { const r = geo.get(el); if (!near(r, H, 50)) return; const im = el._im !== undefined ? el._im : (el._im = $('img', el));
      if (im) put(im, 'translate', `0 ${(clamp((r.top + r.height / 2 - H / 2) / (H / 2 + r.height / 2), -1, 1) * -5).toFixed(2)}%`); });
    decks.forEach(dk => {
      const cs = dk._c; if (!cs || !near(geo.get(dk), H)) return;
      cs.forEach((c, i) => { const nx = cs[i + 1]; put(c, '--q', nx ? clamp((H - geo.get(nx).top) / Math.max(1, H - (nx._t || 0))).toFixed(3) : '0'); });
    });
  }
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { tick(); ticking = false; }); } };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); tick();

  $$('[data-scene-next]').forEach(b => b.addEventListener('click', () => {
    const s = b.closest('[data-scenes]'), n = $$('.scenes__title > div', s).length, top = s.getBoundingClientRect().top + scrollY, span = s.offsetHeight - innerHeight;
    const i = (s._i || 0) + 1; scrollToY(i >= n ? top + s.offsetHeight : top + span * ((i + .5) / n));
  }));

  /* ---------- variants: re-tint the particle figure, swap the panel ---------- */
  $$('[data-variants]').forEach(v => {
    const btns = $$('.variants__btn', v), panels = $$('.variants__panel', v);
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      const b = btns.find(x => x.classList.contains('is-active'));
      dispatchEvent(new CustomEvent('pt:tint', { detail: e.isIntersecting && b && b.dataset.variant !== '0' ? { color: b.dataset.tint, amt: .8 } : null }));
    }), { threshold: .3 });
    io2.observe(v);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', x === b); });
      panels.forEach(p => p.classList.toggle('on', p.dataset.panel === b.dataset.variant));
      dispatchEvent(new CustomEvent('pt:tint', { detail: b.dataset.variant === '0' ? null : { color: b.dataset.tint, amt: .8 } }));
    }));
  });

  /* ---------- scroll films: each pinned stage plays one scene frame by frame as you scroll ----------
     The home page has five, one per scene, with ordinary sections between them; all read from the same numbered frame
     sequence (data-f0 = this film's first frame, data-n = how many).
     Smoothness comes from three things (the same recipe as pear.no): frames are fetched nearest-first around where the
     reader is, a window of frames around the current one is kept DECODED as ImageBitmaps so a draw never waits on a
     decode, and the canvas is sized to the source frame, not to the Retina viewport, so each draw is a cheap blit. */
  $$('[data-sfilm]').forEach(sf => {
    const n = +sf.dataset.n, f0 = +sf.dataset.f0 || 0, cv = $('.sfilm__canvas', sf), ctx = cv.getContext('2d', { alpha: false }), chs = $$('.sfilm__ch', sf), bar = $('.sfilm__bar span', sf);
    const pick = () => (innerWidth < 768 && innerHeight > innerWidth ? 'm' : 'd');
    const WIN = 24, PAR = 6;     // ±24 decoded frames (each is several MB of memory: 40 per side, times several films, was too much)
    // Frames arrive as Blobs (fetch) and are decoded with createImageBitmap(blob), which decodes off the main thread, so
    // neither loading nor decoding can stall a scroll frame. Only a window of frames around the reader is kept decoded
    // (GPU bitmaps); the rest stay as small compressed blobs until the reader gets near.
    let set = pick(), blobs, bmps, pending, tries, gen = 0, cur = 0, shown = -1, visible = false, raf = 0, aim = 0, queue = [], inflight = 0;
    const src = i => `${sf.dataset.base}${set}/${String(f0 + i + 1).padStart(4, '0')}.webp`;
    const reset = () => { if (bmps) bmps.forEach(b => b && b.close && b.close()); blobs = new Array(n); bmps = new Array(n); pending = new Uint8Array(n); tries = new Uint8Array(n); queue = []; inflight = 0; shown = -1; gen++; };
    reset();
    // fetch order: the frame under the reader first, then outward, then a coarse-to-fine sweep of everything else
    const order = () => { const o = [], seen = new Uint8Array(n); for (let s = 32; s >= 1; s >>= 1) for (let i = 0; i < n; i += s) if (!seen[i]) { seen[i] = 1; o.push(i); } return o; };
    const nextToFetch = () => {
      for (let d = 0; d <= 24; d++) for (const i of (d ? [aim + d, aim - d] : [aim])) if (i >= 0 && i < n && !blobs[i] && !pending[i]) return i;
      while (queue.length) { const i = queue.shift(); if (!blobs[i] && !pending[i]) return i; }
      return -1;
    };
    const pump = () => {
      const g = gen;
      while (inflight < PAR) {
        const i = nextToFetch(); if (i < 0) return;
        pending[i] = 1; inflight++;
        fetch(src(i)).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(bl => { if (g !== gen) return; blobs[i] = bl; inflight--; if (Math.abs(i - cur) <= WIN) warm(); pump(); },
          () => { if (g !== gen) return; inflight--; if (++tries[i] < 3) setTimeout(() => { if (g === gen) { pending[i] = 0; pump(); } }, 1500 * tries[i]); else pump(); });   // a frame that fails three times is left out; the nearest one stands in
      }
    };
    let started = false;
    const load = () => { if (started) return; started = true; queue = order(); pump(); };
    let inReach = false;     // only the films near the reader keep decoded frames (each frame is several MB of GPU memory)
    const drop = () => { for (let i = 0; i < n; i++) if (bmps[i]) { if (bmps[i].close) bmps[i].close(); bmps[i] = null; } shown = -1; };
    const warm = () => {
      if (!inReach) return;
      const g = gen, lo = Math.max(0, cur - WIN), hi = Math.min(n - 1, cur + WIN);
      for (let d = 0; d <= WIN; d++) for (const i of (d ? [cur + d, cur - d] : [cur])) {
        if (i < lo || i > hi || !blobs[i] || bmps[i]) continue;
        bmps[i] = 'making';
        createImageBitmap(blobs[i]).then(bm => { if (g !== gen || bmps[i] !== 'making') { bm.close(); return; } bmps[i] = bm; if (Math.abs(i - cur) <= 1) shown = -1; }, () => { bmps[i] = null; });
      }
      for (let i = 0; i < n; i++) if (bmps[i] && (i < lo - 8 || i > hi + 8)) { if (bmps[i].close) bmps[i].close(); bmps[i] = null; }   // release what fell out of the window
    };
    const ready = i => i >= 0 && i < n && bmps[i] && typeof bmps[i] !== 'string';
    const nearest = i => { if (ready(i)) return i; for (let d = 1; d < n; d++) { if (ready(i - d)) return i - d; if (ready(i + d)) return i + d; if (i - d < 0 && i + d >= n) break; } return -1; };
    const size = () => {     // canvas at source resolution (never above it): a draw is then a plain blit, even on Retina
      const r = cv.getBoundingClientRect(), [sw, sh] = (set === 'm' ? sf.dataset.mratio : sf.dataset.ratio).split('x').map(Number);
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.max(sw / Math.max(1, r.width), sh / Math.max(1, r.height), .75));
      cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr)); shown = -1;
    };
    const scenes = (sf.dataset.scenes || '').split(',').filter(Boolean).map(Number), XF = 14;   // frames of crossfade at the start of each new scene
    const frameOf = i => ready(i) ? bmps[i] : null;
    const rect = im => {
      const W = cv.width, H = cv.height, iw = im.width, ih = im.height;
      if (set === 'm') { const s = Math.max(W / iw, .56 * H / ih), w = iw * s, h = ih * s; return [(W - w) / 2, Math.max(0, H * .4 - h / 2), w, h]; }
      const s = Math.max(W / iw, H / ih), w = iw * s, h = ih * s; return [(W - w) / 2, (H - h) / 2, w, h];
    };
    const blit = (im, a) => { if (!im || a <= .002) return; const [x, y, w, h] = rect(im); ctx.globalAlpha = Math.min(1, a); ctx.drawImage(im, x, y, w, h); ctx.globalAlpha = 1; };
    // The film is drawn at a FRACTIONAL frame position: frame A, with frame A+1 laid over it at the fraction we are between
    // them (pear.no blends two textures the same way). Without this, a slow scroll holds one frame for several screen
    // refreshes and then jumps, which reads as stutter however fast the frames load.
    const draw = pos => {
      // scrolling fast (more than a frame per screen refresh) the blend is invisible: draw one frame, upload one texture
      const fast = Math.abs(pos - shown) > 1.5, A = fast ? Math.round(pos) : Math.floor(pos); let t = fast ? 0 : pos - A, ia = frameOf(A);
      if (!ia) { const k = nearest(A); if (k < 0) return; ia = frameOf(k); t = 0; }
      const ib = t > .004 ? frameOf(A + 1) : null, W = cv.width, H = cv.height;
      if (set === 'm') { ctx.fillStyle = '#06111f'; ctx.fillRect(0, 0, W, H); }
      const sc = scenes.find(s0 => pos >= s0 - 1 && pos < s0 + XF);
      if (sc !== undefined) { const x = clamp((pos - sc + 1) / XF); blit(frameOf(nearest(sc - 1)), 1); blit(ia, x); blit(ib, x * t); }   // a new scene fades in over the last frame of the previous one
      else { blit(ia, 1); blit(ib, t); }
      if (set === 'm') {     // phones: the 4:5 film fills the width, sits in the upper part, and feathers into the navy above and below
        const [, y, , h] = rect(ia), f = h * .14;
        const top = ctx.createLinearGradient(0, y, 0, y + f); top.addColorStop(0, '#06111f'); top.addColorStop(1, 'rgba(6,17,31,0)'); ctx.fillStyle = top; ctx.fillRect(0, y, W, f);
        const bot = ctx.createLinearGradient(0, y + h - f * 1.4, 0, y + h); bot.addColorStop(0, 'rgba(6,17,31,0)'); bot.addColorStop(1, '#06111f'); ctx.fillStyle = bot; ctx.fillRect(0, y + h - f * 1.4, W, f * 1.4 + 1);
      }
      shown = pos; sf.classList.add('is-ready');
    };
    const hand = $('.sfilm__hand', sf), stage = $('.sfilm__stage', sf), hint = $('.sfilm__hint', sf);
    // the section's place on the page, measured on load/resize only: reading it from the layout every frame forced a style
    // recalculation whenever anything else had just written a style
    const measure = () => { sf._top = sf.getBoundingClientRect().top + scrollY; sf._h = sf.offsetHeight; };
    measure(); addEventListener('resize', measure); addEventListener('load', measure); if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);
    const loop = () => {
      // progress from Lenis's own (fractional) scroll value: the page's scrollY is rounded to whole pixels, so at a slow scroll
      // it moves on some display frames and not others; the animated value moves on every one
      raf = 0; const y = lenis ? lenis.animatedScroll : scrollY, H = innerHeight, rt = sf._top - y, rb = rt + sf._h;
      const p = clamp((y - sf._top) / Math.max(1, sf._h - H)), pos = p * (n - 1), f = Math.round(pos);      // direct: the scroll is already smoothed by Lenis; a second easing only adds lag
      if (f !== cur) { cur = f; aim = f; warm(); }
      if (Math.abs(pos - shown) > .002) draw(pos);
      chs.forEach(c => c.classList.toggle('on', p >= +c.dataset.from && p <= +c.dataset.to));
      put(bar, 'transform', `scaleX(${p.toFixed(4)})`);
      if (hint) put(hint, 'opacity', (1 - clamp(p * 12)).toFixed(3));
      // fade in as the stage rises into view and out as it leaves, so each film dissolves into the page around it
      put(stage, 'opacity', Math.min(smooth(clamp(1 - rt / (H * .85))), smooth(clamp(rb / (H * .85)))).toFixed(3));
      if (hand) put(sf, '--hand', smooth(clamp((p - +hand.dataset.from) / Math.max(.001, +hand.dataset.to - +hand.dataset.from))).toFixed(3));
      if (visible) raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) load(); }), { rootMargin: '160% 0px' }).observe(sf);
    new IntersectionObserver(es => es.forEach(e => { inReach = e.isIntersecting; inReach ? warm() : drop(); }), { rootMargin: '70% 0px' }).observe(sf);
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible && !raf) { size(); raf = requestAnimationFrame(loop); } }), { rootMargin: '10% 0px' }).observe(sf);
    addEventListener('resize', () => { const s2 = pick(); if (s2 !== set) { set = s2; reset(); started = false; if (visible) load(); } size(); });
    // the first frame paints from the poster <img> until the decoded film is ready
  });

  /* ---------- background clips: load when near, play once when on screen, then rest on the last frame ---------- */
  $$('[data-vband]').forEach(b => {
    const v = $('video', b); let primed = false, done = false;
    v.muted = true;
    const prime = () => { if (primed) return; primed = true; const t = innerWidth < 768 && innerHeight > innerWidth ? 'm' : 'd';
      v.poster = v.dataset['p' + t]; if (!reduced) { v.src = v.dataset[t]; v.load(); } };
    v.addEventListener('ended', () => { done = true; });
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) prime(); }), { rootMargin: '120% 0px' }).observe(b);
    new IntersectionObserver(es => es.forEach(e => {
      if (reduced || done) return;
      if (e.isIntersecting) { prime(); v.play().catch(() => {}); } else if (!v.paused) v.pause();
    }), { threshold: .45 }).observe(b);
  });

  /* ---------- face map: a point on the portrait opens its treatment family; cycles on its own ---------- */
  $$('[data-fmap]').forEach(m => {
    const pins = $$('.fpin', m), cards = $$('.fcard', m); let i = 0, timer;
    const go = n => { i = n; pins.forEach((p, k) => p.classList.toggle('on', k === i)); cards.forEach((c, k) => c.classList.toggle('on', k === i)); };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go((i + 1) % pins.length), 4500); };
    pins.forEach((p, k) => { p.addEventListener('click', () => { go(k); auto(); }); p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { go(k); auto(); } }); });
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { m.classList.add('in'); auto(); } else clearInterval(timer); }), { threshold: .3 }).observe(m);
    go(0);
  });

  /* face study markers: tap to open the treatment tip */
  $$('.pzone').forEach(z => z.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const was = z.classList.contains('is-active');
    $$('.pzone').forEach(o => o.classList.remove('is-active'));
    if (!was) z.classList.add('is-active');
  }));

  /* ---------- light band: before/after slider, result tabs, clinic tabs ---------- */
  $$('[data-cmp]').forEach(c => {
    const set = x => c.style.setProperty('--x', (clamp(x) * 100).toFixed(2) + '%');
    const at = e => set((e.clientX - c.getBoundingClientRect().left) / c.getBoundingClientRect().width);
    let down = false;
    c.addEventListener('pointerdown', e => { down = true; c.setPointerCapture(e.pointerId); at(e); });
    c.addEventListener('pointermove', e => { if (down) at(e); });
    addEventListener('pointerup', () => { down = false; });
    set(.5);
  });
  $$('[data-ba-tabs]').forEach(t => $$('.tab', t).forEach(b => b.addEventListener('click', () => {
    const sec = b.closest('section'); $$('.tab', t).forEach(x => x.classList.toggle('on', x === b));
    $$('[data-ba]', sec).forEach(x => { if (!x.classList.contains('tab')) x.classList.toggle('on', x.dataset.ba === b.dataset.ba); });
    const c = $('[data-cmp]', sec); if (c) c.style.setProperty('--x', '50%');
  })));
  $$('[data-loc-tabs]').forEach(t => $$('.ltab', t).forEach(b => b.addEventListener('click', () => {
    const sec = b.closest('section'); $$('.ltab', t).forEach(x => x.classList.toggle('on', x === b));
    $$('.loc', sec).forEach(x => x.classList.toggle('on', x.dataset.loc === b.dataset.loc));
  })));
  $$('.acc[data-acc]').forEach(g => $$('.acc__q', g).forEach(q => q.addEventListener('click', () => {
    const it = q.parentElement, open = !it.classList.contains('open');
    $$('.acc__item', g).forEach(o => { o.classList.remove('open'); $('.acc__q', o).setAttribute('aria-expanded', 'false'); });
    if (open) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
  })));

  /* ---------- FAQ accordion ---------- */
  $$('[data-acc]').forEach(g => $$('.faq__q', g).forEach(q => q.addEventListener('click', () => {
    const it = q.parentElement, open = !it.classList.contains('open');
    $$('.faq__item', g).forEach(o => { o.classList.remove('open'); $('.faq__q', o).setAttribute('aria-expanded', 'false'); });
    if (open) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
  })));

  /* ---------- quotes ---------- */
  $$('[data-quotes]').forEach(s => {
    const qs = $$('.quote', s), count = $('[data-q-count]', s); let i = 0, timer;
    const go = n => { i = (n + qs.length) % qs.length; qs.forEach((q, k) => q.classList.toggle('on', k === i)); if (count) count.textContent = `${i + 1} of ${qs.length}`; };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(i + 1), 7000); };
    $$('[data-q]', s).forEach(b => b.addEventListener('click', () => { go(i + +b.dataset.q); auto(); }));
    auto();
  });

  /* ---------- promo strip: arrows + drag ---------- */
  $$('.promos').forEach(p => {
    const t = $('[data-strip-track]', p); if (!t) return;
    $$('[data-strip]', p).forEach(b => b.addEventListener('click', () => t.scrollBy({ left: +b.dataset.strip * t.clientWidth * .8, behavior: 'smooth' })));
    let x0 = null, s0 = 0;
    t.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; x0 = e.clientX; s0 = t.scrollLeft; t.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', e => { if (x0 !== null) t.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener('pointerup', () => { if (x0 !== null) { x0 = null; t.style.scrollSnapType = ''; } });
  });

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, n = +el.dataset.count; if (reduced || !n) return;
    const t0 = performance.now(), d = 1400;
    const f = t => { const p = clamp((t - t0) / d); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- product overlay (card → full view) ---------- */
  const ov = $('#overlay');
  if (ov) {
    const stage = $('.overlay__stage', ov), im = $('#ov-img', ov);
    let lastCard = null;
    const open = (data, from) => {
      lastCard = from;
      im.src = data.img; im.alt = data.name;
      $('#ov-eyebrow', ov).textContent = data.eyebrow || ''; $('#ov-name', ov).textContent = data.name; $('#ov-desc', ov).textContent = data.desc || '';
      $('#ov-dl', ov).innerHTML = (data.dl || []).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
      $('#ov-actions', ov).innerHTML = (data.actions || []).map(([l, h, c]) => `<a class="${c}" href="${h}">${l}</a>`).join('');
      ov.classList.add('is-open'); ov.setAttribute('aria-hidden', 'false'); lenis?.stop(); root.style.overflow = 'hidden';
      const a = from.querySelector('.card__media').getBoundingClientRect(), b = stage.getBoundingClientRect();
      if (!reduced && b.width) {
        stage.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`, transformOrigin: '0 0' },
                       { transform: 'none', transformOrigin: '0 0' }], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
      $('.overlay__close', ov).focus({ preventScroll: true });
    };
    const close = () => { ov.classList.remove('is-open'); ov.setAttribute('aria-hidden', 'true'); lenis?.start(); root.style.overflow = ''; lastCard?.focus({ preventScroll: true }); };
    $$('[data-piece]').forEach(c => c.addEventListener('click', e => { e.preventDefault(); try { open(JSON.parse(c.dataset.piece), c); } catch (er) {} }));
    $$('[data-close]', ov).forEach(b => b.addEventListener('click', close));
    addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('is-open')) close(); });
  }

  /* ---------- film dialog ---------- */
  const film = $('#film-dialog');
  if (film) {
    const v = $('video', film);
    $$('[data-film-open]').forEach(b => b.addEventListener('click', () => { film.showModal(); lenis?.stop(); v.play().catch(() => {}); }));
    const shut = () => { v.pause(); film.close(); lenis?.start(); };
    $('[data-film-close]', film).addEventListener('click', shut);
    film.addEventListener('close', () => { v.pause(); lenis?.start(); });
  }

  /* ---------- demo form ---------- */
  $$('.form').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const b = $('button[type=submit]', f); b.textContent = 'Preview only: this form is not connected yet.'; b.disabled = true; }));
})();
