// GestorRD Service Worker v2.0
// Cache offline + performance

const CACHE_NAME = 'gestorrd-v2.1';
const ASSETS = [
  '/',
  '/accounts.js',
  '/admin.js',
  '/ai.js',
  '/app.js',
  '/auth.js',
  '/calc.js',
  '/config.js',
  '/desktop.js',
  '/history.js',
  '/home.js',
  '/i18n.js',
  '/import.js',
  '/index.html',
  '/infra.js',
  '/launch.js',
  '/legal.js',
  '/menus.js',
  '/notifs.js',
  '/onboarding.js',
  '/premium.js',
  '/profile.js',
  '/reports.js',
  '/search.js',
  '/settings.js',
  '/sheet-core.js',
  '/sheets.js',
  '/store.js',
  '/styles.css',
  '/sync.js',
  '/tour.js',
  '/ui.js'
];

// Install - cache assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch - cache first for assets, network first for API
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Skip Supabase API calls - always network
  if (url.includes('supabase.co') || url.includes('openai') || url.includes('generativelanguage')) {
    return;
  }

  // Cache first for app assets
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response.ok && e.request.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback
        return caches.match('/index.html');
      });
    })
  );
});
