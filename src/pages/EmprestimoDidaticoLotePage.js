import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Alert,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  LibraryBooks,
  AssignmentTurnedIn,
  Undo,
  Save,
  Groups
} from '@mui/icons-material';

const formatDateForInput = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const normalizarTexto = (valor) => {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[º°]/g, 'o')
    .replace(/[ª]/g, 'a')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ');
};

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

const buildLegacyTurmaKey = (serieNome, turmaNome) => {
  return `legacy:${normalizarTexto(serieNome)}|${normalizarTexto(turmaNome)}`;
};

const extrairSerieTurmaCombinada = (valor) => {
  const textoNormalizado = String(valor || '')
    .replace(/[–—]/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!textoNormalizado) {
    return { serie: '', turma: '' };
  }

  const partes = textoNormalizado
    .split(' - ')
    .map((item) => item.trim())
    .filter(Boolean);

  if (partes.length >= 2) {
    return {
      serie: partes.slice(0, -1).join(' - ').trim(),
      turma: partes[partes.length - 1].trim()
    };
  }

  const tokens = textoNormalizado.split(' ').map((token) => token.trim()).filter(Boolean);
  if (tokens.length >= 2) {
    const turmaSuffix = tokens[tokens.length - 1];
    const serieBase = tokens.slice(0, -1).join(' ').trim();
    const serieBaseNormalizada = normalizarTexto(serieBase);
    const pareceSufixoTurma = /^[IVXLCDM]{1,4}-[A-Z]$/i.test(turmaSuffix) || /^[A-Z]$/i.test(turmaSuffix);
    const pareceSerieAcademica = /\d/.test(serieBase)
      || serieBaseNormalizada.includes('ano')
      || serieBaseNormalizada.includes('serie');

    if (pareceSufixoTurma && pareceSerieAcademica) {
      return {
        serie: serieBase,
        turma: turmaSuffix.toUpperCase()
      };
    }
  }

  return { serie: textoNormalizado, turma: '' };
};

const obterTurmaSerieTextoAluno = (aluno) => {
  const turmaDireta = String(aluno?.turma || aluno?.nomeTurma || '').trim();
  const serieDireta = String(aluno?.serie || aluno?.nomeSerie || '').trim();
  const serieDiretaExtraida = serieDireta
    ? extrairSerieTurmaCombinada(serieDireta)
    : { serie: '', turma: '' };
  const serieDiretaTemTurma = Boolean(serieDiretaExtraida.turma);
  const turmaDiretaConfereComSerie = serieDiretaTemTurma
    && normalizarTexto(turmaDireta) === normalizarTexto(serieDiretaExtraida.turma);

  if (turmaDireta || serieDireta) {
    return {
      turma: turmaDireta || serieDiretaExtraida.turma || '',
      serie: serieDiretaTemTurma && (!turmaDireta || turmaDiretaConfereComSerie)
        ? serieDiretaExtraida.serie
        : serieDireta
    };
  }

  const campoCombinado = String(
    aluno?.anoSerieTurma
    || aluno?.serieTurma
    || aluno?.turmaSerie
    || aluno?.serie_turma
    || ''
  ).trim();

  if (!campoCombinado) {
    return { turma: '', serie: '' };
  }

  const extraido = extrairSerieTurmaCombinada(campoCombinado);
  return {
    turma: String(extraido?.turma || '').trim(),
    serie: String(extraido?.serie || '').trim()
  };
};

const seriesSaoCompativeis = (serieA, serieB) => {
  const serieANormalizada = normalizarTexto(serieA);
  const serieBNormalizada = normalizarTexto(serieB);
  const serieACompacta = compactarTexto(serieA);
  const serieBCompacta = compactarTexto(serieB);
  const numeroSerieA = extrairNumeroSerie(serieA);
  const numeroSerieB = extrairNumeroSerie(serieB);

  if (!serieANormalizada || !serieBNormalizada) {
    return true;
  }

  return (
    serieANormalizada === serieBNormalizada
    || (serieACompacta.length > 0 && serieBCompacta === serieACompacta)
    || (serieACompacta.length > 0 && serieBCompacta.includes(serieACompacta))
    || (serieACompacta.length > 0 && serieACompacta.includes(serieBCompacta))
    || (numeroSerieA && numeroSerieB && numeroSerieA === numeroSerieB)
  );
};

const turmasSaoCompativeis = (turmaA, turmaB) => {
  const nomeTurmaA = String(turmaA?.nomeTurma || '').trim();
  const nomeTurmaB = String(turmaB?.nomeTurma || '').trim();
  const nomeSerieA = String(turmaA?.nomeSerie || '').trim();
  const nomeSerieB = String(turmaB?.nomeSerie || '').trim();

  const nomeTurmaANormalizado = normalizarTexto(nomeTurmaA);
  const nomeTurmaBNormalizado = normalizarTexto(nomeTurmaB);
  const nomeTurmaACompacto = compactarTexto(nomeTurmaA);
  const nomeTurmaBCompacto = compactarTexto(nomeTurmaB);

  const porNomeDireto =
    (nomeTurmaANormalizado && nomeTurmaANormalizado === nomeTurmaBNormalizado)
    || (nomeTurmaACompacto && nomeTurmaACompacto === nomeTurmaBCompacto)
    || (nomeTurmaACompacto && nomeTurmaBCompacto && (
      nomeTurmaACompacto.includes(nomeTurmaBCompacto)
      || nomeTurmaBCompacto.includes(nomeTurmaACompacto)
    ));

  if (porNomeDireto && seriesSaoCompativeis(nomeSerieA, nomeSerieB)) {
    return true;
  }

  const salaA = extrairSalaTurma(nomeTurmaA);
  const salaB = extrairSalaTurma(nomeTurmaB);
  const cursoA = extrairCursoAcademico(nomeTurmaA, nomeSerieA);
  const cursoB = extrairCursoAcademico(nomeTurmaB, nomeSerieB);

  const porAssinatura =
    Boolean(salaA)
    && Boolean(salaB)
    && salaA === salaB
    && (!cursoA || !cursoB || cursoA === cursoB)
    && seriesSaoCompativeis(nomeSerieA, nomeSerieB);

  return porAssinatura;
};

