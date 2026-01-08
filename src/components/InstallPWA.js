import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

export default function InstallPWA() {
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowSuccess(true);
      setInstallable(false);
    }

    setDeferredPrompt(null);
  };

  if (!installable) {
    return null;
  }

  return (
    <>
      <Box 
        sx={{ 
          mt: 3, 
          p: 2, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '2px dashed',
          borderColor: 'primary.main',
          textAlign: 'center'
        }}
      >
        <PhoneIphoneIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="body2" fontWeight="600" gutterBottom>
          Instale o CEI no seu dispositivo
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Acesse rapidamente sem precisar abrir o navegador
        </Typography>
        <Button
          variant="contained"
          fullWidth
          startIcon={<GetAppIcon />}
          onClick={handleInstallClick}
          sx={{
            borderRadius: 2,
            py: 1,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          Instalar Aplicativo
        </Button>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          CEI instalado com sucesso! 🎉
        </Alert>
      </Snackbar>
    </>
  );
}
