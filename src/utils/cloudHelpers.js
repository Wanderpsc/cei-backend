/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA CONTEXT COM SUPABASE - Híbrido LocalStorage + Nuvem
 * © 2026 Wander Pires Silva Coelho
 * 
 * FUNCIONALIDADES:
 * ✅ Sincronização automática com Supabase
 * ✅ Fallback para LocalStorage se offline
 * ✅ Auto-save a cada 5 minutos
 * ✅ Auto-backup na nuvem a cada 1 hora
 * ✅ Merge inteligente de dados
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase, isCloudEnabled } from '../services/supabaseClient';
import { 
  syncToCloud, 
  syncFromCloud, 
  smartSync,
  backupToCloud,
  getSyncStatus 
} from '../services/syncService';

// ===== ADICIONAR ESTAS FUNÇÕES AO DataContext EXISTENTE =====

/**
 * Salvar dados com sincronização em nuvem
 */
const saveWithSync = async (dataType, newData, instituicaoId) => {
  try {
    // 1. Salvar localmente (imediato)
    localStorage.setItem(`cei_${dataType}`, JSON.stringify(newData));
    console.log(`💾 ${dataType} salvos localmente`);

    // 2. Tentar sincronizar com nuvem (assíncrono)
    if (isCloudEnabled) {
      syncToCloud(dataType, newData, instituicaoId)
        .then(result => {
          if (result.success) {
            console.log(`☁️ ${dataType} sincronizados com nuvem`);
          } else {
            console.warn(`⚠️ Sync falhou para ${dataType}, dados mantidos localmente`);
          }
        })
        .catch(error => {
          console.warn(`⚠️ Erro no sync: ${error.message}`);
        });
    }

    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar ${dataType}:`, error);
    return false;
  }
};

/**
 * Carregar dados com prioridade para nuvem
 */
const loadWithSync = async (dataType, instituicaoId) => {
  try {
    // 1. Tentar carregar da nuvem primeiro (se configurado)
    if (isCloudEnabled) {
      const cloudResult = await syncFromCloud(dataType, instituicaoId);
      
      if (cloudResult.success && cloudResult.data) {
        console.log(`☁️ ${dataType} carregados da nuvem (${cloudResult.data.length} itens)`);
        
        // Salvar localmente como cache
        localStorage.setItem(`cei_${dataType}`, JSON.stringify(cloudResult.data));
        
        return cloudResult.data;
      }
    }

    // 2. Fallback: Carregar do localStorage
    const localData = localStorage.getItem(`cei_${dataType}`);
    if (localData) {
      const parsed = JSON.parse(localData);
      console.log(`💾 ${dataType} carregados do cache local (${parsed.length} itens)`);
      return parsed;
    }

    // 3. Retornar array vazio se não houver dados
    return [];

  } catch (error) {
    console.error(`❌ Erro ao carregar ${dataType}:`, error);
    
    // Fallback final: localStorage
    try {
      const localData = localStorage.getItem(`cei_${dataType}`);
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  }
};

/**
 * Sincronização automática periódica
 */
const setupAutoSync = (instituicaoId) => {
  if (!isCloudEnabled) {
    console.log('💾 Modo LocalStorage - Sync automático desabilitado');
    return;
  }

  console.log('🔄 Configurando sincronização automática...');

  // Sync a cada 5 minutos
  const syncInterval = setInterval(async () => {
    try {
      console.log('🔄 Executando sync automático...');
      
      const dataTypes = ['livros', 'leitores', 'emprestimos', 'patrimonio', 'usuarios'];
      
      for (const dataType of dataTypes) {
        const localData = localStorage.getItem(`cei_${dataType}`);
        if (localData) {
          const parsed = JSON.parse(localData);
          await smartSync(dataType, parsed, instituicaoId);
        }
      }
      
      console.log('✅ Sync automático concluído');
    } catch (error) {
      console.error('❌ Erro no sync automático:', error);
    }
  }, 5 * 60 * 1000); // 5 minutos

  // Backup completo a cada 1 hora
  const backupInterval = setInterval(async () => {
    try {
      console.log('💾 Executando backup automático na nuvem...');
      
      const allData = {
        livros: JSON.parse(localStorage.getItem('cei_livros') || '[]'),
        leitores: JSON.parse(localStorage.getItem('cei_leitores') || '[]'),
        emprestimos: JSON.parse(localStorage.getItem('cei_emprestimos') || '[]'),
        patrimonio: JSON.parse(localStorage.getItem('cei_patrimonio') || '[]'),
        usuarios: JSON.parse(localStorage.getItem('cei_usuarios') || '[]')
      };
      
      await backupToCloud(allData, instituicaoId);
      console.log('✅ Backup automático concluído');
    } catch (error) {
      console.error('❌ Erro no backup automático:', error);
    }
  }, 60 * 60 * 1000); // 1 hora

  // Retornar função de limpeza
  return () => {
    clearInterval(syncInterval);
    clearInterval(backupInterval);
  };
};

/**
 * Verificar status de conexão com nuvem
 */
const checkCloudStatus = async () => {
  const status = await getSyncStatus();
  
  if (status.connected) {
    console.log('✅ Conectado à nuvem Supabase');
  } else if (status.enabled) {
    console.warn('⚠️ Supabase configurado mas offline');
  } else {
    console.log('💾 Modo LocalStorage (Supabase não configurado)');
  }
  
  return status;
};

// ===== EXPORTAR PARA USO NO DataContext =====
export const cloudHelpers = {
  saveWithSync,
  loadWithSync,
  setupAutoSync,
  checkCloudStatus
};

export default cloudHelpers;
