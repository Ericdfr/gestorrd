// history.js — hoja de historial de movimientos con filtros por tipo y mes.
function buildHistorialSheet(filterTipo, filterMes) {
var today = new Date().toISOString().slice(0,10);
var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
filterTipo = filterTipo || 'all';
filterMes = filterMes || 'all';
var all = [];
if (filterTipo !== 'gas') (DATA.ingresos||[]).forEach(function(x){ all.push({ tipo:'ing', fecha:x.fecha||today, desc:x.fuente||x.desc||'Ingreso', cat:x.cat||'Ingreso', monto:x.monto, mon:x.mon }); });
if (filterTipo !== 'ing') (DATA.gastos||[]).forEach(function(x){ all.push({ tipo:'gas', fecha:x.fecha||today, desc:x.desc||x.cat||'Gasto', cat:x.cat||'Otros', monto:x.monto, mon:x.mon }); });
if (filterMes !== 'all') {
all = all.filter(function(x){ return x.fecha && x.fecha.slice(0,7) === filterMes; });
}
all.sort(function(a,b){ return b.fecha.localeCompare(a.fecha); });
var allDates = [];
(DATA.ingresos||[]).concat(DATA.gastos||[]).forEach(function(x){ if (x.fecha) allDates.push(x.fecha.slice(0,7)); });
var uniqueMonths = allDates.filter(function(v,i,a){ return a.indexOf(v)===i; }).sort().reverse().slice(0,6);
var monthOpts = '<option value="all">Todos los meses</option>' + uniqueMonths.map(function(m){
var yr = m.slice(0,4), mo = parseInt(m.slice(5,7))-1;
return '<option value="' + m + '"' + (filterMes===m?' selected':'') + '>' + MONTHS_SHORT[mo] + ' ' + yr + '</option>';
}).join('');
var header = '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">Historial</div></div>';
var filters = '<div style="padding:8px 16px 12px;display:flex;gap:8px;flex-wrap:wrap">' +
'<div style="display:flex;gap:4px;background:var(--bg3);border-radius:20px;padding:3px">' +
['all','ing','gas'].map(function(t){
var lbl = t==='all'?'Todo':t==='ing'?'💵 Ingresos':'💸 Gastos';
var active = filterTipo===t;
return '<button onclick="elHTML(\'sheet-content\',buildHistorialSheet(\''+t+'\',\''+filterMes+'\'))" style="padding:5px 12px;border-radius:16px;border:none;font-size:11px;font-weight:700;cursor:pointer;background:'+(active?'var(--gold-dim)':'transparent')+';color:'+(active?'var(--gold)':'var(--t3)')+'">'+lbl+'</button>';
}).join('') +
'</div>' +
'<select onchange="elHTML(\'sheet-content\',buildHistorialSheet(\''+filterTipo+'\',this.value))" style="padding:6px 10px;border-radius:16px;border:1px solid var(--border);background:var(--surface);color:var(--t1);font-size:12px;font-weight:600">' + monthOpts + '</select>' +
'</div>';
if (!all.length) {
return header + filters + '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">Sin movimientos</div></div>';
}
var groups = {}, groupOrder = [];
all.forEach(function(x) {
if (!groups[x.fecha]) { groups[x.fecha] = []; groupOrder.push(x.fecha); }
groups[x.fecha].push(x);
});
var html = header + filters + '<div style="padding:0 16px 80px">';
groupOrder.forEach(function(fecha) {
var label = fecha === today ? 'Hoy' : fecha === yesterday ? 'Ayer' : fecha.slice(8,10) + '/' + fecha.slice(5,7) + '/' + fecha.slice(0,4);
var dayTotal = groups[fecha].reduce(function(a,x){ return a + (x.tipo==='gas'?-1:1)*toUSD(x.monto,x.mon); }, 0);
html += '<div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;padding:14px 0 8px;display:flex;justify-content:space-between">' +
'<span>' + label + '</span>' +
'<span style="color:' + (dayTotal>=0?'var(--green)':'var(--red)') + '">' + (dayTotal>=0?'+':'') + fmt(dayTotal) + '</span></div>';
groups[fecha].forEach(function(x) {
var cats = getAllCats();
var catObj = cats.find(function(c){ return c[0]===x.cat; });
var icon = catObj ? catObj[1] : (x.tipo==='ing'?'💵':'💸');
var isInc = x.tipo === 'ing';
html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">' +
'<div style="width:40px;height:40px;border-radius:12px;background:' + (isInc?'var(--green-bg)':'var(--surface)') + ';display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + icon + '</div>' +
'<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (x.desc||x.cat) + '</div>' +
'<div style="font-size:12px;color:var(--t3);margin-top:1px">' + x.cat + '</div></div>' +
'<div style="font-size:15px;font-weight:700;color:' + (isInc?'var(--green)':'var(--t1)') + ';flex-shrink:0">' + (isInc?'+':'−') + fmt(x.monto, x.mon) + '</div>' +
'</div>';
});
});
html += '</div>';
return html;
}
