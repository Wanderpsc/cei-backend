import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../utils/apiService';
import { initDataProtection, createBackup } from '../utils/dataProtection';

// Versão do sistema - IMPORTANTE: Incrementar a cada atualização significativa
const SYSTEM_VERSION = '3.5.2';
const DATA_VERSION_KEY = 'cei_data_version';
const LAST_UPDATE_KEY = 'cei_last_update';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Instituições pré-cadastradas
  const instituicoesPadrao = [
    {
      id: 1,
      nomeInstituicao: 'CETI Desembargador Amaral',
      cnpj: '00.000.000/0001-00',
      email: 'contato@cetidesamaral.edu.br',
      telefone: '(86) 3221-0000',
      endereco: 'Rua exemplo, 123',
      cidade: 'Teresina',
      estado: 'PI',
      cep: '64000-000',
      nomeResponsavel: 'Wander Pires Silva Coelho',
      cargoResponsavel: 'Diretor',
      emailResponsavel: 'wander@cetidesamaral.edu.br',
      telefoneResponsavel: '(86) 99999-0000',
      loginAdmin: 'cetidesamaral',
      senhaAdmin: 'Ceti@2026',
      plano: '1 Ano (365 dias)',
      diasLicenca: 365,
      valorMensal: 970.00,
      status: 'ativo',
      dataCadastro: new Date('2024-01-01T00:00:00').toISOString(),
      dataAtivacao: new Date('2024-01-01T00:00:00').toISOString(),
      dataExpiracao: new Date('2027-01-01T23:59:59').toISOString(), // Válido até 2027
      licenca: 'CETI-2024-AMAR-AL01',
      statusFinanceiro: 'em_dia'
    },
    {
      id: 999,
      nomeInstituicao: 'Escola Teste - Versão Demonstração',
      cnpj: '00.000.000/0000-00',
      email: 'teste@cei-demo.com.br',
      telefone: '(00) 0000-0000',
      endereco: 'Teste Demonstração',
      cidade: 'Demo',
      estado: 'TE',
      cep: '00000-000',
      nomeResponsavel: 'Conta Teste',
      cargoResponsavel: 'Demonstração',
      emailResponsavel: 'teste@cei-demo.com.br',
      telefoneResponsavel: '(00) 00000-0000',
      loginAdmin: 'demo',
      senhaAdmin: 'demo2026',
      plano: 'Teste - Limitado',
      diasLicenca: 30,
      valorMensal: 0,
      status: 'ativo',
      dataCadastro: new Date().toISOString(),
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      licenca: 'DEMO-TESTE-LIMITADO',
      statusFinanceiro: 'teste',
      contaTeste: true,
      limites: {
        maxLivros: 15,
        maxLeitores: 15
      }
    }
  ];

  // Usuários padrão - SUPER ADMIN DA MATRIZ + Admin da CETI + Conta Teste
  const usuariosPadrao = [
    {
      id: 1,
      nome: 'Super Administrador',
      login: 'superadmin',
      senha: 'matriz@2025',
      perfil: 'SuperAdmin', // Controle total da matriz
      tipo: 'master',
      instituicaoId: 0 // 0 = Matriz
    },
    {
      id: 2,
      nome: 'Wander Pires Silva Coelho',
      login: 'cetidesamaral',
      senha: 'Ceti@2026',
      perfil: 'Admin',
      tipo: 'master', // Usuário master da instituição
      instituicaoId: 1, // CETI Desembargador Amaral
      email: 'wander@cetidesamaral.edu.br',
      cargo: 'Diretor',
      status: 'ativo',
      dataCriacao: new Date('2024-01-01').toISOString()
    },
    {
      id: 999,
      nome: 'Usuário Demonstração',
      login: 'demo',
      senha: 'demo2026',
      perfil: 'Admin',
      tipo: 'teste',
      instituicaoId: 999, // Instituição de teste
      email: 'teste@cei-demo.com.br',
      cargo: 'Teste',
      status: 'ativo',
      dataCriacao: new Date().toISOString(),
      contaTeste: true
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
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    // Restaurar usuário logado do localStorage
    const usuarioSalvo = localStorage.getItem('cei_usuario_logado');
    console.log('🔐 [INIT] Tentando restaurar usuário do localStorage');
    console.log('🔐 [INIT] localStorage.getItem("cei_usuario_logado"):', usuarioSalvo);
    
    if (usuarioSalvo) {
      try {
        const parsed = JSON.parse(usuarioSalvo);
        console.log('✅ [INIT] Usuário restaurado com sucesso:', parsed.nome);
        return parsed;
      } catch (error) {
        console.error('❌ [INIT] Erro ao fazer parse do usuário:', error);
        return null;
      }
    } else {
      console.log('⚠️ [INIT] Nenhum usuário salvo no localStorage');
      return null;
    }
  });
  const [instituicaoAtiva, setInstituicaoAtiva] = useState(() => {
    // Restaurar instituição ativa do localStorage
    const instituicaoSalva = localStorage.getItem('cei_instituicao_ativa');
    console.log('🏢 [INIT] instituicaoAtiva restaurada:', instituicaoSalva);
    return instituicaoSalva ? parseInt(instituicaoSalva) : null;
  });
  // Marcar como true imediatamente porque a restauração do localStorage acima é síncrona
  const [autenticacaoCarregada, setAutenticacaoCarregada] = useState(true);
  const [planos, setPlanos] = useState(planosPadrao);
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [logAtividades, setLogAtividades] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  // Função para sincronizar dados com o servidor
  const sincronizarDados = async () => {
    if (sincronizando || !dadosCarregados) {
      console.log('⏸️ Sincronização ignorada:', sincronizando ? 'Já sincronizando' : 'Dados ainda não carregados');
      return;
    }
    
    try {
      setSincronizando(true);
      window.dispatchEvent(new Event('sync-start'));
      
      const dadosAtuais = {
        instituicoes,
        livros,
        patrimonio,
        clientes,
        emprestimos,
        usuarios,
        planos,
        notasFiscais
      };

      const dadosSincronizados = await apiService.sincronizarDados(dadosAtuais);

      // Atualizar estados com dados sincronizados
      if (dadosSincronizados) {
        setInstituicoes(dadosSincronizados.instituicoes || []);
        setLivros(dadosSincronizados.livros || []);
        setPatrimonio(dadosSincronizados.patrimonio || []);
        setClientes(dadosSincronizados.clientes || []);
        setEmprestimos(dadosSincronizados.emprestimos || []);
        setPlanos(dadosSincronizados.planos || planosPadrao);
        setNotasFiscais(dadosSincronizados.notasFiscais || []);
        
        // Manter usuários com SuperAdmin
        if (dadosSincronizados.usuarios) {
          const temSuperAdmin = dadosSincronizados.usuarios.some(u => u.perfil === 'SuperAdmin');
          if (temSuperAdmin) {
            setUsuarios(dadosSincronizados.usuarios);
          } else {
            setUsuarios([...usuariosPadrao, ...dadosSincronizados.usuarios.filter(u => u.perfil !== 'SuperAdmin')]);
          }
        }
      }
      
      console.log('Sincronização concluída com sucesso');
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setSincronizando(false);
      window.dispatchEvent(new Event('sync-end'));
    }
  };

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const carregarDados = async () => {
      console.log('🔄 [INIT] Iniciando carregamento de dados...');
      
      // � PASSO 0: Verificar atualização do sistema e criar backup de segurança
      const versaoAtual = localStorage.getItem(DATA_VERSION_KEY);
      const ultimaAtualizacao = localStorage.getItem(LAST_UPDATE_KEY);
      
      if (versaoAtual !== SYSTEM_VERSION) {
        console.log('🔄 [UPDATE] Detectada atualização do sistema!');
        console.log(`📊 [UPDATE] Versão anterior: ${versaoAtual || 'inicial'} → Nova versão: ${SYSTEM_VERSION}`);
        
        // Criar backup de segurança ANTES de qualquer alteração
        console.log('💾 [UPDATE] Criando backup de segurança antes da atualização...');
        try {
          const dadosAtuais = localStorage.getItem('cei_data');
          if (dadosAtuais) {
            // Backup da versão anterior
            localStorage.setItem(`cei_backup_v${versaoAtual || 'old'}_${Date.now()}`, dadosAtuais);
            console.log('✅ [UPDATE] Backup criado com sucesso!');
            
            // Criar backup adicional em formato legível
            createBackup();
            
            // Limpar backups antigos (manter apenas os 5 mais recentes)
            const allKeys = Object.keys(localStorage);
            const backupKeys = allKeys.filter(key => key.startsWith('cei_backup_v')).sort().reverse();
            if (backupKeys.length > 5) {
              backupKeys.slice(5).forEach(key => {
                localStorage.removeItem(key);
                console.log('🗑️ [UPDATE] Backup antigo removido:', key);
              });
            }
          }
        } catch (error) {
          console.error('❌ [UPDATE] Erro ao criar backup:', error);
          alert('⚠️ ATENÇÃO: Não foi possível criar backup antes da atualização. Recomenda-se exportar seus dados manualmente.');
        }
        
        // Atualizar versão
        localStorage.setItem(DATA_VERSION_KEY, SYSTEM_VERSION);
        localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
        
        console.log('✅ [UPDATE] Sistema atualizado com sucesso!');
        console.log('📅 [UPDATE] Data da atualização:', new Date().toLocaleString('pt-BR'));
      }
      
      // �🛡️ PASSO 1: Inicializar sistema de proteção de dados
      console.log('🛡️ [INIT] Inicializando proteção de dados...');
      const protectionResult = initDataProtection();
      
      if (protectionResult.migrated) {
        console.log('✅ [INIT] Dados migrados com sucesso!');
        if (protectionResult.stats) {
          console.log('📊 [INIT] Dados preservados:', protectionResult.stats);
        }
      }
      
      if (!protectionResult.success) {
        console.error('❌ [INIT] Erro na proteção de dados:', protectionResult.error);
        alert('⚠️ Erro ao carregar dados. Seu backup será restaurado.');
      }
      
      // PASSO 2: Carregar dados (agora já migrados se necessário)
      let dadosSalvos = localStorage.getItem('cei_data');
      console.log('🔄 Carregando dados...', dadosSalvos ? 'Dados encontrados' : 'Sem dados salvos');
      
      // 🔧 Sistema de recuperação: tentar restaurar backup se dados corrompidos
      let tentativaRecuperacao = false;
      
      if (dadosSalvos) {
        try {
          // Testar se os dados são válidos
          JSON.parse(dadosSalvos);
        } catch (parseError) {
          console.error('❌ [RECOVERY] Dados corrompidos detectados!', parseError);
          tentativaRecuperacao = true;
          
          // Tentar recuperar do backup mais recente
          const allKeys = Object.keys(localStorage);
          const backupKeys = allKeys.filter(key => key.startsWith('cei_backup_v')).sort().reverse();
          
          if (backupKeys.length > 0) {
            console.log('🔄 [RECOVERY] Tentando recuperar do backup:', backupKeys[0]);
            const backupData = localStorage.getItem(backupKeys[0]);
            if (backupData) {
              try {
                JSON.parse(backupData); // Validar backup
                dadosSalvos = backupData;
                localStorage.setItem('cei_data', backupData); // Restaurar
                console.log('✅ [RECOVERY] Dados recuperados com sucesso do backup!');
                alert('✅ Sistema recuperado! Seus dados foram restaurados do backup mais recente.');
              } catch (backupError) {
                console.error('❌ [RECOVERY] Backup também corrompido:', backupError);
              }
            }
          }
          
          if (tentativaRecuperacao && !dadosSalvos) {
            alert('❌ Erro crítico: Não foi possível recuperar seus dados. O sistema será reiniciado com dados padrão.');
            dadosSalvos = null;
          }
        }
      }
      
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        console.log('📦 Dados parseados:', {
          instituicoes: dados.instituicoes?.length || 0,
          usuarios: dados.usuarios?.length || 0,
          livros: dados.livros?.length || 0,
          clientes: dados.clientes?.length || 0
        });
        
        // Priorizar dados salvos e adicionar padrões apenas se não existirem
        const instituicoesMerged = dados.instituicoes ? [...dados.instituicoes] : [];
        instituicoesPadrao.forEach(instPadrao => {
          if (!instituicoesMerged.find(i => i.id === instPadrao.id)) {
            instituicoesMerged.push(instPadrao);
            console.log('➕ Adicionando instituição padrão:', instPadrao.nomeInstituicao);
          }
        });
        setInstituicoes(instituicoesMerged);
        console.log('✅ Total de instituições carregadas:', instituicoesMerged.length);
        
        setLivros(dados.livros || []);
        setPatrimonio(dados.patrimonio || []);
        setClientes(dados.clientes || []);
        setEmprestimos(dados.emprestimos || []);
        setPlanos(dados.planos || planosPadrao);
        setNotasFiscais(dados.notasFiscais || []);
        setLogAtividades(dados.logAtividades || []);
        
        // Priorizar usuários salvos e garantir que padrões existam
        const usuariosMerged = dados.usuarios && dados.usuarios.length > 0 ? [...dados.usuarios] : [];
        usuariosPadrao.forEach(userPadrao => {
          if (!usuariosMerged.find(u => u.id === userPadrao.id)) {
            usuariosMerged.push(userPadrao);
            console.log('➕ Adicionando usuário padrão:', userPadrao.login);
          }
        });
        setUsuarios(usuariosMerged);
        console.log('✅ Total de usuários carregados:', usuariosMerged.length);
        
        // Verificar licenças expiradas ao carregar
        verificarLicencasExpiradas(instituicoesMerged);
      } else {
        // Se não há dados salvos, inicializar com dados padrão
        console.log('🆕 Inicializando com dados padrão...');
        setInstituicoes(instituicoesPadrao);
        setUsuarios(usuariosPadrao);
        console.log('✅ Instituições padrão:', instituicoesPadrao.length);
        console.log('✅ Usuários padrão:', usuariosPadrao.length);
      }

      // Marcar que dados foram carregados
      setDadosCarregados(true);
      console.log('✅ Dados carregados e prontos para sincronizar');

      // Tentar sincronizar com servidor se online
      if (apiService.checkOnlineStatus()) {
        setTimeout(() => sincronizarDados(), 1000);
      }
    };

    carregarDados();
  }, []);

  // Sincronização automática periódica (a cada 5 minutos se online)
  useEffect(() => {
    const interval = setInterval(() => {
      if (apiService.checkOnlineStatus()) {
        sincronizarDados();
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [instituicoes, livros, patrimonio, clientes, emprestimos, usuarios, planos, notasFiscais]);

  // Sincronizar quando voltar online
  useEffect(() => {
    const handleSyncRequired = () => {
      console.log('Sincronização solicitada após reconexão');
      sincronizarDados();
    };

    window.addEventListener('sync-required', handleSyncRequired);
    window.addEventListener('online', handleSyncRequired);

    return () => {
      window.removeEventListener('sync-required', handleSyncRequired);
      window.removeEventListener('online', handleSyncRequired);
    };
  }, [instituicoes, livros, patrimonio, clientes, emprestimos, usuarios, planos, notasFiscais]);

  // Verificar licenças periodicamente (a cada hora)
  useEffect(() => {
    const interval = setInterval(() => {
      verificarLicencasExpiradas(instituicoes);
    }, 3600000); // 1 hora

    return () => clearInterval(interval);
  }, [instituicoes]);

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    // 🛡️ Criar backup antes de salvar (a cada 10 salvamentos ou 1 hora)
    const lastBackup = localStorage.getItem('cei_last_backup');
    const shouldBackup = !lastBackup || 
      (Date.now() - new Date(lastBackup).getTime()) > 60 * 60 * 1000; // 1 hora
    
    if (shouldBackup && dadosCarregados) {
      console.log('📦 [BACKUP] Criando backup automático...');
      createBackup();
    }
    
    const dados = {
      instituicoes,
      livros,
      patrimonio,
      clientes,
      emprestimos,
      usuarios,
      planos,
      notasFiscais,
      logAtividades
    };
    
    try {
      // Validar dados antes de salvar
      const dadosString = JSON.stringify(dados);
      const dadosSize = new Blob([dadosString]).size;
      const dadosSizeMB = (dadosSize / (1024 * 1024)).toFixed(2);
      
      // Verificar se há espaço suficiente (limite típico: 5-10MB)
      if (dadosSize > 9 * 1024 * 1024) { // 9MB de limite
        console.warn('⚠️ [SAVE] Tamanho dos dados próximo do limite:', dadosSizeMB, 'MB');
        alert(`⚠️ ATENÇÃO: Seus dados estão ocupando ${dadosSizeMB}MB. Considere fazer uma limpeza ou exportar dados antigos.`);
      }
      
      // Salvar dados com registro de versão
      const dadosComVersao = {
        ...dados,
        _metadata: {
          version: SYSTEM_VERSION,
          savedAt: new Date().toISOString(),
          dataSize: dadosSize
        }
      };
      
      localStorage.setItem('cei_data', JSON.stringify(dadosComVersao));
      
      console.log('💾 Dados salvos no localStorage:', {
        version: SYSTEM_VERSION,
        size: dadosSizeMB + ' MB',
        instituicoes: instituicoes.length,
        usuarios: usuarios.length,
        livros: livros.length,
        clientes: clientes.length,
        emprestimos: emprestimos.length,
        logs: logAtividades.length,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    } catch (error) {
      console.error('❌ [SAVE] Erro ao salvar dados:', error);
      
      // Tentar salvar em backup de emergência
      try {
        localStorage.setItem('cei_data_emergency', JSON.stringify(dados));
        console.log('🚨 [SAVE] Dados salvos em backup de emergência');
        alert('⚠️ Erro ao salvar dados principais. Backup de emergência criado. Verifique o espaço de armazenamento do navegador.');
      } catch (emergencyError) {
        console.error('❌ [SAVE] Erro crítico ao salvar backup de emergência:', emergencyError);
        alert('❌ ERRO CRÍTICO: Não foi possível salvar seus dados. Exporte seus dados imediatamente!');
      }
    }
  }, [instituicoes, livros, patrimonio, clientes, emprestimos, usuarios, planos, notasFiscais, logAtividades, dadosCarregados]);

  // ==================== VERIFICAÇÃO DE LICENÇAS EXPIRADAS ====================
  
  const verificarLicencasExpiradas = (listaInstituicoes) => {
    const hoje = new Date();
    let houveAlteracao = false;
    
    const instituicoesAtualizadas = listaInstituicoes.map(inst => {
      // Ignorar instituições pendentes ou bloqueadas manualmente
      if (inst.status === 'pendente' || inst.status === 'bloqueado') {
        return inst;
      }
      
      // Verificar se tem data de expiração
      if (!inst.dataExpiracao) {
        return inst;
      }
      
      const dataExpiracao = new Date(inst.dataExpiracao);
      const diasDesdeExpiracao = Math.floor((hoje - dataExpiracao) / (1000 * 60 * 60 * 24));
      
      // Licença ainda válida
      if (dataExpiracao > hoje) {
        // Se estava expirada e renovou, reativar
        if (inst.status === 'expirado') {
          houveAlteracao = true;
          return {
            ...inst,
            status: 'ativo',
            dataExpiracaoReal: null,
            avisoExpiracaoEnviado: false
          };
        }
        return inst;
      }
      
      // Licença expirou
      if (inst.status === 'ativo') {
        houveAlteracao = true;
        console.log(`⚠️ Licença expirada: ${inst.nomeInstituicao} - Período de graça de 30 dias iniciado`);
        
        return {
          ...inst,
          status: 'expirado',
          dataExpiracaoReal: inst.dataExpiracaoReal || hoje.toISOString(), // Marca quando expirou pela primeira vez
          avisoExpiracaoEnviado: true,
          statusFinanceiro: 'expirado'
        };
      }
      
      // Já está expirada - verificar se passou 30 dias (período de graça)
      if (inst.status === 'expirado' && inst.dataExpiracaoReal) {
        const dataExpiracaoReal = new Date(inst.dataExpiracaoReal);
        const diasExpirado = Math.floor((hoje - dataExpiracaoReal) / (1000 * 60 * 60 * 24));
        
        if (diasExpirado >= 30) {
          // Passou o período de graça - limpar dados mas manter instituição
          console.log(`🗑️ Período de graça expirado (${diasExpirado} dias): ${inst.nomeInstituicao} - Limpando dados`);
          houveAlteracao = true;
          limparDadosInstituicaoExpirada(inst.id);
          
          return {
            ...inst,
            status: 'dados_removidos',
            dataRemocaoDados: hoje.toISOString(),
            avisoRemocaoEnviado: true,
            // Manter dados básicos para contato
            dadosBasicosPreservados: {
              nomeInstituicao: inst.nomeInstituicao,
              email: inst.email,
              telefone: inst.telefone,
              cidade: inst.cidade,
              estado: inst.estado,
              cnpj: inst.cnpj,
              nomeResponsavel: inst.nomeResponsavel,
              emailResponsavel: inst.emailResponsavel,
              telefoneResponsavel: inst.telefoneResponsavel,
              plano: inst.plano,
              valorMensal: inst.valorMensal,
              historicoLicencas: inst.historicoLicencas || []
            }
          };
        }
      }
      
      return inst;
    });
    
    if (houveAlteracao) {
      setInstituicoes(instituicoesAtualizadas);
    }
  };

  const limparDadosInstituicaoExpirada = (instituicaoId) => {
    // Remove todos os dados da instituição, mas mantém a instituição básica
    console.log(`🗑️ Limpando dados da instituição ID ${instituicaoId} após expiração de licença`);
    
    setLivros(prev => prev.filter(l => l.instituicaoId !== instituicaoId));
    setPatrimonio(prev => prev.filter(p => p.instituicaoId !== instituicaoId));
    setClientes(prev => prev.filter(c => c.instituicaoId !== instituicaoId));
    setEmprestimos(prev => prev.filter(e => e.instituicaoId !== instituicaoId));
    setNotasFiscais(prev => prev.filter(n => n.instituicaoId !== instituicaoId));
    
    // Manter o usuário admin mas desativar
    setUsuarios(prev => prev.map(u => 
      u.instituicaoId === instituicaoId 
        ? { ...u, status: 'desativado', motivoDesativacao: 'Licença expirada - dados removidos' }
        : u
    ));
  };

  const calcularDiasRestantesLicenca = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao || !instituicao.dataExpiracao) return null;
    
    // Criar datas sem considerar horário (apenas dia/mês/ano)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const expiracao = new Date(instituicao.dataExpiracao);
    expiracao.setHours(0, 0, 0, 0);
    
    console.log('📅 Calculando dias restantes:', {
      instituicao: instituicao.nomeInstituicao,
      hoje: hoje.toISOString().split('T')[0],
      expiracao: expiracao.toISOString().split('T')[0],
      dataExpiracaoOriginal: instituicao.dataExpiracao
    });
    
    const dias = Math.ceil((expiracao - hoje) / (1000 * 60 * 60 * 24));
    console.log('📅 Dias calculados:', dias);
    
    return dias;
  };

  const calcularDiasGracaRestantes = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao || instituicao.status !== 'expirado' || !instituicao.dataExpiracaoReal) return null;
    
    const hoje = new Date();
    const dataExpiracaoReal = new Date(instituicao.dataExpiracaoReal);
    const diasExpirado = Math.floor((hoje - dataExpiracaoReal) / (1000 * 60 * 60 * 24));
    const diasRestantes = 30 - diasExpirado;
    
    return diasRestantes > 0 ? diasRestantes : 0;
  };

  // ==================== FUNÇÕES DE INSTITUIÇÕES ====================
  
  const adicionarInstituicao = (instituicaoData) => {
    // Verificar se já existe uma instituição com o mesmo CNPJ ou Email
    const jaExiste = instituicoes.find(
      i => i.cnpj === instituicaoData.cnpj || 
           i.email === instituicaoData.email ||
           i.loginAdmin === instituicaoData.loginAdmin
    );
    
    if (jaExiste) {
      console.warn('Instituição já cadastrada:', jaExiste);
      return jaExiste; // Retorna a instituição existente ao invés de criar duplicada
    }
    
    const novaInstituicao = {
      ...instituicaoData,
      id: instituicoes.length > 0 ? Math.max(...instituicoes.map(i => i.id)) + 1 : 1,
      dataCadastro: new Date().toISOString(),
      status: instituicaoData.status || 'pendente', // Usar status fornecido ou pendente
      dataExpiracao: instituicaoData.dataExpiracao || null,
      licenca: gerarCodigoLicenca(),
      // FINANCEIRO - Usar valores do plano selecionado se existirem
      plano: instituicaoData.plano || 'mensal',
      diasLicenca: instituicaoData.diasLicenca || 30,
      valorMensal: instituicaoData.valorMensal ?? 97.00,
      diaVencimento: 10, // dia do mês para vencimento
      statusFinanceiro: 'em_dia', // em_dia, pendente, atrasado, bloqueado_financeiro
      pagamentos: [] // histórico de pagamentos
    };
    
    // Atualizar lista de instituições
    const novasInstituicoes = [...instituicoes, novaInstituicao];
    setInstituicoes(novasInstituicoes);
    console.log('Instituição adicionada:', novaInstituicao);
    console.log('Total de instituições:', novasInstituicoes.length);
    
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
    console.log('Usuário admin criado:', adminInstituicao);
    
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
    
    const instituicao = instituicoes.find(i => i.id === id);
    const historicoLicencas = instituicao?.historicoLicencas || [];
    
    // Adicionar ao histórico
    historicoLicencas.push({
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: dataExpiracao.toISOString(),
      diasValidade: diasValidade,
      renovacao: instituicao?.status === 'expirado' || instituicao?.status === 'dados_removidos'
    });
    
    atualizarInstituicao(id, {
      status: 'ativo',
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: dataExpiracao.toISOString(),
      dataExpiracaoReal: null, // Limpar data de expiração real
      avisoExpiracaoEnviado: false,
      statusFinanceiro: 'em_dia',
      historicoLicencas: historicoLicencas
    });
    
    // Se estava com dados removidos, reativar usuário
    if (instituicao?.status === 'dados_removidos') {
      setUsuarios(prev => prev.map(u => 
        u.instituicaoId === id 
          ? { ...u, status: 'ativo', motivoDesativacao: null }
          : u
      ));
    }
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

    // Para planos anuais ou semestrais, usar dataExpiracao como vencimento
    if (instituicao.dataExpiracao && (instituicao.diasLicenca >= 180 || 
        instituicao.plano?.includes('Ano') || 
        instituicao.plano?.includes('ano') ||
        instituicao.plano?.includes('Semestral') ||
        instituicao.plano?.includes('semestral'))) {
      return new Date(instituicao.dataExpiracao);
    }

    // Para planos mensais, usar sistema de vencimento mensal
    const hoje = new Date();
    const diaVencimento = instituicao.diaVencimento || 10;
    
    // Se há último pagamento, calcular a partir dele
    if (instituicao.ultimoPagamento) {
      const dataUltimoPagamento = new Date(instituicao.ultimoPagamento);
      
      // Próximo vencimento é sempre no dia 10 do MÊS SEGUINTE ao pagamento
      let proximoVencimento = new Date(dataUltimoPagamento);
      proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      proximoVencimento.setDate(diaVencimento);
      
      return proximoVencimento;
    }
    
    // Se não há pagamento, calcular a partir de hoje
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

  // ==================== VERIFICAÇÃO DE LIMITES ====================
  
  const verificarLimitesConta = () => {
    if (!usuarioLogado?.contaTeste) {
      return { permitido: true };
    }
    
    const instituicao = instituicoes.find(i => i.id === instituicaoAtiva);
    if (!instituicao?.limites) {
      return { permitido: true };
    }
    
    const livrosInstituicao = livros.filter(l => l.instituicaoId === instituicaoAtiva);
    const leitoresInstituicao = clientes.filter(c => c.instituicaoId === instituicaoAtiva);
    
    return {
      permitido: true,
      limites: instituicao.limites,
      livrosAtual: livrosInstituicao.length,
      leitoresAtual: leitoresInstituicao.length,
      livrosLimiteAtingido: livrosInstituicao.length >= instituicao.limites.maxLivros,
      leitoresLimiteAtingido: leitoresInstituicao.length >= instituicao.limites.maxLeitores
    };
  };

  // ==================== FUNÇÕES CRUD PARA LIVROS ====================
  
  const adicionarLivro = (livro) => {
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return null;
    }
    
    // Verificar limites da conta teste
    const verificacao = verificarLimitesConta();
    if (verificacao.livrosLimiteAtingido) {
      const linkCadastro = window.location.origin + '/cadastro-escola';
      const mensagem = `⚠️ LIMITE ATINGIDO - VERSÃO DEMONSTRAÇÃO\n\n` +
        `Você cadastrou ${verificacao.livrosAtual} de ${verificacao.limites.maxLivros} livros permitidos na versão de teste.\n\n` +
        `Para cadastrar mais livros e ter acesso completo, faça o cadastro completo da sua escola:\n\n` +
        `🔗 ${linkCadastro}\n\n` +
        `Com a versão completa você terá:\n` +
        `✅ Livros ilimitados\n` +
        `✅ Leitores ilimitados\n` +
        `✅ Suporte técnico completo\n` +
        `✅ Backup automático\n` +
        `✅ Sem limitações\n\n` +
        `Valor: R$ 970,00/ano`;
      
      alert(mensagem);
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

  const darBaixaLivro = (id, motivo, detalhes = {}) => {
    const livro = livros.find(l => l.id === id);
    if (!livro) return null;

    const baixa = {
      ...livro,
      baixa: {
        data: new Date().toISOString(),
        motivo, // 'Doação' ou 'Término de Vigência'
        ...detalhes // donatario, cpfDonatario, etc
      }
    };

    // Atualizar livro com informações de baixa
    setLivros(livros.map(l => l.id === id ? baixa : l));
    return baixa;
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
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return null;
    }
    
    // Verificar limites da conta teste
    const verificacao = verificarLimitesConta();
    if (verificacao.leitoresLimiteAtingido) {
      const linkCadastro = window.location.origin + '/cadastro-escola';
      const mensagem = `⚠️ LIMITE ATINGIDO - VERSÃO DEMONSTRAÇÃO\n\n` +
        `Você cadastrou ${verificacao.leitoresAtual} de ${verificacao.limites.maxLeitores} leitores permitidos na versão de teste.\n\n` +
        `Para cadastrar mais leitores e ter acesso completo, faça o cadastro completo da sua escola:\n\n` +
        `🔗 ${linkCadastro}\n\n` +
        `Com a versão completa você terá:\n` +
        `✅ Livros ilimitados\n` +
        `✅ Leitores ilimitados\n` +
        `✅ Suporte técnico completo\n` +
        `✅ Backup automático\n` +
        `✅ Sem limitações\n\n` +
        `Valor: R$ 970,00/ano`;
      
      alert(mensagem);
      return null;
    }
    
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
    const emprestimoId = emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1;
    const numeroSequencial = emprestimoId.toString().padStart(6, '0');
    const codigoEmprestimo = `EMP${numeroSequencial}`;
    
    // Buscar dados do livro
    const livro = livros.find(l => l.id === emprestimoData.livroId);
    
    // Buscar dados do leitor
    const leitor = clientes.find(c => c.id === emprestimoData.clienteId);
    
    // Buscar dados da instituição
    const instituicaoIdAtual = usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva;
    const instituicao = instituicoes.find(i => i.id === instituicaoIdAtual);
    
    // Gerar dados completos do termo de empréstimo
    const dadosTermoEmprestimo = {
      codigoEmprestimo: codigoEmprestimo,
      dataEmprestimo: emprestimoData.dataEmprestimo || new Date().toISOString(),
      dataDevolucao: emprestimoData.dataDevolucaoPrevista,
      
      // Dados do Livro
      livroCodigo: livro?.codigoIdentificacao || 'N/A',
      livroTitulo: livro?.titulo || 'N/A',
      livroAutor: livro?.autor || 'N/A',
      livroISBN: livro?.isbn || 'N/A',
      livroEditora: livro?.editora || 'N/A',
      livroTipo: livro?.tipo || 'N/A',
      
      // Dados do Leitor
      leitorCodigo: leitor?.codigoIdentificacao || 'N/A',
      leitorNome: leitor?.nome || 'N/A',
      leitorCPF: leitor?.cpf || 'N/A',
      leitorTelefone: leitor?.telefone || 'N/A',
      leitorEmail: leitor?.email || 'N/A',
      leitorEndereco: leitor?.endereco || 'N/A',
      leitorMatricula: leitor?.matricula || '',
      
      // Dados da Instituição
      instituicaoNome: instituicao?.nomeInstituicao || 'N/A',
      instituicaoCidade: instituicao?.cidade || 'N/A',
      responsavelNome: instituicao?.nomeResponsavel || usuarioLogado?.nome || 'N/A',
      responsavelCargo: instituicao?.cargoResponsavel || usuarioLogado?.cargo || 'Responsável',
      
      // Observações
      observacoes: emprestimoData.observacoes || ''
    };
    
    const novoEmprestimo = {
      ...emprestimoData,
      id: emprestimoId,
      codigoEmprestimo: codigoEmprestimo,
      instituicaoId: instituicaoIdAtual,
      dataEmprestimo: emprestimoData.dataEmprestimo || new Date().toISOString(),
      dadosTermoEmprestimo: dadosTermoEmprestimo
    };
    setEmprestimos([...emprestimos, novoEmprestimo]);
    return novoEmprestimo;
  };

  const atualizarEmprestimo = (id, dadosAtualizados) => {
    setEmprestimos(emprestimos.map(e => e.id === id ? { ...e, ...dadosAtualizados } : e));
  };

  const devolverLivro = (emprestimoId) => {
    const emprestimo = emprestimos.find(e => e.id === emprestimoId);
    if (emprestimo) {
      atualizarEmprestimo(emprestimoId, {
        status: 'devolvido',
        dataDevolucaoReal: new Date().toISOString()
      });
    }
  };

  const renovarEmprestimo = (emprestimoId, diasAdicionais = 7) => {
    const emprestimo = emprestimos.find(e => e.id === emprestimoId);
    if (emprestimo && emprestimo.status === 'ativo') {
      const novaDataDevolucao = new Date(emprestimo.dataDevolucao);
      novaDataDevolucao.setDate(novaDataDevolucao.getDate() + diasAdicionais);
      
      atualizarEmprestimo(emprestimoId, {
        dataDevolucao: novaDataDevolucao.toISOString(),
        renovado: true,
        dataRenovacao: new Date().toISOString()
      });
    }
  };

  const getEmprestimosFiltrados = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return emprestimos;
    }
    return emprestimos.filter(e => e.instituicaoId === instituicaoAtiva);
  };

  // ==================== FUNÇÕES DE NOTAS FISCAIS ====================
  
  const adicionarNotaFiscal = (notaData) => {
    const proximoNumero = notasFiscais.length > 0 
      ? Math.max(...notasFiscais.map(n => n.numero)) + 1 
      : 1;
    
    const novaNota = {
      ...notaData,
      id: notasFiscais.length > 0 ? Math.max(...notasFiscais.map(n => n.id)) + 1 : 1,
      numero: proximoNumero,
      dataEmissao: new Date().toISOString()
    };
    
    setNotasFiscais([...notasFiscais, novaNota]);
    return novaNota;
  };

  // ==================== FUNÇÕES DE LOG DE ATIVIDADES ====================
  
  const registrarLog = (acao, modulo, descricao, detalhes = {}) => {
    const novoLog = {
      id: logAtividades.length > 0 ? Math.max(...logAtividades.map(l => l.id)) + 1 : 1,
      usuarioId: usuarioLogado?.id,
      usuarioNome: usuarioLogado?.nome,
      instituicaoId: instituicaoAtiva,
      acao, // adicionar, editar, excluir, emprestimo, devolucao, etc
      modulo, // livros, leitores, emprestimos, etc
      descricao,
      detalhes,
      dataHora: new Date().toISOString()
    };
    
    setLogAtividades([...logAtividades, novoLog]);
    return novoLog;
  };

  // ==================== FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS ====================
  
  const adicionarUsuario = (usuarioData) => {
    const novoUsuario = {
      ...usuarioData,
      id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
      dataCriacao: new Date().toISOString()
    };
    
    setUsuarios([...usuarios, novoUsuario]);
    registrarLog('adicionar', 'usuarios', `Usuário "${novoUsuario.nome}" adicionado`, { usuarioId: novoUsuario.id });
    return novoUsuario;
  };

  const editarUsuario = (id, dadosAtualizados) => {
    const usuariosAtualizados = usuarios.map(u => 
      u.id === id ? { ...u, ...dadosAtualizados, dataAtualizacao: new Date().toISOString() } : u
    );
    setUsuarios(usuariosAtualizados);
    registrarLog('editar', 'usuarios', `Usuário "${dadosAtualizados.nome}" editado`, { usuarioId: id });
  };

  const excluirUsuario = (id) => {
    const usuario = usuarios.find(u => u.id === id);
    setUsuarios(usuarios.filter(u => u.id !== id));
    registrarLog('excluir', 'usuarios', `Usuário "${usuario?.nome}" excluído`, { usuarioId: id });
  };

  // ==================== AUTENTICAÇÃO ====================
  
  const login = (loginData, senha) => {
    console.log('=== TENTATIVA DE LOGIN ===');
    console.log('Login fornecido:', loginData);
    console.log('Senha fornecida (length):', senha?.length);
    console.log('Total de usuários cadastrados:', usuarios.length);
    
    // Fazer trim nos dados de entrada
    const loginTrim = loginData?.trim();
    const senhaTrim = senha?.trim();
    
    console.log('Usuários disponíveis:');
    usuarios.forEach(u => {
      console.log(`  - Login: "${u.login}" | Senha (length): ${u.senha?.length} | Perfil: ${u.perfil} | InstituicaoId: ${u.instituicaoId}`);
    });
    
    const usuario = usuarios.find(u => 
      u.login?.trim() === loginTrim && u.senha?.trim() === senhaTrim
    );
    
    if (usuario) {
      console.log('✅ Usuário encontrado:', usuario.nome);
      
      // Verificar se a instituição está ativa (exceto super admin)
      if (usuario.perfil !== 'SuperAdmin' && usuario.instituicaoId !== 0) {
        const instituicao = instituicoes.find(i => i.id === usuario.instituicaoId);
        
        if (!instituicao) {
          console.log('❌ Instituição não encontrada');
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
      
      console.log('✅ Login bem-sucedido!');
      setUsuarioLogado(usuario);
      // Persistir usuário logado no localStorage
      const usuarioParaSalvar = JSON.stringify(usuario);
      console.log('💾 [LOGIN] Salvando usuário no localStorage:', usuarioParaSalvar);
      localStorage.setItem('cei_usuario_logado', usuarioParaSalvar);
      
      if (usuario.perfil !== 'SuperAdmin' && usuario.instituicaoId !== 0) {
        console.log('💾 [LOGIN] Salvando instituicaoAtiva:', usuario.instituicaoId);
        localStorage.setItem('cei_instituicao_ativa', usuario.instituicaoId.toString());
      }
      
      // Verificar se salvou corretamente
      const verificacao = localStorage.getItem('cei_usuario_logado');
      console.log('✔️ [LOGIN] Verificação - localStorage após salvar:', verificacao ? 'OK' : 'FALHOU');
      
      return true;
    }
    
    console.log('❌ Credenciais inválidas - usuário não encontrado');
    return false;
  };

  const logout = () => {
    setUsuarioLogado(null);
    setInstituicaoAtiva(null);
    // Remover do localStorage
    localStorage.removeItem('cei_usuario_logado');
    localStorage.removeItem('cei_instituicao_ativa');
  };

  const recuperarSenha = (email, novaSenha = null) => {
    // Etapa 1: Verificar se o email existe
    const instituicao = instituicoes.find(i => 
      i.email?.toLowerCase() === email.toLowerCase() ||
      i.emailResponsavel?.toLowerCase() === email.toLowerCase()
    );

    if (!instituicao) {
      return {
        sucesso: false,
        mensagem: 'Email não encontrado. Verifique se digitou corretamente.'
      };
    }

    // Se novaSenha foi fornecida, é a etapa 2: redefinir senha
    if (novaSenha) {
      // Encontrar o usuário admin da instituição
      const usuarioAdmin = usuarios.find(u => 
        u.instituicaoId === instituicao.id && 
        u.perfil === 'Admin'
      );

      if (!usuarioAdmin) {
        return {
          sucesso: false,
          mensagem: 'Erro ao localizar usuário da instituição.'
        };
      }

      // Atualizar a senha
      setUsuarios(prev => prev.map(u => 
        u.id === usuarioAdmin.id 
          ? { ...u, senha: novaSenha }
          : u
      ));

      return {
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso!'
      };
    }

    // Etapa 1: Apenas verificação do email
    return {
      sucesso: true,
      escola: instituicao.nomeInstituicao,
      mensagem: 'Email encontrado!'
    };
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

  // ==================== FUNÇÕES DE BACKUP E RECUPERAÇÃO ====================
  
  const exportarDados = () => {
    try {
      const dadosExportacao = {
        version: SYSTEM_VERSION,
        exportDate: new Date().toISOString(),
        data: {
          instituicoes,
          usuarios,
          livros,
          patrimonio,
          clientes,
          emprestimos,
          planos,
          notasFiscais,
          logAtividades
        }
      };
      
      const dataStr = JSON.stringify(dadosExportacao, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cei-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ [EXPORT] Dados exportados com sucesso!');
      registrarLog('Sistema', 'Backup', 'Exportação manual de dados realizada', {
        dataSize: new Blob([dataStr]).size,
        itemCount: {
          instituicoes: instituicoes.length,
          usuarios: usuarios.length,
          livros: livros.length,
          clientes: clientes.length,
          emprestimos: emprestimos.length
        }
      });
      
      return { sucesso: true, mensagem: 'Dados exportados com sucesso!' };
    } catch (error) {
      console.error('❌ [EXPORT] Erro ao exportar dados:', error);
      return { sucesso: false, mensagem: 'Erro ao exportar dados: ' + error.message };
    }
  };
  
  const importarDados = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const dadosImportados = JSON.parse(e.target.result);
          
          // Validar estrutura dos dados
          if (!dadosImportados.data || !dadosImportados.version) {
            throw new Error('Arquivo de backup inválido');
          }
          
          // Criar backup antes de importar
          console.log('📦 [IMPORT] Criando backup de segurança antes da importação...');
          createBackup();
          
          // Importar dados
          const { data } = dadosImportados;
          
          if (data.instituicoes) setInstituicoes(data.instituicoes);
          if (data.usuarios) setUsuarios(data.usuarios);
          if (data.livros) setLivros(data.livros);
          if (data.patrimonio) setPatrimonio(data.patrimonio);
          if (data.clientes) setClientes(data.clientes);
          if (data.emprestimos) setEmprestimos(data.emprestimos);
          if (data.planos) setPlanos(data.planos);
          if (data.notasFiscais) setNotasFiscais(data.notasFiscais);
          if (data.logAtividades) setLogAtividades(data.logAtividades);
          
          console.log('✅ [IMPORT] Dados importados com sucesso!');
          registrarLog('Sistema', 'Backup', 'Importação manual de dados realizada', {
            sourceVersion: dadosImportados.version,
            exportDate: dadosImportados.exportDate,
            itemCount: {
              instituicoes: data.instituicoes?.length || 0,
              usuarios: data.usuarios?.length || 0,
              livros: data.livros?.length || 0,
              clientes: data.clientes?.length || 0,
              emprestimos: data.emprestimos?.length || 0
            }
          });
          
          resolve({ 
            sucesso: true, 
            mensagem: `Dados importados com sucesso! Versão do backup: ${dadosImportados.version}` 
          });
        } catch (error) {
          console.error('❌ [IMPORT] Erro ao importar dados:', error);
          reject({ sucesso: false, mensagem: 'Erro ao importar dados: ' + error.message });
        }
      };
      
      reader.onerror = () => {
        reject({ sucesso: false, mensagem: 'Erro ao ler arquivo' });
      };
      
      reader.readAsText(file);
    });
  };
  
  const limparDadosAntigos = (diasRetencao = 365) => {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasRetencao);
      
      // Limpar empréstimos antigos devolvidos
      const emprestimosAtualizados = emprestimos.filter(emp => {
        if (emp.status === 'devolvido' && emp.dataDevolucaoReal) {
          const dataDevolucao = new Date(emp.dataDevolucaoReal);
          return dataDevolucao > dataLimite;
        }
        return true; // Manter empréstimos ativos
      });
      
      // Limpar logs antigos
      const logsAtualizados = logAtividades.filter(log => {
        const dataLog = new Date(log.data);
        return dataLog > dataLimite;
      });
      
      const removidos = {
        emprestimos: emprestimos.length - emprestimosAtualizados.length,
        logs: logAtividades.length - logsAtualizados.length
      };
      
      setEmprestimos(emprestimosAtualizados);
      setLogAtividades(logsAtualizados);
      
      console.log('🧹 [CLEANUP] Limpeza realizada:', removidos);
      registrarLog('Sistema', 'Manutenção', 'Limpeza de dados antigos realizada', {
        diasRetencao,
        removidos
      });
      
      return { 
        sucesso: true, 
        mensagem: `Limpeza concluída! Removidos: ${removidos.emprestimos} empréstimos e ${removidos.logs} logs antigos.`,
        removidos 
      };
    } catch (error) {
      console.error('❌ [CLEANUP] Erro ao limpar dados:', error);
      return { sucesso: false, mensagem: 'Erro ao limpar dados: ' + error.message };
    }
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
    autenticacaoCarregada, // Novo: indica se autenticação foi carregada do localStorage
    planos,
    notasFiscais,
    sincronizando,
    
    // Funções Instituições
    adicionarInstituicao,
    atualizarInstituicao,
    ativarInstituicao,
    bloquearInstituicao,
    removerInstituicao,
    
    // Funções Licenças
    calcularDiasRestantesLicenca,
    calcularDiasGracaRestantes,
    verificarLicencasExpiradas,
    
    // Funções Livros
    adicionarLivro,
    atualizarLivro,
    removerLivro,
    darBaixaLivro,
    
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
    devolverLivro,
    renovarEmprestimo,
    
    // Funções Notas Fiscais
    adicionarNotaFiscal,
    
    // Funções Log de Atividades
    registrarLog,
    logAtividades,
    
    // Funções Gerenciamento de Usuários
    adicionarUsuario,
    editarUsuario,
    excluirUsuario,
    
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
    
    // Verificação de Limites
    verificarLimitesConta,
    
    // Autenticação
    login,
    logout,
    recuperarSenha,
    
    // Sincronização
    sincronizarDados,
    
    // Backup e Recuperação
    exportarDados,
    importarDados,
    limparDadosAntigos,
    
    // Busca
    buscar
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
