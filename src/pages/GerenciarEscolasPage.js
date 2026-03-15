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
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  CheckCircle,
  Block,
  Delete,
  DeleteForever,
  Info,
  VpnKey,
  CalendarToday,
  Add,
  School,
  Edit,
  Print,
  Analytics
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { imprimirEscopo } from '../utils/printUtils';

export default function GerenciarEscolasPage() {
  const { 
    instituicoes, 
    ativarInstituicao, 
    bloquearInstituicao, 
    removerInstituicao,
    removerTodasInstituicoes,
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
  const [excluirTodasOpen, setExcluirTodasOpen] = useState(false);
  const [analiseOpen, setAnaliseOpen] = useState(false);
  const [filtroExclusao, setFiltroExclusao] = useState('pendentes');
  const [usarExclusaoExataTeste, setUsarExclusaoExataTeste] = useState(false);

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

  const handleImprimirDetalhes = () => {
    imprimirEscopo();
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
        if (formCadastro.senhaAdmin.length < 8) {
          alert('A senha deve ter no mínimo 8 caracteres.');
          return;
        }
        if (!/[A-Z]/.test(formCadastro.senhaAdmin)) {
          alert('A senha deve conter pelo menos 1 letra maiúscula.');
          return;
        }
        if (!/[a-z]/.test(formCadastro.senhaAdmin)) {
          alert('A senha deve conter pelo menos 1 letra minúscula.');
          return;
        }
        if (!/[0-9]/.test(formCadastro.senhaAdmin)) {
          alert('A senha deve conter pelo menos 1 número.');
          return;
        }
        if (!/[^A-Za-z0-9]/.test(formCadastro.senhaAdmin)) {
          alert('A senha deve conter pelo menos 1 caractere especial.');
          return;
        }
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

    if (formCadastro.senhaAdmin.length < 8) {
      alert('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(formCadastro.senhaAdmin)) {
      alert('A senha deve conter pelo menos 1 letra maiúscula.');
      return;
    }
    if (!/[a-z]/.test(formCadastro.senhaAdmin)) {
      alert('A senha deve conter pelo menos 1 letra minúscula.');
      return;
    }
    if (!/[0-9]/.test(formCadastro.senhaAdmin)) {
      alert('A senha deve conter pelo menos 1 número.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(formCadastro.senhaAdmin)) {
      alert('A senha deve conter pelo menos 1 caractere especial.');
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

  // ──────────────────── ANÁLISE: TESTE vs COMPRADOR ────────────────────
  const classificarInstituicao = (inst) => {
    const nome = String(inst.nomeInstituicao || '').toLowerCase();
    const email = String(inst.email || inst.emailResponsavel || '').toLowerCase();
    const cnpj = String(inst.cnpj || '').replace(/\D/g, '');
    const login = String(inst.loginAdmin || '').toLowerCase();

    const sinaisTeste = [];
    const sinaisComprador = [];

    // Palavras-chave de teste
    const palavrasTeste = ['teste', 'test', 'demo', 'exemplo', 'sample', 'prova', 'experimento', 'fake', 'lixo', 'aaa', 'bbb', 'xxx', 'zzz', 'abc'];
    if (palavrasTeste.some(p => nome.includes(p))) sinaisTeste.push('Nome sugere teste');
    if (palavrasTeste.some(p => email.includes(p))) sinaisTeste.push('Email sugere teste');
    if (palavrasTeste.some(p => login.includes(p))) sinaisTeste.push('Login sugere teste');

    // CNPJ inválido/fictício
    if (cnpj.length === 14) {
      const todosIguais = cnpj.split('').every(c => c === cnpj[0]);
      if (todosIguais || cnpj === '00000000000000') sinaisTeste.push('CNPJ fictício');
    } else if (!cnpj) {
      sinaisTeste.push('Sem CNPJ');
    }

    // Nunca pagou e nunca ativou com data de cadastro antiga
    const diasSinceCadastro = inst.dataCadastro
      ? Math.floor((Date.now() - new Date(inst.dataCadastro)) / 86400000)
      : 0;
    if (inst.status === 'pendente' && diasSinceCadastro > 30) sinaisTeste.push('Pendente há +30 dias');
    if (inst.status === 'pendente' && diasSinceCadastro <= 7) sinaisComprador.push('Cadastro recente (≤7 dias)');

    // Sinais de comprador real
    if (inst.telefone && inst.telefone.replace(/\D/g, '').length >= 10) sinaisComprador.push('Telefone válido');
    if (inst.cidade && inst.estado) sinaisComprador.push('Localização informada');
    if (inst.nomeResponsavel && inst.nomeResponsavel.split(' ').length >= 2) sinaisComprador.push('Nome completo do responsável');
    if (inst.status === 'ativo') sinaisComprador.push('Escola ativa (pagou)');
    if (inst.pagamentoConfirmado) sinaisComprador.push('Pagamento confirmado');
    if (inst.cadastroManual) sinaisComprador.push('Cadastro manual pelo admin');

    const pontosTeste = sinaisTeste.length;
    const pontosComprador = sinaisComprador.length;

    let classificacao = 'indefinido';
    if (pontosTeste >= 2 && pontosTeste > pontosComprador) classificacao = 'teste';
    else if (pontosComprador >= 2 && pontosComprador > pontosTeste) classificacao = 'comprador';

    return { classificacao, sinaisTeste, sinaisComprador };
  };

  const analise = instituicoes.map((inst) => ({
    ...inst,
    ...classificarInstituicao(inst)
  }));

  const isCadastroTesteExato = (inst) => {
    const licenca = String(inst?.licenca || '').toUpperCase();
    const loginAdmin = String(inst?.loginAdmin || '').toLowerCase();
    const email = String(inst?.email || inst?.emailResponsavel || '').toLowerCase();
    const statusFinanceiro = String(inst?.statusFinanceiro || '').toLowerCase();
    const origemCadastro = String(inst?.origemCadastro || '').toLowerCase();

    return (
      Boolean(inst?.contaTeste) ||
      statusFinanceiro === 'teste' ||
      origemCadastro === 'demo_login' ||
      licenca.includes('DEMO') ||
      loginAdmin === 'demo' ||
      loginAdmin.startsWith('demo_') ||
      email.endsWith('@cei-demo.com.br')
    );
  };

  const totalTeste = analise.filter(a => a.classificacao === 'teste').length;
  const totalTesteExato = instituicoes.filter(isCadastroTesteExato).length;
  const totalTesteOuPendente = instituicoes.filter((inst) => {
    const ehTeste = usarExclusaoExataTeste
      ? isCadastroTesteExato(inst)
      : analise.some((a) => a.id === inst.id && a.classificacao === 'teste');
    return ehTeste || inst.status === 'pendente';
  }).length;
  const totalComprador = analise.filter(a => a.classificacao === 'comprador').length;
  const totalIndefinido = analise.filter(a => a.classificacao === 'indefinido').length;

  // ──────────────────── EXCLUIR EM LOTE ────────────────────
  const getIdsParaExcluir = () => {
    const testesSelecionados = usarExclusaoExataTeste
      ? instituicoes.filter(isCadastroTesteExato)
      : analise.filter(a => a.classificacao === 'teste');

    if (filtroExclusao === 'pendentes') {
      return instituicoes.filter(i => i.status === 'pendente').map(i => i.id);
    }
    if (filtroExclusao === 'testes') {
      return testesSelecionados.map(a => a.id);
    }
    if (filtroExclusao === 'testes_e_pendentes') {
      return instituicoes
        .filter((inst) => {
          const ehTeste = usarExclusaoExataTeste
            ? isCadastroTesteExato(inst)
            : analise.some((a) => a.id === inst.id && a.classificacao === 'teste');
          return ehTeste || inst.status === 'pendente';
        })
        .map((a) => a.id);
    }
    if (filtroExclusao === 'todas') {
      return instituicoes.map(i => i.id);
    }
    return [];
  };

  const handleConfirmarExclusaoLote = () => {
    const ids = getIdsParaExcluir();
    if (ids.length === 0) {
      alert('Nenhuma instituição encontrada com o critério selecionado.');
      return;
    }
    const confirmacao = window.confirm(
      `⚠️ CONFIRMAR EXCLUSÃO EM LOTE\n\n` +
      `Serão excluídas ${ids.length} instituições e todos os seus dados.\n\n` +
      `Esta ação é IRREVERSÍVEL.\n\nDeseja confirmar?`
    );
    if (confirmacao) {
      removerTodasInstituicoes(ids);
      setExcluirTodasOpen(false);
      alert(`✅ ${ids.length} instituição(ões) excluída(s) com sucesso.`);
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
      {/* Botões de Ação */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAbrirCadastro}
          size="large"
        >
          Cadastrar Escola Manualmente
        </Button>
        <Button
          variant="outlined"
          color="info"
          startIcon={<Analytics />}
          onClick={() => setAnaliseOpen(true)}
          size="large"
        >
          Analisar Registros
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForever />}
          onClick={() => setExcluirTodasOpen(true)}
          size="large"
        >
          Excluir em Lote
        </Button>
        <Typography variant="caption" display="block" sx={{ width: '100%', color: 'text.secondary' }}>
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
                      {instituicao.origemCadastro === 'demo_login' && (
                        <Chip
                          label="Origem: Demo (Login)"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
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

      {/* ── Dialog: Análise de Registros ── */}
      <Dialog open={analiseOpen} onClose={() => setAnaliseOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Analytics color="info" />
            Análise de Registros — {instituicoes.length} instituições
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffebee', textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">{totalTeste}</Typography>
                <Typography variant="body2">Prováveis Testes</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">{totalComprador}</Typography>
                <Typography variant="body2">Prováveis Compradores</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">{totalIndefinido}</Typography>
                <Typography variant="body2">Indefinidos</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 2 }}>
            A classificação é automática e baseada em: nome/email/login com palavras-chave de teste, CNPJ fictício, tempo sem ativação, telefone válido, localização e status de pagamento.
          </Alert>

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Instituição</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Classificação</TableCell>
                  <TableCell>Evidências</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analise.map((inst) => (
                  <TableRow key={inst.id} sx={{
                    bgcolor: inst.classificacao === 'teste' ? '#fff5f5' :
                             inst.classificacao === 'comprador' ? '#f5fff5' : 'inherit'
                  }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{inst.nomeInstituicao}</Typography>
                      <Typography variant="caption" color="text.secondary">{inst.email || inst.emailResponsavel}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(inst.status)} size="small" color={getStatusColor(inst.status)} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={inst.classificacao === 'teste' ? '🧪 Teste' : inst.classificacao === 'comprador' ? '💰 Comprador' : '❓ Indefinido'}
                        size="small"
                        color={inst.classificacao === 'teste' ? 'error' : inst.classificacao === 'comprador' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {inst.sinaisTeste.length > 0 && (
                        <Typography variant="caption" color="error.main" display="block">
                          ⚠️ {inst.sinaisTeste.join('; ')}
                        </Typography>
                      )}
                      {inst.sinaisComprador.length > 0 && (
                        <Typography variant="caption" color="success.main" display="block">
                          ✅ {inst.sinaisComprador.join('; ')}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnaliseOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Excluir em Lote ── */}
      <Dialog open={excluirTodasOpen} onClose={() => setExcluirTodasOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteForever color="error" />
            Excluir Instituições em Lote
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            <strong>ATENÇÃO:</strong> A exclusão é permanente e irá remover todos os dados relacionados (livros, alunos, empréstimos, etc.).
          </Alert>
          <TextField
            select
            fullWidth
            label="O que deseja excluir?"
            value={filtroExclusao}
            onChange={(e) => setFiltroExclusao(e.target.value)}
          >
            <MenuItem value="pendentes">
              Apenas pendentes ({instituicoes.filter(i => i.status === 'pendente').length})
            </MenuItem>
            <MenuItem value="testes">
              Apenas testes ({usarExclusaoExataTeste ? totalTesteExato : totalTeste})
            </MenuItem>
            <MenuItem value="testes_e_pendentes">
              Testes + Pendentes ({totalTesteOuPendente})
            </MenuItem>
            <MenuItem value="todas">
              TODAS as instituições ({instituicoes.length}) ⚠️
            </MenuItem>
          </TextField>
          {(filtroExclusao === 'testes' || filtroExclusao === 'testes_e_pendentes') && (
            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox
                  checked={usarExclusaoExataTeste}
                  onChange={(e) => setUsarExclusaoExataTeste(e.target.checked)}
                />
              }
              label="Exclusão exata dos cadastros teste (somente registros marcados como teste/demo)"
            />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Serão excluídas: <strong>{getIdsParaExcluir().length} instituição(ões)</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcluirTodasOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteForever />}
            onClick={handleConfirmarExclusaoLote}
            disabled={getIdsParaExcluir().length === 0}
          >
            Excluir {getIdsParaExcluir().length} Instituição(ões)
          </Button>
        </DialogActions>
      </Dialog>

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
                <Box className="print-scope">
                  <Typography className="print-only" variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    Detalhes da Instituição
                  </Typography>
                  <Typography className="print-only" variant="body2" sx={{ mb: 2 }}>
                    Emitido em: {new Date().toLocaleString('pt-BR')}
                  </Typography>
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
        <DialogActions className="no-print">
          {acao === 'info' && (
            <Button variant="outlined" startIcon={<Print />} onClick={handleImprimirDetalhes}>
              Imprimir Detalhes
            </Button>
          )}
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
