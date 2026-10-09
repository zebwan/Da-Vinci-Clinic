#!/usr/bin/env python3
"""Background films generated in Magnific (Kling 3.0, start frame = end frame so they loop) → web MP4 (H.264) + WebM (VP9).
Originals live in 02-plan/generated/video/. The last frame repeats the first, so it is dropped to keep the loop seamless."""
import os, subprocess, sys

SRC = '/Users/mysense/Desktop/Da Vinci Clinic Revamp/02-plan/generated/video/'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets/video/')
JOBS = [  # (original, web name, width, height)
    ('hero-wide-v2-kling.mp4', 'hero-wide', 1920, 1080),
    ('hero-tall-v2-kling.mp4', 'hero-tall', 900, 1600),
    ('about-wide-kling.mp4', 'about-wide', 1600, 900),
    ('about-tall-v2-kling.mp4', 'about-tall', 900, 1600),
    ('marble-wide-kling.mp4', 'marble-wide', 1600, 900),
]

def run(args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args, check=True)

only = set(sys.argv[1:])
for src, name, w, h in JOBS:
    if only and name not in only: continue
    if not os.path.exists(SRC + src):
        print('missing', src); continue
    base = ['-i', SRC + src, '-frames:v', '192', '-an', '-vf', f'scale={w}:{h}:flags=lanczos']
    run(base + ['-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT + name + '.mp4'])
    run(base + ['-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', OUT + name + '.webm'])
    print(name, *(f'{ext} {os.path.getsize(OUT + name + "." + ext) // 1024} KB' for ext in ('mp4', 'webm')))
