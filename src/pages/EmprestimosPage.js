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
  Autocomplete,
  Alert,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Divider
} from '@mui/material';
import { Add, Edit, AssignmentReturn, Search, PersonAdd, CheckCircle, Print, Description, PrintOutlined } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import TermoEmprestimo from '../components/TermoEmprestimo';

function EmprestimosPage() {
  const { 
    emprestimos, 
    adicionarEmprestimo, 
    atualizarEmprestimo,
    livros,
    clientes,
    adicionarCliente
  } = useData();
  const [open, setOpen] = useState(false);
  
  // Estados para o fluxo de empréstimo
  const [isbnBusca, setIsbnBusca] = useState('');
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(1); // 1: buscar livro, 2: selecionar/cadastrar leitor
  const [buscaLeitor, setBuscaLeitor] = useState('');
  const [mostrarCadastroLeitor, setMostrarCadastroLeitor] = useState(false);
  
  // Estados para termos de empréstimo
  const [termoOpen, setTermoOpen] = useState(false);
  const [termoSelecionado, setTermoSelecionado] = useState(null);
  const [tipoTermo, setTipoTermo] = useState('preenchido'); // 'preenchido' ou 'branco'
  
  const [formData, setFormData] = useState({
    clienteId: '',
    livroId: '',
    dataEmprestimo: new Date().toISOString().split('T')[0],
    dataDevolucaoPrevista: '',
    observacoes: ''
  });
  
  // Dados para cadastro rápido de leitor
  const [novoLeitor, setNovoLeitor] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  const handleOpen = () => {
    setIsbnBusca('');
    setLivroSelecionado(null);
    setEtapaAtual(1);
    setBuscaLeitor('');
    setMostrarCadastroLeitor(false);
    setNovoLeitor({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: ''
    });
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

  const buscarLivroPorISBN = () => {
    if (!isbnBusca) {
      alert('Digite o ISBN do livro');
      return;
    }
    
    const livro = livros.find(l => l.isbn === isbnBusca);
    
    if (livro) {
      // Calcular quantos exemplares estão disponíveis
      const emprestimosAtivosDoLivro = emprestimos.filter(
        emp => emp.livroId === livro.id && emp.status === 'ativo'
      ).length;
      
      const quantidadeDisponivel = (livro.quantidade || 1) - emprestimosAtivosDoLivro;
      
      if (quantidadeDisponivel > 0) {
        setLivroSelecionado({ ...livro, quantidadeDisponivel });
        setFormData({ ...formData, livroId: livro.id });
        setEtapaAtual(2); // Avançar para seleção de leitor
      } else {
        alert(`❌ Livro indisponível!\n\nTodos os ${livro.quantidade} exemplar(es) estão emprestados.\nAguarde a devolução de algum exemplar.`);
      }
    } else {
      alert('❌ Livro não encontrado com este ISBN!');
    }
  };

  const handleSelecionarLeitor = (leitor) => {
    console.log('🎯 handleSelecionarLeitor chamado:', leitor);
    setFormData(prev => {
      const newFormData = { ...prev, clienteId: leitor.id };
      console.log('📝 Novo formData:', newFormData);
      return newFormData;
    });
    setMostrarCadastroLeitor(false);
    setBuscaLeitor(''); // Limpar busca após seleção
    console.log('✅ Leitor selecionado:', leitor.nome);
  };

  const handleCadastrarLeitor = () => {
    if (!novoLeitor.nome || !novoLeitor.cpf) {
      alert('Nome e CPF são obrigatórios!');
      return;
    }
    
    // Cadastrar novo leitor
    const leitorCadastrado = adicionarCliente({
      ...novoLeitor,
      ativo: true,
      dataCadastro: new Date().toISOString()
    });
    
    // Selecionar o leitor recém-cadastrado
    setFormData(prev => ({ ...prev, clienteId: leitorCadastrado.id }));
    setMostrarCadastroLeitor(false);
    alert('✅ Leitor cadastrado com sucesso!');
  };

  const handleSubmit = () => {
    const cliente = clientes.find(c => c.id === formData.clienteId);
    const livro = livros.find(l => l.id === formData.livroId);
    
    if (!cliente || !livro) {
      alert('Cliente ou livro não encontrado!');
      return;
    }
    
    if (!formData.dataDevolucaoPrevista) {
      alert('Data de devolução prevista é obrigatória!');
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
  
  const handleAbrirTermo = (emprestimo) => {
    setTermoSelecionado(emprestimo.dadosTermoEmprestimo);
    setTipoTermo('preenchido');
    setTermoOpen(true);
  };
  
  const handleAbrirTermoBranco = () => {
    setTermoSelecionado(null);
    setTipoTermo('branco');
    setTermoOpen(true);
  };
  
  const handleImprimirLote = () => {
    const emprestimosAtivos = emprestimos.filter(e => e.status === 'ativo');
    if (emprestimosAtivos.length === 0) {
      alert('Não há empréstimos ativos para imprimir!');
      return;
    }
    
    alert('✅ Preparado ' + emprestimosAtivos.length + ' termo(s) para impressão em lote!\n\nClique em OK para imprimir cada termo individualmente.');
    
    // Imprimir cada termo com um pequeno delay
    emprestimosAtivos.forEach((emp, index) => {
      setTimeout(() => {
        handleAbrirTermo(emp);
      }, index * 500);
    });
  };

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
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Description />}
            onClick={handleAbrirTermoBranco}
            color="secondary"
          >
            Termo em Branco
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintOutlined />}
            onClick={handleImprimirLote}
            color="info"
          >
            Imprimir em Lote
          </Button>
        </Box>
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
              <TableCell>Código</TableCell>
              <TableCell>Leitor</TableCell>
              <TableCell>Livro</TableCell>
              <TableCell>Data Empréstimo</TableCell>
              <TableCell>Data Devolução</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emprestimos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">
                    Nenhum empréstimo registrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              emprestimos.map((emprestimo) => (
                <TableRow key={emprestimo.id}>
                  <TableCell>
                    <Chip 
                      label={emprestimo.codigoEmprestimo || `EMP${emprestimo.id.toString().padStart(6, '0')}`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>
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
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        onClick={() => handleAbrirTermo(emprestimo)} 
                        size="small"
                        color="info"
                        title="Imprimir Termo"
                      >
                        <Print />
                      </IconButton>
                      {emprestimo.status === 'ativo' && (
                        <IconButton 
                          onClick={() => handleDevolucao(emprestimo.id)} 
                          size="small"
                          color="primary"
                          title="Devolver Livro"
                        >
                          <AssignmentReturn />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Novo Empréstimo
          <Typography variant="body2" color="text.secondary">
            {etapaAtual === 1 ? '📚 Etapa 1: Buscar Livro por ISBN' : '👤 Etapa 2: Selecionar Leitor'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* ETAPA 1: BUSCAR LIVRO POR ISBN */}
            {etapaAtual === 1 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Digite o ISBN do livro que será emprestado
                </Alert>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="ISBN"
                    fullWidth
                    required
                    value={isbnBusca}
                    onChange={(e) => setIsbnBusca(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        buscarLivroPorISBN();
                      }
                    }}
                    placeholder="Digite o ISBN e pressione Enter"
                    autoFocus
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={buscarLivroPorISBN} edge="end">
                            <Search />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={buscarLivroPorISBN}
                    sx={{ minWidth: 120 }}
                  >
                    Buscar
                  </Button>
                </Box>
              </Box>
            )}

            {/* ETAPA 2: SELECIONAR OU CADASTRAR LEITOR */}
            {etapaAtual === 2 && (
              <Box>
                {/* Informações do livro selecionado */}
                {livroSelecionado && (
                  <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle />
                        <Typography variant="h6">Livro Selecionado</Typography>
                      </Box>
                      <Typography variant="body1">
                        <strong>Título:</strong> {livroSelecionado.titulo}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Autor:</strong> {livroSelecionado.autor}
                      </Typography>
                      <Typography variant="body2">
                        <strong>ISBN:</strong> {livroSelecionado.isbn}
                      </Typography>
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>📚 Total de exemplares:</strong> {livroSelecionado.quantidade}
                        </Typography>
                        <Typography variant="body2">
                          <strong>✅ Disponíveis:</strong> {livroSelecionado.quantidadeDisponivel} exemplar(es)
                        </Typography>
                        <Typography variant="body2">
                          <strong>📖 Emprestados:</strong> {livroSelecionado.quantidade - livroSelecionado.quantidadeDisponivel} exemplar(es)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {!mostrarCadastroLeitor ? (
                  <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Busque e selecione o leitor. Se não encontrar, clique em "Cadastrar Novo Leitor"
                    </Alert>
                    
                    {/* Busca de leitor */}
                    <TextField
                      label="Buscar Leitor"
                      fullWidth
                      value={buscaLeitor}
                      onChange={(e) => setBuscaLeitor(e.target.value)}
                      placeholder="Digite o nome ou CPF do leitor"
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }}
                    />

                    {/* Leitor Selecionado */}
                    {formData.clienteId && !mostrarCadastroLeitor && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        ✅ Leitor selecionado: <strong>{clientes.find(c => c.id === formData.clienteId)?.nome}</strong>
                      </Alert>
                    )}

                    {/* Lista de leitores filtrados */}
                    {buscaLeitor && !formData.clienteId && (
                      <Box sx={{ mb: 2, maxHeight: 200, overflowY: 'auto' }}>
                        {clientes
                          .filter(c => 
                            c.ativo && 
                            (c.nome.toLowerCase().includes(buscaLeitor.toLowerCase()) ||
                             c.cpf?.includes(buscaLeitor))
                          )
                          .map(cliente => (
                            <Card 
                              key={cliente.id} 
                              sx={{ 
                                mb: 1, 
                                cursor: 'pointer',
                                bgcolor: formData.clienteId === cliente.id ? 'primary.light' : 'background.paper',
                                '&:hover': { bgcolor: 'action.hover' },
                                border: formData.clienteId === cliente.id ? '2px solid' : 'none',
                                borderColor: 'primary.main'
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🖱️ Card clicado:', cliente.nome);
                                handleSelecionarLeitor(cliente);
                              }}
                            >
                              <CardContent sx={{ py: 1, pointerEvents: 'none' }}>
                                <Typography variant="body1">
                                  <strong>{cliente.nome}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  CPF: {cliente.cpf} | Tel: {cliente.telefone}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                      </Box>
                    )}

                    <Button
                      variant="outlined"
                      startIcon={<PersonAdd />}
                      fullWidth
                      onClick={() => setMostrarCadastroLeitor(true)}
                      sx={{ mb: 2 }}
                    >
                      Cadastrar Novo Leitor
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    {/* Campos de empréstimo */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Data do Empréstimo"
                          fullWidth
                          type="date"
                          required
                          InputLabelProps={{ shrink: true }}
                          value={formData.dataEmprestimo}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataEmprestimo: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Data de Devolução Prevista"
                          fullWidth
                          type="date"
                          required
                          InputLabelProps={{ shrink: true }}
                          value={formData.dataDevolucaoPrevista}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataDevolucaoPrevista: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Observações"
                          fullWidth
                          multiline
                          rows={2}
                          value={formData.observacoes}
                          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        />
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Preencha os dados do novo leitor. Ele será cadastrado automaticamente.
                    </Alert>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Nome Completo"
                          fullWidth
                          required
                          value={novoLeitor.nome}
                          onChange={(e) => setNovoLeitor({ ...novoLeitor, nome: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="CPF"
                          fullWidth
                          required
                          value={novoLeitor.cpf}
                          onChange={(e) => setNovoLeitor({ ...novoLeitor, cpf: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Telefone"
                          fullWidth
                          value={novoLeitor.telefone}
                          onChange={(e) => setNovoLeitor({ ...novoLeitor, telefone: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email"
                          fullWidth
                          type="email"
                          value={novoLeitor.email}
                          onChange={(e) => setNovoLeitor({ ...novoLeitor, email: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Endereço"
                          fullWidth
                          value={novoLeitor.endereco}
                          onChange={(e) => setNovoLeitor({ ...novoLeitor, endereco: e.target.value })}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setMostrarCadastroLeitor(false)}
                        fullWidth
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={handleCadastrarLeitor}
                        fullWidth
                      >
                        Cadastrar e Continuar
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          {etapaAtual === 2 && !mostrarCadastroLeitor && (
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!formData.clienteId || !formData.dataDevolucaoPrevista}
            >
              Registrar Empréstimo
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog do Termo de Empréstimo */}
      <TermoEmprestimo
        open={termoOpen}
        onClose={() => setTermoOpen(false)}
        dados={termoSelecionado}
        tipo={tipoTermo}
      />
    </Layout>
  );
}

export default EmprestimosPage;
