# 🚀 PRÓXIMOS PASSOS - Configurar Backend no Render

**Status Atual:** ✅ Repositório correto configurado (`cei-backend`)

---

## ✅ O QUE JÁ FOI FEITO

1. ✅ Identificado problema: repositório errado (`criador-horario-backend`)
2. ✅ Remote do Git corrigido para `cei-backend`
3. ✅ Código correto já está no repositório certo
4. ✅ Backend testado localmente (funcionando!)
5. ✅ `.env.local` atualizado para `http://localhost:3001` (temporário)

---

## 🎯 AGORA VOCÊ PRECISA FAZER

### Passo 1: Criar Serviço no Render

1. **Acesse:** https://dashboard.render.com
2. **Clique:** "New +" → "Web Service"
3. **Conecte ao repositório:** `cei-backend`

### Passo 2: Configurações do Serviço

```yaml
Nome: cei-biblioteca-api
Branch: main
Root Directory: (deixe vazio)
Environment: Node
Region: Oregon (US West) - mais próximo grátis
Build Command: npm install
Start Command: node server.js
```

### Passo 3: Variáveis de Ambiente

Adicione EXATAMENTE estas variáveis:

```env
NODE_ENV=production
BACKEND_PORT=3001
FRONTEND_URL=https://cei-sistema-biblioteca.surge.sh

# Mercado Pago - COPIE do seu .env local
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=APP_USR-7c4ec711-2b61-41f4-93fd-c4a2c8b10672
```

**⚠️ IMPORTANTE:** 
- Pegue o `MERCADOPAGO_ACCESS_TOKEN` do seu arquivo `.env` local
- Não use o token de teste, use o token real de produção

### Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (~3-5 minutos)
3. Anote a URL gerada (ex: `https://cei-biblioteca-api.onrender.com`)

### Passo 5: Teste o Backend

```powershell
# Substitua pela URL que o Render gerou
$url = "https://SEU-SERVICO.onrender.com"

# Teste 1: Health Check
Invoke-RestMethod -Uri "$url/api/health"

# Teste 2: Login
$body = @{
    login = "cetidesamaral"
    senha = "Ceti@2026"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$url/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Passo 6: Atualizar Frontend

No arquivo `.env.local`, mude:

```env
REACT_APP_API_URL=https://SEU-SERVICO.onrender.com
```

### Passo 7: Rebuild do Frontend

```powershell
npm run build
surge build cei-sistema-biblioteca.surge.sh
```

---

## 🧪 TESTE COMPLETO

Após todas as etapas:

1. Abra: https://cei-sistema-biblioteca.surge.sh
2. Tente fazer login:
   - Login: `cetidesamaral`
   - Senha: `Ceti@2026`
3. Deve funcionar! ✅

---

## 📝 CHECKLIST

- [x] Repositório Git corrigido
- [x] Código testado localmente
- [ ] **Criar serviço no Render** ⬅️ VOCÊ ESTÁ AQUI
- [ ] Configurar variáveis de ambiente
- [ ] Aguardar deploy
- [ ] Testar endpoints
- [ ] Atualizar URL no frontend
- [ ] Rebuild e redeploy do frontend

---

## 🆘 SE DER ERRO NO RENDER

### Build falhou?
- Verifique se o `package.json` existe na raiz
- Confira se todas as dependências estão listadas

### Deploy timeout?
- Normal na primeira vez (pode levar até 10 min)
- Refresh a página e tente novamente

### Erro 500 após deploy?
- Vá em "Logs" no dashboard do Render
- Copie a mensagem de erro
- Verifique se as variáveis de ambiente estão corretas

---

## 💡 DICA IMPORTANTE

O Render na versão gratuita:
- ✅ Funciona perfeitamente
- ⚠️ "Dorme" após 15 min sem uso
- ⏱️ Primeira requisição após "acordar" demora ~30 seg
- 💰 Para manter sempre ativo: upgrade para $7/mês

---

**Boa sorte! Me chame se precisar de ajuda! 🚀**
