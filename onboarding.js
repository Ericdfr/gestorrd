// onboarding.js — primer uso: idioma, modo (RD/USA/ambos) y paso de arranque.
function startApp() {
hide('landing');
var hasLang = localStorage.getItem('grd3_lang');
if (!hasLang) {
var sp = document.getElementById('splash');
if (sp) { sp.style.display = 'flex'; }
} else {
goPin();
}
}
function selLang(l) {
localStorage.setItem('grd3_lang', l); DATA.lang = l;
['es','en'].forEach(function(x){ cls('btn-'+x,'active',x===l); });
checkReady();
}

// ── i18n translations ──────────────────────────────────
function selMode(m) {
localStorage.setItem('grd3_mode', m); DATA.mode = m;
['rd','us','both'].forEach(function(x){ cls('btn-'+x,'active',x===m); });
checkReady();
}
function checkReady() {
var l = localStorage.getItem('grd3_lang'), m = localStorage.getItem('grd3_mode');
var eb = document.getElementById('ebtn');
if (eb && l && m) eb.classList.add('ready');
}
