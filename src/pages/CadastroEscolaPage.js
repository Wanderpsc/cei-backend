import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  FormHelperText
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ContratoModal from '../components/ContratoModal';

export default function CadastroEscolaPage() {
  const { getPlanosAtivos } = useData();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(0);
  const [erro, setErro] = useState('');
  const [mostrarContrato, setMostrarContrato] = useState(false);
  const [contratoAceito, setContratoAceito] = useState(null);
  const [formData, setFormData] = useState({
    // Dados da Instituição
    nomeInstituicao: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    planoId: '',
    
    // Dados do Responsável
    nomeResponsavel: '',
    cpfResponsavel: '',
    telefoneResponsavel: '',
    emailResponsavel: '',
    cargoResponsavel: '',
    
    // Dados de Acesso
    loginAdmin: '',
    senhaAdmin: '',
    confirmarSenha: ''
  });

  const planosDisponiveis = getPlanosAtivos();
  const etapas = ['Dados da Instituição', 'Responsável', 'Criar Acesso'];

  // Funções de máscara
  const aplicarMascaraCPF = (valor) => {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return valor;
  };

  const aplicarMascaraCNPJ = (valor) => {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 14) {
      valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
      valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return valor;
  };

  const aplicarMascaraCelular = (valor) => {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 11) {
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return valor;
  };

  const aplicarMascaraTelefone = (valor) => {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return aplicarMascaraCelular(valor);
    }
    return valor;
  };

  const aplicarMascaraCEP = (valor) => {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 8) {
      valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    return valor;
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto > 9 ? 0 : resto;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto > 9 ? 0 : resto;
    
    return digito1 === parseInt(cpf.charAt(9)) && digito2 === parseInt(cpf.charAt(10));
  };

  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado == digitos.charAt(1);
  };

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (campo) => (e) => {
    let valor = e.target.value;
    
    // Aplicar máscaras específicas
    if (campo === 'cpfResponsavel') {
      valor = aplicarMascaraCPF(valor);
    } else if (campo === 'cnpj') {
      valor = aplicarMascaraCNPJ(valor);
    } else if (campo === 'telefoneResponsavel' || campo === 'telefone') {
      valor = aplicarMascaraTelefone(valor);
    } else if (campo === 'cep') {
      valor = aplicarMascaraCEP(valor);
    }
    
    setFormData({ ...formData, [campo]: valor });
  };

  const handleProximo = () => {
    if (etapa === 0 && !validarDadosInstituicao()) return;
    if (etapa === 1 && !validarDadosResponsavel()) return;
    
    if (etapa < 2) {
      setEtapa(etapa + 1);
    } else {
      handleSubmit();
    }
  };

  const validarDadosInstituicao = () => {
    // Validar campos obrigatórios
    if (!formData.nomeInstituicao.trim()) {
      setErro('Nome da instituição é obrigatório');
      return false;
    }
    
    if (!formData.cnpj.trim()) {
      setErro('CNPJ é obrigatório');
      return false;
    }
    
    if (!validarCNPJ(formData.cnpj)) {
      setErro('CNPJ inválido');
      return false;
    }
    
    if (!formData.telefone.trim()) {
      setErro('Telefone é obrigatório');
      return false;
    }
    
    const telefoneNumeros = formData.telefone.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) {
      setErro('Telefone inválido. Use o formato (99) 9999-9999 ou (99) 9 9999-9999');
      return false;
    }
    
    if (!formData.email.trim()) {
      setErro('Email é obrigatório');
      return false;
    }
    
    if (!validarEmail(formData.email)) {
      setErro('Email inválido');
      return false;
    }
    
    if (!formData.endereco.trim()) {
      setErro('Endereço é obrigatório');
      return false;
    }
    
    if (!formData.cidade.trim()) {
      setErro('Cidade é obrigatória');
      return false;
    }
    
    if (!formData.estado.trim()) {
      setErro('Estado é obrigatório');
      return false;
    }
    
    if (!formData.cep.trim()) {
      setErro('CEP é obrigatório');
      return false;
    }
    
    const cepNumeros = formData.cep.replace(/\D/g, '');
    if (cepNumeros.length !== 8) {
      setErro('CEP inválido. Use o formato 99999-999');
      return false;
    }
    
    if (!formData.planoId) {
      setErro('Selecione um plano');
      return false;
    }
    
    setErro('');
    return true;
  };

  const validarDadosResponsavel = () => {
    if (!formData.nomeResponsavel.trim()) {
      setErro('Nome do responsável é obrigatório');
      return false;
    }
    
    if (!formData.cpfResponsavel.trim()) {
      setErro('CPF do responsável é obrigatório');
      return false;
    }
    
    if (!validarCPF(formData.cpfResponsavel)) {
      setErro('CPF inválido');
      return false;
    }
    
    if (!formData.telefoneResponsavel.trim()) {
      setErro('Telefone do responsável é obrigatório');
      return false;
    }
    
    const telefoneNumeros = formData.telefoneResponsavel.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) {
      setErro('Telefone inválido');
      return false;
    }
    
    if (!formData.emailResponsavel.trim()) {
      setErro('Email do responsável é obrigatório');
      return false;
    }
    
    if (!validarEmail(formData.emailResponsavel)) {
      setErro('Email do responsável inválido');
      return false;
    }
    
    if (!formData.cargoResponsavel.trim()) {
      setErro('Cargo do responsável é obrigatório');
      return false;
    }
    
    setErro('');
    return true;
  };

  const handleSubmit = () => {
    if (!formData.loginAdmin.trim()) {
      setErro('Login é obrigatório');
      return;
    }
    
    if (formData.loginAdmin.length < 4) {
      setErro('Login deve ter no mínimo 4 caracteres');
      return;
    }
    
    if (!formData.senhaAdmin.trim()) {
      setErro('Senha é obrigatória');
      return;
    }

    if (formData.senhaAdmin.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    if (!formData.confirmarSenha.trim()) {
      setErro('Confirme a senha');
      return;
    }

    if (formData.senhaAdmin !== formData.confirmarSenha) {
      setErro('As senhas não conferem');
      return;
    }

    // Abrir modal de contrato
    setErro('');
    setMostrarContrato(true);
  };

  const handleContratoAceito = (dadosAceite) => {
    setContratoAceito(dadosAceite);
    setMostrarContrato(false);

    try {
      const planoSelecionado = planosDisponiveis.find(p => p.id === parseInt(formData.planoId));
      
      // Redirecionar para a página de pagamento com dados do contrato
      navigate('/pagamento', {
        state: {
          dadosCadastro: formData,
          planoSelecionado: planoSelecionado,
          contratoAceito: dadosAceite
        }
      });
    } catch (error) {
      setErro('Erro ao processar. Tente novamente.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Cadastro de Nova Instituição
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sistema CEI - Controle Escolar Inteligente
            </Typography>
          </Box>

          <Stepper activeStep={etapa} sx={{ mb: 4 }}>
            {etapas.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {erro && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>
              {erro}
            </Alert>
          )}

          {/* ETAPA 0 - Dados da Instituição */}
          {etapa === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nome da Instituição *"
                  fullWidth
                  required
                  value={formData.nomeInstituicao}
                  onChange={handleChange('nomeInstituicao')}
                  placeholder="Ex: Escola Municipal João Silva"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CNPJ *"
                  fullWidth
                  required
                  value={formData.cnpj}
                  onChange={handleChange('cnpj')}
                  placeholder="99.999.999/9999-99"
                  helperText="Formato: 99.999.999/9999-99"
                  inputProps={{ maxLength: 18 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone/Celular *"
                  fullWidth
                  required
                  value={formData.telefone}
                  onChange={handleChange('telefone')}
                  placeholder="(99) 9 9999-9999"
                  helperText="Formato: (99) 9 9999-9999"
                  inputProps={{ maxLength: 16 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Institucional *"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="contato@escola.com.br"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Endereço *"
                  fullWidth
                  required
                  value={formData.endereco}
                  onChange={handleChange('endereco')}
                  placeholder="Rua, número, complemento"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Cidade *"
                  fullWidth
                  required
                  value={formData.cidade}
                  onChange={handleChange('cidade')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Estado *"
                  fullWidth
                  required
                  value={formData.estado}
                  onChange={handleChange('estado')}
                  placeholder="Ex: SP, RJ, MG"
                  inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="CEP *"
                  fullWidth
                  required
                  value={formData.cep}
                  onChange={handleChange('cep')}
                  placeholder="99999-999"
                  helperText="Formato: 99999-999"
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  select
                  label="Escolha seu Plano *"
                  fullWidth
                  required
                  value={formData.planoId}
                  onChange={handleChange('planoId')}
                  helperText="Selecione a duração da sua assinatura"
                >
                  {planosDisponiveis.length === 0 ? (
                    <MenuItem value="" disabled>
                      Nenhum plano disponível no momento
                    </MenuItem>
                  ) : (
                    planosDisponiveis.map((plano) => (
                      <MenuItem key={plano.id} value={plano.id}>
                        {plano.nome} - R$ {plano.valor.toFixed(2)} ({plano.dias} dias)
                      </MenuItem>
                    ))
                  )}
                </TextField>
                {formData.planoId && planosDisponiveis.find(p => p.id === parseInt(formData.planoId)) && (
                  <FormHelperText>
                    Valor por dia: R$ {(planosDisponiveis.find(p => p.id === parseInt(formData.planoId)).valor / 
                      planosDisponiveis.find(p => p.id === parseInt(formData.planoId)).dias).toFixed(2)}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          )}

          {/* ETAPA 1 - Dados do Responsável */}
          {etapa === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nome Completo do Responsável *"
                  fullWidth
                  required
                  value={formData.nomeResponsavel}
                  onChange={handleChange('nomeResponsavel')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CPF *"
                  fullWidth
                  required
                  value={formData.cpfResponsavel}
                  onChange={handleChange('cpfResponsavel')}
                  placeholder="999.999.999-99"
                  helperText="Formato: 999.999.999-99"
                  inputProps={{ maxLength: 14 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone/Celular *"
                  fullWidth
                  required
                  value={formData.telefoneResponsavel}
                  onChange={handleChange('telefoneResponsavel')}
                  placeholder="(99) 9 9999-9999"
                  helperText="Formato: (99) 9 9999-9999"
                  inputProps={{ maxLength: 16 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email *"
                  type="email"
                  fullWidth
                  required
                  value={formData.emailResponsavel}
                  onChange={handleChange('emailResponsavel')}
                  placeholder="responsavel@email.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Cargo/Função *"
                  fullWidth
                  required
                  value={formData.cargoResponsavel}
                  onChange={handleChange('cargoResponsavel')}
                  placeholder="Ex: Diretor, Coordenador Pedagógico"
                />
              </Grid>
            </Grid>
          )}

          {/* ETAPA 2 - Criar Acesso */}
          {etapa === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Crie seu login e senha para acessar o sistema após a aprovação
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Login de Acesso *"
                  fullWidth
                  required
                  value={formData.loginAdmin}
                  onChange={handleChange('loginAdmin')}
                  helperText="Mínimo 4 caracteres. Sem espaços."
                  inputProps={{ minLength: 4 }}
                  autoComplete="username"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Senha *"
                  type="password"
                  fullWidth
                  required
                  value={formData.senhaAdmin}
                  onChange={handleChange('senhaAdmin')}
                  helperText="Mínimo 6 caracteres"
                  inputProps={{ minLength: 6 }}
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirmar Senha *"
                  type="password"
                  fullWidth
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange('confirmarSenha')}
                  helperText="Digite a mesma senha novamente"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={etapa === 0}
              onClick={() => setEtapa(etapa - 1)}
            >
              Voltar
            </Button>
            <Box>
              <Button onClick={() => navigate('/login')} sx={{ mr: 1 }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleProximo}
              >
                {etapa === 2 ? 'Finalizar Cadastro' : 'Próximo'}
              </Button>
            </Box>
          </Box>
          
          {/* Marca Registrada no rodapé do formulário */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              © {new Date().getFullYear()} CEI - Controle Escolar Inteligente
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Sistema desenvolvido por <strong>Wander Pires Silva Coelho</strong> ®
            </Typography>
          </Box>
        </Paper>

        {/* Modal de Contrato */}
        <ContratoModal
          open={mostrarContrato}
          onClose={() => setMostrarContrato(false)}
          onAceitar={handleContratoAceito}
          dadosInstituicao={{
            nome: formData.nomeInstituicao,
            cnpj: formData.cnpj,
            responsavel: formData.nomeResponsavel,
            plano: planosDisponiveis.find(p => p.id === parseInt(formData.planoId))?.nome || 'Não selecionado'
          }}
        />
      </Box>
    </Container>
  );
}
