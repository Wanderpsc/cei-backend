const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');
const https = require('https');
require('dotenv').config();

// Sistema de segurança e proteção anti-pirataria
const {
  initializeSecurity,
  securityMiddleware,
  encryptSensitiveData,
  decryptSensitiveData,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  SOFTWARE_SIGNATURE
} = require('./security');

const app = express();

// Inicializar sistema de segurança
initializeSecurity();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://cei-controle-escolar.surge.sh',
    'https://cei-sistema-biblioteca.surge.sh',
    'https://wanderpsc.github.io'
  ],
  credentials: true
}));
app.use(express.json());
app.use(securityMiddleware); // Middleware de segurança

// Verificar variáveis de ambiente críticas
console.log('🔧 Verificando configurações...');
console.log('MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ FALTANDO');
console.log('MERCADOPAGO_PUBLIC_KEY:', process.env.MERCADOPAGO_PUBLIC_KEY ? '✅ Configurado' : '❌ FALTANDO');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Não configurado');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Configurar Mercado Pago SDK v2
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.error('❌ ERRO CRÍTICO: MERCADOPAGO_ACCESS_TOKEN não está configurado!');
  console.error('Configure as variáveis de ambiente no Render.');
}

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});
const payment = new Payment(client);

const purchaseNotificationSent = new Set();

const EMAIL_OWNER = process.env.OWNER_NOTIFICATION_EMAIL || 'wanderpsc@gmail.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || EMAIL_OWNER;
const SUPPORT_WHATSAPP = process.env.SUPPORT_WHATSAPP || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const OWNER_WHATSAPP = (process.env.OWNER_WHATSAPP || '5589981398723').replace(/\D/g, '');
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || '';
const DEMO_LEAD_DEDUP_WINDOW_MS = 60 * 60 * 1000;

const hasSmtpConfig = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_FROM
);

const emailTransporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

async function enviarEmailConfirmacaoCompraENota(payload) {
  if (!emailTransporter) {
    console.warn('⚠️ SMTP não configurado. E-mail de confirmação não enviado.');
    return { success: false, skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  }

  const {
    compradorEmail,
    compradorNome,
    instituicaoNome,
    planoNome,
    valor,
    metodoPagamento,
    dataPagamento,
    transacaoId,
    notaNumero,
    notaSerie,
    notaCompetencia,
    notaChaveControle,
    loginAdmin
  } = payload;

  const dataFormatada = dataPagamento
    ? new Date(dataPagamento).toLocaleString('pt-BR')
    : new Date().toLocaleString('pt-BR');

  const valorFormatado = Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const assunto = `CEI | Pagamento confirmado e Nota Fiscal emitida - ${instituicaoNome || 'Nova instituição'}`;

  const orientacoesHtml = `
    <h3>✅ Próximos passos para funcionamento do programa</h3>
    <ol>
      <li>Acesse o sistema em <a href="${FRONTEND_URL}">${FRONTEND_URL}</a>.</li>
      <li>Faça login com o usuário administrador da instituição.</li>
      <li>Cadastre livros, leitores e configure preferências da biblioteca.</li>
      <li>Acesse relatórios e financeiro para acompanhamento completo.</li>
    </ol>
    <h3>🛟 Assistência e suporte</h3>
    <p><strong>E-mail de suporte:</strong> ${SUPPORT_EMAIL}</p>
    ${SUPPORT_WHATSAPP ? `<p><strong>WhatsApp:</strong> ${SUPPORT_WHATSAPP}</p>` : ''}
  `;

  const htmlBase = `
    <p>Olá,</p>
    <p>Seu pagamento foi confirmado e a nota fiscal foi gerada automaticamente no CEI.</p>
    <h3>📦 Resumo da compra</h3>
    <ul>
      <li><strong>Instituição:</strong> ${instituicaoNome || '-'}</li>
      <li><strong>Responsável:</strong> ${compradorNome || '-'}</li>
      <li><strong>Plano:</strong> ${planoNome || '-'}</li>
      <li><strong>Valor:</strong> ${valorFormatado}</li>
      <li><strong>Método de pagamento:</strong> ${(metodoPagamento || '-').toUpperCase()}</li>
      <li><strong>Data/hora:</strong> ${dataFormatada}</li>
      <li><strong>ID da transação:</strong> ${transacaoId || '-'}</li>
    </ul>
    <h3>🧾 Nota Fiscal</h3>
    <ul>
      <li><strong>Número:</strong> ${notaNumero || '-'}</li>
      <li><strong>Série:</strong> ${notaSerie || '-'}</li>
      <li><strong>Competência:</strong> ${notaCompetencia || '-'}</li>
      <li><strong>Chave de controle:</strong> ${notaChaveControle || '-'}</li>
    </ul>
    ${loginAdmin ? `<p><strong>Login administrador:</strong> ${loginAdmin}</p>` : ''}
    ${orientacoesHtml}
    <hr />
    <p>CEI - Controle Escolar Inteligente</p>
  `;

  const textoBase = `
Pagamento confirmado e nota fiscal emitida no CEI.

Instituição: ${instituicaoNome || '-'}
Responsável: ${compradorNome || '-'}
Plano: ${planoNome || '-'}
Valor: ${valorFormatado}
Método: ${(metodoPagamento || '-').toUpperCase()}
Data/Hora: ${dataFormatada}
Transação: ${transacaoId || '-'}

Nota Fiscal
- Número: ${notaNumero || '-'}
- Série: ${notaSerie || '-'}
- Competência: ${notaCompetencia || '-'}
- Chave de controle: ${notaChaveControle || '-'}

Próximos passos:
1) Acesse ${FRONTEND_URL}
2) Faça login no sistema
3) Configure a biblioteca e inicie o uso

Suporte: ${SUPPORT_EMAIL}
${SUPPORT_WHATSAPP ? `WhatsApp: ${SUPPORT_WHATSAPP}` : ''}
  `.trim();

  const destinatarios = [compradorEmail, EMAIL_OWNER]
    .filter(Boolean)
    .map((email) => String(email).trim().toLowerCase())
    .filter((email, index, arr) => arr.indexOf(email) === index);

  await Promise.all(
    destinatarios.map((to) =>
      emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: assunto,
        html: htmlBase,
        text: textoBase
      })
    )
  );

  return { success: true, recipients: destinatarios };
}

