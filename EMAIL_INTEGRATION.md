# 📧 Guia de Integração de E-mail - CEI Sistema

## ⚠️ Situação Atual

O sistema CEI atualmente **simula** o envio de e-mails, exibindo as informações na tela após o cadastro. Para enviar e-mails reais, é necessário integrar um serviço de backend.

## 🎯 Opções de Implementação

### **Opção 1: EmailJS (Mais Simples - Frontend)**

**Vantagens:**
- ✅ Sem necessidade de backend
- ✅ Configuração rápida (10-15 minutos)
- ✅ Gratuito até 200 e-mails/mês
- ✅ Funciona direto do React

**Limitações:**
- ❌ Expõe chaves no frontend (mitigável com templates públicos)
- ❌ Limite de envios no plano gratuito

**Implementação:**

1. Criar conta em [EmailJS](https://www.emailjs.com/)

2. Instalar a biblioteca:
```bash
npm install @emailjs/browser
```

3. Atualizar `CadastroEscolaPage.js`:
```javascript
import emailjs from '@emailjs/browser';

// Após o sucesso do cadastro
const enviarEmailConfirmacao = async () => {
  const templateParams = {
    to_email: formData.email,
    instituicao: formData.nomeInstituicao,
    cnpj: formData.cnpj,
    telefone: formData.telefone,
    login: formData.loginAdmin,
    plano: planoSelecionado?.nome,
    valor: planoSelecionado?.valor,
    dias: planoSelecionado?.dias
  };

  try {
    await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      templateParams,
      'YOUR_PUBLIC_KEY'
    );
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
};

// Chamar após adicionarInstituicao
handleSubmit = () => {
  // ... código existente ...
  const novaInstituicao = adicionarInstituicao(dadosInstituicao);
  enviarEmailConfirmacao(); // ADICIONAR AQUI
  setSucesso(true);
};
```

4. Criar template no EmailJS com variáveis:
```html
Olá {{instituicao}},

Seu cadastro foi realizado com sucesso!

📋 Dados da Instituição:
- Nome: {{instituicao}}
- CNPJ: {{cnpj}}
- Telefone: {{telefone}}

🔐 Credenciais de Acesso:
- Login: {{login}}
- Senha: (enviada separadamente por segurança)

💰 Plano Contratado:
- Plano: {{plano}}
- Valor: R$ {{valor}}/mês
- Duração: {{dias}} dias

Aguarde a aprovação do administrador.

Atenciosamente,
Equipe CEI
```

---

### **Opção 2: SendGrid (Profissional)**

**Vantagens:**
- ✅ Robusto e confiável
- ✅ 100 e-mails/dia gratuitos
- ✅ APIs avançadas
- ✅ Templates dinâmicos

**Limitações:**
- ❌ Requer backend (Node.js, PHP, Python)
- ❌ Mais complexo de configurar

**Implementação:**

1. Criar backend Node.js simples:
```javascript
// server.js
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/enviar-email-cadastro', async (req, res) => {
  const { email, instituicao, cnpj, login, plano } = req.body;

  const msg = {
    to: email,
    from: 'seu-email@verificado.com',
    subject: 'Cadastro realizado - CEI Sistema',
    html: `
      <h2>Olá ${instituicao},</h2>
      <p>Seu cadastro foi realizado com sucesso!</p>
      <h3>Dados da Instituição:</h3>
      <ul>
        <li><strong>Nome:</strong> ${instituicao}</li>
        <li><strong>CNPJ:</strong> ${cnpj}</li>
        <li><strong>Login:</strong> ${login}</li>
      </ul>
      <h3>Plano Contratado:</h3>
      <p>${plano.nome} - R$ ${plano.valor}/mês</p>
    `
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3002, () => {
  console.log('Servidor rodando na porta 3002');
});
```

2. Chamar do React:
```javascript
const enviarEmailConfirmacao = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/enviar-email-cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        instituicao: formData.nomeInstituicao,
        cnpj: formData.cnpj,
        login: formData.loginAdmin,
        plano: planoSelecionado
      })
    });
    const data = await response.json();
    console.log('E-mail enviado:', data.success);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

---

### **Opção 3: Firebase Functions (Serverless)**

**Vantagens:**
- ✅ Sem servidor para gerenciar
- ✅ Escala automaticamente
- ✅ Integra com Firebase Auth
- ✅ Plano gratuito generoso

**Limitações:**
- ❌ Requer configuração do Firebase
- ❌ Curva de aprendizado inicial

**Implementação:**

1. Instalar Firebase CLI:
```bash
npm install -g firebase-tools
firebase init functions
```

2. Criar função:
```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com',
    pass: 'sua-senha-app'
  }
});

exports.enviarEmailCadastro = functions.https.onCall(async (data, context) => {
  const mailOptions = {
    from: 'CEI Sistema <seu-email@gmail.com>',
    to: data.email,
    subject: 'Cadastro realizado com sucesso',
    html: `
      <h2>Bem-vindo ao CEI, ${data.instituicao}!</h2>
      <p>Seu cadastro foi realizado com sucesso.</p>
      <p><strong>Login:</strong> ${data.login}</p>
      <p><strong>Plano:</strong> ${data.plano}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

3. Chamar do React:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const enviarEmail = httpsCallable(functions, 'enviarEmailCadastro');

enviarEmail({
  email: formData.email,
  instituicao: formData.nomeInstituicao,
  login: formData.loginAdmin,
  plano: planoSelecionado.nome
});
```

---

## 🏆 Recomendação

Para o CEI Sistema, recomendo a **Opção 1 (EmailJS)** pelos seguintes motivos:

1. ✅ **Rápida implementação** - Funciona em minutos
2. ✅ **Sem backend necessário** - Mantém a simplicidade do projeto
3. ✅ **Gratuito para uso inicial** - 200 e-mails/mês é suficiente para começar
4. ✅ **Fácil migração futura** - Se precisar de mais recursos, pode migrar para SendGrid/Firebase

---

## 📝 Próximos Passos

1. Escolher uma das opções acima
2. Criar conta no serviço escolhido
3. Configurar templates de e-mail
4. Integrar código no `CadastroEscolaPage.js`
5. Testar envio de e-mails
6. Fazer deploy da versão atualizada

---

## 📞 Suporte

Se precisar de ajuda para implementar qualquer uma dessas opções, é só avisar!

**Wander Pires Silva Coelho ®**  
CEI - Controle Escolar Inteligente
