import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useData } from '../context/DataContext';
import AvisoLicenca from './AvisoLicenca';
import SyncStatus from './SyncStatus';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Grid
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CloudIcon from '@mui/icons-material/Cloud';
import LabelIcon from '@mui/icons-material/Label';

const drawerWidth = 240;
const mobileDrawerWidth = 200;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [quickAccessBarHeight, setQuickAccessBarHeight] = useState(0);
  const quickAccessBarRef = useRef(null);
  const { usuarioLogado, logout, instituicoes } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // Construir menu dinâmico baseado no perfil do usuário
  const getMenuItems = () => {
    // Se for Super Admin - Apenas funcionalidades administrativas do negócio
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Relatório Usuários', icon: <HistoryEduIcon />, path: '/relatorio-usuarios' },
        { text: 'Gerenciar Escolas', icon: <SchoolIcon />, path: '/gerenciar-escolas' },
        { text: 'Configurar Planos', icon: <SettingsIcon />, path: '/configurar-planos' },
        { text: 'Gestão Financeira', icon: <AccountBalanceWalletIcon />, path: '/financeiro-admin' },
        { text: 'Notas Fiscais (ISS)', icon: <ReceiptIcon />, path: '/notas-fiscais' },
        { text: 'Diagrama do Sistema', icon: <ArchitectureIcon />, path: '/diagrama-sistema' },
      ];
    }

    // Para Escolas - Funcionalidades operacionais (cadastros, empréstimos, etc)
    return [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
      { text: 'Nuvem e Sync', icon: <CloudIcon />, path: '/configuracoes/nuvem' },
      { text: 'Gerenciar Usuários', icon: <PeopleIcon />, path: '/gerenciar-usuarios' },
      { text: 'Relatório Usuários', icon: <AssessmentIcon />, path: '/relatorio-usuarios' },
      { text: 'Financeiro', icon: <AccountBalanceWalletIcon />, path: '/financeiro' },
      { text: 'Livros', icon: <MenuBookIcon />, path: '/livros' },
      { text: 'Planilha de Livros', icon: <LibraryBooksIcon />, path: '/relatorios-livros' },
      { text: 'Etiquetas', icon: <LabelIcon />, path: '/etiquetas' },
      { text: 'Patrimônio', icon: <BusinessIcon />, path: '/patrimonio' },
      { text: 'Leitores', icon: <PeopleIcon />, path: '/clientes' },
      { text: 'Séries e Turmas', icon: <SchoolIcon />, path: '/series-turmas' },
      { text: 'Empréstimos Individuais', icon: <SwapHorizIcon />, path: '/emprestimos' },
      { text: 'Empréstimos Didáticos em Lote', icon: <FactCheckIcon />, path: '/emprestimos-didaticos-lote' },
      { text: 'Devoluções', icon: <AssignmentReturnIcon />, path: '/devolucoes' },
      { text: 'Clube de Leitura', icon: <EmojiEventsIcon />, path: '/clube-leitura' },
      { text: 'Busca', icon: <SearchIcon />, path: '/busca' },
      { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios' },
    ];
  };

  const menuItems = getMenuItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Atalhos rápidos para clientes
  const quickAccessCards = usuarioLogado?.perfil !== 'SuperAdmin' ? [
    { label: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes', color: '#667eea' },
    { label: 'Usuários', icon: <PeopleIcon />, path: '/gerenciar-usuarios', color: '#9c27b0' },
    { label: 'Logs', icon: <HistoryEduIcon />, path: '/relatorio-usuarios', color: '#00897b' },
    { label: 'Livros', icon: <MenuBookIcon />, path: '/livros', color: '#1976d2' },
    { label: 'Patrimônio', icon: <InventoryIcon />, path: '/patrimonio', color: '#388e3c' },
    { label: 'Leitores', icon: <PeopleIcon />, path: '/clientes', color: '#f57c00' },
    { label: 'Séries/Turmas', icon: <SchoolIcon />, path: '/series-turmas', color: '#8d6e63' },
    { label: 'Emp. Individual', icon: <AssignmentIcon />, path: '/emprestimos', color: '#7b1fa2', shortcut: 'E' },
    { label: 'Emp. em Lote', icon: <FactCheckIcon />, path: '/emprestimos-didaticos-lote', color: '#3949ab', shortcut: 'L' },
    { label: 'Devoluções', icon: <AssignmentReturnIcon />, path: '/devolucoes', color: '#d32f2f' },
    { label: 'Clube Leitura', icon: <EmojiEventsIcon />, path: '/clube-leitura', color: '#ffa726' },
    { label: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios', color: '#5c6bc0' },
    { label: 'Planilha de Livros', icon: <LibraryBooksIcon />, path: '/relatorios-livros', color: '#26a69a' },
    { label: 'Etiquetas', icon: <LabelIcon />, path: '/etiquetas', color: '#8e24aa' },
    { label: 'Busca', icon: <SearchIcon />, path: '/busca', color: '#ab47bc' },
    { label: 'Financeiro', icon: <AccountBalanceWalletIcon />, path: '/financeiro', color: '#66bb6a' },
  ] : [];

  // Atalhos rápidos para SuperAdmin
  const quickAccessCardsAdmin = usuarioLogado?.perfil === 'SuperAdmin' ? [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/', color: '#667eea' },
    { label: 'Logs', icon: <HistoryEduIcon />, path: '/relatorio-usuarios', color: '#00897b' },
    { label: 'Escolas', icon: <SchoolIcon />, path: '/gerenciar-escolas', color: '#1976d2' },
    { label: 'Planos', icon: <SettingsIcon />, path: '/configurar-planos', color: '#f57c00' },
    { label: 'Financeiro', icon: <AccountBalanceWalletIcon />, path: '/financeiro-admin', color: '#66bb6a' },
    { label: 'Notas Fiscais', icon: <ReceiptIcon />, path: '/notas-fiscais', color: '#9c27b0' },
    { label: 'Diagrama', icon: <ArchitectureIcon />, path: '/diagrama-sistema', color: '#5c6bc0' },
  ] : [];

  const quickAccessItems = usuarioLogado?.perfil === 'SuperAdmin'
    ? quickAccessCardsAdmin
    : quickAccessCards;

  useEffect(() => {
    if (!Array.isArray(quickAccessItems) || quickAccessItems.length === 0) {
      return undefined;
    }

    const atalhos = quickAccessItems.reduce((acc, item) => {
      const atalho = String(item.shortcut || '').trim().toLowerCase();
      if (atalho) {
        acc[atalho] = item.path;
      }
      return acc;
    }, {});

    if (Object.keys(atalhos).length === 0) {
      return undefined;
    }

    const handleShortcut = (event) => {
      if (!event.altKey) return;

      const key = String(event.key || '').toLowerCase();
      const path = atalhos[key];
      if (!path) return;

      event.preventDefault();
      navigate(path);
      setMobileOpen(false);
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [quickAccessItems, navigate]);

  useEffect(() => {
    if (!quickAccessItems.length) {
      setQuickAccessBarHeight(0);
      return undefined;
    }

    const quickBar = quickAccessBarRef.current;
    if (!quickBar) {
      return undefined;
    }

    const updateQuickAccessHeight = () => {
      const currentHeight = Math.ceil(quickBar.getBoundingClientRect().height || 0);
      setQuickAccessBarHeight(currentHeight);
    };

    updateQuickAccessHeight();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateQuickAccessHeight);
      resizeObserver.observe(quickBar);
    }

    window.addEventListener('resize', updateQuickAccessHeight);

    return () => {
      window.removeEventListener('resize', updateQuickAccessHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [quickAccessItems.length]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      
      {/* Perfil do Usuário */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 2,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            fontSize: '2rem',
            fontWeight: 'bold',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          {usuarioLogado?.nome?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'white' }}>
          {usuarioLogado?.nome || 'Usuário'}
        </Typography>
        <Chip
          label={usuarioLogado?.perfil || 'Usuário'}
          size="small"
          sx={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        />
      </Box>
      
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
      
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                color: 'white',
                transition: 'all 0.3s',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateX(8px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 1, fontSize: 32, display: { xs: 'none', sm: 'block' } }} />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: '0.5px',
              display: { xs: 'none', md: 'block' },
              flexGrow: 1
            }}
          >
            Controle Escolar Inteligente - Gerenciamento de Biblioteca
          </Typography>
          
          {/* Status de Sincronização */}
          <Box sx={{ mr: 2 }}>
            <SyncStatus />
          </Box>

          <IconButton 
            color="inherit"
            sx={{
              mr: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <NotificationsIcon />
          </IconButton>
          <IconButton 
            color="inherit"
            sx={{
              mr: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <SettingsIcon />
          </IconButton>
          <IconButton 
            onClick={handleMenu} 
            color="inherit"
            sx={{
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                fontWeight: 'bold',
              }}
            >
              {usuarioLogado?.nome?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" fontWeight="600">
                  {usuarioLogado?.nome || 'Usuário'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {usuarioLogado?.perfil || 'Perfil'}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                '&:hover': {
                  background: 'rgba(239, 68, 68, 0.08)',
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Barra de Atalhos Rápidos - Padrão para todos os perfis */}
      {quickAccessItems.length > 0 && (
        <Box
          ref={quickAccessBarRef}
          sx={{
            position: 'fixed',
            top: { xs: 56, sm: 64 },
            width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: '#f5f7fa',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            py: { xs: 1, sm: 1.2 },
            px: { xs: 1, sm: 2 },
            zIndex: 1100,
          }}
        >
          <Grid container spacing={{ xs: 0.8, sm: 1.1 }} justifyContent="center">
            {quickAccessItems.map((card, index) => (
              <Grid item key={index}>
                <Card
                  sx={{
                    position: 'relative',
                    width: { xs: 135, sm: 155 },
                    minHeight: { xs: 50, sm: 58 },
                    boxShadow: location.pathname === card.path ? 4 : 1,
                    transition: 'all 0.2s',
                    border: location.pathname === card.path ? `2px solid ${card.color}` : 'none',
                    background: location.pathname === card.path ? `linear-gradient(135deg, ${card.color}15, ${card.color}08)` : 'white',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      navigate(card.path);
                      setMobileOpen(false);
                    }}
                    title={card.shortcut ? `Atalho: Alt+${card.shortcut}` : undefined}
                    sx={{ 
                      px: { xs: 0.9, sm: 1.1 }, 
                      py: { xs: 0.5, sm: 0.6 },
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: { xs: 0.4, sm: 0.5 },
                    }}
                  >
                    <Box sx={{ 
                      color: card.color, 
                      display: 'flex', 
                      flexShrink: 0,
                      transform: location.pathname === card.path ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s'
                    }}>
                      {React.cloneElement(card.icon, { sx: { fontSize: { xs: 20, sm: 22 } } })}
                    </Box>
                    <Typography 
                      variant="caption" 
                      fontWeight={location.pathname === card.path ? 700 : 600}
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        lineHeight: 1.2,
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        maxWidth: { xs: 105, sm: 125 },
                        color: location.pathname === card.path ? card.color : 'inherit',
                      }}
                    >
                      {card.label}
                    </Typography>
                    {card.shortcut && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 3,
                          right: 4,
                          borderRadius: 1,
                          px: 0.5,
                          py: 0.1,
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          lineHeight: 1,
                          color: card.color,
                          bgcolor: `${card.color}22`,
                          border: `1px solid ${card.color}55`
                        }}
                      >
                        Alt+{card.shortcut}
                      </Box>
                    )}
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: mobileDrawerWidth,
              background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        }}
      >
        <Toolbar />
        {/* Espaço adicional quando há barra de atalhos - altura para 2 linhas */}
        {quickAccessItems.length > 0 && (
          <Box sx={{ height: quickAccessBarHeight > 0 ? `${quickAccessBarHeight + 12}px` : { xs: 130, sm: 145 } }} />
        )}
        <Box sx={{ flexGrow: 1 }}>
          {/* Aviso de Licença */}
          <AvisoLicenca />
          
          {children}
        </Box>
        
        {/* Rodapé com Marca Registrada */}
        <Box 
          component="footer" 
          sx={{ 
            mt: 4, 
            py: 2, 
            borderTop: '2px solid',
            borderColor: 'divider',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight="600">
            © {new Date().getFullYear()} CEI - Controle Escolar Inteligente - Gerenciamento de Biblioteca
          </Typography>
          <Typography 
            variant="caption" 
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}
          >
            Sistema desenvolvido e patenteado por Wander Pires Silva Coelho
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Todos os direitos reservados ®
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
