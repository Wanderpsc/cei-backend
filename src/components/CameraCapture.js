import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera,
  Close,
  FlipCameraAndroid,
  CheckCircle
} from '@mui/icons-material';

/**
 * Componente para captura de foto direta da câmera
 * Permite tirar foto em tempo real sem necessidade de upload
 */
const CameraCapture = ({ open, onClose, onCapture, title = "Tirar Foto" }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' ou 'environment'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Iniciar câmera quando o dialog abrir
  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    }
    
    // Limpar ao fechar
    return () => {
      stopCamera();
    };
  }, [open, facingMode, capturedImage]);

  const startCamera = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Solicitar acesso à câmera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      
      // Conectar stream ao elemento de vídeo
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Forçar reprodução
        videoRef.current.play().catch(err => {
          console.error('Erro ao iniciar vídeo:', err);
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setLoading(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Acesso à câmera negado. Por favor, permita o acesso nas configurações do navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada no dispositivo.');
      } else if (err.name === 'NotReadableError') {
        setError('Câmera já está em uso por outro aplicativo.');
      } else {
        setError(err.message || 'Erro ao acessar câmera');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Definir tamanho do canvas igual ao vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame atual do vídeo no canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    
    // Parar câmera
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#000',
          color: '#fff'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: '#fff'
      }}>
        {title}
        <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative', minHeight: 400 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 400 
          }}>
            <CircularProgress />
          </Box>
        )}

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Vídeo da câmera ou imagem capturada */}
        {!loading && !error && (
          <Box sx={{ 
            position: 'relative',
            width: '100%',
            paddingTop: '75%', // Aspect ratio 4:3
            backgroundColor: '#000'
          }}>
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Foto capturada"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  e.target.play().catch(err => console.error('Play error:', err));
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />
            )}

            {/* Botão de trocar câmera (apenas se não capturou ainda) */}
            {!capturedImage && stream && (
              <IconButton
                onClick={toggleCamera}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: '#fff',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <FlipCameraAndroid />
              </IconButton>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'center', 
        gap: 2, 
        p: 2,
        backgroundColor: '#000'
      }}>
        {!capturedImage ? (
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ color: '#fff', borderColor: '#fff' }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<PhotoCamera />}
              onClick={capturePhoto}
              disabled={!stream || loading || !!error}
              sx={{
                backgroundColor: '#2196f3',
                '&:hover': {
                  backgroundColor: '#1976d2'
                }
              }}
            >
              Capturar
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={retakePhoto}
              sx={{ color: '#fff', borderColor: '#fff' }}
            >
              Tirar Outra
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={confirmPhoto}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#388e3c'
                }
              }}
            >
              Confirmar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CameraCapture;
