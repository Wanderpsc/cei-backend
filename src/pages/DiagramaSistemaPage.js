/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA CEI - CONTROLE ESCOLAR INTELIGENTE
 * © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
 * 
 * DIAGRAMA DE ARQUITETURA E CONSTRUÇÃO DO SISTEMA
 * Documento técnico confidencial - Uso restrito
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
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
  Stack
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
  IntegrationInstructions as IntegrationIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';

export default function DiagramaSistemaPage() {
  const navigate = useNavigate();

  const handleImprimir = () => {
    window.print();
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Botões de ação - não imprimem */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, '@media print': { display: 'none' } }}>
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
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Cabeçalho */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <ArchitectureIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              DIAGRAMA DE ARQUITETURA DO SISTEMA
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              CEI - Controle Escolar Inteligente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Versão 2.2.0 | Data: 07 de Janeiro de 2026
            </Typography>
            
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

          <Divider sx={{ my: 4 }} />

          {/* 1. VISÃO GERAL DO SISTEMA */}
          <Box sx={{ mb: 4 }}>
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
                      <li>Controle de Empréstimos</li>
                      <li>Cadastro de Alunos e Usuários</li>
                      <li>Controle de Patrimônio</li>
                      <li>Relatórios e Dashboard</li>
                      <li>Sistema Financeiro</li>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 2. ARQUITETURA DO SISTEMA */}
          <Box sx={{ mb: 4 }}>
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
                    <strong>Tecnologia:</strong> LocalStorage (atual) → PostgreSQL/MongoDB (futuro)<br />
                    <strong>Função:</strong> Armazenamento persistente de dados<br />
                    <strong>Backup:</strong> Diário automático<br />
                    <strong>Segurança:</strong> Criptografia AES-256
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
                    <strong>html5-qrcode:</strong> Leitura de QR Code e códigos de barras<br />
                    <strong>E-mail:</strong> Notificações automáticas (futuro)<br />
                    <strong>Webhooks:</strong> Confirmação de pagamentos
                  </Typography>
                </Paper>
              </Stack>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 3. STACK TECNOLÓGICO */}
          <Box sx={{ mb: 4 }}>
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
                      <Chip label="html5-qrcode 2.3.8" color="primary" size="small" />
                      <Chip label="axios (HTTP Client)" color="primary" size="small" />
                      <Chip label="JavaScript ES6+" color="primary" size="small" />
                      <Chip label="HTML5 + CSS3" color="primary" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Padrões:</strong> Hooks, Context API, Component-based<br />
                      <strong>Build:</strong> React Scripts (Create React App)<br />
                      <strong>Deploy:</strong> Surge.sh (CDN Global)
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
                      <Chip label="Express 4.18.2" color="warning" size="small" />
                      <Chip label="Mercado Pago SDK 2.0.15" color="warning" size="small" />
                      <Chip label="dotenv (Environment)" color="warning" size="small" />
                      <Chip label="CORS" color="warning" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Padrões:</strong> REST API, MVC, Middleware<br />
                      <strong>Segurança:</strong> HTTPS, JWT, bcrypt<br />
                      <strong>Deploy:</strong> Heroku/Railway (Produção)
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
                      <Chip label="AES-256 Encryption" color="error" size="small" />
                      <Chip label="bcrypt (Passwords)" color="error" size="small" />
                      <Chip label="SHA-256 (Signatures)" color="error" size="small" />
                      <Chip label="LGPD Compliance" color="error" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Autenticação:</strong> Sessões seguras + JWT<br />
                      <strong>Anti-pirataria:</strong> Watermark digital + Telemetria<br />
                      <strong>Backup:</strong> Diário automático
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
                      <Chip label="Mercado Pago API" color="success" size="small" />
                      <Chip label="Webhooks (Pagamentos)" color="success" size="small" />
                      <Chip label="SendGrid (E-mail - futuro)" color="success" size="small" />
                      <Chip label="AWS S3 (Backup - futuro)" color="success" size="small" />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Gateway:</strong> Mercado Pago (PIX + Cartão)<br />
                      <strong>Notificações:</strong> E-mail + SMS (planejado)<br />
                      <strong>Cloud Storage:</strong> AWS S3 (planejado)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 4. FLUXO DE DADOS */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon color="primary" />
              4. FLUXO DE DADOS E COMUNICAÇÃO
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📊 Diagrama de Fluxo de Dados
              </Typography>
              
              <Box sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                <pre style={{ backgroundColor: '#263238', color: '#aed581', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{`┌─────────────────────────────────────────────────────────────────┐
│                        USUÁRIO (Browser)                         │
│                    https://cei-controle-escolar                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ├──► Login/Autenticação
                 │    └──► Validação local + Backend
                 │
                 ├──► Navegação (React Router)
                 │    └──► SPA - Sem reload de página
                 │
                 ├──► Operações CRUD
                 │    ├──► Livros, Alunos, Empréstimos
                 │    ├──► Validação frontend (formulários)
                 │    └──► Persistência: LocalStorage (atual)
                 │
                 └──► Pagamentos
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
│  • Logs de auditoria - Rastreamento completo                  │
└─────────────────────────────────────────────────────────────────┘`}
                </pre>
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 5. ESTRUTURA DE DIRETÓRIOS */}
          <Box sx={{ mb: 4 }}>
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
{`📦 CEI - CONTROLE ESCOLAR INTELIGENTE
│
├── 📂 public/                      # Arquivos públicos estáticos
│   ├── index.html                 # HTML principal (SPA)
│   └── CNAME                      # Configuração Surge.sh
│
├── 📂 src/                        # Código-fonte React
│   ├── 📂 components/             # Componentes reutilizáveis
│   │   ├── Layout.js              # Layout principal (menu)
│   │   ├── ContratoModal.js       # Modal de contrato
│   │   ├── BarcodeScannerDialog.js # Scanner QR/Barcode
│   │   └── TermoDoacao.js         # Termo doação livros
│   │
│   ├── 📂 context/                # Context API (Estado global)
│   │   └── DataContext.js         # Gerenciamento de dados
│   │
│   ├── 📂 pages/                  # Páginas da aplicação
│   │   ├── LoginPage.js           # Tela de login
│   │   ├── DashboardPage.js       # Dashboard principal
│   │   ├── LivrosPage.js          # Gestão de livros + Scanner
│   │   ├── RelatoriosLivrosPage.js # Relatórios didáticos/paradidáticos
│   │   ├── ClubeDeLeituraPage.js  # Clube leitura + Ranking
│   │   ├── ClientesPage.js        # Cadastro de alunos
│   │   ├── EmprestimosPage.js     # Controle empréstimos
│   │   ├── PatrimonioPage.js      # Controle patrimônio
│   │   ├── RelatoriosPage.js      # Relatórios gerais
│   │   ├── FinanceiroPage.js      # Financeiro escola
│   │   ├── NotaFiscalPage.js      # Emissão NF-e ISS
│   │   ├── CadastroEscolaPage.js  # Cadastro instituição
│   │   ├── PagamentoPage.js       # Processamento pagamento
│   │   ├── TermosDeUsoPage.js     # Termos e políticas
│   │   └── DiagramaSistemaPage.js # Esta página
│   │
│   ├── App.js                     # Componente raiz + rotas
│   ├── index.js                   # Entry point React
│   └── index.css                  # Estilos globais
│
├── 📂 build/                      # Build de produção (gerado)
│   ├── static/                    # JS/CSS compilados
│   │   ├── js/                    # JavaScript bundles
│   │   └── css/                   # CSS bundles
│   └── index.html                 # HTML compilado
│
├── 📄 server.js                   # Backend Node.js + Express
├── 📄 security.js                 # Sistema de segurança
├── 📄 package.json                # Dependências NPM
├── 📄 .env                        # Variáveis de ambiente
├── 📄 .gitignore                  # Arquivos ignorados Git
│
├── 📂 Documentação Legal/
│   ├── LICENSE.md                 # Licença proprietária
│   ├── LICENSE.js                 # Header copyright
│   ├── TERMS_OF_SERVICE.md        # Termos de uso
│   ├── PRIVACY_POLICY.md          # Política privacidade
│   ├── AUTHORSHIP_DECLARATION.md  # Declaração autoria
│   ├── REGISTRO_INPI_GUIA.md      # Guia registro INPI
│   ├── CONTRATO_LICENCA_TEMPLATE.md # Template contrato
│   └── README.md                  # Documentação geral
│
└── 📂 Deploy/
    ├── DEPLOY.md                  # Guia de deployment
    └── SISTEMA_MULTITENANT_DOCS.md # Docs multi-tenant`}
                </pre>
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 6. MÓDULOS E FUNCIONALIDADES */}
          <Box sx={{ mb: 4 }}>
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
                  funcoes: ['Cadastro completo de acervo', 'Scanner QR/Barcode (ISBN)', 'Google Books API integrada', 'Tipos: Didático/Paradidático', 'Controle de vigência', 'Sistema de baixa (doação/término)']
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
                  funcoes: ['Emissão de NF-e de serviço', 'Cálculo automático de ISS', 'Dados da instituição (CNPJ)', 'Dados do tomador (cliente)', 'Documento formatado', 'Impressão profissional', 'Controle municipal de impostos']
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              7. INFORMAÇÕES TÉCNICAS E MÉTRICAS
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    10,000+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Linhas de Código
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    30+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Arquivos de Código
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    18+
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

          {/* 8. INOVAÇÕES TECNOLÓGICAS - VERSÃO 2.2 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'success.main' }}>
              ⭐ 8. INOVAÇÕES TECNOLÓGICAS (Versão 2.2.0)
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                🚀 Atualizações Recentes - Janeiro 2026
              </Typography>
              <Typography variant="body2">
                O sistema foi expandido com funcionalidades avançadas de gamificação, automação e gestão fiscal.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              {/* Scanner de Códigos */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'primary.main', borderWidth: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      📷 Scanner QR Code / Código de Barras
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Tecnologia:</strong> html5-qrcode 2.3.8 + Google Books API
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Funcionalidades:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Leitura de QR Code em tempo real</li>
                        <li>Leitura de códigos de barras EAN-13/EAN-8</li>
                        <li>Busca automática por ISBN na Google Books</li>
                        <li>Preenchimento automático de dados do livro</li>
                        <li>Acesso direto à câmera do dispositivo</li>
                        <li>Interface responsiva mobile-first</li>
                      </ul>
                    </Typography>
                    <Chip label="NOVO" color="success" size="small" sx={{ mt: 1 }} />
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
            </Grid>

            {/* Resumo Técnico das Inovações */}
            <Paper elevation={3} sx={{ mt: 3, p: 3, bgcolor: '#e8f5e9' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="success.dark">
                📊 Resumo Técnico das Inovações
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>4</strong><br />Módulos Novos
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>2</strong><br />APIs Integradas
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>3</strong><br />Componentes React
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" align="center">
                    <strong>+30</strong><br />Novas Funcionalidades
                  </Typography>
                </Grid>
              </Grid>
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
                  <strong>Versão:</strong> 2.2.0<br />
                  <strong>Data de Criação:</strong> Janeiro de 2026<br />
                  <strong>Tipo:</strong> Software Proprietário (SaaS)<br />
                  <strong>Modalidade:</strong> Web Application
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Autor e Proprietário:</strong> Wander Pires Silva Coelho<br />
                  <strong>CPF:</strong> [CONFIDENCIAL]<br />
                  <strong>Registro INPI:</strong> [Aguardando registro]<br />
                  <strong>Copyright:</strong> © 2026 - Todos os direitos reservados
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
