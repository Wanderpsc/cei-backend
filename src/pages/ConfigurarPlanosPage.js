import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Grid,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  AttachMoney
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

function ConfigurarPlanosPage() {
  const { planos, adicionarPlano, atualizarPlano, removerPlano } = useData();
  
  const [dialogAberto, setDialogAberto] = useState(false);
  const [planoEditando, setPlanoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    dias: '',
    valor: ''
  });
  const [erro, setErro] = useState('');

  const handleAbrirDialog = (plano = null) => {
    if (plano) {
      setPlanoEditando(plano);
      setFormData({
        nome: plano.nome,
        dias: plano.dias.toString(),
        valor: plano.valor.toFixed(2)
      });
    } else {
      setPlanoEditando(null);
      setFormData({
        nome: '',
        dias: '',
        valor: ''
      });
    }
    setErro('');
    setDialogAberto(true);
  };

  const handleFecharDialog = () => {
    setDialogAberto(false);
    setPlanoEditando(null);
    setFormData({ nome: '', dias: '', valor: '' });
    setErro('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro('Nome do plano é obrigatório');
      return false;
    }
    if (!formData.dias || parseInt(formData.dias) <= 0) {
      setErro('Quantidade de dias deve ser maior que zero');
      return false;
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setErro('Valor deve ser maior que zero');
      return false;
    }
    return true;
  };

  const handleSalvar = () => {
    if (!validarFormulario()) return;

    const dadosPlano = {
      nome: formData.nome.trim(),
      dias: parseInt(formData.dias),
      valor: parseFloat(formData.valor)
    };

    if (planoEditando) {
      atualizarPlano(planoEditando.id, dadosPlano);
    } else {
      adicionarPlano(dadosPlano);
    }

    handleFecharDialog();
  };

  const handleToggleAtivo = (plano) => {
    atualizarPlano(plano.id, { ativo: !plano.ativo });
  };

  const handleRemover = (id) => {
    if (window.confirm('Deseja realmente remover este plano? Esta ação não pode ser desfeita.')) {
      removerPlano(id);
    }
  };

  const calcularMeses = (dias) => {
    const meses = Math.floor(dias / 30);
    const diasRestantes = dias % 30;
    if (meses === 0) return `${dias} dias`;
    if (diasRestantes === 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    return `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${diasRestantes} dias`;
  };

  const calcularValorDiario = (valor, dias) => {
    return (valor / dias).toFixed(2);
  };

  return (
    <Layout title="Configurar Planos">
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Alert severity="info">
              Configure os planos que estarão disponíveis para as escolas escolherem durante o cadastro.
            </Alert>
          </Grid>
          <Grid item xs={12} md={4} textAlign="right">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleAbrirDialog()}
            >
              Adicionar Plano
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Planos Cadastrados
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome do Plano</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duração</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dias</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valor Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valor/Dia</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">
                        Nenhum plano cadastrado. Clique em "Adicionar Plano" para começar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  planos.map((plano) => (
                    <TableRow key={plano.id} hover>
                      <TableCell>
                        <Typography fontWeight="bold">{plano.nome}</Typography>
                      </TableCell>
                      <TableCell>{calcularMeses(plano.dias)}</TableCell>
                      <TableCell>{plano.dias} dias</TableCell>
                      <TableCell>
                        <Typography color="primary" fontWeight="bold">
                          R$ {plano.valor.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          R$ {calcularValorDiario(plano.valor, plano.dias)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {plano.ativo ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Ativo"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Cancel />}
                            label="Inativo"
                            color="default"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleAbrirDialog(plano)}
                            title="Editar"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color={plano.ativo ? 'warning' : 'success'}
                            onClick={() => handleToggleAtivo(plano)}
                            title={plano.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {plano.ativo ? <Cancel /> : <CheckCircle />}
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemover(plano.id)}
                            title="Remover"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {planos.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Total de planos: {planos.length} | Ativos: {planos.filter(p => p.ativo).length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Adicionar/Editar Plano */}
      <Dialog open={dialogAberto} onClose={handleFecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {planoEditando ? 'Editar Plano' : 'Adicionar Novo Plano'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {erro && (
              <Alert severity="error" onClose={() => setErro('')}>
                {erro}
              </Alert>
            )}

            <TextField
              label="Nome do Plano"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Ex: 1 Mês (30 dias), 6 Meses, Anual"
              helperText="Nome que será exibido para os clientes"
            />

            <TextField
              label="Quantidade de Dias"
              name="dias"
              type="number"
              value={formData.dias}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText={formData.dias ? `Equivale a: ${calcularMeses(parseInt(formData.dias))}` : 'Duração do plano em dias'}
            />

            <TextField
              label="Valor do Plano"
              name="valor"
              type="number"
              value={formData.valor}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0.01, step: 0.01 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              helperText={formData.valor && formData.dias 
                ? `Valor por dia: R$ ${calcularValorDiario(parseFloat(formData.valor), parseInt(formData.dias))}`
                : 'Valor total do plano'
              }
            />

            {formData.valor && formData.dias && (
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Resumo do Plano:
                </Typography>
                <Typography variant="body2">
                  • Duração: {calcularMeses(parseInt(formData.dias))} ({formData.dias} dias)
                </Typography>
                <Typography variant="body2">
                  • Valor Total: R$ {parseFloat(formData.valor).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  • Valor Diário: R$ {calcularValorDiario(parseFloat(formData.valor), parseInt(formData.dias))}
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialog}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained">
            {planoEditando ? 'Salvar Alterações' : 'Adicionar Plano'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default ConfigurarPlanosPage;
