// profile.js — edición del perfil (nombre, avatar) y cambio de contraseña de la cuenta.
function buildEditProfileSheet() {
var parts = (DATA.userName || '').split(' ');
var nombre = parts[0] || '';
var apellido = parts.slice(1).join(' ') || '';
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
'<div class="step-title">👤 Mi perfil</div>' +
'<div class="step-sub">Tu nombre aparece en el saludo del inicio</div></div>' +
'<div style="padding:0 16px 24px">' +
(currentUser
? '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 16px;margin-bottom:16px;font-size:13px;color:var(--t2)">📧 ' + (currentUser.email || '') + '</div>'
: '') +
'<div class="form-field"><label>Nombre</label>' +
'<input id="ep-nombre" type="text" placeholder="Ej: Juan" value="' + nombre + '" style="font-size:16px"></div>' +
'<div class="form-field"><label>Apellido</label>' +
'<input id="ep-apellido" type="text" placeholder="Ej: Domínguez" value="' + apellido + '" style="font-size:16px"></div>' +
'<button class="btn-full" onclick="saveProfile()">💾 Guardar nombre</button>' +
'</div>';
}
async function saveProfile() {
var nombre = (v('ep-nombre') || '').trim();
var apellido = (v('ep-apellido') || '').trim();
if (!nombre) { showToast('Escribe tu nombre'); return; }
var fullName = [nombre, apellido].filter(Boolean).join(' ').trim();
DATA.userName = fullName;
save();
if (currentUser && sb) {
try {
await sb.from('profiles').update({ nombre: nombre, apellido: apellido }).eq('id', currentUser.id);
} catch(e) {}
}
closeSheet();
refreshHome();
var av = document.getElementById('profile-avatar');
if (av) av.textContent = fullName.charAt(0).toUpperCase();
el('profile-name', fullName);
showToast('✓ Nombre actualizado');
}
function buildCambiarPwdSheet() {
if (!currentUser) {
return '<div class="step-header"><div class="step-title">🔑 Contraseña</div></div>' +
'<div style="padding:0 16px 16px"><div class="empty-state"><div class="empty-icon">🔒</div><div class="empty-text">Inicia sesión con una cuenta para cambiar tu contraseña.</div></div></div>';
}
return '<div class="step-header"><div class="step-title">🔑 Cambiar contraseña</div></div>' +
'<div style="padding:0 16px 16px">' +
'<div class="form-field"><label>Nueva contraseña</label><input id="chpwd-1" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password"></div>' +
'<div class="form-field"><label>Confirmar</label><input id="chpwd-2" type="password" autocomplete="new-password"></div>' +
'<button class="btn-full" onclick="changeAccountPassword()">Guardar contraseña</button>' +
'</div>';
}
function changeAccountPassword() {
var p1 = v('chpwd-1'), p2 = v('chpwd-2');
if (!sb || !currentUser) { showToast('Inicia sesión primero'); return; }
if (p1.length < 6 || p1 !== p2) { showToast('Las contraseñas no coinciden o son muy cortas'); return; }
sb.auth.updateUser({ password: p1 }).then(function(r) {
if (r.error) showToast('❌ ' + r.error.message);
else { showToast('✅ Contraseña actualizada'); closeSheet(); }
});
}
async function setLoggedUser(user) {
currentUser = user; isGuestMode = false;
localStorage.setItem('grd3_auth', 'user');
if (!DATA.userName && user.email) {
var n = user.email.split('@')[0];
DATA.userName = n.charAt(0).toUpperCase() + n.slice(1);
}
hide('auth-overlay');
var cb = document.getElementById('auth-close-btn'); if (cb) cb.style.display = 'none';
launchApp();
showToast('Sesión iniciada: ' + (user.email || 'usuario'));
}
async function upsertProfile() {
// Función legacy - ya no necesaria con sistema local
}

// --- updProfile (movido desde app.js) ---
function updProfile() {
var mode = DATA.mode || 'both';
var labels = { rd: '🇩🇴 RD', us: '🇺🇸 USA', both: '🌎 Ambos' };
el('pref-region', labels[mode] || 'Ambos');
document.querySelectorAll('.settings-check-rd,.settings-check-us,.settings-check-both').forEach(function(e){ e.style.display='none'; });
var ck = document.querySelector('.settings-check-' + mode);
if (ck) ck.style.display = '';
// Update language buttons
var curLang = DATA.lang || 'es';
['es','en'].forEach(function(x) {
  var btn = document.getElementById('lang-' + x);
  if (!btn) return;
  var active = x === curLang;
  btn.style.background = active ? 'var(--gold-dim)' : 'none';
  btn.style.borderColor = active ? 'var(--gold)' : 'var(--border2)';
  btn.style.color = active ? 'var(--gold)' : 'var(--t2)';
  btn.style.fontWeight = active ? '700' : '400';
});
if (currentUser) {
el('profile-name', DATA.userName || 'Mi cuenta');
el('profile-email', currentUser.email);
el('profile-avatar', (currentUser.email || 'G').charAt(0).toUpperCase());
var adminWrap = document.getElementById('admin-btn-wrap');
if (adminWrap) adminWrap.style.display = currentUser.email === _adm ? 'block' : 'none';
} else if (isGuestMode) {
el('profile-name', 'Invitado');
el('profile-email', 'Sin cuenta — datos solo en este dispositivo');
el('profile-avatar', 'G');
} else {
el('profile-name', 'Usuario');
el('profile-email', 'Sin cuenta (local)');
el('profile-avatar', 'G');
}
var loginRow = document.getElementById('profile-login-row');
if (loginRow) {
loginRow.innerHTML = currentUser
? '<div class="settings-item" onclick="logoutAccount()"><span class="settings-icon">🚪</span><span class="settings-label">' + (DATA.lang==='en'?'Sign out':'Cerrar sesión') + '</span><span class="settings-arrow">›</span></div>'
: '<div class="settings-item" onclick="openAuthFromProfile()"><span class="settings-icon">🔐</span><span class="settings-label">' + (DATA.lang==='en'?'Sign in / Create account':'Iniciar sesión / Crear cuenta') + '</span><span class="settings-arrow">›</span></div>';
}
// Delete account row — always visible when logged in
var deleteRow = document.getElementById('profile-delete-row');
if (deleteRow) {
  deleteRow.innerHTML = currentUser
  ? '<div class="settings-item" onclick="deleteAccount()" style="margin-bottom:4px"><span class="settings-icon">🗑️</span><span class="settings-label" style="color:var(--red)">' + (DATA.lang==='en'?'Delete account':'Eliminar cuenta') + '</span><span class="settings-arrow" style="color:var(--red)">›</span></div>'
  : '';
}
}
