# 📚 Gestão Avançada de Livros - CEI Sistema

## 🎯 Novas Funcionalidades Implementadas

### 1. **Classificação de Livros por Tipo**

#### Tipos Disponíveis:
- **Didático**: Livros usados em sala de aula com programa curricular definido
- **Paradidático**: Livros complementares de leitura e pesquisa

#### Campos Adicionados:
- **Tipo de Livro** (obrigatório): Seletor para escolher entre Didático ou Paradidático
- **Ano de Vigência** (condicional): Campo exclusivo para livros didáticos
  - Indica até que ano o livro será utilizado
  - Usado para controle de renovação de material didático
  - Alertas automáticos para livros vencidos ou próximos do vencimento

---

### 2. **Sistema de Baixa de Livros**

#### Motivos de Baixa:
1. **Doação**
   - Transferência do livro para outra instituição ou pessoa
   - Gera termo de doação oficial para assinatura
   - Campos obrigatórios:
     - Nome completo do donatário
     - CPF/CNPJ do donatário
     - Endereço (opcional)
     - Telefone (opcional)

2. **Término de Vigência**
   - Para livros didáticos fora da validade
   - Livros desatualizados que não serão mais utilizados
   - Não requer dados de terceiros

#### Como Dar Baixa:
1. Acesse a página "Livros"
2. Localize o livro na lista
3. Clique no botão de baixa (ícone de download ⬇️)
4. Escolha o motivo da baixa
5. Preencha os dados necessários
6. Confirme a operação

**Obs:** Livros com baixa ficam marcados mas não são removidos do sistema, permitindo rastreabilidade.

---

### 3. **Termo de Doação**

Sistema completo de geração de documento legal para formalizar doações de livros.

#### Conteúdo do Termo:
- Identificação completa do DOADOR (instituição)
- Identificação completa do DONATÁRIO (pessoa/instituição)
- Descrição detalhada do bem doado:
  - Título, autor, ISBN, editora, ano
  - Tipo do livro (Didático/Paradidático)
  - Quantidade de exemplares
- Cláusulas legais:
  - Objeto da doação
  - Natureza da doação (pura, simples e irrevogável)
  - Aceitação pelo donatário
  - Disposições gerais
- Espaços para assinaturas:
  - Doador
  - Donatário
  - 2 Testemunhas

#### Como Gerar:
1. Execute a baixa do livro por "Doação"
2. Preencha os dados do donatário
3. Confirme a operação
4. O termo será exibido automaticamente
5. Clique em "Imprimir para Assinaturas"
6. Imprima 2 vias para assinatura

**Formato:** Documento formatado em estilo oficial com fonte Times New Roman, pronto para impressão.

---

### 4. **Relatórios Avançados de Livros**

Nova página dedicada a relatórios detalhados com 4 abas:

#### 📊 Aba 1: Livros Didáticos
- Listagem completa de todos os livros didáticos ativos
- Colunas:
  - Título, Autor, ISBN, Editora
  - Ano de Publicação
  - **Ano de Vigência**
  - Quantidade
  - **Status** (Vigente/Vence este ano/Vencido)
- Indicadores visuais:
  - ✅ Verde: Vigente
  - ⚠️ Amarelo: Vence este ano
  - ❌ Vermelho: Vencido

#### 📚 Aba 2: Livros Paradidáticos
- Listagem completa de todos os livros paradidáticos ativos
- Colunas:
  - Título, Autor, ISBN, Editora
  - Categoria
  - Quantidade
  - Localização

#### ⏰ Aba 3: Controle de Vigência
- **Seção 1: Livros com Vigência Vencida**
  - Lista todos os livros didáticos com ano de vigência anterior ao ano atual
  - Fundo vermelho para destaque
  - Recomendação: Dar baixa ou substituir

- **Seção 2: Livros Vencendo Este Ano**
  - Lista livros didáticos com vigência no ano corrente
  - Fundo amarelo para alerta
  - Recomendação: Planejar substituição

- **Alertas no Topo da Página:**
  - Alerta vermelho se houver livros vencidos
  - Alerta amarelo se houver livros vencendo

#### 📦 Aba 4: Baixas
- Histórico completo de todas as baixas realizadas
- Informações:
  - Título e Autor
  - Tipo do livro
  - Motivo da baixa (Doação/Término de Vigência)
  - Data da baixa
  - Nome do donatário (se doação)
  - Observações

---

### 5. **Dashboards e Estatísticas**

