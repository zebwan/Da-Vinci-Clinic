#!/usr/bin/env python3
"""Static generator: Helora template components (measured in 01-template-helora/TEARDOWN.md) filled with Da Vinci content.
Run: python3 build/gen.py  → writes site/ and mirrors it to the scratchpad serve folder."""
import os, re, shutil, json, html as H
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
import sys; sys.path.insert(0, os.path.join(ROOT, 'build'))
from content import SITE, PAGES, NAV

OUT = os.path.join(ROOT, 'site')
MIRROR = '/private/tmp/claude-501/-Users-mysense-Desktop/3b37e4cc-34f8-4a39-86ae-3c0a3d0bc6b8/scratchpad/dv-serve'

ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_L = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_R = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
LAUREL = '<svg class="icard__leaf" viewBox="0 0 220 200" aria-hidden="true"><g fill="none" stroke="#C9A961" stroke-width="1.2" stroke-linecap="round"><path d="M34 178Q70 70 182 22"/></g><g fill="#C9A961" fill-opacity=".55"><path transform="translate(43.7 152.9) rotate(-113.9) scale(1.00)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(43.7 152.9) rotate(-17.9) scale(1.00)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(54.6 131.5) rotate(-108.4) scale(0.94)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(54.6 131.5) rotate(-12.4) scale(0.94)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(67.3 111.5) rotate(-102.8) scale(0.89)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(67.3 111.5) rotate(-6.8) scale(0.89)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(81.8 93.0) rotate(-97.1) scale(0.83)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(81.8 93.0) rotate(-1.1) scale(0.83)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(98.2 75.9) rotate(-91.4) scale(0.78)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(98.2 75.9) rotate(4.6) scale(0.78)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(116.4 60.2) rotate(-86.0) scale(0.72)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(116.4 60.2) rotate(10.0) scale(0.72)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(136.4 46.0) rotate(-80.7) scale(0.67)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(136.4 46.0) rotate(15.3) scale(0.67)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(158.3 33.3) rotate(-75.8) scale(0.61)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(158.3 33.3) rotate(20.2) scale(0.61)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/><path transform="translate(182.0 22.0) rotate(-24)" d="M0 0C8-6 22-7 34 0C22 7 8 6 0 0Z"/></g></svg>'
MARK = '<img class="mark" src="{r}assets/img/mark-gold.png" alt="" width="82" height="246">'
SOCIAL = {
    'facebook': '<svg viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.2H7.4V14h2.7v8h3.4Z"/></svg>',
    'instagram': '<svg viewBox="0 0 24 24"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.2c-.1-1.5-.4-2.8-1.5-3.9S17.3 2.9 15.8 2.8c-1.5-.1-6.1-.1-7.6 0-1.5.1-2.8.4-3.9 1.5S2.9 6.7 2.8 8.2c-.1 1.5-.1 6.1 0 7.6.1 1.5.4 2.8 1.5 3.9s2.4 1.4 3.9 1.5c1.5.1 6.1.1 7.6 0 1.5-.1 2.8-.4 3.9-1.5s1.4-2.4 1.5-3.9c.1-1.5.1-6.1 0-7.6Zm-2 9.2a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.3.4s-4.1.1-5.3-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.3s-.1-4.1.4-5.3A3 3 0 0 1 6.7 5c1.2-.5 4-.4 5.3-.4s4.1-.1 5.3.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.3s.1 4.1-.4 5.3Z"/></svg>',
    'tiktok': '<svg viewBox="0 0 24 24"><path d="M16.6 3c.3 2.3 1.6 3.7 3.9 3.9v3c-1.4 0-2.7-.4-3.9-1.1v6.6c0 3.3-2.5 5.6-5.6 5.6S5.4 18.7 5.4 15.4c0-3.4 2.9-5.9 6.3-5.5v3.1c-1.7-.4-3.2.7-3.2 2.4 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V3h3.1Z"/></svg>',
    'youtube': '<svg viewBox="0 0 24 24"><path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
}
WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3.9A11 11 0 0 0 2.6 17.2L1 23l6-1.6A11 11 0 0 0 20 3.9ZM12 20.6a9 9 0 0 1-4.6-1.3l-.3-.2-3.4.9.9-3.3-.2-.3A9 9 0 1 1 12 20.6Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1.1 2.7c.1.2 1.9 2.9 4.5 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.2-.2-.5-.3Z"/></svg>'