function enviarRequisicaoHttps(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let rawData = '';
        response.on('data', (chunk) => {
          rawData += chunk;
        });
        response.on('end', () => {
          resolve({ statusCode: response.statusCode, body: rawData });
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function enviarWhatsAppCallMeBot(texto) {
  if (!OWNER_WHATSAPP || !CALLMEBOT_API_KEY) {
    return { success: false, skipped: true, reason: 'WHATSAPP_NOT_CONFIGURED' };
  }

  const textoCodificado = encodeURIComponent(texto);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${OWNER_WHATSAPP}&text=${textoCodificado}&apikey=${CALLMEBOT_API_KEY}`;
  const response = await enviarRequisicaoHttps(url);

  if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Falha no WhatsApp (status ${response.statusCode}).`);
  }

  return { success: true };
}

async function enviarNotificacaoWhatsAppCompra(payload) {
  const {
    compradorNome,
    compradorEmail,
    instituicaoNome,
    planoNome,
    valor,
    metodoPagamento,
    transacaoId,
    notaNumero,
    notaSerie,
    notaCompetencia,
    notaChaveControle,
    dataPagamento
  } = payload;

  const valorFormatado = Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const dataFormatada = dataPagamento
    ? new Date(dataPagamento).toLocaleString('pt-BR')
    : new Date().toLocaleString('pt-BR');

  const mensagem = [
    '✅ CEI | Nova compra confirmada',
    `👤 Comprador: ${compradorNome || '-'}`,
    `📧 E-mail: ${compradorEmail || '-'}`,
    `🏫 Instituição: ${instituicaoNome || '-'}`,
    `📦 Plano: ${planoNome || '-'}`,
    `💰 Valor: ${valorFormatado}`,
    `💳 Método: ${(metodoPagamento || '-').toUpperCase()}`,
    `🕒 Data/Hora: ${dataFormatada}`,
    `🧾 NF: ${notaNumero || '-'} | Série: ${notaSerie || '-'}`,
    `📅 Competência: ${notaCompetencia || '-'}`,
    `🔐 Chave: ${notaChaveControle || '-'}`,
    `🔁 Transação: ${transacaoId || '-'}`
  ].join('\n');

  return enviarWhatsAppCallMeBot(mensagem);
}

async function enviarNotificacaoWhatsAppAcesso(payload) {
  const { usuario, perfil, instituicao, origem, ip, userAgent } = payload;
  const mensagem = [
    '👁️ CEI | Novo acesso ao sistema',
    `👤 Usuário: ${usuario || '-'}`,
    `🛡️ Perfil: ${perfil || '-'}`,
    `🏫 Instituição: ${instituicao || '-'}`,
    `🌐 Origem: ${origem || '-'}`,
    `🧭 IP: ${ip || '-'}`,
    `🖥️ Agente: ${userAgent || '-'}`,
    `🕒 Data/Hora: ${new Date().toLocaleString('pt-BR')}`
  ].join('\n');

  return enviarWhatsAppCallMeBot(mensagem);
}

async function enviarEmailLeadDemo(payload) {
  if (!emailTransporter) {
    console.warn('⚠️ SMTP não configurado. E-mail de lead demo não enviado.');
    return { success: false, skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  }

  const assunto = `CEI | Novo lead DEMO - ${payload.nomeResponsavel || 'Sem nome'}`;
  const dataFormatada = new Date(payload.capturadoEm || Date.now()).toLocaleString('pt-BR');

  const html = `
    <p>Um novo lead da demonstração foi capturado.</p>
    <h3>Dados do contato</h3>
    <ul>
      <li><strong>Nome:</strong> ${payload.nomeResponsavel || '-'}</li>
      <li><strong>Telefone:</strong> ${payload.telefoneCelular || '-'}</li>
      <li><strong>E-mail:</strong> ${payload.email || '-'}</li>
      <li><strong>Cidade/UF:</strong> ${payload.cidade || '-'} / ${payload.estado || '-'}</li>
      <li><strong>Origem:</strong> ${payload.origemEvento || '-'}</li>
      <li><strong>Dispositivo demo:</strong> ${payload.demoDeviceId || '-'}</li>
      <li><strong>Capturado em:</strong> ${dataFormatada}</li>
      <li><strong>Frontend:</strong> ${payload.origem || '-'}</li>
    </ul>
    <p>Lead criado automaticamente pelo login DEMO do CEI.</p>
  `;

  const text = [
    'Novo lead DEMO capturado no CEI.',
    `Nome: ${payload.nomeResponsavel || '-'}`,
    `Telefone: ${payload.telefoneCelular || '-'}`,
    `E-mail: ${payload.email || '-'}`,
    `Cidade/UF: ${payload.cidade || '-'} / ${payload.estado || '-'}`,
    `Origem: ${payload.origemEvento || '-'}`,
    `Dispositivo: ${payload.demoDeviceId || '-'}`,
    `Capturado em: ${dataFormatada}`,
    `Frontend: ${payload.origem || '-'}`
  ].join('\n');

  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM,
    to: EMAIL_OWNER,
    subject: assunto,
    html,
    text
  });

  return { success: true };
}

