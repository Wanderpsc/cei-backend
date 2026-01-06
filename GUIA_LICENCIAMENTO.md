# 🚀 GUIA RÁPIDO - Sistema de Licenciamento

## Como Funciona?

O sistema agora exige que cada usuário ative uma licença única antes de usar. Cada licença funciona em **apenas UM dispositivo por vez**.

---

## 📋 Passo a Passo para Uso

### 1️⃣ **Iniciar o Sistema**

```bash
# Terminal 1: Backend
cd "e:\1. Nova pasta\MEUS PROJETOS DE PROGRAMAÇÃO\CEI - CONTROLE ESCOLAR INTELIGENTE - BIBLIOTECA"
node server.js

# Terminal 2: Frontend
npm start
```

### 2️⃣ **Primeiro Acesso**

Quando o usuário acessar `http://localhost:3000`:

1. Será redirecionado automaticamente para `/ativar-licenca`
2. Verá uma tela solicitando o código de licença
3. Precisará inserir um código no formato: `XXXX-XXXX-XXXX-XXXX`

### 3️⃣ **Ativar Licença**

**Opção A - Usar código de teste:**
```
Código: A3B7-9K2L-5M8N-1P4Q
```

**Opção B - Gerar novo código:**
No cadastro de escola, o sistema gera automaticamente um código único.

### 4️⃣ **Acesso Liberado**

Após ativação:
- ✅ Usuário pode usar o sistema normalmente
- ✅ Licença fica salva no dispositivo
- ✅ Verificação automática a cada 5 minutos
- ✅ Não precisa ativar novamente (mesmo dispositivo)

---

## 🔐 Proteções Ativas

### ❌ Compartilhar Link
Se o usuário copiar o link e enviar para outra pessoa:
- **Resultado:** Bloqueado
- **Motivo:** Dispositivo diferente

### ❌ Usar em Outro Computador
Se tentar usar no trabalho e em casa ao mesmo tempo:
- **Resultado:** Bloqueado
- **Motivo:** Licença já ativa em outro dispositivo

### ❌ Usar Mesmo Código Duas Vezes
Se tentar ativar o mesmo código em outro dispositivo:
- **Resultado:** Bloqueado
- **Mensagem:** "Esta licença já está ativa em outro dispositivo"

### ✅ Trocar de Dispositivo
Para usar em outro dispositivo:
1. Desative no dispositivo atual (logout)
2. Acesse no novo dispositivo
3. Use o mesmo código de licença
4. Será ativado no novo dispositivo

---

## 🧪 Testar Agora

### Teste 1: Ativação Normal
```bash
1. Acesse: http://localhost:3000
2. Digite: A3B7-9K2L-5M8N-1P4Q
3. Clique em "Ativar Licença"
4. ✅ Deve funcionar
```

### Teste 2: Bloquear Compartilhamento
```bash
1. Após ativar, copie a URL
2. Abra em modo anônimo (Ctrl+Shift+N)
3. Cole a URL
4. ❌ Será bloqueado
```

### Teste 3: Listar Licenças Ativas
```bash
curl "http://localhost:3001/api/active-licenses?adminToken=ADMIN_SECRET_TOKEN"
```

---

## 🛠️ Administração

### Ver Licenças Ativas:
```bash
curl "http://localhost:3001/api/active-licenses?adminToken=ADMIN_SECRET_TOKEN"
```

### Revogar uma Licença:
```bash
curl -X POST http://localhost:3001/api/revoke-license \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "A3B7-9K2L-5M8N-1P4Q",
    "adminToken": "ADMIN_SECRET_TOKEN"
  }'
```

---

## 📱 Como Funciona (Técnico)

### Device Fingerprint:
O sistema cria uma "impressão digital" do dispositivo usando:
- Navegador (User Agent)
- Resolução de tela
- GPU (WebGL)
- Timezone
- Idioma
- Canvas fingerprint
- Audio context

**Resultado:** ID único como `7A3C9B2E8F1D...`

### Verificação:
1. Ao ativar: Salva fingerprint no banco
2. Ao acessar: Compara fingerprint atual com o salvo
3. Se diferente: BLOQUEADO
4. Se igual: LIBERADO

### Sessão Única:
- Apenas 1 sessão ativa por instituição
- Se login em outro lugar, o primeiro é deslogado
- Sessão expira em 5 minutos sem atividade

---

## ⚠️ Importante

### Para Produção:
1. **Troque o adminToken** no código
2. **Use banco de dados** real (não memória)
3. **Adicione HTTPS** obrigatório
4. **Configure backup** de licenças

### Para Usuários:
- Cada licença é para **USO PESSOAL**
- Não compartilhe códigos de licença
- Não compartilhe links do sistema
- Em caso de troca de dispositivo, entre em contato

---

## 🎯 Benefícios

✅ **Proteção Total** contra uso não autorizado  
✅ **Controle Centralizado** de acessos  
✅ **Revogação Instantânea** de licenças  
✅ **Monitoramento em Tempo Real**  
✅ **Segurança Jurídica** (uso autorizado)  
✅ **Simplicidade** para o usuário final  

---

## 📞 Suporte

**Documentação Completa:**  
[SISTEMA_LICENCIAMENTO.md](./SISTEMA_LICENCIAMENTO.md)

**Problemas Comuns:**  
Ver seção "Troubleshooting" no documento principal

---

*Sistema protegido por Wander Pires Silva Coelho ®*
