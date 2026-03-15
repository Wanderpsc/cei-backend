import React, { useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { 
  Print, 
  Download, 
  PictureAsPdf, 
  TableChart,
  Settings,
  Image as ImageIcon
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { imprimirEscopo } from '../utils/printUtils';

const normalizarTexto = (valor) => {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

const isAlunoRelatorio = (cliente) => {
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

const obterChaveTurmaEmprestimo = (emprestimo) => {
  const turmaId = String(emprestimo?.turmaId || '').trim();
  if (turmaId) {
    return turmaId;
  }

  const turmaNome = String(emprestimo?.turmaNome || '').trim();
  if (!turmaNome) {
    return '';
  }

  return `legacy:${turmaNome}`;
};

const obterInfoTurmaAluno = (aluno, turmasAcademicasMap) => {
  const turmaId = String(aluno?.turmaId || '');

  if (turmaId && turmasAcademicasMap.has(turmaId)) {
    const turma = turmasAcademicasMap.get(turmaId);
    const nomeTurma = String(turma?.nomeTurma || '').trim() || 'N/A';
    const nomeSerie = String(turma?.nomeSerie || '').trim() || 'N/A';

    return {
      key: turmaId,
      nomeTurma,
      nomeSerie,
      label: nomeSerie !== 'N/A' ? `${nomeSerie} - ${nomeTurma}` : nomeTurma
    };
  }

  const nomeTurmaLegacy = String(aluno?.turma || '').trim();
  if (!nomeTurmaLegacy) {
    return {
      key: '',
      nomeTurma: '',
      nomeSerie: '',
      label: ''
    };
  }

  const nomeSerieLegacy = String(aluno?.serie || '').trim();

  return {
    key: `legacy:${nomeTurmaLegacy}`,
    nomeTurma: nomeTurmaLegacy,
    nomeSerie: nomeSerieLegacy || 'N/A',
    label: nomeSerieLegacy ? `${nomeSerieLegacy} - ${nomeTurmaLegacy}` : nomeTurmaLegacy
  };
};

function RelatoriosPage() {
  const { 
    livros, 
    patrimonio, 
    clientes, 
    emprestimos, 
    instituicoes,
    turmasAcademicas,
    usuarioLogado,
    instituicaoAtiva,
    atualizarInstituicao
  } = useData();

  const [tipoRelatorio, setTipoRelatorio] = useState('livros-cadastrados');
  const [dialogConfig, setDialogConfig] = useState(false);
  const [configCabecalho, setConfigCabecalho] = useState({
    titulo: '',
    subtitulo: '',
    logoUrl: ''
  });
  const logoInputRef = useRef(null);

  // Carregar configuração salva da instituição
  React.useEffect(() => {
    const instituicao = instituicoes.find(i => i.id === instituicaoAtiva);
    if (instituicao?.configRelatorios) {
      setConfigCabecalho(instituicao.configRelatorios);
    } else if (instituicao) {
      setConfigCabecalho({
        titulo: instituicao.nomeInstituicao || '',
        subtitulo: `${instituicao.cidade || ''}, ${instituicao.estado || ''}`,
        logoUrl: instituicao.logoUrl || ''
      });
    }
  }, [instituicaoAtiva, instituicoes]);

  const isEmprestimoAtivo = (status) => {
    const statusNormalizado = String(status || '').toLowerCase();
    return statusNormalizado === 'ativo' || statusNormalizado === 'emprestado';
  };

  const livrosDidaticosAtivos = useMemo(() => {
    return livros.filter((livro) => livro.tipo === 'Didático' && !livro.baixa);
  }, [livros]);

  const livroDidaticoMap = useMemo(() => {
    const map = new Map();
    livrosDidaticosAtivos.forEach((livro) => map.set(String(livro.id), livro));
    return map;
  }, [livrosDidaticosAtivos]);

  const turmasAcademicasMap = useMemo(() => {
    const map = new Map();
    turmasAcademicas.forEach((turma) => {
      map.set(String(turma.id), turma);
    });
    return map;
  }, [turmasAcademicas]);

  const alunosComTurma = useMemo(() => {
    return clientes
      .filter((cliente) => isAlunoRelatorio(cliente))
      .filter((cliente) => {
        const infoTurma = obterInfoTurmaAluno(cliente, turmasAcademicasMap);
        return infoTurma.key.length > 0;
      });
  }, [clientes, turmasAcademicasMap]);

  const getClienteByEmprestimo = (emprestimo) => {
    const clienteId = String(emprestimo?.clienteId ?? emprestimo?.leitorId ?? '').trim();
    if (!clienteId) {
      return null;
    }

    return clientes.find((cliente) => String(cliente.id) === clienteId) || null;
  };

  const getNomeClienteEmprestimo = (emprestimo, clienteAtual = null) => {
    const cliente = clienteAtual || getClienteByEmprestimo(emprestimo);
    return (
      cliente?.nome
      || emprestimo?.clienteNome
      || emprestimo?.leitorNome
      || emprestimo?.dadosTermoEmprestimo?.leitorNome
      || 'Leitor removido'
    );
  };

  const getTelefoneClienteEmprestimo = (emprestimo, clienteAtual = null) => {
    const cliente = clienteAtual || getClienteByEmprestimo(emprestimo);
    return cliente?.telefone || emprestimo?.dadosTermoEmprestimo?.leitorTelefone || 'N/A';
  };

  const getTurmaClienteEmprestimo = (emprestimo, clienteAtual = null) => {
    const cliente = clienteAtual || getClienteByEmprestimo(emprestimo);

    if (cliente) {
      const infoTurma = obterInfoTurmaAluno(cliente, turmasAcademicasMap);
      if (infoTurma.label) {
        return infoTurma.label;
      }
    }

    const serieHistorica = String(
      emprestimo?.dadosTermoEmprestimo?.leitorSerie || emprestimo?.serieNome || ''
    ).trim();
    const turmaHistorica = String(
      emprestimo?.dadosTermoEmprestimo?.leitorTurma || emprestimo?.turmaNome || ''
    ).trim();
    const partes = [serieHistorica, turmaHistorica].filter((valor) => valor && valor !== 'N/A');

    return partes.join(' - ') || 'N/A';
  };

  // Funções de geração de relatórios
  const getRelatorioLivrosCadastrados = () => {
    return {
      titulo: 'Livros Cadastrados',
      colunas: ['Título', 'Autor', 'ISBN', 'Categoria', 'Quantidade', 'Localização'],
      dados: livros.map(l => ({
        titulo: l.titulo,
        autor: l.autor,
        isbn: l.isbn || 'N/A',
        categoria: l.categoria || 'Sem categoria',
        quantidade: l.quantidade,
        localizacao: l.localizacao || 'N/A'
      })),
      resumo: {
        total: livros.length,
        totalExemplares: livros.reduce((sum, l) => sum + (l.quantidade || 0), 0)
      }
    };
  };

  const getRelatorioLivrosEmprestados = () => {
    const emprestimosPorLivro = emprestimos
      .filter(e => e.status === 'ativo')
      .reduce((acc, emp) => {
        const livro = livros.find(l => l.id === emp.livroId);
        const cliente = getClienteByEmprestimo(emp);
        
        if (livro) {
          acc.push({
            titulo: livro.titulo,
            autor: livro.autor,
            cliente: getNomeClienteEmprestimo(emp, cliente),
            dataEmprestimo: new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR'),
            dataDevolucao: new Date(emp.dataDevolucao).toLocaleDateString('pt-BR'),
            diasRestantes: Math.ceil((new Date(emp.dataDevolucao) - new Date()) / (1000 * 60 * 60 * 24))
          });
        }
        return acc;
      }, []);

    return {
      titulo: 'Livros Emprestados (Ativos)',
      colunas: ['Livro', 'Autor', 'Cliente', 'Data Empréstimo', 'Prazo Devolução', 'Dias Restantes'],
      dados: emprestimosPorLivro,
      resumo: {
        total: emprestimosPorLivro.length
      }
    };
  };

  const getRelatorioPessoasCadastradas = () => {
    return {
      titulo: 'Pessoas Cadastradas',
      colunas: ['Nome', 'Tipo', 'CPF', 'Email', 'Telefone', 'Status'],
      dados: clientes.map(c => ({
        nome: c.nome,
        tipo: c.tipo || 'N/A',
        cpf: c.cpf || 'N/A',
        email: c.email || 'N/A',
        telefone: c.telefone || 'N/A',
        status: c.ativo ? 'Ativo' : 'Inativo'
      })),
      resumo: {
        total: clientes.length,
        ativos: clientes.filter(c => c.ativo).length,
        inativos: clientes.filter(c => !c.ativo).length
      }
    };
  };

  const getRelatorioPessoasComEmprestimos = () => {
    const clientesComEmprestimos = clientes
      .filter(c => emprestimos.some(e => e.clienteId === c.id && e.status === 'ativo'))
      .map(c => {
        const emprestimosDaPessoa = emprestimos.filter(e => e.clienteId === c.id && e.status === 'ativo');
        const livrosEmprestados = emprestimosDaPessoa.map(e => {
          const livro = livros.find(l => l.id === e.livroId);
          return livro?.titulo || 'Livro não encontrado';
        }).join(', ');

        return {
          nome: c.nome,
          tipo: c.tipo || 'N/A',
          telefone: c.telefone || 'N/A',
          quantidadeLivros: emprestimosDaPessoa.length,
          livros: livrosEmprestados
        };
      });

    return {
      titulo: 'Pessoas com Livros Emprestados',
      colunas: ['Nome', 'Tipo', 'Telefone', 'Qtd Livros', 'Títulos Emprestados'],
      dados: clientesComEmprestimos,
      resumo: {
        total: clientesComEmprestimos.length
      }
    };
  };

  const getRelatorioDevolucoesPendentes = () => {
    const hoje = new Date();
    const devolucoesPendentes = emprestimos
      .filter(e => e.status === 'ativo')
      .map(e => {
        const cliente = getClienteByEmprestimo(e);
        const livro = livros.find(l => l.id === e.livroId);
        const dataDevolucao = new Date(e.dataDevolucao);
        const diasAtraso = Math.floor((hoje - dataDevolucao) / (1000 * 60 * 60 * 24));
        const situacao = diasAtraso > 0 ? 'Atrasado' : 'No Prazo';

        return {
          cliente: getNomeClienteEmprestimo(e, cliente),
          livro: livro?.titulo || 'N/A',
          telefone: getTelefoneClienteEmprestimo(e, cliente),
          dataEmprestimo: new Date(e.dataEmprestimo).toLocaleDateString('pt-BR'),
          dataDevolucao: dataDevolucao.toLocaleDateString('pt-BR'),
          diasAtraso: diasAtraso > 0 ? diasAtraso : 0,
          situacao
        };
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);

    return {
      titulo: 'Devoluções Pendentes',
      colunas: ['Cliente', 'Livro', 'Telefone', 'Data Empréstimo', 'Prazo', 'Dias Atraso', 'Situação'],
      dados: devolucoesPendentes,
      resumo: {
        total: devolucoesPendentes.length,
        atrasados: devolucoesPendentes.filter(d => d.situacao === 'Atrasado').length,
        noPrazo: devolucoesPendentes.filter(d => d.situacao === 'No Prazo').length
      }
    };
  };

  const getRelatorioRankingLeitores = () => {
    const rankingMap = new Map();

    emprestimos.forEach((emprestimo) => {
      const clienteId = String(emprestimo?.clienteId ?? emprestimo?.leitorId ?? '').trim();
      if (!clienteId) {
        return;
      }

      const cliente = getClienteByEmprestimo(emprestimo);
      const nome = getNomeClienteEmprestimo(emprestimo, cliente);
      const telefone = getTelefoneClienteEmprestimo(emprestimo, cliente);
      const turma = getTurmaClienteEmprestimo(emprestimo, cliente);
      const existente = rankingMap.get(clienteId) || {
        posicao: 0,
        nome,
        tipo: cliente?.tipo || 'Leitor',
        turma,
        totalLivrosEmprestados: 0,
        livrosAtivos: 0,
        livrosDevolvidos: 0,
        telefone
      };

      existente.totalLivrosEmprestados += 1;

      if (isEmprestimoAtivo(emprestimo.status)) {
        existente.livrosAtivos += 1;
      } else {
        existente.livrosDevolvidos += 1;
      }

      if ((!existente.nome || existente.nome === 'Leitor removido') && nome) {
        existente.nome = nome;
      }
      if ((!existente.telefone || existente.telefone === 'N/A') && telefone) {
        existente.telefone = telefone;
      }
      if ((!existente.turma || existente.turma === 'N/A') && turma) {
        existente.turma = turma;
      }
      if (cliente?.tipo && existente.tipo === 'Leitor') {
        existente.tipo = cliente.tipo;
      }

      rankingMap.set(clienteId, existente);
    });

    const rankingPorEmprestimos = Array.from(rankingMap.values())
      .filter((r) => r.totalLivrosEmprestados > 0)
      .sort((a, b) => b.totalLivrosEmprestados - a.totalLivrosEmprestados)
      .map((r, index) => ({ ...r, posicao: index + 1 }));

    return {
      titulo: 'Ranking de Leitores',
      colunas: ['Posição', 'Nome', 'Tipo', 'Turma', 'Total Emprestados', 'Ativos', 'Devolvidos', 'Telefone'],
      dados: rankingPorEmprestimos,
      resumo: {
        totalLeitores: rankingPorEmprestimos.length,
        totalEmprestimos: rankingPorEmprestimos.reduce((sum, r) => sum + r.totalLivrosEmprestados, 0),
        mediaEmprestimosPorLeitor: rankingPorEmprestimos.length > 0 
          ? (rankingPorEmprestimos.reduce((sum, r) => sum + r.totalLivrosEmprestados, 0) / rankingPorEmprestimos.length).toFixed(1)
          : 0
      }
    };
  };

  const getRelatorioDidaticosPorTurma = () => {
    const gruposTurma = new Map();

    alunosComTurma.forEach((aluno) => {
      const infoTurma = obterInfoTurmaAluno(aluno, turmasAcademicasMap);
      if (!infoTurma.key) return;

      if (!gruposTurma.has(infoTurma.key)) {
        gruposTurma.set(infoTurma.key, {
          key: infoTurma.key,
          serie: infoTurma.nomeSerie || 'N/A',
          turma: infoTurma.nomeTurma || 'N/A',
          alunos: []
        });
      }

      gruposTurma.get(infoTurma.key).alunos.push(aluno);
    });

    const dados = Array.from(gruposTurma.values())
      .sort((a, b) => {
        const serieCompare = String(a.serie).localeCompare(String(b.serie), 'pt-BR');
        if (serieCompare !== 0) return serieCompare;
        return String(a.turma).localeCompare(String(b.turma), 'pt-BR');
      })
      .map((grupo) => {
      const alunosDaTurma = grupo.alunos;
      const alunoIds = new Set(alunosDaTurma.map((aluno) => String(aluno.id)));

      const emprestimosDidaticosAtivos = emprestimos.filter((emp) => {
        const clienteId = emp.clienteId ?? emp.leitorId;
        const livroId = String(emp.livroId || '');
        const chaveTurmaEmprestimo = obterChaveTurmaEmprestimo(emp);
        const pertencePelaTurmaEmprestimo = chaveTurmaEmprestimo && chaveTurmaEmprestimo === String(grupo.key || '');
        return (
          (
            (clienteId !== undefined && clienteId !== null && alunoIds.has(String(clienteId)))
            || pertencePelaTurmaEmprestimo
          ) &&
          isEmprestimoAtivo(emp.status) &&
          livroDidaticoMap.has(livroId)
        );
      });

      const titulosDistintosEntregues = new Set(
        emprestimosDidaticosAtivos.map((emp) => String(emp.livroId || ''))
      ).size;

      const totalAlunos = alunosDaTurma.length;
      const totalTitulosDidaticos = livrosDidaticosAtivos.length;
      const coberturaEsperada = totalAlunos * totalTitulosDidaticos;
      const coberturaAtual = emprestimosDidaticosAtivos.length;
      const pendencias = Math.max(coberturaEsperada - coberturaAtual, 0);
      const percentualCobertura = coberturaEsperada > 0
        ? `${((coberturaAtual / coberturaEsperada) * 100).toFixed(1)}%`
        : '0%';

      return {
        serie: grupo.serie,
        turma: grupo.turma,
        alunos: totalAlunos,
        titulosDidaticos: totalTitulosDidaticos,
        titulosEntregues: titulosDistintosEntregues,
        emprestimosAtivos: coberturaAtual,
        pendencias,
        cobertura: percentualCobertura
      };
    });

    return {
      titulo: 'Didáticos por Turma',
      colunas: ['Série', 'Turma', 'Alunos', 'Títulos Didáticos', 'Títulos Entregues', 'Empréstimos Ativos', 'Pendências', 'Cobertura'],
      dados,
      resumo: {
        turmas: dados.length,
        alunos: dados.reduce((sum, item) => sum + item.alunos, 0),
        emprestimosAtivos: dados.reduce((sum, item) => sum + item.emprestimosAtivos, 0),
        pendencias: dados.reduce((sum, item) => sum + item.pendencias, 0)
      }
    };
  };

  const getRelatorioPendenciasDidaticasPorAluno = () => {
    const didaticos = livrosDidaticosAtivos;

    const dados = alunosComTurma
      .map((aluno) => {
        const emprestimosAtivosAluno = emprestimos.filter((emp) => {
          const clienteId = emp.clienteId ?? emp.leitorId;
          return (
            clienteId !== undefined &&
            clienteId !== null &&
            String(clienteId) === String(aluno.id) &&
            isEmprestimoAtivo(emp.status) &&
            livroDidaticoMap.has(String(emp.livroId || ''))
          );
        });

        const livrosAtivosIds = new Set(
          emprestimosAtivosAluno.map((emp) => String(emp.livroId || ''))
        );

        const titulosPendentes = didaticos
          .filter((livro) => !livrosAtivosIds.has(String(livro.id)))
          .map((livro) => livro.titulo);

        const infoTurma = obterInfoTurmaAluno(aluno, turmasAcademicasMap);

        return {
          nome: aluno.nome,
          serie: infoTurma.nomeSerie || 'N/A',
          turma: infoTurma.nomeTurma || 'N/A',
          matricula: aluno.matricula || 'N/A',
          totalDidaticos: didaticos.length,
          comEmprestimo: livrosAtivosIds.size,
          pendentes: titulosPendentes.length,
          titulosPendentes: titulosPendentes.join(', ') || 'Nenhum'
        };
      })
      .filter((item) => item.pendentes > 0)
      .sort((a, b) => {
        const serieCompare = String(a.serie).localeCompare(String(b.serie), 'pt-BR');
        if (serieCompare !== 0) return serieCompare;
        const turmaCompare = String(a.turma).localeCompare(String(b.turma), 'pt-BR');
        if (turmaCompare !== 0) return turmaCompare;
        return String(a.nome).localeCompare(String(b.nome), 'pt-BR');
      });

    return {
      titulo: 'Pendências Didáticas por Aluno',
      colunas: ['Aluno', 'Série', 'Turma', 'Matrícula', 'Total Didáticos', 'Com Empréstimo', 'Pendências', 'Títulos Pendentes'],
      dados,
      resumo: {
        alunosComPendencia: dados.length,
        pendenciasTotais: dados.reduce((sum, item) => sum + item.pendentes, 0)
      }
    };
  };

  const getRelatorioEscolasCadastradas = () => {
    if (usuarioLogado?.perfil !== 'SuperAdmin') return null;

    return {
      titulo: 'Escolas Cadastradas',
      colunas: ['Nome', 'CNPJ', 'Cidade/Estado', 'Status', 'Licença', 'Data Cadastro'],
      dados: instituicoes.map(i => ({
        nome: i.nomeInstituicao,
        cnpj: i.cnpj,
        localizacao: `${i.cidade}/${i.estado}`,
        status: i.status === 'ativo' ? 'Ativo' : i.status === 'bloqueado' ? 'Bloqueado' : 'Pendente',
        licenca: i.licenca,
        dataCadastro: new Date(i.dataCadastro).toLocaleDateString('pt-BR')
      })),
      resumo: {
        total: instituicoes.length,
        ativas: instituicoes.filter(i => i.status === 'ativo').length,
        bloqueadas: instituicoes.filter(i => i.status === 'bloqueado').length,
        pendentes: instituicoes.filter(i => i.status === 'pendente').length
      }
    };
  };

  const getRelatorioEscolasInadimplentes = () => {
    if (usuarioLogado?.perfil !== 'SuperAdmin') return null;

    const inadimplentes = instituicoes.filter(i => 
      i.status !== 'pendente' && 
      (i.statusFinanceiro === 'atrasado' || i.statusFinanceiro === 'bloqueado_financeiro')
    ).map(i => ({
      nome: i.nomeInstituicao,
      responsavel: i.nomeResponsavel,
      telefone: i.telefoneContato,
      email: i.emailContato,
      valorMensal: `R$ ${(i.valorMensal || 97).toFixed(2)}`,
      ultimoPagamento: i.ultimoPagamento 
        ? new Date(i.ultimoPagamento).toLocaleDateString('pt-BR')
        : 'Nenhum',
      situacao: i.statusFinanceiro === 'bloqueado_financeiro' ? 'Bloqueado' : 'Atrasado'
    }));

    return {
      titulo: 'Escolas Inadimplentes',
      colunas: ['Nome', 'Responsável', 'Telefone', 'Email', 'Valor Mensal', 'Último Pagamento', 'Situação'],
      dados: inadimplentes,
      resumo: {
        total: inadimplentes.length,
        bloqueadas: inadimplentes.filter(i => i.situacao === 'Bloqueado').length
      }
    };
  };

  const getRelatorioEscolasAdimplentes = () => {
    if (usuarioLogado?.perfil !== 'SuperAdmin') return null;

    const adimplentes = instituicoes.filter(i => 
      i.status === 'ativo' && 
      i.statusFinanceiro === 'em_dia'
    ).map(i => ({
      nome: i.nomeInstituicao,
      responsavel: i.nomeResponsavel,
      telefone: i.telefoneContato,
      valorMensal: `R$ ${(i.valorMensal || 97).toFixed(2)}`,
      ultimoPagamento: i.ultimoPagamento 
        ? new Date(i.ultimoPagamento).toLocaleDateString('pt-BR')
        : 'N/A',
      dataExpiracao: i.dataExpiracao 
        ? new Date(i.dataExpiracao).toLocaleDateString('pt-BR')
        : 'N/A'
    }));

    return {
      titulo: 'Escolas Adimplentes',
      colunas: ['Nome', 'Responsável', 'Telefone', 'Valor Mensal', 'Último Pagamento', 'Licença Válida Até'],
      dados: adimplentes,
      resumo: {
        total: adimplentes.length,
        receitaMensal: adimplentes.reduce((sum, i) => {
          const valor = parseFloat(i.valorMensal.replace('R$ ', '').replace(',', '.'));
          return sum + valor;
        }, 0)
      }
    };
  };

  const getRelatorioPatrimonio = () => {
    return {
      titulo: 'Patrimônio Cadastrado',
      colunas: ['Descrição', 'Código', 'Categoria', 'Localização', 'Estado', 'Valor Aquisição'],
      dados: patrimonio.map(p => ({
        descricao: p.descricao,
        codigo: p.codigoPatrimonio,
        categoria: p.categoria || 'N/A',
        localizacao: p.localizacao || 'N/A',
        estado: p.estado || 'N/A',
        valor: `R$ ${parseFloat(p.valorAquisicao || 0).toFixed(2)}`
      })),
      resumo: {
        total: patrimonio.length,
        valorTotal: patrimonio.reduce((sum, p) => sum + parseFloat(p.valorAquisicao || 0), 0)
      }
    };
  };

  const getRelatorioEmprestimosHistorico = () => {
    return {
      titulo: 'Histórico de Empréstimos',
      colunas: ['Cliente', 'Livro', 'Data Empréstimo', 'Data Devolução', 'Data Retorno', 'Status'],
      dados: emprestimos.map(e => {
        const cliente = getClienteByEmprestimo(e);
        const livro = livros.find(l => l.id === e.livroId);
        
        return {
          cliente: getNomeClienteEmprestimo(e, cliente),
          livro: livro?.titulo || 'N/A',
          dataEmprestimo: new Date(e.dataEmprestimo).toLocaleDateString('pt-BR'),
          dataDevolucao: new Date(e.dataDevolucao).toLocaleDateString('pt-BR'),
          dataRetorno: e.dataRetorno ? new Date(e.dataRetorno).toLocaleDateString('pt-BR') : 'Não devolvido',
          status: e.status === 'ativo' ? 'Ativo' : 'Devolvido'
        };
      }),
      resumo: {
        total: emprestimos.length,
        ativos: emprestimos.filter(e => e.status === 'ativo').length,
        devolvidos: emprestimos.filter(e => e.status === 'devolvido').length
      }
    };
  };

  const getRelatorioLeitoresCadastrados = () => {
    const categoriasOrdem = ['Estudante', 'Professor', 'Funcionário', 'Comunidade'];

    const todosOrdenados = [...clientes].sort((a, b) => {
      const catA = categoriasOrdem.indexOf(a.categoria || '');
      const catB = categoriasOrdem.indexOf(b.categoria || '');
      const iA = catA >= 0 ? catA : 99;
      const iB = catB >= 0 ? catB : 99;
      if (iA !== iB) return iA - iB;
      const serieComp = String(a.serie || '').localeCompare(String(b.serie || ''), 'pt-BR');
      if (serieComp !== 0) return serieComp;
      const infoA = obterInfoTurmaAluno(a, turmasAcademicasMap);
      const infoB = obterInfoTurmaAluno(b, turmasAcademicasMap);
      const turmaComp = String(infoA.label || '').localeCompare(String(infoB.label || ''), 'pt-BR');
      if (turmaComp !== 0) return turmaComp;
      return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
    });

    // Build section map
    const secaoMap = new Map();
    todosOrdenados.forEach((c) => {
      const cat = c.categoria || 'Sem categoria';
      if (!secaoMap.has(cat)) secaoMap.set(cat, []);
      secaoMap.get(cat).push(c);
    });

    const categoriasPresentes = [
      ...categoriasOrdem.filter(c => secaoMap.has(c)),
      ...Array.from(secaoMap.keys()).filter(c => !categoriasOrdem.includes(c))
    ];

    const secoes = categoriasPresentes.map((cat) => {
      const leitores = secaoMap.get(cat) || [];

      if (cat === 'Estudante') {
        const turmaMap = new Map();
        leitores.forEach((l) => {
          const info = obterInfoTurmaAluno(l, turmasAcademicasMap);
          const turmaKey = info.label || 'Sem turma';
          if (!turmaMap.has(turmaKey)) turmaMap.set(turmaKey, []);
          turmaMap.get(turmaKey).push(l);
        });

        const subsecoes = Array.from(turmaMap.entries())
          .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
          .map(([turmaLabel, alunos]) => ({
            titulo: turmaLabel,
            colunas: ['Nº', 'Nome', 'Matrícula', 'Série', 'Turma'],
            dados: alunos.map((a, i) => {
              const info = obterInfoTurmaAluno(a, turmasAcademicasMap);
              return {
                num: i + 1,
                nome: a.nome,
                matricula: a.matricula || '-',
                serie: info.nomeSerie !== 'N/A' ? info.nomeSerie : (a.serie || '-'),
                turma: info.nomeTurma !== 'N/A' ? info.nomeTurma : (a.turma || '-')
              };
            })
          }));

        return { titulo: `Estudantes (${leitores.length})`, subsecoes };
      }

      return {
        titulo: `${cat} (${leitores.length})`,
        colunas: ['Nº', 'Nome', 'Tipo', 'Telefone'],
        dados: leitores.map((l, i) => ({
          num: i + 1,
          nome: l.nome,
          tipo: l.tipo || '-',
          telefone: l.telefone || '-'
        }))
      };
    });

    const dados = todosOrdenados.map((c, i) => {
      const info = obterInfoTurmaAluno(c, turmasAcademicasMap);
      return {
        num: i + 1,
        nome: c.nome,
        categoria: c.categoria || '-',
        tipo: c.tipo || '-',
        matricula: c.matricula || '-',
        serieTurma: info.label || '-'
      };
    });

    return {
      titulo: 'Leitores Cadastrados',
      colunas: ['Nº', 'Nome', 'Categoria', 'Tipo', 'Matrícula', 'Série/Turma'],
      dados,
      secoes,
      resumo: {
        total: clientes.length,
        ativos: clientes.filter(c => c.ativo).length,
        estudantes: clientes.filter(c => c.categoria === 'Estudante').length,
        professores: clientes.filter(c => c.categoria === 'Professor').length,
        funcionarios: clientes.filter(c => c.categoria === 'Funcionário').length,
        comunidade: clientes.filter(c => c.categoria === 'Comunidade').length
      }
    };
  };

  const tiposRelatorio = [
    { value: 'livros-cadastrados', label: 'Livros Cadastrados' },
    { value: 'livros-emprestados', label: 'Livros Emprestados' },
    { value: 'leitores-cadastrados', label: 'Leitores Cadastrados' },
    { value: 'pessoas-cadastradas', label: 'Pessoas Cadastradas' },
    { value: 'pessoas-com-emprestimos', label: 'Pessoas com Livros Emprestados' },
    { value: 'devolucoes-pendentes', label: 'Devoluções Pendentes' },
    { value: 'ranking-leitores', label: 'Ranking de Leitores' },
    { value: 'didaticos-por-turma', label: 'Didáticos por Turma' },
    { value: 'pendencias-didaticas-aluno', label: 'Pendências Didáticas por Aluno' },
    { value: 'patrimonio', label: 'Patrimônio' },
    { value: 'emprestimos-historico', label: 'Histórico de Empréstimos' },
  ];

  if (usuarioLogado?.perfil === 'SuperAdmin') {
    tiposRelatorio.push(
      { value: 'escolas-cadastradas', label: 'Escolas Cadastradas' },
      { value: 'escolas-inadimplentes', label: 'Escolas Inadimplentes' },
      { value: 'escolas-adimplentes', label: 'Escolas Adimplentes' }
    );
  }

  const getRelatorioAtual = () => {
    switch (tipoRelatorio) {
      case 'livros-cadastrados': return getRelatorioLivrosCadastrados();
      case 'livros-emprestados': return getRelatorioLivrosEmprestados();
      case 'leitores-cadastrados': return getRelatorioLeitoresCadastrados();
      case 'pessoas-cadastradas': return getRelatorioPessoasCadastradas();
      case 'pessoas-com-emprestimos': return getRelatorioPessoasComEmprestimos();
      case 'devolucoes-pendentes': return getRelatorioDevolucoesPendentes();
      case 'ranking-leitores': return getRelatorioRankingLeitores();
      case 'didaticos-por-turma': return getRelatorioDidaticosPorTurma();
      case 'pendencias-didaticas-aluno': return getRelatorioPendenciasDidaticasPorAluno();
      case 'patrimonio': return getRelatorioPatrimonio();
      case 'emprestimos-historico': return getRelatorioEmprestimosHistorico();
      case 'escolas-cadastradas': return getRelatorioEscolasCadastradas();
      case 'escolas-inadimplentes': return getRelatorioEscolasInadimplentes();
      case 'escolas-adimplentes': return getRelatorioEscolasAdimplentes();
      default: return null;
    }
  };

  const relatorio = getRelatorioAtual();

  const handleSalvarConfiguracao = () => {
    if (instituicaoAtiva) {
      atualizarInstituicao(instituicaoAtiva, {
        configRelatorios: configCabecalho,
        logoUrl: configCabecalho.logoUrl
      });
    }
    setDialogConfig(false);
  };

  const handleUploadLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Selecione apenas arquivos de imagem');
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 1MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setConfigCabecalho({ ...configCabecalho, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImprimir = () => {
    imprimirEscopo();
  };

  const handleDownloadPDF = () => {
    imprimirEscopo(); // Usar impressão do navegador para salvar em PDF
  };

  const handleDownloadExcel = () => {
    if (!relatorio) return;

    // Criar CSV (compatível com Excel)
    const headers = relatorio.colunas.join(',');
    const rows = relatorio.dados.map(row => 
      Object.values(row).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${relatorio.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!relatorio) {
    return (
      <Layout title="Relatórios">
        <Alert severity="info">Selecione um tipo de relatório</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Relatórios">
      <Box sx={{ mb: 3 }} className="print-actions no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Tipo de Relatório"
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
            >
              {tiposRelatorio.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setDialogConfig(true)}
              >
                Configurar Cabeçalho
              </Button>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handleImprimir}
              >
                Imprimir
              </Button>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={handleDownloadPDF}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<TableChart />}
                onClick={handleDownloadExcel}
              >
                Excel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Área de Impressão */}
      <Box className="print-scope">
        <Card>
          <CardContent>
            {/* Cabeçalho Personalizado */}
            <Box sx={{ mb: 3, textAlign: 'center', borderBottom: 2, borderColor: 'primary.main', pb: 2 }}>
              {configCabecalho.logoUrl && (
                <Avatar
                  src={configCabecalho.logoUrl}
                  alt="Logo"
                  sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                  variant="square"
                />
              )}
              <Typography variant="h5" fontWeight="bold" color="primary">
                {configCabecalho.titulo || 'Sistema de Controle Escolar Inteligente'}
              </Typography>
              {configCabecalho.subtitulo && (
                <Typography variant="subtitle1" color="textSecondary">
                  {configCabecalho.subtitulo}
                </Typography>
              )}
            </Box>

            {/* Título do Relatório */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {relatorio.titulo}
            </Typography>
            <Typography variant="caption" color="textSecondary" gutterBottom display="block">
              Gerado em: {new Date().toLocaleString('pt-BR')}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Resumo */}
            {relatorio.resumo && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Resumo:
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(relatorio.resumo).map(([key, value]) => (
                    <Grid item xs={6} sm={3} key={key}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="textSecondary" textTransform="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {typeof value === 'number' && key.includes('receita') 
                            ? `R$ ${value.toFixed(2)}` 
                            : value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Tabela de Dados */}
            {relatorio.secoes ? (
              relatorio.secoes.map((secao, sIdx) => (
                <Box key={sIdx} sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ bgcolor: 'primary.main', color: 'white', p: 1, mb: 1, borderRadius: 1 }}
                  >
                    {secao.titulo}
                  </Typography>
                  {secao.subsecoes ? (
                    secao.subsecoes.map((sub, ssIdx) => (
                      <Box key={ssIdx} sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ bgcolor: 'grey.200', p: 0.5, px: 1, mb: 0.5, borderRadius: 0.5 }}
                        >
                          {sub.titulo} — {sub.dados.length} aluno(s)
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'grey.100' }}>
                                {sub.colunas.map((col) => (
                                  <TableCell key={col} sx={{ fontWeight: 'bold' }}>{col}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sub.dados.map((row, i) => (
                                <TableRow key={i} hover>
                                  {Object.values(row).map((val, vi) => (
                                    <TableCell key={vi}>{val}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            {secao.colunas.map((col) => (
                              <TableCell key={col} sx={{ fontWeight: 'bold' }}>{col}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {secao.dados.map((row, i) => (
                            <TableRow key={i} hover>
                              {Object.values(row).map((val, vi) => (
                                <TableCell key={vi}>{val}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              ))
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      {relatorio.colunas.map((col) => (
                        <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold' }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorio.dados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={relatorio.colunas.length} align="center">
                          <Typography color="textSecondary">
                            Nenhum dado disponível
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      relatorio.dados.map((row, index) => (
                        <TableRow key={index} hover>
                          {Object.values(row).map((value, i) => (
                            <TableCell key={i}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Typography variant="caption" color="textSecondary">
                Total de registros: {relatorio.dados.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Dialog Configuração */}
      <Dialog open={dialogConfig} onClose={() => setDialogConfig(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configurar Cabeçalho dos Relatórios</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              fullWidth
              value={configCabecalho.titulo}
              onChange={(e) => setConfigCabecalho({ ...configCabecalho, titulo: e.target.value })}
              placeholder="Nome da instituição"
            />
            
            <TextField
              label="Subtítulo"
              fullWidth
              value={configCabecalho.subtitulo}
              onChange={(e) => setConfigCabecalho({ ...configCabecalho, subtitulo: e.target.value })}
              placeholder="Endereço, cidade, etc."
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Logo/Emblema
              </Typography>
              
              {configCabecalho.logoUrl ? (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar
                    src={configCabecalho.logoUrl}
                    alt="Logo"
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
                    variant="square"
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setConfigCabecalho({ ...configCabecalho, logoUrl: '' })}
                  >
                    Remover Logo
                  </Button>
                </Box>
              ) : (
                <>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleUploadLogo}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={() => logoInputRef.current?.click()}
                    fullWidth
                  >
                    Selecionar Logo
                  </Button>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Tamanho máximo: 1MB. Formatos: JPG, PNG
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfig(false)}>Cancelar</Button>
          <Button onClick={handleSalvarConfiguracao} variant="contained">
            Salvar Configuração
          </Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
}

export default RelatoriosPage;
