import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  MenuItem,
  Tooltip
} from '@mui/material';
import { Add, Edit, Delete, DeleteForever, Search, Description, ToggleOn, ToggleOff, UploadFile } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import TermoEmprestimo from '../components/TermoEmprestimo';

const normalizarTexto = (valor) => String(valor || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[º°]/g, 'o')
  .replace(/[ª]/g, 'a')
  .replace(/[^a-z0-9\s-]/g, ' ')
  .replace(/\s+/g, ' ');

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
const somenteDigitos = (valor) => String(valor || '').replace(/\D/g, '');

const extrairSerieETurma = (valor) => {
  const texto = String(valor || '').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  if (!texto) {
    return { serie: '', turma: '' };
  }

  const partes = texto.split('-').map((item) => item.trim()).filter(Boolean);
  if (partes.length >= 2) {
    return {
      serie: partes.slice(0, -1).join(' - ').trim(),
      turma: partes[partes.length - 1].trim()
    };
  }

  return { serie: texto, turma: '' };
};

const parseLinhaImportacao = (linha) => {
  const conteudo = String(linha || '').replace(/^\uFEFF/, '').trim();
  if (!conteudo) return null;

  const linhaNormalizada = normalizarTexto(conteudo);
  if (
    linhaNormalizada.startsWith('nome') ||
    linhaNormalizada.startsWith('cpf') ||
    linhaNormalizada.includes('nome	cpf')
  ) {
    return null;
  }

  const separador = conteudo.includes('\t')
    ? '\t'
    : conteudo.includes(';')
      ? ';'
      : conteudo.includes(',')
        ? ','
        : null;

  if (!separador) {
    return null;
  }

  const partes = conteudo.split(separador).map((item) => String(item || '').trim());
  if (partes.length < 3) {
    return null;
  }

  const possuiIndice = /^\d+$/.test(partes[0] || '');
  const deslocamento = possuiIndice ? 1 : 0;
  const colunasUteis = partes.length - deslocamento;

  if (colunasUteis < 3) {
    return null;
  }

  const nome = partes[deslocamento] || '';
  const cpf = partes[deslocamento + 1] || '';
  const matricula = partes[deslocamento + 4] || '';

  let serie = '';
  let turma = '';

  if (colunasUteis >= 4) {
    serie = partes[deslocamento + 2] || '';
    turma = partes[deslocamento + 3] || '';
  } else {
    const extraido = extrairSerieETurma(partes[deslocamento + 2]);
    serie = extraido.serie;
    turma = extraido.turma;
  }

  return {
    nome,
    cpf,
    serie,
    turma,
    matricula
  };
};

