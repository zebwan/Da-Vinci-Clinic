#!/usr/bin/env python3
"""QA capture of a built page at 1440/810/390: full-page screenshot, console errors, overflow, section outline."""
import sys, os, time, json
sys.path.insert(0, '/Users/mysense/Desktop/Da Vinci Clinic Revamp/01-template-helora/raw')
from cdp import Chrome
ROOT='/Users/mysense/Desktop/Da Vinci Clinic Revamp/03-build'; os.chdir(ROOT); os.makedirs('qa', exist_ok=True)
route = sys.argv[1] if len(sys.argv) > 1 else '/'
slug = route.strip('/').replace('/', '_') or 'home'
widths = [int(x) for x in sys.argv[2:]] or [1440, 810, 390]
c = Chrome(1440, 900); c.cmd("Page.bringToFront"); c.cmd("Emulation.setFocusEmulationEnabled", {"enabled": True}); c.watch(); c.cmd("Network.setCacheDisabled", {"cacheDisabled": True})
for W in widths:
    H = 900 if W >= 1200 else (1080 if W >= 768 else 844)
    c.viewport(W, H, mobile=W < 768)
    c.goto(f"http://127.0.0.1:9732{route}?qa={int(time.time())}", wait=4)
    c.sweep(step=max(400, H - 100), pause=.2); time.sleep(.8); c.js("window.scrollTo(0,0)"); time.sleep(.6)
    c.js("document.querySelectorAll('.rv,.zoom').forEach(e=>{e.style.transition='none';e.classList.add('is-in')})"); time.sleep(.6)
    info = c.js("""JSON.stringify({h:document.documentElement.scrollHeight, sw:document.documentElement.scrollWidth, iw:innerWidth,
      secs:[...document.querySelectorAll('main > section')].map(s=>{const r=s.getBoundingClientRect();const h=s.querySelector('h1,h2');return [s.className.split(' ').slice(0,2).join('.'),Math.round(r.top+scrollY),Math.round(r.height),h?(h.innerText.slice(0,40)+' '+getComputedStyle(h).fontSize):'']}),
      over:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&getComputedStyle(e).position!=='fixed'}).slice(0,8).map(e=>e.tagName+'.'+(e.className||'').toString().split(' ')[0]+' r='+Math.round(e.getBoundingClientRect().right)),
      fonts:[...new Set([...document.querySelectorAll('h1,h2,p')].slice(0,40).map(e=>getComputedStyle(e).fontFamily.split(',')[0]))],
      broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src.split('/').pop()).slice(0,10)})""")
    d = json.loads(info)
    # tiled capture (captureBeyondViewport blanks out beyond ~16k px)
    import base64
    from PIL import Image; import io
    H_total = d['h']; band = 3000; tiles = []
    for y0 in range(0, H_total, band):
        hh = min(band, H_total - y0)
        r = c.cmd("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": True, "clip": {"x": 0, "y": y0, "width": W, "height": hh, "scale": 1}})
        tiles.append(Image.open(io.BytesIO(base64.b64decode(r["data"]))))
    full = Image.new('RGB', (W, H_total), 'white'); yy = 0
    for t in tiles: full.paste(t, (0, yy)); yy += t.size[1]
    full.save(f"qa/{slug}-{W}.png")
    errs, bad = c.drain()
    print(f"== {route} @{W}: height {d['h']} scrollW {d['sw']} (inner {d['iw']}) fonts {d['fonts']} broken {d['broken']}")
    print("   overflow:", d['over'] or 'none'); print("   js errors:", errs[:4] or 'none'); print("   bad requests:", bad[:6] or 'none')
    for s in d['secs']: print("   ", s)
c.close()
