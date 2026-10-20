// i18n.js — diccionario de textos ES/EN y cambio de idioma.
var T = {
  es: {
    // Greetings
    greeting_morning: 'Buenos días', greeting_afternoon: 'Buenas tardes', greeting_evening: 'Buenas noches',
    // Home
    available: 'Disponible este mes', expense: 'Gasto', income: 'Ingreso', savings: 'Ahorros',
    net_worth: 'Patrimonio neto', estimated_eom: 'Estimado fin de mes', days_left: 'días restantes',
    history: 'Historial', reports: 'Reportes', profile: 'Perfil', accounts: 'Cuentas', home: 'Inicio',
    new_expense: 'Nuevo gasto', new_income: 'Nuevo ingreso', save: 'Guardar', cancel: 'Cancelar',
    amount: 'Monto', category: 'Categoría', date: 'Fecha', description: 'Descripción',
    available_lbl: 'Disponible', expenses_lbl: 'Gastos', savings_lbl: 'Ahorros',
    month: 'mes', financial_score: 'Score Financiero', achievements: 'Logros',
    upcoming: 'Próximos pagos', no_upcoming: 'Sin pagos próximos',
    ai_center: 'Centro de Inteligencia', ask_ai: t('ask_ai'),
    add: 'Agregar', delete_account: 'Eliminar cuenta', logout: 'Cerrar sesión',
    privacy: 'Política de Privacidad', terms: 'Términos de Servicio',
    language: 'Idioma', region: 'Región', theme: 'Tema',
    free: 'libre', good: 'Bueno', excellent: 'Excelente', regular: 'Regular',
    // Wizard
    how_much_spent: t('how_much_spent'), what_spent_on: t('what_spent_on'), how_paid: t('how_paid'),
    save_expense: t('save_expense'), next: t('next'), back: '←',
    how_much_income: t('how_much_income'), source: 'Fuente', receive_method: 'Método de recibo',
    move_to_account: 'Mover a cuenta (opcional)', do_not_move: '— No mover —',
    save_income: t('save_income'),
    // Accounts
    my_accounts: 'Mis cuentas', total_accounts: 'Total en cuentas',
    add_account: 'Agregar cuenta', no_debts: t('no_debts'), no_goals: t('no_goals'),
    active_debts: 'Deudas activas', savings_goals: 'Metas de ahorro 💰',
    exchange_rate: t('exchange_rate'), edit: 'Editar',
    // Reports
    monthly_comparison: t('monthly_comparison'), patrimony: 'Patrimonio',
    assets: 'Activos', liabilities: 'Pasivos', patrimony_lbl: 'Patrimonio',
    income_vs_expenses: t('income_vs_expenses'), expenses_by_category: t('expenses_by_category'),
    monthly_summary: t('monthly_summary'), no_expenses: t('no_expenses'),
    export_pdf: '📄 PDF',
    // Profile
    my_account: 'Mi cuenta', sign_in: 'Iniciar sesión / Crear cuenta',
    password: 'Contraseña', security: 'Face ID / PIN', export_backup: 'Exportar respaldo',
    import_csv: 'Importar CSV', ai_advisor: 'Asesor IA', restore_data: 'Restaurar datos',
    preferences: 'Preferencias', alerts: 'Alertas de pago', budget_alerts: 'Alertas presupuesto',
    custom_cats: 'Categorías personalizadas', whats_new: 'Novedades v1.1', view_tour: 'Ver tour',
    // AI
    ai_title: t('ai_title'), ai_sub: t('ai_sub'),
    ai_greeting: 'Hola 👋 Soy tu asesor financiero IA. ¿En qué te ayudo?',
    where_spent: '¿En qué gasté más este mes?', how_improve: '¿Qué puedo mejorar?',
    how_save: '¿Cuánto puedo ahorrar más?', how_raise_score: '¿Cómo subo mi score?',
    // Score
    score_saving: 'Ahorro', score_control: 'Control gastos', score_debt: 'Nivel de deudas',
    score_budget: 'Presupuesto', score_growth: 'Crecimiento',
    // Misc
    days_remaining: 'días restantes', no_transactions: 'Sin transacciones registradas',
    no_income_registered: 'Sin ingresos registrados', guest_mode: 'Sin cuenta (local)',
    can_spend: t('can_spend'),
    upcoming_title: t('upcoming_title'), achievements_title: t('achievements_title'), next_achievements: t('next_achievements'),
    score_title: t('score_title'),
  },
  en: {
    // Greetings
    greeting_morning: 'Good morning', greeting_afternoon: 'Good afternoon', greeting_evening: 'Good evening',
    // Home
    available: 'Available this month', expense: 'Expense', income: 'Income', savings: 'Savings',
    net_worth: 'Net worth', estimated_eom: 'Month-end estimate', days_left: 'days left',
    history: 'History', reports: 'Reports', profile: 'Profile', accounts: 'Accounts', home: 'Home',
    new_expense: 'New expense', new_income: 'New income', save: 'Save', cancel: 'Cancel',
    amount: 'Amount', category: 'Category', date: 'Date', description: 'Description',
    available_lbl: 'Available', expenses_lbl: 'Expenses', savings_lbl: 'Savings',
    month: 'month', financial_score: 'Financial Score', achievements: 'Achievements',
    upcoming: 'Upcoming payments', no_upcoming: 'No upcoming payments',
    ai_center: 'Intelligence Center', ask_ai: 'Ask a question...',
    add: 'Add', delete_account: 'Delete account', logout: 'Sign out',
    privacy: 'Privacy Policy', terms: 'Terms of Service',
    language: 'Language', region: 'Region', theme: 'Theme',
    free: 'free', good: 'Good', excellent: 'Excellent', regular: 'Fair',
    // Wizard
    how_much_spent: 'How much did you spend?', what_spent_on: 'What did you spend on?', how_paid: 'How did you pay?',
    save_expense: '💾 Save expense', next: 'Next →', back: '←',
    how_much_income: 'How much did you receive?', source: 'Source', receive_method: 'Receive method',
    move_to_account: 'Move to account (optional)', do_not_move: '— Do not move —',
    save_income: 'Save income',
    // Accounts
    my_accounts: 'My accounts', total_accounts: 'Total in accounts',
    add_account: 'Add account', no_debts: 'No active debts', no_goals: 'No active goals',
    active_debts: 'Active debts', savings_goals: 'Savings goals 💰',
    exchange_rate: 'USD / DOP Rate', edit: 'Edit',
    // Reports
    monthly_comparison: 'Monthly comparison', patrimony: 'Net Worth',
    assets: 'Assets', liabilities: 'Liabilities', patrimony_lbl: 'Net Worth',
    income_vs_expenses: 'Income vs Expenses', expenses_by_category: 'Expenses by category',
    monthly_summary: 'Monthly summary', no_expenses: 'No expenses this month',
    export_pdf: '📄 PDF',
    // Profile
    my_account: 'My account', sign_in: 'Sign in / Create account',
    password: 'Password', security: 'Face ID / PIN', export_backup: 'Export backup',
    import_csv: 'Import CSV', ai_advisor: 'AI Advisor', restore_data: 'Restore data',
    preferences: 'Preferences', alerts: 'Payment alerts', budget_alerts: 'Budget alerts',
    custom_cats: 'Custom categories', whats_new: "What's new v1.1", view_tour: 'View tour',
    // AI
    ai_title: '🧠 AI Advisor', ai_sub: 'Ask me about your finances',
    ai_greeting: 'Hello 👋 I\'m your AI financial advisor. How can I help?',
    where_spent: 'Where did I spend most this month?', how_improve: 'What can I improve?',
    how_save: 'How much more can I save?', how_raise_score: 'How do I raise my score?',
    // Score
    score_saving: 'Savings', score_control: 'Expense control', score_debt: 'Debt level',
    score_budget: 'Budget', score_growth: 'Growth',
    // Misc
    days_remaining: 'days left', no_transactions: 'No transactions recorded',
    no_income_registered: 'No income registered', guest_mode: 'No account (local)',
    can_spend: 'You can spend until today without exceeding your budget:',
    upcoming_title: 'UPCOMING PAYMENTS', achievements_title: 'ACHIEVEMENTS', next_achievements: 'UPCOMING',
    score_title: 'FINANCIAL SCORE',
    saved: 'Saved ✓', expense_saved: 'Expense saved ✓', income_saved: 'Income saved ✓',
    account_saved: 'Account saved ✓', account_deleted: 'Account deleted',
    updated: 'Updated ✓', error: 'Error', loading: 'Loading...',
    select_bank: 'Select a bank', select_category: 'Select a category',
    enter_amount: 'Enter an amount', balance_updated: 'Balance updated ✓',
    debt_paid: 'Payment registered ✓', goal_saved: 'Goal saved ✓',
    backup_downloaded: 'Backup downloaded ✓', backup_saved: 'Backup saved in cloud ✓',
    sign_in_first: 'Sign in first', rate_updated: 'Rate updated ✓',
    fixed_applied: 'Fixed expenses applied ✓', pin_set: 'PIN configured ✓',
    pin_wrong: 'Wrong PIN', copied: 'Copied ✓',
    theme_updated: 'Theme updated', lang_es: 'Spanish selected 🇩🇴', lang_en: 'English selected 🇺🇸',
    session_closed: 'Session closed', welcome: 'Welcome to GestorRD!',
    too_many_actions: 'Too many actions. Wait a moment.',
    available_until: 'You can spend until today without exceeding your budget:',
  }
};

