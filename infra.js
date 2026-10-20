// infra.js — monitoreo de errores, caché en memoria, límite de peticiones y service worker.
function initErrorMonitoring() {
  window.onerror = function(msg, src, line, col, err) {
    logError('js_error', msg, err ? err.stack : src + ':' + line);
    return false;
  };
  window.onunhandledrejection = function(e) {
    logError('promise_rejection', e.reason ? e.reason.toString() : 'Unhandled rejection', '');
  };
}

async function logError(type, message, stack) {
  if (!sb) return;
  try {
    await sb.from('app_errors').insert({
      user_id: currentUser ? currentUser.id : null,
      error_type: type,
      error_message: message ? message.toString().substring(0, 500) : 'unknown',
      app_version: APP_VERSION,
      device_info: navigator.userAgent.substring(0, 200),
      url: window.location.href
    });
  } catch(e) { /* silent - don't create error loops */ }
}

// ── Caching ──────────────────────────────────────────────
var _cache = {};
var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function initCache() {
  // Pre-cache tasa USD/DOP
  var cachedTasa = localStorage.getItem('grd3_tasa_cache');
  var cachedTime = localStorage.getItem('grd3_tasa_time');
  if (cachedTasa && cachedTime && (Date.now() - parseInt(cachedTime)) < 3600000) {
    DATA.tasa = parseFloat(cachedTasa);
  }
}

function cacheSet(key, value, ttl) {
  _cache[key] = { value: value, expires: Date.now() + (ttl || CACHE_TTL) };
}

function cacheGet(key) {
  var item = _cache[key];
  if (!item) return null;
  if (Date.now() > item.expires) { delete _cache[key]; return null; }
  return item.value;
}

// Wrapper con cache para llamadas a Supabase
async function cachedQuery(key, queryFn, ttl) {
  var cached = cacheGet(key);
  if (cached !== null) return cached;
  var result = await queryFn();
  if (result && !result.error) cacheSet(key, result, ttl);
  return result;
}

// ── Rate Limiting (cliente) ──────────────────────────────
var _rateLimits = {};

function checkClientRateLimit(action, maxCount, windowMs) {
  var now = Date.now();
  var window = windowMs || 60000; // 1 minuto default
  var max = maxCount || 30;

  if (!_rateLimits[action]) _rateLimits[action] = [];

  // Limpiar entradas viejas
  _rateLimits[action] = _rateLimits[action].filter(function(t) { return now - t < window; });

  if (_rateLimits[action].length >= max) {
    showToast(t('too_many_actions'));
    return false;
  }

  _rateLimits[action].push(now);
  return true;
}

// ── Escalabilidad: ServiceWorker para cache offline ──────
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function() { /* silent */ });
  }
}
