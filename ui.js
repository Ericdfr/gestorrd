// ui.js — utilidades de interfaz: menú de usuario, helpers del DOM, navegación entre pantallas.
function toggleUserMenu() {
var menu = document.getElementById('user-menu');
if (menu.style.display === 'none') {
  menu.style.display = 'block';
  // Auto-fill fields when menu opens
  document.getElementById('user-name-input').value = DATA.nombre || '';
  document.getElementById('user-last-input').value = DATA.apellido || '';
  document.getElementById('user-email-input').value = DATA.email || '';
  document.getElementById('user-country').value = DATA.pais || 'rd';
} else {
  menu.style.display = 'none';
}
}
var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
function v(id) { var e = document.getElementById(id); return e ? e.value : ''; }
function el(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; }
function elHTML(id, val) { var e = document.getElementById(id); if (e) e.innerHTML = val; }
function show(id) { var e = document.getElementById(id); if (e) e.style.display = ''; }
function hide(id) { var e = document.getElementById(id); if (e) e.style.display = 'none'; }
function cls(id, c, add) { var e = document.getElementById(id); if (e) { if (add) e.classList.add(c); else e.classList.remove(c); } }
function showToast(msg, dur) {
var t = document.getElementById('toast');
if (!t) return;
t.textContent = msg; t.style.opacity = '1';
clearTimeout(t._t);
t._t = setTimeout(function() { t.style.opacity = '0'; }, dur || 2500);
}
var currentScreen = 'home';
function sN(name) {
document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
document.querySelectorAll('.nb').forEach(function(b) { b.classList.remove('active'); });
var s = document.getElementById('screen-' + name);
if (s) { s.classList.add('active'); var c=document.getElementById('main-content'); if(c) c.scrollTop=0; }
var nb = document.getElementById('nb-' + name);
if (nb) nb.classList.add('active');
currentScreen = name;
if (name === 'home') refreshHome();
if (name === 'cuentas') refreshCuentas();
if (name === 'reportes') refreshReportes();
if (name === 'perfil') { updProfile(); updatePremiumBanner(); }
if (window.innerWidth >= 900) {
document.querySelectorAll('.dsb-nav').forEach(function(b){ b.classList.remove('active'); });
var dsbBtn = document.getElementById('dsb-' + name);
if (dsbBtn) dsbBtn.classList.add('active');
updateDesktopSummary();
}
}
