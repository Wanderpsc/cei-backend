import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  Chip,
  Alert
} from '@mui/material';
import { 
  MenuBook, 
  Inventory, 
  People, 
  Assignment,
  Warning,
  Error
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

function DashboardPage() {
  const { livros, patrimonio, clientes, emprestimos, usuarioLogado, instituicoes, instituicaoAtiva, calcularProximoVencimento } = useData();
  const [alertaFinanceiro, setAlertaFinanceiro] = useState(null);

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

  const cards = [
    { 
      title: 'Livros', 
      value: livros.length, 
      icon: <MenuBook sx={{ fontSize: 40 }} />, 
      color: '#1976d2' 
    },
    { 
      title: 'Patrimônio', 
      value: patrimonio.length, 
      icon: <Inventory sx={{ fontSize: 40 }} />, 
      color: '#388e3c' 
    },
    { 
      title: 'Clientes', 
      value: clientes.length, 
      icon: <People sx={{ fontSize: 40 }} />, 
      color: '#f57c00' 
    },
    { 
      title: 'Empréstimos Ativos', 
      value: emprestimosAtivos, 
      icon: <Assignment sx={{ fontSize: 40 }} />, 
      color: '#7b1fa2' 
    },
  ];

  return (
    <Layout title="Dashboard">
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

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}>
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bem-vindo ao CEI - Controle Escolar Inteligente
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistema de gestão de biblioteca e patrimônio escolar.
        </Typography>
      </Box>
    </Layout>
  );
}

export default DashboardPage;