def esc(s): return H.escape(str(s), quote=True)
def rel(depth): return '../' * depth

# ---------------------------------------------------------------- small pieces
def btn(label, href, style='', icon=ARROW, extra=''):
    return f'<a class="btn {style}" href="{href}" {extra}><span class="btn__label">{esc(label)}</span><span class="btn__circle">{icon}</span></a>'

def head_block(eyebrow, title, text='', left=False, rv=True, tag='h2', light=False):
    cls = 'head' + (' head--left' if left else '')
    e = f'<span class="eyebrow{" eyebrow--light" if light else ""}">{esc(eyebrow)}</span>' if eyebrow else ''
    t = f'<p>{text}</p>' if text else ''
    r = ' rv' if rv else ''
    return f'<div class="{cls}{r}"><div class="head__tag">{e}<{tag}>{title}</{tag}></div>{t}</div>'

def img(src, alt, w=None, h=None, cls='', lazy=True):
    a = f' width="{w}" height="{h}"' if w and h else ''
    return f'<img src="{src}" alt="{esc(alt)}"{a}{" class=" + chr(34) + cls + chr(34) if cls else ""}{" loading=lazy" if lazy else ""} decoding="async">'

# ---------------------------------------------------------------- components
def header(d, dark=False):
    r = rel(d)
    links = ''.join(f'<a href="{r}{h}">{esc(l)}</a>' for l, h in NAV)
    mlinks = ''.join(f'<a href="{r}{h}">{esc(l)}</a>' for l, h in NAV)
    return (f'<header class="header{" header--dark" if dark else ""}"><div class="header__in">'
            f'<a class="header__logo" href="{r}" aria-label="Da Vinci Clinic home"><img src="{r}assets/img/logo-white-sm.png" alt="Da Vinci Clinic" width="53" height="28"></a>'
            f'<nav class="nav" aria-label="Main">{links}</nav>'
            f'<div class="header__cta">{btn("Book a Consultation", r + "contact/", "btn--glass")}'
            f'<button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button></div>'
            f'</div><nav class="mnav" aria-label="Mobile">{mlinks}</nav></header>')

def footer(d):
    r = rel(d)
    links = ''.join(f'<a href="{r}{h}">{esc(l)}</a>' for l, h in NAV)
    soc = ''.join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{k.title()}">{SOCIAL[k]}</a>' for k, u in SITE['social'].items())
    addr = ''.join(f'<div><b>{esc(b["name"])}</b>{esc(b["address"])}<br><a href="tel:{b["tel"].replace(" ","")}">{esc(b["tel"])}</a> · <a href="{b["wa"]}" target="_blank" rel="noopener">WhatsApp</a></div>' for b in SITE['branches'])
    return (f'<footer class="footer"><div class="footer__bg"></div><div class="footer__in">'
            f'<div class="footer__links">{links}<a href="{r}treatments/">Treatments A–Z</a><a href="{r}promotions/">Promotions</a></div>'
            f'<div class="footer__mark" aria-hidden="true">Da Vinci</div>'
            f'<div class="footer__addr">{addr}</div>'
            f'<div class="footer__bottom"><div class="footer__line"></div><div class="footer__row"><p>© 2026 Da Vinci Clinic · KKLIU 1965/2019 · {esc(SITE["hours"])}</p><div class="footer__social">{soc}</div></div></div>'
            f'</div></footer>'
            f'<a class="wa" href="{SITE["wa_main"]}" target="_blank" rel="noopener" aria-label="WhatsApp Da Vinci Clinic">{WA_ICON}</a>')

def hero_home(c, d):
    r = rel(d)
    avs = ''.join(img(f'{r}assets/img/av-{i}.webp', '', 45, 45, lazy=False) for i in (1, 2, 3))
    return (f'<section class="hero" id="top"><div class="hero__bg">{img(r + "assets/img/hero-bg-dark.webp", "", 1600, 1000, lazy=False)}</div>'
            f'<div class="hero__cut">{img(r + "assets/img/hero-cutout.webp", c["cut_alt"], 556, 812, lazy=False).replace("<img ", "<img fetchpriority=high ")}</div>'
            f'<div class="hero__in"><div class="hero__left"><div class="hero__top">'
            f'<span class="hero__tag rv d4">{esc(c["tag"])}</span>'
            f'<h1><span class="rv">{esc(c["h1"][0])}</span><span class="line2 rv d1">{MARK.replace("{r}", r)}<span>{esc(c["h1"][1])}</span></span><span class="rv d2">{esc(c["h1"][2])}</span></h1></div>'
            f'<div class="hero__bottom"><div class="hero__proof rv d4"><div class="avatars">{avs}</div><div><h4>{esc(c["proof_big"])}</h4><p><span class="proof-long">{esc(c["proof_small"])}</span><span class="proof-short">{esc(c.get("proof_short", c["proof_small"]))}</span></p></div></div></div></div>'
            f'<div class="hero__right"><p class="rv d3">{esc(c["text"])}</p><div class="rv d4">{btn(c["cta"], r + "contact/", "btn--gold")}</div></div></div></section>')

