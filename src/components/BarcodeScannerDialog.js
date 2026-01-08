import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { QrCodeScanner, Close } from '@mui/icons-material';
import axios from 'axios';

export default function BarcodeScannerDialog({ open, onClose, onBookFound }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState(null);

  useEffect(() => {
    if (open && !scanning) {
      setScanning(true);
      setError('');
      setBookData(null);

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // Suporta QR Code e Código de Barras
          formatsToSupport: [
            0, // QR_CODE
            13, // EAN_13 (código de barras padrão de livros)
            8  // EAN_8
          ]
        },
        false
      );

      scanner.render(onScanSuccess, onScanError);

      async function onScanSuccess(decodedText, decodedResult) {
        console.log('✅ Código detectado:', decodedText);
        scanner.clear();
        setScanning(false);
        setLoading(true);

        try {
          // Buscar livro pelo ISBN na Google Books API
          const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${decodedText}&key=AQ.Ab8RN6Itzsavy1fRFOt4wa-jlmDXWKYkjp-UoWDdsrhbEbdGqw`
          );

          if (response.data.totalItems > 0) {
            const book = response.data.items[0].volumeInfo;
            const dadosLivro = {
              isbn: decodedText,
              titulo: book.title || '',
              autor: book.authors?.join(', ') || '',
              editora: book.publisher || '',
              anoPublicacao: book.publishedDate?.substring(0, 4) || '',
              categoria: book.categories?.join(', ') || '',
              descricao: book.description || '',
              paginas: book.pageCount || '',
              foto: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || ''
            };

            setBookData(dadosLivro);
            setLoading(false);
          } else {
            // Tentar busca alternativa por título/autor se ISBN não funcionar
            fallbackSearch(decodedText);
          }
        } catch (err) {
          console.error('Erro ao buscar livro:', err);
          fallbackSearch(decodedText);
        }
      }

      async function fallbackSearch(codigo) {
        try {
          // Busca genérica
          const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${codigo}`
          );

          if (response.data.totalItems > 0) {
            const book = response.data.items[0].volumeInfo;
            const dadosLivro = {
              isbn: codigo,
              titulo: book.title || '',
              autor: book.authors?.join(', ') || '',
              editora: book.publisher || '',
              anoPublicacao: book.publishedDate?.substring(0, 4) || '',
              categoria: book.categories?.join(', ') || '',
              descricao: book.description || '',
              paginas: book.pageCount || '',
              foto: book.imageLinks?.thumbnail || ''
            };

            setBookData(dadosLivro);
          } else {
            setError('Livro não encontrado na base de dados. Você pode cadastrar manualmente.');
            setBookData({ isbn: codigo });
          }
        } catch (err) {
          setError('Erro ao buscar dados do livro. Cadastre manualmente.');
          setBookData({ isbn: codigo });
        } finally {
          setLoading(false);
        }
      }

      function onScanError(errorMessage) {
        // Ignora erros de scan contínuo
        if (!errorMessage.includes('NotFoundError')) {
          console.log('Erro de scan:', errorMessage);
        }
      }

      return () => {
        if (scanning) {
          scanner.clear().catch(console.error);
        }
      };
    }
  }, [open, scanning]);

  const handleUseBook = () => {
    if (bookData) {
      onBookFound(bookData);
      handleClose();
    }
  };

  const handleClose = () => {
    if (scanning) {
      setScanning(false);
    }
    setError('');
    setBookData(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeScanner />
            <span>Escanear Código do Livro</span>
          </Box>
          <Button onClick={handleClose} size="small">
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Como usar:</strong><br />
            1. Aponte a câmera para o <strong>código de barras</strong> (atrás do livro)<br />
            2. Ou escaneie o <strong>QR Code</strong> do livro<br />
            3. O sistema buscará os dados automaticamente!
          </Typography>
        </Alert>

        {loading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Buscando dados do livro...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {bookData && !loading && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6" color="success.dark" gutterBottom>
              ✅ Livro Encontrado!
            </Typography>
            {bookData.foto && (
              <img 
                src={bookData.foto} 
                alt={bookData.titulo} 
                style={{ maxWidth: '100px', marginBottom: '10px' }}
              />
            )}
            <Typography><strong>Título:</strong> {bookData.titulo}</Typography>
            <Typography><strong>Autor:</strong> {bookData.autor}</Typography>
            <Typography><strong>Editora:</strong> {bookData.editora}</Typography>
            <Typography><strong>ISBN:</strong> {bookData.isbn}</Typography>
          </Box>
        )}

        {scanning && !loading && !bookData && (
          <Box id="qr-reader" sx={{ width: '100%' }}></Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {bookData && (
          <Button variant="contained" onClick={handleUseBook}>
            Usar Estes Dados
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
