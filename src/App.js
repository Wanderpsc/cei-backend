import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { LicenseProvider } from './context/LicenseContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
import ClientesPage from './pages/ClientesPage';
import EmprestimosPage from './pages/EmprestimosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import BuscaPage from './pages/BuscaPage';
import FinanceiroPage from './pages/FinanceiroPage';
import FinanceiroAdminPage from './pages/FinanceiroAdminPage';
import ConfigurarPlanosPage from './pages/ConfigurarPlanosPage';
import DiagramaSistemaPage from './pages/DiagramaSistemaPage';
import AtivarLicencaPage from './pages/AtivarLicencaPage';

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
  const { usuarioLogado } = useData();
  
  // Primeiro verifica licença, depois login
  return usuarioLogado ? (
    <ProtectedRoute>{children}</ProtectedRoute>
  ) : (
    <Navigate to="/login" />
  );
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
      <Route path="/clientes" element={<PrivateRoute><ClientesPage /></PrivateRoute>} />
      <Route path="/emprestimos" element={<PrivateRoute><EmprestimosPage /></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><RelatoriosPage /></PrivateRoute>} />
      <Route path="/busca" element={<PrivateRoute><BuscaPage /></PrivateRoute>} />
      <Route path="/diagrama-sistema" element={<PrivateRoute><DiagramaSistemaPage /></PrivateRoute>} />
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
