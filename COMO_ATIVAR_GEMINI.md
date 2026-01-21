# 🚀 COMO ATIVAR O GOOGLE GEMINI AI (Método Seguro)

## ⚠️ PROBLEMA

As API keys do Gemini estão vazando porque são expostas no chat. Quando você cola a key aqui, o Google detecta automaticamente e bloqueia.

## ✅ SOLUÇÃO SEGURA (Script Automatizado)

### Passo a Passo:

1. **Gere uma nova API key**:
   - Acesse: https://aistudio.google.com/app/apikey
   - Faça login com sua conta Google
   - **DELETE qualquer chave antiga** (botão de lixeira)
   - Clique em **"Create API Key"**
   - Copie a chave gerada (Ctrl + C)

2. **Execute o script seguro**:
   ```powershell
   .\configurar-gemini.ps1
   ```

3. **Cole sua API key quando solicitado**:
   - O script vai pedir: "Cole a API key aqui"
   - Cole (Ctrl + V) e aperte Enter
   - A key **NÃO será exposta** em nenhum arquivo de log

4. **Aguarde**:
   - O script testa a key
   - Atualiza o .env.local automaticamente
   - Faz build
   - Faz deploy

5. **Teste o sistema**:
   - Limpe o cache (Ctrl + Shift + Delete)
   - Acesse: https://wanderpsc.github.io/cei-backend
   - Teste com ISBN: 9786589077039

## 🔒 Segurança

- ✅ A API key fica apenas no arquivo `.env.local`
- ✅ O `.env.local` está no `.gitignore` (não vai para o GitHub)
- ✅ O script não exibe a key em logs ou terminal
- ✅ Ninguém além de você tem acesso à key

## 🆘 Se der erro "API key leaked":

1. **Delete a chave antiga** em: https://aistudio.google.com/app/apikey
2. **Gere uma NOVA chave**
3. **Execute o script novamente**
4. **NÃO cole a key no chat!**

## 📞 Suporte

Se o script não funcionar:
1. Verifique se tem Node.js instalado: `node --version`
2. Verifique se tem npm instalado: `npm --version`
3. Certifique-se de estar na pasta do projeto
4. Execute: `npm install` antes do script
