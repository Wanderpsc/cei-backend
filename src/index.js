import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar Service Worker para PWA (offline support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);
        registration.update();

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Falha ao registrar Service Worker:', error);
      });
  });
}

// Detectar instalação da PWA
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

window.addEventListener('appinstalled', () => {
  window.deferredPrompt = null;
});

