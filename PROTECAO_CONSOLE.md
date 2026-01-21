# 🔐 SISTEMA DE PROTEÇÃO DO CONSOLE - CEI

## 📋 Descrição

Sistema de segurança que bloqueia e oculta o console do navegador para usuários não autorizados, protegendo informações sensíveis e código-fonte do sistema CEI.

---

## ✅ O que foi implementado

### 1. **Bloqueio Completo do Console**
- Todos os métodos do console bloqueados (log, warn, error, info, debug, etc.)
- Mensagens de sistema não aparecem para usuários não autorizados
- Tentativas de uso do console mostram aviso de bloqueio

### 2. **Sistema de Autenticação**
- Senha master para desbloquear: `CEI@Wander2026#Seguro`
- Sessão temporária de 30 minutos após desbloqueio
- Bloqueio automático após expiração da sessão
- Limite de 5 tentativas incorretas

### 3. **Proteção de Atalhos do Teclado**
- F12 bloqueado
- Ctrl+Shift+I bloqueado (DevTools)
- Ctrl+Shift+J bloqueado (Console)
- Ctrl+Shift+C bloqueado (Inspect Element)
- Ctrl+U bloqueado (View Source)

### 4. **Proteção de Menu de Contexto**
- Clique direito bloqueado quando console está bloqueado
- Impede acesso ao "Inspecionar Elemento"

### 5. **Detecção de DevTools**
- Detecta quando DevTools é aberto
- Emite aviso se DevTools for detectado sem autorização

---

## 🔑 Como Usar

### Para VOCÊ (Desenvolvedor)

1. **Abrir o console normalmente** (F12 ou Ctrl+Shift+I)

2. **Desbloquear digitando no console:**
   ```javascript
   unlockConsole("CEI@Wander2026#Seguro")
   ```

3. **Mensagem de sucesso aparecerá:**
   ```
   ✅ Console desbloqueado com sucesso! Sessão ativa por 30 minutos.
   © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
   ```

4. **Bloquear manualmente (opcional):**
   ```javascript
   lockConsole()
   ```

### Para Outros Usuários

- Console ficará bloqueado
- Tentativas de acesso mostrarão apenas:
  ```
  🔒 ACESSO NEGADO - Console Bloqueado
  ⚠️ Este console está protegido. Acesso não autorizado é proibido.
  💡 Para desbloquear, digite: unlockConsole("sua-senha")
  ```

---

## 🔧 Configurações

### Alterar a Senha Master

Edite o arquivo `/public/consoleProtection.js`, linha 17:

```javascript
MASTER_PASSWORD: 'CEI@Wander2026#Seguro', // ALTERE AQUI
```

### Alterar Tempo de Sessão

Edite o arquivo `/public/consoleProtection.js`, linha 20:

```javascript
SESSION_DURATION: 30 * 60 * 1000, // 30 minutos (em milissegundos)
```

### Alterar Limite de Tentativas

Edite o arquivo `/public/consoleProtection.js`, linha 38:

```javascript
const MAX_ATTEMPTS = 5; // Número máximo de tentativas
```

---

## 📂 Arquivos Modificados

### 1. `/public/consoleProtection.js` (NOVO)
- Script principal de proteção
- Contém toda a lógica de bloqueio e autenticação

### 2. `/public/index.html` (MODIFICADO)
- Adicionada linha 24: carregamento do script de proteção
- Carrega ANTES de qualquer outro script para máxima proteção

---

## 🛡️ Níveis de Proteção

### Nível 1: Bloqueio do Console
- ✅ Métodos console.* bloqueados
- ✅ Mensagens internas não aparecem

### Nível 2: Bloqueio de Atalhos
- ✅ F12 desabilitado
- ✅ Ctrl+Shift+I/J/C desabilitados
- ✅ Ctrl+U desabilitado

### Nível 3: Bloqueio Visual
- ✅ Clique direito desabilitado
- ✅ Menu de contexto bloqueado

### Nível 4: Detecção Ativa
- ✅ Detecta abertura do DevTools
- ✅ Registra tentativas não autorizadas

