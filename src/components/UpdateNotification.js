import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button, Box, Typography } from '@mui/material';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getBackupInfo } from '../utils/dataProtection';

/**
 * 🔄 Componente de Notificação de Atualização
 * 
 * Exibe notificações quando o sistema é atualizado
 * Garante que o usuário saiba que seus dados foram preservados
 */
export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInstalled, setUpdateInstalled] = useState(false);
  const [backupInfo, setBackupInfo] = useState(null);

  useEffect(() => {
    // Escutar mensagens do Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('🎉 [UPDATE] Atualização detectada:', event.data.version);
          setUpdateInstalled(true);
          
          // Buscar informações de backup
          const info = getBackupInfo();
          setBackupInfo(info);
          
          // Ocultar notificação após 8 segundos
          setTimeout(() => {
            setUpdateInstalled(false);
          }, 8000);
        }
      });

      // Verificar se há atualização aguardando
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    setUpdateAvailable(false);
    window.location.reload();
  };

  const handleClose = () => {
    setUpdateInstalled(false);
  };

  return (
    <>
      {/* Notificação de atualização disponível */}
      <Snackbar
        open={updateAvailable}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          icon={<SystemUpdateIcon />}
          action={
            <Button color="inherit" size="small" onClick={handleUpdate}>
              Atualizar
            </Button>
          }
          sx={{ minWidth: 400 }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Nova versão disponível!
          </Typography>
          <Typography variant="body2">
            Clique em "Atualizar" para obter as últimas melhorias.
            <br />
            <strong>Seus dados serão preservados automaticamente.</strong>
          </Typography>
        </Alert>
      </Snackbar>

      {/* Notificação de atualização instalada com sucesso */}
      <Snackbar
        open={updateInstalled}
        autoHideDuration={8000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          onClose={handleClose}
          sx={{ minWidth: 400 }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            ✅ Sistema atualizado com sucesso!
          </Typography>
          <Typography variant="body2">
            A nova versão foi instalada e seus dados foram preservados.
          </Typography>
          {backupInfo && backupInfo.exists && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                🛡️ Backup de segurança criado
              </Typography>
              <Typography variant="caption" display="block">
                📅 Última atualização: {new Date(backupInfo.timestamp).toLocaleString('pt-BR')}
              </Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>
    </>
  );
}
