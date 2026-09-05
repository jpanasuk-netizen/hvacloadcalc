# HVACLoadCalc

Static niche calculator site: room-by-room HVAC sizing. Clones the generatorsizer pattern
(dark mobile-first single-page app, 4 calculator tabs, FAQPage + SoftwareApplication JSON-LD,
2–3 BOFU articles with affiliate placeholders).

## Pages
- `index.html` — hub: Room BTU / Mini-split size / Duct CFM / Baseboard watts tabs
- `mini-split-room-size.html`, `electric-baseboard-watts.html`, `duct-cfm-chart.html` — BOFU articles
- `llms.txt`, `robots.txt`, `sitemap.xml`, `LAUNCH_CHECKLIST.md`

## Math (all pure functions in `assets/app.js`, exported via `module.exports`)
- Room BTU: `sqft × 25 BTU/sq ft × (height/8) × sunFactor × insulFactor + 600 × windows`, × 1.10 safety, ceil 500
- Mini-split: nearest standard head (9k–36k) ≥ load, per-zone split
- Duct CFM: `BTU/hr ÷ (ΔT × 1.08)`
- Baseboard: `BTU/hr ÷ 3.41` watts; amps at circuit volts; ~250 W per linear ft

All copy labels this as a rule-of-thumb planning tool, not a substitute for full ACCA Manual J / Manual D / electrician load calc.

## Smoke test
`node smoke-test.js` — runs every calculator through hand-verified cases (no DOM needed).

Target URL: https://jpanasuk-netizen.github.io/hvacloadcalc/
Do NOT git init / push / publish without Jeremy's approval (see LAUNCH_CHECKLIST.md).
