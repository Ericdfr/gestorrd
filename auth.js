// auth.js — entrada y seguridad de GestorRD: PIN, inicio de sesión, registro, invitado,
// cerrar sesión y eliminar cuenta. Las cuentas locales viven en localStorage.
// --- Hashing ---
// Contraseñas y PIN usan PBKDF2-SHA256 con sal aleatoria. El PIN usa una sal por dispositivo.
var PWD_ITER = 100000;
function bytesToHex(bytes) { return Array.from(bytes).map(function(b){ return b.toString(16).padStart(2,'0'); }).join(''); }
function hexToBytes(hex) { var out = new Uint8Array(hex.length / 2); for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i*2, 2), 16); return out; }
async function pbkdf2Hex(text, saltHex, iter) {
  var key = await crypto.subtle.importKey('raw', new TextEncoder().encode(text), 'PBKDF2', false, ['deriveBits']);
  var bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: iter, hash: 'SHA-256' }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}
async function hashPassword(pass) {
  var saltHex = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  return { salt: saltHex, hash: await pbkdf2Hex(pass, saltHex, PWD_ITER) };
}
async function getPinSalt() {
  var s = localStorage.getItem('grd3_pin_salt');
  if (!s) { s = bytesToHex(crypto.getRandomValues(new Uint8Array(16))); localStorage.setItem('grd3_pin_salt', s); }
  return s;
}
async function hashPin(pin) { return pbkdf2Hex(pin, await getPinSalt(), PWD_ITER); }
// Hash antiguo del PIN (SHA-256 con sal fija). Solo para reconocer PIN guardados antes.
async function legacyHashPin(pin) {
  var hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin + 'gestorrd_salt_2026'));
  return bytesToHex(new Uint8Array(hashBuffer));
}
// Acepta el PIN con el hash nuevo o con el antiguo; si es el antiguo, lo re-guarda con el nuevo.
async function pinMatches(pin, hashed) {
  if (hashed === localStorage.getItem('grd3_pin')) return true;
  if ((await legacyHashPin(pin)) === localStorage.getItem('grd3_pin')) {
    localStorage.setItem('grd3_pin', hashed);
    return true;
  }
  return false;
}
// Valida la contraseña. Las cuentas antiguas (texto plano) se migran a hash al entrar correctamente.
async function verifyPassword(account, pass) {
  if (!account) return false;
  if (account.algo === 'pbkdf2-sha256') {
    return (await pbkdf2Hex(pass, account.salt, account.iter || PWD_ITER)) === account.hash;
  }
  if (account.password !== undefined && account.password === pass) {
    var pw = await hashPassword(pass);
    account.salt = pw.salt; account.hash = pw.hash; account.algo = 'pbkdf2-sha256'; account.iter = PWD_ITER;
    delete account.password;
    return true;
  }
  return false;
}
function goPin() {
hide('splash'); hide('landing');
var pin = localStorage.getItem('grd3_pin');
if (pin) {
var ps = document.getElementById('pin-screen');
if (ps) { ps.style.display = 'flex'; }
document.getElementById('ptitle').textContent = 'Ingresa tu PIN';
document.getElementById('pskip').style.display = 'none';
} else {
var auth = localStorage.getItem('grd3_auth');
if (!auth) {
var ao = document.getElementById('auth-overlay');
if (ao) { ao.style.display = 'flex'; }
} else {
launchApp();
}
}
}
var _pinBuf = '';
function pk(d) {
_pinBuf += d;
[0,1,2,3].forEach(function(i){ cls('pd'+i,'filled',i<_pinBuf.length); });
if (_pinBuf.length === 4) setTimeout(checkPin, 120);
}
function pdel() {
_pinBuf = _pinBuf.slice(0,-1);
[0,1,2,3].forEach(function(i){ cls('pd'+i,'filled',i<_pinBuf.length); });
}
function checkPin() {
if (_pinSetupStep === 1) {
_pinSetupTmp = _pinBuf; _pinBuf = '';
[0,1,2,3].forEach(function(i){ cls('pd'+i,'filled',false); });
_pinSetupStep = 2;
el('ptitle','Confirma tu PIN');
el('psub','Paso 2 de 2');
return;
}
if (_pinSetupStep === 2) {
if (_pinBuf === _pinSetupTmp) {
hashPin(_pinBuf).then(function(hashed) {
localStorage.setItem('grd3_pin', hashed);
});
_pinSetupStep = 0; _pinSetupTmp = ''; _pinBuf = '';
hide('pin-screen');
showToast(t('pin_set'));
openSheet('pin-settings');
} else {
el('perr','Los PIN no coinciden, intenta de nuevo');
_pinSetupStep = 1; _pinBuf = ''; _pinSetupTmp = '';
[0,1,2,3].forEach(function(i){ cls('pd'+i,'filled',false); });
el('ptitle','Crea un PIN de 4 dígitos');
el('psub','Paso 1 de 2');
}
return;
}
hashPin(_pinBuf).then(async function(hashed) {
if (await pinMatches(_pinBuf, hashed)) {
launchApp();
} else {
el('perr','PIN incorrecto');
_pinBuf = '';
[0,1,2,3].forEach(function(i){ cls('pd'+i,'filled',false); });
}
});
}
function skipPin() {
if (_pinSetupStep > 0) {
_pinSetupStep = 0; _pinSetupTmp = ''; _pinBuf = '';
hide('pin-screen');
openSheet('pin-settings');
return;
}
launchApp();
}
var authMode = 'login';
function setAuthMode(m) {
authMode = m;
cls('auth-login-tab','active',m==='login'); cls('auth-register-tab','active',m==='register');
el('auth-main-btn', m==='login'?'Iniciar sesión':'Crear cuenta →');
// Show name fields only on register
var nameFields = document.getElementById('auth-name-fields');
if (nameFields) nameFields.style.display = m==='register' ? 'block' : 'none';
// Update password placeholder
var passEl = document.getElementById('auth-pass');
if (passEl) passEl.placeholder = m==='register' ? 'Mínimo 6 caracteres' : '••••••••';
authMsg('');
}
function authMsg(m) { el('auth-msg', m || ''); }
async function authSubmit() {
var email = (v('auth-email')||'').trim();
var pass = (v('auth-pass')||'').trim();
if (!email || pass.length < 6) { authMsg('Escribe un email válido y una contraseña de mínimo 6 caracteres.'); return; }

authMsg('Iniciando sesión...');

// Sistema de autenticación LOCAL (sin servidor)
if (authMode === 'register') {
  var nombre = (v('auth-nombre')||'').trim();
  var apellido = (v('auth-apellido')||'').trim();

  // Verificar si el email ya existe
  var existingAccounts = JSON.parse(localStorage.getItem('grd3_accounts') || '{}');
  if (existingAccounts[email]) {
    authMsg('❌ Este email ya tiene una cuenta registrada.');
    return;
  }

  // Crear cuenta nueva (guardar en localStorage)
  var pw = await hashPassword(pass);
  existingAccounts[email] = {
    email: email,
    salt: pw.salt,
    hash: pw.hash,
    algo: 'pbkdf2-sha256',
    iter: PWD_ITER,
    nombre: nombre,
    apellido: apellido,
    created_at: new Date().toISOString()
  };
  localStorage.setItem('grd3_accounts', JSON.stringify(existingAccounts));
  localStorage.setItem('grd3_auth', email);

  DATA.userName = [nombre, apellido].filter(Boolean).join(' ');
  DATA.nombre = nombre;
  DATA.apellido = apellido;
  DATA.email = email;
  currentUser = { email: email, id: email };
  isGuestMode = false;

  authMsg('✅ Cuenta creada correctamente!');
  setTimeout(function() {
    hide('auth-overlay');
    launchApp();
    showToast('Bienvenido a GestorRD ' + nombre);
  }, 1000);
} else {
  // Login - verificar credenciales locales
  var accounts = JSON.parse(localStorage.getItem('grd3_accounts') || '{}');
  var account = accounts[email];

  if (!(await verifyPassword(account, pass))) {
    authMsg('❌ Email o contraseña incorrectos');
    return;
  }
  localStorage.setItem('grd3_accounts', JSON.stringify(accounts));
  localStorage.setItem('grd3_auth', email);
  DATA.userName = [account.nombre, account.apellido].filter(Boolean).join(' ');
  DATA.nombre = account.nombre;
  DATA.apellido = account.apellido;
  DATA.email = email;
  currentUser = { email: email, id: email };
  isGuestMode = false;

  authMsg('✅ Sesión iniciada!');
  setTimeout(function() {
    hide('auth-overlay');
    launchApp();
    showToast('¡Bienvenido de vuelta ' + account.nombre + '!');
  }, 1000);
}
}
function authGuest() {
currentUser = null; isGuestMode = true;
DATA.userName = ''; DATA.bancos = []; DATA.ingresos = []; DATA.gastos = [];
DATA.deudas = []; DATA.metas = []; DATA.gastosFijos = []; DATA.presupuesto = [];
localStorage.setItem('grd3_auth', 'guest');
hide('auth-overlay');
var cb = document.getElementById('auth-close-btn'); if (cb) cb.style.display = 'none';
launchApp();
showToast('Modo invitado: respaldo solo en este dispositivo');
}
function resetPassword() {
var email = (v('auth-email')||'').trim();
if (!email) { authMsg('Escribe tu email primero.'); return; }
if (!sb) { authMsg('Sin conexión.'); return; }
sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: window.location.origin, shouldCreateUser: false } })
.then(function(r) {
if (r.error) authMsg('❌ ' + r.error.message);
else authMsg('✅ Link enviado a ' + email + '. Tócalo para entrar.');
}).catch(function(e) { authMsg('❌ ' + (e.message || 'Error')); });
}