const isAlunoDaTurmaSelecionada = (aluno, turmaSelecionadaInfo, turmasAcademicasMap) => {
  if (!turmaSelecionadaInfo) {
    return true;
  }

  const chaveSelecionada = String(turmaSelecionadaInfo.key || '').trim();
  const turmaSelecionadaAcademica = turmasAcademicasMap.has(chaveSelecionada)
    ? turmasAcademicasMap.get(chaveSelecionada)
    : null;

  const turmaAlunoId = String(aluno?.turmaId || '').trim();
  if (turmaSelecionadaAcademica && turmaAlunoId) {
    return turmaAlunoId === chaveSelecionada;
  }

  const turmaSerieAluno = obterTurmaSerieTextoAluno(aluno);
  const turmaNomeAluno = String(turmaSerieAluno.turma || '').trim();
  const serieNomeAluno = String(turmaSerieAluno.serie || '').trim();
  const turmaNomeSelecionada = String(
    turmaSelecionadaAcademica?.nomeTurma || turmaSelecionadaInfo?.nomeTurma || ''
  ).trim();
  const serieNomeSelecionada = String(
    turmaSelecionadaAcademica?.nomeSerie || turmaSelecionadaInfo?.nomeSerie || ''
  ).trim();

  if (!turmaNomeAluno || !turmaNomeSelecionada) {
    return false;
  }

  const nomeTurmaIgual = (
    normalizarTexto(turmaNomeAluno) === normalizarTexto(turmaNomeSelecionada)
    || compactarTexto(turmaNomeAluno) === compactarTexto(turmaNomeSelecionada)
  );

  if (!nomeTurmaIgual) {
    return false;
  }

  if (turmaSelecionadaAcademica && turmaAlunoId && turmaAlunoId !== chaveSelecionada) {
    return false;
  }

  return seriesSaoCompativeis(serieNomeAluno, serieNomeSelecionada);
};

const localizarTurmaAcademicaDoAluno = (aluno, turmasAcademicasMap) => {
  const turmaId = String(aluno?.turmaId || '').trim();
  if (turmaId && turmasAcademicasMap.has(turmaId)) {
    return turmasAcademicasMap.get(turmaId);
  }

  const turmaSerieAluno = obterTurmaSerieTextoAluno(aluno);
  const turmaNomeAluno = String(turmaSerieAluno.turma || '').trim();
  if (!turmaNomeAluno) {
    return null;
  }

  const serieNomeAluno = String(turmaSerieAluno.serie || '').trim();
  const serieIdAluno = String(aluno?.serieId || '').trim();

  const turmaNomeNormalizado = normalizarTexto(turmaNomeAluno);
  const turmaNomeCompacto = compactarTexto(turmaNomeAluno);
  const serieNomeNormalizado = normalizarTexto(serieNomeAluno);
  const serieNomeCompacto = compactarTexto(serieNomeAluno);
  const numeroSerieAluno = extrairNumeroSerie(serieNomeAluno);
  const salaAluno = extrairSalaTurma(turmaNomeAluno);
  const cursoAluno = extrairCursoAcademico(turmaNomeAluno, serieNomeAluno);

  let melhorPorNome = null;
  let melhorPorAssinatura = null;

  for (const turma of turmasAcademicasMap.values()) {
    const nomeTurma = String(turma?.nomeTurma || '').trim();
    if (!nomeTurma) continue;

    const nomeSerie = String(turma?.nomeSerie || '').trim();
    const turmaSerieId = String(turma?.serieId || '').trim();
    const nomeTurmaNormalizado = normalizarTexto(nomeTurma);
    const nomeTurmaCompacto = compactarTexto(nomeTurma);
    const nomeSerieNormalizado = normalizarTexto(nomeSerie);
    const nomeSerieCompacto = compactarTexto(nomeSerie);
    const numeroSerieTurma = extrairNumeroSerie(nomeSerie);
    const salaTurma = extrairSalaTurma(nomeTurma);
    const cursoTurma = extrairCursoAcademico(nomeTurma, nomeSerie);

    const serieCompativel =
      !serieNomeNormalizado
      || !nomeSerieNormalizado
      || nomeSerieNormalizado === serieNomeNormalizado
      || (serieNomeCompacto.length > 0 && nomeSerieCompacto === serieNomeCompacto)
      || (serieNomeCompacto.length > 0 && nomeSerieCompacto.includes(serieNomeCompacto))
      || (serieNomeCompacto.length > 0 && serieNomeCompacto.includes(nomeSerieCompacto))
      || (numeroSerieAluno && numeroSerieTurma && numeroSerieAluno === numeroSerieTurma)
      || (serieIdAluno && turmaSerieId && serieIdAluno === turmaSerieId);

    const nomeCompativel =
      (turmaNomeNormalizado.length > 0 && nomeTurmaNormalizado === turmaNomeNormalizado)
      || (turmaNomeCompacto.length > 0 && nomeTurmaCompacto === turmaNomeCompacto);

    if (nomeCompativel && serieCompativel) {
      return turma;
    }

    if (!melhorPorNome && nomeCompativel) {
      melhorPorNome = turma;
    }

    const cursoCompativel = cursoAluno ? (!cursoTurma || cursoAluno === cursoTurma) : !cursoTurma;
    const porAssinatura =
      Boolean(salaAluno)
      && Boolean(salaTurma)
      && salaAluno === salaTurma
      && cursoCompativel
      && (!numeroSerieAluno || !numeroSerieTurma || numeroSerieAluno === numeroSerieTurma);

    if (!melhorPorAssinatura && porAssinatura && serieCompativel) {
      melhorPorAssinatura = turma;
    }
  }

  return melhorPorNome || melhorPorAssinatura || null;
};

