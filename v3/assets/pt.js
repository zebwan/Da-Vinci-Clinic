/* Da Vinci Clinic, design 3: the Tigris particle stage, rebuilt.
   One fixed WebGL canvas, one cloud of points. Sections mark where a shape should be formed with
   <i class="pt-anchor" data-pt="shape" ...>; between anchors the cloud scatters and re-forms (scroll-driven),
   and between distant anchors it dissolves and the renderer sleeps.
   Shapes: sampled from grayscale maps (assets/pt/*.webp: marble sculptures) or built procedurally
   (Da Vinci's proportion ring, a torus, an assessment sphere, a cut gem, a halo, the DA VINCI wordmark). */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const base = document.querySelector('script[data-pt-base]')?.dataset.ptBase || './';

function softwareGL() {
  try {
    const c = document.createElement('canvas'), g = c.getContext('webgl2') || c.getContext('webgl');
    if (!g) return true;
    const e = g.getExtension('WEBGL_debug_renderer_info');
    const r = e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : '';
    g.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r);
  } catch (e) { return true; }
}

const anchorsEls = [...document.querySelectorAll('[data-pt]')];
const canvas = document.getElementById('gl');
if (!canvas || !anchorsEls.length || reduced || softwareGL()) {
  root.classList.add('no-gl');
} else {
  try { start(); } catch (e) { console.warn('[pt]', e); root.classList.add('no-gl'); }
}

