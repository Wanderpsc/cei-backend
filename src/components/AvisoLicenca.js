import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, Box, Button, Typography, Chip } from '@mui/material';
import { Warning, Error, AccessTime, DeleteForever } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

export default function AvisoLicenca() {
  const { 
    usuarioLogado, 
    instituicoes, 
    calcularDiasRestantesLicenca,
    calcularDiasGracaRestantes 
  } = useData();
  
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [tipoAviso, setTipoAviso] = useState('');
  const [diasRestantes, setDiasRestantes] = useState(null);
  const [diasGraca, setDiasGraca] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.perfil === 'SuperAdmin') {
      setMostrarAviso(false);
      return;
    }

    const instituicao = instituicoes.find(i => i.id === usuarioLogado.instituicaoId);
    console.log('⚠️ AvisoLicenca - Instituição:', instituicao);
    
    if (!instituicao) {
      setMostrarAviso(false);
      return;
    }

    console.log('⚠️ AvisoLicenca - Status:', instituicao.status);
    console.log('⚠️ AvisoLicenca - Data Expiração:', instituicao.dataExpiracao);

    // Verificar status da licença
    if (instituicao.status === 'dados_removidos') {
      setTipoAviso('dados_removidos');
      setMostrarAviso(true);
      return;
    }

    if (instituicao.status === 'expirado') {
      const diasGracaRestantes = calcularDiasGracaRestantes(instituicao.id);
      setDiasGraca(diasGracaRestantes);
      setTipoAviso('expirado');
      setMostrarAviso(true);
      return;
    }

    if (instituicao.status === 'ativo') {
      const dias = calcularDiasRestantesLicenca(instituicao.id);
      console.log('⚠️ AvisoLicenca - Dias retornados:', dias);
      setDiasRestantes(dias);
      
      if (dias !== null && dias <= 15) {
        console.log('⚠️ AvisoLicenca - Mostrando aviso! Tipo:', dias <= 7 ? 'critico' : 'aviso');
        setTipoAviso(dias <= 7 ? 'critico' : 'aviso');
        setMostrarAviso(true);
      } else {
        console.log('⚠️ AvisoLicenca - Não mostrar aviso (dias > 15)');
        setMostrarAviso(false);
      }
    }
  }, [usuarioLogado, instituicoes, calcularDiasRestantesLicenca, calcularDiasGracaRestantes]);

  if (!mostrarAviso) return null;

  // Licença dados removidos
  if (tipoAviso === 'dados_removidos') {
    return (
      <Alert 
        severity="error" 
        icon={<DeleteForever />}
        sx={{ mb: 3, borderLeft: '5px solid #d32f2f' }}
      >
        <AlertTitle><strong>⚠️ DADOS REMOVIDOS - LICENÇA EXPIRADA HÁ MAIS DE 30 DIAS</strong></AlertTitle>
        <Typography variant="body2" gutterBottom>
          Sua licença expirou há mais de 30 dias e todos os seus dados foram removidos do sistema 
          por segurança. Seus dados básicos (cadastro da escola) foram preservados.
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Para reativar sua conta:</strong>
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
          <li>Entre em contato com o administrador do sistema</li>
          <li>Renove sua licença</li>
          <li>Recadastre seus dados (livros, alunos, etc.)</li>
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          size="small"
          onClick={() => navigate('/financeiro')}
        >
          Renovar Licença
        </Button>
      </Alert>
    );
  }

  // Licença expirada (período de graça)
  if (tipoAviso === 'expirado') {
    return (
      <Alert 
        severity="error" 
        icon={<Error />}
        sx={{ mb: 3, borderLeft: '5px solid #d32f2f' }}
      >
        <AlertTitle><strong>🚨 LICENÇA EXPIRADA - PERÍODO DE GRAÇA</strong></AlertTitle>
        <Typography variant="body2" gutterBottom>
          Sua licença expirou! Você tem <Chip 
            label={`${diasGraca} dias restantes`} 
            size="small" 
            color="error"
            sx={{ fontWeight: 'bold', mx: 0.5 }}
          /> do período de graça para renovar.
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>⚠️ ATENÇÃO:</strong> Após {diasGraca} dias, todos os seus dados (livros, alunos, 
          empréstimos, etc.) serão <strong>PERMANENTEMENTE REMOVIDOS</strong> do sistema para 
          liberar espaço.
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Seus dados básicos (cadastro da escola) serão preservados para futuros contatos.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={() => navigate('/financeiro')}
          >
            Renovar Agora
          </Button>
          <Typography variant="caption" color="error">
            <AccessTime sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
            Dados serão removidos em {diasGraca} dias
          </Typography>
        </Box>
      </Alert>
    );
  }

  // Licença próxima de expirar (crítico - 7 dias ou menos)
  if (tipoAviso === 'critico') {
    return (
      <Alert 
        severity="error" 
        icon={<Error />}
        sx={{ mb: 3, borderLeft: '5px solid #d32f2f' }}
      >
        <AlertTitle><strong>🚨 URGENTE: Licença expira em {diasRestantes} dias!</strong></AlertTitle>
        <Typography variant="body2" gutterBottom>
          Sua licença está prestes a expirar! Após a expiração, você terá apenas 
          <strong> 30 dias</strong> para renovar antes que seus dados sejam removidos.
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          size="small"
          onClick={() => navigate('/financeiro')}
        >
          Renovar Agora
        </Button>
      </Alert>
    );
  }

  // Licença próxima de expirar (aviso - 15 dias ou menos)
  if (tipoAviso === 'aviso') {
    return (
      <Alert 
        severity="warning" 
        icon={<Warning />}
        sx={{ mb: 3 }}
      >
        <AlertTitle><strong>⚠️ Sua licença expira em {diasRestantes} dias</strong></AlertTitle>
        <Typography variant="body2" gutterBottom>
          Renove sua licença com antecedência para evitar interrupções no serviço.
        </Typography>
        <Button 
          variant="outlined" 
          color="warning" 
          size="small"
          onClick={() => navigate('/financeiro')}
        >
          Ver Opções de Renovação
        </Button>
      </Alert>
    );
  }

  return null;
}