def ihero(c, d):
    """Inner-page hero: H1 + intro, optional media (image / video / youtube)."""
    r = rel(d)
    media = ''
    if c.get('video'):
        media = f'<div class="ihero__media rv d2"><video src="{r}{c["video"]}" poster="{r}{c.get("poster","assets/img/hero-video-poster.jpg")}" autoplay muted loop playsinline></video></div>'
    elif c.get('youtube'):
        media = f'<div class="ihero__media rv d2"><iframe src="https://www.youtube-nocookie.com/embed/{c["youtube"]}" title="{esc(c.get("h1",""))}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
    elif c.get('image'):
        media = f'<div class="ihero__media rv d2" style="aspect-ratio:{c.get("ratio","1120/600")}">{img(r + c["image"], c.get("image_alt", ""), lazy=False)}</div>'
    crumb = f'<p class="breadcrumb"><a href="{r}">Home</a> › {esc(c["crumb"])}</p>' if c.get('crumb') else ''
    return f'<section class="sec ihero"><div class="wrap col">{crumb}{head_block(c.get("eyebrow"), esc(c["h1"]), esc(c.get("text","")), tag="h1")}{media}</div></section>'

def about_block(c, d):
    pills = ''.join(f'<span class="tagpill tagpill--{i+1}">{esc(p)}</span>' for i, p in enumerate(c['pills']))
    stats = ''.join(f'<div class="stat rv d{i}"><p>{esc(s["label"])}</p><h2 data-count="{s["n"]}" data-prefix="{s.get("prefix","")}" data-suffix="{s.get("suffix","")}">{s.get("prefix","")}0{s.get("suffix","")}</h2></div>' for i, s in enumerate(c['stats']))
    r = rel(d)
    busts = (f'<div class="about__bust about__bust--l" data-par=".14"><img class="rv" src="{r}assets/img/bust-david.webp" alt="" width="735" height="820" loading="lazy" decoding="async"></div>'
             f'<div class="about__bust about__bust--r" data-par=".2"><img class="rv d2" src="{r}assets/img/bust-venus.webp" alt="" width="651" height="820" loading="lazy" decoding="async"></div>')
    return (f'<section class="sec sec--lg about-sec" id="about"><div class="wrap col" style="gap:10px"><div class="about__block">{busts}{pills}'
            f'{head_block(c["eyebrow"], esc(c["title"]))}</div><div class="stats">{stats}</div></div></section>')

def services(c, d):
    r = rel(d)
    cards = ''.join(f'<a class="scard rv d{i}" href="{r}{s["href"]}">{img(r + s["img"], s["alt"], 726, 876)}<div class="scard__txt"><h4>{esc(s["title"])}</h4><p>{esc(s["text"])}</p></div></a>' for i, s in enumerate(c['cards']))
    headrow = f'<div class="row rv"><div class="head head--left"><div class="head__tag"><span class="eyebrow">{esc(c["eyebrow"])}</span><h2 style="max-width:569px">{esc(c["title"])}</h2></div></div><p>{esc(c["text"])}</p></div>'
    extra = f'<div class="rv" style="align-self:center">{btn(c["more"], r + c["more_href"], "btn--gold")}</div>' if c.get('more') else ''
    return f'<section class="sec" id="{c.get("id","services")}"><div class="wrap col">{headrow}<div class="cards3">{cards}</div>{extra}</div></section>'

