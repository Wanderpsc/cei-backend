import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  Add,
  AssignmentTurnedIn,
  Print,
  Receipt,
  Refresh,
  Visibility
} from '@mui/icons-material';
import { imprimirEscopo } from '../utils/printUtils';

const DEFAULT_PREFEITURA_CURIMATA = {
  razaoSocial: '',
  cnpj: '',
  endereco: '',
  cep: '',
  municipio: '',
  uf: '',
  telefone: '',
  email: ''
};

const DEFAULT_PRESTADOR = {
  razaoSocial: '',
  nomeFantasia: 'CEI - Controle Escolar Inteligente',
  tipoDocumento: 'CPF',
  documento: '',
  inscricaoMunicipal: '',
  endereco: '',
  cep: '',
  municipio: '',
  uf: '',
  telefone: '',
  email: ''
};

const FORM_DEFAULT = {
  instituicaoClienteId: '',
  serie: 'A1',
  competencia: new Date().toISOString().slice(0, 7),
  codigoServico: '1.05',
  naturezaOperacao: 'Prestação de serviço de licenciamento de software',
  descricaoServico: 'Licença mensal do sistema CEI - Controle Escolar Inteligente',
  valorServico: 0,
  aliquotaISS: 2,
  observacoes: ''
};

const STORAGE_PRESTADOR = 'cei_nf_prestador_config';
const STORAGE_PREFEITURA = 'cei_nf_prefeitura_config';

function somenteDigitos(value) {
  return (value || '').replace(/\D/g, '');
}

