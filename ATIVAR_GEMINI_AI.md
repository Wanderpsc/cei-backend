# 🤖 Como Ativar o Google Gemini AI no Sistema

## ⚡ Por que ativar?

O **Google Gemini AI** é a fonte **MAIS PODEROSA** para buscar livros no sistema!  
Ele usa inteligência artificial para encontrar informações sobre **QUALQUER livro**, mesmo os mais raros.

## 🎁 É GRATUITO!

- ✅ **60 requisições por minuto** (mais que suficiente!)
- ✅ **Sem cartão de crédito**
- ✅ **Sem limites de uso diário**
- ✅ **Melhor que todas as outras fontes combinadas**

## 📝 Passo a Passo (2 minutos)

### 1️⃣ Obter a API Key

1. Acesse: **https://aistudio.google.com/app/apikey**
2. Faça login com sua **conta Google** (Gmail)
3. Clique no botão **"Create API Key"**
4. Escolha **"Create API key in new project"**
5. **Copie a chave** que aparece (formato: `AIzaSyAbc123def456...`)

### 2️⃣ Colar no Sistema

1. Abra o arquivo: `src/utils/isbnSearchService.js`
2. Procure a **linha 48** (aproximadamente)
3. Encontre: `const GEMINI_API_KEY = '';`
4. **Cole sua chave** entre as aspas:

```javascript
// ANTES:
const GEMINI_API_KEY = '';

// DEPOIS:
const GEMINI_API_KEY = 'AIzaSyAbc123def456...'; // 👈 Cole aqui!
```

### 3️⃣ Salvar e Compilar

```bash
npm run build
npm run deploy
```

## ✅ Pronto!

Agora o Gemini AI será a **PRIMEIRA** fonte consultada e encontrará praticamente **QUALQUER LIVRO**! 🚀

---

## 🔍 Como testar se está funcionando

1. Abra o **Console do Navegador** (F12)
2. Escaneie um ISBN
3. Procure por: `🤖 Buscando com Google Gemini AI...`
4. Se aparecer ✅, está funcionando!
5. Se aparecer ⚠️, a API key não foi configurada

---

## 🆘 Problemas?

### ❌ Erro 403 (Forbidden)
- Sua API key está incorreta
- Copie novamente do Google AI Studio
- Verifique se não tem espaços antes/depois

### ❌ "Gemini AI desabilitado"
- API key não foi colada no arquivo
- Compile novamente: `npm run build`

### ✅ Funcionou?
- Você verá no console: `✅ Livro encontrado via Gemini AI!`
- Os dados serão preenchidos automaticamente
- Muito mais completo que outras fontes!

---

**📆 Última atualização:** 16/01/2026  
**📌 Versão:** 3.5.4 - Gemini AI como prioridade máxima
