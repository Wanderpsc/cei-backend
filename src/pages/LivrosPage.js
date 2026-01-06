import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Avatar,
  Card,
  CardMedia,
  Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Search, PhotoCamera, Upload, Close } from '@mui/icons-material';
import { useData } from '../context/DataContext';

function LivrosPage() {
  const { livros, adicionarLivro, atualizarLivro, removerLivro } = useData();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    editora: '',
    anoPublicacao: '',
    categoria: '',
    quantidade: 1,
    localizacao: '',
    fotoUrl: '' // Nova propriedade para armazenar a foto em base64
  });

  const handleOpen = (livro = null) => {
    if (livro) {
      setEditando(livro.id);
      setFormData(livro);
    } else {
      setEditando(null);
      setFormData({
        titulo: '',
        autor: '',
        isbn: '',
        editora: '',
        anoPublicacao: '',
        categoria: '',
        quantidade: 1,
        localizacao: '',
        fotoUrl: ''
      });
    }
    setOpen(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verificar se é imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Verificar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fotoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fotoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverFoto = () => {
    setFormData({ ...formData, fotoUrl: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleSubmit = () => {
    if (editando) {
      atualizarLivro(editando, formData);
    } else {
      adicionarLivro(formData);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente remover este livro?')) {
      removerLivro(id);
    }
  };

  const livrosFiltrados = livros.filter(livro =>
    livro.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    livro.autor.toLowerCase().includes(busca.toLowerCase()) ||
    livro.isbn.includes(busca)
  );

  return (
    <Layout title="Livros">
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por título, autor ou ISBN..."
          variant="outlined"
          size="small"
          fullWidth
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Novo Livro
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Foto</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {livrosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">
                    Nenhum livro cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              livrosFiltrados.map((livro) => (
                <TableRow key={livro.id}>
                  <TableCell>
                    <Avatar
                      src={livro.fotoUrl}
                      alt={livro.titulo}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      {!livro.fotoUrl && livro.titulo.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>{livro.titulo}</TableCell>
                  <TableCell>{livro.autor}</TableCell>
                  <TableCell>{livro.isbn}</TableCell>
                  <TableCell>
                    <Chip label={livro.categoria} size="small" />
                  </TableCell>
                  <TableCell>{livro.quantidade}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(livro)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(livro.id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Livro' : 'Novo Livro'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              fullWidth
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
            <TextField
              label="Autor"
              fullWidth
              required
              value={formData.autor}
              onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
            />
            <TextField
              label="ISBN"
              fullWidth
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            />
            <TextField
              label="Editora"
              fullWidth
              value={formData.editora}
              onChange={(e) => setFormData({ ...formData, editora: e.target.value })}
            />
            <TextField
              label="Ano de Publicação"
              fullWidth
              type="number"
              value={formData.anoPublicacao}
              onChange={(e) => setFormData({ ...formData, anoPublicacao: e.target.value })}
            />
            <TextField
              label="Categoria"
              fullWidth
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            />
            <TextField
              label="Quantidade"
              fullWidth
              type="number"
              required
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
            />
            <TextField
              label="Localização"
              fullWidth
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
            />
            
            {/* Seção de Foto */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Foto do Livro
              </Typography>
              
              {formData.fotoUrl ? (
                <Card sx={{ maxWidth: 300, position: 'relative', mx: 'auto' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={formData.fotoUrl}
                    alt="Foto do livro"
                  />
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                    size="small"
                    onClick={handleRemoverFoto}
                  >
                    <Close />
                  </IconButton>
                </Card>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload
                  </Button>
                  
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleCameraCapture}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    Câmera
                  </Button>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.titulo || !formData.autor}
          >
            {editando ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default LivrosPage;