function formatarValor(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarCompetencia(competencia) {
  if (!competencia || competencia.length !== 7) return '-';
  const [ano, mes] = competencia.split('-');
  return `${mes}/${ano}`;
}

function gerarChaveControle(numero, instituicaoId) {
  const base = `${numero}-${instituicaoId}-${Date.now()}`;
  const encoded = btoa(unescape(encodeURIComponent(base))).replace(/=+$/g, '');
  return encoded.slice(0, 20).toUpperCase();
}

function validarDocumento(documento, tipoDocumento) {
  const digits = somenteDigitos(documento);
  if (tipoDocumento === 'CPF') return digits.length === 11;
  if (tipoDocumento === 'CNPJ') return digits.length === 14;
  return false;
}

function aplicarMascaraDocumento(value, tipoDocumento) {
  const digits = somenteDigitos(value);

  if (tipoDocumento === 'CPF') {
    const cpf = digits.slice(0, 11);
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  }

  const cnpj = digits.slice(0, 14);
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
  if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
  if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
}

function aplicarMascaraCEP(value) {
  const digits = somenteDigitos(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function aplicarMascaraTelefone(value) {
  const digits = somenteDigitos(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isCepIncompleto(value) {
  const digits = somenteDigitos(value);
  return digits.length > 0 && digits.length < 8;
}

function isTelefoneIncompleto(value) {
  const digits = somenteDigitos(value);
  return digits.length > 0 && digits.length !== 10 && digits.length !== 11;
}

function isDocumentoIncompleto(value, tipoDocumento) {
  const digits = somenteDigitos(value);
  if (digits.length === 0) return false;
  if (tipoDocumento === 'CPF') return digits.length < 11;
  if (tipoDocumento === 'CNPJ') return digits.length < 14;
  return false;
}

export default function NotaFiscalPage() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const TEST_EMAIL_TOKEN = process.env.REACT_APP_TEST_EMAIL_TOKEN || '';

  const { 
    usuarioLogado, 
    instituicoes,
    notasFiscais, 
    adicionarNotaFiscal
  } = useData();
  
  const [open, setOpen] = useState(false);
  const [visualizarOpen, setVisualizarOpen] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(null);
  const [prestador, setPrestador] = useState(DEFAULT_PRESTADOR);
  const [prefeituraBeneficiada, setPrefeituraBeneficiada] = useState(DEFAULT_PREFEITURA_CURIMATA);
  const [erroFormulario, setErroFormulario] = useState('');
  const [openTesteEmail, setOpenTesteEmail] = useState(false);
  const [enviandoTesteEmail, setEnviandoTesteEmail] = useState(false);
  const [feedbackTesteEmail, setFeedbackTesteEmail] = useState({ tipo: '', mensagem: '' });
  const [testeEmailData, setTesteEmailData] = useState({
    compradorEmail: '',
    compradorNome: '',
    instituicaoNome: '',
    planoNome: 'Plano 1 Ano (365 dias)',
    valor: 970
  });
  
  const [formData, setFormData] = useState(FORM_DEFAULT);

  const instituicoesTomadoras = useMemo(
    () => instituicoes.filter((inst) => inst.id !== 0),
    [instituicoes]
  );

  useEffect(() => {
    try {
      const prestadorSalvo = localStorage.getItem(STORAGE_PRESTADOR);
      if (prestadorSalvo) {
        const parsedPrestador = JSON.parse(prestadorSalvo);
        const documentoMigrado = parsedPrestador.documento || parsedPrestador.cnpj || '';
        const tipoMigrado = parsedPrestador.tipoDocumento || (somenteDigitos(documentoMigrado).length === 11 ? 'CPF' : 'CNPJ');
        setPrestador({
          ...DEFAULT_PRESTADOR,
          ...parsedPrestador,
          tipoDocumento: tipoMigrado,
          documento: documentoMigrado
        });
      }
      const prefeituraSalva = localStorage.getItem(STORAGE_PREFEITURA);
      if (prefeituraSalva) {
        setPrefeituraBeneficiada({ ...DEFAULT_PREFEITURA_CURIMATA, ...JSON.parse(prefeituraSalva) });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações fiscais:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_PRESTADOR, JSON.stringify(prestador));
  }, [prestador]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFEITURA, JSON.stringify(prefeituraBeneficiada));
  }, [prefeituraBeneficiada]);

  const valorISS = (formData.valorServico * formData.aliquotaISS) / 100;
  const valorLiquido = formData.valorServico - valorISS;

  const emissaoBloqueada =
    !formData.instituicaoClienteId ||
    !formData.competencia ||
    !formData.descricaoServico?.trim() ||
    !formData.valorServico ||
    formData.valorServico <= 0 ||
    !prestador.razaoSocial?.trim() ||
    !validarDocumento(prestador.documento, prestador.tipoDocumento) ||
    isDocumentoIncompleto(prestador.documento, prestador.tipoDocumento) ||
    isCepIncompleto(prestador.cep) ||
    isTelefoneIncompleto(prestador.telefone) ||
    isCepIncompleto(prefeituraBeneficiada.cep) ||
    isTelefoneIncompleto(prefeituraBeneficiada.telefone);

  const handleOpen = () => {
    setFormData(FORM_DEFAULT);
    setErroFormulario('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validarFormulario = () => {
    if (!formData.instituicaoClienteId) return 'Selecione a instituição tomadora.';
    if (!formData.descricaoServico?.trim()) return 'Informe a descrição do serviço.';
    if (!formData.valorServico || formData.valorServico <= 0) return 'Informe um valor de serviço válido.';
    if (!formData.competencia) return 'Informe a competência da nota.';
    if (!prestador.razaoSocial?.trim()) return 'Informe a razão social do prestador.';
    if (!validarDocumento(prestador.documento, prestador.tipoDocumento)) {
      return `Informe um ${prestador.tipoDocumento} válido do prestador.`;
    }
    if (!prefeituraBeneficiada.razaoSocial?.trim()) return 'Informe o órgão/município beneficiado.';
    return '';
  };

  const handleSubmit = () => {
    const erro = validarFormulario();
    if (erro) {
      setErroFormulario(erro);
      return;
    }

    const instituicaoCliente = instituicoes.find(i => i.id === formData.instituicaoClienteId);
    
    if (!instituicaoCliente) {
      setErroFormulario('Instituição tomadora não encontrada.');
      return;
    }

    const proximoNumero = notasFiscais.length > 0 ? Math.max(...notasFiscais.map((n) => n.numero || 0)) + 1 : 1;

    const nota = {
      ...formData,
      serie: formData.serie || 'A1',
      status: 'emitida',
      chaveControle: gerarChaveControle(proximoNumero, instituicaoCliente.id),
      clienteNome: instituicaoCliente.nomeInstituicao,
      clienteCnpj: instituicaoCliente.cnpj || 'Não informado',
      clienteEndereco: instituicaoCliente.endereco || 'Não informado',
      clienteCidade: instituicaoCliente.cidade,
      clienteEstado: instituicaoCliente.estado,
      clienteCep: instituicaoCliente.cep || '',
      valorISS,
      valorLiquido,
      instituicaoId: formData.instituicaoClienteId,
      prestadorNome: prestador.razaoSocial,
      prestadorNomeFantasia: prestador.nomeFantasia,
      prestadorDocumentoTipo: prestador.tipoDocumento,
      prestadorDocumento: prestador.documento,
      prestadorCnpj: prestador.tipoDocumento === 'CNPJ' ? prestador.documento : '',
      prestadorInscricaoMunicipal: prestador.inscricaoMunicipal,
      prestadorEndereco: prestador.endereco,
      prestadorCep: prestador.cep,
      prestadorCidade: prestador.municipio,
      prestadorEstado: prestador.uf,
      prestadorTelefone: prestador.telefone,
      prestadorEmail: prestador.email,
      beneficiarioRazaoSocial: prefeituraBeneficiada.razaoSocial,
      beneficiarioCnpj: prefeituraBeneficiada.cnpj,
      beneficiarioEndereco: prefeituraBeneficiada.endereco,
      beneficiarioCep: prefeituraBeneficiada.cep,
      beneficiarioCidade: prefeituraBeneficiada.municipio,
      beneficiarioEstado: prefeituraBeneficiada.uf,
      beneficiarioTelefone: prefeituraBeneficiada.telefone,
      beneficiarioEmail: prefeituraBeneficiada.email
    };

    adicionarNotaFiscal(nota);
    setErroFormulario('');
    handleClose();
  };

  const handleVisualizar = (nota) => {
    setNotaSelecionada(nota);
    setVisualizarOpen(true);
  };

  const handleImprimir = (nota) => {
    setNotaSelecionada(nota);
    setVisualizarOpen(true);
    setTimeout(() => imprimirEscopo(), 300);
  };

  const abrirTesteEmail = () => {
    const instituicaoBase = instituicoesTomadoras[0];
    setTesteEmailData({
      compradorEmail: instituicaoBase?.email || '',
      compradorNome: instituicaoBase?.nomeResponsavel || '',
      instituicaoNome: instituicaoBase?.nomeInstituicao || '',
      planoNome: instituicaoBase?.plano || 'Plano 1 Ano (365 dias)',
      valor: instituicaoBase?.valorMensal || 970
    });
    setFeedbackTesteEmail({ tipo: '', mensagem: '' });
    setOpenTesteEmail(true);
  };

  const enviarTesteEmail = async () => {
    if (!testeEmailData.compradorEmail?.trim()) {
      setFeedbackTesteEmail({ tipo: 'error', mensagem: 'Informe o e-mail do comprador para o teste.' });
      return;
    }

    setEnviandoTesteEmail(true);
    setFeedbackTesteEmail({ tipo: '', mensagem: '' });

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (TEST_EMAIL_TOKEN) {
        headers['x-test-token'] = TEST_EMAIL_TOKEN;
      }

      const response = await fetch(`${API_URL}/api/test-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testeEmailData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Falha no envio de e-mail de teste.');
      }

      const destinatarios = Array.isArray(result.recipients) ? result.recipients.join(', ') : 'comprador + proprietário';
      setFeedbackTesteEmail({
        tipo: 'success',
        mensagem: `Teste enviado com sucesso para: ${destinatarios}`
      });
    } catch (error) {
      setFeedbackTesteEmail({ tipo: 'error', mensagem: error.message || 'Erro ao enviar teste de e-mail.' });
    } finally {
      setEnviandoTesteEmail(false);
    }
  };

  const notasFiltradas = notasFiscais;

  const totalEmitido = notasFiltradas.reduce((acc, n) => acc + n.valorServico, 0);
  const totalISS = notasFiltradas.reduce((acc, n) => acc + n.valorISS, 0);

  if (usuarioLogado?.perfil !== 'SuperAdmin') {
    return (
      <Layout title="Notas Fiscais de Serviço (ISS)">
        <Alert severity="error">Acesso negado. Apenas o Super Administrador pode emitir e visualizar notas fiscais.</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Notas Fiscais de Serviço (ISS)">
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }} className="no-print">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Emitir Nova Nota Fiscal
        </Button>
        <Button
          variant="outlined"
          startIcon={<Receipt />}
          onClick={abrirTesteEmail}
        >
          Testar E-mails
        </Button>
      </Box>

      {feedbackTesteEmail.mensagem && (
        <Alert severity={feedbackTesteEmail.tipo || 'info'} sx={{ mb: 2 }} className="no-print">
          {feedbackTesteEmail.mensagem}
        </Alert>
      )}

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Emitido
              </Typography>
              <Typography variant="h4">
                R$ {totalEmitido.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total ISS Retido
              </Typography>
              <Typography variant="h4">
                R$ {totalISS.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Notas Emitidas
              </Typography>
              <Typography variant="h4">
                {notasFiltradas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Notas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Série</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Tomador</TableCell>
              <TableCell>Competência</TableCell>
              <TableCell>Valor Serviço</TableCell>
              <TableCell>ISS</TableCell>
              <TableCell>Valor Líquido</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="text.secondary">
                    Nenhuma nota fiscal emitida
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              notasFiltradas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>
                    <Chip label={`NF ${nota.numero}`} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{nota.serie || 'A1'}</TableCell>
                  <TableCell>
                    {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{nota.clienteNome}</TableCell>
                  <TableCell>{formatarCompetencia(nota.competencia)}</TableCell>
                  <TableCell>R$ {nota.valorServico.toFixed(2)}</TableCell>
                  <TableCell>{formatarValor(nota.valorISS)}</TableCell>
                  <TableCell>R$ {nota.valorLiquido.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={nota.status || 'emitida'}
                      size="small"
                      color={(nota.status || 'emitida') === 'emitida' ? 'success' : 'default'}
                      icon={<AssignmentTurnedIn />}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleVisualizar(nota)}
                      title="Visualizar"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleImprimir(nota)}
                      title="Imprimir"
                    >
                      <Print />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Emissão */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt />
            Emitir Nota Fiscal de Serviço (ISS)
          </Box>
        </DialogTitle>
        <DialogContent>
          {erroFormulario && <Alert severity="warning" sx={{ mt: 2 }}>{erroFormulario}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="primary">
              Dados do Prestador
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Razão Social *"
                  fullWidth
                  value={prestador.razaoSocial}
                  onChange={(e) => setPrestador({ ...prestador, razaoSocial: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={prestador.tipoDocumento}
                    label="Tipo"
                    onChange={(e) => {
                      const novoTipo = e.target.value;
                      setPrestador({
                        ...prestador,
                        tipoDocumento: novoTipo,
                        documento: aplicarMascaraDocumento(prestador.documento, novoTipo)
                      });
                    }}
                  >
                    <MenuItem value="CPF">CPF</MenuItem>
                    <MenuItem value="CNPJ">CNPJ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label={`${prestador.tipoDocumento} *`}
                  fullWidth
                  value={prestador.documento}
                  onChange={(e) => {
                    const valorFormatado = aplicarMascaraDocumento(e.target.value, prestador.tipoDocumento);
                    setPrestador({ ...prestador, documento: valorFormatado });
                  }}
                  error={isDocumentoIncompleto(prestador.documento, prestador.tipoDocumento)}
                  helperText={
                    isDocumentoIncompleto(prestador.documento, prestador.tipoDocumento)
                      ? `${prestador.tipoDocumento} incompleto.`
                      : prestador.tipoDocumento === 'CPF'
                        ? 'Formato: 000.000.000-00'
                        : 'Formato: 00.000.000/0000-00'
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome Fantasia"
                  fullWidth
                  value={prestador.nomeFantasia}
                  onChange={(e) => setPrestador({ ...prestador, nomeFantasia: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Inscrição Municipal"
                  fullWidth
                  value={prestador.inscricaoMunicipal}
                  onChange={(e) => setPrestador({ ...prestador, inscricaoMunicipal: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Endereço"
                  fullWidth
                  value={prestador.endereco}
                  onChange={(e) => setPrestador({ ...prestador, endereco: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CEP"
                  fullWidth
                  value={prestador.cep}
                  onChange={(e) => setPrestador({ ...prestador, cep: aplicarMascaraCEP(e.target.value) })}
                  error={isCepIncompleto(prestador.cep)}
                  helperText={isCepIncompleto(prestador.cep) ? 'CEP incompleto. Use 8 dígitos.' : 'Formato: 00000-000'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Município"
                  fullWidth
                  value={prestador.municipio}
                  onChange={(e) => setPrestador({ ...prestador, municipio: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="UF"
                  fullWidth
                  value={prestador.uf}
                  onChange={(e) => setPrestador({ ...prestador, uf: e.target.value.toUpperCase() })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Telefone"
                  fullWidth
                  value={prestador.telefone}
                  onChange={(e) => setPrestador({ ...prestador, telefone: aplicarMascaraTelefone(e.target.value) })}
                  error={isTelefoneIncompleto(prestador.telefone)}
                  helperText={isTelefoneIncompleto(prestador.telefone) ? 'Telefone incompleto. Use DDD + número.' : 'Formato: (00) 0000-0000 ou (00) 00000-0000'}
                />
              </Grid>
            </Grid>

            <Divider />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Município/Órgão Beneficiado
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={() => setPrefeituraBeneficiada(DEFAULT_PREFEITURA_CURIMATA)}
              >
                Restaurar Curimatá-PI
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Órgão Beneficiado *"
                  fullWidth
                  value={prefeituraBeneficiada.razaoSocial}
                  onChange={(e) => setPrefeituraBeneficiada({ ...prefeituraBeneficiada, razaoSocial: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CNPJ"
                  fullWidth
                  value={prefeituraBeneficiada.cnpj}
                  onChange={(e) => setPrefeituraBeneficiada({ ...prefeituraBeneficiada, cnpj: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Endereço"
                  fullWidth
                  value={prefeituraBeneficiada.endereco}
                  onChange={(e) => setPrefeituraBeneficiada({ ...prefeituraBeneficiada, endereco: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CEP"
                  fullWidth
                  value={prefeituraBeneficiada.cep}
                  onChange={(e) => setPrefeituraBeneficiada({ ...prefeituraBeneficiada, cep: aplicarMascaraCEP(e.target.value) })}
                  error={isCepIncompleto(prefeituraBeneficiada.cep)}
                  helperText={isCepIncompleto(prefeituraBeneficiada.cep) ? 'CEP incompleto. Use 8 dígitos.' : 'Formato: 00000-000'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Município"
                  fullWidth
                  value={prefeituraBeneficiada.municipio}
                  onChange={(e) => setPrefeituraBeneficiada({ ...prefeituraBeneficiada, municipio: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="UF"
                  fullWidth
                  value={prefeituraBeneficiada.uf}
                  onChange={(e) => setPrefeituraBeneficiada({ ...prefeituraBeneficiada, uf: e.target.value.toUpperCase() })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Telefone"
                  fullWidth
                  value={prefeituraBeneficiada.telefone}
                  onChange={(e) => setPrefeituraBeneficiada({ ...prefeituraBeneficiada, telefone: aplicarMascaraTelefone(e.target.value) })}
                  error={isTelefoneIncompleto(prefeituraBeneficiada.telefone)}
                  helperText={isTelefoneIncompleto(prefeituraBeneficiada.telefone) ? 'Telefone incompleto. Use DDD + número.' : 'Formato: (00) 0000-0000 ou (00) 00000-0000'}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" color="primary">Dados do Tomador (Escola)</Typography>
            <FormControl fullWidth>
              <InputLabel>Selecione a Escola *</InputLabel>
              <Select
                value={formData.instituicaoClienteId}
                label="Selecione a Escola *"
                onChange={(e) => setFormData({ ...formData, instituicaoClienteId: e.target.value })}
              >
                {instituicoesTomadoras.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.nomeInstituicao} - {inst.cidade}/{inst.estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            <Typography variant="subtitle2" color="primary">Dados do Serviço</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Série"
                  fullWidth
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Competência (AAAA-MM) *"
                  fullWidth
                  type="month"
                  value={formData.competencia}
                  onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Código do Serviço"
                  fullWidth
                  value={formData.codigoServico}
                  onChange={(e) => setFormData({ ...formData, codigoServico: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Natureza da Operação"
              fullWidth
              value={formData.naturezaOperacao}
              onChange={(e) => setFormData({ ...formData, naturezaOperacao: e.target.value })}
            />

            <TextField
              label="Descrição do Serviço *"
              fullWidth
              multiline
              rows={3}
              value={formData.descricaoServico}
              onChange={(e) => setFormData({ ...formData, descricaoServico: e.target.value })}
              placeholder="Ex: Licença mensal do sistema CEI - Controle Escolar Inteligente - Plano Premium"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valor do Serviço (R$) *"
                  fullWidth
                  type="number"
                  value={formData.valorServico}
                  onChange={(e) => setFormData({ ...formData, valorServico: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01, min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Alíquota ISS (%)"
                  fullWidth
                  type="number"
                  value={formData.aliquotaISS}
                  onChange={(e) => setFormData({ ...formData, aliquotaISS: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  helperText="Defina conforme regra municipal"
                />
              </Grid>
            </Grid>

            {formData.valorServico > 0 && (
              <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography><strong>Valor do Serviço:</strong> {formatarValor(formData.valorServico)}</Typography>
                <Typography><strong>ISS ({formData.aliquotaISS}%):</strong> {formatarValor(valorISS)}</Typography>
                <Typography variant="h6" color="primary">
                  <strong>Valor Líquido:</strong> {formatarValor(valorLiquido)}
                </Typography>
              </Box>
            )}

            <TextField
              label="Observações"
              fullWidth
              multiline
              rows={2}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={<Receipt />}
            disabled={emissaoBloqueada}
          >
            Emitir Nota Fiscal
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTesteEmail} onClose={() => setOpenTesteEmail(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Testar envio de e-mails</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Este teste envia confirmação para o e-mail informado e para o e-mail do proprietário configurado no backend.
            </Alert>
            <TextField
              label="E-mail do comprador *"
              type="email"
              fullWidth
              value={testeEmailData.compradorEmail}
              onChange={(e) => setTesteEmailData({ ...testeEmailData, compradorEmail: e.target.value })}
            />
            <TextField
              label="Nome do comprador"
              fullWidth
              value={testeEmailData.compradorNome}
              onChange={(e) => setTesteEmailData({ ...testeEmailData, compradorNome: e.target.value })}
            />
            <TextField
              label="Instituição"
              fullWidth
              value={testeEmailData.instituicaoNome}
              onChange={(e) => setTesteEmailData({ ...testeEmailData, instituicaoNome: e.target.value })}
            />
            <TextField
              label="Plano"
              fullWidth
              value={testeEmailData.planoNome}
              onChange={(e) => setTesteEmailData({ ...testeEmailData, planoNome: e.target.value })}
            />
            <TextField
              label="Valor (R$)"
              type="number"
              fullWidth
              value={testeEmailData.valor}
              onChange={(e) => setTesteEmailData({ ...testeEmailData, valor: parseFloat(e.target.value) || 0 })}
              inputProps={{ step: 0.01, min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTesteEmail(false)}>Fechar</Button>
          <Button variant="contained" onClick={enviarTesteEmail} disabled={enviandoTesteEmail}>
            {enviandoTesteEmail ? 'Enviando...' : 'Enviar teste'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização/Impressão */}
      {notaSelecionada && (
        <Dialog 
          open={visualizarOpen} 
          onClose={() => setVisualizarOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="no-print">
              <span>Nota Fiscal de Serviço Nº {notaSelecionada.numero}</span>
              <Button startIcon={<Print />} onClick={() => imprimirEscopo()} variant="outlined">
                Imprimir
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              className="print-scope"
              sx={{
                p: 4,
                fontFamily: 'Arial, sans-serif',
                '@media print': {
                  p: 6
                }
              }}
            >
              <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                NOTA FISCAL DE SERVIÇO
              </Typography>
              <Typography variant="h6" align="center" color="primary" gutterBottom>
                Nº {notaSelecionada.numero}
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                Data de Emissão: {new Date(notaSelecionada.dataEmissao).toLocaleDateString('pt-BR')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Competência: {formatarCompetencia(notaSelecionada.competencia)} | Série: {notaSelecionada.serie || 'A1'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Chave de Controle: {notaSelecionada.chaveControle}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>PRESTADOR DO SERVIÇO</Typography>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography><strong>Razão Social:</strong> {notaSelecionada.prestadorNome}</Typography>
                  {notaSelecionada.prestadorNomeFantasia && <Typography><strong>Nome Fantasia:</strong> {notaSelecionada.prestadorNomeFantasia}</Typography>}
                  <Typography><strong>{notaSelecionada.prestadorDocumentoTipo || 'CNPJ'}:</strong> {notaSelecionada.prestadorDocumento || notaSelecionada.prestadorCnpj || '-'}</Typography>
                  {notaSelecionada.prestadorInscricaoMunicipal && <Typography><strong>Inscrição Municipal:</strong> {notaSelecionada.prestadorInscricaoMunicipal}</Typography>}
                  <Typography><strong>Endereço:</strong> {notaSelecionada.prestadorEndereco || '-'}</Typography>
                  <Typography><strong>Município:</strong> {notaSelecionada.prestadorCidade || '-'} - {notaSelecionada.prestadorEstado || '-'}</Typography>
                  {notaSelecionada.prestadorCep && <Typography><strong>CEP:</strong> {notaSelecionada.prestadorCep}</Typography>}
                  {notaSelecionada.prestadorTelefone && <Typography><strong>Telefone:</strong> {notaSelecionada.prestadorTelefone}</Typography>}
                  {notaSelecionada.prestadorEmail && <Typography><strong>E-mail:</strong> {notaSelecionada.prestadorEmail}</Typography>}
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>ÓRGÃO BENEFICIADO / MUNICÍPIO</Typography>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography><strong>Órgão:</strong> {notaSelecionada.beneficiarioRazaoSocial || '-'}</Typography>
                  <Typography><strong>CNPJ:</strong> {notaSelecionada.beneficiarioCnpj || '-'}</Typography>
                  <Typography><strong>Endereço:</strong> {notaSelecionada.beneficiarioEndereco || '-'}</Typography>
                  <Typography><strong>Município/UF:</strong> {(notaSelecionada.beneficiarioCidade || '-')} - {(notaSelecionada.beneficiarioEstado || '-')}</Typography>
                  {notaSelecionada.beneficiarioCep && <Typography><strong>CEP:</strong> {notaSelecionada.beneficiarioCep}</Typography>}
                  {notaSelecionada.beneficiarioTelefone && <Typography><strong>Telefone:</strong> {notaSelecionada.beneficiarioTelefone}</Typography>}
                  {notaSelecionada.beneficiarioEmail && <Typography><strong>E-mail:</strong> {notaSelecionada.beneficiarioEmail}</Typography>}
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>TOMADOR DO SERVIÇO</Typography>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography><strong>Razão Social:</strong> {notaSelecionada.clienteNome}</Typography>
                  <Typography><strong>CNPJ:</strong> {notaSelecionada.clienteCnpj || '-'}</Typography>
                  <Typography><strong>Endereço:</strong> {notaSelecionada.clienteEndereco || '-'}</Typography>
                  <Typography><strong>Município/UF:</strong> {(notaSelecionada.clienteCidade || '-')} - {(notaSelecionada.clienteEstado || '-')}</Typography>
                  {notaSelecionada.clienteCep && <Typography><strong>CEP:</strong> {notaSelecionada.clienteCep}</Typography>}
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>DISCRIMINAÇÃO DO SERVIÇO</Typography>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, minHeight: 100 }}>
                  <Typography><strong>Natureza:</strong> {notaSelecionada.naturezaOperacao || '-'}</Typography>
                  <Typography><strong>Código do Serviço:</strong> {notaSelecionada.codigoServico || '-'}</Typography>
                  <Typography>{notaSelecionada.descricaoServico}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>VALORES</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Valor Total do Serviço</strong></TableCell>
                        <TableCell align="right">{formatarValor(notaSelecionada.valorServico)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>(-) ISS ({notaSelecionada.aliquotaISS}%)</strong></TableCell>
                        <TableCell align="right">{formatarValor(notaSelecionada.valorISS)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Valor Líquido da Nota</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatarValor(notaSelecionada.valorLiquido)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {notaSelecionada.observacoes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>OBSERVAÇÕES</Typography>
                  <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography>{notaSelecionada.observacoes}</Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Documento gerado eletronicamente pelo CEI - Controle Escolar Inteligente para gestão administrativa.
                  Para validade fiscal plena, confirme o fluxo oficial de NFS-e do município competente.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions className="no-print">
            <Button onClick={() => setVisualizarOpen(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Layout>
  );
}
