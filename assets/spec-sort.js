/* Click-to-sort for the spec table. Reorders existing rows only. */
(function () {
  "use strict";
  function text(td) { return (td.textContent || "").replace(/\s+/g, " ").trim(); }
  function num(s) {
    var n = parseFloat(String(s).replace(/,/g, ""));
    return isNaN(n) ? null : n;
  }
  document.querySelectorAll("table.sortable").forEach(function (table) {
    var ths = table.querySelectorAll("thead th");
    ths.forEach(function (th, idx) {
      th.addEventListener("click", function () {
        var tbody = table.querySelector("tbody");
        var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
        var dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
        ths.forEach(function (h) { h.removeAttribute("aria-sort"); });
        th.setAttribute("aria-sort", dir);
        var type = th.getAttribute("data-type") || "text";
        rows.sort(function (a, b) {
          var av = text(a.children[idx]);
          var bv = text(b.children[idx]);
          var cmp;
          if (type === "num") {
            var an = num(av);
            var bn = num(bv);
            if (an === null && bn === null) cmp = 0;
            else if (an === null) cmp = 1;
            else if (bn === null) cmp = -1;
            else cmp = an - bn;
          } else {
            cmp = av.localeCompare(bv);
          }
          return dir === "ascending" ? cmp : -cmp;
        });
        rows.forEach(function (row) { tbody.appendChild(row); });
      });
    });
  });
})();
