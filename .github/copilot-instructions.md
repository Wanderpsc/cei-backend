# Instruções do projeto CEI

## Stack e arquitetura
- Este projeto é um sistema web de biblioteca escolar em React + Node/Express.
- O frontend fica na raiz do projeto e usa React Scripts.
- O backend de pagamentos está em `server.js` e usa Express, Mercado Pago e e-mails.
- Preserve a estrutura atual de componentes, páginas, serviços e contexto antes de refatorar.

## Como trabalhar
- Prefira correções pequenas e específicas em vez de reescrever módulos inteiros.
- Mantenha compatibilidade com o fluxo atual do sistema e com dados já existentes.
- Verifique se mudanças em UI, autenticação, sincronização ou pagamentos exigem atualização de documentação.
- Antes de alterar comportamentos sensíveis, procure o ponto de origem do dado e a regra vigente.

## Build e validação
- Frontend: `npm run build`
- Iniciar app: `npm start`
- Testes (quando existirem): `npm test -- --watchAll=false`
- Se a mudança atingir backend, valide também com o fluxo relacionado do processo afetado.

## Convenções do código
- Faça ajustes compatíveis com o padrão atual do projeto em português e com nomes semânticos.
- Evite duplicar lógica e mantenha utilitários reutilizáveis.
- Quando mexer em autenticação, sessão, dados de usuários ou integração financeira, revise impacto em segurança e persistência.
- Documente mudanças relevantes em arquivos Markdown já existentes quando o comportamento for complexo.

## Objetivo geral
- Ajudar o agente do VS Code a manter o sistema estável, coerente com a estrutura existente e pronto para uso em produção.
