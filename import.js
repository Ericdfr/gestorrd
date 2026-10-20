// import.js — importación de movimientos desde CSV: lectura, vista previa y guardado.
function buildImportSheet() {
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">📥 Importar transacciones</div><div class="step-sub">Sube un CSV de tu banco. La app detecta las columnas automáticamente.</div></div>' +
'<div style="padding:0 16px 20px">' +
'<div style="border:2px dashed var(--border2);border-radius:var(--r-md);padding:32px 16px;text-align:center;margin-bottom:16px;cursor:pointer" onclick="document.getElementById(\'csv-file\').click()">' +
'<div style="font-size:40px;margin-bottom:10px">📄</div>' +
'<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:4px">Toca para seleccionar archivo</div>' +
'<div style="font-size:12px;color:var(--t3)">Formatos: CSV · Excel · TXT</div>' +
'</div>' +
'<input type="file" id="csv-file" accept=".csv,.xlsx,.xls,.txt" style="display:none" onchange="parseCSVFile(event)">' +
'<div id="csv-preview" style="display:none">' +
'<div style="font-size:12px;font-weight:700;color:var(--t3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Columnas detectadas</div>' +
'<div id="csv-cols" style="margin-bottom:12px"></div>' +
'<div id="csv-rows-preview" style="max-height:200px;overflow-y:auto;font-size:12px;color:var(--t2);margin-bottom:12px"></div>' +
'<button class="btn-full" onclick="confirmCSVImport()">Importar transacciones</button>' +
'</div>' +
'<div class="benefit-card" style="margin-top:14px"><div class="benefit-icon">💡</div><div><div class="benefit-title">¿Cómo exportar tu CSV?</div><div class="benefit-desc">BHD / Popular: Banca en línea → Movimientos → Exportar CSV. Chase / Citi: Account Activity → Download.</div></div></div>' +
'</div>';
}
var _csvParsed = [];
function parseCSVFile(event) {
var file = event.target.files[0];
if (!file) return;
var reader = new FileReader();
reader.onload = function(e) {
var text = e.target.result;
var lines = text.split(/\r?\n/).filter(function(l){ return l.trim(); });
if (!lines.length) { showToast('Archivo vacío o formato no reconocido'); return; }
var sep = lines[0].includes(';') ? ';' : ',';
var headers = lines[0].split(sep).map(function(h){ return h.trim().replace(/^"|"$/g,''); });
var rows = lines.slice(1).map(function(l){
var vals = l.split(sep).map(function(v){ return v.trim().replace(/^"|"$/g,''); });
var obj = {};
headers.forEach(function(h,i){ obj[h] = vals[i] || ''; });
return obj;
}).filter(function(r){ return Object.values(r).some(function(v){ return v; }); });
_csvParsed = rows;
var colsHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
headers.map(function(h){ return '<span style="background:var(--gold-dim);color:var(--gold);border:1px solid rgba(201,169,110,.3);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600">' + h + '</span>'; }).join('') +
'</div>';
var previewHTML = rows.slice(0,5).map(function(r){
return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' +
Object.values(r).slice(0,4).join(' · ') + '</div>';
}).join('');
var prev = document.getElementById('csv-preview');
if (prev) prev.style.display = 'block';
var cols = document.getElementById('csv-cols');
if (cols) cols.innerHTML = colsHTML;
var rowsPrev = document.getElementById('csv-rows-preview');
if (rowsPrev) rowsPrev.innerHTML = '<div style="margin-bottom:4px;color:var(--t3)">' + rows.length + ' transacciones encontradas:</div>' + previewHTML;
};
reader.readAsText(file, 'UTF-8');
event.target.value = '';
}
function confirmCSVImport() {
if (!_csvParsed.length) { showToast('No hay datos para importar'); return; }
var today = new Date().toISOString().slice(0,10);
var imported = 0;
_csvParsed.forEach(function(row) {
var vals = Object.values(row);
var headers = Object.keys(row).map(function(k){ return k.toLowerCase(); });
var montoIdx = headers.findIndex(function(h){ return h.includes('monto')||h.includes('amount')||h.includes('valor')||h.includes('debito')||h.includes('credito'); });
var fechaIdx = headers.findIndex(function(h){ return h.includes('fecha')||h.includes('date')||h.includes('fech'); });
var descIdx = headers.findIndex(function(h){ return h.includes('desc')||h.includes('concepto')||h.includes('detail')||h.includes('ref'); });
var montoRaw = montoIdx >= 0 ? vals[montoIdx] : vals[vals.length-1];
var monto = parseFloat((montoRaw||'').replace(/[,$]/g,'').replace(',',''));
if (!monto || isNaN(monto)) return;
var fecha = fechaIdx >= 0 ? (vals[fechaIdx]||today) : today;
if (fecha.includes('/')) {
var parts = fecha.split('/');
if (parts.length === 3) fecha = parts[2].length===4 ? parts[2]+'-'+parts[0].padStart(2,'0')+'-'+parts[1].padStart(2,'0') : parts[0]+'-'+parts[1].padStart(2,'0')+'-'+parts[2].padStart(2,'0');
}
var d = dateInfo(fecha);
var desc = descIdx >= 0 ? vals[descIdx] : '';
var isNeg = monto < 0;
var absMonto = Math.abs(monto);
if (isNeg) {
DATA.gastos.push({ id: Date.now()+imported, monto: absMonto, mon: 'DOP', cat: '❓ Otros', desc: desc, fecha: fecha, month: d.month, year: d.year, source: '' });
} else {
DATA.ingresos.push({ id: Date.now()+imported, monto: absMonto, mon: 'DOP', fuente: desc||'Importado', desc: desc, fecha: fecha, month: d.month, year: d.year });
}
imported++;
});
save(); closeSheet(); refreshHome();
showToast('✅ ' + imported + ' transacciones importadas');
_csvParsed = [];
}
