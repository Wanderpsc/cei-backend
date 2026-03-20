import React, { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, CircularProgress, IconButton } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SyncIcon from '@mui/icons-material/Sync';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useData } from '../context/DataContext';
import { getSyncStatus } from '../services/syncService';
import { cloudConfigScope, isCloudEnabled } from '../services/supabaseClient';

export default function SyncStatus() {
  const isOnline = useOnlineStatus();
  const { sincronizarNuvemAgora } = useData();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [cloudConnected, setCloudConnected] = useState(false);

  const getCloudScopeHint = () => {
    if (cloudConfigScope === 'browser-local') {
      return ' Credenciais da nuvem foram salvas apenas neste navegador.';
    }

    if (cloudConfigScope === 'shared') {
      return ' Configuracao compartilhada para todos os dispositivos desta implantacao.';
    }

    return ' Dados ficam apenas neste navegador/dispositivo.';
  };

  const updateLastSync = () => {
    const lastSyncDate = localStorage.getItem('cei_last_sync');
    setLastSync(lastSyncDate ? new Date(lastSyncDate) : null);
  };

  const updateCloudStatus = async () => {
    if (!isCloudEnabled) {
      setCloudConnected(false);
      return;
    }

    try {
      const status = await getSyncStatus();
      setCloudConnected(Boolean(status?.connected));
    } catch (error) {
      setCloudConnected(false);
    }
  };

  useEffect(() => {
    updateLastSync();
    updateCloudStatus();

    // Escutar eventos de sincronização
    const handleSyncStart = () => setSyncing(true);
    const handleSyncEnd = () => {
      setSyncing(false);
      updateLastSync();
      updateCloudStatus();
    };

    const interval = setInterval(() => {
      updateLastSync();
      updateCloudStatus();
    }, 10000);

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-end', handleSyncEnd);
    window.addEventListener('online', updateCloudStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-end', handleSyncEnd);
      window.removeEventListener('online', updateCloudStatus);
    };
  }, []);

  const getStatusInfo = () => {
    if (!isCloudEnabled) {
      return {
        icon: <CloudOffIcon />,
        label: 'Somente local',
        color: 'warning',
        tooltip: `Supabase nao configurado.${getCloudScopeHint()}`
      };
    }

    if (syncing) {
      return {
        icon: <SyncIcon sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />,
        label: 'Sincronizando...',
        color: 'info',
        tooltip: 'Sincronizando dados da escola com a nuvem'
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

    if (!cloudConnected) {
      return {
        icon: <CloudOffIcon />,
        label: 'Nuvem indisponível',
        color: 'error',
        tooltip: `Sem conexao com Supabase - verifique projeto, credenciais e rede.${getCloudScopeHint()}`
      };
    }

    if (lastSync) {
      const diffMinutes = Math.floor((new Date() - lastSync) / 60000);
      if (diffMinutes < 1) {
        return {
          icon: <CloudDoneIcon />,
          label: 'Sync OK',
          color: 'success',
          tooltip: `Nuvem conectada • Ultima sincronizacao: ${lastSync.toLocaleString('pt-BR')}.${getCloudScopeHint()}`
        };
      } else if (diffMinutes < 60) {
        return {
          icon: <CloudSyncIcon />,
          label: `Sync há ${diffMinutes}min`,
          color: 'success',
          tooltip: `Nuvem conectada • Ultima sincronizacao: ${lastSync.toLocaleString('pt-BR')}.${getCloudScopeHint()}`
        };
      } else {
        return {
          icon: <CloudQueueIcon />,
          label: 'Sync atrasado',
          color: 'warning',
          tooltip: `Nuvem conectada • Ultima sincronizacao: ${lastSync.toLocaleString('pt-BR')}.${getCloudScopeHint()}`
        };
      }
    }

    return {
      icon: <CloudQueueIcon />,
      label: 'Aguardando',
      color: 'default',
      tooltip: `Nuvem conectada • aguardando primeira sincronizacao.${getCloudScopeHint()}`
    };
  };

  const status = getStatusInfo();

  const handleManualSync = async () => {
    if (syncing || !isCloudEnabled) return;

    try {
      await sincronizarNuvemAgora();
    } finally {
      updateCloudStatus();
      updateLastSync();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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

      <Tooltip title={syncing ? 'Sincronizacao em andamento' : isCloudEnabled ? 'Sincronizar agora' : 'Ative a nuvem para sincronizar entre dispositivos'} arrow>
        <span>
          <IconButton
            size="small"
            color="inherit"
            onClick={handleManualSync}
            disabled={syncing || !isCloudEnabled}
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.12)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.22)',
              },
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.45)'
              }
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
