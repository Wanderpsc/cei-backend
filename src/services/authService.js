/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH SERVICE - Sessão Supabase Auth (base do isolamento RLS por escola)
 *
 * Após o login local do CEI, estabelece em segundo plano uma sessão no
 * Supabase Auth. O token dessa sessão carrega app_metadata.instituicao_id,
 * que as políticas RLS usam para isolar os dados de cada escola.
 * Usuários ainda não migrados são criados via Edge Function `migrar-usuario`.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import supabase, { isCloudEnabled } from './supabaseClient';

const emailEhValido = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ''));

const slugLogin = (login) => String(login || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9._-]/g, '');

/** E-mail interno usado no Supabase Auth (mesma regra da Edge Function). */
export const emailParaAuth = (usuario) => {
  if (emailEhValido(usuario?.email)) {
    return String(usuario.email).trim().toLowerCase();
  }
  const slug = slugLogin(usuario?.login || usuario?.id);
  return slug ? `${slug}@cei.local` : null;
};

/**
 * Garante uma sessão Supabase Auth para o usuário logado no app.
 * Chamado em segundo plano após o login local - não bloqueia o fluxo
 * e não altera o comportamento atual enquanto o RLS estrito não for ativado.
 */
export const garantirSessaoSupabase = async (usuario, senha) => {
  if (!isCloudEnabled || !supabase?.auth) {
    return { success: false, message: 'Supabase não configurado' };
  }

  try {
    const email = emailParaAuth(usuario);
    if (!email || !senha) {
      return { success: false, message: 'Sem e-mail/senha para autenticar' };
    }

    // Reaproveita a sessão se já for do mesmo usuário; descarta se for de outro
    const { data: sessaoAtual } = await supabase.auth.getSession();
    if (sessaoAtual?.session) {
      const emailSessao = String(sessaoAtual.session.user?.email || '').toLowerCase();
      if (emailSessao === email) {
        return { success: true, jaLogado: true };
      }
      await supabase.auth.signOut();
    }

    let { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (!error) {
      console.log('🔐 [AUTH] Sessão Supabase estabelecida');
      return { success: true };
    }

    // Usuário ainda não existe no Supabase Auth: migrar via Edge Function
    const { data, error: fnError } = await supabase.functions.invoke('migrar-usuario', {
      body: { login: usuario.login || usuario.email, senha }
    });

    if (fnError || !data?.ok) {
      return {
        success: false,
        error: fnError?.message || data?.erro || 'Falha na migração para o Supabase Auth'
      };
    }

    ({ error } = await supabase.auth.signInWithPassword({
      email: data.email || email,
      password: senha
    }));

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('🔐 [AUTH] Usuário migrado para o Supabase Auth e sessão estabelecida');
    return { success: true, migrado: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/** Encerra a sessão Supabase Auth (chamado no logout do CEI). */
export const encerrarSessaoSupabase = async () => {
  if (!supabase?.auth) return;
  try {
    await supabase.auth.signOut();
    console.log('🔐 [AUTH] Sessão Supabase encerrada');
  } catch (_error) {
    // silencioso - logout local continua valendo
  }
};

export default { garantirSessaoSupabase, encerrarSessaoSupabase, emailParaAuth };