#!/usr/bin/env python3
"""Assets for the dark / gold / sculpture amendment (8 Oct 2026). Run once: python3 build/prep_dark.py
Sources: Da Vinci's own sculpture film (00-current-site/images/uploads/2024/01/0103.mp4) and existing assets."""
import os, glob, subprocess, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
IMG = 'assets/img'
GOLD = (201, 169, 97)

def recolour(src, dst, rgb, size=None):
    im = Image.open(src).convert('RGBA')
    a = im.getchannel('A')
    out = Image.new('RGBA', im.size, rgb + (0,)); out.putalpha(a)
    if size: out.thumbnail(size, Image.LANCZOS)
    out.save(dst); return out.size

# gold icons at 96px (were black 512px), gold logo mark
for f in glob.glob(f'{IMG}/ic-*.png'):
    if f.endswith('-gold.png'): continue
    print(os.path.basename(f), recolour(f, f.replace('.png', '-gold.png'), GOLD, (96, 96)))
print('mark-gold', recolour(f'{IMG}/mark-white.png', f'{IMG}/mark-gold.png', (214, 186, 120)))
# logo at 3x display height (28px) instead of 636px wide
lg = Image.open(f'{IMG}/logo-white.png'); lg.thumbnail((10000, 84), Image.LANCZOS); lg.save(f'{IMG}/logo-white-sm.png', optimize=True); print('logo', lg.size)

# hero background: navy with a soft top spotlight (the lighting of the sculpture film) and a faint gold floor glow
W, H = 1600, 1000
y, x = np.mgrid[0:H, 0:W].astype(float)
base = np.zeros((H, W, 3)); base[:] = (11, 26, 46)
def blob(cx, cy, rx, ry, col, a):
    d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
    k = np.clip(1 - d, 0, 1) ** 2 * a
    return k[..., None] * (np.array(col) - base)
img = base + blob(W * .54, -H * .05, W * .32, H * 1.05, (88, 112, 146), .55) + blob(W * .54, H * .1, W * .14, H * .7, (140, 160, 190), .25)
img = img + blob(W * .5, H * 1.05, W * .6, H * .35, (60, 52, 40), .55)
vig = np.clip(((x - W / 2) / (W * .75)) ** 2 + ((y - H * .45) / (H * .9)) ** 2, 0, 1)
img = img * (1 - .35 * vig[..., None])
img += np.random.default_rng(7).normal(0, 1.2, img.shape)  # fine grain against banding
Image.fromarray(img.clip(0, 255).astype('uint8')).save(f'{IMG}/hero-bg-dark.webp', 'WEBP', quality=86, method=6)
print('hero-bg-dark', os.path.getsize(f'{IMG}/hero-bg-dark.webp') // 1024, 'KB')