def why(c, d):
    r = rel(d)
    cards = ''.join(f'<div class="icard rv d{i}"><div class="icard__icon">{img(r + "assets/img/" + it["icon"].replace(".png", "-gold.png"), "", 32, 32)}</div><div class="icard__txt"><h4>{esc(it["title"])}</h4><p>{esc(it["text"])}</p></div>' + LAUREL + f'</div>' for i, it in enumerate(c['cards']))
    return (f'<section class="sec"><div class="wrap col">{head_block(c["eyebrow"], esc(c["title"]), esc(c.get("text","")))}'
            f'<div class="why"><div class="why__photo zoom rv">{img(r + c["img"], c["img_alt"], 724, 1180)}</div><div class="why__grid">{cards}</div></div></div></section>')

def benefit(c, d):
    r = rel(d)
    items = ''.join(f'<p class="lead">• {esc(t)}</p>' for t in c['points'])
    return (f'<section class="sec"><div class="wrap"><div class="benefit"><div class="benefit__panel rv">{head_block(c["eyebrow"], esc(c["title"]), esc(c["text"]), left=True, rv=False)}<div class="benefit__list">{items}</div></div>'
            f'<div class="benefit__photo zoom rv d1">{img(r + c["img"], c["img_alt"], 828, 1034)}</div></div></div></section>')

def work(c, d):
    r = rel(d)
    def card(s, i): return f'<div class="wcard rv" data-step="{i}"><div class="zoom">{img(r + s["img"], s["alt"], 844, 870)}</div><div class="wcard__txt"><h3>{esc(s["title"])}</h3><span class="wcard__rule" aria-hidden="true"></span><p>{esc(s["text"])}</p></div></div>'
    st = c['steps']
    nodes = ''.join(f'<i class="work__node work__node--{"l" if i % 2 == 0 else "r"}" data-node="{i}"></i>' for i in range(len(st)))
    stage = f'<div class="work__spine" aria-hidden="true"><span class="work__track"></span><span class="work__line"></span>{nodes}</div>'
    # Da Vinci's sculpture film (their homepage hero) pinned behind the steps while the cards scroll over it
    bg = (f'<div class="work__bg" aria-hidden="true"><div class="work__bgv"><video muted loop playsinline preload="none" poster="{r}assets/img/hero-video-poster.jpg">'
          f'<source src="{r}assets/video/dv-hero-1920.webm" type="video/webm"><source src="{r}assets/video/dv-hero-1920.mp4" type="video/mp4"></video></div></div>')
    return (f'<section class="sec work">{bg}<div class="wrap col">{head_block(c["eyebrow"], esc(c["title"]), esc(c["text"]), rv=False)}'
            f'<div class="work__cols">{stage}<div class="work__col work__col--a">{card(st[0],0)}{card(st[2],2)}</div><div class="work__col work__col--b">{card(st[1],1)}{card(st[3],3)}</div></div></div></section>')

def approach(c, d):
    """Signature treatments / protocol steps: auto-playing slider (6 s per slide, pauses on hover, swipe on touch)."""
    r = rel(d)
    slides = ''.join(f'<div class="slide{" is-active" if i == 0 else ""}" aria-roledescription="slide" aria-label="{i+1} of {len(c["slides"])}"><div class="slide__txt"><div class="t"><h3>{esc(s["title"])}</h3><p>{esc(s["text"])}</p></div><div class="slide__pills">{"".join(f"<span class=pill>{esc(p)}</span>" for p in s["pills"])}</div></div><div class="slide__img">{img(r + s["img"], s["alt"], 1200, 866)}</div></div>' for i, s in enumerate(c['slides']))
    tabs = ''.join(f'<button class="sig__tab{" is-active" if i == 0 else ""}" data-go="{i}"><span>{esc(s.get("tab", s["title"]))}</span><b class="sig__bar"><i></i></b></button>' for i, s in enumerate(c['slides']))
    nav = f'<div class="sig__nav"><button class="slider__btn sig__prev" aria-label="Previous">{ARROW_L}</button><button class="slider__btn sig__next" aria-label="Next">{ARROW_R}</button></div>'
    return (f'<section class="sec sig" id="{c.get("id","approach")}"><div class="wrap col">{head_block(c["eyebrow"], esc(c["title"]), esc(c["text"]))}'
            f'<div class="sig__slider rv" data-interval="6000" aria-roledescription="carousel"><div class="sig__track">{slides}</div><div class="sig__ctrl"><div class="sig__tabs">{tabs}</div>{nav}</div></div></div></section>')

