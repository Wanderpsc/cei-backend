# 🏗️ ARQUITETURA DO SISTEMA CEI v3.3.1
## Controle Escolar Inteligente - Biblioteca

**Última Atualização:** 08/01/2026  
**Versão:** 3.3.1 - Seleção de Leitor Corrigida

---

## 📊 VISÃO GERAL DO SISTEMA

### Tipo de Sistema
- **PWA (Progressive Web App)** - Aplicação Web Progressiva
- **SPA (Single Page Application)** - Aplicação de Página Única
- **Multi-tenant** - Múltiplas instituições no mesmo sistema

### Modelo de Negócio
- **SaaS (Software as a Service)** - Software como Serviço
- **Licenciamento por assinatura mensal**
- **Notas Fiscais emitidas para escolas que adquirem licenças**

---

## 🎯 PERFIS DE USUÁRIO

### 1. SuperAdmin (Desenvolvedor/Proprietário)
**Acesso:** Gerenciamento global do sistema
- ✅ Gerenciar todas as instituições/escolas
- ✅ Configurar planos e preços
- ✅ Financeiro administrativo (recebimentos)
- ✅ Emitir notas fiscais para escolas (venda de licenças)
- ✅ Ativar/desativar instituições
- ✅ Diagrama do sistema e documentação técnica
- ✅ Visualizar consolidado de todas as escolas
- ❌ NÃO gerencia livros, leitores ou empréstimos diretamente

**Dashboard SuperAdmin:**
- Card: Gerenciar Escolas (total de instituições cadastradas)
- Card: Financeiro Admin (recebimentos de licenças)
- Card: Configurar Planos (gestão de produtos/serviços)

### 2. Cliente/Escola (Administrador da Instituição)
**Acesso:** Operações da biblioteca
- ✅ Cadastrar e gerenciar livros
- ✅ Cadastrar e gerenciar patrimônio
- ✅ Cadastrar e gerenciar leitores
- ✅ Registrar empréstimos e devoluções
- ✅ Clube de leitura e gamificação
- ✅ Relatórios da biblioteca
- ✅ Busca avançada de livros
- ✅ Financeiro (pagamentos de mensalidade ao SuperAdmin)
- ❌ NÃO acessa dados de outras instituições
- ❌ NÃO gerencia planos ou configura preços
- ❌ NÃO vê diagrama técnico do sistema

**Dashboard Cliente:**
- Card: Livros (total de livros cadastrados)
- Card: Patrimônio (total de itens patrimoniais)
- Card: Leitores (total de leitores cadastrados)
- Card: Empréstimos (total de empréstimos ativos)
- Card: Devoluções (empréstimos ativos para devolução)
- Card: Clube de Leitura (gamificação)
- Card: Relatórios (estatísticas gerais)
- Card: Relatórios Livros (relatórios específicos)
- Card: Busca (busca avançada)
- Card: Financeiro (pagamentos de mensalidade)

---

## 📦 ESTRUTURA DE DADOS

### Entidades Principais

#### 1. Instituições
```javascript
{
  id: string,
  nomeInstituicao: string,
  cidade: string,
  estado: string,
  licenca: 'ativo' | 'expirado' | 'inativo',
  planoAtual: string,
  valorMensal: number,
  dataExpiracao: date,
  statusFinanceiro: 'em_dia' | 'atrasado' | 'bloqueado_financeiro',
  dataCadastro: date
}
```

#### 2. Livros (por instituição)
```javascript
{
  id: string,
  instituicaoId: string,
  isbn: string, // Obrigatório - busca primeiro
  titulo: string,
  autor: string,
  editora: string,
  anoPublicacao: number,
  categoria: string, // Select com 24 opções
  quantidade: number, // Quantidade total de exemplares
  colecao: string, // Nome da coleção (se pertence)
  qtdLivrosColecao: number, // Quantidade de livros na coleção
  codigoIdentificacao: string, // LIV000001, LIV000002... (sequencial)
  foto: string, // URL da capa (Google Books API)
  dataCadastro: date
}
```

#### 3. Leitores (por instituição)
```javascript
{
  id: string,
  instituicaoId: string,
  nome: string,
  cpf: string,
  telefone: string,
  email: string,
  codigoIdentificacao: string, // LEIT000001, LEIT000002... (sequencial)
  ativo: boolean,
  dataCadastro: date
}
```

#### 4. Empréstimos (por instituição)
```javascript
{
  id: string,
  instituicaoId: string,
  livroId: string,
  clienteId: string,
  dataEmprestimo: date,
  dataDevolucao: date,
  dataRenovacao: date, // Última renovação
  observacoes: string,
  status: 'ativo' | 'devolvido' | 'renovado'
}
```

