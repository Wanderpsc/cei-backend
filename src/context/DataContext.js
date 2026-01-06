import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Usuários padrão - SUPER ADMIN DA MATRIZ
  const usuariosPadrao = [
    {
      id: 1,
      nome: 'Super Administrador',
      login: 'superadmin',
      senha: 'matriz@2025',
      perfil: 'SuperAdmin', // Controle total da matriz
      instituicaoId: 0 // 0 = Matriz
    }
  ];

  // Planos padrão
  const planosPadrao = [
    { id: 1, nome: '1 Mês (30 dias)', dias: 30, valor: 97.00, ativo: true },
    { id: 2, nome: '3 Meses (90 dias)', dias: 90, valor: 270.00, ativo: true },
    { id: 3, nome: '6 Meses (180 dias)', dias: 180, valor: 520.00, ativo: true },
    { id: 4, nome: '1 Ano (365 dias)', dias: 365, valor: 970.00, ativo: true },
    { id: 5, nome: '2 Anos (730 dias)', dias: 730, valor: 1800.00, ativo: true }
  ];

  // Estados
  const [instituicoes, setInstituicoes] = useState([]);
  const [livros, setLivros] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [usuarios, setUsuarios] = useState(usuariosPadrao);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [instituicaoAtiva, setInstituicaoAtiva] = useState(null);
  const [planos, setPlanos] = useState(planosPadrao);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('cei_data');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setInstituicoes(dados.instituicoes || []);
      setLivros(dados.livros || []);
      setPatrimonio(dados.patrimonio || []);
      setClientes(dados.clientes || []);
      setEmprestimos(dados.emprestimos || []);
      setPlanos(dados.planos || planosPadrao);
      
      // Garantir que o SuperAdmin sempre exista
      if (dados.usuarios && dados.usuarios.length > 0) {
        const temSuperAdmin = dados.usuarios.some(u => u.perfil === 'SuperAdmin');
        if (temSuperAdmin) {
          setUsuarios(dados.usuarios);
        } else {
          setUsuarios([...usuariosPadrao, ...dados.usuarios.filter(u => u.perfil !== 'SuperAdmin')]);
        }
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    const dados = {
      instituicoes,
      livros,
      patrimonio,
      clientes,
      emprestimos,
      usuarios,
      planos
    };
    localStorage.setItem('cei_data', JSON.stringify(dados));
  }, [instituicoes, livros, patrimonio, clientes, emprestimos, usuarios, planos]);

  // ==================== FUNÇÕES DE INSTITUIÇÕES ====================
  
  const adicionarInstituicao = (instituicaoData) => {
    const novaInstituicao = {
      ...instituicaoData,
      id: instituicoes.length > 0 ? Math.max(...instituicoes.map(i => i.id)) + 1 : 1,
      dataCadastro: new Date().toISOString(),
      status: 'pendente', // pendente, ativo, bloqueado
      dataExpiracao: null,
      licenca: gerarCodigoLicenca(),
      // FINANCEIRO - Usar valores do plano selecionado se existirem
      plano: instituicaoData.plano || 'mensal',
      diasLicenca: instituicaoData.diasLicenca || 30,
      valorMensal: instituicaoData.valorMensal || 97.00,
      diaVencimento: 10, // dia do mês para vencimento
      statusFinanceiro: 'em_dia', // em_dia, pendente, atrasado, bloqueado_financeiro
      pagamentos: [] // histórico de pagamentos
    };
    setInstituicoes([...instituicoes, novaInstituicao]);
    
    // Criar usuário admin para a instituição
    const adminInstituicao = {
      id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 2,
      nome: instituicaoData.nomeResponsavel,
      login: instituicaoData.loginAdmin,
      senha: instituicaoData.senhaAdmin,
      perfil: 'AdminEscola',
      instituicaoId: novaInstituicao.id,
      dataCadastro: new Date().toISOString()
    };
    setUsuarios([...usuarios, adminInstituicao]);
    
    return novaInstituicao;
  };

  const atualizarInstituicao = (id, dadosAtualizados) => {
    setInstituicoes(instituicoes.map(i => 
      i.id === id ? { ...i, ...dadosAtualizados, dataAtualizacao: new Date().toISOString() } : i
    ));
  };

  const ativarInstituicao = (id, diasValidade = 365) => {
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + diasValidade);
    
    atualizarInstituicao(id, {
      status: 'ativo',
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: dataExpiracao.toISOString()
    });
  };

  const bloquearInstituicao = (id, motivo = '') => {
    atualizarInstituicao(id, {
      status: 'bloqueado',
      dataBloqueio: new Date().toISOString(),
      motivoBloqueio: motivo
    });
  };

  const removerInstituicao = (id) => {
    if (window.confirm('Remover instituição apagará TODOS os dados relacionados. Continuar?')) {
      // Remover todos os dados da instituição
      setLivros(livros.filter(l => l.instituicaoId !== id));
      setPatrimonio(patrimonio.filter(p => p.instituicaoId !== id));
      setClientes(clientes.filter(c => c.instituicaoId !== id));
      setEmprestimos(emprestimos.filter(e => e.instituicaoId !== id));
      setUsuarios(usuarios.filter(u => u.instituicaoId !== id));
      setInstituicoes(instituicoes.filter(i => i.id !== id));
    }
  };

  const gerarCodigoLicenca = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      if (i < 3) codigo += '-';
    }
    return codigo;
  };

  // ==================== FUNÇÕES FINANCEIRAS ====================
  
  const registrarPagamento = (instituicaoId, valor, metodoPagamento = 'manual') => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao) return;

    const pagamento = {
      id: Date.now(),
      valor: valor,
      dataPagamento: new Date().toISOString(),
      metodoPagamento: metodoPagamento,
      referenciaMes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      status: 'confirmado'
    };

    const pagamentosAtualizados = [...(instituicao.pagamentos || []), pagamento];
    
    atualizarInstituicao(instituicaoId, {
      pagamentos: pagamentosAtualizados,
      statusFinanceiro: 'em_dia',
      ultimoPagamento: pagamento.dataPagamento
    });
  };

  const verificarInadimplencia = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao || instituicao.status === 'pendente') return false;

    const hoje = new Date();
    const diaVencimento = instituicao.diaVencimento || 10;
    const ultimoPagamento = instituicao.ultimoPagamento ? new Date(instituicao.ultimoPagamento) : new Date(instituicao.dataAtivacao);
    
    // Calcular se está inadimplente (mais de 30 dias sem pagamento)
    const diasSemPagamento = Math.floor((hoje - ultimoPagamento) / (1000 * 60 * 60 * 24));
    
    if (diasSemPagamento > 35) {
      // Bloquear por inadimplência
      atualizarInstituicao(instituicaoId, {
        statusFinanceiro: 'bloqueado_financeiro',
        status: 'bloqueado',
        motivoBloqueio: 'Inadimplência - Pagamento não identificado'
      });
      return true;
    } else if (diasSemPagamento > 30) {
      // Marcar como atrasado
      atualizarInstituicao(instituicaoId, {
        statusFinanceiro: 'atrasado'
      });
      return false;
    }
    
    return false;
  };

  const calcularProximoVencimento = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao) return null;

    const hoje = new Date();
    const diaVencimento = instituicao.diaVencimento || 10;
    let proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
    
    if (proximoVencimento < hoje) {
      proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, diaVencimento);
    }
    
    return proximoVencimento;
  };

  const obterHistoricoPagamentos = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    return instituicao?.pagamentos || [];
  };

  // ==================== FUNÇÕES CRUD PARA LIVROS ====================
  
  const adicionarLivro = (livro) => {
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return null;
    }
    
    const novoLivro = {
      ...livro,
      id: livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1,
      instituicaoId: usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva,
      dataCadastro: new Date().toISOString()
    };
    setLivros([...livros, novoLivro]);
    return novoLivro;
  };

  const atualizarLivro = (id, dadosAtualizados) => {
    setLivros(livros.map(l => l.id === id ? { ...l, ...dadosAtualizados } : l));
  };

  const removerLivro = (id) => {
    setLivros(livros.filter(l => l.id !== id));
  };

  const getLivrosFiltrados = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return livros; // Super admin vê tudo
    }
    return livros.filter(l => l.instituicaoId === instituicaoAtiva);
  };

  // ==================== FUNÇÕES CRUD PARA PATRIMÔNIO ====================
  
  const adicionarPatrimonio = (bem) => {
    const novoBem = {
      ...bem,
      id: patrimonio.length > 0 ? Math.max(...patrimonio.map(p => p.id)) + 1 : 1,
      instituicaoId: usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva,
      dataCadastro: new Date().toISOString()
    };
    setPatrimonio([...patrimonio, novoBem]);
    return novoBem;
  };

  const atualizarPatrimonio = (id, dadosAtualizados) => {
    setPatrimonio(patrimonio.map(p => p.id === id ? { ...p, ...dadosAtualizados } : p));
  };

  const removerPatrimonio = (id) => {
    setPatrimonio(patrimonio.filter(p => p.id !== id));
  };

  const getPatrimonioFiltrado = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return patrimonio;
    }
    return patrimonio.filter(p => p.instituicaoId === instituicaoAtiva);
  };

  // ==================== FUNÇÕES CRUD PARA CLIENTES ====================
  
  const adicionarCliente = (cliente) => {
    const novoCliente = {
      ...cliente,
      id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
      instituicaoId: usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva,
      dataCadastro: new Date().toISOString()
    };
    setClientes([...clientes, novoCliente]);
    return novoCliente;
  };

  const atualizarCliente = (id, dadosAtualizados) => {
    setClientes(clientes.map(c => c.id === id ? { ...c, ...dadosAtualizados } : c));
  };

  const removerCliente = (id) => {
    setClientes(clientes.filter(c => c.id !== id));
  };

  const getClientesFiltrados = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return clientes;
    }
    return clientes.filter(c => c.instituicaoId === instituicaoAtiva);
  };

  // ==================== FUNÇÕES PARA EMPRÉSTIMOS ====================
  
  const adicionarEmprestimo = (emprestimoData) => {
    const novoEmprestimo = {
      ...emprestimoData,
      id: emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1,
      instituicaoId: usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva,
      dataEmprestimo: emprestimoData.dataEmprestimo || new Date().toISOString()
    };
    setEmprestimos([...emprestimos, novoEmprestimo]);
    return novoEmprestimo;
  };

  const atualizarEmprestimo = (id, dadosAtualizados) => {
    setEmprestimos(emprestimos.map(e => e.id === id ? { ...e, ...dadosAtualizados } : e));
  };

  const getEmprestimosFiltrados = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return emprestimos;
    }
    return emprestimos.filter(e => e.instituicaoId === instituicaoAtiva);
  };

  // ==================== AUTENTICAÇÃO ====================
  
  const login = (loginData, senha) => {
    console.log('Tentando login:', loginData);
    const usuario = usuarios.find(u => u.login === loginData && u.senha === senha);
    
    if (usuario) {
      // Verificar se a instituição está ativa (exceto super admin)
      if (usuario.perfil !== 'SuperAdmin' && usuario.instituicaoId !== 0) {
        const instituicao = instituicoes.find(i => i.id === usuario.instituicaoId);
        
        if (!instituicao) {
          console.log('Instituição não encontrada');
          return false;
        }
        
        if (instituicao.status === 'bloqueado') {
          alert('Sua instituição está bloqueada. Entre em contato com o suporte.');
          return false;
        }
        
        if (instituicao.status === 'pendente') {
          alert('Sua instituição está aguardando aprovação.');
          return false;
        }
        
        // Verificar expiração da licença
        if (instituicao.dataExpiracao) {
          const dataExp = new Date(instituicao.dataExpiracao);
          if (dataExp < new Date()) {
            alert('Licença expirada. Entre em contato com o suporte.');
            return false;
          }
        }
        
        setInstituicaoAtiva(usuario.instituicaoId);
      }
      
      console.log('Login bem-sucedido:', usuario);
      setUsuarioLogado(usuario);
      return true;
    }
    
    console.log('Credenciais inválidas');
    return false;
  };

  const logout = () => {
    setUsuarioLogado(null);
    setInstituicaoAtiva(null);
  };

  // ==================== BUSCA ====================
  
  const buscar = (termo) => {
    const termoLower = termo.toLowerCase();
    const livrosFiltrados = getLivrosFiltrados();
    const patrimonioFiltrado = getPatrimonioFiltrado();
    const clientesFiltrados = getClientesFiltrados();
    
    const livrosEncontrados = livrosFiltrados.filter(l => 
      l.titulo?.toLowerCase().includes(termoLower) ||
      l.autor?.toLowerCase().includes(termoLower) ||
      l.isbn?.includes(termo)
    );
    
    const patrimonioEncontrado = patrimonioFiltrado.filter(p => 
      p.descricao?.toLowerCase().includes(termoLower) ||
      p.numeroPatrimonio?.includes(termo) ||
      p.localizacao?.toLowerCase().includes(termoLower)
    );
    
    const clientesEncontrados = clientesFiltrados.filter(c => 
      c.nome?.toLowerCase().includes(termoLower) ||
      c.matricula?.includes(termo)
    );
    
    return {
      livros: livrosEncontrados,
      patrimonio: patrimonioEncontrado,
      clientes: clientesEncontrados
    };
  };

  // ==================== FUNÇÕES DE PLANOS ====================
  
  const adicionarPlano = (planoData) => {
    const novoPlano = {
      ...planoData,
      id: planos.length > 0 ? Math.max(...planos.map(p => p.id)) + 1 : 1,
      ativo: true
    };
    setPlanos([...planos, novoPlano]);
    return novoPlano;
  };

  const atualizarPlano = (id, dadosAtualizados) => {
    setPlanos(planos.map(plano => 
      plano.id === id ? { ...plano, ...dadosAtualizados } : plano
    ));
  };

  const removerPlano = (id) => {
    setPlanos(planos.filter(plano => plano.id !== id));
  };

  const getPlanosAtivos = () => {
    return planos.filter(p => p.ativo);
  };

  const value = {
    // Estados
    instituicoes,
    livros: getLivrosFiltrados(),
    patrimonio: getPatrimonioFiltrado(),
    clientes: getClientesFiltrados(),
    emprestimos: getEmprestimosFiltrados(),
    usuarioLogado,
    instituicaoAtiva,
    planos,
    
    // Funções Instituições
    adicionarInstituicao,
    atualizarInstituicao,
    ativarInstituicao,
    bloquearInstituicao,
    removerInstituicao,
    
    // Funções Livros
    adicionarLivro,
    atualizarLivro,
    removerLivro,
    
    // Funções Patrimônio
    adicionarPatrimonio,
    atualizarPatrimonio,
    removerPatrimonio,
    
    // Funções Clientes
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    
    // Funções Empréstimos
    adicionarEmprestimo,
    atualizarEmprestimo,
    
    // Funções Financeiras
    registrarPagamento,
    verificarInadimplencia,
    calcularProximoVencimento,
    obterHistoricoPagamentos,
    
    // Funções Planos
    adicionarPlano,
    atualizarPlano,
    removerPlano,
    getPlanosAtivos,
    
    // Autenticação
    login,
    logout,
    
    // Busca
    buscar
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
