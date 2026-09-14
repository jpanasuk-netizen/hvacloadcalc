/* Amazon Associates conversion CTA. Tag live. No income claims. */
(function () {
  "use strict";
  var AMAZON_TAG = "generatorsi0d-20";
  function amzUrl(q) {
    return "https://www.amazon.com/s?k=" + encodeURIComponent(q) +
           "&tag=" + encodeURIComponent(AMAZON_TAG);
  }

  function bandFor(kind, rec) {
    rec = Math.max(500, Math.round(rec || 0));
    if (kind === "minisplit") {
      return { label: "Mini-split class for your BTU",
        q: rec + " btu mini split", alt: "mini split line set kit",
        primary: "Shop this size on Amazon", secondary: "Line-set kits on Amazon" };
    }
    if (kind === "duct") {
      return { label: "Airflow tools for DIY checks",
        q: "vane anemometer", alt: "digital manometer HVAC",
        primary: "Shop anemometers on Amazon", secondary: "Manometers on Amazon" };
    }
    if (kind === "baseboard") {
      return { label: "Baseboard heaters / thermostats",
        q: rec + " watt electric baseboard heater", alt: "line voltage smart thermostat",
        primary: "Shop this wattage on Amazon", secondary: "Smart thermostats on Amazon" };
    }
    return { label: "Window / portable AC for your BTU",
      q: rec + " btu window air conditioner", alt: "portable air conditioner",
      primary: "Shop this size on Amazon", secondary: "Portable ACs on Amazon" };
  }

  function fillSticky(url, label) {
    var bar = document.getElementById("amzSticky");
    if (!bar) return;
    var link = document.getElementById("amzStickyLink");
    if (link) {
      link.href = url;
      link.textContent = label || "Shop on Amazon";
      link.setAttribute("rel", "sponsored nofollow noopener");
      link.target = "_blank";
    }
    bar.hidden = false;
    bar.setAttribute("aria-hidden", "false");
  }
  window.dismissAmzSticky = function () {
    var bar = document.getElementById("amzSticky");
    if (bar) { bar.hidden = true; bar.setAttribute("aria-hidden", "true"); }
    try { sessionStorage.setItem("amzStickyDismissed", "1"); } catch (e) {}
  };
  window.updateMatchedCTA = function (rec, kind) {
    kind = kind || "default";
    var box = document.getElementById("matchedCta");
    var band = bandFor(kind, rec);
    var url = amzUrl(band.q);
    var altUrl = amzUrl(band.alt);
    if (box) {
      box.innerHTML =
        '<p class="small"><b>Matched to your result:</b> ' + band.label + '</p>' +
        '<div class="affil-links" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem">' +
        '<a class="btn-amz btn-amz-primary" rel="sponsored nofollow noopener" target="_blank" href="' +
          url + '">' + band.primary + '</a>' +
        '<a class="btn-amz" rel="sponsored nofollow noopener" target="_blank" href="' +
          altUrl + '">' + band.secondary + '</a>' +
        '</div>';
      box.hidden = false;
    }
    try {
      if (sessionStorage.getItem("amzStickyDismissed") !== "1") fillSticky(url, band.primary);
    } catch (e) { fillSticky(url, band.primary); }
  };
})();
