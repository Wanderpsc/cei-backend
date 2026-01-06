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
  // Usuários padrão
  const usuariosPadrao = [
    {
      id: 1,
      nome: 'Administrador',
      login: 'admin',
      senha: 'admin123',
      perfil: 'AdminSistema'
    },
    {
      id: 2,
      nome: 'Biblioteca',
      login: 'biblioteca',
      senha: 'biblio123',
      perfil: 'AdminEscola'
    }
  ];

  // Estados
  const [livros, setLivros] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [usuarios, setUsuarios] = useState(usuariosPadrao);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('cei_data');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setLivros(dados.livros || []);
      setPatrimonio(dados.patrimonio || []);
      setClientes(dados.clientes || []);
      setEmprestimos(dados.emprestimos || []);
      // Sempre manter usuários padrão se não houver usuários salvos
      if (dados.usuarios && dados.usuarios.length > 0) {
        setUsuarios(dados.usuarios);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    const dados = {
      livros,
      patrimonio,
      clientes,
      emprestimos,
      usuarios
    };
    localStorage.setItem('cei_data', JSON.stringify(dados));
  }, [livros, patrimonio, clientes, emprestimos, usuarios]);

  // Funções CRUD para Livros
  const adicionarLivro = (livro) => {
    const novoLivro = {
      ...livro,
      id: livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1,
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

  // Funções CRUD para Patrimônio
  const adicionarPatrimonio = (bem) => {
    const novoBem = {
      ...bem,
      id: patrimonio.length > 0 ? Math.max(...patrimonio.map(p => p.id)) + 1 : 1,
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

  // Funções CRUD para Clientes
  const adicionarCliente = (cliente) => {
    const novoCliente = {
      ...cliente,
      id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
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

  // Funções para Empréstimos
  const adicionarEmprestimo = (emprestimoData) => {
    const novoEmprestimo = {
      ...emprestimoData,
      id: emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1,
      dataEmprestimo: emprestimoData.dataEmprestimo || new Date().toISOString()
    };
    setEmprestimos([...emprestimos, novoEmprestimo]);
    return novoEmprestimo;
  };

  const atualizarEmprestimo = (id, dadosAtualizados) => {
    setEmprestimos(emprestimos.map(e => e.id === id ? { ...e, ...dadosAtualizados } : e));
  };

  const realizarEmprestimo = (emprestimoData) => {
    return adicionarEmprestimo(emprestimoData);
  };

  const devolverLivro = (emprestimoId) => {
    const emprestimo = emprestimos.find(e => e.id === emprestimoId);
    if (emprestimo) {
      atualizarEmprestimo(emprestimoId, {
        dataDevolucao: new Date().toISOString(),
        dataDevolucaoReal: new Date().toISOString(),
        status: 'devolvido'
      });
    }
  };

  // Função de Login
  const login = (loginData, senha) => {
    console.log('Tentando login:', loginData, senha);
    console.log('Usuários disponíveis:', usuarios);
    const usuario = usuarios.find(u => u.login === loginData && u.senha === senha);
    if (usuario) {
      console.log('Usuário encontrado:', usuario);
      setUsuarioLogado(usuario);
      return true;
    }
    console.log('Usuário não encontrado');
    return false;
  };

  const logout = () => {
    setUsuarioLogado(null);
  };

  // Busca unificada
  const buscar = (termo) => {
    const termoLower = termo.toLowerCase();
    
    const livrosEncontrados = livros.filter(l => 
      l.titulo?.toLowerCase().includes(termoLower) ||
      l.autor?.toLowerCase().includes(termoLower) ||
      l.isbn?.includes(termo)
    );
    
    const patrimonioEncontrado = patrimonio.filter(p => 
      p.nome?.toLowerCase().includes(termoLower) ||
      p.tombamento?.includes(termo) ||
      p.localizacao?.toLowerCase().includes(termoLower)
    );
    
    const clientesEncontrados = clientes.filter(c => 
      c.nome?.toLowerCase().includes(termoLower) ||
      c.matricula?.includes(termo)
    );
    
    return {
      livros: livrosEncontrados,
      patrimonio: patrimonioEncontrado,
      clientes: clientesEncontrados
    };
  };

  const value = {
    // Estados
    livros,
    patrimonio,
    clientes,
    emprestimos,
    usuarioLogado,
    
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
    realizarEmprestimo,
    devolverLivro,
    
    // Autenticação
    login,
    logout,
    
    // Busca
    buscar
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
