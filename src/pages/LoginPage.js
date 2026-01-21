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

export default function LoginPage() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');
    
    if (fazerLogin(login, senha)) {
      // Redirecionar para a página de origem ou para home
      const from = location.state?.from?.pathname || '/';
      console.log('✅ Login realizado, redirecionando para:', from);
      navigate(from, { replace: true });
    } else {
      setErro('Login ou senha inválidos');
    }
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

    if (novaSenha.length < 6) {
      setErroRecuperacao('A senha deve ter no mínimo 6 caracteres');
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
      </Container>
    </Box>
  );
}
