import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLicense } from '../context/LicenseContext';
import { Box, CircularProgress, Typography, Container, Paper } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

/**
 * Componente para proteger rotas que requerem licença ativa
 */
export default function ProtectedRoute({ children }) {
  const { isAuthorized, isLoading, error, checkAuthorization } = useLicense();
  const location = useLocation();

  useEffect(() => {
    // Verificar autorização ao entrar na rota
    if (!isAuthorized && !isLoading) {
      checkAuthorization();
    }
  }, [location.pathname]);

  // Enquanto está carregando
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={24} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
            <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Verificando Licença...
            </Typography>
            <CircularProgress sx={{ mt: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Aguarde enquanto validamos seu acesso
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Se não está autorizado, redirecionar para ativação
  if (!isAuthorized) {
    return <Navigate to="/ativar-licenca" state={{ from: location }} replace />;
  }

  // Se está autorizado, mostrar conteúdo
  return <>{children}</>;
}
