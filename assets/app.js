/* HVACLoadCalc calculators — vanilla JS, no dependencies.
   Method: ACCA Manual J-inspired rule-of-thumb sizing (20–30 BTU/sq ft baseline,
   here 25, adjusted for ceiling height, windows, sun, and insulation), then
   10% safety margin. This is a planning tool, NOT a substitute for a full
   ACCA Manual J calculation. All estimates rounded UP to be safe.
   Every compute function is pure — DOM code reads values and calls them. */
"use strict";

var BASE_BTU_SQFT = 25;          // rule-of-thumb midpoint of the 20–30 BTU/sq ft range
var WINDOW_BTU = 600;            // average added cooling load per window
var SAFETY_MARGIN = 1.10;        // 10% equipment safety factor

var SUN_FACTORS   = { shaded: 0.90, average: 1.00, sunny: 1.15 };
var INSUL_FACTORS = { good: 0.85, average: 1.00, poor: 1.25 };
var MINI_SPLIT_SIZES = [9000, 12000, 15000, 18000, 24000, 30000, 36000]; // BTU/hr indoor heads
var BTU_PER_TON = 12000;

/* ---------- pure core calculators ---------- */

// Manual-J-lite room load: sq ft x baseline, adjusted for ceiling height
// (8 ft reference), sun exposure, insulation quality, plus 600 BTU per window.
// Returns unrounded adjusted BTU/hr (cooling).
function roomLoadBTU(sqft, ceilingFt, windows, sun, insulation) {
  var area  = Math.max(0, +sqft  || 0);
  var ht    = Math.max(0, +ceilingFt || 8) || 8;
  var wins  = Math.max(0, +windows || 0);
  var sF    = SUN_FACTORS[sun]   !== undefined ? SUN_FACTORS[sun]   : 1.0;
  var iF    = INSUL_FACTORS[insulation] !== undefined ? INSUL_FACTORS[insulation] : 1.0;
  var shell = area * BASE_BTU_SQFT * (ht / 8) * sF * iF;
  var glass = wins * WINDOW_BTU;
  return (shell + glass) * SAFETY_MARGIN;
}

// Round a BTU requirement up to the nearest 500 (equipment sizing convention).
function ceilTo(n, step) { step = step || 500; return Math.ceil(n / step) * step; }

// Standard mini-split size >= the required BTU, plus tonnage and head count.
function miniSplitRecommend(btusNeeded, zones) {
  var need = Math.max(0, +btusNeeded || 0);
  var z    = Math.max(1, +zones || 1);
  var size = 0;
  for (var i = 0; i < MINI_SPLIT_SIZES.length; i++) {
    if (MINI_SPLIT_SIZES[i] >= need) { size = MINI_SPLIT_SIZES[i]; break; }
  }
  var perZone = z > 0 ? need / z : need;
  return {
    size: size,                                    // 0 if above largest single head
    perZoneSize: ceilTo(perZone, 500),
    tons: size ? +(size / BTU_PER_TON).toFixed(2) : 0,
    zones: z,
    oversize: size ? (size / need - 1) : 0
  };
}

// Duct airflow: CFM = BTU/hr / (deltaT x 1.08). Classic sensible-heat formula.
function ductCFM(btusPerHour, deltaT) {
  var b = Math.max(0, +btusPerHour || 0);
  var d = Math.max(1, +deltaT || 20);
  return b / (d * 1.08);
}

// Electric baseboard: W = BTU/hr / 3.41 (1 W = 3.412 BTU/hr).
function baseboardWatts(btusPerHour) {
  var b = Math.max(0, +btusPerHour || 0);
  return b / 3.41;
}

// Whole-house baseboard: rooms each sized, watts per room, circuit amps at 240 V.
function baseboardPlan(btusPerHour, volts) {
  var watts = baseboardWatts(btusPerHour);
  var v = Math.max(0, +volts || 240);
  return {
    watts: Math.ceil(watts),
    amps: watts / v,
    linearFt: Math.ceil(watts / 250)   // ~250 W per linear ft of standard baseboard
  };
}

/* ---------- DOM helpers ---------- */
function el(id){ return document.getElementById(id); }
function fmt(n){ return Math.round(n).toLocaleString("en-US"); }

/* ---------- Tabs ---------- */
function showTab(key, btn){
  document.querySelectorAll(".panel").forEach(function(p){ p.classList.remove("active"); });
  document.querySelectorAll(".tabs button").forEach(function(b){ b.setAttribute("aria-selected","false"); });
  el(key).classList.add("active");
  if(btn) btn.setAttribute("aria-selected","true");
}

