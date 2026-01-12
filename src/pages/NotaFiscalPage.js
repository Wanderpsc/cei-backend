import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
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
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add,
  Print,
  Visibility,
  Receipt
} from '@mui/icons-material';

export default function NotaFiscalPage() {
  const { 
    usuarioLogado, 
    instituicaoAtiva, 
    instituicoes,
    notasFiscais, 
    adicionarNotaFiscal,
    clientes 
  } = useData();
  
  const [open, setOpen] = useState(false);
  const [visualizarOpen, setVisualizarOpen] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(null);
  
  const [formData, setFormData] = useState({
    instituicaoClienteId: '',
    descricaoServico: 'Licença mensal do sistema CEI - Controle Escolar Inteligente',
    valorServico: 0,
    aliquotaISS: 2, // Padrão 2% para serviços educacionais
    observacoes: ''
  });

  // Obter dados da instituição
  const instituicao = instituicoes.find(i => i.id === instituicaoAtiva) || {};
  
  // Calcular valores
  const valorISS = (formData.valorServico * formData.aliquotaISS) / 100;
  const valorLiquido = formData.valorServico - valorISS;

  const handleOpen = () => {
    setFormData({
      instituicaoClienteId: '',
      descricaoServico: 'Licença mensal do sistema CEI - Controle Escolar Inteligente',
      valorServico: 0,
      aliquotaISS: 2,
      observacoes: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const instituicaoCliente = instituicoes.find(i => i.id === formData.instituicaoClienteId);
    
    if (!instituicaoCliente) {
      alert('Selecione uma escola/instituição');
      return;
    }

    if (formData.valorServico <= 0) {
      alert('Informe o valor do serviço');
      return;
    }

    // Dados do prestador (SuperAdmin/Desenvolvedor)
    const nota = {
      ...formData,
      clienteNome: instituicaoCliente.nomeInstituicao,
      clienteCnpj: instituicaoCliente.cnpj || 'Não informado',
      clienteEndereco: instituicaoCliente.endereco || 'Não informado',
      clienteCidade: instituicaoCliente.cidade,
      clienteEstado: instituicaoCliente.estado,
      valorISS,
      valorLiquido,
      instituicaoId: formData.instituicaoClienteId,
      // Prestador = Desenvolvedor do sistema (quem vende)
      prestadorNome: 'Wander Pires Silva Coelho',
      prestadorCnpj: '00.000.000/0001-00', // Seu CNPJ
      prestadorEndereco: 'Endereço do desenvolvedor',
      prestadorCidade: 'Sua cidade',
      prestadorEstado: 'UF'
    };

    adicionarNotaFiscal(nota);
    handleClose();
  };

  const handleVisualizar = (nota) => {
    setNotaSelecionada(nota);
    setVisualizarOpen(true);
  };

  const handleImprimir = (nota) => {
    setNotaSelecionada(nota);
    setVisualizarOpen(true);
    setTimeout(() => window.print(), 500);
  };

  // Filtrar notas da instituição ativa
  const notasFiltradas = notasFiscais.filter(n => 
    usuarioLogado?.perfil === 'SuperAdmin' ? true : n.instituicaoId === instituicaoAtiva
  );

  const totalEmitido = notasFiltradas.reduce((acc, n) => acc + n.valorServico, 0);
  const totalISS = notasFiltradas.reduce((acc, n) => acc + n.valorISS, 0);

  return (
    <Layout title="Notas Fiscais de Serviço (ISS)">
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Emitir Nova Nota Fiscal
        </Button>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Emitido
              </Typography>
              <Typography variant="h4">
                R$ {totalEmitido.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total ISS Retido
              </Typography>
              <Typography variant="h4">
                R$ {totalISS.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Notas Emitidas
              </Typography>
              <Typography variant="h4">
                {notasFiltradas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Notas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Leitor</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Valor Serviço</TableCell>
              <TableCell>ISS ({formData.aliquotaISS}%)</TableCell>
              <TableCell>Valor Líquido</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">
                    Nenhuma nota fiscal emitida
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              notasFiltradas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>
                    <Chip label={`NF ${nota.numero}`} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{nota.clienteNome}</TableCell>
                  <TableCell>{nota.descricaoServico}</TableCell>
                  <TableCell>R$ {nota.valorServico.toFixed(2)}</TableCell>
                  <TableCell>R$ {nota.valorISS.toFixed(2)}</TableCell>
                  <TableCell>R$ {nota.valorLiquido.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleVisualizar(nota)}
                      title="Visualizar"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleImprimir(nota)}
                      title="Imprimir"
                    >
                      <Print />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Emissão */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt />
            Emitir Nota Fiscal de Serviço
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="primary">
              Dados do Prestador (Desenvolvedor do Sistema)
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography><strong>Nome:</strong> Wander Pires Silva Coelho</Typography>
              <Typography><strong>CNPJ:</strong> 00.000.000/0001-00</Typography>
              <Typography><strong>Endereço:</strong> Endereço do desenvolvedor</Typography>
              <Typography><strong>Cidade/UF:</strong> Sua cidade/UF</Typography>
            </Box>

            <Divider />

            <Typography variant="subtitle2" color="primary">
              Dados do Tomador (Escola/Cliente)
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Selecione a Escola *</InputLabel>
              <Select
                value={formData.instituicaoClienteId}
                label="Selecione a Escola *"
                onChange={(e) => setFormData({ ...formData, instituicaoClienteId: e.target.value })}
              >
                {instituicoes.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.nomeInstituicao} - {inst.cidade}/{inst.estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            <Typography variant="subtitle2" color="primary">
              Dados do Serviço
            </Typography>
            <TextField
              label="Descrição do Serviço *"
              fullWidth
              multiline
              rows={3}
              value={formData.descricaoServico}
              onChange={(e) => setFormData({ ...formData, descricaoServico: e.target.value })}
              placeholder="Ex: Licença mensal do sistema CEI - Controle Escolar Inteligente - Plano Premium"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valor do Serviço (R$) *"
                  fullWidth
                  type="number"
                  value={formData.valorServico}
                  onChange={(e) => setFormData({ ...formData, valorServico: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01, min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Alíquota ISS (%)"
                  fullWidth
                  type="number"
                  value={formData.aliquotaISS}
                  onChange={(e) => setFormData({ ...formData, aliquotaISS: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.1, min: 0, max: 5 }}
                  helperText="Padrão: 2% (serviços educacionais)"
                />
              </Grid>
            </Grid>

            {formData.valorServico > 0 && (
              <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography><strong>Valor do Serviço:</strong> R$ {formData.valorServico.toFixed(2)}</Typography>
                <Typography><strong>ISS ({formData.aliquotaISS}%):</strong> R$ {valorISS.toFixed(2)}</Typography>
                <Typography variant="h6" color="primary">
                  <strong>Valor Líquido:</strong> R$ {valorLiquido.toFixed(2)}
                </Typography>
              </Box>
            )}

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
            startIcon={<Receipt />}
          >
            Emitir Nota Fiscal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização/Impressão */}
      {notaSelecionada && (
        <Dialog 
          open={visualizarOpen} 
          onClose={() => setVisualizarOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Nota Fiscal de Serviço Nº {notaSelecionada.numero}</span>
              <Button startIcon={<Print />} onClick={() => window.print()} variant="outlined">
                Imprimir
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                p: 4,
                fontFamily: 'Arial, sans-serif',
                '@media print': {
                  p: 6
                }
              }}
            >
              <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                NOTA FISCAL DE SERVIÇO
              </Typography>
              <Typography variant="h6" align="center" color="primary" gutterBottom>
                Nº {notaSelecionada.numero}
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                Data de Emissão: {new Date(notaSelecionada.dataEmissao).toLocaleDateString('pt-BR')}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>PRESTADOR DO SERVIÇO</Typography>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography><strong>Razão Social:</strong> {notaSelecionada.prestadorNome}</Typography>
                  <Typography><strong>CNPJ:</strong> {notaSelecionada.prestadorCnpj}</Typography>
                  <Typography><strong>Endereço:</strong> {notaSelecionada.prestadorEndereco}</Typography>
                  <Typography><strong>Município:</strong> {notaSelecionada.prestadorCidade} - {notaSelecionada.prestadorEstado}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>TOMADOR DO SERVIÇO</Typography>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography><strong>Nome:</strong> {notaSelecionada.clienteNome}</Typography>
                  <Typography><strong>CPF/CNPJ:</strong> {notaSelecionada.clienteCpf}</Typography>
                  <Typography><strong>Endereço:</strong> {notaSelecionada.clienteEndereco}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>DISCRIMINAÇÃO DO SERVIÇO</Typography>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, minHeight: 100 }}>
                  <Typography>{notaSelecionada.descricaoServico}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>VALORES</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Valor Total do Serviço</strong></TableCell>
                        <TableCell align="right">R$ {notaSelecionada.valorServico.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>(-) ISS ({notaSelecionada.aliquotaISS}%)</strong></TableCell>
                        <TableCell align="right">R$ {notaSelecionada.valorISS.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Valor Líquido da Nota</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            R$ {notaSelecionada.valorLiquido.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {notaSelecionada.observacoes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>OBSERVAÇÕES</Typography>
                  <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography>{notaSelecionada.observacoes}</Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Esta nota fiscal foi emitida eletronicamente pelo sistema CEI - Controle Escolar Inteligente.
                  Documento sem valor fiscal, apenas para controle interno.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVisualizarOpen(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Layout>
  );
}
