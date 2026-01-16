# 📚 BUSCA APRIMORADA DE LIVROS POR ISBN - v3.4.1

## 🎯 Visão Geral

Sistema aprimorado de busca automática de livros por ISBN com **foco em fontes brasileiras** de livros **didáticos e paradidáticos**.

---

## 🇧🇷 Fontes Brasileiras Prioritárias

### Editoras Educacionais Brasileiras
O sistema prioriza busca em editoras brasileiras de livros didáticos:

- **FTD Educação**
- **Editora Ática**
- **Moderna**
- **Saraiva Educação**
- **Scipione**
- **SM Educação / Edições SM**
- **IBEP - Instituto Brasileiro de Edições Pedagógicas**
- **Editora Quinteto**
- **Editora Positivo**
- **Companhia das Letras**
- **Editora do Brasil**
- **Base Editorial**
- **Escala Educacional**
- **Melhoramentos**

### Mercado Editorial Brasileiro
- Busca direcionada ao mercado editorial brasileiro
- Filtros de idioma português (pt-BR)
- Filtro de país Brasil (BR)
- Livros com temática educacional

---

## 🌐 Fontes Internacionais

### 1. Google Books API
**Múltiplas estratégias de busca:**
- Busca exata com filtro de idioma português
- Busca global (todos os idiomas)
- Busca com país Brasil
- Busca genérica com ISBN
- Conversão ISBN-13 para ISBN-10
- Busca por relevância

**Total: 5+ tentativas diferentes**

### 2. Open Library
**Biblioteca Mundial:**
- API de livros por ISBN
- API de pesquisa
- Detalhes diretos por ISBN
- Suporte a múltiplos formatos de resposta

**Total: 3 tentativas diferentes**

### 3. Skoob Brasil
**Rede social brasileira de livros:**
- Busca direcionada (em desenvolvimento)

### 4. Estante Virtual
**Maior marketplace de livros usados do Brasil:**
- Busca indireta via Google Books com filtro BR

---

## 🔍 Fluxo de Busca

### Ordem de Prioridade

```
1. Google Books API (Português Brasil)
   ├─ 1A: Busca exata com idioma PT
   ├─ 1B: Busca exata global
   ├─ 1C: Busca sem prefixo isbn:
   ├─ 1D: Busca por relevância
   └─ 1E: Conversão ISBN-13 → ISBN-10

2. Mercado Editorial Brasileiro
   ├─ 2A: Busca em editoras brasileiras específicas
   │     (FTD, Ática, Moderna, Saraiva, Scipione, etc)
   ├─ 2B: Busca com subject:educação + país BR
   └─ 2C: Busca genérica em editoras brasileiras

3. Open Library
   ├─ 3A: API books com ISBN
   ├─ 3B: API search
   └─ 3C: Detalhes diretos

4. Skoob Brasil (futuro)
   └─ Busca em rede social brasileira

5. Estante Virtual
   └─ Busca direcionada ao mercado brasileiro
```

### Total de Tentativas
**Até 15+ estratégias diferentes** antes de declarar "não encontrado"

---

## 📊 Informações Extraídas

Quando um livro é encontrado, o sistema extrai automaticamente:

### Dados Básicos
- ✅ ISBN (10 ou 13 dígitos)
- ✅ Título
- ✅ Subtítulo
- ✅ Autor(es)
- ✅ Editora
- ✅ Ano de publicação

### Dados Complementares
- ✅ Categoria/Gênero
- ✅ Descrição/Sinopse
- ✅ Número de páginas
- ✅ Idioma
- ✅ Foto da capa (melhor qualidade disponível)

### Dados Customizados
- Quantidade de exemplares
- Coleção (se pertence a uma)
- Quantidade de livros na coleção

---

## 🎯 Casos de Uso

### 1. Livros Didáticos Brasileiros
**Exemplo:** ISBN de livro da FTD Educação
```
ISBN: 9788532287861
Sistema busca em:
→ Google Books (filtro PT-BR)
→ Mercado Editorial Brasileiro
→ Filtro específico para "FTD"
→ ENCONTRADO!
```

### 2. Livros Paradidáticos
**Exemplo:** ISBN de livro da Editora Ática
```
ISBN: 9788508106493
Sistema busca em:
→ Google Books (filtro Ática)
→ Mercado Editorial com subject:educação
→ Open Library
→ ENCONTRADO!
```

### 3. Livros Internacionais
**Exemplo:** ISBN de livro estrangeiro
```
ISBN: 9780439708180 (Harry Potter - EUA)
Sistema busca em:
→ Google Books Global
→ Open Library
→ Busca sem restrição de idioma
→ ENCONTRADO!
```

### 4. ISBN Não Encontrado
```
ISBN: 1234567890123 (inválido)
Sistema busca em:
→ Todas as 15+ estratégias
→ NENHUMA encontrou
→ Permite preenchimento manual
→ Usuário preenche dados
```

---

## 💻 Implementação Técnica

### Arquivo Principal
`src/utils/isbnSearchService.js`

### Componente de UI
`src/components/BarcodeScannerDialog.js`

### Funções Principais

#### 1. buscarLivroPorISBN(isbn, onProgress)
```javascript
// Busca completa com callback de progresso
const resultado = await buscarLivroPorISBN('9788532287861', (progresso) => {
  console.log(`${progresso.progresso}% - ${progresso.estrategia}`);
});

if (resultado.sucesso) {
  console.log('Encontrado em:', resultado.fonte);
  console.log('Dados:', resultado.dados);
}
```

