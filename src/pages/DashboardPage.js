import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  Chip,
  Alert,
  Snackbar,
  Button,
  Tooltip
} from '@mui/material';
import { 
  MenuBook, 
  Inventory, 
  People, 
  Assignment,
  Warning,
  Error,
  Assessment,
  Search,
  EmojiEvents,
  AccountBalanceWallet,
  LibraryBooks,
  AssignmentReturn,
  Description,
  Receipt,
  ContentCopy,
  PrintOutlined,
  Backup,
  CloudDownload,
  CloudUpload
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import TermoEmprestimo from '../components/TermoEmprestimo';

const DEMO_DEVICE_ID_KEY = 'cei_demo_device_id';

const formatarIdentificadorDemo = (deviceId) => {
  if (!deviceId) return 'Não disponível';
  const partes = deviceId.split('-');
  const base = (partes[partes.length - 1] || deviceId).slice(0, 6).toUpperCase();
  return `DEMO-${base}`;
};

function DashboardPage() {
  const DATA_LANCAMENTO_TESTE_EMAIL = new Date('2026-02-14T00:00:00');
  const DIAS_DESTAQUE_NOVO = 30;

  const navigate = useNavigate();
  const { 
    livros, 
    patrimonio, 
    clientes, 
    emprestimos, 
    usuarioLogado, 
    instituicoes, 
    instituicaoAtiva, 
    calcularProximoVencimento,
    exportarDados,
    importarDados
  } = useData();
  const [alertaFinanceiro, setAlertaFinanceiro] = useState(null);
  const [termoOpen, setTermoOpen] = useState(false);
  const [tipoTermo, setTipoTermo] = useState('branco');
  const [snackbar, setSnackbar] = useState({ open: false, mensagem: '', tipo: 'info' });
  const [ultimaAtualizacaoDados, setUltimaAtualizacaoDados] = useState(null);

  const diasDesdeLancamento = Math.floor((Date.now() - DATA_LANCAMENTO_TESTE_EMAIL.getTime()) / (1000 * 60 * 60 * 24));
  const exibirBadgeNovoTesteEmail = diasDesdeLancamento >= 0 && diasDesdeLancamento <= DIAS_DESTAQUE_NOVO;
  const exibirInfoSessaoDemo = Boolean(usuarioLogado?.contaTeste);
  const identificadorDemo = formatarIdentificadorDemo(localStorage.getItem(DEMO_DEVICE_ID_KEY));

  const handleCopiarIdentificadorDemo = async () => {
    try {
      await navigator.clipboard.writeText(identificadorDemo);
      setSnackbar({
        open: true,
        mensagem: `Identificador copiado: ${identificadorDemo}`,
        tipo: 'success'
      });
    } catch (error) {
      console.error('Erro ao copiar identificador demo:', error);
      setSnackbar({
        open: true,
        mensagem: `Não foi possível copiar automaticamente. ID: ${identificadorDemo}`,
        tipo: 'warning'
      });
    }
  };

  const fecharSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Funções de backup
  const handleExportarDados = () => {
    const resultado = exportarDados();
    if (resultado.sucesso) {
      setSnackbar({
        open: true,
        mensagem: resultado.mensagem,
        tipo: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        mensagem: resultado.mensagem,
        tipo: 'error'
      });
    }
  };
  
  const handleImportarDados = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const resultado = await importarDados(file);
          setSnackbar({
            open: true,
            mensagem: resultado.mensagem,
            tipo: 'success'
          });
          setUltimaAtualizacaoDados(new Date());
        } catch (error) {
          setSnackbar({
            open: true,
            mensagem: error?.mensagem || 'Erro ao importar dados.',
            tipo: 'error'
          });
        }
      }
    };
    input.click();
  };

  // Buscar informações da instituição ativa
  const instituicaoInfo = instituicoes.find(i => i.id === instituicaoAtiva);

  // Verificar situação financeira
  useEffect(() => {
    if (instituicaoInfo && usuarioLogado?.perfil !== 'SuperAdmin') {
      const statusFinanceiro = instituicaoInfo.statusFinanceiro || 'em_dia';
      
      if (statusFinanceiro === 'bloqueado_financeiro') {
        setAlertaFinanceiro({
          tipo: 'error',
          titulo: 'Conta Bloqueada por Inadimplência',
          mensagem: 'Seu acesso está bloqueado. Entre em contato com o administrador.'
        });
      } else if (statusFinanceiro === 'atrasado') {
        setAlertaFinanceiro({
          tipo: 'error',
          titulo: 'Pagamento em Atraso',
          mensagem: 'Seu pagamento está atrasado. Regularize o quanto antes para evitar bloqueio.'
        });
      } else {
        // Verificar dias para vencimento
        const proximoVencimento = calcularProximoVencimento(instituicaoInfo.id);
        if (proximoVencimento) {
          const hoje = new Date();
          const diffTime = proximoVencimento - hoje;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 5 && diffDays > 0) {
            setAlertaFinanceiro({
              tipo: 'warning',
              titulo: 'Vencimento Próximo',
              mensagem: `Seu pagamento vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''}. Fique atento!`
            });
          } else if (diffDays <= 0) {
            setAlertaFinanceiro({
              tipo: 'error',
              titulo: 'Pagamento Vencido',
              mensagem: 'Seu pagamento está vencido. Regularize o quanto antes.'
            });
          }
        }
      }
    }
  }, [instituicaoInfo, usuarioLogado]);

  const emprestimosAtivos = emprestimos.filter(e => e.status === 'ativo').length;

  const resumoAcervo = useMemo(() => {
    const ativosMap = new Map();
    emprestimos
      .filter(e => String(e.status || '').toLowerCase() === 'ativo')
      .forEach(e => {
        const lid = String(e.livroId || '');
        if (lid) ativosMap.set(lid, (ativosMap.get(lid) || 0) + 1);
      });
    let totalExemplares = 0;
    let disponiveis = 0;
    livros.forEach(livro => {
      if (livro.baixa) return;
      const qtd = Math.max(Number(livro.quantidade) || 0, 0);
      totalExemplares += qtd;
      disponiveis += Math.max(qtd - (ativosMap.get(String(livro.id)) || 0), 0);
    });
    return { totalExemplares, emprestados: emprestimosAtivos, disponiveis };
  }, [livros, emprestimos, emprestimosAtivos]);

  const emprestimosVencidos = emprestimos.filter(e => {
    if (e.status !== 'ativo') return false;
    const hoje = new Date();
    const dataDevolucao = new Date(e.dataDevolucao);
    return dataDevolucao < hoje;
  }).length;

  // Cards apenas para SuperAdmin - Painel de Gerenciamento de Instituições
  const cardsAdmin = [
    { 
      title: 'Gerenciar Escolas', 
      value: instituicoes.length, 
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />, 
      color: '#1976d2',
      path: '/gerenciar-escolas'
    },
    { 
      title: 'Financeiro Admin', 
      value: '💰', 
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />, 
      color: '#388e3c',
      path: '/financeiro-admin'
    },
    { 
      title: 'Configurar Planos', 
      value: '📋', 
      icon: <Assignment sx={{ fontSize: 40 }} />, 
      color: '#f57c00',
      path: '/configurar-planos'
    },
    { 
      title: 'Notas Fiscais', 
      value: '🧾', 
      icon: <Assessment sx={{ fontSize: 40 }} />, 
      color: '#7b1fa2',
      path: '/notas-fiscais'
    },
    { 
      title: 'Diagrama do Sistema', 
      value: '🏗️', 
      icon: <Search sx={{ fontSize: 40 }} />, 
      color: '#d32f2f',
      path: '/diagrama-sistema'
    },
  ];

  // Cards para Cliente - Menu lateral como cards (operações da biblioteca)
  const cardsCliente = [
    { 
      title: 'Gerenciar Usuários', 
      value: '👥', 
      icon: <People sx={{ fontSize: 40 }} />, 
      color: '#9c27b0',
      path: '/gerenciar-usuarios'
    },
    { 
      title: 'Livros', 
      value: livros.length, 
      icon: <MenuBook sx={{ fontSize: 40 }} />, 
      color: '#1976d2',
      path: '/livros'
    },
    { 
      title: 'Patrimônio', 
      value: patrimonio.length, 
      icon: <Inventory sx={{ fontSize: 40 }} />, 
      color: '#388e3c',
      path: '/patrimonio'
    },
    { 
      title: 'Leitores', 
      value: clientes.length, 
      icon: <People sx={{ fontSize: 40 }} />, 
      color: '#f57c00',
      path: '/clientes'
    },
    { 
      title: 'Empréstimos', 
      value: emprestimosAtivos, 
      icon: <Assignment sx={{ fontSize: 40 }} />, 
      color: '#7b1fa2',
      path: '/emprestimos'
    },
    { 
      title: 'Devoluções', 
      value: emprestimosAtivos, 
      icon: <AssignmentReturn sx={{ fontSize: 40 }} />, 
      color: '#d32f2f',
      path: '/devolucoes'
    },
    { 
      title: 'Clube de Leitura', 
      value: '🏆', 
      icon: <EmojiEvents sx={{ fontSize: 40 }} />, 
      color: '#ffa726',
      path: '/clube-leitura'
    },
    { 
      title: 'Relatórios', 
      value: '📊', 
      icon: <Assessment sx={{ fontSize: 40 }} />, 
      color: '#5c6bc0',
      path: '/relatorios'
    },
    { 
      title: 'Relatórios Livros', 
      value: '📚', 
      icon: <LibraryBooks sx={{ fontSize: 40 }} />, 
      color: '#26a69a',
      path: '/relatorios-livros'
    },
    { 
      title: 'Busca', 
      value: '🔍', 
      icon: <Search sx={{ fontSize: 40 }} />, 
      color: '#ab47bc',
      path: '/busca'
    },
    { 
      title: 'Financeiro', 
      value: '💰', 
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />, 
      color: '#66bb6a',
      path: '/financeiro'
    },
  ];

  // Selecionar cards baseado no perfil do usuário
  const cards = usuarioLogado?.perfil === 'SuperAdmin' ? cardsAdmin : cardsCliente;

  return (
    <Layout title="Dashboard">
      {/* Botões de Ações Rápidas */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {/* Botões de Backup */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Exportar backup de todos os dados do sistema">
            <Button
              variant="contained"
              startIcon={<CloudDownload />}
              onClick={handleExportarDados}
              size="small"
              color="success"
            >
              Exportar Backup
            </Button>
          </Tooltip>
          <Tooltip title="Importar dados de um arquivo de backup">
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={handleImportarDados}
              size="small"
              color="success"
            >
              Importar Backup
            </Button>
          </Tooltip>
        </Box>
        
        {/* Botões de Termos */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {usuarioLogado?.perfil === 'SuperAdmin' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Abrir tela de Notas Fiscais para testar envio de e-mails">
                <Button
                  variant="contained"
                  startIcon={<Receipt />}
                  onClick={() => navigate('/notas-fiscais')}
                  size="small"
                  color="primary"
                >
                  Testar E-mails
                </Button>
              </Tooltip>
              {exibirBadgeNovoTesteEmail && (
                <Chip
                  label="NOVO"
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          )}
          <Tooltip title="Gerar termo em branco para impressão">
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
          </Tooltip>
          <Tooltip title="Imprimir termos de empréstimos ativos">
            <Button
              variant="outlined"
              startIcon={<PrintOutlined />}
              onClick={() => navigate('/emprestimos')}
              size="small"
              color="info"
            >
              Gerenciar Termos
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {ultimaAtualizacaoDados && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Dados atualizados agora ({ultimaAtualizacaoDados.toLocaleTimeString('pt-BR')}).
        </Typography>
      )}

      {exibirInfoSessaoDemo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Sessão de demonstração ativa neste dispositivo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2">
              Identificador da sessão demo: {identificadorDemo}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopiarIdentificadorDemo}
            >
              Copiar ID
            </Button>
          </Box>
        </Alert>
      )}

      {/* Alerta Financeiro */}
      {alertaFinanceiro && (
        <Alert 
          severity={alertaFinanceiro.tipo} 
          icon={alertaFinanceiro.tipo === 'error' ? <Error /> : <Warning />}
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">{alertaFinanceiro.titulo}</Typography>
          <Typography>{alertaFinanceiro.mensagem}</Typography>
        </Alert>
      )}

      {/* Informações da Instituição */}
      {instituicaoInfo && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {instituicaoInfo.nomeInstituicao}
                  </Typography>
                  <Typography variant="body2">
                    {instituicaoInfo.cidade}, {instituicaoInfo.estado}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                  <Chip
                    label={`Licença: ${instituicaoInfo.licenca}`}
                    sx={{ bgcolor: 'white', color: 'primary.main', mb: 1 }}
                  />
                  {instituicaoInfo.dataExpiracao && (
                    <Typography variant="body2">
                      Válido até: {new Date(instituicaoInfo.dataExpiracao).toLocaleDateString('pt-BR')}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Super Admin View */}
      {usuarioLogado?.perfil === 'SuperAdmin' && !instituicaoAtiva && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Painel do Super Administrador
              </Typography>
              <Typography variant="body1">
                Você está visualizando os dados consolidados de todas as instituições.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Contadores de Estoque do Acervo */}
      {usuarioLogado?.perfil !== 'SuperAdmin' && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Exemplares no acervo</Typography>
                <Typography variant="h5" fontWeight={700}>{resumoAcervo.totalExemplares}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Empréstimos ativos</Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">{resumoAcervo.emprestados}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Estoque disponível</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">{resumoAcervo.disponiveis}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Título Estatísticas e Informações */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          📊 Estatísticas e Informações
        </Typography>
      </Box>

      <Box sx={{ maxHeight: '50vh', overflowY: 'auto', overflowX: 'hidden', pr: 1 }}>
        <Grid container spacing={3} justifyContent="center">
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => navigate(card.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: card.color }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h4" component="div" sx={{ ml: 2, fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {emprestimosVencidos > 0 && (
        <Box sx={{ mt: 3 }}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h6" color="error">
                Atenção: {emprestimosVencidos} empréstimo(s) vencido(s)!
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Dialog do Termo de Empréstimo */}
      <TermoEmprestimo
        open={termoOpen}
        onClose={() => setTermoOpen(false)}
        dados={null}
        tipo={tipoTermo}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={fecharSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={fecharSnackbar} severity={snackbar.tipo} variant="filled" sx={{ width: '100%' }}>
          {snackbar.mensagem}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default DashboardPage;
