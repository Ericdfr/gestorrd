// tour.js — recorrido de bienvenida (bajo demanda y al primer uso).
function showTourOnDemand() { openSheet('tour'); }
function buildTourSheet() {
var slides = [
{ icon:'💰', title:'Registra tus gastos', desc:'Toca ➕ para añadir gastos en USD o DOP. El wizard tarda menos de 10 segundos — monto, categoría, cuenta.', color:'var(--gold)' },
{ icon:'🧠', title:'Centro de Inteligencia', desc:'La IA analiza tus finanzas y responde preguntas como "¿Dónde gasté más?" o "¿Cuánto puedo ahorrar?".', color:'#60a5fa' },
{ icon:'💳', title:'Tarjetas RD y USA', desc:'Registra tus tarjetas de crédito con límite en USD y DOP. Cada gasto actualiza tu saldo automáticamente.', color:'#f87171' },
{ icon:'⭐', title:'Score Financiero', desc:'Tu puntuación del 0-100 mide ahorro, gastos, deudas y más. Mejora tus hábitos para subir el score.', color:'var(--green)' },
{ icon:'📊', title:'Reportes detallados', desc:'Ve comparaciones mensuales, gastos por categoría y tu historial filtrado por mes o tipo.', color:'#a78bfa' },
{ icon:'🌎', title:'Dos países, una app', desc:'Cambia entre Solo RD, Solo USA o USA+RD desde Perfil → Región según donde vivas o trabajes.', color:'var(--gold)' }
];
var _tourIdx = window._tourIdx || 0;
var s = slides[_tourIdx];
var dots = slides.map(function(_,i){
return '<div style="width:' + (i===_tourIdx?'20':'8') + 'px;height:8px;border-radius:4px;background:' + (i===_tourIdx?'var(--gold)':'var(--border2)') + ';transition:all .3s"></div>';
}).join('');
var isLast = _tourIdx === slides.length - 1;
return '<div style="padding:32px 24px 28px;text-align:center">' +
'<div style="width:72px;height:72px;border-radius:20px;background:' + s.color + '22;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 20px">' + s.icon + '</div>' +
'<div style="font-size:20px;font-weight:800;color:var(--t1);margin-bottom:10px">' + s.title + '</div>' +
'<div style="font-size:14px;color:var(--t2);line-height:1.6;margin-bottom:28px">' + s.desc + '</div>' +
'<div style="display:flex;justify-content:center;gap:6px;margin-bottom:28px">' + dots + '</div>' +
(isLast
? '<button class="btn-full" onclick="window._tourIdx=0;closeSheet();showToast(\'¡Listo! Empieza con ➕\')">¡Empezar! 🚀</button>'
: '<button class="btn-full" onclick="window._tourIdx=' + (_tourIdx+1) + ';elHTML(\'sheet-content\',buildTourSheet())">Siguiente →</button>') +
(_tourIdx > 0
? '<button onclick="window._tourIdx=' + (_tourIdx-1) + ';elHTML(\'sheet-content\',buildTourSheet())" style="background:none;border:none;color:var(--t3);font-size:13px;cursor:pointer;margin-top:10px;width:100%">← Anterior</button>'
: '<button onclick="window._tourIdx=0;closeSheet()" style="background:none;border:none;color:var(--t3);font-size:13px;cursor:pointer;margin-top:10px;width:100%">Saltar tour</button>') +
'</div>';
}
