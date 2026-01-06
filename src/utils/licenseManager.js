/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA DE LICENCIAMENTO ÚNICO POR DISPOSITIVO
 * Sistema CEI - Controle Escolar Inteligente
 * © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este módulo garante que:
 * - Apenas usuários autorizados possam usar o sistema
 * - Cada licença funciona em apenas UM dispositivo por vez
 * - Compartilhamento de links é bloqueado
 * - Licenças podem ser revogadas remotamente
 */

/**
 * Gerar fingerprint único do navegador
 * Combina múltiplas características para identificar dispositivo
 */
export function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('CEI-Device-Check', 2, 2);
  const canvasFingerprint = canvas.toDataURL();

  const data = {
    // Características do navegador
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(','),
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    
    // Características da tela
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    screenPixelDepth: screen.pixelDepth,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    
    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    
    // Canvas fingerprint
    canvasFingerprint: canvasFingerprint.substring(0, 100),
    
    // WebGL
    webglVendor: getWebGLVendor(),
    webglRenderer: getWebGLRenderer(),
    
    // Cookies e Storage
    cookieEnabled: navigator.cookieEnabled,
    localStorage: isLocalStorageAvailable(),
    sessionStorage: isSessionStorageAvailable(),
    
    // Audio context
    audioFingerprint: getAudioFingerprint(),
  };

  // Gerar hash único baseado em todas as características
  const fingerprint = hashCode(JSON.stringify(data));
  
  return {
    fingerprint: fingerprint,
    details: data,
    timestamp: Date.now()
  };
}

/**
 * Obter informações da GPU (WebGL)
 */
function getWebGLVendor() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
    }
  } catch (e) {
    return 'Error';
  }
  return 'Not Available';
}

function getWebGLRenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
    }
  } catch (e) {
    return 'Error';
  }
  return 'Not Available';
}

/**
 * Verificar disponibilidade de Storage
 */
function isLocalStorageAvailable() {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
}

function isSessionStorageAvailable() {
  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Audio context fingerprint
 */
function getAudioFingerprint() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return 'Not Available';
    
    const context = new AudioContext();
    
    // Apenas pegar informações básicas, sem criar nós complexos
    const fingerprint = `${context.sampleRate}_${context.destination.maxChannelCount}`;
    
    // Fechar contexto para evitar avisos
    context.close();
    
    return fingerprint;
  } catch (e) {
    return 'Error';
  }
}

/**
 * Gerar hash de string (simples mas efetivo)
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

/**
 * Salvar licença no dispositivo
 */
export function saveLicenseToDevice(licenseKey, deviceFingerprint, instituicaoId, userData) {
  const licenseData = {
    key: licenseKey,
    deviceFingerprint: deviceFingerprint,
    instituicaoId: instituicaoId,
    userData: userData,
    activatedAt: Date.now(),
    lastVerified: Date.now(),
    version: '1.0.0'
  };

  try {
    localStorage.setItem('cei_license', JSON.stringify(licenseData));
    sessionStorage.setItem('cei_session_active', 'true');
    return true;
  } catch (e) {
    console.error('Erro ao salvar licença:', e);
    return false;
  }
}

/**
 * Obter licença salva no dispositivo
 */
export function getLicenseFromDevice() {
  try {
    const licenseStr = localStorage.getItem('cei_license');
    if (!licenseStr) return null;
    
    const license = JSON.parse(licenseStr);
    
    // Verificar se a licença não expirou (verificar a cada 24h)
    const daysSinceVerification = (Date.now() - license.lastVerified) / (1000 * 60 * 60 * 24);
    if (daysSinceVerification > 1) {
      // Precisa reverificar com o servidor
      license.needsVerification = true;
    }
    
    return license;
  } catch (e) {
    console.error('Erro ao ler licença:', e);
    return null;
  }
}

/**
 * Atualizar timestamp de verificação da licença
 */
