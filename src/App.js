import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { LicenseProvider } from './context/LicenseContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Componentes
import ProtectedRoute from './components/ProtectedRoute';
import UpdateNotification from './components/UpdateNotification';

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
import EmprestimoDidaticoLotePage from './pages/EmprestimoDidaticoLotePage';
import SeriesTurmasPage from './pages/SeriesTurmasPage';
import GerenciarUsuariosPage from './pages/GerenciarUsuariosPage';
import RelatorioUsuariosPage from './pages/RelatorioUsuariosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import ConfiguracoesNuvemPage from './pages/ConfiguracoesNuvemPage';

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

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/gerenciar-escolas': 'Gerenciar Escolas',
  '/configurar-planos': 'Configurar Planos',
  '/financeiro-admin': 'Financeiro Admin',
  '/financeiro': 'Financeiro',
  '/livros': 'Livros',
  '/patrimonio': 'Patrimônio',
  '/clientes': 'Leitores',
  '/series-turmas': 'Séries e Turmas',
  '/emprestimos': 'Empréstimos Individuais',
  '/emprestimos-didaticos-lote': 'Empréstimos Didáticos em Lote',
  '/devolucoes': 'Devoluções',
  '/relatorios': 'Relatórios',
  '/busca': 'Busca',
  '/diagrama-sistema': 'Diagrama do Sistema',
  '/limpar-duplicatas': 'Limpar Duplicatas',
  '/clube-leitura': 'Clube de Leitura',
  '/relatorios-livros': 'Relatórios de Livros',
  '/notas-fiscais': 'Notas Fiscais',
  '/gerenciar-usuarios': 'Gerenciar Usuários',
  '/relatorio-usuarios': 'Relatório de Usuários',
  '/configuracoes': 'Configurações',
  '/configuracoes/nuvem': 'Nuvem e Sincronização'
};

function PrivateRoute({ children }) {
  const { usuarioLogado, autenticacaoCarregada, registrarAcessoPagina } = useData();
  const location = useLocation();

  const isAdminDaEscola = (
    usuarioLogado?.tipo === 'master' ||
    usuarioLogado?.perfil === 'Admin' ||
    usuarioLogado?.perfil === 'AdminEscola'
  );

  const permissoesUsuario = Array.isArray(usuarioLogado?.permissoes) ? usuarioLogado.permissoes : null;

  const temPermissaoRota = () => {
    if (!usuarioLogado) {
      return false;
    }

    if (usuarioLogado.perfil === 'SuperAdmin' || isAdminDaEscola) {
      return true;
    }

    if (!permissoesUsuario || permissoesUsuario.length === 0) {
      return true; // usuários legados sem permissões explícitas
    }

    // Compatibilidade: quem já tinha acesso a empréstimos pode acessar o lote didático.
    if (
      location.pathname === '/emprestimos-didaticos-lote' &&
      permissoesUsuario.includes('/emprestimos')
    ) {
      return true;
    }

    // Compatibilidade: quem já tinha acesso a leitores pode acessar séries/turmas.
    if (
      location.pathname === '/series-turmas' &&
      permissoesUsuario.includes('/clientes')
    ) {
      return true;
    }

    if (
      location.pathname.startsWith('/configuracoes/') &&
      permissoesUsuario.includes('/configuracoes')
    ) {
      return true;
    }

    return location.pathname === '/' || permissoesUsuario.includes(location.pathname);
  };
  
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

  if (!temPermissaoRota()) {
    console.log('⛔ Acesso negado por permissão para rota:', location.pathname);
    return <Navigate to="/" replace />;
  }

  React.useEffect(() => {
    if (!usuarioLogado || !autenticacaoCarregada) return;
    registrarAcessoPagina(location.pathname, ROUTE_TITLES[location.pathname] || location.pathname);
  }, [location.pathname, usuarioLogado?.id, autenticacaoCarregada, registrarAcessoPagina]);

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
      <Route path="/series-turmas" element={<PrivateRoute><SeriesTurmasPage /></PrivateRoute>} />
      <Route path="/emprestimos" element={<PrivateRoute><EmprestimosPage /></PrivateRoute>} />
      <Route path="/emprestimos-didaticos-lote" element={<PrivateRoute><EmprestimoDidaticoLotePage /></PrivateRoute>} />
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
      <Route path="/configuracoes" element={<PrivateRoute><ConfiguracoesPage /></PrivateRoute>} />
      <Route path="/configuracoes/nuvem" element={<PrivateRoute><ConfiguracoesNuvemPage /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <LicenseProvider>
          <UpdateNotification />
          <AppRoutes />
        </LicenseProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
