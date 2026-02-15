/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYNC SERVICE - Sincronização LocalStorage ↔ Supabase
 * © 2026 Wander Pires Silva Coelho
 * ═══════════════════════════════════════════════════════════════════════════
 */

import supabase, { isCloudEnabled } from './supabaseClient';

/**
 * Sincronizar dados do LocalStorage para Supabase
 */
export const syncToCloud = async (dataType, data, instituicaoId) => {
  if (!isCloudEnabled || !supabase) {
    console.log('☁️ Supabase não configurado - dados salvos apenas localmente');
    return { success: false, message: 'Cloud sync disabled' };
  }

  try {
    const tableName = getTableName(dataType);
    
    // Preparar dados para envio
    const preparedData = data.map(item => ({
      ...item,
      instituicao_id: instituicaoId,
      dados: JSON.stringify(item), // Backup completo em JSONB
      updated_at: new Date().toISOString()
    }));

    // Fazer upsert (insert ou update)
    const { data: result, error } = await supabase
      .from(tableName)
      .upsert(preparedData, { 
        onConflict: 'id',
        returning: 'minimal'
      });

    if (error) throw error;

    console.log(`✅ ${dataType} sincronizados com sucesso`);
    return { success: true, data: result };

  } catch (error) {
    console.error(`❌ Erro ao sincronizar ${dataType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Buscar dados do Supabase para LocalStorage
 */
export const syncFromCloud = async (dataType, instituicaoId) => {
  if (!isCloudEnabled || !supabase) {
    return { success: false, message: 'Cloud sync disabled' };
  }

  try {
    const tableName = getTableName(dataType);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('instituicao_id', instituicaoId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log(`📥 ${data.length} ${dataType} baixados da nuvem`);
    return { success: true, data };

  } catch (error) {
    console.error(`❌ Erro ao buscar ${dataType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Sincronização bidirecional inteligente
 */
export const smartSync = async (dataType, localData, instituicaoId) => {
  if (!isCloudEnabled || !supabase) {
    return { success: false, merged: localData };
  }

  try {
    // 1. Buscar dados da nuvem
    const cloudResult = await syncFromCloud(dataType, instituicaoId);
    
    if (!cloudResult.success) {
      return { success: false, merged: localData };
    }

    const cloudData = cloudResult.data || [];

    // 2. Fazer merge inteligente
    const merged = mergeData(localData, cloudData);

    // 3. Enviar dados mesclados de volta para nuvem
    await syncToCloud(dataType, merged, instituicaoId);

    console.log(`🔄 Sync bidirecional de ${dataType} concluído`);
    return { success: true, merged };

  } catch (error) {
    console.error(`❌ Erro no smart sync de ${dataType}:`, error);
    return { success: false, merged: localData };
  }
};

/**
 * Merge inteligente de dados (local tem prioridade em caso de conflito)
 */
const mergeData = (localData, cloudData) => {
  const merged = [...localData];
  const localIds = new Set(localData.map(item => item.id));

  // Adicionar itens que existem na nuvem mas não localmente
  cloudData.forEach(cloudItem => {
    if (!localIds.has(cloudItem.id)) {
      merged.push(parseCloudData(cloudItem));
    }
  });

  return merged;
};

/**
 * Converter dados da nuvem para formato local
 */
const parseCloudData = (cloudItem) => {
  try {
    // Se tiver campo 'dados', usar ele como base
    if (cloudItem.dados) {
      const parsed = typeof cloudItem.dados === 'string' 
        ? JSON.parse(cloudItem.dados) 
        : cloudItem.dados;
      return { ...parsed, id: cloudItem.id };
    }
    return cloudItem;
  } catch (error) {
    return cloudItem;
  }
};

/**
 * Mapear tipo de dado para nome da tabela
 */
const getTableName = (dataType) => {
  const tableMap = {
    'livros': 'livros',
    'leitores': 'leitores',
    'clientes': 'leitores', // Alias
    'emprestimos': 'emprestimos',
    'patrimonio': 'patrimonio',
    'usuarios': 'usuarios',
    'instituicoes': 'instituicoes',
    'clubeLeitura': 'clube_leitura',
    'notasFiscais': 'notas_fiscais'
  };

  return tableMap[dataType] || dataType;
};

/**
 * Fazer backup completo na nuvem
 */
export const backupToCloud = async (allData, instituicaoId) => {
  if (!isCloudEnabled) {
    return { success: false, message: 'Cloud backup disabled' };
  }

  const results = {};

  try {
    // Sincronizar cada tipo de dado
    for (const [dataType, data] of Object.entries(allData)) {
      if (Array.isArray(data) && data.length > 0) {
        const result = await syncToCloud(dataType, data, instituicaoId);
        results[dataType] = result;
      }
    }

    console.log('💾 Backup completo na nuvem concluído');
    return { success: true, results };

  } catch (error) {
    console.error('❌ Erro no backup na nuvem:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Restaurar todos os dados da nuvem
 */
export const restoreFromCloud = async (instituicaoId) => {
  if (!isCloudEnabled) {
    return { success: false, message: 'Cloud restore disabled' };
  }

  const restored = {};

  try {
    const dataTypes = ['livros', 'leitores', 'emprestimos', 'patrimonio', 'usuarios', 'clubeLeitura'];

    for (const dataType of dataTypes) {
      const result = await syncFromCloud(dataType, instituicaoId);
      if (result.success) {
        restored[dataType] = result.data;
      }
    }

    console.log('📥 Restauração da nuvem concluída');
    return { success: true, data: restored };

  } catch (error) {
    console.error('❌ Erro na restauração da nuvem:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar status de sincronização
 */
export const getSyncStatus = async () => {
  if (!isCloudEnabled || !supabase) {
    return {
      enabled: false,
      connected: false,
      message: 'Supabase não configurado'
    };
  }

  try {
    const { data, error } = await supabase
      .from('instituicoes')
      .select('id')
      .limit(1);

    return {
      enabled: true,
      connected: !error,
      message: error ? error.message : 'Conectado à nuvem'
    };

  } catch (error) {
    return {
      enabled: true,
      connected: false,
      message: error.message
    };
  }
};

export default {
  syncToCloud,
  syncFromCloud,
  smartSync,
  backupToCloud,
  restoreFromCloud,
  getSyncStatus
};
