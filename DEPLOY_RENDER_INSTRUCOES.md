# 🚀 DEPLOY NO RENDER - INSTRUÇÕES ATUALIZADAS

## ⚠️ PROBLEMA IDENTIFICADO

O backend no Render (`https://criador-horario-backend-1.onrender.com/api`) está retornando erro 500 nos endpoints:
- `/api/notifications`
- `/api/subjects`

**Causa:** Estes endpoints não estavam implementados no `server.js`

**Solução:** Foi adicionado suporte para estes endpoints no código.

---

## 📝 PASSOS PARA ATUALIZAR O BACKEND NO RENDER

### 1. Fazer Commit das Alterações

```bash
git add server.js
git commit -m "Adicionar endpoints /api/notifications e /api/subjects"
git push origin main
```

### 2. Atualizar no Render

Acesse: https://dashboard.render.com

1. Vá em **"Services"**
2. Selecione o serviço `criador-horario-backend-1`
3. Clique em **"Manual Deploy"** → **"Deploy latest commit"**

Ou configure **Auto-Deploy**:
- Settings → Build & Deploy
- Ative: **"Auto-Deploy: Yes"**
- Branch: `main`

### 3. Verificar Variáveis de Ambiente

No painel do Render, vá em **Environment**:

```env
NODE_ENV=production
BACKEND_PORT=3001
FRONTEND_URL=https://cei-sistema-biblioteca.surge.sh
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=APP_USR-7c4ec711-2b61-41f4-93fd-c4a2c8b10672
```

### 4. Testar os Endpoints

Após o deploy, teste:

```bash
# Health check
curl https://criador-horario-backend-1.onrender.com/api/health

# Notificações
curl https://criador-horario-backend-1.onrender.com/api/notifications

# Matérias
curl https://criador-horario-backend-1.onrender.com/api/subjects
```

---

## 🔧 ENDPOINTS ADICIONADOS

### GET `/api/notifications`
Retorna todas as notificações do sistema.

**Resposta:**
```json
{
  "success": true,
  "notifications": []
}
```

### POST `/api/notifications`
Cria uma nova notificação.

**Body:**
```json
{
  "title": "Título da notificação",
  "message": "Mensagem",
  "type": "info",
  "userId": "123"
}
```

### GET `/api/subjects`
Retorna todas as matérias/disciplinas.

**Resposta:**
```json
{
  "success": true,
  "subjects": []
}
```

### POST `/api/subjects`
Cria uma nova matéria.

**Body:**
```json
{
  "name": "Matemática",
  "description": "Disciplina de Matemática",
  "instituicaoId": "123"
}
```

---

## 🔄 ALTERAÇÕES NO CORS

O CORS foi atualizado para aceitar os seguintes domínios:

```javascript
origin: [
  'http://localhost:3000',                          // Desenvolvimento
  'https://cei-controle-escolar.surge.sh',         // Produção antiga
  'https://cei-sistema-biblioteca.surge.sh',       // Produção atual
  'https://wanderpsc.github.io'                    // GitHub Pages
]
```

---

## 📊 ESTRUTURA DO BACKEND ATUALIZADA

```
server.js
├── Licenciamento
│   ├── POST /api/activate-license
│   ├── POST /api/verify-license
│   ├── POST /api/deactivate-license
│   ├── POST /api/revoke-license
│   └── GET /api/active-licenses
│
├── Pagamentos
│   ├── POST /api/create-pix-payment
│   ├── POST /api/create-card-payment
│   ├── GET /api/check-payment/:id
│   └── POST /api/webhooks
│
├── Sistema Escolar (NOVO) ✨
│   ├── GET /api/notifications
│   ├── POST /api/notifications
│   ├── GET /api/subjects
│   └── POST /api/subjects
│
└── Diagnóstico
    ├── GET /api/health
    └── GET /api/diagnostico
```

---

## ⚡ PRÓXIMOS PASSOS

### Banco de Dados Real

Atualmente, os dados estão em memória (serão perdidos ao reiniciar):

```javascript
const notificationsDB = []; // ⚠️ Memória volátil
const subjectsDB = [];      // ⚠️ Memória volátil
```

**Recomendação:** Integrar com MongoDB, PostgreSQL ou Firebase.

### Endpoints Adicionais Necessários

Para um sistema escolar completo, você precisará adicionar:

- `/api/instituicoes` - Gerenciar instituições
- `/api/usuarios` - Gerenciar usuários
- `/api/livros` - Gerenciar livros da biblioteca
- `/api/emprestimos` - Gerenciar empréstimos
- `/api/turmas` - Gerenciar turmas
- `/api/alunos` - Gerenciar alunos
- `/api/professores` - Gerenciar professores

---

## 🛠️ TROUBLESHOOTING

### Erro 500 após deploy
- Verifique os logs no Render: **Logs → View Logs**
- Confirme que as variáveis de ambiente estão corretas

### Erro de CORS
- Confirme que o domínio do frontend está na lista de origens permitidas
- Limpe o cache do navegador (Ctrl + Shift + Delete)

### Backend lento na primeira requisição
- O Render coloca serviços gratuitos em "sleep" após 15 minutos de inatividade
- A primeira requisição pode demorar ~30 segundos para "acordar"
- **Solução:** Upgrade para plano pago ou use um serviço de "keep-alive"

---

## 📞 SUPORTE

Se os erros persistirem:

1. Acesse os logs do Render
2. Copie a mensagem de erro completa
3. Verifique a URL da API no frontend:
   - Arquivo: `src/config/api.js` ou similar
   - Deve apontar para: `https://criador-horario-backend-1.onrender.com/api`

---

**Desenvolvido por: Wander Pires Silva Coelho ®**
**Data de atualização: 17/01/2026**