async function enviarNotificacaoWhatsAppLeadDemo(payload) {
  const mensagem = [
    '🧪 CEI | Novo lead DEMO',
    `👤 ${payload.nomeResponsavel || '-'}`,
    `📞 ${payload.telefoneCelular || '-'}`,
    `📧 ${payload.email || '-'}`,
    `📍 ${payload.cidade || '-'}-${payload.estado || '-'}`,
    `🧭 Origem: ${payload.origemEvento || '-'}`,
    `🆔 Device: ${payload.demoDeviceId || '-'}`,
    `🕒 ${new Date(payload.capturadoEm || Date.now()).toLocaleString('pt-BR')}`
  ].join('\n');

  return enviarWhatsAppCallMeBot(mensagem);
}

// ==========================================
// BANCO DE DADOS DE LICENÇAS (em memória - use banco real em produção)
// ==========================================
const licensesDB = new Map(); // chave: licenseKey, valor: { instituicaoId, deviceFingerprint, activatedAt, etc }
const sessionsDB = new Map(); // chave: instituicaoId, valor: Map de { deviceFingerprint -> sessionData }
// ✨ NOVA ESTRUTURA: Permite múltiplas sessões simultâneas do mesmo usuário em diferentes dispositivos

/**
 * Atualizar sessão ativa - PERMITE MÚLTIPLOS DISPOSITIVOS
 * Agora cada instituição pode ter múltiplas sessões de diferentes dispositivos simultaneamente
 */
function updateActiveSession(instituicaoId, deviceFingerprint) {
  // Inicializar Map de sessões da instituição se não existir
  if (!sessionsDB.has(instituicaoId)) {
    sessionsDB.set(instituicaoId, new Map());
  }
  
  const institutionSessions = sessionsDB.get(instituicaoId);
  
  // Atualizar ou criar sessão do dispositivo
  institutionSessions.set(deviceFingerprint, {
    deviceFingerprint: deviceFingerprint,
    lastActivity: Date.now(),
    activatedAt: institutionSessions.get(deviceFingerprint)?.activatedAt || Date.now()
  });
  
  console.log(`✅ Sessão ativa para instituição ${instituicaoId} em dispositivo ${deviceFingerprint.substring(0, 8)}...`);
}

/**
 * Remover sessão ativa - remove apenas uma sessão específica
 */
function removeActiveSession(instituicaoId, deviceFingerprint) {
  if (!sessionsDB.has(instituicaoId)) return;
  
  const institutionSessions = sessionsDB.get(instituicaoId);
  institutionSessions.delete(deviceFingerprint);
  
  // Se nenhuma sessão restante, remove a entrada da instituição
  if (institutionSessions.size === 0) {
    sessionsDB.delete(instituicaoId);
  }
  
  console.log(`✅ Sessão removida para instituição ${instituicaoId} no dispositivo ${deviceFingerprint.substring(0, 8)}...`);
}

/**
 * Listar todas as sessões ativas de uma instituição
 */
function getActiveSessions(instituicaoId) {
  const institutionSessions = sessionsDB.get(instituicaoId);
  if (!institutionSessions) return [];
  
  return Array.from(institutionSessions.values());
}

// ==========================================
// ATIVAR LICENÇA EM UM DISPOSITIVO
// ==========================================
app.post('/api/activate-license', async (req, res) => {
  try {
    const { licenseKey, deviceFingerprint, deviceDetails } = req.body;

    console.log('🔑 Tentando ativar licença:', licenseKey);
    console.log('📱 Dispositivo:', deviceFingerprint);

    // Validar código de licença
    if (!licenseKey || licenseKey.length < 10) {
      return res.json({
        success: false,
        reason: 'INVALID_LICENSE_KEY',
        message: 'Código de licença inválido.'
      });
    }

    // Buscar instituição com este código de licença
    // AQUI: Integrar com seu banco de dados real
    // Por enquanto, verificar se é um código válido (formato: XXXX-XXXX-XXXX-XXXX)
    const licensePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!licensePattern.test(licenseKey)) {
      return res.json({
        success: false,
        reason: 'INVALID_FORMAT',
        message: 'Formato de código inválido. Use: XXXX-XXXX-XXXX-XXXX'
      });
    }

    // Simular busca de instituição (substitua por consulta real ao banco)
    const instituicaoId = `INST-${licenseKey.substring(0, 4)}`;

    // ✨ MODIFICADO: Removida restrição que bloqueava login em múltiplos dispositivos
    // Agora permite o mesmo usuário em vários dispositivos simultaneamente
    
    // Salvar licença no banco
    licensesDB.set(licenseKey, {
      instituicaoId: instituicaoId,
      deviceFingerprint: deviceFingerprint,
      deviceDetails: deviceDetails,
      activatedAt: Date.now(),
      lastVerified: Date.now(),
      status: 'active'
    });

    // Criar sessão ativa
    updateActiveSession(instituicaoId, deviceFingerprint);

    console.log('✅ Licença ativada com sucesso');

    res.json({
      success: true,
      instituicaoId: instituicaoId,
      userData: {
        nome: 'Instituição Exemplo', // Buscar do banco
        status: 'ativo'
      },
      instituicao: {
        nome: 'Instituição Exemplo',
        codigo: licenseKey
      }
    });

  } catch (error) {
    console.error('❌ Erro ao ativar licença:', error);
    res.status(500).json({ 
      success: false, 
      reason: 'SERVER_ERROR',
      message: 'Erro no servidor. Tente novamente.' 
    });
  }
});

