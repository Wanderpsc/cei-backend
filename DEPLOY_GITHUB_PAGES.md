# 🚀 Deploy CEI - GitHub Pages

## ✅ Configuração Concluída

O projeto está configurado para deploy no **GitHub Pages**!

### 📋 Pré-requisitos

1. **Git instalado e configurado**
2. **Repositório criado no GitHub**
3. **Repositório conectado localmente**

---

## 🔧 Primeira Configuração (Uma Vez)

### 1. Criar Repositório no GitHub

Acesse [GitHub](https://github.com/new) e crie um novo repositório:
- **Nome sugerido**: `cei-sistema-biblioteca`
- **Tipo**: Public ou Private
- **NÃO** marque "Initialize with README"

### 2. Conectar Repositório Local

```powershell
cd "e:\1. Nova pasta\MEUS PROJETOS DE PROGRAMAÇÃO\CEI - CONTROLE ESCOLAR INTELIGENTE - BIBLIOTECA"

# Inicializar Git (se ainda não foi feito)
git init

# Adicionar repositório remoto
git remote add origin https://github.com/SEU-USUARIO/cei-sistema-biblioteca.git

# Fazer primeiro commit
git add .
git commit -m "Primeiro commit - CEI Sistema v3.3.1"

# Enviar para GitHub
git branch -M main
git push -u origin main
```

### 3. Atualizar Homepage no package.json

Abra [package.json](../package.json) e atualize a linha `homepage`:

```json
"homepage": "https://SEU-USUARIO.github.io/cei-sistema-biblioteca"
```

Substitua `SEU-USUARIO` pelo seu usuário do GitHub.

---

## 🚀 Como Fazer Deploy

### Opção 1: Script Automatizado (Recomendado)

```powershell
.\deploy-github.bat
```

### Opção 2: Comando Manual

```powershell
npm run deploy
```

O comando `npm run deploy` automaticamente:
1. ✅ Executa `npm run build`
2. ✅ Cria branch `gh-pages`
3. ✅ Faz push para GitHub
4. ✅ Ativa GitHub Pages

---

## 🌐 Acessar Site Publicado

Após o deploy, acesse:

```
https://SEU-USUARIO.github.io/cei-sistema-biblioteca
```

⏱️ **Aguarde 1-2 minutos** para o GitHub processar o deploy.

---

## ⚙️ Configurar GitHub Pages (Primeira Vez)

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Clique em **Save**

---

## 🔄 Atualizações Futuras

Para atualizar o site após mudanças:

```powershell
# 1. Commit suas mudanças
git add .
git commit -m "Descrição das mudanças"
git push

# 2. Deploy para GitHub Pages
npm run deploy
```

Ou simplesmente execute:

```powershell
.\deploy-github.bat
```

---

## 🛠️ Troubleshooting

### Erro: "remote origin already exists"

```powershell
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/cei-sistema-biblioteca.git
```

### Erro: "gh-pages not found"

```powershell
npm install gh-pages --save-dev
```

### Site mostra erro 404

1. Aguarde 2-3 minutos após o deploy
2. Verifique em **Settings → Pages** se a fonte está em `gh-pages`
3. Limpe o cache do navegador (`Ctrl + F5`)

### Arquivos não atualizando

```powershell
# Limpar cache do gh-pages
Remove-Item -Recurse -Force node_modules\.cache\gh-pages
npm run deploy
```

---

## 📝 Estrutura de Arquivos

```
package.json          → Configurações e scripts de deploy
deploy-github.bat     → Script automatizado de deploy
build/                → Pasta gerada pelo build (não commitar)
.gitignore            → Arquivos ignorados pelo Git
```

---

## 🔐 Domínio Customizado (Opcional)

Para usar um domínio próprio:

1. Crie arquivo `public/CNAME`:
   ```
   seudominio.com.br
   ```

2. Configure DNS no seu provedor:
   ```
   CNAME → SEU-USUARIO.github.io
   ```

3. No GitHub Settings → Pages, adicione o domínio customizado

---

## 📊 Vantagens do GitHub Pages

✅ **100% Gratuito**  
✅ **SSL/HTTPS automático**  
✅ **CDN global**  
✅ **Builds automáticos**  
✅ **Versionamento com Git**  
✅ **Sem limite de deploys**  
✅ **Domínio customizado suportado**

---

## 📞 Suporte

- **GitHub Pages**: https://docs.github.com/pages
- **React Deployment**: https://create-react-app.dev/docs/deployment/

---

**Status**: ✅ Configurado e Pronto para Deploy!
