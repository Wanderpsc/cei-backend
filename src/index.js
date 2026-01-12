import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Desregistrar todos os service workers antigos primeiro
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach(registration => {
        registration.unregister().then(() => {
          console.log('Service Worker antigo removido');
        });
      });
    });

    // Limpar todos os caches antigos
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.startsWith('cei-v')) {
          caches.delete(cacheName).then(() => {
            console.log('Cache antigo removido:', cacheName);
          });
        }
      });
    });

    // Registrar novo Service Worker após limpar
    setTimeout(() => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado com sucesso:', registration.scope);
          
          // Forçar atualização imediata
          registration.update();
          
          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 Nova versão do Service Worker detectada');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nova versão disponível - atualizar automaticamente
                  console.log('🔄 Atualizando para nova versão...');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                } else {
                  // Primeira instalação
                  console.log('✅ Service Worker instalado pela primeira vez');
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Falha ao registrar Service Worker:', error);
        });
    }, 500);
  });
}

// Detectar instalação da PWA
window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o mini-infobar de aparecer no mobile
  e.preventDefault();
  // Salva o evento para ser usado depois
  window.deferredPrompt = e;
  
  console.log('PWA pode ser instalada');
});

window.addEventListener('appinstalled', () => {
  console.log('PWA foi instalada com sucesso');
  window.deferredPrompt = null;
});

