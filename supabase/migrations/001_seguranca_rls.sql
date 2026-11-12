-- ============================================================================
-- CEI - Seguranca multi-escola (FASE 2)
-- Isolamento real por instituicao via Supabase Auth + RLS
--
-- ATENCAO - QUANDO APLICAR: somente DEPOIS de:
--   1. Publicar o app com o authService (login passa a criar sessao Supabase Auth);
--   2. Implantar a Edge Function `migrar-usuario`;
--   3. Dar um prazo (ex.: 2 semanas) para os usuarios fazerem login ao menos
--      1 vez - cada login migra o usuario automaticamente para o Supabase Auth.
--
-- Depois de aplicar este script, dispositivos ja logados precisam SAIR e
-- ENTRAR novamente uma vez para obter a sessao Auth.
--
-- Como aplicar: Supabase Dashboard > SQL Editor > colar tudo e executar.
-- ============================================================================

-- 1. Funcoes auxiliares: leem os claims do JWT. O campo app_metadata so pode
--    ser definido pelo servidor (Edge Function com service role) - o usuario
--    NAO consegue altera-lo, por isso ele e confiavel para isolamento.
create or replace function public.cei_claim_instituicao()
returns bigint
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'instituicao_id', '')::bigint
$$;

create or replace function public.cei_e_superadmin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'perfil', '') = 'SuperAdmin'
$$;

-- 2. Tabelas de dados por instituicao: remove TODAS as politicas antigas
--    (que eram USING (true) = acesso total) e cria politicas restritas.
do $$
declare
  t text;
  p record;
begin
  foreach t in array array[
    'livros', 'leitores', 'emprestimos', 'patrimonio',
    'usuarios', 'clube_leitura', 'notas_fiscais'
  ]
  loop
    if to_regclass('public.' || t) is null then
      raise notice 'Tabela % nao existe - ignorada.', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    for p in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;

    execute format(
      'create policy cei_select on public.%I for select to authenticated
       using (public.cei_e_superadmin() or instituicao_id = public.cei_claim_instituicao())', t);
    execute format(
      'create policy cei_insert on public.%I for insert to authenticated
       with check (public.cei_e_superadmin() or instituicao_id = public.cei_claim_instituicao())', t);
    execute format(
      'create policy cei_update on public.%I for update to authenticated
       using (public.cei_e_superadmin() or instituicao_id = public.cei_claim_instituicao())
       with check (public.cei_e_superadmin() or instituicao_id = public.cei_claim_instituicao())', t);
    execute format(
      'create policy cei_delete on public.%I for delete to authenticated
       using (public.cei_e_superadmin() or instituicao_id = public.cei_claim_instituicao())', t);
  end loop;
end $$;

-- 3. Tabela instituicoes: cada escola enxerga/edita apenas a propria linha.
--    Criar e excluir escolas passa a ser exclusivo do SuperAdmin.
alter table public.instituicoes enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'instituicoes'
  loop
    execute format('drop policy %I on public.instituicoes', p.policyname);
  end loop;
end $$;

create policy cei_select on public.instituicoes for select to authenticated
  using (public.cei_e_superadmin() or id = public.cei_claim_instituicao());
create policy cei_insert on public.instituicoes for insert to authenticated
  with check (public.cei_e_superadmin());
create policy cei_update on public.instituicoes for update to authenticated
  using (public.cei_e_superadmin() or id = public.cei_claim_instituicao())
  with check (public.cei_e_superadmin() or id = public.cei_claim_instituicao());
create policy cei_delete on public.instituicoes for delete to authenticated
  using (public.cei_e_superadmin());

-- 4. Bloquear completamente o papel anonimo (anon) nas tabelas de dados.
--    A chave publica do site deixa de dar qualquer acesso direto aos dados.
revoke all on public.instituicoes, public.livros, public.leitores,
  public.emprestimos, public.patrimonio, public.usuarios,
  public.clube_leitura from anon;

do $$
begin
  if to_regclass('public.notas_fiscais') is not null then
    execute 'revoke all on public.notas_fiscais from anon';
  end if;
end $$;

-- ============================================================================
-- FASE 3 (rodar MAIS TARDE, quando todos os usuarios ja estiverem no
-- Supabase Auth): eliminar as senhas em texto puro da tabela usuarios.
-- Descomente e execute quando chegar a hora:
--
-- update public.usuarios set senha = null, dados = dados - 'senha';
-- ============================================================================