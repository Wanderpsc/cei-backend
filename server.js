const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');
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
  origin: ['http://localhost:3000', 'https://cei-controle-escolar.surge.sh'],
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

// ==========================================
// BANCO DE DADOS DE LICENÇAS (em memória - use banco real em produção)
// ==========================================
const licensesDB = new Map(); // chave: licenseKey, valor: { instituicaoId, deviceFingerprint, activatedAt, etc }
const sessionsDB = new Map(); // chave: instituicaoId, valor: { deviceFingerprint, lastActivity, etc }

/**
 * Verificar se uma licença está ativa em outro dispositivo
 */
function isLicenseActiveOnAnotherDevice(instituicaoId, deviceFingerprint) {
  const session = sessionsDB.get(instituicaoId);
  if (!session) return false;
  
  // Verificar se está ativo em outro dispositivo
  if (session.deviceFingerprint !== deviceFingerprint) {
    // Verificar se a sessão ainda está válida (ativa nos últimos 5 minutos)
    const minutesSinceActivity = (Date.now() - session.lastActivity) / (1000 * 60);
    if (minutesSinceActivity < 5) {
      return true; // Ativo em outro dispositivo
    }
  }
  
  return false;
}

/**
 * Atualizar sessão ativa
 */
function updateActiveSession(instituicaoId, deviceFingerprint) {
  sessionsDB.set(instituicaoId, {
    deviceFingerprint: deviceFingerprint,
    lastActivity: Date.now(),
    activatedAt: sessionsDB.get(instituicaoId)?.activatedAt || Date.now()
  });
}

/**
 * Remover sessão ativa
 */
function removeActiveSession(instituicaoId) {
  sessionsDB.delete(instituicaoId);
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

    // Verificar se já está ativo em outro dispositivo
    if (isLicenseActiveOnAnotherDevice(instituicaoId, deviceFingerprint)) {
      return res.json({
        success: false,
        reason: 'ALREADY_ACTIVE',
        message: 'Esta licença já está ativa em outro dispositivo. Desative primeiro.'
      });
    }

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

    // Verificar se está ativo em outro dispositivo
    if (isLicenseActiveOnAnotherDevice(instituicaoId, deviceFingerprint)) {
      return res.json({
        valid: false,
        reason: 'ACTIVE_ON_ANOTHER_DEVICE',
        message: 'Dispositivo diferente está usando esta licença.'
      });
    }

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
      // Remover sessão ativa
      removeActiveSession(license.instituicaoId);
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
      notification_url: `${process.env.BACKEND_URL}/api/webhooks`,
      external_reference: instituicaoId // Para identificar depois
    };

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
      payment_method_id: 'visa', // Será detectado automaticamente pelo token
      payer: {
        email: email,
        first_name: nome,
        identification: {
          type: 'CPF',
          number: cpf
        }
      },
      notification_url: `${process.env.BACKEND_URL}/api/webhooks`,
      external_reference: instituicaoId
    };

    console.log('📤 Enviando para Mercado Pago...');
    const response = await payment.create({ body });

    console.log('✅ Pagamento criado:', response.id);
    console.log('Status:', response.status);

    res.json({
      success: true,
      payment: {
        id: response.id,
        status: response.status,
        status_detail: response.status_detail,
        installments: response.installments
      }
    });

  } catch (error) {
    console.error('❌ Erro ao processar cartão:', error);
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