// ==========================================
// VERIFICAR LICENÇA
// ==========================================
app.post('/api/verify-license', async (req, res) => {
  try {
    const { licenseKey, deviceFingerprint, instituicaoId } = req.body;

    console.log('🔍 Verificando licença:', licenseKey);

    // Buscar licença
    const license = licensesDB.get(licenseKey);

    if (!license) {
      return res.json({
        valid: false,
        reason: 'LICENSE_NOT_FOUND',
        message: 'Licença não encontrada ou revogada.'
      });
    }

    // Verificar se o fingerprint corresponde
    if (license.deviceFingerprint !== deviceFingerprint) {
      return res.json({
        valid: false,
        reason: 'FINGERPRINT_MISMATCH',
        message: 'Esta licença está vinculada a outro dispositivo.'
      });
    }

    // ✨ MODIFICADO: Removida restrição que bloqueava múltiplas sessões
    // Agora permite a mesma licença em vários dispositivos simultaneamente
    
    // Atualizar última verificação
    license.lastVerified = Date.now();
    licensesDB.set(licenseKey, license);

    // Atualizar sessão ativa
    updateActiveSession(instituicaoId, deviceFingerprint);

    console.log('✅ Licença válida');

    res.json({
      valid: true,
      status: license.status,
      lastVerified: license.lastVerified
    });

  } catch (error) {
    console.error('❌ Erro ao verificar licença:', error);
    res.status(500).json({ 
      valid: false, 
      reason: 'SERVER_ERROR',
      message: 'Erro no servidor.' 
    });
  }
});

// ==========================================
// DESATIVAR LICENÇA (LOGOUT)
// ==========================================
app.post('/api/deactivate-license', async (req, res) => {
  try {
    const { licenseKey, deviceFingerprint } = req.body;

    console.log('🔓 Desativando licença:', licenseKey);

    const license = licensesDB.get(licenseKey);

    if (license && license.deviceFingerprint === deviceFingerprint) {
      // ✨ MODIFICADO: Passa deviceFingerprint para remover apenas essa sessão específica
      removeActiveSession(license.instituicaoId, deviceFingerprint);
      console.log('✅ Sessão removida');
    }

    res.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao desativar licença:', error);
    res.json({ success: true }); // Sempre retornar sucesso para não bloquear logout
  }
});

// ==========================================
// REVOGAR LICENÇA (ADMIN)
// ==========================================
app.post('/api/revoke-license', async (req, res) => {
  try {
    const { licenseKey, adminToken } = req.body;

    // VERIFICAR SE É ADMIN (implemente autenticação real)
    if (!adminToken || adminToken !== 'ADMIN_SECRET_TOKEN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    console.log('⚠️  Revogando licença:', licenseKey);

    const license = licensesDB.get(licenseKey);
    if (license) {
      license.status = 'revoked';
      license.revokedAt = Date.now();
      licensesDB.set(licenseKey, license);
      
      // Remover sessão ativa
      removeActiveSession(license.instituicaoId);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao revogar licença:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor.' 
    });
  }
});

// ==========================================
// LISTAR LICENÇAS ATIVAS (ADMIN)
// ==========================================
app.get('/api/active-licenses', async (req, res) => {
  try {
    const { adminToken } = req.query;

    // VERIFICAR SE É ADMIN
    if (!adminToken || adminToken !== 'ADMIN_SECRET_TOKEN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado.'
      });
    }

    const activeLicenses = [];
    
    licensesDB.forEach((license, key) => {
      if (license.status === 'active') {
        const session = sessionsDB.get(license.instituicaoId);
        activeLicenses.push({
          licenseKey: key,
          instituicaoId: license.instituicaoId,
          deviceFingerprint: license.deviceFingerprint,
          activatedAt: license.activatedAt,
          lastVerified: license.lastVerified,
          isOnline: session ? (Date.now() - session.lastActivity < 300000) : false // 5 min
        });
      }
    });

    res.json({
      success: true,
      count: activeLicenses.length,
      licenses: activeLicenses
    });

  } catch (error) {
    console.error('❌ Erro ao listar licenças:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor.' 
    });
  }
});

