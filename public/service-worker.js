// Service Worker CEI Biblioteca — Offline First
// Versão incrementada a cada deploy para forçar atualização do cache
const CACHE_VERSION = 'cei-v3.6.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Arquivos essenciais do app shell (pré-cacheados na instalação)
const APP_SHELL = [
  '/',
  '/index.html',
  '/200.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
];

// ── INSTALL: pré-cacheia o app shell ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL.map(url => new Request(url, { cache: 'reload' })))
        .catch(() => {}); // continua mesmo que algum recurso falhe
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: remove caches de versões antigas ────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k.startsWith('cei-') && k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Cache-First para assets estáticos, Network-First para o resto ──────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET e de outras origens (APIs externas)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Assets JS/CSS/imagens/fontes: Cache-First (nunca mudam sem novo hash no nome)
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          }
          return response;
        }).catch(() => caches.match('/index.html'));
      })
    );
    return;
  }

  // Navegação e HTML: Network-First com fallback para index.html cached
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then(cached => cached || caches.match('/index.html'));
      })
  );
});

// ── MENSAGENS ─────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