function LeitoresPage() {
  const {
    clientes,
    adicionarCliente,
    adicionarClientesEmLote,
    atualizarCliente,
    removerCliente,
    removerTodosClientes,
    removerClientesPorTurma,
    emprestimos,
    seriesAcademicas,
    turmasAcademicas
  } = useData();
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [excluirTurmaOpen, setExcluirTurmaOpen] = useState(false);
  const [turmaParaExclusao, setTurmaParaExclusao] = useState('');
  const [textoImportacao, setTextoImportacao] = useState('');
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  
  // Estados para termo de empréstimo
  const [termoOpen, setTermoOpen] = useState(false);
  const [tipoTermo, setTipoTermo] = useState('branco');
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    tipo: 'Aluno',
    categoria: '',
    serie: '',
    serieId: '',
    turma: '',
    turmaId: '',
    matricula: '',
    ativo: true
  });

  const tiposCliente = ['Aluno', 'Professor', 'Funcionário', 'Visitante'];

  const getPerfilLeitor = (cliente) => {
    const tipo = normalizarTexto(cliente?.tipo);
    const categoria = normalizarTexto(cliente?.categoria);
    const possuiVinculoAcademico = Boolean(
      String(cliente?.turmaId || '').trim()
      || String(cliente?.serieId || '').trim()
      || normalizarTexto(cliente?.turma || cliente?.nomeTurma)
      || normalizarTexto(cliente?.serie || cliente?.nomeSerie)
    );

    if (tipo === 'aluno' || categoria === 'estudante' || (tipo === 'leitor' && possuiVinculoAcademico)) {
      return 'estudante';
    }

    if (tipo.includes('professor')) {
      return 'professor';
    }

    if (
      tipo.includes('funcion')
      || tipo.includes('bibliotec')
      || tipo.includes('coorden')
      || tipo.includes('diretor')
      || tipo.includes('gestor')
      || tipo.includes('servidor')
      || tipo.includes('admin')
      || categoria.includes('funcion')
      || categoria.includes('servidor')
    ) {
      return 'funcionario';
    }

    return 'comunidade';
  };

  const clientesVisiveis = useMemo(
    () => clientes.filter((cliente) => !cliente?.excluido),
    [clientes]
  );

  const resumoLeitores = useMemo(() => {
    const acumulado = {
      turmas: turmasAcademicas.length,
      total: clientesVisiveis.length,
      estudantes: 0,
      professores: 0,
      funcionarios: 0,
      comunidade: 0
    };

    clientesVisiveis.forEach((cliente) => {
      const perfil = getPerfilLeitor(cliente);
      if (perfil === 'estudante') acumulado.estudantes += 1;
      else if (perfil === 'professor') acumulado.professores += 1;
      else if (perfil === 'funcionario') acumulado.funcionarios += 1;
      else acumulado.comunidade += 1;
    });

    return acumulado;
  }, [clientesVisiveis, turmasAcademicas]);

  const localizarSeriePorNome = (nomeSerie) => {
    const nomeNormalizado = normalizarTexto(nomeSerie);
    if (!nomeNormalizado) return null;

    const nomeCompacto = compactarTexto(nomeSerie);
    const numeroSerie = extrairNumeroSerie(nomeSerie);

    const correspondenciaExata = seriesAcademicas.find((serie) => normalizarTexto(serie.nomeSerie) === nomeNormalizado);
    if (correspondenciaExata) return correspondenciaExata;

    if (nomeCompacto) {
      const correspondenciaCompacta = seriesAcademicas.find((serie) => {
        const serieCompacta = compactarTexto(serie.nomeSerie);
        return (
          serieCompacta === nomeCompacto
          || serieCompacta.includes(nomeCompacto)
          || nomeCompacto.includes(serieCompacta)
        );
      });

      if (correspondenciaCompacta) {
        return correspondenciaCompacta;
      }
    }

    if (numeroSerie) {
      const correspondenciasPorNumero = seriesAcademicas.filter(
        (serie) => extrairNumeroSerie(serie.nomeSerie) === numeroSerie
      );

      if (correspondenciasPorNumero.length === 1) {
        return correspondenciasPorNumero[0];
      }
    }

    return null;
  };

  const localizarTurmaPorNome = (nomeTurma, serieId = '', nomeSerie = '') => {
    const turmaNormalizada = normalizarTexto(nomeTurma);
    if (!turmaNormalizada) return null;

    const turmaCompacta = compactarTexto(nomeTurma);
    const serieIdNormalizada = String(serieId || '').trim();
    const serieInformada = localizarSeriePorNome(nomeSerie);
    const serieIdResolvida = serieIdNormalizada || (serieInformada ? String(serieInformada.id) : '');
    const serieTextoReferencia = String(nomeSerie || serieInformada?.nomeSerie || '').trim();
    const nomeSerieNormalizado = normalizarTexto(serieTextoReferencia);
    const nomeSerieCompacto = compactarTexto(serieTextoReferencia);
    const numeroSerieReferencia = extrairNumeroSerie(serieTextoReferencia);
    const salaReferencia = extrairSalaTurma(nomeTurma);
    const cursoReferencia = extrairCursoAcademico(nomeTurma, serieTextoReferencia);

    const candidatosSerie = turmasAcademicas.filter((turma) => {
      if (serieIdResolvida) {
        return String(turma.serieId || '') === serieIdResolvida;
      }

      if (!nomeSerieNormalizado && !numeroSerieReferencia) {
        return true;
      }

      const nomeSerieTurma = normalizarTexto(turma.nomeSerie);
      const nomeSerieTurmaCompacto = compactarTexto(turma.nomeSerie);
      const numeroSerieTurma = extrairNumeroSerie(turma.nomeSerie);

      return (
        (!nomeSerieNormalizado || nomeSerieTurma === nomeSerieNormalizado)
        || (nomeSerieCompacto && nomeSerieTurmaCompacto === nomeSerieCompacto)
        || (nomeSerieCompacto && nomeSerieTurmaCompacto.includes(nomeSerieCompacto))
        || (nomeSerieCompacto && nomeSerieCompacto.includes(nomeSerieTurmaCompacto))
        || (numeroSerieReferencia && numeroSerieTurma && numeroSerieReferencia === numeroSerieTurma)
      );
    });

    const candidatos = candidatosSerie.length > 0 ? candidatosSerie : turmasAcademicas;

    const correspondenciaExata = candidatos.find(
      (turma) => normalizarTexto(turma.nomeTurma) === turmaNormalizada
    );
    if (correspondenciaExata) {
      return correspondenciaExata;
    }

    if (turmaCompacta) {
      const correspondenciaCompacta = candidatos.find((turma) => {
        const nomeTurmaCompacto = compactarTexto(turma.nomeTurma);
        return (
          nomeTurmaCompacto === turmaCompacta
          || nomeTurmaCompacto.includes(turmaCompacta)
          || turmaCompacta.includes(nomeTurmaCompacto)
        );
      });

      if (correspondenciaCompacta) {
        return correspondenciaCompacta;
      }
    }

    if (!salaReferencia && !cursoReferencia) {
      return null;
    }

    const candidatosAssinatura = candidatos.filter((turma) => {
      const salaTurma = extrairSalaTurma(turma.nomeTurma);
      const cursoTurma = extrairCursoAcademico(turma.nomeTurma, turma.nomeSerie);
      const numeroSerieTurma = extrairNumeroSerie(turma.nomeSerie);
      const possuiEixoComparavel = (salaReferencia && salaTurma) || (cursoReferencia && cursoTurma);

      if (!possuiEixoComparavel) {
        return false;
      }

      const salaCompativel = !salaReferencia || !salaTurma || salaReferencia === salaTurma;
      const cursoCompativel = !cursoReferencia || !cursoTurma || cursoReferencia === cursoTurma;
      const serieCompativel = !numeroSerieReferencia || !numeroSerieTurma || numeroSerieReferencia === numeroSerieTurma;

      return salaCompativel && cursoCompativel && serieCompativel;
    });

    if (candidatosAssinatura.length === 1) {
      return candidatosAssinatura[0];
    }

    if (cursoReferencia) {
      const candidatosPorCurso = candidatosAssinatura.filter(
        (turma) => extrairCursoAcademico(turma.nomeTurma, turma.nomeSerie) === cursoReferencia
      );

      if (candidatosPorCurso.length === 1) {
        return candidatosPorCurso[0];
      }
    }

    return null;
  };

  const handleOpen = (cliente = null) => {
    if (cliente) {
      setEditando(cliente.id);
      setFormData({
        ...cliente,
        serieId: cliente.serieId ? String(cliente.serieId) : '',
        turmaId: cliente.turmaId ? String(cliente.turmaId) : ''
      });
    } else {
      setEditando(null);
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        tipo: 'Aluno',
        categoria: '',
        serie: '',
        serieId: '',
        turma: '',
        turmaId: '',
        matricula: '',
        ativo: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const abrirCadastroRapido = (tipo) => {
    setEditando(null);
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: '',
      tipo,
      categoria: tipo === 'Aluno' ? 'Estudante' : '',
      serie: '',
      serieId: '',
      turma: '',
      turmaId: '',
      matricula: '',
      ativo: true
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    const dadosParaSalvar = { ...formData };

    // Gerar código automático se for novo leitor
    if (!editando) {
      const numeroSequencial = (clientes.length + 1).toString().padStart(6, '0');
      const codigoLeitor = `LEIT${numeroSequencial}`;
      dadosParaSalvar.codigoIdentificacao = codigoLeitor;
    }

    if (dadosParaSalvar.tipo === 'Aluno') {
      const serieEncontrada = dadosParaSalvar.serieId
        ? (
          seriesAcademicas.find((serie) => String(serie.id) === String(dadosParaSalvar.serieId))
          || localizarSeriePorNome(dadosParaSalvar.serie)
        )
        : localizarSeriePorNome(dadosParaSalvar.serie);

      if (serieEncontrada) {
        dadosParaSalvar.serieId = String(serieEncontrada.id);
        dadosParaSalvar.serie = serieEncontrada.nomeSerie;
      } else {
        dadosParaSalvar.serieId = '';
      }

      const turmaEncontrada = dadosParaSalvar.turmaId
        ? (
          turmasAcademicas.find((turma) => String(turma.id) === String(dadosParaSalvar.turmaId))
          || localizarTurmaPorNome(dadosParaSalvar.turma, dadosParaSalvar.serieId, dadosParaSalvar.serie)
        )
        : localizarTurmaPorNome(dadosParaSalvar.turma, dadosParaSalvar.serieId, dadosParaSalvar.serie);

      if (turmaEncontrada) {
        dadosParaSalvar.turmaId = String(turmaEncontrada.id);
        dadosParaSalvar.turma = turmaEncontrada.nomeTurma;

        if (!dadosParaSalvar.serieId && turmaEncontrada.serieId) {
          dadosParaSalvar.serieId = String(turmaEncontrada.serieId);
          dadosParaSalvar.serie = turmaEncontrada.nomeSerie || dadosParaSalvar.serie;
        }
      } else {
        dadosParaSalvar.turmaId = '';
      }
    } else {
      dadosParaSalvar.serie = '';
      dadosParaSalvar.serieId = '';
      dadosParaSalvar.turma = '';
      dadosParaSalvar.turmaId = '';
    }
    
    if (editando) {
      atualizarCliente(editando, dadosParaSalvar);
    } else {
      adicionarCliente(dadosParaSalvar);
    }
    handleClose();
  };

  const isEmprestimoAtivo = (status) => {
    const statusNormalizado = String(status || '').toLowerCase();
    return statusNormalizado === 'ativo' || statusNormalizado === 'emprestado';
  };

  const possuiEmprestimoAtivo = (clienteId) => {
    const idNormalizado = String(clienteId);
    return emprestimos.some((e) => {
      const clienteIdEmprestimo = e.clienteId ?? e.leitorId;
      return (
        clienteIdEmprestimo !== undefined &&
        clienteIdEmprestimo !== null &&
        String(clienteIdEmprestimo) === idNormalizado &&
        isEmprestimoAtivo(e.status)
      );
    });
  };

  const possuiHistoricoEmprestimos = (clienteId) => {
    const idNormalizado = String(clienteId);
    return emprestimos.some((e) => {
      const clienteIdEmprestimo = e.clienteId ?? e.leitorId;
      return clienteIdEmprestimo !== undefined && clienteIdEmprestimo !== null && String(clienteIdEmprestimo) === idNormalizado;
    });
  };

  const clientePertenceTurma = (cliente, turma) => {
    const turmaId = String(turma?.id || '').trim();
    const clienteTurmaId = String(cliente?.turmaId || '').trim();

    if (turmaId && clienteTurmaId && turmaId === clienteTurmaId) {
      return true;
    }

    const nomeTurmaAlvo = normalizarTexto(turma?.nomeTurma);
    const nomeTurmaCliente = normalizarTexto(cliente?.turma || cliente?.nomeTurma);

    if (!nomeTurmaAlvo || !nomeTurmaCliente || nomeTurmaAlvo !== nomeTurmaCliente) {
      return false;
    }

    const nomeSerieAlvo = normalizarTexto(turma?.nomeSerie);
    const nomeSerieCliente = normalizarTexto(cliente?.serie || cliente?.nomeSerie);

    return !nomeSerieAlvo || !nomeSerieCliente || nomeSerieAlvo === nomeSerieCliente;
  };

  const turmasParaExclusao = useMemo(() => {
    return [...turmasAcademicas]
      .map((turma) => {
        const leitoresDaTurma = clientesVisiveis.filter((cliente) => clientePertenceTurma(cliente, turma));
        const totalLeitores = leitoresDaTurma.length;
        const elegiveisExclusao = leitoresDaTurma.filter((cliente) => !possuiHistoricoEmprestimos(cliente.id)).length;

        return {
          ...turma,
          totalLeitores,
          elegiveisExclusao,
          preservadosHistorico: Math.max(totalLeitores - elegiveisExclusao, 0)
        };
      })
      .filter((turma) => turma.totalLeitores > 0)
      .sort((a, b) => {
        const serieA = String(a.nomeSerie || '');
        const serieB = String(b.nomeSerie || '');
        if (serieA !== serieB) return serieA.localeCompare(serieB, 'pt-BR');
        return String(a.nomeTurma || '').localeCompare(String(b.nomeTurma || ''), 'pt-BR');
      });
  }, [clientesVisiveis, turmasAcademicas, emprestimos]);

  const turmaSelecionadaExclusao = useMemo(() => {
    return turmasParaExclusao.find((turma) => String(turma.id) === String(turmaParaExclusao)) || null;
  }, [turmasParaExclusao, turmaParaExclusao]);

  const handleToggleStatus = (cliente) => {
    const novoStatus = !cliente.ativo;
    const acao = novoStatus ? 'ativar' : 'inativar';

    if (!novoStatus && possuiEmprestimoAtivo(cliente.id)) {
      const confirmar = window.confirm(
        'Este leitor possui empréstimo(s) ativo(s).\n\n' +
        'A inativação não apaga dados e apenas evita novos empréstimos para este cadastro.\n\n' +
        'Deseja continuar?'
      );

      if (!confirmar) {
        return;
      }
    } else if (!window.confirm(`Deseja realmente ${acao} este leitor?`)) {
      return;
    }

    atualizarCliente(cliente.id, { ativo: novoStatus });
  };

  const handleDelete = async (id) => {
    const idNormalizado = String(id);

    const emprestimoAtivo = possuiEmprestimoAtivo(id);

    if (emprestimoAtivo) {
      alert(
        'Não é possível excluir este leitor!\n\n' +
        'O leitor possui livro(s) emprestado(s).\n' +
        'Primeiro realize a devolução de todos os livros emprestados.'
      );
      return;
    }

    if (possuiHistoricoEmprestimos(id)) {
      const confirmarExclusao = window.confirm(
        'Este leitor possui histórico de empréstimos vinculado ao cadastro.\n\n' +
        'Ao excluir, o leitor sairá da listagem normal, mas o histórico da biblioteca será preservado.\n\n' +
        'Deseja continuar com a exclusão?'
      );

      if (!confirmarExclusao) {
        return;
      }
      await removerCliente(id);
      return;
    }

    if (window.confirm('Deseja realmente remover este leitor?')) {
      await removerCliente(id);
    }
  };

  const handleDeleteByTurma = async () => {
    if (!turmaSelecionadaExclusao) {
      alert('Selecione uma turma para continuar.');
      return;
    }

    const mensagem =
      `Tem certeza que deseja EXCLUIR leitores da turma ${turmaSelecionadaExclusao.nomeSerie || '-'} - ${turmaSelecionadaExclusao.nomeTurma}?\n\n` +
      `Total na turma: ${turmaSelecionadaExclusao.totalLeitores}\n` +
      `Sem histórico (serão excluídos): ${turmaSelecionadaExclusao.elegiveisExclusao}\n` +
      `Com histórico (serão preservados): ${turmaSelecionadaExclusao.preservadosHistorico}\n\n` +
      `Esta ação não pode ser desfeita.`;

    if (!window.confirm(mensagem)) return;
    if (!window.confirm('Confirme novamente: excluir os leitores sem histórico da turma selecionada?')) return;

    const resultado = await removerClientesPorTurma({
      id: turmaSelecionadaExclusao.id,
      nomeTurma: turmaSelecionadaExclusao.nomeTurma,
      nomeSerie: turmaSelecionadaExclusao.nomeSerie
    });

    const removidos = Number(resultado?.removidos || 0);
    const preservadosHistorico = Number(resultado?.preservadosHistorico || 0);
    const falhas = Number(resultado?.falhas || 0);

    if (falhas > 0) {
      alert(
        `Concluído com ressalvas.\n\n` +
        `Excluídos: ${removidos}\n` +
        `Preservados por histórico: ${preservadosHistorico}\n` +
        `Falhas na nuvem: ${falhas}`
      );
    } else {
      alert(
        `Concluído.\n\n` +
        `Excluídos: ${removidos}\n` +
        `Preservados por histórico: ${preservadosHistorico}`
      );
    }

    setExcluirTurmaOpen(false);
    setTurmaParaExclusao('');
  };

  const handleDeleteAll = async () => {
    const totalSemHistorico = clientesVisiveis.filter((c) => {
      return !possuiHistoricoEmprestimos(c.id);
    }).length;

    const totalComHistorico = clientesVisiveis.length - totalSemHistorico;

    const mensagem =
      `Tem certeza que deseja EXCLUIR TODOS os leitores?

` +
      `Total de leitores: ${clientesVisiveis.length}
` +
      `Sem histórico (serão excluídos): ${totalSemHistorico}
` +
      `Com histórico (serão preservados): ${totalComHistorico}

` +
      `Esta ação não pode ser desfeita!`;

    if (!window.confirm(mensagem)) return;
    if (!window.confirm('Confirme novamente: excluir TODOS os leitores sem histórico de empréstimo?')) return;

    const resultado = await removerTodosClientes();
    if (resultado?.falhas > 0) {
      alert(
        `Concluído com ressalvas.\n\n` +
        `Excluídos: ${resultado.removidos}\n` +
        `Falhas na nuvem: ${resultado.falhas}`
      );
      return;
    }

    alert(`Concluído. ${resultado.removidos} leitor(es) excluído(s).`);
  };

  const handleImportarEmLote = () => {
    const linhas = String(textoImportacao || '')
      .replace(/\u0000/g, '')
      .split(/\r\n|\n|\r/)
      .map((linha) => linha.trim())
      .filter(Boolean);

    if (linhas.length === 0) {
      alert('Cole a lista de alunos antes de importar.');
      return;
    }

    const registrosProcessados = linhas.map((linha) => parseLinhaImportacao(linha));
    const registros = registrosProcessados.filter(Boolean);

    if (registros.length === 0) {
      alert('Formato inválido. Use linhas como: Nome;CPF;Série;Turma;Matrícula');
      return;
    }

    let ignoradosFormato = registrosProcessados.length - registros.length;

    const loteParaAdicionar = registros.reduce((acumulador, registro) => {
      const nome = String(registro.nome || '').trim();
      const cpf = String(registro.cpf || '').trim();
      const cpfDigitos = somenteDigitos(cpf);

      if (!nome || !cpf || cpfDigitos.length !== 11) {
        ignoradosFormato += 1;
        return acumulador;
      }

      const serieEncontrada = localizarSeriePorNome(registro.serie);
      const turmaEncontrada = localizarTurmaPorNome(
        registro.turma,
        serieEncontrada ? String(serieEncontrada.id) : '',
        registro.serie
      );

      acumulador.push({
        nome,
        cpf,
        telefone: '',
        email: '',
        endereco: '',
        tipo: 'Aluno',
        serie: serieEncontrada?.nomeSerie || String(registro.serie || '').trim(),
        serieId: serieEncontrada ? String(serieEncontrada.id) : '',
        turma: turmaEncontrada?.nomeTurma || String(registro.turma || '').trim(),
        turmaId: turmaEncontrada ? String(turmaEncontrada.id) : '',
        matricula: String(registro.matricula || '').trim(),
        ativo: true
      });

      return acumulador;
    }, []);

    const resultadoLote = adicionarClientesEmLote(loteParaAdicionar);
    const inseridos = Number(resultadoLote?.inseridos || 0);
    const ignoradosContexto = Number(resultadoLote?.ignorados || 0);
    const ignorados = ignoradosFormato + ignoradosContexto;

    const ignoradosPorLimite = Array.isArray(resultadoLote?.detalhesIgnorados)
      ? resultadoLote.detalhesIgnorados.filter((item) => String(item?.motivo || '').includes('limite')).length
      : 0;

    const resumoLimite = ignoradosPorLimite > 0
      ? `\nIgnorados por limite da conta: ${ignoradosPorLimite}`
      : '';

    alert(
      `Importação concluída.\n\n` +
      `Inseridos: ${inseridos}\n` +
      `Ignorados: ${ignorados}` +
      resumoLimite
    );

    setTextoImportacao('');
    setImportOpen(false);
  };

  const clientesFiltrados = clientesVisiveis.filter((cliente) => {
    const buscaNormalizada = busca.toLowerCase();
    return (
      String(cliente?.nome || '').toLowerCase().includes(buscaNormalizada)
      || String(cliente?.cpf || '').includes(busca)
      || String(cliente?.matricula || '').includes(busca)
      || String(cliente?.turma || '').toLowerCase().includes(buscaNormalizada)
      || String(cliente?.serie || '').toLowerCase().includes(buscaNormalizada)
    );
  });

  const turmasCadastradas = useMemo(() => {
    const serieSelecionadaId = String(formData.serieId || '');
    const serieSelecionadaNome = normalizarTexto(formData.serie);
    const nomesTurma = new Set();

    turmasAcademicas.forEach((turma) => {
      const mesmaSeriePorId = serieSelecionadaId
        ? String(turma.serieId || '') === serieSelecionadaId
        : true;
      const mesmaSeriePorNome = !serieSelecionadaId && serieSelecionadaNome
        ? normalizarTexto(turma.nomeSerie) === serieSelecionadaNome
        : true;

      if (mesmaSeriePorId && mesmaSeriePorNome) {
        nomesTurma.add(String(turma.nomeTurma || '').trim());
      }
    });

    clientesVisiveis
      .filter((cliente) => String(cliente.tipo || '').toLowerCase() === 'aluno')
      .forEach((cliente) => {
        const mesmaSerie = serieSelecionadaNome
          ? normalizarTexto(cliente.serie) === serieSelecionadaNome
          : true;

        if (mesmaSerie) {
          nomesTurma.add(String(cliente.turma || '').trim());
        }
      });

    return Array.from(nomesTurma)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [clientesVisiveis, turmasAcademicas, formData.serie, formData.serieId]);

  const seriesCadastradas = useMemo(() => {
    const nomesSeries = new Set(
      seriesAcademicas
        .map((serie) => String(serie.nomeSerie || '').trim())
        .filter(Boolean)
    );

    clientesVisiveis
      .filter((cliente) => String(cliente.tipo || '').toLowerCase() === 'aluno')
      .forEach((cliente) => {
        nomesSeries.add(String(cliente.serie || '').trim());
      });

    return Array.from(nomesSeries)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [clientesVisiveis, seriesAcademicas]);

  return (
    <Layout title="Leitores">
      <Box
        sx={{
          mb: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            md: 'repeat(3, minmax(180px, 1fr))',
            lg: 'repeat(6, minmax(170px, 1fr))'
          },
          gap: 1.5
        }}
      >
        <Card variant="outlined">
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Turmas</Typography>
            <Typography variant="h5" fontWeight={700}>{resumoLeitores.turmas}</Typography>
            <Typography variant="body2" color="text.secondary">cadastradas</Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Estudantes</Typography>
            <Typography variant="h5" fontWeight={700}>{resumoLeitores.estudantes}</Typography>
            <Typography variant="body2" color="text.secondary">leitores cadastrados</Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Professores</Typography>
            <Typography variant="h5" fontWeight={700}>{resumoLeitores.professores}</Typography>
            <Typography variant="body2" color="text.secondary">leitores cadastrados</Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Funcionários</Typography>
            <Typography variant="h5" fontWeight={700}>{resumoLeitores.funcionarios}</Typography>
            <Typography variant="body2" color="text.secondary">leitores cadastrados</Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Comunidade</Typography>
            <Typography variant="h5" fontWeight={700}>{resumoLeitores.comunidade}</Typography>
            <Typography variant="body2" color="text.secondary">leitores cadastrados</Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderColor: 'secondary.main', bgcolor: 'secondary.50' }}>
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography variant="h5" fontWeight={700}>{resumoLeitores.total}</Typography>
            <Typography variant="body2" color="text.secondary">leitores cadastrados</Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Iniciação Rápida
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="contained" onClick={() => abrirCadastroRapido('Aluno')}>
            Novo Estudante
          </Button>
          <Button size="small" variant="outlined" onClick={() => abrirCadastroRapido('Professor')}>
            Novo Professor
          </Button>
          <Button size="small" variant="outlined" onClick={() => abrirCadastroRapido('Funcionário')}>
            Novo Funcionário
          </Button>
          <Button size="small" variant="outlined" onClick={() => abrirCadastroRapido('Visitante')}>
            Nova Comunidade
          </Button>
          <Button size="small" variant="text" startIcon={<UploadFile />} onClick={() => setImportOpen(true)}>
            Importar em lote
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por nome, CPF ou matrícula..."
          variant="outlined"
          size="small"
          fullWidth
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <Button
          variant="outlined"
          startIcon={<Description />}
          onClick={() => {
            setTipoTermo('branco');
            setTermoOpen(true);
          }}
          size="small"
          color="secondary"
        >
          Termo em Branco
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Novo Leitor
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFile />}
          onClick={() => setImportOpen(true)}
        >
          Importar Alunos
        </Button>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<Delete />}
          onClick={() => {
            setTurmaParaExclusao('');
            setExcluirTurmaOpen(true);
          }}
          disabled={turmasParaExclusao.length === 0}
        >
          Excluir por Turma
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForever />}
          onClick={handleDeleteAll}
        >
          Excluir Todos
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Matrícula</TableCell>
              <TableCell>Série</TableCell>
              <TableCell>Turma</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="text.secondary">
                    Nenhum leitor cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <Chip 
                      label={cliente.codigoIdentificacao || 'N/A'} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.cpf}</TableCell>
                  <TableCell>
                    <Chip label={cliente.tipo} size="small" />
                  </TableCell>
                  <TableCell>{cliente.categoria || '-'}</TableCell>
                  <TableCell>{cliente.matricula || '-'}</TableCell>
                  <TableCell>{cliente.serie || '-'}</TableCell>
                  <TableCell>{cliente.turma || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={cliente.ativo ? 'Ativo' : 'Inativo'} 
                      size="small" 
                      color={cliente.ativo ? 'success' : 'default'} 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(cliente)} size="small">
                      <Edit />
                    </IconButton>
                    <Tooltip title={cliente.ativo ? 'Inativar leitor' : 'Ativar leitor'}>
                      <IconButton
                        onClick={() => handleToggleStatus(cliente)}
                        size="small"
                        color={cliente.ativo ? 'warning' : 'success'}
                      >
                        {cliente.ativo ? <ToggleOff /> : <ToggleOn />}
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={() => handleDelete(cliente.id)} size="small" color="error">
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
        <DialogTitle>{editando ? 'Editar Leitor' : 'Novo Leitor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nome Completo"
              fullWidth
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <TextField
              label="CPF"
              fullWidth
              required
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            />
            <TextField
              label="Telefone"
              fullWidth
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Endereço"
              fullWidth
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
            <TextField
              label="Tipo"
              fullWidth
              select
              required
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              {tiposCliente.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Categoria"
              fullWidth
              select
              value={formData.categoria || ''}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            >
              <MenuItem value="">— Não informado —</MenuItem>
              {['Estudante', 'Professor', 'Funcionário', 'Comunidade'].map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            {formData.tipo === 'Aluno' && (
              <>
                <TextField
                  label="Matrícula"
                  fullWidth
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                />
                <TextField
                  label="Série/Ano"
                  fullWidth
                  value={formData.serie}
                  onChange={(e) => {
                    const valorSerie = e.target.value;
                    const serieEncontrada = localizarSeriePorNome(valorSerie);

                    setFormData((prev) => {
                      const proximo = {
                        ...prev,
                        serie: valorSerie,
                        serieId: serieEncontrada ? String(serieEncontrada.id) : ''
                      };

                      if (prev.turmaId) {
                        const turmaAtual = turmasAcademicas.find(
                          (turma) => String(turma.id) === String(prev.turmaId)
                        );

                        if (turmaAtual && proximo.serieId && String(turmaAtual.serieId || '') !== proximo.serieId) {
                          proximo.turma = '';
                          proximo.turmaId = '';
                        }
                      }

                      return proximo;
                    });
                  }}
                  inputProps={{ list: 'lista-series-cadastradas' }}
                  placeholder="Ex: 6º Ano, 1ª Série, EJA Módulo I"
                />
                <TextField
                  label="Turma"
                  fullWidth
                  value={formData.turma}
                  onChange={(e) => {
                    const valorTurma = e.target.value;

                    setFormData((prev) => {
                      const turmaEncontrada = localizarTurmaPorNome(valorTurma, prev.serieId, prev.serie);

                      if (!turmaEncontrada) {
                        return {
                          ...prev,
                          turma: valorTurma,
                          turmaId: ''
                        };
                      }

                      return {
                        ...prev,
                        turma: turmaEncontrada.nomeTurma || valorTurma,
                        turmaId: String(turmaEncontrada.id),
                        serie: turmaEncontrada.nomeSerie || prev.serie,
                        serieId: turmaEncontrada.serieId ? String(turmaEncontrada.serieId) : prev.serieId
                      };
                    });
                  }}
                  inputProps={{ list: 'lista-turmas-cadastradas' }}
                  placeholder="Ex: A, B, C, Integral"
                />
                <datalist id="lista-series-cadastradas">
                  {seriesCadastradas.map((serie) => (
                    <option key={serie} value={serie} />
                  ))}
                </datalist>
                <datalist id="lista-turmas-cadastradas">
                  {turmasCadastradas.map((turma) => (
                    <option key={turma} value={turma} />
                  ))}
                </datalist>
              </>
            )}
            <TextField
              label="Status"
              fullWidth
              select
              value={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
            >
              <MenuItem value={true}>Ativo</MenuItem>
              <MenuItem value={false}>Inativo</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editando ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={excluirTurmaOpen} onClose={() => setExcluirTurmaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Excluir Leitores por Turma</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Selecione a turma. O sistema exclui somente leitores sem histórico de empréstimos e preserva os demais.
          </Typography>

          <TextField
            select
            fullWidth
            label="Turma"
            value={turmaParaExclusao}
            onChange={(e) => setTurmaParaExclusao(e.target.value)}
          >
            {turmasParaExclusao.length === 0 ? (
              <MenuItem value="" disabled>
                Nenhuma turma com leitores cadastrados
              </MenuItem>
            ) : (
              turmasParaExclusao.map((turma) => (
                <MenuItem key={turma.id} value={String(turma.id)}>
                  {turma.nomeSerie || '-'} - {turma.nomeTurma} ({turma.totalLeitores} leitor(es))
                </MenuItem>
              ))
            )}
          </TextField>

          {turmaSelecionadaExclusao && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Total na turma: <strong>{turmaSelecionadaExclusao.totalLeitores}</strong>
              </Typography>
              <Typography variant="body2">
                Serão excluídos: <strong>{turmaSelecionadaExclusao.elegiveisExclusao}</strong>
              </Typography>
              <Typography variant="body2">
                Serão preservados por histórico: <strong>{turmaSelecionadaExclusao.preservadosHistorico}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcluirTurmaOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteByTurma}
            disabled={!turmaSelecionadaExclusao}
          >
            Excluir da Turma
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Importar Alunos em Lote</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Cole uma linha por aluno no formato:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Nome;CPF;Série;Turma;Matrícula
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Também aceita colunas separadas por TAB (copiar/colar de planilha).
          </Typography>
          <TextField
            multiline
            minRows={12}
            fullWidth
            placeholder={'Exemplo:\nMaria da Silva;123.456.789-10;9º ANO;I-A;MAT001'}
            value={textoImportacao}
            onChange={(e) => setTextoImportacao(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleImportarEmLote}>
            Importar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog do Termo de Empréstimo */}
      <TermoEmprestimo
        open={termoOpen}
        onClose={() => setTermoOpen(false)}
        dados={null}
        tipo={tipoTermo}
      />
    </Layout>
  );
}

export default LeitoresPage;
