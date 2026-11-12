# Segurança Multi-Escola — Migração para Supabase Auth + RLS

Este guia transforma o isolamento entre escolas de "apenas visual" em
**isolamento real no banco de dados**. Siga as fases NA ORDEM. Nada quebra
enquanto a Fase 2 não for aplicada.

## O problema que isto resolve

Hoje as políticas RLS do banco são `USING (true)` (acesso total) e a chave
pública (anon) está publicada junto com o site. Qualquer pessoa pode ler,
alterar ou apagar dados de QUALQUER escola chamando a API do Supabase
diretamente. Este plano fecha essa porta.

## Como funciona a solução

1. Cada usuário do CEI ganha um usuário no **Supabase Auth** com
   `app_metadata.instituicao_id` e `app_metadata.perfil` — esses claims são
   gravados APENAS pelo servidor (Edge Function com service role); o usuário
   não consegue alterá-los.
2. As políticas RLS passam a permitir acesso somente às linhas cuja
   `instituicao_id` seja igual ao claim do usuário logado (SuperAdmin acessa tudo).
3. O papel anônimo (anon) perde todo acesso às tabelas de dados.

A migração dos usuários é **automática e gradual**: a cada login no CEI, o
app cria a sessão no Supabase Auth em segundo plano (via Edge Function
`migrar-usuario`). O usuário não percebe nada.

## FASE 1 — Preparação (sem risco, pode fazer já)

1. **Dashboard do Supabase** > Authentication > Sign In / Up > Email:
   - DESATIVAR "Confirm email" (os e-mails de login são internos, ex.: `usuario@cei.local`).
2. **Implantar a Edge Function** (precisa do [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase login
   supabase link --project-ref bwjijfccxsqgitqaiigp
   supabase functions deploy migrar-usuario --no-verify-jwt
   ```
3. **Publicar o app** (build + surge) com o `authService` já integrado
   (feito neste pacote de mudanças).
4. Aguardar um período (sugestão: 1–2 semanas) para que os usuários façam
   login ao menos uma vez — cada login migra o usuário para o Auth.

## FASE 2 — Ativar o isolamento (o passo que fecha a porta)

1. Dashboard > SQL Editor > executar o arquivo
   `supabase/migrations/001_seguranca_rls.sql` (colar tudo e Run).
2. A partir desse momento:
   - Acesso anônimo ao banco: **bloqueado**.
   - Cada escola só acessa os próprios dados.
   - Dispositivos que já estavam logados precisam **sair e entrar** uma vez
     (para obter a sessão Auth). O app continua funcionando offline normalmente.

## FASE 3 — Limpeza (depois que tudo estiver estável)

1. Rodar o UPDATE comentado no fim do `001_seguranca_rls.sql`
   (apaga as senhas em texto puro da tabela `usuarios`).
2. Remover as credenciais fixas do código (`usuariosPadrao` com senhas em
   `DataContext.js`) e trocar a validação de login local para usar apenas o
   Supabase Auth quando online.
3. Trocar a senha do SuperAdmin e das contas administrativas.

## Pontos de atenção

- **Cadastro de nova escola pelo site**: após a Fase 2, inserir em
  `instituicoes` exige SuperAdmin. O auto-cadastro público de escolas deixa
  de gravar na nuvem (continua local). Para vender, o fluxo recomendado é o
  fornecedor (você) cadastrar a escola como SuperAdmin.
- **Edge Function é um ponto de validação de senha**: o Supabase aplica rate
  limiting básico, mas monitore os logs (Dashboard > Edge Functions > Logs).
- **Senha alterada depois da migração**: se o usuário trocar a senha no app
  (fluxo legado), a senha do Auth não muda automaticamente — implemente a
  troca via `supabase.auth.updateUser` na Fase 3.
- O usuário `demo` é recriado por dispositivo com `instituicao_id` próprio;
  ele também passa pela migração automática no login.