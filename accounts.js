// accounts.js — pantalla de cuentas: tarjetas/bancos, deudas, metas y presupuesto del mes.
function refreshCuentas() {
var carousel = document.getElementById('cards-carousel');
if (carousel) {
var cardColors = ['gold','dark','blue','dark','gold'];
// Mostrar todas las cuentas sin filtrar por región
var filteredBancos = (DATA.bancos || []);
var banksHTML = filteredBancos.slice(0, 5).map(function(b, i) {
var st = b.esTarjeta ? ccStatus(b) : null;
var amountLine = '';
if (b.esTarjeta) {
if (b.saldoDOP > 0 && b.saldoUSD > 0) {
amountLine = '<div class="bc-amount">' + fmt(b.saldoUSD||0,'USD') + '</div>' +
'<div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:2px">RD$' + Math.round((b.saldoDOP||0)).toLocaleString('es-DO') + '</div>';
} else {
amountLine = '<div class="bc-amount">' + fmt(b.saldoUSD||0,'USD') + '</div>';
}
} else if (b.mon === 'DOP') {
var usdEq = Math.round(toUSD(b.bal||0,'DOP') * 100) / 100;
amountLine = '<div class="bc-amount">RD$' + Math.round(b.bal||0).toLocaleString('es-DO') + '</div>' +
'<div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:2px">≈ ' + fmt(usdEq,'USD') + '</div>';
} else {
amountLine = '<div class="bc-amount">' + fmt(Math.abs(b.bal||0), b.mon) + '</div>';
}
return '<div class="bank-card ' + (cardColors[i%3]) + '" onclick="openSheet(\'edit-banco\','+b.id+')">' +
'<div class="bc-bank">' + (b.nom || b.banco) + '</div>' +
amountLine +
'<div class="bc-label">' + (b.esTarjeta ? (DATA.lang==='en' ? 'Owed' : 'Debes') : t('available_lbl')) + '</div>' +
'<div class="bc-bottom"><span class="bc-type">' + (b.tipo||'Cuenta') + '</span>' +
(b.ultimos ? '<span class="bc-digits">···' + b.ultimos + '</span>' : '') +
'</div>' +
(st ? '<div style="margin-top:6px"><span class="badge ' + st.cls + '" style="font-size:10px">' + st.txt + '</span></div>' : '') +
'</div>';
}).join('');
carousel.innerHTML = banksHTML + '<div style="flex-shrink:0;width:180px;border:1.5px dashed var(--border2);border-radius:var(--r-lg);padding:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;min-height:130px" onclick="openSheet(\'add-banco\')"><div style="font-size:28px;color:var(--t3)">＋</div><div style="font-size:13px;color:var(--t3);font-weight:600">Agregar cuenta</div></div>';
}
var tot = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).reduce(function(a,b){ return a+toUSD(b.bal||0,b.mon); }, 0);
el('accounts-total-sub', 'Total en cuentas: ' + fmt(tot));
el('rate-display', (DATA.tasa || 58.85).toFixed(2));
// Hide rate widget when USA only mode
var rateWidget = document.querySelector('.rate-widget');
if (rateWidget) rateWidget.style.display = DATA.mode === 'us' ? 'none' : '';
var actDeudas = DATA.deudas.filter(function(d){ return d.estado !== 'Pagado'; });
if (actDeudas.length) {
var dh = actDeudas.map(function(d) {
var paid = d.totalPaid || 0;
var orig = d.original || d.bal || 1;
var pct = Math.min(100, Math.round((paid/orig)*100));
return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
'<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
'<span style="font-size:14px;font-weight:600;color:var(--t1)">' + d.nom + '</span>' +
'<span style="font-size:14px;font-weight:700;color:var(--red)">' + fmt(d.bal||0,d.mon) + '</span>' +
'</div>' +
'<div style="font-size:11px;color:var(--t2);margin-bottom:6px">' + d.tipo + (d.fecha?' · Pago: '+d.fecha:'') + '</div>' +
'<div class="prog-wrap"><div class="prog-fill prog-green" style="width:' + pct + '%"></div></div>' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">' +
'<span style="font-size:10px;color:var(--t3)">' + pct + '% pagado</span>' +
'<button onclick="openSheet(\'pagar-deuda\',' + d.id + ')" style="background:var(--gold-dim);border:1px solid var(--gold);color:var(--gold);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">Pagar</button>' +
'</div>' +
'</div>';
}).join('');
elHTML('deudas-list-home', dh);
} else {
elHTML('deudas-list-home', '<div class="empty-state"><div class="empty-icon">💳</div><div class="empty-text">Sin deudas activas</div></div>');
}
if (DATA.metas.length) {
var mh = DATA.metas.map(function(m) {
var pct = m.total > 0 ? Math.min(100, Math.round((m.actual/m.total)*100)) : 0;
return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
'<div style="display:flex;justify-content:space-between;margin-bottom:5px">' +
'<span style="font-size:14px;font-weight:600;color:var(--t1)">' + m.nom + '</span>' +
'<span style="font-size:14px;font-weight:700;color:var(--green)">' + pct + '%</span>' +
'</div>' +
'<div style="font-size:12px;color:var(--t2);margin-bottom:6px">' + fmt(m.actual,m.mon) + ' de ' + fmt(m.total,m.mon) + (m.fecha?' · 📅'+m.fecha:'') + '</div>' +
'<div class="prog-wrap"><div class="prog-fill prog-gold" style="width:' + pct + '%"></div></div>' +
'</div>';
}).join('');
elHTML('metas-list-home', mh);
} else {
elHTML('metas-list-home', '<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-text">Sin metas todavía</div></div>');
}
// Presupuesto
var curPresupuesto = (DATA.presupuesto || []).filter(function(p){ return p.month===cur && p.year===curY; });
if (curPresupuesto.length) {
var ph = curPresupuesto.map(function(p) {
var gastos = (DATA.gastos || []).filter(function(g){ return g.cat===p.cat && g.month===cur && g.year===curY; });
var totalGastos = gastos.reduce(function(a,g){ return a+toUSD(g.monto,g.mon); }, 0);
var pct = p.limite > 0 ? Math.min(100, Math.round((totalGastos/p.limite)*100)) : 0;
var estado = pct > 100 ? 'badge-red' : (pct > 80 ? 'badge-gold' : 'badge-green');
var estadoTxt = pct > 100 ? '⚠️ Excedido' : (pct > 80 ? '🔔 ' + pct + '%' : '✅ Ok');
return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
'<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
'<span style="font-size:14px;font-weight:600;color:var(--t1)">' + p.cat + '</span>' +
'<span class="badge ' + estado + '" style="font-size:10px">' + estadoTxt + '</span>' +
'</div>' +
'<div style="font-size:12px;color:var(--t2);margin-bottom:6px">Presupuesto: ' + fmt(p.limite) + ' · Gastado: ' + fmt(totalGastos) + '</div>' +
'<div class="prog-wrap"><div class="prog-fill ' + (pct > 100 ? 'prog-red' : (pct > 80 ? 'prog-gold' : 'prog-green')) + '" style="width:' + Math.min(100,pct) + '%"></div></div>' +
'</div>';
}).join('');
elHTML('presupuesto-list', ph);
} else {
elHTML('presupuesto-list', '<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">Sin presupuesto establecido</div></div>');
}
}
