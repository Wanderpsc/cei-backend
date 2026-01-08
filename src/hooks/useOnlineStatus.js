import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Estava offline e voltou online - trigger sincronização
        console.log('Conexão restaurada - sincronização necessária');
        window.dispatchEvent(new CustomEvent('sync-required'));
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar periodicamente
    const interval = setInterval(() => {
      const online = navigator.onLine;
      if (online !== isOnline) {
        setIsOnline(online);
        if (online && wasOffline) {
          window.dispatchEvent(new CustomEvent('sync-required'));
          setWasOffline(false);
        } else if (!online) {
          setWasOffline(true);
        }
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline, wasOffline]);

  return isOnline;
}
