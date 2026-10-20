// premium.js — planes premium: funciones de acceso, banner y pantalla de planes (las funciones de compra StoreKit siguen en app.js).
var PREMIUM_FEATURES = {
csvImport: true, aiChat: true, cloudBackup: true,
exportPDF: true, advancedReports: true, noAds: true,
};
function isPremium() { return DATA.isPremium === true; }
function activatePremium() {
DATA.isPremium = true;
DATA.premiumSince = new Date().toISOString();
save(); showToast('🎉 ¡Bienvenido a GestorRD Premium!'); updProfile();
}
function showPremiumSheet() {
var en = DATA.lang === 'en';
var features = en ? [
  '🧠 Unlimited AI Advisor',
  '☁️ Automatic cloud backup',
  '📄 Export to PDF',
  '📊 12-month reports',
  '💳 Unlimited accounts & cards',
  '🌍 USD + DOP dual currency',
  '🚫 No ads ever'
] : [
  '🧠 Asesor IA sin límites',
  '☁️ Respaldo automático en la nube',
  '📄 Exportar en PDF',
  '📊 Reportes de 12 meses',
  '💳 Cuentas y tarjetas ilimitadas',
  '🌍 USD + DOP doble moneda',
  '🚫 Sin publicidad nunca'
];

openSheetWith(
'<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">💎 GestorRD Premium</div></div>' +
'<div style="padding:0 16px 32px">' +
// Header
'<div style="text-align:center;padding:20px 0 24px">' +
'<div style="font-size:56px;margin-bottom:12px">💎</div>' +
'<div style="font-size:22px;font-weight:900;color:var(--t1);margin-bottom:6px">' + (en ? 'Unlock Premium' : 'Desbloquea Premium') + '</div>' +
'<div style="font-size:14px;color:var(--t2);line-height:1.6">' + (en ? '5-day free trial, then choose your plan' : 'Prueba 5 días gratis, luego elige tu plan') + '</div>' +
'</div>' +
// Features list
'<div style="background:var(--bg3);border-radius:var(--r-md);padding:16px;margin-bottom:20px">' +
features.map(function(f) {
  return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px;color:var(--t1)"><span style="color:var(--green);font-size:16px">✓</span>' + f + '</div>';
}).join('') +
'</div>' +
// Trial badge
'<div style="background:var(--green-bg);border:1px solid var(--green-bdr);border-radius:var(--r-md);padding:12px;text-align:center;margin-bottom:16px">' +
'<div style="font-size:13px;font-weight:700;color:var(--green)">' + (en ? '🎁 5-day FREE trial included' : '🎁 5 días de prueba GRATIS incluidos') + '</div>' +
'<div style="font-size:11px;color:var(--t2);margin-top:2px">' + (en ? 'Cancel anytime before trial ends' : 'Cancela en cualquier momento antes de que termine') + '</div>' +
'</div>' +
// Monthly plan
'<button onclick="purchaseSubscription(\'com.gestorrd.app.premium.monthly\')" style="width:100%;background:var(--g-gold);border:none;border-radius:var(--r-md);padding:16px;margin-bottom:10px;cursor:pointer;text-align:left;display:flex;justify-content:space-between;align-items:center">' +
'<div><div style="font-size:15px;font-weight:800;color:#fff">' + (en ? 'Monthly' : 'Mensual') + '</div>' +
'<div style="font-size:12px;color:rgba(255,255,255,0.75)">' + (en ? 'Billed monthly' : 'Facturado mensualmente') + '</div></div>' +
'<div style="font-size:20px;font-weight:900;color:#fff">$6.99</div>' +
'</button>' +
// Annual plan
'<button onclick="purchaseSubscription(\'com.gestorrd.app.premium.yearly\')" style="width:100%;background:var(--surface);border:2px solid var(--gold);border-radius:var(--r-md);padding:16px;margin-bottom:16px;cursor:pointer;text-align:left;display:flex;justify-content:space-between;align-items:center;position:relative">' +
'<div style="position:absolute;top:-10px;right:12px;background:var(--green);color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px">' + (en ? 'SAVE 17%' : 'AHORRA 17%') + '</div>' +
'<div><div style="font-size:15px;font-weight:800;color:var(--t1)">' + (en ? 'Annual' : 'Anual') + '</div>' +
'<div style="font-size:12px;color:var(--t2)">' + (en ? '$5.83/mo · Billed annually' : '$5.83/mes · Facturado anualmente') + '</div></div>' +
'<div style="font-size:20px;font-weight:900;color:var(--gold)">$69.99</div>' +
'</button>' +
// Restore
'<button onclick="restorePurchases()" style="width:100%;background:none;border:none;color:var(--t3);font-size:12px;cursor:pointer;padding:8px">' + (en ? 'Restore purchases' : 'Restaurar compras') + '</button>' +
'<div style="font-size:10px;color:var(--t3);text-align:center;line-height:1.5;margin-top:8px">' + (en ? 'Payment charged to Apple ID. Subscription auto-renews unless cancelled 24h before period ends.' : 'Pago cobrado al Apple ID. La suscripción se renueva automáticamente a menos que se cancele 24h antes.') + '</div>' +
'</div>'
);
}

function checkSubscription() {
  // Verificar si la app nativa ha establecido suscripción
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.checkSubscription) {
    window.webkit.messageHandlers.checkSubscription.postMessage({});
  }
  // También verificar localStorage como fallback
  var subExpiry = localStorage.getItem('grd3_subscription_expiry');
  if (subExpiry && new Date() < new Date(subExpiry)) {
    DATA.isPremium = true;
  } else {
    DATA.isPremium = false;
  }
  return DATA.isPremium;
}

function requireSubscription() {
  if (!checkSubscription()) {
    showToast('Esta función requiere suscripción premium');
    document.getElementById('suscripcion-menu').style.display = 'block';
    return false;
  }
  return true;
}

function setSubscriptionActive(expiryDate) {
  // Llamada desde la app nativa cuando se confirma la compra
  localStorage.setItem('grd3_subscription_expiry', expiryDate);
  DATA.isPremium = true;
  save();
  updatePremiumBanner();
  showToast('✓ Suscripción activa');
}

function updatePremiumBanner() {
  var banner = document.getElementById('premium-banner');
  var subExpiry = localStorage.getItem('grd3_subscription_expiry');

  if (subExpiry && new Date() < new Date(subExpiry)) {
    banner.style.display = 'block';
    var expiryDate = new Date(subExpiry);
    var formattedDate = expiryDate.toLocaleDateString('es-ES');
    document.getElementById('premium-expiry').textContent = 'Válido hasta ' + formattedDate;
  } else {
    banner.style.display = 'none';
  }
}

// generateSharedLink: pendiente de backend. Sin servidor no se guarda ningún enlace,
// así que se deja desactivada para no mostrar un "enlace válido 7 días" falso.
// function generateSharedLink() {
//   if (!requireSubscription()) return;
//   var link = 'https://gestorrd.app/shared/' + Math.random().toString(36).substring(7);
//   showToast('Enlace compartido válido 7 días');
// }