/* ---------- 1. Room BTU (Manual-J-lite) ---------- */
function calcRoomBTU(){
  var sqft  = parseFloat(el("rmSqft").value);
  var ht    = parseFloat(el("rmHt").value) || 8;
  var wins  = parseInt(el("rmWin").value, 10) || 0;
  var sun   = el("rmSun").value;
  var ins   = el("rmIns").value;
  var dir   = el("rmDir").value;
  if(!sqft || sqft <= 0){ alert("Enter the room's square footage."); return; }

  var raw   = roomLoadBTU(sqft, ht, wins, sun, ins);
  var btu   = ceilTo(raw, 500);
  var tons  = (btu / BTU_PER_TON).toFixed(1);

  var html = '<div class="big">'+fmt(btu)+' <span class="unit">BTU/hr cooling</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+tons+' ton</b><span>Equivalent cooling capacity</span></div>'+
      '<div class="stat"><b>'+Math.round(raw/sqft)+'</b><span>BTU/hr per sq ft (rule-of-thumb range: 20–30)</span></div>'+
      '<div class="stat"><b>'+fmt(raw)+'</b><span>Raw load before rounding up to 500</span></div>'+
      '<div class="stat"><b>'+ht+' ft</b><span>Ceiling height ('+(ht/8).toFixed(2)+'× factor vs 8 ft)</span></div>'+
    '</div>'+
    '<p class="note">Rule-of-thumb baseline of '+BASE_BTU_SQFT+' BTU/sq ft adjusted for sun ('+sun+': ×'+SUN_FACTORS[sun]+'), insulation ('+ins+': ×'+INSUL_FACTORS[ins]+'), '+wins+' window(s) at +'+WINDOW_BTU+' BTU each, plus a 10% safety margin. <strong>This is not a full ACCA Manual J — it is a planning estimate.</strong> For final equipment selection in extreme climates or homes with unusual envelope conditions, have a contractor run Manual J (ACCA-approved software).</p>';
  var box = el("rmResult"); box.hidden = false; box.innerHTML = html;
  if (window.updateMatchedCTA) window.updateMatchedCTA(btu, 'room');
}

/* ---------- 2. Mini-split sizing ---------- */
function calcMiniSplit(){
  var zones = parseInt(el("msZones").value, 10) || 1;
  var sqft  = parseFloat(el("msSqft").value);
  var ht    = parseFloat(el("msHt").value) || 8;
  var wins  = parseInt(el("msWin").value, 10) || 0;
  var sun   = el("msSun").value;
  var ins   = el("msIns").value;
  if(!sqft || sqft <= 0){ alert("Enter the total square footage."); return; }

  var raw   = roomLoadBTU(sqft, ht, wins, sun, ins);
  var need  = ceilTo(raw, 500);
  var rec   = miniSplitRecommend(need, zones);

  var headTxt = rec.size
    ? 'One <strong>'+(rec.size/1000)+'k BTU</strong> indoor head' + (zones > 1 ? ' per zone average ('+fmt(rec.perZoneSize)+' BTU/hr each)' : '')
    : 'Your load exceeds a single head — use <strong>'+zones+' zone(s)</strong>, roughly <strong>'+fmt(rec.perZoneSize)+' BTU/hr each</strong>, or step up to a multi-zone condenser.';

  var html = '<div class="big">'+(rec.size ? (rec.size/1000)+'k BTU' : 'Multi-zone')+' <span class="unit">mini-split needed</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+rec.tons+' ton</b><span>Condenser capacity ('+fmt(need)+' BTU/hr required)</span></div>'+
      '<div class="stat"><b>'+zones+'</b><span>Zone(s) / indoor head(s)</span></div>'+
      '<div class="stat"><b>'+fmt(rec.perZoneSize)+'</b><span>BTU/hr per zone (rounded up to 500)</span></div>'+
      '<div class="stat"><b>'+(rec.oversize * 100).toFixed(0)+'%</b><span>Headroom above calculated load</span></div>'+
    '</div>'+
    '<p class="note">'+headTxt+'. Don\'t oversize: an inverter mini-split modulates, but a unit more than ~30% above load short-cycles, dehumidifies poorly, and wastes money. Standard head sizes: 9k, 12k, 15k, 18k, 24k, 30k, 36k BTU. <strong>Planning estimate only — not a substitute for a Manual J report.</strong></p>';
  var box = el("msResult"); box.hidden = false; box.innerHTML = html;
  if (window.updateMatchedCTA) window.updateMatchedCTA(rec.size || need, 'minisplit');
}

