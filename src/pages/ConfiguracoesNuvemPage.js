/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PÁGINA DE CONFIGURAÇÕES NUVEM - CEI Sistema
 * Configuração e monitoramento do Supabase
 * © 2026 Wander Pires Silva Coelho
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Cloud,
  CloudOff,
  CloudDone,
  Sync,
  Storage,
  Security,
  Speed,
  Backup,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { isCloudEnabled, checkConnection } from '../services/supabaseClient';
import { getSyncStatus, backupToCloud, restoreFromCloud } from '../services/syncService';
import { useData } from '../context/DataContext';

const ConfiguracoesNuvemPage = () => {
  const { livros, leitores, emprestimos, patrimonio, usuarios, currentInstituicao } = useData();
  const [cloudStatus, setCloudStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    checkCloudStatus();
    
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkCloudStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkCloudStatus = async () => {
    setLoading(true);
    try {
      const status = await getSyncStatus();
      setCloudStatus(status);
      
      // Carregar última sincronização
      const lastSyncTime = localStorage.getItem('cei_last_sync');
      if (lastSyncTime) {
        setLastSync(new Date(lastSyncTime));
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const allData = {
        livros,
        leitores,
        emprestimos,
        patrimonio,
        usuarios
      };

      const result = await backupToCloud(allData, currentInstituicao?.id || 0);
      
      if (result.success) {
        alert('✅ Sincronização concluída com sucesso!');
        localStorage.setItem('cei_last_sync', new Date().toISOString());
        setLastSync(new Date());
      } else {
        alert('❌ Erro na sincronização: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro ao sincronizar: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('⚠️ Deseja restaurar os dados da nuvem? Isso substituirá os dados locais.')) {
      return;
    }

    setSyncing(true);
    try {
      const result = await restoreFromCloud(currentInstituicao?.id || 0);
      
      if (result.success) {
        alert('✅ Dados restaurados com sucesso! Recarregue a página.');
        window.location.reload();
      } else {
        alert('❌ Erro na restauração: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro ao restaurar: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (!cloudStatus) return 'default';
    if (cloudStatus.connected) return 'success';
    if (cloudStatus.enabled) return 'warning';
    return 'default';
  };

  const getStatusIcon = () => {
    if (!cloudStatus) return <CloudOff />;
    if (cloudStatus.connected) return <CloudDone />;
    if (cloudStatus.enabled) return <Warning />;
    return <CloudOff />;
  };

  const getStatusText = () => {
    if (!cloudStatus) return 'Verificando...';
    if (cloudStatus.connected) return 'Conectado';
    if (cloudStatus.enabled) return 'Offline';
    return 'Não configurado';
  };

  const totalRecords = livros.length + leitores.length + emprestimos.length + patrimonio.length;

  return (
    <Layout title="Configurações de Nuvem">
      <Box sx={{ p: 3 }}>
        {/* Status Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getStatusIcon()}
              <Typography variant="h5" sx={{ ml: 2, flexGrow: 1 }}>
                Status da Nuvem
              </Typography>
              <Chip 
                label={getStatusText()}
                color={getStatusColor()}
                icon={getStatusIcon()}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {!isCloudEnabled && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      💾 Modo LocalStorage Ativo
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      O sistema está funcionando apenas com armazenamento local. 
                      Para ativar a sincronização em nuvem:
                    </Typography>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Crie uma conta em: <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
                      <li>Crie um novo projeto chamado "cei-sistema"</li>
                      <li>Copie as credenciais para o arquivo <code>.env.local</code></li>
                      <li>Reinicie o sistema</li>
                    </ol>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      📖 Documentação completa: <code>IMPLEMENTACAO_SUPABASE.md</code>
                    </Typography>
                  </Alert>
                )}

                {cloudStatus?.connected && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✅ Conectado ao Supabase. Sincronização automática ativa.
                  </Alert>
                )}

                {cloudStatus?.enabled && !cloudStatus?.connected && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    ⚠️ Supabase configurado mas sem conexão. Verifique sua internet.
                  </Alert>
                )}

                {/* Estatísticas */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Storage sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4">{totalRecords}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Registros Totais
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Speed sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4">{livros.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Livros
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Security sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h4">{leitores.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Leitores
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Backup sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4">{emprestimos.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Empréstimos
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Última Sincronização */}
                {lastSync && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Última sincronização: {lastSync.toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                )}

                {/* Ações */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={syncing ? <CircularProgress size={20} /> : <Sync />}
                    onClick={handleSync}
                    disabled={!isCloudEnabled || syncing}
                  >
                    {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<CloudDone />}
                    onClick={handleRestore}
                    disabled={!isCloudEnabled || syncing}
                  >
                    Restaurar da Nuvem
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Backup />}
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  >
                    Abrir Dashboard
                  </Button>
                </Box>

                {/* Configurações Adicionais */}
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Configurações de Sincronização
                </Typography>

                <FormControlLabel
                  control={
                    <Switch 
                      checked={autoSyncEnabled} 
                      onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                      disabled={!isCloudEnabled}
                    />
                  }
                  label="Sincronização automática (a cada 5 minutos)"
                />

                {/* Benefícios */}
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Benefícios da Nuvem Supabase
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Acesso Multi-dispositivo"
                      secondary="Acesse seus dados de qualquer lugar"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Backup Automático"
                      secondary="Backup diário na nuvem"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Segurança SSL/TLS"
                      secondary="Criptografia em todas as conexões"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="500MB Grátis"
                      secondary="PostgreSQL + Storage inclusos"
                    />
                  </ListItem>
                </List>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default ConfiguracoesNuvemPage;
