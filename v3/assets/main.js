/* Da Vinci Clinic, design 3 (Tigris): page behaviour. The particle stage itself lives in pt.js. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);
  root.classList.add('js');
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

  /* ---------- scroll-linked sections ---------- */
  const heroes = $$('.hero, .phero');
  const manifestos = $$('[data-words]');
  const stripes = $$('[data-stripes]');
  const takeovers = $$('[data-takeover]');
  const cuffs = $$('[data-cuff]');
  const orbits = $$('[data-orbit]');
  const studies = $$('[data-study]');
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
    if (nav) { nav.classList.toggle('is-scrolled', y > 40); if (!root.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY + 4 && y > H * .6); if (y < lastY - 4) nav.classList.remove('is-hidden'); }
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

  /* ---------- face map: a point on the portrait opens its treatment family; cycles on its own ---------- */
  $$('[data-fmap]').forEach(m => {
    const pins = $$('.fpin', m), cards = $$('.fcard', m); let i = 0, timer;
    const go = n => { i = n; pins.forEach((p, k) => p.classList.toggle('on', k === i)); cards.forEach((c, k) => c.classList.toggle('on', k === i)); };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go((i + 1) % pins.length), 4500); };
    pins.forEach((p, k) => { p.addEventListener('click', () => { go(k); auto(); }); p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { go(k); auto(); } }); });
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { m.classList.add('in'); auto(); } else clearInterval(timer); }), { threshold: .3 }).observe(m);
    go(0);
  });

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