def plans(c, d):
    r = rel(d)
    def plan(p, i):
        feats = ''.join(f'<p>{esc(f)}</p>' for f in p['features'])
        hi = ' plan--hi' if p.get('hi') else ''
        b = btn(p['cta'], r + p.get('href', 'contact/'), ('btn--white' if p.get('hi') else '') + ' btn--sm btn--full')
        return (f'<div class="plan{hi} rv d{i}"><div class="plan__info"><span class="plan__name">{esc(p["name"])}</span><div class="plan__price"><h3>{esc(p["price"])}</h3><small>{esc(p.get("unit",""))}</small></div></div>'
                f'<div class="plan__fb"><div class="plan__line"></div><div class="plan__feat">{feats}</div>{b}</div><p class="plan__note">“{esc(p["note"])}”</p></div>')
    cards = ''.join(plan(p, i) for i, p in enumerate(c['plans']))
    headrow = f'<div class="row rv"><div class="head head--left"><div class="head__tag"><span class="eyebrow">{esc(c["eyebrow"])}</span><h2 style="max-width:390px">{esc(c["title"])}</h2></div></div><p style="max-width:304px">{esc(c["text"])}</p></div>'
    return f'<section class="sec sec--lg sec--lg-b sec--panel" id="{c.get("id","offers")}"><div class="wrap col col--left">{headrow}<div class="plans">{cards}</div></div></section>'

def team(c, d, active=0):
    r = rel(d)
    cards = ''.join(f'<a class="tcard{" is-active" if i == active else ""}" href="{r}doctors/#{m["id"]}">{img(r + m["img"], m["alt"], 914, 1080)}<div class="tcard__name"><h4>{esc(m["name"])}</h4><p>{esc(m["role"])}</p></div></a>' for i, m in enumerate(c['members']))
    few = ' team--few' if len(c['members']) < 4 else ''
    return f'<section class="sec sec--lg" id="team"><div class="wrap col">{head_block(c["eyebrow"], esc(c["title"]), esc(c["text"]))}<div class="team rv{few}">{cards}</div></div></section>'

def testimonials(c, d):
    r = rel(d)
    slides = ''.join(f'<div class="tslide"><div class="tslide__img">{img(r + t["img"], t["alt"], 1056, 916)}</div><div class="tslide__card"><h3>“{esc(t["quote"])}”</h3><div class="tslide__who"><p>{esc(t["name"])}</p><p class="small">{esc(t["role"])}</p></div></div></div>' for t in c['items'])
    nav = f'<div class="slider__nav"><button class="slider__btn slider__btn--prev" aria-label="Previous">{ARROW_L}</button><button class="slider__btn slider__btn--next" aria-label="Next">{ARROW_R}</button></div>'
    return (f'<section class="sec" id="reviews"><div class="wrap col">{head_block(c["eyebrow"], esc(c["title"]), esc(c["text"]))}'
            f'<div class="slider rv"><div class="slider__track">{slides}</div>{nav}</div></div></section>')

def journey(c, d):
    r = rel(d)
    words = ''.join(f'<span class="journey__word">{esc(w)}</span>' for w in c['words'])
    return (f'<section class="sec"><div class="wrap col">{head_block(c["eyebrow"], esc(c["title"]), esc(c["text"]))}'
            f'<div class="journey__media rv"><video src="{r}assets/video/dv-hero-1280.mp4" poster="{r}assets/img/hero-video-poster.jpg" muted loop playsinline preload="metadata"></video><div class="journey__words">{words}</div></div></div></section>')

def faq(c, d):
    items = ''.join(f'<div class="faq__item rv d{i%2}"><button class="faq__q" aria-expanded="false"><p>{esc(q)}</p><span class="faq__icon" aria-hidden="true"></span></button><div class="faq__a"><div><p>{esc(a)}</p></div></div></div>' for i, (q, a) in enumerate(c['items']))
    return f'<section class="sec" id="faq"><div class="wrap col">{head_block(c.get("eyebrow","FAQ"), esc(c["title"]), esc(c.get("text","")))}<div class="faq">{items}</div></div></section>'

def post_card(p, d, i=0):
    r = rel(d)
    band = '<div class="post__band"><span>' + ''.join('<i>View article</i>' for _ in range(12)) + '</span></div>'
    return (f'<a class="post rv d{i}" href="{r}blog/{p["slug"]}/"><div class="post__img">{img(r + p["img"], p["alt"], 726, 876)}{band}</div>'
            f'<div class="post__meta"><div class="post__date"><b>{esc(p["day"])}</b><span>{esc(p["month"])}</span></div><p class="post__title">{esc(p["title"])}</p></div></a>')

