/* Da Vinci Clinic, design 2 (Heron template). Vanilla JS + Lenis smooth scroll, like the template (GSAP not needed). */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const vh = () => window.innerHeight;

  /* ---------- smooth scroll (Lenis, as on the template) ---------- */
  let lenis = null;
  const startLenis = () => {
    if (reduced || !window.Lenis || lenis) return;
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };
  if (window.Lenis) startLenis(); else window.addEventListener('load', startLenis);
  const scrollToEl = (el, off = 0) => {
    const y = el.getBoundingClientRect().top + scrollY - off;
    lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };

  /* ---------- loader (first page of a visit) + page transitions ---------- */
  const ld = $('.ld'), pt = $('.pt');
  let firstVisit = false;
  try { firstVisit = !sessionStorage.getItem('dv2-seen'); sessionStorage.setItem('dv2-seen', '1'); } catch (e) {}
  const fromNav = (() => { try { const v = sessionStorage.getItem('dv2-pt'); sessionStorage.removeItem('dv2-pt'); return !!v; } catch (e) { return false; } })();
  const ready = new Promise(res => {
    if (!ld) return res();
    if (!firstVisit || reduced) { ld.remove(); return res(); }
    document.documentElement.style.overflow = 'hidden';
    const img = $('img', ld), line = $('.ld__line', ld), pct = $('.ld__pct', ld);
    const dur = 2300, t0 = performance.now();
    let done = false;
    const finish = () => { if (done) return; done = true; ld.classList.add('out'); document.documentElement.style.overflow = ''; setTimeout(() => ld.remove(), 900); res(); };
    setTimeout(finish, dur + 1500);   /* never hold the page if animation frames are throttled */
    const step = t => {
      if (done) return;
      const p = clamp((t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      img.style.clipPath = `inset(${(1 - e) * 100}% 0 0 0)`;
      line.style.top = `${(1 - e) * 100}%`;
      pct.textContent = Math.round(e * 100) + '%';
      if (p < 1) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
  });
  if (pt && fromNav && !reduced) {
    pt.classList.add('is-on');
    requestAnimationFrame(() => setTimeout(() => pt.classList.remove('is-on'), 120));
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !pt || reduced) return;
    const url = new URL(a.href, location.href);
    if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    if (/\.(pdf|jpg|png|webp)$/i.test(url.pathname)) return;
    e.preventDefault();
    pt.classList.add('is-on');
    try { sessionStorage.setItem('dv2-pt', '1'); } catch (er) {}
    setTimeout(() => { location.href = url.href; }, 520);
  });
  window.addEventListener('pageshow', e => { if (e.persisted && pt) pt.classList.remove('is-on'); });

  /* ---------- header: phone menu ---------- */
  const hdr = $('.hdr'), mbtn = $('.hdr__menu');
  if (mbtn) mbtn.addEventListener('click', () => { const o = hdr.classList.toggle('open'); mbtn.setAttribute('aria-expanded', o); });
  $$('.mnav a').forEach((a, i) => { a.style.transitionDelay = (0.04 * i + .1) + 's'; });
  $$('.hdr__drop>button').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('is-open')));
  const here = location.pathname.replace(/index\.html$/, '');
  $$('.hdr__dd a, .hdr__item[href]').forEach(a => { if (new URL(a.href).pathname === here) { a.classList.add('is-current'); const dd = a.closest('.hdr__drop'); if (dd) $('.hdr__item', dd).classList.add('is-current'); } });

  /* ---------- headings: split into the lines the browser actually renders, so each line can rise on its own ---------- */
  const splitAll = () => {
    const parents = new Set($$('.ln').map(l => l.parentElement));
    parents.forEach(p => {
      if (!p.dataset.text) p.dataset.text = p.textContent.replace(/\s+/g, ' ').trim();
      const words = p.dataset.text.split(' ');
      p.textContent = '';
      const probe = document.createElement('span'); probe.className = 'ln'; const inner = document.createElement('span'); probe.appendChild(inner); p.appendChild(probe);
      const ws = words.map((w, i) => { const s = document.createElement('span'); s.textContent = w; inner.appendChild(s); if (i < words.length - 1) inner.appendChild(document.createTextNode(' ')); return s; });
      const rows = []; let top = null;
      ws.forEach(s => { const t = s.offsetTop; if (top === null || Math.abs(t - top) > 3) { rows.push([]); top = t; } rows[rows.length - 1].push(s.textContent); });
      p.textContent = '';
      rows.forEach(r => { const l = document.createElement('span'); l.className = 'ln'; const sp = document.createElement('span'); sp.textContent = r.join(' '); l.appendChild(sp); p.appendChild(l); p.appendChild(document.createTextNode(' ')); });
    });
  };
  const splitReady = (document.fonts ? document.fonts.ready : Promise.resolve()).then(splitAll);
  let lastW = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - lastW) > 40) { lastW = innerWidth; splitAll(); } });

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  Promise.all([ready, splitReady]).then(() => {
    const lnParents = new Set($$('.ln').map(l => l.parentElement));
    $$('.rv, .draw').forEach(el => io.observe(el));
    lnParents.forEach(p => { if (!p.closest('.rv')) io.observe(p); });
    const hero = $('.hero');
    if (hero) { hero.classList.add('in'); $$('h1', hero).forEach(h => h.classList.add('in')); }
  });

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, n = +el.dataset.count; if (reduced || !n) return;
    const t0 = performance.now(), d = 1200;
    const f = t => { const p = clamp((t - t0) / d); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    el.textContent = '0'; requestAnimationFrame(f);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- scroll-linked: intro word fill, map, concerns parallax, feature tabs, why bar ---------- */
  const fills = $$('h2.fill');
  const map = $('[data-map]');
  const uc = $('.uc__art img');
  const feats = $$('.feat'), ftabs = $$('.ftab');
  const whySteps = $$('.whyst'), whybar = $('.whybar');
  let whyIdx = -1;

  const setMap = () => {
    if (!map) return;
    const r = map.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh()));
    const words = $$('.map__words div', map);
    const fade = (a, b, c, d) => p < a ? 0 : p < b ? (p - a) / (b - a) : p < c ? 1 : p < d ? 1 - (p - c) / (d - c) : 0;
    words[0].style.opacity = p < .02 ? 1 : fade(-1, 0, .08, .12);
    words[1].style.opacity = fade(.12, .15, .2, .24);
    words.forEach(w => { w.style.transform = `translateY(${(1 - +w.style.opacity) * 1.2}rem)`; });
    const img = $('.map__fig img', map);
    img.style.opacity = p < .22 ? 0 : p < .3 ? (p - .22) / .08 * .35 : p < .38 ? .35 + (p - .3) / .08 * .65 : 1;
    const g = clamp((p - .4) / .12);
    $$('.map__fig .guide', map).forEach((el, i) => { el.style.strokeDashoffset = 1 - clamp(g * 1.6 - i * .15); });
    map.classList.toggle('g-on', g > .5);
    $$('.zone', map).forEach((z, i) => z.classList.toggle('on', p > .54 + i * .03));
    const cap = p < .38 ? 0 : p < .52 ? 1 : p < .66 ? 2 : p < .78 ? 3 : 'z';
    $$('.map__cap p', map).forEach(el => el.classList.toggle('on', el.dataset.i == String(cap) && p > .24));
    const cbox = $('.map__cap', map); cbox.style.opacity = p > .24 ? 1 : 0;
    const open = clamp((p - .8) / .1);
    const stage = $('.map__stage', map);
    if (innerWidth > 767) stage.style.gridTemplateColumns = `1fr ${open * 39}vw`;
    else stage.style.gridTemplateRows = `1fr ${open * 62}vh`;
  };
  const tick = () => {
    const H = vh();
    fills.forEach(h => {
      const r = h.getBoundingClientRect(), ws = h.querySelectorAll('.w');
      const p = clamp((H * .85 - r.top) / (H * .55));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    });
    setMap();
    if (uc) { const r = uc.parentElement.getBoundingClientRect(); const p = clamp((H - r.top) / (H + r.height)); uc.style.transform = `translateY(${(p - .5) * -10}%)`; }
    if (feats.length) {
      let act = 0;
      feats.forEach((f, i) => { const r = f.getBoundingClientRect(); const p = clamp((H * .5 - r.top) / r.height); f.style.setProperty('--p', p); if (r.top < H * .55) act = i; f.classList.toggle('in-view', r.top < H * .8 && r.bottom > H * .2); });
      ftabs.forEach((t, i) => t.classList.toggle('on', i === act));
    }
    if (whySteps.length && whybar) {
      let act = 0; whySteps.forEach((s, i) => { if (s.getBoundingClientRect().top < H * .5) act = i; });
      const sec = whybar.parentElement.getBoundingClientRect();
      whybar.style.opacity = sec.top < H * .4 && sec.bottom > H * .7 ? 1 : 0;
      if (act !== whyIdx) {
        whyIdx = act; const s = whySteps[act];
        $('b', whybar).textContent = s.dataset.name; $('span', whybar).textContent = s.dataset.line;
        $$('em', whybar).forEach((e, i) => e.classList.toggle('on', i === act));
      }
    }
  };
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { tick(); ticking = false; }); } };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); tick();
  if (whybar) whybar.style.transition = 'opacity .4s';
  ftabs.forEach((t, i) => t.addEventListener('click', () => feats[i] && scrollToEl(feats[i], innerWidth > 767 ? 140 : 110)));

  /* map markers */
  $$('.zone').forEach(z => z.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const was = z.classList.contains('is-active');
    $$('.zone').forEach(o => o.classList.remove('is-active'));
    if (!was) z.classList.add('is-active');
  }));

  /* ---------- accordions (one open per group) ---------- */
  $$('[data-acc]').forEach(g => $$('.acc__q', g).forEach(q => q.addEventListener('click', () => {
    const it = q.parentElement, open = !it.classList.contains('open');
    $$('.acc__it', g).forEach(o => { o.classList.remove('open'); $('.acc__q', o).setAttribute('aria-expanded', 'false'); });
    if (open) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
  })));

  /* ---------- promo strip ---------- */
  $$('[data-strip]').forEach(s => {
    const track = $('.pstrip__track', s), cards = $$('.pcard', s), [prev, next] = $$(':scope>button', s);
    let i = 0, timer;
    const per = () => innerWidth <= 767 ? 1 : 3;
    const go = n => { const max = Math.max(0, cards.length - per()); i = n > max ? 0 : n < 0 ? max : n; track.style.transform = `translateX(${-i * cards[0].getBoundingClientRect().width}px)`; };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(i + 1), 5000); };
    prev.addEventListener('click', () => { go(i - 1); auto(); }); next.addEventListener('click', () => { go(i + 1); auto(); });
    s.addEventListener('mouseenter', () => clearInterval(timer)); s.addEventListener('mouseleave', auto);
    let x0 = null;
    s.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    s.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); auto(); } x0 = null; });
    addEventListener('resize', () => go(i)); auto();
  });

  /* ---------- big words (about) ---------- */
  $$('.bigw__words').forEach(w => { const ws = $$('span', w); let i = 0; ws[0] && ws[0].classList.add('on'); if (!reduced && ws.length > 1) setInterval(() => { ws[i].classList.remove('on'); i = (i + 1) % ws.length; ws[i].classList.add('on'); }, 1800); });

  /* ---------- hero crosshair + drag-select notes (home, fine pointers) ---------- */
  const hero = $('.hero'), xh = $('.xh');
  if (hero) {
    const notes = $$('.note', hero);
    if (!fine) setTimeout(() => hero.classList.add('show-notes'), 2600);
    if (fine && xh) {
      const stage = $('.hero__stage', hero), sel = $('.xh__sel', xh), tip = $('.xh__tip', xh);
      const hl = $('.xh__h', xh), vl = $('.xh__v', xh);
      let drag = null;
      stage.addEventListener('mouseenter', () => xh.classList.add('is-on'));
      stage.addEventListener('mouseleave', () => { xh.classList.remove('is-on'); drag = null; sel.style.display = 'none'; });
      stage.addEventListener('mousemove', e => {
        hl.style.top = e.clientY + 'px'; vl.style.left = e.clientX + 'px';
        tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px';
        if (drag) {
          const x = Math.min(drag.x, e.clientX), y = Math.min(drag.y, e.clientY);
          Object.assign(sel.style, { display: 'block', left: x + 'px', top: y + 'px', width: Math.abs(e.clientX - drag.x) + 'px', height: Math.abs(e.clientY - drag.y) + 'px' });
        }
      });
      stage.addEventListener('mousedown', e => { drag = { x: e.clientX, y: e.clientY }; e.preventDefault(); });
      addEventListener('mouseup', () => {
        if (!drag) return;
        const b = sel.getBoundingClientRect(); sel.style.display = 'none'; drag = null;
        let hit = 0;
        notes.forEach(n => { const r = n.getBoundingClientRect(); const cx = r.left + r.width * .08, cy = r.bottom + 20; const inside = cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom; n.classList.toggle('is-on', inside); hit += inside; });
        if (!hit && b.width < 8) hero.classList.toggle('show-notes');
        tip.textContent = hit ? 'Drag again to compare' : 'Click and drag across the study';
      });
    }
  }

  /* ---------- demo form ---------- */
  $$('.cform').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const b = $('.cform__send', f); $$('.roll span', b).forEach(s => s.textContent = 'Thank you, we will be in touch'); }));
})();