function t(key) {
  try {
    var lang = (typeof DATA !== 'undefined' && DATA.lang) ? DATA.lang : 'es';
    if (typeof T === 'undefined') return key;
    return (T[lang] && T[lang][key]) || (T['es'] && T['es'][key]) || key;
  } catch(e) { return key; }
}

function setLangPref(l) {
  localStorage.setItem('grd3_lang', l);
  DATA.lang = l;
  save();
  // Update active button
  ['es','en'].forEach(function(x) {
    var btn = document.getElementById('lang-' + x);
    if (!btn) return;
    var active = x === l;
    btn.style.background = active ? 'var(--gold-dim)' : 'none';
    btn.style.borderColor = active ? 'var(--gold)' : 'var(--border2)';
    btn.style.color = active ? 'var(--gold)' : 'var(--t2)';
    btn.style.fontWeight = active ? '700' : '400';
  });
  // Update key UI strings
  applyLang(l);
  showToast(l === 'en' ? '🇺🇸 English selected' : '🇩🇴 Español seleccionado');
}

function applyLang(l) {
  DATA.lang = l;
  document.documentElement.lang = l;

  var en = l === 'en';

  // ── Static DOM elements ──────────────────────────────
  var map = {
    'nb-label-home': t('home'), 'nb-label-cuentas': t('accounts'),
    'nb-label-reportes': t('reports'), 'nb-label-perfil': t('profile'),
    'dsb-home': '🏠 ' + t('home'), 'dsb-cuentas': '💳 ' + t('accounts'),
    'dsb-reportes': '📊 ' + t('reports'), 'dsb-perfil': '👤 ' + t('profile'),
    'balance-label-txt': t('available'),
    'lbl-patrimonio': t('net_worth'), 'lbl-estimado': t('estimated_eom'),
    'lbl-proximos': t('upcoming'), 'lbl-logros': '🏆 ' + t('achievements'),
    'lbl-patri-title': t('patrimony'),
    'qa-historial': t('history'), 'qa-reportes': t('reports'),
    'sec-cuenta': en ? 'Account' : 'Cuenta', 'sec-prefs': t('preferences'),
    'sec-region': t('region'), 'sec-app': 'App',
    'lbl-password': t('password'), 'lbl-pin': t('security'),
    'lbl-export': t('export_backup'), 'lbl-import': t('import_csv'),
    'lbl-ai-advisor': t('ai_advisor'), 'lbl-restore': t('restore_data'),
    'lbl-region': t('region'),
    'pref-lang-label': t('language') + (en ? '' : ' / Language'),
    'lbl-tema': t('theme'), 'lbl-alertas': t('alerts'),
    'lbl-alertas-presup': t('budget_alerts'), 'lbl-cats': t('custom_cats'),
    'lbl-novedades': t('whats_new'), 'lbl-tour': t('view_tour'),
    'lbl-privacy': t('privacy'), 'lbl-terms': t('terms'),
  };

  Object.keys(map).forEach(function(id) {
    var el2 = document.getElementById(id);
    if (el2) el2.textContent = map[id];
  });

  // ── Desktop sidebar extra buttons ────────────────────
  var dsbExtras = document.querySelectorAll('#desktop-sidebar .dsb-nav');
  if (dsbExtras.length > 4) {
    if (dsbExtras[5]) dsbExtras[5].textContent = en ? '💸 New expense' : '💸 Nuevo gasto';
    if (dsbExtras[6]) dsbExtras[6].textContent = en ? '💵 New income'  : '💵 Nuevo ingreso';
    if (dsbExtras[7]) dsbExtras[7].textContent = en ? '📋 History'     : '📋 Historial';
    if (dsbExtras[8]) dsbExtras[8].textContent = en ? '🧠 AI Advisor'  : t('ai_title');
  }

  // ── Legend labels (inside balance card) ─────────────
  var legends = document.querySelectorAll('.legend-name');
  var legMap = en
    ? ['Available','Expenses','Savings']
    : [t('available_lbl'), t('expenses_lbl'), t('savings_lbl')];
  legends.forEach(function(el2, i) { if (legMap[i]) el2.textContent = legMap[i]; });

  // ── Donut center label ───────────────────────────────
  var donutLbl = document.querySelector('.donut-lbl');
  if (donutLbl) donutLbl.textContent = en ? 'free' : 'libre';

  // ── Refresh screens to pick up t() strings ───────────
  refreshHome();
  if (typeof refreshCuentas === 'function') refreshCuentas();
  if (typeof refreshReportes === 'function') refreshReportes();
  if (typeof updProfile === 'function') updProfile();
  if (typeof updateDesktopSummary === 'function') updateDesktopSummary();
}