def posts(c, d):
    cards = ''.join(post_card(p, d, i) for i, p in enumerate(c['posts'][:3]))
    return f'<section class="sec" id="blog"><div class="wrap col">{head_block(c["eyebrow"], esc(c["title"]), esc(c["text"]))}<div class="posts">{cards}</div></div></section>'

def cta(c, d):
    r = rel(d)
    return (f'<section class="sec sec--lg-b"><div class="wrap"><div class="cta"><div class="cta__txt rv"><div class="t"><h2>{esc(c["title"])}</h2><p>{esc(c["text"])}</p></div>{btn(c["cta"], r + c.get("href", "contact/"), "btn--pad24")}</div>'
            f'<div class="cta__img zoom rv d1">{img(r + c["img"], c["img_alt"], 1114, 744)}</div></div></div></section>')

# generic blocks
def split(c, d):
    r = rel(d)
    return (f'<section class="sec"><div class="wrap"><div class="split{" split--rev" if c.get("rev") else ""}"><div class="split__img zoom rv">{img(r + c["img"], c["img_alt"], 1098, 1192)}</div>'
            f'<div class="split__txt rv d1"><h2>{esc(c["title"])}</h2>{"".join(f"<p>{esc(p)}</p>" for p in c["paras"])}{btn(c["cta"], r + c["href"], "btn--gold") if c.get("cta") else ""}</div></div></div></section>')

def sticky_rows(c, d):
    r = rel(d)
    rows = ''.join(f'<div class="srow"><div class="srow__img">{img(r + s["img"], s["alt"], 1076, 800)}</div><div class="srow__txt"><h2>{esc(s["title"])}</h2><p>{esc(s["text"])}</p></div></div>' for s in c['rows'])
    return f'<section class="sec"><div class="wrap col">{head_block(c.get("eyebrow"), esc(c["title"]), esc(c.get("text","")))}<div class="stack">{rows}</div></div></section>'

def stats_row(c, d):
    stats = ''.join(f'<div class="stat rv d{i}"><p>{esc(s["label"])}</p><h2 data-count="{s["n"]}" data-prefix="{s.get("prefix","")}" data-suffix="{s.get("suffix","")}">{s.get("prefix","")}0{s.get("suffix","")}</h2></div>' for i, s in enumerate(c['stats']))
    headrow = f'<div class="row rv" style="align-items:center"><h2 style="max-width:570px">{esc(c["title"])}</h2><p style="max-width:398px">{esc(c["text"])}</p></div>'
    return f'<section class="sec"><div class="wrap col">{headrow}<div class="stats">{stats}</div></div></section>'

def detail_cards(c, d):
    """Treatment details (procedure time / downtime / anaesthesia / results) as the stat-card row, text only."""
    cards = ''.join(f'<div class="stat rv d{i}" style="gap:16px"><p>{esc(k)}</p><h3>{esc(v)}</h3></div>' for i, (k, v) in enumerate(c['items']))
    return f'<section class="sec"><div class="wrap col">{head_block(c.get("eyebrow","Treatment details"), esc(c["title"]), esc(c.get("text","")))}<div class="stats">{cards}</div></div></section>'

def contact_block(c, d):
    r = rel(d)
    opts = ''.join(f'<option>{esc(b["name"])}</option>' for b in SITE['branches'])
    form = (f'<form class="form rv d1" action="#" method="post"><h4>{esc(c.get("form_title","Send us a message"))}</h4><div class="form__fields">'
            f'<label>Full name<input type="text" name="name" placeholder="Enter your full name" required></label>'
            f'<label>Phone number<input type="tel" name="phone" placeholder="Enter your phone number" required></label>'
            f'<label>Email<input type="email" name="email" placeholder="Enter your email"></label>'
            f'<label>Preferred branch<select name="branch">{opts}</select></label>'
            f'<label>What are your concerns?<textarea name="message" placeholder="Tell us what you would like to improve"></textarea></label></div>'
            f'<button type="submit" class="btn btn--sm btn--full"><span class="btn__label">Send message</span><span class="btn__circle">{ARROW}</span></button></form>')
    h1 = '<h1>' + ''.join(f'<span>{esc(l)}</span>' for l in c['h1']) + '</h1>'
    return (f'<section class="sec ihero"><div class="wrap"><div class="contact"><div class="contact__left rv">{h1}<p>{esc(c.get("text",""))}</p><div class="contact__photo zoom">{img(r + c["img"], c["img_alt"], 912, 1002, lazy=False)}</div></div>{form}</div></div></section>')

