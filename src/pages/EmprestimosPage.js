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
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Add, Edit, AssignmentReturn, Search } from '@mui/icons-material';
import { useData } from '../context/DataContext';

function EmprestimosPage() {
  const { 
    emprestimos, 
    adicionarEmprestimo, 
    atualizarEmprestimo,
    livros,
    clientes 
  } = useData();
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    clienteId: '',
    livroId: '',
    dataEmprestimo: new Date().toISOString().split('T')[0],
    dataDevolucaoPrevista: '',
    observacoes: ''
  });

  const handleOpen = () => {
    setFormData({
      clienteId: '',
      livroId: '',
      dataEmprestimo: new Date().toISOString().split('T')[0],
      dataDevolucaoPrevista: '',
      observacoes: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const cliente = clientes.find(c => c.id === formData.clienteId);
    const livro = livros.find(l => l.id === formData.livroId);
    
    if (!cliente || !livro) {
      alert('Cliente ou livro não encontrado!');
      return;
    }

    adicionarEmprestimo({
      ...formData,
      clienteNome: cliente.nome,
      livroTitulo: livro.titulo,
      status: 'ativo',
      dataDevolucao: formData.dataDevolucaoPrevista
    });
    handleClose();
  };

  const handleDevolucao = (id) => {
    if (window.confirm('Confirmar devolução deste empréstimo?')) {
      atualizarEmprestimo(id, {
        status: 'devolvido',
        dataDevolucaoReal: new Date().toISOString().split('T')[0]
      });
    }
  };

  const emprestimosFiltrados = emprestimos.filter(emp =>
    emp.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
    emp.livroTitulo.toLowerCase().includes(busca.toLowerCase())
  );

  const getStatusColor = (emprestimo) => {
    if (emprestimo.status === 'devolvido') return 'success';
    const hoje = new Date();
    const dataDev = new Date(emprestimo.dataDevolucao);
    if (dataDev < hoje) return 'error';
    return 'primary';
  };

  const getStatusLabel = (emprestimo) => {
    if (emprestimo.status === 'devolvido') return 'Devolvido';
    const hoje = new Date();
    const dataDev = new Date(emprestimo.dataDevolucao);
    if (dataDev < hoje) return 'Atrasado';
    return 'Ativo';
  };

  return (
    <Layout title="Empréstimos">
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por cliente ou livro..."
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
          onClick={handleOpen}
        >
          Novo Empréstimo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Livro</TableCell>
              <TableCell>Data Empréstimo</TableCell>
              <TableCell>Data Devolução</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emprestimosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    Nenhum empréstimo registrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              emprestimosFiltrados.map((emprestimo) => (
                <TableRow key={emprestimo.id}>
                  <TableCell>{emprestimo.clienteNome}</TableCell>
                  <TableCell>{emprestimo.livroTitulo}</TableCell>
                  <TableCell>
                    {new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {new Date(emprestimo.dataDevolucao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(emprestimo)} 
                      size="small" 
                      color={getStatusColor(emprestimo)}
                    />
                  </TableCell>
                  <TableCell>
                    {emprestimo.status === 'ativo' && (
                      <IconButton 
                        onClick={() => handleDevolucao(emprestimo.id)} 
                        size="small"
                        color="primary"
                      >
                        <AssignmentReturn />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Empréstimo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={clientes.filter(c => c.ativo)}
              getOptionLabel={(option) => option.nome}
              onChange={(e, value) => setFormData({ ...formData, clienteId: value?.id || '' })}
              renderInput={(params) => (
                <TextField {...params} label="Cliente" required />
              )}
            />
            <Autocomplete
              options={livros.filter(l => l.quantidade > 0)}
              getOptionLabel={(option) => option.titulo}
              onChange={(e, value) => setFormData({ ...formData, livroId: value?.id || '' })}
              renderInput={(params) => (
                <TextField {...params} label="Livro" required />
              )}
            />
            <TextField
              label="Data do Empréstimo"
              fullWidth
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={formData.dataEmprestimo}
              onChange={(e) => setFormData({ ...formData, dataEmprestimo: e.target.value })}
            />
            <TextField
              label="Data de Devolução Prevista"
              fullWidth
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={formData.dataDevolucaoPrevista}
              onChange={(e) => setFormData({ ...formData, dataDevolucaoPrevista: e.target.value })}
            />
            <TextField
              label="Observações"
              fullWidth
              multiline
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Registrar Empréstimo
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default EmprestimosPage;
