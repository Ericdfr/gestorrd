// calc.js — cálculos de GestorRD: análisis IA, patrimonio, proyección, logros y score.
// Lee DATA de store.js. No toca la interfaz.
var AI = {
run: function() {
var cur = DATA.curMonth, curY = DATA.curYear;
var prev = cur === 0 ? 11 : cur - 1;
var prevY = cur === 0 ? curY - 1 : curY;
var curIngs = DATA.ingresos.filter(function(x){ return x.month===cur && x.year===curY; });
var curGas = DATA.gastos.filter(function(x){ return x.month===cur && x.year===curY; });
var prevGas = DATA.gastos.filter(function(x){ return x.month===prev && x.year===prevY; });
var prevIngs = DATA.ingresos.filter(function(x){ return x.month===prev && x.year===prevY; });
var tI = curIngs.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = curGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tPI = prevIngs.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tPG = prevGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var cats = {};
curGas.forEach(function(g) {
var k = g.cat || 'Otros';
cats[k] = (cats[k] || 0) + toUSD(g.monto, g.mon);
});
var prevCats = {};
prevGas.forEach(function(g) {
var k = g.cat || 'Otros';
prevCats[k] = (prevCats[k] || 0) + toUSD(g.monto, g.mon);
});
var totAh = DATA.ahorros.reduce(function(a,x){ return a+toUSD(x.actual,x.mon); }, 0);
var totDeudas = DATA.deudas.filter(function(d){ return d.estado!=='Pagado'; })
.reduce(function(a,d){ return a+toUSD(d.bal||0,d.mon); }, 0);
var now = new Date();
var daysInMonth = new Date(curY, cur+1, 0).getDate();
var daysPassed = Math.min(now.getDate(), daysInMonth);
var spendRate = tG / Math.max(daysPassed, 1);
var safeSpend = Math.max(0, tI - tG - (spendRate * 3));
var insights = [];
if (!curIngs.length && !curGas.length) {
insights.push('Registra tus primeros ingresos y gastos para ver tu análisis.');
return { insights: insights, canSpend: 0, tI: tI, tG: tG };
}
if (tPI > 0) {
var ingChg = ((tI - tPI) / tPI * 100).toFixed(0);
if (ingChg > 0) insights.push('Tus ingresos subieron ' + ingChg + '% vs el mes pasado. 📈');
else if (ingChg < -5) insights.push('Tus ingresos bajaron ' + Math.abs(ingChg) + '% vs el mes pasado.');
}
if (tPG > 0 && tG > 0) {
var gasChg = ((tG - tPG) / tPG * 100).toFixed(0);
if (gasChg < -10) insights.push('Gastaste ' + Math.abs(gasChg) + '% menos que el mes pasado. ✅');
else if (gasChg > 15) insights.push('Tus gastos subieron ' + gasChg + '% vs el mes pasado. Revísalos.');
}
var topCat = Object.keys(cats).sort(function(a,b){ return cats[b]-cats[a]; })[0];
if (topCat && cats[topCat] > 0) {
var prevTop = prevCats[topCat] || 0;
if (prevTop > 0 && cats[topCat] > prevTop * 1.15) {
var diff = ((cats[topCat]-prevTop)/prevTop*100).toFixed(0);
insights.push('Gastaste ' + diff + '% más en ' + topCat + ' vs el mes pasado.');
} else {
insights.push('Tu mayor gasto este mes: ' + topCat + ' (' + fmt(cats[topCat]) + ').');
}
}
if (totAh > 0) {
var savRate = tI > 0 ? (totAh / tI * 100).toFixed(0) : 0;
insights.push('Tienes ' + fmt(totAh) + ' en metas de ahorro. Sigue así. 💪');
}
var budgetOk = DATA.presupuesto.filter(function(p) {
var spent = curGas.filter(function(g){ return g.cat===p.cat; }).reduce(function(a,g){ return a+toUSD(g.monto,g.mon); }, 0);
return spent >= toUSD(p.lim, p.mon) * 0.8;
});
if (budgetOk.length > 0) {
insights.push('⚠️ ' + budgetOk[0].cat + ' está cerca del límite de presupuesto.');
}
if (tI > 0 && tG < tI * 0.7) {
insights.push('Buen mes: guardas más de lo que gastas. Tu balance es positivo. ✅');
}
if (totDeudas > tI * 3) {
insights.push('Tus deudas superan 3 meses de ingresos. Considera un plan de pago.');
}
var netThis = tI - tG;
if (!DATA.bestMonthNet || netThis > DATA.bestMonthNet) {
if (DATA.bestMonthNet !== undefined && netThis > 0) {
insights.unshift('🎉 ¡Este es tu mejor mes registrado hasta ahora!');
}
DATA.bestMonthNet = netThis;
save();
}
if (insights.length === 0) {
insights.push('Sigue registrando para ver más análisis personalizados.');
}
return { insights: insights, canSpend: safeSpend, tI: tI, tG: tG };
}
};
var NETWORTH = {
run: function() {
var activos = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).reduce(function(a,b){ return a+toUSD(b.bal||0,b.mon); }, 0)
+ DATA.ahorros.reduce(function(a,x){ return a+toUSD(x.actual,x.mon); }, 0);
var pasivos = DATA.deudas.filter(function(d){ return d.estado!=='Pagado'; }).reduce(function(a,d){ return a+toUSD(d.bal||0,d.mon); }, 0);
var patri = activos - pasivos;
var key = DATA.curYear + '-' + DATA.curMonth;
if (!DATA.networthHist) DATA.networthHist = {};
DATA.networthHist[key] = patri;
var prevM = DATA.curMonth === 0 ? 11 : DATA.curMonth - 1;
var prevY = DATA.curMonth === 0 ? DATA.curYear - 1 : DATA.curYear;
var prevKey = prevY + '-' + prevM;
var prevPatri = DATA.networthHist[prevKey];
return { activos: activos, pasivos: pasivos, patri: patri, prevPatri: prevPatri };
}
};
var PREDICT = {
run: function() {
var cur = DATA.curMonth, curY = DATA.curYear;
var curIngs = DATA.ingresos.filter(function(x){ return x.month===cur && x.year===curY; });
var curGas = DATA.gastos.filter(function(x){ return x.month===cur && x.year===curY; });
var tI = curIngs.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = curGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tBan = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).reduce(function(a,b){ return a+toUSD(b.bal||0,b.mon); }, 0);
var now = new Date();
var isCurrentMonth = (now.getMonth()===cur && now.getFullYear()===curY);
var daysInMonth = new Date(curY, cur+1, 0).getDate();
var daysPassed = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
var daysLeft = isCurrentMonth ? Math.max(0, daysInMonth - daysPassed) : 0;
var dailySpend = tG / daysPassed;
var projectedSpend = tG + dailySpend * daysLeft;
var dailyIncome = tI / daysPassed;
var projectedIncome = tI + dailyIncome * daysLeft;
var projectedAvail;
if (tI > 0) {
projectedAvail = projectedIncome - projectedSpend;
} else {
projectedAvail = tBan - (dailySpend * daysLeft);
}
var overBudgetRisk = false;
var totalBudgetLim = DATA.presupuesto.reduce(function(a,p){ return a+toUSD(p.lim,p.mon); }, 0);
if (totalBudgetLim > 0 && projectedSpend > totalBudgetLim) overBudgetRisk = true;
return {
projectedAvail: projectedAvail,
projectedSpend: projectedSpend,
daysLeft: daysLeft,
overBudgetRisk: overBudgetRisk,
isCurrentMonth: isCurrentMonth
};
}
};
var ACHV_LIST = [
{ id: 'first_gasto', icon: '💸', name: 'Primer gasto', check: function(){ return DATA.gastos.length >= 1; } },
{ id: 'first_ingreso',icon: '💵', name: 'Primer ingreso', check: function(){ return DATA.ingresos.length >= 1; } },
{ id: 'first_month', icon: '🗓️', name: 'Primer mes completo', check: function(){ return DATA.gastos.length >= 5; } },
{ id: 'first_meta', icon: '🎯', name: 'Meta creada', check: function(){ return DATA.metas.length >= 1; } },
{ id: 'meta_done', icon: '🏆', name: 'Meta alcanzada', check: function(){ return DATA.metas.some(function(m){ return m.total>0 && m.actual>=m.total; }); } },
{ id: 'deuda_done', icon: '✅', name: 'Deuda finalizada', check: function(){ return DATA.deudas.some(function(d){ return d.estado==='Pagado'; }); } },
{ id: 'score_70', icon: '⭐', name: 'Score saludable', check: function(){ return SCORE.run().total >= 70; } },
{ id: 'budget_ok', icon: '📊', name: 'Presupuesto cumplido',check: function(){
if (!DATA.presupuesto.length) return false;
var cur = DATA.curMonth, curY = DATA.curYear;
var curGas = DATA.gastos.filter(function(x){ return x.month===cur && x.year===curY; });
return DATA.presupuesto.every(function(p){
var spent = curGas.filter(function(g){ return g.cat===p.cat; }).reduce(function(a,g){ return a+toUSD(g.monto,g.mon); }, 0);
return spent <= toUSD(p.lim,p.mon);
});
} },
];
var ACHV = {
run: function() {
if (!DATA.achvUnlocked) DATA.achvUnlocked = [];
var newlyUnlocked = [];
ACHV_LIST.forEach(function(a) {
var already = DATA.achvUnlocked.indexOf(a.id) !== -1;
var earned = false;
try { earned = a.check(); } catch(e) {}
if (earned && !already) {
DATA.achvUnlocked.push(a.id);
newlyUnlocked.push(a);
}
});
if (newlyUnlocked.length) save();
return { all: ACHV_LIST, unlocked: DATA.achvUnlocked, newlyUnlocked: newlyUnlocked };
}
};
var SCORE = {
run: function() {
// Return 0 score if guest mode or no expenses
if (isGuestMode || DATA.gastos.length === 0) {
  return { total: 0, label: '—', badgeClass: 'badge-gold', factors: [
    { name: t('score_saving'), pts: 0, max: 25 },
    { name: t('score_control'), pts: 0, max: 25 },
    { name: t('score_debt'), pts: 0, max: 20 },
    { name: t('score_budget'), pts: 0, max: 15 },
    { name: t('score_growth'), pts: 0, max: 15 }
  ]};
}
var cur = DATA.curMonth, curY = DATA.curYear;
var months6 = [];
for (var i = 0; i < 6; i++) {
var m = (cur - i + 12) % 12;
var y = cur - i < 0 ? curY - 1 : curY;
months6.push({m: m, y: y});
}
var curIngs = DATA.ingresos.filter(function(x){ return x.month===cur && x.year===curY; });
var curGas = DATA.gastos.filter(function(x){ return x.month===cur && x.year===curY; });
var tI = curIngs.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var tG = curGas.reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var totDeudas = DATA.deudas.filter(function(d){ return d.estado!=='Pagado'; }).reduce(function(a,d){ return a+toUSD(d.bal||0,d.mon); }, 0);
var totBancos = DATA.bancos.filter(function(b){ return !b.esTarjeta; }).reduce(function(a,b){ return a+toUSD(b.bal||0,b.mon); }, 0);
var totAh = DATA.ahorros.reduce(function(a,x){ return a+toUSD(x.actual,x.mon); }, 0);
var factors = [];
var total = 0;
var savingRate = tI > 0 ? (totAh / tI) : 0;
var savPts = Math.min(25, Math.round(savingRate * 100));
factors.push({ name: 'Ahorro', pts: savPts, max: 25, emoji: '🐷' });
total += savPts;
var spendRate = tI > 0 ? (tG / tI) : 1;
var spendPts = spendRate <= 0.5 ? 25 : spendRate <= 0.7 ? 20 : spendRate <= 0.9 ? 12 : spendRate <= 1.0 ? 6 : 0;
factors.push({ name: 'Control gastos', pts: spendPts, max: 25, emoji: '💸' });
total += spendPts;
var debtRatio = tI > 0 ? (totDeudas / (tI * 12)) : (totDeudas > 0 ? 1 : 0);
var debtPts = debtRatio === 0 ? 20 : debtRatio <= 0.3 ? 18 : debtRatio <= 0.6 ? 12 : debtRatio <= 1.0 ? 6 : 2;
factors.push({ name: 'Nivel de deudas', pts: debtPts, max: 20, emoji: '💳' });
total += debtPts;
var budPts = 0;
if (DATA.presupuesto.length === 0) {
budPts = 5;
} else {
var onBudget = DATA.presupuesto.filter(function(p) {
var spent = curGas.filter(function(g){ return g.cat===p.cat; }).reduce(function(a,g){ return a+toUSD(g.monto,g.mon); }, 0);
return spent <= toUSD(p.lim, p.mon);
});
budPts = Math.round((onBudget.length / DATA.presupuesto.length) * 15);
}
factors.push({ name: t('score_budget'), pts: budPts, max: 15, emoji: '📊' });
total += budPts;
var prev = cur === 0 ? 11 : cur - 1;
var prevY = cur === 0 ? curY - 1 : curY;
var prevI = DATA.ingresos.filter(function(x){ return x.month===prev && x.year===prevY; }).reduce(function(a,x){ return a+toUSD(x.monto,x.mon); }, 0);
var growPts = prevI === 0 ? 8 : tI >= prevI * 1.05 ? 15 : tI >= prevI ? 10 : tI >= prevI * 0.9 ? 6 : 3;
factors.push({ name: 'Crecimiento', pts: growPts, max: 15, emoji: '📈' });
total += growPts;
var label = total >= 85 ? 'Excelente 🌟' : total >= 70 ? 'Muy bueno 👍' : total >= 55 ? 'Bueno ✅' : total >= 40 ? 'Regular 🟡' : 'Necesita mejorar 🔴';
var badgeClass = total >= 70 ? 'badge-green' : total >= 45 ? 'badge-gold' : 'badge-red';
return { total: total, label: label, badgeClass: badgeClass, factors: factors };
}
};