const isTipoDidatico = (tipoLivro) => {
  const tipoNormalizado = normalizarTexto(tipoLivro);
  return (
    tipoNormalizado === 'didatico'
    || tipoNormalizado === 'didaticos'
    || tipoNormalizado === 'livro didatico'
  );
};

const isTipoParadidatico = (tipoLivro) => {
  const tipoNormalizado = normalizarTexto(tipoLivro);
  return (
    tipoNormalizado === ''
    || tipoNormalizado === 'paradidatico'
    || tipoNormalizado === 'paradidaticos'
    || tipoNormalizado === 'livro paradidatico'
  );
};

const isAlunoLote = (cliente) => {
  const tipoNormalizado = normalizarTexto(cliente?.tipo);
  const categoriaNormalizada = normalizarTexto(cliente?.categoria);
  const turmaSerieAluno = obterTurmaSerieTextoAluno(cliente);
  const possuiCampoCombinado = String(
    cliente?.anoSerieTurma
    || cliente?.serieTurma
    || cliente?.turmaSerie
    || cliente?.serie_turma
    || ''
  ).trim().length > 0;

  const possuiVinculoAcademico =
    String(cliente?.turmaId || '').trim().length > 0
    || String(cliente?.serieId || '').trim().length > 0
    || normalizarTexto(turmaSerieAluno.turma).length > 0
    || normalizarTexto(turmaSerieAluno.serie).length > 0
    || possuiCampoCombinado;

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

const obterChaveTurmaAluno = (aluno, turmasAcademicasMap) => {
  const turmaAssociada = localizarTurmaAcademicaDoAluno(aluno, turmasAcademicasMap);
  if (turmaAssociada?.id !== undefined && turmaAssociada?.id !== null) {
    return String(turmaAssociada.id);
  }

  const turmaSerieAluno = obterTurmaSerieTextoAluno(aluno);
  const turmaNome = String(turmaSerieAluno.turma || '').trim();
  if (!turmaNome) {
    return '';
  }

  const serieNome = String(turmaSerieAluno.serie || '').trim();
  return buildLegacyTurmaKey(serieNome, turmaNome);
};

const obterRotuloTurmaAluno = (aluno, turmasAcademicasMap) => {
  const turmaAssociada = localizarTurmaAcademicaDoAluno(aluno, turmasAcademicasMap);

  if (turmaAssociada) {
    const turma = turmaAssociada;
    const nomeTurma = String(turma?.nomeTurma || '').trim();
    const nomeSerie = String(turma?.nomeSerie || '').trim();
    return nomeSerie ? `${nomeSerie} - ${nomeTurma}` : nomeTurma;
  }

  const turmaSerieAluno = obterTurmaSerieTextoAluno(aluno);
  const nomeTurmaLegacy = String(turmaSerieAluno.turma || '').trim();
  const nomeSerieLegacy = String(turmaSerieAluno.serie || '').trim();
  if (!nomeTurmaLegacy) {
    return 'Sem turma';
  }

  return nomeSerieLegacy ? `${nomeSerieLegacy} - ${nomeTurmaLegacy}` : nomeTurmaLegacy;
};

const campoPadraoSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 56
  }
};

