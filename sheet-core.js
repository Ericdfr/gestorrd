// sheet-core.js — hojas inferiores genéricas (abrir, cerrar, menú de agregar).
function openAddMenu() {
var en = DATA.lang === 'en';
var html = '<div class="add-menu-title">' + (en ? 'Add' : 'Agregar') + '</div>' +
'<div class="add-menu-grid">' +
makeAddBtn('🔁', en?'Fixed expense':'Gasto fijo',    en?'Monthly recurring':'Recurrente mensual', "openSheet('gastos-fijos')") +
makeAddBtn('💳', en?'Debt':'Deuda',                  en?'Card or loan':'Tarjeta o préstamo',     "openSheet('add-deuda')") +
makeAddBtn('🎯', en?'Goal':'Meta',                   en?'Savings goal':'Objetivo de ahorro',       "openSheet('add-meta')") +
makeAddBtn('🏦', en?'Account':'Cuenta',              en?'Bank or card':'Banco o tarjeta',          "openSheet('add-banco')") +
makeAddBtn('📊', en?'Budget':'Presupuesto',          en?'Category limit':'Límite por categoría',   "openSheet('add-presupuesto')") +
makeAddBtn('📥', en?'Import':'Importar',             en?'Upload bank CSV':'Subir CSV de tu banco', "openSheet('importar')") +
'</div><div style="height:16px"></div>';
openSheetWith(html);
}
function makeAddBtn(icon, label, sub, onclick) {
return '<button class="add-menu-btn" onclick="' + onclick + '">' +
'<div class="add-menu-icon">' + icon + '</div>' +
'<div class="add-menu-label">' + label + '</div>' +
'<div class="add-menu-sub">' + sub + '</div>' +
'</button>';
}
var _sheetStack = [];
function openSheet(type, id) {
closeSheet();
var html = '';
if (type === 'add-gasto') { if (!window._scanPrefill) { _selCat=''; _gastoMon='USD'; _selSource=''; } html = buildGastoSheet(); }
else if (type === 'add-ingreso') html = buildIngresoSheet();
else if (type === 'add-deuda') html = buildDeudaSheet();
else if (type === 'pagar-deuda') html = buildPagarDeudaSheet(id);
else if (type === 'add-meta') html = buildMetaSheet();
else if (type === 'add-banco') html = buildBancoSheet();
else if (type === 'add-presupuesto') html = buildPresupuestoSheet();
else if (type === 'tasa') html = buildTasaSheet();
else if (type === 'busqueda') html = buildBusquedaSheet();
else if (type === 'gastos-fijos') html = buildGastosFijosSheet();
else if (type === 'categorias') html = buildCategoriasSheet();
else if (type === 'novedades') html = buildNovedadesSheet();
else if (type === 'privacidad') html = buildPrivacidadSheet();
else if (type === 'terminos') html = buildTerminosSheet();
else if (type === 'cambiar-pwd') html = buildCambiarPwdSheet();
else if (type === 'edit-profile') html = buildEditProfileSheet();
else if (type === 'pin-settings') html = buildPinSettingsSheet();
else if (type === 'historial') html = buildHistorialSheet();
else if (type === 'tour') { window._tourIdx = 0; html = buildTourSheet(); }
else if (type === 'admin') { html = '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button><div class="step-title">🛡️ Panel Admin</div></div><div style="padding:16px" id="admin-content"><div style="text-align:center;padding:20px;color:var(--t3)">Cargando...</div></div>'; setTimeout(buildAdminPanel, 100); }
else if (type === 'ia-chat') {
  // Show AI consent on first use
  if (!localStorage.getItem('grd3_ia_consent')) {
    html = buildIAConsentSheet();
  } else {
    html = buildIASheet();
  }
}
else if (type === 'importar') html = buildImportSheet();
else if (type === 'edit-banco') html = buildEditBancoSheet(id);
else html = (function() {
  var en = DATA.lang === 'en';
  var notifications = [];
  // Check upcoming fixed expenses
  var today = new Date();
  var todayDay = today.getDate();
  (DATA.gastosFijos || []).forEach(function(gf) {
    var daysUntil = gf.dia >= todayDay ? gf.dia - todayDay : (30 - todayDay + gf.dia);
    if (daysUntil <= 7) {
      notifications.push({
        icon: '📅', color: daysUntil <= 2 ? 'var(--red)' : 'var(--gold)',
        title: gf.desc || gf.cat,
        sub: (en ? 'Due in ' : 'Vence en ') + daysUntil + (en ? ' days' : ' días') + ' · ' + (gf.mon === 'DOP' ? 'RD$' : '$') + (gf.monto || 0).toFixed(2)
      });
    }
  });
  // Check credit card payments
  (DATA.bancos || []).filter(function(b) { return b.esTarjeta && b.pagoFecha; }).forEach(function(b) {
    var days = (function(ds) { if (!ds) return null; var d = new Date(ds + 'T12:00:00'), n = new Date(); n.setHours(0,0,0,0); return Math.round((d-n)/86400000); })(b.pagoFecha);
    if (days !== null && days >= 0 && days <= 10) {
      notifications.push({
        icon: '💳', color: days <= 3 ? 'var(--red)' : 'var(--gold)',
        title: (b.nom || b.banco) + (en ? ' payment' : ' · Pago mínimo'),
        sub: (en ? 'Due in ' : 'Vence en ') + days + (en ? ' days' : ' días')
      });
    }
  });
  // Budget alerts
  var today2 = new Date();
  var curM = today2.getMonth(), curY = today2.getFullYear();
  (DATA.presupuesto || []).forEach(function(p) {
    var spent = (DATA.gastos || []).filter(function(g) { return g.month === curM && g.year === curY && g.cat === p.cat; }).reduce(function(a, g) { return a + (g.mon === 'DOP' ? g.monto / DATA.tasa : g.monto); }, 0);
    var pct = p.lim > 0 ? spent / p.lim : 0;
    if (pct >= 0.8) {
      notifications.push({
        icon: '📊', color: pct >= 1 ? 'var(--red)' : 'var(--gold)',
        title: p.cat + (en ? ' budget' : ' · Presupuesto'),
        sub: Math.round(pct * 100) + '% ' + (en ? 'used' : 'usado') + ' · $' + spent.toFixed(0) + ' / $' + p.lim
      });
    }
  });
  var content = notifications.length > 0
    ? notifications.map(function(n) {
        return '<div style="display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--border)">' +
          '<div style="width:40px;height:40px;border-radius:12px;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + n.icon + '</div>' +
          '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:var(--t1)">' + n.title + '</div>' +
          '<div style="font-size:12px;color:' + n.color + ';margin-top:2px;font-weight:600">' + n.sub + '</div></div>' +
        '</div>';
      }).join('')
    : '<div style="text-align:center;padding:32px 0"><div style="font-size:36px;margin-bottom:12px">✅</div><div style="font-size:14px;color:var(--t2)">' + (en ? 'No pending alerts' : 'Sin alertas pendientes') + '</div></div>';
  return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button><div class="step-title">🔔 ' + (en ? 'Notifications' : 'Notificaciones') + '</div></div><div style="padding:0 16px 60px">' + content + '</div>';
})();
openSheetWith(html);
}
function openSheetWith(html) {
elHTML('sheet-content', html);
var sh = document.getElementById('bottom-sheet');
var ov = document.getElementById('sheet-overlay');
if (sh) { sh.style.display = 'block'; sh.style.animation = 'sheetUp .28s ease'; }
if (ov) ov.classList.add('open');
}
function closeSheet() {
var sh = document.getElementById('bottom-sheet');
var ov = document.getElementById('sheet-overlay');
if (sh) sh.style.display = 'none';
if (ov) ov.classList.remove('open');
_wgStep = 1; _wgMonto = 0; _wgDesc = ''; _wgFecha = '';
_selCat = ''; _selSource = ''; _gastoMon = 'USD';
_iaHistory = []; _iaBusy = false;
}
