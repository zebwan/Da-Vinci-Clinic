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

  /* ---------- text arrives: every heading, line and link fills in from the left as it scrolls into view ----------
     A soft mask edge sweeps across each block (the unfilled part waits at a faint 8%). Order of importance sets the timing:
     big headings first and fastest, then subheads, labels, body text (list items one after another), links and buttons last.
     The mask comes off when the sweep is done, so nothing keeps a mask (or loses its own hover transitions) afterwards. */
  if (!reduced) {
    const TXT = 'main h1, main h2, main h3, main p, main li, main .eyebrow, main .link, main .btn, main dt, main dd, main blockquote, main figcaption, main .tab, main .ltab, main .faq__q, main .acc__q, main .stats > div, main .rows__item > *, .footer b, .footer a, .footer p';
    const OWN = '.sfilm__ch:not(.sfilm__ch--hero), .fm__drum, .pmq, .orbit, .scenes, .chapter, .pmap, .variants, .cuff, .study, .takeover, .lookbook, [data-words], .heritage__word, .awards__proof, .overlay, .menu, .faq__a, .acc__a';
    const timing = el => el.matches('h1, h2, .section-title') ? [.85, 0] : el.matches('h3') ? [.95, .08] : el.matches('.eyebrow') ? [.8, .14] : el.matches('.link, .btn, .tab, .ltab') ? [.9, .42] : [1.25, .24];
    const tio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const el = e.target; tio.unobserve(el); el.classList.add('in');
      setTimeout(() => el.classList.remove('tw', 'in'), el._tt * 1000 + 150);
    }), { rootMargin: '0px 0px -8% 0px' });
    $$(TXT).forEach(el => {
      if (el.closest(OWN) || (el.parentElement && el.parentElement.closest('.tw')) || !el.textContent.trim() || !el.getClientRects().length) return;
      const [d, l0] = timing(el), l = l0 + (el.matches('li, dt, dd, .stats > div, .rows__item > *') ? Math.min(6, [...el.parentElement.children].indexOf(el)) * .06 : 0);
      el.style.setProperty('--td', d + 's'); el.style.setProperty('--tl', l.toFixed(2) + 's'); el._tt = d + l;
      el.classList.add('tw'); tio.observe(el);
    });
  }

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

  // awards: the grid's travel only changes on resize/load, so measure it then, never inside the scroll loop
  const sizeAwards = () => awardsEls.forEach(a => {
    const g = a._g || (a._g = $('.awards__grid', a)), w = a._w || (a._w = $('.awards__wall', a));
    a._extra = innerWidth < 768 ? 0 : Math.max(0, g.scrollHeight - w.clientHeight);
    a.style.height = innerWidth < 768 ? '' : (innerHeight + a._extra * 1.1) + 'px';
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
    awardsEls.forEach(a => {     // the cabinet drifts up as one grid while the stage is pinned (desktop); phones swipe it
      const p = prog(a); a.classList.toggle('in', p > .02 || W < 768);
      if (W < 768) return;
      const g = a._g || (a._g = $('.awards__grid', a)), yy = -p * (a._extra || 0), dy = yy - (a._y || 0); a._y = yy;
      put(g, 'transform', `translate3d(0,${yy.toFixed(1)}px,0)`);
      if (!near(geo.get(a), H)) return;
      // a lens on the cabinet: the row crossing the middle of the screen comes forward, the rows at the edges sink back
      (a._aw || []).forEach(w => { const b = geo.get(w); if (!b) return; const f = clamp(Math.abs(b.top + dy + b.height / 2 - H * .52) / (H * .55));
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

  /* ---------- the hero film: the pinned stage plays the close-up frame by frame as you scroll ----------
     Loading: the frames come PACKED (build/pack.py), a coarse pass of every 8th frame first, then 32-frame chunks nearest
     the reader. One request per frame meant ~800 round trips and ~40 s on GitHub Pages, so every fresh load stuttered
     until the reader had scrolled through once. The byte lengths to cut each file back into frames are inlined in the page.
     Smoothness: a window of frames around the reader (mostly ahead of it) is kept DECODED as ImageBitmaps
     (createImageBitmap decodes off the main thread), the canvas is sized to the source frame, and the picture is drawn at a
     fractional position, blending the two nearest frames that are ready. */
  $$('[data-sfilm]').forEach(sf => {
    const n = +sf.dataset.n, cv = $('.sfilm__canvas', sf), ctx = cv.getContext('2d', { alpha: false }), chs = $$('.sfilm__ch', sf), bar = $('.sfilm__bar span', sf);
    const PK = JSON.parse($('#' + sf.dataset.pack).textContent), NC = Math.ceil(n / PK.chunk);
    const pick = () => (innerWidth < 768 && innerHeight > innerWidth ? 'm' : 'd');
    const AHEAD = 30, BEHIND = 10, PAR = 3;
    let set = pick(), blobs, bmps, files, gen = 0, cur = 0, dir = 1, shown = -1, visible = false, raf = 0, inflight = 0;
    const reset = () => {
      if (bmps) bmps.forEach(b => b && b.close && b.close());
      blobs = new Array(n); bmps = new Array(n); inflight = 0; shown = -1; gen++;
      const idx = (a, b, s) => { const o = []; for (let i = a; i < b; i += s) o.push(i); return o; };
      files = [{ name: 'k', idx: idx(0, n, PK.stride), state: 0, tries: 0 }].concat(idx(0, NC, 1).map(c => ({ name: String(c).padStart(2, '0'), idx: idx(c * PK.chunk, Math.min(n, (c + 1) * PK.chunk), 1), state: 0, tries: 0 })));
    };
    reset();
    // fetch order: the coarse pass (the whole film becomes playable at once), then the chunk under the reader, then outward, ahead first
    const nextFile = () => {
      if (!files[0].state) return files[0];
      const c0 = Math.floor(cur / PK.chunk);
      for (let d = 0; d < NC; d++) for (const c of (dir >= 0 ? [c0 + d, c0 - d] : [c0 - d, c0 + d])) { const f = c >= 0 && c < NC && files[1 + c]; if (f && !f.state) return f; }
      return null;
    };
    const pump = () => {
      const g = gen;
      while (inflight < (files[0].state === 2 ? PAR : 1)) {     // the coarse pass gets the connection to itself until it is in
        const f = nextFile(); if (!f) return;
        f.state = 1; inflight++;
        fetch(`${sf.dataset.base}${set}-${f.name}.bin`).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(buf => {
          if (g !== gen) return; inflight--; f.state = 2;
          const L = PK[set]; let o = 0;
          for (const i of f.idx) { if (!blobs[i]) blobs[i] = new Blob([new Uint8Array(buf, o, L[i])], { type: 'image/webp' }); o += L[i]; }
          warm(); pump();
        }, () => { if (g !== gen) return; inflight--; f.tries++; f.state = f.tries < 3 ? 0 : 2; setTimeout(() => { if (g === gen) pump(); }, 1200 * f.tries); });
      }
    };
    let started = false;
    const load = () => { if (started) return; started = true; pump(); };
    let inReach = false;     // decoded frames are several MB each: only kept while the film is near
    const drop = () => { for (let i = 0; i < n; i++) if (bmps[i]) { if (bmps[i].close) bmps[i].close(); bmps[i] = null; } shown = -1; };
    const warm = () => {
      if (!inReach) return;
      const g = gen, lo = Math.max(0, cur - (dir > 0 ? BEHIND : AHEAD)), hi = Math.min(n - 1, cur + (dir > 0 ? AHEAD : BEHIND));
      for (let d = 0; d <= AHEAD; d++) for (const i of (d ? [cur + d * dir, cur - d * dir] : [cur])) {
        if (i < lo || i > hi || !blobs[i] || bmps[i]) continue;
        bmps[i] = 'making';
        createImageBitmap(blobs[i]).then(bm => { if (g !== gen || bmps[i] !== 'making') { bm.close(); return; } bmps[i] = bm; if (Math.abs(i - cur) <= PK.stride) shown = -1; }, () => { bmps[i] = null; });
      }
      for (let i = 0; i < n; i++) if (bmps[i] && (i < lo - 8 || i > hi + 8)) { if (bmps[i].close) bmps[i].close(); bmps[i] = null; }   // release what fell out of the window
    };
    const ready = i => i >= 0 && i < n && bmps[i] && typeof bmps[i] !== 'string';
    const nearest = i => { if (ready(i)) return i; for (let d = 1; d < n; d++) { if (ready(i - d)) return i - d; if (ready(i + d)) return i + d; if (i - d < 0 && i + d >= n) break; } return -1; };
    const below = i => { for (let k = Math.min(i, n - 1); k >= 0 && k > i - 2 * PK.stride; k--) if (ready(k)) return k; return -1; };
    const above = i => { for (let k = Math.max(i, 0); k < n && k < i + 2 * PK.stride; k++) if (ready(k)) return k; return -1; };
    const size = () => {     // canvas at source resolution (never above it): a draw is then a plain blit, even on Retina
      const r = cv.getBoundingClientRect(), [sw, sh] = (set === 'm' ? sf.dataset.mratio : sf.dataset.ratio).split('x').map(Number);
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.max(sw / Math.max(1, r.width), sh / Math.max(1, r.height), .75));
      cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr)); shown = -1;
    };
    const frameOf = i => ready(i) ? bmps[i] : null;
    const rect = im => {
      const W = cv.width, H = cv.height, iw = im.width, ih = im.height;
      if (set === 'm') { const s = Math.max(W / iw, .56 * H / ih), w = iw * s, h = ih * s; return [(W - w) / 2, Math.max(0, H * .4 - h / 2), w, h]; }
      const s = Math.max(W / iw, H / ih), w = iw * s, h = ih * s; return [(W - w) / 2, (H - h) / 2, w, h];
    };
    const blit = (im, a) => { if (!im || a <= .002) return; const [x, y, w, h] = rect(im); ctx.globalAlpha = Math.min(1, a); ctx.drawImage(im, x, y, w, h); ctx.globalAlpha = 1; };
    // Drawn at a FRACTIONAL position: the nearest ready frame below, with the nearest ready frame above laid over it by how far
    // we are between them. With every frame loaded that is frame A and A+1 (pear.no's two-texture blend); while only the coarse
    // pass is in, it cross-dissolves between frames 8 apart instead of jumping. Scrolling fast, it draws just the nearer one.
    const draw = pos => {
      let a = below(Math.floor(pos)), b = above(Math.ceil(pos));
      if (a < 0 && b < 0) { const k = nearest(Math.round(pos)); if (k < 0) return; a = b = k; }
      if (a < 0) a = b; if (b < 0) b = a;
      let t = b > a ? (pos - a) / (b - a) : 0;
      if (Math.abs(pos - shown) > 1.5) { if (t < .5) b = a; else a = b; t = 0; }
      const ia = frameOf(a), W = cv.width, H = cv.height;
      if (set === 'm') { ctx.fillStyle = '#06111f'; ctx.fillRect(0, 0, W, H); }
      blit(ia, 1); if (b !== a && t > .004) blit(frameOf(b), t);
      if (set === 'm') {     // phones: the 4:5 film fills the width, sits in the upper part, and feathers into the navy above and below
        const [, y, , h] = rect(ia), f = h * .14;
        const top = ctx.createLinearGradient(0, y, 0, y + f); top.addColorStop(0, '#06111f'); top.addColorStop(1, 'rgba(6,17,31,0)'); ctx.fillStyle = top; ctx.fillRect(0, y, W, f);
        const bot = ctx.createLinearGradient(0, y + h - f * 1.4, 0, y + h); bot.addColorStop(0, 'rgba(6,17,31,0)'); bot.addColorStop(1, '#06111f'); ctx.fillStyle = bot; ctx.fillRect(0, y + h - f * 1.4, W, f * 1.4 + 1);
      }
      shown = pos; sf._dbg = [pos, a, b]; sf.classList.add('is-ready');
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
      if (f !== cur) { dir = f > cur ? 1 : -1; cur = f; warm(); if (started) pump(); }
      if (Math.abs(pos - shown) > .002) draw(pos);
      chs.forEach(c => c.classList.toggle('on', p >= +c.dataset.from && p <= +c.dataset.to));
      put(bar, 'transform', `scaleX(${p.toFixed(4)})`);
      if (hint) put(hint, 'opacity', (1 - clamp(p * 12)).toFixed(3));
      // fade in as the stage rises into view and out as it leaves, so each film dissolves into the page around it
      put(stage, 'opacity', Math.min(smooth(clamp(1 - rt / (H * .85))), smooth(clamp(rb / (H * .85)))).toFixed(3));
      if (hand) put(sf, '--hand', smooth(clamp((p - +hand.dataset.from) / Math.max(.001, +hand.dataset.to - +hand.dataset.from))).toFixed(3));
      if (visible) raf = requestAnimationFrame(loop);
    };
    load();     // the hero is the first thing on the page: start at once (the coarse pass and first chunk are also preloaded in <head>)
    new IntersectionObserver(es => es.forEach(e => { inReach = e.isIntersecting; inReach ? warm() : drop(); }), { rootMargin: '70% 0px' }).observe(sf);
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible && !raf) { size(); raf = requestAnimationFrame(loop); } }), { rootMargin: '10% 0px' }).observe(sf);
    addEventListener('resize', () => { const s2 = pick(); if (s2 !== set) { set = s2; reset(); started = false; load(); } size(); });
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

  /* ---------- face map: the scroll draws a line down the face, point to point, and the treatments roll by like a drum ----------
     Timeline (progress through the pinned section): each point gets an equal share; at each one the drum holds still for a
     while so the text can be read, then the line draws on to the next point while the drum rolls to the next treatment.
     The roll is 2D (translateY + scaleY(cos θ)), which looks like rotateX without Chrome's 3D frame drops. */
  $$('[data-fm]').forEach(m => {
    const dots = $$('.fm__dot', m), its = $$('.fm__it', m), line = $('.fm__line', m), N = dots.length;
    const P = $('.fm__trail', m).getAttribute('points').trim().split(/\s+/).map(q => q.split(',').map(Number));
    const cum = [0]; for (let i = 1; i < N; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const total = cum[N - 1]; line.style.strokeDasharray = `${total} ${total}`; line.style.strokeDashoffset = total;
    const T0 = .05, T1 = .95, HOLD = .4;      // first and last point; share of each step spent holding still on a point
    const at = i => T0 + i * (T1 - T0) / (N - 1);
    let last = '';
    const update = () => {
      const r = m.getBoundingClientRect(), H = innerHeight;
      if (r.bottom < -H || r.top > 2 * H) return;
      const p = clamp(-r.top / Math.max(1, r.height - H));
      let z = 0;      // continuous position along the points: 2.5 = halfway from the third point to the fourth
      if (p >= T1) z = N - 1; else if (p > T0) { const k = Math.floor((p - T0) / ((T1 - T0) / (N - 1))), s0 = clamp((p - at(k)) / (at(k + 1) - at(k))); z = k + smooth(clamp((s0 - HOLD) / (1 - HOLD))); }
      const key = z.toFixed(4) + (p > T0 * .4 ? 1 : 0); if (key === last) return; last = key;
      const k = Math.floor(z), f = z - k, drawn = p < T0 * .4 ? 0 : k >= N - 1 ? total : cum[k] + (cum[k + 1] - cum[k]) * f;
      put(line, 'strokeDashoffset', (total - drawn).toFixed(1));
      const cur = Math.round(z);
      dots.forEach((d, i) => { d.classList.toggle('on', p >= T0 * .4 && cum[i] <= drawn + .5); d.classList.toggle('cur', i === cur && p >= T0 * .4); });
      const R = m._dh || (m._dh = $('.fm__drum', m).clientHeight * .56);
      its.forEach((it, i) => {
        const th = clamp((i - z) * 1.3, -1.5708, 1.5708), c = Math.cos(th);
        put(it, 'transform', `translate3d(0,${(Math.sin(th) * R - it.offsetHeight / 2).toFixed(1)}px,0) scaleY(${Math.max(.001, c).toFixed(3)})`);
        put(it, 'opacity', (c * c * c).toFixed(3)); it.classList.toggle('cur', i === cur);
      });
    };
    addEventListener('resize', () => { m._dh = 0; last = ''; update(); });
    let tk = false; addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(() => { tk = false; update(); }); } }, { passive: true });
    update();
    // a point jumps to its place in the timeline
    dots.forEach((d, i) => d.addEventListener('click', () => { const top = m.getBoundingClientRect().top + scrollY, span = m.offsetHeight - innerHeight; scrollToY(top + span * (at(i) + .002)); }));
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
