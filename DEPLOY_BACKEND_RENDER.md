# 🚀 DEPLOY DO BACKEND NO RENDER

## Passo a Passo (5 minutos)

### 1️⃣ Criar conta no Render
1. Acesse: https://render.com
2. Clique em "Get Started for Free"
3. Faça login com GitHub

### 2️⃣ Criar novo Web Service
1. No dashboard, clique em "New +"
2. Selecione "Web Service"
3. Escolha "Build and deploy from a Git repository"
4. Clique em "Next"

### 3️⃣ Conectar repositório
Você tem 2 opções:

**OPÇÃO A - Criar repositório GitHub:**
```bash
# No terminal:
cd "e:\1. Nova pasta\MEUS PROJETOS DE PROGRAMAÇÃO\CEI - CONTROLE ESCOLAR INTELIGENTE - BIBLIOTECA"

# Criar repositório no GitHub (https://github.com/new)
# Nome: cei-backend

# Adicionar remote e push:
git remote add origin https://github.com/SEU-USUARIO/cei-backend.git
git branch -M main
git push -u origin main
```

**OPÇÃO B - Upload manual:**
- Compacte a pasta do projeto
- Faça upload no Render

### 4️⃣ Configurar no Render

**Name:** `cei-backend`

**Environment:** `Node`

**Build Command:**
```
npm install
```

**Start Command:**
```
node server.js
```

**Plan:** `Free` (gratuito)

### 5️⃣ Adicionar Variáveis de Ambiente

No Render, vá em "Environment" e adicione:

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-5648948884536481-010520-5ff5365cb7266f874054d0d91338ea8d-58356
MERCADOPAGO_PUBLIC_KEY=APP_USR-7c4ec711-2b61-41f4-93fd-c4a2c8b10672
BACKEND_PORT=3001
NODE_ENV=production
FRONTEND_URL=https://cei-controle-escolar.surge.sh
```

### 6️⃣ Deploy

1. Clique em "Create Web Service"
2. Aguarde o deploy (2-3 minutos)
3. Você receberá uma URL tipo: `https://cei-backend.onrender.com`

### 7️⃣ Atualizar Frontend

Atualize o arquivo `.env.local` e faça novo deploy:

```env
REACT_APP_API_URL=https://cei-backend.onrender.com
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-7c4ec711-2b61-41f4-93fd-c4a2c8b10672
```

Depois:
```bash
npm run build
surge build cei-controle-escolar.surge.sh
```

---

## ✅ Pronto!

Agora o sistema funcionará completamente online:
- **Frontend:** https://cei-controle-escolar.surge.sh
- **Backend:** https://cei-backend.onrender.com

---

## ⚡ Deploy Rápido (Alternativa)

Se preferir, posso ajudar a fazer o deploy no:
- **Railway** (também gratuito, mais rápido)
- **Heroku** (requer cartão de crédito)

---

*Documentação criada por Wander Pires Silva Coelho ®*