function start() {
  const phone = innerWidth < 768;
  const N = phone ? 24000 : (innerWidth < 1100 ? 36000 : 52000);
  // opaque canvas: the navy backdrop is drawn here too, so additive points never punch dark holes into the page
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, phone ? 1.6 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x040a13, 1);
  const scene = new THREE.Scene();
  // backdrop = the CSS .bg radial gradient (120% 90% at 50% 38%), dithered against banding
  const bgMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, blending: THREE.NoBlending, uniforms: { uRes: { value: new THREE.Vector2(1, 1) } },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `uniform vec2 uRes;
      void main(){ vec2 p = gl_FragCoord.xy / uRes; p.y = 1. - p.y;
        float d = length(vec2((p.x - .5) / 1.2, (p.y - .38) / .9));
        vec3 c = mix(vec3(.078,.188,.310), vec3(.047,.114,.200), smoothstep(0., .34, d));
        c = mix(c, vec3(.027,.067,.118), smoothstep(.34, .66, d));
        c = mix(c, vec3(.016,.039,.075), smoothstep(.66, 1., d));
        c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.;
        gl_FragColor = vec4(c, 1.); }` });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat); bg.frustumCulled = false; bg.renderOrder = -1; scene.add(bg);
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, .1, 100);
  camera.position.z = 6;
  const worldH = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const worldW = () => worldH() * camera.aspect;

  /* ---------- shapes ---------- */
  const rnd = (() => { let s = 1234567; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const gold = (v, out, i) => {          // brightness → bronze · gold · cream
    const a = [.30, .19, .07], b = [.80, .64, .34], c = [.99, .93, .80];
    const t = Math.min(1, Math.max(0, v));
    const m = t < .55 ? t / .55 : (t - .55) / .45, p = t < .55 ? a : b, q = t < .55 ? b : c;
    const k = rnd() < .05 ? 1.25 : 1;
    out[i] = (p[0] + (q[0] - p[0]) * m) * k; out[i + 1] = (p[1] + (q[1] - p[1]) * m) * k; out[i + 2] = (p[2] + (q[2] - p[2]) * m) * k;
  };
  const shapes = {}, loading = {};
  const make = (pos, col, w = 2, h = 2, cw = w, fill = 0) => {
    const s = { pos: new THREE.BufferAttribute(pos, 3), col: new THREE.BufferAttribute(col, 3), w, h, cw, fill };
    return s;
  };
  function fromPoints(fn) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const [x, y, z, v] = fn(i); pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; gold(v, col, i * 3); }
    return { pos, col };
  }
  const g = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const proc = {
    vit: () => fromPoints(i => {           // Da Vinci's proportion study: circle, square, axes
      const r = rnd();
      if (r < .56) { const a = rnd() * Math.PI * 2, rr = 1 + g() * .018; return [Math.cos(a) * rr, Math.sin(a) * rr, g() * .03, .55 + rnd() * .45]; }
      if (r < .84) { const s = .82, t = rnd() * 4, e = Math.floor(t), f = t - e, j = g() * .012;
        const p = [[-s + 2 * s * f, -1 + j], [s + j, -1 + 2 * s * f], [s - 2 * s * f, -1 + 2 * s + j], [-s + j, -1 + 2 * s - 2 * s * f]][e];
        return [p[0], p[1], g() * .03, .45 + rnd() * .4]; }
      if (r < .93) { return rnd() < .5 ? [g() * .006, -1.12 + rnd() * 2.24, 0, .3 + rnd() * .3] : [-1.12 + rnd() * 2.24, -.18 + g() * .006, 0, .3 + rnd() * .3]; }
      const a = rnd() * Math.PI * 2, rr = .4 + rnd() * 1.6; return [Math.cos(a) * rr, Math.sin(a) * rr, g() * .3, rnd() * .35];
    }),
    // two rings, after the template's: a squarish profile (|cos|^.55) piles points onto the rims, which run white-hot; the body stays gold
    torus: () => fromPoints(i => {          // the double ring: two thin bands that cross each other
      const l = rnd() * Math.PI * 2, c = rnd() * Math.PI * 2, u = i % 2 ? 1 : -1;
      const f = Math.sign(Math.cos(c)) * Math.abs(Math.cos(c)) ** .55, m = Math.sign(Math.sin(c)) * Math.abs(Math.sin(c)) ** .55;
      const gr = 1 + .09 * f + g() * .003;
      return [gr * Math.cos(l), gr * Math.sin(l), u * .3 * Math.sin(l + .4) + .12 * m, Math.abs(m) > .8 ? 1 : .45 + .15 * Math.abs(f)];
    }),
    cuff: () => fromPoints(i => {           // the band: one wide ring, lit rims, gold body
      const l = rnd() * Math.PI * 2, c = rnd() * Math.PI * 2;
      const f = Math.sign(Math.cos(c)) * Math.abs(Math.cos(c)) ** .55, m = Math.sign(Math.sin(c)) * Math.abs(Math.sin(c)) ** .55;
      const gr = 1 + .085 * f + g() * .003;
      return [gr * Math.cos(l), gr * Math.sin(l), .08 * Math.sin(l * 2) + .36 * m + g() * .004, Math.abs(m) > .78 ? 1 : .5 + .14 * Math.abs(f)];
    }),
    sphere: () => fromPoints(i => {         // skin assessment: a measured globe
      const r = rnd();
      if (r < .7) { const meridian = rnd() < .5; const k = Math.floor(rnd() * 12), t = rnd() * Math.PI * 2;
        if (meridian) { const lon = k / 12 * Math.PI; return [Math.sin(t) * Math.cos(lon), Math.cos(t), Math.sin(t) * Math.sin(lon), .45 + rnd() * .45]; }
        const lat = (k / 11 - .5) * Math.PI * .92; return [Math.cos(lat) * Math.cos(t), Math.sin(lat), Math.cos(lat) * Math.sin(t), .4 + rnd() * .45]; }
      const a = rnd() * Math.PI * 2, b = Math.acos(2 * rnd() - 1), rr = .98 + g() * .02;
      return [rr * Math.sin(b) * Math.cos(a), rr * Math.cos(b), rr * Math.sin(b) * Math.sin(a), .2 + rnd() * .3];
    }),
    gem: () => {                            // tailor-made: a round brilliant, edges in points
      const E = [], n = 16, tY = .34, gY = 0, cY = -.92, tR = .56;
      const ring = (r, y, k, off = 0) => [...Array(k)].map((_, i) => [Math.cos((i + off) / k * 2 * Math.PI) * r, y, Math.sin((i + off) / k * 2 * Math.PI) * r]);
      const table = ring(tR, tY, 8), girdle = ring(1, gY, n), star = ring(.8, .2, 8, .5);
      for (let i = 0; i < 8; i++) { E.push([table[i], table[(i + 1) % 8]], [table[i], star[i]], [table[(i + 1) % 8], star[i]], [star[i], girdle[(2 * i + 1) % n]]); }
      for (let i = 0; i < n; i++) { E.push([girdle[i], girdle[(i + 1) % n]], [girdle[i], [0, cY, 0]], [girdle[i], table[Math.floor(i / 2) % 8]]); }
      return fromPoints(i => {
        if (rnd() < .82) { const [a, b] = E[Math.floor(rnd() * E.length)], t = rnd(), j = .008;
          return [a[0] + (b[0] - a[0]) * t + g() * j, a[1] + (b[1] - a[1]) * t + g() * j, a[2] + (b[2] - a[2]) * t + g() * j, .55 + rnd() * .45]; }
        const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * .95, y = (rnd() * 1.2 - .9);
        return [Math.cos(a) * rr * (y > 0 ? 1 - y * .9 : 1 + y), y, Math.sin(a) * rr * (y > 0 ? 1 - y * .9 : 1 + y), .15 + rnd() * .3];
      });
    },
    halo: () => fromPoints(i => {           // aftercare: a soft halo with orbiting dust
      const r = rnd();
      if (r < .55) { const a = rnd() * Math.PI * 2, rr = 1 + g() * .04; return [Math.cos(a) * rr, Math.sin(a) * rr * .32, Math.sin(a) * rr * .2 + g() * .03, .6 + rnd() * .4]; }
      if (r < .8) { const a = rnd() * Math.PI * 2, rr = .62 + g() * .03; return [Math.cos(a) * rr, Math.sin(a) * rr * .3 + .05, g() * .05, .5 + rnd() * .4]; }
      const a = rnd() * Math.PI * 2, b = Math.acos(2 * rnd() - 1), rr = .3 + rnd() * 1.5;
      return [rr * Math.sin(b) * Math.cos(a), rr * Math.cos(b) * .6, rr * Math.sin(b) * Math.sin(a), rnd() * .5];
    }),
  };
  async function fromMap(url, depth = .38, height = 2) {
    const im = new Image(); im.decoding = 'async'; im.src = url; await im.decode();
    const w = im.naturalWidth, h = im.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(im, 0, 0);
    const d = ctx.getImageData(0, 0, w, h).data, cdf = new Float32Array(w * h); let s = 0;
    for (let i = 0; i < w * h; i++) { const v = d[i * 4] / 255; s += v > .04 ? v : 0; cdf[i] = s; }
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), sc = height / h;
    for (let k = 0; k < N; k++) {
      const r = rnd() * s; let lo = 0, hi = w * h - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < r) lo = m + 1; else hi = m; }
      const x = lo % w, y = (lo / w) | 0, v = d[lo * 4] / 255;
      pos[k * 3] = (x + rnd() - w / 2) * sc; pos[k * 3 + 1] = -(y + rnd() - h / 2) * sc; pos[k * 3 + 2] = (v - .5) * depth + g() * .025;
      gold(.25 + v * .8, col, k * 3);
    }
    // centre the figure on its own mass, so a sculpture that sits off-centre in its frame lands where the anchor says
    let mx = 0, my = 0; for (let k = 0; k < N; k++) { mx += pos[k * 3]; my += pos[k * 3 + 1]; } mx /= N; my /= N;
    for (let k = 0; k < N; k++) { pos[k * 3] -= mx; pos[k * 3 + 1] -= my; }
    const xs = new Float32Array(N); for (let k = 0; k < N; k++) xs[k] = Math.abs(pos[k * 3]); xs.sort();
    return { pos, col, w: w * sc, h: height, cw: 2 * xs[Math.floor(N * .985)], fill: 1 };
  }
  async function fromText(text) {
    await document.fonts.ready.catch(() => {});
    const W = 1800, H = 420, c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '400 300px Zodiak, Georgia, serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '30px';
    ctx.fillText(text, W / 2, H / 2 + 10);
    const d = ctx.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 120) pts.push(x, y);
    const n = pts.length / 2, sc = 2.6 / W;
    return { ...fromPoints(i => { const j = Math.floor(rnd() * n); return [(pts[j * 2] + rnd() * 2 - W / 2) * sc, -(pts[j * 2 + 1] + rnd() * 2 - H / 2) * sc, g() * .04, .5 + rnd() * .5]; }), w: 2.6, h: H * sc };
  }
  function load(key) {
    if (shapes[key]) return Promise.resolve(shapes[key]);
    if (loading[key]) return loading[key];
    let p;
    if (proc[key]) p = Promise.resolve({ ...proc[key](), w: 2.2, h: 2.2 });
    else if (key === 'text') p = fromText('DA VINCI');
    else p = fromMap(base + 'assets/pt/' + key + '.webp', key === 'eyes' ? .5 : .38);
    return (loading[key] = p.then(r => (shapes[key] = make(r.pos, r.col, r.w, r.h, r.cw || r.w, r.fill || 0))).catch(e => { console.warn('[pt] shape', key, e); return (shapes[key] = shapes.dust || null); }));
  }
  // dust: the idle state every shape dissolves into
  { const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const a = rnd() * Math.PI * 2, b = Math.acos(2 * rnd() - 1), r = 1.2 + rnd() * 2.6;
      pos[i * 3] = r * Math.sin(b) * Math.cos(a) * 1.6; pos[i * 3 + 1] = r * Math.cos(b); pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a) * .6; gold(rnd() * .7, col, i * 3); }
    shapes.dust = make(pos, col, 4, 4); }

  /* ---------- geometry + material ---------- */
  const geo = new THREE.BufferGeometry();
  const rndAttr = new Float32Array(N * 4); for (let i = 0; i < N * 4; i++) rndAttr[i] = rnd();
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rndAttr, 4));
  // the halo layer draws every 4th point again, big and soft, so dense regions glow like the template's bloom
  const haloGeo = new THREE.BufferGeometry();
  { const step = 4, idx = new Uint16Array(Math.floor(N / step)); for (let i = 0; i < idx.length; i++) idx[i] = i * step; haloGeo.setIndex(new THREE.BufferAttribute(idx, 1)); }
  haloGeo.setAttribute('aRnd', geo.getAttribute('aRnd'));
  const bind = (from, to) => {
    for (const gm of [geo, haloGeo]) {
      gm.setAttribute('position', from.pos); gm.setAttribute('aTo', to.pos);
      gm.setAttribute('cFrom', from.col); gm.setAttribute('cTo', to.col);
    }
  };
  bind(shapes.dust, shapes.dust);
  const U = {
    uMix: { value: 0 }, uScatter: { value: 0 }, uTime: { value: 0 }, uOpacity: { value: 0 }, uBirth: { value: 0 },
    uSize: { value: phone ? 2.1 : 2.4 }, uPR: { value: dpr }, uMouse: { value: new THREE.Vector3(99, 99, 0) }, uMouseStr: { value: 0 },
    uTint: { value: new THREE.Color(1, 1, 1) }, uTintAmt: { value: 0 }, uGlint: { value: 1 }, uLight: { value: 0 }, uHalo: { value: .4 },
  };
  const baseSize = phone ? 2.1 : 2.4;
  const makeMat = halo => new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, defines: halo ? { HALO: 1 } : {},
    vertexShader: `
      attribute vec3 aTo; attribute vec3 cFrom; attribute vec3 cTo; attribute vec4 aRnd;
      uniform float uMix, uScatter, uTime, uSize, uPR, uBirth, uMouseStr, uTintAmt, uGlint, uLight, uHalo;
      uniform vec3 uMouse, uTint;
      varying vec3 vCol; varying float vA; varying float vGlint;
      void main(){
        float m = clamp((uMix - aRnd.x * .3) / .7, 0., 1.); m = m * m * (3. - 2. * m);
        vec3 p = mix(position, aTo, m);
        vec3 dir = normalize(aRnd.yzw * 2. - 1. + 1e-4);
        float sc = uScatter + (1. - uBirth) * 2.6;
        p += dir * sc * (.35 + aRnd.x * 1.4);
        p += .014 * vec3(sin(uTime * .7 + aRnd.y * 40.), cos(uTime * .6 + aRnd.z * 40.), sin(uTime * .5 + aRnd.w * 40.));
        vec4 wp = modelMatrix * vec4(p, 1.);
        vec2 d = wp.xy - uMouse.xy; float dl = length(d);
        wp.xy += normalize(d + 1e-5) * uMouseStr * smoothstep(.6, 0., dl) * (.25 + aRnd.y * .25);
        vec4 mv = viewMatrix * wp;
        gl_Position = projectionMatrix * mv;
        float glint = step(.994, aRnd.z) * uGlint;
        float tw = .65 + .35 * sin(uTime * (1.5 + aRnd.w * 3.) + aRnd.x * 60.);
        vec3 col = mix(cFrom, cTo, m);
        col = mix(col, col * uTint, uTintAmt);
        float sweep = uLight * smoothstep(.35, 0., abs(wp.x - (fract(uTime * .08) * 6. - 3.)));
        #ifdef HALO
          gl_PointSize = uSize * (6. + aRnd.y * 7.) * uPR * (6. / -mv.z);
          vCol = col * vec3(1., .88, .66) * (1. + sweep * .8);
          vA = .034 * uHalo * (1. - sc * .25);
          vGlint = 0.;
        #else
          gl_PointSize = uSize * (.55 + aRnd.y * .9) * (1. + glint * 2.1 * tw) * uPR * (6. / -mv.z);
          vCol = col * (1. + glint * 1.2 * tw + sweep * 1.4);
          vA = (.42 + .45 * aRnd.w) * (1. - sc * .12);
          vGlint = glint * smoothstep(.8, 1.1, uHalo);
        #endif
      }`,
    fragmentShader: `
      uniform float uOpacity; varying vec3 vCol; varying float vA; varying float vGlint;
      void main(){ vec2 c = gl_PointCoord - .5; float d = length(c);
        #ifdef HALO
          float a = smoothstep(.5, 0., d); a = a * a * a;
        #else
          float a = smoothstep(.5, .0, d); a *= a;
          float sq = smoothstep(.5, .2, max(abs(c.x), abs(c.y)));   // on the rings the glints are the template's square bokeh
          a = mix(a, sq, vGlint);
        #endif
        gl_FragColor = vec4(vCol * a * vA * uOpacity, 1.); }`,
  });
  const mat = makeMat(false), haloMat = makeMat(true);
  for (const m of [mat, haloMat]) { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneFactor; }
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 1;
  const halo = new THREE.Points(haloGeo, haloMat); halo.frustumCulled = false; halo.renderOrder = 0;
  const group = new THREE.Group(); group.add(halo); group.add(pts); scene.add(group);

  /* ---------- anchors (timeline) ---------- */
  const num = (el, k, d) => { const v = el.dataset[k]; return v === undefined || v === '' ? d : +v; };
  const anchors = anchorsEls.map(el => ({
    el, shape: el.dataset.pt, x: num(el, 'ptX', 0), xm: num(el, 'ptXm', 0), y: num(el, 'ptY', 0), ym: num(el, 'ptYm', num(el, 'ptY', 0)),
    s: num(el, 'ptS', 1), sm: num(el, 'ptSm', num(el, 'ptS', 1)), rx: num(el, 'ptRx', 0), ry: num(el, 'ptRy', 0), spin: num(el, 'ptSpin', 0),
    op: num(el, 'ptOp', 1), light: num(el, 'ptLight', 0), inter: el.hasAttribute('data-pt-interactive'), f0: 0, f1: 0, rot: 0,
    orbit: num(el, 'ptOrbit', 0), tilt: num(el, 'ptTilt', 0), glow: num(el, 'ptGlow', .4), size: num(el, 'ptSize', 1),
  }));
  let vh = innerHeight;
  const layout = () => {
    vh = innerHeight; const y0 = scrollY;
    anchors.forEach(a => { const r = a.el.getBoundingClientRect(), top = r.top + y0;
      a.f0 = top - vh * .2; a.f1 = top + r.height - vh * .8; if (a.f1 < a.f0) { const c = top + r.height / 2 - vh / 2; a.f0 = c - vh * .05; a.f1 = c + vh * .05; } });
    anchors.sort((a, b) => a.f0 - b.f0);
  };
  const preloadNear = y => anchors.forEach(a => { if (Math.abs(a.f0 - y) < vh * 4) load(a.shape); });

  /* ---------- per-frame state ---------- */
  const FULL = { sphere: 1, gem: 1 };
  let pairKey = '', cur = { a: null, b: null, t: 0, op: 0, sc: 0 }, dirty = true;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, on: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = -(e.clientY / innerHeight * 2 - 1); mouse.on = 1; }, { passive: true });
  addEventListener('pointerleave', () => { mouse.on = 0; });
  const tint = new THREE.Color(1, 1, 1); let tintAmt = 0, tintTarget = 0;
  addEventListener('pt:tint', e => { const c = e.detail?.color; if (c) { tint.set(c); tintTarget = e.detail.amt ?? .75; } else tintTarget = 0; });

  function stateAt(y) {
    const L = anchors.length; if (!L) return null;
    const gap = vh * .8;
    for (let i = 0; i < L; i++) { const a = anchors[i];
      if (y >= a.f0 && y <= a.f1) { const lp = (y - a.f0) / Math.max(1, a.f1 - a.f0); return { a, b: a, t: 0, sc: 0, op: a.op, lp, la: lp, lb: lp }; }
      const n = anchors[i + 1];
      if (n && y > a.f1 && y < n.f0) {
        const span = n.f0 - a.f1;
        if (span <= gap * 2) { const t = (y - a.f1) / span; return { a, b: n, t, sc: Math.sin(Math.PI * t) * 1.35, op: a.op + (n.op - a.op) * t, la: 1, lb: 0 }; }
        if (y - a.f1 < gap) { const t = (y - a.f1) / gap; return { a, b: a, t: 0, sc: t * 2.4, op: a.op * (1 - t), la: 1, lb: 1 }; }
        if (n.f0 - y < gap) { const t = 1 - (n.f0 - y) / gap; return { a: n, b: n, t: 0, sc: (1 - t) * 2.4, op: n.op * t, la: 0, lb: 0 }; }
        return { a, b: a, t: 0, sc: 3, op: 0, la: 1, lb: 1 };
      }
    }
    const f = anchors[0], l = anchors[L - 1];
    if (y < f.f0) { const t = Math.max(0, 1 - (f.f0 - y) / gap); return { a: f, b: f, t: 0, sc: (1 - t) * 2.4, op: f.op * t, la: 0, lb: 0 }; }
    const t = Math.max(0, 1 - (y - l.f1) / gap); return { a: l, b: l, t: 0, sc: (1 - t) * 2.4, op: l.op * t, la: 1, lb: 1 };
  }

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); renderer.getDrawingBufferSize(bgMat.uniforms.uRes.value); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); layout(); dirty = true; };
  resize(); addEventListener('resize', resize);
  new ResizeObserver(() => layout()).observe(document.body);
  preloadNear(scrollY);
  anchors.forEach(a => setTimeout(() => load(a.shape), 1500));
  const t0 = performance.now(); let born = 0, last = t0, sleeping = false;
  addEventListener('dv:start', () => { born = performance.now(); });
  if (!document.querySelector('.preloader:not(.is-done)')) born = t0;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (document.hidden) return;
    const y = scrollY, st = stateAt(y); if (!st) return;
    const A = shapes[st.a.shape], B = shapes[st.b.shape];
    if (!A || !B) { load(st.a.shape); load(st.b.shape); }
    const sa = A || shapes.dust, sb = B || shapes.dust;
    const key = st.a.shape + '>' + st.b.shape + (A ? 1 : 0) + (B ? 1 : 0);
    if (key !== pairKey) { bind(sa, sb); pairKey = key; preloadNear(y); }
    const op = st.op * (born ? Math.min(1, (now - born) / 600) : 0);
    if (op <= .002 && cur.op <= .002) { if (!sleeping || dirty) { group.visible = false; renderer.render(scene, camera); group.visible = true; sleeping = true; dirty = false; } cur.op = 0; return; }
    sleeping = false; dirty = false;
    const e = st.t * st.t * (3 - 2 * st.t);
    const W = worldW(), H = worldH(), ph = innerWidth < 768;
    const ax = ph ? st.a.xm : st.a.x, bx = ph ? st.b.xm : st.b.x, ay = ph ? st.a.ym : st.a.y, by = ph ? st.b.ym : st.b.y;
    const fit = (a, s) => { const sh = shapes[a.shape] || shapes.dust; const k = (ph ? a.sm : a.s) * .62 * H / sh.h; return Math.min(k, (ph ? .94 : .9) * W / Math.max(sh.cw, .01)); };
    const k = fit(st.a, sa) + (fit(st.b, sb) - fit(st.a, sa)) * e;
    group.position.set((ax + (bx - ax) * e) * W, (ay + (by - ay) * e) * H, 0);
    group.scale.setScalar(k);
    // each anchor keeps its own spin, so a figure that should face the camera never inherits another's angle.
    // round shapes turn all the way; flat ones (ring study, wordmark, sculptures) sway so they never go edge-on; the torus rolls on its own axis
    const TAU = Math.PI * 2;
    st.a.rot = (st.a.rot + dt * st.a.spin) % TAU; if (st.b !== st.a) st.b.rot = (st.b.rot + dt * st.b.spin) % TAU;
    // orbit + tilt are scrubbed by scroll (la / lb = progress through the anchor's own window), like the template's rings
    const ez = l => l * l * (3 - 2 * l);
    const yaw = (a, l) => a.ry + a.orbit * TAU * l + (FULL[a.shape] ? a.rot : Math.sin(a.rot) * .45), roll = a => a.shape === 'torus' ? a.rot : 0;
    const pitch = (a, l) => a.rx + a.tilt * ez(l);
    let dr = yaw(st.b, st.lb) - yaw(st.a, st.la); dr -= Math.round(dr / TAU) * TAU;
    let dz = roll(st.b) - roll(st.a); dz -= Math.round(dz / TAU) * TAU;
    const ry = yaw(st.a, st.la) + dr * e, rz = roll(st.a) + dz * e;
    const rx = pitch(st.a, st.la) + (pitch(st.b, st.lb) - pitch(st.a, st.la)) * e;
    const inter = (st.a.inter && st.t === 0) ? 1 : 0;
    mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
    group.rotation.set(rx + (inter ? -mouse.y * .5 : mouse.y * .05),
                       ry + (inter ? mouse.x * .8 : mouse.x * .08), rz);
    U.uMix.value = st.a === st.b ? 0 : e;
    cur.op += (op - cur.op) * .2; cur.sc += (st.sc - cur.sc) * .18;
    // sculptures fill an area: drawn small, the same number of additive points would burn to white, so thin them out
    const dens = (an, s) => { if (!s.fill) return 1; const px = fit(an, s) * innerHeight / H; return Math.min(1, ((px / 300) ** 2 / (N / 52000)) ** .7); };
    const da = dens(st.a, sa), dim = da + (dens(st.b, sb) - da) * e;
    U.uOpacity.value = cur.op * dim; U.uScatter.value = cur.sc;
    U.uSize.value = baseSize * (st.a.size + (st.b.size - st.a.size) * e);
    U.uHalo.value = st.a.glow + (st.b.glow - st.a.glow) * e;
    U.uTime.value = (now - t0) / 1000;
    U.uBirth.value = born ? Math.min(1, (now - born) / 2400) ** .6 : 0;
    U.uLight.value = st.a.light + (st.b.light - st.a.light) * e;
    U.uMouse.value.set(mouse.x * W / 2, mouse.y * H / 2, 0);
    U.uMouseStr.value += (((coarse ? 0 : mouse.on) * (inter ? 1.3 : .45)) - U.uMouseStr.value) * .08;
    tintAmt += (tintTarget - tintAmt) * .06; U.uTint.value.copy(tint); U.uTintAmt.value = tintAmt;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  root.classList.add('has-gl');
  window.__pt = { anchors, shapes, U, layout };
}
