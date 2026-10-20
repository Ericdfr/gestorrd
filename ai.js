// ai.js — asistente IA: consentimiento, chat y respuestas locales por reglas (sin llamadas externas).
var _iaHistory = [];
var _iaBusy = false;
function buildIAConsentSheet() {
  return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
    '<div class="step-title">🧠 Asesor IA</div></div>' +
    '<div style="padding:20px 20px 32px">' +
    '<div style="text-align:center;margin-bottom:20px">' +
      '<div style="font-size:48px;margin-bottom:12px">🧠</div>' +
      '<div style="font-size:18px;font-weight:800;color:var(--t1);margin-bottom:8px">Asesor Financiero IA</div>' +
      '<div style="font-size:13px;color:var(--t2);line-height:1.6">Análisis inteligente de tus finanzas personales</div>' +
    '</div>' +
    '<div style="background:var(--bg3);border-radius:var(--r-md);padding:16px;margin-bottom:16px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:12px">Cómo funciona</div>' +
      '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">' +
        '<span style="font-size:18px">📱</span>' +
        '<div style="font-size:13px;color:var(--t2);line-height:1.5"><strong style="color:var(--t1)">Procesamiento local</strong><br>Tus datos financieros se analizan directamente en tu dispositivo.</div>' +
      '</div>' +
      '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">' +
        '<span style="font-size:18px">🔒</span>' +
        '<div style="font-size:13px;color:var(--t2);line-height:1.5"><strong style="color:var(--t1)">Sin envío externo</strong><br>GestorRD NO envía tus datos financieros a ningún servicio de IA externo (OpenAI, Google, etc.).</div>' +
      '</div>' +
      '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<span style="font-size:18px">🛡️</span>' +
        '<div style="font-size:13px;color:var(--t2);line-height:1.5"><strong style="color:var(--t1)">Tus datos son tuyos</strong><br>Solo se usan para generar respuestas dentro de la app. Nunca se comparten con terceros.</div>' +
      '</div>' +
    '</div>' +
    '<div style="background:var(--gold-dim);border:1px solid rgba(201,169,110,0.3);border-radius:var(--r-md);padding:12px;margin-bottom:20px;font-size:12px;color:var(--t2);line-height:1.5">' +
      '📋 Al continuar, confirmas que entiendes cómo el Asesor IA procesa tu información financiera según nuestra <button onclick="openSheet(\'privacidad\')" style="background:none;border:none;color:var(--gold);font-size:12px;cursor:pointer;padding:0;font-weight:700">Política de Privacidad</button>.' +
    '</div>' +
    '<button onclick="acceptIAConsent()" style="width:100%;padding:16px;background:var(--btn-bg);border:none;border-radius:var(--r-md);color:#fff;font-size:15px;font-weight:700;cursor:pointer">Entendido, usar Asesor IA</button>' +
    '<button onclick="closeSheet()" style="width:100%;padding:12px;background:none;border:none;color:var(--t3);font-size:13px;cursor:pointer;margin-top:8px">Cancelar</button>' +
    '</div>';
}

function acceptIAConsent() {
  localStorage.setItem('grd3_ia_consent', '1');
  elHTML('sheet-content', buildIASheet());
}

