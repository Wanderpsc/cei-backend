# 🚀 Guia Rápido - Sistema de Pagamento CEI

## ⚡ Início em 3 Passos

### 1️⃣ Instalar (apenas 1 vez)
```bash
# Clique duas vezes em:
instalar-pagamentos.bat
```

### 2️⃣ Iniciar
```bash
# Clique duas vezes em:
iniciar-sistema.bat
```

### 3️⃣ Testar
Abra: **http://localhost:3000/cadastro-escola**

---

## 🎯 Fluxo Completo

```
                    CADASTRO
                       ↓
    ┌──────────────────────────────────────┐
    │  1. Dados da Instituição             │
    │  ✓ Nome, CNPJ, Email, Endereço       │
    │  ✓ Escolher Plano                    │
    └──────────────────────────────────────┘
                       ↓
    ┌──────────────────────────────────────┐
    │  2. Dados do Responsável             │
    │  ✓ Nome, CPF, Email, Cargo           │
    └──────────────────────────────────────┘
                       ↓
    ┌──────────────────────────────────────┐
    │  3. Criar Acesso                     │
    │  ✓ Login e Senha                     │
    └──────────────────────────────────────┘
                       ↓
           [FINALIZAR CADASTRO]
                       ↓
                   PAGAMENTO
                       ↓
    ┌──────────────────────────────────────┐
    │           Escolha o Método:          │
    │                                      │
    │  [💰 PIX]    ou    [💳 Cartão]      │
    └──────────────────────────────────────┘
                       ↓
         ┌─────────────┴─────────────┐
         │                           │
    📱 PIX                      💳 CARTÃO
         │                           │
    QR Code                    Número, Nome
    Copia e Cola               Validade, CVV
    Aguardar 10s               Parcelas 1-12x
         │                           │
         └─────────────┬─────────────┘
                       ↓
                   ✅ SUCESSO
                       ↓
    ┌──────────────────────────────────────┐
    │  Pagamento Confirmado!               │
    │  • Nº da Transação                   │
    │  • Dados do Plano                    │
    │  • Credenciais de Acesso             │
    └──────────────────────────────────────┘
                       ↓
              [ACESSAR SISTEMA]
                       ↓
                    🎉 PRONTO!
```

---

## 💳 Teste Rápido

### Opção 1: PIX
1. Gerar QR Code
2. Aguardar 10 segundos
3. ✅ Aprovado automaticamente

### Opção 2: Cartão
```
Número:   5031 4332 1540 6351
Nome:     TESTE DA SILVA
Validade: 12/28
CVV:      123
Parcelas: Qualquer
```

---

## 📁 Arquivos Importantes

```
📦 Projeto
├── 🚀 iniciar-sistema.bat          ← CLIQUE AQUI para iniciar
├── ⚙️ instalar-pagamentos.bat      ← CLIQUE AQUI para instalar
│
├── 📱 Frontend (React)
│   └── src/pages/
│       ├── PagamentoPage.js        ← Página de pagamento
│       └── PagamentoSucessoPage.js ← Confirmação
│
├── 🖥️ Backend (Node.js)
│   ├── backend-exemplo.js          ← API de pagamentos
│   └── .env                        ← Configurações
│
└── 📚 Documentação
    ├── PAYMENT_README.md           ← Guia completo
    ├── PAYMENT_INTEGRATION.md      ← Como integrar gateway real
    └── RESUMO_PAGAMENTO.md         ← Resumo técnico
```

---

## 🔧 Comandos Úteis

### Iniciar Backend
```bash
node backend-exemplo.js
```

### Iniciar Frontend
```bash
npm start
```

### Instalar Dependências
```bash
npm install express cors body-parser dotenv
```

### Ver Logs do Backend
Observe o terminal onde rodou `backend-exemplo.js`

---

## ❓ Problemas Comuns

### ❌ "Node não encontrado"
**Solução**: Instale Node.js → https://nodejs.org/

### ❌ "Porta 3001 já em uso"
**Solução**: Feche o processo ou mude a porta em `.env`

### ❌ "Módulo não encontrado"
**Solução**: Execute `npm install`

### ❌ "Página não carrega"
**Solução**: Certifique-se que backend E frontend estão rodando

---

## 🎨 Personalizar

### Mudar Valores dos Planos
Edite: `src/context/DataContext.js`

### Mudar Cores
Edite: `src/App.js` (theme)

### Mudar Textos
Edite diretamente nas páginas

### Adicionar Logo
Substitua: `SchoolIcon` por `<img src="logo.png" />`

---

## 📞 Ajuda

### Leia a Documentação
1. `PAYMENT_README.md` - Guia completo
2. `PAYMENT_INTEGRATION.md` - Integração real
3. `RESUMO_PAGAMENTO.md` - Técnico detalhado

### Recursos Online
- Material-UI: https://mui.com/
- React Router: https://reactrouter.com/
- Express.js: https://expressjs.com/

---

## ✅ Checklist Antes de Usar

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado
- [ ] Backend rodando (porta 3001)
- [ ] Frontend rodando (porta 3000)
- [ ] Navegador atualizado

---

## 🎉 Pronto!

Seu sistema de pagamento está **100% funcional**!

### Próximos Passos:
1. ✅ Testar todo o fluxo
2. 📝 Personalizar textos e cores
3. 🔧 Configurar gateway real (produção)
4. 🚀 Deploy!

---

**Desenvolvido por: Wander Pires Silva Coelho ®**

**Sistema CEI - Controle Escolar Inteligente**

---

*Última atualização: Janeiro 2026*
