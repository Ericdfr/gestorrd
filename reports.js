// reports.js — pantalla de reportes de GestorRD: comparaciones, patrimonio, gráficos,
// categorías y exportación a PDF. Lee DATA (store.js) y cálculos (calc.js).
var reportPeriod = 'mes';
function setPeriod(p) {
reportPeriod = p;
document.querySelectorAll('.period-tab').forEach(function(b) {
b.classList.toggle('active', b.getAttribute('onclick').indexOf("'" + p + "'") >= 0);
});
refreshReportes();
}
function updComparacion() {
var el2 = document.getElementById('comp-card');
if (!el2) return;
var cur = DATA.curMonth, curY = DATA.curYear;
var months = reportPeriod === 'año' ? 12 : reportPeriod === '3m' ? 3 : 1;
var label = reportPeriod === 'año' ? 'Últimos 12 meses' : reportPeriod === '3m' ? 'Últimos 3 meses' : null;
if (months === 1) {
var prev = cur === 0 ? 11 : cur - 1, prevY = cur === 0 ? curY - 1 : curY;
var curI = DATA.ingresos.filter(function(x){ return x.month===cur && x.year===curY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var curG = DATA.gastos.filter(function(x){ return x.month===cur && x.year===curY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var prevI = DATA.ingresos.filter(function(x){ return x.month===prev && x.year===prevY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var prevG = DATA.gastos.filter(function(x){ return x.month===prev && x.year===prevY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
function diffBadge(curV, prevV) {
if (!prevV) return '';
var pct = Math.round((curV - prevV) / prevV * 100);
var arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '—';
var color = pct > 0 ? 'var(--red)' : pct < 0 ? 'var(--green)' : 'var(--t3)';
return '<span style="font-size:11px;color:' + color + ';margin-left:6px;font-weight:700">' + arrow + ' ' + Math.abs(pct) + '%</span>';
}
el2.innerHTML = '<div class="card-title">📊 Comparación mensual</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">' +
'<div style="background:var(--bg3);border-radius:var(--r-sm);padding:12px;text-align:center">' +
'<div style="font-size:11px;color:var(--t2);margin-bottom:6px">' + MONTHS_SHORT[prev] + ' ' + prevY + '</div>' +
'<div style="font-size:13px;color:var(--green)">💵 ' + fmt(prevI) + '</div>' +
'<div style="font-size:13px;color:var(--red)">💸 ' + fmt(prevG) + '</div>' +
'</div>' +
'<div style="background:var(--gold-dim);border:1px solid rgba(201,169,110,0.25);border-radius:var(--r-sm);padding:12px;text-align:center">' +
'<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:6px">' + MONTHS_SHORT[cur] + ' ' + curY + ' (actual)</div>' +
'<div style="font-size:13px;color:var(--green)">💵 ' + fmt(curI) + diffBadge(curI, prevI) + '</div>' +
'<div style="font-size:13px;color:var(--red)">💸 ' + fmt(curG) + diffBadge(curG, prevG) + '</div>' +
'</div>' +
'</div>';
} else {
var totalI = 0, totalG = 0;
for (var i = 0; i < months; i++) {
var mm = (cur - i + 12) % 12;
var yy = cur - i < 0 ? curY - 1 : curY;
totalI += DATA.ingresos.filter(function(x){ return x.month===mm && x.year===yy; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
totalG += DATA.gastos.filter(function(x){ return x.month===mm && x.year===yy; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
}
var net = totalI - totalG;
el2.innerHTML = '<div class="card-title">📊 ' + label + '</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">' +
'<div style="background:var(--bg3);border-radius:var(--r-sm);padding:10px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:4px">INGRESOS</div><div style="font-size:14px;font-weight:800;color:var(--green)">' + fmt(totalI) + '</div></div>' +
'<div style="background:var(--bg3);border-radius:var(--r-sm);padding:10px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:4px">GASTOS</div><div style="font-size:14px;font-weight:800;color:var(--red)">' + fmt(totalG) + '</div></div>' +
'<div style="background:var(--gold-dim);border:1px solid rgba(201,169,110,0.2);border-radius:var(--r-sm);padding:10px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:4px">BALANCE</div><div style="font-size:14px;font-weight:800;color:' + (net>=0?'var(--gold)':'var(--red)') + '">' + (net>=0?'+':'') + fmt(net) + '</div></div>' +
'</div>';
}
}
function exportPDF() {
if (!requireSubscription()) return;
var yr = DATA.curYear;
var ing = 0, gas = 0, meses = [], cats = {};
for (var m = 0; m < 12; m++) {
var mi = DATA.ingresos.filter(function(x){ return x.month===m && x.year===yr; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var mg = DATA.gastos.filter(function(x){ return x.month===m && x.year===yr; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
ing += mi; gas += mg;
if (mi > 0 || mg > 0) meses.push({ m: MONTHS_SHORT[m], ing: mi, gas: mg, net: mi - mg });
}
DATA.gastos.filter(function(x){ return x.year===yr; }).forEach(function(g) {
var k = g.cat || 'Otros'; cats[k] = (cats[k] || 0) + toUSD(g.monto, g.mon);
});
var cl = Object.keys(cats).sort(function(a,b){ return cats[b]-cats[a]; }).slice(0, 8);
function f(n) { return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
var net = ing - gas;

// Load jsPDF and generate real PDF
showToast('Generando PDF...');
var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
script.onload = function() {
  try {
    var doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    var W = 210, margin = 20, y = 20;

    // Header
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, W, 30, 'F');
    doc.setFontSize(20); doc.setFont('helvetica','bold');
    doc.setTextColor(201, 169, 110);
    doc.text('GestorRD', margin, 18);
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Resumen Financiero ' + yr, W - margin, 18, { align: 'right' });
    doc.text(new Date().toLocaleDateString('es-DO'), W - margin, 24, { align: 'right' });
    y = 45;

    // Summary cards
    var cardW = 52, cardH = 22, gap = 7, startX = margin;
    // Ingresos
    doc.setFillColor(240, 250, 244); doc.roundedRect(startX, y, cardW, cardH, 3, 3, 'F');
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(100,100,100);
    doc.text('INGRESOS', startX + cardW/2, y + 7, { align: 'center' });
    doc.setFontSize(13); doc.setTextColor(22, 163, 74);
    doc.text(f(ing), startX + cardW/2, y + 17, { align: 'center' });
    // Gastos
    startX += cardW + gap;
    doc.setFillColor(255, 245, 245); doc.roundedRect(startX, y, cardW, cardH, 3, 3, 'F');
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(100,100,100);
    doc.text('GASTOS', startX + cardW/2, y + 7, { align: 'center' });
    doc.setFontSize(13); doc.setTextColor(220, 38, 38);
    doc.text(f(gas), startX + cardW/2, y + 17, { align: 'center' });
    // Balance
    startX += cardW + gap;
    doc.setFillColor(253, 246, 236); doc.roundedRect(startX, y, cardW, cardH, 3, 3, 'F');
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(100,100,100);
    doc.text('BALANCE', startX + cardW/2, y + 7, { align: 'center' });
    doc.setFontSize(13); doc.setTextColor(net >= 0 ? 22 : 220, net >= 0 ? 163 : 38, net >= 0 ? 74 : 38);
    doc.text((net >= 0 ? '+' : '') + f(net), startX + cardW/2, y + 17, { align: 'center' });
    y += cardH + 12;

    // Monthly detail table
    if (meses.length > 0) {
      doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(160, 120, 64);
      doc.text('DETALLE MENSUAL', margin, y); y += 5;
      doc.setLineWidth(0.3); doc.setDrawColor(240,217,181);
      doc.line(margin, y, W - margin, y); y += 5;
      // Table header
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y, W - margin*2, 7, 'F');
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(100,100,100);
      doc.text('MES', margin + 3, y + 5);
      doc.text('INGRESOS', margin + 60, y + 5);
      doc.text('GASTOS', margin + 100, y + 5);
      doc.text('BALANCE', margin + 140, y + 5);
      y += 9;
      meses.forEach(function(ms) {
        doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(30,30,30);
        doc.text(ms.m + ' ' + yr, margin + 3, y);
        doc.setTextColor(22, 163, 74); doc.text(f(ms.ing), margin + 60, y);
        doc.setTextColor(220, 38, 38); doc.text(f(ms.gas), margin + 100, y);
        doc.setTextColor(ms.net >= 0 ? 22 : 220, ms.net >= 0 ? 163 : 38, ms.net >= 0 ? 74 : 38);
        doc.text((ms.net >= 0 ? '+' : '') + f(ms.net), margin + 140, y);
        y += 7;
        doc.setDrawColor(240,240,240); doc.setLineWidth(0.1);
        doc.line(margin, y - 2, W - margin, y - 2);
        if (y > 260) { doc.addPage(); y = 20; }
      });
      y += 5;
    }

    // Top categories
    if (cl.length > 0) {
      doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(160, 120, 64);
      doc.text('TOP CATEGORÍAS', margin, y); y += 5;
      doc.setLineWidth(0.3); doc.setDrawColor(240,217,181);
      doc.line(margin, y, W - margin, y); y += 5;
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y, W - margin*2, 7, 'F');
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(100,100,100);
      doc.text('CATEGORÍA', margin + 3, y + 5);
      doc.text('MONTO', margin + 100, y + 5);
      doc.text('%', margin + 150, y + 5);
      y += 9;
      cl.forEach(function(c) {
        var p = gas > 0 ? Math.round(cats[c]/gas*100) : 0;
        doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(30,30,30);
        doc.text(c.replace(/[^\x00-\x7F]/g, '').trim() || c, margin + 3, y);
        doc.setTextColor(220, 38, 38); doc.text(f(cats[c]), margin + 100, y);
        doc.setTextColor(100,100,100); doc.text(p + '%', margin + 150, y);
        y += 7;
        doc.setDrawColor(240,240,240); doc.setLineWidth(0.1);
        doc.line(margin, y - 2, W - margin, y - 2);
      });
    }

    // Footer
    doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.setTextColor(150,150,150);
    doc.text('GestorRD · gestorrd.com · ' + new Date().toLocaleDateString('es-DO'), W/2, 285, { align: 'center' });

    // Download
    doc.save('GestorRD-' + yr + '.pdf');
    showToast('✅ PDF descargado');
  } catch(err) {
    showToast('Error al generar PDF');
  }
};
script.onerror = function() { showToast('Error al cargar jsPDF'); };
document.head.appendChild(script);
}

function refreshReportes() {
updComparacion();
var cur = DATA.curMonth, curY = DATA.curYear;
var activos = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).reduce(function(a,b){ return a+toUSD(b.bal||0,b.mon); }, 0)
+ DATA.ahorros.reduce(function(a,x){ return a+toUSD(x.actual,x.mon); }, 0);
var pasivos = DATA.deudas.filter(function(d){ return d.estado!=='Pagado'; }).reduce(function(a,d){ return a+toUSD(d.bal||0,d.mon); }, 0);
el('r-activos', fmt(activos));
el('r-pasivos', fmt(pasivos));
var patri = activos - pasivos;
var patriEl = document.getElementById('r-patri');
if (patriEl) { patriEl.textContent = fmt(Math.abs(patri)); patriEl.style.color = patri >= 0 ? 'var(--green)' : 'var(--red)'; }
var chartEl = document.getElementById('bar-chart');
if (chartEl) {
var months = [];
for (var i = 5; i >= 0; i--) {
var m = (cur - i + 12) % 12;
var y = cur - i < 0 ? curY - 1 : curY;
var ing = DATA.ingresos.filter(function(x){ return x.month===m && x.year===y; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var gas = DATA.gastos.filter(function(x){ return x.month===m && x.year===y; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
months.push({ lbl: MONTHS_SHORT[m], ing: ing, gas: gas });
}
var maxVal = Math.max.apply(null, months.map(function(m){ return Math.max(m.ing, m.gas); })) || 1;
chartEl.innerHTML = months.map(function(m) {
var ih = Math.max(m.ing > 0 ? 4 : 0, Math.round((m.ing / maxVal) * 65));
var gh = Math.max(m.gas > 0 ? 4 : 0, Math.round((m.gas / maxVal) * 65));
return '<div class="bar-col">' +
'<div style="display:flex;gap:3px;align-items:flex-end;height:65px">' +
'<div style="flex:1;height:' + ih + 'px;background:var(--green);border-radius:3px 3px 0 0;min-width:6px"></div>' +
'<div style="flex:1;height:' + gh + 'px;background:var(--red);border-radius:3px 3px 0 0;min-width:6px"></div>' +
'</div>' +
'<div class="bar-lbl">' + m.lbl + '</div>' +
'</div>';
}).join('');
}
var curGas = DATA.gastos.filter(function(x){ return x.month===cur && x.year===curY; });
var cats = {};
curGas.forEach(function(g) { var k=g.cat||'Otros'; cats[k]=(cats[k]||0)+toUSD(g.monto,g.mon); });
var catArr = Object.keys(cats).sort(function(a,b){ return cats[b]-cats[a]; }).slice(0, 7);
var tG = curGas.reduce(function(a,g){ return a+toUSD(g.monto,g.mon); }, 0) || 1;
var catColors = ['var(--gold)','#60a5fa','#34d399','#f87171','#a78bfa','#fb923c','#e879f9'];
var catHTML = catArr.length ? catArr.map(function(cat, ci) {
var pct = Math.round((cats[cat]/tG)*100);
var color = catColors[ci % catColors.length];
return '<div style="margin-bottom:10px">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">' +
'<div style="display:flex;align-items:center;gap:8px">' +
'<div style="width:10px;height:10px;border-radius:50%;background:' + color + ';flex-shrink:0"></div>' +
'<span style="font-size:13px;color:var(--t1);font-weight:600">' + cat + '</span>' +
'</div>' +
'<span style="font-size:13px;font-weight:700;color:var(--t1)">' + fmt(cats[cat]) + ' <span style="color:var(--t3);font-weight:400">· ' + pct + '%</span></span>' +
'</div>' +
'<div class="prog-wrap"><div class="prog-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
'</div>';
}).join('') : '<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">Sin gastos este mes</div></div>';
elHTML('cat-breakdown', catHTML);
var mdHTML = '';
for (var mi = 0; mi < 12; mi++) {
var ing2 = DATA.ingresos.filter(function(x){ return x.month===mi && x.year===curY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var gas2 = DATA.gastos.filter(function(x){ return x.month===mi && x.year===curY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
if (!ing2 && !gas2) continue;
var net = ing2 - gas2;
mdHTML += '<div class="list-item">' +
'<div class="list-item-left"><div style="font-size:14px;font-weight:700;color:var(--t1)">' + MONTHS_SHORT[mi] + ' ' + curY + '</div></div>' +
'<div style="text-align:right;display:flex;flex-direction:column;gap:2px">' +
'<div style="font-size:12px;color:var(--green)"><span style="color:var(--t3);font-size:10px">ING </span>+' + fmt(ing2) + '</div>' +
'<div style="font-size:12px;color:var(--red)"><span style="color:var(--t3);font-size:10px">GAS </span>-' + fmt(gas2) + '</div>' +
'<div style="font-size:13px;font-weight:800;color:' + (net>=0?'var(--gold)':'var(--red)') + ';border-top:1px solid var(--border);padding-top:2px;margin-top:2px">' + (net>=0?'+':'') + fmt(net) + '</div>' +
'</div></div>';
}
elHTML('monthly-detail', mdHTML || '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">Sin datos este año</div></div>');
}
