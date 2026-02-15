# Atualizações - 08/01/2026

## Versão: 2.1.0

## 📌 Metadados Padronizados

- **Data:** 08/01/2026
- **Tipo:** Correções de UI, permissões e PWA
- **Escopo:** Menu administrativo, nomenclatura de usuários e atualização de cache
- **Perfis impactados:** SuperAdmin, Admin, Bibliotecário

### ✅ Alterações Implementadas

#### 1. **Nota Fiscal Movida para Administração**
- **Status:** ✅ Concluído
- **Descrição:** Nota Fiscal (ISS) agora aparece apenas no menu do SuperAdmin
- **Arquivos modificados:**
  - `src/components/Layout.js`
- **Impacto:** Escolas não vêem mais o menu de Notas Fiscais, apenas SuperAdmin

#### 2. **Layout "Registrar Leitura Completa" Corrigido**
- **Status:** ✅ Concluído
- **Descrição:** Palavras não se misturam mais no título do dialog
- **Arquivos modificados:**
  - `src/pages/ClubeDeLeituraPage.js`
- **Solução:** Ícone e texto agora em Box com flexbox para melhor alinhamento

#### 3. **Renomeação: "Clientes" → "Leitores"**
- **Status:** ✅ Concluído
- **Descrição:** Todas as referências visuais de "Cliente" foram substituídas por "Leitor"
- **Arquivos modificados:**
  - `src/pages/ClientesPage.js` → `src/pages/LeitoresPage.js` (renomeado)
  - `src/App.js` (import e rota)
  - `src/components/Layout.js` (menu)
  - `src/pages/EmprestimosPage.js` (labels e placeholders)
  - `src/pages/ClubeDeLeituraPage.js` (campos de formulário)
  - `src/pages/NotaFiscalPage.js` (cabeçalhos e textos)
- **Nota:** Backend mantém nome `clientes` para compatibilidade. Apenas UI foi alterada.

#### 4. **PWA: Instalação Corrigida**
- **Status:** ✅ Concluído
- **Descrição:** Service Worker agora é copiado corretamente para o build
- **Arquivos modificados:**
  - `package.json` (postbuild script)
  - `public/service-worker.js` (versão do cache atualizada)
- **Solução:** Script postbuild agora copia service-worker.js para a pasta build

#### 5. **Cache Busting Implementado**
- **Status:** ✅ Concluído
- **Descrição:** Nova versão do cache força atualização em todos os dispositivos
- **Arquivos modificados:**
  - `public/service-worker.js`
- **Mudança:** `CACHE_NAME: 'cei-v1'` → `'cei-v2.1.0'`
- **Impacto:** Dispositivos com versão antiga receberão atualização automática

---

## 📋 Resumo de Melhorias

### Experiência do Usuário
- ✅ Terminologia mais adequada: "Leitor" em vez de "Cliente"
- ✅ Interface mais limpa e organizada
- ✅ Layout mobile corrigido (Registrar Leitura Completa)
- ✅ Separação clara: Notas Fiscais apenas para administração

### Técnico
- ✅ PWA instalável funcionando corretamente
- ✅ Cache busting para forçar atualizações
- ✅ Service Worker v2.1.0 ativo
- ✅ Build otimizado: 394.29 kB (gzipped)

---

## 🚀 Deploy

**URL:** https://cei-controle-escolar.surge.sh  
**Data:** 08/01/2026  
**Arquivos:** 111 files, 186.5 MB  
**Status:** ✅ Sucesso

---

## 📱 Instruções para Atualização

### Para usuários em dispositivos já configurados:

1. **Limpar cache do navegador:**
   - Chrome/Edge: Ctrl + Shift + Del → "Cached images and files"
   - Mobile: Configurações → Apps → Chrome → Limpar dados

2. **Forçar atualização:**
   - Desktop: Ctrl + F5
   - Mobile: Fechar app e reabrir

3. **Reinstalar PWA (se necessário):**
   - Desinstalar versão antiga
   - Acessar https://cei-controle-escolar.surge.sh
   - Instalar novamente quando solicitado

### Para novos usuários:
- Basta acessar https://cei-controle-escolar.surge.sh
- Aceitar instalação do PWA quando aparecer o prompt

---

## 🔍 Verificação Pós-Deploy

Após atualizar, verifique:

- [ ] Menu "Leitores" aparece no lugar de "Clientes"
- [ ] SuperAdmin vê "Notas Fiscais (ISS)" no menu
- [ ] Escolas NÃO vêem "Notas Fiscais" no menu
- [ ] Dialog "Registrar Leitura Completa" está formatado corretamente
- [ ] PWA pode ser instalado em dispositivos móveis
- [ ] Service Worker v2.1.0 está ativo (Console → Application → Service Workers)

---

## 📝 Notas Técnicas

### Service Worker
```javascript
CACHE_NAME: 'cei-v2.1.0'
```
- Versão anterior será automaticamente removida
- Novo cache será criado ao acessar pela primeira vez
- Prompt de atualização aparecerá se versão antiga estiver em uso

### Estrutura de Rotas (não alterada)
```
/clientes → LeitoresPage (visualmente "Leitores")
```
A rota permanece `/clientes` para não quebrar links salvos.

---

## ⚠️ Problemas Conhecidos

Nenhum problema conhecido nesta versão.

---

## 🎯 Próximos Passos (Sugeridos)

1. **Backend Real:** Substituir mock apiService por backend funcional
2. **Registrar Leitura na Devolução:** Integrar registro de leitura no fluxo de devolução de livros
3. **Relatórios Avançados:** Dashboard com gráficos de leitura por leitor
4. **Notificações Push:** Avisos de vencimento de empréstimos via PWA

---

**Desenvolvido por:** GitHub Copilot  
**Modelo:** Claude Sonnet 4.5  
**Data:** 08 de Janeiro de 2026
