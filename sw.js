/*
 * Trabajador de servicio de GestorRD, versión 3. Solo para la web.
 *
 * El de la versión 2 guardaba todo en caché y respondía de la caché primero,
 * sin volver a preguntar. Eso quiere decir que al subir una versión nueva,
 * quien ya había entrado seguía viendo la vieja para siempre: su navegador
 * nunca pedía el index.html otra vez. Este archivo existe sobre todo para
 * reemplazar aquel y soltar a esa gente.
 *
 * Reglas:
 *  - El HTML siempre se pide a la red. Es el que dice qué archivos cargar, y
 *    en cada compilación cambian de nombre.
 *  - Los archivos de /assets/ llevan el hash en el nombre, así que si están
 *    en caché son los correctos y no hace falta volver a pedirlos.
 *  - Todo lo que no sea de esta casa (Supabase, la tasa del dólar) va directo
 *    a la red y no se toca.
 */

const CACHE = 'gestorrd-v3-1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      // Fuera todo lo que dejó la versión vieja
      const nombres = await caches.keys();
      await Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            void caches.open(CACHE).then((cache) => cache.put('/index.html', copia));
          }
          return respuesta;
        })
        // Sin internet, lo último que se vio
        .catch(async () => (await caches.match('/index.html')) ?? Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    evento.respondWith(
      caches.match(peticion).then(
        (guardado) =>
          guardado ??
          fetch(peticion).then((respuesta) => {
            if (respuesta.ok) {
              const copia = respuesta.clone();
              void caches.open(CACHE).then((cache) => cache.put(peticion, copia));
            }
            return respuesta;
          }),
      ),
    );
  }
});
