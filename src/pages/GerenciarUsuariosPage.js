import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  Alert,
  Grid,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  VpnKey,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';

export default function GerenciarUsuariosPage() {
  const { 
    usuarioLogado, 
    instituicaoAtiva,
    usuarios,
    adicionarUsuario,
    editarUsuario,
    excluirUsuario
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    login: '',
    senha: '',
    email: '',
    cargo: '',
    observacoes: ''
  });

  // Filtrar usuários da instituição ativa (exceto SuperAdmin)
  const usuariosDaInstituicao = (usuarios || []).filter(u => 
    u.instituicaoId === instituicaoAtiva && u.perfil !== 'SuperAdmin'
  );

  // Verificar se é usuário master
  const isMaster = usuarioLogado?.tipo === 'master' || usuarioLogado?.perfil === 'Admin';

  // Contar usuários master (sempre pelo menos 1 se o usuário logado é master)
  const totalMasters = isMaster ? Math.max(1, usuariosDaInstituicao.filter(u => u.tipo === 'master').length) : 0;
  
  // Total de usuários (incluindo o logado se não estiver na lista)
  const totalUsuarios = usuariosDaInstituicao.some(u => u.id === usuarioLogado?.id) 
    ? usuariosDaInstituicao.length 
    : usuariosDaInstituicao.length + 1;

  // Limite de 5 usuários por instituição (1 master + 4 usuários)
  const limiteAtingido = totalUsuarios >= 5;

  const handleOpen = () => {
    setFormData({
      nome: '',
      login: '',
      senha: '',
      email: '',
      cargo: '',
      observacoes: ''
    });
    setEditando(false);
    setUsuarioEditando(null);
    setDialogOpen(true);
  };

  const handleEdit = (usuario) => {
    setFormData({
      nome: usuario.nome,
      login: usuario.login,
      senha: '', // Não mostra senha por segurança
      email: usuario.email || '',
      cargo: usuario.cargo || '',
      observacoes: usuario.observacoes || ''
    });
    setEditando(true);
    setUsuarioEditando(usuario);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditando(false);
    setUsuarioEditando(null);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.login) {
      alert('Nome e login são obrigatórios');
      return;
    }

    if (!editando && !formData.senha) {
      alert('Senha é obrigatória para novos usuários');
      return;
    }

    // Verificar se login já existe
    const loginExiste = usuarios.some(u => 
      u.login.toLowerCase() === formData.login.toLowerCase() && 
      u.id !== usuarioEditando?.id
    );

    if (loginExiste) {
      alert('Este login já está em uso. Escolha outro.');
      return;
    }

    if (editando) {
      const dadosAtualizados = {
        ...usuarioEditando,
        nome: formData.nome,
        login: formData.login,
        email: formData.email,
        cargo: formData.cargo,
        observacoes: formData.observacoes
      };

      // Só atualiza senha se foi preenchida
      if (formData.senha) {
        dadosAtualizados.senha = formData.senha;
      }

      editarUsuario(usuarioEditando.id, dadosAtualizados);
    } else {
      const novoUsuario = {
        ...formData,
        instituicaoId: instituicaoAtiva,
        perfil: 'Usuario',
        tipo: 'comum',
        ativo: true,
        dataCriacao: new Date().toISOString(),
        criadoPor: usuarioLogado.id
      };

      adicionarUsuario(novoUsuario);
    }

    handleClose();
  };

  const handleDelete = (usuario) => {
    if (usuario.tipo === 'master') {
      alert('Não é possível excluir o usuário master!');
      return;
    }

    if (window.confirm(`Deseja realmente excluir o usuário "${usuario.nome}"?`)) {
      excluirUsuario(usuario.id);
    }
  };

  if (!isMaster) {
    return (
      <Layout title="Gerenciar Usuários">
        <Alert severity="error">
          Acesso negado. Apenas o usuário master pode gerenciar usuários.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Gerenciar Usuários do Sistema">
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>👤 Usuário Master:</strong> Você pode cadastrar até 4 usuários adicionais para acessar o sistema.
            <br />
            <strong>Total permitido:</strong> 5 usuários (1 master + 4 usuários)
            <br />
            <strong>Cadastrados:</strong> {totalUsuarios} de 5
          </Typography>
        </Alert>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4">{totalUsuarios}</Typography>
                  <Typography color="text.secondary">Total de Usuários</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <AdminPanelSettings sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {totalMasters}
                  </Typography>
                  <Typography color="text.secondary">Usuário Master</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <PersonAdd sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4">{5 - totalUsuarios}</Typography>
                  <Typography color="text.secondary">Vagas Disponíveis</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          disabled={limiteAtingido}
        >
          {limiteAtingido ? 'Limite de Usuários Atingido' : 'Adicionar Novo Usuário'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Login</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data Criação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosDaInstituicao.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">
                    Nenhum usuário cadastrado além do master
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usuariosDaInstituicao.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {usuario.nome?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      {usuario.nome}
                    </Box>
                  </TableCell>
                  <TableCell>{usuario.login}</TableCell>
                  <TableCell>{usuario.email || '-'}</TableCell>
                  <TableCell>{usuario.cargo || '-'}</TableCell>
                  <TableCell>
                    {usuario.tipo === 'master' ? (
                      <Chip 
                        label="Master" 
                        color="success" 
                        size="small" 
                        icon={<AdminPanelSettings />}
                      />
                    ) : (
                      <Chip 
                        label="Usuário" 
                        color="primary" 
                        size="small" 
                        icon={<Person />}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {usuario.dataCriacao ? 
                      new Date(usuario.dataCriacao).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(usuario)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    {usuario.tipo !== 'master' && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(usuario)}
                        title="Excluir"
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd />
            {editando ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome Completo *"
              fullWidth
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            
            <TextField
              label="Login *"
              fullWidth
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              helperText="Nome de usuário para fazer login no sistema"
            />
            
            <TextField
              label={editando ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
              fullWidth
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              helperText={editando ? "Preencha apenas se quiser alterar a senha" : ""}
            />
            
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <TextField
              label="Cargo/Função"
              fullWidth
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              placeholder="Ex: Bibliotecário, Assistente, etc"
            />
            
            <TextField
              label="Observações"
              fullWidth
              multiline
              rows={2}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={editando ? <Edit /> : <Add />}
          >
            {editando ? 'Salvar Alterações' : 'Adicionar Usuário'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
