/* HVACLoadCalc smoke test — pure functions only, no DOM required.
   Run: node smoke-test.js */
"use strict";
const C = require("./assets/app.js");

let pass = 0, fail = 0;
function approx(a, b, tol, label) {
  if (Math.abs(a - b) <= tol) { pass++; console.log("  PASS " + label); }
  else { fail++; console.log("  FAIL " + label + " — got " + a + ", expected " + b + " (±" + tol + ")"); }
}
function isTrue(cond, label) {
  if (cond) { pass++; console.log("  PASS " + label); }
  else { fail++; console.log("  FAIL " + label); }
}

console.log("== 1. roomLoadBTU (Manual-J-lite) ==");
// 300 sq ft, 8 ft ceiling, 2 windows, average sun, average insulation:
// 300*25 = 7500; +2*600 = 1200 → 8700; ×1.10 = 9570
approx(C.roomLoadBTU(300, 8, 2, "average", "average"), 9570, 0.01, "300sqft/8ft/2win/avg/avg = 9,570 BTU");
// Sunny + poor insulation: 300*25*1.15*1.25 = 10781.25 + 1200 = 11981.25 ×1.10 = 13179.375
approx(C.roomLoadBTU(300, 8, 2, "sunny", "poor"), 13179.375, 0.01, "sunny+poor = 13,179 BTU");
// Shaded + good: 300*25*0.9*0.85 = 5737.5 + 1200 = 6937.5 ×1.10 = 7631.25
approx(C.roomLoadBTU(300, 8, 2, "shaded", "good"), 7631.25, 0.01, "shaded+good = 7,631 BTU");
// 10 ft ceiling factor: 300*25*1.25 = 9375 ×1.10 = 10312.5 (0 windows)
approx(C.roomLoadBTU(300, 10, 0, "average", "average"), 10312.5, 0.01, "10ft ceiling = 10,312.5 BTU");
isTrue(C.roomLoadBTU(0, 8, 0, "average", "average") === 0, "zero sqft → 0 BTU");

console.log("== 2. ceilTo ==");
isTrue(C.ceilTo(9570, 500) === 10000, "ceil 9,570 → 10,000");
isTrue(C.ceilTo(10000, 500) === 10000, "exact 10,000 stays");
isTrue(C.ceilTo(10001, 500) === 10500, "ceil 10,001 → 10,500");

console.log("== 3. miniSplitRecommend ==");
// Need 10,000 → first standard size ≥ 10,000 is 12,000 → 1.00 ton
let ms = C.miniSplitRecommend(10000, 1);
isTrue(ms.size === 12000 && ms.tons === 1.00, "10,000 BTU → 12k head (1 ton)");
approx(ms.oversize, 0.20, 0.001, "20% headroom over load");
// Need 36,000 → 36k head, 3 tons
ms = C.miniSplitRecommend(36000, 1);
isTrue(ms.size === 36000 && ms.tons === 3, "36,000 BTU → 36k head (3 ton)");
// Need 40,000 → beyond largest single head (size 0), per-zone split across 2 zones
ms = C.miniSplitRecommend(40000, 2);
isTrue(ms.size === 0, "40,000 BTU exceeds largest single head");
isTrue(ms.perZoneSize === 20000, "40,000/2 zones → 20,000 per zone (ceil 500)");
// Non-even split: 35,000 across 2 zones → 17,500 → ceil 500 = 17,500... check
ms = C.miniSplitRecommend(35500, 2);
isTrue(ms.perZoneSize === 18000, "35,500/2 zones = 17,750 → 18,000 per zone");
// Need 5,000 → 9k head
ms = C.miniSplitRecommend(5000, 1);
isTrue(ms.size === 9000 && Math.abs(ms.tons - 0.75) < 0.001, "5,000 BTU → 9k head (0.75 ton)");

console.log("== 4. ductCFM (CFM = BTU ÷ (ΔT × 1.08)) ==");
// 24,000 BTU @ ΔT 20 → 24000/21.6 = 1111.11
approx(C.ductCFM(24000, 20), 1111.11, 0.01, "24k BTU @ 20F = 1,111 CFM");
// 36,000 BTU @ ΔT 25 → 36000/27 = 1333.33
approx(C.ductCFM(36000, 25), 1333.33, 0.01, "36k BTU @ 25F = 1,333 CFM");
// Default ΔT 20 when 0/undefined passed
approx(C.ductCFM(24000, 0), 1111.11, 0.01, "ΔT 0 falls back to 20");

console.log("== 5. baseboardWatts / baseboardPlan (W = BTU ÷ 3.41) ==");
// 10,000 BTU/hr → 10000/3.41 = 2932.55
approx(C.baseboardWatts(10000), 2932.55, 0.01, "10,000 BTU → 2,932.55 W");
// 5,115 BTU (a 1,500 W heater) round-trips to ~1500 W
approx(C.baseboardWatts(5115), 1499.99, 0.02, "5,115 BTU → ~1,500 W");
let bb = C.baseboardPlan(10000, 240);
isTrue(bb.watts === 2933 && bb.linearFt === 12, "plan: 2,933 W → 12 linear ft (ceil 2933/250)");
approx(bb.amps, 12.219, 0.01, "amps 2932.55/240 = 12.22 A @ 240 V");
bb = C.baseboardPlan(10000, 120);
approx(bb.amps, 24.438, 0.01, "amps = 24.44 A @ 120 V");

console.log("== 6. factor tables intact ==");
isTrue(C.SUN_FACTORS.sunny === 1.15 && C.SUN_FACTORS.shaded === 0.90, "sun factors 1.15/0.90");
isTrue(C.INSUL_FACTORS.poor === 1.25 && C.INSUL_FACTORS.good === 0.85, "insulation factors 1.25/0.85");
isTrue(C.MINI_SPLIT_SIZES.join(",") === "9000,12000,15000,18000,24000,30000,36000", "standard head sizes");
isTrue(C.BASE_BTU_SQFT === 25 && C.WINDOW_BTU === 600, "baseline 25 BTU/sqft, 600 BTU/window");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
