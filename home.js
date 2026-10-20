// home.js — pantalla de inicio de GestorRD: saldo, navegación del mes, score, logros,
// próximos pagos y últimas transacciones. Lee DATA (store.js) y cálculos (calc.js).
function scrollToScore() { var e=document.getElementById('score-section'); if(e) e.scrollIntoView({behavior:'smooth'}); }
function chM(d) {
DATA.curMonth += d;
if (DATA.curMonth > 11) { DATA.curMonth = 0; DATA.curYear++; }
if (DATA.curMonth < 0) { DATA.curMonth = 11; DATA.curYear--; }
refreshHome();
}
function refreshHome() {
var cur = DATA.curMonth, curY = DATA.curYear;
var curIngs = DATA.ingresos.filter(function(x){ return x.month===cur && x.year===curY; });
var curGas = DATA.gastos.filter(function(x){ return x.month===cur && x.year===curY; });
var prev = cur===0?11:cur-1, prevY = cur===0?curY-1:curY;
var prevGas = DATA.gastos.filter(function(x){ return x.month===prev && x.year===prevY; });
var tI = curIngs.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = curGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tAh = DATA.ahorros.reduce(function(a,x){ return a+toUSD(x.actual,x.mon); }, 0);
var tBan = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).reduce(function(a,b){ return a+toUSD(b.bal||0,b.mon); }, 0);
var tPG = prevGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var avail = tI - tG;
var hasIncome = tI > 0;
var hasGastos = tG > 0;
var availDisplay;
var noIncomeHint = false;
if (hasIncome) {
availDisplay = Math.max(0, avail);
} else if (tBan > 0) {
availDisplay = tBan;
} else {
availDisplay = -tG;
noIncomeHint = tG > 0;
}
var bancos = DATA.bancos || [];
var banUSA = bancos.filter(function(b){ return !b.esTarjeta && b.pais === 'US'; });
var banRD = bancos.filter(function(b){ return !b.esTarjeta && b.pais !== 'US'; });
var totalUSA_USD = banUSA.reduce(function(a,b){ return a + toUSD(b.bal||0, b.mon); }, 0);
var totalRD_USD = banRD.reduce(function(a,b){ return a + toUSD(b.bal||0, b.mon); }, 0);
var totalRD_DOP = banRD.reduce(function(a,b){ return a + (b.mon==='DOP' ? (b.bal||0) : (b.bal||0)*DATA.tasa); }, 0);
var splitEl = document.getElementById('bal-split');
var balAmtEl = document.getElementById('bal-amount');
if (banUSA.length > 0 && banRD.length > 0) {
if (splitEl) splitEl.style.display = 'flex';
if (balAmtEl) balAmtEl.style.display = 'none';
var e1 = document.getElementById('bal-usd-us'); if (e1) e1.textContent = fmt(totalUSA_USD, 'USD');
var e2 = document.getElementById('bal-usd-rd'); if (e2) e2.textContent = fmt(totalRD_USD, 'USD');
var e3 = document.getElementById('bal-dop-rd'); if (e3) e3.textContent = 'RD$' + Math.round(totalRD_DOP).toLocaleString('es-DO');
} else {
if (splitEl) splitEl.style.display = 'none';
if (balAmtEl) balAmtEl.style.display = '';
}
el('mnl', MONTHS[cur] + ' ' + curY);
var h = new Date().getHours();
var greet = h < 12 ? t('greeting_morning') : h < 18 ? t('greeting_afternoon') : t('greeting_evening');
el('home-greeting', greet);
// Update balance label with current language
var balLabelEl = document.getElementById('balance-label-txt');
if (balLabelEl) balLabelEl.textContent = t('available');
el('home-name', (DATA.userName && !isGuestMode) ? DATA.userName + ' 👋' : '👋');
el('bal-amount', fmtSigned(availDisplay));
if (balAmtEl) balAmtEl.style.color = availDisplay < 0 ? 'var(--red)' : '';
var chgPct = tPG > 0 ? ((tG - tPG) / tPG * 100) : null;
var chgEl = document.getElementById('bal-change');
if (chgEl) {
if (chgPct !== null) {
var sign = chgPct > 0 ? '▲' : '▼';
var isUp = chgPct > 0;
chgEl.textContent = sign + ' ' + Math.abs(chgPct).toFixed(1) + '% en gastos vs mes anterior';
chgEl.className = 'balance-change ' + (isUp ? 'down' : 'up');
} else {
chgEl.textContent = '— primer mes registrado';
chgEl.className = 'balance-change';
}
}
if (noIncomeHint && chgEl) { chgEl.textContent = 'Registra tu ingreso para ver tu disponible'; chgEl.className = 'balance-change'; }
var base = Math.max(tI, tG, 1);
var pAvail = Math.round((Math.max(0, tI - tG) / base) * 100);
var pGas = Math.round((tG / base) * 100);
var pSav = Math.round((tAh / base) * 100);
pAvail = Math.min(pAvail, 100);
pGas = Math.min(pGas, 100 - pAvail);
var dAvail = document.getElementById('donut-avail');
var dGas = document.getElementById('donut-gas');
var dSav = document.getElementById('donut-sav');
if (dAvail) dAvail.setAttribute('stroke-dasharray', pAvail + ' ' + (100-pAvail));
if (dGas) {
dGas.setAttribute('stroke-dasharray', pGas + ' ' + (100-pGas));
dGas.style.transform = 'rotate(' + (pAvail * 3.6) + 'deg)';
dGas.style.transformOrigin = 'center';
}
if (dSav) {
dSav.setAttribute('stroke-dasharray', Math.min(pSav, 100-pAvail-pGas) + ' 100');
dSav.style.transform = 'rotate(' + ((pAvail + pGas) * 3.6) + 'deg)';
dSav.style.transformOrigin = 'center';
}
el('donut-pct', pAvail + '%');
el('leg-avail', fmt(Math.max(0, tI - tG)));
el('leg-gas', fmt(tG));
el('leg-sav', fmt(tAh));
var nw = NETWORTH.run();
var nwEl = document.getElementById('home-networth');
if (nwEl) { nwEl.textContent = fmtSigned(nw.patri); nwEl.style.color = nw.patri >= 0 ? 'var(--t1)' : 'var(--red)'; }
var nwChgEl = document.getElementById('home-networth-chg');
if (nwChgEl) {
if (typeof nw.prevPatri === 'number' && nw.prevPatri !== 0) {
var diff = nw.patri - nw.prevPatri;
var pct = Math.round(Math.abs(diff) / Math.abs(nw.prevPatri) * 100);
nwChgEl.textContent = (diff >= 0 ? '↑ +' : '↓ −') + pct + '% respecto al mes pasado';
nwChgEl.style.color = diff >= 0 ? 'var(--green)' : 'var(--red)';
} else if (typeof nw.prevPatri === 'number') {
var diff2 = nw.patri - nw.prevPatri;
nwChgEl.textContent = (diff2 >= 0 ? '↑ +' : '↓ ') + fmt(Math.abs(diff2)) + ' vs mes ant.';
nwChgEl.style.color = diff2 >= 0 ? 'var(--green)' : 'var(--red)';
} else {
nwChgEl.textContent = '— sin historial previo';
nwChgEl.style.color = 'var(--t3)';
}
}
var pred = PREDICT.run();
var predEl = document.getElementById('home-predict');
if (predEl) { predEl.textContent = fmt(pred.projectedAvail); predEl.style.color = pred.projectedAvail >= 0 ? 'var(--t1)' : 'var(--red)'; }
var predSubEl = document.getElementById('home-predict-sub');
if (predSubEl) {
if (!pred.isCurrentMonth) predSubEl.textContent = 'Mes cerrado';
else if (pred.overBudgetRisk) { predSubEl.textContent = '⚠️ riesgo de exceder presupuesto'; predSubEl.style.color = 'var(--red)'; }
else { predSubEl.textContent = pred.daysLeft + ' días restantes'; predSubEl.style.color = 'var(--t3)'; }
}
var ai = AI.run();
var insightsHTML = ai.insights.map(function(i) {
return '<div class="ai-insight"><span class="ai-dot">·</span><span>' + i + '</span></div>';
}).join('');
elHTML('ai-insights', insightsHTML);
if (ai.canSpend > 0) {
show('ai-can-spend');
el('ai-can-amount', fmt(ai.canSpend));
} else {
hide('ai-can-spend');
}
var sc = SCORE.run();
el('score-num', sc.total);
el('home-score-mini', sc.total);
var sbEl = document.getElementById('score-badge');
if (sbEl) sbEl.innerHTML = '<span class="badge ' + sc.badgeClass + '">' + sc.label + '</span>';
var factorsHTML = sc.factors.map(function(f) {
var pct = Math.round((f.pts / f.max) * 100);
var color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--gold)' : 'var(--red)';
return '<div class="score-factor">' +
'<span style="font-size:16px">' + f.emoji + '</span>' +
'<span class="score-factor-name">' + f.name + '</span>' +
'<div style="flex:1;background:var(--bg3);border-radius:3px;height:4px;overflow:hidden">' +
'<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:3px;transition:width .5s ease"></div>' +
'</div>' +
'<span class="score-factor-pts" style="color:' + color + '">' + f.pts + '/' + f.max + '</span>' +
'</div>';
}).join('');
elHTML('score-factors', factorsHTML);
var upcoming = [];
var today = new Date();
DATA.deudas.forEach(function(d) {
if (d.estado === 'Pagado') return;
var dateStr = d.fecha || d.dftc || d.dfp || d.dfpe || d.dfo;
if (!dateStr) return;
var due = new Date(dateStr + 'T12:00:00');
var days = Math.round((due - today) / 86400000);
if (days >= -3 && days <= 30) {
upcoming.push({ name: d.nom, days: days, amount: d.bal || d.saldo || 0, mon: d.mon });
}
});
upcoming.sort(function(a,b){ return a.days - b.days; });
if (upcoming.length > 0) {
var ph = upcoming.slice(0, 5).map(function(p) {
var cls2 = p.days <= 3 ? 'urgent' : p.days <= 7 ? 'warn' : 'ok';
var dotColor = p.days <= 3 ? 'var(--red)' : p.days <= 7 ? 'var(--gold)' : 'var(--green)';
var daysLabel = p.days < 0 ? 'Vencido' : p.days === 0 ? 'Hoy' : p.days + ' días';
return '<div class="payment-item">' +
'<div class="payment-dot" style="background:' + dotColor + '"></div>' +
'<div class="payment-name">' + p.name + '</div>' +
'<div class="payment-days ' + cls2 + '">' + daysLabel + '</div>' +
'<div class="payment-amount">' + fmt(p.amount, p.mon) + '</div>' +
'</div>';
}).join('');
elHTML('payments-list', ph);
} else {
elHTML('payments-list', '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">Sin pagos próximos</div></div>');
}
var allTx = [];
(DATA.ingresos||[]).forEach(function(x) { allTx.push({ tipo:'ingreso', label:x.fuente||x.desc||'Ingreso', sub:x.fecha||'', amount:x.monto, mon:x.mon, fecha:x.fecha||'' }); });
(DATA.gastos||[]).forEach(function(x) { allTx.push({ tipo:'gasto', label:x.cat||'Gasto', sub:x.desc||x.fecha||'', amount:x.monto, mon:x.mon, fecha:x.fecha||'' }); });
allTx.sort(function(a,b){ return b.fecha.localeCompare(a.fecha); });
var recent = allTx.slice(0, 8);
if (recent.length) {
var hh = recent.map(function(t) {
var icon = t.tipo === 'ingreso' ? '💵' : getCatIcon(t.label);
var amtCls = t.tipo === 'ingreso' ? 'amount-pos' : 'amount-neg';
var sign = t.tipo === 'ingreso' ? '+' : '-';
return '<div class="list-item">' +
'<div class="list-item-left">' +
'<div class="list-item-icon">' + icon + '</div>' +
'<div><div class="list-item-title">' + t.label + '</div><div class="list-item-sub">' + t.sub + '</div></div>' +
'</div>' +
'<div class="list-item-amount ' + amtCls + '">' + sign + fmt(t.amount, t.mon) + '</div>' +
'</div>';
}).join('');
elHTML('home-history', hh);
} else {
elHTML('home-history', '<div class="empty-state"><div class="empty-icon">📒</div><div class="empty-text">Sin transacciones registradas</div></div>');
}
updLogros();
animateCounters();
}
function getBankLogo(banco) {
  var bl = (banco||'').toLowerCase();
  if (bl.match(/popular|scotiabank|bpr|scotia|bsi|banco scotia/)) return '🏛️';
  if (bl.match(/bdi|dominicano|industrial/)) return '🏦';
  if (bl.match(/mercantil|merc/)) return '💼';
  if (bl.match(/bhd|leon|bhd leon/)) return '🏢';
  if (bl.match(/inter|intercredit/)) return '💳';
  if (bl.match(/tarjeta|credit|visa|mastercard|amex/)) return '💳';
  return '🏦';
}

