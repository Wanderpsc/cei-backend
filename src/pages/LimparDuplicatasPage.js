import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import SchoolIcon from '@mui/icons-material/School';

export default function LimparDuplicatasPage() {
  const { instituicoes } = useData();
  const [stats, setStats] = useState(null);
  const [backupFeito, setBackupFeito] = useState(false);
  const [limpezaConcluida, setLimpezaConcluida] = useState(false);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    analisarDados();
  }, [instituicoes]);

  const analisarDados = () => {
    const total = instituicoes.length;
    const comPagamento = instituicoes.filter(i => i.pagamentoConfirmado === true).length;
    const pendentes = instituicoes.filter(i => i.status === 'pendente').length;
    
    // Detectar duplicatas por CNPJ
    const cnpjMap = {};
    instituicoes.forEach(inst => {
      if (!cnpjMap[inst.cnpj]) cnpjMap[inst.cnpj] = [];
      cnpjMap[inst.cnpj].push(inst);
    });
    
    let duplicatas = 0;
    Object.values(cnpjMap).forEach(insts => {
      if (insts.length > 1) duplicatas += (insts.length - 1);
    });

    setStats({
      total,
      comPagamento,
      pendentes,
      duplicatas,
      aposLimpeza: Math.max(comPagamento, 1)
    });
  };

  const fazerBackup = () => {
    setProcessando(true);
    try {
      const dadosAtuais = localStorage.getItem('cei_data');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `cei_data_backup_${timestamp}`;
      
      localStorage.setItem(backupKey, dadosAtuais);
      localStorage.setItem('cei_data_ultimo_backup', backupKey);
      
      setBackupFeito(true);
      setProcessando(false);
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      alert('Erro ao fazer backup! Operação cancelada.');
      setProcessando(false);
      return false;
    }
  };

  const restaurarBackup = () => {
    if (!window.confirm('Deseja restaurar o último backup?')) return;

    try {
      const ultimoBackup = localStorage.getItem('cei_data_ultimo_backup');
      if (!ultimoBackup) {
        alert('Nenhum backup encontrado!');
        return;
      }

      const dadosBackup = localStorage.getItem(ultimoBackup);
      if (!dadosBackup) {
        alert('Backup não encontrado!');
        return;
      }

      localStorage.setItem('cei_data', dadosBackup);
      alert('Backup restaurado com sucesso! Recarregando...');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      alert('Erro ao restaurar backup!');
    }
  };

  const limparDuplicatas = () => {
    if (!backupFeito) {
      alert('Por favor, faça o backup primeiro!');
      return;
    }

    if (!window.confirm(`⚠️ CONFIRMAÇÃO FINAL\n\nSerão mantidas apenas ${stats.aposLimpeza} instituição(ões) válida(s).\n\n${stats.duplicatas} duplicatas serão removidas.\n\nDeseja continuar?`)) {
      return;
    }

    setProcessando(true);

    try {
      const dadosStr = localStorage.getItem('cei_data');
      const dados = JSON.parse(dadosStr);

      // Manter apenas instituições com pagamento confirmado
      let instituicoesValidas = dados.instituicoes.filter(i => i.pagamentoConfirmado === true);
      
      // Se não houver nenhuma, manter a primeira
      if (instituicoesValidas.length === 0) {
        instituicoesValidas = [dados.instituicoes[0]];
      } else {
        // Manter apenas a primeira válida (remover duplicatas)
        const cnpjSet = new Set();
        instituicoesValidas = instituicoesValidas.filter(inst => {
          if (!cnpjSet.has(inst.cnpj)) {
            cnpjSet.add(inst.cnpj);
            return true;
          }
          return false;
        });
      }

      // IDs válidos
      const idsValidos = instituicoesValidas.map(i => i.id);

      // Limpar usuários (manter SuperAdmin e usuários das instituições válidas)
      dados.usuarios = dados.usuarios.filter(u => 
        u.perfil === 'SuperAdmin' || idsValidos.includes(u.instituicaoId)
      );

      // Limpar dados relacionados às instituições removidas
      dados.livros = (dados.livros || []).filter(l => idsValidos.includes(l.instituicaoId));
      dados.clientes = (dados.clientes || []).filter(c => idsValidos.includes(c.instituicaoId));
      dados.emprestimos = (dados.emprestimos || []).filter(e => idsValidos.includes(e.instituicaoId));
      dados.patrimonio = (dados.patrimonio || []).filter(p => idsValidos.includes(p.instituicaoId));

      // Atualizar instituições
      dados.instituicoes = instituicoesValidas;

      // Salvar
      localStorage.setItem('cei_data', JSON.stringify(dados));

      setLimpezaConcluida(true);
      setProcessando(false);

      setTimeout(() => {
        if (window.confirm('Limpeza concluída com sucesso!\n\nDeseja recarregar o sistema agora?')) {
          window.location.reload();
        }
      }, 1000);

    } catch (error) {
      console.error('Erro ao limpar duplicatas:', error);
      alert('Erro ao limpar duplicatas! Use "Restaurar Backup" para recuperar os dados.');
      setProcessando(false);
    }
  };

  if (!stats) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Analisando dados...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            🧹 Limpeza de Duplicatas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ferramenta segura para remover instituições duplicadas
          </Typography>
        </Box>

        {/* Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h4" color="white">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="white">
                  Total de Instituições
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main' }}>
              <CardContent>
                <Typography variant="h4" color="white">
                  {stats.duplicatas}
                </Typography>
                <Typography variant="body2" color="white">
                  Duplicatas Detectadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main' }}>
              <CardContent>
                <Typography variant="h4" color="white">
                  {stats.comPagamento}
                </Typography>
                <Typography variant="body2" color="white">
                  Com Pagamento Confirmado
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main' }}>
              <CardContent>
                <Typography variant="h4" color="white">
                  {stats.aposLimpeza}
                </Typography>
                <Typography variant="body2" color="white">
                  Após Limpeza
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Alertas */}
        {!limpezaConcluida && stats.total > 10 && (
          <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
            <Typography variant="body1" gutterBottom>
              <strong>Atenção: Quantidade anormal de instituições detectada!</strong>
            </Typography>
            <Typography variant="body2">
              Foram encontradas <strong>{stats.total}</strong> instituições cadastradas, sendo <strong>{stats.duplicatas}</strong> duplicatas.
              Esta ferramenta irá manter apenas as instituições com pagamento confirmado.
            </Typography>
          </Alert>
        )}

        {limpezaConcluida && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
            <Typography variant="body1">
              <strong>✅ Limpeza concluída com sucesso!</strong>
            </Typography>
            <Typography variant="body2">
              As duplicatas foram removidas. Recarregue a página para ver as alterações.
            </Typography>
          </Alert>
        )}

        {/* Instituições Válidas */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Instituições que serão mantidas
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List>
              {instituicoes
                .filter(i => i.pagamentoConfirmado === true)
                .slice(0, 5)
                .map((inst, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={inst.nomeInstituicao}
                      secondary={`CNPJ: ${inst.cnpj} | Email: ${inst.email}`}
                    />
                    <Chip label="Pago" color="success" size="small" />
                  </ListItem>
                ))}
              {stats.comPagamento === 0 && (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary={instituicoes[0]?.nomeInstituicao || 'Primeira instituição'}
                    secondary="Será mantida por padrão (nenhuma com pagamento confirmado)"
                  />
                  <Chip label="Padrão" color="info" size="small" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        {processando && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<BackupIcon />}
              onClick={fazerBackup}
              disabled={backupFeito || processando || limpezaConcluida}
            >
              {backupFeito ? '✓ Backup Realizado' : '1. Fazer Backup'}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              startIcon={<DeleteIcon />}
              onClick={limparDuplicatas}
              disabled={!backupFeito || processando || limpezaConcluida}
            >
              2. Limpar Duplicatas
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<RestoreIcon />}
              onClick={restaurarBackup}
              disabled={processando || !backupFeito}
            >
              Restaurar Último Backup
            </Button>
          </Grid>
        </Grid>

        {/* Instruções */}
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2" gutterBottom>
              <strong>📋 Como usar:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              1️⃣ Clique em <strong>"Fazer Backup"</strong> para salvar seus dados atuais<br />
              2️⃣ Clique em <strong>"Limpar Duplicatas"</strong> para remover as duplicatas<br />
              3️⃣ Se algo der errado, use <strong>"Restaurar Backup"</strong> para voltar ao estado anterior<br />
              <br />
              <strong>✅ Totalmente seguro!</strong> Seu backup fica salvo no navegador.
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
}
