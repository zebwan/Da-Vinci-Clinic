#!/usr/bin/env python3
"""Prepare Da Vinci images for the Helora slots: crops to slot ratios at 2x, webp output, hero cut-out via rembg, gradient hero bg, logo variants."""
from PIL import Image, ImageOps, ImageDraw, ImageFilter
import os, sys, io
SRC='/Users/mysense/Desktop/Da Vinci Clinic Revamp/00-current-site/images/uploads/'
OUT='assets/img/'
os.makedirs(OUT, exist_ok=True)
def load(p):
    im=Image.open(SRC+p); im=ImageOps.exif_transpose(im); return im.convert('RGBA') if im.mode in ('RGBA','LA','P') else im.convert('RGB')
def fit(name, src, w, h, focus=(0.5,0.5), q=82, fmt='webp'):
    im=load(src).convert('RGB')
    W,H=im.size; r=w/h
    if W/H > r: nw=int(H*r); x0=int((W-nw)*focus[0]); box=(x0,0,x0+nw,H)
    else: nh=int(W/r); y0=int((H-nh)*focus[1]); box=(0,y0,W,y0+nh)
    im=im.crop(box).resize((w,h), Image.LANCZOS)
    im.save(OUT+name+'.'+fmt, quality=q, method=6 if fmt=='webp' else 0)
    return im.size
