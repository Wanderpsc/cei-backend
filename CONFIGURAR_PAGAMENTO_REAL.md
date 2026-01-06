# 🔧 Guia: Configurar Pagamentos REAIS no Sistema CEI

## 📋 Status Atual

⚠️ **IMPORTANTE**: O sistema atual é apenas uma SIMULAÇÃO. Nenhum pagamento real está sendo processado.

### O que não funciona:
- ❌ QR Code PIX não é escaneável (imagem placeholder)
- ❌ Código PIX não está vinculado à sua conta
- ❌ Pagamentos com cartão não são processados
- ❌ Nenhum dinheiro é transferido

---

## 🚀 Como Configurar Pagamentos REAIS

### OPÇÃO 1: Mercado Pago (Recomendado)

#### Passo 1: Criar Conta
1. Acesse: https://www.mercadopago.com.br/developers
2. Clique em "Criar conta"
3. Complete seu cadastro
4. Valide sua conta (CPF/CNPJ)

#### Passo 2: Obter Credenciais
1. No painel: https://www.mercadopago.com.br/developers/panel
2. Vá em "Credenciais"
3. Copie:
   - **Access Token** (para backend)
   - **Public Key** (para frontend)

**Atenção**: Use as credenciais de TESTE primeiro!

#### Passo 3: Instalar Dependências

```bash
# No seu projeto
npm install @mercadopago/sdk-react mercadopago
```

#### Passo 4: Criar Backend (Node.js)

Crie arquivo `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// Configure com sua credencial
mercadopago.configure({
  access_token: 'SEU_ACCESS_TOKEN_AQUI' // ⚠️ NUNCA exponha no frontend!
});

// Endpoint para criar pagamento PIX
app.post('/api/create-pix-payment', async (req, res) => {
  try {
    const { amount, email, cpf, nome } = req.body;
    
    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(amount),
      description: 'Plano Sistema CEI',
      payment_method_id: 'pix',
      payer: {
        email: email,
        identification: {
          type: 'CPF',
          number: cpf
        },
        first_name: nome
      }
    });
    
    res.json({
      id: payment.body.id,
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      ticket_url: payment.body.point_of_interaction.transaction_data.ticket_url
    });
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para criar pagamento com Cartão
app.post('/api/create-card-payment', async (req, res) => {
  try {
    const { token, amount, installments, email } = req.body;
    
    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(amount),
      token: token,
      description: 'Plano Sistema CEI',
      installments: parseInt(installments),
      payment_method_id: 'visa', // ou mastercard, elo, etc.
      payer: {
        email: email
      }
    });
    
    res.json({
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      id: payment.body.id
    });
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook para notificações
app.post('/api/webhooks', async (req, res) => {
  const { type, data } = req.body;
  
  if (type === 'payment') {
    try {
      const payment = await mercadopago.payment.get(data.id);
      
      if (payment.body.status === 'approved') {
        // AQUI: Ativar a instituição no seu banco de dados
        console.log('Pagamento aprovado:', payment.body.id);
        // await ativarInstituicao(payment.body.external_reference);
      }
    } catch (error) {
      console.error('Erro no webhook:', error);
    }
  }
  
  res.status(200).send('OK');
});

app.listen(3001, () => {
  console.log('Backend rodando na porta 3001');
});
```

#### Passo 5: Atualizar Frontend (PagamentoPage.js)

Substitua a função `gerarPix`:

```javascript
const gerarPix = async () => {
  setProcessando(true);
  setErro('');
  
  try {
    const response = await fetch('http://localhost:3001/api/create-pix-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: valorTotal,
        email: dadosCadastro.email,
        cpf: dadosCadastro.cpfResponsavel.replace(/\D/g, ''),
        nome: dadosCadastro.nomeResponsavel
      })
    });
    
    const data = await response.json();
    
    if (data.qr_code_base64) {
      setPixQRCode(`data:image/png;base64,${data.qr_code_base64}`);
      setPixCopiaECola(data.qr_code);
      setPixGerado(true);
      
      // Iniciar polling para verificar pagamento
      verificarPagamento(data.id);
    }
  } catch (error) {
    setErro('Erro ao gerar PIX. Tente novamente.');
    console.error(error);
  } finally {
    setProcessando(false);
  }
};
```

---

### OPÇÃO 2: Asaas (Alternativa Brasileira)

#### Vantagens:
- ✅ 100% brasileiro
- ✅ Taxas mais baixas (1.99% PIX, 4.49% cartão)
- ✅ API simples
- ✅ Suporte em português

