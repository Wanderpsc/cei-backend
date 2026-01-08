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
  CalendarToday,
  Add,
  School,
  Edit
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

export default function GerenciarEscolasPage() {
  const { 
    instituicoes, 
    ativarInstituicao, 
    bloquearInstituicao, 
    removerInstituicao,
    adicionarInstituicao,
    atualizarInstituicao,
    usuarioLogado 
  } = useData();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cadastroDialogOpen, setCadastroDialogOpen] = useState(false);
  const [edicaoDialogOpen, setEdicaoDialogOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState(null);
  const [acao, setAcao] = useState('');
  const [diasValidade, setDiasValidade] = useState(365);
  const [motivoBloqueio, setMotivoBloqueio] = useState('');

  // Estado para cadastro manual
  const [formCadastro, setFormCadastro] = useState({
    nomeInstituicao: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    nomeResponsavel: '',
    cargoResponsavel: '',
    emailResponsavel: '',
    telefoneResponsavel: '',
    nomeEscola: '',
    loginAdmin: '',
    senhaAdmin: '',
    horarioFuncionamento: '',
    diasLicenca: 365,
    plano: '1 Ano (365 dias)',
    valorMensal: 97.00
  });

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

  const handleAbrirCadastro = () => {
    setCadastroDialogOpen(true);
  };

  const handleFecharCadastro = () => {
    setCadastroDialogOpen(false);
    setModoEdicao(false);
    setFormCadastro({
      nomeInstituicao: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      nomeResponsavel: '',
      cargoResponsavel: '',
      emailResponsavel: '',
      telefoneResponsavel: '',
      nomeEscola: '',
      loginAdmin: '',
      senhaAdmin: '',
      horarioFuncionamento: '',
      diasLicenca: 365,
      plano: '1 Ano (365 dias)',
      valorMensal: 97.00
    });
  };

  const handleAbrirEdicao = (instituicao) => {
    setFormCadastro({
      ...instituicao,
      senhaAdmin: '********' // Não mostrar senha real
    });
    setModoEdicao(true);
    setCadastroDialogOpen(true);
  };

  const handleChangeCadastro = (campo, valor) => {
    setFormCadastro(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleConfirmarCadastro = () => {
    // Validações básicas
    if (!formCadastro.nomeInstituicao || !formCadastro.email || !formCadastro.loginAdmin) {
      alert('Preencha todos os campos obrigatórios: Nome da Instituição, Email, Login');
      return;
    }

    // Modo edição
    if (modoEdicao) {
      // Atualizar instituição existente
      const dadosAtualizados = {
        ...formCadastro,
        dataAtualizacao: new Date().toISOString()
      };
      
      // Se senha foi alterada (não é ********), incluir no update
      if (formCadastro.senhaAdmin !== '********') {
        dadosAtualizados.senhaAdmin = formCadastro.senhaAdmin;
      } else {
        delete dadosAtualizados.senhaAdmin; // Não alterar senha
      }
      
      atualizarInstituicao(formCadastro.id, dadosAtualizados);
      alert(`✅ Instituição atualizada com sucesso!\n\nNome: ${formCadastro.nomeInstituicao}`);
      handleFecharCadastro();
      return;
    }

    // Modo cadastro (validar senha obrigatória)
    if (!formCadastro.senhaAdmin) {
      alert('Senha do Admin é obrigatória para novo cadastro');
      return;
    }

    // Calcular data de expiração
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + formCadastro.diasLicenca);

    // Preparar dados para cadastro
    const novaInstituicao = {
      ...formCadastro,
      pagamentoConfirmado: true, // Marcado como pago (cadastro manual pelo admin)
      status: 'ativo', // Já vem ativo
      dataCadastro: new Date().toISOString(),
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: dataExpiracao.toISOString(),
      dataPagamento: new Date().toISOString(),
      ultimoPagamento: new Date().toISOString(),
      metodoPagamento: 'Manual (Admin)',
      cadastroManual: true, // Flag para identificar que foi cadastro manual
      historicoLicencas: [{
        dataAtivacao: new Date().toISOString(),
        dataExpiracao: dataExpiracao.toISOString(),
        diasValidade: formCadastro.diasLicenca,
        renovacao: false
      }]
    };

    // Adicionar instituição
    const instituicaoAdicionada = adicionarInstituicao(novaInstituicao);
    
    if (instituicaoAdicionada) {
      alert(`✅ Instituição cadastrada com sucesso!\n\nNome: ${formCadastro.nomeInstituicao}\nLogin: ${formCadastro.loginAdmin}\nSenha: ${formCadastro.senhaAdmin}\nLicença: ${formCadastro.diasLicenca} dias\n\nA instituição já está ATIVA e pode fazer login.`);
      handleFecharCadastro();
    } else {
      alert('❌ Erro ao cadastrar instituição. Verifique se o CNPJ, Email ou Login já não estão cadastrados.');
    }
  };

  const getStatusColor = (status) => {
    const cores = {
      'pendente': 'warning',
      'ativo': 'success',
      'bloqueado': 'error',
      'expirado': 'error',
      'dados_removidos': 'default'
    };
    return cores[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pendente': 'PENDENTE',
      'ativo': 'ATIVO',
      'bloqueado': 'BLOQUEADO',
      'expirado': 'EXPIRADO',
      'dados_removidos': 'DADOS REMOVIDOS'
    };
    return labels[status] || status.toUpperCase();
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
  const instituicoesExpiradas = instituicoes.filter(i => i.status === 'expirado');
  const instituicoesDadosRemovidos = instituicoes.filter(i => i.status === 'dados_removidos');

  return (
    <Layout title="Gerenciar Instituições">
      {/* Botão de Cadastro Manual */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAbrirCadastro}
          size="large"
        >
          Cadastrar Escola Manualmente
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Cadastre uma nova instituição e forneça licença sem necessidade de pagamento
        </Typography>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                Aguardando Aprovação
              </Typography>
              <Typography variant="h3" color="warning.main">
                {instituicoesPendentes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                Instituições Ativas
              </Typography>
              <Typography variant="h3" color="success.main">
                {instituicoesAtivas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                Bloqueadas
              </Typography>
              <Typography variant="h3" color="error.main">
                {instituicoesBloqueadas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#fff9c4' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                Expiradas (Período de Graça)
              </Typography>
              <Typography variant="h3" color="error.main">
                {instituicoesExpiradas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                Dados Removidos
              </Typography>
              <Typography variant="h3" color="text.secondary">
                {instituicoesDadosRemovidos.length}
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
                        label={getStatusLabel(instituicao.status)} 
                        size="small" 
                        color={getStatusColor(instituicao.status)}
                      />
                      {instituicao.status === 'expirado' && (
                        <Chip 
                          label="30 dias para renovar" 
                          size="small" 
                          color="warning"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                      {instituicao.status === 'dados_removidos' && (
                        <Chip 
                          label="Renovar para restaurar" 
                          size="small" 
                          color="default"
                          sx={{ ml: 0.5 }}
                        />
                      )}
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
                      ) : instituicao.status === 'expirado' ? (
                        <>
                          <Typography variant="caption" color="error" display="block">
                            {formatarData(instituicao.dataExpiracaoReal || instituicao.dataExpiracao)}
                          </Typography>
                          <Chip 
                            label={`${calcularDiasGracaRestantes(instituicao.id)} dias de graça`}
                            size="small"
                            color="warning"
                            sx={{ mt: 0.5 }}
                          />
                        </>
                      ) : instituicao.status === 'dados_removidos' ? (
                        <Typography variant="caption" color="text.secondary">
                          Dados removidos
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {instituicao.licenca}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {/* Botão Editar - sempre disponível */}
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleAbrirEdicao(instituicao)}
                          title="Editar"
                        >
                          <Edit />
                        </IconButton>
                        
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
                        {(instituicao.status === 'expirado' || instituicao.status === 'dados_removidos') && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAbrirDialog(instituicao, 'ativar')}
                            title="Renovar Licença"
                          >
                            <CheckCircle />
                          </IconButton>
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

      {/* Dialog de Cadastro Manual */}
      <Dialog open={cadastroDialogOpen} onClose={handleFecharCadastro} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            {modoEdicao ? 'Editar Instituição' : 'Cadastrar Escola Manualmente'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {!modoEdicao && (
            <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
              <Typography variant="body2">
                <strong>Cadastro pelo Administrador:</strong> A escola será cadastrada diretamente 
                com status ATIVO e licença fornecida automaticamente, sem necessidade de pagamento.
              </Typography>
            </Alert>
          )}
          {modoEdicao && (
            <Alert severity="warning" sx={{ mt: 2, mb: 3 }}>
              <Typography variant="body2">
                <strong>Modo Edição:</strong> Altere os dados da instituição. A senha só será alterada se você digitar uma nova.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Dados da Instituição */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                📋 Dados da Instituição
              </Typography>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome da Instituição *"
                fullWidth
                value={formCadastro.nomeInstituicao}
                onChange={(e) => handleChangeCadastro('nomeInstituicao', e.target.value)}
                placeholder="Ex: Escola Municipal João da Silva"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="CNPJ"
                fullWidth
                value={formCadastro.cnpj}
                onChange={(e) => handleChangeCadastro('cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Endereço"
                fullWidth
                value={formCadastro.endereco}
                onChange={(e) => handleChangeCadastro('endereco', e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </Grid>

            <Grid item xs={12} sm={5}>
              <TextField
                label="Cidade"
                fullWidth
                value={formCadastro.cidade}
                onChange={(e) => handleChangeCadastro('cidade', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Estado"
                fullWidth
                value={formCadastro.estado}
                onChange={(e) => handleChangeCadastro('estado', e.target.value)}
                placeholder="UF"
                inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="CEP"
                fullWidth
                value={formCadastro.cep}
                onChange={(e) => handleChangeCadastro('cep', e.target.value)}
                placeholder="00000-000"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone"
                fullWidth
                value={formCadastro.telefone}
                onChange={(e) => handleChangeCadastro('telefone', e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email da Instituição *"
                fullWidth
                type="email"
                value={formCadastro.email}
                onChange={(e) => handleChangeCadastro('email', e.target.value)}
                placeholder="contato@escola.com.br"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Horário de Funcionamento"
                fullWidth
                value={formCadastro.horarioFuncionamento}
                onChange={(e) => handleChangeCadastro('horarioFuncionamento', e.target.value)}
                placeholder="Ex: 7h às 17h"
              />
            </Grid>

            {/* Dados do Responsável */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                👤 Dados do Responsável
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Responsável"
                fullWidth
                value={formCadastro.nomeResponsavel}
                onChange={(e) => handleChangeCadastro('nomeResponsavel', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Cargo"
                fullWidth
                value={formCadastro.cargoResponsavel}
                onChange={(e) => handleChangeCadastro('cargoResponsavel', e.target.value)}
                placeholder="Ex: Diretor(a)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email do Responsável"
                fullWidth
                type="email"
                value={formCadastro.emailResponsavel}
                onChange={(e) => handleChangeCadastro('emailResponsavel', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone do Responsável"
                fullWidth
                value={formCadastro.telefoneResponsavel}
                onChange={(e) => handleChangeCadastro('telefoneResponsavel', e.target.value)}
              />
            </Grid>

            {/* Dados de Acesso */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                🔐 Dados de Acesso ao Sistema
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Login do Administrador *"
                fullWidth
                value={formCadastro.loginAdmin}
                onChange={(e) => handleChangeCadastro('loginAdmin', e.target.value)}
                placeholder="usuario.admin"
                helperText="Login que a escola usará para acessar o sistema"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Senha do Administrador *"
                fullWidth
                type="text"
                value={formCadastro.senhaAdmin}
                onChange={(e) => handleChangeCadastro('senhaAdmin', e.target.value)}
                placeholder="Senha inicial"
                helperText="A escola poderá alterar depois"
              />
            </Grid>

            {/* Configurações de Licença */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                📅 Configurações de Licença
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Plano"
                fullWidth
                select
                value={formCadastro.plano}
                onChange={(e) => {
                  const plano = e.target.value;
                  handleChangeCadastro('plano', plano);
                  // Atualizar dias e valor baseado no plano
                  const planosMap = {
                    '1 Mês (30 dias)': { dias: 30, valor: 97.00 },
                    '3 Meses (90 dias)': { dias: 90, valor: 270.00 },
                    '6 Meses (180 dias)': { dias: 180, valor: 520.00 },
                    '1 Ano (365 dias)': { dias: 365, valor: 970.00 },
                    '2 Anos (730 dias)': { dias: 730, valor: 1800.00 }
                  };
                  if (planosMap[plano]) {
                    handleChangeCadastro('diasLicenca', planosMap[plano].dias);
                    handleChangeCadastro('valorMensal', planosMap[plano].valor);
                  }
                }}
              >
                <MenuItem value="1 Mês (30 dias)">1 Mês (30 dias)</MenuItem>
                <MenuItem value="3 Meses (90 dias)">3 Meses (90 dias)</MenuItem>
                <MenuItem value="6 Meses (180 dias)">6 Meses (180 dias)</MenuItem>
                <MenuItem value="1 Ano (365 dias)">1 Ano (365 dias)</MenuItem>
                <MenuItem value="2 Anos (730 dias)">2 Anos (730 dias)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Dias de Licença *"
                fullWidth
                type="number"
                value={formCadastro.diasLicenca}
                onChange={(e) => handleChangeCadastro('diasLicenca', parseInt(e.target.value) || 0)}
                inputProps={{ min: 1 }}
                helperText="Validade da licença em dias"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Valor (R$)"
                fullWidth
                type="number"
                value={formCadastro.valorMensal}
                onChange={(e) => handleChangeCadastro('valorMensal', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.01, min: 0 }}
                helperText="Apenas para registro"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ✅ A instituição será cadastrada com status <strong>ATIVO</strong> e poderá 
                  fazer login imediatamente com as credenciais fornecidas.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharCadastro}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmarCadastro}
            startIcon={modoEdicao ? <Edit /> : <Add />}
          >
            {modoEdicao ? 'Salvar Alterações' : 'Cadastrar e Ativar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
