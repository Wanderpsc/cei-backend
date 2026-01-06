# Integração de Pagamento - Sistema CEI

## 📋 Visão Geral

O sistema CEI agora possui um fluxo completo de pagamento via **PIX** e **Cartão de Crédito** após o cadastro de novas instituições. Atualmente, o sistema funciona com **simulação de pagamentos** para testes e desenvolvimento.

## 🎯 Fluxo de Pagamento Implementado

1. **Cadastro da Instituição** (3 etapas):
   - Dados da Instituição
   - Dados do Responsável
   - Criação de Acesso

2. **Seleção do Plano**:
   - Escolha entre os planos disponíveis
   - Visualização de preços e duração

3. **Página de Pagamento**:
   - Escolha entre PIX ou Cartão de Crédito
   - PIX: QR Code + Copia e Cola
   - Cartão: Formulário com parcelamento em até 12x

4. **Confirmação de Pagamento**:
   - Página de sucesso com detalhes da transação
   - Cadastro automático da instituição no sistema
   - Redirecionamento para login

## 🔧 Gateways de Pagamento Recomendados

### 1. **Mercado Pago** (Recomendado)
- ✅ Suporte completo para PIX e Cartão
- ✅ API bem documentada
- ✅ SDKs para JavaScript/React
- ✅ Sandbox para testes
- ✅ Webhooks para confirmação automática
- 💰 Taxas: 4,99% + R$ 0,39 por transação

**Documentação**: https://www.mercadopago.com.br/developers/pt/docs

**Instalação**:
```bash
npm install @mercadopago/sdk-react
```

**Exemplo de Integração PIX**:
```javascript
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

initMercadoPago('YOUR_PUBLIC_KEY');

const gerarPix = async () => {
  const response = await fetch('/api/create_payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_amount: valorTotal,
      description: `Plano ${planoSelecionado.nome}`,
      payment_method_id: 'pix',
      payer: {
        email: dadosCadastro.email,
        first_name: dadosCadastro.nomeResponsavel,
      }
    })
  });
  
  const data = await response.json();
  setPixQRCode(data.point_of_interaction.transaction_data.qr_code_base64);
  setPixCopiaECola(data.point_of_interaction.transaction_data.qr_code);
};
```

### 2. **Asaas**
- ✅ API simples e brasileira
- ✅ Suporte para PIX, Boleto e Cartão
- ✅ Gerenciamento de assinaturas
- ✅ Split de pagamentos
- 💰 Taxas: 1,99% para PIX, 4,49% + R$ 0,49 para cartão

**Documentação**: https://docs.asaas.com/

**Instalação**:
```bash
npm install asaas-sdk
```

### 3. **PagSeguro**
- ✅ Marca consolidada no mercado
- ✅ Suporte completo para PIX e Cartão
- ✅ Checkout transparente
- 💰 Taxas: variam conforme volume

**Documentação**: https://dev.pagseguro.uol.com.br/

### 4. **Stripe** (Internacional)
- ✅ Melhor documentação do mercado
- ✅ Suporte global
- ⚠️ Requer conversão de moeda
- 💰 Taxas: 3,99% + R$ 0,50 por transação

**Documentação**: https://stripe.com/docs/api

## 🛠️ Implementação com Backend (Recomendado)

### Estrutura Sugerida

```
backend/
├── routes/
│   └── pagamento.js
├── controllers/
│   └── pagamentoController.js
├── services/
│   └── gatewayService.js
└── webhooks/
    └── pagamentoWebhook.js
```

### Exemplo de Endpoint (Node.js + Express)

```javascript
// backend/routes/pagamento.js
const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Criar pagamento PIX
router.post('/create-pix', async (req, res) => {
  try {
    const { amount, description, payer } = req.body;
    
    const payment = await mercadopago.payment.create({
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix',
      payer: payer,
      notification_url: `${process.env.BASE_URL}/webhooks/pagamento`
    });
    
    res.json({
      id: payment.body.id,
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook para confirmação de pagamento
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const payment = await mercadopago.payment.get(data.id);
      
      if (payment.body.status === 'approved') {
        // Ativar instituição no sistema
        await ativarInstituicao(payment.body.external_reference);
        
        // Enviar email de confirmação
        await enviarEmailConfirmacao(payment.body.payer.email);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
```

## 🔐 Segurança

