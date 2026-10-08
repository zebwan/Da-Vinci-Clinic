# Da Vinci Clinic — website rebuild (Helora template, 25-page package)

Static site for davinciclinic.com.my, rebuilt 1:1 on the Helora Framer template (helora.framer.website) with Da Vinci Clinic colours and content.

- `build/gen.py` — generator. Run `python3 build/gen.py` to rebuild `site/` from `build/content.py` (all page copy) and `build/src/` (CSS, JS, fonts).
- `site/` — the generated static site (open `site/index.html`, or serve the folder). Also published on the `gh-pages` branch.
- `assets/` — processed images (webp), fonts (Zodiak headings + Manrope body, self-hosted) and the hero video.
- `build/prep_assets.py` — crops and converts the clinic's photos into the template's slots.
- `build/prep_dark.py` — assets for the dark treatment: gold icons and mark, the spotlight hero background. The home About image (`about-bust-wide.webp`, `about-bust-tall.webp`) was generated in Magnific (Seedream 5 Pro) for that slot; the full-size originals are in `02-plan/generated/`.
- `build/prep_art.py` — crops Da Vinci's own sculpture-and-model photos (the shoot behind their homepage service bands) into the homepage treatment cards, the signature slider, the protocol cards and the matching treatment-page heroes (`art-*.webp`, `svc-*-wide.webp`, `benefit-art.webp`).

Visual direction (Oct 2026 amendments): Da Vinci's dark navy and gold, Zodiak for headings and Manrope for body text, a generated marble bust behind the home tagline, the clinic's sculpture film behind How-it-works, and the clinic's own sculpture-and-model photography in the treatment cards and heroes. The signature treatments run as an auto-playing slider. The earlier light version is tagged `v1-light`.

Pages (25): Home · About · Doctors · 12 treatment families (facelift & skin tightening, pigmentation & pico laser, skin boosters, dermal fillers, collagen biostimulators, acne & scars, body contouring & weight loss, hair restoration, laser treatments, non-surgical eye/nose/face, intimate health, regenerative medicine) · BIO.CX375 skincare · Promotions · Treatments A–Z · 4 branch pages (Mid Valley, Bukit Jalil, Cheras, TRX) · Blog · Blog post · Contact (+ 404).

Breakpoints 1200 / 768 as in the template. No framework, no build step beyond the Python generator.