function getCatIcon(cat) {
var icons = {
'🏠 Vivienda/Alquiler':'🏠','💡 Electricidad':'💡','💧 Agua':'💧','🔥 Gas':'🔥',
'📡 Internet/Cable':'📡','🚗 Gasolina':'🚗','🚌 Transporte público':'🚌','🚕 Taxi/Uber':'🚕',
'🍔 Comida rápida':'🍔','🛒 Supermercado':'🛒','🍽️ Restaurantes':'🍽️','☕ Café/Bebidas':'☕',
'💊 Farmacia':'💊','🏥 Médico':'🏥','👕 Ropa/Zapatos':'👕','🎁 Regalos':'🎁',
'🎮 Entretenimiento':'🎮','📱 Suscripciones':'📱','🏋️ Gimnasio':'🏋️','🎓 Educación':'🎓',
'💳 Deuda/Préstamo':'💳','💼 Negocio':'💼','👶 Niños/Familia':'👶','🐾 Mascotas':'🐾'
};
for (var k in icons) if (cat && cat.includes(k.split(' ')[1])) return icons[k];
return '💸';
}

function animateCounter(elementId, targetValue, prefix, decimals, duration) {
prefix = prefix || '';
decimals = decimals === undefined ? 2 : decimals;
duration = duration || 800;
var el2 = document.getElementById(elementId);
if (!el2) return;
var start = null;
var startVal = 0;
function step(ts) {
if (!start) start = ts;
var progress = Math.min((ts - start) / duration, 1);
var ease = 1 - Math.pow(1 - progress, 3);
var current = startVal + (targetValue - startVal) * ease;
el2.textContent = prefix + current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
if (progress < 1) requestAnimationFrame(step);
}
requestAnimationFrame(step);
}
function updLogros() {
var card = document.getElementById('logros-card');
var list = document.getElementById('logros-list');
if (!card || !list) return;
var cur = DATA.curMonth, curY = DATA.curYear;
var gastos = DATA.gastos || [];
var ingresos = DATA.ingresos || [];
var curG = gastos.filter(function(x){ return x.month===cur && x.year===curY; });
var curI = ingresos.filter(function(x){ return x.month===cur && x.year===curY; });
var tI = curI.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = curG.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var totalGastos = gastos.length;
var totalIngs = ingresos.length;
var numBancos = (DATA.bancos||[]).length;
var numMetas = (DATA.metas||[]).length;
var numDeudas = (DATA.deudas||[]).filter(function(d){ return d.estado!=='Pagado'; }).length;
var numPresup = (DATA.presupuesto||[]).length;
var metasComp = (DATA.metas||[]).filter(function(m){ return (m.actual||0) >= (m.total||1) && m.total > 0; }).length;
var sc = SCORE.run();
var rachaGastos = 0;
for (var mm = cur; mm >= 0; mm--) {
if (gastos.some(function(g){ return g.month===mm && g.year===curY; })) rachaGastos++; else break;
}
var LOGROS = [
{ icon:'💸', title:'Primer gasto', desc:'Registraste tu primer movimiento', earned: totalGastos >= 1, color:'#e74c3c' },
{ icon:'💵', title:'Primer ingreso', desc:'Ingreso registrado', earned: totalIngs >= 1, color:'#27ae60' },
{ icon:'🏦', title:'Conectado', desc:'Cuenta bancaria agregada', earned: numBancos >= 1, color:'#2980b9' },
{ icon:'🎯', title:'Soñador', desc:'Primera meta de ahorro creada', earned: numMetas >= 1, color:'#8e44ad' },
{ icon:'🏆', title:'Meta cumplida', desc:'Alcanzaste una meta de ahorro', earned: metasComp >= 1, color:'#f39c12' },
{ icon:'📊', title:'Organizado', desc:'Presupuesto mensual definido', earned: numPresup >= 1, color:'#16a085' },
{ icon:'🕊️', title:'Sin deudas', desc:'Sin deudas activas registradas', earned: totalGastos > 0 && numDeudas === 0, color:'#1abc9c' },
{ icon:'⭐', title:'Score saludable', desc:'Score financiero de 70 o más', earned: sc.total >= 70, color:'#f1c40f' },
{ icon:'🔥', title:'En racha', desc:'3 meses consecutivos registrando', earned: rachaGastos >= 3, color:'#e67e22' },
{ icon:'📋', title:'Disciplinado', desc:'Más de 10 gastos registrados', earned: totalGastos >= 10, color:'#3498db' },
{ icon:'💎', title:'Élite financiero', desc:'Score de 90 puntos o más', earned: sc.total >= 90, color:'#9b59b6' },
{ icon:'🐷', title:'Ahorrador', desc:'Gastaste menos de lo que ganaste', earned: tI > 0 && tG < tI, color:'#e91e63' },
];
var earned = LOGROS.filter(function(l){ return l.earned; });
var locked = LOGROS.filter(function(l){ return !l.earned; });
if (earned.length === 0) { card.style.display = 'none'; return; }
card.style.display = 'block';
var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">';
html += earned.map(function(l) {
return '<div style="background:var(--bg3);border-radius:16px;padding:14px 8px;text-align:center;border:1px solid var(--border)">' +
'<div style="width:48px;height:48px;border-radius:50%;background:' + l.color + '22;border:2px solid ' + l.color + '55;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 8px">' + l.icon + '</div>' +
'<div style="font-size:11px;font-weight:700;color:var(--t1);line-height:1.3;margin-bottom:3px">' + l.title + '</div>' +
'<div style="font-size:10px;color:var(--t3);line-height:1.3">' + l.desc + '</div>' +
'</div>';
}).join('');
html += '</div>';
if (locked.length > 0) {
html += '<div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px">Próximos</div>';
html += '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">';
html += locked.slice(0, 4).map(function(l) {
return '<div style="flex-shrink:0;background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 12px;text-align:center;min-width:90px;opacity:0.5;filter:grayscale(1)">' +
'<div style="font-size:22px;margin-bottom:4px">' + l.icon + '</div>' +
'<div style="font-size:10px;font-weight:700;color:var(--t3)">' + l.title + '</div>' +
'</div>';
}).join('');
html += '</div>';
}
list.innerHTML = html;
}
function animateCounters() {
setTimeout(function() {
var cur = DATA.curMonth, curY = DATA.curYear;
var curIngs = (DATA.ingresos || []).filter(function(x){ return x.month===cur && x.year===curY; });
var curGas = (DATA.gastos || []).filter(function(x){ return x.month===cur && x.year===curY; });
var tI = curIngs.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = curGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tBan = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).reduce(function(a,b){ return a+toUSD(b.bal||0,b.mon); }, 0);
var displayVal = tI > 0 ? Math.max(0, tI - tG) : (tBan > 0 ? tBan : 0);
// bal-amount lo escribe refreshHome() (puede ser negativo); no animar aquí
animateCounter('sum-ingresos', tI, '$');
animateCounter('sum-gastos', tG, '$');
animateCounter('sum-ahorro', Math.max(0, tI - tG), '$');
var score = parseInt(document.getElementById('score-num') && document.getElementById('score-num').textContent) || 0;
animateCounter('score-num', score, '', 0);
}, 80);
}
