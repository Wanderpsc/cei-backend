/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA CEI - CONTROLE ESCOLAR INTELIGENTE
 * © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
 * 
 * Este software é propriedade exclusiva e protegida por lei.
 * Uso não autorizado é crime - Lei 9.609/98 e Lei 9.610/98
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  PrivacyTip as PrivacyIcon
} from '@mui/icons-material';

export default function TermosDeUsoPage() {
  const navigate = useNavigate();
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [expandido, setExpandido] = useState({
    termos: false,
    privacidade: false,
    licenca: false
  });

  const handleAceitar = () => {
    if (!aceitouTermos || !aceitouPrivacidade) {
      alert('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    // Salvar aceite
    localStorage.setItem('termos_aceitos', 'true');
    localStorage.setItem('termos_data', new Date().toISOString());

    // Redirecionar para cadastro
    navigate('/cadastro-escola');
  };

  const toggleExpand = (secao) => {
    setExpandido({
      ...expandido,
      [secao]: !expandido[secao]
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Termos de Uso e Políticas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema CEI - Controle Escolar Inteligente
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Aviso de Copyright */}
        <Alert severity="warning" icon={<SecurityIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            SOFTWARE PROPRIETÁRIO PROTEGIDO POR LEI
          </Typography>
          <Typography variant="body2">
            Este sistema é protegido pelas Leis nº 9.609/98 (Lei do Software) e nº 9.610/98 
            (Direitos Autorais). Uso não autorizado é crime com pena de detenção e multa.
          </Typography>
        </Alert>

        {/* Seção 1: Termos de Uso */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GavelIcon color="primary" />
              <Typography variant="h6">Termos de Uso e Serviço</Typography>
            </Box>
            <IconButton onClick={() => toggleExpand('termos')}>
              <ExpandMoreIcon sx={{ transform: expandido.termos ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Box>
          
          <Collapse in={expandido.termos}>
            <Box sx={{ p: 2, pt: 0, maxHeight: 300, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                1. ACEITE DOS TERMOS
              </Typography>
              <Typography variant="body2" paragraph>
                Ao utilizar o Sistema CEI, você concorda integralmente com estes termos.
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                2. PROPRIEDADE INTELECTUAL
              </Typography>
              <Typography variant="body2" paragraph>
                O Sistema é propriedade exclusiva de Wander Pires Silva Coelho, protegido por:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Lei nº 9.609/98 (Lei do Software)</li>
                <li>Lei nº 9.610/98 (Direitos Autorais)</li>
                <li>Código Penal, Art. 184 (Crime de Violação)</li>
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                3. LICENÇA DE USO
              </Typography>
              <Typography variant="body2" paragraph>
                Licença NÃO EXCLUSIVA e NÃO TRANSFERÍVEL na modalidade SaaS.
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                4. PLANOS E VALORES
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li><strong>Básico</strong>: R$ 29,90/mês - Até 100 livros</li>
                <li><strong>Intermediário</strong>: R$ 49,90/mês - Ilimitado + Patrimônio</li>
                <li><strong>Premium</strong>: R$ 79,90/mês - Multi-unidade + API</li>
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                5. PROIBIÇÕES
              </Typography>
              <Typography variant="body2" paragraph color="error">
                É ESTRITAMENTE PROIBIDO: copiar, clonar, modificar, sublicenciar, 
                fazer engenharia reversa ou distribuir o Sistema.
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                6. PENALIDADES
              </Typography>
              <Typography variant="body2" paragraph color="error">
                • Indenização mínima: R$ 50.000,00<br />
                • Processo criminal: Art. 184 do CP<br />
                • Pena: Detenção de 6 meses a 2 anos
              </Typography>
            </Box>
          </Collapse>
        </Paper>

        {/* Seção 2: Política de Privacidade */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PrivacyIcon color="primary" />
              <Typography variant="h6">Política de Privacidade (LGPD)</Typography>
            </Box>
            <IconButton onClick={() => toggleExpand('privacidade')}>
              <ExpandMoreIcon sx={{ transform: expandido.privacidade ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Box>
          
          <Collapse in={expandido.privacidade}>
            <Box sx={{ p: 2, pt: 0, maxHeight: 300, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                DADOS COLETADOS
              </Typography>
              <Typography variant="body2" paragraph>
                • Dados cadastrais (nome, e-mail, CPF, telefone)<br />
                • Dados de alunos e funcionários<br />
                • Histórico de empréstimos<br />
                • Logs de acesso e auditoria
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                FINALIDADE
              </Typography>
              <Typography variant="body2" paragraph>
                Os dados são usados exclusivamente para prestação do serviço, 
                geração de relatórios e suporte técnico.
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                SEGURANÇA
              </Typography>
              <Typography variant="body2" paragraph>
                • Criptografia SSL/TLS em todas as comunicações<br />
                • Senha com hash bcrypt<br />
                • Backup diário automático<br />
                • Autenticação de dois fatores (2FA) disponível<br />
                • Auditoria completa de acessos
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                SEUS DIREITOS (LGPD)
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Acesso aos seus dados</li>
                <li>Correção de dados incorretos</li>
                <li>Exclusão de dados (mediante cancelamento)</li>
                <li>Portabilidade de dados</li>
                <li>Revogação de consentimento</li>
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                DPO (ENCARREGADO)
              </Typography>
              <Typography variant="body2">
                <strong>Nome</strong>: Wander Pires Silva Coelho<br />
                <strong>E-mail</strong>: dpo@sistemaeci.com.br
              </Typography>
            </Box>
          </Collapse>
        </Paper>

        {/* Seção 3: Licença de Software */}
        <Paper variant="outlined" sx={{ mb: 3 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6">Licença Proprietária</Typography>
            </Box>
            <IconButton onClick={() => toggleExpand('licenca')}>
              <ExpandMoreIcon sx={{ transform: expandido.licenca ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Box>
          
          <Collapse in={expandido.licenca}>
            <Box sx={{ p: 2, pt: 0, maxHeight: 300, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" paragraph>
                <strong>SISTEMA CEI - CONTROLE ESCOLAR INTELIGENTE</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
              </Typography>
              
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                AUTOR E PROPRIETÁRIO
              </Typography>
              <Typography variant="body2" paragraph>
                Wander Pires Silva Coelho - Desenvolvedor único e exclusivo
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                RESTRIÇÕES
              </Typography>
              <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
                <li>Uso exclusivo mediante licença paga</li>
                <li>Proibida cópia, reprodução ou distribuição</li>
                <li>Proibida engenharia reversa ou descompilação</li>
                <li>Proibida sublicença ou revenda</li>
                <li>Proibida remoção de avisos de copyright</li>
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                GARANTIAS
              </Typography>
              <Typography variant="body2" paragraph>
                Software fornecido "AS IS" com garantia de 7 dias para reembolso.
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                LEI APLICÁVEL
              </Typography>
              <Typography variant="body2">
                Lei brasileira - Foro da comarca do autor
              </Typography>
            </Box>
          </Collapse>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Checkboxes de Aceite */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                Li e aceito os <strong>Termos de Uso e Serviço</strong>
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={aceitouPrivacidade}
                onChange={(e) => setAceitouPrivacidade(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                Li e aceito a <strong>Política de Privacidade</strong> (LGPD)
              </Typography>
            }
          />
        </Box>

        {/* Declaração */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>DECLARAÇÃO:</strong> Ao aceitar, você declara que leu, compreendeu 
            e concorda com todos os termos, reconhecendo que o Sistema é propriedade 
            protegida por lei e que violações acarretarão sanções legais.
          </Typography>
        </Alert>

        {/* Botões */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            size="large"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAceitar}
            disabled={!aceitouTermos || !aceitouPrivacidade}
            size="large"
          >
            Aceitar e Continuar
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Documento com validade jurídica conforme Lei 9.609/98 e Lei 9.610/98
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
