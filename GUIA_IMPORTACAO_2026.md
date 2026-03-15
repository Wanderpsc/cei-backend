# 📚 Guia de Importação de Turmas e Alunos - 2026
## CEI - Controle Escolar Inteligente

**Data:** 12 de Março de 2026  
**Instituição:** CETI Desembargador Amaral  
**Total:** 11 turmas | 327 alunos

---

## 📋 Dados a Importar

### Turmas
1. ✅ EFR-FUND II ANOS FINAIS INT – 9º ANO – I-A (30 alunos)
2. ✅ EFR-FUND II ANOS FINAIS INT – 9º ANO – I-B (30 alunos)
3. ✅ EMTPADM-ENF-EMP – 1ª SÉRIE – INTEGRAL – I-B (26 alunos)
4. ✅ EMTPDES-SIS – 1ª SÉRIE – INTEGRAL – I-B (28 alunos)
5. ✅ EMTPFARM – 1ª SÉRIE – INTEGRAL – I-B (26 alunos)
6. ✅ EMTPADMI – 2ª SÉRIE – PROPEDEUTICO – I-B (32 alunos)
7. ✅ EMTPDES-SIS – 2ª SÉRIE – INTEGRAL – I-B (30 alunos)
8. ✅ EMTPMARK-DIG – 2ª SÉRIE – INTEGRAL – I-A (33 alunos)
9. ✅ EMRINTEGRAL – 3ª SÉRIE – I-A (30 alunos)
10. ✅ EMTPDES-SIS – 3ª SÉRIE – INTEGRAL – I-A (22 alunos)
11. ✅ EMTPDES-SIS – 3ª SÉRIE – INTEGRAL – I-B (20 alunos)

---

## 🚀 Como Importar

### Opção 1: Interface Web (Recomendado) ⭐

**Passo a passo:**

1. **Abra o sistema CEI**
   - Vá para: `http://localhost:3000`
   - Faça login com suas credenciais

2. **Abra o importador**
   - URL: `file:///seu-caminho/importar-turmas-alunos-2026.html`
   - Ou copie o arquivo para a pasta `public/` do projeto

3. **Etapa 1: Verificar Dados**
   - Você verá a lista de todas as turmas e alunos
   - Valide se os dados estão corretos
   - Clique em "Próximo ➜"

4. **Etapa 2: Selecionar Turmas**
   - Por padrão, todas estão selecionadas
   - Você pode desselecionar turmas específicas se desejar
   - Use "Selecionar Todas" ou "Desselecionar Todas" para gerenciar
   - Clique em "Próximo ➜"

5. **Etapa 3: Confirmar Importação**
   - Revise o resumo final
   - Certifique-se de que está tudo correto
   - Clique em "✓ Confirmar e Importar"

6. **Etapa 4: Acompanhar Progresso**
   - Você verá o progresso em tempo real
   - Cada turma e aluno será processado
   - Um log detalhado mostra o que está acontecendo
   - Quando terminar, você verá "✅ Importação concluída"

7. **Recarregue o sistema**
   - Pressione F5 ou recarregue a página
   - Vá para "Séries/Turmas" para confirmar

---

### Opção 2: Script Node.js

**Se tiver Node.js instalado:**

```bash
# 1. Abra o terminal na pasta do projeto
cd "caminho/do/projeto"

# 2. Execute o script
node importar-turmas-alunos.cjs
```

**Resultado:**
- Gera arquivo `dados-importacao-2026.json`
- Contém todos os dados estruturados
- Pode ser usado para importação via API

---

### Opção 3: Importação via localStorage (Console)

**Se preferir fazer manualmente:**

1. Abra o navegador e acesse o CEI
2. Pressione **F12** para abrir Developer Tools
3. Vá para a aba **Console**
4. Cole o script abaixo:

```javascript
// Script de importação via console
const dadosImportacao = {
  turmas: [
    // Turmas serão adicionadas aqui
  ],
  alunos: [
    // Alunos serão adicionados aqui
  ]
};

// Salvar turmas
const turmasExistentes = JSON.parse(localStorage.getItem('cei_turmas_academicas') || '[]');
const turmasNovas = [...turmasExistentes, ...dadosImportacao.turmas];
localStorage.setItem('cei_turmas_academicas', JSON.stringify(turmasNovas));

// Salvar alunos
const clientesExistentes = JSON.parse(localStorage.getItem('cei_clientes') || '[]');
const clientesNovos = [...clientesExistentes, ...dadosImportacao.alunos];
localStorage.setItem('cei_clientes', JSON.stringify(clientesNovos));

console.log('✅ Importação concluída!');
console.log('Turmas adicionadas:', dadosImportacao.turmas.length);
console.log('Alunos adicionados:', dadosImportacao.alunos.length);
```

⚠️ **Nota:** Esta opção requer colar todo o JSON dos alunos, o que é tedioso. Use a Opção 1 ou 2.

---

## 🎯 Pré-requisitos