function buildIASheet() {
var preguntas = [
'¿En qué gasté más este mes?',
'¿Cómo puedo ahorrar más?',
'¿Puedo comprar un carro?',
'¿Cuánto me falta para mi meta?',
'¿Cuándo termino de pagar mis deudas?',
'¿Cuál es mi mayor problema financiero?'
];
var chips = preguntas.map(function(q){
return '<button onclick="sendIAQuestion(\'' + q.replace(/'/g,"\\'") + '\')" style="background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:var(--t1);cursor:pointer;white-space:nowrap">' + q + '</button>';
}).join('');
var msgs = _iaHistory.map(function(m){
var isUser = m.role === 'user';
return '<div style="display:flex;justify-content:' + (isUser?'flex-end':'flex-start') + ';margin-bottom:10px">' +
'<div style="max-width:82%;padding:10px 14px;border-radius:' + (isUser?'18px 18px 4px 18px':'18px 18px 18px 4px') + ';background:' + (isUser?'var(--gold-dim)':'var(--surface)') + ';border:1px solid ' + (isUser?'rgba(201,169,110,0.3)':'var(--border)') + ';font-size:14px;color:var(--t1);line-height:1.5">' +
(isUser ? m.content : mdToHtml(m.content)) + '</div></div>';
}).join('');
return '<div class="step-header" style="border-bottom:1px solid var(--border);margin-bottom:0">' +
'<button class="step-back" onclick="closeSheet();_iaHistory=[]">←</button>' +
'<div class="step-title">🧠 Asesor IA</div>' +
'<div class="step-sub">Pregúntame sobre tus finanzas</div></div>' +
'<div id="ia-msgs" style="padding:16px 16px 0;min-height:120px">' + (msgs || '<div style="text-align:center;padding:20px 0;color:var(--t3);font-size:13px">Hola 👋 Soy tu asesor financiero IA. ¿En qué te ayudo?</div>') + '</div>' +
'<div style="padding:10px 16px 6px;overflow-x:auto;display:flex;gap:8px;scrollbar-width:none">' + chips + '</div>' +
'<div style="display:flex;gap:8px;padding:8px 16px 20px">' +
'<input id="ia-input" type="text" placeholder="Escribe tu pregunta..." style="flex:1;padding:10px 14px;border:1px solid var(--border2);border-radius:20px;font-size:14px;background:var(--surface);color:var(--t1);font-family:inherit" onkeydown="if(event.key===\'Enter\')sendIAMessage()">' +
'<button onclick="sendIAMessage()" style="width:40px;height:40px;border-radius:50%;background:var(--btn-bg);border:none;font-size:18px;cursor:pointer;flex-shrink:0">↑</button>' +
'</div>';
}
function sendIAQuestion(q) {
var inp = document.getElementById('ia-input');
if (inp) inp.value = q;
sendIAMessage();
}
function openIAWithQuestion(q) {
if (!requireSubscription()) return;
openSheet('ia-chat');
setTimeout(function() {
var inp = document.getElementById('ia-input');
if (inp) { inp.value = q; sendIAMessage(); }
}, 100);
}
function mdToHtml(text) {
return text
.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
.replace(/\*([^*]+)\*/g, '<em>$1</em>')
.replace(/\n/g, '<br>');
}
function sendIAMessage() {
if (_iaBusy) return;
var inp = document.getElementById('ia-input');
if (!inp) return;
var msg = inp.value.trim();
if (!msg) return;
inp.value = '';
_iaHistory.push({ role: 'user', content: msg });
_iaBusy = true;
_iaHistory.push({ role: 'assistant', content: '<span style="color:var(--t3)">Analizando... ⏳</span>' });
var msgsEl = document.getElementById('ia-msgs');
function renderMsgs() {
if (!msgsEl) return;
msgsEl.innerHTML = _iaHistory.map(function(m){
var isUser = m.role === 'user';
return '<div style="display:flex;justify-content:' + (isUser?'flex-end':'flex-start') + ';margin-bottom:10px">' +
'<div style="max-width:82%;padding:10px 14px;border-radius:' + (isUser?'18px 18px 4px 18px':'18px 18px 18px 4px') + ';background:' + (isUser?'var(--gold-dim)':'var(--surface)') + ';border:1px solid ' + (isUser?'rgba(201,169,110,0.3)':'var(--border)') + ';font-size:14px;color:var(--t1);line-height:1.5">' + (isUser ? m.content : mdToHtml(m.content)) + '</div></div>';
}).join('');
msgsEl.scrollTop = msgsEl.scrollHeight;
}
renderMsgs();
setTimeout(function() {
var reply = _localAIAnswer(msg);
_iaHistory[_iaHistory.length - 1].content = reply;
_iaBusy = false;
var sc = document.getElementById('sheet-content');
if (sc) sc.innerHTML = buildIASheet();
var m2 = document.getElementById('ia-msgs');
if (m2) m2.scrollTop = m2.scrollHeight;
}, 600);
}
function _localAIAnswer(msg) {
var en = DATA.lang === 'en';
var msgL = msg.toLowerCase();

// ── Detect expense registration commands ─────────────────
// Patterns: "gasté $50 en comida", "gaste 25 dolares en gasolina", "spent $30 on groceries"
var expensePatterns = [
  /gast[eé]\s+\$?([\d,.]+)\s*(?:dolares?|dólares?|usd|pesos?|dop)?\s+en\s+(.+)/i,
  /gast[eé]\s+en\s+(.+?)\s+\$?([\d,.]+)/i,
  /spent?\s+\$?([\d,.]+)\s+on\s+(.+)/i,
  /pagué?\s+\$?([\d,.]+)\s+(?:en|de|por)\s+(.+)/i,
  /compré?\s+(.+?)\s+(?:por|en)?\s+\$?([\d,.]+)/i,
];

for (var pi = 0; pi < expensePatterns.length; pi++) {
  var match = msg.match(expensePatterns[pi]);
  if (match) {
    var monto = parseFloat((match[1]||match[2]||'0').replace(',','.'));
    var desc = (match[2]||match[1]||'Gasto').trim();
    if (monto > 0 && desc.length > 1) {
      // Detect currency
      var mon = (msgL.includes('peso') || msgL.includes('dop') || msgL.includes('rd$')) ? 'DOP' : 'USD';
      // Detect category from description
      var cat = detectCategory(desc);
      // Detect account from message
      var bancoId = null;
      var bancoMsg = (DATA.bancos||[]).find(function(b) {
        return msgL.includes((b.banco||'').toLowerCase()) || msgL.includes((b.nom||'').toLowerCase());
      });
      if (bancoMsg) bancoId = bancoMsg.id;
      // Register expense
      var now = new Date();
      var newGasto = {
        id: Date.now(), monto: monto, mon: mon, cat: cat, desc: desc,
        fecha: now.toISOString().slice(0,10),
        month: now.getMonth(), year: now.getFullYear(),
        source: bancoId || null
      };
      DATA.gastos.push(newGasto);
      // Deduct from bank if specified
      if (bancoId) {
        var banco = DATA.bancos.find(function(b){ return b.id === bancoId; });
        if (banco) {
          var deduccion = mon === banco.mon ? monto : (mon === 'USD' ? monto * DATA.tasa : monto / DATA.tasa);
          banco.bal = Math.max(0, (banco.bal || 0) - deduccion);
        }
      }
      save();
      scheduleCloudBackup();
      setTimeout(function() { refreshHome(); refreshCuentas(); }, 300);
      var confirmMsg = en
        ? '✅ Registered: ' + desc + ' — ' + (mon === 'DOP' ? 'RD$' : '$') + monto.toFixed(2) + ' in category ' + cat + (bancoMsg ? ' · Deducted from ' + (bancoMsg.banco||bancoMsg.nom) : '') + '. The balance has been updated.'
        : '✅ Registrado: ' + desc + ' — ' + (mon === 'DOP' ? 'RD$' : '$') + monto.toFixed(2) + ' en categoría ' + cat + (bancoMsg ? ' · Descontado de ' + (bancoMsg.banco||bancoMsg.nom) : '') + '. El balance fue actualizado.';
      return confirmMsg;
    }
  }
}

// ── Detect income registration ────────────────────────────
var incomePatterns = [
  /recib[ií]\s+\$?([\d,.]+)\s*(?:dolares?|usd|pesos?|dop)?\s+(?:de|por)\s+(.+?)(?:\s+en\s+(?:la\s+)?(?:cuenta|tarjeta|banco))?(?:\s+(?:que\s+)?(?:termina\s+en|número)?\s+(\d{3,4}))?/i,
  /received?\s+\$?([\d,.]+)\s+from\s+(.+?)(?:\s+(?:to|in)\s+(\d{3,4}))?/i,
  /cobr[eé]\s+\$?([\d,.]+)\s+(?:de|por)\s+(.+?)(?:\s+en\s+(?:la\s+)?(?:cuenta|tarjeta))?\s+(?:(\d{3,4}))?/i,
  /(?:me\s+pagaron?|pague?n)\s+\$?([\d,.]+)\s+(?:de|del|de\s+)?(.+?)(?:\s+en\s+(?:la\s+)?(?:cuenta|tarjeta)(?:\s+(?:que\s+)?(?:termina\s+en|numero)?)?\s+(\d{3,4}))?/i,
];
for (var ii = 0; ii < incomePatterns.length; ii++) {
  var imatch = msg.match(incomePatterns[ii]);
  if (imatch) {
    var imonto = parseFloat((imatch[1]||'0').replace(',','.'));
    var ifuente = (imatch[2]||'Ingreso').trim();
    var idigitos = imatch[3] || null;  // Últimos dígitos de cuenta
    if (imonto > 0) {
      var imon = (msgL.includes('peso') || msgL.includes('dop')) ? 'DOP' : 'USD';
      var iBancoId = null;

      // Si se especificó cuenta, buscar la que coincida
      if (idigitos) {
        var iBanco = (DATA.bancos||[]).find(function(b){
          return (b.ultimos||'').endsWith(idigitos);
        });
        if (iBanco) iBancoId = iBanco.id;
      }

      var now2 = new Date();
      DATA.ingresos.push({
        id: Date.now(), monto: imonto, mon: imon, fuente: ifuente,
        fecha: now2.toISOString().slice(0,10),
        month: now2.getMonth(), year: now2.getFullYear(),
        source: iBancoId || null
      });

      // Add to bank if specified
      if (iBancoId) {
        var iBancoObj = DATA.bancos.find(function(b){ return b.id === iBancoId; });
        if (iBancoObj) {
          var adicion = imon === iBancoObj.mon ? imonto : (imon === 'USD' ? imonto * DATA.tasa : imonto / DATA.tasa);
          iBancoObj.bal = (iBancoObj.bal || 0) + adicion;
        }
      }

      save(); scheduleCloudBackup();
      setTimeout(function() { refreshHome(); refreshCuentas(); }, 300);
      var confirmMsg = en
        ? '✅ Income registered: ' + ifuente + ' — $' + imonto.toFixed(2) + (iBancoId ? ' added to account' : '') + '. Balance updated.'
        : '✅ Ingreso registrado: ' + ifuente + ' — $' + imonto.toFixed(2) + (iBancoId ? ' agregado a cuenta' : '') + '. Balance actualizado.';
      return en
        ? confirmMsg
        : confirmMsg;
    }
  }
}

function detectCategory(desc) {
  var dl = desc.toLowerCase();
  if (dl.match(/comida|restaurant|food|mcdonald|burger|pizza|almuerzo|cena|desayuno|cafe|coffee/)) return '🍔 Comida rápida';
  if (dl.match(/super|mercado|grocery|colmado|compras|walmart|costco/)) return '🛒 Supermercado';
  if (dl.match(/gasolina|gas|combustible|fuel|shell|texaco|gulf/)) return '⛽ Gasolina';
  if (dl.match(/uber|taxi|lyft|transporte|transport|ride/)) return '🚕 Taxi/Uber';
  if (dl.match(/luz|electric|agua|water|internet|wifi|phone|telef/)) return '💡 Electricidad';
  if (dl.match(/ropa|clothes|zapato|shoe|tienda|store|shopping/)) return '👕 Ropa';
  if (dl.match(/farmacia|medico|doctor|salud|health|medicament/)) return '💊 Farmacia';
  if (dl.match(/entretenimiento|cine|movie|netflix|spotify|game|juego/)) return '🎮 Entretenimiento';
  if (dl.match(/renta|alquiler|rent|casa|house|apartamento/)) return '🏠 Vivienda';
  if (dl.match(/viaje|hotel|vuelo|flight|travel|airbnb/)) return '✈️ Viajes';
  return '📦 Otros';
}

var cur = DATA.curMonth, curY = DATA.curYear;
var allGas = DATA.gastos || [];
var allIngs = DATA.ingresos || [];
var curGas = allGas.filter(function(x){ return x.month===cur && x.year===curY; });
var curIngs = allIngs.filter(function(x){ return x.month===cur && x.year===curY; });
if (curGas.length === 0 && allGas.length > 0) curGas = allGas;
if (curIngs.length === 0 && allIngs.length > 0) curIngs = allIngs;
var tI = curIngs.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = curGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tB = (DATA.bancos||[]).reduce(function(a,b){ return !b.esTarjeta?a+toUSD(b.bal||0,b.mon):a; }, 0);
var tD = (DATA.deudas||[]).filter(function(d){ return d.estado!=='Pagado'; }).reduce(function(a,d){ return a+toUSD(d.bal||0,d.mon); }, 0);
var numPresup = (DATA.presupuesto||[]).length;
var numMetas = (DATA.metas||[]).length;
var net = tI - tG;
var cats = {};
curGas.forEach(function(g){ cats[g.cat||'Otros']=(cats[g.cat||'Otros']||0)+toUSD(g.monto,g.mon); });
var sortedCats = Object.keys(cats).sort(function(a,b){ return cats[b]-cats[a]; });
var topCat = sortedCats[0] || null;
var mL = msg.toLowerCase();
if (mL.includes('gasté más') || mL.includes('gaste mas') || mL.includes('mayor gasto')) {
if (!topCat) return '📊 Aún no tienes gastos registrados este mes. ¡Empieza a registrarlos para ver tu análisis!';
var top3 = sortedCats.slice(0,3).map(function(k,i){ return (i+1)+'. '+k+': '+fmt(cats[k]); }).join('\n');
return '📊 Tu mayor gasto este mes es **' + topCat + '** con ' + fmt(cats[topCat]) + ', que representa el ' + (tG>0?Math.round(cats[topCat]/tG*100):0) + '% de tus gastos totales.\n\nTop 3:\n' + top3;
}
if (mL.includes('ahorrar') || mL.includes('ahorro') || mL.includes('cuánto puedo') || mL.includes('cuanto puedo')) {
if (tI === 0 && tB === 0) return '💡 Aún no tienes ingresos ni cuentas registradas. Agrega tu ingreso mensual para calcular cuánto puedes ahorrar.';
if (tI === 0 && tB > 0) {
var recSave = Math.round(tB * 0.1);
return '🐷 No tienes ingresos registrados este mes, pero tienes **' + fmt(tB) + '** en cuentas.\n\nComo referencia, si ahorras el 10% de tu saldo disponible serían **' + fmt(recSave) + '**. Registra tus ingresos mensuales para un análisis más preciso.';
}
var savRate = Math.round((net/tI)*100);
var canSave20 = Math.max(0, tI * 0.20 - Math.max(0, tI*0.20 - net));
if (net <= 0) return '⚠️ Este mes estás gastando **' + fmt(Math.abs(net)) + '** más de lo que ingresas. Para ahorrar necesitas primero reducir ' + (topCat ? topCat : 'tus gastos principales') + '.';
return '🐷 Este mes tienes un excedente de **' + fmt(net) + '** (ingresos ' + fmt(tI) + ' − gastos ' + fmt(tG) + ').\n\n' +
'• Ahorro conservador (10%): **' + fmt(tI*0.10) + '**\n' +
'• Ahorro recomendado (20%): **' + fmt(tI*0.20) + '**\n' +
'• Máximo posible: **' + fmt(net) + '**\n\n' +
(savRate >= 20 ? '✅ ¡Excelente! Ya estás ahorrando el ' + savRate + '% de tus ingresos.' : '💡 Actualmente ahorras el ' + savRate + '% — intenta llegar al 20%.');
}
if (mL.includes('carro') || mL.includes('coche') || mL.includes('auto') || mL.includes('vehiculo') || mL.includes('vehículo')) {
var precio = 15000;
if (net > 0) {
var meses = Math.ceil(precio * 0.2 / (net * 0.3));
return '🚗 Para el inicial de un vehículo (~$3,000–$5,000 USD) ahorrando el 30% de tu excedente mensual (' + fmt(net*0.3) + '), necesitarías aproximadamente ' + meses + ' meses.\n\nTu balance actual: ' + fmt(tB) + '. ' + (tB >= 3000 ? '¡Ya tienes suficiente para el inicial!' : 'Faltan ' + fmt(3000 - tB) + ' para llegar al mínimo.');
}
return '🚗 Actualmente tus gastos superan tus ingresos. Recomiendo equilibrar tu presupuesto antes de asumir una deuda de vehículo.';
}
if (mL.includes('deuda') || mL.includes('préstamo') || mL.includes('prestamo') || mL.includes('pagar')) {
if (tD === 0) return '✅ ¡Excelente! No tienes deudas activas registradas. Sigue así.';
var mesesDeuda = net > 0 ? Math.ceil(tD / (net * 0.4)) : 0;
return '💳 Tienes ' + fmt(tD) + ' en deudas activas.' + (mesesDeuda > 0 ? ' Destinando el 40% de tu excedente mensual (' + fmt(net*0.4) + '), podrías quedar libre de deudas en ~' + mesesDeuda + ' meses.' : ' Necesitas generar excedente mensual para crear un plan de pago.');
}
if (mL.includes('meta') || mL.includes('objetivo') || mL.includes('cuánto me falta') || mL.includes('cuanto me falta')) {
var metas2 = (DATA.metas||[]).filter(function(m){ return (m.actual||0) < (m.meta||0); });
if (!metas2.length) return '🎯 No tienes metas de ahorro activas. Crea una en el menú ➕ → Meta.';
var resp = '🎯 Tus metas activas:\n\n';
metas2.slice(0,3).forEach(function(m){
var falta = (m.meta||0) - (m.actual||0);
var mesesMeta = net > 0 ? Math.ceil(falta / (net * 0.3)) : 0;
resp += '• ' + m.nom + ': faltan ' + fmt(falta, m.mon) + (mesesMeta > 0 ? ' (~' + mesesMeta + ' meses)' : '') + '\n';
});
return resp;
}
if (mL.includes('presupuesto') || mL.includes('límite') || mL.includes('limite')) {
var presup = (DATA.presupuesto||[]);
if (!presup.length) return '📊 No tienes presupuestos configurados. Ve a ➕ → Presupuesto para definir límites por categoría.';
var alertas = presup.filter(function(p){
var gCat = curGas.filter(function(g){ return g.cat===p.cat; }).reduce(function(a,g){ return a+toUSD(g.monto,g.mon); }, 0);
return gCat >= toUSD(p.lim,p.mon) * 0.8;
});
if (!alertas.length) return '✅ Todos tus presupuestos están bajo control este mes. ¡Sigue así!';
return '⚠️ ' + alertas.length + ' categoría(s) cerca del límite:\n' + alertas.map(function(p){ return '• ' + p.cat; }).join('\n');
}
if (mL.includes('balance') || mL.includes('saldo') || mL.includes('cómo estoy') || mL.includes('como estoy') || mL.includes('resumen')) {
var emoji = net >= 0 ? '✅' : '⚠️';
return emoji + ' **Resumen de ' + ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][cur] + ':**\n\n• Ingresos: ' + fmt(tI) + '\n• Gastos: ' + fmt(tG) + '\n• Balance: ' + (net>=0?'+':'') + fmt(net) + '\n• Saldo en cuentas: ' + fmt(tB) + '\n• Deudas activas: ' + fmt(tD) + '\n\n' + (net >= 0 ? 'Vas bien este mes.' : 'Estás en déficit. Revisa tus gastos en ' + (topCat||'las categorías principales') + '.');
}
if (mL.includes('mejorar') || mL.includes('mejor') || mL.includes('consejo') || mL.includes('recomend')) {
var tips = [];
if (tI === 0) tips.push('📌 Registra tus ingresos para obtener un análisis completo');
if (tG > tI && tI > 0) tips.push('⚠️ Estás gastando más de lo que ingresas — revisa tus gastos variables');
if (numPresup === 0) tips.push('📊 Crea un presupuesto por categoría para controlar tus gastos');
if (numMetas === 0) tips.push('🎯 Define una meta de ahorro — ayuda a mantener el enfoque');
if (tD > 0 && tI > 0 && tD > tI * 3) tips.push('💳 Tus deudas son altas vs tus ingresos — prioriza pagarlas');
if (topCat && cats[topCat] > tI * 0.4 && tI > 0) tips.push('💡 ' + topCat + ' representa más del 40% de tus gastos — intenta reducirlo');
if (tips.length === 0) tips.push('✅ Tus finanzas se ven bien. Sigue registrando movimientos para análisis más precisos');
return '📈 **Recomendaciones para mejorar:**\n\n' + tips.join('\n');
}
if (mL.includes('score') || mL.includes('puntaje') || mL.includes('puntuación') || mL.includes('puntuacion') || mL.includes('subo') || mL.includes('subir')) {
var sc2 = SCORE.run();
var tips2 = [];
sc2.factors.forEach(function(f) {
var pct2 = f.max > 0 ? Math.round(f.pts/f.max*100) : 0;
if (pct2 < 60) {
if (f.name === 'Ahorro') tips2.push('🐷 Ahorro (' + f.pts + '/' + f.max + ' pts): guarda al menos el 10% de tus ingresos cada mes');
if (f.name === 'Control gastos') tips2.push('💸 Control de gastos (' + f.pts + '/' + f.max + ' pts): mantén gastos por debajo del 80% de tus ingresos');
if (f.name === t('score_budget')) tips2.push('📊 ' + t('score_budget') + ' (' + f.pts + '/' + f.max + ' pts): define límites por categoría y no los superes');
if (f.name === 'Crecimiento') tips2.push('📈 Crecimiento (' + f.pts + '/' + f.max + ' pts): registra al menos 5 movimientos por mes');
}
});
if (tips2.length === 0) return '⭐ Tu score de **' + sc2.total + ' puntos** está muy bien. Sigue manteniendo tus hábitos actuales.';
return '⭐ Tu score actual es **' + sc2.total + ' pts**. Para subirlo:\n\n' + tips2.join('\n');
}
if (tI === 0 && tG === 0) {
return '👋 ¡Hola! Aún no tienes movimientos registrados este mes. Registra tus ingresos y gastos para que pueda darte análisis personalizados.\n\nPuedes preguntar sobre: gastos, ahorros, deudas, metas o tu balance general.';
}
return '📊 Este mes llevas ' + fmt(tI) + ' en ingresos y ' + fmt(tG) + ' en gastos. Tu balance es ' + (net>=0?'+':'') + fmt(net) + '. ' + (topCat ? 'Tu mayor gasto: ' + topCat + ' (' + fmt(cats[topCat]) + ').' : '') + '\n\nPuedes preguntarme sobre: ahorros, deudas, metas, presupuesto o si puedes comprar algo específico.';
}
