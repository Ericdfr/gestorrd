// sync.js — respaldo y restauración en la nube (Supabase) y sesión de Supabase.
function recordCount() { return (DATA.ingresos||[]).length + (DATA.gastos||[]).length + (DATA.deudas||[]).length + (DATA.bancos||[]).length + (DATA.metas||[]).length; }
var cloudBackupTimer = null;
function scheduleCloudBackup() {
if (!currentUser || !sb) return;
clearTimeout(cloudBackupTimer);
cloudBackupTimer = setTimeout(function() { cloudBackupNow(false); }, 2500);
}
async function cloudBackupNow(show) {
if (!currentUser || !sb) return;
try {
var r = await sb.from('app_backups').upsert({ user_id: currentUser.id, email: currentUser.email, data: { version: '2.0', fecha: new Date().toISOString(), datos: DATA }, records_count: recordCount(), device: navigator.platform || navigator.userAgent, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
if (r.error) { if (show) showToast('Error respaldo nube: ' + r.error.message); }
else { if (show) showToast(t('backup_saved')); }
} catch(e) { if (show) showToast('Error al guardar respaldo'); }
}
async function restoreCloudBackup() {
// Sistema local - no hay respaldo en la nube
}
async function initSupabaseAuth() {
if (!sb) return;
try {
var r = await sb.auth.getSession();
var session = r.data && r.data.session;
if (session) { currentUser = session.user; isGuestMode = false; localStorage.setItem('grd3_auth', 'user'); }
} catch(e) {}
sb.auth.onAuthStateChange(function(event, session) {
if (event === 'PASSWORD_RECOVERY' && session) {
currentUser = session.user; isGuestMode = false;
localStorage.setItem('grd3_auth', 'user');
launchApp();
setTimeout(function() { openSheetWith(buildCambiarPwdSheet()); }, 500);
}
});
}
