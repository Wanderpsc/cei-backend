import React, { useState, useEffect } from 'react';
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
  Chip,
  Alert,
  Grid,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function FinanceiroPage() {
  const { 
    usuarioLogado,
    instituicoes,
    calcularProximoVencimento,
    obterHistoricoPagamentos
  } = useData();

  const [instituicao, setInstituicao] = useState(null);
  const [proximoVencimento, setProximoVencimento] = useState(null);
  const [diasParaVencimento, setDiasParaVencimento] = useState(null);

  useEffect(() => {
    if (usuarioLogado?.instituicaoId) {
      const inst = instituicoes.find(i => i.id === usuarioLogado.instituicaoId);
      setInstituicao(inst);
      
      if (inst) {
        const vencimento = calcularProximoVencimento(inst.id);
        setProximoVencimento(vencimento);
        
        if (vencimento) {
          const hoje = new Date();
          const diffTime = vencimento - hoje;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDiasParaVencimento(diffDays);
        }
      }
    }
  }, [usuarioLogado, instituicoes]);

  if (!instituicao) {
    return (
      <Box>
        <Alert severity="error">
          Instituição não encontrada.
        </Alert>
      </Box>
    );
  }

  const historico = obterHistoricoPagamentos(instituicao.id);
  const statusFinanceiro = instituicao.statusFinanceiro || 'em_dia';

  const getStatusAlert = () => {
    if (statusFinanceiro === 'bloqueado_financeiro') {
      return (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 3 }}>
          <Typography variant="h6">Sua conta está bloqueada por inadimplência</Typography>
          <Typography>
            Entre em contato com o administrador para regularizar sua situação.
          </Typography>
        </Alert>
      );
    }
    
    if (statusFinanceiro === 'atrasado' || (diasParaVencimento !== null && diasParaVencimento < 0)) {
      return (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="h6">Pagamento em Atraso</Typography>
          <Typography>
            Seu pagamento está atrasado. Regularize o quanto antes para evitar bloqueio.
          </Typography>
        </Alert>
      );
    }
    
    if (diasParaVencimento !== null && diasParaVencimento <= 5 && diasParaVencimento > 0) {
      return (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="h6">Vencimento Próximo</Typography>
          <Typography>
            Seu pagamento vence em {diasParaVencimento} dia{diasParaVencimento !== 1 ? 's' : ''}. 
            Fique atento!
          </Typography>
        </Alert>
      );
    }
    
    return (
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
        <Typography variant="h6">Pagamento em Dia</Typography>
        <Typography>
          Sua situação financeira está regularizada. Obrigado!
        </Typography>
      </Alert>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financeiro
      </Typography>

      {getStatusAlert()}

      {/* Cards Informações */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ReceiptLongIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Valor Mensal
                </Typography>
              </Box>
              <Typography variant="h4">
                R$ {(instituicao.valorMensal || 97.00).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Plano: {instituicao.plano || 'Mensal'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Próximo Vencimento
                </Typography>
              </Box>
              <Typography variant="h5">
                {proximoVencimento 
                  ? proximoVencimento.toLocaleDateString('pt-BR')
                  : 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Dia {instituicao.diaVencimento || 10} de cada mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                {statusFinanceiro === 'em_dia' ? (
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <WarningIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography color="textSecondary">
                  Status
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                {statusFinanceiro.replace('_', ' ')}
              </Typography>
              {diasParaVencimento !== null && diasParaVencimento > 0 && (
                <Typography variant="caption" color="textSecondary">
                  Faltam {diasParaVencimento} dias
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informações de Pagamento */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Formas de Pagamento
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" paragraph>
              <strong>PIX:</strong> Entre em contato com o administrador para obter a chave PIX
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Boleto:</strong> Solicite ao administrador
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Transferência Bancária:</strong> Entre em contato para dados bancários
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Após realizar o pagamento, envie o comprovante para o administrador confirmar.
          </Alert>
        </CardContent>
      </Card>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Histórico de Pagamentos
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data do Pagamento</TableCell>
                  <TableCell>Referência</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historico.length > 0 ? (
                  historico
                    .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento))
                    .map((pag) => (
                      <TableRow key={pag.id}>
                        <TableCell>
                          {new Date(pag.dataPagamento).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{pag.referenciaMes}</TableCell>
                        <TableCell>
                          <strong>R$ {pag.valor.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {pag.metodoPagamento}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={pag.status} 
                            color="success" 
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary" py={3}>
                        Nenhum pagamento registrado ainda
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
