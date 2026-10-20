// notifs.js — hoja de notificaciones dentro de la app.
function showNotifs() {
  var en = DATA.lang === 'en';
  var notifs = [];
  var now = new Date();
  
  // Check upcoming fixed expenses
  (DATA.gastosFijos || []).forEach(function(gf) {
    var dia = parseInt(gf.dia) || 1;
    var today = now.getDate();
    var diff = dia - today;
    if (diff >= 0 && diff <= 5) {
      notifs.push({
        icon: '🔔',
        title: en ? 'Upcoming payment' : 'Pago próximo',
        msg: (gf.desc || gf.cat) + ' — ' + fmt(gf.monto, gf.mon),
        type: diff <= 2 ? 'urgent' : 'warn'
      });
    }
  });
  
  // Check budget alerts
  var cur = DATA.curMonth, curY = DATA.curYear;
  (DATA.presupuesto || []).forEach(function(p) {
    var spent = (DATA.gastos || [])
      .filter(function(g) { return g.month===cur && g.year===curY && g.cat===p.cat; })
      .reduce(function(a,g) { return a + toUSD(g.monto, g.mon); }, 0);
    var lim = toUSD(p.lim, p.mon);
    var pct = lim > 0 ? Math.round(spent/lim*100) : 0;
    if (pct >= 80) {
      notifs.push({
        icon: '⚠️',
        title: en ? 'Budget alert' : 'Alerta de presupuesto',
        msg: (p.cat || 'Categoría') + ' — ' + pct + '% ' + (en ? 'used' : 'utilizado'),
        type: pct >= 100 ? 'urgent' : 'warn'
      });
    }
  });

  if (notifs.length === 0) {
    openSheetWith(
      '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
      '<div class="step-title">🔔 ' + (en ? 'Notifications' : 'Notificaciones') + '</div></div>' +
      '<div style="text-align:center;padding:40px 20px">' +
      '<div style="font-size:48px;margin-bottom:16px">✅</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--t1);margin-bottom:8px">' + (en ? 'All clear!' : '¡Todo bien!') + '</div>' +
      '<div style="font-size:13px;color:var(--t2)">' + (en ? 'No pending notifications' : 'Sin notificaciones pendientes') + '</div>' +
      '</div>'
    );
    return;
  }

  var html = '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button>' +
    '<div class="step-title">🔔 ' + (en ? 'Notifications' : 'Notificaciones') + ' (' + notifs.length + ')</div></div>' +
    '<div style="padding:0 16px 40px">';
  notifs.forEach(function(n) {
    var color = n.type === 'urgent' ? 'var(--red)' : 'var(--gold)';
    html += '<div style="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--border);align-items:flex-start">' +
      '<div style="font-size:24px">' + n.icon + '</div>' +
      '<div><div style="font-size:14px;font-weight:700;color:var(--t1)">' + n.title + '</div>' +
      '<div style="font-size:13px;color:var(--t2);margin-top:2px">' + n.msg + '</div></div>' +
      '</div>';
  });
  html += '</div>';
  openSheetWith(html);
}
