#!/usr/bin/env python3
"""Run structural QA on every page at the given widths; print only problems; save full-page tiled screenshots."""
import sys, os, time, json, base64, io
sys.path.insert(0, '/Users/mysense/Desktop/Da Vinci Clinic Revamp/01-template-helora/raw')
from cdp import Chrome
from PIL import Image
ROOT='/Users/mysense/Desktop/Da Vinci Clinic Revamp/03-build'; os.chdir(ROOT); os.makedirs('qa', exist_ok=True)
sys.path.insert(0, 'build'); from content import PAGES
widths=[int(x) for x in sys.argv[1:]] or [1440, 390]
c = Chrome(1440, 900); c.cmd("Page.bringToFront"); c.cmd("Emulation.setFocusEmulationEnabled", {"enabled": True}); c.watch(); c.cmd("Network.setCacheDisabled", {"cacheDisabled": True})
summary=[]
for p in PAGES:
    route = '/' if not p['slug'] else '/' + p['slug'].strip('/') + '/'
    slug = p['slug'].strip('/').replace('/', '_') or 'home'
    for W in widths:
        H = 900 if W >= 1200 else (1080 if W >= 768 else 844)
        c.viewport(W, H, mobile=W < 768)
        c.goto(f"http://127.0.0.1:9732{route}?qa={int(time.time())}", wait=3)
        c.sweep(step=max(400, H - 100), pause=.12); c.js("window.scrollTo(0,0)"); time.sleep(.4)
        c.js("document.querySelectorAll('.rv,.zoom').forEach(e=>{e.style.transition='none';e.classList.add('is-in')})"); time.sleep(.5)
        d = json.loads(c.js("""JSON.stringify({h:document.documentElement.scrollHeight, sw:document.documentElement.scrollWidth, title:document.title, h1:[...document.querySelectorAll('h1')].map(h=>h.innerText.replace(/\\n/g,' ')), 
          over:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.right>innerWidth+1&&r.width>0&&cs.position!=='fixed'&&!e.closest('.approach__track,.sig__track,.post__band,.hero,.slider__track,.footer__mark,.deco,.about__bust,.work__stage,.swipe-sm')}).slice(0,6).map(e=>e.tagName+'.'+(e.className||'').toString().split(' ')[0]+' r='+Math.round(e.getBoundingClientRect().right)),
          broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src.split('/').pop()).slice(0,6), imgs:document.images.length})"""))
        errs, bad = c.drain()
        issues = []
        if d['sw'] > W + 1: issues.append(f"scrollW {d['sw']}")
        if d['over']: issues.append('overflow ' + '; '.join(d['over']))
        if d['broken']: issues.append('broken ' + ','.join(d['broken']))
        if bad: issues.append('bad ' + '; '.join(b.split('/')[-1] for b in bad[:4]))
        if errs: issues.append('js ' + '; '.join(e[:70] for e in errs[:2]))
        if len(d['h1']) != 1: issues.append(f"h1 count {len(d['h1'])}")
        summary.append((slug, W, d['h'], issues))
        print(f"{slug:44} {W:5} {d['h']:6}px  " + (' | '.join(issues) if issues else 'ok'))
        if '--shots' in sys.argv or True:
            band=3000; tiles=[]
            for y0 in range(0, d['h'], band):
                r = c.cmd("Page.captureScreenshot", {"format": "jpeg", "quality": 60, "captureBeyondViewport": True, "clip": {"x": 0, "y": y0, "width": W, "height": min(band, d['h']-y0), "scale": 0.5}})
                tiles.append(Image.open(io.BytesIO(base64.b64decode(r["data"]))))
            full = Image.new('RGB', (tiles[0].size[0], sum(t.size[1] for t in tiles)), 'white'); yy=0
            for t in tiles: full.paste(t,(0,yy)); yy+=t.size[1]
            full.save(f"qa/{slug}-{W}.jpg", quality=70)
c.close()
json.dump(summary, open('qa/summary.json','w'))
print('issues on', sum(1 for s in summary if s[3]), 'of', len(summary), 'captures')
