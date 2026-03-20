/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGINA DE CONFIGURACOES NUVEM - CEI Sistema
 * Configuracao e monitoramento do Supabase
 * © 2026 Wander Pires Silva Coelho
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
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
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Backup,
  CheckCircle,
  CloudDone,
  CloudOff,
  Launch,
  Security,
  Speed,
  Storage,
  Sync,
  Warning
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import { getSyncStatus } from '../services/syncService';
import { cloudConfigScope, cloudConfigSource, isCloudEnabled } from '../services/supabaseClient';

const ConfiguracoesNuvemPage = () => {
  const {
    livros,
    clientes,
    emprestimos,
    patrimonio,
    instituicoes,
    instituicaoAtiva,
    sincronizarNuvemAgora
  } = useData();

  const [cloudStatus, setCloudStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const currentInstituicao = instituicoes.find(
    (instituicao) => Number(instituicao?.id) === Number(instituicaoAtiva)
  ) || null;
  const publicBasePath = process.env.PUBLIC_URL || '';
  const browserConfigUrl = `${publicBasePath}/configurar-supabase.html`;

  useEffect(() => {
    checkCloudStatus();

    const interval = setInterval(checkCloudStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkCloudStatus = async () => {
    setLoading(true);
    try {
      const status = await getSyncStatus();
      setCloudStatus(status);

      const lastSyncTime = localStorage.getItem('cei_last_sync');
      if (lastSyncTime) {
        setLastSync(new Date(lastSyncTime));
      }
    } catch (error) {
      console.error('Erro ao verificar status da nuvem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await sincronizarNuvemAgora();
      localStorage.setItem('cei_last_sync', new Date().toISOString());
      setLastSync(new Date());
      await checkCloudStatus();
      alert('✅ Sincronizacao concluida com sucesso!');
    } catch (error) {
      alert(`❌ Erro ao sincronizar: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadFromCloud = async () => {
    if (!window.confirm('Deseja baixar e mesclar os dados da nuvem com este dispositivo?')) {
      return;
    }

    setSyncing(true);
    try {
      await sincronizarNuvemAgora({ somenteBaixar: true });
      localStorage.setItem('cei_last_sync', new Date().toISOString());
      setLastSync(new Date());
      await checkCloudStatus();
      alert('✅ Dados da nuvem baixados e mesclados com sucesso!');
    } catch (error) {
      alert(`❌ Erro ao baixar dados da nuvem: ${error.message}`);
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
    if (cloudStatus.enabled) return 'Configurado sem conexao';
    return 'Nao configurado';
  };

  const getConfigSourceLabel = () => {
    if (cloudConfigSource === 'runtime-file') {
      return 'Arquivo compartilhado do deploy';
    }

    if (cloudConfigSource === 'env') {
      return 'Variaveis de ambiente';
    }

    if (cloudConfigSource === 'localStorage') {
      return 'Somente este navegador';
    }

    return 'Nao configurado';
  };

  const totalRecords = livros.length + clientes.length + emprestimos.length + patrimonio.length;

  return (
    <Layout title="Configuracoes de Nuvem">
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getStatusIcon()}
              <Typography variant="h5" sx={{ ml: 2, flexGrow: 1 }}>
                Status da Nuvem
              </Typography>
              <Chip label={getStatusText()} color={getStatusColor()} icon={getStatusIcon()} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={`Fonte: ${getConfigSourceLabel()}`} variant="outlined" />
              {currentInstituicao && (
                <Chip
                  label={`Instituicao: ${currentInstituicao.nomeInstituicao || currentInstituicao.nome || currentInstituicao.id}`}
                  variant="outlined"
                />
              )}
              <Chip
                label={
                  cloudConfigScope === 'shared'
                    ? 'Compartilhada entre dispositivos'
                    : cloudConfigScope === 'browser-local'
                      ? 'Configuracao local deste navegador'
                      : 'Sem configuracao de nuvem'
                }
                color={
                  cloudConfigScope === 'shared'
                    ? 'success'
                    : cloudConfigScope === 'browser-local'
                      ? 'warning'
                      : 'default'
                }
                variant="outlined"
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {!isCloudEnabled && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Dados apenas neste navegador
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Sem Supabase configurado, os dados ficam somente neste aparelho. Por isso um dispositivo pode ter registros e outro abrir vazio.
                    </Typography>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Crie ou use seu projeto em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
                      <li>Preencha <code>public/supabase-runtime-config.js</code> no deploy para valer em todos os dispositivos</li>
                      <li>Ou configure <code>.env.local</code> antes do build</li>
                      <li>Se quiser testar so neste aparelho, use o configurador deste navegador</li>
                    </ol>
                  </Alert>
                )}

                {cloudConfigSource === 'localStorage' && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    A nuvem foi configurada apenas neste navegador. Outros dispositivos so acessarao os mesmos dados se a configuracao for movida para <code>public/supabase-runtime-config.js</code> ou para as variaveis de ambiente do build.
                  </Alert>
                )}

                {cloudStatus?.connected && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Supabase conectado. Sincronizacao automatica ativa.
                  </Alert>
                )}

                {cloudStatus?.enabled && !cloudStatus?.connected && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Supabase configurado, mas sem conexao. Verifique internet, URL e chave.
                  </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Storage sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4">{totalRecords}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Registros totais
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
                      <Typography variant="h4">{clientes.length}</Typography>
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
                        Emprestimos
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {lastSync && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ultima sincronizacao: {lastSync.toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={syncing ? <CircularProgress size={20} /> : <Sync />}
                    onClick={handleSync}
                    disabled={syncing || !currentInstituicao}
                  >
                    {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<CloudDone />}
                    onClick={handleDownloadFromCloud}
                    disabled={syncing || !isCloudEnabled || !currentInstituicao}
                  >
                    Baixar da nuvem
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Launch />}
                    component="a"
                    href={browserConfigUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Configurar neste navegador
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Backup />}
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  >
                    Abrir dashboard
                  </Button>
                </Box>

                <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Ativacao para qualquer dispositivo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Para os dados aparecerem de qualquer lugar, a configuracao da nuvem precisa estar compartilhada no deploy. O arquivo indicado e <code>public/supabase-runtime-config.js</code>. Salvar credenciais no localStorage resolve apenas neste navegador.
                  </Typography>
                </Paper>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Configuracoes de sincronizacao
                </Typography>

                <FormControlLabel
                  control={<Switch checked disabled />}
                  label="Sincronizacao automatica habilitada pelo sistema"
                />

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Beneficios da nuvem Supabase
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Acesso multi-dispositivo"
                      secondary="Acesse seus dados de qualquer lugar"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Backup automatico"
                      secondary="Persistencia em nuvem para evitar perda por dispositivo"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Seguranca SSL/TLS"
                      secondary="Criptografia nas conexoes com a nuvem"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Sincronizacao entre aparelhos"
                      secondary="Um cadastro feito em um dispositivo pode aparecer nos demais"
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
