import React, { useState } from 'react';
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
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { MenuBook, Close, Search } from '@mui/icons-material';
import axios from 'axios';

export default function BarcodeScannerDialog({ open, onClose, onBookFound }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isbnBuscado, setIsbnBuscado] = useState(false);
  const [mostrarCamposManual, setMostrarCamposManual] = useState(false);
  const [dadosLivro, setDadosLivro] = useState({
    isbn: '',
    titulo: '',
    autor: '',
    editora: '',
    anoPublicacao: '',
    categoria: '',
    descricao: '',
    paginas: '',
    foto: '',
    quantidade: '1',
    colecao: '',
    qtdLivrosColecao: ''
  });

  // Log para confirmar que está usando o componente atualizado
  React.useEffect(() => {
    if (open) {
      console.log('📚 BarcodeScannerDialog v3.2.0 - ISBN PRIMEIRO!');
    }
  }, [open]);

  // Função para buscar livro por ISBN
  const buscarLivroPorIsbn = async (isbn) => {
    if (!isbn || isbn.length < 10) {
      setError('⚠️ Digite um ISBN válido (10 ou 13 dígitos)');
      return;
    }

    setLoading(true);
    setError('');
    setIsbnBuscado(false);
    setMostrarCamposManual(false);
    
    try {
      console.log('🔍 Buscando ISBN:', isbn);
      
      // Tentar busca com restrição de idioma português
      let response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&langRestrict=pt`
      );
      
      // Se não encontrar, tentar busca global
      if (response.data.totalItems === 0) {
        console.log('🔄 Tentando busca global...');
        response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
        );
      }
      
      if (response.data.totalItems > 0) {
        const book = response.data.items[0].volumeInfo;
        console.log('📚 Livro encontrado:', book);
        
        // Pegar a melhor qualidade de imagem disponível
        let foto = '';
        if (book.imageLinks) {
          foto = book.imageLinks.extraLarge || 
                 book.imageLinks.large || 
                 book.imageLinks.medium || 
                 book.imageLinks.thumbnail || 
                 book.imageLinks.smallThumbnail || '';
          
          // Forçar HTTPS na URL da imagem
          if (foto) {
            foto = foto.replace('http://', 'https://');
          }
        }
        
        console.log('🖼️ Foto da capa:', foto);
        
        // Preencher todos os campos automaticamente
        setDadosLivro({
          isbn: isbn,
          titulo: book.title || '',
          subtitulo: book.subtitle || '',
          autor: book.authors?.join(', ') || '',
          editora: book.publisher || '',
          anoPublicacao: book.publishedDate?.substring(0, 4) || '',
          categoria: book.categories?.join(', ') || '',
          descricao: book.description || '',
          paginas: book.pageCount?.toString() || '',
          idioma: book.language || 'pt',
          foto: foto,
          quantidade: dadosLivro.quantidade || '1',
          colecao: dadosLivro.colecao || '',
          qtdLivrosColecao: dadosLivro.qtdLivrosColecao || ''
        });
        
        setIsbnBuscado(true);
        setMostrarCamposManual(true);
        console.log('✅ Formulário preenchido automaticamente!');
      } else {
        // ISBN não encontrado - permitir cadastro manual
        console.log('❌ Livro não encontrado com esse ISBN');
        setError('📚 Livro não encontrado. Preencha os dados manualmente.');
        setDadosLivro({ ...dadosLivro, isbn: isbn });
        setMostrarCamposManual(true);
        setIsbnBuscado(false);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar livro:', err);
      setError('⚠️ Erro ao buscar livro. Preencha os dados manualmente.');
      setDadosLivro({ ...dadosLivro, isbn: isbn });
      setMostrarCamposManual(true);
      setIsbnBuscado(false);
    } finally {
      setLoading(false);
    }
  };

  const handleIsbnBlur = () => {
    if (dadosLivro.isbn && dadosLivro.isbn.length >= 10) {
      buscarLivroPorIsbn(dadosLivro.isbn);
    }
  };

  const handleSalvar = () => {
    // Validação
    if (!dadosLivro.isbn) {
      setError('⚠️ ISBN é obrigatório!');
      return;
    }
    if (!dadosLivro.titulo) {
      setError('⚠️ Título é obrigatório!');
      return;
    }

    // Enviar dados do livro
    onBookFound(dadosLivro);
    handleClose();
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    setIsbnBuscado(false);
    setMostrarCamposManual(false);
    setDadosLivro({
      isbn: '',
      titulo: '',
      autor: '',
      editora: '',
      anoPublicacao: '',
      categoria: '',
      descricao: '',
      paginas: '',
      foto: '',
      quantidade: '1',
      colecao: '',
      qtdLivrosColecao: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBook />
            <span>Cadastrar Livro</span>
          </Box>
          <Button onClick={handleClose} size="small">
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>📝 Passo 1:</strong> Digite o ISBN (obrigatório)<br />
            <strong>🔍 Passo 2:</strong> O sistema buscará os dados automaticamente<br />
            <strong>✏️ Passo 3:</strong> Se não encontrar, preencha manualmente
          </Typography>
        </Alert>

        {loading && (
          <Box sx={{ textAlign: 'center', py: 3, mb: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              📚 Buscando dados do livro na internet...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isbnBuscado && dadosLivro.titulo && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Livro encontrado! Dados preenchidos automaticamente.
          </Alert>
        )}

        {/* CAMPO ISBN - SEMPRE PRIMEIRO E OBRIGATÓRIO */}
        <TextField
          fullWidth
          required
          label="ISBN"
          value={dadosLivro.isbn}
          onChange={(e) => {
            const valor = e.target.value.replace(/[^0-9]/g, '');
            setDadosLivro({...dadosLivro, isbn: valor});
            setError('');
          }}
          onBlur={handleIsbnBlur}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && dadosLivro.isbn) {
              buscarLivroPorIsbn(dadosLivro.isbn);
            }
          }}
          inputProps={{ 
            maxLength: 13,
            inputMode: 'numeric',
            pattern: '[0-9]*'
          }}
          InputProps={{
            endAdornment: dadosLivro.isbn && dadosLivro.isbn.length >= 10 && (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => buscarLivroPorIsbn(dadosLivro.isbn)}
                  disabled={loading}
                  edge="end"
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
          helperText="Digite o ISBN e pressione Enter ou clique na lupa para buscar"
          autoFocus
          sx={{ mb: 2 }}
        />

        {/* CAMPOS DO FORMULÁRIO - APARECEM APÓS BUSCAR ISBN */}
        {mostrarCamposManual && !loading && (
          <>
            {dadosLivro.foto && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img 
                  src={dadosLivro.foto} 
                  alt={dadosLivro.titulo || 'Capa do livro'} 
                  style={{ 
                    maxWidth: '120px', 
                    maxHeight: '180px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                />
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Título"
                  value={dadosLivro.titulo}
                  onChange={(e) => setDadosLivro({...dadosLivro, titulo: e.target.value})}
                  helperText="Obrigatório"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Autor"
                  value={dadosLivro.autor}
                  onChange={(e) => setDadosLivro({...dadosLivro, autor: e.target.value})}
                  placeholder="Nome do autor"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Editora"
                  value={dadosLivro.editora}
                  onChange={(e) => setDadosLivro({...dadosLivro, editora: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ano de Publicação"
                  value={dadosLivro.anoPublicacao}
                  onChange={(e) => setDadosLivro({...dadosLivro, anoPublicacao: e.target.value.replace(/[^0-9]/g, '')})}
                  inputProps={{ maxLength: 4 }}
                  placeholder="2024"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={dadosLivro.categoria}
                    label="Categoria"
                    onChange={(e) => setDadosLivro({...dadosLivro, categoria: e.target.value})}
                  >
                    <MenuItem value="">Selecione...</MenuItem>
                    <MenuItem value="Ficção">Ficção</MenuItem>
                    <MenuItem value="Não-Ficção">Não-Ficção</MenuItem>
                    <MenuItem value="Romance">Romance</MenuItem>
                    <MenuItem value="Fantasia">Fantasia</MenuItem>
                    <MenuItem value="Aventura">Aventura</MenuItem>
                    <MenuItem value="Mistério">Mistério</MenuItem>
                    <MenuItem value="Suspense">Suspense</MenuItem>
                    <MenuItem value="Terror">Terror</MenuItem>
                    <MenuItem value="Poesia">Poesia</MenuItem>
                    <MenuItem value="Drama">Drama</MenuItem>
                    <MenuItem value="Biografia">Biografia</MenuItem>
                    <MenuItem value="História">História</MenuItem>
                    <MenuItem value="Ciência">Ciência</MenuItem>
                    <MenuItem value="Filosofia">Filosofia</MenuItem>
                    <MenuItem value="Autoajuda">Autoajuda</MenuItem>
                    <MenuItem value="Didático">Didático</MenuItem>
                    <MenuItem value="Infantil">Infantil</MenuItem>
                    <MenuItem value="Juvenil">Juvenil</MenuItem>
                    <MenuItem value="Quadrinhos">Quadrinhos</MenuItem>
                    <MenuItem value="Religião">Religião</MenuItem>
                    <MenuItem value="Gastronomia">Gastronomia</MenuItem>
                    <MenuItem value="Arte">Arte</MenuItem>
                    <MenuItem value="Técnico">Técnico</MenuItem>
                    <MenuItem value="Outro">Outro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Quantidade"
                  type="number"
                  value={dadosLivro.quantidade}
                  onChange={(e) => setDadosLivro({...dadosLivro, quantidade: e.target.value})}
                  inputProps={{ min: 1 }}
                  helperText="Quantos exemplares deste livro?"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coleção"
                  value={dadosLivro.colecao}
                  onChange={(e) => setDadosLivro({...dadosLivro, colecao: e.target.value})}
                  placeholder="Ex: Harry Potter, Senhor dos Anéis..."
                  helperText="Pertence a alguma coleção?"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Qtd. Livros na Coleção"
                  type="number"
                  value={dadosLivro.qtdLivrosColecao}
                  onChange={(e) => setDadosLivro({...dadosLivro, qtdLivrosColecao: e.target.value})}
                  inputProps={{ min: 0 }}
                  placeholder="Total de livros"
                  disabled={!dadosLivro.colecao}
                  helperText="Quantos livros tem a coleção?"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Páginas"
                  value={dadosLivro.paginas}
                  onChange={(e) => setDadosLivro({...dadosLivro, paginas: e.target.value.replace(/[^0-9]/g, '')})}
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL da Foto da Capa"
                  value={dadosLivro.foto}
                  onChange={(e) => setDadosLivro({...dadosLivro, foto: e.target.value})}
                  placeholder="https://exemplo.com/capa.jpg"
                  helperText="Cole o link da imagem (opcional)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descrição"
                  value={dadosLivro.descricao}
                  onChange={(e) => setDadosLivro({...dadosLivro, descricao: e.target.value})}
                  placeholder="Sinopse ou descrição do livro"
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {mostrarCamposManual && (
          <Button 
            variant="contained" 
            color="success"
            onClick={handleSalvar}
            disabled={!dadosLivro.isbn || !dadosLivro.titulo}
          >
            ✅ Salvar Livro
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
