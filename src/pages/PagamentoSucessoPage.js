import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import PixIcon from '@mui/icons-material/QrCode2';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export default function PagamentoSucessoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adicionarInstituicao, gerarNotaFiscalAutomaticaPagamento } = useData();
  const { dadosCadastro, planoSelecionado, metodoPagamento, parcelas, transacaoId } = location.state || {};
  const [instituicaoJaCadastrada, setInstituicaoJaCadastrada] = React.useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Redirecionar se não houver dados
    if (!dadosCadastro || !planoSelecionado) {
      navigate('/cadastro-escola');
      return;
    }

    // Registrar a instituição no sistema APENAS UMA VEZ
    if (!instituicaoJaCadastrada) {
      const processarCompra = async () => {
        try {
          const dataPagamento = new Date();
          const dadosInstituicao = {
            ...dadosCadastro,
            plano: planoSelecionado.nome,
            diasLicenca: planoSelecionado.dias,
            valorMensal: planoSelecionado.valor,
            pagamentoConfirmado: true,
            metodoPagamento: metodoPagamento || 'pix',
            dataPagamento: dataPagamento.toISOString(),
            ultimoPagamento: dataPagamento.toISOString(), // ✅ Registrar data do pagamento
            status: 'ativo', // ✅ Já vem ativo após pagamento
            statusFinanceiro: 'em_dia' // ✅ Em dia após pagamento
          };

          const instituicaoRegistrada = adicionarInstituicao(dadosInstituicao);

          const notaGerada = gerarNotaFiscalAutomaticaPagamento({
            instituicaoId: instituicaoRegistrada?.id,
            valor: planoSelecionado.valor,
            plano: planoSelecionado.nome,
            transacaoId,
            metodoPagamento: metodoPagamento || 'pix',
            dataPagamento: dataPagamento.toISOString()
          });

          try {
            await fetch(`${API_URL}/api/send-purchase-confirmation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                compradorEmail: dadosCadastro.email,
                compradorNome: dadosCadastro.nomeResponsavel,
                instituicaoNome: dadosCadastro.nomeInstituicao,
                planoNome: planoSelecionado.nome,
                valor: planoSelecionado.valor,
                metodoPagamento: metodoPagamento || 'pix',
                dataPagamento: dataPagamento.toISOString(),
                transacaoId,
                notaNumero: notaGerada?.numero,
                notaSerie: notaGerada?.serie,
                notaCompetencia: notaGerada?.competencia,
                notaChaveControle: notaGerada?.chaveControle,
                loginAdmin: dadosCadastro.loginAdmin
              })
            });
          } catch (emailError) {
            console.error('Erro ao enviar e-mails de confirmação:', emailError);
          }

          setInstituicaoJaCadastrada(true);

          // Limpar o state da navegação para evitar recadastro no refresh
          window.history.replaceState({}, document.title);
        } catch (error) {
          console.error('Erro ao registrar instituição:', error);
        }
      };

      processarCompra();
    }
  }, [
    dadosCadastro,
    planoSelecionado,
    metodoPagamento,
    transacaoId,
    API_URL,
    navigate,
    adicionarInstituicao,
    gerarNotaFiscalAutomaticaPagamento,
    instituicaoJaCadastrada
  ]);

  if (!dadosCadastro || !planoSelecionado) {
    return null;
  }

  const numeroTransacao = `CEI-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  
  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {/* Ícone de Sucesso */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
            <Typography variant="h3" gutterBottom color="success.main">
              Pagamento Confirmado!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Bem-vindo ao Sistema CEI
            </Typography>
          </Box>

          {/* Alerta de Sucesso */}
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Parabéns! Seu pagamento foi processado com sucesso.</strong>
            </Typography>
            <Typography variant="body2">
              Sua instituição <strong>{dadosCadastro.nomeInstituicao}</strong> está cadastrada e ativa no sistema.
            </Typography>
          </Alert>

          {/* Detalhes da Transação */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                {metodoPagamento === 'cartao' ? <CreditCardIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> : <PixIcon sx={{ verticalAlign: 'middle', mr: 1 }} />}
                Detalhes da Transação
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nº da Transação:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {numeroTransacao}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Data/Hora:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {new Date().toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Método de Pagamento:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {metodoPagamento === 'cartao' ? 'Cartão de Crédito' : 'PIX'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong>
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <strong>✓ Aprovado</strong>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detalhes do Plano */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                <PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Plano Contratado
              </Typography>
              <Divider sx={{ my: 2, bgcolor: 'white', opacity: 0.3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    <strong>Plano:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {planoSelecionado.nome}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    <strong>Duração:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {planoSelecionado.dias} dias
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    <strong>Valor Total:</strong>
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    R$ {planoSelecionado.valor.toFixed(2)}
                  </Typography>
                </Grid>
                {metodoPagamento === 'cartao' && parcelas > 1 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      <strong>Parcelamento:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {parcelas}x de R$ {(planoSelecionado.valor / parcelas).toFixed(2)}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1, bgcolor: 'white', opacity: 0.3 }} />
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    <strong>Validade:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    De {new Date().toLocaleDateString('pt-BR')} até{' '}
                    {new Date(Date.now() + planoSelecionado.dias * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Dados de Acesso */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                🔐 Credenciais de Acesso
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Use as credenciais abaixo para fazer login no sistema:
                </Typography>
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Login:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {dadosCadastro.loginAdmin}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Senha:</strong>
                  </Typography>
                  <Typography variant="body1">
                    (A senha que você cadastrou)
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Próximos Passos */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>📌 Próximos Passos:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              1️⃣ Clique no botão abaixo para fazer login<br />
              2️⃣ Configure os dados da sua instituição<br />
              3️⃣ Cadastre livros, alunos e comece a usar o sistema<br />
              4️⃣ Em caso de dúvidas, acesse a seção de ajuda
            </Typography>
          </Alert>

          {/* Email Confirmação */}
          <Alert severity="success" icon={<PaymentIcon />}>
            <Typography variant="body2">
              📧 Um e-mail de confirmação foi enviado para <strong>{dadosCadastro.email}</strong> com 
              todos os detalhes da sua compra e informações de acesso.
            </Typography>
          </Alert>

          {/* Botões */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SchoolIcon />}
              onClick={() => navigate('/login')}
              sx={{ px: 6, py: 1.5 }}
            >
              Acessar o Sistema
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
              Você será redirecionado automaticamente em alguns segundos...
            </Typography>
          </Box>

          {/* Marca Registrada */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              © {new Date().getFullYear()} CEI - Sistema desenvolvido por
            </Typography>
            <Typography variant="caption" color="primary" display="block" fontWeight="bold">
              Wander Pires Silva Coelho ®
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Obrigado por escolher o Sistema CEI!
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
