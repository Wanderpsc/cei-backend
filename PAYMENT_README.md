# 💳 Sistema de Pagamento - CEI

Sistema completo de pagamento via **PIX** e **Cartão de Crédito** integrado ao cadastro de instituições.

## 🎯 Funcionalidades Implementadas

✅ **Página de Pagamento Completa**
- Interface profissional com abas para PIX e Cartão
- QR Code para pagamento via PIX
- Código Copia e Cola PIX
- Formulário de cartão com validações
- Parcelamento em até 12x
- Design responsivo e seguro

✅ **Fluxo de Cadastro + Pagamento**
- Cadastro em 3 etapas
- Seleção de plano
- Processamento de pagamento
- Confirmação automática
- Ativação da instituição

✅ **Página de Sucesso**
- Confirmação visual atrativa
- Detalhes da transação
- Informações do plano contratado
- Credenciais de acesso
- Redirecionamento automático

## 🚀 Como Usar

### 1. Frontend (React)

O sistema já está totalmente integrado. Basta navegar:

```
Login → Cadastrar Nova Instituição → Preencher Dados → Pagamento
```

**Arquivos criados:**
- `src/pages/PagamentoPage.js` - Página principal de pagamento
- `src/pages/PagamentoSucessoPage.js` - Confirmação de pagamento
- Rotas adicionadas em `src/App.js`

### 2. Backend de Teste (Node.js)

Para testar o backend de exemplo:

```bash
# 1. Instalar dependências
npm install express cors body-parser dotenv

# 2. Criar arquivo .env (copie do .env.example)
cp .env.example .env

# 3. Executar o backend
node backend-exemplo.js
```

O servidor irá rodar em `http://localhost:3001`

### 3. Testar o Fluxo Completo

1. **Inicie o frontend React** (porta 3000)
2. **Inicie o backend** (porta 3001)
3. Acesse: `http://localhost:3000/cadastro-escola`
4. Preencha todos os dados
5. Escolha um plano
6. Finalize o cadastro
7. Será redirecionado para a página de pagamento
8. Escolha PIX ou Cartão
9. Complete o pagamento
10. Veja a confirmação

## 📱 Demonstração Visual

### Página de Pagamento

```
┌─────────────────────────────────────────┐
│  🏫 CEI - Finalizar Pagamento           │
├─────────────────────────────────────────┤
│                                         │
│  📋 Resumo do Pedido                    │
│  ├─ Instituição: Escola ABC             │
│  ├─ Plano: Mensal (30 dias)             │
│  └─ Total: R$ 97,00                     │
│                                         │
├─────────────────────────────────────────┤
│  [PIX] [Cartão de Crédito]              │
├─────────────────────────────────────────┤
│                                         │
│  PIX SELECIONADO:                       │
│  ┌───────────────┐                      │
│  │  [QR CODE]    │  Escaneie ou         │
│  │               │  copie o código      │
│  └───────────────┘                      │
│                                         │
│  [Copiar Código PIX]                    │
│                                         │
│  ⏳ Aguardando pagamento...             │
│                                         │
└─────────────────────────────────────────┘
```

### Página de Sucesso

```
┌─────────────────────────────────────────┐
│         ✅ Pagamento Confirmado!        │
├─────────────────────────────────────────┤
│                                         │
│  Sua instituição está ativa!            │
│                                         │
│  📋 Detalhes da Transação               │
│  ├─ Nº: CEI-2026-ABC123                 │
│  ├─ Método: PIX                         │
│  └─ Status: ✓ Aprovado                  │
│                                         │
│  🔐 Credenciais de Acesso               │
│  ├─ Login: admin                        │
│  └─ Senha: (a que você cadastrou)       │
│                                         │
│  [Acessar o Sistema]                    │
│                                         │
└─────────────────────────────────────────┘
```

## 🔧 Integração com Gateways Reais

### Mercado Pago (Recomendado)

```bash
npm install @mercadopago/sdk-react
```

