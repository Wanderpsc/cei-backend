import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Add, Clear, Delete, Edit, Groups, School } from '@mui/icons-material';
import { useData } from '../context/DataContext';

export default function SeriesTurmasPage() {
  const {
    seriesAcademicas,
    turmasAcademicas,
    clientes,
    adicionarSerieAcademica,
    atualizarSerieAcademica,
    adicionarTurmaAcademica,
    atualizarTurmaAcademica,
    removerTurmaAcademica
  } = useData();

  const [serieEmEdicao, setSerieEmEdicao] = useState(null);
  const [turmaEmEdicao, setTurmaEmEdicao] = useState(null);

  const [serieForm, setSerieForm] = useState({
    nomeSerie: '',
    anoLetivo: String(new Date().getFullYear()),
    descricao: ''
  });

  const [turmaForm, setTurmaForm] = useState({
    nomeTurma: '',
    serieId: '',
    anoLetivo: String(new Date().getFullYear()),
    turno: ''
  });

  const seriesOrdenadas = useMemo(() => {
    return [...seriesAcademicas].sort((a, b) => {
      const anoA = String(a.anoLetivo || '');
      const anoB = String(b.anoLetivo || '');
      if (anoA !== anoB) return anoB.localeCompare(anoA, 'pt-BR');
      return String(a.nomeSerie || '').localeCompare(String(b.nomeSerie || ''), 'pt-BR');
    });
  }, [seriesAcademicas]);

  const turmasOrdenadas = useMemo(() => {
    return [...turmasAcademicas].sort((a, b) => {
      const serieA = String(a.nomeSerie || '');
      const serieB = String(b.nomeSerie || '');
      if (serieA !== serieB) return serieA.localeCompare(serieB, 'pt-BR');
      return String(a.nomeTurma || '').localeCompare(String(b.nomeTurma || ''), 'pt-BR');
    });
  }, [turmasAcademicas]);

  const normalizarTexto = (valor) => String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[º°]/g, 'o')
    .replace(/[ª]/g, 'a')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ');

  const turmasAcademicasMap = useMemo(() => {
    const map = new Map();
    turmasAcademicas.forEach((turma) => {
      map.set(String(turma.id), turma);
    });
    return map;
  }, [turmasAcademicas]);

  const compactarTexto = (valor) => normalizarTexto(valor).replace(/[^a-z0-9]/g, '');

  const tokenizarTexto = (...valores) => {
    const texto = normalizarTexto(valores.filter(Boolean).join(' '));
    if (!texto) return [];
    return texto.split(/[^a-z0-9]+/).filter(Boolean);
  };

  const extrairNumeroSerie = (valor) => {
    const texto = normalizarTexto(valor);
    if (!texto) return '';

    const match = texto.match(/(\d{1,2})\s*(?:a|o)?\s*(?:serie|ano)?/);
    return match ? match[1] : '';
  };

  const extrairSalaTurma = (valor) => {
    const texto = normalizarTexto(valor).toUpperCase();
    if (!texto) return '';

    const padraoIB = texto.match(/\b[IA]\s*-\s*([A-Z])\b/);
    if (padraoIB) {
      return padraoIB[1];
    }

    const inicio = texto.match(/^([A-Z])\b/);
    if (inicio) {
      return inicio[1];
    }

    const final = texto.match(/\b([A-Z])\b$/);
    if (final) {
      return final[1];
    }

    return '';
  };

  const extrairCursoAcademico = (...valores) => {
    const tokens = tokenizarTexto(...valores);
    if (tokens.length === 0) return '';

    const tokenSet = new Set(tokens);
    const textoCompacto = tokens.join('');

    if (tokens.some((token) => token.includes('farm'))) return 'farm';
    if (tokens.some((token) => token.includes('mark')) || tokenSet.has('dig')) return 'mark';
    if (tokens.some((token) => token.includes('emp'))) return 'emp';
    if (tokens.some((token) => token.includes('prop')) || tokens.some((token) => token.includes('admi'))) return 'prop';

    const temDs = tokenSet.has('ds')
      || (tokenSet.has('d') && tokenSet.has('s'))
      || tokens.some((token) => token.includes('des'))
      || tokens.some((token) => token === 'sis');

    if (temDs || textoCompacto.includes('dessis')) return 'ds';
    if (tokenSet.has('int')) return 'int';

    return '';
  };

  const isAlunoCliente = (cliente) => {
    const tipoNormalizado = normalizarTexto(cliente?.tipo);
    const categoriaNormalizada = normalizarTexto(cliente?.categoria);

    const possuiVinculoAcademico =
      String(cliente?.turmaId || '').trim().length > 0
      || String(cliente?.serieId || '').trim().length > 0
      || normalizarTexto(cliente?.turma).length > 0
      || normalizarTexto(cliente?.nomeTurma).length > 0
      || normalizarTexto(cliente?.serie).length > 0
      || normalizarTexto(cliente?.nomeSerie).length > 0;

    const perfisNaoAluno = [
      'professor',
      'funcionario',
      'funcionario administrativo',
      'bibliotecario',
      'coordenador',
      'diretor',
      'gestor',
      'servidor',
      'admin',
      'administrador',
      'comunidade'
    ];

    if (tipoNormalizado === 'aluno' || categoriaNormalizada === 'estudante') {
      return true;
    }

    if (tipoNormalizado === 'leitor') {
      return possuiVinculoAcademico;
    }

    if (possuiVinculoAcademico) {
      return !perfisNaoAluno.includes(tipoNormalizado) && !perfisNaoAluno.includes(categoriaNormalizada);
    }

    return false;
  };

  const contadores = useMemo(() => {
    const seriesBase = (turmasAcademicas.length > 0 ? turmasAcademicas : seriesAcademicas)
      .map((item) => item?.nomeSerie)
      .map((nomeSerie) => normalizarTexto(nomeSerie))
      .filter(Boolean);

    const alunosComTurma = clientes.filter((cliente) => {
      const isAluno = isAlunoCliente(cliente);
      const temTurma =
        String(cliente.turmaId || '').trim().length > 0
        || normalizarTexto(cliente.turma).length > 0
        || normalizarTexto(cliente.nomeTurma).length > 0;
      return isAluno && temTurma;
    }).length;

    return {
      series: new Set(seriesBase).size,
      turmas: turmasAcademicas.length,
      alunosComTurma
    };
  }, [seriesAcademicas, turmasAcademicas, clientes]);

  const getTotalAlunosDaTurma = (turma) => {
    const turmaIdAtual = String(turma?.id || '').trim();
    const turmaSerieIdAtual = String(turma?.serieId || '').trim();
    const turmaNomeAtual = normalizarTexto(turma?.nomeTurma);
    const turmaNomeCompacto = compactarTexto(turma?.nomeTurma);
    const serieNomeAtual = normalizarTexto(turma?.nomeSerie);
    const serieNomeCompactoAtual = compactarTexto(turma?.nomeSerie);
    const numeroSerieTurma = extrairNumeroSerie(turma?.nomeSerie);
    const salaTurma = extrairSalaTurma(turma?.nomeTurma);
    const cursoTurma = extrairCursoAcademico(turma?.nomeTurma, turma?.nomeSerie);

    return clientes.filter((cliente) => {
      const aluno = isAlunoCliente(cliente);
      if (!aluno) return false;

      const clienteTurmaId = String(cliente?.turmaId || '').trim();
      const clienteSerieId = String(cliente?.serieId || '').trim();
      const turmaVinculadaCliente = clienteTurmaId && turmasAcademicasMap.has(clienteTurmaId)
        ? turmasAcademicasMap.get(clienteTurmaId)
        : null;
      const clienteTurmaBruta = String(
        cliente?.turma || cliente?.nomeTurma || turmaVinculadaCliente?.nomeTurma || ''
      ).trim();
      const clienteSerieBruta = String(
        cliente?.serie || cliente?.nomeSerie || turmaVinculadaCliente?.nomeSerie || ''
      ).trim();
      const clienteTurmaNome = normalizarTexto(clienteTurmaBruta);
      const clienteTurmaCompacto = compactarTexto(clienteTurmaBruta);
      const clienteSerieNome = normalizarTexto(clienteSerieBruta);
      const clienteSerieCompacto = compactarTexto(clienteSerieBruta);
      const numeroSerieCliente = extrairNumeroSerie(clienteSerieBruta);
      const salaCliente = extrairSalaTurma(clienteTurmaBruta);
      const cursoCliente = extrairCursoAcademico(clienteTurmaBruta, clienteSerieBruta);

      const porId = turmaIdAtual.length > 0 && clienteTurmaId === turmaIdAtual;
      const porNome = turmaNomeAtual.length > 0 && clienteTurmaNome === turmaNomeAtual;
      const porNomeCompacto = turmaNomeCompacto.length > 0 && clienteTurmaCompacto === turmaNomeCompacto;

      const serieCompativel =
        serieNomeAtual.length === 0
        || clienteSerieNome.length === 0
        || clienteSerieNome === serieNomeAtual
        || (serieNomeCompactoAtual.length > 0 && clienteSerieCompacto === serieNomeCompactoAtual)
        || (serieNomeCompactoAtual.length > 0 && clienteSerieCompacto.includes(serieNomeCompactoAtual))
        || (serieNomeCompactoAtual.length > 0 && serieNomeCompactoAtual.includes(clienteSerieCompacto))
        || (turmaSerieIdAtual && clienteSerieId && turmaSerieIdAtual === clienteSerieId)
        || (numeroSerieTurma && numeroSerieCliente && numeroSerieTurma === numeroSerieCliente);

      const porAssinaturaAcademica =
        Boolean(salaTurma)
        && Boolean(salaCliente)
        && salaTurma === salaCliente
        && (!cursoTurma || (cursoCliente && cursoTurma === cursoCliente))
        && serieCompativel;

      return porId || ((porNome || porNomeCompacto) && serieCompativel) || porAssinaturaAcademica;
    }).length;
  };

  const limparSerieForm = () => {
    setSerieEmEdicao(null);
    setSerieForm({
      nomeSerie: '',
      anoLetivo: String(new Date().getFullYear()),
      descricao: ''
    });
  };

  const limparTurmaForm = () => {
    setTurmaEmEdicao(null);
    setTurmaForm({
      nomeTurma: '',
      serieId: '',
      anoLetivo: String(new Date().getFullYear()),
      turno: ''
    });
  };

  const salvarSerieTurma = () => {
    const deveSalvarSerie = Boolean(serieEmEdicao || serieForm.nomeSerie.trim());
    const deveSalvarTurma = Boolean(
      turmaEmEdicao || turmaForm.nomeTurma.trim() || turmaForm.serieId || turmaForm.turno.trim()
    );

    if (!deveSalvarSerie && !deveSalvarTurma) {
      alert('Preencha os dados da série ou da turma.');
      return;
    }

    const nomeSerieNormalizado = String(serieForm.nomeSerie || '').trim().toLowerCase();
    const anoSerieNormalizado = String(serieForm.anoLetivo || '').trim();

    const serieExistentePorNomeAno = nomeSerieNormalizado
      ? seriesAcademicas.find((serie) => {
        return (
          String(serie.nomeSerie || '').trim().toLowerCase() === nomeSerieNormalizado
          && String(serie.anoLetivo || '').trim() === anoSerieNormalizado
        );
      })
      : null;

    let serieIdVinculada = turmaForm.serieId ? String(turmaForm.serieId) : '';
    let anoLetivoDaSerie = String(serieForm.anoLetivo || '').trim();
    let serieFallback = null;

    if (deveSalvarSerie) {
      if (!serieForm.nomeSerie.trim()) {
        alert('Informe o nome da série.');
        return;
      }

      if (serieEmEdicao) {
        atualizarSerieAcademica(serieEmEdicao, serieForm);
        serieIdVinculada = serieIdVinculada || String(serieEmEdicao);
      } else if (serieExistentePorNomeAno) {
        if (!deveSalvarTurma) {
          alert('Já existe uma série com esse nome e ano letivo.');
          return;
        }

        serieIdVinculada = serieIdVinculada || String(serieExistentePorNomeAno.id);
        anoLetivoDaSerie = String(serieExistentePorNomeAno.anoLetivo || '').trim() || anoLetivoDaSerie;
      } else {
        const novaSerie = adicionarSerieAcademica(serieForm);
        if (!novaSerie) return;
        serieIdVinculada = serieIdVinculada || String(novaSerie.id);
        anoLetivoDaSerie = String(novaSerie.anoLetivo || '').trim() || anoLetivoDaSerie;
        serieFallback = novaSerie;
      }
    }

    if (!serieIdVinculada && serieExistentePorNomeAno) {
      serieIdVinculada = String(serieExistentePorNomeAno.id);
      anoLetivoDaSerie = String(serieExistentePorNomeAno.anoLetivo || '').trim() || anoLetivoDaSerie;
    }

    if (deveSalvarTurma) {
      if (!turmaForm.nomeTurma.trim()) {
        alert('Informe o nome da turma.');
        return;
      }

      if (!serieIdVinculada) {
        alert('Selecione a série da turma ou preencha Série/Ano válidos.');
        return;
      }

      const turmaPayload = {
        ...turmaForm,
        serieId: serieIdVinculada,
        anoLetivo: String(turmaForm.anoLetivo || '').trim() || anoLetivoDaSerie
      };

      if (serieFallback) {
        turmaPayload.serieFallback = serieFallback;
      }

      if (turmaEmEdicao) {
        atualizarTurmaAcademica(turmaEmEdicao, turmaPayload);
      } else {
        const novaTurma = adicionarTurmaAcademica(turmaPayload);
        if (!novaTurma) return;
      }
    }

    if (deveSalvarSerie) {
      limparSerieForm();
    }

    if (deveSalvarTurma) {
      limparTurmaForm();
    }
  };

  const limparFormulario = () => {
    limparSerieForm();
    limparTurmaForm();
  };

  const editarTurma = (turma) => {
    setTurmaEmEdicao(turma.id);
    setTurmaForm({
      nomeTurma: turma.nomeTurma || '',
      serieId: String(turma.serieId || ''),
      anoLetivo: turma.anoLetivo || String(new Date().getFullYear()),
      turno: turma.turno || ''
    });
  };

  return (
    <Layout title="Séries e Turmas">
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total de séries</Typography>
              <Typography variant="h5"><School sx={{ mr: 0.5, verticalAlign: 'middle' }} />{contadores.series}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Turmas cadastradas</Typography>
              <Typography variant="h5"><Groups sx={{ mr: 0.5, verticalAlign: 'middle' }} />{contadores.turmas}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Alunos alocados em turma</Typography>
              <Typography variant="h5">{contadores.alunosComTurma}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Cadastro de Séries e Turmas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Série e turma ficam no mesmo bloco para cadastro, edição e consulta.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Série</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Série/Ano"
                value={serieForm.nomeSerie}
                onChange={(e) => setSerieForm({ ...serieForm, nomeSerie: e.target.value })}
                placeholder="Ex: 6º Ano, 1ª Série"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Ano Letivo"
                value={serieForm.anoLetivo}
                onChange={(e) => setSerieForm({ ...serieForm, anoLetivo: e.target.value })}
                placeholder="2026"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descrição"
                value={serieForm.descricao}
                onChange={(e) => setSerieForm({ ...serieForm, descricao: e.target.value })}
                placeholder="Opcional"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Turma</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Série da Turma</InputLabel>
                <Select
                  value={turmaForm.serieId}
                  label="Série da Turma"
                  onChange={(e) => {
                    const serieId = e.target.value;
                    const serie = seriesAcademicas.find((item) => String(item.id) === String(serieId));
                    setTurmaForm({
                      ...turmaForm,
                      serieId,
                      anoLetivo: serie?.anoLetivo || turmaForm.anoLetivo
                    });
                  }}
                >
                  {seriesOrdenadas.map((serie) => (
                    <MenuItem key={serie.id} value={String(serie.id)}>
                      {serie.nomeSerie} {serie.anoLetivo ? `(${serie.anoLetivo})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Turma"
                value={turmaForm.nomeTurma}
                onChange={(e) => setTurmaForm({ ...turmaForm, nomeTurma: e.target.value })}
                placeholder="Ex: A, B"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Ano Letivo"
                value={turmaForm.anoLetivo}
                onChange={(e) => setTurmaForm({ ...turmaForm, anoLetivo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Turno"
                value={turmaForm.turno}
                onChange={(e) => setTurmaForm({ ...turmaForm, turno: e.target.value })}
                placeholder="Manhã"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', mt: 1 }}>
                {(serieEmEdicao || turmaEmEdicao) && (
                  <Button variant="outlined" color="inherit" startIcon={<Clear />} onClick={limparFormulario}>
                    Cancelar edição
                  </Button>
                )}
                <Button variant="contained" startIcon={<Add />} onClick={salvarSerieTurma}>
                  {serieEmEdicao || turmaEmEdicao ? 'Salvar Série / Turma' : 'Adicionar Série / Turma'}
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Turmas cadastradas
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Turma</TableCell>
                      <TableCell>Série</TableCell>
                      <TableCell>Ano</TableCell>
                      <TableCell>Alunos</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {turmasOrdenadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">Nenhuma turma cadastrada.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      turmasOrdenadas.map((turma) => (
                        <TableRow key={turma.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">{turma.nomeTurma}</Typography>
                            {turma.turno && (
                              <Typography variant="caption" color="text.secondary">{turma.turno}</Typography>
                            )}
                          </TableCell>
                          <TableCell>{turma.nomeSerie || '-'}</TableCell>
                          <TableCell>{turma.anoLetivo || '-'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={getTotalAlunosDaTurma(turma)} />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => editarTurma(turma)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                if (window.confirm('Deseja remover esta turma?')) {
                                  removerTurmaAcademica(turma.id);
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {seriesAcademicas.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Cadastre ao menos uma série para começar a organizar suas turmas e alunos.
        </Alert>
      )}
    </Layout>
  );
}
