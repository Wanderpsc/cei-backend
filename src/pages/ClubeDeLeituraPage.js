import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import CameraCapture from '../components/CameraCapture';
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
  Tab
} from '@mui/material';
import {
  EmojiEvents,
  Add,
  CameraAlt,
  MenuBook,
  Person,
  CheckCircle
} from '@mui/icons-material';

export default function ClubeDeLeituraPage() {
  const { instituicaoLogada, livros, clientes } = useData();
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

  const salvarResumo = () => {
    if (!resumo.clienteId || !resumo.livroId || !resumo.resumoTexto) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const novoResumo = {
      ...resumo,
      id: Date.now(),
      data: new Date().toISOString(),
      foto: fotoAluno,
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
    setFotoAluno(null);
    setDialogOpen(false);
    alert('✅ Resumo cadastrado com sucesso! Leitor adicionado ao ranking.');
  };

  const handleFotoCapture = (imageData) => {
    setFotoAluno(imageData);
    setCameraOpen(false);
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
        cliente: clientes.find(c => c.id === parseInt(clienteId)),
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
                  >
                    <Person sx={{ fontSize: 50 }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    {item.cliente?.nome || 'Cliente'}
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
                            <TableCell>{item.cliente?.nome || 'Cliente'}</TableCell>
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
                      <Avatar src={r.foto} sx={{ width: 32, height: 32 }}>
                        <Person />
                      </Avatar>
                      {clientes.find(c => c.id === parseInt(r.clienteId))?.nome || 'Leitor'}
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

      {/* DIALOG: CADASTRAR RESUMO */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBook />
            <Typography variant="h6" component="span">
              Registrar Leitura Completa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Leitor"
                value={resumo.clienteId}
                onChange={(e) => setResumo({ ...resumo, clienteId: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Selecione...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Livro Lido"
                value={resumo.livroId}
                onChange={(e) => setResumo({ ...resumo, livroId: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Selecione...</option>
                {livros.map(l => (
                  <option key={l.id} value={l.id}>{l.titulo}</option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CameraAlt />}
                  onClick={() => setCameraOpen(true)}
                >
                  {fotoAluno ? 'Alterar Foto' : 'Tirar Foto do Leitor'}
                </Button>
                {fotoAluno && (
                  <Avatar src={fotoAluno} sx={{ width: 100, height: 100, margin: '10px auto' }} />
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Resumo do Livro *"
                value={resumo.resumoTexto}
                onChange={(e) => setResumo({ ...resumo, resumoTexto: e.target.value })}
                placeholder="Escreva um breve resumo do que você leu..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                📝 Perguntas de Comprovação:
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="1. Qual foi a parte mais interessante do livro?"
                value={resumo.pergunta1}
                onChange={(e) => setResumo({ ...resumo, pergunta1: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="2. O que você aprendeu com essa leitura?"
                value={resumo.pergunta2}
                onChange={(e) => setResumo({ ...resumo, pergunta2: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="3. Você recomendaria esse livro? Por quê?"
                value={resumo.pergunta3}
                onChange={(e) => setResumo({ ...resumo, pergunta3: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Avalie o livro:
              </Typography>
              <Rating
                value={resumo.nota}
                onChange={(e, newValue) => setResumo({ ...resumo, nota: newValue })}
                size="large"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarResumo}>
            Salvar Resumo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Captura de Câmera */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleFotoCapture}
        title="Tirar Foto do Leitor"
      />
    </Layout>
  );
}