- ✅ Sistema CEI rodando (`npm start`)
- ✅ Estar logado com conta administrativa
- ✅ Instituição criada (CETI Desembargador Amaral)
- ✅ Navegador atualizado

---

## ✅ Checklist de Validação

Após importar, **verifique se:**

- [ ] Todas as 11 turmas aparecem em "Séries/Turmas"
- [ ] Total de 327 alunos cadastrados em "Leitores"
- [ ] Cada aluno está vinculado à turma correta
- [ ] CPFs foram importados sem formatação incorreta
- [ ] Nenhuma duplicata foi criada
- [ ] Status de todos está como "ativo"

---

## 🔧 Troubleshooting

### Problema: "Erro ao importar - localStorage não disponível"
**Solução:** 
- Abra o CEI em uma aba normal (não em modo incógnito)
- Limpe o cache do navegador (Ctrl+Shift+Del)
- Tente novamente

### Problema: "Alguns alunos não foram importados"
**Solução:**
- Verifique se há duplicatas de CPF na sua base
- Alunos com CPF inválido podem ser pulados
- Revise o log de erros

### Problema: "As turmas aparecem, mas sem alunos"
**Solução:**
- Recarregue a página (F5)
- Verifique se os alunos aparecem em "Leitores"
- Execute a importação novamente

### Problema: "Quero desfazer a importação"
**Solução:**
- Abra Developer Tools (F12)
- Vá para "Application → LocalStorage"
- Delete as chaves `cei_turmas_academicas` e `cei_clientes`
- Recarregue a página

---

## 📊 Estrutura dos Dados

### JSON de Turma
```json
{
  "id": "turma-1",
  "nome": "EFR-FUND II ANOS FINAIS INT – 9º ANO – I-A",
  "serie": "9º",
  "instituicaoId": 1,
  "dataCriacao": "2026-03-12T10:00:00.000Z",
  "status": "ativo"
}
```

### JSON de Aluno/Leitor
```json
{
  "id": "aluno-turma-1-0",
  "nome": "ALICIA BISPO ALVES",
  "cpf": "08439365330",
  "turmaId": "turma-1",
  "instituicaoId": 1,
  "tipo": "leitor",
  "status": "ativo",
  "dataCadastro": "2026-03-12T10:00:00.000Z"
}
```

---

## 📁 Arquivos Necessários

Você deve ter os seguintes arquivos nesta pasta:

- ✅ `importar-turmas-alunos-2026.html` - Interface web
- ✅ `importar-turmas-alunos.cjs` - Script Node.js
- ✅ `GUIA_IMPORTACAO_2026.md` - Este arquivo
- ✅ `dados-importacao-2026.json` - (será gerado após rodar script)

---

## 💡 Dicas

1. **Fazer backup antes:** Copie seu localStorage antes de importar
   ```javascript
   const backup = localStorage.getItem('cei_clientes');
   console.save(backup, 'backup-alunos.json');
   ```

2. **Importar gradualmente:** Se tiver problemas, importe de 2-3 turmas por vez

3. **Sincronizar com Supabase:** Após local, execute:
   ```bash
   npm run sync
   ```

4. **Gerar relatório:** Após importar, verifique em Relatórios:
   - Relatórios → Usuários/Leitores
   - Você verá 327 leitores cadastrados

---

## 🎓 Informações das Turmas

### 9º Ano (Fundamental II)
- **Turma I-A:** 30 alunos
- **Turma I-B:** 30 alunos

### 1ª Série (Técnico)
- **Administração (Integral):** 26 alunos
- **Design de Sistemas (Integral):** 28 alunos
- **Farmácia (Integral):** 26 alunos

### 2ª Série (Técnico)
- **Administração (Propedêutico):** 32 alunos
- **Design de Sistemas (Integral):** 30 alunos
- **Marketing Digital (Integral):** 33 alunos

### 3ª Série (Técnico)
- **Ensino Regular (Integral):** 30 alunos
- **Design de Sistemas (Integral):** 22 alunos
- **Design de Sistemas (Integral):** 20 alunos

---

## 📞 Suporte

Caso encontre problemas:

1. **Verifique o console do navegador** (F12 → Console)
   - Procure por mensagens de erro
   - Copie o erro completo

2. **Contacte o desenvolvedor:**
   - Email: wanderpsc@gmail.com
   - WhatsApp: (89) 98139-8723

3. **Crie uma issue no GitHub:**
   - Descreva o problema
   - Inclua print do erro
   - Descreva quais turmas têm problema

---

## ✨ Próximas Etapas Após Importação

1. ✅ Validar dados importados
2. ✅ Gerar relatório de leitores
3. ✅ Configurar empréstimos e devoluções
4. ✅ Ativar clube de leitura
5. ✅ Configurar notificações automáticas

---

**Versão:** 1.0  
**Última Atualização:** 12 de Março de 2026  
**Desenvolvedor:** Wander Pires Silva Coelho  
**Status:** ✅ Pronto para Produção
