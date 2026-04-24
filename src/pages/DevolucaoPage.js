import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Tooltip,
  Typography
} from '@mui/material';
import {
  AssignmentReturn,
  Autorenew,
  CheckCircle,
  Close,
  Delete,
  Print
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

const normalizarTexto = (valor) => {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

const isEmprestimoAtivo = (status) => {
  const statusNormalizado = normalizarTexto(status);
  return statusNormalizado === 'ativo' || statusNormalizado === 'emprestado';
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

const obterEmprestimoClienteId = (emprestimo) => {
  return String(emprestimo?.clienteId ?? emprestimo?.leitorId ?? '').trim();
};

const obterChaveTurmaAluno = (aluno, turmasAcademicasMap) => {
  const turmaId = String(aluno?.turmaId || '').trim();
  if (turmaId && turmasAcademicasMap.has(turmaId)) {
    return turmaId;
  }

  const turmaNome = String(aluno?.turma || aluno?.nomeTurma || '').trim();
  if (!turmaNome) {
    return '';
  }

  const serieNome = String(aluno?.serie || aluno?.nomeSerie || '').trim();
  return `legacy:${normalizarTexto(serieNome)}|${normalizarTexto(turmaNome)}`;
};

const obterRotuloTurmaAluno = (aluno, turmasAcademicasMap) => {
  const turmaId = String(aluno?.turmaId || '').trim();
  if (turmaId && turmasAcademicasMap.has(turmaId)) {
    const turma = turmasAcademicasMap.get(turmaId);
    const nomeTurma = String(turma?.nomeTurma || '').trim();
    const nomeSerie = String(turma?.nomeSerie || '').trim();
    return nomeSerie ? `${nomeSerie} - ${nomeTurma}` : nomeTurma;
  }

  const nomeTurmaLegacy = String(aluno?.turma || aluno?.nomeTurma || '').trim();
  const nomeSerieLegacy = String(aluno?.serie || aluno?.nomeSerie || '').trim();
  if (!nomeTurmaLegacy) {
    return 'Sem turma';
  }

  return nomeSerieLegacy ? `${nomeSerieLegacy} - ${nomeTurmaLegacy}` : nomeTurmaLegacy;
};

function DevolucaoPage() {
  const { emprestimos, livros, clientes, devolverLivro, renovarEmprestimo, removerEmprestimo, turmasAcademicas } = useData();
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaISBN, setBuscaISBN] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);
  const [acao, setAcao] = useState('');
  const [diasRenovacao, setDiasRenovacao] = useState(7);
  const [modoSelecaoLote, setModoSelecaoLote] = useState('turma');
  const [turmaSelecionadaLote, setTurmaSelecionadaLote] = useState('');
  const [buscaAlunoLote, setBuscaAlunoLote] = useState('');
  const [selecoesLote, setSelecoesLote] = useState({});
  const [processandoLote, setProcessandoLote] = useState(false);
  const [resultadoLote, setResultadoLote] = useState(null);
  const tabelaEncontradosRef = useRef(null);

  const turmasAcademicasMap = React.useMemo(() => {
    const map = new Map();
    turmasAcademicas.forEach((turma) => {
      map.set(String(turma.id), turma);
    });
    return map;
  }, [turmasAcademicas]);

  const livrosMap = React.useMemo(() => {
    const map = new Map();
    livros.forEach((livro) => {
      map.set(String(livro.id), livro);
    });
    return map;
  }, [livros]);

  const emprestimosAtivos = React.useMemo(() => {
    return emprestimos.filter((emp) => isEmprestimoAtivo(emp.status));
  }, [emprestimos]);

  const emprestimosEncontrados = React.useMemo(() => {
    let resultados = [...emprestimosAtivos];

    if (buscaNome) {
      const nomeCliente = normalizarTexto(buscaNome);
      resultados = resultados.filter((emp) => {
        const cliente = clientes.find((c) => String(c.id) === obterEmprestimoClienteId(emp));
        return cliente && normalizarTexto(cliente.nome).includes(nomeCliente);
      });
    }

    if (buscaISBN) {
      const isbnBusca = buscaISBN.replace(/[^0-9]/g, '');
      resultados = resultados.filter((emp) => {
        const livro = livros.find((l) => String(l.id) === String(emp.livroId));
        if (!livro) return false;
        const isbnLivro = String(livro.isbn || '').replace(/[^0-9]/g, '');
        return isbnLivro.includes(isbnBusca);
      });
    }

    return resultados;
  }, [emprestimosAtivos, clientes, livros, buscaNome, buscaISBN]);

  const emprestimosAtivosPorAluno = React.useMemo(() => {
    const map = new Map();

    emprestimosAtivos.forEach((emp) => {
      const clienteId = obterEmprestimoClienteId(emp);
      if (!clienteId) return;

      const listaAtual = map.get(clienteId) || [];
      listaAtual.push(emp);
      map.set(clienteId, listaAtual);
    });

    return map;
  }, [emprestimosAtivos]);

  const turmasDisponiveisLote = React.useMemo(() => {
    const mapaTurmas = new Map();

    clientes
      .filter((cliente) => isAlunoCliente(cliente))
      .forEach((cliente) => {
        const emprestimosAluno = emprestimosAtivosPorAluno.get(String(cliente.id)) || [];
        if (emprestimosAluno.length === 0) return;

        const chave = obterChaveTurmaAluno(cliente, turmasAcademicasMap);
        if (!chave) return;

        if (!mapaTurmas.has(chave)) {
          mapaTurmas.set(chave, {
            key: chave,
            rotulo: obterRotuloTurmaAluno(cliente, turmasAcademicasMap)
          });
        }
      });

    return Array.from(mapaTurmas.values()).sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
  }, [clientes, emprestimosAtivosPorAluno, turmasAcademicasMap]);

  const alunosComEmprestimosAtivos = React.useMemo(() => {
    return clientes
      .filter((cliente) => isAlunoCliente(cliente))
      .map((cliente) => ({
        cliente,
        emprestimosAtivos: emprestimosAtivosPorAluno.get(String(cliente.id)) || []
      }))
      .filter((item) => item.emprestimosAtivos.length > 0)
      .sort((a, b) => String(a.cliente.nome || '').localeCompare(String(b.cliente.nome || ''), 'pt-BR'));
  }, [clientes, emprestimosAtivosPorAluno]);

  const alunosElegiveisLote = React.useMemo(() => {
    if (modoSelecaoLote === 'turma' && !turmaSelecionadaLote) {
      return [];
    }

    if (!turmaSelecionadaLote) {
      return alunosComEmprestimosAtivos;
    }

    return alunosComEmprestimosAtivos.filter((item) => {
      return obterChaveTurmaAluno(item.cliente, turmasAcademicasMap) === turmaSelecionadaLote;
    });
  }, [alunosComEmprestimosAtivos, modoSelecaoLote, turmaSelecionadaLote, turmasAcademicasMap]);

  const alunosFiltradosLote = React.useMemo(() => {
    const filtro = normalizarTexto(buscaAlunoLote);
    if (!filtro) return alunosElegiveisLote;

    return alunosElegiveisLote.filter((item) => {
      const nome = normalizarTexto(item.cliente.nome);
      const matricula = normalizarTexto(item.cliente.matricula);
      const turmaSerie = normalizarTexto(obterRotuloTurmaAluno(item.cliente, turmasAcademicasMap));
      return nome.includes(filtro) || matricula.includes(filtro) || turmaSerie.includes(filtro);
    });
  }, [alunosElegiveisLote, buscaAlunoLote, turmasAcademicasMap]);

  React.useEffect(() => {
    const idsElegiveis = new Set(alunosElegiveisLote.map((item) => String(item.cliente.id)));

    setSelecoesLote((prev) => {
      const proximo = {};
      Object.entries(prev).forEach(([id, marcado]) => {
        if (marcado && idsElegiveis.has(String(id))) {
          proximo[String(id)] = true;
        }
      });
      return proximo;
    });
  }, [alunosElegiveisLote]);

  const resumoLote = React.useMemo(() => {
    const selecionados = alunosElegiveisLote.filter((item) => Boolean(selecoesLote[item.cliente.id]));
    const emprestimosSelecionados = selecionados.reduce((total, item) => total + item.emprestimosAtivos.length, 0);

    return {
      alunosComEmprestimos: alunosElegiveisLote.length,
      alunosSelecionados: selecionados.length,
      emprestimosSelecionados
    };
  }, [alunosElegiveisLote, selecoesLote]);

  const abrirDialog = (emprestimo, tipoAcao) => {
    setEmprestimoSelecionado(emprestimo);
    setAcao(tipoAcao);
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEmprestimoSelecionado(null);
    setAcao('');
  };

  const confirmarAcao = () => {
    if (acao === 'devolver') {
      devolverLivro(emprestimoSelecionado.id);
    } else if (acao === 'renovar') {
      renovarEmprestimo(emprestimoSelecionado.id, diasRenovacao);
    }

    fecharDialog();
  };

  const atualizarSelecaoLote = (clienteId, marcado) => {
    setSelecoesLote((prev) => ({
      ...prev,
      [clienteId]: marcado
    }));
  };

  const selecionarTodosVisiveisLote = (marcado) => {
    setSelecoesLote((prev) => {
      const proximo = { ...prev };
      alunosFiltradosLote.forEach((item) => {
        proximo[item.cliente.id] = marcado;
      });
      return proximo;
    });
  };

  const selecionarTurmaInteiraLote = (marcado) => {
    setSelecoesLote((prev) => {
      const proximo = { ...prev };
      alunosElegiveisLote.forEach((item) => {
        proximo[item.cliente.id] = marcado;
      });
      return proximo;
    });
  };

  const limparSelecaoLote = () => {
    setSelecoesLote({});
  };

  const confirmarDevolucaoLote = () => {
    if (modoSelecaoLote === 'turma' && !turmaSelecionadaLote) {
      alert('Selecione uma turma para processar a devolução em lote por turma.');
      return;
    }

    const alunosSelecionados = alunosElegiveisLote.filter((item) => Boolean(selecoesLote[item.cliente.id]));

    if (alunosSelecionados.length === 0) {
      alert('Selecione pelo menos um aluno para processar a devolução em lote.');
      return;
    }

    const totalEmprestimos = alunosSelecionados.reduce((total, item) => total + item.emprestimosAtivos.length, 0);
    const confirma = window.confirm(
      `Confirmar devolução em lote de ${totalEmprestimos} empréstimo(s) para ${alunosSelecionados.length} aluno(s)?`
    );

    if (!confirma) {
      return;
    }

    setProcessandoLote(true);
    try {
      alunosSelecionados.forEach((item) => {
        item.emprestimosAtivos.forEach((emprestimo) => {
          devolverLivro(emprestimo.id);
        });
      });

      setResultadoLote({
        alunos: alunosSelecionados.length,
        emprestimos: totalEmprestimos
      });
      setSelecoesLote({});
    } finally {
      setProcessandoLote(false);
    }
  };

  const calcularDiasAtraso = (dataDevolucao) => {
    const hoje = new Date();
    const dataDevol = new Date(dataDevolucao);
    const diffTime = hoje - dataDevol;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleExcluirEmprestimo = (emprestimo) => {
    const clienteNome = getClienteNome(obterEmprestimoClienteId(emprestimo));
    const livroInfo = getLivroInfo(emprestimo.livroId);
    const confirma = window.confirm(
      `Tem certeza que deseja EXCLUIR este empréstimo?\n\n` +
      `Leitor: ${clienteNome}\n` +
      `Livro: ${livroInfo.titulo}\n` +
      `Data: ${new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR')}\n\n` +
      `⚠️ Esta ação remove permanentemente o registro do empréstimo.`
    );
    if (confirma) {
      removerEmprestimo(emprestimo.id);
    }
  };

  const handleImprimirEncontrados = () => {
    const rows = emprestimosEncontrados.map((emp) => {
      const livroInfo = getLivroInfo(emp.livroId);
      const diasAtraso = calcularDiasAtraso(emp.dataDevolucao);
      return {
        leitor: getClienteNome(obterEmprestimoClienteId(emp)),
        livro: livroInfo.titulo,
        isbn: livroInfo.isbn || '-',
        dataEmprestimo: new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR'),
        dataDevolucao: new Date(emp.dataDevolucao).toLocaleDateString('pt-BR'),
        status: diasAtraso > 0 ? `Atrasado ${diasAtraso} dias` : 'No prazo'
      };
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está ativado.');
      return;
    }

    const filtroTexto = [
      buscaNome ? `Nome: "${buscaNome}"` : '',
      buscaISBN ? `ISBN: "${buscaISBN}"` : ''
    ].filter(Boolean).join(' | ') || 'Todos os empréstimos ativos';

    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Empréstimos Encontrados</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        h2 { margin-bottom: 4px; }
        .filtro { color: #666; margin-bottom: 12px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .atrasado { color: #d32f2f; font-weight: bold; }
        .no-prazo { color: #2e7d32; }
        @media print { body { margin: 10px; } }
      </style></head><body>
      <h2>Empréstimos Encontrados (${rows.length})</h2>
      <div class="filtro">Filtro: ${filtroTexto} — Impresso em ${new Date().toLocaleString('pt-BR')}</div>
      <table>
        <thead><tr><th>Leitor</th><th>Livro</th><th>ISBN</th><th>Data Empréstimo</th><th>Data Devolução</th><th>Status</th></tr></thead>
        <tbody>${rows.map(r =>
          `<tr><td>${r.leitor}</td><td>${r.livro}</td><td>${r.isbn}</td><td>${r.dataEmprestimo}</td><td>${r.dataDevolucao}</td><td class="${r.status.startsWith('Atrasado') ? 'atrasado' : 'no-prazo'}">${r.status}</td></tr>`
        ).join('')}</tbody>
      </table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find((c) => String(c.id) === String(clienteId));
    return cliente ? cliente.nome : 'Desconhecido';
  };

  const getLivroInfo = (livroId) => {
    return livrosMap.get(String(livroId)) || { titulo: 'Desconhecido', isbn: '' };
  };

  const getTitulosEmprestimosAluno = (item) => {
    const titulos = item.emprestimosAtivos
      .map((emp) => getLivroInfo(emp.livroId).titulo)
      .filter(Boolean);

    if (titulos.length <= 2) {
      return titulos.join(', ');
    }

    return `${titulos.slice(0, 2).join(', ')} e mais ${titulos.length - 2}`;
  };

  const podeExibirLote = modoSelecaoLote === 'individual' || Boolean(turmaSelecionadaLote);

  return (
    <Layout title="Devoluções">
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Devoluções:</strong> Use a <strong>devolução em lote</strong> para processar turmas inteiras de uma vez, ou a <strong>busca individual</strong> para localizar empréstimos específicos por nome ou ISBN.
          </Typography>
        </Alert>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📦 Devolução em Lote
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione alunos por turma ou individualmente para devolver todos os seus livros de uma só vez.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Modo de devolução</InputLabel>
                <Select
                  value={modoSelecaoLote}
                  label="Modo de devolução"
                  onChange={(e) => {
                    setModoSelecaoLote(e.target.value);
                    setTurmaSelecionadaLote('');
                    setBuscaAlunoLote('');
                    setSelecoesLote({});
                    setResultadoLote(null);
                  }}
                >
                  <MenuItem value="turma">Por série/turma (lote)</MenuItem>
                  <MenuItem value="individual">Por aluno(s) individualmente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{modoSelecaoLote === 'turma' ? 'Série/Turma' : 'Filtrar série/turma (opcional)'}</InputLabel>
                <Select
                  value={turmaSelecionadaLote}
                  label={modoSelecaoLote === 'turma' ? 'Série/Turma' : 'Filtrar série/turma (opcional)'}
                  onChange={(e) => {
                    setTurmaSelecionadaLote(e.target.value);
                    setBuscaAlunoLote('');
                    setSelecoesLote({});
                    setResultadoLote(null);
                  }}
                >
                  <MenuItem value="">
                    {modoSelecaoLote === 'turma' ? 'Selecione uma turma' : 'Todas as turmas'}
                  </MenuItem>
                  {turmasDisponiveisLote.map((turma) => (
                    <MenuItem key={turma.key} value={turma.key}>{turma.rotulo}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Buscar aluno (leitores)"
                placeholder="Nome, matrícula, série ou turma"
                value={buscaAlunoLote}
                onChange={(e) => setBuscaAlunoLote(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Empréstimos selecionados"
                value={String(resumoLote.emprestimosSelecionados)}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => selecionarTodosVisiveisLote(true)}
              disabled={alunosFiltradosLote.length === 0 || processandoLote}
            >
              Selecionar todos visíveis
            </Button>
            {modoSelecaoLote === 'turma' && (
              <Button
                variant="outlined"
                onClick={() => selecionarTurmaInteiraLote(true)}
                disabled={alunosElegiveisLote.length === 0 || processandoLote}
              >
                Selecionar turma inteira
              </Button>
            )}
            <Button
              variant="outlined"
              color="inherit"
              onClick={limparSelecaoLote}
              disabled={resumoLote.alunosSelecionados === 0 || processandoLote}
            >
              Limpar seleção
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<AssignmentReturn />}
              onClick={confirmarDevolucaoLote}
              disabled={resumoLote.alunosSelecionados === 0 || processandoLote}
            >
              Devolver selecionados
            </Button>
          </Box>
        </CardContent>
      </Card>

      {podeExibirLote && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Alunos com empréstimos</Typography>
              <Typography variant="h6">{resumoLote.alunosComEmprestimos}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Alunos selecionados</Typography>
              <Typography variant="h6">{resumoLote.alunosSelecionados}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Empréstimos selecionados</Typography>
              <Typography variant="h6">{resumoLote.emprestimosSelecionados}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {resultadoLote && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Devolução em lote concluída: {resultadoLote.emprestimos} empréstimo(s) devolvido(s) para {resultadoLote.alunos} aluno(s).
        </Alert>
      )}

      {podeExibirLote && (
        alunosFiltradosLote.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Nenhum aluno com empréstimos ativos encontrado para o filtro selecionado.
          </Alert>
        ) : (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alunos para devolução em lote
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Selecionar</TableCell>
                      <TableCell>Aluno</TableCell>
                      <TableCell>Turma</TableCell>
                      <TableCell align="center">Empréstimos</TableCell>
                      <TableCell>Livros</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alunosFiltradosLote.map((item) => (
                      <TableRow key={item.cliente.id} hover>
                        <TableCell align="center">
                          <Checkbox
                            checked={Boolean(selecoesLote[item.cliente.id])}
                            onChange={(e) => atualizarSelecaoLote(item.cliente.id, e.target.checked)}
                            disabled={processandoLote}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{item.cliente.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Matrícula: {item.cliente.matricula || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{obterRotuloTurmaAluno(item.cliente, turmasAcademicasMap)}</TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={item.emprestimosAtivos.length} />
                        </TableCell>
                        <TableCell>{getTitulosEmprestimosAluno(item) || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )
      )}

      <Divider sx={{ mb: 3 }}>
        <Chip label="Busca Individual" variant="outlined" />
      </Divider>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Buscar empréstimo por leitor ou ISBN
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Localize empréstimos ativos digitando o nome do leitor ou o ISBN do livro. Os resultados aparecem automaticamente abaixo.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Leitor"
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Digite o nome do leitor"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN do Livro"
                value={buscaISBN}
                onChange={(e) => setBuscaISBN(e.target.value)}
                placeholder="Digite o ISBN ou parte dele"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {emprestimosEncontrados.length > 0 && (
        <Card ref={tabelaEncontradosRef}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">
                Empréstimos encontrados ({emprestimosEncontrados.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Print />}
                onClick={handleImprimirEncontrados}
              >
                Imprimir lista
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Leitor</TableCell>
                    <TableCell>Livro</TableCell>
                    <TableCell>ISBN</TableCell>
                    <TableCell>Data Empréstimo</TableCell>
                    <TableCell>Data Devolução</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emprestimosEncontrados.map((emp) => {
                    const livroInfo = getLivroInfo(emp.livroId);
                    const diasAtraso = calcularDiasAtraso(emp.dataDevolucao);
                    const atrasado = diasAtraso > 0;

                    return (
                      <TableRow key={emp.id}>
                        <TableCell>{getClienteNome(obterEmprestimoClienteId(emp))}</TableCell>
                        <TableCell>{livroInfo.titulo}</TableCell>
                        <TableCell>{livroInfo.isbn || '-'}</TableCell>
                        <TableCell>
                          {new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {new Date(emp.dataDevolucao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {atrasado ? (
                            <Chip label={`Atrasado ${diasAtraso} dias`} color="error" size="small" />
                          ) : (
                            <Chip label="No prazo" color="success" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Devolver">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => abrirDialog(emp, 'devolver')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Renovar">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => abrirDialog(emp, 'renovar')}
                            >
                              <Autorenew />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir empréstimo">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleExcluirEmprestimo(emp)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {emprestimosEncontrados.length === 0 && (buscaNome || buscaISBN) && (
        <Alert severity="warning">
          Nenhum empréstimo ativo encontrado com os critérios informados.
        </Alert>
      )}

      <Dialog open={dialogOpen} onClose={fecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {acao === 'devolver' ? (
            <>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
              Confirmar devolução
            </>
          ) : (
            <>
              <Autorenew sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              Renovar empréstimo
            </>
          )}
        </DialogTitle>

        <DialogContent>
          {emprestimoSelecionado && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Leitor:</strong> {getClienteNome(obterEmprestimoClienteId(emprestimoSelecionado))}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Livro:</strong> {getLivroInfo(emprestimoSelecionado.livroId).titulo}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data Empréstimo:</strong>{' '}
                {new Date(emprestimoSelecionado.dataEmprestimo).toLocaleDateString('pt-BR')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data Devolução:</strong>{' '}
                {new Date(emprestimoSelecionado.dataDevolucao).toLocaleDateString('pt-BR')}
              </Typography>

              {acao === 'renovar' && (
                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Renovar por quantos dias?</InputLabel>
                    <Select
                      value={diasRenovacao}
                      label="Renovar por quantos dias?"
                      onChange={(e) => setDiasRenovacao(e.target.value)}
                    >
                      <MenuItem value={7}>7 dias</MenuItem>
                      <MenuItem value={14}>14 dias</MenuItem>
                      <MenuItem value={21}>21 dias</MenuItem>
                      <MenuItem value={30}>30 dias</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={fecharDialog} startIcon={<Close />}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={acao === 'devolver' ? 'success' : 'primary'}
            onClick={confirmarAcao}
            startIcon={acao === 'devolver' ? <CheckCircle /> : <Autorenew />}
          >
            {acao === 'devolver' ? 'Confirmar devolução' : 'Confirmar renovação'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default DevolucaoPage;
