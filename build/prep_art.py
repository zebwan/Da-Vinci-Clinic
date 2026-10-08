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
# homepage promo banners (their current homepage slider): wide 1824x850 for desktop, square for phone
PROMO = [('hsbc', '2026/08/DV-x-HSBC-1.webp', '2026/08/DV-X-HSBC-Collab-Promo.webp'),
         ('xerf', '2026/07/XERF-launching-hero.webp', '2026/07/XERF-Hero-Square.webp'),
         ('ultherapy', '2025/11/Ultherapy-Prime-Shoutout-Banner.png', '2026/06/Ultherapy-Prime-Shoutout-Banner-Square.jpg'),
         ('picosure', '2025/11/Picosure-Pro-Shoutout-Banner-New.png', '2026/06/Picosure-Pro-Shoutout-Banner-Square-1.jpg'),
         ('cellbooster', '2025/11/Cellbooster-Shoutout-Banner.png', '2025/11/Cellbooster-Hero-Banner-Square.png'),
         ('density', '2025/11/Density-Shoutout-Banner-1.png', '2026/06/Density-Shoutout-Banner-Square.jpg'),
         ('oligiox', '2025/11/OligioX-Shoutout-Banner-1.png', '2026/06/OligioX-Shoutout-Banner-Square-1.jpg'),
         ('ultraclear', '2025/09/UltraClear-Launching-Banner-ver-01.png', '2025/04/DV-UltraClear-Hero-Banner-Square-1.png'),
         ('deusaderm', '2025/09/Deusaderm-Launching-Banner-ver-01.png', '2026/05/Deusaderm-Lido-Square-Banne.jpeg'),
         ('mounjaro', '2025/09/Mounjaro-Launching-Banner-ver-02-png.avif', '2025/09/DV-Mounjaro-Hero-Banner-Square.png')]

def promo(name, wide, sq):
    out = []
    im = ImageOps.exif_transpose(Image.open(SRC + wide)).convert('RGB'); im = im.resize((1600, round(1600 * im.height / im.width)), Image.LANCZOS)
    im.save(OUT + f'promo-{name}.webp', quality=80, method=6); out.append((im.size, os.path.getsize(OUT + f'promo-{name}.webp') // 1024))
    im = ImageOps.exif_transpose(Image.open(SRC + sq)).convert('RGB')
    if im.width != im.height:   # the HSBC phone artwork is portrait: centre it on a square of its own edge colour, nothing cropped
        edge = im.resize((1, 1), Image.BOX, box=(0, 0, 6, im.height)).getpixel((0, 0)); side = max(im.size)
        sqim = Image.new('RGB', (side, side), edge); sqim.paste(im, ((side - im.width) // 2, (side - im.height) // 2)); im = sqim
    im = im.resize((1080, 1080), Image.LANCZOS); im.save(OUT + f'promo-{name}-sq.webp', quality=80, method=6)
    out.append((im.size, os.path.getsize(OUT + f'promo-{name}-sq.webp') // 1024))
    return name, out

if __name__ == '__main__':
    for j in JOBS: print(*crop(*j))
    for p in PROMO: print(*promo(*p))
