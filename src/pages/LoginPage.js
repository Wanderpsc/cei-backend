import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import InstallPWA from '../components/InstallPWA';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  keyframes,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockResetIcon from '@mui/icons-material/LockReset';
import EmailIcon from '@mui/icons-material/Email';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const DEMO_VIDEOS = [
  {
    id: 'livros',
    titulo: 'Catálogo Inteligente de Livros',
    descricao: 'Cadastro completo, busca avançada e organização por categorias em segundos.',
    metricA: '1.500+ livros',
    metricB: 'Busca em 0,4s',
    destaque: ['Cadastro rápido', 'Filtros inteligentes', 'Localização imediata'],
    gradiente: 'linear-gradient(135deg, #0f2027 0%, #203a43 45%, #2c5364 100%)',
    icon: MenuBookIcon
  },
  {
    id: 'emprestimos',
    titulo: 'Empréstimos e Devoluções em Tempo Real',
    descricao: 'Fluxo rápido para emprestar, devolver, renovar e acompanhar prazos automaticamente.',
    metricA: 'Processo em 12s',
    metricB: 'Alertas automáticos',
    destaque: ['Empréstimo', 'Renovação', 'Devolução com histórico'],
    gradiente: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    icon: AssignmentReturnIcon
  },
  {
    id: 'scanner',
    titulo: 'Scanner Híbrido (Mobile + USB)',
    descricao: 'Leitura de códigos de barras por câmera e leitor laser para máxima produtividade.',
    metricA: 'Modo câmera + USB',
    metricB: 'Leitura instantânea',
    destaque: ['Compatível HID', 'Mobile otimizado', 'Fallback inteligente'],
    gradiente: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    icon: QrCodeScannerIcon
  },
  {
    id: 'relatorios',
    titulo: 'Relatórios Profissionais',
    descricao: 'Relatórios operacionais e gerenciais com impressão padronizada e visão executiva.',
    metricA: 'Insights em 1 clique',
    metricB: 'Impressão A4',
    destaque: ['Gestão de livros', 'Produtividade', 'Auditoria completa'],
    gradiente: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    icon: AssessmentIcon
  },
  {
    id: 'financeiro',
    titulo: 'Financeiro e Indicadores',
    descricao: 'Painéis para gestão financeira, planos, inadimplência e acompanhamento de receita.',
    metricA: 'Dashboard executivo',
    metricB: 'Status em tempo real',
    destaque: ['Planos', 'Receita', 'Inadimplência'],
    gradiente: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
    icon: AccountBalanceWalletIcon
  },
  {
    id: 'fiscal',
    titulo: 'Pagamentos + Nota Fiscal Automática',
    descricao: 'Confirmação de pagamento, emissão de nota e notificações por e-mail e WhatsApp.',
    metricA: 'Pagamento confirmado',
    metricB: 'NF gerada automática',
    destaque: ['PIX/Cartão', 'NFS automática', 'Notificação WhatsApp'],
    gradiente: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    icon: ReceiptLongIcon
  }
];

const CREDENCIAIS_DEMO = {
  login: 'demo',
  senha: 'demo2026'
};

const DEMO_DEVICE_ID_KEY = 'cei_demo_device_id';
const DEMO_CONTACT_KEY = 'cei_demo_contact';

const formatarIdentificadorDemo = (deviceId) => {
  if (!deviceId) return 'Será gerado ao clicar em Usar demo';

  const partes = deviceId.split('-');
  const base = (partes[partes.length - 1] || deviceId).slice(0, 6).toUpperCase();
  return `DEMO-${base}`;
};

