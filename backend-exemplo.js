// Backend de Exemplo para Sistema CEI - Integração de Pagamentos
// Execute com: node backend-exemplo.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Simular banco de dados em memória
let pagamentos = [];
let instituicoes = [];

// ==========================================
// ROTAS DE PAGAMENTO
// ==========================================

// Criar pagamento PIX
app.post('/api/pagamento/create-pix', async (req, res) => {
  try {
    const { amount, description, payer, instituicaoId } = req.body;
    
    // Gerar ID único para o pagamento
    const paymentId = `PIX-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Simular QR Code (em produção, seria gerado pelo gateway)
    const qrCode = `00020126580014br.gov.bcb.pix0136${paymentId}520400005303986540${amount}5802BR5925${payer.name}6009SAOPPAULO62410503***50300017br.gov.bcb.brcode01051.0.063041D3A`;
    
    // Salvar pagamento como pendente
    const pagamento = {
      id: paymentId,
      type: 'pix',
      amount: amount,
      description: description,
      payer: payer,
      instituicaoId: instituicaoId,
      status: 'pending',
      qr_code: qrCode,
      qr_code_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      created_at: new Date().toISOString()
    };
    
    pagamentos.push(pagamento);
    
    console.log(`✅ Pagamento PIX criado: ${paymentId} - R$ ${amount}`);
    
    res.json({
      success: true,
      payment: {
        id: paymentId,
        qr_code: qrCode,
        qr_code_base64: pagamento.qr_code_base64
      }
    });
    
    // Simular aprovação automática após 10 segundos (apenas para testes)
    setTimeout(() => {
      aprovarPagamento(paymentId);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Erro ao criar pagamento PIX:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar pagamento com Cartão de Crédito
app.post('/api/pagamento/create-card', async (req, res) => {
  try {
    const { amount, description, payer, card, installments, instituicaoId } = req.body;
    
    // Validar dados do cartão (simulação)
    if (!card.number || !card.holder_name || !card.expiration_date || !card.security_code) {
      return res.status(400).json({ success: false, error: 'Dados do cartão incompletos' });
    }
    
    // Gerar ID único para o pagamento
    const paymentId = `CARD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Salvar pagamento
    const pagamento = {
      id: paymentId,
      type: 'credit_card',
      amount: amount,
      description: description,
      payer: payer,
      instituicaoId: instituicaoId,
      installments: installments,
      card_last_digits: card.number.slice(-4),
      status: 'processing',
      created_at: new Date().toISOString()
    };
    
    pagamentos.push(pagamento);
    
    console.log(`💳 Pagamento com Cartão criado: ${paymentId} - R$ ${amount} em ${installments}x`);
    
    // Simular processamento (2 segundos)
    setTimeout(() => {
      // Simular aprovação (95% de chance)
      const aprovado = Math.random() > 0.05;
      
      if (aprovado) {
        aprovarPagamento(paymentId);
        res.json({
          success: true,
          payment: {
            id: paymentId,
            status: 'approved',
            installments: installments
          }
        });
      } else {
        const pagamento = pagamentos.find(p => p.id === paymentId);
        if (pagamento) {
          pagamento.status = 'rejected';
        }
        res.json({
          success: false,
          payment: {
            id: paymentId,
            status: 'rejected',
            message: 'Pagamento recusado pela operadora'
          }
        });
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erro ao criar pagamento com cartão:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verificar status de pagamento
app.get('/api/pagamento/status/:id', (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = pagamentos.find(p => p.id === id);
    
    if (!pagamento) {
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }
    
    res.json({
      success: true,
      payment: {
        id: pagamento.id,
        status: pagamento.status,
        amount: pagamento.amount,
        type: pagamento.type,
        created_at: pagamento.created_at,
        approved_at: pagamento.approved_at
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook (simulação)
app.post('/api/webhooks/pagamento', (req, res) => {
  try {
    const { payment_id, status } = req.body;
    
    console.log(`🔔 Webhook recebido: ${payment_id} - Status: ${status}`);
    
    const pagamento = pagamentos.find(p => p.id === payment_id);
    
    if (pagamento) {
      pagamento.status = status;
      
      if (status === 'approved') {
        aprovarPagamento(payment_id);
      }
    }
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ROTAS DE INSTITUIÇÃO
// ==========================================

// Cadastrar instituição
app.post('/api/instituicao/cadastrar', (req, res) => {
  try {
    const dadosInstituicao = req.body;
    
    const instituicao = {
      id: `INST-${Date.now()}`,
      ...dadosInstituicao,
      status: 'aguardando_pagamento',
      created_at: new Date().toISOString()
    };
    
    instituicoes.push(instituicao);
    
    console.log(`🏫 Instituição cadastrada: ${instituicao.nomeInstituicao}`);
    
    res.json({
      success: true,
      instituicao: {
        id: instituicao.id,
        nome: instituicao.nomeInstituicao,
        status: instituicao.status
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao cadastrar instituição:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ativar instituição após pagamento
app.post('/api/instituicao/ativar/:id', (req, res) => {
  try {
    const { id } = req.params;
    const instituicao = instituicoes.find(i => i.id === id);
    
    if (!instituicao) {
      return res.status(404).json({ success: false, error: 'Instituição não encontrada' });
    }
    
    instituicao.status = 'ativa';
    instituicao.activated_at = new Date().toISOString();
    
    console.log(`✅ Instituição ativada: ${instituicao.nomeInstituicao}`);
    
    // Aqui você enviaria um email de boas-vindas
    enviarEmailBoasVindas(instituicao);
    
    res.json({
      success: true,
      instituicao: {
        id: instituicao.id,
        nome: instituicao.nomeInstituicao,
        status: instituicao.status
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao ativar instituição:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function aprovarPagamento(paymentId) {
  const pagamento = pagamentos.find(p => p.id === paymentId);
  
  if (pagamento && pagamento.status !== 'approved') {
    pagamento.status = 'approved';
    pagamento.approved_at = new Date().toISOString();
    
    console.log(`✅ Pagamento aprovado: ${paymentId}`);
    
    // Ativar instituição relacionada
    if (pagamento.instituicaoId) {
      const instituicao = instituicoes.find(i => i.id === pagamento.instituicaoId);
      if (instituicao) {
        instituicao.status = 'ativa';
        instituicao.activated_at = new Date().toISOString();
        console.log(`🏫 Instituição ativada: ${instituicao.nomeInstituicao}`);
        
        // Enviar email de confirmação
        enviarEmailPagamentoAprovado(instituicao, pagamento);
      }
    }
  }
}

function enviarEmailPagamentoAprovado(instituicao, pagamento) {
  // Simulação de envio de email
  console.log(`
📧 ===== EMAIL DE CONFIRMAÇÃO =====
Para: ${instituicao.email}
Assunto: Pagamento Aprovado - Sistema CEI

Olá ${instituicao.nomeResponsavel},

Seu pagamento foi aprovado com sucesso!

Detalhes:
- Instituição: ${instituicao.nomeInstituicao}
- Valor: R$ ${pagamento.amount.toFixed(2)}
- Plano: ${instituicao.plano}
- Transação: ${pagamento.id}

Suas credenciais de acesso:
- Login: ${instituicao.loginAdmin}
- Senha: (a que você cadastrou)

Acesse agora: https://seu-dominio.com/login

Obrigado por escolher o Sistema CEI!

===================================
  `);
}

function enviarEmailBoasVindas(instituicao) {
  // Simulação de envio de email de boas-vindas
  console.log(`
📧 ===== EMAIL DE BOAS-VINDAS =====
Para: ${instituicao.email}
Assunto: Bem-vindo ao Sistema CEI!

Olá ${instituicao.nomeResponsavel},

Seja bem-vindo ao Sistema CEI - Controle Escolar Inteligente!

Sua instituição ${instituicao.nomeInstituicao} está ativa e pronta para uso.

Primeiros passos:
1. Faça login no sistema
2. Configure os dados da sua biblioteca
3. Cadastre seus livros
4. Cadastre seus alunos
5. Comece a gerenciar empréstimos

Em caso de dúvidas, estamos à disposição!

Sistema CEI - Desenvolvido por Wander Pires Silva Coelho ®

===================================
  `);
}

// ==========================================
// DASHBOARD (Rota de teste)
// ==========================================

app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    total_pagamentos: pagamentos.length,
    pagamentos_aprovados: pagamentos.filter(p => p.status === 'approved').length,
    pagamentos_pendentes: pagamentos.filter(p => p.status === 'pending').length,
    pagamentos_rejeitados: pagamentos.filter(p => p.status === 'rejected').length,
    total_instituicoes: instituicoes.length,
    instituicoes_ativas: instituicoes.filter(i => i.status === 'ativa').length,
    faturamento_total: pagamentos
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0)
  };
  
  res.json({ success: true, stats });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║          🏫 SISTEMA CEI - Backend API                ║
║          Integração de Pagamentos                    ║
║                                                       ║
║  Servidor rodando em: http://localhost:${PORT}      ║
║                                                       ║
║  Endpoints disponíveis:                              ║
║  • POST /api/pagamento/create-pix                    ║
║  • POST /api/pagamento/create-card                   ║
║  • GET  /api/pagamento/status/:id                    ║
║  • POST /api/webhooks/pagamento                      ║
║  • POST /api/instituicao/cadastrar                   ║
║  • POST /api/instituicao/ativar/:id                  ║
║  • GET  /api/dashboard/stats                         ║
║                                                       ║
║  Desenvolvido por: Wander Pires Silva Coelho ®      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

module.exports = app;
