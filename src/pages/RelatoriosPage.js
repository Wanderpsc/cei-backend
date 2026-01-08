import React, { useState, useRef } from 'react';
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

function RelatoriosPage() {
  const { 
    livros, 
    patrimonio, 
    clientes, 
    emprestimos, 
    instituicoes,
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
  const printAreaRef = useRef(null);

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
        const cliente = clientes.find(c => c.id === emp.clienteId);
        
        if (livro && cliente) {
          acc.push({
            titulo: livro.titulo,
            autor: livro.autor,
            cliente: cliente.nome,
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
        const cliente = clientes.find(c => c.id === e.clienteId);
        const livro = livros.find(l => l.id === e.livroId);
        const dataDevolucao = new Date(e.dataDevolucao);
        const diasAtraso = Math.floor((hoje - dataDevolucao) / (1000 * 60 * 60 * 24));
        const situacao = diasAtraso > 0 ? 'Atrasado' : 'No Prazo';

        return {
          cliente: cliente?.nome || 'N/A',
          livro: livro?.titulo || 'N/A',
          telefone: cliente?.telefone || 'N/A',
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
    // Contar empréstimos por leitor (total de livros já emprestados)
    const rankingPorEmprestimos = clientes.map(c => {
      const totalEmprestimos = emprestimos.filter(e => e.clienteId === c.id).length;
      const emprestimosAtivos = emprestimos.filter(e => e.clienteId === c.id && e.status === 'ativo').length;
      const emprestimosDevolvidos = emprestimos.filter(e => e.clienteId === c.id && e.status === 'devolvido').length;
      
      return {
        posicao: 0, // Será preenchido depois da ordenação
        nome: c.nome,
        tipo: c.tipo || 'Leitor',
        turma: c.turma || 'N/A',
        totalLivrosEmprestados: totalEmprestimos,
        livrosAtivos: emprestimosAtivos,
        livrosDevolvidos: emprestimosDevolvidos,
        telefone: c.telefone || 'N/A'
      };
    })
    .filter(r => r.totalLivrosEmprestados > 0) // Apenas leitores com empréstimos
    .sort((a, b) => b.totalLivrosEmprestados - a.totalLivrosEmprestados)
    .map((r, index) => ({ ...r, posicao: index + 1 })); // Adicionar posição

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
        const cliente = clientes.find(c => c.id === e.clienteId);
        const livro = livros.find(l => l.id === e.livroId);
        
        return {
          cliente: cliente?.nome || 'N/A',
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

  const tiposRelatorio = [
    { value: 'livros-cadastrados', label: 'Livros Cadastrados' },
    { value: 'livros-emprestados', label: 'Livros Emprestados' },
    { value: 'pessoas-cadastradas', label: 'Pessoas Cadastradas' },
    { value: 'pessoas-com-emprestimos', label: 'Pessoas com Livros Emprestados' },
    { value: 'devolucoes-pendentes', label: 'Devoluções Pendentes' },
    { value: 'ranking-leitores', label: 'Ranking de Leitores' },
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
      case 'pessoas-cadastradas': return getRelatorioPessoasCadastradas();
      case 'pessoas-com-emprestimos': return getRelatorioPessoasComEmprestimos();
      case 'devolucoes-pendentes': return getRelatorioDevolucoesPendentes();
      case 'ranking-leitores': return getRelatorioRankingLeitores();
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
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print(); // Usar print com @media print para gerar PDF
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
      <Box sx={{ mb: 3 }}>
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
      <Box ref={printAreaRef} className="print-area">
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

      {/* CSS para impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button, .MuiButton-root {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}

export default RelatoriosPage;
