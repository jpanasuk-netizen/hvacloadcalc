(function(){
var byId=function(id){ return document.getElementById(id); };
var T={room:["tab-btu","rmResult","calcRoomBTU","sqft"],ms:["tab-ms","msResult","calcMiniSplit","sqft"],duct:["tab-duct","dcResult","calcDuct","btu"],bb:["tab-bb","bbResult","calcBaseboard","sqft"]};
var F={room:"sqft:rmSqft ht:rmHt win:rmWin sun:rmSun ins:rmIns use:rmDir",ms:"zones:msZones sqft:msSqft ht:msHt win:msWin sun:msSun ins:msIns",duct:"btu:dcBtu dt:dcDt runs:dcRooms",bb:"sqft:bbSqft ins:bbIns volts:bbV cold:bbCold"};
function pairs(t){ return F[t].split(" ").map(function(s){ return s.split(":"); }); }
function ok(el,raw){
if (el.tagName === "SELECT") return Array.prototype.some.call(el.options,function(o){ return o.value === raw; });
var n=+raw;
if (!isFinite(n) || raw === "") return 0;
if (el.min !== "" && n < +el.min) return 0;
if (el.max !== "" && n > +el.max) return 0;
return 1;
}
function apply(tab,q){
var need=0;
pairs(tab).forEach(function(p){
if (!q.has(p[0])) return;
var el=byId(p[1]);
if (!el || !ok(el,q.get(p[0]))) return;
el.value=q.get(p[0]);
if (p[0] === T[tab][3]) need=1;
});
return need;
}
function write(tab){
var q=new URLSearchParams();
q.set("tab",tab);
pairs(tab).forEach(function(p){ var el=byId(p[1]); if (el && el.value !== "") q.set(p[0],el.value); });
history.replaceState(null,"",location.pathname + "?" + q);
}
function copyText(text,note){
function done(){ note.textContent="Copied"; }
function fb(){
var t=document.createElement("textarea");
t.value=text; t.style.position="fixed"; t.style.left="-9999px";
document.body.appendChild(t); t.select();
try { document.execCommand("copy"); } catch (e){}
t.remove();
}
var c=navigator.clipboard;
if (c && c.writeText) c.writeText(text).then(done,function(){ fb(); done(); });
else { fb(); done(); }
}
function buttons(box){
if (box.querySelector(".result-actions")) return;
var plain=(box.innerText || "").trim(),w=document.createElement("div"),note=document.createElement("span");
w.className="result-actions"; note.className="small";
function add(label,fn){
var b=document.createElement("button");
b.type="button"; b.textContent=label; b.addEventListener("click",fn); w.appendChild(b);
}
add("Copy link to this result",function(){ copyText(location.href,note); });
add("Copy as text",function(){ copyText(plain + "\n" + location.href,note); });
w.appendChild(note); box.appendChild(w);
}
function wrap(tab){
var fn=window[T[tab][2]];
if (typeof fn !== "function") return;
window[T[tab][2]]=function(){
var bad=0,prev=window.alert,box;
window.alert=function(m){ bad=1; return prev.call(window,m); };
try { fn(); } finally { window.alert=prev; }
box=byId(T[tab][1]);
if (bad || !box || box.hidden) return;
write(tab); buttons(box);
};
}
["room","ms","duct","bb"].forEach(wrap);
var q=new URLSearchParams(location.search),tab=q.get("tab");
if (!T[tab] || !apply(tab,q)) return;
if (typeof showTab === "function") showTab(T[tab][0],document.querySelectorAll(".tabs button")[{room:0,ms:1,duct:2,bb:3}[tab]] || null);
window[T[tab][2]]();
})();
