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

  /* ---- How it works: sticky heading shrinks 1→.6 and fades over ~1000px (probe work_scroll) ---- */
  const work = document.querySelector('.work');
  const workHead = work && work.querySelector('.head');
  /* ---- Approach: pinned block, track translates X at 0.859 px per px of scroll (probe approach_scroll) ---- */
  const approach = document.querySelector('.approach');
  const track = approach && approach.querySelector('.approach__track');
  let trackDist = 0;
  const measureTrack = () => {
    if (!track || isPhone()) return;
    const wrapW = approach.querySelector('.wrap').getBoundingClientRect().width;
    trackDist = Math.max(0, track.scrollWidth - wrapW);
    /* section height = pin height + scroll needed for the full translate (template: 4640px of X over 5400px of Y) */
    const pin = approach.querySelector('.approach__pin');
    approach.style.minHeight = (pin.getBoundingClientRect().height + trackDist / 0.859 + 160) + 'px';
  };
  const onScroll = () => {
    const y = window.scrollY;
    if (workHead && !isPhone() && !reduced) {
      const top = work.getBoundingClientRect().top + y;         /* section top in page coords */
      const p = Math.min(1, Math.max(0, (y - (top - 232)) / 1000));
      const sc = 1 - 0.4 * p, op = Math.max(0, 1 - Math.pow(p, 0.8) * 1.05);
      workHead.style.transform = 'scale(' + sc.toFixed(4) + ')';
      workHead.style.opacity = op.toFixed(3);
    }
    if (track && !isPhone()) {
      const top = approach.getBoundingClientRect().top + y;
      const x = Math.min(trackDist, Math.max(0, (y - (top - 3)) * 0.859));
      track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    }
  };
  if (workHead || track) {
    measureTrack();
    window.addEventListener('resize', () => { measureTrack(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', () => { measureTrack(); onScroll(); });
    onScroll();
  }

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
