import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import { QrCodeScanner, PhotoCamera, Close, Search, Keyboard } from '@mui/icons-material';
import { buscarLivroPorISBN } from '../utils/isbnSearchService';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

/**
 * Componente otimizado para leitura de códigos de barras e QR Code em dispositivos móveis
 * Suporta:
 * - Leitura por câmera (código de barras e QR Code)
 * - Entrada manual de ISBN
 * - Preenchimento automático de dados do livro
 */
export default function MobileBarcodeScanner({ open, onClose, onBookFound }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isbn, setIsbn] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Inicializar o leitor de código
  useEffect(() => {
    if (open && !codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  // Parar câmera ao trocar de aba
  useEffect(() => {
    if (tabIndex !== 0) {
      stopCamera();
    }
  }, [tabIndex]);

  const startCamera = async () => {
    try {
      setError('');
      setCameraActive(true);

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Câmera traseira preferencial
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          focusMode: { ideal: 'continuous' }, // Foco contínuo
          aspectRatio: { ideal: 1.7777777778 }, // 16:9
          zoom: { ideal: 1 }
        }
      };

      // Tentar com advanced constraints primeiro
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback para constraints simples
        console.log('⚠️ Usando constraints simplificados');
        const simpleConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
      }

      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Aplicar configurações avançadas de foco no track de vídeo
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        
        console.log('📷 Capabilities da câmera:', capabilities);
        
        // Tentar habilitar autofocus se disponível
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ focusMode: 'continuous' }]
            });
            console.log('✅ Autofocus contínuo ativado');
          } catch (e) {
            console.log('⚠️ Autofocus não suportado:', e.message);
          }
        }
        
        // Iniciar reprodução
        await videoRef.current.play();
        
        // Aguardar o vídeo estar pronto
        await new Promise(resolve => {
          videoRef.current.onloadedmetadata = resolve;
        });
        
        console.log('✅ Câmera iniciada, começando detecção...');
        
        // Iniciar detecção contínua
        detectCode();
      }
    } catch (err) {
      console.error('Erro ao iniciar câmera:', err);
      setError('Erro ao acessar câmera. Verifique as permissões.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const detectCode = async () => {
    if (!videoRef.current || !codeReaderRef.current || !cameraActive) {
      console.log('❌ Detecção cancelada: câmera inativa');
      return;
    }

    try {
      // Usar decodeFromVideoElement para leitura contínua
      const result = await codeReaderRef.current.decodeFromVideoElement(videoRef.current);

      if (result) {
        const code = result.getText();
        console.log('📷 Código detectado:', code);
        
        // Validar se parece com ISBN
        const isbnLimpo = code.replace(/[^0-9X]/gi, '').toUpperCase();
        console.log('📋 ISBN limpo:', isbnLimpo, '(tamanho:', isbnLimpo.length, ')');
        
        if (isbnLimpo.length === 10 || isbnLimpo.length === 13) {
          console.log('✅ ISBN válido detectado!');
          setIsbn(isbnLimpo);
          stopCamera();
          
          // Buscar livro automaticamente
          await buscarLivro(isbnLimpo);
          return; // Não continuar o loop
        } else {
          console.log('⚠️ Código não é ISBN válido (tamanho incorreto)');
          setError('Código detectado não é um ISBN válido');
          // Limpar erro após 2 segundos e continuar tentando
          setTimeout(() => setError(''), 2000);
        }
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        // Nenhum código encontrado, isso é normal
        // console.log('🔍 Procurando código...');
      } else {
        console.error('❌ Erro na detecção:', err);
        // Não mostrar erro ao usuário para não atrapalhar
      }
    }
    
    // Continuar o loop se a câmera ainda estiver ativa
    if (cameraActive) {
      setTimeout(detectCode, 300); // Tentar a cada 300ms
    }
  };

  const buscarLivro = async (isbnParam) => {
    const isbnBusca = isbnParam || isbn;
    const isbnLimpo = isbnBusca.replace(/[^0-9X]/gi, '').toUpperCase();

    if (!isbnLimpo || (isbnLimpo.length !== 10 && isbnLimpo.length !== 13)) {
      setError('ISBN inválido! Deve ter 10 ou 13 dígitos.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const resultado = await buscarLivroPorISBN(isbnLimpo);

      if (resultado.sucesso) {
        setSuccessMessage(`Livro encontrado: ${resultado.dados.titulo}`);
        
        // Enviar dados para o componente pai
        onBookFound(resultado.dados);
        
        // Fechar após 1.5 segundos
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError('Livro não encontrado. Digite os dados manualmente.');
        
        // Enviar ISBN mesmo sem dados
        onBookFound({ isbn: isbnLimpo });
        
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao buscar livro:', err);
      setError('Erro ao buscar livro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (isbn.trim()) {
      buscarLivro(isbn);
    } else {
      setError('Digite um ISBN válido');
    }
  };

  const handleClose = () => {
    stopCamera();
    setError('');
    setIsbn('');
    setSuccessMessage('');
    setTabIndex(0);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={window.innerWidth < 600}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeScanner />
            <Typography variant="h6" component="span">Escanear Código</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<PhotoCamera />} label="Câmera" />
        <Tab icon={<Keyboard />} label="Digitar ISBN" />
      </Tabs>

      <DialogContent>
        {/* Aba da Câmera */}
        {tabIndex === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>📷 Use a câmera do celular</strong><br />
                Aponte para o código de barras ou QR Code do livro
              </Typography>
            </Alert>

            {!cameraActive ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PhotoCamera />}
                  onClick={startCamera}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Ativar Câmera
                </Button>
              </Box>
            ) : (
              <Paper
                elevation={3}
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '75%', // Aspect ratio 4:3
                  overflow: 'hidden',
                  borderRadius: 2
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  playsInline
                  muted
                />
                
                {/* Overlay de guia */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '40%',
                    border: '3px solid #4caf50',
                    borderRadius: 2,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    pointerEvents: 'none'
                  }}
                />

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={stopCamera}
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16
                  }}
                >
                  Parar
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* Aba de Entrada Manual */}
        {tabIndex === 1 && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>⌨️ Digite o ISBN</strong><br />
                Digite o código ISBN de 10 ou 13 dígitos
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="ISBN"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Ex: 9788535928181"
              variant="outlined"
              autoFocus
              sx={{ mb: 2 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSearch();
                }
              }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Search />}
              onClick={handleManualSearch}
              disabled={!isbn.trim() || loading}
              sx={{ py: 1.5 }}
            >
              Buscar Livro
            </Button>
          </Box>
        )}

        {/* Mensagens de status */}
        {loading && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Buscando informações do livro...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        {isbn && !loading && !error && !successMessage && (
          <Alert severity="info" sx={{ mt: 2 }}>
            ISBN: <strong>{isbn}</strong>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
