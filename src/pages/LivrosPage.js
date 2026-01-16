import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import BarcodeScannerDialog from '../components/BarcodeScannerDialog';
import TermoDoacao from '../components/TermoDoacao';
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
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import { Add, Edit, Delete, Search, PhotoCamera, Upload, Close, QrCodeScanner, GetApp } from '@mui/icons-material';
import { useData } from '../context/DataContext';

function LivrosPage() {
  const { livros, adicionarLivro, atualizarLivro, removerLivro, darBaixaLivro, usuarioLogado } = useData();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [baixaOpen, setBaixaOpen] = useState(false);
  const [livroParaBaixa, setLivroParaBaixa] = useState(null);
  const [termoOpen, setTermoOpen] = useState(false);
  const [dadosTermo, setDadosTermo] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [dadosBaixa, setDadosBaixa] = useState({
    motivo: 'Doação',
    donatarioNome: '',
    donatarioCpf: '',
    donatarioEndereco: '',
    donatarioTelefone: '',
    observacoes: ''
  });
  
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    editora: '',
    anoPublicacao: '',
    categoria: '',
    quantidade: 1,
    localizacao: '',
    fotoUrl: '',
    tipo: 'Paradidático', // Didático ou Paradidático
    anoVigencia: '' // Apenas para livros didáticos
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
        fotoUrl: '',
        tipo: 'Paradidático',
        anoVigencia: ''
      });
    }
    setOpen(true);
  };

  const handleBookFound = (dadosLivro) => {
    setFormData({
      ...formData,
      titulo: dadosLivro.titulo || formData.titulo,
      autor: dadosLivro.autor || formData.autor,
      isbn: dadosLivro.isbn || formData.isbn,
      editora: dadosLivro.editora || formData.editora,
      anoPublicacao: dadosLivro.anoPublicacao || formData.anoPublicacao,
      categoria: dadosLivro.categoria || formData.categoria,
      fotoUrl: dadosLivro.foto || formData.fotoUrl
    });
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
    // Verificar se livro já existe (por ISBN ou título+autor)
    if (!editando) {
      const livroExistente = livros.find(l => 
        (formData.isbn && l.isbn === formData.isbn) ||
        (l.titulo.toLowerCase() === formData.titulo.toLowerCase() && 
         l.autor.toLowerCase() === formData.autor.toLowerCase())
      );
      
      if (livroExistente) {
        const aumentarQuantidade = window.confirm(
          `O livro "${formData.titulo}" já está cadastrado!\n\n` +
          `Quantidade atual: ${livroExistente.quantidade}\n\n` +
          `Deseja aumentar a quantidade em ${formData.quantidade} unidade(s)?`
        );
        
        if (aumentarQuantidade) {
          const novaQuantidade = parseInt(livroExistente.quantidade) + parseInt(formData.quantidade);
          atualizarLivro(livroExistente.id, { 
            ...livroExistente, 
            quantidade: novaQuantidade 
          });
          handleClose();
          return;
        } else {
          return; // Não fazer nada se usuário cancelar
        }
      }
      
      // Gerar código automático se for novo livro
      const numeroSequencial = (livros.length + 1).toString().padStart(6, '0');
      const codigoLivro = `LIV${numeroSequencial}`;
      formData.codigoIdentificacao = codigoLivro;
    }
    
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

  const handleAbrirBaixa = (livro) => {
    setLivroParaBaixa(livro);
    setDadosBaixa({
      motivo: 'Doação',
      donatarioNome: '',
      donatarioCpf: '',
      donatarioEndereco: '',
      donatarioTelefone: '',
      observacoes: ''
    });
    setBaixaOpen(true);
  };

  const handleConfirmarBaixa = () => {
    if (dadosBaixa.motivo === 'Doação' && (!dadosBaixa.donatarioNome || !dadosBaixa.donatarioCpf)) {
      alert('Por favor, preencha os dados do donatário');
      return;
    }

    const detalhes = {
      donatario: dadosBaixa.donatarioNome,
      cpfDonatario: dadosBaixa.donatarioCpf,
      enderecoDonatario: dadosBaixa.donatarioEndereco,
      telefoneDonatario: dadosBaixa.donatarioTelefone,
      observacoes: dadosBaixa.observacoes
    };

    const livroComBaixa = darBaixaLivro(livroParaBaixa.id, dadosBaixa.motivo, detalhes);

    if (dadosBaixa.motivo === 'Doação' && livroComBaixa) {
      // Preparar dados para o termo
      setDadosTermo({
        livro: livroComBaixa,
        doador: {
          nome: usuarioLogado?.nome || 'Instituição de Ensino',
          cpf: usuarioLogado?.cpf || '',
          endereco: usuarioLogado?.endereco || '',
          telefone: usuarioLogado?.telefone || '',
          cidade: usuarioLogado?.cidade || ''
        },
        donatario: {
          nome: dadosBaixa.donatarioNome,
          cpf: dadosBaixa.donatarioCpf,
          endereco: dadosBaixa.donatarioEndereco,
          telefone: dadosBaixa.donatarioTelefone
        }
      });
      setTermoOpen(true);
    }

    setBaixaOpen(false);
    setLivroParaBaixa(null);
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
          variant="outlined"
          startIcon={<QrCodeScanner />}
          onClick={() => setScannerOpen(true)}
          sx={{ minWidth: '200px' }}
        >
          Digite o ISBN
        </Button>
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
              <TableCell>Código</TableCell>
              <TableCell>Foto</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {livrosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="text.secondary">
                    Nenhum livro cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              livrosFiltrados.map((livro) => (
                <TableRow key={livro.id} sx={{ bgcolor: livro.baixa ? '#f5f5f5' : 'inherit' }}>
                  <TableCell>
                    <Chip 
                      label={livro.codigoIdentificacao || 'N/A'} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
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
                    <Chip 
                      label={livro.tipo || 'Paradidático'} 
                      size="small" 
                      color={livro.tipo === 'Didático' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={livro.categoria} size="small" />
                  </TableCell>
                  <TableCell>{livro.quantidade}</TableCell>
                  <TableCell>
                    {livro.baixa ? (
                      <Chip 
                        label={`Baixa: ${livro.baixa.motivo}`}
                        size="small"
                        color="warning"
                      />
                    ) : (
                      <Chip label="Ativo" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell>
                    {!livro.baixa && (
                      <>
                        <IconButton onClick={() => handleOpen(livro)} size="small">
                          <Edit />
                        </IconButton>
                        <Tooltip title="Dar Baixa">
                          <IconButton onClick={() => handleAbrirBaixa(livro)} size="small" color="warning">
                            <GetApp />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
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
            <FormControl fullWidth>
              <InputLabel>Tipo de Livro *</InputLabel>
              <Select
                value={formData.tipo}
                label="Tipo de Livro *"
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value, anoVigencia: e.target.value === 'Paradidático' ? '' : formData.anoVigencia })}
              >
                <MenuItem value="Didático">Didático</MenuItem>
                <MenuItem value="Paradidático">Paradidático</MenuItem>
              </Select>
            </FormControl>
            {formData.tipo === 'Didático' && (
              <TextField
                label="Ano de Vigência"
                fullWidth
                type="number"
                placeholder="Ex: 2026"
                helperText="Ano até quando o livro será utilizado"
                value={formData.anoVigencia}
                onChange={(e) => setFormData({ ...formData, anoVigencia: e.target.value })}
              />
            )}
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

      <BarcodeScannerDialog 
        open={scannerOpen} 
        onClose={() => setScannerOpen(false)}
        onBookFound={handleBookFound}
      />

      {/* Modal de Baixa */}
      <Dialog open={baixaOpen} onClose={() => setBaixaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dar Baixa no Livro</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Livro:</strong> {livroParaBaixa?.titulo}<br />
            <strong>Autor:</strong> {livroParaBaixa?.autor}
          </Alert>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Motivo da Baixa</FormLabel>
            <RadioGroup
              value={dadosBaixa.motivo}
              onChange={(e) => setDadosBaixa({ ...dadosBaixa, motivo: e.target.value })}
            >
              <FormControlLabel value="Doação" control={<Radio />} label="Doação" />
              <FormControlLabel value="Término de Vigência" control={<Radio />} label="Término de Vigência" />
            </RadioGroup>
          </FormControl>

          {dadosBaixa.motivo === 'Doação' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" color="primary">Dados do Donatário</Typography>
              <TextField
                label="Nome Completo *"
                fullWidth
                value={dadosBaixa.donatarioNome}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, donatarioNome: e.target.value })}
              />
              <TextField
                label="CPF/CNPJ *"
                fullWidth
                value={dadosBaixa.donatarioCpf}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, donatarioCpf: e.target.value })}
              />
              <TextField
                label="Endereço"
                fullWidth
                value={dadosBaixa.donatarioEndereco}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, donatarioEndereco: e.target.value })}
              />
              <TextField
                label="Telefone"
                fullWidth
                value={dadosBaixa.donatarioTelefone}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, donatarioTelefone: e.target.value })}
              />
            </Box>
          )}

          <TextField
            label="Observações"
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
            value={dadosBaixa.observacoes}
            onChange={(e) => setDadosBaixa({ ...dadosBaixa, observacoes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBaixaOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmarBaixa} variant="contained" color="warning">
            Confirmar Baixa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Termo de Doação */}
      {dadosTermo && (
        <TermoDoacao 
          open={termoOpen}
          onClose={() => {
            setTermoOpen(false);
            setDadosTermo(null);
          }}
          livro={dadosTermo.livro}
          doador={dadosTermo.doador}
          donatario={dadosTermo.donatario}
        />
      )}
    </Layout>
  );
}

export default LivrosPage;
