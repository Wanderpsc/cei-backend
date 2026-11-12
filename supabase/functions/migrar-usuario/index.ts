// ============================================================================
// Edge Function: migrar-usuario
// Valida as credenciais legadas (tabela usuarios) e cria o usuario
// correspondente no Supabase Auth com app_metadata.instituicao_id e
// app_metadata.perfil - os claims que as politicas RLS usam para isolar
// as escolas. Roda com service role (somente no servidor).
//
// Deploy:
//   supabase functions deploy migrar-usuario --no-verify-jwt
// ============================================================================
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });

const slugLogin = (login: string) =>
  login.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, erro: 'Metodo nao suportado' }, 405);

  let login = '';
  let senha = '';
  try {
    const body = await req.json();
    login = String(body.login || '').trim();
    senha = String(body.senha || '');
  } catch (_e) {
    return json({ ok: false, erro: 'JSON invalido' }, 400);
  }

  if (!login || !senha) return json({ ok: false, erro: 'Informe login e senha' }, 400);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Busca o usuario legado por login ou e-mail (comparacao sem caixa)
  const loginNorm = login.toLowerCase();
  const { data: usuarios, error } = await admin
    .from('usuarios')
    .select('id, nome, login, email, senha, perfil, instituicao_id, ativo');

  if (error) return json({ ok: false, erro: error.message }, 500);

  const usuario = (usuarios || []).find((u) =>
    (String(u.login || '').trim().toLowerCase() === loginNorm ||
     String(u.email || '').trim().toLowerCase() === loginNorm) &&
    String(u.senha || '').trim() === senha.trim()
  );

  if (!usuario) return json({ ok: false, erro: 'Credenciais invalidas' }, 401);
  if (usuario.ativo === false) return json({ ok: false, erro: 'Usuario desativado' }, 403);

  // E-mail interno de autenticacao: usa o e-mail real se for valido,
  // senao gera um estavel a partir do login (ex.: biblioteca@cei.local)
  const emailValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(usuario.email || ''));
  const email = emailValido
    ? String(usuario.email).trim().toLowerCase()
    : `${slugLogin(String(usuario.login || usuario.id))}@cei.local`;

  const { error: criarErro } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    app_metadata: {
      instituicao_id: usuario.instituicao_id ?? 0,
      perfil: usuario.perfil || 'Bibliotecario',
      cei_usuario_id: usuario.id
    },
    user_metadata: { nome: usuario.nome, login: usuario.login }
  });

  // Se o usuario ja existe no Auth, nao e erro: o app tentara o signin normal
  if (criarErro && !String(criarErro.message || '').toLowerCase().includes('already')) {
    return json({ ok: false, erro: criarErro.message }, 500);
  }

  return json({ ok: true, email, jaExistia: Boolean(criarErro) });
});