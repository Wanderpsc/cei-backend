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
  CircularProgress,
  Slider,
  Typography
} from '@mui/material';
import {
  PhotoCamera,
  Close,
  FlipCameraAndroid,
  CheckCircle,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Crop as CropIcon
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
  const [zoomLevel, setZoomLevel] = useState(1); // zoom 1x a 4x
  // Crop: % a cortar de cada lado (0 = sem corte)
  const [cropBounds, setCropBounds] = useState({ top: 0, left: 0, right: 0, bottom: 0 });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cropContainerRef = useRef(null);
  const draggingEdge = useRef(null);

  // Iniciar câmera quando o dialog abrir
  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    }
    // Limpar ao fechar
    return () => { stopCamera(); };
  }, [open, facingMode]);

  // Resetar estado ao fechar
  useEffect(() => {
    if (!open) {
      setZoomLevel(1);
      setCapturedImage(null);
      setCropBounds({ top: 0, left: 0, right: 0, bottom: 0 });
      setError(null);
    }
  }, [open]);

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

      // Solicitar acesso à câmera com resolução maior para zoom digital
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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
    const fullW = video.videoWidth;
    const fullH = video.videoHeight;

    // Recortar a área central de acordo com o zoom
    const cropW = fullW / zoomLevel;
    const cropH = fullH / zoomLevel;
    const cropX = (fullW - cropW) / 2;
    const cropY = (fullH - cropH) / 2;

    canvas.width = Math.round(cropW);
    canvas.height = Math.round(cropH);

    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    setCropBounds({ top: 0, left: 0, right: 0, bottom: 0 });
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCropBounds({ top: 0, left: 0, right: 0, bottom: 0 });
    setZoomLevel(1);
    startCamera();
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;
    const { top, left, right, bottom } = cropBounds;
    // Sem recorte: enviar imagem original
    if (top === 0 && left === 0 && right === 0 && bottom === 0) {
      onCapture(capturedImage);
      handleClose();
      return;
    }
    // Aplicar recorte via canvas
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const srcX = Math.round(img.width * left / 100);
      const srcY = Math.round(img.height * top / 100);
      const srcW = Math.round(img.width * (100 - left - right) / 100);
      const srcH = Math.round(img.height * (100 - top - bottom) / 100);
      c.width = srcW;
      c.height = srcH;
      c.getContext('2d').drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
      onCapture(c.toDataURL('image/jpeg', 0.92));
      handleClose();
    };
    img.src = capturedImage;
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
    setZoomLevel(1);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCropBounds({ top: 0, left: 0, right: 0, bottom: 0 });
    setZoomLevel(1);
    setError(null);
    onClose();
  };

  // Drag para recorte nas 4 laterais
  const handleEdgePointerDown = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    draggingEdge.current = edge;

    const onMove = (ev) => {
      if (!draggingEdge.current || !cropContainerRef.current) return;
      const rect = cropContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
      setCropBounds(prev => {
        const next = { ...prev };
        if (draggingEdge.current === 'top')    next.top    = Math.min(y * 100,       100 - prev.bottom - 5);
        if (draggingEdge.current === 'bottom') next.bottom = Math.min((1 - y) * 100, 100 - prev.top    - 5);
        if (draggingEdge.current === 'left')   next.left   = Math.min(x * 100,       100 - prev.right  - 5);
        if (draggingEdge.current === 'right')  next.right  = Math.min((1 - x) * 100, 100 - prev.left   - 5);
        return next;
      });
    };

    const onUp = () => {
      draggingEdge.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const { top, left, right, bottom } = cropBounds;
  const hasCrop = top > 0 || left > 0 || right > 0 || bottom > 0;
  const HANDLE = 28; // tamanho das alças em px

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
        {capturedImage ? 'Ajustar Imagem' : title}
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

        {!loading && !error && (
          <Box sx={{ 
            position: 'relative',
            width: '100%',
            paddingTop: '75%',
            backgroundColor: '#000',
            overflow: 'hidden'
          }}>

            {/* ── CÂMERA AO VIVO ── */}
            {!capturedImage && (
              <>
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
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    transform: facingMode === 'user'
                      ? `scale(${zoomLevel}) scaleX(-1)`
                      : `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.08s'
                  }}
                />

                {/* Botão de trocar câmera */}
                {stream && (
                  <IconButton
                    onClick={toggleCamera}
                    sx={{
                      position: 'absolute',
                      top: 12, right: 12,
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <FlipCameraAndroid />
                  </IconButton>
                )}

                {/* Controle de zoom */}
                {stream && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: 12, left: 12, right: 12,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    borderRadius: 2,
                    p: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <IconButton
                      size="small"
                      sx={{ color: '#fff', p: 0.5 }}
                      onClick={() => setZoomLevel(z => Math.max(1, parseFloat((z - 0.25).toFixed(2))))}
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                    <Slider
                      value={zoomLevel}
                      min={1}
                      max={4}
                      step={0.05}
                      onChange={(_, v) => setZoomLevel(v)}
                      sx={{
                        color: '#fff',
                        flexGrow: 1,
                        '& .MuiSlider-thumb': { width: 16, height: 16 }
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{ color: '#fff', p: 0.5 }}
                      onClick={() => setZoomLevel(z => Math.min(4, parseFloat((z + 0.25).toFixed(2))))}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ color: '#fff', fontSize: 13, minWidth: 34, textAlign: 'right' }}>
                      {zoomLevel.toFixed(1)}x
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* ── IMAGEM CAPTURADA + ALÇAS DE RECORTE ── */}
            {capturedImage && (
              <>
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'contain'
                  }}
                />

                {/* Overlay de recorte */}
                <Box
                  ref={cropContainerRef}
                  sx={{ position: 'absolute', inset: 0, userSelect: 'none', touchAction: 'none' }}
                >
                  {/* Áreas escuras fora do recorte */}
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${top}%`, bgcolor: 'rgba(0,0,0,0.55)' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${bottom}%`, bgcolor: 'rgba(0,0,0,0.55)' }} />
                  <Box sx={{ position: 'absolute', top: `${top}%`, bottom: `${bottom}%`, left: 0, width: `${left}%`, bgcolor: 'rgba(0,0,0,0.55)' }} />
                  <Box sx={{ position: 'absolute', top: `${top}%`, bottom: `${bottom}%`, right: 0, width: `${right}%`, bgcolor: 'rgba(0,0,0,0.55)' }} />

                  {/* Borda do recorte */}
                  <Box sx={{
                    position: 'absolute',
                    top: `${top}%`, left: `${left}%`, right: `${right}%`, bottom: `${bottom}%`,
                    border: '2px solid rgba(255,255,255,0.9)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none'
                  }} />

                  {/* Alça — Topo */}
                  <Box
                    onPointerDown={e => handleEdgePointerDown(e, 'top')}
                    sx={{
                      position: 'absolute', top: `${top}%`, left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: HANDLE, height: HANDLE,
                      bgcolor: '#fff', borderRadius: '50%',
                      border: '2.5px solid #1976d2',
                      cursor: 'ns-resize', zIndex: 10,
                      '&:hover': { bgcolor: '#bbdefb' }
                    }}
                  />

                  {/* Alça — Base */}
                  <Box
                    onPointerDown={e => handleEdgePointerDown(e, 'bottom')}
                    sx={{
                      position: 'absolute', bottom: `${bottom}%`, left: '50%',
                      transform: 'translate(-50%, 50%)',
                      width: HANDLE, height: HANDLE,
                      bgcolor: '#fff', borderRadius: '50%',
                      border: '2.5px solid #1976d2',
                      cursor: 'ns-resize', zIndex: 10,
                      '&:hover': { bgcolor: '#bbdefb' }
                    }}
                  />

                  {/* Alça — Esquerda */}
                  <Box
                    onPointerDown={e => handleEdgePointerDown(e, 'left')}
                    sx={{
                      position: 'absolute', top: '50%', left: `${left}%`,
                      transform: 'translate(-50%, -50%)',
                      width: HANDLE, height: HANDLE,
                      bgcolor: '#fff', borderRadius: '50%',
                      border: '2.5px solid #1976d2',
                      cursor: 'ew-resize', zIndex: 10,
                      '&:hover': { bgcolor: '#bbdefb' }
                    }}
                  />

                  {/* Alça — Direita */}
                  <Box
                    onPointerDown={e => handleEdgePointerDown(e, 'right')}
                    sx={{
                      position: 'absolute', top: '50%', right: `${right}%`,
                      transform: 'translate(50%, -50%)',
                      width: HANDLE, height: HANDLE,
                      bgcolor: '#fff', borderRadius: '50%',
                      border: '2.5px solid #1976d2',
                      cursor: 'ew-resize', zIndex: 10,
                      '&:hover': { bgcolor: '#bbdefb' }
                    }}
                  />
                </Box>
              </>
            )}

          </Box>
        )}

        {/* Dica de recorte */}
        {capturedImage && !loading && !error && (
          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(25,118,210,0.12)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="caption" sx={{ color: '#90caf9', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CropIcon sx={{ fontSize: 14 }} />
              Arraste as alças brancas para ajustar cada lateral da imagem.
              {hasCrop && ` (T:${top.toFixed(0)}% B:${bottom.toFixed(0)}% E:${left.toFixed(0)}% D:${right.toFixed(0)}%)`}
            </Typography>
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
                '&:hover': { backgroundColor: '#1976d2' }
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
            {hasCrop && (
              <Button
                variant="outlined"
                onClick={() => setCropBounds({ top: 0, left: 0, right: 0, bottom: 0 })}
                sx={{ color: '#ff9800', borderColor: '#ff9800' }}
              >
                Limpar Recorte
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={confirmPhoto}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#388e3c' }
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
