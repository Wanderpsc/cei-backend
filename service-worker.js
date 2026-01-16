// Service Worker para CEI - Controle Escolar Inteligente
// 🛡️ Sistema de Atualização Automática com Proteção de Dados
const CACHE_NAME = 'cei-v3.5.0'; // NOVA VERSÃO - Sistema de proteção de dados
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando nova versão...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Cache aberto:', CACHE_NAME);
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})))
          .catch(err => {
            console.log('⚠️ [SW] Erro ao adicionar recursos ao cache:', err);
            // Continua mesmo com alguns erros de cache
          });
      })
  );
  // Ativa imediatamente a nova versão
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Ativando nova versão...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ [SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎉 [SW] Nova versão ativada com sucesso!');
      console.log('📌 [SW] Versão atual:', CACHE_NAME);
      
      // Notificar todos os clientes sobre a atualização
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_NAME,
            message: 'Sistema atualizado! Seus dados foram preservados.'
          });
        });
      });
    })
  );
  
  // Assume controle de todos os clientes imediatamente
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Se falhar, tenta retornar a página principal do cache
          return caches.match('/index.html');
        });
      })
  );
});

// Mensagens do Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
