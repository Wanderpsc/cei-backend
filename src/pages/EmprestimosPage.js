import React, { useMemo, useState } from 'react';
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
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Add, Edit, AssignmentReturn, Search, PersonAdd, CheckCircle, Print, Description, PrintOutlined } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import TermoEmprestimo from '../components/TermoEmprestimo';
import { useNavigate } from 'react-router-dom';

function EmprestimosPage() {
  const navigate = useNavigate();

  const { 
    emprestimos, 
    adicionarEmprestimo, 
    atualizarEmprestimo,
    livros,
    clientes,
    adicionarCliente,
    adicionarLivro
  } = useData();
  const [open, setOpen] = useState(false);
  
  // Estados para o fluxo de empréstimo
  const [isbnBusca, setIsbnBusca] = useState('');
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(1); // 1: buscar livro, 2: selecionar/cadastrar leitor
  const [mostrarCadastroLivro, setMostrarCadastroLivro] = useState(false);
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
    observacoes: '',
    categoriaLeitor: ''
  });
  
  // Dados para cadastro rápido de leitor
  const [novoLeitor, setNovoLeitor] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  const [novoLivro, setNovoLivro] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    editora: '',
    categoria: '',
    quantidade: 1,
    localizacao: '',
    tipo: 'Paradidático',
    anoPublicacao: '',
    anoVigencia: ''
  });

  const normalizarIsbn = (valor) => String(valor || '').replace(/[^0-9Xx]/g, '').toUpperCase();

  const resumoEstoqueEmprestimos = useMemo(() => {
    const emprestimosAtivos = emprestimos.filter((emp) => String(emp?.status || '').toLowerCase() === 'ativo');

    const ativosPorLivro = new Map();
    emprestimosAtivos.forEach((emp) => {
      const livroId = String(emp?.livroId || '');
      if (!livroId) return;
      ativosPorLivro.set(livroId, (ativosPorLivro.get(livroId) || 0) + 1);
    });

    let totalExemplares = 0;
    let disponiveis = 0;

    livros.forEach((livro) => {
      if (livro?.baixa) return;
      const quantidade = Math.max(Number(livro?.quantidade) || 0, 0);
      totalExemplares += quantidade;

      const ativos = ativosPorLivro.get(String(livro.id)) || 0;
      disponiveis += Math.max(quantidade - ativos, 0);
    });

    return {
      totalExemplares,
      emprestados: emprestimosAtivos.length,
      disponiveis
    };
  }, [livros, emprestimos]);

  const leitoresFiltrados = useMemo(() => {
    const termo = buscaLeitor.trim();
    if (!termo) return [];

    const termoLower = termo.toLowerCase();
    const termoCpf = termo.replace(/\D/g, '');

    return clientes.filter((c) => {
      if (!c?.ativo) return false;

      const nome = String(c?.nome || '').toLowerCase();
      const cpf = String(c?.cpf || '').replace(/\D/g, '');

      const nomeConfere = nome.includes(termoLower);
      const cpfConfere = termoCpf.length > 0 && cpf.includes(termoCpf);

      return nomeConfere || cpfConfere;
    });
  }, [buscaLeitor, clientes]);

  const selecionarLivroParaEmprestimo = (livro) => {
    if (!livro) return false;

    const emprestimosAtivosDoLivro = emprestimos.filter(
      (emp) => emp.livroId === livro.id && emp.status === 'ativo'
    ).length;

    const quantidadeDisponivel = (Number(livro.quantidade) || 1) - emprestimosAtivosDoLivro;

    if (quantidadeDisponivel <= 0) {
      alert(`❌ Livro indisponível!\n\nTodos os ${livro.quantidade} exemplar(es) estão emprestados.\nAguarde a devolução de algum exemplar.`);
      return false;
    }

    setLivroSelecionado({ ...livro, quantidadeDisponivel });
    setFormData((prev) => ({ ...prev, livroId: livro.id }));
    setEtapaAtual(2);
    setMostrarCadastroLivro(false);
    return true;
  };

  const handleOpen = () => {
    setIsbnBusca('');
    setLivroSelecionado(null);
    setEtapaAtual(1);
    setMostrarCadastroLivro(false);
    setBuscaLeitor('');
    setMostrarCadastroLeitor(false);
    setNovoLeitor({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: ''
    });
    setNovoLivro({
      titulo: '',
      autor: '',
      isbn: '',
      editora: '',
      categoria: '',
      quantidade: 1,
      localizacao: '',
      tipo: 'Paradidático',
      anoPublicacao: '',
      anoVigencia: ''
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
    const isbnNormalizado = normalizarIsbn(isbnBusca);

    if (!isbnNormalizado) {
      alert('Digite o ISBN do livro');
      return;
    }
    
    const livro = livros.find((l) => normalizarIsbn(l.isbn) === isbnNormalizado);
    
    if (livro) {
      selecionarLivroParaEmprestimo(livro);
    } else {
      const confirmarCadastro = window.confirm(
        `❌ Livro não encontrado com ISBN ${isbnNormalizado}.\n\nDeseja cadastrar um novo livro agora?`
      );

      if (confirmarCadastro) {
        setNovoLivro((prev) => ({
          ...prev,
          isbn: isbnNormalizado
        }));
        setMostrarCadastroLivro(true);
      }
    }
  };

  const handleCancelarCadastroLivro = () => {
    setMostrarCadastroLivro(false);
    setNovoLivro((prev) => ({
      ...prev,
      isbn: normalizarIsbn(isbnBusca)
    }));
  };

  const handleCadastrarLivroEContinuar = () => {
    const isbnNormalizado = normalizarIsbn(novoLivro.isbn || isbnBusca);

    if (!novoLivro.titulo || !novoLivro.autor) {
      alert('Título e autor são obrigatórios para cadastrar o livro.');
      return;
    }

    if (!isbnNormalizado) {
      alert('Informe um ISBN válido para continuar.');
      return;
    }

    const livroExistente = livros.find((l) => normalizarIsbn(l.isbn) === isbnNormalizado);
    if (livroExistente) {
      const usarExistente = window.confirm(
        `Já existe um livro cadastrado com esse ISBN:\n\n${livroExistente.titulo}\n\nDeseja usá-lo neste empréstimo?`
      );

      if (usarExistente) {
        selecionarLivroParaEmprestimo(livroExistente);
      }
      return;
    }

    const numeroSequencial = (livros.length + 1).toString().padStart(6, '0');
    const livroCadastrado = adicionarLivro({
      ...novoLivro,
      isbn: isbnNormalizado,
      quantidade: Math.max(Number(novoLivro.quantidade) || 1, 1),
      codigoIdentificacao: `LIV${numeroSequencial}`,
      anoVigencia: novoLivro.tipo === 'Didático' ? novoLivro.anoVigencia : ''
    });

    if (!livroCadastrado) {
      return;
    }

    setIsbnBusca(isbnNormalizado);
    selecionarLivroParaEmprestimo(livroCadastrado);
    alert('✅ Livro cadastrado e selecionado para o empréstimo!');
  };

  const handleSelecionarLeitor = (leitor) => {
    console.log('🎯 handleSelecionarLeitor chamado:', leitor);
    const cat = (leitor.categoria || leitor.tipo || '').toLowerCase();
    let categoriaAuto = '';
    if (/professor/.test(cat)) categoriaAuto = 'professor';
    else if (/aluno|estudante/.test(cat)) categoriaAuto = 'estudante';
    else if (/funcion|servidor|bibliotec|coordenador|diretor|gestor|admin/.test(cat)) categoriaAuto = 'funcionario';
    else if (/comunidade/.test(cat)) categoriaAuto = 'comunidade';
    setFormData(prev => {
      const newFormData = { ...prev, clienteId: leitor.id, categoriaLeitor: categoriaAuto || prev.categoriaLeitor };
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

    if (!leitorCadastrado) {
      return;
    }
    
    // Selecionar o leitor recém-cadastrado
    setFormData(prev => ({ ...prev, clienteId: leitorCadastrado.id }));
    setMostrarCadastroLeitor(false);
    alert('✅ Leitor cadastrado com sucesso!');
  };

  const perguntarCadastroLeitor = () => {
    const termoBusca = String(buscaLeitor || '').trim();
    if (!termoBusca) {
      alert('Digite o nome, CPF ou matrícula do leitor para buscar.');
      return;
    }

    const confirmarCadastro = window.confirm(
      `Leitor não encontrado para "${termoBusca}".\n\nDeseja cadastrá-lo agora?`
    );

    if (!confirmarCadastro) {
      return;
    }

    const termoSomenteDigitos = termoBusca.replace(/\D/g, '');
    setNovoLeitor((prev) => ({
      ...prev,
      nome: termoSomenteDigitos.length >= 11 ? prev.nome : termoBusca,
      cpf: termoSomenteDigitos.length >= 11 ? termoSomenteDigitos.slice(0, 11) : prev.cpf
    }));
    setMostrarCadastroLeitor(true);
  };

  const handleBuscarLeitor = () => {
    if (!buscaLeitor.trim()) {
      alert('Digite o nome, CPF ou matrícula do leitor para buscar.');
      return;
    }

    if (leitoresFiltrados.length === 1) {
      handleSelecionarLeitor(leitoresFiltrados[0]);
      return;
    }

    if (leitoresFiltrados.length === 0) {
      perguntarCadastroLeitor();
    }
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

  const montarDadosTermoEmprestimo = (emprestimo) => {
    const dados = emprestimo?.dadosTermoEmprestimo || {};
    const livro = livros.find((item) => String(item?.id) === String(emprestimo?.livroId));
    const leitor = clientes.find((item) => String(item?.id) === String(emprestimo?.clienteId));

    return {
      ...dados,
      codigoEmprestimo: dados.codigoEmprestimo || emprestimo?.codigoEmprestimo,
      dataEmprestimo: dados.dataEmprestimo || emprestimo?.dataEmprestimo,
      dataDevolucao: dados.dataDevolucao || emprestimo?.dataDevolucao,
      livroCodigo: dados.livroCodigo || livro?.codigoIdentificacao || 'N/A',
      livroTitulo: dados.livroTitulo || emprestimo?.livroTitulo || livro?.titulo || 'N/A',
      livroAutor: dados.livroAutor || livro?.autor || 'N/A',
      livroISBN: dados.livroISBN || livro?.isbn || 'N/A',
      livroEditora: dados.livroEditora || livro?.editora || 'N/A',
      livroTipo: dados.livroTipo || livro?.tipo || 'N/A',
      leitorCodigo: dados.leitorCodigo || leitor?.codigoIdentificacao || 'N/A',
      leitorNome: dados.leitorNome || emprestimo?.clienteNome || leitor?.nome || 'N/A',
      leitorCPF: dados.leitorCPF || leitor?.cpf || 'N/A',
      leitorTelefone: dados.leitorTelefone || leitor?.telefone || 'N/A',
      leitorEmail: dados.leitorEmail || leitor?.email || 'N/A',
      leitorEndereco: dados.leitorEndereco || leitor?.endereco || 'N/A',
      leitorMatricula: dados.leitorMatricula || leitor?.matricula || '',
      leitorTurma: dados.leitorTurma || emprestimo?.turmaNome || leitor?.turma || leitor?.nomeTurma || 'N/A',
      leitorSerie: dados.leitorSerie || emprestimo?.serieNome || leitor?.serie || leitor?.nomeSerie || 'N/A'
    };
  };
  
  const handleAbrirTermo = (emprestimo) => {
    setTermoSelecionado(montarDadosTermoEmprestimo(emprestimo));
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
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Exemplares no acervo</Typography>
              <Typography variant="h5" fontWeight={700}>{resumoEstoqueEmprestimos.totalExemplares}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Empréstimos ativos</Typography>
              <Typography variant="h5" fontWeight={700}>{resumoEstoqueEmprestimos.emprestados}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Estoque disponível</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">{resumoEstoqueEmprestimos.disponiveis}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Acesso rápido</Typography>
              <Button
                sx={{ mt: 1 }}
                fullWidth
                variant="outlined"
                onClick={() => navigate('/relatorios-livros')}
              >
                Ver estoque disponível
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                {!mostrarCadastroLivro ? (
                  <>
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
                        onKeyDown={(e) => {
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
                  </>
                ) : (
                  <>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      ISBN não encontrado. Cadastre o novo livro para continuar o empréstimo.
                    </Alert>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="ISBN"
                          fullWidth
                          required
                          value={novoLivro.isbn}
                          onChange={(e) => setNovoLivro((prev) => ({ ...prev, isbn: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Título"
                          fullWidth
                          required
                          value={novoLivro.titulo}
                          onChange={(e) => setNovoLivro((prev) => ({ ...prev, titulo: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Autor"
                          fullWidth
                          required
                          value={novoLivro.autor}
                          onChange={(e) => setNovoLivro((prev) => ({ ...prev, autor: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Tipo de Livro"
                          fullWidth
                          select
                          value={novoLivro.tipo}
                          onChange={(e) => setNovoLivro((prev) => ({
                            ...prev,
                            tipo: e.target.value,
                            anoVigencia: e.target.value === 'Didático' ? prev.anoVigencia : ''
                          }))}
                        >
                          <MenuItem value="Didático">Didático</MenuItem>
                          <MenuItem value="Paradidático">Paradidático</MenuItem>
                          <MenuItem value="Livro do Professor">Livro do Professor</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Quantidade"
                          fullWidth
                          type="number"
                          value={novoLivro.quantidade}
                          onChange={(e) => setNovoLivro((prev) => ({ ...prev, quantidade: e.target.value }))}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      {novoLivro.tipo === 'Didático' && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Ano de Vigência"
                            fullWidth
                            type="number"
                            value={novoLivro.anoVigencia}
                            onChange={(e) => setNovoLivro((prev) => ({ ...prev, anoVigencia: e.target.value }))}
                            placeholder="Ex: 2026"
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Editora"
                          fullWidth
                          value={novoLivro.editora}
                          onChange={(e) => setNovoLivro((prev) => ({ ...prev, editora: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Categoria"
                          fullWidth
                          value={novoLivro.categoria}
                          onChange={(e) => setNovoLivro((prev) => ({ ...prev, categoria: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Ano de Publicação"
                          fullWidth
                          type="number"
                          value={novoLivro.anoPublicacao}
                          onChange={(e) => setNovoLivro((prev) => ({ ...prev, anoPublicacao: e.target.value }))}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancelarCadastroLivro}
                        fullWidth
                      >
                        Voltar para busca
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCadastrarLivroEContinuar}
                        fullWidth
                      >
                        Cadastrar e continuar
                      </Button>
                    </Box>
                  </>
                )}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleBuscarLeitor();
                        }
                      }}
                      placeholder="Digite o nome ou CPF do leitor"
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleBuscarLeitor} edge="end">
                              <Search />
                            </IconButton>
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
                        {leitoresFiltrados.map(cliente => (
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

                        {leitoresFiltrados.length === 0 && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            Leitor não encontrado. Deseja cadastrar agora?
                            <Box sx={{ mt: 1 }}>
                              <Button size="small" variant="contained" onClick={perguntarCadastroLeitor}>
                                Cadastrar novo leitor
                              </Button>
                            </Box>
                          </Alert>
                        )}
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
                      <Grid item xs={12}>
                        <FormControl component="fieldset" required>
                          <FormLabel component="legend">Categoria do Leitor</FormLabel>
                          <RadioGroup
                            row
                            value={formData.categoriaLeitor}
                            onChange={(e) => setFormData(prev => ({ ...prev, categoriaLeitor: e.target.value }))}
                          >
                            <FormControlLabel value="estudante" control={<Radio size="small" />} label="Estudante" />
                            <FormControlLabel value="professor" control={<Radio size="small" />} label="Professor" />
                            <FormControlLabel value="funcionario" control={<Radio size="small" />} label="Funcionário" />
                            <FormControlLabel value="comunidade" control={<Radio size="small" />} label="Comunidade" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
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
