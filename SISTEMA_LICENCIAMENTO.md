# 🔐 SISTEMA DE LICENCIAMENTO ÚNICO POR DISPOSITIVO

## ✅ Sistema Implementado com Sucesso!

O sistema CEI agora possui proteção avançada contra compartilhamento não autorizado e uso indevido.

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 1. **Identificação Única de Dispositivo (Device Fingerprinting)**
✅ Cada dispositivo recebe uma "impressão digital" única baseada em:
- User Agent do navegador
- Resolução e características da tela
- Timezone e idioma
- GPU (WebGL) e capacidades de hardware
- Canvas fingerprint
- Audio context fingerprint
- Memória disponível e núcleos de CPU

**Resultado:** Identifica o dispositivo de forma única sem necessidade de login.

### 2. **Um Dispositivo Por Licença**
✅ Cada código de licença funciona em **apenas UM dispositivo por vez**
- Se alguém tentar usar em outro dispositivo, será bloqueado
- Mensagem exibida: *"Esta licença já está ativa em outro dispositivo"*

### 3. **Proteção Contra Compartilhamento de Links**
✅ Links compartilhados não funcionam em outros dispositivos
- Mesmo que alguém copie a URL completa
- Mesmo que copie cookies ou localStorage
- O fingerprint do dispositivo será diferente e o acesso será negado

### 4. **Verificação Contínua**
✅ O sistema verifica a licença:
- A cada 5 minutos automaticamente
- A cada mudança de página
- A cada ação importante
- Bloqueia instantaneamente se detectar problema

### 5. **Sessão Única Ativa**
✅ Apenas uma sessão pode estar ativa por instituição
- Se login em outro dispositivo, a sessão anterior é encerrada
- Impede uso simultâneo em múltiplos dispositivos
- Sessão expira após 5 minutos de inatividade

---

## 📁 ARQUIVOS CRIADOS

### Frontend:
1. **`src/utils/licenseManager.js`**
   - Gera fingerprint do dispositivo
   - Gerencia licenças localmente
   - Comunica com API de licenciamento

2. **`src/context/LicenseContext.js`**
   - Provider React para gerenciar estado de licença
   - Verificação automática periódica
   - Funções de ativar/desativar

3. **`src/pages/AtivarLicencaPage.js`**
   - Interface para ativar licença
   - Valida formato do código
   - Mostra informações do dispositivo

4. **`src/components/ProtectedRoute.js`**
   - Componente que protege rotas
   - Verifica licença antes de permitir acesso
   - Redireciona para ativação se necessário

### Backend:
5. **`server.js` (atualizado)**
   - Novos endpoints de licenciamento
   - Gerenciamento de sessões ativas
   - Banco de licenças em memória

---

## 🔑 ENDPOINTS DA API

### POST `/api/activate-license`
Ativa uma licença em um dispositivo específico.

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "deviceFingerprint": "ABC123...",
  "deviceDetails": { ... }
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "instituicaoId": "INST-1234",
  "userData": { ... }
}
```

**Response (Erro - Já ativo):**
```json
{
  "success": false,
  "reason": "ALREADY_ACTIVE",
  "message": "Esta licença já está ativa em outro dispositivo."
}
```

---

### POST `/api/verify-license`
Verifica se uma licença ainda é válida.

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "deviceFingerprint": "ABC123...",
  "instituicaoId": "INST-1234"
}
```

**Response:**
```json
{
  "valid": true,
  "status": "active",
  "lastVerified": 1704567890
}
```

---

### POST `/api/deactivate-license`
Desativa licença (logout).

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "deviceFingerprint": "ABC123..."
}
```

---

### POST `/api/revoke-license` (Admin)
Revoga uma licença remotamente.

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "adminToken": "ADMIN_SECRET_TOKEN"
}
```

---

### GET `/api/active-licenses` (Admin)
Lista todas as licenças ativas.

**Query:**
```
?adminToken=ADMIN_SECRET_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "licenses": [
    {
      "licenseKey": "XXXX-XXXX-XXXX-XXXX",
      "instituicaoId": "INST-1234",
      "deviceFingerprint": "ABC123...",
      "activatedAt": 1704567890,
      "isOnline": true
    }
  ]
}
```

---

## 🚀 COMO USAR

### 1. **Gerar Código de Licença**

Os códigos são gerados automaticamente no cadastro de instituição:
```
Formato: XXXX-XXXX-XXXX-XXXX
Exemplo: A3B7-9K2L-5M8N-1P4Q
```

### 2. **Ativar Licença**

Quando um usuário acessa o sistema pela primeira vez:

1. É redirecionado para `/ativar-licenca`
2. Insere o código de licença
3. Sistema gera fingerprint do dispositivo
4. Envia para API para validação
5. Se aprovado, licença é salva localmente
6. Usuário pode acessar o sistema

### 3. **Verificação Automática**

A cada 5 minutos, o sistema:
1. Verifica se a licença ainda é válida
2. Confirma que o dispositivo é o mesmo
3. Atualiza timestamp da última verificação
4. Se houver problema, bloqueia o acesso

### 4. **Bloquear Uso Não Autorizado**

Se alguém tentar compartilhar:
- **Link:** Será bloqueado (fingerprint diferente)
- **Código:** Será bloqueado (já ativo em outro dispositivo)
- **Duplicar:** Será bloqueado (mesmo código, dispositivo diferente)

---

## 🛡️ NÍVEIS DE PROTEÇÃO

