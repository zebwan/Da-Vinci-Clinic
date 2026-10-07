# Da Vinci Clinic — website rebuild (Helora template, 25-page package)

Static site for davinciclinic.com.my, rebuilt 1:1 on the Helora Framer template (helora.framer.website) with Da Vinci Clinic colours and content.

- `build/gen.py` — generator. Run `python3 build/gen.py` to rebuild `site/` from `build/content.py` (all page copy) and `build/src/` (CSS, JS, fonts).
- `site/` — the generated static site (open `site/index.html`, or serve the folder). Also published on the `gh-pages` branch.
- `assets/` — processed images (webp), fonts (Clash Grotesk + Inter) and the hero video.
- `build/prep_assets.py` — crops and converts the clinic's photos into the template's slots.

Pages (25): Home · About · Doctors · 12 treatment families (facelift & skin tightening, pigmentation & pico laser, skin boosters, dermal fillers, collagen biostimulators, acne & scars, body contouring & weight loss, hair restoration, laser treatments, non-surgical eye/nose/face, intimate health, regenerative medicine) · BIO.CX375 skincare · Promotions · Treatments A–Z · 4 branch pages (Mid Valley, Bukit Jalil, Cheras, TRX) · Blog · Blog post · Contact (+ 404).

Breakpoints 1200 / 768 as in the template. No framework, no build step beyond the Python generator.
