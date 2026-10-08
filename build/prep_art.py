#!/usr/bin/env python3
"""Da Vinci's own sculpture-and-model photos (their homepage service bands and brand shoot) cropped into the
matching treatment slots. Run: python3 build/prep_art.py"""
import os
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
SRC = '/Users/mysense/Desktop/Da Vinci Clinic Revamp/00-current-site/images/uploads/'
OUT = 'assets/img/'

def crop(name, src, w, h, cx=.5, cy=.5, q=82):
    """Crop to w:h around the point (cx, cy) given as fractions of the source image, then resize."""
    im = ImageOps.exif_transpose(Image.open(SRC + src)).convert('RGB'); W, H = im.size; r = w / h
    if W / H > r: nw, nh = int(H * r), H
    else: nw, nh = W, int(W / r)
    x0 = min(max(0, int(cx * W - nw / 2)), W - nw); y0 = min(max(0, int(cy * H - nh / 2)), H - nh)
    im.crop((x0, y0, x0 + nw, y0 + nh)).resize((w, h), Image.LANCZOS).save(OUT + name + '.webp', quality=q, method=6)
    return name, (w, h), os.path.getsize(OUT + name + '.webp') // 1024

JOBS = [
    # homepage service bands on davinciclinic.com.my: facelift / body contouring / skin glow / pigment
    ('art-facelift', '2024/01/p-49.jpg', 726, 876, .70, .45), ('svc-facelift-wide', '2024/01/p-49.jpg', 1600, 857, .5, .4),
    ('art-pigment', '2024/01/p-53.jpg', 726, 876, .72, .45), ('svc-pigment-wide', '2024/01/p-53.jpg', 1600, 857, .5, .42),
    ('art-glow', '2024/01/p-52.jpg', 726, 876, .60, .45), ('svc-glow-wide', '2024/01/p-52.jpg', 1600, 857, .5, .4),
    ('svc-body-wide', '2024/01/p-50.jpg', 1600, 857, .5, .45),
    # signature-treatment slides (SynergyLift keeps p-93, the model resting on a statue)
    ('art-pigment-slide', '2024/01/p-53.jpg', 1200, 866, .62, .45), ('art-glow-slide', '2024/01/p-52.jpg', 1200, 866, .5, .45),
    ('art-body-slide', '2024/01/p-50.jpg', 1200, 866, .70, .5),
    # sculpted features for the non-surgical eye / nose / face page, and the sculptor at work for "Personalised care"
    ('svc-eye-wide', '2024/01/p-90.jpg', 1600, 857, .5, .4), ('benefit-art', '2024/01/p-60.jpg', 828, 1034, .60, .5),
]
if __name__ == '__main__':
    for j in JOBS: print(*crop(*j))
