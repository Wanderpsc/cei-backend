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
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useData } from '../context/DataContext';

function PatrimonioPage() {
  const { patrimonio, adicionarPatrimonio, atualizarPatrimonio, removerPatrimonio } = useData();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    numeroPatrimonio: '',
    descricao: '',
    categoria: '',
    marca: '',
    modelo: '',
    dataAquisicao: '',
    valorAquisicao: '',
    estado: 'Bom',
    localizacao: '',
    observacoes: ''
  });

  const estadosDisponiveis = ['Novo', 'Bom', 'Regular', 'Ruim', 'Descartado'];
  const categoriasDisponiveis = ['Eletrônico', 'Mobiliário', 'Equipamento', 'Material', 'Outro'];

  const handleOpen = (bem = null) => {
    if (bem) {
      setEditando(bem.id);
      setFormData(bem);
    } else {
      setEditando(null);
      setFormData({
        numeroPatrimonio: '',
        descricao: '',
        categoria: '',
        marca: '',
        modelo: '',
        dataAquisicao: '',
        valorAquisicao: '',
        estado: 'Bom',
        localizacao: '',
        observacoes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleSubmit = () => {
    if (editando) {
      atualizarPatrimonio(editando, formData);
    } else {
      adicionarPatrimonio(formData);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente remover este bem do patrimônio?')) {
      removerPatrimonio(id);
    }
  };

  const patrimonioFiltrado = patrimonio.filter(bem =>
    bem.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    bem.numeroPatrimonio.includes(busca) ||
    bem.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const getEstadoColor = (estado) => {
    const cores = {
      'Novo': 'success',
      'Bom': 'primary',
      'Regular': 'warning',
      'Ruim': 'error',
      'Descartado': 'default'
    };
    return cores[estado] || 'default';
  };

  return (
    <Layout title="Patrimônio">
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por descrição, número ou categoria..."
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
          Novo Bem
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº Patrimônio</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patrimonioFiltrado.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    Nenhum bem cadastrado no patrimônio
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              patrimonioFiltrado.map((bem) => (
                <TableRow key={bem.id}>
                  <TableCell>{bem.numeroPatrimonio}</TableCell>
                  <TableCell>{bem.descricao}</TableCell>
                  <TableCell>
                    <Chip label={bem.categoria} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={bem.estado} 
                      size="small" 
                      color={getEstadoColor(bem.estado)} 
                    />
                  </TableCell>
                  <TableCell>{bem.localizacao}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(bem)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(bem.id)} size="small" color="error">
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
        <DialogTitle>{editando ? 'Editar Bem' : 'Novo Bem'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Número do Patrimônio"
              fullWidth
              required
              value={formData.numeroPatrimonio}
              onChange={(e) => setFormData({ ...formData, numeroPatrimonio: e.target.value })}
            />
            <TextField
              label="Descrição"
              fullWidth
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
            <TextField
              label="Categoria"
              fullWidth
              select
              required
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            >
              {categoriasDisponiveis.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Marca"
              fullWidth
              value={formData.marca}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
            />
            <TextField
              label="Modelo"
              fullWidth
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
            />
            <TextField
              label="Data de Aquisição"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dataAquisicao}
              onChange={(e) => setFormData({ ...formData, dataAquisicao: e.target.value })}
            />
            <TextField
              label="Valor de Aquisição"
              fullWidth
              type="number"
              value={formData.valorAquisicao}
              onChange={(e) => setFormData({ ...formData, valorAquisicao: e.target.value })}
            />
            <TextField
              label="Estado"
              fullWidth
              select
              required
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            >
              {estadosDisponiveis.map((estado) => (
                <MenuItem key={estado} value={estado}>{estado}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Localização"
              fullWidth
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
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
            {editando ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default PatrimonioPage;