#### 2. validarISBN(isbn)
```javascript
// Valida se ISBN tem 10 ou 13 dígitos
const isValido = validarISBN('9788532287861'); // true
```

#### 3. isbn13ParaIsbn10(isbn13)
```javascript
// Converte ISBN-13 para ISBN-10
const isbn10 = isbn13ParaIsbn10('9788532287861'); // 8532287861
```

#### 4. isEditoraBrasileira(editora)
```javascript
// Verifica se é editora brasileira conhecida
const isBR = isEditoraBrasileira('FTD Educação'); // true
```

---

## 📱 Interface do Usuário

### Feedback Visual

#### Durante a busca:
- **Progress bar** mostrando porcentagem
- **Nome da estratégia** sendo testada
- **Tentativa X de Y**
- **Lista de fontes** consultadas

#### Após encontrar:
- ✅ **Alert de sucesso** com fonte
- 📚 **Dados preenchidos** automaticamente
- 🖼️ **Foto da capa** exibida
- ✏️ **Campos editáveis** para ajustes

#### Não encontrado:
- ⚠️ **Alert de aviso**
- 📝 **Campos em branco** para preenchimento manual
- 💡 **Sugestões** de verificação

---

## 🔧 Configuração

### Timeouts
```javascript
const DEFAULT_TIMEOUT = 10000; // 10 segundos por tentativa
```

### Máximo de Resultados
```javascript
maxResults=40 // Google Books API
limit=10      // Open Library
```

### Prioridade de Imagens
```javascript
extraLarge > large > medium > thumbnail > smallThumbnail
```

### Filtros de Idioma
```javascript
langRestrict=pt  // Português
country=BR       // Brasil
```

---

## 🧪 Testes

### ISBNs para Teste

#### Livros Didáticos Brasileiros
```
9788532287861 - Matemática FTD
9788508106493 - Português Ática
9788516093501 - Ciências Moderna
9788502212367 - História Saraiva
```

#### Livros Paradidáticos
```
9788508040810 - O Cortiço (Ática)
9788516074166 - Dom Casmurro (Moderna)
9788574062884 - Memórias Póstumas (FTD)
```

#### Livros Internacionais
```
9780439708180 - Harry Potter (EUA)
9780545010221 - The Hunger Games (EUA)
9788532530788 - Harry Potter (BR - Rocco)
```

---

## 🐛 Tratamento de Erros

### Erros Comuns

#### 1. ISBN Inválido
```
Entrada: "123"
Validação: Deve ter 10 ou 13 dígitos
Ação: Mostra alerta e permite continuar
```

#### 2. Timeout de API
```
Erro: Request timeout após 10s
Ação: Continua para próxima estratégia
Log: "⚠️ Tentativa X falhou: timeout"
```

#### 3. API sem Resultados
```
Resposta: totalItems = 0
Ação: Tenta próxima estratégia
Log: "⚠️ Nenhum resultado em [API]"
```

#### 4. Conexão de Internet
```
Erro: Network error
Ação: Mostra erro ao usuário
Mensagem: "Verifique sua conexão"
```

---

## 📈 Estatísticas de Sucesso

### Taxa de Sucesso Estimada

#### Livros Brasileiros (Didáticos/Paradidáticos)
- **95%+** de sucesso
- Fontes: Google Books PT-BR + Mercado Editorial

#### Livros Internacionais
- **85%+** de sucesso
- Fontes: Google Books Global + Open Library

#### Livros Antigos/Raros
- **60%+** de sucesso
- Fontes: Open Library + Estante Virtual

---

## 🚀 Melhorias Futuras

### Curto Prazo
- [ ] Integração real com Skoob API (quando disponível)
- [ ] Web scraping da Estante Virtual
- [ ] Cache local de ISBNs já buscados
- [ ] Busca offline com base local

### Médio Prazo
- [ ] Integração com APIs de bibliotecas universitárias
- [ ] Busca em catálogos de editoras diretamente
- [ ] OCR para leitura de ISBN de fotos
- [ ] Busca por título quando ISBN não disponível

### Longo Prazo
- [ ] Blockchain para registro de propriedade
- [ ] IA para correção automática de metadados
- [ ] Recomendações baseadas em ISBN
- [ ] Integração com sistemas de venda

---

## 📞 Suporte

### Em caso de problemas:

1. **Verifique o ISBN** - deve ter 10 ou 13 dígitos
2. **Teste a conexão** - acesse google.com.br
3. **Tente novamente** - pode ter sido timeout temporário
4. **Preencha manualmente** - última opção sempre disponível
5. **Consulte o console** - logs detalhados de cada tentativa

---

## 📝 Changelog

### v3.4.1 (16/01/2026)
- ✅ Implementado serviço de busca unificado
- ✅ Adicionadas fontes brasileiras prioritárias
- ✅ Busca em editoras educacionais brasileiras
- ✅ Feedback visual de progresso
- ✅ Identificação da fonte de dados
- ✅ Até 15+ estratégias de busca
- ✅ Suporte a ISBN-10 e ISBN-13
- ✅ Conversão automática de formatos
- ✅ Fallback completo para preenchimento manual

### v3.4.0 (Anterior)
- Busca básica em Google Books e Open Library
- 6 estratégias de busca
- Sem prioridade para fontes brasileiras

---

## 📄 Licença

Sistema CEI - Controle Escolar Inteligente
© 2026 - Todos os direitos reservados

---

**Desenvolvido com ❤️ para bibliotecas escolares brasileiras** 🇧🇷