```javascript
import { initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago('YOUR_PUBLIC_KEY');

// No PagamentoPage.js, substitua a função gerarPix:
const gerarPix = async () => {
  const response = await fetch('http://localhost:3001/api/pagamento/create-pix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: valorTotal,
      description: `Plano ${planoSelecionado.nome}`,
      payer: {
        email: dadosCadastro.email,
        name: dadosCadastro.nomeResponsavel
      },
      instituicaoId: 'INST-123' // ID da instituição
    })
  });
  
  const data = await response.json();
  setPixQRCode(data.payment.qr_code_base64);
  setPixCopiaECola(data.payment.qr_code);
  setPixGerado(true);
};
```

### Asaas

```bash
npm install asaas-sdk
```

Ver documentação completa em: [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md)

## 🎨 Personalização

### Cores e Tema

Edite em `PagamentoPage.js`:

```javascript
// Mudar cores dos cards
<Card sx={{ bgcolor: 'primary.light' }}>

// Mudar ícones
import PixIcon from '@mui/icons-material/QrCode2';
```

### Textos e Mensagens

Todos os textos estão em português e podem ser facilmente editados nos componentes:

- Mensagens de sucesso
- Instruções de pagamento
- Alertas e avisos
- Emails de confirmação

### Parcelamento

Edite o número máximo de parcelas:

```javascript
// Em PagamentoPage.js, linha ~220
for (let i = 1; i <= 12; i++) { // Mude 12 para o máximo desejado
```

## 📊 Dados de Teste

### Cartões de Crédito (Simulação)

Use qualquer número válido de cartão para testes:

```
Número: 5031 4332 1540 6351
Nome: TESTE DA SILVA
Validade: 12/28
CVV: 123
```

### PIX (Simulação)

O sistema gera um código PIX automático. No modo de teste, o pagamento é aprovado após 10 segundos.

## 🔐 Segurança

### Implementado

✅ Validação de formulários
✅ Máscaras de input (cartão, CPF, CNPJ)
✅ Senhas não exibidas em telas de confirmação
✅ Estados de loading durante processamento
✅ Mensagens de erro amigáveis

### Recomendações para Produção

⚠️ **IMPORTANTE**: Antes de colocar em produção:

1. Configure HTTPS (obrigatório)
2. Use variáveis de ambiente para credenciais
3. Implemente rate limiting
4. Configure webhooks reais
5. Adicione logs de auditoria
6. Implemente backup automático
7. Configure monitoramento (Sentry, New Relic)
8. Teste exaustivamente em ambiente de staging

## 📁 Estrutura de Arquivos

```
src/
├── pages/
│   ├── PagamentoPage.js           # Página principal de pagamento
│   ├── PagamentoSucessoPage.js    # Confirmação de pagamento
│   └── CadastroEscolaPage.js      # Atualizado com redirecionamento
├── App.js                          # Rotas atualizadas
└── context/
    └── DataContext.js              # Gerenciamento de estado

root/
├── backend-exemplo.js              # Backend de demonstração
├── backend-package.json            # Dependências do backend
├── .env.example                    # Variáveis de ambiente
├── PAYMENT_INTEGRATION.md          # Documentação completa
└── PAYMENT_README.md               # Este arquivo
```

## 🚨 Solução de Problemas

### Erro: "Cannot find module 'express'"

```bash
npm install express cors body-parser dotenv
```

### Backend não responde

Verifique se está rodando na porta 3001:
```bash
netstat -ano | findstr :3001
```

### CORS Error

Configure no backend:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Pagamento não é aprovado

No modo de teste, o pagamento PIX é aprovado automaticamente após 10 segundos. Para cartão, há 95% de chance de aprovação (simulado).

## 📞 Suporte

Para integração com gateways reais, consulte:

- **Mercado Pago**: https://www.mercadopago.com.br/developers
- **Asaas**: https://docs.asaas.com/
- **PagSeguro**: https://dev.pagseguro.uol.com.br/

## 📝 To-Do (Próximas Implementações)

- [ ] Integração real com Mercado Pago
- [ ] Sistema de renovação automática
- [ ] Dashboard de pagamentos
- [ ] Relatórios financeiros
- [ ] Múltiplos métodos de pagamento
- [ ] Pagamento via Boleto
- [ ] Split de pagamentos
- [ ] Sistema de comissões
- [ ] Cupons de desconto
- [ ] Planos personalizados

## 📄 Licença

Sistema desenvolvido por **Wander Pires Silva Coelho** ®

---

**Última atualização**: Janeiro 2026

Para mais informações, consulte [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md)
