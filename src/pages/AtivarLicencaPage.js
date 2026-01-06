import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLicense } from '../context/LicenseContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

export default function AtivarLicencaPage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  
  const { activate, isAuthorized, licenseInfo, deviceInfo, getDeviceInfo } = useLicense();
  const navigate = useNavigate();

  useEffect(() => {
    // Se já está autorizado, redirecionar
    if (isAuthorized && licenseInfo) {
      navigate('/');
    }

    // Gerar info do dispositivo
    if (!deviceInfo) {
      getDeviceInfo();
    }
  }, [isAuthorized, licenseInfo, navigate]);

  const handleActivate = async () => {
    setError('');
    setSuccess('');

    // Validar formato
    const licensePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!licensePattern.test(licenseKey.toUpperCase())) {
      setError('Formato inválido. Use: XXXX-XXXX-XXXX-XXXX');
      return;
    }

    setIsActivating(true);

    const result = await activate(licenseKey.toUpperCase());

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setError(result.message);
    }

    setIsActivating(false);
  };

  const formatLicenseKey = (value) => {
    // Remover caracteres não alfanuméricos
    let cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Limitar a 16 caracteres
    cleaned = cleaned.substring(0, 16);
    
    // Adicionar hífens
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += '-';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

  const handleInputChange = (e) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const formatted = formatLicenseKey(pasted);
    setLicenseKey(formatted);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={24} sx={{ p: 4, borderRadius: 4 }}>
          {/* Cabeçalho */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SecurityIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Ativar Licença
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sistema CEI - Controle Escolar Inteligente
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Alertas */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              <strong>Erro:</strong> {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
              <strong>Sucesso!</strong> {success}
              <br />
              Redirecionando...
            </Alert>
          )}

          {/* Informações de Segurança */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                <SecurityIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Sistema de Licenciamento Único
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Um dispositivo por licença"
                    secondary="Sua licença funciona apenas neste dispositivo"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Proteção contra compartilhamento"
                    secondary="Links compartilhados não funcionarão em outros dispositivos"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Verificação contínua"
                    secondary="O sistema verifica sua licença periodicamente"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Formulário de Ativação */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              <VpnKeyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Código de Licença
            </Typography>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={handleInputChange}
              onPaste={handlePaste}
              disabled={isActivating}
              inputProps={{
                maxLength: 19,
                style: { 
                  fontSize: '1.5rem', 
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                  fontFamily: 'monospace'
                }
              }}
              sx={{ mb: 3 }}
              helperText="Cole ou digite o código fornecido pelo administrador"
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleActivate}
              disabled={isActivating || licenseKey.length !== 19}
              startIcon={isActivating ? <CircularProgress size={20} /> : <LockOpenIcon />}
              sx={{ mb: 2, py: 1.5 }}
            >
              {isActivating ? 'Ativando...' : 'Ativar Licença'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Informações do Dispositivo */}
          {deviceInfo && (
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  <DevicesIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} />
                  Informações do Dispositivo
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`ID: ${deviceInfo.fingerprint.substring(0, 16)}...`}
                    size="small"
                    sx={{ mr: 1, mb: 1, fontFamily: 'monospace' }}
                  />
                  <Chip 
                    label={deviceInfo.details.platform}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={`${deviceInfo.details.screenWidth}x${deviceInfo.details.screenHeight}`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Ajuda */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                Não tem um código de licença? Entre em contato com o administrador do sistema.
              </Typography>
            </Alert>
          </Box>

          {/* Copyright */}
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              © {new Date().getFullYear()} CEI - Sistema desenvolvido por
            </Typography>
            <Typography variant="caption" color="primary" display="block" fontWeight="bold">
              Wander Pires Silva Coelho ®
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
