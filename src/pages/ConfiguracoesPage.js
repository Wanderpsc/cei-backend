import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Avatar,
  Divider,
  Alert,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import {
  Settings,
  Save,
  Image as ImageIcon,
  Delete,
  School,
  CheckCircle
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

export default function ConfiguracoesPage() {
  const { 
    instituicoes,
    usuarioLogado,
    instituicaoAtiva,
    atualizarInstituicao
  } = useData();

  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [configs, setConfigs] = useState({
    // Configurações de Cabeçalho
    tituloCabecalho: '',
    subtituloCabecalho: '',
    logoCabecalho: '',
    corCabecalho: '#667eea',
    
    // Configurações de Emblema/Logo
    logoEscola: '',
    descricaoLogo: '',
    
    // Configurações de Rodapé
    textoRodape: '',
    enderecoRodape: '',
    telefoneRodape: '',
    emailRodape: '',
    siteRodape: '',
    redesSociais: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const logoInputRef = useRef(null);
  const emblemaInputRef = useRef(null);

  // Carregar configurações salvas da instituição
  useEffect(() => {
    const instituicao = instituicoes.find(i => i.id === instituicaoAtiva);
    if (instituicao) {
      setConfigs({
        tituloCabecalho: instituicao.tituloCabecalho || instituicao.nomeInstituicao || '',
        subtituloCabecalho: instituicao.subtituloCabecalho || `${instituicao.cidade || ''}, ${instituicao.estado || ''}`,
        logoCabecalho: instituicao.logoCabecalho || '',
        corCabecalho: instituicao.corCabecalho || '#667eea',
        logoEscola: instituicao.logoEscola || '',
        descricaoLogo: instituicao.descricaoLogo || '',
        textoRodape: instituicao.textoRodape || `© ${new Date().getFullYear()} ${instituicao.nomeInstituicao || 'Escola'}. Todos os direitos reservados.`,
        enderecoRodape: instituicao.enderecoRodape || instituicao.endereco || '',
        telefoneRodape: instituicao.telefoneRodape || instituicao.telefone || '',
        emailRodape: instituicao.emailRodape || instituicao.email || '',
        siteRodape: instituicao.siteRodape || '',
        redesSociais: instituicao.redesSociais || {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      });
    }
  }, [instituicaoAtiva, instituicoes]);

  const handleImagemUpload = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        setErro('A imagem deve ter no máximo 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (tipo === 'logo') {
          setConfigs(prev => ({ ...prev, logoCabecalho: reader.result }));
        } else if (tipo === 'emblema') {
          setConfigs(prev => ({ ...prev, logoEscola: reader.result }));
        }
        setErro('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverImagem = (tipo) => {
    if (tipo === 'logo') {
      setConfigs(prev => ({ ...prev, logoCabecalho: '' }));
    } else if (tipo === 'emblema') {
      setConfigs(prev => ({ ...prev, logoEscola: '' }));
    }
  };

  const handleSalvar = () => {
    try {
      const instituicao = instituicoes.find(i => i.id === instituicaoAtiva);
      if (!instituicao) {
        setErro('Instituição não encontrada');
        return;
      }

      // Atualizar instituição com as novas configurações
      const instituicaoAtualizada = {
        ...instituicao,
        ...configs,
        // Manter compatibilidade com sistema de relatórios
        configRelatorios: {
          titulo: configs.tituloCabecalho,
          subtitulo: configs.subtituloCabecalho,
          logoUrl: configs.logoCabecalho
        }
      };

      atualizarInstituicao(instituicaoAtualizada);
      setSucesso(true);
      setErro('');

      setTimeout(() => {
        setSucesso(false);
      }, 3000);

    } catch (error) {
      setErro('Erro ao salvar configurações');
      console.error(error);
    }
  };

  return (
    <Layout title="Configurações da Escola">
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Settings sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" gutterBottom>
            Configurações da Escola
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personalize cabeçalho, emblema e rodapé dos documentos
          </Typography>
        </Box>
      </Box>

      {sucesso && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          Configurações salvas com sucesso!
        </Alert>
      )}

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configurações de Cabeçalho */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" />
                Cabeçalho dos Documentos
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Título Principal"
                    fullWidth
                    value={configs.tituloCabecalho}
                    onChange={(e) => setConfigs({ ...configs, tituloCabecalho: e.target.value })}
                    placeholder="Nome da instituição"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Subtítulo"
                    fullWidth
                    value={configs.subtituloCabecalho}
                    onChange={(e) => setConfigs({ ...configs, subtituloCabecalho: e.target.value })}
                    placeholder="Endereço, cidade, etc."
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Cor do Cabeçalho"
                    type="color"
                    fullWidth
                    value={configs.corCabecalho}
                    onChange={(e) => setConfigs({ ...configs, corCabecalho: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Logo do Cabeçalho
                  </Typography>
                  
                  {configs.logoCabecalho ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={configs.logoCabecalho}
                        alt="Logo"
                        sx={{ width: 120, height: 120, mx: 'auto', mb: 1 }}
                        variant="square"
                      />
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleRemoverImagem('logo')}
                      >
                        Remover
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Clique para adicionar logo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (máx. 2MB)
                      </Typography>
                    </Box>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImagemUpload(e, 'logo')}
                  />
                </Grid>
              </Grid>

              {/* Preview do Cabeçalho */}
              <Paper 
                elevation={0} 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: configs.corCabecalho, 
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  Preview do Cabeçalho:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  {configs.logoCabecalho && (
                    <Avatar
                      src={configs.logoCabecalho}
                      alt="Logo"
                      sx={{ width: 50, height: 50 }}
                      variant="square"
                    />
                  )}
                  <Box>
                    <Typography variant="h6">{configs.tituloCabecalho || 'Título Principal'}</Typography>
                    <Typography variant="body2">{configs.subtituloCabecalho || 'Subtítulo'}</Typography>
                  </Box>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Configurações de Emblema/Logo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon color="primary" />
                Emblema/Logo da Escola
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Descrição do Logo"
                    fullWidth
                    multiline
                    rows={3}
                    value={configs.descricaoLogo}
                    onChange={(e) => setConfigs({ ...configs, descricaoLogo: e.target.value })}
                    placeholder="Breve descrição sobre o emblema da escola"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Emblema Principal
                  </Typography>
                  
                  {configs.logoEscola ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={configs.logoEscola}
                        alt="Emblema"
                        sx={{ width: 150, height: 150, mx: 'auto', mb: 1 }}
                      />
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleRemoverImagem('emblema')}
                      >
                        Remover
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => emblemaInputRef.current?.click()}
                    >
                      <School sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Clique para adicionar emblema
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (máx. 2MB)
                      </Typography>
                    </Box>
                  )}
                  <input
                    ref={emblemaInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImagemUpload(e, 'emblema')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Configurações de Rodapé */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings color="primary" />
                Rodapé dos Documentos
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Texto do Rodapé"
                    fullWidth
                    multiline
                    rows={2}
                    value={configs.textoRodape}
                    onChange={(e) => setConfigs({ ...configs, textoRodape: e.target.value })}
                    placeholder="© 2026 Nome da Escola. Todos os direitos reservados."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Endereço Completo"
                    fullWidth
                    value={configs.enderecoRodape}
                    onChange={(e) => setConfigs({ ...configs, enderecoRodape: e.target.value })}
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Telefone"
                    fullWidth
                    value={configs.telefoneRodape}
                    onChange={(e) => setConfigs({ ...configs, telefoneRodape: e.target.value })}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="E-mail"
                    fullWidth
                    type="email"
                    value={configs.emailRodape}
                    onChange={(e) => setConfigs({ ...configs, emailRodape: e.target.value })}
                    placeholder="contato@escola.com.br"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Site"
                    fullWidth
                    value={configs.siteRodape}
                    onChange={(e) => setConfigs({ ...configs, siteRodape: e.target.value })}
                    placeholder="www.escola.com.br"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Redes Sociais
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Facebook"
                    fullWidth
                    value={configs.redesSociais.facebook}
                    onChange={(e) => setConfigs({ 
                      ...configs, 
                      redesSociais: { ...configs.redesSociais, facebook: e.target.value }
                    })}
                    placeholder="facebook.com/escola"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Instagram"
                    fullWidth
                    value={configs.redesSociais.instagram}
                    onChange={(e) => setConfigs({ 
                      ...configs, 
                      redesSociais: { ...configs.redesSociais, instagram: e.target.value }
                    })}
                    placeholder="@escola"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Twitter/X"
                    fullWidth
                    value={configs.redesSociais.twitter}
                    onChange={(e) => setConfigs({ 
                      ...configs, 
                      redesSociais: { ...configs.redesSociais, twitter: e.target.value }
                    })}
                    placeholder="@escola"
                  />
                </Grid>
              </Grid>

              {/* Preview do Rodapé */}
              <Paper elevation={0} sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Preview do Rodapé:
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {configs.textoRodape || 'Texto do rodapé'}
                </Typography>
                {configs.enderecoRodape && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    📍 {configs.enderecoRodape}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  {configs.telefoneRodape && (
                    <Chip label={`📞 ${configs.telefoneRodape}`} size="small" />
                  )}
                  {configs.emailRodape && (
                    <Chip label={`✉️ ${configs.emailRodape}`} size="small" />
                  )}
                  {configs.siteRodape && (
                    <Chip label={`🌐 ${configs.siteRodape}`} size="small" />
                  )}
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Botão de Salvar */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSalvar}
              sx={{ minWidth: 200 }}
            >
              Salvar Configurações
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Layout>
  );
}
