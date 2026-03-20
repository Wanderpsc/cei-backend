/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT - CEI Sistema
 * Cliente de conexão com banco de dados na nuvem
 * © 2026 Wander Pires Silva Coelho
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

const normalizeConfigValue = (value) => String(value || '').trim();

const isValidSupabaseConfig = (url, anonKey) => {
  const normalizedUrl = normalizeConfigValue(url);
  const normalizedAnonKey = normalizeConfigValue(anonKey);

  return Boolean(
    normalizedUrl &&
    normalizedAnonKey &&
    normalizedUrl !== 'https://seu-projeto.supabase.co' &&
    normalizedAnonKey !== 'sua-chave-publica-aqui' &&
    normalizedUrl.includes('supabase.co')
  );
};

const readSharedRuntimeConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', anonKey: '' };
  }

  const sharedConfig = window.CEI_RUNTIME_CONFIG || {};

  return {
    url: normalizeConfigValue(sharedConfig.supabaseUrl || sharedConfig.supabase_url),
    anonKey: normalizeConfigValue(sharedConfig.supabaseAnonKey || sharedConfig.supabase_anon_key)
  };
};

const readBrowserLocalConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', anonKey: '' };
  }

  return {
    url: normalizeConfigValue(window.localStorage.getItem('cei_supabase_url')),
    anonKey: normalizeConfigValue(window.localStorage.getItem('cei_supabase_anon_key'))
  };
};

const resolveCloudConfig = () => {
  const sharedRuntimeConfig = readSharedRuntimeConfig();
  if (isValidSupabaseConfig(sharedRuntimeConfig.url, sharedRuntimeConfig.anonKey)) {
    return {
      url: sharedRuntimeConfig.url,
      anonKey: sharedRuntimeConfig.anonKey,
      source: 'runtime-file'
    };
  }

  const envConfig = {
    url: normalizeConfigValue(process.env.REACT_APP_SUPABASE_URL),
    anonKey: normalizeConfigValue(process.env.REACT_APP_SUPABASE_ANON_KEY)
  };
  if (isValidSupabaseConfig(envConfig.url, envConfig.anonKey)) {
    return {
      ...envConfig,
      source: 'env'
    };
  }

  const browserLocalConfig = readBrowserLocalConfig();
  if (isValidSupabaseConfig(browserLocalConfig.url, browserLocalConfig.anonKey)) {
    return {
      url: browserLocalConfig.url,
      anonKey: browserLocalConfig.anonKey,
      source: 'localStorage'
    };
  }

  return {
    url: '',
    anonKey: '',
    source: 'none'
  };
};

// Configuração do Supabase
const resolvedCloudConfig = resolveCloudConfig();
const supabaseUrl = resolvedCloudConfig.url;
const supabaseAnonKey = resolvedCloudConfig.anonKey;

export const cloudConfigSource = resolvedCloudConfig.source;
export const cloudConfigScope = cloudConfigSource === 'localStorage'
  ? 'browser-local'
  : cloudConfigSource === 'none'
    ? 'none'
    : 'shared';

// Verificar se as credenciais estão configuradas
const isSupabaseConfigured = isValidSupabaseConfig(supabaseUrl, supabaseAnonKey);

// Criar cliente Supabase (se configurado)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-cei-version': '3.5.2'
        }
      }
    })
  : null;

// Status da conexão
export const isCloudEnabled = isSupabaseConfigured;

// Log de status
if (isSupabaseConfigured) {
  console.log(`☁️ Supabase configurado (${cloudConfigSource}):`, supabaseUrl);
} else {
  console.log('💾 Modo local apenas neste navegador/dispositivo (Supabase não configurado)');
}

/**
 * Verificar conexão com Supabase
 */
export const checkConnection = async () => {
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase
      .from('instituicoes')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
    return false;
  }
};

/**
 * Obter usuário autenticado
 */
export const getCurrentUser = async () => {
  if (!supabase) return null;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error);
    return null;
  }
};

/**
 * Fazer login
 */
export const signIn = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    throw error;
  }
};

/**
 * Fazer logout
 */
export const signOut = async () => {
  if (!supabase) return;
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
    throw error;
  }
};

/**
 * Registrar novo usuário
 */
export const signUp = async (email, password, metadata = {}) => {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    throw error;
  }
};

export default supabase;
