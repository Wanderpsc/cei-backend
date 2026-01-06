# 🚀 GUIA DE TESTE - PAGAMENTO PIX E CARTÃO

## ✅ Sistema Configurado!

O sistema de pagamentos via PIX e Cartão está agora configurado e pronto para uso.

---

## 📋 O QUE FOI IMPLEMENTADO

### 1. **Backend (server.js)**
- ✅ Endpoint para criar pagamento PIX: `/api/create-pix-payment`
- ✅ Endpoint para criar pagamento com cartão: `/api/create-card-payment`
- ✅ Endpoint para verificar status: `/api/check-payment/:id`
- ✅ Webhook para notificações: `/api/webhooks`
- ✅ Integração completa com Mercado Pago SDK v2

### 2. **Frontend (PagamentoPage.js)**
- ✅ Geração de QR Code PIX real
- ✅ Exibição de código Copia e Cola
- ✅ Verificação automática de pagamento PIX
- ✅ Tokenização segura de cartões
- ✅ Processamento de pagamento com cartão
- ✅ Validação de dados
- ✅ Parcelamento em até 12x

### 3. **Configuração**
- ✅ SDK do Mercado Pago carregado no frontend
- ✅ Variáveis de ambiente configuradas
- ✅ Credenciais do Mercado Pago ativas

---

## 🧪 COMO TESTAR

### **PASSO 1: Iniciar o Backend**

```bash
# No terminal, execute:
node server.js
```

Você deve ver:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     💳 CEI - API de Pagamentos (MERCADO PAGO)        ║
║                                                       ║
║  Servidor: http://localhost:3001                     ║
║  Status: ✅ ONLINE                                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

### **PASSO 2: Iniciar o Frontend**

```bash
# Em outro terminal:
npm start
```

O React será iniciado em `http://localhost:3000`

### **PASSO 3: Testar Pagamento PIX**

1. Acesse o sistema e vá até a página de pagamento
2. Selecione a aba **PIX**
3. Clique em **"Gerar Código PIX"**
4. O QR Code real será exibido
5. Copie o código Copia e Cola

**Para testar em modo de produção (com suas credenciais):**
- Use o app do seu banco
- Escaneie o QR Code ou cole o código PIX
- Faça um pagamento de teste
- O sistema verificará automaticamente e redirecionará quando aprovado

### **PASSO 4: Testar Pagamento com Cartão**

1. Na página de pagamento, selecione a aba **"Cartão de Crédito"**
2. Use os **cartões de teste do Mercado Pago**:

#### Cartões de Teste (Modo Teste):

**VISA - Pagamento Aprovado:**
```
Número: 4509 9535 6623 3704
Nome: APRO
Validade: 11/25
CVV: 123
```

**MASTER - Pagamento Aprovado:**
```
Número: 5031 4332 1540 6351
Nome: APRO
Validade: 11/25
CVV: 123
```

**VISA - Pagamento Recusado:**
```
Número: 4000 0000 0000 0010
Nome: OTHE
Validade: 11/25
CVV: 123
```

3. Preencha o formulário e clique em **"Pagar"**
4. O sistema tokenizará o cartão e processará o pagamento
5. Você será redirecionado automaticamente

---

## 🔑 CREDENCIAIS ATUAIS

### Mercado Pago (PRODUÇÃO)
```
Access Token: APP_USR-5648948884536481-010520-...
Public Key: APP_USR-7c4ec711-2b61-41f4-93fd-c4a2c8b10672
```

**⚠️ IMPORTANTE:**
- Suas credenciais são de PRODUÇÃO (recebe dinheiro real)
- Para testar sem cobrar, use credenciais de TESTE
- Obtenha em: https://www.mercadopago.com.br/developers/panel/credentials

---

## 🔄 TROCAR PARA MODO TESTE

Para testar sem cobrar dinheiro real:

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Copie suas **Credenciais de Teste**
3. Edite o arquivo `.env`:

```env
# Trocar estas linhas:
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-de-teste
MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-de-teste
```

4. Edite o arquivo `.env.local`:

```env
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-de-teste
```

5. Reinicie o backend e o frontend

---

## 📱 FLUXO COMPLETO

### PIX:
1. Cliente escolhe plano → 2. Gera PIX → 3. Escaneia/Cola código → 4. Paga → 5. Sistema detecta automaticamente → 6. Acesso liberado

### Cartão:
1. Cliente escolhe plano → 2. Preenche dados do cartão → 3. Sistema tokeniza → 4. Envia ao Mercado Pago → 5. Aprovação instantânea → 6. Acesso liberado

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### ❌ "SDK do Mercado Pago não carregado"
**Solução:** Limpe o cache do navegador (Ctrl+Shift+Del) e recarregue

### ❌ "Erro ao conectar com o servidor"
**Solução:** Verifique se o backend está rodando em `http://localhost:3001`

### ❌ "Payment creation failed"
**Solução:** Verifique se o Access Token no `.env` está correto

### ❌ QR Code não aparece
**Solução:** Verifique os logs do backend no terminal

---

## 📊 MONITORAMENTO

### Ver Pagamentos no Mercado Pago:
1. Acesse: https://www.mercadopago.com.br/activities
2. Veja todos os pagamentos recebidos
3. Detalhes, status e reembolsos

### Logs do Sistema:
- Backend: Terminal onde rodou `node server.js`
- Frontend: Console do navegador (F12)

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Teste em modo teste** com cartões de teste
2. ✅ **Teste PIX** com pagamento real pequeno
3. ✅ **Configure webhook** para notificações automáticas
4. ✅ **Implemente banco de dados** para salvar pagamentos
5. ✅ **Adicione email** de confirmação

---

## 🔐 SEGURANÇA

✅ Tokenização de cartões (dados sensíveis não passam pelo seu servidor)
✅ Comunicação criptografada (HTTPS em produção)
✅ Validações no frontend e backend
✅ Proteção contra fraudes do Mercado Pago

---

## 💰 TAXAS DO MERCADO PAGO

- **PIX:** 0,99% por transação
- **Cartão de Crédito:** ~3,99% + R$ 0,39 por transação
- **Boleto:** R$ 3,49 por transação

---

## 📞 SUPORTE

**Documentação Mercado Pago:**
https://www.mercadopago.com.br/developers

**Status da API:**
https://status.mercadopago.com/

**Suporte:**
https://www.mercadopago.com.br/developers/panel/support

---

## ✅ CHECKLIST FINAL

- [x] Backend configurado e rodando
- [x] Frontend configurado
- [x] SDK do Mercado Pago carregado
- [x] Credenciais configuradas
- [x] Pagamento PIX implementado
- [x] Pagamento Cartão implementado
- [x] Validações ativas
- [x] Redirecionamentos funcionando

**🎉 SISTEMA PRONTO PARA USO!**

---

*Sistema desenvolvido por Wander Pires Silva Coelho ®*