const cartaoResumoSx = {
  p: 2,
  minHeight: 92,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const botaoAcaoSx = {
  minHeight: 42,
  minWidth: { xs: '100%', sm: 180 }
};

export default function EmprestimoDidaticoLotePage() {
  const {
    clientes,
    livros,
    emprestimos,
    adicionarEmprestimo,
    devolverLivro,
    turmasAcademicas
  } = useData();

  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [modoSelecaoAlunos, setModoSelecaoAlunos] = useState('turma');
  const [tipoAcervoSelecionado, setTipoAcervoSelecionado] = useState('todos');
  const [livrosSelecionados, setLivrosSelecionados] = useState([]);
  const [alunosSelecionadosMapa, setAlunosSelecionadosMapa] = useState({});
  const [dataDevolucaoPrevista, setDataDevolucaoPrevista] = useState(() => {
    const data = new Date();
    data.setDate(data.getDate() + 30);
    return formatDateForInput(data);
  });
  const [selecoes, setSelecoes] = useState({});
  const [processando, setProcessando] = useState(false);
  const [resultadoAplicacao, setResultadoAplicacao] = useState(null);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [resumoConfirmacao, setResumoConfirmacao] = useState(null);

  const observacaoPadraoAplicada = 'Empréstimo em lote por turma';

  const isEmprestimoAtivo = (status) => {
    const statusNormalizado = String(status || '').toLowerCase();
    return statusNormalizado === 'ativo' || statusNormalizado === 'emprestado';
  };

  const turmasAcademicasMap = useMemo(() => {
    const map = new Map();
    turmasAcademicas.forEach((turma) => {
      map.set(String(turma.id), turma);
    });
    return map;
  }, [turmasAcademicas]);

  const turmasDisponiveis = useMemo(() => {
    const mapaTurmas = new Map();

    turmasAcademicas.forEach((turma) => {
      const nomeTurma = String(turma.nomeTurma || '').trim();
      if (!nomeTurma) return;

      const nomeSerie = String(turma.nomeSerie || '').trim();
      const chave = String(turma.id);

      mapaTurmas.set(chave, {
        key: chave,
        nomeTurma,
        nomeSerie,
        rotulo: nomeSerie ? `${nomeSerie} - ${nomeTurma}` : nomeTurma
      });
    });

    clientes
      .filter((cliente) => isAlunoLote(cliente))
      .forEach((cliente) => {
        const turmaSerieAluno = obterTurmaSerieTextoAluno(cliente);
        const turmaNome = String(turmaSerieAluno.turma || '').trim();
        if (!turmaNome) return;

        const turmaAssociada = localizarTurmaAcademicaDoAluno(cliente, turmasAcademicasMap);
        if (turmaAssociada?.id !== undefined && turmaAssociada?.id !== null) {
          return;
        }

        const serieNome = String(turmaSerieAluno.serie || '').trim();
        const chave = buildLegacyTurmaKey(serieNome, turmaNome);

        if (!mapaTurmas.has(chave)) {
          mapaTurmas.set(chave, {
            key: chave,
            nomeTurma: turmaNome,
            nomeSerie: serieNome,
            rotulo: serieNome ? `${serieNome} - ${turmaNome}` : turmaNome
          });
        }
      });

    return Array.from(mapaTurmas.values()).sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
  }, [clientes, turmasAcademicas, turmasAcademicasMap]);

  const turmaSelecionadaInfo = useMemo(() => {
    return turmasDisponiveis.find((item) => item.key === turmaSelecionada) || null;
  }, [turmasDisponiveis, turmaSelecionada]);

  const livrosDidaticos = useMemo(() => {
    return livros
      .filter((livro) => {
        if (livro.baixa) return false;

        const didatico = isTipoDidatico(livro.tipo);
        const paradidatico = isTipoParadidatico(livro.tipo);

        if (!didatico && !paradidatico) {
          return false;
        }

        if (tipoAcervoSelecionado === 'didatico') {
          return didatico;
        }

        if (tipoAcervoSelecionado === 'paradidatico') {
          return paradidatico;
        }

        return didatico || paradidatico;
      })
      .sort((a, b) => String(a.titulo || '').localeCompare(String(b.titulo || ''), 'pt-BR'));
  }, [livros, tipoAcervoSelecionado]);

  const livrosDidaticosMap = useMemo(() => {
    const map = new Map();
    livrosDidaticos.forEach((livro) => {
      map.set(String(livro.id), livro);
    });
    return map;
  }, [livrosDidaticos]);

  const livrosSelecionadosDados = useMemo(() => {
    return livrosSelecionados
      .map((id) => livrosDidaticosMap.get(String(id)))
      .filter(Boolean);
  }, [livrosSelecionados, livrosDidaticosMap]);

  const emprestimosAtivos = useMemo(() => {
    return emprestimos.filter((emp) => isEmprestimoAtivo(emp.status));
  }, [emprestimos]);

  const emprestimoAtivoPorPar = useMemo(() => {
    const map = new Map();

    emprestimosAtivos.forEach((emp) => {
      const clienteId = emp.clienteId ?? emp.leitorId;
      const livroId = emp.livroId;
      if (clienteId === undefined || clienteId === null || livroId === undefined || livroId === null) {
        return;
      }

      const livroIdNormalizado = String(livroId);
      if (!livrosDidaticosMap.has(livroIdNormalizado)) {
        return;
      }

      const chave = `${clienteId}-${livroId}`;
      if (!map.has(chave)) {
        map.set(chave, emp);
      }
    });

    return map;
  }, [emprestimosAtivos, livrosDidaticosMap]);

  const alunosDisponiveisParaSelecao = useMemo(() => {
    const alunosAtivos = clientes
      .filter((cliente) => {
        if (!isAlunoLote(cliente)) return false;
        return cliente.ativo !== false;
      })
      .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));

    if (modoSelecaoAlunos === 'turma') {
      if (!turmaSelecionadaInfo) return [];
      return alunosAtivos.filter((aluno) => (
        isAlunoDaTurmaSelecionada(aluno, turmaSelecionadaInfo, turmasAcademicasMap)
      ));
    }

    if (!turmaSelecionadaInfo) {
      return alunosAtivos;
    }

    return alunosAtivos.filter((aluno) => (
      isAlunoDaTurmaSelecionada(aluno, turmaSelecionadaInfo, turmasAcademicasMap)
    ));
  }, [clientes, modoSelecaoAlunos, turmaSelecionadaInfo, turmasAcademicasMap]);

  const alunosFiltrados = alunosDisponiveisParaSelecao;

  const alunosSelecionados = useMemo(() => {
    return alunosDisponiveisParaSelecao.filter((aluno) => Boolean(alunosSelecionadosMapa[String(aluno.id)]));
  }, [alunosDisponiveisParaSelecao, alunosSelecionadosMapa]);

  const resumoSelecaoFiltro = useMemo(() => {
    const totalFiltrados = alunosFiltrados.length;
    let selecionadosFiltrados = 0;

    alunosFiltrados.forEach((aluno) => {
      if (Boolean(alunosSelecionadosMapa[String(aluno.id)])) {
        selecionadosFiltrados += 1;
      }
    });

    return {
      totalFiltrados,
      selecionadosFiltrados,
      todosFiltradosSelecionados: totalFiltrados > 0 && selecionadosFiltrados === totalFiltrados,
      parcialmenteSelecionados: selecionadosFiltrados > 0 && selecionadosFiltrados < totalFiltrados
    };
  }, [alunosFiltrados, alunosSelecionadosMapa]);

  useEffect(() => {
    const idsDisponiveis = new Set(alunosDisponiveisParaSelecao.map((aluno) => String(aluno.id)));

    setAlunosSelecionadosMapa((prev) => {
      const proximo = {};

      Object.entries(prev).forEach(([id, marcado]) => {
        if (marcado && idsDisponiveis.has(String(id))) {
          proximo[String(id)] = true;
        }
      });

      if (modoSelecaoAlunos === 'turma' && turmaSelecionada) {
        alunosDisponiveisParaSelecao.forEach((aluno) => {
          proximo[String(aluno.id)] = true;
        });
      }

      return proximo;
    });
  }, [alunosDisponiveisParaSelecao, modoSelecaoAlunos, turmaSelecionada]);

  const montarEstadoAtual = () => {
    const estado = {};

    alunosSelecionados.forEach((aluno) => {
      livrosSelecionadosDados.forEach((livro) => {
        const chave = `${aluno.id}-${livro.id}`;
        estado[chave] = emprestimoAtivoPorPar.has(chave);
      });
    });

    return estado;
  };

  useEffect(() => {
    if (livrosSelecionadosDados.length === 0 || alunosSelecionados.length === 0) {
      setSelecoes({});
      return;
    }

    setSelecoes(montarEstadoAtual());
  }, [livrosSelecionadosDados, alunosSelecionados, emprestimoAtivoPorPar]);

  const disponibilidadePorLivro = useMemo(() => {
    const ativosPorLivro = {};

    emprestimosAtivos.forEach((emp) => {
      const livroId = String(emp.livroId || '');
      ativosPorLivro[livroId] = (ativosPorLivro[livroId] || 0) + 1;
    });

    const disponibilidade = {};
    livrosSelecionadosDados.forEach((livro) => {
      const livroId = String(livro.id);
      const total = Number(livro.quantidade) || 0;
      const ativos = ativosPorLivro[livroId] || 0;
      disponibilidade[livroId] = {
        total,
        ativos,
        disponiveis: Math.max(total - ativos, 0)
      };
    });

    return disponibilidade;
  }, [emprestimosAtivos, livrosSelecionadosDados]);

  const atualizarSelecao = (alunoId, livroId, marcado) => {
    const chave = `${alunoId}-${livroId}`;
    setSelecoes((prev) => ({
      ...prev,
      [chave]: marcado
    }));
  };

  const atualizarSelecaoAluno = (alunoId, marcado) => {
    setAlunosSelecionadosMapa((prev) => ({
      ...prev,
      [String(alunoId)]: marcado
    }));
    setResultadoAplicacao(null);
  };

  const selecionarTodosAlunosVisiveis = (marcado) => {
    setAlunosSelecionadosMapa((prev) => {
      const proximo = { ...prev };
      alunosFiltrados.forEach((aluno) => {
        proximo[String(aluno.id)] = marcado;
      });
      return proximo;
    });
    setResultadoAplicacao(null);
  };

  const selecionarTurmaInteira = (marcado) => {
    setAlunosSelecionadosMapa((prev) => {
      const proximo = { ...prev };
      alunosDisponiveisParaSelecao.forEach((aluno) => {
        proximo[String(aluno.id)] = marcado;
      });
      return proximo;
    });
    setResultadoAplicacao(null);
  };

  const limparSelecaoAlunos = () => {
    setAlunosSelecionadosMapa({});
    setResultadoAplicacao(null);
  };

  const marcarTodosLivrosParaTodosAlunos = (marcado) => {
    setSelecoes((prev) => {
      const proximo = { ...prev };

      alunosSelecionados.forEach((aluno) => {
        livrosSelecionadosDados.forEach((livro) => {
          proximo[`${aluno.id}-${livro.id}`] = marcado;
        });
      });

      return proximo;
    });
  };

  const marcarLivroParaTodosAlunos = (livroId, marcado) => {
    setSelecoes((prev) => {
      const proximo = { ...prev };

      alunosSelecionados.forEach((aluno) => {
        proximo[`${aluno.id}-${livroId}`] = marcado;
      });

      return proximo;
    });
  };

  const getResumoMarcacaoLivro = (livroId) => {
    const total = alunosSelecionados.length;
    if (total === 0) return { todos: false, parcial: false };

    let marcados = 0;
    alunosSelecionados.forEach((aluno) => {
      if (selecoes[`${aluno.id}-${livroId}`]) {
        marcados += 1;
      }
    });

    return {
      todos: marcados === total,
      parcial: marcados > 0 && marcados < total
    };
  };

  const resumoPainel = useMemo(() => {
    const totalPares = alunosSelecionados.length * livrosSelecionadosDados.length;
    let marcados = 0;

    alunosSelecionados.forEach((aluno) => {
      livrosSelecionadosDados.forEach((livro) => {
        if (selecoes[`${aluno.id}-${livro.id}`]) {
          marcados += 1;
        }
      });
    });

    return {
      totalPares,
      marcados,
      desmarcados: Math.max(totalPares - marcados, 0)
    };
  }, [alunosSelecionados, livrosSelecionadosDados, selecoes]);

  const obterPlanoAlteracoes = () => {
    const criarSolicitacoes = [];
    const devolverSolicitacoes = [];

    alunosSelecionados.forEach((aluno) => {
      livrosSelecionadosDados.forEach((livro) => {
        const chave = `${aluno.id}-${livro.id}`;
        const desejaMarcado = Boolean(selecoes[chave]);
        const emprestimoAtivo = emprestimoAtivoPorPar.get(chave);
        const estaMarcadoNoSistema = Boolean(emprestimoAtivo);

        if (desejaMarcado && !estaMarcadoNoSistema) {
          criarSolicitacoes.push({ aluno, livro });
        }

        if (!desejaMarcado && estaMarcadoNoSistema) {
          devolverSolicitacoes.push(emprestimoAtivo);
        }
      });
    });

    return { criarSolicitacoes, devolverSolicitacoes };
  };

  const abrirConfirmacaoEmprestimo = () => {
    if (modoSelecaoAlunos === 'turma' && !turmaSelecionada) {
      alert('Selecione uma turma para continuar.');
      return;
    }

    if (alunosSelecionados.length === 0) {
      alert('Selecione pelo menos um aluno para receber os livros.');
      return;
    }

    if (livrosSelecionadosDados.length === 0) {
      alert('Selecione pelo menos um livro para o lote.');
      return;
    }

    if (!dataDevolucaoPrevista) {
      alert('Informe a data de devolução prevista.');
      return;
    }

    const { criarSolicitacoes, devolverSolicitacoes } = obterPlanoAlteracoes();

    if (criarSolicitacoes.length === 0 && devolverSolicitacoes.length === 0) {
      alert('Nenhuma alteração para aplicar.');
      return;
    }

    setResumoConfirmacao({
      alunos: alunosSelecionados.length,
      livros: livrosSelecionadosDados.length,
      criar: criarSolicitacoes.length,
      devolver: devolverSolicitacoes.length,
      dataDevolucaoPrevista,
      turma: turmaSelecionadaInfo?.rotulo || (modoSelecaoAlunos === 'individual' ? 'Múltiplas turmas' : 'Sem turma')
    });
    setConfirmacaoAberta(true);
  };

  const confirmarEmprestimo = async () => {
    setConfirmacaoAberta(false);
    await aplicarAlteracoes();
  };

  const aplicarAlteracoes = async () => {
    if (modoSelecaoAlunos === 'turma' && !turmaSelecionada) {
      alert('Selecione uma turma para continuar.');
      return;
    }

    if (alunosSelecionados.length === 0) {
      alert('Selecione pelo menos um aluno para receber os livros.');
      return;
    }

    if (livrosSelecionadosDados.length === 0) {
      alert('Selecione pelo menos um livro para o lote.');
      return;
    }

    if (!dataDevolucaoPrevista) {
      alert('Informe a data de devolução prevista.');
      return;
    }

    const { criarSolicitacoes, devolverSolicitacoes } = obterPlanoAlteracoes();

    if (criarSolicitacoes.length === 0 && devolverSolicitacoes.length === 0) {
      alert('Nenhuma alteração para aplicar.');
      return;
    }

    setProcessando(true);
    try {
      const devolucoesPorLivro = {};
      devolverSolicitacoes.forEach((emp) => {
        const livroId = String(emp.livroId);
        devolucoesPorLivro[livroId] = (devolucoesPorLivro[livroId] || 0) + 1;
      });

      const ativosAtuaisPorLivro = {};
      emprestimosAtivos.forEach((emp) => {
        const livroId = String(emp.livroId);
        if (livrosDidaticosMap.has(livroId)) {
          ativosAtuaisPorLivro[livroId] = (ativosAtuaisPorLivro[livroId] || 0) + 1;
        }
      });

      const criarPorLivro = {};
      criarSolicitacoes.forEach((item) => {
        const livroId = String(item.livro.id);
        if (!criarPorLivro[livroId]) {
          criarPorLivro[livroId] = [];
        }
        criarPorLivro[livroId].push(item);
      });

      const criacoesPermitidas = [];
      const criacoesBloqueadas = [];

      Object.entries(criarPorLivro).forEach(([livroId, solicitacoesLivro]) => {
        const livro = livrosDidaticosMap.get(livroId);
        const total = Number(livro?.quantidade) || 0;
        const ativos = ativosAtuaisPorLivro[livroId] || 0;
        const devolvendo = devolucoesPorLivro[livroId] || 0;
        const disponiveisAposDevolucao = Math.max(total - ativos + devolvendo, 0);

        solicitacoesLivro.forEach((solicitacao, index) => {
          if (index < disponiveisAposDevolucao) {
            criacoesPermitidas.push(solicitacao);
          } else {
            criacoesBloqueadas.push(solicitacao);
          }
        });
      });

      devolverSolicitacoes.forEach((emprestimo) => {
        devolverLivro(emprestimo.id);
      });

      criacoesPermitidas.forEach((solicitacao) => {
        const turmaChaveAluno = obterChaveTurmaAluno(solicitacao.aluno, turmasAcademicasMap);
        const turmaRelacao = turmaChaveAluno && turmasAcademicasMap.has(String(turmaChaveAluno))
          ? turmasAcademicasMap.get(String(turmaChaveAluno))
          : null;
        const turmaTexto = obterRotuloTurmaAluno(solicitacao.aluno, turmasAcademicasMap)
          || turmaSelecionadaInfo?.rotulo
          || turmaSelecionada;

        adicionarEmprestimo({
          clienteId: solicitacao.aluno.id,
          livroId: solicitacao.livro.id,
          clienteNome: solicitacao.aluno.nome,
          livroTitulo: solicitacao.livro.titulo,
          turmaId: turmaRelacao?.id || solicitacao.aluno.turmaId || null,
          turmaNome: turmaRelacao?.nomeTurma || solicitacao.aluno.turma || solicitacao.aluno.nomeTurma || '',
          serieNome: turmaRelacao?.nomeSerie || solicitacao.aluno.serie || solicitacao.aluno.nomeSerie || '',
          origemLoteDidatico: true,
          modoSelecaoLote: modoSelecaoAlunos,
          status: 'ativo',
          dataEmprestimo: new Date().toISOString(),
          dataDevolucaoPrevista,
          dataDevolucao: dataDevolucaoPrevista,
          observacoes: `${observacaoPadraoAplicada} | Turma: ${turmaTexto}`
        });
      });

      if (criacoesBloqueadas.length > 0) {
        setSelecoes((prev) => {
          const proximo = { ...prev };
          criacoesBloqueadas.forEach((solicitacao) => {
            proximo[`${solicitacao.aluno.id}-${solicitacao.livro.id}`] = false;
          });
          return proximo;
        });
      }

      const detalhesBloqueio = criacoesBloqueadas.slice(0, 12).map((item) => (
        `${item.aluno.nome} -> ${item.livro.titulo}`
      ));

      setResultadoAplicacao({
        devolvidos: devolverSolicitacoes.length,
        criados: criacoesPermitidas.length,
        bloqueados: criacoesBloqueadas.length,
        detalhesBloqueio,
        excessoBloqueio: Math.max(criacoesBloqueadas.length - detalhesBloqueio.length, 0)
      });
    } finally {
      setProcessando(false);
    }
  };

  const semDadosParaMatriz = livrosSelecionadosDados.length === 0 || alunosSelecionados.length === 0;

  return (
    <Layout title="Empréstimos em Lote">
      {livrosDidaticos.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Nenhum livro compatível com o filtro selecionado foi encontrado. Cadastre livros do tipo <strong>Didático</strong> ou <strong>Paradidático</strong> para usar esta funcionalidade.
        </Alert>
      )}
      {turmasDisponiveis.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhuma turma cadastrada. Acesse <strong>Séries/Turmas</strong> e cadastre as turmas da escola.
        </Alert>
      )}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={campoPadraoSx}>
                <InputLabel>Modo de seleção</InputLabel>
                <Select
                  value={modoSelecaoAlunos}
                  label="Modo de seleção"
                  onChange={(e) => {
                    setModoSelecaoAlunos(e.target.value);
                    setAlunosSelecionadosMapa({});
                    setResultadoAplicacao(null);
                  }}
                >
                  <MenuItem value="turma">Por série/turma (lote)</MenuItem>
                  <MenuItem value="individual">Por aluno(s) individualmente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={campoPadraoSx}>
                <InputLabel>{modoSelecaoAlunos === 'turma' ? 'Série/Turma' : 'Filtrar série/turma (opcional)'}</InputLabel>
                <Select
                  value={turmaSelecionada}
                  label={modoSelecaoAlunos === 'turma' ? 'Série/Turma' : 'Filtrar série/turma (opcional)'}
                  onChange={(e) => {
                    setTurmaSelecionada(e.target.value);
                    setAlunosSelecionadosMapa({});
                    setResultadoAplicacao(null);
                  }}
                >
                  <MenuItem value="">
                    {modoSelecaoAlunos === 'turma' ? 'Selecione uma turma' : 'Todas as turmas'}
                  </MenuItem>
                  {turmasDisponiveis.map((turma) => (
                    <MenuItem key={turma.key} value={turma.key}>{turma.rotulo}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={campoPadraoSx}>
                <InputLabel>Tipo do Acervo</InputLabel>
                <Select
                  value={tipoAcervoSelecionado}
                  label="Tipo do Acervo"
                  onChange={(e) => {
                    setTipoAcervoSelecionado(e.target.value);
                    setLivrosSelecionados([]);
                    setResultadoAplicacao(null);
                  }}
                >
                  <MenuItem value="todos">Didáticos e paradidáticos</MenuItem>
                  <MenuItem value="didatico">Somente didáticos</MenuItem>
                  <MenuItem value="paradidatico">Somente paradidáticos</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Devolução Prevista"
                value={dataDevolucaoPrevista}
                onChange={(e) => setDataDevolucaoPrevista(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={campoPadraoSx}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <FormControl fullWidth sx={campoPadraoSx}>
                <InputLabel>Livros do Lote</InputLabel>
                <Select
                  multiple
                  value={livrosSelecionados}
                  label="Livros do Lote"
                  onChange={(e) => {
                    const value = e.target.value;
                    setLivrosSelecionados(typeof value === 'string' ? value.split(',') : value);
                    setResultadoAplicacao(null);
                  }}
                  renderValue={(selected) => `${selected.length} livro(s) selecionado(s)`}
                >
                  {livrosDidaticos.map((livro) => (
                    <MenuItem key={livro.id} value={String(livro.id)}>
                      <Checkbox checked={livrosSelecionados.includes(String(livro.id))} />
                      <ListItemText
                        primary={livro.titulo}
                        secondary={`${livro.tipo || 'Paradidático'} | Qtd: ${Number(livro.quantidade) || 0}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Destinatários do lote (checkbox)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              {modoSelecaoAlunos === 'turma'
                ? 'Selecione a turma e marque alunos específicos ou a turma inteira para receber os livros.'
                : 'Busque e marque alunos individualmente. Você pode filtrar por turma quando necessário.'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => selecionarTodosAlunosVisiveis(true)}
                disabled={alunosFiltrados.length === 0 || processando}
              >
                Selecionar todos
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={() => selecionarTodosAlunosVisiveis(false)}
                disabled={alunosFiltrados.length === 0 || processando}
              >
                Desmarcar todos
              </Button>
              {modoSelecaoAlunos === 'turma' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => selecionarTurmaInteira(true)}
                  disabled={alunosDisponiveisParaSelecao.length === 0 || processando}
                >
                  Selecionar todos da turma
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={limparSelecaoAlunos}
                disabled={alunosSelecionados.length === 0 || processando}
              >
                Limpar seleção de alunos
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 260 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ width: 92 }}>
                      <Checkbox
                        checked={resumoSelecaoFiltro.todosFiltradosSelecionados}
                        indeterminate={resumoSelecaoFiltro.parcialmenteSelecionados}
                        onChange={(e) => selecionarTodosAlunosVisiveis(e.target.checked)}
                        disabled={alunosFiltrados.length === 0 || processando}
                        inputProps={{ 'aria-label': 'Selecionar todos os alunos visíveis' }}
                      />
                    </TableCell>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Matrícula</TableCell>
                    <TableCell>Turma</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alunosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {modoSelecaoAlunos === 'turma' && turmaSelecionada
                            ? 'Nenhum aluno leitor associado à turma selecionada. Verifique os vínculos em Leitores (série/turma).'
                            : 'Nenhum aluno encontrado para os filtros atuais.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    alunosFiltrados.map((aluno) => (
                      <TableRow key={aluno.id} hover>
                        <TableCell align="center">
                          <Checkbox
                            checked={Boolean(alunosSelecionadosMapa[String(aluno.id)])}
                            onChange={(e) => atualizarSelecaoAluno(aluno.id, e.target.checked)}
                            disabled={processando}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{aluno.nome}</Typography>
                        </TableCell>
                        <TableCell>{aluno.matricula || '-'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={obterRotuloTurmaAluno(aluno, turmasAcademicasMap)} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<AssignmentTurnedIn />}
              onClick={() => marcarTodosLivrosParaTodosAlunos(true)}
              disabled={semDadosParaMatriz || processando}
              sx={botaoAcaoSx}
            >
              Marcar todos
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Undo />}
              onClick={() => marcarTodosLivrosParaTodosAlunos(false)}
              disabled={semDadosParaMatriz || processando}
              sx={botaoAcaoSx}
            >
              Desmarcar todos
            </Button>
            <Button
              variant="contained"
              startIcon={processando ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={abrirConfirmacaoEmprestimo}
              disabled={processando}
              sx={botaoAcaoSx}
            >
              Confirmar empréstimo
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={cartaoResumoSx}>
            <Typography variant="caption" color="text.secondary">Alunos selecionados</Typography>
            <Typography variant="h6">
              <Groups sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {alunosSelecionados.length} / {alunosDisponiveisParaSelecao.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={cartaoResumoSx}>
            <Typography variant="caption" color="text.secondary">Pares marcados</Typography>
            <Typography variant="h6"><AssignmentTurnedIn sx={{ mr: 0.5, verticalAlign: 'middle' }} />{resumoPainel.marcados}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={cartaoResumoSx}>
            <Typography variant="caption" color="text.secondary">Pares desmarcados</Typography>
            <Typography variant="h6"><LibraryBooks sx={{ mr: 0.5, verticalAlign: 'middle' }} />{resumoPainel.desmarcados}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={confirmacaoAberta}
        onClose={() => {
          if (!processando) {
            setConfirmacaoAberta(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Confirmar empréstimo em lote</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Revise os dados antes de efetivar o lote de empréstimos.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={cartaoResumoSx}>
                <Typography variant="caption" color="text.secondary">Alunos</Typography>
                <Typography variant="h6">{resumoConfirmacao?.alunos || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={cartaoResumoSx}>
                <Typography variant="caption" color="text.secondary">Livros</Typography>
                <Typography variant="h6">{resumoConfirmacao?.livros || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={cartaoResumoSx}>
                <Typography variant="caption" color="text.secondary">Novos empréstimos</Typography>
                <Typography variant="h6">{resumoConfirmacao?.criar || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={cartaoResumoSx}>
                <Typography variant="caption" color="text.secondary">Devoluções</Typography>
                <Typography variant="h6">{resumoConfirmacao?.devolver || 0}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2"><strong>Turma/filtro:</strong> {resumoConfirmacao?.turma || '-'}</Typography>
            <Typography variant="body2"><strong>Devolução prevista:</strong> {resumoConfirmacao?.dataDevolucaoPrevista || '-'}</Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            Ao confirmar, o sistema cria os novos empréstimos marcados e processa as devoluções dos itens desmarcados.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmacaoAberta(false)} disabled={processando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmarEmprestimo}
            disabled={processando}
            startIcon={processando ? <CircularProgress size={18} color="inherit" /> : <Save />}
          >
            Aplicar agora
          </Button>
        </DialogActions>
      </Dialog>

      {resultadoAplicacao && (
        <Alert
          severity={resultadoAplicacao.bloqueados > 0 ? 'warning' : 'success'}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" sx={{ mb: resultadoAplicacao.bloqueados > 0 ? 1 : 0 }}>
            Resultado: {resultadoAplicacao.criados} empréstimo(s) criado(s), {resultadoAplicacao.devolvidos} devolução(ões) processada(s)
            {resultadoAplicacao.bloqueados > 0 ? `, ${resultadoAplicacao.bloqueados} bloqueado(s) por falta de estoque.` : '.'}
          </Typography>
          {resultadoAplicacao.bloqueados > 0 && (
            <Box>
              {resultadoAplicacao.detalhesBloqueio.map((detalhe) => (
                <Typography key={detalhe} variant="caption" display="block">• {detalhe}</Typography>
              ))}
              {resultadoAplicacao.excessoBloqueio > 0 && (
                <Typography variant="caption" display="block">
                  • ... e mais {resultadoAplicacao.excessoBloqueio} bloqueio(s)
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      )}

      {semDadosParaMatriz ? (
        <Alert severity="info">
          Selecione ao menos um aluno e um livro para exibir a matriz de marcação.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 220 }}>Aluno</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Matrícula</TableCell>
                {livrosSelecionadosDados.map((livro) => {
                  const disp = disponibilidadePorLivro[String(livro.id)] || { total: 0, ativos: 0, disponiveis: 0 };
                  const estadoMarcacao = getResumoMarcacaoLivro(livro.id);

                  return (
                    <TableCell key={livro.id} align="center" sx={{ minWidth: 220 }}>
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {livro.titulo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Disp.: {disp.disponiveis} / {disp.total}
                      </Typography>
                      <Checkbox
                        size="small"
                        indeterminate={estadoMarcacao.parcial}
                        checked={estadoMarcacao.todos}
                        onChange={(e) => marcarLivroParaTodosAlunos(livro.id, e.target.checked)}
                        disabled={processando}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {alunosSelecionados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2 + livrosSelecionadosDados.length} align="center">
                    <Typography color="text.secondary">Nenhum aluno selecionado para o lote.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                alunosSelecionados.map((aluno) => (
                  <TableRow key={aluno.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{aluno.nome}</Typography>
                      <Chip
                        size="small"
                        label={obterRotuloTurmaAluno(aluno, turmasAcademicasMap)}
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>{aluno.matricula || '-'}</TableCell>
                    {livrosSelecionadosDados.map((livro) => {
                      const chave = `${aluno.id}-${livro.id}`;
                      const checked = Boolean(selecoes[chave]);

                      return (
                        <TableCell key={chave} align="center">
                          <Checkbox
                            checked={checked}
                            onChange={(e) => atualizarSelecao(aluno.id, livro.id, e.target.checked)}
                            disabled={processando}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Dica: marcar checkbox gera empréstimo ativo; desmarcar checkbox processa devolução em lote.
        </Typography>
      </Box>
    </Layout>
  );
}
