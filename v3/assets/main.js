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
  const nav = $('.nav'); let lastY = 0; const lightEl = $('.light');
  const menuBtn = $('.nav__menu');
  if (menuBtn) menuBtn.addEventListener('click', () => {
    const open = !root.classList.contains('menu-open'); root.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', open);
    open ? lenis?.stop() : lenis?.start();
  });
  $$('.menu__big a').forEach((a, i) => a.style.transitionDelay = (.15 + i * .05) + 's');

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv, [data-reveal], .card__media').forEach(el => io.observe(el));

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

  const sizeStripes = () => stripes.forEach(s => {
    const track = $('.stripes__track', s), extra = Math.max(0, track.scrollWidth - innerWidth);
    s.style.height = (innerHeight + extra) + 'px'; s._extra = extra;
  });
  sizeStripes(); addEventListener('resize', sizeStripes); addEventListener('load', sizeStripes);

  const prog = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  function tick() {
    const H = innerHeight, y = scrollY;
    if (nav) { nav.classList.toggle('is-scrolled', y > 40); if (lightEl) nav.classList.toggle('on-light', (() => { const r = lightEl.getBoundingClientRect(); return r.top < 60 && r.bottom > 60; })()); if (!root.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY + 4 && y > H * .6); if (y < lastY - 4) nav.classList.remove('is-hidden'); }
    lastY = y;
    heroes.forEach(h => {
      const p = prog(h), copy = $('[data-hero-copy]', h) || $('.phero__copy', h), hint = $('[data-hero-hint]', h), ring = $('[data-hero-ring]', h);
      if (copy) { const o = h.classList.contains('hero') ? 1 - smooth(clamp(p / .2)) : 1 - smooth(clamp((p - .35) / .45)); copy.style.opacity = o; copy.style.transform = `translateY(${(1 - o) * -30}px) scale(${1 + (1 - o) * .22})`; copy.style.filter = o < .99 ? `blur(${(1 - o) * 6}px)` : ''; }
      if (hint) hint.style.opacity = 1 - clamp(p / .08);
      if (ring) { const o = smooth(clamp((p - .6) / .14)) * (1 - smooth(clamp((p - .93) / .07))); ring.style.opacity = o; }
    });
    manifestos.forEach(m => {
      const r = m.getBoundingClientRect(), ws = m._ws || (m._ws = $$('.w', m));
      const p = clamp((H * .82 - r.top) / (r.height + H * .25)), n = Math.round(p * ws.length * 1.1);
      ws.forEach((w, i) => w.classList.toggle('off', i >= n));
    });
    stripes.forEach(s => { const track = $('.stripes__track', s), p = prog(s); track.style.transform = `translate3d(${-p * (s._extra || 0)}px,0,0)`; });
    takeovers.forEach(t => {
      const p = prog(t), open = smooth(clamp(p / .55)), cap = smooth(clamp((p - .5) / .2)) * (1 - smooth(clamp((p - .92) / .08)));
      t.style.setProperty('--cy', `${(1 - open) * 18}%`); t.style.setProperty('--cx', `${(1 - open) * (innerWidth < 768 ? 10 : 26)}%`);
      t.style.setProperty('--sc', (1.14 - open * .14).toFixed(3)); t.style.setProperty('--cap', cap.toFixed(3));
    });
    cuffs.forEach(c => { const p = prog(c); c.style.setProperty('--c', (smooth(clamp((p - .06) / .2)) * (1 - smooth(clamp((p - .86) / .12)))).toFixed(3)); });
    orbits.forEach(o => {
      const p = prog(o), ring = o._ring || (o._ring = $('[data-orbit-ring]', o)), cards = o._cards || (o._cards = $$('.ocard', o)), caps = o._caps || (o._caps = $$('.orbit__cap', o)), dots = o._dots || (o._dots = $$('.orbit__dots span', o));
      const n = cards.length, intro = smooth(clamp(p / .14)), outro = smooth(clamp((p - .9) / .1)), q = clamp((p - .14) / .72);
      const ry = 30 * (1 - intro) - q * (n - 1) / n * 360;
      ring.style.setProperty('--ry', ry.toFixed(2) + 'deg'); ring.style.setProperty('--s', (.7 + .3 * intro - .15 * outro).toFixed(3)); ring.style.setProperty('--o', (intro * (1 - .6 * outro)).toFixed(3));
      cards.forEach((c, i) => { const f = Math.cos((i * 360 / n + ry) * Math.PI / 180); c.style.setProperty('--f', (.4 + .6 * clamp(f + .25)).toFixed(3)); c.style.setProperty('--b', (.72 + .4 * clamp(f)).toFixed(3)); });
      const i = Math.min(n - 1, Math.round(q * (n - 1)));
      caps.forEach((c, k) => c.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i));
    });
    studies.forEach(s => {
      const p = prog(s), q = clamp((p - .08) / .66), tags = s._tags || (s._tags = $$('.study__tag', s)), steps = s._steps || (s._steps = $$('.study__steps li', s));
      s.style.setProperty('--q', q.toFixed(4)); s.style.setProperty('--l', q > 0 && q < 1 ? '1' : '0'); s.style.setProperty('--z', p > .82 ? '1.04' : '1');
      tags.forEach((t, i) => t.classList.toggle('on', q > .2 + i * .17));
      steps.forEach((li, i) => li.classList.toggle('on', p > i * (.78 / steps.length) + .04 && (p < (i + 1) * (.78 / steps.length) + .04 || i === steps.length - 1)));
    });
    awardsEls.forEach(a => {     // the trophy columns drift upward at three speeds while the stage is pinned
      const p = prog(a), cols = a._c || (a._c = $$('.awards__col', a)); a.classList.toggle('in', p > .04);
      if (innerWidth < 768) return;
      cols.forEach((c, k) => { const h = c.scrollHeight, travel = Math.max(0, h - innerHeight * .92) * (1 + k * .22); c.style.setProperty('--y', (-p * travel).toFixed(1)); });
    });
    pmaps.forEach(m => {     // design 2's face study, same beats: words, face, steps, proportion lines, markers, then the panel
      const p = prog(m), words = m._w || (m._w = $$('.pmap__words div', m));
      const fade = (a, b, c, d) => p < a ? 0 : p < b ? (p - a) / (b - a) : p < c ? 1 : p < d ? 1 - (p - c) / (d - c) : 0;
      words[0].style.opacity = p < .02 ? 1 : fade(-1, 0, .08, .12); words[1].style.opacity = fade(.12, .15, .2, .24);
      words.forEach(w => { w.style.transform = `translateY(${(1 - +w.style.opacity) * 1.2}rem)`; });
      const im = m._im || (m._im = $('.pmap__fig img', m));
      im.style.opacity = p < .22 ? 0 : p < .3 ? (p - .22) / .08 * .35 : p < .38 ? .35 + (p - .3) / .08 * .65 : 1;
      const g = clamp((p - .4) / .12);
      (m._g || (m._g = $$('.pmap__fig .guide', m))).forEach((el, i) => { el.style.strokeDashoffset = 1 - clamp(g * 1.6 - i * .15); });
      m.classList.toggle('g-on', g > .5);
      (m._z || (m._z = $$('.pzone', m))).forEach((z, i) => z.classList.toggle('on', p > .54 + i * .03));
      const cap = p < .38 ? 0 : p < .52 ? 1 : p < .66 ? 2 : p < .78 ? 3 : 'z';
      (m._c || (m._c = $$('.pmap__cap p', m))).forEach(el => el.classList.toggle('on', el.dataset.i == String(cap) && p > .24));
      const desk = innerWidth > 767;
      (m._cb || (m._cb = $('.pmap__cap', m))).style.opacity = desk ? (cap === 'z' ? 1 : 0) : (p > .24 && p < .82 ? 1 : 0);
      if (desk) {     // the steps stay on screen and build up side by side; the newest one carries the gold rule
        const st = m._st || (m._st = $$('.pstep', m)), row = m._row || (m._row = $('.pmap__steps', m)), th = [.24, .38, .52, .66];
        st.forEach((li, i) => { li.classList.toggle('in', p >= th[i]); li.classList.toggle('cur', cap === i); });
        row.style.setProperty('--se', p >= .24 ? 1 : 0); row.style.setProperty('--so', (1 - smooth(clamp((p - .76) / .05))).toFixed(3));
      }
      const open = clamp((p - .8) / .1), stage = m._s || (m._s = $('.pmap__stage', m));
      if (innerWidth > 767) { stage.style.gridTemplateColumns = `1fr ${open * 39}vw`; stage.style.gridTemplateRows = ''; }
      else { stage.style.gridTemplateRows = `1fr ${open * 62}svh`; stage.style.gridTemplateColumns = ''; }
    });
    chapters.forEach(c => {
      const p = prog(c), items = c._it || (c._it = $$('.chapter__item', c)), i = Math.min(items.length - 1, Math.floor(p * items.length * .999));
      items.forEach((el, k) => el.classList.toggle('on', k === i)); c.style.setProperty('--p', p.toFixed(4));
    });
    scenes.forEach(s => {
      const p = prog(s), t = s._t || (s._t = $$('.scenes__title > div', s)), n = t.length, i = Math.min(n - 1, Math.floor(p * n * .999));
      const local = p * n - i, show = n === 1 || (local > .12 || i === 0) && (local < .9 || i === n - 1);
      t.forEach((el, k) => el.classList.toggle('on', k === i && show)); s.style.setProperty('--p', p.toFixed(4)); s._i = i;
    });
    heritage.forEach(h => { const r = h.getBoundingClientRect(); const g = smooth(clamp((H * .7 - r.top) / (H * .9))); h.style.setProperty('--g', g.toFixed(3)); });
    looks.forEach(l => { const r = l.getBoundingClientRect(); const p = clamp((H - r.top) / (H + r.height)); l.style.setProperty('--sc', (1.12 - p * .1).toFixed(3)); });
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

  /* ---------- scroll film: the pinned stage plays the camera move frame by frame as you scroll ----------
     Smoothness comes from three things (the same recipe as pear.no): frames are fetched nearest-first around where the
     reader is, a window of frames around the current one is kept DECODED as ImageBitmaps so a draw never waits on a
     decode, and the canvas is sized to the source frame, not to the Retina viewport, so each draw is a cheap blit. */
  $$('[data-sfilm]').forEach(sf => {
    const n = +sf.dataset.n, cv = $('.sfilm__canvas', sf), ctx = cv.getContext('2d', { alpha: false }), chs = $$('.sfilm__ch', sf), bar = $('.sfilm__bar span', sf);
    const pick = () => (innerWidth < 768 && innerHeight > innerWidth ? 'm' : 'd');
    const WIN = 36, CAP = 96, PAR = 8;
    let set = pick(), imgs = [], loaded, bmps, bmpN = 0, pending, tries, gen = 0, cur = -1, drawn = -1, visible = false, raf = 0, aim = 0, queue = [], inflight = 0;
    const src = i => `${sf.dataset.base}${set}/${String(i + 1).padStart(4, '0')}.webp`;
    const reset = () => { imgs = new Array(n); loaded = new Uint8Array(n); bmps = new Array(n); bmpN = 0; pending = new Uint8Array(n); tries = new Uint8Array(n); queue = []; inflight = 0; drawn = -1; gen++; };
    reset();
    // fetch order: the frame under the reader first, then outward, then a coarse-to-fine sweep of everything else
    const order = () => { const o = [], seen = new Uint8Array(n); for (let s = 32; s >= 1; s >>= 1) for (let i = 0; i < n; i += s) if (!seen[i]) { seen[i] = 1; o.push(i); } return o; };
    const nextToFetch = () => {
      for (let d = 0; d <= 24; d++) for (const i of (d ? [aim + d, aim - d] : [aim])) if (i >= 0 && i < n && !loaded[i] && !pending[i]) return i;
      while (queue.length) { const i = queue.shift(); if (!loaded[i] && !pending[i]) return i; }
      return -1;
    };
    const pump = () => {
      const g = gen;
      while (inflight < PAR) {
        const i = nextToFetch(); if (i < 0) return;
        pending[i] = 1; inflight++; const im = new Image(); im.decoding = 'async';
        im.onload = () => { if (g !== gen) return; loaded[i] = 1; imgs[i] = im; inflight--; warm(); pump(); };
        im.onerror = () => { if (g !== gen) return; inflight--; if (++tries[i] < 3) setTimeout(() => { if (g === gen) { pending[i] = 0; pump(); } }, 1500 * tries[i]); else pump(); };   // a frame that fails three times is left out; the nearest loaded one stands in
        im.src = src(i);
      }
    };
    let started = false;
    const load = () => { if (started) return; started = true; queue = order(); pump(); };
    // decoded window: bitmaps for ±WIN frames around the current one; anything further out is released
    const warm = () => {
      const g = gen, lo = Math.max(0, cur - WIN), hi = Math.min(n - 1, cur + WIN);
      for (let d = 0; d <= WIN; d++) for (const i of (d ? [cur + d, cur - d] : [cur])) {
        if (i < lo || i > hi || !loaded[i] || bmps[i]) continue;
        bmps[i] = 'making'; bmpN++;
        createImageBitmap(imgs[i]).then(b => { if (g !== gen) { b.close(); return; } bmps[i] = b; if (i === cur && drawn !== i) draw(i); }, () => { bmps[i] = null; bmpN--; });
      }
      if (bmpN > CAP) for (let i = 0; i < n; i++) if (bmps[i] && typeof bmps[i] !== 'string' && (i < lo - WIN || i > hi + WIN)) { bmps[i].close(); bmps[i] = null; bmpN--; }
    };
    const nearest = i => { if (loaded[i]) return i; for (let d = 1; d < n; d++) { if (i - d >= 0 && loaded[i - d]) return i - d; if (i + d < n && loaded[i + d]) return i + d; } return -1; };
    const size = () => {     // canvas at source resolution (never above it): a draw is then a plain blit, even on Retina
      const r = cv.getBoundingClientRect(), [sw, sh] = (set === 'm' ? sf.dataset.mratio : sf.dataset.ratio).split('x').map(Number);
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.max(sw / Math.max(1, r.width), sh / Math.max(1, r.height), .75));
      cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr)); drawn = -1;
    };
    const scenes = (sf.dataset.scenes || '').split(',').filter(Boolean).map(Number), XF = 14;   // frames of crossfade either side of a scene start
    const blit = (im, alpha) => {
      const W = cv.width, H = cv.height, iw = im.width, ih = im.height; ctx.globalAlpha = alpha;
      if (set === 'm') { const s = Math.max(W / iw, .56 * H / ih), w = iw * s, h = ih * s, x = (W - w) / 2, y = Math.max(0, H * .4 - h / 2); ctx.drawImage(im, x, y, w, h); }
      else { const s = Math.max(W / iw, H / ih), w = iw * s, h = ih * s; ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); }
      ctx.globalAlpha = 1;
    };
    const frameOf = i => (bmps[i] && typeof bmps[i] !== 'string') ? bmps[i] : imgs[i];
    const draw = i => {
      const im = frameOf(i); if (!im) return;
      const W = cv.width, H = cv.height, iw = im.width, ih = im.height;
      // crossing a scene boundary: hold the last frame of the previous scene under the new one and fade it out
      const sc = scenes.find(s0 => i >= s0 && i < s0 + XF);
      if (sc !== undefined && set === 'd') { const prev = nearest(sc - 1), pim = prev >= 0 ? frameOf(prev) : null;
        if (pim) { blit(pim, 1); blit(im, (i - sc + 1) / XF); drawn = i; sf.classList.add('is-ready'); return; } }
      if (set === 'm') {     // phones: the 4:5 film fills the width, sits in the upper part, and feathers into the navy above and below
        const s = Math.max(W / iw, .56 * H / ih), w = iw * s, h = ih * s, x = (W - w) / 2, y = Math.max(0, H * .4 - h / 2), f = h * .14;
        ctx.fillStyle = '#06111f'; ctx.fillRect(0, 0, W, H); ctx.drawImage(im, x, y, w, h);
        const top = ctx.createLinearGradient(0, y, 0, y + f); top.addColorStop(0, '#06111f'); top.addColorStop(1, 'rgba(6,17,31,0)'); ctx.fillStyle = top; ctx.fillRect(0, y, W, f);
        const bot = ctx.createLinearGradient(0, y + h - f * 1.4, 0, y + h); bot.addColorStop(0, 'rgba(6,17,31,0)'); bot.addColorStop(1, '#06111f'); ctx.fillStyle = bot; ctx.fillRect(0, y + h - f * 1.4, W, f * 1.4 + 1);
      } else { const s = Math.max(W / iw, H / ih), w = iw * s, h = ih * s; ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); }
      drawn = i; sf.classList.add('is-ready');
    };
    const hand = $('.sfilm__hand', sf);
    const loop = () => {
      raf = 0; const r = sf.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - innerHeight));
      const f = Math.round(p * (n - 1));      // direct: the scroll is already smoothed by Lenis; a second easing only adds lag
      if (f !== cur) { cur = f; aim = f; warm(); }
      const i = nearest(cur); if (i >= 0 && i !== drawn) draw(i);
      chs.forEach(c => c.classList.toggle('on', p >= +c.dataset.from && p <= +c.dataset.to));
      bar.style.transform = `scaleX(${p.toFixed(4)})`; sf.style.setProperty('--p', p.toFixed(4));
      if (hand) sf.style.setProperty('--hand', smooth(clamp((p - +hand.dataset.from) / Math.max(.001, +hand.dataset.to - +hand.dataset.from))).toFixed(3));
      if (visible) raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) load(); }), { rootMargin: '250% 0px' }).observe(sf);
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible && !raf) { size(); raf = requestAnimationFrame(loop); } }), { rootMargin: '10% 0px' }).observe(sf);
    addEventListener('resize', () => { const s2 = pick(); if (s2 !== set) { set = s2; reset(); started = false; if (visible) load(); } size(); });
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
