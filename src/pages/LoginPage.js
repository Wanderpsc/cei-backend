import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
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
  keyframes
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { login: fazerLogin } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');
    
    if (fazerLogin(login, senha)) {
      navigate('/');
    } else {
      setErro('Login ou senha inválidos');
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
              Controle Escolar Inteligente
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
      </Container>
    </Box>
  );
}
