import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useData } from '../context/DataContext';
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
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import NotificationsIcon from '@mui/icons-material/Notifications';

const drawerWidth = 240;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { usuarioLogado, logout, instituicoes } = useData();
  const navigate = useNavigate();

  // Construir menu dinâmico baseado no perfil do usuário
  const getMenuItems = () => {
    // Se for Super Admin - Apenas funcionalidades administrativas do negócio
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Gerenciar Escolas', icon: <SchoolIcon />, path: '/gerenciar-escolas' },
        { text: 'Configurar Planos', icon: <SettingsIcon />, path: '/configurar-planos' },
        { text: 'Gestão Financeira', icon: <AccountBalanceWalletIcon />, path: '/financeiro-admin' },
        { text: 'Diagrama do Sistema', icon: <ArchitectureIcon />, path: '/diagrama-sistema' },
      ];
    }

    // Para Escolas - Funcionalidades operacionais (cadastros, empréstimos, etc)
    return [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Financeiro', icon: <AccountBalanceWalletIcon />, path: '/financeiro' },
      { text: 'Livros', icon: <MenuBookIcon />, path: '/livros' },
      { text: 'Patrimônio', icon: <BusinessIcon />, path: '/patrimonio' },
      { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
      { text: 'Empréstimos', icon: <SwapHorizIcon />, path: '/emprestimos' },
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
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            Controle Escolar Inteligente
          </Typography>
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
              width: drawerWidth,
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
        <Box sx={{ flexGrow: 1 }}>
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
            © {new Date().getFullYear()} CEI - Controle Escolar Inteligente
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
