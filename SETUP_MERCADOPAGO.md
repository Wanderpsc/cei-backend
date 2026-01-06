# 🚀 GUIA: Configurar Mercado Pago no Sistema CEI

## ✅ Você já tem conta no Mercado Pago - Perfeito!

Como você já tem uma conta comercial, vamos usar suas credenciais.

---

## 📋 Passo a Passo (5 minutos)

### 1️⃣ Obter suas Credenciais

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login com sua conta
3. Você verá duas opções:
   - **Credenciais de teste** (para testar)
   - **Credenciais de produção** (para receber dinheiro real)

**Copie ambas!**

#### Credenciais de TESTE (comece por aqui):
```
Access Token: TEST-1234567890-123456-abc...
Public Key: TEST-abc123-...
```

#### Credenciais de PRODUÇÃO (use depois de testar):
```
Access Token: APP-1234567890-123456-abc...
Public Key: APP-abc123-...
```

---

### 2️⃣ Configurar o Arquivo .env

Abra o arquivo `.env` na raiz do projeto e substitua:

```env
# Mercado Pago - TESTE (comece aqui)
MERCADOPAGO_ACCESS_TOKEN=TEST-SEU-TOKEN-AQUI
MERCADOPAGO_PUBLIC_KEY=TEST-SUA-CHAVE-AQUI

# Backend URL
BACKEND_URL=http://localhost:3001

# Frontend URL
FRONTEND_URL=https://cei-controle-escolar.surge.sh
```

**⚠️ IMPORTANTE**: Comece com credenciais de TESTE!

---

### 3️⃣ Instalar Dependências

```bash
npm install
```

Isso instalará:
- `express` - Servidor web
- `cors` - Permitir conexões do frontend
- `mercadopago` - SDK oficial do Mercado Pago
- `dotenv` - Gerenciar variáveis de ambiente

---

### 4️⃣ Iniciar o Backend

**Opção 1: Script Automático (Windows)**
```bash
# Clique duas vezes em:
iniciar-backend.bat
```

**Opção 2: Comando Manual**
```bash
node server.js
```

Você verá:
```
╔═══════════════════════════════════════════════════════╗
║     💳 CEI - API de Pagamentos (MERCADO PAGO)        ║
║  Servidor: http://localhost:3001                     ║
║  Status: ✅ ONLINE                                    ║
╚═══════════════════════════════════════════════════════╝
```

---

### 5️⃣ Iniciar o Frontend

Em **outro terminal**:

```bash
npm start
```

Ou use o script:
```bash
iniciar-sistema.bat
```

---

### 6️⃣ Testar o Sistema

1. Acesse: http://localhost:3000/cadastro-escola
2. Preencha todos os dados
3. Escolha um plano
4. Clique em "Finalizar Cadastro"
5. Na página de pagamento, escolha PIX
6. Clique em "Gerar Código PIX"

**Você verá um QR Code REAL do Mercado Pago!**

---

## 🧪 Testar com Credenciais de TESTE

Com as credenciais de teste, você pode:

### Testar PIX:
1. Gere o QR Code
2. No painel do Mercado Pago, vá em "Transações de teste"
3. Clique em "Simular pagamento"
4. Aprove manualmente

### Testar Cartão:
Use os cartões de teste do Mercado Pago:

**Cartão Aprovado:**
```
Número: 5031 4332 1540 6351
Nome: APRO
CVV: 123
Validade: 11/25
```

**Cartão Recusado:**
```
Número: 5031 7557 3453 0604
Nome: OTHE
CVV: 123
Validade: 11/25
```

Veja mais cartões: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards

---

## 🎯 Quando Tudo Funcionar: Mudar para PRODUÇÃO

### 1. Obter Credenciais de Produção
No painel do Mercado Pago, copie as credenciais de **PRODUÇÃO**.

### 2. Atualizar .env
```env
# Mercado Pago - PRODUÇÃO (pagamentos reais)
MERCADOPAGO_ACCESS_TOKEN=APP-SEU-TOKEN-DE-PRODUCAO
MERCADOPAGO_PUBLIC_KEY=APP-SUA-CHAVE-DE-PRODUCAO
```

### 3. Configurar Webhook
No painel do Mercado Pago:
1. Vá em "Webhooks"
2. Adicione a URL: `https://seu-backend.com/api/webhooks`
3. Selecione o evento: "Pagamento"

### 4. Deploy do Backend
Coloque o backend online (Heroku, Railway, Render, etc.)