jobs = [
 # services cards 363x438 (2x 726x876)
 ('svc-facelift','2024/01/size14.jpg',726,876,(0.5,0.3)), ('svc-pigment','2024/01/size26.jpg',726,876,(0.5,0.4)), ('svc-glow','2024/01/size44.jpg',726,876,(0.5,0.3)),
 ('svc-body','2024/01/size303.jpg',726,876,(0.5,0.5)), ('svc-hair','2024/01/size11.jpg',726,876,(0.5,0.4)), ('svc-fillers','2024/01/size57.jpg',726,876,(0.5,0.3)),
 ('svc-acne','2024/01/size40.jpg',726,876,(0.5,0.3)), ('svc-laser','2024/01/size24.jpg',726,876,(0.5,0.5)), ('svc-regen','2024/01/size54.jpg',726,876,(0.5,0.4)),
 ('svc-intimate','2024/01/size239.jpg',726,876,(0.5,0.4)), ('svc-eye','2026/07/UP-Eyebags-1.webp',726,876,(0.5,0.5)), ('svc-biostim','2024/01/size46.jpg',726,876,(0.5,0.3)),
 ('svc-skincare','2024/01/size21.jpg',726,876,(0.5,0.3)),
 # why-choose portrait 362x590
 ('why-doctor','2026/05/Dr.-Joycelyn.webp',724,1180,(0.5,0.2)),
 # benefits photo 414x517
 ('benefit-consult','2026/07/Lenisna-Journey-at-DV.webp',828,1034,(0.55,0.5)),
 # how it works 422x435
 ('step-1','2026/09/TRX-Reception-Area.webp',844,870,(0.5,0.5)), ('step-2','2026/09/TRX-Consultation-Room.webp',844,870,(0.5,0.5)),
 ('step-3','2026/09/TRX-Treatment-Room.webp',844,870,(0.5,0.5)), ('step-4','2026/09/TRX-Analysis-Room.webp',844,870,(0.5,0.5)),
 # approach slides 600x433
 ('sig-facelift','2024/01/p-93.jpg',1200,866,(0.5,0.5)), ('sig-pigment','2024/01/p-90.jpg',1200,866,(0.5,0.4)), ('sig-glow','2024/01/size46.jpg',1200,866,(0.5,0.35)),
 ('sig-body','2024/01/size303.jpg',1200,866,(0.5,0.5)), ('sig-hair','2024/01/size11.jpg',1200,866,(0.5,0.4)),
 # team 457x540 (2x 914x1080) from 805x1024 portraits (keep full)
 ('dr-tristan','2026/05/Dr.-Tristan-Tan.webp',914,1080,(0.5,0.0)), ('dr-wong','2026/05/Dr.-Wong.webp',914,1080,(0.5,0.0)), ('dr-joycelyn','2026/05/Dr.-Joycelyn.webp',914,1080,(0.5,0.0)),
 ('dr-yeeli','2026/05/Dr.-Yeeli-.webp',914,1080,(0.5,0.0)), ('dr-kenneth','2026/05/Dr.-Kenneth.webp',914,1080,(0.5,0.0)), ('dr-shuyan','2026/05/Dr.-Shuyan.webp',914,1080,(0.5,0.0)), ('dr-lee','2026/05/Dr.-Lee.webp',914,1080,(0.5,0.0)),
 # testimonials 528x458
 ('rev-1','2026/09/TRX-Reception-Area.webp',1056,916,(0.5,0.5)), ('rev-2','2024/01/p-56.jpg',1056,916,(0.5,0.5)), ('rev-3','2026/09/Skin-Analysis-Room.webp',1056,916,(0.5,0.5)), ('rev-4','2026/09/TRX-Doctors-Room.webp',1056,916,(0.5,0.5)),
 # CTA 557x372, about journey 549x596
 ('cta-team','2026/07/Da-Vinci-Skin-Aesthetic-Clinic-LCP-Certified-Doctors.webp',1114,744,(0.5,0.5)),
 ('about-journey','2024/01/p-75.jpg',1098,1192,(0.5,0.5)), ('about-mission','2026/09/TRX-Reception-Area.webp',1098,1192,(0.5,0.5)),
 ('about-row-1','2026/09/TRX-Treatment-Room.webp',1076,800,(0.5,0.5)), ('about-row-2','2026/09/DVBJ-Consultation-Room.webp',1076,800,(0.5,0.5)), ('about-row-3','2026/07/Lenisna-Journey-at-DV.webp',1076,800,(0.55,0.5)), ('about-row-4','2024/01/p-59.jpg',1076,800,(0.5,0.5)),
 # contact 456x501
 ('contact-photo','2026/09/TRX-Consultation-Room.webp',912,1002,(0.5,0.5)),
 # blog list featured 500x? and generic
 ('team-wide','2026/05/Da-Vinci-Clinic-Aesthetic-Doctors-in-KL.webp',1600,1010,(0.5,0.5)),
 # branch interiors square-ish
 ('int-reception','2026/09/TRX-Reception-Area.webp',1000,750,(0.5,0.5)), ('int-doctor','2026/09/TRX-Doctors-Room.webp',1000,750,(0.5,0.5)), ('int-treatment','2026/09/TRX-Treatment-Room.webp',1000,750,(0.5,0.5)), ('int-consult','2026/09/TRX-Consultation-Room.webp',1000,750,(0.5,0.5)), ('int-analysis','2026/09/TRX-Analysis-Room.webp',1000,750,(0.5,0.5)), ('int-bj-consult','2026/09/DVBJ-Consultation-Room.webp',1000,750,(0.5,0.5)), ('int-bj-analysis','2026/09/Skin-Analysis-Room.webp',1000,750,(0.5,0.5)), ('int-prestige','2024/01/p-56.jpg',1000,750,(0.5,0.5)), ('int-bj-room','2024/01/p-59.jpg',1000,750,(0.5,0.5)),
]
for name,src,w,h,focus in jobs:
    try: print(name, fit(name,src,w,h,focus))
    except Exception as e: print('FAIL',name,e)
# blog images 363x438 -> 726x876 from the fetched OG images
for name,src in [('blog-xerf','blog-src-XERF-vs-Ultherapy-Prime-at-Da-Vinci-Skin-Aesthetic-Clinic-Malaysia.webp'),('blog-acne','blog-src-early-acne-scar-treatment-prevention.jpg'),('blog-stem','blog-src-stem-cell-therapy-hair-vs-skin-mechanism.jpg')]:
    im=Image.open(OUT+src).convert('RGB'); W,H=im.size; r=726/876
    nw=int(H*r); x0=(W-nw)//2; im=im.crop((x0,0,x0+nw,H)).resize((726,876),Image.LANCZOS); im.save(OUT+name+'.webp',quality=82,method=6); print(name,im.size)