// ==========================================
// CRIAR PAGAMENTO PIX
// ==========================================
app.post('/api/create-pix-payment', async (req, res) => {
  try {
    const { amount, email, cpf, nome, instituicaoId, plano } = req.body;

    console.log('📱 Criando pagamento PIX...');
    console.log('Valor:', amount);
    console.log('Email:', email);
    console.log('Token configurado:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);

    // Verificar se o Mercado Pago está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
      return res.status(500).json({ 
        success: false, 
        error: 'Mercado Pago não configurado. Configure as variáveis de ambiente no Render.',
        details: 'MERCADOPAGO_ACCESS_TOKEN ausente'
      });
    }

    const body = {
      transaction_amount: parseFloat(amount),
      description: `Sistema CEI - ${plano}`,
      payment_method_id: 'pix',
      payer: {
        email: email,
        first_name: nome,
        identification: {
          type: 'CPF',
          number: cpf
        }
      },
      external_reference: instituicaoId
    };

    // notification_url removido temporariamente para evitar erros
    // O webhook pode ser configurado no painel do Mercado Pago

    console.log('📤 Enviando para Mercado Pago...');
    const response = await payment.create({ body });

    console.log('✅ PIX criado:', response.id);

    res.json({
      success: true,
      payment: {
        id: response.id,
        qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
        qr_code: response.point_of_interaction.transaction_data.qr_code,
        ticket_url: response.point_of_interaction.transaction_data.ticket_url
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar PIX:', error);
    console.error('Detalhes do erro:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.cause?.message || 'Erro desconhecido'
    });
  }
});

// ==========================================
// VERIFICAR STATUS DO PAGAMENTO
// ==========================================
app.get('/api/check-payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await payment.get({ id });
    
    res.json({
      success: true,
      status: response.status,
      status_detail: response.status_detail,
      payment: {
        id: response.id,
        status: response.status,
        amount: response.transaction_amount,
        approved_at: response.date_approved
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==========================================
// CRIAR PAGAMENTO COM CARTÃO
// ==========================================
app.post('/api/create-card-payment', async (req, res) => {
  try {
    const { cardToken, amount, installments, email, nome, cpf, instituicaoId, plano } = req.body;

    console.log('💳 Criando pagamento com cartão...');
    console.log('Valor:', amount);
    console.log('Parcelas:', installments);
    console.log('Token configurado:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);

    // Verificar se o Mercado Pago está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
      return res.status(500).json({ 
        success: false, 
        error: 'Mercado Pago não configurado. Configure as variáveis de ambiente no Render.',
        details: 'MERCADOPAGO_ACCESS_TOKEN ausente'
      });
    }

    const body = {
      transaction_amount: parseFloat(amount),
      token: cardToken,
      description: `Sistema CEI - ${plano}`,
      installments: parseInt(installments),
      // payment_method_id será detectado automaticamente pelo token
      payer: {
        email: email,
        first_name: nome.split(' ')[0] || nome,
        last_name: nome.split(' ').slice(1).join(' ') || nome,
        identification: {
          type: 'CPF',
          number: cpf.replace(/\D/g, '')
        }
      },
      external_reference: instituicaoId,
      statement_descriptor: 'SISTEMA CEI'
    };

    console.log('📤 Enviando para Mercado Pago...');
    console.log('Body (sem token):', JSON.stringify({...body, token: 'HIDDEN'}, null, 2));
    
    const response = await payment.create({ body });

    console.log('✅ Pagamento criado:', response.id);
    console.log('Status:', response.status);
    console.log('Status Detail:', response.status_detail);
    
    if (response.status === 'rejected') {
      console.log('❌ Pagamento rejeitado:', response.status_detail);
      return res.json({
        success: false,
        payment: {
          id: response.id,
          status: response.status,
          status_detail: response.status_detail
        },
        error: getErrorMessage(response.status_detail)
      });
    }

    res.json({
      success: true,
      payment: {
        id: response.id,
        status: response.status,
        status_detail: response.status_detail,
        installments: response.installments,
        amount: response.transaction_amount
      }
    });

  } catch (error) {
    console.error('❌ Erro ao processar cartão:', error);
    console.error('Detalhes do erro:', error.message);
    
    // Extrair mensagem mais específica do erro do Mercado Pago
    let errorMessage = 'Erro ao processar pagamento';
    let errorDetails = error.message;
    
    if (error.cause) {
      console.error('Causa:', JSON.stringify(error.cause, null, 2));
      errorDetails = error.cause.message || JSON.stringify(error.cause);
    }
    
    if (error.message.includes('invalid_token')) {
      errorMessage = 'Token do cartão inválido. Verifique os dados e tente novamente.';
    } else if (error.message.includes('amount')) {
      errorMessage = 'Valor inválido. Tente novamente.';
    } else if (error.message.includes('card')) {
      errorMessage = 'Dados do cartão inválidos. Verifique as informações.';
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: errorDetails
    });
  }
});

// Função auxiliar para mensagens de erro mais amigáveis
function getErrorMessage(statusDetail) {
  const messages = {
    'cc_rejected_insufficient_amount': 'Cartão sem saldo suficiente',
    'cc_rejected_bad_filled_card_number': 'Número do cartão incorreto',
    'cc_rejected_bad_filled_date': 'Data de validade incorreta',
    'cc_rejected_bad_filled_security_code': 'Código de segurança incorreto',
    'cc_rejected_call_for_authorize': 'Entre em contato com sua operadora',
    'cc_rejected_card_disabled': 'Cartão desabilitado',
    'cc_rejected_duplicated_payment': 'Pagamento duplicado',
    'cc_rejected_high_risk': 'Pagamento recusado por segurança',
    'cc_rejected_invalid_installments': 'Parcelamento não disponível',
    'cc_rejected_max_attempts': 'Número máximo de tentativas excedido'
  };
  
  return messages[statusDetail] || 'Pagamento recusado. Verifique os dados do cartão.';
}

// ==========================================
// WEBHOOK - NOTIFICAÇÕES DO MERCADO PAGO
// ==========================================
app.post('/api/webhooks', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('🔔 Webhook recebido:', type);

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const response = await payment.get({ id: paymentId });
      
      console.log('Pagamento ID:', response.id);
      console.log('Status:', response.status);
      console.log('Referência:', response.external_reference);

      if (response.status === 'approved') {
        console.log('✅ PAGAMENTO APROVADO!');
        console.log('Instituição:', response.external_reference);
        
        // AQUI: Você deve ativar a instituição no seu banco de dados
        // await ativarInstituicao(response.external_reference);
        
        // AQUI: Enviar email de confirmação
        // await enviarEmailConfirmacao(response.payer.email);
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).send('Error');
  }
});

// ==========================================
// E-MAILS AUTOMÁTICOS DE COMPRA + NOTA
// ==========================================
app.post('/api/send-purchase-confirmation', async (req, res) => {
  try {
    const {
      compradorEmail,
      transacaoId
    } = req.body || {};

    if (!compradorEmail) {
      return res.status(400).json({
        success: false,
        error: 'E-mail do comprador é obrigatório.'
      });
    }

    if (transacaoId && purchaseNotificationSent.has(transacaoId)) {
      return res.json({
        success: true,
        skipped: true,
        reason: 'ALREADY_SENT'
      });
    }

    const resultEmail = await enviarEmailConfirmacaoCompraENota(req.body || {});

    let resultWhatsApp = { success: false, skipped: true, reason: 'NOT_TRIGGERED' };
    try {
      resultWhatsApp = await enviarNotificacaoWhatsAppCompra(req.body || {});
    } catch (whatsError) {
      console.error('❌ Erro ao enviar notificação WhatsApp da compra:', whatsError.message);
      resultWhatsApp = { success: false, error: whatsError.message };
    }

    if (resultEmail.success && transacaoId) {
      purchaseNotificationSent.add(transacaoId);
    }

    res.json({
      success: true,
      email: resultEmail,
      whatsapp: resultWhatsApp
    });
  } catch (error) {
    console.error('❌ Erro ao enviar confirmações por e-mail:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao enviar e-mails de confirmação.',
      details: error.message
    });
  }
});

app.post('/api/notify-access', async (req, res) => {
  try {
    const {
      usuario,
      perfil,
      instituicao,
      origem
    } = req.body || {};

    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : (forwarded || req.ip || req.connection?.remoteAddress || 'não identificado');

    const userAgent = req.headers['user-agent'] || 'não informado';

    const resultWhatsApp = await enviarNotificacaoWhatsAppAcesso({
      usuario,
      perfil,
      instituicao,
      origem,
      ip,
      userAgent
    });

    res.json({ success: true, whatsapp: resultWhatsApp });
  } catch (error) {
    console.error('❌ Erro ao notificar acesso:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/test-smtp', async (req, res) => {
  try {
    if (!emailTransporter) {
      return res.status(400).json({
        success: false,
        error: 'SMTP não configurado. Defina SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e SMTP_FROM.'
      });
    }

    const destino = (req.body?.email || EMAIL_OWNER || '').trim();
    if (!destino) {
      return res.status(400).json({
        success: false,
        error: 'Informe um e-mail de destino em req.body.email ou configure OWNER_NOTIFICATION_EMAIL.'
      });
    }

    await emailTransporter.verify();

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to: destino,
      subject: '✅ CEI - Teste SMTP concluído',
      text: `Teste SMTP concluído com sucesso em ${new Date().toLocaleString('pt-BR')}.`,
      html: `<p><strong>Teste SMTP concluído com sucesso.</strong></p><p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>`
    });

    return res.json({
      success: true,
      message: 'E-mail de teste enviado com sucesso.',
      to: destino
    });
  } catch (error) {
    console.error('❌ Erro no teste SMTP:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha no teste SMTP.',
      details: error.message
    });
  }
});

app.post('/api/test-email', async (req, res) => {
  try {
    const testToken = process.env.TEST_EMAIL_TOKEN;
    if (testToken) {
      const receivedToken = req.headers['x-test-token'] || req.body?.token;
      if (!receivedToken || receivedToken !== testToken) {
        return res.status(401).json({
          success: false,
          error: 'Token de teste inválido.'
        });
      }
    }

    const compradorEmail = req.body?.compradorEmail || 'comprador.teste@exemplo.com';
    const compradorNome = req.body?.compradorNome || 'Comprador de Teste';
    const instituicaoNome = req.body?.instituicaoNome || 'Instituição de Teste CEI';
    const planoNome = req.body?.planoNome || 'Plano 1 Ano (365 dias)';
    const valor = req.body?.valor ?? 970;
    const metodoPagamento = req.body?.metodoPagamento || 'pix';
    const dataPagamento = req.body?.dataPagamento || new Date().toISOString();
    const transacaoId = req.body?.transacaoId || `TEST-${Date.now()}`;

    const result = await enviarEmailConfirmacaoCompraENota({
      compradorEmail,
      compradorNome,
      instituicaoNome,
      planoNome,
      valor,
      metodoPagamento,
      dataPagamento,
      transacaoId,
      notaNumero: req.body?.notaNumero || 9999,
      notaSerie: req.body?.notaSerie || 'T1',
      notaCompetencia: req.body?.notaCompetencia || new Date().toISOString().slice(0, 7),
      notaChaveControle: req.body?.notaChaveControle || `TEST-KEY-${Date.now()}`,
      loginAdmin: req.body?.loginAdmin || 'admin.teste'
    });

    res.json({
      success: true,
      message: 'E-mails de teste processados.',
      email: result
    });
  } catch (error) {
    console.error('❌ Erro no envio de e-mail de teste:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao enviar e-mails de teste.',
      details: error.message
    });
  }
});

// ==========================================
// ENDPOINTS DO SISTEMA ESCOLAR
// ==========================================

// Banco de dados em memória (temporário - substituir por banco real)
const notificationsDB = [];
const demoLeadsDB = [];
const subjectsDB = [];
const usersDB = [
  {
    id: 1,
    nome: 'Super Administrador',
    login: 'superadmin',
    senha: 'matriz@2025',
    perfil: 'SuperAdmin',
    tipo: 'master',
    instituicaoId: 0
  },
  {
    id: 2,
    nome: 'Wander Pires Silva Coelho',
    login: 'cetidesamaral',
    senha: 'Ceti@2026',
    perfil: 'Admin',
    tipo: 'master',
    instituicaoId: 1,
    email: 'wander@cetidesamaral.edu.br',
    cargo: 'Diretor',
    status: 'ativo',
    dataCriacao: new Date('2024-01-01').toISOString()
  }
];

// POST - Autenticação/Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, senha, username, password } = req.body;
    
    // Aceita tanto login/senha quanto username/password
    const loginUser = login || username;
    const senhaUser = senha || password;
    
    console.log('🔐 Tentativa de login:', loginUser);
    
    if (!loginUser || !senhaUser) {
      return res.status(400).json({
        success: false,
        error: 'Login e senha são obrigatórios'
      });
    }
    
    // Buscar usuário
    const user = usersDB.find(u => u.login === loginUser && u.senha === senhaUser);
    
    if (!user) {
      console.log('❌ Login falhou para:', loginUser);
      return res.status(401).json({
        success: false,
        error: 'Login ou senha inválidos'
      });
    }
    
    console.log('✅ Login bem-sucedido:', user.nome);
    
    // Retornar dados do usuário (sem a senha)
    const { senha: _, ...userSemSenha } = user;
    
    res.json({
      success: true,
      user: userSemSenha,
      token: generateSecureToken() // Usar a função de segurança existente
    });
    
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor ao processar login',
      details: error.message
    });
  }
});

