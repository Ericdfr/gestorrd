// sheets.js — formularios de registro de GestorRD: gasto, ingreso, deuda, meta, cuenta,
// presupuesto, gastos fijos, categorías y tasa. Escriben en DATA (store.js).
var CAT_LIST = [
['🏠 Vivienda','🏠'],['💡 Electricidad','💡'],['💧 Agua','💧'],['🔥 Gas','🔥'],
['📡 Internet','📡'],['🚗 Gasolina','🚗'],['🚕 Taxi/Uber','🚕'],['✈️ Viajes','✈️'],
['🍔 Comida rápida','🍔'],['🛒 Supermercado','🛒'],['🍽️ Restaurantes','🍽️'],['☕ Café','☕'],
['💊 Farmacia','💊'],['🏥 Médico','🏥'],['👕 Ropa','👕'],['🎁 Regalos','🎁'],
['❤️ Personal','❤️'],['🎮 Entretenimiento','🎮'],['📱 Suscripciones','📱'],['🏋️ Gimnasio','🏋️'],
['🎓 Educación','🎓'],['💳 Deuda','💳'],['💼 Negocio','💼'],['👶 Familia','👶'],
['🐾 Mascotas','🐾'],['❓ Otros','❓']
];
var _selCat = '', _selSource = '';
var _scanPrefill = null;
var _wgStep = 1;
var _wgMonto = 0;
var _wgDesc = '';
var _wgFecha = '';
function buildGastoSheet() {
var pre = window._scanPrefill || null;
window._scanPrefill = null;
if (!pre) { _selCat = ''; _gastoMon = 'USD'; _selSource = ''; _wgStep = 1; _wgMonto = 0; }
else { _wgStep = pre.monto > 0 ? 2 : 1; _wgMonto = pre.monto || 0; }
return _buildWizardStep(_wgStep, pre);
}
function _buildWizardStep(step, pre) {
var dots = [1,2,3].map(function(i){
return '<div class="step-dot' + (i===step?' active':'') + '" style="width:' + (i===step?'22px':'7px') + '"></div>';
}).join('');
var dotsRow = '<div class="step-dots">' + dots + '</div>';
var back = step > 1
? '<button class="step-back" onclick="_wgBack()">←</button>'
: '<button class="step-back" onclick="openAddMenu()">←</button>';
if (step === 1) {
var preMonto = (pre && pre.monto) ? pre.monto : '';
return '<div class="step-header">' + back + dotsRow +
'<div class="step-title" style="margin-top:10px">¿Cuánto gastaste?</div></div>' +
'<div class="amount-input-wrap">' +
'<div class="amount-currency" id="gasto-mon-lbl">' + _gastoMon + '</div>' +
'<input class="amount-big" id="gf-monto" type="number" placeholder="0.00" inputmode="decimal" value="' + preMonto + '" autofocus>' +
'<div style="display:flex;gap:8px;justify-content:center;margin-top:10px">' +
'<button onclick="setGastoMon(\'USD\')" id="gbtn-usd" style="background:' + (_gastoMon==='USD'?'var(--gold-dim)':'none') + ';border:1px solid ' + (_gastoMon==='USD'?'var(--gold)':'var(--border2)') + ';border-radius:20px;padding:5px 16px;font-size:13px;font-weight:700;color:' + (_gastoMon==='USD'?'var(--gold)':'var(--t2)') + ';cursor:pointer">USD</button>' +
'<button onclick="setGastoMon(\'DOP\')" id="gbtn-dop" style="background:' + (_gastoMon==='DOP'?'var(--gold-dim)':'none') + ';border:1px solid ' + (_gastoMon==='DOP'?'var(--gold)':'var(--border2)') + ';border-radius:20px;padding:5px 16px;font-size:13px;font-weight:700;color:' + (_gastoMon==='DOP'?'var(--gold)':'var(--t2)') + ';cursor:pointer">DOP</button>' +
'</div>' +
'</div>' +
'<div style="padding:0 16px 8px"><div class="form-field"><label>Descripción (opcional)</label><input id="gf-desc" type="text" placeholder="Ej: Almuerzo, Netflix..." value="' + ((pre&&pre.desc)||'') + '"></div>' +
'<div class="form-field"><label>Fecha</label><input id="gf-fecha" type="date" value="' + ((pre&&pre.fecha)||new Date().toISOString().slice(0,10)) + '"></div></div>' +
'<div style="padding:0 16px 20px"><button class="btn-full" onclick="_wgNext1()">Siguiente →</button></div>';
}
if (step === 2) {
var catBtns = getAllCats().map(function(c) {
var isSel = _selCat === c[0];
return '<button class="cat-btn' + (isSel?' sel':'') + '" onclick="selCat(this,\'' + c[0].replace(/'/g,"\\'") + '\');_wgNext2()">' +
'<div class="cat-btn-icon">' + c[1] + '</div>' +
'<div class="cat-btn-label">' + c[0].split(' ').slice(1).join(' ') + '</div>' +
'</button>';
}).join('');
return '<div class="step-header">' + back + dotsRow +
'<div class="step-title" style="margin-top:10px">¿En qué gastaste?</div>' +
'<div class="step-sub">' + _gastoMon + ' ' + (_wgMonto > 0 ? (_gastoMon==='USD'?'$':' RD$') + _wgMonto.toFixed(2) : '') + '</div></div>' +
'<div class="cat-grid" id="cat-grid" style="padding-bottom:20px">' + catBtns + '</div>';
}
if (step === 3) {
var srcBtns = buildSourceButtons();
return '<div class="step-header">' + back + dotsRow +
'<div class="step-title" style="margin-top:10px">¿Cómo pagaste?</div>' +
'<div class="step-sub">Toca la cuenta o método de pago</div></div>' +
'<div style="padding:0 16px 16px">' + srcBtns +
'<button class="btn-full" style="margin-top:16px" onclick="saveGasto()">💾 Guardar gasto</button></div>';
}
return '';
}
function _wgNext1() {
var monto = parseFloat(v('gf-monto'));
if (!monto || monto <= 0) { showToast('Ingresa un monto válido'); return; }
_wgMonto = monto;
_wgDesc = v('gf-desc') || '';
_wgFecha = v('gf-fecha') || new Date().toISOString().slice(0,10);
_wgStep = 2;
var sc = document.getElementById('sheet-content');
if (sc) sc.innerHTML = _buildWizardStep(2, null);
}
function _wgNext2() {
if (!_selCat) { showToast(t('select_category')); return; }
_wgStep = 3;
var sc = document.getElementById('sheet-content');
if (sc) sc.innerHTML = _buildWizardStep(3, null);
}
function _wgBack() {
_wgStep = Math.max(1, _wgStep - 1);
var sc = document.getElementById('sheet-content');
if (sc) sc.innerHTML = _buildWizardStep(_wgStep, null);
}
var _gastoMon = 'USD';
function setGastoMon(m) {
_gastoMon = m;
el('gasto-mon-lbl', m);
['usd','dop'].forEach(function(x) {
var b = document.getElementById('gbtn-'+x);
if (!b) return;
if (x === m.toLowerCase()) { b.style.background='var(--gold-dim)'; b.style.borderColor='var(--gold)'; b.style.color='var(--gold)'; }
else { b.style.background='none'; b.style.borderColor='var(--border2)'; b.style.color='var(--t2)'; }
});
}
function selCat(btn, cat) {
_selCat = cat;
document.querySelectorAll('.cat-btn').forEach(function(b){ b.classList.remove('sel'); });
if (btn) btn.classList.add('sel');
}
function buildSourceButtons() {
var items = [{ icon: '💵', name: 'Efectivo', sub: '', id: 'efectivo' }];
DATA.bancos.forEach(function(b, i) {
var sub;
if (b.esTarjeta) {
if (b.dispUSD > 0 && b.dispDOP > 0) {
sub = 'Disp: ' + fmt(b.dispUSD||0,'USD') + ' / RD$' + Math.round(b.dispDOP||0).toLocaleString('es-DO');
} else if (b.dispDOP > 0) {
sub = 'Disp: RD$' + Math.round(b.dispDOP||0).toLocaleString('es-DO');
} else {
sub = 'Disp: ' + fmt(b.dispUSD||0,'USD');
}
} else {
sub = b.mon === 'DOP' ? 'RD$' + Math.round(b.bal||0).toLocaleString('es-DO') : fmt(b.bal||0, b.mon);
}
items.push({ icon: b.esTarjeta ? '💳' : '🏦', name: (b.nom||b.banco) + (b.ultimos?' ···'+b.ultimos:''), sub: sub, id: 'banco_'+i });
});
return items.map(function(s) {
return '<div class="source-item" id="src-' + s.id + '" onclick="selSource(this,\'' + s.id + '\')">' +
'<div class="source-icon">' + s.icon + '</div>' +
'<div class="source-name">' + s.name + '</div>' +
(s.sub ? '<div class="source-bal">' + s.sub + '</div>' : '') +
'<div class="source-check">✓</div>' +
'</div>';
}).join('');
}
function selSource(el2, id) {
_selSource = id;
document.querySelectorAll('.source-item').forEach(function(s){ s.classList.remove('sel'); });
if (el2) el2.classList.add('sel');
}
function saveGasto() {
if (!checkClientRateLimit('save_transaction', 50, 60000)) return;
var monto = _wgMonto > 0 ? _wgMonto : parseFloat(v('gf-monto'));
if (!monto || monto <= 0) { showToast(t('enter_amount')); return; }
if (!_selCat) { showToast(t('select_category')); return; }
var fecha = (_wgFecha && _wgStep > 1) ? _wgFecha : (v('gf-fecha') || new Date().toISOString().slice(0,10));
var desc = (_wgStep > 1) ? _wgDesc : (v('gf-desc') || '');
var d = dateInfo(fecha);
DATA.gastos.push({ id: Date.now(), monto: monto, mon: _gastoMon, cat: _selCat, desc: desc, fecha: fecha, month: d.month, year: d.year, source: _selSource });
if (_selSource && _selSource.startsWith('banco_')) {
var idx = parseInt(_selSource.split('_')[1]);
var banco = DATA.bancos[idx];
if (banco) {
if (banco.esTarjeta) {
if (_gastoMon === 'USD') {
banco.saldoUSD = Math.round(((banco.saldoUSD||0) + monto)*100)/100;
banco.dispUSD = Math.max(0, Math.round(((banco.dispUSD||0) - monto)*100)/100);
} else {
banco.saldoDOP = Math.round(((banco.saldoDOP||0) + monto)*100)/100;
banco.dispDOP = Math.max(0, Math.round(((banco.dispDOP||0) - monto)*100)/100);
}
banco.bal = banco.saldoUSD || 0;
var deuda = (DATA.deudas||[]).find(function(dd){ return dd.tcId === banco.id; });
if (deuda) {
deuda.bal = banco.saldoUSD || 0;
deuda.balDOP = banco.saldoDOP || 0;
if (banco.saldoUSD === 0 && banco.saldoDOP === 0) {
deuda.estado = 'Pagado';
} else {
deuda.estado = 'Activo';
}
}
} else {
banco.bal = Math.round(((banco.bal||0) - monto)*100)/100;
}
}
}
save(); closeSheet(); refreshHome(); refreshCuentas();
showToast('✓ Gasto guardado: ' + (_gastoMon==='USD'?'$':'RD$') + monto.toFixed(2));
_selCat = ''; _selSource = ''; _wgStep = 1; _wgMonto = 0; _wgDesc = ''; _wgFecha = '';
}
function buildIngresoSheet() {
var today = new Date().toISOString().slice(0,10);
var bankOpts = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).map(function(b,i){
return '<option value="' + i + '">' + b.banco + (b.ultimos?' ···'+b.ultimos:'') + '</option>';
}).join('');
return '<div class="step-header"><button class="step-back" onclick="openAddMenu()">←</button>' +
'<div class="step-title">Registrar ingreso</div></div>' +
'<div class="amount-input-wrap">' +
'<div class="amount-currency">USD</div>' +
'<input class="amount-big" id="if-monto" type="number" placeholder="0.00" inputmode="decimal">' +
'<div style="display:flex;gap:8px;justify-content:center;margin-top:8px">' +
'<button onclick="setIngresoMon(\'USD\')" id="ibtn-usd" style="background:var(--gold-dim);border:1px solid var(--gold);border-radius:8px;padding:4px 12px;font-size:12px;font-weight:700;color:var(--gold);cursor:pointer">USD</button>' +
'<button onclick="setIngresoMon(\'DOP\')" id="ibtn-dop" style="background:none;border:1px solid var(--border2);border-radius:8px;padding:4px 12px;font-size:12px;font-weight:700;color:var(--t2);cursor:pointer">DOP</button>' +
'</div>' +
'</div>' +
'<div style="padding:0 16px 16px">' +
'<div class="form-field"><label>Fuente</label><input id="if-fuente" type="text" placeholder="Ej: Salario, Freelance, Ventas..."></div>' +
'<div class="form-field"><label>Fecha</label><input id="if-fecha" type="date" value="' + today + '"></div>' +
'<div class="form-field"><label>Método de recibo</label><select id="if-metodo"><option>💵 Cash</option><option>🏦 Transferencia</option><option>📲 Zelle / Pago móvil</option><option>💳 Cheque</option><option>🏧 Depósito</option></select></div>' +
(bankOpts ? '<div class="form-field"><label>Mover a cuenta (opcional)</label><select id="if-banco"><option value="">— No mover —</option>' + bankOpts + '</select></div>' : '') +
'<button class="btn-full" onclick="saveIngreso()">Guardar ingreso</button>' +
'</div>';
}
var _ingresoMon = 'USD';
function setIngresoMon(m) {
_ingresoMon = m;
['usd','dop'].forEach(function(x) {
var b = document.getElementById('ibtn-'+x);
if (!b) return;
if (x === m.toLowerCase()) { b.style.background='var(--gold-dim)'; b.style.borderColor='var(--gold)'; b.style.color='var(--gold)'; }
else { b.style.background='none'; b.style.borderColor='var(--border2)'; b.style.color='var(--t2)'; }
});
}
function saveIngreso() {
var monto = parseFloat(v('if-monto'));
var fuente = v('if-fuente');
if (!monto || monto <= 0) { showToast(t('enter_amount')); return; }
if (!fuente) { showToast('Ingresa la fuente del ingreso'); return; }
var fecha = v('if-fecha') || new Date().toISOString().slice(0,10);
var d = dateInfo(fecha);
DATA.ingresos.push({ id: Date.now(), monto: monto, mon: _ingresoMon, fuente: fuente, metodo: v('if-metodo'), fecha: fecha, month: d.month, year: d.year });
var bancoIdx = v('if-banco');
if (bancoIdx !== '' && bancoIdx !== null) {
var idx = parseInt(bancoIdx);
if (!isNaN(idx) && DATA.bancos[idx]) {
DATA.bancos[idx].bal = (DATA.bancos[idx].bal || 0) + monto;
}
}
save(); closeSheet(); refreshHome(); refreshCuentas();
showToast(t('income_saved'));
}
function buildDeudaSheet() {
var deudas = (DATA.deudas || []).filter(function(d){ return d.estado !== 'Pagado'; });
var listHTML = '';
if (deudas.length) {
listHTML = deudas.map(function(d) {
var pct = d.original > 0 ? Math.min(100, Math.round((d.totalPaid||0) / d.original * 100)) : 0;
return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
'<span style="font-size:14px;font-weight:600;color:var(--t1)">' + d.nom + '</span>' +
'<span style="font-size:14px;font-weight:700;color:var(--red)">' + fmt(d.bal||0, d.mon) + '</span>' +
'</div>' +
'<div style="font-size:11px;color:var(--t2);margin-bottom:6px">' + d.tipo + (d.fecha ? ' · Pago: ' + d.fecha : '') + '</div>' +
'<div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:4px">' +
'<div style="width:' + pct + '%;height:100%;background:var(--green);border-radius:3px"></div>' +
'</div>' +
'<div style="display:flex;justify-content:space-between;align-items:center">' +
'<span style="font-size:11px;color:var(--t3)">' + pct + '% pagado</span>' +
'<button onclick="openSheet(\'pagar-deuda\',' + d.id + ')" style="background:var(--gold-dim);border:1px solid var(--gold);color:var(--gold);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">Pagar</button>' +
'</div></div>';
}).join('');
} else {
listHTML = '<div class="empty-state" style="padding:20px 0"><div class="empty-icon">💳</div><div class="empty-text">Sin deudas activas</div><div class="empty-sub">¡Excelente! No tienes deudas registradas</div></div>';
}
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">💳 Deudas activas</div></div>' +
'<div style="padding:0 16px 24px">' +
listHTML +
'<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">' +
'<div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px">+ Agregar deuda</div>' +
'<div class="form-field"><label>Nombre</label><input id="dd-nom" type="text" placeholder="Ej: Banco Popular, Chase..."></div>' +
'<div class="form-row"><div class="form-field"><label>Tipo</label><select id="dd-tipo"><option>Tarjeta crédito</option><option>Préstamo hipotecario</option><option>Préstamo personal</option><option>Préstamo negocio</option><option>Personal (amigo)</option><option>Otro</option></select></div><div class="form-field"><label>Moneda</label><select id="dd-mon"><option>USD</option><option>DOP</option></select></div></div>' +
'<div class="form-field"><label>Saldo pendiente</label><input id="dd-bal" type="number" placeholder="0.00" inputmode="decimal"></div>' +
'<div class="form-row"><div class="form-field"><label>Fecha de pago</label><input id="dd-fecha" type="date"></div><div class="form-field"><label>Tasa % anual</label><input id="dd-tasa" type="number" placeholder="0.00" inputmode="decimal"></div></div>' +
'<div class="form-field"><label>Estado</label><select id="dd-estado"><option>Activo</option><option>Pagado</option><option>Atrasado</option></select></div>' +
'<button class="btn-full" onclick="saveDeuda()">Guardar deuda</button>' +
'</div></div>';
}
function saveDeuda() {
var nom = v('dd-nom'), bal = parseFloat(v('dd-bal'));
if (!nom) { showToast('Ingresa el nombre'); return; }
DATA.deudas.push({ id: Date.now(), nom: nom, tipo: v('dd-tipo'), mon: v('dd-mon'), bal: bal||0, original: bal||0, totalPaid: 0, tasa: parseFloat(v('dd-tasa'))||0, fecha: v('dd-fecha'), estado: v('dd-estado')||'Activo' });
save(); closeSheet(); refreshHome(); refreshCuentas();
showToast('Deuda guardada ✓');
}
function buildMetaSheet() {
var metas = DATA.metas || [];
var listHTML = '';
if (metas.length) {
listHTML = metas.map(function(m, i) {
var pct = m.total > 0 ? Math.min(100, Math.round((m.actual||0) / m.total * 100)) : 0;
var falta = Math.max(0, (m.total||0) - (m.actual||0));
var color = pct >= 100 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--blue)';
return '<div style="padding:14px 0;border-bottom:1px solid var(--border)">' +
'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
'<div><div style="font-size:15px;font-weight:700;color:var(--t1)">' + m.nom + '</div>' +
(m.fecha ? '<div style="font-size:11px;color:var(--t3);margin-top:2px">📅 ' + m.fecha + '</div>' : '') + '</div>' +
'<div style="text-align:right">' +
'<div style="font-size:13px;font-weight:700;color:' + color + '">' + pct + '%</div>' +
'<button onclick="deleteMeta(' + i + ')" style="background:none;border:none;color:var(--red);font-size:12px;cursor:pointer;padding:0">✕ eliminar</button>' +
'</div>' +
'</div>' +
'<div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:6px">' +
'<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:4px;transition:width .5s"></div>' +
'</div>' +
'<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t3)">' +
'<span>' + fmt(m.actual||0, m.mon) + ' ahorrado</span>' +
'<span>' + (pct < 100 ? 'Faltan ' + fmt(falta, m.mon) : '✅ Meta alcanzada') + '</span>' +
'</div>' +
'<button onclick="abonarMeta(' + i + ')" style="margin-top:8px;background:var(--gold-dim);border:1px solid var(--gold);color:var(--gold);border-radius:10px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;width:100%">+ Abonar a esta meta</button>' +
'</div>';
}).join('');
} else {
listHTML = '<div class="empty-state" style="padding:24px 0"><div class="empty-icon">🎯</div><div class="empty-text">Sin metas activas</div><div class="empty-sub">Crea tu primera meta de ahorro</div></div>';
}
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">🎯 Metas de ahorro</div></div>' +
'<div style="padding:0 16px 24px">' +
listHTML +
'<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">' +
'<div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px">+ Crear meta</div>' +
'<div class="form-field"><label>¿Para qué estás ahorrando?</label><input id="mt-nom" type="text" placeholder="Ej: Vacaciones, Auto, Apartamento..."></div>' +
'<div class="form-row"><div class="form-field"><label>Ya tengo</label><input id="mt-act" type="number" placeholder="0.00" inputmode="decimal"></div><div class="form-field"><label>Meta total</label><input id="mt-tot" type="number" placeholder="0.00" inputmode="decimal"></div></div>' +
'<div class="form-row"><div class="form-field"><label>Moneda</label><select id="mt-mon"><option>USD</option><option>DOP</option></select></div><div class="form-field"><label>Fecha objetivo</label><input id="mt-fecha" type="date"></div></div>' +
'<button class="btn-full" onclick="saveMeta()">Guardar meta</button>' +
'</div></div>';
}
function deleteMeta(i) {
DATA.metas.splice(i, 1);
if (DATA.ahorros && DATA.ahorros[i]) DATA.ahorros.splice(i, 1);
save(); openSheet('add-meta');
}
function abonarMeta(i) {
var m = DATA.metas[i];
if (!m) return;
openSheetWith(
'<div class="step-header"><button class="step-back" onclick="openSheet(\'add-meta\')">←</button>' +
'<div class="step-title">+ Abonar a meta</div>' +
'<div class="step-sub">' + m.nom + ' — ' + fmt(m.actual||0,m.mon) + ' / ' + fmt(m.total||0,m.mon) + '</div></div>' +
'<div style="padding:0 16px 24px">' +
'<div class="amount-input-wrap" style="margin-bottom:16px">' +
'<div class="amount-currency">' + (m.mon||'USD') + '</div>' +
'<input class="amount-big" id="abono-monto" type="number" placeholder="0.00" inputmode="decimal" autofocus>' +
'</div>' +
'<button class="btn-full" onclick="confirmarAbono(' + i + ')">✓ Abonar</button>' +
'</div>'
);
}
function confirmarAbono(i) {
var m = DATA.metas[i];
if (!m) return;
var monto = parseFloat(v('abono-monto'));
if (!monto || monto <= 0) { showToast('Ingresa un monto válido'); return; }
m.actual = Math.round(((m.actual||0) + monto) * 100) / 100;
if (DATA.ahorros && DATA.ahorros[i]) DATA.ahorros[i].actual = m.actual;
save(); openSheet('add-meta');
showToast('✓ +' + fmt(monto, m.mon) + ' abonado a ' + m.nom);
}
function saveMeta() {
var nom = v('mt-nom'), tot = parseFloat(v('mt-tot'));
if (!nom || !tot) { showToast('Completa los campos'); return; }
DATA.metas.push({ id: Date.now(), nom: nom, actual: parseFloat(v('mt-act'))||0, total: tot, mon: v('mt-mon'), fecha: v('mt-fecha') });
DATA.ahorros.push({ id: Date.now(), meta: nom, actual: parseFloat(v('mt-act'))||0, total: tot, mon: v('mt-mon'), fecha: v('mt-fecha') });
save(); closeSheet(); refreshHome(); refreshCuentas();
showToast('Meta guardada ✓');
}
function buildEditBancoSheet(bancoId) {
var b = DATA.bancos.find(function(x){ return x.id === bancoId; });
if (!b) return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button><div class="step-title">Cuenta no encontrada</div></div>';
var icon = b.esTarjeta ? '💳' : '🏦';
var isRD = b.pais !== 'US';
var isCard = b.esTarjeta;
var infoRows =
'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;color:var(--t3)">BANCO</span><span style="font-size:14px;font-weight:700;color:var(--t1)">' + b.banco + '</span></div>' +
'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;color:var(--t3)">TIPO</span><span style="font-size:14px;font-weight:700;color:var(--t1)">' + (b.tipo||'Cuenta') + '</span></div>' +
'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;color:var(--t3)">PAÍS</span><span style="font-size:14px;font-weight:700;color:var(--t1)">' + (b.pais==='US'?'🇺🇸 USA':'🇩🇴 RD') + '</span></div>';
if (isCard) {
if (isRD) {
infoRows +=
'<div style="height:1px;background:var(--border);margin:8px 0"></div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
'<div style="background:var(--bg3);border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:3px">LÍMITE USD</div><div style="font-size:15px;font-weight:800;color:var(--t1)">' + fmt(b.limUSD||0,'USD') + '</div></div>' +
'<div style="background:var(--bg3);border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:3px">LÍMITE DOP</div><div style="font-size:15px;font-weight:800;color:var(--t1)">RD$' + Math.round(b.limDOP||0).toLocaleString('es-DO') + '</div></div>' +
'<div style="background:var(--red-bg);border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:var(--red);margin-bottom:3px">DEBES USD</div><div style="font-size:15px;font-weight:800;color:var(--red)">' + fmt(b.saldoUSD||0,'USD') + '</div></div>' +
'<div style="background:var(--red-bg);border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:var(--red);margin-bottom:3px">DEBES DOP</div><div style="font-size:15px;font-weight:800;color:var(--red)">RD$' + Math.round(b.saldoDOP||0).toLocaleString('es-DO') + '</div></div>' +
'</div>';
} else {
infoRows +=
'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;color:var(--t3)">LÍMITE</span><span style="font-size:14px;font-weight:700;color:var(--t1)">' + fmt(b.limUSD||0,'USD') + '</span></div>' +
'<div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--t3)">DEBES</span><span style="font-size:14px;font-weight:900;color:var(--red)">' + fmt(b.saldoUSD||0,'USD') + '</span></div>';
}
} else {
infoRows += '<div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--t3)">BALANCE</span><span style="font-size:16px;font-weight:900;color:var(--gold)">' + (b.mon==='DOP'?'RD$'+Math.round(b.bal||0).toLocaleString('es-DO'):fmt(b.bal||0,b.mon)) + '</span></div>';
if (isRD && b.mon === 'DOP') {
var usdEq = Math.round(toUSD(b.bal||0,'DOP')*100)/100;
infoRows += '<div style="font-size:12px;color:var(--t3);text-align:right;margin-top:3px">≈ ' + fmt(usdEq,'USD') + '</div>';
}
}
var editFields = '';
if (isCard && isRD) {
editFields =
'<div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px">Actualizar disponible</div>' +
'<div class="form-row">' +
'<div class="form-field"><label>Disponible USD</label><input id="edit-banco-disp-usd" type="number" inputmode="decimal" placeholder="0.00" value="' + (b.dispUSD||0) + '"></div>' +
'<div class="form-field"><label>Disponible DOP</label><input id="edit-banco-disp-dop" type="number" inputmode="decimal" placeholder="0" value="' + (b.dispDOP||0) + '"></div>' +
'</div>';
} else if (isCard) {
editFields =
'<div class="form-field"><label>Disponible USD</label><input id="edit-banco-disp-usd" type="number" inputmode="decimal" placeholder="0.00" value="' + (b.dispUSD||0) + '"></div>';
} else {
editFields =
'<div class="form-field"><label>Actualizar balance (' + (b.mon||'DOP') + ')</label><input id="edit-banco-bal" type="number" inputmode="decimal" placeholder="' + (b.bal||0) + '" value="' + (b.bal||0) + '"></div>';
}
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">' + icon + ' ' + (b.nom || b.banco) + '</div>' +
'<div class="step-sub">' + (b.tipo||'Cuenta') + (b.ultimos?' · ···'+b.ultimos:'') + '</div></div>' +
'<div style="padding:0 16px 24px">' +
'<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;margin-bottom:16px">' + infoRows + '</div>' +
editFields +
'<button class="btn-full" onclick="updateBancoBalance(' + bancoId + ')" style="margin-bottom:12px">💾 Guardar cambios</button>' +
'<button onclick="deleteBanco(' + bancoId + ')" style="width:100%;padding:14px;background:var(--red-bg);border:1px solid var(--red-bdr);border-radius:var(--r-md);color:var(--red);font-size:14px;font-weight:700;cursor:pointer">🗑️ Eliminar esta cuenta</button>' +
'</div>';
}
function updateBancoBalance(bancoId) {
var b = DATA.bancos.find(function(x){ return x.id === bancoId; });
if (!b) return;
if (b.esTarjeta) {
var dispUSD = parseFloat(v('edit-banco-disp-usd')) || 0;
var dispDOP = b.pais !== 'US' ? (parseFloat(v('edit-banco-disp-dop')) || 0) : 0;
b.dispUSD = dispUSD;
b.dispDOP = dispDOP;
b.saldoUSD = Math.max(0, Math.round(((b.limUSD||0) - dispUSD)*100)/100);
b.saldoDOP = b.pais !== 'US' ? Math.max(0, Math.round(((b.limDOP||0) - dispDOP)*100)/100) : 0;
b.bal = b.saldoUSD;
var deuda = (DATA.deudas||[]).find(function(d){ return d.tcId === b.id; });
if (deuda) { deuda.bal = b.saldoUSD; if (b.saldoUSD===0) deuda.estado='Pagado'; }
} else {
var newBal = parseFloat(v('edit-banco-bal'));
if (isNaN(newBal)) { showToast('Ingresa un balance válido'); return; }
b.bal = newBal;
}
save(); closeSheet(); refreshCuentas(); refreshHome();
showToast(t('balance_updated'));
}
function deleteBanco(bancoId) {
var idx = DATA.bancos.findIndex(function(x){ return x.id === bancoId; });
if (idx === -1) { showToast('Cuenta no encontrada'); return; }
var nombre = DATA.bancos[idx].banco;
DATA.bancos.splice(idx, 1);
save(); closeSheet(); refreshCuentas(); refreshHome();
showToast('Cuenta "' + nombre + '" eliminada');
}
function buildBancoSheet() {
var bancosRD = ['🇩🇴 Banco Popular Dominicano','🇩🇴 Banco de Reservas','🇩🇴 Banco BHD','🇩🇴 Scotiabank República Dominicana','🇩🇴 Banco Santa Cruz','🇩🇴 Banco Caribe','🇩🇴 Banco López de Haro','🇩🇴 Banco Promerica','🇩🇴 Banco Vimenca'];
return '<div class="step-header"><button class="step-back" onclick="openAddMenu()">←</button>' +
'<div class="step-title">Agregar cuenta</div></div>' +
'<div style="padding:0 16px 16px">' +
'<div class="form-field"><label>Tipo</label><select id="bc-tipo-cuenta" onchange="togBancoTipoSheet()"><option value="cuenta">🏦 Cuenta de banco</option><option value="tarjeta">💳 Tarjeta de crédito</option></select></div>' +
'<div class="form-field"><label>País</label><select id="bc-pais" onchange="updBancoOptions()"><option value="RD">🇩🇴 República Dominicana</option><option value="US">🇺🇸 USA</option></select></div>' +
'<div class="form-field"><label>Banco / Emisor</label><select id="bc-banco">' + bancosRD.map(function(b){ return '<option>'+b+'</option>'; }).join('') + '</select></div>' +
'<div id="blk-bc-cuenta">' +
'<div class="form-row"><div class="form-field"><label>Tipo cuenta</label><select id="bc-subtipo"><option>Corriente</option><option>Ahorros</option><option>Empresarial</option></select></div><div class="form-field"><label>Moneda</label><select id="bc-mon"><option>DOP</option><option>USD</option></select></div></div>' +
'<div class="form-field"><label>Balance actual</label><input id="bc-bal" type="number" placeholder="0.00" inputmode="decimal"></div>' +
'</div>' +
'<div id="blk-bc-tarjeta" style="display:none">' +
'<div class="form-field"><label>Nombre de la tarjeta</label><input id="tc-nombre" type="text" placeholder="Ej: BHD Black, Chase Sapphire"></div>' +
'<div class="form-row"><div class="form-field"><label>Límite (USD)</label><input id="tc-lim-usd" type="number" placeholder="0.00" inputmode="decimal" oninput="calcTCSaldoSheet()"></div><div class="form-field" id="tc-lim-dop-field"><label>Límite (DOP)</label><input id="tc-lim-dop" type="number" placeholder="0.00" inputmode="decimal" oninput="calcTCSaldoSheet()"></div></div>' +
'<div class="form-row"><div class="form-field"><label>Disponible (USD)</label><input id="tc-disp-usd" type="number" placeholder="0.00" inputmode="decimal" oninput="calcTCSaldoSheet()"></div><div class="form-field" id="tc-disp-dop-field"><label>Disponible (DOP)</label><input id="tc-disp-dop" type="number" placeholder="0.00" inputmode="decimal" oninput="calcTCSaldoSheet()"></div></div>' +
'<div id="tc-saldo-preview" style="display:none;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-sm);padding:11px 13px;margin-bottom:10px">' +
'<div style="font-size:11px;color:var(--blue);font-weight:700;margin-bottom:8px">💳 SALDO QUE DEBES (calculado)</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
'<div style="background:var(--bg);border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:var(--t3)">En USD</div><div id="tc-saldo-usd-lbl" style="font-size:17px;font-weight:800;color:var(--red)">$0.00</div></div>' +
'<div style="background:var(--bg);border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:var(--t3)">En DOP</div><div id="tc-saldo-dop-lbl" style="font-size:17px;font-weight:800;color:var(--red)">RD$0.00</div></div>' +
'</div></div>' +
'<div class="form-row"><div class="form-field"><label>📅 Fecha de corte</label><input id="tc-corte" type="date"></div><div class="form-field"><label>💳 Fecha límite pago</label><input id="tc-pago" type="date"></div></div>' +
'</div>' +
'<div class="form-field"><label>Últimos 4 dígitos</label><input id="bc-digits" type="text" maxlength="4" placeholder="1234" inputmode="numeric"></div>' +
'<button class="btn-full" onclick="saveBanco()">Guardar cuenta</button></div>';
}
function togBancoTipoSheet() {
var t = v('bc-tipo-cuenta');
show('blk-bc-tarjeta'); hide('blk-bc-tarjeta');
var c = document.getElementById('blk-bc-cuenta'), tc = document.getElementById('blk-bc-tarjeta');
if (c) c.style.display = t === 'tarjeta' ? 'none' : 'block';
if (tc) tc.style.display = t === 'tarjeta' ? 'block' : 'none';
}
function updBancoOptions() {
var pais = v('bc-pais');
var sel = document.getElementById('bc-banco');
var monSel = document.getElementById('bc-mon');
if (!sel) return;
var list = pais === 'US' ? ['JPMorgan Chase','Bank of America','Wells Fargo','Citibank','Capital One','PNC Bank','U.S. Bank','Truist','TD Bank','Huntington Bank'] : ['Banco Popular Dominicano','Banco de Reservas','Banco BHD','Scotiabank República Dominicana','Banco Santa Cruz','Banco Caribe','Banco López de Haro','Banco Promerica','Banco Vimenca'];
sel.innerHTML = list.map(function(b){ return '<option>'+b+'</option>'; }).join('');
if (monSel) monSel.value = pais === 'US' ? 'USD' : 'DOP';

// Mostrar/ocultar campos de DOP según país para tarjetas
var limDopField = document.getElementById('tc-lim-dop-field');
var dispDopField = document.getElementById('tc-disp-dop-field');
var saldoDopLbl = document.querySelector('#tc-saldo-preview [id="tc-saldo-dop-lbl"]')?.parentElement;
var saldoPreview = document.getElementById('tc-saldo-preview');

if (pais === 'US') {
  // Ocultar DOP en USA
  if (limDopField) limDopField.style.display = 'none';
  if (dispDopField) dispDopField.style.display = 'none';
  if (saldoDopLbl) saldoDopLbl.style.display = 'none';
  // Limpiar valores DOP
  if (document.getElementById('tc-lim-dop')) document.getElementById('tc-lim-dop').value = '';
  if (document.getElementById('tc-disp-dop')) document.getElementById('tc-disp-dop').value = '';
} else {
  // Mostrar DOP en RD
  if (limDopField) limDopField.style.display = 'block';
  if (dispDopField) dispDopField.style.display = 'block';
  if (saldoDopLbl) saldoDopLbl.style.display = 'block';
}
}
function calcTCSaldoSheet() {
var limUSD = parseFloat(v('tc-lim-usd')) || 0, limDOP = parseFloat(v('tc-lim-dop')) || 0;
var dispUSD = parseFloat(v('tc-disp-usd')) || 0, dispDOP = parseFloat(v('tc-disp-dop')) || 0;
var prev = document.getElementById('tc-saldo-preview');
if (!prev) return;
if ((!limUSD && !limDOP) || (!dispUSD && !dispDOP)) { prev.style.display = 'none'; return; }
var saldoUSD = limUSD > 0 ? Math.max(0, limUSD - dispUSD) : 0;
var saldoDOP = limDOP > 0 ? Math.max(0, limDOP - dispDOP) : 0;
prev.style.display = 'block';
el('tc-saldo-usd-lbl', fmt(saldoUSD, 'USD'));
el('tc-saldo-dop-lbl', fmt(saldoDOP, 'DOP'));
}
function saveBanco() {
var esTarjeta = v('bc-tipo-cuenta') === 'tarjeta';
var banco = (v('bc-banco')||'').trim();
if (!banco) { showToast(t('select_bank')); return; }
if (esTarjeta) {
var limUSD = parseFloat(v('tc-lim-usd')) || 0, limDOP = parseFloat(v('tc-lim-dop')) || 0;
if (!limUSD && !limDOP) { showToast('Ingresa el límite de la tarjeta'); return; }
var dispUSD = parseFloat(v('tc-disp-usd')) || limUSD, dispDOP = parseFloat(v('tc-disp-dop')) || 0;
var saldoUSD = limUSD > 0 ? Math.max(0, Math.round((limUSD - dispUSD) * 100) / 100) : 0;
var saldoDOP = limDOP > 0 ? Math.max(0, Math.round((limDOP - dispDOP) * 100) / 100) : 0;
var tcNom = v('tc-nombre') || banco;
var bancoId = Date.now();
DATA.bancos.push({
id: bancoId, banco: banco, nom: tcNom, tipo: 'Tarjeta crédito', mon: 'USD',
bal: saldoUSD, pais: v('bc-pais'), ultimos: v('bc-digits'), esTarjeta: true,
limUSD: limUSD, limDOP: limDOP, dispUSD: dispUSD, dispDOP: dispDOP,
saldoUSD: saldoUSD, saldoDOP: saldoDOP, corte: v('tc-corte'), pagoFecha: v('tc-pago')
});
if (saldoUSD > 0 || saldoDOP > 0) {
DATA.deudas.push({
id: bancoId + 1, nom: tcNom, tipo: 'Tarjeta crédito', mon: 'USD',
bal: saldoUSD, balDOP: saldoDOP, original: saldoUSD, totalPaid: 0,
fecha: v('tc-pago'), estado: 'Activo', esTCDeuda: true, tcId: bancoId
});
}
} else {
var bal = parseFloat(v('bc-bal')) || 0;
var bancNom = (v('bc-banco')||'').trim();
DATA.bancos.push({ id: Date.now(), banco: bancNom, nom: bancNom, tipo: v('bc-subtipo'), mon: v('bc-mon'), bal: bal, pais: v('bc-pais'), ultimos: v('bc-digits'), esTarjeta: false });
}
save(); closeSheet(); refreshCuentas(); refreshHome();
showToast(t('account_saved'));
}
function ccStatus(tc) {
if (!tc.pagoFecha) return { cls: 'badge-green', txt: '✅ Activa' };
var days = dU(tc.pagoFecha);
if (days === null) return { cls: 'badge-green', txt: '✅ Activa' };
if (days < 0) return { cls: 'badge-red', txt: '⛔ Pago vencido' };
if (days <= 5) return { cls: 'badge-red', txt: '⚠️ Pago en ' + days + 'd' };
if (days <= 15) return { cls: 'badge-gold', txt: '🔔 Pago en ' + days + 'd' };
return { cls: 'badge-green', txt: '✅ Disponible' };
}
function dU(ds) { if (!ds) return null; var d = new Date(ds + 'T12:00:00'), n = new Date(); n.setHours(0,0,0,0); return Math.round((d - n) / 86400000); }
function buildPagarDeudaSheet(deudaId) {
var deuda = DATA.deudas.find(function(d){ return d.id === deudaId; });
if (!deuda) return '<div style="padding:20px"><p style="color:var(--t2)">Deuda no encontrada.</p></div>';
var tc = null;
if (deuda.tcId) {
tc = DATA.bancos.find(function(b){ return b.id === deuda.tcId; });
}
if (!tc) {
tc = DATA.bancos.find(function(b){ return b.esTarjeta && (b.nom===deuda.nom || b.banco===deuda.nom || (b.nom||'').toLowerCase().indexOf(deuda.nom.toLowerCase())>=0); });
}
if (tc && !deuda.tcId) deuda.tcId = tc.id;
var saldoUSD = tc ? (tc.saldoUSD||0) : (deuda.mon==='USD' ? (deuda.bal||0) : 0);
var saldoDOP = tc ? (tc.saldoDOP||0) : (deuda.mon==='DOP' ? (deuda.bal||0) : 0);
var isRDCard = tc && tc.pais !== 'US' && (saldoDOP > 0 || (tc.limDOP||0) > 0);
var hasBothBalances = saldoUSD > 0 && saldoDOP > 0;
var tasa = DATA.tasa || 58.85;
var cuentasUSD = DATA.bancos.filter(function(b){ return !b.esTarjeta && b.mon === 'USD' && (b.bal||0) > 0; });
var cuentasDOP = DATA.bancos.filter(function(b){ return !b.esTarjeta && b.mon === 'DOP' && (b.bal||0) > 0; });
var todasCuentas = DATA.bancos.filter(function(b){ return !b.esTarjeta; });
function cuentaOpt(b) {
return '<option value="' + b.id + '">' + b.banco + (b.ultimos?' ···'+b.ultimos:'') + ' — ' + (b.mon==='DOP'?'RD$'+Math.round(b.bal||0).toLocaleString('es-DO'):fmt(b.bal||0,'USD')) + '</option>';
}
var html = '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">💳 Pagar deuda</div>' +
'<div class="step-sub">' + deuda.nom + '</div></div>' +
'<div style="padding:0 16px 24px">';
if (isRDCard) {
html += '<div style="background:var(--red-bg);border:1px solid var(--red-bdr);border-radius:var(--r-md);padding:14px 16px;margin-bottom:16px">' +
'<div style="font-size:11px;color:var(--red);font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">Saldos pendientes</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
'<div style="text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:3px">EN DÓLARES</div>' +
'<div style="font-size:20px;font-weight:900;color:' + (saldoUSD>0?'var(--red)':'var(--t3)') + '">' + fmt(saldoUSD,'USD') + '</div></div>' +
'<div style="text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:3px">EN PESOS</div>' +
'<div style="font-size:20px;font-weight:900;color:' + (saldoDOP>0?'var(--red)':'var(--t3)') + '">RD$' + Math.round(saldoDOP).toLocaleString('es-DO') + '</div></div>' +
'</div>' +
'<div style="font-size:11px;color:var(--t3);text-align:center;margin-top:8px">Tasa: 1 USD = ' + tasa.toFixed(2) + ' DOP</div>' +
'</div>';
if (saldoUSD > 0) {
html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;margin-bottom:12px">' +
'<div style="font-size:12px;font-weight:700;color:var(--t1);margin-bottom:10px">💵 Pagar saldo en USD</div>' +
'<div class="form-field"><label>Monto USD a pagar</label><input id="pd-usd-monto" type="number" placeholder="0.00" inputmode="decimal" value="' + saldoUSD + '" oninput="updPagoConversion()"></div>' +
'<div class="form-field"><label>Pagar con</label><select id="pd-usd-cuenta" onchange="updPagoConversion()">' +
'<option value="">— Sin descontar de cuenta —</option>' +
(cuentasUSD.length ? '<optgroup label="Cuentas en USD">' + cuentasUSD.map(cuentaOpt).join('') + '</optgroup>' : '') +
(cuentasDOP.length ? '<optgroup label="Cuentas en DOP (conversión automática)">' + cuentasDOP.map(cuentaOpt).join('') + '</optgroup>' : '') +
'</select></div>' +
'<div id="pd-usd-conversion" style="display:none;background:var(--gold-dim);border:1px solid var(--gold);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--gold);margin-bottom:10px"></div>' +
'<button class="btn-full" onclick="pagarDeudaUSD(' + deudaId + ')">✅ Pagar en USD</button>' +
'</div>';
}
if (saldoDOP > 0) {
html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;margin-bottom:12px">' +
'<div style="font-size:12px;font-weight:700;color:var(--t1);margin-bottom:10px">🇩🇴 Pagar saldo en DOP</div>' +
'<div class="form-field"><label>Monto DOP a pagar</label><input id="pd-dop-monto" type="number" placeholder="0" inputmode="decimal" value="' + Math.round(saldoDOP) + '"></div>' +
'<div class="form-field"><label>Pagar con cuenta DOP</label><select id="pd-dop-cuenta">' +
'<option value="">— Sin descontar de cuenta —</option>' +
(cuentasDOP.length ? cuentasDOP.map(cuentaOpt).join('') : '') +
'</select></div>' +
'<button class="btn-full" onclick="pagarDeudaDOP(' + deudaId + ')">✅ Pagar en DOP</button>' +
'</div>';
}
} else {
html += '<div style="background:var(--red-bg);border:1px solid var(--red-bdr);border-radius:var(--r-md);padding:12px 16px;margin-bottom:16px;text-align:center">' +
'<div style="font-size:10px;color:var(--red);margin-bottom:4px">SALDO PENDIENTE</div>' +
'<div style="font-size:24px;font-weight:900;color:var(--red)">' + fmt(deuda.bal||0, deuda.mon) + '</div>' +
'</div>' +
'<div class="form-field"><label>Monto a pagar</label><input id="pd-monto" type="number" placeholder="0.00" inputmode="decimal" value="' + (deuda.bal||0) + '"></div>' +
(todasCuentas.length
? '<div class="form-field"><label>Pagar desde cuenta</label><select id="pd-banco"><option value="">— Sin descontar —</option>' + todasCuentas.map(cuentaOpt).join('') + '</select></div>'
: '<div style="background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.2);border-radius:var(--r-sm);padding:10px 12px;font-size:12px;color:var(--gold);margin-bottom:12px;font-weight:600">⚠️ Sin cuentas registradas. El pago se registrará sin descontar de ninguna cuenta.</div>') +
'<button class="btn-full" onclick="pagarDeuda(' + deudaId + ', v(\'pd-monto\'), v(\'pd-banco\')?parseInt(v(\'pd-banco\')):null)">✅ Registrar pago</button>';
}
html += '</div>';
return html;
}
function updPagoConversion() {
var sel = document.getElementById('pd-usd-cuenta');
var conv = document.getElementById('pd-usd-conversion');
var monto = parseFloat(v('pd-usd-monto')) || 0;
if (!sel || !conv) return;
var bancoId = parseInt(sel.value);
var banco = bancoId ? DATA.bancos.find(function(b){ return b.id === bancoId; }) : null;
if (banco && banco.mon === 'DOP' && monto > 0) {
var tasa = DATA.tasa || 58.85;
var montoEnDOP = Math.round(monto * tasa * 100) / 100;
conv.style.display = 'block';
conv.innerHTML = '🔄 Se descontarán <strong>RD$' + montoEnDOP.toLocaleString('es-DO') + '</strong> de ' + banco.banco +
'<br><small>(' + fmt(monto,'USD') + ' × ' + tasa.toFixed(2) + ' = RD$' + montoEnDOP.toLocaleString('es-DO') + ')</small>';
} else {
conv.style.display = 'none';
}
}
function pagarDeudaUSD(deudaId) {
var deuda = DATA.deudas.find(function(d){ return d.id === deudaId; });
if (!deuda) return;
var monto = parseFloat(v('pd-usd-monto'));
if (!monto || monto <= 0) { showToast('Ingresa un monto válido'); return; }
var bancoId = parseInt(v('pd-usd-cuenta')) || 0;
var banco = bancoId ? DATA.bancos.find(function(b){ return b.id === bancoId; }) : null;
var tasa = DATA.tasa || 58.85;
if (banco) {
if (banco.mon === 'USD') {
if (monto > (banco.bal||0)) { showToast('Fondos insuficientes: ' + fmt(banco.bal||0,'USD') + ' disponibles'); return; }
banco.bal = Math.round(((banco.bal||0) - monto)*100)/100;
} else if (banco.mon === 'DOP') {
var montoEnDOP = Math.round(monto * tasa * 100) / 100;
if (montoEnDOP > (banco.bal||0)) { showToast('Fondos insuficientes: RD$' + Math.round(banco.bal||0).toLocaleString('es-DO') + ' disponibles'); return; }
banco.bal = Math.round(((banco.bal||0) - montoEnDOP)*100)/100;
}
}
deuda.bal = Math.max(0, Math.round(((deuda.bal||0) - monto)*100)/100);
deuda.totalPaid = (deuda.totalPaid||0) + monto;
var tc2 = deuda.tcId ? DATA.bancos.find(function(b){ return b.id === deuda.tcId; }) : null;
if (tc2) {
tc2.saldoUSD = Math.max(0, Math.round(((tc2.saldoUSD||0) - monto)*100)/100);
tc2.bal = tc2.saldoUSD;
tc2.dispUSD = Math.min(tc2.limUSD||0, (tc2.dispUSD||0) + monto);
if (tc2.saldoUSD === 0 && tc2.saldoDOP === 0) deuda.estado = 'Pagado';
} else if (deuda.bal === 0) {
deuda.estado = 'Pagado';
}
if (!deuda.pagos) deuda.pagos = [];
deuda.pagos.push({ fecha: new Date().toISOString().slice(0,10), monto: monto, mon:'USD', desde: banco?banco.banco:'Manual' });
var dd = dateInfo();
DATA.gastos.push({ id: Date.now(), monto: monto, mon:'USD', cat:'💳 Deuda/Préstamo', desc:'Pago USD: '+deuda.nom, fecha:new Date().toISOString().slice(0,10), month:dd.month, year:dd.year });
save(); closeSheet(); refreshHome(); refreshCuentas();
showToast('✅ Pago USD registrado: ' + fmt(monto,'USD') + (banco?' desde '+banco.banco:''));
}
function pagarDeudaDOP(deudaId) {
var deuda = DATA.deudas.find(function(d){ return d.id === deudaId; });
if (!deuda) return;
var monto = parseFloat(v('pd-dop-monto'));
if (!monto || monto <= 0) { showToast('Ingresa un monto válido'); return; }
var bancoId = parseInt(v('pd-dop-cuenta')) || 0;
var banco = bancoId ? DATA.bancos.find(function(b){ return b.id === bancoId; }) : null;
if (banco) {
if (monto > (banco.bal||0)) { showToast('Fondos insuficientes: RD$' + Math.round(banco.bal||0).toLocaleString('es-DO') + ' disponibles'); return; }
banco.bal = Math.round(((banco.bal||0) - monto)*100)/100;
}
deuda.balDOP = Math.max(0, Math.round(((deuda.balDOP||0) - monto)*100)/100);
var tc3 = deuda.tcId ? DATA.bancos.find(function(b){ return b.id === deuda.tcId; }) : null;
if (tc3) {
tc3.saldoDOP = Math.max(0, Math.round(((tc3.saldoDOP||0) - monto)*100)/100);
tc3.dispDOP = Math.min(tc3.limDOP||0, (tc3.dispDOP||0) + monto);
if (tc3.saldoUSD === 0 && tc3.saldoDOP === 0) deuda.estado = 'Pagado';
} else if (deuda.bal === 0 && deuda.balDOP === 0) {
deuda.estado = 'Pagado';
}
if (!deuda.pagos) deuda.pagos = [];
deuda.pagos.push({ fecha: new Date().toISOString().slice(0,10), monto: monto, mon:'DOP', desde: banco?banco.banco:'Manual' });
var dd = dateInfo();
DATA.gastos.push({ id: Date.now(), monto: monto, mon:'DOP', cat:'💳 Deuda/Préstamo', desc:'Pago DOP: '+deuda.nom, fecha:new Date().toISOString().slice(0,10), month:dd.month, year:dd.year });
save(); closeSheet(); refreshHome(); refreshCuentas();
showToast('✅ Pago DOP registrado: RD$' + Math.round(monto).toLocaleString('es-DO') + (banco?' desde '+banco.banco:''));
}
function pagarDeuda(deudaId, monto, bancoId) {
var deuda = DATA.deudas.find(function(d){ return d.id === deudaId; });
if (!deuda) { showToast('Deuda no encontrada'); return; }
monto = parseFloat(monto);
if (!monto || monto <= 0) { showToast('Ingresa un monto válido'); return; }
var banco = bancoId ? DATA.bancos.find(function(b){ return b.id === bancoId; }) : null;
if (banco) {
if (banco.esTarjeta) { showToast('Selecciona una cuenta de banco, no una tarjeta'); return; }
if (monto > (banco.bal||0)) { showToast('Fondos insuficientes en ' + banco.banco); return; }
banco.bal = Math.round(((banco.bal||0) - monto)*100)/100;
}
deuda.bal = Math.max(0, Math.round(((deuda.bal||0) - monto)*100)/100);
deuda.totalPaid = (deuda.totalPaid||0) + monto;
if (deuda.bal === 0) deuda.estado = 'Pagado';
if (deuda.esTCDeuda && deuda.tcId) {
var tc = DATA.bancos.find(function(b){ return b.id === deuda.tcId; });
if (tc) { tc.saldoUSD = deuda.bal; tc.bal = deuda.bal; tc.dispUSD = Math.min(tc.limUSD||0,(tc.dispUSD||0)+monto); if (deuda.bal===0) tc.saldoDOP=0; }
}
if (!deuda.pagos) deuda.pagos = [];
deuda.pagos.push({ fecha: new Date().toISOString().slice(0,10), monto: monto, desde: banco?banco.banco:'Manual' });
if (banco) {
var d = dateInfo();
DATA.gastos.push({ id: Date.now(), monto: monto, mon: banco.mon, cat:'💳 Deuda/Préstamo', desc:'Pago: '+deuda.nom, fecha:new Date().toISOString().slice(0,10), month:d.month, year:d.year });
}
save(); closeSheet(); refreshHome(); refreshCuentas();
showToast('Pago registrado ✓ ' + fmt(monto, banco?banco.mon:deuda.mon));
}
function getCustomCats() {
try { return JSON.parse(localStorage.getItem('grd3_custom_cats') || '[]'); } catch(e) { return []; }
}
function setCustomCats(arr) {
try { localStorage.setItem('grd3_custom_cats', JSON.stringify(arr)); } catch(e) {}
}
function getAllCats() {
return CAT_LIST.concat(getCustomCats());
}
function buildCategoriasSheet() {
var custom = getCustomCats();
var listHTML = custom.length ? custom.map(function(c, i) {
return '<div class="list-item"><span style="font-size:14px;color:var(--t1)">' + c[0] + '</span>' +
'<button onclick="deleteCustomCat(' + i + ')" style="background:none;border:none;color:var(--red);font-size:15px;cursor:pointer">🗑️</button></div>';
}).join('') : '<div class="empty-state"><div class="empty-icon">🏷️</div><div class="empty-text">Sin categorías personalizadas aún</div></div>';
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">Categorías personalizadas</div><div class="step-sub">Crea tus propias categorías de gasto, además de las predeterminadas.</div></div>' +
'<div style="padding:0 16px 16px">' +
'<div class="form-field"><label>Emoji</label><input id="newcat-emoji" type="text" maxlength="4" placeholder="🏷️" style="font-size:22px;text-align:center"></div>' +
'<div class="form-field"><label>Nombre</label><input id="newcat-name" type="text" placeholder="Ej: Gimnasio, Mascotas..."></div>' +
'<button class="btn-full" onclick="saveCustomCat()">Guardar categoría</button>' +
'<div style="margin-top:18px;font-size:11px;color:var(--t3);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Mis categorías</div>' +
listHTML +
'</div>';
}
function saveCustomCat() {
var emoji = v('newcat-emoji').trim();
var name = v('newcat-name').trim();
if (!name) { showToast('Ingresa el nombre de la categoría'); return; }
var label = (emoji ? emoji + ' ' : '🏷️ ') + name;
var custom = getCustomCats();
var exists = custom.some(function(c){ return c[0] === label; }) || CAT_LIST.some(function(c){ return c[0] === label; });
if (exists) { showToast('Esa categoría ya existe'); return; }
custom.push([label, emoji || '🏷️']);
setCustomCats(custom);
showToast('Categoría "' + label + '" creada ✓');
openSheet('categorias');
}
function deleteCustomCat(idx) {
var custom = getCustomCats();
custom.splice(idx, 1);
setCustomCats(custom);
showToast('Categoría eliminada');
openSheet('categorias');
}
function buildPresupuestoSheet() {
var catOpts = getAllCats().map(function(c){ return '<option>' + c[0] + '</option>'; }).join('');
var cur = DATA.curMonth, curY = DATA.curYear;
var curGas = (DATA.gastos||[]).filter(function(x){ return x.month===cur && x.year===curY; });
var listHTML = '';
if (DATA.presupuesto.length) {
listHTML = DATA.presupuesto.map(function(p, i) {
var spent = curGas.filter(function(g){ return g.cat===p.cat; }).reduce(function(a,g){ return a+toUSD(g.monto,g.mon); }, 0);
var lim = toUSD(p.lim, p.mon);
var pct = lim > 0 ? Math.min(100, Math.round(spent/lim*100)) : 0;
var color = pct >= 90 ? 'var(--red)' : pct >= 75 ? 'var(--gold)' : 'var(--green)';
return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
'<span style="font-size:14px;font-weight:600;color:var(--t1)">' + p.cat + '</span>' +
'<div style="display:flex;align-items:center;gap:8px">' +
'<span style="font-size:13px;color:var(--t2)">' + fmt(spent) + ' / ' + fmt(p.lim,p.mon) + '</span>' +
'<button onclick="deletePresupuesto(' + i + ')" style="background:none;border:none;color:var(--red);font-size:14px;cursor:pointer;padding:0">✕</button>' +
'</div>' +
'</div>' +
'<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">' +
'<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:3px;transition:width .4s"></div>' +
'</div>' +
'<div style="font-size:11px;color:' + color + ';margin-top:3px;font-weight:600">' + pct + '% usado</div>' +
'</div>';
}).join('');
} else {
listHTML = '<div class="empty-state" style="padding:20px 0"><div class="empty-icon">📊</div><div class="empty-text">Sin presupuestos definidos</div><div class="empty-sub">Define límites por categoría para controlar tus gastos</div></div>';
}
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">Presupuesto mensual</div></div>' +
'<div style="padding:0 16px 20px">' +
listHTML +
'<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">' +
'<div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px">+ Agregar límite</div>' +
'<div class="form-field"><label>Categoría</label><select id="pb-cat">' + catOpts + '</select></div>' +
'<div class="form-row"><div class="form-field"><label>Límite</label><input id="pb-lim" type="number" placeholder="0.00" inputmode="decimal"></div><div class="form-field"><label>Moneda</label><select id="pb-mon"><option>USD</option><option>DOP</option></select></div></div>' +
'<button class="btn-full" onclick="savePresupuesto()">Guardar</button>' +
'</div></div>';
}
function deletePresupuesto(i) {
DATA.presupuesto.splice(i, 1);
save(); openSheet('add-presupuesto');
}
function savePresupuesto() {
var cat = v('pb-cat'), lim = parseFloat(v('pb-lim'));
if (!cat || !lim) { showToast('Completa los campos'); return; }
var ex = DATA.presupuesto.findIndex(function(p){ return p.cat === cat; });
var entry = { cat: cat, lim: lim, mon: v('pb-mon') };
if (ex >= 0) DATA.presupuesto[ex] = entry; else DATA.presupuesto.push(entry);
save(); closeSheet(); refreshHome();
showToast('Presupuesto guardado ✓');
}
function buildGastosFijosSheet() {
if (!DATA.gastosFijos) DATA.gastosFijos = [];
var cuentas = (DATA.bancos||[]).filter(function(b){ return !b.esTarjeta; });
var cuentaOpts = '<option value="">— Sin descontar de cuenta —</option>' +
cuentas.map(function(b){ return '<option value="' + b.id + '">' + b.banco + (b.ultimos?' ···'+b.ultimos:'') + ' (' + fmt(b.bal||0,b.mon) + ')</option>'; }).join('');
var listHTML = DATA.gastosFijos.length
? DATA.gastosFijos.map(function(f, i) {
var cuentaNom = f.bancoId ? (function(){ var b=(DATA.bancos||[]).find(function(x){return x.id===f.bancoId;}); return b?b.banco:''; })() : '';
return '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
'<div style="width:40px;height:40px;border-radius:12px;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🔁</div>' +
'<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--t1)">' + f.desc + '</div>' +
'<div style="font-size:12px;color:var(--t3)">Día ' + f.dia + ' · ' + (f.cat||'').split(' ').slice(1).join(' ') + (cuentaNom?' · '+cuentaNom:'') + '</div></div>' +
'<div style="display:flex;align-items:center;gap:6px">' +
'<span style="font-size:14px;font-weight:700;color:var(--red)">−' + fmt(f.monto,f.mon) + '</span>' +
'<button onclick="applyGastoFijo(' + i + ')" style="background:var(--gold-dim);border:1px solid var(--gold);color:var(--gold);border-radius:8px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer">▶ Aplicar</button>' +
'<button onclick="delGastoFijo(' + i + ')" style="background:var(--red-bg);border:1px solid var(--red-bdr);color:var(--red);border-radius:8px;padding:5px 8px;font-size:11px;cursor:pointer">✕</button>' +
'</div></div>';
}).join('')
: '<div class="empty-state" style="padding:20px 0"><div class="empty-icon">🔁</div><div class="empty-text">Sin gastos fijos guardados</div><div class="empty-sub">Guarda gastos mensuales y aplícalos con un toque</div></div>';
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">Gastos fijos</div><div class="step-sub">Recurrentes mensuales</div></div>' +
'<div style="padding:0 16px 20px">' +
listHTML +
'<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">' +
'<div style="font-size:12px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px">+ Agregar gasto fijo</div>' +
'<div class="form-field"><label>Descripción</label><input id="gfj-desc" type="text" placeholder="Ej: Netflix, Gimnasio..."></div>' +
'<div class="form-row">' +
'<div class="form-field"><label>Monto</label><input id="gfj-monto" type="number" placeholder="0.00" inputmode="decimal"></div>' +
'<div class="form-field"><label>Moneda</label><select id="gfj-mon"><option>USD</option><option>DOP</option></select></div>' +
'</div>' +
'<div class="form-row">' +
'<div class="form-field"><label>Día del mes</label><input id="gfj-dia" type="number" placeholder="1-31" min="1" max="31"></div>' +
'<div class="form-field"><label>Descontar de cuenta</label><select id="gfj-banco">' + cuentaOpts + '</select></div>' +
'</div>' +
'<div class="form-field"><label>Categoría</label><select id="gfj-cat">' + getAllCats().map(function(c){ return '<option>' + c[0] + '</option>'; }).join('') + '</select></div>' +
'<button class="btn-full" onclick="saveGastoFijo()">Guardar gasto fijo</button>' +
'</div></div>';
}
function saveGastoFijo() {
var desc = v('gfj-desc'), monto = parseFloat(v('gfj-monto'));
if (!desc || !monto) { showToast('Completa descripción y monto'); return; }
if (!DATA.gastosFijos) DATA.gastosFijos = [];
var bancoId = v('gfj-banco') ? parseInt(v('gfj-banco')) || null : null;
DATA.gastosFijos.push({ desc: desc, monto: monto, mon: v('gfj-mon')||'USD', dia: parseInt(v('gfj-dia'))||1, cat: v('gfj-cat'), bancoId: bancoId });
save(); showToast('Gasto fijo guardado ✓'); openSheet('gastos-fijos');
}
function applyGastoFijo(i) {
if (!DATA.gastosFijos || !DATA.gastosFijos[i]) return;
var f = DATA.gastosFijos[i];
var today = new Date().toISOString().slice(0,10);
var d = dateInfo(today);
DATA.gastos.push({ id: Date.now(), monto: f.monto, mon: f.mon||'USD', cat: f.cat, desc: f.desc, fecha: today, month: d.month, year: d.year, source: '' });
if (f.bancoId) {
var banco = (DATA.bancos||[]).find(function(b){ return b.id === f.bancoId; });
if (banco) {
banco.bal = Math.round(((banco.bal||0) - f.monto) * 100) / 100;
showToast('✓ ' + f.desc + ' aplicado y descontado de ' + banco.banco);
} else {
showToast('✓ Gasto aplicado: ' + f.desc);
}
} else {
showToast('✓ Gasto aplicado: ' + f.desc);
}
save(); refreshHome(); refreshCuentas(); openSheet('gastos-fijos');
}
function delGastoFijo(i) {
if (!DATA.gastosFijos) return;
DATA.gastosFijos.splice(i, 1);
save();
openSheet('gastos-fijos');
}
function buildTasaSheet() {
return '<div class="step-header"><div class="step-title">Tasa USD / DOP</div></div>' +
'<div style="padding:0 16px 20px">' +
'<div style="text-align:center;margin-bottom:16px">' +
'<div style="font-size:14px;color:var(--t2);margin-bottom:8px">1 USD equivale a:</div>' +
'<input id="tasa-input" type="number" value="' + (DATA.tasa||58.85) + '" step="0.01" inputmode="decimal" style="font-size:36px;font-weight:800;color:var(--t1);background:none;border:none;width:100%;text-align:center;outline:none">' +
'<div style="font-size:16px;color:var(--t2)">DOP</div>' +
'</div>' +
'<button class="btn-full" onclick="saveTasa()">Actualizar tasa</button>' +
'<div style="font-size:12px;color:var(--t3);text-align:center;margin-top:12px">Fuente: Banco Central de la República Dominicana</div></div>';
}
function saveTasa() {
var t = parseFloat(v('tasa-input'));
if (t > 0) { DATA.tasa = t; save(); el('rate-display', t.toFixed(2)); showToast('Tasa actualizada ✓'); }
closeSheet();
}