### 5. Atualizar Frontend
No `.env` do frontend:
```env
REACT_APP_API_URL=https://seu-backend.com
```

---

## 💰 Como Funciona Agora

### Fluxo PIX:
```
1. Usuário clica em "Gerar PIX"
   ↓
2. Frontend chama: POST /api/create-pix-payment
   ↓
3. Backend chama Mercado Pago API
   ↓
4. Mercado Pago retorna QR Code REAL
   ↓
5. Usuário escaneia e paga
   ↓
6. Mercado Pago notifica via webhook
   ↓
7. Backend ativa a instituição
   ↓
8. Usuário pode fazer login
```

### Você Recebe:
- ✅ Dinheiro na sua conta do Mercado Pago
- ✅ Notificação automática
- ✅ Relatórios no painel
- ✅ Sistema ativa automaticamente

---

## 🔍 Verificar se Está Funcionando

### Teste 1: Backend Online
Acesse no navegador:
```
http://localhost:3001/api/health
```

Deve retornar:
```json
{
  "status": "OK",
  "service": "CEI Payment API",
  "timestamp": "2026-01-05T..."
}
```

### Teste 2: Gerar PIX
No sistema, tente gerar um PIX. 

**Se funcionar:**
- ✅ QR Code aparece (não é mais uma imagem cinza)
- ✅ Código copia e cola funciona
- ✅ Console do backend mostra: "📱 Criando pagamento PIX..."

**Se não funcionar:**
- ❌ Verifique se o backend está rodando
- ❌ Verifique as credenciais no .env
- ❌ Veja os erros no console do backend

---

## 📊 Monitorar Pagamentos

### No Mercado Pago:
1. Acesse: https://www.mercadopago.com.br/activities
2. Veja todas as transações
3. Filtre por status: Aprovado, Pendente, Recusado

### No Console do Backend:
Você verá logs de todos os pagamentos:
```
📱 Criando pagamento PIX...
✅ PIX criado: 123456789
🔔 Webhook recebido: payment
✅ PAGAMENTO APROVADO!
```

---

## 💡 Dicas Importantes

### 1. Segurança
- ⚠️ **NUNCA** exponha o Access Token no frontend
- ⚠️ Sempre use HTTPS em produção
- ⚠️ Não commite o .env no Git

### 2. Taxas do Mercado Pago
- PIX: 0.99%
- Cartão: 4.99% + R$ 0,39 por transação
- Boleto: R$ 3,49

### 3. Tempo de Aprovação
- PIX: Instantâneo (segundos)
- Cartão: 1-2 minutos
- Boleto: 1-3 dias úteis

---

## 🆘 Problemas Comuns

### ❌ "MERCADOPAGO_ACCESS_TOKEN não definido"
**Solução**: Configure o .env com suas credenciais

### ❌ "Cannot POST /api/create-pix-payment"
**Solução**: Certifique-se que o backend está rodando

### ❌ "Invalid credentials"
**Solução**: Verifique se copiou as credenciais corretamente

### ❌ QR Code não aparece
**Solução**: Veja o console do navegador (F12) para erros

---

## ✅ Checklist Final

Antes de colocar em produção:

- [ ] Testado com credenciais de teste
- [ ] PIX funcionando (QR Code real)
- [ ] Cartão funcionando (aprovação/recusa)
- [ ] Webhook configurado no painel
- [ ] Backend em servidor online (não localhost)
- [ ] HTTPS configurado
- [ ] Credenciais de produção configuradas
- [ ] Teste com valor pequeno (R$ 1,00)
- [ ] Dinheiro caiu na conta do Mercado Pago
- [ ] Sistema ativa instituição automaticamente

---

## 📱 Estrutura de Arquivos

```
seu-projeto/
├── server.js              ← Backend com Mercado Pago
├── .env                   ← Suas credenciais (NÃO COMMITAR!)
├── iniciar-backend.bat    ← Script para iniciar backend
├── package.json           ← Dependências
└── src/
    └── pages/
        └── PagamentoPage.js  ← Atualizado para API real
```

---

## 🎉 Pronto!

Agora você tem um sistema de pagamento **REAL** funcionando!

**Próximos passos:**
1. ✅ Teste tudo com credenciais de teste
2. ✅ Deploy do backend em servidor
3. ✅ Mude para credenciais de produção
4. ✅ Comece a receber pagamentos!

---

**Dúvidas?**
- Documentação Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs
- Suporte: https://www.mercadopago.com.br/developers/pt/support

**Desenvolvido por: Wander Pires Silva Coelho ®**
