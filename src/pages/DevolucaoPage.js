import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  AssignmentReturn,
  Autorenew,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

function DevolucaoPage() {
  const { emprestimos, livros, clientes, devolverLivro, renovarEmprestimo } = useData();
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaISBN, setBuscaISBN] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);
  const [acao, setAcao] = useState(''); // 'devolver' ou 'renovar'
  const [diasRenovacao, setDiasRenovacao] = useState(7);

  // Busca automática em tempo real
  const emprestimosEncontrados = React.useMemo(() => {
    let resultados = emprestimos.filter(emp => emp.status === 'ativo');

    console.log('🔍 Total de empréstimos ativos:', resultados.length);

    if (buscaNome) {
      const nomeCliente = buscaNome.toLowerCase();
      resultados = resultados.filter(emp => {
        const cliente = clientes.find(c => c.id === emp.clienteId);
        const match = cliente && cliente.nome.toLowerCase().includes(nomeCliente);
        if (match) console.log('✅ Cliente encontrado:', cliente.nome);
        return match;
      });
    }

    if (buscaISBN) {
      const isbnBusca = buscaISBN.replace(/[^0-9]/g, ''); // Remove caracteres não numéricos
      resultados = resultados.filter(emp => {
        const livro = livros.find(l => l.id === emp.livroId);
        if (!livro) return false;
        
        // Busca pelo ISBN removendo caracteres especiais
        const isbnLivro = (livro.isbn || '').replace(/[^0-9]/g, '');
        const match = isbnLivro.includes(isbnBusca);
        
        if (match) console.log('📖 Livro encontrado:', livro.titulo, 'ISBN:', livro.isbn);
        return match;
      });
    }

    console.log('📋 Resultados filtrados:', resultados.length);
    return resultados;
  }, [emprestimos, clientes, livros, buscaNome, buscaISBN]);

  const abrirDialog = (emprestimo, tipoAcao) => {
    setEmprestimoSelecionado(emprestimo);
    setAcao(tipoAcao);
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEmprestimoSelecionado(null);
    setAcao('');
  };

  const confirmarAcao = () => {
    if (acao === 'devolver') {
      devolverLivro(emprestimoSelecionado.id);
      console.log('✅ Livro devolvido:', emprestimoSelecionado.id);
    } else if (acao === 'renovar') {
      renovarEmprestimo(emprestimoSelecionado.id, diasRenovacao);
      console.log('🔄 Empréstimo renovado:', emprestimoSelecionado.id, 'por', diasRenovacao, 'dias');
    }
    
    fecharDialog();
    // A lista será atualizada automaticamente pelo useMemo
  };

  const calcularDiasAtraso = (dataDevolucao) => {
    const hoje = new Date();
    const dataDevol = new Date(dataDevolucao);
    const diffTime = hoje - dataDevol;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Desconhecido';
  };

  const getLivroInfo = (livroId) => {
    const livro = livros.find(l => l.id === livroId);
    return livro || { titulo: 'Desconhecido', isbn: '' };
  };

  return (
    <Layout title="Devolução de Livros">
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>📚 Como funciona:</strong> Busque o empréstimo pelo nome do leitor ou ISBN do livro, 
            e realize a devolução ou renovação.
          </Typography>
        </Alert>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔍 Buscar Empréstimo (busca automática)
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Leitor"
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Digite WA para buscar Wander..."
                helperText="Busca em tempo real"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN do Livro"
                value={buscaISBN}
                onChange={(e) => setBuscaISBN(e.target.value)}
                placeholder="Digite o ISBN ou parte dele..."
                helperText="Busca em tempo real"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {emprestimosEncontrados.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Empréstimos Encontrados ({emprestimosEncontrados.length})
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leitor</TableCell>
                    <TableCell>Livro</TableCell>
                    <TableCell>ISBN</TableCell>
                    <TableCell>Data Empréstimo</TableCell>
                    <TableCell>Data Devolução</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emprestimosEncontrados.map((emp) => {
                    const livroInfo = getLivroInfo(emp.livroId);
                    const diasAtraso = calcularDiasAtraso(emp.dataDevolucao);
                    const atrasado = diasAtraso > 0;

                    return (
                      <TableRow key={emp.id}>
                        <TableCell>{getClienteNome(emp.clienteId)}</TableCell>
                        <TableCell>{livroInfo.titulo}</TableCell>
                        <TableCell>{livroInfo.isbn || '-'}</TableCell>
                        <TableCell>
                          {new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {new Date(emp.dataDevolucao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {atrasado ? (
                            <Chip 
                              label={`Atrasado ${diasAtraso} dias`} 
                              color="error" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              label="No prazo" 
                              color="success" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="success"
                            onClick={() => abrirDialog(emp, 'devolver')}
                            title="Devolver"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => abrirDialog(emp, 'renovar')}
                            title="Renovar"
                          >
                            <Autorenew />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {emprestimosEncontrados.length === 0 && (buscaNome || buscaISBN) && (
        <Alert severity="warning">
          Nenhum empréstimo ativo encontrado com os critérios informados.
        </Alert>
      )}

      {/* Dialog de Confirmação */}
      <Dialog open={dialogOpen} onClose={fecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {acao === 'devolver' ? (
            <>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
              Confirmar Devolução
            </>
          ) : (
            <>
              <Autorenew sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              Renovar Empréstimo
            </>
          )}
        </DialogTitle>
        
        <DialogContent>
          {emprestimoSelecionado && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Leitor:</strong> {getClienteNome(emprestimoSelecionado.clienteId)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Livro:</strong> {getLivroInfo(emprestimoSelecionado.livroId).titulo}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data Empréstimo:</strong>{' '}
                {new Date(emprestimoSelecionado.dataEmprestimo).toLocaleDateString('pt-BR')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data Devolução:</strong>{' '}
                {new Date(emprestimoSelecionado.dataDevolucao).toLocaleDateString('pt-BR')}
              </Typography>

              {acao === 'renovar' && (
                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Renovar por quantos dias?</InputLabel>
                    <Select
                      value={diasRenovacao}
                      label="Renovar por quantos dias?"
                      onChange={(e) => setDiasRenovacao(e.target.value)}
                    >
                      <MenuItem value={7}>7 dias</MenuItem>
                      <MenuItem value={14}>14 dias</MenuItem>
                      <MenuItem value={21}>21 dias</MenuItem>
                      <MenuItem value={30}>30 dias</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={fecharDialog} startIcon={<Close />}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={acao === 'devolver' ? 'success' : 'primary'}
            onClick={confirmarAcao}
            startIcon={acao === 'devolver' ? <CheckCircle /> : <Autorenew />}
          >
            {acao === 'devolver' ? 'Confirmar Devolução' : 'Confirmar Renovação'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default DevolucaoPage;
