/**
 * =====================================================
 * 🔐 SISTEMA DE PROTEÇÃO DE CONSOLE - CEI
 * =====================================================
 * Desenvolvedor: Wander Pires Silva Coelho
 * Data: Janeiro/2026
 * Propósito: Proteger o console do navegador contra acesso não autorizado
 * 
 * ⚠️ ATENÇÃO: Este script bloqueia completamente o console!
 * Para desbloquear, digite no console: unlockConsole('sua-senha')
 * =====================================================
 */

(function() {
  'use strict';

  // ========== CONFIGURAÇÕES ==========
  const CONFIG = {
    // Senha master - ALTERE PARA SUA SENHA PESSOAL
    MASTER_PASSWORD: 'CEI@Wander2026#Seguro',
    
    // Tempo de sessão desbloqueada (30 minutos)
    SESSION_DURATION: 30 * 60 * 1000,
    
    // Chave de armazenamento
    STORAGE_KEY: 'cei_console_unlocked',
    
    // Mensagens
    MESSAGES: {
      blocked: '🔒 ACESSO NEGADO - Console Bloqueado',
      warning: '⚠️ Este console está protegido. Acesso não autorizado é proibido.',
      instructions: '💡 Para desbloquear, digite: unlockConsole("sua-senha")',
      success: '✅ Console desbloqueado com sucesso! Sessão ativa por 30 minutos.',
      error: '❌ Senha incorreta! Tentativa registrada.',
      locked: '🔐 Console bloqueado automaticamente.',
      copyright: '© 2026 Wander Pires Silva Coelho - Todos os direitos reservados'
    }
  };

  // ========== ESTADO DO BLOQUEIO ==========
  let isUnlocked = false;
  let unlockTimeout = null;
  let loginAttempts = 0;
  const MAX_ATTEMPTS = 5;

  // ========== MÉTODOS ORIGINAIS DO CONSOLE ==========
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
    trace: console.trace,
    table: console.table,
    dir: console.dir,
    dirxml: console.dirxml,
    group: console.group,
    groupCollapsed: console.groupCollapsed,
    groupEnd: console.groupEnd,
    clear: console.clear,
    count: console.count,
    countReset: console.countReset,
    assert: console.assert,
    time: console.time,
    timeEnd: console.timeEnd,
    timeLog: console.timeLog
  };

  // ========== VERIFICAR SESSÃO EXISTENTE ==========
  function checkExistingSession() {
    try {
      const unlockData = sessionStorage.getItem(CONFIG.STORAGE_KEY);
      if (unlockData) {
        const data = JSON.parse(unlockData);
        const now = Date.now();
        
        if (data.expiry > now) {
          isUnlocked = true;
          const remainingTime = Math.round((data.expiry - now) / 1000 / 60);
          originalConsole.info(`🔓 Console já desbloqueado. Expira em ${remainingTime} minutos.`);
          scheduleAutoLock(data.expiry - now);
          return true;
        } else {
          sessionStorage.removeItem(CONFIG.STORAGE_KEY);
        }
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
    return false;
  }

  // ========== AGENDAR BLOQUEIO AUTOMÁTICO ==========
  function scheduleAutoLock(duration) {
    if (unlockTimeout) clearTimeout(unlockTimeout);
    
    unlockTimeout = setTimeout(() => {
      lockConsole();
    }, duration);
  }

  // ========== BLOQUEAR CONSOLE ==========
  function lockConsole() {
    isUnlocked = false;
    sessionStorage.removeItem(CONFIG.STORAGE_KEY);
    if (unlockTimeout) clearTimeout(unlockTimeout);
    
    originalConsole.warn(CONFIG.MESSAGES.locked);
    originalConsole.info('Para desbloquear novamente, use: unlockConsole("senha")');
  }

  // ========== FUNÇÃO PARA DESBLOQUEAR ==========
  window.unlockConsole = function(password) {
    if (isUnlocked) {
      originalConsole.info('ℹ️ Console já está desbloqueado.');
      return true;
    }

    if (loginAttempts >= MAX_ATTEMPTS) {
      originalConsole.error('🚫 Muitas tentativas falhas! Console permanentemente bloqueado nesta sessão.');
      originalConsole.error('Recarregue a página para tentar novamente.');
      return false;
    }

    if (password === CONFIG.MASTER_PASSWORD) {
      isUnlocked = true;
      loginAttempts = 0;
      
      // Salvar sessão
      const expiry = Date.now() + CONFIG.SESSION_DURATION;
      sessionStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({ expiry }));
      
      // Agendar bloqueio automático
      scheduleAutoLock(CONFIG.SESSION_DURATION);
      
      originalConsole.log('%c' + CONFIG.MESSAGES.success, 'color: #4CAF50; font-weight: bold; font-size: 14px;');
      originalConsole.log('%c' + CONFIG.MESSAGES.copyright, 'color: #2196F3; font-style: italic;');
      
      return true;
    } else {
      loginAttempts++;
      const remainingAttempts = MAX_ATTEMPTS - loginAttempts;
      
      originalConsole.error(CONFIG.MESSAGES.error);
      originalConsole.warn(`⚠️ Você tem ${remainingAttempts} tentativa(s) restante(s).`);
      
      // Registrar tentativa de acesso não autorizado
      originalConsole.warn('📋 Tentativa de acesso não autorizado registrada:', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        attempts: loginAttempts
      });
      
      return false;
    }
  };

  // ========== FUNÇÃO PARA VERIFICAR SE ESTÁ DESBLOQUEADO ==========
  function checkUnlocked() {
    return isUnlocked;
  }

  // ========== SUBSTITUIR MÉTODOS DO CONSOLE ==========
  function blockConsoleMethod(methodName) {
    console[methodName] = function(...args) {
      if (checkUnlocked()) {
        originalConsole[methodName].apply(console, args);
      } else {
        // Mostrar mensagem de bloqueio apenas uma vez por sessão
        if (!window._consoleBlockedShown) {
          window._consoleBlockedShown = true;
          originalConsole.error('%c' + CONFIG.MESSAGES.blocked, 'color: #f44336; font-weight: bold; font-size: 16px; padding: 10px;');
          originalConsole.warn('%c' + CONFIG.MESSAGES.warning, 'color: #ff9800; font-size: 14px;');
          originalConsole.info('%c' + CONFIG.MESSAGES.instructions, 'color: #2196F3; font-size: 12px;');
          originalConsole.log('%c' + CONFIG.MESSAGES.copyright, 'color: #9E9E9E; font-style: italic;');
        }
      }
    };
  }

  // ========== BLOQUEAR TODOS OS MÉTODOS ==========
  Object.keys(originalConsole).forEach(method => {
    blockConsoleMethod(method);
  });

  // ========== PREVENIR INSPECT ELEMENT / DevTools ==========
  // Detectar abertura do DevTools
  let devtoolsOpen = false;
  const threshold = 160;

  const detectDevTools = () => {
    if (window.outerWidth - window.innerWidth > threshold || 
        window.outerHeight - window.innerHeight > threshold) {
      if (!devtoolsOpen && !isUnlocked) {
        devtoolsOpen = true;
        originalConsole.warn('⚠️ DevTools detectado! Console está protegido.');
      }
    } else {
      devtoolsOpen = false;
    }
  };

  // Verificar a cada segundo
  setInterval(detectDevTools, 1000);

  // ========== BLOQUEAR ATALHOS DO TECLADO ==========
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
      if (!isUnlocked) {
        e.preventDefault();
        originalConsole.warn('🔒 F12 bloqueado! Use unlockConsole("senha") para acessar.');
        return false;
      }
    }
    
    // Ctrl+Shift+I (Chrome DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      if (!isUnlocked) {
        e.preventDefault();
        originalConsole.warn('🔒 Ctrl+Shift+I bloqueado!');
        return false;
      }
    }
    
    // Ctrl+Shift+J (Chrome Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      if (!isUnlocked) {
        e.preventDefault();
        originalConsole.warn('🔒 Ctrl+Shift+J bloqueado!');
        return false;
      }
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      if (!isUnlocked) {
        e.preventDefault();
        originalConsole.warn('🔒 Ctrl+Shift+C bloqueado!');
        return false;
      }
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      if (!isUnlocked) {
        e.preventDefault();
        originalConsole.warn('🔒 Ctrl+U bloqueado!');
        return false;
      }
    }
  });

  // ========== BLOQUEAR MENU DE CONTEXTO ==========
  document.addEventListener('contextmenu', function(e) {
    if (!isUnlocked) {
      e.preventDefault();
      originalConsole.warn('🔒 Clique direito bloqueado! Use unlockConsole("senha") para acessar.');
      return false;
    }
  });

  // ========== INICIALIZAÇÃO ==========
  function init() {
    // Verificar se já existe uma sessão desbloqueada
    const hasSession = checkExistingSession();
    
    if (!hasSession) {
      // Mostrar mensagem inicial
      originalConsole.log('%c╔══════════════════════════════════════════════════════╗', 'color: #2196F3;');
      originalConsole.log('%c║     🔐 CONSOLE PROTEGIDO - CEI v3.3.1               ║', 'color: #2196F3; font-weight: bold;');
      originalConsole.log('%c╚══════════════════════════════════════════════════════╝', 'color: #2196F3;');
      originalConsole.log('');
      originalConsole.info('%c' + CONFIG.MESSAGES.warning, 'color: #ff9800; font-size: 13px;');
      originalConsole.info('%c' + CONFIG.MESSAGES.instructions, 'color: #2196F3; font-size: 12px;');
      originalConsole.log('');
      originalConsole.log('%c' + CONFIG.MESSAGES.copyright, 'color: #9E9E9E; font-style: italic; font-size: 11px;');
      originalConsole.log('');
    }
  }

  // Executar inicialização
  init();

  // ========== EXPORTAR FUNÇÃO DE BLOQUEIO MANUAL ==========
  window.lockConsole = lockConsole;

  // ========== PROTEÇÃO ADICIONAL ==========
  // Prevenir que alguém sobrescreva as funções de desbloqueio
  Object.freeze(window.unlockConsole);
  Object.freeze(window.lockConsole);

  // Mensagem final
  originalConsole.log('%c🛡️ Sistema de proteção de console ativado!', 'color: #4CAF50; font-weight: bold;');

})();
