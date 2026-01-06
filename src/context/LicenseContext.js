import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  verifyDeviceAuthorization,
  getLicenseFromDevice,
  activateLicense,
  deactivateLicense,
  generateDeviceFingerprint
} from '../utils/licenseManager';

const LicenseContext = createContext();

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

export const LicenseProvider = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [error, setError] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Verificar autorização ao carregar
  useEffect(() => {
    // LICENCIAMENTO DESABILITADO TEMPORARIAMENTE
    // Sistema configurado como sempre autorizado
    setIsAuthorized(true);
    setIsLoading(false);
    
    // Comentado: checkAuthorization();
    // Comentado: Verificar periodicamente (a cada 5 minutos)
    // const interval = setInterval(() => {
    //   checkAuthorization(true); // silent check
    // }, 5 * 60 * 1000);
    // return () => clearInterval(interval);
  }, []);

  /**
   * Verificar se o dispositivo está autorizado
   */
  const checkAuthorization = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const result = await verifyDeviceAuthorization(API_URL);
      
      setIsAuthorized(result.authorized);
      
      if (result.authorized) {
        setLicenseInfo(result.license);
        setDeviceInfo(result.deviceInfo);
        
        if (result.warning && !silent) {
          console.warn(result.warning);
        }
      } else {
        setLicenseInfo(null);
        setError({
          reason: result.reason,
          message: result.message
        });
        
        // Redirecionar para página de ativação se não estiver autorizado
        if (!silent && window.location.pathname !== '/ativar-licenca') {
          navigate('/ativar-licenca');
        }
      }
    } catch (err) {
      console.error('Erro ao verificar autorização:', err);
      setIsAuthorized(false);
      setError({
        reason: 'NETWORK_ERROR',
        message: 'Erro ao verificar licença. Verifique sua conexão.'
      });
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  /**
   * Ativar licença com código
   */
  const activate = async (licenseKey) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await activateLicense(licenseKey, API_URL);
      
      if (result.success) {
        await checkAuthorization();
        return { success: true, message: result.message };
      } else {
        setError({
          reason: result.reason,
          message: result.message
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMsg = 'Erro ao ativar licença. Tente novamente.';
      setError({
        reason: 'ACTIVATION_ERROR',
        message: errorMsg
      });
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Desativar licença (logout)
   */
  const deactivate = async () => {
    setIsLoading(true);
    
    try {
      await deactivateLicense(API_URL);
      setIsAuthorized(false);
      setLicenseInfo(null);
      setDeviceInfo(null);
      navigate('/ativar-licenca');
    } catch (err) {
      console.error('Erro ao desativar licença:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obter informações do dispositivo
   */
  const getDeviceInfo = () => {
    if (!deviceInfo) {
      const info = generateDeviceFingerprint();
      setDeviceInfo(info);
      return info;
    }
    return deviceInfo;
  };

  const value = {
    isAuthorized,
    isLoading,
    licenseInfo,
    error,
    deviceInfo,
    checkAuthorization,
    activate,
    deactivate,
    getDeviceInfo
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};

export default LicenseContext;
