import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import PixIcon from '@mui/icons-material/QrCode2';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';

export default function PagamentoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosCadastro, planoSelecionado } = location.state || {};
  
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [processando, setProcessando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  
  // Estados PIX
  const [pixQRCode, setPixQRCode] = useState('');
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [pixGerado, setPixGerado] = useState(false);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);
  const [copiado, setCopiado] = useState(false);
  
  // Estados Cartão de Crédito
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
    parcelas: 1
  });

  useEffect(() => {
    // Redirecionar se não houver dados de cadastro
    if (!dadosCadastro || !planoSelecionado) {
      navigate('/cadastro-escola');
    }
  }, [dadosCadastro, planoSelecionado, navigate]);

  if (!dadosCadastro || !planoSelecionado) {
    return null;
  }

  const valorTotal = planoSelecionado.valor;
  const valorPorDia = (valorTotal / planoSelecionado.dias).toFixed(2);

  // URL da API (altere quando fizer deploy do backend)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const MERCADOPAGO_PUBLIC_KEY = process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-7c4ec711-2b61-41f4-93fd-c4a2c8b10672';

  // Gerar PIX
  const gerarPix = async () => {
    setProcessando(true);
    setErro('');
    
    try {
      const response = await fetch(`${API_URL}/api/create-pix-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: valorTotal,
          email: dadosCadastro.email,
          cpf: dadosCadastro.cpfResponsavel.replace(/\D/g, ''),
          nome: dadosCadastro.nomeResponsavel,
          instituicaoId: `INST-${Date.now()}`,
          plano: planoSelecionado.nome
        })
      });

      const data = await response.json();

      if (data.success && data.payment) {
        // QR Code real do Mercado Pago
        setPixQRCode(`data:image/png;base64,${data.payment.qr_code_base64}`);
        setPixCopiaECola(data.payment.qr_code);
        setPixGerado(true);
        
        console.log('✅ PIX gerado com sucesso!');
        console.log('ID do pagamento:', data.payment.id);
        
        // Iniciar verificação do pagamento
        iniciarVerificacaoPagamento(data.payment.id, {
          metodoPagamento: 'pix'
        });
      } else {
        setErro(data.error || 'Erro ao gerar PIX. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      setErro('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setProcessando(false);
    }
  };

  // Verificar pagamento PIX
  const iniciarVerificacaoPagamento = (paymentId, options = {}) => {
    const { metodoPagamento = 'pix', parcelas = null } = options;
    setVerificandoPagamento(true);
    
    // Verificar a cada 5 segundos
    const intervalo = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/check-payment/${paymentId}`);
        const data = await response.json();
        
        if (data.success && data.status === 'approved') {
          clearInterval(intervalo);
          setVerificandoPagamento(false);
          setSucesso(true);
          
          console.log('✅ Pagamento aprovado!');
          
          // Redirecionar para página de sucesso
          setTimeout(() => {
            navigate('/pagamento-sucesso', { 
              state: { 
                dadosCadastro, 
                planoSelecionado,
                metodoPagamento,
                parcelas,
                transacaoId: paymentId,
                status: 'approved'
              } 
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 5000);

    // Parar verificação após 10 minutos
    setTimeout(() => {
      clearInterval(intervalo);
      setVerificandoPagamento(false);
    }, 600000);
  };

  // Copiar código PIX
  const copiarCodigoPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Processar pagamento com cartão
  const processarPagamentoCartao = async () => {
    setErro('');
    
    console.log('🔍 Validando dados do cartão...');
    
    // Validações
    if (!dadosCartao.numero || dadosCartao.numero.replace(/\s/g, '').length < 16) {
      setErro('Número do cartão inválido (mínimo 16 dígitos)');
      return;
    }
    
    if (!dadosCartao.nome.trim()) {
      setErro('Nome no cartão é obrigatório');
      return;
    }
    
    if (!dadosCartao.validade || dadosCartao.validade.length < 5) {
      setErro('Validade do cartão inválida (formato MM/AA)');
      return;
    }
    
    if (!dadosCartao.cvv || dadosCartao.cvv.length < 3) {
      setErro('CVV inválido (mínimo 3 dígitos)');
      return;
    }
    
    console.log('✅ Validações básicas OK');
    setProcessando(true);
    
    try {
      // Verificar se o SDK do Mercado Pago está carregado
      if (!window.MercadoPago) {
        throw new Error('SDK do Mercado Pago não carregado. Recarregue a página.');
      }

      console.log('✅ SDK do Mercado Pago carregado');

      // Inicializar Mercado Pago
      const mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY);
      
      console.log('✅ MercadoPago inicializado com chave:', MERCADOPAGO_PUBLIC_KEY.substring(0, 15) + '...');
      
      // Separar mês e ano da validade
      const [mes, ano] = dadosCartao.validade.split('/');
      
      console.log('📅 Validade:', { mes, ano: '20' + ano });
      
      // Criar objeto cardForm para tokenizar
      const cardData = {
        cardNumber: dadosCartao.numero.replace(/\s/g, ''),
        cardholderName: dadosCartao.nome.toUpperCase(),
        cardExpirationMonth: mes.padStart(2, '0'),
        cardExpirationYear: '20' + ano,
        securityCode: dadosCartao.cvv,
        identificationType: 'CPF',
        identificationNumber: dadosCadastro.cpfResponsavel.replace(/\D/g, '')
      };

      console.log('🔄 Criando token do cartão...');
      console.log('Dados do cartão (sem número/CVV):', {
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.cardExpirationMonth,
        cardExpirationYear: cardData.cardExpirationYear,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber
      });

      // Criar token do cartão
      const response = await mp.createCardToken(cardData);
      
      console.log('📦 Resposta do createCardToken:', response);
      
      if (!response || !response.id) {
        throw new Error('Falha ao criar token do cartão. Verifique os dados e tente novamente.');
      }

      console.log('✅ Token do cartão criado:', response.id);

      // Enviar pagamento para o backend
      console.log('📤 Enviando para backend:', `${API_URL}/api/create-card-payment`);
      
      const paymentResponse = await fetch(`${API_URL}/api/create-card-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardToken: response.id,
          amount: valorTotal,
          installments: parseInt(dadosCartao.parcelas),
          email: dadosCadastro.email,
          nome: dadosCadastro.nomeResponsavel,
          cpf: dadosCadastro.cpfResponsavel.replace(/\D/g, ''),
          instituicaoId: `INST-${Date.now()}`,
          plano: planoSelecionado.nome
        })
      });

      if (!paymentResponse.ok) {
        throw new Error(`Erro HTTP: ${paymentResponse.status}`);
      }

      const data = await paymentResponse.json();

      console.log('📥 Resposta do backend:', data);

      if (data.success && data.payment.status === 'approved') {
        setSucesso(true);
        console.log('✅ Pagamento processado:', data.payment.status);
        
        // Redirecionar para página de sucesso
        setTimeout(() => {
          navigate('/pagamento-sucesso', { 
            state: { 
              dadosCadastro, 
              planoSelecionado,
              metodoPagamento: 'cartao',
              parcelas: dadosCartao.parcelas,
              transacaoId: data.payment.id,
              status: 'approved'
            } 
          });
        }, 2000);
      } else if (data.success && data.payment.status === 'pending') {
        console.log('⏳ Pagamento pendente. Aguardando confirmação da operadora...');
        setSucesso(true);
        iniciarVerificacaoPagamento(data.payment.id, {
          metodoPagamento: 'cartao',
          parcelas: dadosCartao.parcelas
        });
      } else {
        // Pagamento rejeitado ou erro
        const mensagemErro = data.error || data.payment?.status_detail || 'Pagamento recusado. Verifique os dados do cartão.';
        console.error('❌ Pagamento recusado:', mensagemErro);
        setErro(mensagemErro);
      }
    } catch (error) {
      console.error('❌ Erro ao processar cartão:', error);
      let mensagemErro = 'Erro ao processar pagamento. ';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        mensagemErro += 'Verifique sua conexão ou se o backend está rodando.';
      } else if (error.message.includes('token')) {
        mensagemErro += 'Erro ao validar dados do cartão.';
      } else {
        mensagemErro += error.message;
      }
      
      setErro(mensagemErro);
    } finally {
      setProcessando(false);
    }
  };

  // Máscaras de input
  const aplicarMascaraCartao = (valor) => {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{4})(\d)/, '$1 $2');
    valor = valor.replace(/(\d{4})(\d)/, '$1 $2');
    valor = valor.replace(/(\d{4})(\d)/, '$1 $2');
    return valor.substring(0, 19);
  };

  const aplicarMascaraValidade = (valor) => {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{2})(\d)/, '$1/$2');
    return valor.substring(0, 5);
  };

  const aplicarMascaraCVV = (valor) => {
    return valor.replace(/\D/g, '').substring(0, 4);
  };

  const handleChangeCartao = (campo, valor) => {
    if (campo === 'numero') {
      valor = aplicarMascaraCartao(valor);
    } else if (campo === 'validade') {
      valor = aplicarMascaraValidade(valor);
    } else if (campo === 'cvv') {
      valor = aplicarMascaraCVV(valor);
    } else if (campo === 'nome') {
      valor = valor.toUpperCase();
    }
    
    setDadosCartao({ ...dadosCartao, [campo]: valor });
  };

  // Calcular opções de parcelamento
  const opcoesParcelamento = [];
  for (let i = 1; i <= 12; i++) {
    const valorParcela = (valorTotal / i).toFixed(2);
    opcoesParcelamento.push({
      numero: i,
      valor: valorParcela,
      label: i === 1 
        ? `À vista - R$ ${valorTotal.toFixed(2)}` 
        : `${i}x de R$ ${valorParcela} ${i > 3 ? '(com juros)' : 'sem juros'}`
    });
  }

  if (sucesso) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Pagamento Processado!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Aguardando confirmação da operadora...
            </Typography>
            <CircularProgress />
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Cabeçalho */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Finalizar Pagamento
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sistema CEI - Controle Escolar Inteligente - Gerenciamento de Biblioteca
            </Typography>
          </Box>

          {/* Resumo do Pedido */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                📋 Resumo do Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Instituição:</strong> {dadosCadastro.nomeInstituicao}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Plano:</strong> {planoSelecionado.nome}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Duração:</strong> {planoSelecionado.dias} dias
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Valor por dia:</strong> R$ {valorPorDia}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" color="primary" sx={{ textAlign: 'right' }}>
                    Total: R$ {valorTotal.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={abaAtiva} onChange={(e, newValue) => setAbaAtiva(newValue)}>
              <Tab 
                icon={<PixIcon />} 
                label="PIX" 
                iconPosition="start"
              />
              <Tab 
                icon={<CreditCardIcon />} 
                label="Cartão de Crédito" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {erro && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>
              {erro}
            </Alert>
          )}

          {/* Aba PIX */}
          {abaAtiva === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Pagamento via PIX</strong><br />
                  Aprovação instantânea após a confirmação do pagamento
                </Typography>
              </Alert>

              {!pixGerado ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PixIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Clique no botão abaixo para gerar o código PIX
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PaymentIcon />}
                    onClick={gerarPix}
                    disabled={processando}
                  >
                    {processando ? 'Gerando PIX...' : 'Gerar Código PIX'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Grid container spacing={3}>
                    {/* QR Code */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            <strong>Escaneie o QR Code</strong>
                          </Typography>
                          <Box sx={{ 
                            width: 200, 
                            height: 200, 
                            bgcolor: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mx: 'auto',
                            my: 2,
                            border: 2,
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}>
                            {pixQRCode ? (
                              <img 
                                src={pixQRCode} 
                                alt="QR Code PIX" 
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <PixIcon sx={{ fontSize: 100, color: 'primary.main' }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Abra o aplicativo do seu banco e escaneie o código
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Copia e Cola */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            <strong>Ou use o código PIX:</strong>
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={pixCopiaECola}
                            InputProps={{
                              readOnly: true,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={copiarCodigoPix}>
                                    <ContentCopyIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{ mb: 2 }}
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<ContentCopyIcon />}
                            onClick={copiarCodigoPix}
                          >
                            {copiado ? 'Código Copiado!' : 'Copiar Código'}
                          </Button>
                          
                          {verificandoPagamento && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                              <CircularProgress size={24} sx={{ mb: 1 }} />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Aguardando confirmação do pagamento...
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Instruções */}
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        <Typography variant="body2" gutterBottom>
                          <strong>Como pagar:</strong>
                        </Typography>
                        <Typography variant="body2" component="div">
                          1. Abra o aplicativo do seu banco<br />
                          2. Escolha pagar via PIX<br />
                          3. Escaneie o QR Code ou cole o código<br />
                          4. Confirme o pagamento<br />
                          5. Pronto! Seu acesso será liberado automaticamente
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => setPixGerado(false)}
                    >
                      Gerar Novo Código
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Aba Cartão */}
          {abaAtiva === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Pagamento via Cartão de Crédito</strong><br />
                  Parcelamento em até 12x • Aprovação em até 2 minutos
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Número do Cartão"
                    fullWidth
                    required
                    value={dadosCartao.numero}
                    onChange={(e) => handleChangeCartao('numero', e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nome no Cartão"
                    fullWidth
                    required
                    value={dadosCartao.nome}
                    onChange={(e) => handleChangeCartao('nome', e.target.value)}
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Validade"
                    fullWidth
                    required
                    value={dadosCartao.validade}
                    onChange={(e) => handleChangeCartao('validade', e.target.value)}
                    placeholder="MM/AA"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="CVV"
                    fullWidth
                    required
                    value={dadosCartao.cvv}
                    onChange={(e) => handleChangeCartao('cvv', e.target.value)}
                    placeholder="123"
                    type="password"
                    autoComplete="cc-csc"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    label="Parcelamento"
                    fullWidth
                    required
                    value={dadosCartao.parcelas}
                    onChange={(e) => handleChangeCartao('parcelas', e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {opcoesParcelamento.map((opcao) => (
                      <option key={opcao.numero} value={opcao.numero}>
                        {opcao.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="success">
                    <Typography variant="body2">
                      <LockIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                      Pagamento 100% seguro e criptografado
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={processarPagamentoCartao}
                    disabled={processando}
                    startIcon={processando ? <CircularProgress size={20} /> : <PaymentIcon />}
                  >
                    {processando ? 'Processando...' : `Pagar R$ ${valorTotal.toFixed(2)}`}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Rodapé */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Alert severity="info" icon={<LockIcon />}>
              <Typography variant="caption">
                Seus dados estão protegidos com criptografia de ponta a ponta. 
                Não armazenamos dados sensíveis do cartão.
              </Typography>
            </Alert>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="text"
                onClick={() => navigate('/cadastro-escola')}
              >
                ← Voltar para o cadastro
              </Button>
            </Box>
          </Box>

          {/* Marca Registrada */}
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              © {new Date().getFullYear()} CEI - Sistema desenvolvido por
            </Typography>
            <Typography variant="caption" color="primary" display="block" fontWeight="bold">
              Wander Pires Silva Coelho ®
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
