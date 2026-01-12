import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Button,
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
  IconButton,
  Chip,
  Typography,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, Search, QrCode } from '@mui/icons-material';
import { useData } from '../context/DataContext';

function LeitoresPage() {
  const { clientes, adicionarCliente, atualizarCliente, removerCliente } = useData();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    tipo: 'Aluno',
    turma: '',
    matricula: '',
    ativo: true
  });

  const tiposCliente = ['Aluno', 'Professor', 'Funcionário', 'Visitante'];

  const handleOpen = (cliente = null) => {
    if (cliente) {
      setEditando(cliente.id);
      setFormData(cliente);
    } else {
      setEditando(null);
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        tipo: 'Aluno',
        turma: '',
        matricula: '',
        ativo: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleSubmit = () => {
    // Gerar código automático se for novo leitor
    if (!editando) {
      const numeroSequencial = (clientes.length + 1).toString().padStart(6, '0');
      const codigoLeitor = `LEIT${numeroSequencial}`;
      formData.codigoIdentificacao = codigoLeitor;
    }
    
    if (editando) {
      atualizarCliente(editando, formData);
    } else {
      adicionarCliente(formData);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente remover este leitor?')) {
      removerCliente(id);
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.cpf.includes(busca) ||
    cliente.matricula?.includes(busca)
  );

  return (
    <Layout title="Leitores">
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por nome, CPF ou matrícula..."
          variant="outlined"
          size="small"
          fullWidth
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Novo Leitor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Matrícula</TableCell>
              <TableCell>Turma</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">
                    Nenhum leitor cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <Chip 
                      label={cliente.codigoIdentificacao || 'N/A'} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.cpf}</TableCell>
                  <TableCell>
                    <Chip label={cliente.tipo} size="small" />
                  </TableCell>
                  <TableCell>{cliente.matricula || '-'}</TableCell>
                  <TableCell>{cliente.turma || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={cliente.ativo ? 'Ativo' : 'Inativo'} 
                      size="small" 
                      color={cliente.ativo ? 'success' : 'default'} 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(cliente)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(cliente.id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Leitor' : 'Novo Leitor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nome Completo"
              fullWidth
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <TextField
              label="CPF"
              fullWidth
              required
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            />
            <TextField
              label="Telefone"
              fullWidth
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Endereço"
              fullWidth
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
            <TextField
              label="Tipo"
              fullWidth
              select
              required
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              {tiposCliente.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </TextField>
            {formData.tipo === 'Aluno' && (
              <>
                <TextField
                  label="Matrícula"
                  fullWidth
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                />
                <TextField
                  label="Turma"
                  fullWidth
                  value={formData.turma}
                  onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                />
              </>
            )}
            <TextField
              label="Status"
              fullWidth
              select
              value={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
            >
              <MenuItem value={true}>Ativo</MenuItem>
              <MenuItem value={false}>Inativo</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editando ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default LeitoresPage;
