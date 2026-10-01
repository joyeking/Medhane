# Medhane (MD)

**Ethiopian nutrition & herbal supplements — a static, multi-page storefront.**

መዳሓን · **MD**

Medhane packs Ethiopian traditional remedies and foods as foods and dietary supplements — measured
per day of use, tested per batch, with the cautions printed on the label instead of buried on a
policy page.

---

## Live site

**https://joyeking.github.io/Medhane/**

## What it is

A six-page static site for a fictional-but-research-grounded Ethiopian supplement brand, redesigned
from a supplied landing-page reference and extended across every page.

| Route | Page | What it does |
|---|---|---|
| `/` | Landing | Hero, product-family tabs, oversized "how it's made", stats, ritual, bestsellers |
| `/blends.html` | Combinations | 9 blends, each with full composition, dosing and cautions |
| `/herbs.html` | Herb library | 20 Ethiopian plants, filterable by use, with Latin names and cautions |
| `/shop.html` | Shop | 9-pouch catalogue with filtering, sorting and a membership band |
| `/story.html` | Our story | The dosing problem, sourcing, batch testing |
| `/faq.html` | Safety notes | Interactions, pregnancy flags, evidence standards |

## The range

| Blend | For |
|---|---|
| **Buna & Halwo** | Running stomach — pounded green coffee with honey |
| **Zinjible & Feto** | Acidic stomach — ginger rhizome masticated with *Lepidium sativum* |
| **Teff & Shiferaw** | Daily nutrition — whole teff, moringa leaf, sesame |
| **Gesho & Besso** | Appetite and heaviness — gesho bitters with roasted barley |
| **Tenadam & Halwo** | Stomach pain — *Ruta chalepensis* leaf juice with honey |
| **Dokuma & Abalo** | Dysentery — *Syzygium guineense* with a 7-day honey ferment |
| **Shiferaw & Tikur Azmud** | Recovery and lipids — moringa leaf with black seed |
| **Masos & Arit** | Fever, cough, worms — *Vernonia amygdalina* with artemisia |
| **Kolo & Shiferaw** | The 4pm slump — roasted highland grain snack rebuilt around moringa |

## Where the content came from

Every figure on the site traces to published Ethiopian ethnobotany and nutrition research, not
marketing:

- **1,054** Ethiopian medicinal herbs and **573** multi-herb prescriptions — [ETM-DB](https://link.springer.com/article/10.1186/s12906-019-2634-1)
- **~80%** of Ethiopians use traditional medicine for primary health care — [Review](https://www.remedypublications.com/open-access/medicinal-plants-used-in-traditional-medicine-by-ethiopians-a-review-article-991.pdf)
- Teff at **12.8–20.99%** protein, **8%** fibre, glycemic index **57–74**, gluten-free — [Nutritional review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12524473/)
- Moringa leaf at **28–29%** crude protein, **826–1530 mg** calcium/100 g, and lipid effects in animal work — [Supplement screening study](https://pc.e-nrp.org/search.php?code=0161NRP&id=10.4162%2Fnrp.2019.13.6.529&vmode=PUBREADER&where=aview)
- *Syzygium guineense* MIC of **1.56 mg/mL** against *S. aureus* — [BMC Complement Med Ther](https://link.springer.com/article/10.1186/s12906-026-05395-2)
- Gesho anti-biofilm activity up to **99.9%** — [Phytochemistry review](https://dergipark.org.tr/en/pub/ijsm/article/833554)
- Ginger chewed with *feto* for stomach disorders, and honey as the standard preparation carrier — [Zegie ethnobotany](https://pmc.ncbi.nlm.nih.gov/articles/PMC1852296/)
- Part usage: leaves ~33%, roots ~30% — [IntechOpen handbook](https://www.intechopen.com/chapters/66996)
- Moringa leaf at **352 mg/L lead** in loose market powder — [Mekelle market analysis](https://exa.ai/library/publication/2gwcs5zxqn)

### Editorial stance

The site separates **in vitro**, **in animal work**, and **recorded practice** rather than collapsing
them into one claim, and every product carries a caution row. Home page testimonials are labelled
illustrative, not verified reviews. Nothing here is medical advice.

## Design

Built as static HTML, CSS and JavaScript. No framework, no build step, no runtime dependency.

The visual system was extracted from a supplied landing-page reference and applied consistently
across every page:

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f1eff7` | Soft lavender canvas |
| `--ink` | `#18092e` | Deep purple-black, all display type |
| `--lav` | `#a78bf5` | Primary lavender accent |
| `--peri` | `#a8b4f7` | Periwinkle band |
| `--honey` | `#f0b03c` | Ethiopian honey accent |

Shape vocabulary is deliberately narrow — everything is a pill, a card, or a rounded band. Type is
`Outfit` for display at −0.035em tracking and `Manrope` for reading. Structural patterns include
floating pill navigation, tilted collage stacks with floating sticker chips, segmented pill tabs,
rounded full-bleed colour bands with inset white cards, and oversized numerals in a pill-list stats
block.

Layout and information-hierarchy patterns were informed by design references consulted for this
project:

- **[bchiang7/v4](https://github.com/bchiang7/v4)** — compact label/value metadata rows, consistent
  visual identity, one clear primary action per card
- **[adrianhajdin/portfolio](https://github.com/adrianhajdin/portfolio)** — bento composition,
  testimonial card presentation, gentle hover feedback, responsive grids

These are design references only. No code, text or branding was copied.

## Accessibility

- Single `<h1>` per page, no skipped heading levels
- Keyboard-operable pill tabs with roving arrow-key navigation
- `<details>`-based accordions, natively keyboard-operable
- Visible focus rings, `:focus-visible` throughout
- All decorative SVG marked `aria-hidden`
- Every page has a skip link, `lang`, and a meta description
- `prefers-reduced-motion` disables reveal animations and count-ups
- Responsive grids use `minmax(min(…, 100%), 1fr)` so they cannot overflow narrow viewports

## Local development

```bash
node tools/serve.mjs 4173     # preview at http://127.0.0.1:4173/
node tools/verify.mjs .       # links, anchors, structure, a11y, CSS integrity
```

`verify.mjs` checks local and cross-page links, same-page anchors, duplicate ids, data-hook
integrity, CSS brace balance, undefined custom properties, block tag balance, `<dt>`/`<dd>` pairing,
single-`h1`, SVG labelling, explicit button types, and heading-level order.

## Deployment

Static files served by GitHub Pages from the repository root. No build step: push and it is live.

## Licence

MIT.