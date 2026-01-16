import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { LicenseProvider } from './context/LicenseContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Componentes
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import LoginPage from './pages/LoginPage';
import TermosDeUsoPage from './pages/TermosDeUsoPage';
import CadastroEscolaPage from './pages/CadastroEscolaPage';
import PagamentoPage from './pages/PagamentoPage';
import PagamentoSucessoPage from './pages/PagamentoSucessoPage';
import GerenciarEscolasPage from './pages/GerenciarEscolasPage';
import DashboardPage from './pages/DashboardPage';
import LivrosPage from './pages/LivrosPage';
import PatrimonioPage from './pages/PatrimonioPage';
import LeitoresPage from './pages/LeitoresPage';
import EmprestimosPage from './pages/EmprestimosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import BuscaPage from './pages/BuscaPage';
import FinanceiroPage from './pages/FinanceiroPage';
import FinanceiroAdminPage from './pages/FinanceiroAdminPage';
import ConfigurarPlanosPage from './pages/ConfigurarPlanosPage';
import DiagramaSistemaPage from './pages/DiagramaSistemaPage';
import AtivarLicencaPage from './pages/AtivarLicencaPage';
import LimparDuplicatasPage from './pages/LimparDuplicatasPage';
import ClubeDeLeituraPage from './pages/ClubeDeLeituraPage';
import RelatoriosLivrosPage from './pages/RelatoriosLivrosPage';
import NotaFiscalPage from './pages/NotaFiscalPage';
import DevolucaoPage from './pages/DevolucaoPage';
import GerenciarUsuariosPage from './pages/GerenciarUsuariosPage';
import RelatorioUsuariosPage from './pages/RelatorioUsuariosPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", "Arial", sans-serif',
  },
});

function PrivateRoute({ children }) {
  const { usuarioLogado, autenticacaoCarregada } = useData();
  const location = useLocation();
  
  // Log detalhado para debug
  console.log('🔍 PrivateRoute - Verificando acesso:', {
    pathname: location.pathname,
    autenticacaoCarregada,
    usuarioLogado: usuarioLogado ? usuarioLogado.nome : 'null'
  });
  
  // Aguardar autenticação ser carregada do localStorage
  if (!autenticacaoCarregada) {
    console.log('⏳ Aguardando autenticação carregar...');
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Typography variant="h6" color="white">Carregando...</Typography>
      </Box>
    );
  }
  
  // Verificar se está logado
  if (!usuarioLogado) {
    // Salvar a localização de onde veio para redirecionar após login
    console.log('🔒 Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Se está logado, verificar licença
  console.log('✅ Usuário autenticado:', usuarioLogado.nome, '- Verificando licença...');
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas (sem proteção de licença) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ativar-licenca" element={<AtivarLicencaPage />} />
      <Route path="/termos-de-uso" element={<TermosDeUsoPage />} />
      <Route path="/cadastro-escola" element={<CadastroEscolaPage />} />
      <Route path="/pagamento" element={<PagamentoPage />} />
      <Route path="/pagamento-sucesso" element={<PagamentoSucessoPage />} />
      
      {/* Rotas privadas (requerem login + licença) */}
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/gerenciar-escolas" element={<PrivateRoute><GerenciarEscolasPage /></PrivateRoute>} />
      <Route path="/configurar-planos" element={<PrivateRoute><ConfigurarPlanosPage /></PrivateRoute>} />
      <Route path="/financeiro-admin" element={<PrivateRoute><FinanceiroAdminPage /></PrivateRoute>} />
      <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
      <Route path="/livros" element={<PrivateRoute><LivrosPage /></PrivateRoute>} />
      <Route path="/patrimonio" element={<PrivateRoute><PatrimonioPage /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><LeitoresPage /></PrivateRoute>} />
      <Route path="/emprestimos" element={<PrivateRoute><EmprestimosPage /></PrivateRoute>} />
      <Route path="/devolucoes" element={<PrivateRoute><DevolucaoPage /></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><RelatoriosPage /></PrivateRoute>} />
      <Route path="/busca" element={<PrivateRoute><BuscaPage /></PrivateRoute>} />
      <Route path="/diagrama-sistema" element={<PrivateRoute><DiagramaSistemaPage /></PrivateRoute>} />
      <Route path="/limpar-duplicatas" element={<PrivateRoute><LimparDuplicatasPage /></PrivateRoute>} />
      <Route path="/clube-leitura" element={<PrivateRoute><ClubeDeLeituraPage /></PrivateRoute>} />
      <Route path="/relatorios-livros" element={<PrivateRoute><RelatoriosLivrosPage /></PrivateRoute>} />
      <Route path="/notas-fiscais" element={<PrivateRoute><NotaFiscalPage /></PrivateRoute>} />
      <Route path="/gerenciar-usuarios" element={<PrivateRoute><GerenciarUsuariosPage /></PrivateRoute>} />
      <Route path="/relatorio-usuarios" element={<PrivateRoute><RelatorioUsuariosPage /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <LicenseProvider>
          <AppRoutes />
        </LicenseProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
