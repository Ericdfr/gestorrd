// legal.js — hojas de privacidad, términos y novedades de la versión.
function buildPrivacidadSheet() {
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button><div class="step-title">🔒 Política de Privacidad</div><div class="step-sub">Última actualización: Julio 2026</div></div>' +
'<div style="padding:0 16px 80px;font-size:13px;color:var(--t2);line-height:1.7">' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">1. Información que recopilamos</div>' +
'<p>GestorRD recopila información que tú nos proporcionas directamente: datos financieros (ingresos, gastos, cuentas bancarias), dirección de correo electrónico, nombre y apellido. También recopilamos automáticamente: tipo de dispositivo, versión de la app y fecha de último acceso.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">2. Uso de Inteligencia Artificial</div>' +
'<p style="background:var(--gold-dim);border:1px solid rgba(201,169,110,0.3);border-radius:8px;padding:10px;color:var(--t1)">⚠️ <strong>Esta aplicación utiliza Inteligencia Artificial.</strong> El Asesor IA y el Centro de Inteligencia analizan tus datos financieros localmente para generar recomendaciones personalizadas. Ningún dato financiero personal es enviado a servicios de IA externos de terceros sin tu consentimiento explícito.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">3. Cómo usamos tu información</div>' +
'<p>Usamos tu información para: proveer y mejorar el servicio, generar análisis financieros personalizados, sincronizar tus datos entre dispositivos, y enviarte notificaciones relevantes sobre tu actividad financiera.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">4. Almacenamiento y seguridad</div>' +
'<p>Tus datos se guardan en tu dispositivo. Si activas la copia de seguridad en la nube, se guardan en Supabase (servidores AWS us-east-2). Tu contraseña y tu PIN se guardan cifrados como huella (PBKDF2-SHA256), nunca en texto plano. Implementamos medidas de seguridad técnicas y organizativas para proteger tu información.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">5. Compartición de datos</div>' +
'<p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto cuando sea requerido por ley o con proveedores de servicio que nos ayudan a operar la aplicación (Supabase, solo si activas la copia de seguridad en la nube).</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">6. Eliminación de cuenta</div>' +
'<p>Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento enviando un correo a soporte@gestorrd.com. Tus datos serán anonimizados dentro de 30 días.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">7. Contacto</div>' +
'<p>Para preguntas sobre privacidad: <strong>soporte@gestorrd.com</strong></p>' +
'<button onclick="openSheet(\'terminos\')" style="width:100%;padding:12px;margin-top:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);color:var(--t1);font-size:13px;cursor:pointer">Ver Términos de Servicio →</button>' +
'</div>';
}
function buildTerminosSheet() {
return '<div class="step-header"><button class="step-back" onclick="closeSheet()">←</button><div class="step-title">📋 Términos de Servicio</div><div class="step-sub">Última actualización: Julio 2026</div></div>' +
'<div style="padding:0 16px 80px;font-size:13px;color:var(--t2);line-height:1.7">' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">1. Aceptación de términos</div>' +
'<p>Al usar GestorRD, aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses la aplicación.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">2. Descripción del servicio</div>' +
'<p>GestorRD es una aplicación de gestión de finanzas personales diseñada para usuarios en República Dominicana y Estados Unidos. El servicio incluye registro de transacciones, análisis financiero con IA, y sincronización en la nube.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">3. Uso de Inteligencia Artificial</div>' +
'<p>La aplicación incorpora funciones de Inteligencia Artificial para el análisis de tus finanzas. Las recomendaciones generadas por IA son orientativas y no constituyen asesoramiento financiero profesional.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">4. Responsabilidad del usuario</div>' +
'<p>Eres responsable de la exactitud de los datos que ingresas. GestorRD no se responsabiliza por decisiones financieras tomadas basándose en la información de la app.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">5. Suscripción y pagos</div>' +
'<p>GestorRD ofrece una suscripción Premium. Los pagos se procesan a través de Apple App Store o Stripe. Las suscripciones se renuevan automáticamente salvo que se cancelen antes del período de renovación.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">6. CLÁUSULA DE ARBITRAJE</div>' +
'<p style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--t1)"><strong>ACUERDO DE ARBITRAJE VINCULANTE:</strong> Cualquier disputa, reclamación o controversia que surja de o en relación con estos Términos o el uso de GestorRD será resuelta exclusivamente mediante arbitraje vinculante individual, no mediante litigio en tribunales. El arbitraje se llevará a cabo conforme a las reglas de la American Arbitration Association (AAA). <strong>Renuncias a tu derecho a un juicio por jurado y a participar en demandas colectivas.</strong> Esta cláusula no aplica a reclamaciones de propiedad intelectual o medidas cautelares urgentes.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">7. Ley aplicable</div>' +
'<p>Estos términos se rigen por las leyes del Estado de Massachusetts, Estados Unidos, y la Ley 172-13 de Protección de Datos de República Dominicana.</p>' +
'<div style="font-weight:700;color:var(--t1);margin:16px 0 6px">8. Contacto</div>' +
'<p>Para consultas: <strong>soporte@gestorrd.com</strong></p>' +
'</div>';
}
function buildNovedadesSheet() {
var en = DATA.lang === 'en';
var title = en ? '🆕 Version 1.0 — Launch' : '🆕 Versión 1.0 — Lanzamiento';
var items = en ? [
['🎉','Welcome to GestorRD!','Personal finance app designed for Dominicans in RD and USA.'],
['💰','USD + DOP','Manage dollars and pesos with automatic real-time exchange rate.'],
['🧠','AI Advisor','Ask questions about your finances and get personalized insights.'],
['⭐','Financial Score','Track your financial health with a 0-100 score across 5 factors.'],
['📊','Smart Reports','Monthly comparisons, spending by category, and year-end summary.'],
['🌎','Two regions','Switch between Dominican Republic, USA, or both from Profile → Region.'],
['🔒','Secure & Private','Your data stays on your device. Cloud backup optional with account.'],
] : [
['🎉','¡Bienvenido a GestorRD!','App de finanzas personales diseñada para dominicanos en RD y USA.'],
['💰','USD + DOP','Maneja dólares y pesos con tasa de cambio automática en tiempo real.'],
['🧠','Asesor IA','Pregunta sobre tus finanzas y obtén análisis personalizados.'],
['⭐','Score Financiero','Mide tu salud financiera con un score de 0-100 en 5 factores.'],
['📊','Reportes inteligentes','Comparaciones mensuales, gastos por categoría y resumen anual.'],
['🌎','Dos regiones','Cambia entre República Dominicana, USA o ambas desde Perfil → Región.'],
['🔒','Seguro y privado','Tus datos se quedan en tu dispositivo. Respaldo en la nube opcional.'],
];
return '<div class="step-header"><div class="step-title">' + title + '</div></div>' +
'<div style="padding:0 16px 20px">' +
items.map(function(n) {
return '<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
'<div style="width:36px;height:36px;border-radius:10px;background:var(--gold-dim);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">' + n[0] + '</div>' +
'<div><div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:2px">' + n[1] + '</div><div style="font-size:12px;color:var(--t2);line-height:1.4">' + n[2] + '</div></div>' +
'</div>';
}).join('') + '</div>';
}
