# HVACLoadCalc — Launch Checklist

Site files: `HermesVault/40-Content/sites/hvacloadcalc/`
Pattern cloned from: `HermesVault/40-Content/sites/generatorsizer/` (dark mobile-first SPA, 4 tabs, JSON-LD, affiliate placeholders).

## 0. Pre-launch (before anything public)
- [ ] Jeremy approves publish (charter human gate — no live URL without his yes)
- [ ] Canonical/og:url/sitemap/robots all point at `https://hvac-load-calc.com/` (they already do — re-check if a custom domain is added later)
- [ ] Verify rule-of-thumb figures (20–30 BTU/sq ft, 600 BTU/window, 7–10 W/sq ft, 1.08 constant) against a current ACCA Manual J summary — figures are labeled as rule-of-thumb, not Manual J results
- [ ] Affiliate timing: apply to programs BEFORE adding real links; slots are marked `<!-- AFFILIATE SLOT -->` in index.html + all 3 articles

## 1. Hosting — GitHub Pages ($0)
- [ ] Create repo `jpanasuk-netizen/hvacloadcalc` (public), push folder contents to `main`
- [ ] Settings → Pages → Deploy from branch: `main` / root → confirm `https://hvac-load-calc.com/`
- [ ] Mirror to Hugging Face Space (sdk: static) — matches the packet-twin pattern

## 2. Search Console
- [ ] Verify the github.io URL via HTML file
- [ ] Submit `sitemap.xml`
- [ ] URL Inspection → Request indexing on all 4 pages
- [ ] Rich Results Test: SoftwareApplication + FAQPage validate

## 3. Affiliate programs (apply in this order)
- [ ] **Amazon Associates** — mini-splits, window/portable ACs, line-voltage smart thermostats, baseboard heaters, HVAC measurement tools
- [ ] **Electrician lead-gen** (baseboard circuit work) — pick ONE program, needs Jeremy's yes on terms
- [ ] Later: AdSense once organic traffic exists (~20+ sessions/day)

## 4. Distribution
- [ ] r/HVAC, r/HomeImprovement, r/Minisplits, DIY forums: answer sizing threads with genuinely useful replies; link the calculator only when it's the right tool. r/HVAC pros are allergic to rule-of-thumb tools — lead with the honest "not a Manual J" label and the shown-work math
- [ ] Cross-link: add "HVACLoadCalc ↗" to generatorsizer / solarsizer / weldingcalc / battery-bank-sizer navs + llms.txt AFTER this site is live (reciprocal, not orphan)

## 5. Post-launch QA
- [ ] Test all 4 calculator tabs on a phone (mobile-first; verify grid2/row2 collapse at 375px)
- [ ] Lighthouse mobile ≥ 95 perf
- [ ] Confirm no affiliate links ship before program approval
