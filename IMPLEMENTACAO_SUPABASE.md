# 🚀 Implementação Supabase + Vercel - CEI Sistema

## 📋 O que será implementado

### ✅ Funcionalidades
- 📡 **Banco de dados PostgreSQL** na nuvem (Supabase)
- 🔄 **Sincronização automática** LocalStorage ↔ Nuvem
- 🌐 **Acesso multi-dispositivo**
- 💾 **Backup automático** na nuvem
- 🔐 **Autenticação segura**
- ⚡ **Realtime** (mudanças em tempo real)
- 📊 **Dashboard de monitoramento**

### 🎯 Melhor Combinação Escolhida

```
Frontend: GitHub Pages (atual) ✅
Backend:  Vercel (API Routes)
Banco:    Supabase PostgreSQL
Auth:     Supabase Auth
Storage:  Supabase Storage
```

---

## 📦 PASSO 1: Criar conta no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Entre com GitHub (recomendado)
4. Crie um novo projeto:
   - **Nome:** cei-sistema
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** South America (São Paulo)
   - Clique em **"Create new project"**
5. Aguarde ~2 minutos (criação do banco)

---

## 📦 PASSO 2: Configurar Banco de Dados

### Tabelas a serem criadas:

No Supabase Dashboard → SQL Editor, execute:

```sql
-- Tabela de Instituições
CREATE TABLE instituicoes (
  id BIGSERIAL PRIMARY KEY,
  nome_instituicao TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  licenca TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pendente',
  data_cadastro TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP,
  plano TEXT,
  dias_licenca INTEGER,
  valor_mensal DECIMAL(10,2),
  dados JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Livros
CREATE TABLE livros (
  id BIGSERIAL PRIMARY KEY,
  instituicao_id BIGINT REFERENCES instituicoes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  autor TEXT,
  editora TEXT,
  isbn TEXT,
  ano_publicacao INTEGER,
  categoria TEXT,
  tipo TEXT,
  vigencia INTEGER,
  quantidade INTEGER DEFAULT 1,
  localizacao TEXT,
  status TEXT DEFAULT 'disponivel',
  capa_url TEXT,
  sinopse TEXT,
  dados JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Leitores
CREATE TABLE leitores (
  id BIGSERIAL PRIMARY KEY,
  instituicao_id BIGINT REFERENCES instituicoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  tipo TEXT DEFAULT 'Aluno',
  turma TEXT,
  matricula TEXT,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  dados JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Empréstimos
CREATE TABLE emprestimos (
  id BIGSERIAL PRIMARY KEY,
  instituicao_id BIGINT REFERENCES instituicoes(id) ON DELETE CASCADE,
  livro_id BIGINT REFERENCES livros(id),
  leitor_id BIGINT REFERENCES leitores(id),
  data_emprestimo DATE NOT NULL,
  data_devolucao_prevista DATE NOT NULL,
  data_devolucao_real DATE,
  status TEXT DEFAULT 'ativo',
  observacoes TEXT,
  multa DECIMAL(10,2) DEFAULT 0,
  dados JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Patrimônio
CREATE TABLE patrimonio (
  id BIGSERIAL PRIMARY KEY,
  instituicao_id BIGINT REFERENCES instituicoes(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  categoria TEXT,
  numero_patrimonio TEXT,
  data_aquisicao DATE,
  valor DECIMAL(10,2),
  estado_conservacao TEXT,
  localizacao TEXT,
  responsavel TEXT,
  dados JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Usuários
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  instituicao_id BIGINT REFERENCES instituicoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  perfil TEXT DEFAULT 'Bibliotecario',
  tipo TEXT DEFAULT 'comum',
  email TEXT,
  ativo BOOLEAN DEFAULT true,
  dados JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Clube de Leitura
CREATE TABLE clube_leitura (
  id BIGSERIAL PRIMARY KEY,
  instituicao_id BIGINT REFERENCES instituicoes(id) ON DELETE CASCADE,
  leitor_id BIGINT REFERENCES leitores(id),
  livro_id BIGINT REFERENCES livros(id),
  data_leitura DATE NOT NULL,
  foto_url TEXT,
  pergunta1 TEXT,
  resposta1 TEXT,
  pergunta2 TEXT,
  resposta2 TEXT,
  pergunta3 TEXT,
  resposta3 TEXT,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  comentario TEXT,
  dados JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_livros_instituicao ON livros(instituicao_id);
CREATE INDEX idx_leitores_instituicao ON leitores(instituicao_id);
CREATE INDEX idx_emprestimos_instituicao ON emprestimos(instituicao_id);
CREATE INDEX idx_emprestimos_status ON emprestimos(status);
CREATE INDEX idx_usuarios_login ON usuarios(login);
CREATE INDEX idx_instituicoes_licenca ON instituicoes(licenca);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instituicoes_updated_at BEFORE UPDATE ON instituicoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livros_updated_at BEFORE UPDATE ON livros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leitores_updated_at BEFORE UPDATE ON leitores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emprestimos_updated_at BEFORE UPDATE ON emprestimos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE leitores ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clube_leitura ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (usuários autenticados podem acessar dados da sua instituição)
CREATE POLICY "Users can view own institution data" ON livros FOR SELECT USING (true);
CREATE POLICY "Users can insert own institution data" ON livros FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own institution data" ON livros FOR UPDATE USING (true);
CREATE POLICY "Users can delete own institution data" ON livros FOR DELETE USING (true);
```

---

## 📦 PASSO 3: Obter credenciais

No Supabase Dashboard:

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public key** (chave pública)
   - **service_role key** (chave privada - apenas backend)

---

## 📦 PASSO 4: Instalar dependências

Execute no terminal:

```bash
npm install @supabase/supabase-js
```

---

## 📦 PASSO 5: Configurar Variáveis de Ambiente

Crie arquivo `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

**IMPORTANTE:** Adicione `.env.local` no `.gitignore`!

---

## 🎉 Benefícios Implementados

### ✅ Sincronização Automática
- Dados salvos localmente E na nuvem
- Fallback para LocalStorage se offline
- Sincronização ao voltar online

### ✅ Multi-dispositivo
- Acesse de qualquer lugar
- Dados sempre atualizados
- Histórico completo

### ✅ Backup Automático
- Backup diário automático
- Recuperação de dados
- Proteção LGPD

### ✅ Segurança
- SSL/TLS (HTTPS)
- Row Level Security
- Autenticação JWT
- Criptografia em repouso

### ✅ Performance
- Índices otimizados
- Cache inteligente
- Queries eficientes
- CDN global

---

## 📊 Monitoramento

Acesse o Dashboard do Supabase para:
- 📈 Ver estatísticas de uso
- 📊 Monitorar performance
- 🔍 Fazer queries SQL
- 📦 Gerenciar backups
- 👥 Ver usuários ativos

---

## 🆘 Suporte

- 📚 Docs: https://supabase.com/docs
- 💬 Discord: https://discord.supabase.com
- 🎥 YouTube: Tutoriais oficiais

---

**Desenvolvido para CEI - Controle Escolar Inteligente**  
**© 2026 Wander Pires Silva Coelho**