#### Passos:

1. **Criar conta**: https://www.asaas.com/
2. **Obter API Key**: Painel → Integrações → Chaves de API
3. **Instalar SDK**: 
   ```bash
   npm install asaas
   ```

4. **Exemplo de código**:

```javascript
const Asaas = require('asaas');
const client = new Asaas('SUA_API_KEY');

// Criar cobrança PIX
const cobranca = await client.payments.create({
  customer: customerId,
  billingType: 'PIX',
  value: 97.00,
  dueDate: new Date(),
  description: 'Plano Sistema CEI'
});

console.log(cobranca.pixQrCode); // QR Code para pagamento
```

---

## 💰 Comparação de Taxas (Janeiro 2026)

| Gateway        | PIX    | Cartão Débito | Cartão Crédito | Boleto |
|---------------|--------|---------------|----------------|--------|
| Mercado Pago  | 0.99%  | 3.79%        | 4.99% + R$0.39 | R$3.49 |
| Asaas         | 1.99%  | 2.99%        | 4.49% + R$0.49 | R$3.00 |
| PagSeguro     | 1.99%  | 3.99%        | 4.99% + R$0.40 | R$3.00 |
| Stripe        | 3.99%  | -            | 3.99% + R$0.50 | -      |

---

## 🔐 Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz:

```env
# Mercado Pago - TESTE
MERCADOPAGO_ACCESS_TOKEN_TEST=TEST-1234567890-123456-abc...
MERCADOPAGO_PUBLIC_KEY_TEST=TEST-abc123-...

# Mercado Pago - PRODUÇÃO (use só quando testar tudo)
MERCADOPAGO_ACCESS_TOKEN_PROD=APP-1234567890-123456-abc...
MERCADOPAGO_PUBLIC_KEY_PROD=APP-abc123-...

# Asaas (alternativa)
ASAAS_API_KEY=$aact_YTU5YTE0M2M...

# Seu domínio
FRONTEND_URL=https://cei-controle-escolar.surge.sh
BACKEND_URL=https://sua-api.herokuapp.com
```

⚠️ **IMPORTANTE**: Nunca commite o `.env` no Git!

Adicione no `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 🧪 Testar com Dados de Teste

### Mercado Pago - Cartões de Teste:

**Aprovado**:
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO (aprovado)
```

**Recusado**:
```
Número: 5031 7557 3453 0604
Nome: OTHE (outro erro)
```

**PIX de Teste**:
Use o sandbox e simule pagamentos pelo painel

---

## 📦 Deploy do Backend

### Opção 1: Heroku (Grátis)
```bash
heroku create seu-app-backend
git push heroku main
heroku config:set MERCADOPAGO_ACCESS_TOKEN=seu_token
```

### Opção 2: Railway (Moderno)
```bash
railway login
railway init
railway up
```

### Opção 3: Render (Simples)
1. Conecte seu repositório
2. Configure variáveis de ambiente
3. Deploy automático

---

## ✅ Checklist Final

Antes de colocar em produção:

- [ ] Conta no gateway criada e aprovada
- [ ] Credenciais obtidas (teste E produção)
- [ ] Backend criado e funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook configurado na plataforma
- [ ] HTTPS configurado (obrigatório)
- [ ] Testes realizados com dados de teste
- [ ] Testes com pagamentos reais pequenos
- [ ] Sistema de logs implementado
- [ ] Backup configurado

---

## 🆘 Precisa de Ajuda?

### Suporte dos Gateways:
- **Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Asaas**: suporte@asaas.com
- **PagSeguro**: https://dev.pagseguro.uol.com.br/docs

### Documentação Completa:
- Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs
- Asaas: https://docs.asaas.com/
- PagSeguro: https://dev.pagseguro.uol.com.br/

---

## 💡 Resumo Executivo

### Para começar HOJE:

1. **Crie conta no Mercado Pago** (15 min)
2. **Obtenha credenciais de TESTE** (5 min)
3. **Implemente o backend** (1-2 horas)
4. **Teste com dados fictícios** (30 min)
5. **Quando tudo funcionar, troque para produção**

### Custo estimado:
- **Grátis** para começar (usar modo teste)
- **Taxas apenas quando receber pagamentos reais**
- **Backend**: R$0 (Heroku/Railway tier gratuito) ou R$7-25/mês

---

**Sistema desenvolvido por: Wander Pires Silva Coelho ®**

Data: Janeiro 2026
