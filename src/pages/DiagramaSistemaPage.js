/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA CEI - CONTROLE ESCOLAR INTELIGENTE
 * © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
 * 
 * DIAGRAMA DE ARQUITETURA E CONSTRUÇÃO DO SISTEMA
 * Documento técnico confidencial - Uso restrito
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Alert,
  Chip,
  Stack,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  Architecture as ArchitectureIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  AccountTree as AccountTreeIcon,
  Layers as LayersIcon,
  IntegrationInstructions as IntegrationIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import SourceCodeExplorer from '../components/SourceCodeExplorer';

const loadCurrentDiagramMetadata = async () => {
  const cacheBust = Date.now();
  const response = await fetch(
    `${process.env.PUBLIC_URL || ''}/system-diagram.json?v=${cacheBust}`,
    { cache: 'no-store' }
  );
  if (!response.ok) throw new Error('Metadados do diagrama não encontrados');
  return response.json();
};

export default function DiagramaSistemaPage() {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [sourceExplorerOpen, setSourceExplorerOpen] = useState(false);
  const [diagramMetadata, setDiagramMetadata] = useState({
    version: '3.8.0',
    generatedAt: null,
    totalFiles: 0,
    totalLines: 0,
    totalPages: 0,
    totalComponents: 0,
    directoryTree: ''
  });

  useEffect(() => {
    loadCurrentDiagramMetadata()
      .then(setDiagramMetadata)
      .catch((error) => console.warn('Não foi possível atualizar o diagrama:', error));
  }, []);

  const refreshDiagramMetadata = async () => {
    try {
      const currentMetadata = await loadCurrentDiagramMetadata();
      setDiagramMetadata(currentMetadata);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    } catch (error) {
      console.warn('Não foi possível atualizar o diagrama:', error);
    }
  };

  const diagramUpdatedAt = diagramMetadata.generatedAt
    ? new Date(diagramMetadata.generatedAt).toLocaleString('pt-BR')
    : 'carregando...';

  const handleImprimir = async () => {
    await refreshDiagramMetadata();
    window.print();
  };

  const handleDownload = async () => {
    if (!contentRef.current || downloading) return;
    setDownloading(true);
    try {
      await refreshDiagramMetadata();
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        logging: false,
        onclone: (_doc, el) => {
          el.style.width = '1180px';
          el.style.maxWidth = '1180px';
          el.style.padding = '24px';
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentW = pageW - 2 * margin;
      const contentH = pageH - 2 * margin;
      const imgRatio = canvas.height / canvas.width;
      const fullH = contentW * imgRatio;

      let pageTop = 0;
      while (pageTop < fullH) {
        if (pageTop > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, margin - pageTop, contentW, fullH);
        pageTop += contentH;
      }

      pdf.save('diagrama-sistema-cei.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  // Estilos otimizados para impressão
  const printStyles = `
    @page {
      size: A4 portrait;
      margin: 1.5cm;
    }

    @media print {
      /* Forçar impressão de cores e fundos */
      html, body, * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-scheme: light only !important;
      }

      /* Ocultar navegação */
      header,
      nav,
      footer,
      .no-print,
      .MuiAppBar-root,
      .MuiDrawer-root,
      .MuiDrawer-paper,
      .MuiToolbar-root {
        display: none !important;
      }

      /* Remover offset do sidebar — ocupar página toda */
      body, #root {
        overflow: visible !important;
      }

      main {
        margin-left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        background: #fff !important;
      }

      .MuiContainer-root {
        max-width: 100% !important;
        width: 100% !important;
        padding-left: 4px !important;
        padding-right: 4px !important;
      }

      /* Remover sombras */
      * {
        box-shadow: none !important;
      }

      /* Quebras de página */
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
      }

      .avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      /* Tipografia reduzida */
      .MuiTypography-h3 { font-size: 17px !important; page-break-after: avoid !important; }
      .MuiTypography-h4 { font-size: 14px !important; page-break-after: avoid !important; }
      .MuiTypography-h5 { font-size: 12px !important; page-break-after: avoid !important; }
      .MuiTypography-h6 { font-size: 11px !important; page-break-after: avoid !important; }
      .MuiTypography-body1 { font-size: 10px !important; }
      .MuiTypography-body2 { font-size: 9px !important; }
      .MuiTypography-caption { font-size: 8px !important; }

      /* Arte ASCII — reduzir fonte para caber na página */
      pre {
        font-size: 5.5px !important;
        line-height: 1.15 !important;
        white-space: pre !important;
        word-break: normal !important;
        overflow: hidden !important;
        max-width: 100% !important;
        background-color: #f5f5f5 !important;
        color: #1a1a1a !important;
        border: 1px solid #ccc !important;
        padding: 6px !important;
        page-break-inside: avoid !important;
      }

      /* Cards — manter cores de fundo */
      .MuiCard-root,
      .MuiPaper-root {
        border: 1px solid #ccc !important;
        page-break-inside: avoid !important;
      }

      /* Chips — manter cores originais */
      .MuiChip-root {
        font-size: 8px !important;
        height: 20px !important;
      }

      .MuiChip-root svg {
        width: 12px !important;
        height: 12px !important;
      }

      /* Alertas — manter cores */
      .MuiAlert-root {
        page-break-inside: avoid !important;
        font-size: 9px !important;
      }

      /* Grid */
      .MuiGrid-item {
        page-break-inside: avoid !important;
      }

      /* Diagramas ASCII */
      .diagram-box {
        font-family: 'Courier New', monospace !important;
        page-break-inside: avoid !important;
      }
    }
  `;

  return (
    <Layout>
      <style>{printStyles}</style>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Botões de ação - não imprimem */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', '@media print': { display: 'none' } }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handleImprimir}
            color="primary"
          >
            Imprimir Diagrama
          </Button>
          <Tooltip title="Gera um PDF com cores e layout completo">
            <span>
              <Button
                variant="contained"
                startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <PdfIcon />}
                onClick={handleDownload}
                disabled={downloading}
                color="success"
              >
                {downloading ? 'Gerando PDF...' : 'Baixar PDF'}
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<CodeIcon />}
            onClick={() => setSourceExplorerOpen(true)}
            color="secondary"
          >
            Ver Códigos-Fonte
          </Button>
        </Box>

        <SourceCodeExplorer open={sourceExplorerOpen} onClose={() => setSourceExplorerOpen(false)} />

        <Paper elevation={3} sx={{ p: 4 }} ref={contentRef}>
          {/* Cabeçalho */}
          <Box className="avoid-break" sx={{ textAlign: 'center', mb: 4 }}>
            <ArchitectureIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              DIAGRAMA DE ARQUITETURA DO SISTEMA
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              CEI - Controle Escolar Inteligente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Versão {diagramMetadata.version} | Gerado automaticamente em: {diagramUpdatedAt}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip label="☁️ Supabase Integrado" color="success" sx={{ fontWeight: 'bold' }} />
              <Chip label="🔫 Scanner Laser USB" color="primary" sx={{ fontWeight: 'bold' }} />
              <Chip label="🏷️ Categoria de Leitores" color="secondary" sx={{ fontWeight: 'bold' }} />
              <Chip label="📊 Relatório de Leitores" color="info" sx={{ fontWeight: 'bold' }} />
              <Chip label="🔍 Análise de Registros" color="warning" sx={{ fontWeight: 'bold' }} />
              <Chip label="☑️ Exclusão Seletiva em Lote" color="error" sx={{ fontWeight: 'bold' }} />
              <Chip label="🔄 Realtime Multi-dispositivo" color="success" sx={{ fontWeight: 'bold' }} />
              <Chip label="🔐 Login Resiliente" color="primary" sx={{ fontWeight: 'bold' }} />
            </Stack>
            
            {/* Aviso de Autenticidade */}
            <Alert severity="error" icon={<SecurityIcon />} sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                ⚠️ DOCUMENTO CONFIDENCIAL - PROPRIEDADE INTELECTUAL PROTEGIDA
              </Typography>
              <Typography variant="body2">
                <strong>Autor e Proprietário:</strong> Wander Pires Silva Coelho<br />
                <strong>Copyright:</strong> © 2026 - Todos os direitos reservados<br />
                <strong>Proteção Legal:</strong> Lei 9.609/98 (Software) | Lei 9.610/98 (Direitos Autorais)<br />
                <strong>Penalidades:</strong> Reprodução não autorizada é crime - Art. 184 do CP<br />
                <strong>Indenização:</strong> Mínimo R$ 50.000,00 por uso indevido
              </Typography>
            </Alert>
          </Box>

          {/* Sumário/Índice */}
          <Box className="avoid-break" sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '2px solid #1976d2' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary" sx={{ textAlign: 'center' }}>
              📑 SUMÁRIO
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" component="div" sx={{ lineHeight: 2 }}>
                  <strong>1.</strong> Visão Geral do Sistema<br />
                  <strong>2.</strong> Arquitetura do Sistema<br />
                  <strong>3.</strong> Stack Tecnológico<br />
                  <strong>4.</strong> Fluxo de Dados e Comunicação<br />
                  <strong>5.</strong> Estrutura de Diretórios
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" component="div" sx={{ lineHeight: 2 }}>
                  <strong>6.</strong> Módulos e Funcionalidades<br />
                  <strong>7.</strong> Informações Técnicas e Métricas<br />
                  <strong>8.</strong> Inovações Tecnológicas<br />
                  <strong>9.</strong> Integração Supabase (Nuvem)<br />
                  <strong>10.</strong> Diagramas Visuais da Arquitetura<br />
                  <strong>11.</strong> Certificado de Autenticidade
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 1. VISÃO GERAL DO SISTEMA */}
          <Box className="avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LayersIcon color="primary" />
              1. VISÃO GERAL DO SISTEMA
            </Typography>
            <Typography variant="body1" paragraph>
              O Sistema CEI é uma aplicação web moderna desenvolvida para gestão completa de bibliotecas escolares,
              utilizando arquitetura SaaS (Software as a Service) com tecnologias de ponta.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📊 Características Principais
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                      <li>Aplicação Web Responsiva (Mobile/Desktop)</li>
                      <li>Single Page Application (SPA)</li>
                      <li>Interface Moderna e Intuitiva</li>
                      <li>Arquitetura Modular e Escalável</li>
                      <li>Sistema Multi-tenancy (Multi-escola)</li>
                      <li>Integração com Gateway de Pagamento</li>
                      <li>☁️ Banco de Dados PostgreSQL na Nuvem</li>
                      <li>🔄 Sincronização Automática (Supabase)</li>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      🎯 Módulos Funcionais
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                      <li>Gestão de Bibliotecas e Acervo</li>
                      <li>Scanner Híbrido (Mobile + Laser USB)</li>
                      <li>Clube de Leitura e Gamificação</li>
                      <li>Controle de Empréstimos e Devoluções</li>
                      <li>Cadastro de Leitores com Categoria</li>
                      <li>Controle de Patrimônio</li>
                      <li>Relatórios Avançados (incl. Leitores por Categoria/Turma)</li>
                      <li>Sistema Financeiro Multi-tenant</li>
                      <li>Emissão de Notas Fiscais (ISS) - Super Admin</li>
                      <li>Análise de Registros (Teste vs Comprador)</li>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 2. ARQUITETURA DO SISTEMA */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTreeIcon color="primary" />
              2. ARQUITETURA DO SISTEMA
            </Typography>

            {/* Diagrama de Camadas */}
            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
                ARQUITETURA EM CAMADAS
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 3 }}>
                {/* Camada 1 - Frontend */}
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#e3f2fd', border: '2px solid #1976d2' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    📱 CAMADA DE APRESENTAÇÃO (Frontend)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tecnologia:</strong> React 19.2.3 + Material-UI 7.3.6<br />
                    <strong>Função:</strong> Interface do usuário, validações, navegação<br />
                    <strong>Localização:</strong> Hospedado em Surge.sh (CDN)<br />
                    <strong>URL:</strong> https://cei-controle-escolar.surge.sh
                  </Typography>
                </Paper>

                {/* Camada 2 - Backend */}
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#fff3e0', border: '2px solid #f57c00' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                    ⚙️ CAMADA DE APLICAÇÃO (Backend)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tecnologia:</strong> Node.js + Express 4.18.2<br />
                    <strong>Função:</strong> Lógica de negócio, APIs REST, autenticação<br />
                    <strong>Localização:</strong> Servidor local (desenvolvimento) → Produção (Heroku/Railway)<br />
                    <strong>Porta:</strong> 3001
                  </Typography>
                </Paper>

                {/* Camada 3 - Dados */}
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#e8f5e9', border: '2px solid #388e3c' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="success.dark">
                    💾 CAMADA DE DADOS (Storage)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tecnologia:</strong> Supabase PostgreSQL (500MB) + LocalStorage (cache)<br />
                    <strong>Função:</strong> Armazenamento híbrido (nuvem + local)<br />
                    <strong>Backup:</strong> Automático a cada 1 hora na nuvem<br />
                    <strong>Sincronização:</strong> Automática a cada 5 minutos<br />
                    <strong>Segurança:</strong> SSL/TLS + Row Level Security (RLS)
                  </Typography>
                </Paper>

                {/* Camada 4 - Integrações */}
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#f3e5f5', border: '2px solid #7b1fa2' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="secondary.dark">
                    🔗 CAMADA DE INTEGRAÇÃO (APIs Externas)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Mercado Pago:</strong> Gateway de pagamento (PIX, Cartão, Boleto)<br />
                    <strong>Google Books API:</strong> Busca automática de dados de livros por ISBN<br />
                    <strong>Supabase:</strong> Banco de dados PostgreSQL na nuvem (500MB grátis)<br />
                    <strong>html5-qrcode:</strong> Leitura de QR Code e códigos de barras<br />
                    <strong>Scanner USB (HID):</strong> Captura automática por teclado para leitores a laser<br />
                    <strong>Google Gemini AI:</strong> Busca inteligente de livros (60 req/min grátis)<br />
                    <strong>Webhooks:</strong> Confirmação de pagamentos
                  </Typography>
                </Paper>
              </Stack>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 3. STACK TECNOLÓGICO */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon color="primary" />
              3. STACK TECNOLÓGICO
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Frontend */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      🎨 Frontend Technologies
                    </Typography>
                    <Stack spacing={1}>
                      <Chip label="React 19.2.3" color="primary" size="small" />
                      <Chip label="React Router 7.11.0" color="primary" size="small" />
                      <Chip label="Material-UI 7.3.6" color="primary" size="small" />
                      <Chip label="@supabase/supabase-js 2.49.2" color="success" size="small" />
                      <Chip label="html5-qrcode 2.3.8" color="primary" size="small" />
                      <Chip label="@zxing/library (Scanner Mobile)" color="primary" size="small" />
                      <Chip label="axios (HTTP Client)" color="primary" size="small" />
                      <Chip label="JavaScript ES6+" color="primary" size="small" />
                      <Chip label="HTML5 + CSS3 + Responsive" color="primary" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Padrões:</strong> Hooks, Context API, Component-based<br />
                      <strong>Build:</strong> React Scripts (Create React App)<br />
                      <strong>Deploy:</strong> GitHub Pages (CDN Global)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Backend */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.dark">
                      ⚙️ Backend Technologies
                    </Typography>
                    <Stack spacing={1}>
                      <Chip label="Node.js 18+" color="warning" size="small" />
                      <Chip label="Supabase PostgreSQL" color="success" size="small" />
                      <Chip label="Express 4.18.2" color="warning" size="small" />
                      <Chip label="Mercado Pago SDK 2.0.15" color="warning" size="small" />
                      <Chip label="dotenv (Environment)" color="warning" size="small" />
                      <Chip label="CORS" color="warning" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Database:</strong> Supabase PostgreSQL 500MB<br />
                      <strong>Padrões:</strong> REST API, MVC, Middleware<br />
                      <strong>Segurança:</strong> HTTPS, Row Level Security (RLS)<br />
                      <strong>Deploy:</strong> GitHub Pages + Supabase
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Segurança */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="error">
                      🔒 Segurança e Proteção
                    </Typography>
                    <Stack spacing={1}>
                      <Chip label="SSL/TLS (HTTPS)" color="error" size="small" />
                      <Chip label="Row Level Security (RLS)" color="error" size="small" />
                      <Chip label="Supabase Auth" color="error" size="small" />
                      <Chip label="SHA-256 (Signatures)" color="error" size="small" />
                      <Chip label="LGPD Compliance" color="error" size="small" />
                      <Chip label="ISO 27001 Certified" color="error" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Autenticação:</strong> Supabase Auth + JWT<br />
                      <strong>Backup:</strong> Automático a cada 1 hora (nuvem)<br />
                      <strong>Criptografia:</strong> SSL/TLS em todas as conexões
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Integrações */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="success.dark">
                      🔗 Integrações Externas
                    </Typography>
                    <Stack spacing={1}>
                      <Chip label="Supabase PostgreSQL" color="success" size="small" />
                      <Chip label="Mercado Pago API" color="success" size="small" />
                      <Chip label="Google Books API" color="success" size="small" />
                      <Chip label="Google Gemini AI" color="success" size="small" />
                      <Chip label="Webhooks (Pagamentos)" color="success" size="small" />
                      <Chip label="ZXing Library (Barcode)" color="success" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Database:</strong> Supabase PostgreSQL 500MB (grátis)<br />
                      <strong>Gateway:</strong> Mercado Pago (PIX + Cartão)<br />
                      <strong>ISBN:</strong> Google Books + Gemini AI<br />
                      <strong>Scanner:</strong> ZXing + HTML5 (Câmera mobile)<br />
                      <strong>Sync:</strong> Realtime Supabase (automático)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 4. FLUXO DE DADOS */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon color="primary" />
              4. FLUXO DE DADOS E COMUNICAÇÃO
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📊 Diagrama de Fluxo de Dados
              </Typography>
              
              <Box className="diagram-box" sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                <pre style={{ backgroundColor: '#263238', color: '#aed581', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{`┌─────────────────────────────────────────────────────────────────┐
│                   USUÁRIO (Browser/Mobile)                       │
│                https://cei-controle-escolar.surge.sh             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ├──► Login/Autenticação
                 │    └──► Validação local + Backend
                 │
                 ├──► Navegação (React Router)
                 │    └──► SPA - Sem reload de página
                 │
                 ├──► Scanner de Códigos 📷
                 │    ├──► Mobile: ZXing Camera Scanner
                 │    ├──► Desktop: Scanner Laser USB (HID) + Input manual
                 │    └──► Google Books API
                 │         └──► Busca automática de dados
                 │              └──► Auto-preenchimento formulário
                 │
                 ├──► Clube de Leitura 🏆
                 │    ├──► Registro de leitura com foto
                 │    ├──► 3 perguntas de compreensão
                 │    ├──► Sistema de avaliação (estrelas)
                 │    └──► Ranking e medalhas (🥇🥈🥉)
                 │
                 ├──► Operações CRUD
                 │    ├──► Livros (Didáticos/Paradidáticos)
                 │    ├──► Alunos, Empréstimos, Devoluções
                 │    ├──► Patrimônio, Relatórios
                 │    ├──► Validação frontend (formulários)
                 │    └──► Persistência: LocalStorage (atual)
                 │
                 ├──► Notas Fiscais (ISS) 📄
                 │    ├──► Acesso exclusivo Super Admin
                 │    ├──► Emissão NF-e de serviço
                 │    ├──► Cálculo automático ISS
                 │    └──► Impressão profissional
                 │
                 └──► Pagamentos 💳
                      └──► API Backend (Express)
                           │
                           ├──► POST /api/create-pix-payment
                           ├──► POST /api/create-card-payment
                           ├──► GET  /api/check-payment/:id
                           │
                           └──► Mercado Pago API
                                ├──► Processa pagamento
                                ├──► Gera QR Code PIX
                                └──► Webhook confirmação
                                     │
                                     └──► POST /api/webhooks
                                          └──► Ativa assinatura

┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE SEGURANÇA                           │
├─────────────────────────────────────────────────────────────────┤
│  • SSL/TLS - Todas as comunicações criptografadas              │
│  • CORS - Apenas origens autorizadas                           │
│  • Headers de Segurança - XSS, CSRF, Clickjacking             │
│  • Marca d'água digital - Detecção de pirataria               │
│  • LGPD - Proteção de dados pessoais                          │
│  • Logs de auditoria - Rastreamento completo                  │
└─────────────────────────────────────────────────────────────────┘`}
                </pre>
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 5. ESTRUTURA DE DIRETÓRIOS */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IntegrationIcon color="primary" />
              5. ESTRUTURA DE DIRETÓRIOS
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📁 Organização do Código-Fonte
              </Typography>
              
              <Box sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <pre style={{ backgroundColor: '#263238', color: '#81c784', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{diagramMetadata.directoryTree || `📦 CEI - CONTROLE ESCOLAR INTELIGENTE v${diagramMetadata.version}
│
├── 📂 public/                      # Arquivos públicos estáticos
│   ├── index.html                 # HTML principal (SPA)
│   ├── manifest.json              # PWA manifest
│   └── CNAME                      # Configuração Surge.sh
│
├── 📂 src/                        # Código-fonte React
│   ├── 📂 components/             # Componentes reutilizáveis
│   │   ├── Layout.js              # Layout + Menu + Atalhos
│   │   ├── ContratoModal.js       # Modal de contrato
│   │   ├── BarcodeScannerDialog.js # Scanner Desktop
│   │   ├── MobileBarcodeScanner.js # 📱 Scanner Mobile
│   │   ├── TermoDoacao.js         # Termo doação livros
│   │   ├── TermoEmprestimo.js     # Termo empréstimo
│   │   ├── CameraCapture.js       # Captura de foto
│   │   └── SyncStatus.js          # Status sincronização
│   │
│   ├── 📂 context/                # Context API (Estado global)
│   │   └── DataContext.js         # Gerenciamento de dados
│   │
│   ├── 📂 pages/                  # Páginas da aplicação
│   │   ├── LoginPage.js           # Tela de login
│   │   ├── DashboardPage.js       # Dashboard principal
│   │   ├── LivrosPage.js          # Gestão + Scanner Mobile
│   │   ├── LeitoresPage.js        # Cadastro de leitores
│   │   ├── RelatoriosLivrosPage.js # Relatórios didáticos
│   │   ├── ClubeDeLeituraPage.js  # 🏆 Clube + Ranking
│   │   ├── EmprestimosPage.js     # Controle empréstimos
│   │   ├── DevolucaoPage.js       # Gestão devoluções
│   │   ├── PatrimonioPage.js      # Controle patrimônio
│   │   ├── RelatoriosPage.js      # Relatórios gerais
│   │   ├── ConfiguracoesPage.js   # Configurações escola
│   │   ├── GerenciarUsuariosPage.js # Usuários do sistema
│   │   ├── FinanceiroPage.js      # Financeiro escola
│   │   ├── FinanceiroAdminPage.js # Financeiro SuperAdmin
│   │   ├── GerenciarEscolasPage.js # Gestão escolas
│   │   ├── ConfigurarPlanosPage.js # Config. planos
│   │   ├── NotaFiscalPage.js      # Emissão NF-e ISS
│   │   ├── CadastroEscolaPage.js  # Cadastro instituição
│   │   ├── PagamentoPage.js       # Processamento pagamento
│   │   ├── AtivarLicencaPage.js   # Ativação de licença
│   │   ├── TermosDeUsoPage.js     # Termos e políticas
│   │   └── DiagramaSistemaPage.js # Esta página
│   │
│   ├── App.js                     # Componente raiz + rotas
│   ├── index.js                   # Entry point React
│   └── index.css                  # Estilos globais + mobile
│
├── 📂 build/                      # Build de produção (gerado)
│   ├── static/                    # JS/CSS compilados
│   │   ├── js/                    # JavaScript bundles
│   │   └── css/                   # CSS bundles
│   └── index.html                 # HTML compilado
│
├── 📄 server.js                   # Backend Node.js + Express
├── 📄 security.js                 # Sistema de segurança
├── 📄 consoleProtection.js        # Proteção console
├── 📄 package.json                # Dependências NPM
├── 📄 .env                        # Variáveis de ambiente
├── 📄 .gitignore                  # Arquivos ignorados Git
│
├── 📂 Documentação/
│   ├── LICENSE.md                 # Licença proprietária
│   ├── README.md                  # Documentação geral
│   ├── MELHORIAS_MOBILE_v3.5.2.md # 📱 Melhorias mobile
│   ├── INSTALAR_SCANNER_MOBILE.md # Guia scanner
│   ├── NOVAS_FUNCIONALIDADES.md   # Features recentes
│   ├── GUIA_CONFIGURACOES_ESCOLA.md # Guia config
│   ├── SISTEMA_LICENCIAMENTO.md   # Sistema licenças
│   └── PRIVACY_POLICY.md          # LGPD
│
└── 📂 Deploy/
    ├── DEPLOY.md                  # Guia de deployment
    ├── DEPLOY_GITHUB_PAGES.md     # Deploy GitHub
    ├── DEPLOY_RENDER.md           # Deploy Render
    └── deploy-surge.bat           # Script deploy`}
                </pre>
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 6. MÓDULOS E FUNCIONALIDADES */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              6. MÓDULOS E FUNCIONALIDADES DETALHADAS
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                {
                  modulo: 'Dashboard',
                  funcoes: ['Visão geral da biblioteca', 'Estatísticas em tempo real', 'Gráficos de empréstimos', 'Alertas e notificações']
                },
                {
                  modulo: 'Livros',
                  funcoes: ['Cadastro completo de acervo', 'Scanner híbrido (mobile + laser USB)', 'Detecção automática de leitura rápida (<50ms)', 'Google Books API integrada', 'Tipos: Didático/Paradidático', 'Controle de vigência', 'Sistema de baixa (doação/término)']
                },
                {
                  modulo: 'Clube de Leitura',
                  funcoes: ['Gamificação de leitura', 'Registro com foto do aluno', '3 perguntas de compreensão', 'Sistema de avaliação (estrelas)', 'Ranking de leitores', 'Medalhas (🥇🥈🥉)', 'Histórico completo']
                },
                {
                  modulo: 'Relatórios de Livros',
                  funcoes: ['Separação didáticos/paradidáticos', 'Controle de vigência', 'Alertas de vencimento', 'Histórico de baixas', 'Estatísticas por tipo']
                },
                {
                  modulo: 'Empréstimos',
                  funcoes: ['Registro de empréstimos', 'Controle de devoluções', 'Cálculo de multas', 'Histórico completo']
                },
                {
                  modulo: 'Alunos',
                  funcoes: ['Cadastro de usuários', 'Fotos e documentos', 'Histórico de leitura', 'Bloqueio/desbloqueio']
                },
                {
                  modulo: 'Patrimônio',
                  funcoes: ['Inventário de bens', 'Mobiliário e equipamentos', 'Depreciação', 'Manutenção preventiva']
                },
                {
                  modulo: 'Relatórios',
                  funcoes: ['Livros mais emprestados', 'Alunos mais ativos', 'Inadimplência', 'Exportação PDF/Excel']
                },
                {
                  modulo: 'Financeiro',
                  funcoes: ['Controle de multas', 'Receitas e despesas', 'Planos de assinatura', 'Integração Mercado Pago']
                },
                {
                  modulo: 'Notas Fiscais (ISS)',
                  funcoes: ['Acesso exclusivo Super Admin', 'Emissão de NF-e de serviço', 'Cálculo automático de ISS', 'Dados da instituição (CNPJ)', 'Dados do tomador (cliente)', 'Documento formatado', 'Impressão profissional', 'Controle municipal de impostos']
                },
                {
                  modulo: 'Busca',
                  funcoes: ['Busca por título/autor', 'Filtros avançados', 'QR Code de livros', 'Sugestões inteligentes']
                }
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                        📌 {item.modulo}
                      </Typography>
                      <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                        {item.funcoes.map((funcao, i) => (
                          <li key={i}>{funcao}</li>
                        ))}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 7. INFORMAÇÕES TÉCNICAS */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              7. INFORMAÇÕES TÉCNICAS E MÉTRICAS
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {diagramMetadata.totalLines.toLocaleString('pt-BR')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Linhas de Código
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {diagramMetadata.totalFiles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Arquivos de Código
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {diagramMetadata.totalPages}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Páginas Funcionais
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    99%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime Garantido
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    SSL/TLS
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Criptografia Total
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    LGPD
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    100% Conforme
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 8. INOVAÇÕES TECNOLÓGICAS - VERSÃO 3.8.0 */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'success.main' }}>
              ⭐ 8. INOVAÇÕES TECNOLÓGICAS (Versão 3.8.0)
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                🚀 Atualizações — Agosto 2026
              </Typography>
              <Typography variant="body2">
                <strong>v3.8.0 (Agosto/2026):</strong> Correção crítica do Realtime Supabase — tabela de leitores agora assinada corretamente (<code>leitores</code> em vez de <code>clientes</code>), garantindo sincronização instantânea entre múltiplos computadores. Login resiliente: credenciais padrão sempre funcionam mesmo quando a nuvem armazena versões antigas de senha (fallback para usuariosPadrao).<br /><br />
                <strong>v3.7.1 (Março/2026):</strong> campo Categoria nos leitores (Estudante/Professor/Funcionário/Comunidade), relatório de Leitores Cadastrados com agrupamento por categoria e turma, exclusão em lote de leitores, análise automática de registros (Teste vs Comprador), exclusão em lote com checkboxes individuais para seleção/desseleção de instituições na gestão SuperAdmin.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              {/* Scanner Híbrido */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'primary.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      📷 Scanner Híbrido de Códigos
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Tecnologia:</strong> @zxing/library + html5-qrcode 2.3.8 + captura HID (USB)
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Funcionalidades:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>🎯 Detecção automática de dispositivo móvel</li>
                        <li>📷 Acesso direto à câmera traseira</li>
                        <li>🔍 Leitura de código de barras (EAN-13/EAN-8)</li>
                        <li>📱 Leitura de QR Code em tempo real</li>
                        <li>🔫 Suporte a leitor laser USB (modo teclado/HID)</li>
                        <li>⚡ Detecção de velocidade para diferenciar scanner e digitação</li>
                        <li>⌨️ Modo tríplice: Câmera + Laser USB + Input manual</li>
                        <li>✨ Interface por tabs (Câmera | Digitar)</li>
                        <li>🎨 Guia visual para alinhamento</li>
                        <li>🚀 Busca automática Google Books API</li>
                        <li>📝 Auto-preenchimento de formulário</li>
                        <li>📱 Fullscreen otimizado para mobile</li>
                      </ul>
                    </Typography>
                    <Chip label="NOVO v3.5.2" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Clube de Leitura */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'warning.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.dark">
                      🏆 Clube de Leitura (Gamificação)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Conceito:</strong> Sistema de premiação e engajamento de leitores
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Recursos:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Registro de leitura com foto do aluno</li>
                        <li>3 perguntas de compreensão textual</li>
                        <li>Sistema de avaliação com estrelas (1-5)</li>
                        <li>Ranking dinâmico de leitores</li>
                        <li>Medalhas para TOP 3 (🥇🥈🥉)</li>
                        <li>Histórico completo de leituras</li>
                        <li>Incentivo à leitura através de premiação</li>
                      </ul>
                    </Typography>
                    <Chip label="NOVO" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Gestão Avançada de Livros */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'info.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="info.dark">
                      📚 Gestão Avançada de Livros
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Classificação:</strong> Didáticos vs. Paradidáticos
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Novos Controles:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li><strong>Tipo:</strong> Didático ou Paradidático</li>
                        <li><strong>Vigência:</strong> Ano de validade (didáticos)</li>
                        <li><strong>Alertas:</strong> Livros vencidos ou vencendo</li>
                        <li><strong>Baixa:</strong> Doação ou término de vigência</li>
                        <li><strong>Termo de Doação:</strong> Documento legal formatado</li>
                        <li><strong>Relatórios:</strong> Separados por tipo</li>
                        <li><strong>Rastreabilidade:</strong> Histórico completo</li>
                      </ul>
                    </Typography>
                    <Chip label="NOVO" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Notas Fiscais ISS */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'error.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="error.dark">
                      🧾 Emissão de Notas Fiscais (ISS)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Finalidade:</strong> Controle fiscal e emissão de NF de serviço
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Características:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Acesso exclusivo para Super Administrador</li>
                        <li>Dados automáticos da instituição (CNPJ)</li>
                        <li>Seleção de cliente/tomador</li>
                        <li>Cálculo automático de ISS municipal</li>
                        <li>Alíquota configurável (padrão 2%)</li>
                        <li>Discriminação detalhada do serviço</li>
                        <li>Documento formatado profissionalmente</li>
                        <li>Impressão e controle de receitas</li>
                        <li>Dashboard com total de ISS retido</li>
                      </ul>
                    </Typography>
                    <Chip label="NOVO" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Novidades v3.7.0 - Março 2026 */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'secondary.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="secondary.dark">
                      🏷️ Categoria de Leitores + Relatório
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Novidade:</strong> Campo Categoria no cadastro de leitores (v3.7.0)
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Funcionalidades:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Campo "Categoria" no formulário de leitor</li>
                        <li>Opções: Estudante, Professor, Funcionário, Comunidade</li>
                        <li>Novo relatório "Leitores Cadastrados"</li>
                        <li>Relatório agrupado por Categoria</li>
                        <li>Sub-agrupamento de Estudantes por Turma/Série</li>
                        <li>Resumo com contagem por cada categoria</li>
                        <li>Suporte a impressão, PDF e exportação CSV</li>
                      </ul>
                    </Typography>
                    <Chip label="NOVO v3.7.0" color="secondary" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Gestão SuperAdmin Aprimorada */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'warning.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.dark">
                      🔍 Análise de Registros (SuperAdmin)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Objetivo:</strong> Distinguir testes do sistema de potenciais compradores
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Lógica de classificação:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Palavras-chave de teste no nome/email/login</li>
                        <li>CNPJ fictício (zeros, dígitos iguais)</li>
                        <li>Status pendente há mais de 30 dias</li>
                        <li>Telefone e localização válidos → comprador</li>
                        <li>Pagamento confirmado → comprador</li>
                        <li>Cadastro recente ≤7 dias → provável comprador</li>
                        <li>Exclusão em lote por critério (pendentes/testes/todos)</li>
                        <li>☑️ Checkboxes individuais para seleção/desseleção</li>
                        <li>Selecionar/desmarcar todos com estado indeterminado</li>
                        <li>Exibição de nome, login, email, status e classificação</li>
                      </ul>
                    </Typography>
                    <Chip label="ATUALIZADO v3.7.1" color="warning" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Realtime Multi-dispositivo - v3.8.0 */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'success.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="success.dark">
                      🔄 Sincronização Realtime Multi-dispositivo
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Correção crítica v3.8.0:</strong> Realtime Supabase agora assina a tabela correta (<code>leitores</code>) em vez de <code>clientes</code>, ativando sincronização instantânea de leitores entre dispositivos.
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Como funciona:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Computador A cadastra leitor → Supabase notifica em tempo real</li>
                        <li>Computador B recebe o evento e puxa os dados em ≤800ms</li>
                        <li>Canal subscrito nas tabelas: livros, leitores, empréstimos, patrimônio, usuários</li>
                        <li>Fallback automático: pull periódico a cada 20 segundos</li>
                        <li>Push imediato ao salvar qualquer dado (debounce 1,5s)</li>
                        <li>Reconexão automática em caso de perda de conexão</li>
                      </ul>
                    </Typography>
                    <Chip label="CORRIGIDO v3.8.0" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Login Resiliente - v3.8.0 */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'primary.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      🔐 Login Resiliente (Credenciais Padrão)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Correção v3.8.0:</strong> A função de login agora inclui fallback automático para as credenciais padrão do sistema, garantindo acesso mesmo quando a nuvem armazena uma versão desatualizada da senha.
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Mecanismo de fallback:</strong>
                      <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Busca o usuário na lista sincronizada (LocalStorage/Nuvem)</li>
                        <li>Se não encontrar com a senha informada, consulta <code>usuariosPadrao</code></li>
                        <li>Garante que credenciais padrão sempre funcionam</li>
                        <li>Usuários criados pela UI continuam com suas senhas personalizadas</li>
                      </ol>
                    </Typography>
                    <Chip label="CORRIGIDO v3.8.0" color="primary" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Resumo Técnico das Inovações */}
            <Paper elevation={3} sx={{ mt: 3, p: 3, bgcolor: '#e8f5e9' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="success.dark">
                📊 Resumo Técnico das Inovações
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>9</strong><br />Módulos Novos
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>3</strong><br />APIs Integradas
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>5</strong><br />Componentes React
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>+55</strong><br />Novas Funcionalidades
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 9. INTEGRAÇÃO SUPABASE (NUVEM) */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
              <CloudIcon color="success" />
              9. INTEGRAÇÃO SUPABASE (BANCO DE DADOS NA NUVEM)
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ☁️ Banco de Dados PostgreSQL na Nuvem - ATIVO
              </Typography>
              <Typography variant="body2">
                Sistema agora utiliza Supabase com sincronização automática bidirecional (LocalStorage ↔ Nuvem).
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              {/* Arquitetura Híbrida */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderColor: 'success.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="success.main">
                      🏗️ Arquitetura Híbrida: LocalStorage + Supabase
                    </Typography>
                    
                    <Box className="diagram-box" sx={{ mt: 2, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      <pre style={{ backgroundColor: '#1b5e20', color: '#a5d6a7', padding: '15px', borderRadius: '8px' }}>
{`
╔══════════════════════════════════════════════════════════════════╗
║                  🌐 ARQUITETURA DE DADOS CEI                     ║
╚══════════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────┐
    │         👤 USUÁRIO (Navegador/App)                      │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │         📱 FRONTEND REACT 19.2.3                        │
    │   ┌──────────────────────────────────────────────┐      │
    │   │  🔧 DataContext (Context API)                │      │
    │   │  • Gerencia estado global                    │      │
    │   │  • Coordena sincronização                    │      │
    │   └──────────────────────────────────────────────┘      │
    └────────────┬─────────────────────┬────────────────────────┘
                 │                     │
                 ▼                     ▼
    ┌────────────────────┐   ┌──────────────────────────┐
    │  💾 LOCALSTORAGE   │   │  ☁️  SUPABASE CLOUD      │
    │  (Cache Local)     │◄──┤  (PostgreSQL 500MB)      │
    ├────────────────────┤   ├──────────────────────────┤
    │ • Acesso Imediato  │   │ • 7 Tabelas Relacionadas │
    │ • Funciona Offline │   │ • Row Level Security     │
    │ • Backup Local     │   │ • Backup Automático      │
    │ • 5-10MB Limite    │   │ • SSL/TLS Seguro         │
    └────────────────────┘   │ • Sync Realtime          │
                             │ • Multi-dispositivo      │
                             └──────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                  ┌──────────────┐       ┌──────────────┐
                  │ 🔒 RLS       │       │ 🔄 Triggers  │
                  │ Políticas    │       │ Auto-update  │
                  └──────────────┘       └──────────────┘

═══════════════════════════════════════════════════════════════════

FLUXO DE SINCRONIZAÇÃO:

1️⃣  SALVAR DADOS:
    Usuário → Frontend → LocalStorage (instantâneo)
                      ↓
                   Supabase (assíncrono, 5min)

2️⃣  CARREGAR DADOS:
    Supabase → Frontend → LocalStorage (cache)
            ↓
          Usuário (dados mais recentes)

3️⃣  BACKUP AUTOMÁTICO:
    A cada 1 hora → LocalStorage → Supabase (completo)

4️⃣  MULTI-DISPOSITIVO:
    Dispositivo A → Supabase ← Dispositivo B
    (Sincronização automática via Realtime)
`}
                      </pre>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tabelas do Banco */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      🗄️ Estrutura do Banco de Dados
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>📊 7 Tabelas Relacionadas:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li><strong>instituicoes:</strong> Dados das escolas clientes</li>
                        <li><strong>livros:</strong> Acervo completo de livros</li>
                        <li><strong>leitores:</strong> Alunos/Professores cadastrados</li>
                        <li><strong>emprestimos:</strong> Histórico de empréstimos</li>
                        <li><strong>patrimonio:</strong> Bens e equipamentos</li>
                        <li><strong>usuarios:</strong> Usuários do sistema</li>
                        <li><strong>clube_leitura:</strong> Registros de leituras</li>
                      </ul>
                    </Typography>
                    <Chip label="PostgreSQL 15" color="success" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Funcionalidades */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.dark">
                      ⚡ Funcionalidades Ativas
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>✅ Recursos Implementados:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>🔄 Sincronização a cada 5 minutos</li>
                        <li>💾 Backup automático a cada 1 hora</li>
                        <li>🌐 Acesso de múltiplos dispositivos</li>
                        <li>📱 Offline-first (funciona sem internet)</li>
                        <li>🔒 Row Level Security (RLS) ativo</li>
                        <li>⚡ Triggers de auto-atualização</li>
                        <li>📊 Índices otimizados para performance</li>
                        <li>🔐 SSL/TLS em todas as conexões</li>
                      </ul>
                    </Typography>
                    <Chip label="Supabase 2.49.2" color="warning" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Benefícios */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: '#e8f5e9' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="success.dark">
                    🎁 Benefícios da Integração Supabase
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" align="center">
                        <strong>☁️ 500MB</strong><br />PostgreSQL Grátis
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" align="center">
                        <strong>🔄 5 min</strong><br />Sync Automático
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" align="center">
                        <strong>💾 1 hora</strong><br />Backup Nuvem
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" align="center">
                        <strong>💰 R$ 0,00</strong><br />100% Gratuito
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 10. DIAGRAMAS VISUAIS DA ARQUITETURA */}
          <Box className="page-break avoid-break" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTreeIcon color="primary" />
              10. DIAGRAMAS VISUAIS DA ARQUITETURA
            </Typography>

            {/* Diagrama de Perfis de Acesso */}
            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
                👥 PERFIS DE ACESSO E FUNCIONALIDADES
              </Typography>
              
              <Box className="diagram-box" sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <pre style={{ backgroundColor: '#1a237e', color: '#82b1ff', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{`
     ╔═══════════════════════════════════════════════════════════╗
     ║              🎭 PERFIS DE USUÁRIO DO SISTEMA              ║
     ╚═══════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────┐
│  👑 SUPER ADMIN (Desenvolvedor)                               │
├────────────────────────────────────────────────────────────────┤
│  ✅ Acesso total ao sistema                                   │
│  ✅ Gerenciar todas as escolas                                │
│  ✅ Configurar planos e preços                                │
│  ✅ Emitir notas fiscais (ISS)                                │
│  ✅ Gestão financeira global                                  │
│  ✅ Cadastrar escolas manualmente                             │
│  ✅ Ativar/bloquear licenças                                  │
│  ✅ Visualizar diagrama do sistema                            │
│  ✅ Dashboard de receitas                                     │
│  ✅ Exclusão seletiva em lote (checkboxes)                    │
└────────────────────────────────────────────────────────────────┘
         │
         ├────► 📊 Dashboard com métricas globais
         ├────► 🏫 Lista de todas as instituições
         ├────► 💰 Controle de pagamentos recebidos
         ├────► 📄 Emissão de NF-e para clientes
         └────► ☑️ Exclusão em lote com seleção individual


┌────────────────────────────────────────────────────────────────┐
│  👨‍💼 ADMINISTRADOR (Escola/Instituição)                        │
├────────────────────────────────────────────────────────────────┤
│  ✅ Gestão completa da sua escola                             │
│  ✅ Gerenciar usuários (bibliotecários)                       │
│  ✅ Cadastrar e gerenciar livros                              │
│  ✅ Controle de empréstimos/devoluções                        │
│  ✅ Gestão de leitores (alunos)                               │
│  ✅ Clube de leitura e ranking                                │
│  ✅ Relatórios completos                                      │
│  ✅ Configurações da escola                                   │
│  ✅ Personalizar documentos                                   │
│  ✅ Scanner híbrido (mobile + laser USB)                      │
└────────────────────────────────────────────────────────────────┘
         │
         ├────► 📚 Gestão de acervo (didáticos/paradidáticos)
         ├────► 👥 Cadastro de bibliotecários
         ├────► 🎨 Personalização de cabeçalhos/rodapés
         ├────► 📊 Relatórios de empréstimos
         └────► ⚙️ Configurações gerais da instituição


┌────────────────────────────────────────────────────────────────┐
│  📖 BIBLIOTECÁRIO (Operacional)                               │
├────────────────────────────────────────────────────────────────┤
│  ✅ Cadastrar livros com scanner                              │
│  ✅ Registrar empréstimos                                     │
│  ✅ Processar devoluções                                      │
│  ✅ Cadastrar leitores                                        │
│  ✅ Registrar leituras (clube)                                │
│  ✅ Gerar relatórios                                          │
│  ✅ Buscar livros no acervo                                   │
│  ❌ NÃO pode gerenciar usuários                               │
│  ❌ NÃO pode alterar configurações                            │
└────────────────────────────────────────────────────────────────┘
         │
         ├────► 📷 Scanner mobile para cadastro rápido
         ├────► 📝 Registro de empréstimos
         ├────► 🏆 Registro de leituras no clube
         └────► 🔍 Busca avançada no acervo

     ╔═══════════════════════════════════════════════════════════╗
     ║           🔐 CONTROLE DE ACESSO POR FUNCIONALIDADE        ║
     ╚═══════════════════════════════════════════════════════════╝

                        SuperAdmin  │  Admin  │  Bibliotecário
    ─────────────────────────────────┼─────────┼────────────────
    Dashboard                     ✅  │   ✅    │      ✅
    Livros (CRUD)                 ✅  │   ✅    │      ✅
    Scanner Híbrido               ✅  │   ✅    │      ✅
    Empréstimos                   ✅  │   ✅    │      ✅
    Devoluções                    ✅  │   ✅    │      ✅
    Leitores                      ✅  │   ✅    │      ✅
    Clube de Leitura              ✅  │   ✅    │      ✅
    Relatórios                    ✅  │   ✅    │      ✅
    Patrimônio                    ✅  │   ✅    │      ✅
    Configurações Escola          ✅  │   ✅    │      ❌
    Gerenciar Usuários            ✅  │   ✅    │      ❌
    Gerenciar Escolas             ✅  │   ❌    │      ❌
    Configurar Planos             ✅  │   ❌    │      ❌
    Financeiro Admin              ✅  │   ❌    │      ❌
    Notas Fiscais (ISS)           ✅  │   ❌    │      ❌
    Diagrama Sistema              ✅  │   ❌    │      ❌
`}
                </pre>
              </Box>
            </Paper>

            {/* Diagrama de Fluxo do Scanner Híbrido */}
            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
                📷 FLUXO DO SCANNER HÍBRIDO
              </Typography>
              
              <Box className="diagram-box" sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <pre style={{ backgroundColor: '#004d40', color: '#80cbc4', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{`
    ╔════════════════════════════════════════════════════════════╗
    ║     📷 SISTEMA DE SCANNER HÍBRIDO - FLUXO COMPLETO        ║
    ╚════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────┐
    │  👤 USUÁRIO acessa página de Livros                     │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  🔍 Sistema detecta tipo de dispositivo                 │
    │      ├─► isMobile = /iPhone|iPad|Android/i             │
    │      ├─► ou window.innerWidth < 768                     │
    │      └─► Escolhe scanner adequado                       │
    └────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
                │                         │                         │
                ▼                         ▼                         ▼
              ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
              │  📱 MOBILE       │      │  🔫 DESKTOP      │      │  💻 DESKTOP      │
              │  Scanner Câmera  │      │  Scanner Laser   │      │  Input Manual    │
              └─────────┬────────┘      └─────────┬────────┘      └─────────┬────────┘
                  │                         │                         │
                  └────────────┬────────────┴────────────┬────────────┘
                   ▼
    ┌─────────────────────────────────────────────────────────┐
    │  📷 MobileBarcodeScanner Component                      │
    │      ┌─────────────────────────────────────────────┐    │
    │      │  Tab 1: CÂMERA        Tab 2: DIGITAR       │    │
    │      ├─────────────────────────────────────────────┤    │
    │      │  • Ativar Câmera      • Input ISBN         │    │
    │      │  • Leitor laser USB   • Validação         │    │
    │      │  • Guia visual        • Enter para buscar  │    │
    │      │  • Foco automático    • Feedback visual    │    │
    │      └─────────────────────────────────────────────┘    │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  ✅ CÓDIGO DETECTADO                                    │
    │      • ISBN/EAN capturado                               │
    │      • Validação do formato                             │
    │      • Feedback de sucesso ✨                           │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  🌐 GOOGLE BOOKS API                                    │
    │      GET https://www.googleapis.com/books/v1/volumes    │
    │      ?q=isbn:{codigo}                                   │
    └────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │ ✅ ENCONTRADO│          │ ❌ NÃO ACHADO │
    │ Dados retorna│          │ Usar dados   │
    │ dos da API   │          │ manuais      │
    └──────┬───────┘          └──────┬───────┘
           │                         │
           └────────────┬────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────────────────────────┐
    │  📝 AUTO-PREENCHIMENTO DO FORMULÁRIO                    │
    │      ✅ Título                                          │
    │      ✅ Autor                                           │
    │      ✅ Editora                                         │
    │      ✅ ISBN                                            │
    │      ✅ Ano de Publicação                               │
    │      ✅ Capa (URL da imagem)                            │
    │      ✅ Sinopse                                         │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  💾 USUÁRIO confirma e salva                            │
    │      └─► Livro adicionado ao acervo ✅                  │
    └─────────────────────────────────────────────────────────┘

    ╔════════════════════════════════════════════════════════════╗
    ║              ⚡ TECNOLOGIAS UTILIZADAS                     ║
    ╠════════════════════════════════════════════════════════════╣
    ║  📦 @zxing/library        - Detecção de códigos           ║
    ║  📷 BrowserMultiFormatReader - Leitura multi-formato      ║
    ║  ⌨️  Keyboard Events API  - Captura HID (laser USB)       ║
    ║  🎥 MediaDevices API      - Acesso à câmera               ║
    ║  🌐 Google Books API      - Busca de dados                ║
    ║  ⚛️  React Hooks          - Estado e efeitos              ║
    ║  🎨 Material-UI           - Interface do usuário          ║
    ╚════════════════════════════════════════════════════════════╝
`}
                </pre>
              </Box>
            </Paper>

            {/* Diagrama de Clube de Leitura */}
            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fff8e1' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
                🏆 CLUBE DE LEITURA - GAMIFICAÇÃO
              </Typography>
              
              <Box className="diagram-box" sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <pre style={{ backgroundColor: '#4a148c', color: '#e1bee7', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{`
    ╔════════════════════════════════════════════════════════════╗
    ║         🏆 CLUBE DE LEITURA - SISTEMA DE PONTUAÇÃO        ║
    ╚════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────┐
    │  📖 LEITOR termina leitura de um livro                  │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  📝 REGISTRO DA LEITURA                                 │
    │      ┌─────────────────────────────────────────────┐    │
    │      │  1️⃣  Selecionar leitor (aluno)             │    │
    │      │  2️⃣  Selecionar livro lido                  │    │
    │      │  3️⃣  Capturar foto do aluno 📸             │    │
    │      │  4️⃣  Preencher 3 perguntas                  │    │
    │      │  5️⃣  Atribuir avaliação (⭐ 1-5)          │    │
    │      │  6️⃣  Adicionar comentário                   │    │
    │      └─────────────────────────────────────────────┘    │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  💾 SALVAR REGISTRO                                     │
    │      • Data/hora do registro                            │
    │      • Dados do leitor                                  │
    │      • Dados do livro                                   │
    │      • Foto armazenada (base64)                         │
    │      • Respostas das perguntas                          │
    │      • Avaliação (estrelas)                             │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  📊 ATUALIZAÇÃO DO RANKING                              │
    │      ┌─────────────────────────────────────────────┐    │
    │      │  Cálculo de Pontuação:                      │    │
    │      │                                              │    │
    │      │  📚 +1 ponto por livro lido                 │    │
    │      │  ⭐ Bônus por avaliação alta               │    │
    │      │     └─► 5⭐ = +0.5 pontos                  │    │
    │      │     └─► 4⭐ = +0.3 pontos                  │    │
    │      │                                              │    │
    │      │  Total = Σ(livros lidos + bônus)           │    │
    │      └─────────────────────────────────────────────┘    │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  🏅 CLASSIFICAÇÃO E MEDALHAS                            │
    │                                                          │
    │      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓            │
    │      ┃  🥇 1º LUGAR - Medalha de OURO      ┃            │
    │      ┃     └─► Destaque visual dourado     ┃            │
    │      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛            │
    │                                                          │
    │      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓            │
    │      ┃  🥈 2º LUGAR - Medalha de PRATA     ┃            │
    │      ┃     └─► Destaque visual prateado    ┃            │
    │      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛            │
    │                                                          │
    │      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓            │
    │      ┃  🥉 3º LUGAR - Medalha de BRONZE    ┃            │
    │      ┃     └─► Destaque visual bronze      ┃            │
    │      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛            │
    │                                                          │
    │      ┌────────────────────────────────────┐             │
    │      │  Demais: Listagem padrão            │             │
    │      └────────────────────────────────────┘             │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  📈 VISUALIZAÇÃO DO RANKING                             │
    │      ┌─────────────────────────────────────────────┐    │
    │      │  👤 Nome do Leitor                          │    │
    │      │  📚 Livros Lidos: X                         │    │
    │      │  ⭐ Média de Avaliação: Y                  │    │
    │      │  📊 Total de Pontos: Z                      │    │
    │      │  🏅 Medalha (se TOP 3)                      │    │
    │      └─────────────────────────────────────────────┘    │
    └────────────────────┬────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  📜 HISTÓRICO INDIVIDUAL                                │
    │      • Ver todas as leituras do aluno                   │
    │      • Fotos de cada leitura                            │
    │      • Perguntas respondidas                            │
    │      • Avaliações dadas                                 │
    │      • Progresso ao longo do tempo                      │
    └─────────────────────────────────────────────────────────┘

    ╔════════════════════════════════════════════════════════════╗
    ║              🎯 BENEFÍCIOS DA GAMIFICAÇÃO                  ║
    ╠════════════════════════════════════════════════════════════╣
    ║  ✅ Incentiva hábito de leitura                           ║
    ║  ✅ Competição saudável entre alunos                      ║
    ║  ✅ Reconhecimento visual (medalhas)                      ║
    ║  ✅ Histórico de compreensão textual                      ║
    ║  ✅ Engajamento através de fotos                          ║
    ║  ✅ Avaliação da qualidade das leituras                   ║
    ╚════════════════════════════════════════════════════════════╝
`}
                </pre>
              </Box>
            </Paper>

            {/* Diagrama de Arquitetura Multi-tenant */}
            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#e0f7fa' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
                🏢 ARQUITETURA MULTI-TENANT
              </Typography>
              
              <Box className="diagram-box" sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <pre style={{ backgroundColor: '#01579b', color: '#81d4fa', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{`
    ╔════════════════════════════════════════════════════════════╗
    ║         🏢 SISTEMA MULTI-TENANT - ISOLAMENTO DE DADOS     ║
    ╚════════════════════════════════════════════════════════════╝

                         ┌──────────────────┐
                         │  🌐 CEI Platform │
                         │   SaaS Central   │
                         └────────┬─────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
    ┌─────────┐            ┌─────────┐             ┌─────────┐
    │ 🏫 ESCOLA│            │ 🏫 ESCOLA│             │ 🏫 ESCOLA│
    │    A    │            │    B    │             │    C    │
    └────┬────┘            └────┬────┘             └────┬────┘
         │                      │                       │
         │  Licença: ABC123     │  Licença: XYZ789      │  Licença: DEF456
         │  Plano: 1 Ano        │  Plano: 6 Meses       │  Plano: 1 Ano
         │  Status: Ativo       │  Status: Ativo        │  Status: Pendente
         │                      │                       │
         ▼                      ▼                       ▼
    ┌─────────────────────────────────────────────────────────┐
    │           💾 DADOS ISOLADOS POR ESCOLA                  │
    ├─────────────────────────────────────────────────────────┤
    │  LocalStorage com prefixo da licença:                   │
    │                                                          │
    │  🏫 Escola A (ABC123)           🏫 Escola B (XYZ789)   │
    │  ├─► livros_ABC123             ├─► livros_XYZ789      │
    │  ├─► leitores_ABC123           ├─► leitores_XYZ789    │
    │  ├─► emprestimos_ABC123        ├─► emprestimos_XYZ789 │
    │  ├─► clube_ABC123              ├─► clube_XYZ789       │
    │  └─► usuarios_ABC123           └─► usuarios_XYZ789    │
    │                                                          │
    │  ⚠️  IMPORTANTE: Dados nunca se misturam!              │
    │  ✅ Cada escola vê apenas seus próprios dados          │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  🔐 CONTROLE DE ACESSO                                  │
    ├─────────────────────────────────────────────────────────┤
    │                                                          │
    │  👑 SUPER ADMIN                                         │
    │  └─► Acesso a TODAS as escolas                         │
    │       ├─► Gerenciar licenças                            │
    │       ├─► Ativar/bloquear escolas                       │
    │       ├─► Ver métricas globais                          │
    │       └─► Emitir notas fiscais                          │
    │                                                          │
    │  👨‍💼 ADMIN DA ESCOLA                                    │
    │  └─► Acesso APENAS à sua escola                        │
    │       ├─► Ver dados da sua instituição                  │
    │       ├─► Gerenciar seus usuários                       │
    │       ├─► Configurar sua escola                         │
    │       └─► NÃO vê outras escolas                         │
    │                                                          │
    │  📖 BIBLIOTECÁRIO                                       │
    │  └─► Acesso operacional da sua escola                  │
    │       ├─► Cadastrar livros/leitores                     │
    │       ├─► Processar empréstimos                         │
    │       └─► NÃO gerencia usuários                         │
    │                                                          │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  💳 GESTÃO DE LICENÇAS E PAGAMENTOS                     │
    ├─────────────────────────────────────────────────────────┤
    │                                                          │
    │  1️⃣  ESCOLA se cadastra                                │
    │      └─► Status: Pendente                               │
    │                                                          │
    │  2️⃣  ESCOLA escolhe plano                              │
    │      ├─► 1 Mês (R$ 97,00)                              │
    │      ├─► 6 Meses (R$ 582,00)                           │
    │      └─► 1 Ano (R$ 1.164,00)                           │
    │                                                          │
    │  3️⃣  Pagamento via Mercado Pago                        │
    │      ├─► PIX (instantâneo)                              │
    │      ├─► Cartão de Crédito                              │
    │      └─► Boleto                                         │
    │                                                          │
    │  4️⃣  WEBHOOK confirma pagamento                        │
    │      └─► Status: Ativo ✅                              │
    │                                                          │
    │  5️⃣  ESCOLA acessa sistema                             │
    │      └─► Período de graça: 15 dias                     │
    │                                                          │
    │  6️⃣  LICENÇA expira                                    │
    │      ├─► Aviso 30 dias antes                            │
    │      ├─► Bloqueio após vencimento                       │
    │      └─► Dados preservados por 90 dias                  │
    │                                                          │
    └─────────────────────────────────────────────────────────┘

    ╔════════════════════════════════════════════════════════════╗
    ║              🔒 SEGURANÇA E PRIVACIDADE (LGPD)            ║
    ╠════════════════════════════════════════════════════════════╣
    ║  ✅ Isolamento completo entre escolas                     ║
    ║  ✅ Criptografia de dados sensíveis                       ║
    ║  ✅ Backup automático diário                              ║
    ║  ✅ Remoção de dados após 90 dias (LGPD)                 ║
    ║  ✅ Logs de auditoria por ação                            ║
    ║  ✅ SSL/TLS em todas as comunicações                      ║
    ╚════════════════════════════════════════════════════════════╝
`}
                </pre>
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Rodapé com Autenticidade */}
          <Box sx={{ mt: 6, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #1976d2' }}>
            <Typography variant="h5" fontWeight="bold" align="center" color="primary" gutterBottom>
              🔒 CERTIFICADO DE AUTENTICIDADE
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Sistema:</strong> CEI - Controle Escolar Inteligente<br />
                  <strong>Versão:</strong> {diagramMetadata.version}<br />
                  <strong>Data de Criação:</strong> Janeiro de 2026<br />
                  <strong>Última Atualização:</strong> {diagramUpdatedAt}<br />
                  <strong>Tipo:</strong> Software Proprietário (SaaS)<br />
                  <strong>Modalidade:</strong> Web Application + Cloud Database
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Autor e Proprietário:</strong> Wander Pires Silva Coelho<br />
                  <strong>CPF:</strong> [CONFIDENCIAL]<br />
                  <strong>Registro INPI:</strong> [Aguardando registro]<br />
                  <strong>Copyright:</strong> © 2026 - Todos os direitos reservados<br />
                  <strong>Cloud Provider:</strong> Supabase PostgreSQL
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                ⚖️ PROTEÇÃO LEGAL E ADVERTÊNCIA
              </Typography>
              <Typography variant="body2">
                Este documento e o sistema aqui descrito são protegidos pelas <strong>Leis nº 9.609/98 (Software)</strong> e 
                <strong> nº 9.610/98 (Direitos Autorais)</strong> da República Federativa do Brasil. Qualquer reprodução, 
                cópia, modificação, engenharia reversa ou uso não autorizado constitui <strong>crime</strong> previsto no 
                <strong> Art. 184 do Código Penal</strong>, sujeitando o infrator a <strong>detenção de 6 meses a 2 anos</strong>, 
                além de <strong>indenização mínima de R$ 50.000,00</strong> (cinquenta mil reais) por danos materiais e morais.
              </Typography>
            </Alert>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                © 2026 WANDER PIRES SILVA COELHO
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TODOS OS DIREITOS RESERVADOS | PROPRIEDADE INTELECTUAL PROTEGIDA
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Documento gerado em: {new Date().toLocaleString('pt-BR')}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}
