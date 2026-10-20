// store.js — capa de datos de GestorRD: estado, persistencia y formato.
// Se carga antes de app.js. Sin dependencias de la interfaz.
var DATA = {
ingresos: [], gastos: [], deudas: [], bancos: [], ahorros: [], metas: [],
presupuesto: [], gastosFijos: [], tasa: 58.85, mode: 'both', lang: 'es',
curMonth: new Date().getMonth(),
curYear: new Date().getFullYear(),
tasa: 58.85,
lang: 'es', mode: 'both',
userName: '',
isPremium: false,
premiumSince: null,
};

function save() {
try { localStorage.setItem('grd3_data', JSON.stringify(DATA)); } catch(e) {}
scheduleCloudBackup();
}
function load() {
try {
var d = localStorage.getItem('grd3_data');
if (d) {
var parsed = JSON.parse(d);
DATA = Object.assign({}, DATA, parsed);
}
} catch(e) {}
var now = new Date();
DATA.curMonth = now.getMonth();
DATA.curYear = now.getFullYear();
// Verificar suscripción al cargar
checkSubscription();
// Aplicar idioma guardado
var savedLang = localStorage.getItem('grd3_lang') || 'es';
if (savedLang !== 'es') {
  DATA.lang = savedLang;
  applyLang(savedLang);
}
}

function fmt(n, mon) {
mon = mon || 'USD';
var abs = Math.abs(Number(n));
if (mon === 'DOP') return 'RD$' + abs.toLocaleString('es-DO', {minimumFractionDigits:0, maximumFractionDigits:0});
return '$' + abs.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtSigned(n, mon) {
var s = n < 0 ? '-' : '';
return s + fmt(n, mon);
}
function toUSD(n, mon) {
n = parseFloat(n) || 0;
if (mon === 'DOP') return n / (DATA.tasa || 58.85);
if (mon === 'EUR') return n * 1.08;
return n;
}

function dateInfo(dateStr) {
var d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
return { month: d.getMonth(), year: d.getFullYear(), d: d };
}