### Boas Práticas

1. **Nunca exponha credenciais no frontend**
   ```javascript
   // ❌ ERRADO
   const API_KEY = 'sk_live_abc123...';
   
   // ✅ CORRETO - Use variáveis de ambiente
   const API_KEY = process.env.REACT_APP_PUBLIC_KEY;
   ```

2. **Valide pagamentos no backend**
   - Nunca confie apenas na resposta do frontend
   - Use webhooks para confirmação

3. **Use HTTPS em produção**
   - Obrigatório para processar pagamentos

4. **Implemente limitação de taxa (Rate Limiting)**
   - Previne ataques de força bruta

5. **Sanitize inputs**
   - Valide todos os dados antes de processar

## 📧 Notificações por Email

### Integração com SendGrid

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const enviarEmailPagamentoAprovado = async (emailCliente, dadosPagamento) => {
  const msg = {
    to: emailCliente,
    from: 'pagamentos@cei.com.br',
    subject: 'Pagamento Aprovado - Sistema CEI',
    html: `
      <h1>Pagamento Confirmado!</h1>
      <p>Seu pagamento no valor de <strong>R$ ${dadosPagamento.valor}</strong> foi aprovado.</p>
      <p>Número da transação: ${dadosPagamento.transacao}</p>
      <p>Agora você pode acessar o sistema em: <a href="https://seu-dominio.com/login">https://seu-dominio.com/login</a></p>
    `
  };
  
  await sgMail.send(msg);
};
```

## 🧪 Testes

### Dados de Teste (Mercado Pago)

**Cartões de Teste**:
- Aprovado: `5031 4332 1540 6351` (Mastercard)
- Recusado: `5031 7557 3453 0604` (Mastercard)
- CVV: `123`
- Validade: qualquer data futura

**PIX de Teste**:
- Use o sandbox e simule pagamentos pelo painel

### Ambiente de Desenvolvimento

```javascript
// .env.development
REACT_APP_AMBIENTE=development
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-xxx
REACT_APP_API_URL=http://localhost:3001

// .env.production
REACT_APP_AMBIENTE=production
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP-xxx
REACT_APP_API_URL=https://api.seu-dominio.com
```

## 📊 Monitoramento de Pagamentos

### Dashboard Recomendado

Crie uma página administrativa para monitorar:
- Pagamentos pendentes
- Pagamentos aprovados
- Pagamentos recusados
- Taxas de conversão
- Faturamento mensal

```javascript
// Exemplo de estatísticas
const estatisticasPagamentos = {
  total: 150,
  aprovados: 142,
  recusados: 5,
  pendentes: 3,
  taxaAprovacao: '94.7%',
  faturamentoMensal: 'R$ 13.779,00'
};
```

## 🔄 Fluxo de Renovação

Implemente sistema de renovação automática:

1. **15 dias antes do vencimento**: Email de lembrete
2. **7 dias antes**: Email com link de pagamento
3. **No vencimento**: Bloqueio suave (apenas leitura)
4. **Após 5 dias**: Bloqueio total

## 📱 Integração com Aplicativo Mobile

Se futuramente desenvolver app mobile, use os mesmos endpoints:

```javascript
// React Native
import axios from 'axios';

const processarPagamento = async (dadosPagamento) => {
  const response = await axios.post(
    'https://api.seu-dominio.com/pagamento/create-pix',
    dadosPagamento,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
};
```

## 🚀 Deploy em Produção

### Checklist

- [ ] Configurar variáveis de ambiente em produção
- [ ] Migrar para credenciais de produção do gateway
- [ ] Configurar certificado SSL (HTTPS)
- [ ] Configurar webhooks com URL de produção
- [ ] Testar fluxo completo em ambiente de staging
- [ ] Configurar monitoramento de erros (Sentry, Bugsnag)
- [ ] Implementar backup automático dos dados de pagamento
- [ ] Configurar alertas para falhas de pagamento

## 📞 Suporte

Para dúvidas sobre integração:

- **Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Asaas**: suporte@asaas.com
- **PagSeguro**: https://dev.pagseguro.uol.com.br/support

## 📄 Licença

Sistema desenvolvido por **Wander Pires Silva Coelho** ®

---

**Nota**: Este documento serve como guia de implementação. Sempre consulte a documentação oficial do gateway escolhido para informações atualizadas.