// POST - Registro de usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, login, senha, email, instituicaoId } = req.body;
    
    console.log('📝 Tentativa de registro:', login);
    
    // Validações
    if (!nome || !login || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Nome, login e senha são obrigatórios'
      });
    }
    
    // Verificar se login já existe
    if (usersDB.find(u => u.login === login)) {
      return res.status(400).json({
        success: false,
        error: 'Login já está em uso'
      });
    }
    
    // Criar novo usuário
    const newUser = {
      id: usersDB.length + 1,
      nome,
      login,
      senha, // Em produção, use hash!
      email,
      instituicaoId: instituicaoId || 1,
      perfil: 'Usuario',
      tipo: 'normal',
      status: 'ativo',
      dataCriacao: new Date().toISOString()
    };
    
    usersDB.push(newUser);
    
    console.log('✅ Usuário registrado:', newUser.nome);
    
    const { senha: _, ...userSemSenha } = newUser;
    
    res.json({
      success: true,
      user: userSemSenha,
      message: 'Usuário criado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao registrar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor ao registrar usuário'
    });
  }
});

// GET - Dados do usuário autenticado
app.get('/api/auth/me', async (req, res) => {
  try {
    // Em produção, validar o token JWT aqui
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido'
      });
    }
    
    // Simplificado - retornar primeiro usuário admin
    const user = usersDB.find(u => u.perfil === 'Admin' || u.perfil === 'SuperAdmin');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
    
    const { senha: _, ...userSemSenha } = user;
    
    res.json({
      success: true,
      user: userSemSenha
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
});

