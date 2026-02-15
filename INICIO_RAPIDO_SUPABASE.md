# 🚀 INÍCIO RÁPIDO - Supabase em 7 minutos

## ⏱️ Tempo total estimado: 7 minutos

---

## ✅ PASSO 1: Criar conta no Supabase (2 min)

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Entre com GitHub (recomendado) ou email
4. ✅ Pronto!

---

## ✅ PASSO 2: Criar projeto (2 min)

1. No dashboard, clique em **"New Project"**
2. Preencha:
   - **Name:** cei-sistema
   - **Database Password:** Crie senha forte e **ANOTE**
   - **Region:** South America (São Paulo)
3. Clique em **"Create new project"**
4. ⏱️ Aguarde ~2 minutos (criação automática)

---

## ✅ PASSO 3: Criar tabelas (1 min)

1. No painel lateral, clique em **SQL Editor**
2. Clique em **"New query"**
3. Abra o arquivo: `IMPLEMENTACAO_SUPABASE.md`
4. Copie TODO o SQL (começa com `-- Tabela de Instituições`)
5. Cole no SQL Editor
6. Clique em **"Run"** (▶️)
7. ✅ Aguarde mensagem: "Success. No rows returned"

---

## ✅ PASSO 4: Obter credenciais (1 min)

1. No painel lateral, clique em **⚙️ Settings**
2. Clique em **API**
3. Copie dois valores:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJ... (chave longa)
```

---

## ✅ PASSO 5: Configurar sistema (1 min)

1. Abra o arquivo: `env-template.txt`
2. Copie todo o conteúdo
3. Crie arquivo: `.env.local` (na raiz do projeto)
4. Cole o conteúdo copiado
5. Substitua os valores:

```env
REACT_APP_SUPABASE_URL=https://SEU-PROJETO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=SUA-CHAVE-AQUI
```

6. Salve o arquivo

---

## ✅ PASSO 6: Reiniciar sistema (30 seg)

No terminal:

```bash
npm start
```

Aguarde iniciar e pronto! ✅

---

## 🎉 SISTEMA ATIVADO!

Agora você tem:

- ☁️ Banco de dados PostgreSQL na nuvem
- 🔄 Sincronização automática
- 💾 Backup automático a cada 1 hora
- 🌐 Acesso de múltiplos dispositivos
- 🔒 Segurança SSL/TLS
- 💰 **100% GRÁTIS**

---

## 🔍 Como verificar se está funcionando

1. Faça login no sistema
2. Vá em **Configurações** → **Nuvem**
3. Veja status: **🟢 Conectado**

---

## ⚠️ Problemas comuns

### Erro: "Supabase não configurado"
✅ Verifique se o arquivo `.env.local` foi criado corretamente

### Erro: "Invalid API key"
✅ Copie novamente a chave do Supabase Dashboard

### Erro: "Connection failed"
✅ Verifique sua conexão com internet

---

## 📞 Suporte

- 📚 Documentação: `IMPLEMENTACAO_SUPABASE.md`
- 🌐 Supabase Docs: https://supabase.com/docs
- 💬 Discord: https://discord.supabase.com

---

**© 2026 Wander Pires Silva Coelho**  
**CEI - Controle Escolar Inteligente**
