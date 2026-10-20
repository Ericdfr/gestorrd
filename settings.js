// settings.js — tasa en vivo, tema, modo, respaldo/restauración local.
async function fetchLiveRate() {
  var cached = localStorage.getItem('grd3_tasa_cache');
  var cachedTime = localStorage.getItem('grd3_tasa_time');
  if (cached && cachedTime && (Date.now() - parseInt(cachedTime)) < 3600000) {
    DATA.tasa = parseFloat(cached);
    el('rate-display', DATA.tasa.toFixed(2));
    return;
  }
  try {
    var r = await fetch('https://api.frankfurter.app/latest?from=USD&to=DOP');
    var d = await r.json();
    if (d && d.rates && d.rates.DOP) {
      DATA.tasa = Math.round(d.rates.DOP * 100) / 100;
      localStorage.setItem('grd3_tasa_cache', DATA.tasa.toString());
      localStorage.setItem('grd3_tasa_time', Date.now().toString());
      el('rate-display', DATA.tasa.toFixed(2));
      save();
    }
  } catch(e) { /* keep existing rate */ }
}
function setTheme(t) {
localStorage.setItem('grd3_theme', t);
if (typeof DATA !== 'undefined') DATA.tema = t;
if (t === 'dark') {
  document.documentElement.setAttribute('data-theme','dark');
} else if (t === 'light') {
  document.documentElement.setAttribute('data-theme','light');
} else {
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}
['auto','dark','light'].forEach(function(th) {
  var btn = document.getElementById('t-' + th);
  if (!btn) return;
  btn.style.background = (th === t) ? 'var(--gold-dim)' : 'none';
  btn.style.borderColor = (th === t) ? 'var(--gold)' : 'var(--border2)';
  btn.style.color = (th === t) ? 'var(--gold)' : 'var(--t2)';
  btn.style.fontWeight = (th === t) ? '700' : '400';
});
if (typeof save === 'function') save();
else document.documentElement.removeAttribute('data-theme');
['auto','dark','light'].forEach(function(x) {
var b = document.getElementById('t-'+x);
if (b) { b.style.background = x===t ? 'var(--gold-dim)' : 'none'; b.style.borderColor = x===t ? 'var(--gold)' : 'var(--border2)'; b.style.color = x===t ? 'var(--gold)' : 'var(--t2)'; }
});
}
function setMode(m) {
DATA.mode = m; localStorage.setItem('grd3_mode', m); save();
}
function doBackup() {
var blob = new Blob([JSON.stringify(DATA, null, 2)], {type:'application/json'});
var a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'gestorrd-backup-' + new Date().toISOString().slice(0,10) + '.json';
a.click(); showToast(t('backup_downloaded'));
}
function doRestore() { document.getElementById('restore-file').click(); }
function loadRestoreFile(e) {
var f = e.target.files[0]; if (!f) return;
var r = new FileReader();
r.onload = function(ev) {
try { DATA = Object.assign({}, DATA, JSON.parse(ev.target.result)); save(); initApp(); showToast('Datos restaurados ✓'); }
catch(err) { showToast('Error al restaurar'); }
};
r.readAsText(f);
}