// POST - Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    console.log('🚪 Logout realizado');
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
});

// GET - Notificações
app.get('/api/notifications', async (req, res) => {
  try {
    console.log('📬 Buscando notificações...');
    res.json({
      success: true,
      notifications: notificationsDB
    });
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar notificações',
      details: error.message
    });
  }
});

// POST - Criar notificação
app.post('/api/notifications', async (req, res) => {
  try {
    const notification = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    notificationsDB.push(notification);
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar notificação'
    });
  }
});

app.post('/api/demo-leads', async (req, res) => {
  try {
    const body = req.body || {};
    const nomeResponsavel = String(body.nomeResponsavel || '').trim();
    const telefoneCelular = String(body.telefoneCelular || body.telefone || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const cidade = String(body.cidade || '').trim();
    const estado = String(body.estado || '').trim().toUpperCase().slice(0, 2);

    if (!nomeResponsavel || !telefoneCelular || !email || !cidade || !estado) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios ausentes para lead demo.'
      });
    }

    const capturadoEm = body.capturadoEm || new Date().toISOString();
    const origemEvento = String(body.origemEvento || 'login_demo').trim();
    const demoDeviceId = String(body.demoDeviceId || '').trim();
    const origem = String(body.origem || req.headers.origin || '').trim();
    const agora = Date.now();

    const leadNormalizado = {
      id: body.id || `demo-lead-${agora}`,
      nomeResponsavel,
      telefoneCelular,
      email,
      cidade,
      estado,
      capturadoEm,
      origemEvento,
      demoDeviceId,
      origem,
      atualizadoEm: new Date().toISOString(),
      acessosDemo: 1
    };

    const indiceExistente = demoLeadsDB.findIndex((lead) => {
      const mesmoEmail = String(lead.email || '').toLowerCase() === email;
      const mesmoTelefone = String(lead.telefoneCelular || '').trim() === telefoneCelular;
      const mesmoDispositivo = demoDeviceId && String(lead.demoDeviceId || '') === demoDeviceId;
      const ultimaAtualizacao = new Date(lead.atualizadoEm || lead.capturadoEm || 0).getTime();
      const dentroJanela = Number.isFinite(ultimaAtualizacao) && (agora - ultimaAtualizacao) <= DEMO_LEAD_DEDUP_WINDOW_MS;

      return (mesmoEmail || mesmoTelefone || mesmoDispositivo) && dentroJanela;
    });

    let leadSalvo = null;
    let atualizado = false;

    if (indiceExistente >= 0) {
      const existente = demoLeadsDB[indiceExistente];
      const acessosDemo = Number(existente.acessosDemo || 0) + 1;

      demoLeadsDB[indiceExistente] = {
        ...existente,
        ...leadNormalizado,
        id: existente.id,
        capturadoEm: existente.capturadoEm || capturadoEm,
        acessosDemo
      };

      leadSalvo = demoLeadsDB[indiceExistente];
      atualizado = true;
    } else {
      demoLeadsDB.push(leadNormalizado);
      leadSalvo = leadNormalizado;
    }

    notificationsDB.push({
      id: `notif-demo-${Date.now()}`,
      tipo: 'demo_lead',
      titulo: atualizado ? 'Lead DEMO atualizado' : 'Novo lead DEMO',
      mensagem: `${leadSalvo.nomeResponsavel} | ${leadSalvo.email} | ${leadSalvo.telefoneCelular}`,
      origem: leadSalvo.origemEvento,
      createdAt: new Date().toISOString(),
      leadId: leadSalvo.id
    });

    let emailResult = { success: false, skipped: true, reason: 'NOT_TRIGGERED' };
    let whatsappResult = { success: false, skipped: true, reason: 'NOT_TRIGGERED' };

    if (!atualizado) {
      try {
        emailResult = await enviarEmailLeadDemo(leadSalvo);
      } catch (emailError) {
        console.error('❌ Erro ao enviar e-mail de lead demo:', emailError.message);
        emailResult = { success: false, error: emailError.message };
      }

      try {
        whatsappResult = await enviarNotificacaoWhatsAppLeadDemo(leadSalvo);
      } catch (whatsError) {
        console.error('❌ Erro ao enviar WhatsApp de lead demo:', whatsError.message);
        whatsappResult = { success: false, error: whatsError.message };
      }
    }

    return res.json({
      success: true,
      lead: leadSalvo,
      updated: atualizado,
      notifications: {
        email: emailResult,
        whatsapp: whatsappResult
      }
    });
  } catch (error) {
    console.error('❌ Erro ao registrar lead demo:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao registrar lead demo.',
      details: error.message
    });
  }
});

