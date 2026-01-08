# 🧾 Sistema de Emissão de Notas Fiscais de Serviço (ISS)

## 📋 Visão Geral

Sistema completo para emissão de Notas Fiscais de Serviço com cálculo automático de ISS (Imposto Sobre Serviços), integrado aos dados cadastrais da instituição e clientes.

---

## ✨ Funcionalidades Principais

### 1. **Emissão de Notas Fiscais**

#### Dados Automáticos do Prestador:
- Nome da instituição (escola)
- CNPJ
- Endereço completo
- Cidade e Estado (para cálculo do ISS municipal)

**Obs:** Os dados são carregados automaticamente do cadastro da escola.

#### Dados do Tomador (Cliente):
- Seleção de cliente cadastrado no sistema
- Nome completo
- CPF/CNPJ
- Endereço

#### Informações do Serviço:
- **Descrição do Serviço**: Campo texto para detalhar o serviço prestado
  - Padrão: "Serviços de biblioteca escolar - mensalidade"
  - Editável conforme necessidade
  
- **Valor do Serviço**: Valor bruto do serviço em R$
  
- **Alíquota do ISS**: Percentual do imposto
  - Padrão: 2% (serviços educacionais)
  - Editável de 0% a 5%
  - Varia conforme município e tipo de serviço

- **Observações**: Campo livre para informações adicionais

#### Cálculos Automáticos:
- **Valor do ISS**: Calculado automaticamente (Valor × Alíquota)
- **Valor Líquido**: Valor do serviço - ISS

---

### 2. **Listagem e Controle**

#### Tabela de Notas Emitidas:
- Número sequencial da nota
- Data de emissão
- Nome do cliente
- Descrição do serviço
- Valores discriminados (Serviço, ISS, Líquido)
- Ações (Visualizar e Imprimir)

#### Filtros:
- Escolas veem apenas suas notas
- Super Admin vê todas as notas

---

### 3. **Visualização e Impressão**

#### Documento Completo com:
- **Cabeçalho**: Título e número da nota
- **Data de Emissão**: Data e hora automáticas
- **Prestador do Serviço**: Dados completos da instituição
- **Tomador do Serviço**: Dados completos do cliente
- **Discriminação do Serviço**: Descrição detalhada
- **Quadro de Valores**:
  - Valor Total do Serviço
  - (-) ISS (com percentual)
  - Valor Líquido da Nota
- **Observações**: Se houver
- **Rodapé**: Identificação do sistema

#### Formato Profissional:
- Layout limpo e organizado
- Pronto para impressão
- Adequado para apresentação fiscal
- Sem valor fiscal oficial (controle interno)

---

### 4. **Dashboard Financeiro**

#### Cards de Resumo:
- **Total Emitido**: Soma de todas as notas em R$
- **Total ISS Retido**: Soma do ISS de todas as notas
- **Notas Emitidas**: Quantidade total de notas

---

## 🔧 Como Usar

### Cenário 1: Emitir Nota Fiscal para Cliente
1. Acesse "Notas Fiscais (ISS)" no menu
2. Clique em "Emitir Nova Nota Fiscal"
3. Verifique os dados do prestador (sua escola)
4. Selecione o cliente na lista
5. Edite a descrição do serviço se necessário
6. Informe o valor do serviço
7. Confirme/ajuste a alíquota do ISS
8. Adicione observações (opcional)
9. Clique em "Emitir Nota Fiscal"

### Cenário 2: Visualizar Nota Emitida
1. Acesse "Notas Fiscais (ISS)"
2. Localize a nota na tabela
3. Clique no ícone "Visualizar" (👁️)
4. Veja o documento completo formatado

### Cenário 3: Imprimir Nota
1. Acesse "Notas Fiscais (ISS)"
2. Localize a nota na tabela
3. Clique no ícone "Imprimir" (🖨️)
4. OU abra a visualização e clique em "Imprimir"
5. Configure a impressora
6. Imprima o documento

### Cenário 4: Relatório Mensal de ISS
1. Acesse "Notas Fiscais (ISS)"
2. Visualize os cards de resumo no topo
3. **Total ISS Retido** = valor a recolher ao município
4. Use a tabela para conferência detalhada
5. Imprima as notas necessárias para comprovação

---

## 📊 Estrutura de Dados