export function updateLicenseVerification() {
  try {
    const licenseStr = localStorage.getItem('cei_license');
    if (!licenseStr) return false;
    
    const license = JSON.parse(licenseStr);
    license.lastVerified = Date.now();
    license.needsVerification = false;
    
    localStorage.setItem('cei_license', JSON.stringify(license));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Revogar licença do dispositivo
 */
export function revokeLicenseFromDevice() {
  try {
    localStorage.removeItem('cei_license');
    sessionStorage.removeItem('cei_session_active');
    sessionStorage.clear();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Verificar se há uma sessão ativa
 */
export function hasActiveSession() {
  return sessionStorage.getItem('cei_session_active') === 'true';
}

/**
 * Verificar se dispositivo está autorizado
 * Retorna objeto com status e mensagem
 */
export async function verifyDeviceAuthorization(apiUrl) {
  const deviceInfo = generateDeviceFingerprint();
  const license = getLicenseFromDevice();

  // Se não há licença, bloquear
  if (!license) {
    return {
      authorized: false,
      reason: 'NO_LICENSE',
      message: 'Nenhuma licença encontrada. Por favor, ative sua licença.'
    };
  }

  // Verificar se o fingerprint mudou (possível fraude)
  if (license.deviceFingerprint !== deviceInfo.fingerprint) {
    return {
      authorized: false,
      reason: 'FINGERPRINT_MISMATCH',
      message: 'Dispositivo não autorizado. Esta licença está vinculada a outro dispositivo.'
    };
  }

  // Se precisa verificar com servidor
  if (license.needsVerification) {
    try {
      const response = await fetch(`${apiUrl}/api/verify-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey: license.key,
          deviceFingerprint: deviceInfo.fingerprint,
          instituicaoId: license.instituicaoId
        })
      });

      const data = await response.json();

      if (data.valid) {
        updateLicenseVerification();
        return {
          authorized: true,
          license: license,
          deviceInfo: deviceInfo
        };
      } else {
        // Licença inválida ou revogada
        revokeLicenseFromDevice();
        return {
          authorized: false,
          reason: data.reason || 'INVALID_LICENSE',
          message: data.message || 'Licença inválida ou expirada.'
        };
      }
    } catch (error) {
      // Se não conseguir conectar ao servidor, permitir uso offline por mais 24h
      console.warn('Não foi possível verificar licença online:', error);
      return {
        authorized: true,
        offline: true,
        license: license,
        deviceInfo: deviceInfo,
        warning: 'Usando modo offline. Conecte à internet para verificação.'
      };
    }
  }

  // Licença válida e não precisa verificação
  return {
    authorized: true,
    license: license,
    deviceInfo: deviceInfo
  };
}

/**
 * Ativar licença no dispositivo
 */
export async function activateLicense(licenseKey, apiUrl) {
  const deviceInfo = generateDeviceFingerprint();

  try {
    const response = await fetch(`${apiUrl}/api/activate-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        licenseKey: licenseKey,
        deviceFingerprint: deviceInfo.fingerprint,
        deviceDetails: deviceInfo.details
      })
    });

    const data = await response.json();

    if (data.success) {
      // Salvar licença no dispositivo
      saveLicenseToDevice(
        licenseKey,
        deviceInfo.fingerprint,
        data.instituicaoId,
        data.userData
      );

      return {
        success: true,
        message: 'Licença ativada com sucesso!',
        instituicao: data.instituicao
      };
    } else {
      return {
        success: false,
        reason: data.reason,
        message: data.message
      };
    }
  } catch (error) {
    return {
      success: false,
      reason: 'NETWORK_ERROR',
      message: 'Erro ao conectar com o servidor. Verifique sua conexão.'
    };
  }
}

/**
 * Desativar licença do dispositivo (logout)
 */
export async function deactivateLicense(apiUrl) {
  const license = getLicenseFromDevice();
  
  if (!license) return { success: true };

  try {
    // Notificar servidor que o dispositivo foi desativado
    await fetch(`${apiUrl}/api/deactivate-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        licenseKey: license.key,
        deviceFingerprint: license.deviceFingerprint
      })
    });
  } catch (error) {
    console.error('Erro ao desativar licença no servidor:', error);
  }

  // Remover do dispositivo independente do resultado
  revokeLicenseFromDevice();
  
  return { success: true };
}

// Exportar todas as funções
export default {
  generateDeviceFingerprint,
  saveLicenseToDevice,
  getLicenseFromDevice,
  updateLicenseVerification,
  revokeLicenseFromDevice,
  hasActiveSession,
  verifyDeviceAuthorization,
  activateLicense,
  deactivateLicense
};
