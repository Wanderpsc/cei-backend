# Deploy do CEI - Controle Escolar Inteligente

## 🚀 Deploy com Surge

### Pré-requisitos
```bash
# Instalar Surge globalmente (se ainda não tiver)
npm install -g surge
```

### Primeira vez - Criar conta no Surge
```bash
surge login
# Ou para criar nova conta:
surge
```

### Deploy do Sistema

#### Opção 1: Comando único
```bash
npm run deploy
```

#### Opção 2: Passo a passo
```bash
# 1. Gerar build de produção
npm run build

# 2. Fazer deploy
surge build cei-controle-escolar.surge.sh
```

### URL do Sistema
Após o deploy, o sistema estará disponível em:
**https://cei-controle-escolar.surge.sh**

### Atualizações
Para atualizar o sistema online, basta executar novamente:
```bash
npm run deploy
```

### Domínio Personalizado (Opcional)
Se você tiver um domínio próprio, pode configurar:
```bash
surge build seu-dominio.com
```

## 📝 Notas Importantes

1. **LocalStorage**: Os dados são armazenados no navegador do usuário
2. **Primeira Execução**: O SuperAdmin padrão é criado automaticamente
   - Login: `superadmin`
   - Senha: `matriz@2025`
3. **Segurança**: Para produção real, recomenda-se implementar backend com banco de dados

## 🛠️ Comandos Úteis

```bash
# Verificar versão do Surge
surge --version

# Ver lista de projetos
surge list

# Remover projeto
surge teardown cei-controle-escolar.surge.sh
```

## 👤 Desenvolvido por
**Wander Pires Silva Coelho** ®
Todos os direitos reservados
