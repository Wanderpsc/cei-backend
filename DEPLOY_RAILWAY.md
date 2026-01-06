# 🚀 Deploy do Backend no Railway (MAIS RÁPIDO)

## Por que Railway?
- ✅ Deploy em **2 minutos**
- ✅ Gratuito (500h/mês)
- ✅ Sem necessidade de GitHub
- ✅ CLI automático
- ✅ Logs em tempo real

---

## 📦 Passo 1: Instalar Railway CLI

```powershell
npm install -g @railway/cli
```

---

## 🔐 Passo 2: Login

```powershell
railway login
```

➡️ Isso abrirá o navegador para você fazer login com GitHub

---

## 🎯 Passo 3: Deploy Automático

```powershell
# No diretório do projeto
railway init

# Configurar variáveis de ambiente
railway variables set MERCADOPAGO_ACCESS_TOKEN="seu_token_aqui"
railway variables set MERCADOPAGO_PUBLIC_KEY="sua_chave_aqui"
railway variables set BACKEND_PORT=3001
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL="https://cei-controle-escolar.surge.sh"

# Fazer deploy
railway up
```

---

## 🌐 Passo 4: Pegar a URL do Backend

```powershell
railway domain
```

Copie a URL gerada (ex: `https://seu-projeto.up.railway.app`)

---

## 🔧 Passo 5: Atualizar Frontend

Edite `.env.local`:

```env
REACT_APP_API_URL=https://seu-projeto.up.railway.app
```

Rebuild e redeploy:

```powershell
npm run build
surge build cei-controle-escolar.surge.sh
```

---

## ✅ PRONTO!

Acesse: https://cei-controle-escolar.surge.sh

---

## 📊 Ver Logs

```powershell
railway logs
```

---

## 🔄 Fazer Novos Deploys

```powershell
railway up
```

---

## 💡 Dicas

1. **Railway é MUITO mais rápido** que Render
2. **Não precisa de GitHub** (sobe direto do seu PC)
3. **Logs em tempo real** para debug
4. **500h grátis/mês** (suficiente para testes)

---

## 🆚 Railway vs Render

| Recurso | Railway | Render |
|---------|---------|--------|
| Deploy | 2 min | 10-15 min |
| Necessita GitHub | ❌ | ✅ |
| Cold Start | Rápido | Lento |
| Free Tier | 500h/mês | Ilimitado |
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## ❓ Problemas?

### Erro: "Command not found: railway"

```powershell
npm install -g @railway/cli --force
```

### Erro: "Invalid token"

Refaça o login:

```powershell
railway logout
railway login
```

### Ver variáveis configuradas

```powershell
railway variables
```
