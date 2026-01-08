import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  MenuItem
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function FinanceiroAdminPage() {
  const { 
    instituicoes, 
    registrarPagamento, 
    verificarInadimplencia,
    calcularProximoVencimento,
    obterHistoricoPagamentos 
  } = useData();

  const [dialogPagamento, setDialogPagamento] = useState(false);
  const [dialogHistorico, setDialogHistorico] = useState(false);
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState(null);
  const [valorPagamento, setValorPagamento] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('manual');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const instituicoesAtivas = instituicoes.filter(i => i.status !== 'pendente');

  const getStatusFinanceiroChip = (status) => {
    const configs = {
      em_dia: { label: 'Em Dia', color: 'success', icon: <CheckCircleIcon /> },
      pendente: { label: 'Pendente', color: 'warning', icon: <WarningIcon /> },
      atrasado: { label: 'Atrasado', color: 'error', icon: <WarningIcon /> },
      bloqueado_financeiro: { label: 'Bloqueado', color: 'error', icon: <BlockIcon /> }
    };
    
    const config = configs[status] || configs.em_dia;
    return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />;
  };

  const calcularDiasParaVencimento = (instituicao) => {
    const proximoVencimento = calcularProximoVencimento(instituicao.id);
    if (!proximoVencimento) return null;
    
    const hoje = new Date();
    const diffTime = proximoVencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const handleRegistrarPagamento = () => {
    if (!instituicaoSelecionada || !valorPagamento) {
      alert('Preencha todos os campos');
      return;
    }

    registrarPagamento(
      instituicaoSelecionada.id,
      parseFloat(valorPagamento),
      metodoPagamento
    );

    setDialogPagamento(false);
    setInstituicaoSelecionada(null);
    setValorPagamento('');
  };

  const handleVerHistorico = (instituicao) => {
    setInstituicaoSelecionada(instituicao);
    setDialogHistorico(true);
  };

  const handleAbrirPagamento = (instituicao) => {
    setInstituicaoSelecionada(instituicao);
    setValorPagamento(instituicao.valorMensal?.toString() ?? '97.00');
    setDialogPagamento(true);
  };

  const calcularReceitaMensal = () => {
    return instituicoesAtivas.reduce((total, inst) => {
      return total + (inst.valorMensal ?? 97.00);
    }, 0);
  };

  const contarInadimplentes = () => {
    return instituicoesAtivas.filter(i => 
      i.statusFinanceiro === 'atrasado' || i.statusFinanceiro === 'bloqueado_financeiro'
    ).length;
  };

  const handleFiltrar = () => {
    // Função para atualizar a lista conforme filtro
  };

  const handleAtualizar = () => {
    // Força re-render para atualizar dados
    setFiltroStatus('todos');
  };

  const instituicoesFiltradas = instituicoesAtivas.filter(inst => {
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'em_dia') return inst.statusFinanceiro === 'em_dia';
    if (filtroStatus === 'inadimplentes') return inst.statusFinanceiro === 'atrasado' || inst.statusFinanceiro === 'bloqueado_financeiro';
    if (filtroStatus === 'bloqueados') return inst.statusFinanceiro === 'bloqueado_financeiro';
    return true;
  });

  return (
    <Layout title="Gestão Financeira">
      {/* Painel de Botões */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          size="small"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        >
          <MenuItem value="todos">Todas as Escolas</MenuItem>
          <MenuItem value="em_dia">Adimplentes</MenuItem>
          <MenuItem value="inadimplentes">Inadimplentes</MenuItem>
          <MenuItem value="bloqueados">Bloqueados</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleAtualizar}
        >
          Atualizar
        </Button>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Total de escolas filtradas">
          <Chip 
            label={`${instituicoesFiltradas.length} escola(s)`} 
            color="primary"
            variant="outlined"
          />
        </Tooltip>
      </Box>

      {/* Cards Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Receita Mensal Prevista
              </Typography>
              <Typography variant="h4">
                R$ {calcularReceitaMensal().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Instituições Ativas
              </Typography>
              <Typography variant="h4" color="success.main">
                {instituicoesAtivas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inadimplentes
              </Typography>
              <Typography variant="h4" color="error.main">
                {contarInadimplentes()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Em Dia
              </Typography>
              <Typography variant="h4" color="success.main">
                {instituicoesAtivas.filter(i => i.statusFinanceiro === 'em_dia').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Instituições */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Controle de Pagamentos por Instituição
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Instituição</TableCell>
                  <TableCell>Valor Mensal</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Último Pagamento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instituicoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        {filtroStatus === 'todos' 
                          ? 'Nenhuma instituição cadastrada'
                          : `Nenhuma instituição ${filtroStatus === 'em_dia' ? 'adimplente' : filtroStatus === 'bloqueados' ? 'bloqueada' : 'inadimplente'}`
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  instituicoesFiltradas.map((instituicao) => {
                  const diasVencimento = calcularDiasParaVencimento(instituicao);
                  const historico = obterHistoricoPagamentos(instituicao.id);
                  
                  return (
                    <TableRow key={instituicao.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {instituicao.nomeInstituicao}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {instituicao.cnpj}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body1">
                          R$ {(instituicao.valorMensal ?? 97.00).toFixed(2)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography>Dia {instituicao.diaVencimento || 10}</Typography>
                        {diasVencimento !== null && (
                          <Typography variant="caption" color={diasVencimento < 5 ? 'error' : 'textSecondary'}>
                            {diasVencimento > 0 
                              ? `${diasVencimento} dias` 
                              : `Vencido há ${Math.abs(diasVencimento)} dias`}
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {instituicao.ultimoPagamento ? (
                          <Typography variant="caption">
                            {new Date(instituicao.ultimoPagamento).toLocaleDateString('pt-BR')}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            Nenhum pagamento
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusFinanceiroChip(instituicao.statusFinanceiro || 'em_dia')}
                      </TableCell>
                      
                      <TableCell align="center">
                        <Tooltip title="Registrar Pagamento">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleAbrirPagamento(instituicao)}
                          >
                            <AttachMoneyIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Ver Histórico">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleVerHistorico(instituicao)}
                          >
                            <ReceiptIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {diasVencimento !== null && diasVencimento < 5 && diasVencimento > 0 && (
                          <Tooltip title="Enviar Lembrete">
                            <IconButton
                              color="warning"
                              size="small"
                            >
                              <NotificationsIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog Registrar Pagamento */}
      <Dialog open={dialogPagamento} onClose={() => setDialogPagamento(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Pagamento</DialogTitle>
        <DialogContent>
          {instituicaoSelecionada && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>{instituicaoSelecionada.nomeInstituicao}</strong>
              </Alert>
              
              <TextField
                fullWidth
                label="Valor do Pagamento"
                type="number"
                value={valorPagamento}
                onChange={(e) => setValorPagamento(e.target.value)}
                sx={{ mb: 2, mt: 1 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                }}
              />
              
              <TextField
                fullWidth
                select
                label="Método de Pagamento"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="manual">Confirmação Manual</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="cartao">Cartão de Crédito</option>
                <option value="transferencia">Transferência Bancária</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPagamento(false)}>
            Cancelar
          </Button>
          <Button onClick={handleRegistrarPagamento} variant="contained" color="primary">
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Histórico */}
      <Dialog open={dialogHistorico} onClose={() => setDialogHistorico(false)} maxWidth="md" fullWidth>
        <DialogTitle>Histórico de Pagamentos</DialogTitle>
        <DialogContent>
          {instituicaoSelecionada && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>{instituicaoSelecionada.nomeInstituicao}</strong>
              </Alert>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Referência</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {obterHistoricoPagamentos(instituicaoSelecionada.id).length > 0 ? (
                      obterHistoricoPagamentos(instituicaoSelecionada.id)
                        .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento))
                        .map((pag) => (
                          <TableRow key={pag.id}>
                            <TableCell>
                              {new Date(pag.dataPagamento).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>{pag.referenciaMes}</TableCell>
                            <TableCell>R$ {pag.valor.toFixed(2)}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>
                              {pag.metodoPagamento}
                            </TableCell>
                            <TableCell>
                              <Chip label={pag.status} color="success" size="small" />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="textSecondary">
                            Nenhum pagamento registrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogHistorico(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
