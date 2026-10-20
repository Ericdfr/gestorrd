// launch.js — arranque de la app: pantalla principal, versión y aviso de actualización.
function launchApp() {
['landing','splash','pin-screen','auth-overlay'].forEach(hide);
var app = document.getElementById('app');
if (app) app.style.display = 'flex';
var sbar = document.getElementById('main-sbar');
if (sbar) sbar.style.display = '';
initApp();
if (!localStorage.getItem('grd3_toured')) { localStorage.setItem('grd3_toured','1'); }
setTimeout(initDesktopSidebar, 300);
// Infrastructure
checkAppVersion();
initErrorMonitoring();
initCache();
registerServiceWorker(); // sw.js incluido en el repositorio
}
// ═══════════════════════════════════════════════════════
// INFRAESTRUCTURA: Version, Monitoreo, Cache, Rate Limiting
// ═══════════════════════════════════════════════════════

// ── Control de versiones ────────────────────────────────
var APP_VERSION = '1.0';
var APP_BUILD = 2137;

async function checkAppVersion() {
  if (!sb) return;
  try {
    var r = await sb.from('app_versions').select('version,build,force_update,release_notes').order('build', { ascending: false }).limit(1).maybeSingle();
    if (!r.data) return;
    var latest = r.data;
    if (latest.force_update && latest.build > APP_BUILD) {
      // Force update - show non-dismissible alert
      showUpdateAlert(latest.version, latest.release_notes, true);
    } else if (latest.build > APP_BUILD) {
      // Optional update
      showUpdateAlert(latest.version, latest.release_notes, false);
    }
  } catch(e) { /* silent */ }
}

function showUpdateAlert(version, notes, force) {
  var msg = 'Nueva version ' + version + ' disponible.' + (notes ? ' ' + notes : '');
  if (force) {
    // Show blocking update screen
    openSheetWith(
      '<div style="padding:32px 24px;text-align:center">' +
      '<div style="font-size:48px;margin-bottom:16px">🔄</div>' +
      '<div style="font-size:20px;font-weight:800;color:var(--t1);margin-bottom:10px">Actualización requerida</div>' +
      '<div style="font-size:14px;color:var(--t2);margin-bottom:24px">' + msg + '</div>' +
      '<a href="https://apps.apple.com/app/id6771450691" style="display:block;padding:16px;background:var(--g-gold);color:#fff;border-radius:var(--r-md);font-weight:700;text-decoration:none">Actualizar ahora</a>' +
      '</div>'
    );
  } else {
    showToast('Nueva versión ' + version + ' disponible en la App Store');
  }
}

// ── Monitoreo de errores ─────────────────────────────────