#### 5. Patrimônio (por instituição)
```javascript
{
  id: string,
  instituicaoId: string,
  descricao: string,
  categoria: string,
  quantidade: number,
  valor: number,
  dataCadastro: date
}
```

#### 6. Notas Fiscais (SuperAdmin → Escolas)
```javascript
{
  id: string,
  instituicaoId: string, // Escola que comprou a licença
  numeroNota: string,
  dataEmissao: date,
  valorTotal: number,
  descricao: string, // Ex: "Licença mensal - Plano Premium"
  status: 'emitida' | 'cancelada',
  tipoPagamento: string,
  dataPagamento: date
}
```
**⚠️ IMPORTANTE:** Notas Fiscais são para venda de licenças às escolas, NÃO para leitores!

---

## 🔄 FLUXOS PRINCIPAIS

### 1. Cadastro de Livro (ISBN-First)
```
1. Usuário clica em "Adicionar Livro"
2. Sistema abre formulário com ISBN em primeiro lugar (obrigatório)
3. Usuário digita ISBN
4. Sistema busca na Google Books API (pt-BR prioritário)
5. Sistema preenche automaticamente todos os campos
6. Sistema busca foto da capa (prioridade: extraLarge > large > medium > thumbnail)
7. Sistema gera código sequencial (LIV000001, LIV000002...)
8. Usuário ajusta campos adicionais:
   - Quantidade de exemplares
   - Coleção (se pertence)
   - Quantidade de livros na coleção
   - Categoria (select com 24 opções)
9. Sistema salva livro
```

### 2. Cadastro de Leitor
```
1. Usuário clica em "Adicionar Leitor"
2. Usuário preenche dados (nome, CPF, telefone, email)
3. Sistema gera código sequencial (LEIT000001, LEIT000002...)
4. Sistema salva leitor
```

### 3. Empréstimo de Livro (2 Etapas)
```
ETAPA 1 - Selecionar Livro:
1. Usuário digita ISBN do livro
2. Sistema busca livro
3. Sistema calcula disponibilidade (total - emprestados)
4. Sistema exibe card do livro com informações

ETAPA 2 - Selecionar Leitor:
5. Usuário busca leitor por nome ou CPF
6. Sistema exibe lista de leitores (busca em tempo real)
7. Usuário clica no card do leitor
8. Sistema exibe alerta verde "✅ Leitor selecionado"
9. Usuário preenche datas (empréstimo e devolução prevista)
10. Usuário adiciona observações (opcional)
11. Sistema registra empréstimo
```

### 4. Devolução/Renovação (Busca Automática)
```
1. Usuário acessa página "Devoluções"
2. Usuário digita nome do leitor OU ISBN do livro
3. Sistema busca em tempo real (sem clicar em botão)
4. Sistema exibe empréstimos ativos
5. Usuário clica em "Devolver" ou "Renovar"
6. Sistema confirma ação
7. Sistema atualiza status do empréstimo
```

### 5. Venda de Licença (SuperAdmin → Escola)
```
1. SuperAdmin cadastra instituição
2. SuperAdmin define plano e valor mensal
3. Sistema registra primeira venda
4. SuperAdmin emite Nota Fiscal para a escola
5. Escola recebe acesso ao sistema
6. Todo mês, SuperAdmin emite nova Nota Fiscal
```

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
- **React 18** - Framework JavaScript
- **React Router v6** - Navegação entre páginas
- **Material-UI v5 (MUI)** - Componentes visuais
- **React Context API** - Gerenciamento de estado global
- **Axios** - Cliente HTTP
- **Service Worker** - Cache e PWA

### APIs Externas
- **Google Books API** - Busca de livros por ISBN
  - Estratégia dual: pt-restricted primeiro, depois global
  - Fetch de capas com fallback de qualidade

### Armazenamento
- **localStorage** - Persistência local dos dados
- **Service Worker Cache** - Cache de recursos estáticos
- **Versionamento de Cache** - cei-v3.3.1

### Hospedagem
- **Surge.sh** - Hosting de arquivos estáticos
- **Domain:** cei-controle-escolar.surge.sh
- **HTTPS:** Certificado automático

### Ferramentas de Build
- **Create React App** - Scaffolding
- **Webpack** - Bundler
- **Babel** - Transpilador

---

## 📁 ESTRUTURA DE ARQUIVOS