app.get('/api/demo-leads', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query?.limit || 200), 1000));
    const leads = [...demoLeadsDB]
      .sort((a, b) => {
        const dataA = new Date(a.atualizadoEm || a.capturadoEm || 0).getTime();
        const dataB = new Date(b.atualizadoEm || b.capturadoEm || 0).getTime();
        return dataB - dataA;
      })
      .slice(0, limit);

    return res.json({
      success: true,
      total: demoLeadsDB.length,
      leads
    });
  } catch (error) {
    console.error('❌ Erro ao listar leads demo:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao listar leads demo.',
      details: error.message
    });
  }
});

// GET - Matérias/Disciplinas
app.get('/api/subjects', async (req, res) => {
  try {
    console.log('📚 Buscando matérias...');
    res.json({
      success: true,
      subjects: subjectsDB
    });
  } catch (error) {
    console.error('❌ Erro ao buscar matérias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar matérias',
      details: error.message
    });
  }
});

// POST - Criar matéria
app.post('/api/subjects', async (req, res) => {
  try {
    const subject = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    subjectsDB.push(subject);
    
    res.json({
      success: true,
      subject
    });
  } catch (error) {
    console.error('❌ Erro ao criar matéria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar matéria'
    });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'CEI Payment API',
    timestamp: new Date().toISOString() 
  });
});

// ==========================================
// DIAGNÓSTICO - Verificar configuração
// ==========================================
app.get('/api/diagnostico', (req, res) => {
  const diagnostico = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'não configurado',
      BACKEND_PORT: process.env.BACKEND_PORT || 'não configurado',
      FRONTEND_URL: process.env.FRONTEND_URL || 'não configurado',
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado (começa com: ' + process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 10) + '...)' : '❌ FALTANDO',
      MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY ? '✅ Configurado (começa com: ' + process.env.MERCADOPAGO_PUBLIC_KEY.substring(0, 10) + '...)' : '❌ FALTANDO'
    },
    mercadoPagoSDK: {
      configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      ready: typeof payment !== 'undefined'
    }
  };

  console.log('🔍 Diagnóstico solicitado:', diagnostico);
  
  res.json(diagnostico);
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     💳 CEI - API de Pagamentos (MERCADO PAGO)        ║
║                                                       ║
║  Servidor: http://localhost:${PORT}                    ║
║  Status: ✅ ONLINE                                    ║
║                                                       ║
║  Endpoints:                                          ║
║  • POST /api/create-pix-payment                      ║
║  • POST /api/create-card-payment                     ║
║  • GET  /api/check-payment/:id                       ║
║  • POST /api/webhooks                                ║
║  • GET  /api/health                                  ║
║                                                       ║
║  Gateway: Mercado Pago                               ║
║  Modo: ${process.env.NODE_ENV || 'development'}                                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Tratamento de erros
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

module.exports = app;
