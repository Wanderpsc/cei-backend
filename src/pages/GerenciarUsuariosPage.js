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
  Avatar,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  VpnKey,
  AdminPanelSettings,
  Person,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const PERMISSOES_DISPONIVEIS = [
  { path: '/configuracoes', label: 'Configurações' },
  { path: '/financeiro', label: 'Financeiro' },
  { path: '/livros', label: 'Livros' },
  { path: '/relatorios-livros', label: 'Relatórios de Livros' },
  { path: '/patrimonio', label: 'Patrimônio' },
  { path: '/clientes', label: 'Leitores' },
  { path: '/series-turmas', label: 'Séries e Turmas' },
  { path: '/emprestimos', label: 'Empréstimos' },
  { path: '/emprestimos-didaticos-lote', label: 'Empréstimos em Lote' },
  { path: '/devolucoes', label: 'Devoluções' },
  { path: '/clube-leitura', label: 'Clube de Leitura' },
  { path: '/busca', label: 'Busca' },
  { path: '/relatorios', label: 'Relatórios' }
];

const obterLabelPermissao = (path) => {
  const permissao = PERMISSOES_DISPONIVEIS.find(item => item.path === path);
  return permissao?.label || path;
};

const validarSenhaForte = (senha) => {
  if (!senha || senha.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres.';
  }
  if (!/[A-Z]/.test(senha)) {
    return 'A senha deve conter pelo menos 1 letra maiúscula.';
  }
  if (!/[a-z]/.test(senha)) {
    return 'A senha deve conter pelo menos 1 letra minúscula.';
  }
  if (!/[0-9]/.test(senha)) {
    return 'A senha deve conter pelo menos 1 número.';
  }
  if (!/[^A-Za-z0-9]/.test(senha)) {
    return 'A senha deve conter pelo menos 1 caractere especial.';
  }
  return '';
};

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
  const [dialogSenhaOpen, setDialogSenhaOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioSenhaAlvo, setUsuarioSenhaAlvo] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    login: '',
    senha: '',
    email: '',
    cargo: '',
    observacoes: '',
    permissoes: PERMISSOES_DISPONIVEIS.map(item => item.path)
  });

  const [senhaFormData, setSenhaFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Filtrar usuários da instituição ativa (exceto SuperAdmin)
  const usuariosDaInstituicao = (usuarios || []).filter(u => 
    u.instituicaoId === instituicaoAtiva && u.perfil !== 'SuperAdmin'
  );

  const isAdminDaEscola = (
    (usuarioLogado?.tipo === 'master' || usuarioLogado?.perfil === 'Admin' || usuarioLogado?.perfil === 'AdminEscola') &&
    usuarioLogado?.perfil !== 'SuperAdmin'
  );

  // Contar usuários master (sempre pelo menos 1 se o usuário logado é master)
  const totalMasters = isAdminDaEscola ? Math.max(1, usuariosDaInstituicao.filter(u => u.tipo === 'master').length) : 0;
  
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
      observacoes: '',
      permissoes: PERMISSOES_DISPONIVEIS.map(item => item.path)
    });
    setEditando(false);
    setUsuarioEditando(null);
    setMostrarSenha(false);
    setDialogOpen(true);
  };

  const handleEdit = (usuario) => {
    setFormData({
      nome: usuario.nome,
      login: usuario.login,
      senha: '', // Não mostra senha por segurança
      email: usuario.email || '',
      cargo: usuario.cargo || '',
      observacoes: usuario.observacoes || '',
      permissoes: Array.isArray(usuario.permissoes) && usuario.permissoes.length > 0
        ? usuario.permissoes
        : PERMISSOES_DISPONIVEIS.map(item => item.path)
    });
    setEditando(true);
    setUsuarioEditando(usuario);
    setMostrarSenha(false);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditando(false);
    setUsuarioEditando(null);
    setMostrarSenha(false);
  };

  const abrirDialogSenha = (usuario) => {
    setUsuarioSenhaAlvo(usuario);
    setSenhaFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    setMostrarSenhaAtual(false);
    setMostrarNovaSenha(false);
    setMostrarConfirmarSenha(false);
    setDialogSenhaOpen(true);
  };

  const fecharDialogSenha = () => {
    setDialogSenhaOpen(false);
    setUsuarioSenhaAlvo(null);
    setSenhaFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  };

  const handleSalvarSenha = () => {
    if (!usuarioSenhaAlvo) return;

    const alterandoPropriaSenha = usuarioSenhaAlvo.id === usuarioLogado?.id;

    if (alterandoPropriaSenha && !senhaFormData.senhaAtual) {
      alert('Informe sua senha atual para alterar a própria senha.');
      return;
    }

    if (alterandoPropriaSenha && senhaFormData.senhaAtual !== usuarioLogado?.senha) {
      alert('Senha atual inválida.');
      return;
    }

    const erroSenhaForte = validarSenhaForte(senhaFormData.novaSenha);
    if (erroSenhaForte) {
      alert(erroSenhaForte);
      return;
    }

    if (senhaFormData.novaSenha !== senhaFormData.confirmarSenha) {
      alert('A confirmação de senha não confere.');
      return;
    }

    editarUsuario(usuarioSenhaAlvo.id, {
      ...usuarioSenhaAlvo,
      senha: senhaFormData.novaSenha
    });

    alert(`Senha de "${usuarioSenhaAlvo.nome}" atualizada com sucesso.`);
    fecharDialogSenha();
  };

  const togglePermissao = (path) => {
    setFormData(prev => {
      const permissoesAtuais = prev.permissoes || [];
      const jaSelecionada = permissoesAtuais.includes(path);

      return {
        ...prev,
        permissoes: jaSelecionada
          ? permissoesAtuais.filter(item => item !== path)
          : [...permissoesAtuais, path]
      };
    });
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.login) {
      alert('Nome e login são obrigatórios');
      return;
    }

    if (!editando && limiteAtingido) {
      alert(`Limite de usuários atingido (${totalUsuarios}/5). Exclua um usuário para cadastrar outro.`);
      return;
    }

    if (!editando && !formData.senha) {
      alert('Senha é obrigatória para novos usuários');
      return;
    }

    if (!editando || formData.senha) {
      const erroSenhaForte = validarSenhaForte(formData.senha);
      if (erroSenhaForte) {
        alert(erroSenhaForte);
        return;
      }
    }

    if (!Array.isArray(formData.permissoes) || formData.permissoes.length === 0) {
      alert('Selecione pelo menos uma permissão de acesso para o usuário');
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
        observacoes: formData.observacoes,
        permissoes: formData.permissoes
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
        permissoes: formData.permissoes,
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

  if (!isAdminDaEscola) {
    return (
      <Layout title="Gerenciar Usuários">
        <Alert severity="error">
          Acesso negado. Somente o administrador da escola pode criar e gerenciar login/senha de usuários.
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
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleOpen();
          }}
        >
          Adicionar Novo Usuário
        </Button>
        {limiteAtingido && (
          <Typography variant="caption" color="warning.main" sx={{ ml: 1.5 }}>
            Limite atual atingido ({totalUsuarios}/5). Você ainda pode abrir o formulário para consultar.
          </Typography>
        )}
        <Button
          variant="outlined"
          startIcon={<VpnKey />}
          sx={{ ml: 1 }}
          onClick={() => abrirDialogSenha(usuarioLogado)}
        >
          Alterar Minha Senha
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
              <TableCell>Permissões</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data Criação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosDaInstituicao.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
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
                    {Array.isArray(usuario.permissoes) && usuario.permissoes.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {usuario.permissoes.map(permissao => (
                          <Chip
                            key={`${usuario.id}-${permissao}`}
                            label={obterLabelPermissao(permissao)}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Todas (legado)</Typography>
                    )}
                  </TableCell>
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
                      color="secondary"
                      onClick={() => abrirDialogSenha(usuario)}
                      title="Alterar Senha"
                    >
                      <VpnKey />
                    </IconButton>
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
              type={mostrarSenha ? 'text' : 'password'}
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              helperText={editando ? "Se alterar, use: 8+ caracteres com maiúscula, minúscula, número e especial." : "Use: 8+ caracteres com maiúscula, minúscula, número e especial."}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setMostrarSenha(prev => !prev)}
                      onMouseDown={(event) => event.preventDefault()}
                      aria-label="alternar visualização da senha"
                    >
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
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

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnKey fontSize="small" />
                Permissões de acesso do usuário *
              </Typography>
              <FormGroup>
                {PERMISSOES_DISPONIVEIS.map((permissao) => (
                  <FormControlLabel
                    key={permissao.path}
                    control={(
                      <Checkbox
                        checked={(formData.permissoes || []).includes(permissao.path)}
                        onChange={() => togglePermissao(permissao.path)}
                      />
                    )}
                    label={permissao.label}
                  />
                ))}
              </FormGroup>
            </Box>
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

      <Dialog open={dialogSenhaOpen} onClose={fecharDialogSenha} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VpnKey />
            Alterar Senha
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Alterando senha de: <strong>{usuarioSenhaAlvo?.nome || '-'}</strong>
            </Alert>

            {usuarioSenhaAlvo?.id === usuarioLogado?.id && (
              <TextField
                label="Senha Atual"
                fullWidth
                type={mostrarSenhaAtual ? 'text' : 'password'}
                value={senhaFormData.senhaAtual}
                onChange={(e) => setSenhaFormData({ ...senhaFormData, senhaAtual: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setMostrarSenhaAtual(prev => !prev)}>
                        {mostrarSenhaAtual ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}

            <TextField
              label="Nova Senha"
              fullWidth
              type={mostrarNovaSenha ? 'text' : 'password'}
              value={senhaFormData.novaSenha}
              onChange={(e) => setSenhaFormData({ ...senhaFormData, novaSenha: e.target.value })}
              helperText="8+ caracteres, com maiúscula, minúscula, número e especial"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setMostrarNovaSenha(prev => !prev)}>
                      {mostrarNovaSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Confirmar Nova Senha"
              fullWidth
              type={mostrarConfirmarSenha ? 'text' : 'password'}
              value={senhaFormData.confirmarSenha}
              onChange={(e) => setSenhaFormData({ ...senhaFormData, confirmarSenha: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setMostrarConfirmarSenha(prev => !prev)}>
                      {mostrarConfirmarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogSenha}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarSenha} startIcon={<VpnKey />}>
            Salvar Nova Senha
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
