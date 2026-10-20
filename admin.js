// admin.js — panel de administración (solo para la cuenta administradora; el acceso se valida en buildAdminPanel).
async function buildAdminPanel() {
var el2 = document.getElementById('admin-content');
if (!el2) return;
if (!sb || !currentUser || currentUser.email !== _adm) {
el2.innerHTML = '<div style="color:var(--red);text-align:center;padding:20px">Acceso denegado</div>';
return;
}
try {
var profRes = await sb.from('profiles').select('id,email,nombre,apellido,last_login_at,created_at,app_version,user_agent').order('last_login_at', { ascending: false });
var profiles = profRes.data || [];
var backRes = await sb.from('app_backups').select('user_id,updated_at', { count: 'exact' });
var backups = backRes.data || [];
var backupMap = {};
backups.forEach(function(b){ backupMap[b.user_id] = b.updated_at; });
var totalUsers = profiles.length;
var activeToday = profiles.filter(function(p){
if (!p.last_login_at) return false;
var d = new Date(p.last_login_at);
var now = new Date();
return (now - d) < 86400000;
}).length;
var activeWeek = profiles.filter(function(p){
if (!p.last_login_at) return false;
return (new Date() - new Date(p.last_login_at)) < 7*86400000;
}).length;
var statsHTML = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">' +
'<div style="background:var(--bg3);border-radius:10px;padding:12px;text-align:center"><div style="font-size:10px;color:var(--t3);margin-bottom:4px">TOTAL</div><div style="font-size:22px;font-weight:900;color:var(--t1)">' + totalUsers + '</div></div>' +
'<div style="background:var(--green-bg);border-radius:10px;padding:12px;text-align:center"><div style="font-size:10px;color:var(--green);margin-bottom:4px">HOY</div><div style="font-size:22px;font-weight:900;color:var(--green)">' + activeToday + '</div></div>' +
'<div style="background:var(--blue-bg);border-radius:10px;padding:12px;text-align:center"><div style="font-size:10px;color:#60a5fa;margin-bottom:4px">7 DÍAS</div><div style="font-size:22px;font-weight:900;color:#60a5fa">' + activeWeek + '</div></div>' +
'</div>';
var usersHTML = profiles.map(function(p) {
var name = (p.nombre ? p.nombre + ' ' + (p.apellido||'') : p.email).trim();
var lastLogin = p.last_login_at ? new Date(p.last_login_at).toLocaleDateString('es-DO', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Nunca';
var hasBackup = backupMap[p.id] ? '☁️' : '—';
var isMobile = p.user_agent && (p.user_agent.includes('iPhone') || p.user_agent.includes('Android')) ? '📱' : '💻';
var isMe = p.email === _adm ? ' (tú)' : '';
return '<div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">' +
'<div style="width:36px;height:36px;border-radius:10px;background:var(--gold-dim);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--gold);flex-shrink:0">' + (p.email||'?').charAt(0).toUpperCase() + '</div>' +
'<div style="flex:1;min-width:0">' +
'<div style="font-size:13px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + name + isMe + '</div>' +
'<div style="font-size:11px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (p.email||'') + '</div>' +
'<div style="font-size:10px;color:var(--t3);margin-top:1px">' + isMobile + ' · ' + lastLogin + ' · ' + hasBackup + '</div>' +
'</div>' +
'</div>';
}).join('');
el2.innerHTML = statsHTML +
'<div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px">Usuarios (' + totalUsers + ')</div>' +
usersHTML;
} catch(e) {
el2.innerHTML = '<div style="color:var(--red);padding:16px">Error: ' + e.message + '</div>';
}
}