# hero cut-out: Dr Tristan 1620x1620 -> crop 3:4 around subject, rembg
from rembg import remove
im=load('2026/05/Da-Vinci-Clinic-Dr.-Tristan.webp').convert('RGB')
W,H=im.size; cw=int(H*556/812); x0=(W-cw)//2; sub=im.crop((x0,0,x0+cw,H))
cut=remove(sub, alpha_matting=True, alpha_matting_foreground_threshold=250, alpha_matting_background_threshold=15, alpha_matting_erode_size=6)
cut=cut.resize((1112,1624),Image.LANCZOS); cut.save(OUT+'hero-cutout.png'); cut.save(OUT+'hero-cutout.webp',quality=90,method=6)
print('hero cutout',cut.size)
# hero background gradient 1440x1089 (template bg ratio) champagne -> cream with soft vignette
W,H=1440,1089
bg=Image.new('RGB',(W,H)); px=bg.load()
import math
c1=(0xF7,0xF2,0xEA); c2=(0xE8,0xDB,0xB5)
for y in range(H):
    for x in range(W):
        t=(0.55*(y/H)+0.45*(x/W)); t=max(0,min(1,t))
        px[x,y]=tuple(int(c1[i]*(1-t)+c2[i]*t) for i in range(3))
bg.save(OUT+'hero-bg.webp',quality=85,method=6); print('hero bg',bg.size)
# footer gradient 1440x434 navy -> deep navy/champagne tint
W,H=1440,434
fg=Image.new('RGB',(W,H)); px=fg.load()
c1=(0x0B,0x1A,0x2E); c2=(0x1F,0x3A,0x5F)
for y in range(H):
    for x in range(W):
        t=0.7*(y/H)+0.3*(x/W); px[x,y]=tuple(int(c1[i]*(1-t)+c2[i]*t) for i in range(3))
fg.save(OUT+'footer-bg.webp',quality=85,method=6)
# logo variants from logo2.png (gold on transparent?) -> navy + white
lg=load('2023/12/logo2.png').convert('RGBA')
print('logo mode',lg.size, lg.getpixel((0,0)))
bbox=lg.split()[3].getbbox(); lg=lg.crop(bbox); print('logo bbox',bbox,lg.size)
for nm,col in [('logo-navy',(11,26,46)),('logo-white',(255,255,255)),('logo-gold',(201,169,97))]:
    a=lg.split()[3]; solid=Image.new('RGBA',lg.size,col+(255,)); solid.putalpha(a); solid.save(OUT+nm+'.png')
lg.save(OUT+'logo-orig.png')
# avatars 45px: three doctor faces
for nm,src,f in [('av-1','2026/05/Dr.-Tristan-Tan.webp',(0.5,0.08)),('av-2','2026/05/Dr.-Joycelyn.webp',(0.5,0.08)),('av-3','2026/05/Dr.-Wong.webp',(0.5,0.08))]:
    im=load(src).convert('RGB'); W,H=im.size; s=int(W*0.42); x0=int(W*0.5-s/2); y0=int(H*0.04); im=im.crop((x0,y0,x0+s,y0+s)).resize((180,180),Image.LANCZOS); im.save(OUT+nm+'.webp',quality=85)
# icons for why-choose
for nm,src in [('ic-award','2024/01/award.png'),('ic-experience','2024/01/experience.png'),('ic-laser','2024/01/laser.png'),('ic-guarantee','2024/01/guarantee.png'),('ic-shield','2024/01/shield.png'),('ic-clock','2024/01/sand-clock.png'),('ic-face','2024/01/face.png'),('ic-time','2024/01/back-in-time.png')]:
    try: im=load(src); im.save(OUT+nm+'.png'); print(nm,im.size,im.mode)
    except Exception as e: print('icon fail',nm,e)
print('done')