def info_grid(c, d):
    cards = ''.join(f'<div class="info rv d{i%2}"><h4>{esc(it["title"])}</h4>{it["html"]}</div>' for i, it in enumerate(c['items']))
    return f'<section class="sec"><div class="wrap col">{head_block(c.get("eyebrow"), esc(c["title"]), esc(c.get("text","")))}<div class="info-grid">{cards}</div></div></section>'

def map_block(c, d):
    return f'<section class="sec"><div class="wrap col"><div class="map rv"><iframe src="{c["src"]}" title="{esc(c["title"])}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></div></section>'

def gallery(c, d):
    r = rel(d)
    figs = ''.join(f'<figure class="rv d{i%4}">{img(r + g["img"], g["alt"], 1000, 750)}<figcaption>{esc(g["cap"])}</figcaption></figure>' for i, g in enumerate(c['items']))
    return f'<section class="sec"><div class="wrap col">{head_block(c.get("eyebrow"), esc(c["title"]), esc(c.get("text","")))}<div class="gallery">{figs}</div></div></section>'

def az(c, d):
    r = rel(d)
    groups = ''.join(f'<div class="az__group rv d{i%3}"><h4>{esc(g["title"])}</h4>{"".join(f"<a href={chr(34)}{r}{h}{chr(34)}>{esc(t)}</a>" for t, h in g["items"])}</div>' for i, g in enumerate(c['groups']))
    return f'<section class="sec"><div class="wrap col">{head_block(c.get("eyebrow"), esc(c["title"]), esc(c.get("text","")))}<div class="az">{groups}</div></div></section>'

def article(c, d):
    return f'<section class="sec" style="padding-top:0"><div class="wrap col"><div class="article rv">{c["html"]}</div></div></section>'

def featured(c, d):
    r = rel(d); p = c['post']
    return (f'<section class="sec" style="padding-top:0"><div class="wrap"><div class="featured rv"><div class="featured__txt"><p class="small">{esc(p["date"])}</p><h2>{esc(p["title"])}</h2><p>{esc(p["excerpt"])}</p>{btn("Read article", r + "blog/" + p["slug"] + "/", "btn--pad24")}</div>'
            f'<div class="featured__img zoom">{img(r + p["img"], p["alt"], 726, 876)}</div></div></div></section>')

def posts_grid(c, d):
    cards = ''.join(post_card(p, d, i % 3) for i, p in enumerate(c['posts']))
    return f'<section class="sec"><div class="wrap col">{head_block(c.get("eyebrow"), esc(c["title"]), esc(c.get("text","")))}<div class="posts posts--grid">{cards}</div></div></section>'

def notice(c, d):
    return f'<section class="sec" style="padding-top:0"><div class="wrap"><div class="notice rv">{c["html"]}</div></div></section>'

COMPONENTS = {k: v for k, v in globals().items() if callable(v) and k in (
    'hero_home', 'ihero', 'about_block', 'services', 'why', 'benefit', 'work', 'approach', 'plans', 'team', 'testimonials', 'journey', 'faq', 'posts', 'cta',
    'split', 'sticky_rows', 'stats_row', 'detail_cards', 'contact_block', 'info_grid', 'map_block', 'gallery', 'az', 'article', 'featured', 'posts_grid', 'notice')}

