# 🤖 Configuração da API do Google Gemini AI

## 📋 Sobre o Gemini AI

O Google Gemini AI é uma inteligência artificial que pode ajudar a encontrar informações detalhadas sobre livros quando as APIs tradicionais (Google Books, Open Library, etc.) não retornam resultados.

### ✅ Vantagens
- **100% GRATUITO** (60 requisições por minuto)
- Busca inteligente em bases de conhecimento
- Retorna descrições e sinopses completas
- Identifica livros didáticos e paradidáticos
- Funciona para livros raros ou recentes

### ❌ Problema Atual
A API key configurada no sistema **expirou ou está inválida**, causando erro 403 (Forbidden).

## 🔧 Como Resolver o Erro 403

### Passo 1: Obter Nova API Key GRATUITA

1. **Acesse o Google AI Studio:**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Faça login** com sua conta Google
   - Pode ser qualquer conta Gmail pessoal ou institucional

3. **Crie uma nova API key:**
   - Clique em **"Create API Key"** ou **"Get API Key"**
   - Selecione **"Create API key in new project"**
   - Aguarde alguns segundos

4. **Copie a chave gerada**
   - A chave tem formato: `AIzaSy...` (39 caracteres)
   - **IMPORTANTE:** Guarde essa chave em local seguro!

### Passo 2: Configurar no Sistema

1. **Abra o arquivo:**
   ```
   src/utils/isbnSearchService.js
   ```

2. **Localize a linha 45** (aproximadamente):
   ```javascript
   const GEMINI_API_KEY = ''; // ❌ DESABILITADO
   ```

3. **Cole sua nova API key:**
   ```javascript
   const GEMINI_API_KEY = 'AIzaSyAbc123def456...'; // ✅ ATIVADO!
   ```

4. **Salve o arquivo** e recarregue o sistema

### Passo 3: Verificar se Funciona

1. Abra o **Console do Navegador** (F12)
2. Faça uma busca por ISBN usando o leitor de código de barras
3. Verifique se aparece:
   ```
   🤖 Buscando com Google Gemini AI...
   🔑 API Key configurada: SIM ✅
   ✅ Livro encontrado via Gemini AI!
   ```

## 🔐 Segurança da API Key

### ⚠️ Cuidados Importantes

1. **NÃO compartilhe sua API key** publicamente
2. **NÃO faça commit** da key em repositórios públicos
3. Se expor acidentalmente, **revogue imediatamente** em:
   ```
   https://aistudio.google.com/app/apikey
   ```

### 🛡️ Proteção Recomendada

Para projetos públicos (GitHub, etc.), use **variáveis de ambiente**:

```javascript
// Em vez de:
const GEMINI_API_KEY = 'AIzaSy...';

// Use (requer configuração adicional):
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
```

Depois crie um arquivo `.env.local`:
```
REACT_APP_GEMINI_API_KEY=AIzaSy...
```

E adicione ao `.gitignore`:
```
.env.local
```

## 📊 Limites da API Gratuita

| Recurso | Limite Gratuito |
|---------|----------------|
| Requisições/minuto | 60 RPM |
| Requisições/dia | 1.500 RPD |
| Tokens/minuto | 32.000 TPM |
| Tokens/requisição | 32.000 |

**Conclusão:** Mais que suficiente para uso escolar! 🎉

## 🔄 Alternativas se Não Quiser Usar Gemini

O sistema funciona **perfeitamente sem o Gemini AI**! 

Outras 12 fontes de busca continuam ativas:
- ✅ Google Books API
- ✅ Open Library
- ✅ WorldCat
- ✅ Amazon Brasil
- ✅ E mais 8 fontes...

Para desabilitar permanentemente:
```javascript
const GEMINI_ENABLED = false; // Forçar desabilitado
```

## 🆘 Problemas Comuns

### Erro 403 (Forbidden)
- **Causa:** API key inválida, expirada ou sem permissões
- **Solução:** Gere uma nova key seguindo o Passo 1 acima

### Erro 429 (Too Many Requests)
- **Causa:** Excedeu o limite de 60 requisições/minuto
- **Solução:** Aguarde 1 minuto ou desabilite temporariamente

### Erro 400 (Bad Request)
- **Causa:** Formato da requisição inválido
- **Solução:** Verifique se está usando a versão mais recente do sistema

### "API Key configurada: NÃO ❌"
- **Causa:** API key vazia ou muito curta
- **Solução:** Verifique se colou a key completa (39 caracteres)

## 📞 Suporte

- **Documentação oficial:** https://ai.google.dev/docs
- **Console do projeto:** https://aistudio.google.com/
- **Fórum de suporte:** https://discuss.ai.google.dev/

## 📝 Notas da Versão

- **v3.5.2:** Integração com Gemini AI
- **v3.3.1:** Correção de erro 403 e melhorias no tratamento de erros
- **v3.4.0:** Sistema de busca em 13 fontes diferentes

---

**Última atualização:** 17/01/2026  
**Status:** API key desabilitada (erro 403) - Requer nova key