```
CEI/
├── public/
│   ├── index.html          # HTML principal com cache busting
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Service Worker v3.3.1
│
├── src/
│   ├── App.js              # Componente raiz com rotas
│   ├── index.js            # Entry point
│   ├── index.css           # Estilos globais
│   │
│   ├── components/         # Componentes reutilizáveis
│   │   ├── AvisoLicenca.js           # Alerta de vencimento
│   │   ├── BarcodeScannerDialog.js   # Form ISBN-first
│   │   ├── ContratoModal.js          # Exibição de contrato
│   │   ├── InstallPWA.js             # Prompt de instalação PWA
│   │   ├── Layout.js                 # Layout com menu lateral
│   │   ├── ProtectedRoute.js         # Proteção de rotas
│   │   ├── SyncStatus.js             # Status de sincronização
│   │   └── TermoDoacao.js            # Termo de doação de livros
│   │
│   ├── context/            # Contextos React
│   │   ├── DataContext.js            # Estado global dos dados
│   │   └── LicenseContext.js         # Controle de licenças
│   │
│   ├── hooks/              # Hooks customizados
│   │   └── useOnlineStatus.js        # Detecção de conectividade
│   │
│   ├── pages/              # Páginas da aplicação
│   │   ├── AtivarLicencaPage.js      # Ativação de licença
│   │   ├── BuscaPage.js              # Busca avançada
│   │   ├── CadastroEscolaPage.js     # Cadastro de instituição
│   │   ├── ClubeDeLeituraPage.js     # Clube de leitura
│   │   ├── ConfigurarPlanosPage.js   # Config. planos (SuperAdmin)
│   │   ├── DashboardPage.js          # Dashboard (multi-perfil)
│   │   ├── DiagramaSistemaPage.js    # Diagrama técnico
│   │   ├── DevolucaoPage.js          # Devoluções (busca real-time)
│   │   ├── EmprestimosPage.js        # Empréstimos (ISBN-first)
│   │   ├── FinanceiroAdminPage.js    # Financeiro (SuperAdmin)
│   │   ├── FinanceiroPage.js         # Financeiro (Cliente)
│   │   ├── GerenciarEscolasPage.js   # Gestão instituições
│   │   ├── LeitoresPage.js           # CRUD leitores
│   │   ├── LimparDuplicatasPage.js   # Limpeza de dados
│   │   ├── LivrosPage.js             # CRUD livros
│   │   ├── LoginPage.js              # Autenticação
│   │   ├── NotaFiscalPage.js         # Emissão NF (SuperAdmin)
│   │   ├── PagamentoPage.js          # Integração pagamentos
│   │   ├── PagamentoSucessoPage.js   # Confirmação pagamento
│   │   ├── PatrimonioPage.js         # CRUD patrimônio
│   │   ├── RelatoriosLivrosPage.js   # Relatórios de livros
│   │   ├── RelatoriosPage.js         # Relatórios gerais
│   │   └── TermosDeUsoPage.js        # Termos e condições
│   │
│   └── utils/              # Utilitários
│       ├── apiService.js             # Serviços de API
│       └── licenseManager.js         # Gestão de licenças
│
├── build/                  # Compilado para produção
└── [Docs Markdown]         # Documentação técnica
```

---

## 🔒 CONTROLE DE ACESSO

### Rotas SuperAdmin
- `/gerenciar-escolas` - Gestão de instituições
- `/financeiro-admin` - Recebimentos de licenças
- `/configurar-planos` - Configuração de produtos
- `/diagrama-sistema` - Documentação técnica
- `/nota-fiscal` - Emissão de NF para escolas

### Rotas Cliente/Escola
- `/livros` - Gestão de acervo
- `/patrimonio` - Gestão de patrimônio
- `/clientes` - Gestão de leitores
- `/emprestimos` - Registro de empréstimos
- `/devolucoes` - Devoluções e renovações
- `/clube-leitura` - Gamificação
- `/relatorios` - Estatísticas
- `/relatorios-livros` - Relatórios específicos
- `/busca` - Busca avançada
- `/financeiro` - Pagamentos de mensalidade

### Rotas Públicas
- `/login` - Autenticação
- `/termos-de-uso` - Termos e condições

---

## 🎨 COMPONENTES PRINCIPAIS

### 1. Layout.js
- Menu lateral com navegação
- Quick access bar (5 botões principais)
- Header com título da página
- Responsivo (desktop e mobile)

### 2. DataContext.js
- Estado global da aplicação
- Funções CRUD para todas as entidades
- Filtros por instituição (multi-tenant)
- Sincronização com localStorage
- Funções:
  - `adicionarLivro()`, `editarLivro()`, `excluirLivro()`
  - `adicionarCliente()`, `editarCliente()`, `excluirCliente()`
  - `adicionarEmprestimo()`, `devolverLivro()`, `renovarEmprestimo()`
  - `adicionarPatrimonio()`, `editarPatrimonio()`, `excluirPatrimonio()`

