/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT - CEI Sistema
 * Cliente de conexão com banco de dados na nuvem
 * © 2026 Wander Pires Silva Coelho
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

const readRuntimeConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', anonKey: '' };
  }

  return {
    url: window.localStorage.getItem('cei_supabase_url') || '',
    anonKey: window.localStorage.getItem('cei_supabase_anon_key') || ''
  };
};

// Configuração do Supabase
const runtimeConfig = readRuntimeConfig();
const supabaseUrl = runtimeConfig.url || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = runtimeConfig.anonKey || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Verificar se as credenciais estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://seu-projeto.supabase.co' &&
  supabaseAnonKey !== 'sua-chave-publica-aqui' &&
  supabaseUrl.includes('supabase.co');

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
  const source = runtimeConfig.url ? 'runtime/localStorage' : 'env';
  console.log(`☁️ Supabase configurado (${source}):`, supabaseUrl);
} else {
  console.log('💾 Modo LocalStorage (Supabase não configurado)');
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
