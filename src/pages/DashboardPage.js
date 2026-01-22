import React, { useState, useEffect } from 'react';
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
  PrintOutlined,
  Backup,
  CloudDownload,
  CloudUpload
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import TermoEmprestimo from '../components/TermoEmprestimo';

function DashboardPage() {
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
  
  // Funções de backup
  const handleExportarDados = () => {
    const resultado = exportarDados();
    if (resultado.sucesso) {
      alert('✅ ' + resultado.mensagem);
    } else {
      alert('❌ ' + resultado.mensagem);
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
          alert('✅ ' + resultado.mensagem);
          window.location.reload(); // Recarregar para aplicar dados importados
        } catch (error) {
          alert('❌ ' + error.mensagem);
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
    </Layout>
  );
}

export default DashboardPage;