function logout() {
logoutAccount();
}
function logoutAccount() {
currentUser = null; isGuestMode = false;
localStorage.removeItem('grd3_auth');
// Clear sensitive data from view
DATA.ingresos = []; DATA.gastos = []; DATA.bancos = [];
DATA.deudas = []; DATA.metas = []; DATA.userName = '';
// Go back to landing screen
var app = document.getElementById('app');
var landing = document.getElementById('landing');
if (app) app.style.display = 'none';
if (landing) { landing.style.display = 'flex'; }
else { location.reload(); }
showToast(t('session_closed'));
}
function deleteAccount() {
if (!currentUser) { showToast('Inicia sesión primero'); return; }
openSheetWith(
'<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">🗑️ Eliminar cuenta</div></div>' +
'<div style="padding:16px">' +
'<div style="background:var(--red-bg);border:1px solid var(--red-bdr);border-radius:var(--r-md);padding:16px;margin-bottom:16px;font-size:13px;color:var(--red);line-height:1.6">' +
'<strong>⚠️ Esto eliminará permanentemente:</strong><br>• Tu cuenta y datos de acceso<br>• Todos tus datos financieros<br>• Tu historial de transacciones<br><br>Esta acción no se puede deshacer.' +
'</div>' +
'<div class="form-field"><label>Escribe DELETE para confirmar</label><input id="delete-confirm" type="text" placeholder="DELETE"></div>' +
'<button onclick="confirmDeleteAccount()" style="width:100%;padding:14px;background:var(--red-bg);border:1px solid var(--red-bdr);border-radius:var(--r-md);color:var(--red);font-size:14px;font-weight:700;cursor:pointer">Eliminar mi cuenta permanentemente</button>' +
'</div>'
);
}
async function confirmDeleteAccount() {
var confirm = v('delete-confirm');
if (confirm !== 'DELETE') { showToast('Escribe DELETE para confirmar'); return; }
if (!currentUser || !sb) return;
try {
var anonId = 'deleted_' + Date.now();
await sb.from('profiles').update({
nombre: 'Usuario',
apellido: 'Eliminado',
email: anonId + '@deleted.gestorrd.com',
user_agent: 'deleted',
last_login_at: new Date().toISOString()
}).eq('id', currentUser.id);
await sb.from('app_backups').update({
data: { version: '2.0', fecha: new Date().toISOString(), datos: {}, deleted: true },
records_count: 0
}).eq('user_id', currentUser.id);
DATA = { ingresos:[], gastos:[], bancos:[], deudas:[], metas:[], presupuesto:[], gastosFijos:[], ahorros:[], categorias:[], userName:'', tasa:58.85, tema:'auto', mode:'both', lang:'es' };
save();
await sb.auth.signOut();
currentUser = null; isGuestMode = false;
localStorage.clear();
closeSheet();
showToast('Cuenta eliminada. Sentimos verte partir.');
updProfile();
} catch(e) {
showToast('Error al eliminar cuenta. Contacta soporte@gestorrd.com');
}
}
function openAuthFromProfile() {
var ao = document.getElementById('auth-overlay');
var cb = document.getElementById('auth-close-btn');
if (cb) cb.style.display = 'block';
if (ao) ao.style.display = 'flex';
}