export default function LoginPage() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const identificadorDemo = formatarIdentificadorDemo(localStorage.getItem(DEMO_DEVICE_ID_KEY));
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [dialogRecuperacao, setDialogRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erroRecuperacao, setErroRecuperacao] = useState('');
  const [sucessoRecuperacao, setSucessoRecuperacao] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [etapaRecuperacao, setEtapaRecuperacao] = useState(1); // 1: email, 2: nova senha
  const [dialogTourVideo, setDialogTourVideo] = useState(false);
  const [videoSelecionado, setVideoSelecionado] = useState(DEMO_VIDEOS[0]);
  const [dialogCadastroDemo, setDialogCadastroDemo] = useState(false);
  const [erroCadastroDemo, setErroCadastroDemo] = useState('');
  const [cadastroDemo, setCadastroDemo] = useState({
    nomeResponsavel: '',
    telefoneCelular: '',
    email: '',
    cidade: '',
    estado: ''
  });
  const { login: fazerLogin, recuperarSenha, usuarioLogado } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // Se usuário já está logado, redirecionar
  useEffect(() => {
    if (usuarioLogado) {
      const from = location.state?.from?.pathname || '/';
      console.log('👤 Usuário já logado, redirecionando para:', from);
      navigate(from, { replace: true });
    }
  }, [usuarioLogado, navigate, location]);

  useEffect(() => {
    if (!dialogTourVideo) return;

    const intervalo = setInterval(() => {
      setVideoSelecionado((atual) => {
        const idxAtual = DEMO_VIDEOS.findIndex((item) => item.id === atual.id);
        const proximoIndice = idxAtual >= DEMO_VIDEOS.length - 1 ? 0 : idxAtual + 1;
        return DEMO_VIDEOS[proximoIndice];
      });
    }, 7000);

    return () => clearInterval(intervalo);
  }, [dialogTourVideo]);

  useEffect(() => {
    try {
      const contatoSalvo = localStorage.getItem(DEMO_CONTACT_KEY);
      if (!contatoSalvo) return;

      const dados = JSON.parse(contatoSalvo);
      setCadastroDemo((prev) => ({
        ...prev,
        nomeResponsavel: String(dados?.nomeResponsavel || ''),
        telefoneCelular: String(dados?.telefoneCelular || ''),
        email: String(dados?.email || ''),
        cidade: String(dados?.cidade || ''),
        estado: String(dados?.estado || '').toUpperCase().slice(0, 2)
      }));
    } catch (error) {
      console.warn('Não foi possível carregar cadastro demo salvo:', error);
    }
  }, []);

  const aplicarMascaraTelefone = (valor) => {
    const numeros = String(valor || '').replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 10) {
      return numeros
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email || '').trim());
  };

  const validarCadastroDemoObrigatorio = (dados) => {
    const nomeResponsavel = String(dados?.nomeResponsavel || '').trim();
    const telefoneCelular = String(dados?.telefoneCelular || '').trim();
    const email = String(dados?.email || '').trim();
    const cidade = String(dados?.cidade || '').trim();
    const estado = String(dados?.estado || '').trim().toUpperCase();

    if (!nomeResponsavel) return { ok: false, mensagem: 'Informe o nome do responsável pelo cadastro.' };
    if (!telefoneCelular) return { ok: false, mensagem: 'Informe o telefone celular para contato.' };

    const telefoneNumeros = telefoneCelular.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) {
      return { ok: false, mensagem: 'Telefone celular inválido. Use DDD + número.' };
    }

    if (!email) return { ok: false, mensagem: 'Informe o e-mail para contato.' };
    if (!validarEmail(email)) return { ok: false, mensagem: 'E-mail inválido.' };
    if (!cidade) return { ok: false, mensagem: 'Informe a cidade.' };
    if (!estado) return { ok: false, mensagem: 'Informe o estado (UF).' };
    if (estado.length < 2) return { ok: false, mensagem: 'Estado inválido. Use a UF com 2 letras.' };

    return { ok: true };
  };

  const processarLogin = (usuario, senhaUsuario) => {
    if (fazerLogin(usuario, senhaUsuario)) {
      try {
        fetch(`${API_URL}/api/notify-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usuario,
            perfil: 'Autenticado',
            instituicao: 'Login CEI',
            origem: window.location.origin
          })
        }).catch((error) => {
          console.error('Erro ao notificar acesso no backend:', error);
        });
      } catch (error) {
        console.error('Erro ao iniciar notificação de acesso:', error);
      }

      const from = location.state?.from?.pathname || '/';
      console.log('✅ Login realizado, redirecionando para:', from);
      navigate(from, { replace: true });
      return;
    }

    setErro('Login ou senha inválidos');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    const loginNormalizado = String(login || '').trim().toLowerCase();
    const senhaNormalizada = String(senha || '').trim();
    const ehLoginDemo = loginNormalizado === CREDENCIAIS_DEMO.login && senhaNormalizada === CREDENCIAIS_DEMO.senha;

    if (ehLoginDemo) {
      const validacao = validarCadastroDemoObrigatorio(cadastroDemo);
      if (!validacao.ok) {
        setErroCadastroDemo(validacao.mensagem);
        setDialogCadastroDemo(true);
        return;
      }
    }

    processarLogin(login, senha);
  };

  const handleUsarCredenciaisDemo = () => {
    setLogin(CREDENCIAIS_DEMO.login);
    setSenha(CREDENCIAIS_DEMO.senha);
    setErro('');

    const validacao = validarCadastroDemoObrigatorio(cadastroDemo);
    if (!validacao.ok) {
      setErroCadastroDemo(validacao.mensagem);
      setDialogCadastroDemo(true);
      return;
    }

    processarLogin(CREDENCIAIS_DEMO.login, CREDENCIAIS_DEMO.senha);
  };

  const handleConfirmarCadastroDemo = () => {
    const dadosNormalizados = {
      nomeResponsavel: String(cadastroDemo.nomeResponsavel || '').trim(),
      telefoneCelular: aplicarMascaraTelefone(cadastroDemo.telefoneCelular),
      email: String(cadastroDemo.email || '').trim().toLowerCase(),
      cidade: String(cadastroDemo.cidade || '').trim(),
      estado: String(cadastroDemo.estado || '').trim().toUpperCase().slice(0, 2)
    };

    const validacao = validarCadastroDemoObrigatorio(dadosNormalizados);
    if (!validacao.ok) {
      setErroCadastroDemo(validacao.mensagem);
      return;
    }

    try {
      localStorage.setItem(DEMO_CONTACT_KEY, JSON.stringify({
        ...dadosNormalizados,
        capturadoEm: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Não foi possível salvar os dados do cadastro demo:', error);
    }

    setCadastroDemo(dadosNormalizados);
    setErroCadastroDemo('');
    setDialogCadastroDemo(false);
    setLogin(CREDENCIAIS_DEMO.login);
    setSenha(CREDENCIAIS_DEMO.senha);
    processarLogin(CREDENCIAIS_DEMO.login, CREDENCIAIS_DEMO.senha);
  };

  const handleAbrirRecuperacao = () => {
    setDialogRecuperacao(true);
    setEmailRecuperacao('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setErroRecuperacao('');
    setSucessoRecuperacao('');
    setEtapaRecuperacao(1);
  };

  const handleFecharRecuperacao = () => {
    setDialogRecuperacao(false);
    setEmailRecuperacao('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setErroRecuperacao('');
    setSucessoRecuperacao('');
    setEtapaRecuperacao(1);
  };

  const handleVerificarEmail = () => {
    setErroRecuperacao('');
    
    if (!emailRecuperacao.trim()) {
      setErroRecuperacao('Por favor, informe o email cadastrado');
      return;
    }

    // Verificar se o email existe
    const resultado = recuperarSenha(emailRecuperacao);
    
    if (resultado.sucesso) {
      setEtapaRecuperacao(2);
      setSucessoRecuperacao(`Email encontrado! Escola: ${resultado.escola}`);
    } else {
      setErroRecuperacao(resultado.mensagem);
    }
  };

  const handleRedefinirSenha = () => {
    setErroRecuperacao('');
    
    if (!novaSenha || !confirmarNovaSenha) {
      setErroRecuperacao('Por favor, preencha todos os campos');
      return;
    }

    if (novaSenha.length < 8) {
      setErroRecuperacao('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!/[A-Z]/.test(novaSenha)) {
      setErroRecuperacao('A senha deve conter pelo menos 1 letra maiúscula');
      return;
    }

    if (!/[a-z]/.test(novaSenha)) {
      setErroRecuperacao('A senha deve conter pelo menos 1 letra minúscula');
      return;
    }

    if (!/[0-9]/.test(novaSenha)) {
      setErroRecuperacao('A senha deve conter pelo menos 1 número');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(novaSenha)) {
      setErroRecuperacao('A senha deve conter pelo menos 1 caractere especial');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroRecuperacao('As senhas não coincidem');
      return;
    }

    // Redefinir a senha
    const resultado = recuperarSenha(emailRecuperacao, novaSenha);
    
    if (resultado.sucesso) {
      setSucessoRecuperacao('Senha redefinida com sucesso! Você já pode fazer login.');
      setTimeout(() => {
        handleFecharRecuperacao();
      }, 2000);
    } else {
      setErroRecuperacao(resultado.mensagem);
    }
  };

  const fadeIn = keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  const float = keyframes`
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  `;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-250px',
          right: '-250px',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          bottom: '-200px',
          left: '-200px',
        }
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={24}
          sx={{ 
            p: 5,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            animation: `${fadeIn} 0.8s ease-out`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-block',
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mb: 2,
                animation: `${float} 3s ease-in-out infinite`,
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              CEI
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="500">
              Controle Escolar Inteligente - Gerenciamento de Biblioteca
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Bem-vindo! Faça login para continuar
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              ACESSO DEMONSTRAÇÃO
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Login: {CREDENCIAIS_DEMO.login} | Senha: {CREDENCIAIS_DEMO.senha}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Teste por 30 dias com até 20 livros, 20 leitores e movimentação completa de empréstimos/devoluções.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5, fontWeight: 700 }}>
              Sessão demo deste dispositivo: cada cliente usa um perfil de demonstração próprio.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Identificador da sessão demo: {identificadorDemo}
            </Typography>
            <Box sx={{ mt: 1.2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" onClick={handleUsarCredenciaisDemo}>
                Usar demo
              </Button>
            </Box>
          </Alert>

          {erro && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erro}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Login"
              fullWidth
              margin="normal"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoComplete="username"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }
                }
              }}
            />
            <TextField
              label="Senha"
              type={mostrarSenha ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="alternar visibilidade da senha"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)',
                        }
                      }}
                    >
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleAbrirRecuperacao}
                sx={{
                  color: 'primary.main',
                  fontWeight: 500,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark',
                  }
                }}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<LoginIcon />}
              sx={{ 
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                }
              }}
            >
              Entrar no Sistema
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Sua instituição ainda não está cadastrada?
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/termos-de-uso')}
              sx={{
                borderRadius: 2,
                py: 1,
                borderWidth: 2,
                fontWeight: 600,
                borderColor: 'primary.main',
                color: 'primary.main',
                transition: 'all 0.3s',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'primary.dark',
                  background: 'rgba(102, 126, 234, 0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                }
              }}
            >
              Cadastrar Nova Instituição
            </Button>

            <Button
              variant="contained"
              fullWidth
              startIcon={<SmartDisplayIcon />}
              onClick={() => setDialogTourVideo(true)}
              sx={{
                mt: 1.5,
                borderRadius: 2,
                py: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
                boxShadow: '0 8px 24px rgba(0, 114, 255, 0.35)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px rgba(0, 114, 255, 0.45)',
                  background: 'linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)',
                }
              }}
            >
              Ver Tour em Vídeo do Sistema
            </Button>
          </Box>

          {/* Instalar PWA */}
          <InstallPWA />
          
          {/* Marca Registrada */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              © {new Date().getFullYear()} CEI - Sistema desenvolvido por
            </Typography>
            <Typography 
              variant="caption" 
              display="block" 
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '0.9rem',
              }}
            >
              Wander Pires Silva Coelho ®
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Todos os direitos reservados
            </Typography>
          </Box>
        </Paper>

        {/* Dialog de Recuperação de Senha */}
        <Dialog
          open={dialogCadastroDemo}
          onClose={() => setDialogCadastroDemo(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            Cadastro Obrigatório para Acesso Demo
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Para usar a demonstração, informe seus dados de contato. Eles aparecerão no painel do Super Administrador para retorno comercial.
            </Alert>

            {erroCadastroDemo && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErroCadastroDemo('')}>
                {erroCadastroDemo}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Nome do Responsável pelo Cadastro *"
                fullWidth
                required
                value={cadastroDemo.nomeResponsavel}
                onChange={(e) => setCadastroDemo((prev) => ({ ...prev, nomeResponsavel: e.target.value }))}
                placeholder="Ex: Maria Silva"
              />
              <TextField
                label="Telefone Celular *"
                fullWidth
                required
                value={cadastroDemo.telefoneCelular}
                onChange={(e) => setCadastroDemo((prev) => ({
                  ...prev,
                  telefoneCelular: aplicarMascaraTelefone(e.target.value)
                }))}
                placeholder="(99) 9 9999-9999"
                inputProps={{ maxLength: 16 }}
              />
              <TextField
                label="E-mail *"
                type="email"
                fullWidth
                required
                value={cadastroDemo.email}
                onChange={(e) => setCadastroDemo((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="contato@escola.com.br"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Cidade *"
                  fullWidth
                  required
                  value={cadastroDemo.cidade}
                  onChange={(e) => setCadastroDemo((prev) => ({ ...prev, cidade: e.target.value }))}
                />
                <TextField
                  label="Estado (UF) *"
                  fullWidth
                  required
                  value={cadastroDemo.estado}
                  onChange={(e) => setCadastroDemo((prev) => ({
                    ...prev,
                    estado: String(e.target.value || '').toUpperCase().slice(0, 2)
                  }))}
                  placeholder="PI"
                  inputProps={{ maxLength: 2 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogCadastroDemo(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleConfirmarCadastroDemo}>
              Salvar e Entrar no Demo
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={dialogRecuperacao} 
          onClose={handleFecharRecuperacao}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            pb: 1 
          }}>
            <LockResetIcon sx={{ color: 'primary.main', fontSize: 30 }} />
            <Typography variant="h5" fontWeight="bold">
              Recuperar Senha
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            {etapaRecuperacao === 1 ? (
              // Etapa 1: Verificar email
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Digite o email cadastrado da sua instituição para recuperar a senha.
                </Typography>

                {erroRecuperacao && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {erroRecuperacao}
                  </Alert>
                )}

                <TextField
                  label="Email da Instituição"
                  type="email"
                  fullWidth
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  placeholder="email@escola.com.br"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </>
            ) : (
              // Etapa 2: Redefinir senha
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {sucessoRecuperacao}
                </Alert>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Agora defina uma nova senha de acesso.
                </Typography>

                {erroRecuperacao && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {erroRecuperacao}
                  </Alert>
                )}

                <TextField
                  label="Nova Senha"
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  fullWidth
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                          edge="end"
                        >
                          {mostrarNovaSenha ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  label="Confirmar Nova Senha"
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  fullWidth
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Digite a senha novamente"
                />
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleFecharRecuperacao}
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            {etapaRecuperacao === 1 ? (
              <Button 
                variant="contained"
                onClick={handleVerificarEmail}
                disabled={!emailRecuperacao.trim()}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Verificar Email
              </Button>
            ) : (
              <Button 
                variant="contained"
                onClick={handleRedefinirSenha}
                disabled={!novaSenha || !confirmarNovaSenha}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Redefinir Senha
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={dialogTourVideo}
          onClose={() => setDialogTourVideo(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon />
              <Typography variant="h6" fontWeight="bold">
                CEI Experience - Tour Completo de Funcionalidades
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogTourVideo(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, bgcolor: '#f6f9ff' }}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                  bgcolor: 'black',
                  minHeight: 300,
                  background: videoSelecionado.gradiente,
                  color: 'white',
                  position: 'relative'
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {(() => {
                      const IconComp = videoSelecionado.icon;
                      return <IconComp sx={{ fontSize: 36 }} />;
                    })()}
                    <Typography variant="h5" fontWeight="bold">Demonstração Inteligente CEI</Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 2
                    }}
                  >
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>Performance</Typography>
                      <Typography variant="h6" fontWeight="bold">{videoSelecionado.metricA}</Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>Tecnologia</Typography>
                      <Typography variant="h6" fontWeight="bold">{videoSelecionado.metricB}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.25)' }}>
                    {videoSelecionado.destaque.map((item) => (
                      <Typography key={item} variant="body2" sx={{ mb: 0.8 }}>
                        • {item}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[1, 2, 3].map((bar) => (
                      <Box
                        key={bar}
                        sx={{
                          height: 8,
                          flex: 1,
                          borderRadius: 99,
                          bgcolor: 'rgba(255,255,255,0.25)',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${65 + bar * 10}%`,
                            borderRadius: 99,
                            bgcolor: '#7cf3ff',
                            boxShadow: '0 0 12px rgba(124,243,255,0.9)',
                            transition: 'all 0.8s ease'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 1.5, mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {videoSelecionado.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {videoSelecionado.descricao}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 1.2
                }}
              >
                {DEMO_VIDEOS.map((video) => (
                  <Button
                    key={video.id}
                    variant={videoSelecionado.id === video.id ? 'contained' : 'outlined'}
                    startIcon={<SmartDisplayIcon />}
                    onClick={() => {
                      setVideoSelecionado(video);
                    }}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1,
                      px: 1.5,
                      fontWeight: 600
                    }}
                  >
                    {video.titulo}
                  </Button>
                ))}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 1.5, bgcolor: '#f6f9ff' }}>
            <Button
              variant="contained"
              onClick={() => {
                setDialogTourVideo(false);
                navigate('/termos-de-uso');
              }}
              startIcon={<PersonAddIcon />}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Quero Adquirir o Sistema
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
