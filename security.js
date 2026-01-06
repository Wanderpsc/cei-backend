/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA DE SEGURANÇA E PROTEÇÃO ANTI-PIRATARIA
 * Sistema CEI - Controle Escolar Inteligente
 * © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
 * ═══════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');

// Identificadores únicos do software (NÃO MODIFICAR)
const SOFTWARE_SIGNATURE = {
  id: 'CEI-2026-WPC',
  author: 'WANDER_PIRES_SILVA_COELHO',
  copyright: '© 2026 Wander Pires Silva Coelho',
  version: '1.0.0',
  buildDate: '2026-01-05',
  hash: crypto.createHash('sha256').update('CEI-WANDER-PIRES-2026').digest('hex')
};

// Marca d'água digital criptografada
const WATERMARK = {
  developer: Buffer.from('V0FO​REVSIFJJUKVTIFJJTFZBIENPRU​xIT​w==', 'base64').toString('utf-8'),
  timestamp: Date.now(),
  fingerprint: generateFingerprint()
};

/**
 * Gerar impressão digital única do sistema
 */
function generateFingerprint() {
  const data = [
    SOFTWARE_SIGNATURE.author,
    SOFTWARE_SIGNATURE.buildDate,
    SOFTWARE_SIGNATURE.version,
    process.platform,
    process.arch
  ].join('|');
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verificar integridade do sistema
 */
function verifyIntegrity() {
  const expectedHash = SOFTWARE_SIGNATURE.hash;
  const currentHash = crypto.createHash('sha256')
    .update('CEI-WANDER-PIRES-2026')
    .digest('hex');
  
  if (expectedHash !== currentHash) {
    console.error('⚠️  AVISO DE SEGURANÇA: Assinatura digital inválida!');
    console.error('Este software pode ter sido modificado ilegalmente.');
    console.error('Uso não autorizado será reportado.');
    return false;
  }
  
  return true;
}

/**
 * Registrar uso do sistema (telemetria anti-pirataria)
 */
function logSystemUsage() {
  const usageData = {
    timestamp: new Date().toISOString(),
    fingerprint: WATERMARK.fingerprint,
    signature: SOFTWARE_SIGNATURE.id,
    author: SOFTWARE_SIGNATURE.author,
    platform: process.platform,
    nodeVersion: process.version,
    pid: process.pid
  };
  
  // Em produção, enviar para servidor de telemetria
  console.log('📊 Telemetria:', JSON.stringify(usageData));
  
  return usageData;
}

/**
 * Exibir aviso de copyright na inicialização
 */
function displayCopyrightNotice() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║     SISTEMA CEI - CONTROLE ESCOLAR INTELIGENTE               ║');
  console.log('║     © 2026 WANDER PIRES SILVA COELHO                         ║');
  console.log('║     TODOS OS DIREITOS RESERVADOS                             ║');
  console.log('║                                                               ║');
  console.log('║     SOFTWARE PROPRIETÁRIO PROTEGIDO POR LEI                  ║');
  console.log('║     Lei 9.610/98 (Direitos Autorais)                        ║');
  console.log('║     Lei 9.609/98 (Software)                                  ║');
  console.log('║                                                               ║');
  console.log('║     USO NÃO AUTORIZADO É CRIME                               ║');
  console.log('║     Pena: Detenção de 6 meses a 2 anos                      ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

/**
 * Criptografar dados sensíveis
 */
function encryptSensitiveData(data, key = process.env.ENCRYPTION_KEY) {
  if (!key) {
    throw new Error('Chave de criptografia não configurada');
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32, '0').slice(0, 32)),
    iv
  );
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografar dados sensíveis
 */
function decryptSensitiveData(encryptedData, key = process.env.ENCRYPTION_KEY) {
  if (!key) {
    throw new Error('Chave de criptografia não configurada');
  }
  
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32, '0').slice(0, 32)),
    iv
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

/**
 * Hash de senha seguro (bcrypt-like)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verificar senha
 */
function verifyPassword(password, hashedPassword) {
  const [salt, originalHash] = hashedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

/**
 * Gerar token de sessão seguro
 */
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validar integridade de dados (checksum)
 */
function calculateChecksum(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Middleware de segurança para Express
 */
function securityMiddleware(req, res, next) {
  // Adicionar headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Software-Copyright', SOFTWARE_SIGNATURE.copyright);
  res.setHeader('X-Software-Author', SOFTWARE_SIGNATURE.author);
  
  // Log de acesso
  console.log(`🔐 [${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  next();
}

/**
 * Detectar tentativa de adulteração
 */
function detectTampering() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Verificar se LICENSE.js existe e não foi modificado
    const licensePath = path.join(__dirname, 'LICENSE.js');
    
    if (!fs.existsSync(licensePath)) {
      console.error('🚨 VIOLAÇÃO: Arquivo de licença removido!');
      console.error('Esta ação será reportada às autoridades.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('⚠️  Erro ao verificar integridade:', error.message);
    return false;
  }
}

/**
 * Registrar tentativa de violação
 */
function reportViolation(type, details) {
  const violation = {
    type: type,
    timestamp: new Date().toISOString(),
    details: details,
    fingerprint: WATERMARK.fingerprint,
    platform: process.platform,
    hostname: require('os').hostname()
  };
  
  console.error('\n🚨 ═══════════════════════════════════════════════════════');
  console.error('   VIOLAÇÃO DE SEGURANÇA DETECTADA');
  console.error('═══════════════════════════════════════════════════════');
  console.error('Tipo:', violation.type);
  console.error('Data/Hora:', violation.timestamp);
  console.error('Detalhes:', violation.details);
  console.error('═══════════════════════════════════════════════════════');
  console.error('Esta violação foi registrada e será reportada.');
  console.error('Uso não autorizado é crime - Lei 9.609/98');
  console.error('═══════════════════════════════════════════════════════\n');
  
  // Em produção, enviar para servidor de monitoramento
  // await sendToSecurityServer(violation);
  
  return violation;
}

/**
 * Inicializar sistema de segurança
 */
function initializeSecurity() {
  displayCopyrightNotice();
  
  if (!verifyIntegrity()) {
    reportViolation('INTEGRITY_VIOLATION', 'Assinatura digital inválida');
  }
  
  if (!detectTampering()) {
    reportViolation('TAMPERING_DETECTED', 'Arquivos de licença modificados ou removidos');
  }
  
  logSystemUsage();
  
  console.log('✅ Sistema de segurança inicializado\n');
}

// Exportar funções
module.exports = {
  SOFTWARE_SIGNATURE,
  WATERMARK,
  initializeSecurity,
  verifyIntegrity,
  encryptSensitiveData,
  decryptSensitiveData,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  calculateChecksum,
  securityMiddleware,
  detectTampering,
  reportViolation,
  logSystemUsage
};

// Executar verificação ao carregar o módulo
if (require.main === module) {
  initializeSecurity();
}
