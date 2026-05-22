/**
 * SUPABASE KEEP-ALIVE
 * Mantém o projeto Supabase ativo para não ser pausado por inatividade.
 * 
 * COMO USAR:
 * 1. Execute manualmente: node supabase-keepalive.js
 * 2. OU configure como tarefa agendada no Windows (ver instruções abaixo)
 * 
 * CONFIGURAR TAREFA AGENDADA NO WINDOWS (recomendado):
 * - Abra o "Agendador de Tarefas" (Task Scheduler)
 * - Criar Tarefa Básica → Nome: "CEI Supabase KeepAlive"
 * - Disparador: Semanalmente (toda segunda-feira, 8h)
 * - Ação: Iniciar programa → node
 * - Argumentos: "e:\1. Nova pasta\MEUS PROJETOS DE PROGRAMAÇÃO 2\CEI - CONTROLE ESCOLAR INTELIGENTE - BIBLIOTECA\supabase-keepalive.js"
 */

const SUPABASE_URL = 'https://bwjijfccxsqgitqaiigp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ls5ZkRVMPalgE9fko5wzlQ_Uxaj5nwZ';

async function pingSupabase() {
  const url = `${SUPABASE_URL}/rest/v1/instituicoes?select=id&limit=1`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    const timestamp = new Date().toLocaleString('pt-BR');
    if (res.ok) {
      console.log(`✅ [${timestamp}] Supabase ativo - status ${res.status}`);
    } else {
      console.warn(`⚠️ [${timestamp}] Supabase respondeu com status ${res.status}`);
    }
  } catch (error) {
    const timestamp = new Date().toLocaleString('pt-BR');
    console.error(`❌ [${timestamp}] Erro ao pingar Supabase:`, error.message);
  }
}

pingSupabase();
