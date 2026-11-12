import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import CameraCapture from '../components/CameraCapture';
import ImageCropEditor from '../components/ImageCropEditor';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Rating,
  Alert,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  EmojiEvents,
  Add,
  CameraAlt,
  MenuBook,
  Person,
  CheckCircle,
  DocumentScanner,
  Search,
  ZoomIn,
  Upload,
  DeleteForever
} from '@mui/icons-material';

export default function ClubeDeLeituraPage() {
  const { instituicaoLogada, livros, clientes } = useData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [fotoAluno, setFotoAluno] = useState(null);
  const [resumo, setResumo] = useState({
    clienteId: '',
    livroId: '',
    resumoTexto: '',
    pergunta1: '', // Qual foi a parte mais interessante?
    pergunta2: '', // O que você aprendeu?
    pergunta3: '', // Recomendaria para um amigo?
    nota: 0
  });
  const [resumos, setResumos] = useState(() => {
    const salvos = localStorage.getItem('cei_resumos_livros');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraDocumentoOpen, setCameraDocumentoOpen] = useState(false);
  const [documentoEscaneado, setDocumentoEscaneado] = useState(null);
  const [buscaDocAluno, setBuscaDocAluno] = useState('');
  const [buscaDocLivro, setBuscaDocLivro] = useState('');
  const [docVisualizarOpen, setDocVisualizarOpen] = useState(false);
  const [docSelecionado, setDocSelecionado] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [buscaAluno, setBuscaAluno] = useState('');
  const fileInputDocRef = useRef(null);
  // Editor de recorte para imagens carregadas por upload
  const [imagemParaEditar, setImagemParaEditar] = useState(null);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  // OCR — extração de texto do documento escaneado
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);

  const salvarResumo = () => {
    if (!resumo.clienteId || !resumo.livroId || !resumo.resumoTexto) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const clienteSelecionado = clientes.find((cliente) => String(cliente.id) === String(resumo.clienteId));

    const novoResumo = {
      ...resumo,
      id: Date.now(),
      data: new Date().toISOString(),
      foto: fotoAluno,
      documentoEscaneado: documentoEscaneado,
      clienteNome: clienteSelecionado?.nome || 'Leitor',
      status: 'aprovado'
    };

    const novosResumos = [...resumos, novoResumo];
    setResumos(novosResumos);
    localStorage.setItem('cei_resumos_livros', JSON.stringify(novosResumos));

    // Reset
    setResumo({
      clienteId: '',
      livroId: '',
      resumoTexto: '',
      pergunta1: '',
      pergunta2: '',
      pergunta3: '',
      nota: 0
    });
    setClienteSelecionado(null);
    setBuscaAluno('');
    setFotoAluno(null);
    setDocumentoEscaneado(null);
    setDialogOpen(false);
    alert('✅ Resumo cadastrado com sucesso! Leitor adicionado ao ranking.');
  };

  const handleFotoCapture = (imageData) => {
    setFotoAluno(imageData);
    setCameraOpen(false);
  };

  const handleDocumentoCapture = (imageData) => {
    setDocumentoEscaneado(imageData);
    setCameraDocumentoOpen(false);
  };

  const handleDocumentoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Zera o valor para permitir re-seleção do mesmo arquivo
    e.target.value = '';
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemParaEditar(reader.result);
      setImageEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractText = async () => {
    if (!docSelecionado?.documentoEscaneado) return;
    setOcrLoading(true);
    setOcrText('');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('por', 1, {
        workerPath: 'https://unpkg.com/tesseract.js@5/dist/worker.min.js',
        corePath: 'https://unpkg.com/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0'
      });
      const { data: { text } } = await worker.recognize(docSelecionado.documentoEscaneado);
      await worker.terminate();
      setOcrText(text.trim() || '(Nenhum texto detectado na imagem)');
    } catch (err) {
      setOcrText('Erro ao extrair texto: ' + (err.message || String(err)));
    }
    setOcrLoading(false);
  };

  const resumosComDocumento = resumos.filter(r => r.documentoEscaneado).filter(r => {
    const nomeAluno = (clientes.find(c => String(c.id) === String(r.clienteId))?.nome || r.clienteNome || '').toLowerCase();
    const tituloLivro = (livros.find(l => String(l.id) === String(r.livroId))?.titulo || '').toLowerCase();
    const ba = buscaDocAluno.toLowerCase();
    const bl = buscaDocLivro.toLowerCase();
    return (!ba || nomeAluno.includes(ba)) && (!bl || tituloLivro.includes(bl));
  });

  const getNomeClienteResumo = (resumoItem) => {
    const cliente = clientes.find((item) => String(item.id) === String(resumoItem?.clienteId));
    return cliente?.nome || resumoItem?.clienteNome || 'Leitor';
  };

  const getRankingLeitores = () => {
    const contagem = {};
    resumos.forEach(r => {
      if (!contagem[r.clienteId]) {
        contagem[r.clienteId] = { total: 0, notaMedia: 0, resumos: [] };
      }
      contagem[r.clienteId].total++;
      contagem[r.clienteId].resumos.push(r);
    });

    Object.keys(contagem).forEach(id => {
      const notas = contagem[id].resumos.map(r => r.nota);
      contagem[id].notaMedia = notas.reduce((a, b) => a + b, 0) / notas.length;
    });

    return Object.entries(contagem)
      .map(([clienteId, data]) => ({
        cliente: clientes.find((c) => String(c.id) === String(clienteId)),
        clienteNome: data.resumos.find((resumoItem) => resumoItem?.clienteNome)?.clienteNome || 'Leitor',
        ...data
      }))
      .sort((a, b) => b.total - a.total);
  };

  const ranking = getRankingLeitores();

  return (
    <Layout title="🏆 Clube de Leitura">
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Sistema de Premiação:</strong> Alunos que comprovarem leitura através de resumos
            e respostas ganham pontos no ranking! 📚🏆
          </Typography>
        </Alert>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Registrar Nova Leitura
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="🏆 Ranking de Leitores" />
        <Tab label="📖 Resumos Cadastrados" />
        <Tab label="📄 Documentos Escaneados" />
      </Tabs>

      {/* TAB 1: RANKING */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {ranking.slice(0, 3).map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                bgcolor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                textAlign: 'center'
              }}>
                <CardContent>
                  <EmojiEvents sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h4">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {index + 1}º Lugar
                  </Typography>
                  <Avatar
                    src={item.resumos[item.resumos.length - 1]?.foto}
                    sx={{ width: 100, height: 100, margin: '20px auto' }}
                    imgProps={{ style: { objectFit: 'contain' } }}
                  >
                    <Person sx={{ fontSize: 50 }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    {item.cliente?.nome || item.clienteNome || 'Leitor'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    <MenuBook sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {item.total} {item.total === 1 ? 'livro lido' : 'livros lidos'}
                  </Typography>
                  <Rating value={item.notaMedia} readOnly sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}

          {ranking.length > 3 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Demais Leitores
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Posição</TableCell>
                          <TableCell>Nome</TableCell>
                          <TableCell align="center">Livros Lidos</TableCell>
                          <TableCell align="center">Nota Média</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ranking.slice(3).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 4}º</TableCell>
                            <TableCell>{item.cliente?.nome || item.clienteNome || 'Leitor'}</TableCell>
                            <TableCell align="center">{item.total}</TableCell>
                            <TableCell align="center">
                              <Rating value={item.notaMedia} readOnly size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* TAB 2: RESUMOS */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Leitor</TableCell>
                <TableCell>Livro</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resumos.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={r.foto} sx={{ width: 32, height: 32 }} imgProps={{ style: { objectFit: 'contain' } }}>
                        <Person />
                      </Avatar>
                      {getNomeClienteResumo(r)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {livros.find(l => l.id === parseInt(r.livroId))?.titulo || 'Livro'}
                  </TableCell>
                  <TableCell>
                    <Rating value={r.nota} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="Aprovado" 
                      color="success" 
                      size="small" 
                      icon={<CheckCircle />}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TAB 3: DOCUMENTOS ESCANEADOS */}
      {tabValue === 2 && (
        <Box>
          {/* Barra de busca */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Buscar por aluno"
              value={buscaDocAluno}
              onChange={e => setBuscaDocAluno(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="Buscar por livro"
              value={buscaDocLivro}
              onChange={e => setBuscaDocLivro(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
              sx={{ minWidth: 220 }}
            />
          </Box>

          {resumosComDocumento.length === 0 ? (
            <Alert severity="info">
              {resumos.filter(r => r.documentoEscaneado).length === 0
                ? 'Nenhum documento escaneado ainda. Ao registrar uma leitura, escaneie o resumo físico do aluno.'
                : 'Nenhum documento encontrado para os filtros informados.'}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Livro</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell align="center">Documento</TableCell>
                    <TableCell align="center">Ver</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumosComDocumento.map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell>{new Date(r.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={r.foto} sx={{ width: 28, height: 28 }}><Person /></Avatar>
                          {getNomeClienteResumo(r)}
                        </Box>
                      </TableCell>
                      <TableCell>{livros.find(l => String(l.id) === String(r.livroId))?.titulo || 'Livro'}</TableCell>
                      <TableCell><Rating value={r.nota} readOnly size="small" /></TableCell>
                      <TableCell align="center">
                        <Box
                          component="img"
                          src={r.documentoEscaneado}
                          alt="Resumo escaneado"
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, border: '1px solid #ccc', cursor: 'pointer' }}
                          onClick={() => { setDocSelecionado(r); setDocVisualizarOpen(true); }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => { setDocSelecionado(r); setDocVisualizarOpen(true); }}
                          title="Ver documento"
                        >
                          <ZoomIn />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* DIALOG: CADASTRAR RESUMO */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={isMobile ? {} : { sx: { maxWidth: '900px' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBook />
            <Typography variant="h6" component="span">
              Registrar Leitura Completa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Box column layout garante 100% de largura em qualquer versão do MUI Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ width: '100%' }}>
              <Autocomplete
                options={clientes.filter(c => c.nome)}
                getOptionLabel={(option) => option.nome || ''}
                value={clienteSelecionado}
                onChange={(e, newValue) => {
                  setClienteSelecionado(newValue);
                  setResumo({ ...resumo, clienteId: newValue?.id || '' });
                }}
                inputValue={buscaAluno}
                onInputChange={(e, newInputValue) => setBuscaAluno(newInputValue)}
                disablePortal
                fullWidth
                sx={{ width: '100%' }}
                componentsProps={{
                  paper: { sx: { minWidth: 320 } }
                }}
                filterOptions={(options, { inputValue }) => {
                  if (!inputValue.trim()) return options;
                  const termo = inputValue.toLowerCase();
                  return options.filter(
                    (c) =>
                      c.nome?.toLowerCase().includes(termo) ||
                      c.turma?.toLowerCase().includes(termo) ||
                      c.serie?.toLowerCase().includes(termo) ||
                      c.matricula?.toLowerCase?.().includes(termo) ||
                      String(c.matricula || '').includes(termo)
                  );
                }}
                renderOption={(props, option) => {
                  const { key, ...liProps } = props;
                  return (
                    <Box
                      component="li"
                      key={key}
                      {...liProps}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1,
                        px: 1.5,
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: 'primary.main', flexShrink: 0 }}>
                        {option.nome?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={option.nome}
                        >
                          {option.nome}
                        </Typography>
                        {(option.turma || option.serie || option.matricula) && (
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {[option.serie, option.turma, option.matricula ? `Matr: ${option.matricula}` : ''].filter(Boolean).join(' — ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="🔍 Buscar Leitor"
                    placeholder="Digite nome, turma ou série..."
                    fullWidth
                    size="medium"
                    sx={{
                      width: '100%',
                      '& .MuiInputBase-root': {
                        fontSize: '1.08rem',
                        minHeight: 62,
                        borderRadius: 2,
                        bgcolor: '#f0f7ff',
                        width: '100%'
                      },
                      '& .MuiInputBase-input': { py: 1.5 },
                      '& .MuiInputLabel-root': { fontSize: '1.05rem' }
                    }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Search sx={{ color: 'primary.main', fontSize: 22 }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                noOptionsText="Nenhum aluno encontrado"
                clearText="Limpar"
                openText="Abrir"
                closeText="Fechar"
                fullWidth
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <TextField
                select
                fullWidth
                label="Livro Lido"
                value={resumo.livroId}
                onChange={(e) => setResumo({ ...resumo, livroId: e.target.value })}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
              >
                <option value="">Selecione...</option>
                {livros.map(l => (
                  <option key={l.id} value={l.id}>{l.titulo}</option>
                ))}
              </TextField>
            </Box>

            <Box sx={{ width: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CameraAlt />}
                    onClick={() => setCameraOpen(true)}
                  >
                    {fotoAluno ? 'Alterar Foto' : 'Tirar Foto do Leitor'}
                  </Button>
                  {fotoAluno && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteForever />}
                      onClick={() => setFotoAluno(null)}
                    >
                      Excluir Foto
                    </Button>
                  )}
                </Box>
                {fotoAluno && (
                  <Avatar src={fotoAluno} sx={{ width: 100, height: 100, margin: '10px auto' }} imgProps={{ style: { objectFit: 'contain' } }} />
                )}
              </Box>
            </Box>

            {/* ESCANEAR RESUMO FÍSICO */}
            <Box sx={{ width: '100%' }}>
              <Box sx={{ p: 2, border: '1px dashed #1976d2', borderRadius: 2, bgcolor: '#f0f7ff' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                  <DocumentScanner sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Escanear Resumo Físico (opcional)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Fotografe ou faça upload do resumo escrito a mão pelo aluno.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CameraAlt />}
                    onClick={() => setCameraDocumentoOpen(true)}
                  >
                    Fotografar Documento
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Upload />}
                    onClick={() => fileInputDocRef.current?.click()}
                  >
                    Upload de Imagem
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputDocRef}
                    style={{ display: 'none' }}
                    onChange={handleDocumentoUpload}
                  />
                  {documentoEscaneado && (
                    <Button size="small" color="error" onClick={() => setDocumentoEscaneado(null)}>Remover</Button>
                  )}
                </Box>
                {documentoEscaneado && (
                  <Box sx={{ mt: 1 }}>
                    <Box
                      component="img"
                      src={documentoEscaneado}
                      alt="Documento escaneado"
                      sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, border: '1px solid #90caf9', mt: 1 }}
                    />
                    <Chip label="✅ Documento pronto" color="success" size="small" sx={{ mt: 1, display: 'block', width: 'fit-content' }} />
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Resumo do Livro *"
                value={resumo.resumoTexto}
                onChange={(e) => setResumo({ ...resumo, resumoTexto: e.target.value })}
                placeholder="Escreva um breve resumo do que você leu..."
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                📝 Perguntas de Comprovação:
              </Typography>
            </Box>

            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="1. Qual foi a parte mais interessante do livro?"
                value={resumo.pergunta1}
                onChange={(e) => setResumo({ ...resumo, pergunta1: e.target.value })}
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="2. O que você aprendeu com essa leitura?"
                value={resumo.pergunta2}
                onChange={(e) => setResumo({ ...resumo, pergunta2: e.target.value })}
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="3. Você recomendaria esse livro? Por quê?"
                value={resumo.pergunta3}
                onChange={(e) => setResumo({ ...resumo, pergunta3: e.target.value })}
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" gutterBottom>
                Avalie o livro:
              </Typography>
              <Rating
                value={resumo.nota}
                onChange={(e, newValue) => setResumo({ ...resumo, nota: newValue })}
                size="large"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarResumo}>
            Salvar Resumo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editor de recorte para imagens carregadas por upload */}
      <ImageCropEditor
        open={imageEditorOpen}
        imageData={imagemParaEditar}
        title="Editar Documento — Cortar Margens"
        onClose={() => { setImageEditorOpen(false); setImagemParaEditar(null); }}
        onSave={(img) => { setDocumentoEscaneado(img); setImageEditorOpen(false); setImagemParaEditar(null); }}
      />

      {/* Dialog de Captura de Câmera - Foto do Leitor */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleFotoCapture}
        title="Tirar Foto do Leitor"
      />

      {/* Dialog de Captura - Documento/Resumo Físico */}
      <CameraCapture
        open={cameraDocumentoOpen}
        onClose={() => setCameraDocumentoOpen(false)}
        onCapture={handleDocumentoCapture}
        title="Fotografar Resumo Físico do Aluno"
      />

      {/* Dialog de Visualização do Documento */}
      <Dialog
        open={docVisualizarOpen}
        onClose={() => { setDocVisualizarOpen(false); setOcrText(''); }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DocumentScanner />
            <Typography variant="h6" component="span">
              Resumo Escrito — {docSelecionado && getNomeClienteResumo(docSelecionado)}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          {docSelecionado && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={`Aluno: ${getNomeClienteResumo(docSelecionado)}`} />
                <Chip label={`Livro: ${livros.find(l => String(l.id) === String(docSelecionado.livroId))?.titulo || 'Livro'}`} color="primary" />
                <Chip label={`Data: ${new Date(docSelecionado.data).toLocaleDateString('pt-BR')}`} variant="outlined" />
              </Box>

              {/* Imagem do documento com visualizador de zoom CSS */}
              <Box
                sx={{
                  overflow: 'auto',
                  maxHeight: { xs: 320, sm: 480 },
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  bgcolor: '#f9f9f9',
                  mb: 2,
                  textAlign: 'center',
                  cursor: 'zoom-in',
                }}
              >
                <Box
                  component="img"
                  src={docSelecionado.documentoEscaneado}
                  alt="Resumo escaneado"
                  sx={{
                    maxWidth: '100%',
                    display: 'block',
                    margin: '0 auto',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.6)', transformOrigin: 'center top', cursor: 'zoom-in' }
                  }}
                />
              </Box>

              {/* Painel de texto extraído por OCR */}
              <Box sx={{ border: '1px dashed #1976d2', borderRadius: 2, p: 2, bgcolor: '#f0f7ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#1565c0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    📄 Texto Extraído do Documento
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleExtractText}
                    disabled={ocrLoading}
                    startIcon={ocrLoading ? null : <DocumentScanner />}
                    sx={{ bgcolor: '#1976d2' }}
                  >
                    {ocrLoading ? 'Extraindo texto...' : 'Extrair Texto (OCR)'}
                  </Button>
                </Box>
                {ocrLoading && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Processando imagem com OCR... Isso pode levar alguns segundos.
                  </Alert>
                )}
                {ocrText ? (
                  <TextField
                    multiline
                    fullWidth
                    rows={8}
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    placeholder="Texto extraído aparecerá aqui..."
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.93rem', bgcolor: '#fff' }
                    }}
                    helperText="Texto gerado automaticamente por OCR. Pode conter erros — você pode editar aqui."
                  />
                ) : (
                  !ocrLoading && (
                    <Typography variant="caption" color="text.secondary">
                      Clique em "Extrair Texto (OCR)" para tentar ler automaticamente o conteúdo escrito no documento.
                      A precisão varia conforme a qualidade da imagem e caligrafia.
                    </Typography>
                  )
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDocVisualizarOpen(false); setOcrText(''); }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