### 3. BarcodeScannerDialog.js
- Formulário ISBN-first
- Busca na Google Books API
- Auto-preenchimento de campos
- Busca de foto da capa
- Validação de campos

### 4. ProtectedRoute.js
- Proteção de rotas por perfil
- Redirecionamento de usuários não autorizados
- Verificação de licença ativa

---

## 📈 FEATURES IMPLEMENTADAS v3.3.1

### ✅ Cadastro de Livros
- [x] ISBN obrigatório e primeiro campo
- [x] Busca automática na Google Books API
- [x] Auto-preenchimento de dados
- [x] Busca de capa com fallback de qualidade
- [x] Campos adicionais: quantidade, coleção, categoria
- [x] Código sequencial automático (LIV000001...)
- [x] Exibição de código como chip na tabela

### ✅ Cadastro de Leitores
- [x] Formulário completo (nome, CPF, telefone, email)
- [x] Código sequencial automático (LEIT000001...)
- [x] Exibição de código como chip na tabela
- [x] Filtros de busca

### ✅ Empréstimos
- [x] Fluxo em 2 etapas (livro → leitor)
- [x] Busca de livro por ISBN
- [x] Cálculo de disponibilidade automático
- [x] Busca de leitor com filtro em tempo real
- [x] Seleção de leitor com feedback visual
- [x] Cadastro rápido de leitor no fluxo
- [x] Validação de datas

### ✅ Devoluções
- [x] Busca em tempo real (sem botão)
- [x] Busca por nome do leitor OU ISBN do livro
- [x] Busca inteligente de ISBN (remove caracteres especiais)
- [x] Exibição de empréstimos ativos
- [x] Devolução de livros
- [x] Renovação de empréstimos (7, 14, 21, 30 dias)
- [x] Cálculo de dias de atraso
- [x] Console logs para debug

### ✅ Dashboard
- [x] Cards diferentes por perfil (SuperAdmin vs Cliente)
- [x] Dashboard SuperAdmin: Gestão de instituições e financeiro
- [x] Dashboard Cliente: Operações da biblioteca
- [x] Todos os cards clicáveis
- [x] Alertas de vencimento de licença
- [x] Alertas de inadimplência

### ✅ PWA e Performance
- [x] Service Worker v3.3.1
- [x] Cache busting automático
- [x] Instalação como app
- [x] Funciona offline
- [x] Versionamento de cache

---

## 🚀 MELHORIAS FUTURAS

### Planejado
- [ ] Backend com Node.js + PostgreSQL
- [ ] Autenticação JWT
- [ ] Sincronização em nuvem
- [ ] Upload de fotos de leitores
- [ ] QR Code para empréstimos rápidos
- [ ] Notificações push (vencimentos)
- [ ] Relatórios em PDF
- [ ] Integração com Mercado Pago (pagamentos)
- [ ] API REST para integrações
- [ ] Backup automático

---

## 📝 NOTAS IMPORTANTES

### Notas Fiscais
**⚠️ REGRA DE NEGÓCIO:**
- Notas Fiscais são emitidas pelo **SuperAdmin** para as **Escolas**
- Representam a venda de licenças/assinaturas do sistema
- **NÃO** são para leitores ou usuários finais
- Cada escola recebe NF mensalmente pela renovação da licença

### Códigos Sequenciais
- Livros: `LIV000001`, `LIV000002`, ...
- Leitores: `LEIT000001`, `LEIT000002`, ...
- Gerados automaticamente baseado no `.length` do array
- Formato: 6 dígitos com `padStart(6, '0')`

### Disponibilidade de Livros
- Calculada em tempo real: `quantidade - emprestados`
- Emprestados = empréstimos com status 'ativo'
- Exibida na busca de livros para empréstimo

### Multi-tenancy
- Cada instituição tem seus próprios dados isolados
- Filtros por `instituicaoId` em todas as queries
- SuperAdmin vê todas as instituições
- Cliente vê apenas sua instituição

---

## 📞 SUPORTE TÉCNICO

**Desenvolvedor:** Wander Pires Silva Coelho  
**Email:** wanderpsc@gmail.com  
**Versão Atual:** 3.3.1  
**Data:** 08/01/2026

---

## 📄 LICENÇA

**Propriedade Intelectual:** Wander Pires Silva Coelho  
**Todos os direitos reservados © 2026**
