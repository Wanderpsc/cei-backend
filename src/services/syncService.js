/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYNC SERVICE - Sincronização LocalStorage ↔ Supabase
 * © 2026 Wander Pires Silva Coelho
 * ═══════════════════════════════════════════════════════════════════════════
 */

import supabase, { isCloudEnabled } from './supabaseClient';

const normalizeLogin = (login) => String(login || '').trim().toLowerCase();
const USER_SYNC_SKIP_KEY_PREFIX = 'cei_sync_skip_users_logins_';

const getRowTimestamp = (row) => {
  const value = row?.updated_at || row?.created_at || 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const alignUsuariosForUpsert = async (preparedData, instituicaoId) => {
  const dedupByLogin = new Map();

  preparedData.forEach((row) => {
    const loginKey = normalizeLogin(row?.login);
    if (!loginKey) return;

    const existing = dedupByLogin.get(loginKey);
    if (!existing) {
      dedupByLogin.set(loginKey, row);
      return;
    }

    if (getRowTimestamp(row) >= getRowTimestamp(existing)) {
      dedupByLogin.set(loginKey, row);
    }
  });

  const dedupedRows = Array.from(dedupByLogin.values());
  if (dedupedRows.length === 0) {
    return [];
  }

  const logins = dedupedRows.map((row) => row.login).filter(Boolean);
  const { data: existingUsers, error } = await supabase
    .from('usuarios')
    .select('id, login, instituicao_id')
    .in('login', logins);

  if (error) throw error;

  const existingByLogin = new Map(
    (existingUsers || []).map((user) => [normalizeLogin(user.login), user])
  );

  const alignedRows = [];
  const skippedRows = [];

  dedupedRows.forEach((row) => {
    const loginKey = normalizeLogin(row.login);
    const cloudUser = existingByLogin.get(loginKey);

    if (!cloudUser) {
      alignedRows.push(row);
      return;
    }

    if (Number(cloudUser.instituicao_id) !== Number(instituicaoId) && String(cloudUser.id) !== String(row.id)) {
      skippedRows.push({
        login: row.login,
        instituicaoExistente: cloudUser.instituicao_id
      });
      return;
    }

    if (String(cloudUser.id) === String(row.id)) {
      alignedRows.push(row);
      return;
    }

    const dadosAtualizados = row?.dados && typeof row.dados === 'object'
      ? { ...row.dados, id: cloudUser.id }
      : { id: cloudUser.id };

    alignedRows.push({
      ...row,
      id: cloudUser.id,
      dados: dadosAtualizados
    });
  });

  if (skippedRows.length > 0) {
    console.warn(
      `⚠️ ${skippedRows.length} usuário(s) ignorado(s) no sync por conflito de login com outra instituição.`,
      skippedRows
    );
  }

  return alignedRows;
};

const isUsuariosLoginConflictError = (error) => {
  const code = String(error?.code || '');
  const message = String(error?.message || '').toLowerCase();
  return code === '23505' && message.includes('usuarios_login_key');
};

const getUsuariosSkipSet = (instituicaoId) => {
  try {
    const raw = localStorage.getItem(`${USER_SYNC_SKIP_KEY_PREFIX}${instituicaoId}`);
    const list = JSON.parse(raw || '[]');
    if (!Array.isArray(list)) return new Set();
    return new Set(list.map((item) => normalizeLogin(item)).filter(Boolean));
  } catch (_error) {
    return new Set();
  }
};

const saveUsuariosSkipSet = (instituicaoId, skipSet) => {
  const list = Array.from(skipSet).filter(Boolean);
  localStorage.setItem(`${USER_SYNC_SKIP_KEY_PREFIX}${instituicaoId}`, JSON.stringify(list));
};

const syncUsuariosResiliente = async (preparedData, instituicaoId) => {
  const skipSet = getUsuariosSkipSet(instituicaoId);
  const candidatos = preparedData.filter((row) => !skipSet.has(normalizeLogin(row?.login)));

  if (candidatos.length === 0) {
    return { success: true, data: [], skippedByConflict: 0, synced: 0 };
  }

  let synced = 0;
  let skippedByConflict = 0;
  const novosConflitos = [];

  for (const row of candidatos) {
    const { error } = await supabase
      .from('usuarios')
      .upsert([row], {
        onConflict: 'id',
        returning: 'minimal'
      });

    if (!error) {
      synced += 1;
      continue;
    }

    if (isUsuariosLoginConflictError(error)) {
      const loginKey = normalizeLogin(row?.login);
      if (loginKey) {
        skipSet.add(loginKey);
        novosConflitos.push(row.login);
      }
      skippedByConflict += 1;
      continue;
    }

    throw error;
  }

  if (novosConflitos.length > 0) {
    saveUsuariosSkipSet(instituicaoId, skipSet);
    console.warn(
      `⚠️ ${novosConflitos.length} usuário(s) marcado(s) para ignorar no sync por conflito global de login.`,
      novosConflitos
    );
  }

  return { success: true, data: [], skippedByConflict, synced };
};

const parseCloudData = (cloudItem) => {
  try {
    if (cloudItem?.dados) {
      const parsed = typeof cloudItem.dados === 'string'
        ? JSON.parse(cloudItem.dados)
        : cloudItem.dados;

      return {
        ...parsed,
        id: parsed?.id ?? cloudItem.id,
        instituicaoId: parsed?.instituicaoId ?? cloudItem.instituicao_id,
        dataCadastro: parsed?.dataCadastro || cloudItem.created_at,
        dataAtualizacao: parsed?.dataAtualizacao || cloudItem.updated_at
      };
    }

    return {
      ...cloudItem,
      instituicaoId: cloudItem.instituicao_id,
      dataCadastro: cloudItem.created_at,
      dataAtualizacao: cloudItem.updated_at
    };
  } catch (error) {
    return {
      ...cloudItem,
      instituicaoId: cloudItem.instituicao_id,
      dataCadastro: cloudItem.created_at,
      dataAtualizacao: cloudItem.updated_at
    };
  }
};

const mapItemToCloudRow = (dataType, item, instituicaoId) => {
  if (dataType === 'instituicoes') {
    return {
      id: item.id,
      nome_instituicao: item.nomeInstituicao || item.nome_instituicao || `Instituição ${item.id}`,
      cnpj: item.cnpj || null,
      email: item.email || null,
      telefone: item.telefone || null,
      endereco: item.endereco || null,
      cidade: item.cidade || null,
      estado: item.estado || null,
      cep: item.cep || null,
      licenca: item.licenca || `LIC-${item.id}`,
      status: item.status || 'ativo',
      data_cadastro: item.dataCadastro || item.data_cadastro || new Date().toISOString(),
      data_expiracao: item.dataExpiracao || item.data_expiracao || null,
      plano: item.plano || null,
      dias_licenca: item.diasLicenca || null,
      valor_mensal: item.valorMensal || null,
      dados: item,
      updated_at: new Date().toISOString(),
      created_at: item.dataCadastro || item.created_at || undefined
    };
  }

  if (dataType === 'usuarios') {
    return {
      id: item.id,
      instituicao_id: item.instituicaoId || instituicaoId,
      nome: item.nome || `Usuário ${item.id}`,
      login: item.login || `user_${item.id}`,
      senha: item.senha || 'alterar123',
      perfil: item.perfil || 'Bibliotecário',
      tipo: item.tipo || 'comum',
      email: item.email || null,
      ativo: item.status !== 'desativado',
      dados: item,
      updated_at: new Date().toISOString(),
      created_at: item.dataCriacao || item.dataCadastro || item.created_at || undefined
    };
  }

  const base = {
    id: item.id,
    instituicao_id: instituicaoId,
    dados: item,
    updated_at: new Date().toISOString()
  };

  if (dataType === 'livros') {
    return {
      ...base,
      titulo: item.titulo || item.codigoIdentificacao || `Livro ${item.id}`,
      autor: item.autor || null,
      editora: item.editora || null,
      isbn: item.isbn || null,
      ano_publicacao: item.anoPublicacao || null,
      categoria: item.categoria || null,
      tipo: item.tipo || null,
      vigencia: item.vigencia || null,
      quantidade: item.quantidade || 1,
      localizacao: item.localizacao || null,
      status: item.status || 'disponivel',
      capa_url: item.capaUrl || item.capa || null,
      sinopse: item.sinopse || null,
      created_at: item.dataCadastro || undefined
    };
  }

  if (dataType === 'clientes' || dataType === 'leitores') {
    return {
      ...base,
      nome: item.nome || `Leitor ${item.id}`,
      cpf: item.cpf || null,
      email: item.email || null,
      telefone: item.telefone || null,
      endereco: item.endereco || null,
      tipo: item.tipo || null,
      turma: item.turma || null,
      matricula: item.matricula || null,
      foto_url: item.fotoUrl || item.foto || null,
      ativo: item.ativo !== false,
      created_at: item.dataCadastro || undefined
    };
  }

  if (dataType === 'patrimonio') {
    return {
      ...base,
      descricao: item.descricao || item.nome || `Patrimônio ${item.id}`,
      categoria: item.categoria || null,
      numero_patrimonio: item.numeroPatrimonio || null,
      data_aquisicao: item.dataAquisicao || null,
      valor: item.valor || null,
      estado_conservacao: item.estadoConservacao || null,
      localizacao: item.localizacao || null,
      responsavel: item.responsavel || null,
      created_at: item.dataCadastro || undefined
    };
  }

  if (dataType === 'emprestimos') {
    const hoje = new Date();
    const hojeISO = hoje.toISOString().slice(0, 10);
    const devolucaoISO = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    return {
      ...base,
      livro_id: item.livroId || item.livro_id || null,
      leitor_id: item.clienteId || item.leitorId || item.leitor_id || null,
      data_emprestimo: item.dataEmprestimo || item.data_emprestimo || hojeISO,
      data_devolucao_prevista: item.dataDevolucaoPrevista || item.data_devolucao_prevista || devolucaoISO,
      data_devolucao_real: item.dataDevolucaoReal || item.data_devolucao_real || null,
      status: item.status || 'ativo',
      observacoes: item.observacoes || null,
      multa: item.multa || 0,
      created_at: item.dataCadastro || undefined
    };
  }

  return base;
};

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
    const safeData = Array.isArray(data) ? data : [];
    
    // Preparar dados para envio
    let preparedData = safeData
      .filter(item => item && item.id !== undefined && item.id !== null)
      .map(item => mapItemToCloudRow(dataType, item, instituicaoId));

    if (dataType === 'usuarios') {
      preparedData = await alignUsuariosForUpsert(preparedData, instituicaoId);
      const userResult = await syncUsuariosResiliente(preparedData, instituicaoId);
      console.log(
        `✅ ${dataType} sincronizados com sucesso (${userResult.synced} enviados, ${userResult.skippedByConflict} ignorados por conflito de login)`
      );
      return userResult;
    }

    if (preparedData.length === 0) {
      return { success: true, data: [] };
    }

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

    let query = supabase.from(tableName).select('*');

    if (dataType === 'instituicoes') {
      query = query.eq('id', instituicaoId);
    } else {
      query = query.eq('instituicao_id', instituicaoId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;

    const normalizedData = (data || []).map(parseCloudData);

    console.log(`📥 ${normalizedData.length} ${dataType} baixados da nuvem`);
    return { success: true, data: normalizedData };

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
 * Remover um item da nuvem
 */
export const deleteFromCloud = async (dataType, id, instituicaoId) => {
  if (!isCloudEnabled || !supabase) {
    return { success: false, message: 'Cloud sync disabled' };
  }

  try {
    const tableName = getTableName(dataType);

    let query = supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (dataType !== 'instituicoes') {
      query = query.eq('instituicao_id', instituicaoId);
    }

    const { error } = await query;

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error(`❌ Erro ao remover ${dataType} (${id}) da nuvem:`, error);
    return { success: false, error: error.message };
  }
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
  deleteFromCloud,
  smartSync,
  backupToCloud,
  restoreFromCloud,
  getSyncStatus
};