### Nível 1: Device Fingerprint
- Identifica hardware e software único
- Impossível falsificar completamente
- Funciona mesmo sem login

### Nível 2: Verificação de Sessão
- Apenas uma sessão ativa por instituição
- Sessão expira em 5 minutos de inatividade
- Logout automático em outros dispositivos

### Nível 3: Verificação Periódica
- Revalida licença a cada 5 minutos
- Detecta revogações instantaneamente
- Funciona offline por até 24h

### Nível 4: API de Licenciamento
- Centraliza controle de licenças
- Permite revogar remotamente
- Monitora uso em tempo real

---

## 📊 FLUXO COMPLETO

```
┌─────────────────┐
│ Usuário acessa  │
│    sistema      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verifica se há  │
│ licença salva   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ SIM│NÃO │
    └─┬───┴──┬─┘
      │      │
      │      ▼
      │  ┌──────────────┐
      │  │ Redireciona  │
      │  │ para ativação│
      │  └──────────────┘
      │
      ▼
┌─────────────────┐
│ Verifica        │
│ fingerprint     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ OK│ERRO │
    └─┬───┴──┬─┘
      │      │
      │      ▼
      │  ┌──────────────┐
      │  │ BLOQUEADO    │
      │  │ Dispositivo  │
      │  │ não autorizado│
      │  └──────────────┘
      │
      ▼
┌─────────────────┐
│ Verifica com    │
│ API (online)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │VÁLIDO   │
    │INVÁLIDO │
    └─┬───┴──┬─┘
      │      │
      │      ▼
      │  ┌──────────────┐
      │  │ BLOQUEADO    │
      │  │ Licença      │
      │  │ revogada     │
      │  └──────────────┘
      │
      ▼
┌─────────────────┐
│ ✅ ACESSO       │
│ AUTORIZADO      │
└─────────────────┘
```

---

## ⚙️ CONFIGURAÇÃO

### Frontend (.env.local):
```env
REACT_APP_API_URL=http://localhost:3001
```

### Backend (.env):
```env
BACKEND_PORT=3001
# Nenhuma configuração adicional necessária
```

---

## 🧪 TESTAR O SISTEMA

### Teste 1: Ativar Licença
1. Acesse `http://localhost:3000`
2. Será redirecionado para ativação
3. Use código: `A3B7-9K2L-5M8N-1P4Q`
4. Clique em "Ativar Licença"
5. Deve ser aprovado

### Teste 2: Compartilhamento Bloqueado
1. Copie a URL depois de ativado
2. Abra em modo anônimo ou outro navegador
3. Cole a URL
4. Será bloqueado e redirecionado para ativação
5. Mesmo código não funcionará (já ativo)

### Teste 3: Verificação Automática
1. Após ativar, aguarde 5 minutos
2. Sistema verifica automaticamente
3. Se tudo OK, continua funcionando
4. Se houver problema, bloqueia instantaneamente

### Teste 4: Revogar Licença
```bash
curl -X POST http://localhost:3001/api/revoke-license \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "A3B7-9K2L-5M8N-1P4Q",
    "adminToken": "ADMIN_SECRET_TOKEN"
  }'
```
Usuário será deslogado instantaneamente na próxima verificação.

---

## 🔧 MANUTENÇÃO

### Listar Licenças Ativas:
```bash
curl "http://localhost:3001/api/active-licenses?adminToken=ADMIN_SECRET_TOKEN"
```

### Revogar Acesso Remoto:
Use o endpoint `/api/revoke-license` com token de admin.

### Banco de Dados:
**IMPORTANTE:** O sistema atual usa memória (Map). Para produção:
1. Substitua `licensesDB` por MongoDB/PostgreSQL
2. Substitua `sessionsDB` por Redis (para sessões)
3. Implemente persistência de dados

---

## 🚨 AVISOS IMPORTANTES

### ⚠️ Produção:
1. **Troque o adminToken** por algo seguro
2. **Use banco de dados real** (MongoDB/PostgreSQL)
3. **Use Redis** para sessões
4. **Adicione HTTPS** obrigatório
5. **Implemente rate limiting** nas APIs

### ⚠️ Segurança:
- Fingerprint não é 100% único, mas muito difícil de falsificar
- Use em conjunto com autenticação tradicional
- Monitore tentativas de fraude
- Implemente alertas para atividades suspeitas

### ⚠️ UX:
- Explique ao usuário sobre dispositivo único
- Permita transferência de licença (com aprovação)
- Crie processo para trocar de dispositivo
- Implemente suporte para casos especiais

---

## 📞 PRÓXIMOS PASSOS RECOMENDADOS

1. ✅ Integrar com banco de dados real
2. ✅ Adicionar painel admin para gerenciar licenças
3. ✅ Implementar processo de transferência de dispositivo
4. ✅ Adicionar logs de auditoria
5. ✅ Criar alertas para uso suspeito
6. ✅ Implementar 2FA (autenticação de dois fatores)
7. ✅ Adicionar backup de licenças
8. ✅ Criar relatórios de uso

---

## ✅ RESULTADO FINAL

O sistema agora garante que:

✅ **Apenas dispositivos autorizados** podem acessar  
✅ **Um dispositivo por licença** por vez  
✅ **Links compartilhados não funcionam**  
✅ **Verificação contínua** em tempo real  
✅ **Revogação remota** de acessos  
✅ **Monitoramento** de licenças ativas  
✅ **Proteção contra fraude** e pirataria  

---

*Sistema desenvolvido por Wander Pires Silva Coelho ®*
*© 2026 - Todos os direitos reservados*
