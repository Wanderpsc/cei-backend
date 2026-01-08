import React, { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, CircularProgress } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SyncIcon from '@mui/icons-material/Sync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import apiService from '../utils/apiService';

export default function SyncStatus() {
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Atualizar última sincronização
    const updateLastSync = () => {
      const lastSyncDate = apiService.getUltimaSincronizacao();
      setLastSync(lastSyncDate);
    };

    updateLastSync();

    // Escutar eventos de sincronização
    const handleSyncStart = () => setSyncing(true);
    const handleSyncEnd = () => {
      setSyncing(false);
      updateLastSync();
    };

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-end', handleSyncEnd);

    return () => {
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-end', handleSyncEnd);
    };
  }, []);

  const getStatusInfo = () => {
    if (syncing) {
      return {
        icon: <SyncIcon sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />,
        label: 'Sincronizando...',
        color: 'info',
        tooltip: 'Sincronizando dados com o servidor'
      };
    }

    if (!isOnline) {
      return {
        icon: <CloudOffIcon />,
        label: 'Offline',
        color: 'error',
        tooltip: 'Sem conexão - os dados serão sincronizados quando a conexão for restaurada'
      };
    }

    if (lastSync) {
      const diffMinutes = Math.floor((new Date() - lastSync) / 60000);
      if (diffMinutes < 1) {
        return {
          icon: <CloudDoneIcon />,
          label: 'Sincronizado',
          color: 'success',
          tooltip: 'Dados sincronizados há instantes'
        };
      } else if (diffMinutes < 60) {
        return {
          icon: <CloudDoneIcon />,
          label: `Sync há ${diffMinutes}min`,
          color: 'success',
          tooltip: `Última sincronização: ${lastSync.toLocaleString('pt-BR')}`
        };
      } else {
        return {
          icon: <CloudQueueIcon />,
          label: 'Pendente',
          color: 'warning',
          tooltip: `Última sincronização: ${lastSync.toLocaleString('pt-BR')}`
        };
      }
    }

    return {
      icon: <CloudQueueIcon />,
      label: 'Aguardando',
      color: 'default',
      tooltip: 'Aguardando primeira sincronização'
    };
  };

  const status = getStatusInfo();

  return (
    <Tooltip title={status.tooltip} arrow>
      <Chip
        icon={syncing ? <CircularProgress size={16} color="inherit" /> : status.icon}
        label={status.label}
        size="small"
        color={status.color}
        sx={{
          fontWeight: 500,
          cursor: 'help',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
          }
        }}
      />
    </Tooltip>
  );
}