---

## ⚠️ Limitações e Avisos

### Limitações Técnicas

1. **Desenvolvedores Experientes**
   - Usuários avançados podem desabilitar o JavaScript ou usar outras ferramentas
   - Esta proteção é uma camada de segurança, não uma solução definitiva

2. **Código-Fonte Visível**
   - O código JavaScript compilado ainda é acessível
   - Para proteção total, considere ofuscação de código

3. **Navegadores Diferentes**
   - Alguns navegadores podem ter atalhos diferentes
   - Teste em múltiplos navegadores

### Recomendações de Segurança

1. **Nunca armazene dados sensíveis no frontend**
   - Senhas, tokens, chaves de API devem estar no backend

2. **Use HTTPS sempre**
   - Protege contra ataques man-in-the-middle

3. **Implemente autenticação no backend**
   - Não confie apenas na segurança do frontend

4. **Mantenha a senha master segura**
   - Não compartilhe com terceiros
   - Troque periodicamente

---

## 🧪 Testes

### Testar Bloqueio

1. Abra o navegador em modo anônimo
2. Acesse o sistema
3. Tente abrir o console (F12)
4. Verifique se está bloqueado

### Testar Desbloqueio

1. Abra o console (força com F12)
2. Digite: `unlockConsole("CEI@Wander2026#Seguro")`
3. Verifique mensagem de sucesso
4. Tente usar console.log() normalmente

### Testar Sessão

1. Desbloqueie o console
2. Aguarde 30 minutos
3. Verifique se foi bloqueado automaticamente

### Testar Tentativas Incorretas

1. Digite senha errada 5 vezes
2. Verifique se console fica bloqueado permanentemente
3. Recarregue a página para tentar novamente

---

## 🚀 Implementação em Produção

### Build para Produção

```bash
npm run build
```

O script de proteção será automaticamente incluído no build.

### Deploy

```bash
npm run deploy
# ou
deploy-github.bat
```

---

## 📊 Registro de Tentativas

Tentativas de acesso não autorizado são registradas com:
- Timestamp
- User Agent
- Número de tentativas

**Exemplo de log:**
```javascript
{
  timestamp: "2026-01-20T10:30:00.000Z",
  userAgent: "Mozilla/5.0...",
  attempts: 3
}
```

---

## 🔄 Atualizações Futuras

### Possíveis Melhorias

1. **Backend Logging**
   - Enviar tentativas de acesso para servidor
   - Criar dashboard de segurança

2. **Autenticação 2FA**
   - Código enviado por email
   - Validação dupla para maior segurança

3. **Ofuscação de Código**
   - Usar webpack plugins para ofuscar
   - Dificultar engenharia reversa

4. **Rate Limiting**
   - Bloquear IP após muitas tentativas
   - Proteção contra brute force

5. **Watermark de Código**
   - Adicionar identificadores únicos
   - Rastrear cópias não autorizadas

---

## 📞 Suporte

**Desenvolvedor:** Wander Pires Silva Coelho  
**Email:** wander@cetidesamaral.edu.br  
**Sistema:** CEI - Controle Escolar Inteligente v3.3.1

---

## 📜 Licença

© 2026 Wander Pires Silva Coelho - Todos os direitos reservados

Este sistema é proprietário e seu uso não autorizado é proibido por lei.

---

## ✅ Status de Implementação

- [x] Script de proteção criado
- [x] Integrado ao index.html
- [x] Bloqueio de console funcionando
- [x] Bloqueio de atalhos implementado
- [x] Sistema de senha implementado
- [x] Sessão temporária funcionando
- [x] Detecção de DevTools ativa
- [x] Documentação completa

**Data de Implementação:** 20 de Janeiro de 2026

---

## 🎯 Conclusão

O console do CEI agora está protegido contra acesso não autorizado. Apenas você, com a senha master, pode acessar as ferramentas de desenvolvimento e visualizar mensagens do sistema.

**Senha atual:** `CEI@Wander2026#Seguro`

⚠️ **IMPORTANTE:** Guarde esta senha em local seguro e não compartilhe com terceiros!
