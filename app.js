(function(){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.crossOrigin='anonymous';
  s.onload=function(){window.__sbLoaded=true;};
  s.onerror=function(){window.__sbLoaded=false;};
  document.head.appendChild(s);
})();
;
// Configuración en config.js (URL y clave pública de Supabase, y correo del administrador).
// Con valores vacíos la app funciona solo en local: respaldos en la nube, panel de admin y
// recuperación por correo quedan desactivados.
var _adm = (window.CONFIG && window.CONFIG.ADMIN_EMAIL) || '';
const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || '';
// Admin validation moved to backend
var sb = null;
var currentUser = null;
var isGuestMode = false;
// Compra de suscripción (mensual o anual). Acepta el tipo ('monthly'/'annual'/'yearly')
// o el ID de producto de App Store. Usa el puente nativo que exista:
//   1) storeKit (compra por productId)   2) purchaseSubscription (compra por tipo)
// Interruptor de pagos. Déjalo en false en la versión que se envía sin compras activas.
// Ponlo en true cuando los productos estén aprobados en App Store Connect y la app nativa
// implemente el puente storeKit (ver ios/StoreKitBridge.swift).
var PAYMENTS_ENABLED = false;
var SUB_PRODUCT_IDS = { monthly: 'com.gestorrd.app.premium.monthly', yearly: 'com.gestorrd.app.premium.yearly' };
var SUB_LABELS = { monthly: 'Mensual ($6.99/mes)', yearly: 'Anual ($69.99/año)' };
function purchaseSubscription(plan) {
  if (!PAYMENTS_ENABLED) { showToast(DATA.lang === 'en' ? 'Coming soon' : 'Próximamente'); return; }
  var key = /yearly|annual/i.test(plan) ? 'yearly' : 'monthly';
  var productId = SUB_PRODUCT_IDS[key];
  if (plan && plan.indexOf('com.gestorrd.') === 0) productId = plan;
  var mh = window.webkit && window.webkit.messageHandlers;
  if (mh && mh.storeKit) {
    showToast(DATA.lang === 'en' ? 'Opening App Store...' : 'Abriendo App Store...');
    mh.storeKit.postMessage({ action: 'purchase', productId: productId });
  } else if (mh && mh.purchaseSubscription) {
    mh.purchaseSubscription.postMessage({ type: key === 'yearly' ? 'annual' : 'monthly', plan: SUB_LABELS[key] });
  } else {
    showToast(DATA.lang === 'en' ? 'Available in the iOS app' : 'Disponible en la app de iOS');
  }
}
async function restorePurchases() {
var en = DATA.lang === 'en';
if (!PAYMENTS_ENABLED) { showToast(en ? 'Coming soon' : 'Próximamente'); return; }
if (window.webkit && window.webkit.messageHandlers) {
  try {
    window.webkit.messageHandlers.storeKit.postMessage({ action: 'restore' });
    showToast(en ? 'Restoring purchases...' : 'Restaurando compras...');
  } catch(e) {
    showToast(en ? 'No purchases found' : 'No se encontraron compras');
  }
} else {
  showToast(en ? 'Available in the iOS app' : 'Disponible en la app de iOS');
}
}
// Respuesta del puente nativo StoreKit: { status: 'success'|'restored'|'cancelled'|'error', productId }
window.onStoreKitResult = function(res) {
  if (!res) return;
  if (res.status === 'success' || res.status === 'restored') { activatePremium(); return; }
  if (res.status === 'none') { showToast(DATA.lang === 'en' ? 'No purchases found' : 'No se encontraron compras'); return; }
  if (res.status === 'error') showToast(DATA.lang === 'en' ? 'Purchase could not be completed' : 'No se pudo completar la compra');
};
function initApp() {
// Resize listener - recalculate layout on orientation change or keyboard
var resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    refreshHome();
    if (typeof updateDesktopSummary === 'function' && window.innerWidth >= 768) {
      updateDesktopSummary();
    }
  }, 100);
});
// Also listen for visual viewport changes (iOS keyboard)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() { refreshHome(); }, 100);
  });
}
load();
DATA.lang = localStorage.getItem('grd3_lang') || 'es';
// Apply lang immediately
setTimeout(function() { applyLang(DATA.lang); }, 500);
DATA.mode = localStorage.getItem('grd3_mode') || 'both';
var theme = localStorage.getItem('grd3_theme') || 'auto';
setTheme(theme);
var now = new Date();
if (!DATA.curMonth && DATA.curMonth !== 0) DATA.curMonth = now.getMonth();
if (!DATA.curYear) DATA.curYear = now.getFullYear();
refreshHome();
updProfile();
// Auto-fetch exchange rate daily
fetchLiveRate();
}

function boot() {
var th = localStorage.getItem('grd3_theme') || 'auto';
if (th === 'dark') document.documentElement.setAttribute('data-theme','dark');
else if (th === 'light') document.documentElement.setAttribute('data-theme','light');
var _t = 0;
function _waitSupabase() {
if (window.__sbLoaded !== undefined || _t >= 30) {
try {
if (!sb && window.supabase) sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {}
if (sb) initSupabaseAuth();
_bootFlow();
} else {
_t++; setTimeout(_waitSupabase, 100);
}
}
_waitSupabase();
function _bootFlow() {
var hasLang = localStorage.getItem('grd3_lang');
var hasAuth = localStorage.getItem('grd3_auth');
if (!hasLang) {
var landing = document.getElementById('landing');
if (landing) landing.style.display = 'flex';
} else if (hasAuth) {
if (hasAuth === 'user' && currentUser) { launchApp(); return; }
goPin();
} else {
var hasMode = localStorage.getItem('grd3_mode');
if (!hasMode) {
var sp = document.getElementById('splash');
if (sp) sp.style.display = 'flex';
selLang(hasLang);
} else {
var ao = document.getElementById('auth-overlay');
if (ao) ao.style.display = 'flex';
}
}
}
}
document.addEventListener('DOMContentLoaded', boot);
// Safe initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window._appReady = true;
    load();
  });
} else {
  window._appReady = true;
  load();
}
// ═══════════════════════════════════════════════════════
// LEGACY: Funciones antiguas de toggle (mantenidas para compatibilidad)
