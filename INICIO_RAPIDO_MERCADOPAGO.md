# ⚡ INÍCIO RÁPIDO - Mercado Pago

## 🎯 O que você precisa fazer AGORA:

### 1. Obter Credenciais (2 minutos)

Acesse: https://www.mercadopago.com.br/developers/panel/credentials

Copie:
- **Access Token** (começa com TEST- ou APP-)
- **Public Key** (começa com TEST- ou APP-)

### 2. Configurar .env (1 minuto)

Edite o arquivo `.env` e substitua:

```env
MERCADOPAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI
MERCADOPAGO_PUBLIC_KEY=SEU_PUBLIC_KEY_AQUI
```

**Cole suas credenciais!**

### 3. Iniciar Backend (1 minuto)

```bash
# Clique duas vezes em:
iniciar-backend.bat
```

Ou:
```bash
node server.js
```

### 4. Iniciar Frontend (1 minuto)

Em outro terminal:
```bash
npm start
```

### 5. Testar (2 minutos)

1. Acesse: http://localhost:3000/cadastro-escola
2. Preencha os dados
3. Escolha um plano
4. Gere o PIX
5. **Veja o QR Code REAL!** 🎉

---

## ✅ Checklist

- [ ] Credenciais copiadas do Mercado Pago
- [ ] Arquivo .env configurado
- [ ] Backend rodando (porta 3001)
- [ ] Frontend rodando (porta 3000)
- [ ] QR Code aparece (não é mais cinza!)

---

## 🆘 Problemas?

**Backend não inicia:**
```bash
npm install
```

**Erro "Invalid credentials":**
- Verifique se copiou as credenciais corretamente
- Use credenciais de TESTE primeiro (começam com TEST-)

**QR Code não aparece:**
- Abra F12 no navegador
- Veja o console para erros
- Certifique-se que o backend está rodando

---

## 📚 Documentação Completa

Veja: [SETUP_MERCADOPAGO.md](SETUP_MERCADOPAGO.md)

---

**Pronto! Você está recebendo pagamentos REAIS agora! 💰**
