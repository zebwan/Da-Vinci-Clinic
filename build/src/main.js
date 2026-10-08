/* Da Vinci × Helora — behaviours measured from the template (see 01-template-helora/TEARDOWN.md §10 and probe/) */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = () => window.innerWidth < 768;

  /* ---- mobile menu ---- */
  const burger = document.querySelector('.burger'), header = document.querySelector('.header'), mnav = document.querySelector('.mnav');
  if (burger) {
    /* template: the fixed bar itself grows from 64 to the full panel height (.6s ease-in-out) while the link list slides up 66px */
    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      header.style.height = open ? (header.querySelector('.header__in').offsetHeight + mnav.offsetHeight) + 'px' : '';
    };
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    document.querySelectorAll('.mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('resize', () => { if (window.innerWidth >= 1200 && document.body.classList.contains('menu-open')) setMenu(false); });
  }

  /* ---- reveals: opacity .001 translateY(200) scale(.7) → identity, 2s ease [.16,1,.3,1], stagger .1 ---- */
  const rvs = [...document.querySelectorAll('.rv, .zoom')];
  if (reduced) { rvs.forEach(e => e.classList.add('is-in')); }
  else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    rvs.forEach(e => io.observe(e));
    /* hero copy appears on load like the template's appear animation; the 200px start offset would otherwise
       push the lower hero items (button, clinic count) below the observer and leave them hidden until a scroll */
    requestAnimationFrame(() => document.querySelectorAll('.hero .rv, .ihero .rv').forEach(e => { e.classList.add('is-in'); io.unobserve(e); }));
  }
  /* hero: photo zoom-out from 1.1 (2s), cut-out drops in, pill + proof appear at 1.2s (probe hero_appear) */
  const heroBg = document.querySelector('.hero__bg img');
  const heroCut = document.querySelector('.hero__cut');
  if (heroBg && !reduced) {
    requestAnimationFrame(() => {
      heroBg.style.transition = 'transform 2s cubic-bezier(.16,1,.3,1)';
      heroBg.style.transform = 'scale(1)';
      if (heroCut) { heroCut.style.transition = 'opacity 1.2s cubic-bezier(.16,1,.3,1), transform 2s cubic-bezier(.16,1,.3,1)'; heroCut.style.opacity = '1'; heroCut.style.transform = window.innerWidth < 1200 ? 'none' : 'translateX(-50%) translateY(0)'; }
    });
  } else if (heroCut) { heroCut.style.opacity = '1'; heroCut.style.transform = window.innerWidth < 1200 ? 'none' : 'translateX(-50%)'; }

  /* ---- count-up (≈0.6s, ease-out) ---- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const run = (el) => {
      const target = parseFloat(el.dataset.count), prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 700;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      if (reduced) { el.textContent = prefix + target + suffix; return; }
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((es) => es.forEach(en => { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } }), { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---- How it works: sticky heading shrinks 1→.6 and fades over ~1000px (template) over the pinned sculpture film;
         a gold line draws down the centre and lights each step ---- */
  const work = document.querySelector('.work');
  const workHead = work && work.querySelector('.head');
  const spine = work && work.querySelector('.work__spine');
  const line = spine && spine.querySelector('.work__line');
  const nodes = spine ? [...spine.querySelectorAll('.work__node')] : [];
  const cards = work ? [...work.querySelectorAll('.wcard')] : [];
  let nodeY = [];
  const placeNodes = () => {
    if (!spine) return;
    /* layout offsets, not getBoundingClientRect: the cards may still carry their reveal transform */
    nodeY = [];
    cards.forEach(c => { nodeY[+c.dataset.step] = c.parentElement.offsetTop + c.offsetTop + Math.min(c.offsetHeight * .5, 260) - spine.offsetTop; });
    nodes.forEach((n, i) => { const k = +n.dataset.node; n.style.top = (nodeY[k] || 0) + 'px'; });
  };
  /* parallax for decorative sculptures: translate relative to the parent's position in the viewport */
  const pars = [...document.querySelectorAll('[data-par]')];
  const onScroll = () => {
    const y = window.scrollY, vh = window.innerHeight;
    if (workHead && !reduced) {
      const top = work.getBoundingClientRect().top + y;         /* section top in page coords */
      const p = Math.min(1, Math.max(0, (y - (top - 232)) / 1000));
      const sc = 1 - 0.4 * p, op = Math.max(0, 1 - Math.pow(p, 0.8) * 1.05);
      workHead.style.transform = 'scale(' + sc.toFixed(4) + ')';
      workHead.style.opacity = op.toFixed(3);
    }
    if (line) {
      const r = spine.getBoundingClientRect();
      const pen = Math.min(r.height, Math.max(0, vh * .5 - r.top));      /* the line is drawn to the middle of the screen */
      line.style.transform = 'scaleY(' + (pen / r.height).toFixed(4) + ')';
      nodes.forEach(n => n.classList.toggle('is-on', pen >= (nodeY[+n.dataset.node] || 1e9) - 2));
    }
    if (!reduced) pars.forEach(el => {
      const pr = el.parentElement.getBoundingClientRect();
      const d = (pr.top + pr.height / 2) - vh / 2, lim = window.innerWidth < 768 ? 22 : 60;
      el.style.translate = '0 ' + Math.max(-lim, Math.min(lim, -d * parseFloat(el.dataset.par))).toFixed(1) + 'px';
    });
  };
  if (workHead || pars.length) {
    placeNodes();
    window.addEventListener('resize', () => { placeNodes(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', () => { placeNodes(); onScroll(); });
    onScroll();
  }

  /* ---- pinned background film: load on approach, play only while the section is on screen ---- */
  document.querySelectorAll('.work__bgv video').forEach(v => {
    if (reduced) return;   /* poster only */
    let loaded = false;
    new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { if (!loaded) { v.preload = 'auto'; v.load(); loaded = true; } v.play().catch(() => {}); }
      else v.pause();
    }), { rootMargin: '300px 0px' }).observe(v.closest('.work__bg'));
  });

  /* ---- Signature treatments: auto-playing slider (6 s), pauses on hover / focus / off-screen / hidden tab, swipe on touch ---- */
  document.querySelectorAll('.sig__slider').forEach(sl => {
    const track = sl.querySelector('.sig__track'), slides = [...track.children], tabs = [...sl.querySelectorAll('.sig__tab')];
    const dur = +sl.dataset.interval || 6000;
    let i = 0, t0 = performance.now(), elapsed = 0, paused = false, inView = false, raf = 0;
    const go = (n, user) => {
      i = (n + slides.length) % slides.length;
      const step = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 40);
      track.style.transform = 'translate3d(' + (-i * step).toFixed(1) + 'px,0,0)';
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      tabs.forEach((tb, k) => { tb.classList.toggle('is-active', k === i); tb.classList.toggle('is-done', k < i); tb.querySelector('i').style.transform = k < i ? '' : 'scaleX(0)'; });
      elapsed = 0; t0 = performance.now();
    };
    const tick = (now) => {
      if (!paused && inView && !document.hidden) {
        elapsed += now - t0;
        if (elapsed >= dur) go(i + 1); else tabs[i].querySelector('i').style.transform = 'scaleX(' + (elapsed / dur).toFixed(4) + ')';
      }
      t0 = now; raf = requestAnimationFrame(tick);
    };
    tabs.forEach((tb, k) => tb.addEventListener('click', () => go(k, true)));
    sl.querySelector('.sig__prev').addEventListener('click', () => go(i - 1, true));
    sl.querySelector('.sig__next').addEventListener('click', () => go(i + 1, true));
    sl.addEventListener('mouseenter', () => { paused = true; }); sl.addEventListener('mouseleave', () => { paused = false; });
    sl.addEventListener('focusin', () => { paused = true; }); sl.addEventListener('focusout', () => { paused = false; });
    let x0 = null;
    track.addEventListener('pointerdown', e => { x0 = e.clientX; });
    let dragged = false;
    track.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; dragged = Math.abs(dx) > 40; if (dragged) go(i + (dx < 0 ? 1 : -1), true); });
    track.addEventListener('click', e => { if (dragged) { e.preventDefault(); dragged = false; } }, true);   /* a swipe on a linked banner is not a click */
    new IntersectionObserver(es => es.forEach(en => { inView = en.isIntersecting; }), { threshold: .35 }).observe(sl);
    window.addEventListener('resize', () => go(i));
    go(0);
    if (!reduced) raf = requestAnimationFrame(tick);
  });

  /* ---- Team accordion: hovered card expands (desktop only) ---- */
  document.querySelectorAll('.team').forEach(team => {
    const cards = [...team.querySelectorAll('.tcard')];
    cards.forEach(c => {
      c.addEventListener('mouseenter', () => { if (window.innerWidth >= 1200) { cards.forEach(x => x.classList.remove('is-active')); c.classList.add('is-active'); } });
      c.addEventListener('focusin', () => { cards.forEach(x => x.classList.remove('is-active')); c.classList.add('is-active'); });
    });
  });

  /* ---- Testimonial slider: 1130px steps (slide 1120 + gap 10), spring-like ease ~1.1s ---- */
  document.querySelectorAll('.slider').forEach(sl => {
    const tr = sl.querySelector('.slider__track'); const slides = [...tr.children]; let i = 0;
    const go = (n) => {
      if (isPhone()) return;
      i = (n + slides.length) % slides.length;
      const w = slides[0].getBoundingClientRect().width + 10;
      tr.style.transform = 'translate3d(' + (-i * w) + 'px,0,0)';
    };
    sl.querySelector('.slider__btn--prev').addEventListener('click', () => go(i - 1));
    sl.querySelector('.slider__btn--next').addEventListener('click', () => go(i + 1));
    window.addEventListener('resize', () => { if (isPhone()) tr.style.transform = 'none'; else go(i); });
    if (isPhone()) tr.style.transform = 'none';
  });

  /* ---- FAQ accordion (one open per grid is not enforced by the template; items toggle independently) ---- */
  document.querySelectorAll('.faq__item').forEach(it => {
    const btn = it.querySelector('.faq__q');
    btn.addEventListener('click', () => { const open = it.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  });

  /* ---- Journey video knockout words cycle ---- */
  document.querySelectorAll('.journey__media').forEach(m => {
    const words = [...m.querySelectorAll('.journey__word')]; if (!words.length) return;
    let k = 0; words[0].classList.add('is-on');
    if (reduced || words.length < 2) return;
    setInterval(() => { words[k].classList.remove('is-on'); k = (k + 1) % words.length; words[k].classList.add('is-on'); }, 2600);
    const v = m.querySelector('video');
    if (v) { const vio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) v.play().catch(() => {}); else v.pause(); })); vio.observe(v); }
  });

  /* ---- phone swipe rows: progress dots under each row ---- */
  document.querySelectorAll('.swipe-sm').forEach(row => {
    const items = [...row.children]; if (items.length < 2) return;
    const dots = document.createElement('div'); dots.className = 'swipe-dots'; dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = items.map(() => '<i></i>').join(''); row.after(dots);
    const ds = [...dots.children];
    const update = () => {
      const step = items[0].getBoundingClientRect().width + 12;
      const k = Math.min(items.length - 1, Math.round(row.scrollLeft / Math.max(1, step)));
      ds.forEach((d, j) => d.classList.toggle('is-on', j === k));
    };
    row.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
  });

  /* ---- Treatments A–Z: groups are collapsible on phone only ---- */
  const azGroups = [...document.querySelectorAll('details.az__group')];
  if (azGroups.length) {
    if (window.innerWidth < 768) azGroups.forEach((g, i) => { if (i > 0) g.removeAttribute('open'); });
    azGroups.forEach(g => g.querySelector('summary').addEventListener('click', e => { if (window.innerWidth >= 768) e.preventDefault(); }));
  }

  /* ---- current nav link ---- */
  const here = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.nav a, .mnav a').forEach(a => {
    const href = a.getAttribute('href').replace(/index\.html$/, '');
    if (href && here.endsWith(href) && href !== './' && href !== '/') a.setAttribute('aria-current', 'page');
  });

  /* ---- contact form (demo: no backend) ---- */
  document.querySelectorAll('form.form').forEach(f => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = f.querySelector('button[type=submit] .btn__label'); if (btn) btn.textContent = 'Thank you, we will WhatsApp you shortly';
  }));
})();
