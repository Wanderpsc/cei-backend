# 🧪 EXEMPLOS DE TESTE DA API DE PAGAMENTOS

## Testar Health Check

```bash
curl http://localhost:3001/api/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "service": "CEI Payment API",
  "timestamp": "2026-01-06T17:48:13.331Z"
}
```

---

## Criar Pagamento PIX

```bash
curl -X POST http://localhost:3001/api/create-pix-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "email": "teste@exemplo.com",
    "cpf": "12345678900",
    "nome": "João da Silva",
    "instituicaoId": "INST-123456",
    "plano": "Plano Mensal"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "payment": {
    "id": "1234567890",
    "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "qr_code": "00020126360014br.gov.bcb.pix...",
    "ticket_url": "https://www.mercadopago.com/..."
  }
}
```

---

## Verificar Status do Pagamento

```bash
curl http://localhost:3001/api/check-payment/1234567890
```

**Resposta esperada:**
```json
{
  "success": true,
  "status": "pending",
  "status_detail": "pending_waiting_payment",
  "payment": {
    "id": "1234567890",
    "status": "pending",
    "amount": 50.00,
    "approved_at": null
  }
}
```

**Status possíveis:**
- `pending` - Aguardando pagamento
- `approved` - Pagamento aprovado
- `rejected` - Pagamento recusado
- `cancelled` - Pagamento cancelado

---

## Criar Pagamento com Cartão

**Primeiro, criar token do cartão no frontend:**
```javascript
const mp = new MercadoPago('APP_USR-7c4ec711-2b61-41f4-93fd-c4a2c8b10672');

const cardToken = await mp.createCardToken({
  cardNumber: '4509953566233704',
  cardholderName: 'APRO',
  cardExpirationMonth: '11',
  cardExpirationYear: '2025',
  securityCode: '123',
  identificationType: 'CPF',
  identificationNumber: '12345678900'
});
```

**Depois, enviar ao backend:**
```bash
curl -X POST http://localhost:3001/api/create-card-payment \
  -H "Content-Type: application/json" \
  -d '{
    "cardToken": "token-do-cartao-aqui",
    "amount": 50.00,
    "installments": 1,
    "email": "teste@exemplo.com",
    "nome": "João da Silva",
    "cpf": "12345678900",
    "instituicaoId": "INST-123456",
    "plano": "Plano Mensal"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "payment": {
    "id": "1234567890",
    "status": "approved",
    "status_detail": "accredited",
    "installments": 1
  }
}
```

---

## Webhook - Notificações Automáticas

Quando um pagamento é aprovado, o Mercado Pago envia uma notificação:

```bash
# Simulação de webhook
curl -X POST http://localhost:3001/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "1234567890"
    }
  }'
```

**O que o webhook faz:**
1. Recebe notificação do Mercado Pago
2. Busca detalhes do pagamento
3. Verifica se foi aprovado
4. Ativa a instituição no banco de dados
5. Envia email de confirmação

---

## Testar no Frontend

### Teste PIX Completo:

1. Abra: `http://localhost:3000`
2. Vá para cadastro de escola
3. Preencha os dados
4. Escolha um plano
5. Clique em "Gerar PIX"
6. Copie o código PIX
7. Use o app do banco para pagar
8. O sistema detectará automaticamente

### Teste Cartão Completo:

1. Abra: `http://localhost:3000`
2. Vá para cadastro de escola
3. Preencha os dados
4. Escolha um plano
5. Vá para aba "Cartão de Crédito"
6. Use cartão de teste:
   ```
   Número: 4509 9535 6623 3704
   Nome: APRO
   Validade: 11/25
   CVV: 123
   ```
7. Clique em "Pagar"
8. Aguarde aprovação

---

## Cartões de Teste

### APROVADOS:

**VISA:**
```
Número: 4509 9535 6623 3704
Nome: APRO
Validade: 11/25
CVV: 123
```

**MASTERCARD:**
```
Número: 5031 4332 1540 6351
Nome: APRO
Validade: 11/25
CVV: 123
```

**AMEX:**
```
Número: 3711 803032 57522
Nome: APRO
Validade: 11/25
CVV: 1234
```

### RECUSADOS:

**VISA - Falta de saldo:**
```
Número: 4000 0000 0000 0010
Nome: OTHE
Validade: 11/25
CVV: 123
```

**MASTER - Cartão inválido:**
```
Número: 5400 0000 0000 0001
Nome: OTHE
Validade: 11/25
CVV: 123
```

---

## Códigos de Erro Comuns

### `401 Unauthorized`
- Access Token inválido ou expirado
- Solução: Verifique o `.env`

### `400 Bad Request`
- Dados inválidos na requisição
- Solução: Verifique o formato dos dados

### `500 Internal Server Error`
- Erro no servidor
- Solução: Verifique os logs do backend

### `404 Not Found`
- Endpoint não existe
- Solução: Verifique a URL

---

## Monitorar Logs

### Backend:
```bash
# Ver logs em tempo real
node server.js
```

### Frontend:
1. Abra o DevTools (F12)
2. Vá para aba "Console"
3. Veja os logs do JavaScript

---

## URLs Importantes

- **API Local:** http://localhost:3001
- **Frontend Local:** http://localhost:3000
- **Health Check:** http://localhost:3001/api/health
- **Mercado Pago Dashboard:** https://www.mercadopago.com.br/activities
- **Credenciais:** https://www.mercadopago.com.br/developers/panel/credentials

---

## Ambiente de Teste vs Produção

### TESTE (para desenvolvimento):
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx
```
- Pagamentos simulados
- Não cobra dinheiro real
- Use cartões de teste

### PRODUÇÃO (para clientes reais):
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```
- Pagamentos reais
- Cobra dinheiro real
- Use cartões reais

---

*Documentação completa: [GUIA_TESTE_PAGAMENTOS.md](./GUIA_TESTE_PAGAMENTOS.md)*