/* ---------- 3. Duct CFM ---------- */
function calcDuct(){
  var btu   = parseFloat(el("dcBtu").value);
  var dt    = parseFloat(el("dcDt").value) || 20;
  if(!btu || btu <= 0){ alert("Enter the equipment BTU/hr rating."); return; }
  var cfm   = ductCFM(btu, dt);
  var perRoom = parseInt(el("dcRooms").value, 10) || 1;

  var html = '<div class="big">'+fmt(cfm)+' <span class="unit">CFM total airflow</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+Math.round(cfm/perRoom)+'</b><span>CFM per room ('+perRoom+' supplies)</span></div>'+
      '<div class="stat"><b>'+dt+'°F</b><span>Supply-to-return temperature split (ΔT)</span></div>'+
      '<div class="stat"><b>'+(btu/BTU_PER_TON).toFixed(1)+' ton</b><span>Equipment size — rule of thumb: ~400 CFM per ton</span></div>'+
      '<div class="stat"><b>'+fmt(cfm/BTU_PER_TON > 0 ? cfm/(btu/BTU_PER_TON) : 0)+'</b><span>CFM per ton — check against 350–450 design range</span></div>'+
    '</div>'+
    '<p class="note">Formula: CFM = BTU/hr ÷ (ΔT × 1.08), the standard sensible-heat airflow equation. A ΔT of 20°F is typical for cooling; heat pumps often run 20–25°F, gas furnaces 40–60°F. Trunk and branch ducts also need friction-rate sizing — this number is the starting point, not the duct diameter. <strong>Estimate only — not a substitute for ACCA Manual D duct design.</strong></p>';
  var box = el("dcResult"); box.hidden = false; box.innerHTML = html;
  if (window.updateMatchedCTA) window.updateMatchedCTA(1, 'duct');
}

/* ---------- 4. Electric baseboard ---------- */
function calcBaseboard(){
  var sqft = parseFloat(el("bbSqft").value);
  var ins  = el("bbIns").value;
  var v    = parseFloat(el("bbV").value) || 240;
  var cold = el("bbCold").value === "yes";
  if(!sqft || sqft <= 0){ alert("Enter the room's square footage."); return; }

  // Rule of thumb: ~10 W/sq ft, adjusted like the BTU tab (1 W ≈ 3.41 BTU/hr)
  var btu  = ceilTo(roomLoadBTU(sqft, 8, Math.round(sqft/100), "average", ins) * (cold ? 1.1 : 1.0), 500);
  var plan = baseboardPlan(btu, v);
  var wpsf = (plan.watts / sqft);

  var html = '<div class="big">'+fmt(plan.watts)+' <span class="unit">watts of baseboard heat</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+wpsf.toFixed(1)+' W/sq ft</b><span>Rule-of-thumb range: 7–10 W per sq ft</span></div>'+
      '<div class="stat"><b>'+plan.linearFt+' ft</b><span>Total baseboard length (~250 W per linear ft)</span></div>'+
      '<div class="stat"><b>'+plan.amps.toFixed(1)+' A</b><span>Circuit load at '+v+' V (use a breaker ≥ 125% of this)</span></div>'+
      '<div class="stat"><b>'+fmt(btu)+'</b><span>BTU/hr equivalent (÷ 3.41 = watts)</span></div>'+
    '</div>'+
    '<p class="note">Formula: watts = BTU/hr ÷ 3.41. Install along exterior walls, under windows where possible, and never under towel bars or outlets. Circuit sizing and wiring are electrician territory — <strong>this wattage is a planning estimate, not a substitute for a heat-loss calculation or load calculation (NEC Article 220).</strong></p>';
  var box = el("bbResult"); box.hidden = false; box.innerHTML = html;
  if (window.updateMatchedCTA) window.updateMatchedCTA(plan.watts, 'baseboard');
}

/* ---------- node export for smoke tests ---------- */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { roomLoadBTU: roomLoadBTU, ceilTo: ceilTo, miniSplitRecommend: miniSplitRecommend,
                     ductCFM: ductCFM, baseboardWatts: baseboardWatts, baseboardPlan: baseboardPlan,
                     BASE_BTU_SQFT: BASE_BTU_SQFT, WINDOW_BTU: WINDOW_BTU,
                     SUN_FACTORS: SUN_FACTORS, INSUL_FACTORS: INSUL_FACTORS, MINI_SPLIT_SIZES: MINI_SPLIT_SIZES };
}
