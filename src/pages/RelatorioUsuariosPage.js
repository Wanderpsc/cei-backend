import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Alert,
  Grid,
  Avatar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Timeline,
  Person,
  Book,
  SwapHoriz,
  Edit,
  Delete,
  Add,
  AssignmentReturn,
  Login,
  Logout,
  Visibility,
  Print
} from '@mui/icons-material';
import { imprimirEscopo } from '../utils/printUtils';

export default function RelatorioUsuariosPage() {
  const { 
    usuarioLogado, 
    instituicaoAtiva,
    usuarios,
    logAtividades
  } = useData();

  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [filtroAcao, setFiltroAcao] = useState('todas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handleImprimir = () => {
    imprimirEscopo();
  };

  // Verificar se é usuário master
  const isMaster = usuarioLogado?.tipo === 'master' || usuarioLogado?.perfil === 'Admin';

  // Filtrar usuários e logs da instituição ativa
  const usuariosDaInstituicao = (usuarios || []).filter(u => 
    u.instituicaoId === instituicaoAtiva && u.perfil !== 'SuperAdmin'
  );

  const logsFiltrados = (logAtividades || [])
    .filter(log => log.instituicaoId === instituicaoAtiva)
    .filter(log => filtroUsuario === 'todos' || log.usuarioId === parseInt(filtroUsuario))
    .filter(log => filtroAcao === 'todas' || log.acao === filtroAcao)
    .filter(log => {
      if (!dataInicio && !dataFim) return true;
      const dataLog = new Date(log.dataHora);
      const inicio = dataInicio ? new Date(dataInicio) : null;
      const fim = dataFim ? new Date(dataFim) : null;
      
      if (inicio && dataLog < inicio) return false;
      if (fim && dataLog > fim) return false;
      return true;
    })
    .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  const getUsuarioNome = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.nome : 'Usuário Desconhecido';
  };

  const getIconeAcao = (acao) => {
    switch (acao) {
      case 'acesso': return <Visibility sx={{ fontSize: 20 }} />;
      case 'login': return <Login sx={{ fontSize: 20 }} />;
      case 'logout': return <Logout sx={{ fontSize: 20 }} />;
      case 'adicionar': return <Add sx={{ fontSize: 20 }} />;
      case 'editar': return <Edit sx={{ fontSize: 20 }} />;
      case 'excluir': return <Delete sx={{ fontSize: 20 }} />;
      case 'emprestimo': return <SwapHoriz sx={{ fontSize: 20 }} />;
      case 'devolucao': return <AssignmentReturn sx={{ fontSize: 20 }} />;
      default: return <Timeline sx={{ fontSize: 20 }} />;
    }
  };

  const getCorAcao = (acao) => {
    switch (acao) {
      case 'acesso': return 'secondary';
      case 'login': return 'success';
      case 'logout': return 'default';
      case 'adicionar': return 'success';
      case 'editar': return 'info';
      case 'excluir': return 'error';
      case 'emprestimo': return 'warning';
      case 'devolucao': return 'primary';
      default: return 'default';
    }
  };

  // Estatísticas por usuário
  const estatisticasPorUsuario = usuariosDaInstituicao.map(usuario => {
    const logsUsuario = (logAtividades || []).filter(log => 
      log.usuarioId === usuario.id && log.instituicaoId === instituicaoAtiva
    );
    
    return {
      usuario: usuario.nome,
      total: logsUsuario.length,
      acessos: logsUsuario.filter(l => l.acao === 'acesso').length,
      logins: logsUsuario.filter(l => l.acao === 'login').length,
      adicoes: logsUsuario.filter(l => l.acao === 'adicionar').length,
      edicoes: logsUsuario.filter(l => l.acao === 'editar').length,
      exclusoes: logsUsuario.filter(l => l.acao === 'excluir').length,
      emprestimos: logsUsuario.filter(l => l.acao === 'emprestimo').length,
      devolucoes: logsUsuario.filter(l => l.acao === 'devolucao').length,
    };
  });

  if (!isMaster) {
    return (
      <Layout title="Relatório de Atividades">
        <Alert severity="error">
          Acesso negado. Apenas o usuário master pode visualizar este relatório.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Relatório de Atividades dos Usuários">
      <Box sx={{ mb: 2 }} className="print-actions no-print">
        <Button variant="outlined" startIcon={<Print />} onClick={handleImprimir}>
          Imprimir Relatório
        </Button>
      </Box>

      <Box className="print-scope">
      <Typography className="print-only" variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Relatório de Atividades dos Usuários
      </Typography>
      <Typography className="print-only" variant="body2" sx={{ mb: 2 }}>
        Emitido em: {new Date().toLocaleString('pt-BR')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>📊 Relatório de Movimentação:</strong> Visualize todas as ações realizadas pelos usuários do sistema.
          </Typography>
        </Alert>
      </Box>

      {/* Estatísticas por Usuário */}
      <Card sx={{ mb: 3 }} className="no-print">
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> Estatísticas por Usuário
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Acessos</TableCell>
                  <TableCell align="center">Logins</TableCell>
                  <TableCell align="center">Adições</TableCell>
                  <TableCell align="center">Edições</TableCell>
                  <TableCell align="center">Exclusões</TableCell>
                  <TableCell align="center">Empréstimos</TableCell>
                  <TableCell align="center">Devoluções</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estatisticasPorUsuario.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {stat.usuario.charAt(0)}
                        </Avatar>
                        {stat.usuario}
                      </Box>
                    </TableCell>
                    <TableCell align="center"><Chip label={stat.total} size="small" /></TableCell>
                    <TableCell align="center"><Chip label={stat.acessos} size="small" color="secondary" /></TableCell>
                    <TableCell align="center"><Chip label={stat.logins} size="small" color="success" /></TableCell>
                    <TableCell align="center"><Chip label={stat.adicoes} size="small" color="success" /></TableCell>
                    <TableCell align="center"><Chip label={stat.edicoes} size="small" color="info" /></TableCell>
                    <TableCell align="center"><Chip label={stat.exclusoes} size="small" color="error" /></TableCell>
                    <TableCell align="center"><Chip label={stat.emprestimos} size="small" color="warning" /></TableCell>
                    <TableCell align="center"><Chip label={stat.devolucoes} size="small" color="primary" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔍 Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Usuário</InputLabel>
                <Select
                  value={filtroUsuario}
                  label="Usuário"
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                >
                  <MenuItem value="todos">Todos os Usuários</MenuItem>
                  {usuariosDaInstituicao.map(usuario => (
                    <MenuItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Ação</InputLabel>
                <Select
                  value={filtroAcao}
                  label="Ação"
                  onChange={(e) => setFiltroAcao(e.target.value)}
                >
                  <MenuItem value="todas">Todas as Ações</MenuItem>
                  <MenuItem value="adicionar">Adições</MenuItem>
                  <MenuItem value="editar">Edições</MenuItem>
                  <MenuItem value="excluir">Exclusões</MenuItem>
                  <MenuItem value="acesso">Acessos</MenuItem>
                  <MenuItem value="login">Logins</MenuItem>
                  <MenuItem value="logout">Logouts</MenuItem>
                  <MenuItem value="emprestimo">Empréstimos</MenuItem>
                  <MenuItem value="devolucao">Devoluções</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                label="Data Início"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                label="Data Fim"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Log de Atividades */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline /> Histórico de Atividades ({logsFiltrados.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Ação</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Descrição</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logsFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        Nenhuma atividade registrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logsFiltrados.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.dataHora).toLocaleString('pt-BR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                            {getUsuarioNome(log.usuarioId).charAt(0)}
                          </Avatar>
                          {getUsuarioNome(log.usuarioId)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.acao} 
                          size="small" 
                          color={getCorAcao(log.acao)}
                          icon={getIconeAcao(log.acao)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={log.modulo} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{log.descricao}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      </Box>
    </Layout>
  );
}
