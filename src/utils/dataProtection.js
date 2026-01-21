/**
 * 🛡️ SISTEMA DE PROTEÇÃO E MIGRAÇÃO DE DADOS
 * 
 * Garante que os dados do cliente sejam preservados durante atualizações
 * Versão: 3.5.0
 * 
 * Funcionalidades:
 * - Versionamento de dados
 * - Backup automático antes de atualizações
 * - Migração automática de dados entre versões
 * - Recuperação de dados em caso de erro
 * - Validação de integridade
 */

// Versão atual do sistema de dados
const CURRENT_DATA_VERSION = '3.5.0';
const DATA_KEY = 'cei_data';
const BACKUP_KEY = 'cei_data_backup';
const VERSION_KEY = 'cei_data_version';
const LAST_BACKUP_KEY = 'cei_last_backup';

/**
 * 🔐 Criar backup dos dados antes de qualquer operação crítica
 */
export const createBackup = () => {
  try {
    const data = localStorage.getItem(DATA_KEY);
    if (data) {
      const backup = {
        data: data,
        version: localStorage.getItem(VERSION_KEY) || '3.0.0',
        timestamp: new Date().toISOString(),
        checksum: generateChecksum(data)
      };
      
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      localStorage.setItem(LAST_BACKUP_KEY, backup.timestamp);
      
      console.log('✅ [BACKUP] Backup criado com sucesso:', backup.timestamp);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ [BACKUP] Erro ao criar backup:', error);
    return false;
  }
};

/**
 * 🔄 Restaurar backup em caso de erro
 */
export const restoreBackup = () => {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (backupStr) {
      const backup = JSON.parse(backupStr);
      
      // Validar checksum
      if (validateChecksum(backup.data, backup.checksum)) {
        localStorage.setItem(DATA_KEY, backup.data);
        localStorage.setItem(VERSION_KEY, backup.version);
        
        console.log('✅ [RESTORE] Backup restaurado com sucesso');
        return true;
      } else {
        console.error('❌ [RESTORE] Checksum inválido, backup corrompido');
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ [RESTORE] Erro ao restaurar backup:', error);
    return false;
  }
};

/**
 * 📊 Gerar checksum simples para validação
 */
const generateChecksum = (data) => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

/**
 * ✔️ Validar checksum
 */
const validateChecksum = (data, checksum) => {
  return generateChecksum(data) === checksum;
};

/**
 * 🔍 Verificar se precisa migração
 */
export const needsMigration = () => {
  const currentVersion = localStorage.getItem(VERSION_KEY);
  if (!currentVersion) {
    console.log('⚠️ [MIGRATION] Versão não encontrada, primeira inicialização');
    localStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
    return false;
  }
  
  if (currentVersion !== CURRENT_DATA_VERSION) {
    console.log(`🔄 [MIGRATION] Migração necessária: ${currentVersion} → ${CURRENT_DATA_VERSION}`);
    return true;
  }
  
  return false;
};

/**
 * 🚀 Executar migração de dados
 */
export const migrateData = () => {
  console.log('🔄 [MIGRATION] Iniciando migração de dados...');
  
  try {
    // 1. Criar backup antes da migração
    console.log('📦 [MIGRATION] Criando backup...');
    createBackup();
    
    // 2. Carregar dados atuais
    const dataStr = localStorage.getItem(DATA_KEY);
    if (!dataStr) {
      console.log('⚠️ [MIGRATION] Nenhum dado encontrado para migrar');
      localStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
      return { success: true, message: 'Sem dados para migrar' };
    }
    
    let data = JSON.parse(dataStr);
    const oldVersion = localStorage.getItem(VERSION_KEY) || '3.0.0';
    
    console.log(`📋 [MIGRATION] Versão atual: ${oldVersion}`);
    console.log(`📋 [MIGRATION] Dados encontrados:`, {
      instituicoes: data.instituicoes?.length || 0,
      livros: data.livros?.length || 0,
      clientes: data.clientes?.length || 0,
      emprestimos: data.emprestimos?.length || 0,
      patrimonio: data.patrimonio?.length || 0,
      usuarios: data.usuarios?.length || 0
    });
    
    // 3. Executar migrações específicas por versão
    data = migrateFrom30to35(data, oldVersion);
    
    // 4. Adicionar novos campos se necessário
    data = addNewFields(data);
    
    // 5. Validar integridade dos dados
    if (!validateDataIntegrity(data)) {
      console.error('❌ [MIGRATION] Falha na validação de integridade');
      restoreBackup();
      return { success: false, message: 'Falha na validação de integridade' };
    }
    
    // 6. Salvar dados migrados
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
    
    console.log('✅ [MIGRATION] Migração concluída com sucesso!');
    console.log(`✅ [MIGRATION] Nova versão: ${CURRENT_DATA_VERSION}`);
    
    return { 
      success: true, 
      message: `Dados atualizados de ${oldVersion} para ${CURRENT_DATA_VERSION}`,
      stats: {
        instituicoes: data.instituicoes?.length || 0,
        livros: data.livros?.length || 0,
        clientes: data.clientes?.length || 0,
        emprestimos: data.emprestimos?.length || 0,
        patrimonio: data.patrimonio?.length || 0,
        usuarios: data.usuarios?.length || 0
      }
    };
    
  } catch (error) {
    console.error('❌ [MIGRATION] Erro durante migração:', error);
    console.log('🔄 [MIGRATION] Restaurando backup...');
    restoreBackup();
    return { success: false, message: 'Erro na migração, backup restaurado' };
  }
};

/**
 * 🔄 Migração específica de 3.0 para 3.5
 */
const migrateFrom30to35 = (data, oldVersion) => {
  console.log('🔄 [MIGRATION] Executando migração 3.0 → 3.5');
  
  // Adicionar campos novos nos livros (edição e cidadeEdicao)
  if (data.livros && Array.isArray(data.livros)) {
    data.livros = data.livros.map(livro => ({
      ...livro,
      edicao: livro.edicao || '',
      cidadeEdicao: livro.cidadeEdicao || ''
    }));
    console.log('✅ [MIGRATION] Campos de edição adicionados aos livros');
  }
  
  // Garantir que instituições tenham todos os campos necessários
  if (data.instituicoes && Array.isArray(data.instituicoes)) {
    data.instituicoes = data.instituicoes.map(inst => ({
      ...inst,
      statusFinanceiro: inst.statusFinanceiro || 'em_dia',
      dataExpiracao: inst.dataExpiracao || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
    console.log('✅ [MIGRATION] Campos de instituições atualizados');
  }
  
  return data;
};

/**
 * ➕ Adicionar novos campos mantendo dados existentes
 */
const addNewFields = (data) => {
  console.log('➕ [MIGRATION] Adicionando novos campos...');
  
  // Garantir estrutura básica
  const updatedData = {
    instituicoes: data.instituicoes || [],
    livros: data.livros || [],
    clientes: data.clientes || [],
    emprestimos: data.emprestimos || [],
    patrimonio: data.patrimonio || [],
    usuarios: data.usuarios || [],
    planos: data.planos || [],
    ...data
  };
  
  return updatedData;
};

/**
 * ✔️ Validar integridade dos dados
 */
const validateDataIntegrity = (data) => {
  try {
    // Verificar se é um objeto válido
    if (!data || typeof data !== 'object') {
      console.error('❌ [VALIDATION] Dados não são um objeto válido');
      return false;
    }
    
    // Verificar arrays principais
    const requiredArrays = ['instituicoes', 'livros', 'clientes', 'emprestimos', 'patrimonio', 'usuarios'];
    for (const key of requiredArrays) {
      if (data[key] && !Array.isArray(data[key])) {
        console.error(`❌ [VALIDATION] ${key} não é um array`);
        return false;
      }
    }
    
    console.log('✅ [VALIDATION] Integridade dos dados confirmada');
    return true;
    
  } catch (error) {
    console.error('❌ [VALIDATION] Erro na validação:', error);
    return false;
  }
};

/**
 * 🔄 Inicializar sistema de proteção
 */
export const initDataProtection = () => {
  console.log('🛡️ [INIT] Inicializando sistema de proteção de dados...');
  console.log(`📋 [INIT] Versão do sistema: ${CURRENT_DATA_VERSION}`);
  
  try {
    // Verificar se precisa migração
    if (needsMigration()) {
      const result = migrateData();
      if (result.success) {
        console.log('✅ [INIT] Migração concluída:', result.message);
        if (result.stats) {
          console.log('📊 [INIT] Estatísticas:', result.stats);
        }
        return { success: true, migrated: true, ...result };
      } else {
        console.error('❌ [INIT] Falha na migração:', result.message);
        return { success: false, migrated: false, error: result.message };
      }
    } else {
      console.log('✅ [INIT] Sistema atualizado, nenhuma migração necessária');
      return { success: true, migrated: false };
    }
    
  } catch (error) {
    console.error('❌ [INIT] Erro crítico na inicialização:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 📊 Obter estatísticas de backup
 */
export const getBackupInfo = () => {
  try {
    const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
    const backupStr = localStorage.getItem(BACKUP_KEY);
    
    if (!backupStr) {
      return { exists: false };
    }
    
    const backup = JSON.parse(backupStr);
    return {
      exists: true,
      timestamp: backup.timestamp,
      version: backup.version,
      age: lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 1000 / 60) : null
    };
    
  } catch (error) {
    console.error('❌ [BACKUP INFO] Erro:', error);
    return { exists: false, error: error.message };
  }
};

export default {
  initDataProtection,
  createBackup,
  restoreBackup,
  needsMigration,
  migrateData,
  getBackupInfo,
  CURRENT_DATA_VERSION
};
