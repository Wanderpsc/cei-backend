import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { CheckCircle, Close, Crop as CropIcon } from '@mui/icons-material';

/**
 * Editor de corte de imagem (margens superior, inferior, esquerda e direita)
 * Props:
 *   open       - boolean
 *   imageData  - string base64 (data URL) da imagem a editar
 *   onSave     - função chamada com a imagem cortada (data URL)
 *   onClose    - função chamada ao cancelar
 *   title      - string (opcional)
 */
const ImageCropEditor = ({ open, imageData, onSave, onClose, title = 'Editar Imagem' }) => {
  const [cropBounds, setCropBounds] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const cropContainerRef = useRef(null);
  const draggingEdge = useRef(null);

  useEffect(() => {
    if (open) setCropBounds({ top: 0, left: 0, right: 0, bottom: 0 });
  }, [open, imageData]);

  const handleEdgePointerDown = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    draggingEdge.current = edge;

    const onMove = (ev) => {
      if (!draggingEdge.current || !cropContainerRef.current) return;
      const rect = cropContainerRef.current.getBoundingClientRect();
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      setCropBounds((prev) => {
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
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const handleSave = () => {
    if (!imageData) return;
    const { top, left, right, bottom } = cropBounds;
    if (top === 0 && left === 0 && right === 0 && bottom === 0) {
      onSave(imageData);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const srcX = Math.round(img.width  * left   / 100);
      const srcY = Math.round(img.height * top    / 100);
      const srcW = Math.round(img.width  * (100 - left  - right)  / 100);
      const srcH = Math.round(img.height * (100 - top   - bottom) / 100);
      c.width  = srcW;
      c.height = srcH;
      c.getContext('2d').drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
      onSave(c.toDataURL('image/jpeg', 0.92));
    };
    img.src = imageData;
  };

  const { top, left, right, bottom } = cropBounds;
  const hasCrop = top > 0 || left > 0 || right > 0 || bottom > 0;
  const HANDLE = 30;

  const handleStyle = (edge) => {
    const base = {
      position: 'absolute',
      width: HANDLE,
      height: HANDLE,
      bgcolor: '#fff',
      borderRadius: '50%',
      border: '2.5px solid #1976d2',
      zIndex: 10,
      touchAction: 'none',
      '&:hover': { bgcolor: '#bbdefb' },
      '&:active': { bgcolor: '#90caf9' }
    };
    if (edge === 'top')    return { ...base, top: `${top}%`,    left: '50%', transform: 'translate(-50%, -50%)', cursor: 'ns-resize' };
    if (edge === 'bottom') return { ...base, bottom: `${bottom}%`, left: '50%', transform: 'translate(-50%, 50%)', cursor: 'ns-resize' };
    if (edge === 'left')   return { ...base, top: '50%', left: `${left}%`,  transform: 'translate(-50%, -50%)', cursor: 'ew-resize' };
    if (edge === 'right')  return { ...base, top: '50%', right: `${right}%`, transform: 'translate(50%, -50%)', cursor: 'ew-resize' };
    return base;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#111', color: '#fff' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CropIcon />
          {title}
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Área da imagem com alças de recorte */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '75%',
            backgroundColor: '#000',
            overflow: 'hidden'
          }}
        >
          {imageData && (
            <>
              <img
                src={imageData}
                alt="Editar imagem"
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
                {/* Sombras nas margens cortadas */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${top}%`, bgcolor: 'rgba(0,0,0,0.6)' }} />
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${bottom}%`, bgcolor: 'rgba(0,0,0,0.6)' }} />
                <Box sx={{ position: 'absolute', top: `${top}%`, bottom: `${bottom}%`, left: 0, width: `${left}%`, bgcolor: 'rgba(0,0,0,0.6)' }} />
                <Box sx={{ position: 'absolute', top: `${top}%`, bottom: `${bottom}%`, right: 0, width: `${right}%`, bgcolor: 'rgba(0,0,0,0.6)' }} />

                {/* Borda da área selecionada */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: `${top}%`, left: `${left}%`,
                    right: `${right}%`, bottom: `${bottom}%`,
                    border: '2px solid rgba(255,255,255,0.85)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none'
                  }}
                />

                {/* Linhas de grade (regra dos terços) */}
                {[33, 66].map(pct => (
                  <React.Fragment key={pct}>
                    <Box sx={{
                      position: 'absolute',
                      top: `${top + (100 - top - bottom) * pct / 100}%`,
                      left: `${left}%`, right: `${right}%`,
                      height: '1px', bgcolor: 'rgba(255,255,255,0.2)',
                      pointerEvents: 'none'
                    }} />
                    <Box sx={{
                      position: 'absolute',
                      left: `${left + (100 - left - right) * pct / 100}%`,
                      top: `${top}%`, bottom: `${bottom}%`,
                      width: '1px', bgcolor: 'rgba(255,255,255,0.2)',
                      pointerEvents: 'none'
                    }} />
                  </React.Fragment>
                ))}

                {/* Alças de arrasto */}
                {['top', 'bottom', 'left', 'right'].map((edge) => (
                  <Box
                    key={edge}
                    onPointerDown={(e) => handleEdgePointerDown(e, edge)}
                    sx={handleStyle(edge)}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* Dica e valores */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(25,118,210,0.1)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="caption" sx={{ color: '#90caf9', display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <CropIcon sx={{ fontSize: 14 }} />
            Arraste as alças brancas para cortar margens (superior, inferior, esquerda, direita).
            {hasCrop && (
              <Box component="span" sx={{ ml: 1, color: '#ffcc02', fontWeight: 600 }}>
                Sup:{top.toFixed(0)}% Inf:{bottom.toFixed(0)}% Esq:{left.toFixed(0)}% Dir:{right.toFixed(0)}%
              </Box>
            )}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 2, backgroundColor: '#111' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
        >
          Cancelar
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
          onClick={handleSave}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
        >
          {hasCrop ? 'Salvar com Recorte' : 'Salvar Imagem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropEditor;
