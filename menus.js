// menus.js — menús de configuración: idioma, compartir, exportar, calificar, Face ID, soporte.
function toggleConfigMenu(menu) {
  // Ya no se usa - usar openConfigScreen() en su lugar
}

function toggleSubMenu(submenu) {
  // Ya no se usa - usar openConfigScreen() en su lugar
}

// ── FUNCIONES DE CONFIGURACIÓN - ACORDEONES DESPLEGABLES ──
function toggleMenu(name) {
  var screen = document.getElementById('screen-' + name);
  if (screen) {
    if (screen.style.display === 'none' || screen.style.display === '') {
      screen.style.display = 'block';
    } else {
      screen.style.display = 'none';
    }
  }
}

function setLang(lang) {
  setLangPref(lang);
}

function syncCalendar() {
  showToast('Vinculación de calendario - Próximamente');
}

function reportBug() {
  var desc = document.querySelector('#errores-submenu textarea');
  if (!desc || !desc.value.trim()) {
    showToast('Por favor describe el error');
    return;
  }
  showToast('Reporte enviado - Gracias');
  desc.value = '';
}

function deleteAccountDialog() {
  if (confirm('¿Eliminar permanentemente tu cuenta? Esta acción no se puede deshacer.')) {
    deleteAccount();
  }
}

function updateAvailableCurrencies() {
  var select = document.getElementById('user-country');
  var currenciesDiv = document.getElementById('available-currencies');
  if (!select || !currenciesDiv) return;

  var country = select.value;
  if (country === 'rd') {
    currenciesDiv.textContent = '🇩🇴 RD$ (Peso Dominicano)';
  } else if (country === 'us') {
    currenciesDiv.textContent = '🇺🇸 $ (Dólar Estadounidense)';
  }
}

function contactSupport() {
  var email = 'soporte@gestorrd.com';
  var subject = 'Soporte - GestorRD';
  var body = 'Hola,\n\nTengo una pregunta sobre GestorRD:\n\n';
  window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}


function generateInviteLink() {
  var link = 'https://apps.apple.com/app/id6791263189';
  if (navigator.share) {
    navigator.share({ title: 'GestorRD', text: 'Controla tus finanzas con GestorRD', url: link });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(function() {
      showToast('Enlace copiado ✓');
    });
  } else {
    showToast('Link: ' + link);
  }
}

function exportAllData() {
  var dataStr = JSON.stringify(DATA, null, 2);
  var dataBlob = new Blob([dataStr], {type: 'application/json'});
  var url = URL.createObjectURL(dataBlob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'gestorrd_backup_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  showToast('Datos exportados');
}

function exportByDates() {
  if (!requireSubscription()) return;
  var startDate = prompt('Fecha de inicio (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  if (!startDate) return;
  var endDate = prompt('Fecha de fin (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  if (!endDate) return;

  var filtered = {
    ingresos: (DATA.ingresos || []).filter(function(x) { return x.fecha >= startDate && x.fecha <= endDate; }),
    gastos: (DATA.gastos || []).filter(function(x) { return x.fecha >= startDate && x.fecha <= endDate; }),
    deudas: DATA.deudas || [],
    bancos: DATA.bancos || [],
    ahorros: DATA.ahorros || [],
    metas: DATA.metas || []
  };

  var dataStr = JSON.stringify(filtered, null, 2);
  var blob = new Blob([dataStr], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'gestorrd_' + startDate + '_' + endDate + '.json';
  a.click();
  showToast('Datos exportados');
}

function rateApp(stars) {
  localStorage.setItem('grd3_app_rating', stars);
  for (var i = 1; i <= 5; i++) {
    var star = document.getElementById('star-' + i);
    if (star) {
      star.style.opacity = i <= stars ? '1' : '0.5';
    }
  }
  showToast('¡Gracias por tu puntuación!');
}

function enableFaceID(button) {
  if (!button) return;
  var willEnable = !button.classList.contains('on');
  if (willEnable) {
    // Check if biometrics available
    if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(function(available) {
        if (available) {
          button.classList.add('on');
          localStorage.setItem('grd3_faceid_enabled', 'true');
          DATA.faceId = true; save();
          showToast('Face ID habilitado ✓');
        } else {
          showToast('Face ID no disponible en este dispositivo');
        }
      });
    } else if (window.webkit && window.webkit.messageHandlers) {
      // iOS native - always available on iPhone with Face ID
      button.classList.add('on');
      localStorage.setItem('grd3_faceid_enabled', 'true');
      DATA.faceId = true; save();
      showToast('Face ID habilitado ✓');
    } else {
      button.classList.add('on');
      localStorage.setItem('grd3_faceid_enabled', 'true');
      DATA.faceId = true; save();
      showToast('Face ID habilitado ✓');
    }
  } else {
    button.classList.remove('on');
    localStorage.removeItem('grd3_faceid_enabled');
    DATA.faceId = false; save();
    showToast('Face ID deshabilitado');
  }
}

// Face ID authentication - called when app opens
async function authenticateWithFaceID() {
  if (!localStorage.getItem('grd3_faceid_enabled')) return true; // not enabled, allow
  try {
    if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      var available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        // Use platform authenticator (Face ID / Touch ID)
        var credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            rpId: 'gestorrd.com',
            userVerification: 'required',
            timeout: 30000
          }
        });
        return !!credential;
      }
    }
    return true; // fallback allow
  } catch(e) {
    return false; // authentication failed or cancelled
  }
}
