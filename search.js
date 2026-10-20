// search.js — búsqueda de movimientos por texto.
function buildBusquedaSheet() {
return '<div class="step-header"><div class="step-title">🔍 Buscar</div></div>' +
'<div style="padding:0 16px">' +
'<input id="search-q" type="search" placeholder="Categoría, descripción, fuente..." oninput="doSearch()" style="width:100%;padding:12px 14px;border:1px solid var(--border2);border-radius:var(--r-sm);font-size:15px;background:var(--bg);color:var(--t1);margin-bottom:12px">' +
'</div><div id="search-results" style="padding:0 16px 20px"></div>';
}
function doSearch() {
var q = (v('search-q')||'').toLowerCase().trim();
var res = document.getElementById('search-results');
if (!res) return;
if (!q) { res.innerHTML = ''; return; }
var hits = [];
DATA.ingresos.forEach(function(x){ if ((x.fuente+x.desc+x.fecha).toLowerCase().includes(q)) hits.push({tipo:'I',label:x.fuente||'Ingreso',sub:x.fecha,amount:x.monto,mon:x.mon}); });
DATA.gastos.forEach(function(x){ if ((x.cat+x.desc+x.fecha).toLowerCase().includes(q)) hits.push({tipo:'G',label:x.cat,sub:x.desc||x.fecha,amount:x.monto,mon:x.mon}); });
if (!hits.length) { res.innerHTML = '<div class="empty-state"><div class="empty-text">Sin resultados</div></div>'; return; }
res.innerHTML = hits.slice(0,20).map(function(h) {
var cls2 = h.tipo==='I'?'amount-pos':'amount-neg';
var sign = h.tipo==='I'?'+':'-';
return '<div class="list-item"><div class="list-item-left"><div><div class="list-item-title">' + h.label + '</div><div class="list-item-sub">' + (h.sub||'') + '</div></div></div><div class="list-item-amount ' + cls2 + '">' + sign + fmt(h.amount,h.mon) + '</div></div>';
}).join('');
}
