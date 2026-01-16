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
  MenuItem,
  LinearProgress,
  Chip
} from '@mui/material';
import { MenuBook, Close, Search } from '@mui/icons-material';
import { buscarLivroPorISBN } from '../utils/isbnSearchService';

export default function BarcodeScannerDialog({ open, onClose, onBookFound }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isbnBuscado, setIsbnBuscado] = useState(false);
  const [mostrarCamposManual, setMostrarCamposManual] = useState(false);
  const [progressoAtual, setProgressoAtual] = useState(null); // Para mostrar progresso da busca
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

  // Estados para detecção de leitor a laser
  const [bufferScanner, setBufferScanner] = useState('');
  const [ultimoCaractere, setUltimoCaractere] = useState(Date.now());
  const timeoutRef = React.useRef(null);

  // Log para confirmar que está usando o componente atualizado
  React.useEffect(() => {
    if (open) {
      console.log('📚 BarcodeScannerDialog v3.4.1 - BUSCA APRIMORADA COM FONTES BRASILEIRAS!');
      console.log('🔫 Leitor de código de barras com detecção aprimorada');
      console.log('🇧🇷 Busca em fontes brasileiras: Editoras FTD, Ática, Moderna, Saraiva, etc.');
      console.log('🌐 Busca global: Google Books + Open Library + Mercado Editorial');
    }
  }, [open]);

  // Sistema de detecção de leitor a laser APRIMORADO
  React.useEffect(() => {
    if (!open) return;

    let scanBuffer = '';
    let scanTimestamp = Date.now();
    let scanTimeout = null;

    const handleKeyDown = (event) => {
      const now = Date.now();
      const timeSinceLastKey = now - scanTimestamp;
      const char = event.key;

      // Ignorar teclas especiais exceto Enter
      if (char.length > 1 && char !== 'Enter') return;

      // Se for Enter e temos um buffer válido
      if (char === 'Enter') {
        if (scanBuffer.length >= 10 && scanBuffer.length <= 13) {
          event.preventDefault();
          const isbn = scanBuffer;
          console.log('🔫 Leitor laser detectado! ISBN:', isbn);
          scanBuffer = '';
          setDadosLivro(prev => ({...prev, isbn}));
          setBufferScanner(isbn);
          buscarLivroPorIsbn(isbn);
        }
        return;
      }

      // Detectar leitor a laser: tempo rápido entre teclas (< 100ms)
      const isFastTyping = timeSinceLastKey < 100;
      
      // Se for número ou letra e digitação rápida
      if (/^[0-9X]$/i.test(char)) {
        // Resetar buffer se passou muito tempo (> 200ms = nova leitura)
        if (timeSinceLastKey > 200) {
          scanBuffer = '';
        }

        scanBuffer += char;
        scanTimestamp = now;
        setBufferScanner(scanBuffer);

        // Limpar timeout anterior
        if (scanTimeout) clearTimeout(scanTimeout);

        // Auto-buscar após 150ms de inatividade
        scanTimeout = setTimeout(() => {
          if (scanBuffer.length >= 10 && scanBuffer.length <= 13) {
            const isbn = scanBuffer;
            console.log('🔫 Código completo capturado:', isbn);
            scanBuffer = '';
            setDadosLivro(prev => ({...prev, isbn}));
            setBufferScanner(isbn);
            buscarLivroPorIsbn(isbn);
          } else if (scanBuffer.length > 0) {
            console.log('⚠️ Buffer incompleto:', scanBuffer);
            scanBuffer = '';
            setBufferScanner('');
          }
        }, 150);
      }
    };

    // Usar keydown para captura mais rápida
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (scanTimeout) clearTimeout(scanTimeout);
    };
  }, [open, mostrarCamposManual]);

  // Função para buscar livro usando o novo serviço aprimorado
  const buscarLivroPorIsbn = async (isbn) => {
    // Limpar e validar ISBN
    const isbnLimpo = isbn.replace(/[^0-9X]/gi, '').toUpperCase();
    
    console.log('🔍 ISBN RECEBIDO:', isbn);
    console.log('🧹 ISBN LIMPO:', isbnLimpo);
    
    if (!isbnLimpo || (isbnLimpo.length !== 10 && isbnLimpo.length !== 13)) {
      setError('⚠️ ISBN inválido! Deve ter 10 ou 13 dígitos.');
      setDadosLivro({ ...dadosLivro, isbn: isbnLimpo });
      setMostrarCamposManual(true);
      return;
    }

    setLoading(true);
    setError('');
    setIsbnBuscado(false);
    setMostrarCamposManual(false);
    setProgressoAtual(null);
    
    // Estado para armazenar a fonte
    let fonteEncontrada = '';
    
    try {
      // Usar o novo serviço de busca aprimorado
      const resultado = await buscarLivroPorISBN(isbnLimpo, (progresso) => {
        // Atualizar progresso visual
        setProgressoAtual(progresso);
        console.log(`📊 Progresso: ${progresso.progresso}% - Tentando: ${progresso.estrategia}`);
      });
      
      if (resultado.sucesso) {
        console.log('✅ LIVRO ENCONTRADO!');
        console.log('📚 Fonte:', resultado.fonte);
        console.log('📖 Dados:', resultado.dados);
        
        fonteEncontrada = resultado.fonte;
        
        // Preencher formulário com os dados encontrados
        setDadosLivro({
          ...resultado.dados,
          quantidade: dadosLivro.quantidade || '1',
          colecao: dadosLivro.colecao || resultado.dados.colecao || '',
          qtdLivrosColecao: dadosLivro.qtdLivrosColecao || resultado.dados.qtdLivrosColecao || '',
          _fonte: fonteEncontrada // Armazenar fonte para exibir depois
        });
        
        setIsbnBuscado(true);
        setMostrarCamposManual(true);
        setError('');
      } else {
        // Não encontrou em nenhuma fonte
        console.log('❌ LIVRO NÃO ENCONTRADO');
        setError(resultado.mensagem || `📚 ISBN ${isbnLimpo} não encontrado.\nVerifique o código e preencha os dados manualmente.`);
        setDadosLivro({ ...dadosLivro, isbn: isbnLimpo });
        setMostrarCamposManual(true);
        setIsbnBuscado(false);
      }
      
    } catch (err) {
      console.error('❌ Erro geral na busca:', err);
      setError('⚠️ Erro ao buscar livro. Verifique sua conexão e tente novamente.');
      setDadosLivro({ ...dadosLivro, isbn: isbnLimpo });
      setMostrarCamposManual(true);
      setIsbnBuscado(false);
    } finally {
      setLoading(false);
      setProgressoAtual(null);
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
    setBufferScanner('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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
            <strong>� LEITOR A LASER HABILITADO!</strong><br />
            <strong>📝 Opção 1:</strong> Use o leitor de código de barras a laser - ele detectará automaticamente<br />
            <strong>⌨️ Opção 2:</strong> Digite o ISBN manualmente e pressione Enter<br />
            <strong>🔍 Passo 2:</strong> O sistema buscará os dados automaticamente<br />
            <strong>✏️ Passo 3:</strong> Se não encontrar, preencha manualmente
          </Typography>
        </Alert>

        {bufferScanner && (
          <Alert severity="success" sx={{ mb: 2 }}>
            🔫 Lendo código de barras: {bufferScanner}...
          </Alert>
        )}

        {loading && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                🔍 Buscando ISBN: <Chip label={dadosLivro.isbn} color="primary" size="small" />
              </Typography>
              
              {progressoAtual && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                    📡 {progressoAtual.estrategia}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoAtual.progresso} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Tentativa {progressoAtual.tentativa} de {progressoAtual.total} • {progressoAtual.progresso}%
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption" component="div">
                <strong>🇧🇷 Fontes Brasileiras:</strong>
                <br />• Editoras: FTD, Ática, Moderna, Saraiva, Scipione, SM, IBEP
                <br />• Mercado Editorial Brasileiro
                <br />
                <br /><strong>🌐 Fontes Internacionais:</strong>
                <br />• Google Books API (múltiplas estratégias)
                <br />• Open Library (biblioteca mundial)
              </Typography>
            </Alert>
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
            {dadosLivro._fonte && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                📡 Fonte: <strong>{dadosLivro._fonte}</strong>
              </Typography>
            )}
          </Alert>
        )}

        {/* CAMPO ISBN - SEMPRE PRIMEIRO E OBRIGATÓRIO */}
        <TextField
          fullWidth
          required
          id="isbn-field"
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
          helperText="🔫 Use o leitor laser (RECOMENDADO) | ⌨️ Digite e pressione Enter | 🇧🇷 Busca em fontes brasileiras + internacionais"
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