### Nota Fiscal:
```json
{
  "id": 1,
  "numero": 1,
  "dataEmissao": "2026-01-07T12:00:00.000Z",
  "instituicaoId": 1,
  "prestadorNome": "Escola ABC",
  "prestadorCnpj": "12.345.678/0001-90",
  "prestadorEndereco": "Rua das Flores, 123",
  "prestadorCidade": "São Paulo",
  "prestadorEstado": "SP",
  "clienteId": 1,
  "clienteNome": "João Silva",
  "clienteCpf": "123.456.789-00",
  "clienteEndereco": "Av. Principal, 456",
  "descricaoServico": "Serviços de biblioteca escolar - mensalidade",
  "valorServico": 100.00,
  "aliquotaISS": 2,
  "valorISS": 2.00,
  "valorLiquido": 98.00,
  "observacoes": ""
}
```

---

## 💡 Informações Importantes

### Sobre o ISS (Imposto Sobre Serviços):
- É um **imposto municipal**
- Incide sobre prestação de serviços
- Alíquota varia conforme:
  - Município onde o serviço é prestado
  - Tipo de serviço prestado
  - Legislação local específica

### Alíquotas Comuns:
- **Serviços Educacionais**: 2% a 5%
- **Consulte a legislação do seu município** para a alíquota correta

### Recolhimento:
- O prestador deve recolher o ISS ao município
- Prazo conforme legislação municipal
- Use o campo "Total ISS Retido" para controle

### Importante:
⚠️ **Este sistema NÃO emite Nota Fiscal Eletrônica (NF-e) oficial**

É um sistema de **controle interno** para:
- Organização financeira
- Cálculo de impostos
- Comprovação de serviços
- Gestão de receitas

Para emissão oficial de NF-e, utilize:
- Sistema da Prefeitura Municipal
- Contador habilitado
- Software homologado pela Prefeitura

---

## 🎯 Benefícios

### Para Instituições:
- ✅ Controle total de serviços prestados
- ✅ Cálculo automático de ISS
- ✅ Histórico completo de emissões
- ✅ Facilita apuração mensal de impostos
- ✅ Documentação organizada

### Para Clientes:
- ✅ Comprovante detalhado do serviço
- ✅ Valores discriminados claramente
- ✅ Documento imprimível
- ✅ Transparência nos cálculos

### Para Contabilidade:
- ✅ Relatórios consolidados
- ✅ Valores separados (Serviço e ISS)
- ✅ Rastreabilidade completa
- ✅ Dados prontos para declarações

---

## 📈 Relatórios Disponíveis

### Dashboard Principal:
- Total de receita bruta (valor dos serviços)
- Total de ISS a recolher
- Quantidade de notas emitidas

### Tabela Detalhada:
- Todas as notas com valores individuais
- Ordenação por data
- Filtro por instituição (automático)

### Exportação:
- Impressão individual de cada nota
- Impressão do relatório completo (use Ctrl+P na página)

---

## 🔐 Segurança e Permissões

### Acesso:
- **Escolas**: Veem apenas suas próprias notas
- **Super Admin**: Acesso a todas as notas do sistema

### Dados Protegidos:
- Informações cadastrais das instituições
- Dados pessoais dos clientes
- Valores financeiros
- Histórico completo

### Armazenamento:
- Dados salvos localmente (localStorage)
- Backup automático a cada alteração
- Persistência entre sessões

---

## 🛠️ Arquivos do Sistema

### Novos Arquivos:
1. **NotaFiscalPage.js** (componente principal)
   - Interface de emissão
   - Listagem de notas
   - Visualização e impressão

### Arquivos Modificados:
1. **DataContext.js**
   - Método: `adicionarNotaFiscal()`
   - Estado: `notasFiscais`
   - Persistência no localStorage

2. **App.js**
   - Rota: `/notas-fiscais`

3. **Layout.js**
   - Menu: "Notas Fiscais (ISS)"

---

## 📞 Suporte Fiscal

### Dúvidas sobre ISS?
- Consulte a Secretaria de Finanças do seu município
- Fale com seu contador
- Verifique o site da Prefeitura

### Dúvidas sobre o Sistema?
- Acesse a documentação completa
- Entre em contato com o suporte técnico

---

## ⚖️ Observações Legais

1. Este sistema é para **controle interno** apenas
2. NÃO substitui a Nota Fiscal Eletrônica oficial
3. Consulte sempre um contador profissional
4. Mantenha-se regular com suas obrigações fiscais
5. A responsabilidade pela emissão oficial e recolhimento de impostos é do prestador

---

## 🚀 Próximas Melhorias (Planejadas)

- [ ] Filtros por período (mês/ano)
- [ ] Exportação para Excel/PDF
- [ ] Gráficos de receita mensal
- [ ] Integração com sistemas oficiais de NF-e
- [ ] Envio de nota por email ao cliente
- [ ] Cancelamento de notas emitidas
- [ ] Relatório anual consolidado

---

**Versão:** 2.2  
**Data:** Janeiro 2026  
**Desenvolvido por:** Equipe CEI  
**Módulo:** Gestão Financeira e Fiscal
