/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA CEI - CONTROLE ESCOLAR INTELIGENTE
 * © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

export default function ContratoModal({ open, onClose, onAceitar, dadosInstituicao }) {
  const [aceitou, setAceitou] = useState(false);
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const horaAtual = new Date().toLocaleTimeString('pt-BR');

  const handleAceitar = () => {
    if (!aceitou) {
      alert('Você precisa marcar a opção "Li e aceito" para continuar.');
      return;
    }

    // Salvar aceite com timestamp
    const aceiteContrato = {
      aceitou: true,
      data: new Date().toISOString(),
      dataFormatada: `${dataAtual} às ${horaAtual}`,
      nomeInstituicao: dadosInstituicao.nome,
      cnpj: dadosInstituicao.cnpj,
      responsavel: dadosInstituicao.responsavel,
      plano: dadosInstituicao.plano
    };

    onAceitar(aceiteContrato);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}} // Desabilitar fechar clicando fora
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown // Desabilitar ESC
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon />
          <Typography variant="h6">Contrato de Licença de Uso de Software</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Aviso Importante */}
        <Alert severity="warning" icon={<SecurityIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            LEIA ATENTAMENTE ANTES DE ACEITAR
          </Typography>
          <Typography variant="body2">
            Este é um contrato legalmente vinculante. Ao aceitar, você concorda com todos os termos.
          </Typography>
        </Alert>

        {/* Identificação */}
        <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            PARTES CONTRATANTES
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" paragraph>
            <strong>CONTRATANTE (Licenciado):</strong><br />
            Instituição: {dadosInstituicao.nome || '[NOME DA INSTITUIÇÃO]'}<br />
            CNPJ: {dadosInstituicao.cnpj || '[CNPJ]'}<br />
            Responsável: {dadosInstituicao.responsavel || '[RESPONSÁVEL]'}<br />
            Plano: {dadosInstituicao.plano || '[PLANO]'}
          </Typography>
          <Typography variant="body2">
            <strong>CONTRATADO (Licenciante):</strong><br />
            Nome: Wander Pires Silva Coelho<br />
            Software: CEI - Controle Escolar Inteligente<br />
            Modalidade: SaaS (Software as a Service)
          </Typography>
        </Paper>

        {/* Contrato */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            CONTRATO DE LICENÇA DE USO DE SOFTWARE
          </Typography>
          
          <Typography variant="caption" align="center" display="block" gutterBottom>
            Data: {dataAtual} | Hora: {horaAtual}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Cláusula 1 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 1ª - DO OBJETO
          </Typography>
          <Typography variant="body2" paragraph>
            1.1. O presente contrato tem por objeto a concessão de licença de uso do software denominado 
            <strong> CEI - Controle Escolar Inteligente</strong>, de propriedade exclusiva do CONTRATADO.
          </Typography>
          <Typography variant="body2" paragraph>
            1.2. O software será fornecido na modalidade SaaS (Software as a Service), acessado via navegador 
            web, sem instalação local.
          </Typography>

          {/* Cláusula 2 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 2ª - DA LICENÇA
          </Typography>
          <Typography variant="body2" paragraph>
            2.1. A licença é concedida de forma <strong>NÃO EXCLUSIVA</strong>, <strong>NÃO TRANSFERÍVEL</strong> e 
            <strong> ONEROSA</strong>, pelo prazo determinado no plano contratado.
          </Typography>
          <Typography variant="body2" paragraph>
            2.2. A licença permite o uso do software exclusivamente para os fins da instituição contratante, 
            sendo vedada a sublicença, cessão ou transferência a terceiros.
          </Typography>

          {/* Cláusula 3 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 3ª - DO VALOR E PAGAMENTO
          </Typography>
          <Typography variant="body2" paragraph>
            3.1. O CONTRATANTE pagará ao CONTRATADO o valor mensal conforme plano escolhido:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 3, mb: 2 }}>
            <li><strong>Plano Básico</strong>: R$ 29,90/mês</li>
            <li><strong>Plano Intermediário</strong>: R$ 49,90/mês</li>
            <li><strong>Plano Premium</strong>: R$ 79,90/mês</li>
          </Typography>
          <Typography variant="body2" paragraph>
            3.2. O pagamento será realizado mensalmente através do Mercado Pago (PIX, Cartão ou Boleto).
          </Typography>
          <Typography variant="body2" paragraph>
            3.3. O não pagamento no prazo de 30 dias implica em suspensão automática do acesso ao sistema.
          </Typography>

          {/* Cláusula 4 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 4ª - DA PROPRIEDADE INTELECTUAL
          </Typography>
          <Typography variant="body2" paragraph>
            4.1. O software é <strong>PROPRIEDADE EXCLUSIVA</strong> do CONTRATADO, protegido pelas 
            Leis nº 9.609/98 (Lei do Software) e nº 9.610/98 (Direitos Autorais).
          </Typography>
          <Typography variant="body2" paragraph>
            4.2. É <strong>EXPRESSAMENTE PROIBIDO</strong>: copiar, modificar, fazer engenharia reversa, 
            descompilar, sublicenciar ou distribuir o software.
          </Typography>
          <Typography variant="body2" paragraph color="error">
            4.3. Violações acarretarão <strong>processo criminal</strong> (Art. 184 do CP - detenção de 6 meses a 2 anos) 
            e <strong>indenização mínima de R$ 50.000,00</strong>.
          </Typography>

          {/* Cláusula 5 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 5ª - DAS OBRIGAÇÕES DO CONTRATANTE
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>Utilizar o software exclusivamente para fins legais</li>
            <li>Manter sigilo das credenciais de acesso</li>
            <li>Não compartilhar acesso com terceiros não autorizados</li>
            <li>Efetuar pagamentos nos prazos estabelecidos</li>
            <li>Respeitar os direitos de propriedade intelectual</li>
          </Typography>

          {/* Cláusula 6 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 6ª - DAS OBRIGAÇÕES DO CONTRATADO
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>Manter o sistema disponível 99% do tempo</li>
            <li>Fornecer suporte técnico conforme plano contratado</li>
            <li>Proteger dados conforme LGPD (Lei 13.709/18)</li>
            <li>Realizar backups diários dos dados</li>
            <li>Notificar manutenções com antecedência</li>
          </Typography>

          {/* Cláusula 7 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 7ª - DA PROTEÇÃO DE DADOS (LGPD)
          </Typography>
          <Typography variant="body2" paragraph>
            7.1. O CONTRATADO compromete-se a tratar os dados pessoais em conformidade com a Lei 13.709/18 (LGPD).
          </Typography>
          <Typography variant="body2" paragraph>
            7.2. Os dados serão utilizados exclusivamente para prestação do serviço contratado.
          </Typography>
          <Typography variant="body2" paragraph>
            7.3. O CONTRATANTE tem direito de acesso, correção, exclusão e portabilidade de seus dados.
          </Typography>

          {/* Cláusula 8 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 8ª - DA VIGÊNCIA E RESCISÃO
          </Typography>
          <Typography variant="body2" paragraph>
            8.1. O contrato vigora por prazo indeterminado, enquanto houver pagamento regular.
          </Typography>
          <Typography variant="body2" paragraph>
            8.2. Qualquer parte pode rescindir mediante comunicação prévia de 30 dias.
          </Typography>
          <Typography variant="body2" paragraph>
            8.3. O CONTRATADO pode rescindir imediatamente em caso de violação dos termos.
          </Typography>
          <Typography variant="body2" paragraph>
            8.4. Após rescisão, os dados serão mantidos por 30 dias e então excluídos permanentemente.
          </Typography>

          {/* Cláusula 9 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 9ª - DA GARANTIA E RESPONSABILIDADE
          </Typography>
          <Typography variant="body2" paragraph>
            9.1. O software é fornecido "AS IS" (como está), com garantia de 7 dias para reembolso.
          </Typography>
          <Typography variant="body2" paragraph>
            9.2. O CONTRATADO não se responsabiliza por: perda de dados causada pelo usuário, 
            interrupções de internet, erros de operação ou decisões baseadas nos relatórios.
          </Typography>
          <Typography variant="body2" paragraph>
            9.3. A responsabilidade do CONTRATADO está limitada ao valor pago nos últimos 12 meses.
          </Typography>

          {/* Cláusula 10 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 10ª - DA CONFIDENCIALIDADE
          </Typography>
          <Typography variant="body2" paragraph>
            10.1. As partes comprometem-se a manter sigilo sobre informações confidenciais.
          </Typography>
          <Typography variant="body2" paragraph>
            10.2. O CONTRATANTE não divulgará detalhes técnicos ou funcionamento interno do software.
          </Typography>

          {/* Cláusula 11 */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            CLÁUSULA 11ª - DO FORO
          </Typography>
          <Typography variant="body2" paragraph>
            11.1. Fica eleito o foro da comarca do CONTRATADO para dirimir quaisquer dúvidas oriundas 
            deste contrato, com exclusão de qualquer outro, por mais privilegiado que seja.
          </Typography>

          {/* Assinatura Digital */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Este contrato foi gerado eletronicamente e tem validade jurídica conforme<br />
            Lei 9.609/98, Lei 9.610/98 e Marco Civil da Internet (Lei 12.965/14)
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" align="center" fontWeight="bold">
            © 2026 Wander Pires Silva Coelho - Todos os direitos reservados
          </Typography>
        </Box>

        {/* Checkbox de aceite */}
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aceitou}
                onChange={(e) => setAceitou(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <strong>Declaro que li, compreendi e aceito integralmente todos os termos deste contrato</strong>, 
                reconhecendo que ele tem validade jurídica e que estou ciente das obrigações e penalidades previstas.
              </Typography>
            }
          />
        </Box>

        {/* Informação do aceite */}
        {aceitou && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Aceite registrado em:</strong> {dataAtual} às {horaAtual}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleAceitar}
          variant="contained"
          disabled={!aceitou}
          startIcon={<GavelIcon />}
        >
          Aceitar Contrato e Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