#### Cards de Resumo:
- **Total de Livros**: Quantidade total no acervo
- **Didáticos**: Quantidade de livros didáticos ativos
- **Paradidáticos**: Quantidade de livros paradidáticos ativos
- **Baixas**: Total de livros com baixa registrada

---

## 🔧 Alterações Técnicas

### Arquivos Modificados:
1. **LivrosPage.js**
   - Adicionados campos: tipo, anoVigencia
   - Sistema de baixa com modal
   - Integração com TermoDoacao
   - Indicadores visuais de status na tabela

2. **DataContext.js**
   - Novo método: `darBaixaLivro(id, motivo, detalhes)`
   - Mantém histórico de baixas no objeto do livro

### Novos Arquivos:
1. **TermoDoacao.js** (componente)
   - Gerador de termo de doação formatado
   - Pronto para impressão
   - Campos personalizáveis

2. **RelatoriosLivrosPage.js** (página)
   - Sistema completo de relatórios
   - 4 abas especializadas
   - Estatísticas em cards
   - Alertas automáticos

3. **App.js & Layout.js**
   - Nova rota: `/relatorios-livros`
   - Novo menu: "Relatórios de Livros"

---

## 📋 Fluxo de Uso Completo

### Cenário 1: Cadastrar Livro Didático
1. Acesse "Livros" → "Novo Livro"
2. Preencha título, autor, etc.
3. Selecione "Tipo: Didático"
4. Informe o "Ano de Vigência" (ex: 2026)
5. Salve

### Cenário 2: Doar Livro
1. Acesse "Livros"
2. Localize o livro
3. Clique no botão de baixa (⬇️)
4. Escolha "Doação"
5. Preencha nome e CPF do donatário
6. Confirme
7. Imprima o termo (2 vias)
8. Colha assinaturas

### Cenário 3: Verificar Livros Vencidos
1. Acesse "Relatórios de Livros"
2. Veja alertas no topo
3. Clique na aba "Vigência"
4. Verifique livros vencidos (fundo vermelho)
5. Planeje substituição

### Cenário 4: Relatório de Paradidáticos
1. Acesse "Relatórios de Livros"
2. Clique na aba "Paradidáticos"
3. Visualize todo o acervo
4. Clique em "Imprimir Relatório"

---

## ✅ Benefícios

### Para Bibliotecários:
- ✅ Controle rigoroso de vigência de livros didáticos
- ✅ Alertas automáticos para renovação
- ✅ Processo formal de doação com documentação
- ✅ Histórico completo de movimentações

### Para Gestores:
- ✅ Relatórios detalhados por tipo de livro
- ✅ Visibilidade de gastos futuros (livros vencendo)
- ✅ Conformidade legal em doações
- ✅ Rastreabilidade total do acervo

### Para Auditoria:
- ✅ Termo de doação oficial
- ✅ Registro de baixas com justificativa
- ✅ Datas e responsáveis identificados
- ✅ Documentação imprimível

---

## 🎨 Indicadores Visuais

| Elemento | Cor | Significado |
|----------|-----|-------------|
| Chip "Didático" | Azul | Livro didático |
| Chip "Paradidático" | Cinza | Livro paradidático |
| Chip "Vigente" | Verde | Ano de vigência válido |
| Chip "Vence este ano" | Amarelo | Atenção: planejar substituição |
| Chip "Vencido" | Vermelho | Urgente: substituir ou dar baixa |
| Chip "Ativo" | Verde | Livro disponível |
| Chip "Baixa: Doação" | Laranja | Livro doado |
| Linha cinza | Cinza | Livro com baixa registrada |

---

## 🔐 Dados Armazenados

### Estrutura do Livro:
```json
{
  "id": 1,
  "titulo": "Matemática 9º Ano",
  "autor": "João Silva",
  "isbn": "978-1234567890",
  "tipo": "Didático",
  "anoVigencia": "2026",
  "baixa": {
    "data": "2026-01-07T12:00:00.000Z",
    "motivo": "Doação",
    "donatario": "Escola Municipal ABC",
    "cpfDonatario": "12.345.678/0001-90",
    "observacoes": "Doação para biblioteca comunitária"
  }
}
```

---

## 📞 Suporte

Para dúvidas ou problemas:
- Acesse a documentação completa no sistema
- Verifique os tutoriais em vídeo (em breve)
- Entre em contato com o suporte técnico

---

**Versão:** 2.1  
**Data:** Janeiro 2026  
**Desenvolvido por:** Equipe CEI