# ---------------------------------------------------------------- page shell
def jsonld(page, d):
    org = {"@context": "https://schema.org", "@type": "MedicalClinic", "name": "Da Vinci Clinic", "legalName": SITE['legal'], "url": SITE['url'],
           "telephone": SITE['tel'], "email": SITE['email'], "priceRange": "RM250 - RM5000", "medicalSpecialty": "Dermatology",
           "openingHours": ["Mo-Fr 10:00-19:00", "Sa-Su 10:00-17:30"], "sameAs": list(SITE['social'].values()),
           "address": [{"@type": "PostalAddress", "name": b['name'], "streetAddress": b['address'], "addressLocality": "Kuala Lumpur", "addressCountry": "MY"} for b in SITE['branches']]}
    graph = [org]
    if page.get('faq'):
        graph.append({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in page['faq']['items']]})
    if page.get('breadcrumb'):
        graph.append({"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE['url'] + h} for i, (n, h) in enumerate(page['breadcrumb'])]})
    return '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False) + '</script>'

def render(page):
    d = page['slug'].count('/') + (0 if page['slug'] == '' else 1)
    d = 0 if page['slug'] == '' else page['slug'].strip('/').count('/') + 1
    r = rel(d)
    body = ''.join(COMPONENTS[name](cfg, d) for name, cfg in page['sections'])
    canonical = SITE['url'] + ('/' if page['slug'] == '' else '/' + page['slug'].strip('/') + '/')
    ogimg = SITE['url'] + '/' + page.get('og', 'assets/img/team-wide.webp')
    head = (f'<!doctype html><html lang="en-MY"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{esc(page["title"])}</title><meta name="description" content="{esc(page["desc"])}"><link rel="canonical" href="{canonical}">'
            f'<meta property="og:title" content="{esc(page["title"])}"><meta property="og:description" content="{esc(page["desc"])}"><meta property="og:image" content="{ogimg}"><meta property="og:type" content="website"><meta property="og:url" content="{canonical}">'
            f'<link rel="icon" href="{r}assets/img/favicon.png"><link rel="preload" href="{r}assets/fonts/cormorant-garamond-500-latin.woff2" as="font" type="font/woff2" crossorigin>'
            f'<link rel="stylesheet" href="{r}assets/fonts.css?v={VER}"><link rel="stylesheet" href="{r}assets/main.css?v={VER}">{jsonld(page, d)}</head>')
    cls = page.get('body_class', '')
    html = head + f'<body class="{cls}">' + header(d, dark=page.get('dark_header', False)) + '<main>' + body + '</main>' + footer(d) + f'<script src="{r}assets/main.js?v={VER}" defer></script></body></html>'
    out = os.path.join(OUT, page['slug'].strip('/'), 'index.html') if page['slug'] else os.path.join(OUT, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(html)
    return out

VER = str(int(os.path.getmtime(os.path.join(ROOT, 'build/src/main.css'))))[-6:]

def main():
    if os.path.exists(OUT): shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, 'assets'), exist_ok=True)
    shutil.copytree(os.path.join(ROOT, 'assets/img'), os.path.join(OUT, 'assets/img'))
    shutil.copytree(os.path.join(ROOT, 'assets/fonts'), os.path.join(OUT, 'assets/fonts'))
    os.makedirs(os.path.join(OUT, 'assets/video'), exist_ok=True)
    for v in ('dv-hero-1280.mp4', 'dv-hero-1280.webm', 'dv-hero-1920.mp4', 'dv-hero-1920.webm'): shutil.copy(os.path.join(ROOT, 'assets/video', v), os.path.join(OUT, 'assets/video', v))
    shutil.copy(os.path.join(ROOT, 'build/src/main.css'), os.path.join(OUT, 'assets/main.css'))
    shutil.copy(os.path.join(ROOT, 'build/src/main.js'), os.path.join(OUT, 'assets/main.js'))
    shutil.copy(os.path.join(ROOT, 'build/src/fonts.css'), os.path.join(OUT, 'assets/fonts.css'))
    fav = os.path.join(OUT, 'assets/img/favicon.png')
    if not os.path.exists(fav):
        from PIL import Image
        Image.open('/Users/mysense/Desktop/Da Vinci Clinic Revamp/00-current-site/images/uploads/2023/12/logo.png').convert('RGBA').resize((64, 64)).save(fav)
    n = 0
    for p in PAGES:
        render(p); n += 1
    # sitemap + robots
    urls = ''.join(f'<url><loc>{SITE["url"]}/{(p["slug"].strip("/") + "/") if p["slug"] else ""}</loc></url>' for p in PAGES if not p.get('noindex'))
    open(os.path.join(OUT, 'sitemap.xml'), 'w').write(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>')
    open(os.path.join(OUT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE["url"]}/sitemap.xml\n')
    open(os.path.join(OUT, '.nojekyll'), 'w').write('')
    # mirror for the preview server
    os.makedirs(MIRROR, exist_ok=True)
    os.system(f'rsync -a --delete "{OUT}/" "{MIRROR}/"')
    print(f'{n} pages → {OUT} (mirrored to {MIRROR})')

if __name__ == '__main__':
    main()