function buildPinSettingsSheet() {
var hasPin = !!localStorage.getItem('grd3_pin');
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">🔐 PIN de seguridad</div><div class="step-sub">Protege el acceso a la app con un PIN de 4 dígitos.</div></div>' +
'<div style="padding:0 16px 16px">' +
'<div class="settings-card">' +
'<div class="settings-item">' +
'<span class="settings-icon">🔐</span><span class="settings-label">PIN activado</span>' +
'<button class="tog' + (hasPin ? ' on' : '') + '" onclick="togPinSetting()"></button>' +
'</div>' +
(hasPin ? '<div class="settings-item" onclick="startPinSetup()"><span class="settings-icon">✏️</span><span class="settings-label">Cambiar PIN</span><span class="settings-arrow">›</span></div>' : '') +
'</div></div>';
}
function togPinSetting() {
var hasPin = !!localStorage.getItem('grd3_pin');
if (hasPin) {
localStorage.removeItem('grd3_pin');
showToast('PIN desactivado');
openSheet('pin-settings');
} else {
startPinSetup();
}
}
var _pinSetupStep = 0, _pinSetupTmp = '';
function startPinSetup() {
_pinSetupStep = 1; _pinSetupTmp = ''; _pinBuf = '';
[0,1,2,3].forEach(function(i){ cls('pd'+i,'filled',false); });
el('ptitle','Crea un PIN de 4 dígitos');
el('psub','Paso 1 de 2');
el('perr','');
var sk = document.getElementById('pskip');
if (sk) { sk.style.display = 'block'; sk.textContent = t('cancel'); }
var ps = document.getElementById('pin-screen');
if (ps) ps.style.display = 'flex';
}
