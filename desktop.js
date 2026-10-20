// desktop.js — barra lateral y resumen para la versión de escritorio.
function initDesktopSidebar() {
if (window.innerWidth < 900) return;
var dsb = document.getElementById('dsb-user');
if (dsb) dsb.textContent = currentUser ? currentUser.email : (DATA.userName || 'Sin sesión');
switchTabDesktop('screen-home');
updateDesktopSummary();
}
function switchTabDesktop(screenId) {
var map = { 'screen-home': 0, 'screen-cuentas': 1, 'screen-reportes': 2, 'screen-perfil': 3 };
var tab = map[screenId];
if (tab !== undefined) {
var tabs = document.querySelectorAll('.nb');
if (tabs[tab]) tabs[tab].click();
}
var ids = { 'screen-home':'dsb-home','screen-cuentas':'dsb-cuentas','screen-reportes':'dsb-reportes','screen-perfil':'dsb-perfil' };
document.querySelectorAll('.dsb-nav').forEach(function(b){ b.classList.remove('active'); });
var activeBtn = document.getElementById(ids[screenId]);
if (activeBtn) activeBtn.classList.add('active');
updateDesktopSummary();
}
function updateDesktopSummary() {
var el2 = document.getElementById('dsb-summary');
if (!el2 || window.innerWidth < 900) return;
var cur = DATA.curMonth, curY = DATA.curYear;
var tI = (DATA.ingresos||[]).filter(function(x){ return x.month===cur && x.year===curY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = (DATA.gastos||[]).filter(function(x){ return x.month===cur && x.year===curY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var net = tI - tG;
var scoreEl = document.getElementById("score-num"); var score = scoreEl ? (parseInt(scoreEl.textContent) || 58) : 58;
var cats = {};
(DATA.gastos||[]).filter(function(x){ return x.month===cur && x.year===curY; }).forEach(function(g){ cats[g.cat||'Otros']=(cats[g.cat||'Otros']||0)+toUSD(g.monto,g.mon); });
var topCats = Object.keys(cats).sort(function(a,b){ return cats[b]-cats[a]; }).slice(0,3);
el2.innerHTML =
'<div style="margin-bottom:16px">' +
'<div style="font-size:11px;color:var(--t3);margin-bottom:4px">' + MONTHS[cur] + ' ' + curY + '</div>' +
'<div style="display:flex;gap:8px;margin-bottom:8px">' +
'<div style="flex:1;background:var(--green-bg);border-radius:8px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--green);font-weight:700">INGRESOS</div><div style="font-size:14px;font-weight:800;color:var(--green)">' + fmt(tI) + '</div></div>' +
'<div style="flex:1;background:var(--red-bg);border-radius:8px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--red);font-weight:700">GASTOS</div><div style="font-size:14px;font-weight:800;color:var(--red)">' + fmt(tG) + '</div></div>' +
'</div>' +
'<div style="background:var(--gold-dim);border:1px solid rgba(201,169,110,0.2);border-radius:8px;padding:10px;text-align:center">' +
'<div style="font-size:10px;color:var(--gold);font-weight:700">DISPONIBLE</div>' +
'<div style="font-size:18px;font-weight:900;color:var(--gold)">' + fmt(Math.max(0,net)) + '</div>' +
'</div>' +
'</div>' +
'<div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px">Score</div>' +
'<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
'<div style="font-size:28px;font-weight:900;color:var(--t1)">' + score + '</div>' +
'<div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="width:' + score + '%;height:100%;background:var(--green);border-radius:3px"></div></div>' +
'</div>' +
(topCats.length ? '<div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px">Top gastos</div>' +
topCats.map(function(c){
var pct = tG > 0 ? Math.round(cats[c]/tG*100) : 0;
return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="color:var(--t2)">' + c.split(' ').slice(1).join(' ') + '</span><span style="color:var(--t1);font-weight:700">' + pct + '%</span></div><div style="height:4px;background:var(--bg3);border-radius:2px"><div style="width:' + pct + '%;height:100%;background:var(--gold);border-radius:2px"></div></div></div>';
}).join('') : '<div style="color:var(--t3);font-size:12px">Sin gastos este mes</div>');
}
