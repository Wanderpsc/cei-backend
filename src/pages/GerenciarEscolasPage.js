import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Block,
  Delete,
  Info,
  VpnKey,
  CalendarToday
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

export default function GerenciarEscolasPage() {
  const { 
    instituicoes, 
    ativarInstituicao, 
    bloquearInstituicao, 
    removerInstituicao,
    usuarioLogado 
  } = useData();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState(null);
  const [acao, setAcao] = useState('');
  const [diasValidade, setDiasValidade] = useState(365);
  const [motivoBloqueio, setMotivoBloqueio] = useState('');

  // Verificar se é super admin
  if (usuarioLogado?.perfil !== 'SuperAdmin') {
    return (
      <Layout title="Gerenciar Escolas">
        <Alert severity="error">
          Acesso negado. Apenas o Super Administrador pode acessar esta página.
        </Alert>
      </Layout>
    );
  }

  const handleAbrirDialog = (instituicao, tipoAcao) => {
    setInstituicaoSelecionada(instituicao);
    setAcao(tipoAcao);
    // Usar os dias do plano contratado como padrão
    if (tipoAcao === 'ativar' && instituicao.diasLicenca) {
      setDiasValidade(instituicao.diasLicenca);
    }
    setDialogOpen(true);
  };

  const handleFecharDialog = () => {
    setDialogOpen(false);
    setInstituicaoSelecionada(null);
    setAcao('');
    setDiasValidade(365);
    setMotivoBloqueio('');
  };

  const handleConfirmarAcao = () => {
    if (!instituicaoSelecionada) return;

    switch (acao) {
      case 'ativar':
        ativarInstituicao(instituicaoSelecionada.id, diasValidade);
        break;
      case 'bloquear':
        bloquearInstituicao(instituicaoSelecionada.id, motivoBloqueio);
        break;
      case 'remover':
        removerInstituicao(instituicaoSelecionada.id);
        break;
      default:
        break;
    }

    handleFecharDialog();
  };

  const getStatusColor = (status) => {
    const cores = {
      'pendente': 'warning',
      'ativo': 'success',
      'bloqueado': 'error'
    };
    return cores[status] || 'default';
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const calcularDiasRestantes = (dataExpiracao) => {
    if (!dataExpiracao) return null;
    const hoje = new Date();
    const expira = new Date(dataExpiracao);
    const diff = Math.ceil((expira - hoje) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const instituicoesPendentes = instituicoes.filter(i => i.status === 'pendente');
  const instituicoesAtivas = instituicoes.filter(i => i.status === 'ativo');
  const instituicoesBloqueadas = instituicoes.filter(i => i.status === 'bloqueado');

  return (
    <Layout title="Gerenciar Instituições">
      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Aguardando Aprovação
              </Typography>
              <Typography variant="h3" color="warning.main">
                {instituicoesPendentes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Instituições Ativas
              </Typography>
              <Typography variant="h3" color="success.main">
                {instituicoesAtivas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Instituições Bloqueadas
              </Typography>
              <Typography variant="h3" color="error.main">
                {instituicoesBloqueadas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Instituições
              </Typography>
              <Typography variant="h3">
                {instituicoes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Instituições */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Instituição</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Plano Contratado</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Cadastro</TableCell>
              <TableCell>Validade</TableCell>
              <TableCell>Licença</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instituicoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary">
                    Nenhuma instituição cadastrada
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              instituicoes.map((instituicao) => {
                const diasRestantes = calcularDiasRestantes(instituicao.dataExpiracao);
                return (
                  <TableRow key={instituicao.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {instituicao.nomeInstituicao}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {instituicao.cidade}, {instituicao.estado}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {instituicao.nomeResponsavel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {instituicao.cargoResponsavel}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {instituicao.telefone}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {instituicao.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {instituicao.plano || 'Não especificado'}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {instituicao.diasLicenca ? `${instituicao.diasLicenca} dias` : '-'}
                      </Typography>
                      <Typography variant="caption" display="block" color="primary">
                        R$ {(instituicao.valorMensal || 0).toFixed(2)}/mês
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={instituicao.status.toUpperCase()} 
                        size="small" 
                        color={getStatusColor(instituicao.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {formatarData(instituicao.dataCadastro)}
                    </TableCell>
                    <TableCell>
                      {instituicao.status === 'ativo' ? (
                        <>
                          {formatarData(instituicao.dataExpiracao)}
                          <br />
                          <Chip 
                            label={`${diasRestantes} dias`} 
                            size="small"
                            color={diasRestantes < 30 ? 'error' : 'success'}
                            sx={{ mt: 0.5 }}
                          />
                        </>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {instituicao.licenca}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {instituicao.status === 'pendente' && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAbrirDialog(instituicao, 'ativar')}
                            title="Ativar"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                        {instituicao.status === 'ativo' && (
                          <>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleAbrirDialog(instituicao, 'ativar')}
                              title="Renovar"
                            >
                              <CalendarToday />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleAbrirDialog(instituicao, 'bloquear')}
                              title="Bloquear"
                            >
                              <Block />
                            </IconButton>
                          </>
                        )}
                        {instituicao.status === 'bloqueado' && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAbrirDialog(instituicao, 'ativar')}
                            title="Desbloquear"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleAbrirDialog(instituicao, 'remover')}
                          title="Remover"
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAbrirDialog(instituicao, 'info')}
                          title="Detalhes"
                        >
                          <Info />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Ações */}
      <Dialog open={dialogOpen} onClose={handleFecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {acao === 'ativar' && 'Ativar/Renovar Instituição'}
          {acao === 'bloquear' && 'Bloquear Instituição'}
          {acao === 'remover' && 'Remover Instituição'}
          {acao === 'info' && 'Detalhes da Instituição'}
        </DialogTitle>
        <DialogContent>
          {instituicaoSelecionada && (
            <Box sx={{ mt: 2 }}>
              {acao === 'ativar' && (
                <>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Ativar acesso para: <strong>{instituicaoSelecionada.nomeInstituicao}</strong>
                  </Typography>
                  <TextField
                    label="Dias de Validade"
                    type="number"
                    fullWidth
                    value={diasValidade}
                    onChange={(e) => setDiasValidade(parseInt(e.target.value))}
                    select
                  >
                    <MenuItem value={30}>30 dias (1 mês)</MenuItem>
                    <MenuItem value={90}>90 dias (3 meses)</MenuItem>
                    <MenuItem value={180}>180 dias (6 meses)</MenuItem>
                    <MenuItem value={365}>365 dias (1 ano)</MenuItem>
                    <MenuItem value={730}>730 dias (2 anos)</MenuItem>
                  </TextField>
                </>
              )}

              {acao === 'bloquear' && (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    A instituição <strong>{instituicaoSelecionada.nomeInstituicao}</strong> será bloqueada 
                    e não poderá mais acessar o sistema.
                  </Alert>
                  <TextField
                    label="Motivo do Bloqueio"
                    fullWidth
                    multiline
                    rows={3}
                    value={motivoBloqueio}
                    onChange={(e) => setMotivoBloqueio(e.target.value)}
                  />
                </>
              )}

              {acao === 'remover' && (
                <Alert severity="error">
                  <Typography variant="body2" gutterBottom>
                    <strong>ATENÇÃO:</strong> Esta ação é irreversível!
                  </Typography>
                  <Typography variant="body2">
                    Todos os dados da instituição <strong>{instituicaoSelecionada.nomeInstituicao}</strong> serão 
                    permanentemente removidos, incluindo livros, patrimônio, clientes e empréstimos.
                  </Typography>
                </Alert>
              )}

              {acao === 'info' && (
                <Box>
                  <Typography variant="body2"><strong>Instituição:</strong> {instituicaoSelecionada.nomeInstituicao}</Typography>
                  <Typography variant="body2"><strong>CNPJ:</strong> {instituicaoSelecionada.cnpj || '-'}</Typography>
                  <Typography variant="body2"><strong>Endereço:</strong> {instituicaoSelecionada.endereco}</Typography>
                  <Typography variant="body2"><strong>Cidade/Estado:</strong> {instituicaoSelecionada.cidade}, {instituicaoSelecionada.estado}</Typography>
                  <Typography variant="body2"><strong>CEP:</strong> {instituicaoSelecionada.cep}</Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}><strong>Responsável:</strong> {instituicaoSelecionada.nomeResponsavel}</Typography>
                  <Typography variant="body2"><strong>Cargo:</strong> {instituicaoSelecionada.cargoResponsavel}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {instituicaoSelecionada.emailResponsavel}</Typography>
                  <Typography variant="body2"><strong>Telefone:</strong> {instituicaoSelecionada.telefoneResponsavel}</Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}><strong>Código de Licença:</strong> {instituicaoSelecionada.licenca}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {instituicaoSelecionada.status}</Typography>
                  <Typography variant="body2"><strong>Data Cadastro:</strong> {formatarData(instituicaoSelecionada.dataCadastro)}</Typography>
                  {instituicaoSelecionada.dataExpiracao && (
                    <Typography variant="body2"><strong>Data Expiração:</strong> {formatarData(instituicaoSelecionada.dataExpiracao)}</Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialog}>
            {acao === 'info' ? 'Fechar' : 'Cancelar'}
          </Button>
          {acao !== 'info' && (
            <Button
              variant="contained"
              onClick={handleConfirmarAcao}
              color={acao === 'remover' || acao === 'bloquear' ? 'error' : 'primary'}
            >
              Confirmar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
