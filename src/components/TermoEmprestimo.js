import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { Print, Close } from '@mui/icons-material';

function TermoEmprestimo({ open, onClose, dados, tipo = 'preenchido' }) {
  const termoRef = useRef();

  const handleImprimir = () => {
    const conteudo = termoRef.current;
    const janelaImpressao = window.open('', '_blank');
    
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Termo de Empréstimo - ${tipo === 'branco' ? 'Modelo' : dados?.codigoEmprestimo || ''}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            max-width: 21cm;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          
          .header h1 {
            margin: 5px 0;
            font-size: 16pt;
            font-weight: bold;
          }
          
          .header h2 {
            margin: 5px 0;
            font-size: 14pt;
            font-weight: normal;
          }
          
          .secao {
            margin: 25px 0;
          }
          
          .secao-titulo {
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
          }
          
          .campo {
            margin: 8px 0;
            display: flex;
            align-items: baseline;
          }
          
          .campo-label {
            font-weight: bold;
            min-width: 150px;
            display: inline-block;
          }
          
          .campo-valor {
            border-bottom: 1px solid #000;
            flex: 1;
            padding-left: 5px;
            min-height: 20px;
          }
          
          .legislacao {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 15px;
            margin: 20px 0;
            font-size: 10pt;
          }
          
          .legislacao h3 {
            font-size: 11pt;
            margin-top: 0;
          }
          
          .artigo {
            margin: 10px 0;
            text-align: justify;
          }
          
          .artigo-numero {
            font-weight: bold;
          }
          
          .responsabilidades {
            background-color: #fff3cd;
            border: 2px solid #856404;
            padding: 15px;
            margin: 20px 0;
          }
          
          .responsabilidades h3 {
            color: #856404;
            margin-top: 0;
          }
          
          .assinaturas {
            margin-top: 50px;
            page-break-inside: avoid;
          }
          
          .assinatura-campo {
            margin-top: 60px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          
          .assinatura-info {
            font-size: 10pt;
            color: #666;
          }
          
          .rodape {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #000;
            font-size: 9pt;
            text-align: center;
            color: #666;
          }
          
          .destaque {
            font-weight: bold;
            color: #c00;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          table td {
            border: 1px solid #333;
            padding: 8px;
          }
          
          .linha-dupla {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        </style>
      </head>
      <body>
        ${conteudo.innerHTML}
      </body>
      </html>
    `);
    
    janelaImpressao.document.close();
    setTimeout(() => {
      janelaImpressao.print();
    }, 250);
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {tipo === 'branco' ? '📄 Modelo de Termo de Empréstimo' : '📄 Termo de Empréstimo de Patrimônio Público'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box ref={termoRef} sx={{ p: 2 }}>
          {/* CABEÇALHO */}
          <Box className="header">
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {dados?.instituicaoNome || '_____________________________________'}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              TERMO DE EMPRÉSTIMO DE MATERIAL DIDÁTICO/PARADIDÁTICO
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Patrimônio Público - Lei Federal nº 8.666/93 e alterações
            </Typography>
            {tipo !== 'branco' && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                Número: {dados?.codigoEmprestimo || 'N/A'} | Data: {dataAtual}
              </Typography>
            )}
          </Box>

          {/* DADOS DO EMPRÉSTIMO */}
          <Box className="secao">
            <Typography className="secao-titulo" variant="subtitle1">
              1. DADOS DO EMPRÉSTIMO
            </Typography>
            
            <Box className="campo">
              <Typography className="campo-label">Código do Empréstimo:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.codigoEmprestimo}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Data do Empréstimo:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.dataEmprestimo ? new Date(dados.dataEmprestimo).toLocaleDateString('pt-BR') : ''}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Data de Devolução:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.dataDevolucao ? new Date(dados.dataDevolucao).toLocaleDateString('pt-BR') : ''}
              </Typography>
            </Box>
          </Box>

          {/* DADOS DO LIVRO */}
          <Box className="secao">
            <Typography className="secao-titulo" variant="subtitle1">
              2. IDENTIFICAÇÃO DO MATERIAL
            </Typography>

            <Box className="campo">
              <Typography className="campo-label">Código do Livro:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.livroCodigo}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Título:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.livroTitulo}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Autor:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.livroAutor}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">ISBN:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.livroISBN}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Editora:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.livroEditora}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Tipo:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.livroTipo}
              </Typography>
            </Box>
          </Box>

          {/* DADOS DO LEITOR */}
          <Box className="secao">
            <Typography className="secao-titulo" variant="subtitle1">
              3. IDENTIFICAÇÃO DO COMODATÁRIO (LEITOR)
            </Typography>

            <Box className="campo">
              <Typography className="campo-label">Código do Leitor:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.leitorCodigo}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Nome Completo:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.leitorNome}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">CPF:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.leitorCPF}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Telefone:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.leitorTelefone}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">E-mail:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.leitorEmail}
              </Typography>
            </Box>

            <Box className="campo">
              <Typography className="campo-label">Endereço:</Typography>
              <Typography className="campo-valor">
                {tipo === 'branco' ? '' : dados?.leitorEndereco}
              </Typography>
            </Box>

            {dados?.leitorMatricula && (
              <Box className="campo">
                <Typography className="campo-label">Matrícula:</Typography>
                <Typography className="campo-valor">
                  {tipo === 'branco' ? '' : dados?.leitorMatricula}
                </Typography>
              </Box>
            )}
          </Box>

          {/* FUNDAMENTAÇÃO LEGAL */}
          <Box className="legislacao">
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '11pt' }}>
              4. FUNDAMENTAÇÃO LEGAL E RESPONSABILIDADES
            </Typography>

            <Box className="artigo">
              <Typography className="artigo-numero">
                Lei Federal nº 8.666/93 (Licitações e Contratos) - Art. 66:
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                "O contrato deverá ser executado fielmente pelas partes, de acordo com as cláusulas avençadas 
                e as normas desta Lei, respondendo cada uma pelas consequências de sua inexecução total ou parcial."
              </Typography>
            </Box>

            <Box className="artigo">
              <Typography className="artigo-numero">
                Lei Federal nº 9.605/98 (Crimes Ambientais) - Art. 62:
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                "Destruir, inutilizar ou deteriorar: I - bem especialmente protegido por lei, ato administrativo 
                ou decisão judicial; II - arquivo, registro, museu, biblioteca, pinacoteca, instalação científica 
                ou similar protegido por lei, ato administrativo ou decisão judicial: Pena - reclusão, de um a três anos, 
                e multa."
              </Typography>
            </Box>

            <Box className="artigo">
              <Typography className="artigo-numero">
                Código Penal Brasileiro - Art. 163 (Dano ao Patrimônio):
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                "Destruir, inutilizar ou deteriorar coisa alheia: Pena - detenção, de um a seis meses, ou multa."
                <br />
                <strong>Parágrafo único:</strong> Se o crime é cometido contra patrimônio da União, Estado, Município, 
                empresa concessionária de serviços públicos ou sociedade de economia mista, a pena é de detenção, 
                de seis meses a três anos, e multa, além da obrigação de reparar o dano.
              </Typography>
            </Box>

            <Box className="artigo">
              <Typography className="artigo-numero">
                Código Civil - Art. 927 (Responsabilidade Civil):
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                "Aquele que, por ato ilícito (arts. 186 e 187), causar dano a outrem, fica obrigado a repará-lo."
              </Typography>
            </Box>

            <Box className="artigo">
              <Typography className="artigo-numero">
                Lei de Improbidade Administrativa (Lei 8.429/92) - Art. 10, VIII:
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                Constitui ato de improbidade administrativa que causa lesão ao erário "frustrar a licitude de processo 
                licitatório ou de processo seletivo para celebração de parcerias com entidades sem fins lucrativos, 
                ou dispensá-los indevidamente".
              </Typography>
            </Box>
          </Box>

          {/* RESPONSABILIDADES DO COMODATÁRIO */}
          <Box className="responsabilidades">
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              5. OBRIGAÇÕES E RESPONSABILIDADES DO COMODATÁRIO
            </Typography>

            <Typography variant="body2" component="div" sx={{ textAlign: 'justify' }}>
              <strong>O comodatário (leitor) compromete-se a:</strong>
              
              <Box component="ol" sx={{ mt: 1, pl: 2 }}>
                <li>Conservar o material em perfeito estado, evitando danos, riscos, rabiscos, manchas ou qualquer tipo de deterioração;</li>
                <li>Utilizar o material exclusivamente para fins educacionais e pedagógicos;</li>
                <li>Devolver o material na data estabelecida, nas mesmas condições em que foi recebido;</li>
                <li>Comunicar imediatamente à instituição qualquer dano, perda ou furto do material;</li>
                <li>Não emprestar, ceder ou transferir o material a terceiros sem autorização prévia;</li>
                <li>Responsabilizar-se integralmente pelo material enquanto estiver sob sua guarda;</li>
                <li>Indenizar a instituição pelo valor atual de mercado do material em caso de perda, furto ou danos irreparáveis;</li>
                <li>Arcar com todos os custos de reparação em caso de danos recuperáveis ao material;</li>
                <li>Estar ciente de que o não cumprimento deste termo pode acarretar em sanções administrativas, civis e penais;</li>
                <li>Concordar que a renovação do empréstimo está sujeita à disponibilidade e aprovação da instituição.</li>
              </Box>
            </Typography>
          </Box>

          {/* CLÁUSULAS ESPECIAIS */}
          <Box className="secao">
            <Typography className="secao-titulo" variant="subtitle1">
              6. CLÁUSULAS ESPECIAIS
            </Typography>

            <Typography variant="body2" sx={{ textAlign: 'justify', mb: 1 }}>
              <strong>6.1. PENALIDADES:</strong> O não cumprimento das obrigações previstas neste termo poderá acarretar 
              as seguintes penalidades:
            </Typography>
            
            <Box component="ul" sx={{ pl: 4 }}>
              <li><Typography variant="body2">Suspensão temporária ou definitiva do direito de empréstimo;</Typography></li>
              <li><Typography variant="body2">Obrigação de ressarcimento do valor integral do material;</Typography></li>
              <li><Typography variant="body2">Aplicação de multa correspondente a até 2 (duas) vezes o valor do material;</Typography></li>
              <li><Typography variant="body2">Responsabilização civil e criminal nos termos da legislação vigente;</Typography></li>
              <li><Typography variant="body2">Registro em sistema de inadimplentes da instituição.</Typography></li>
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'justify', mb: 1, mt: 2 }}>
              <strong>6.2. VISTORIA:</strong> O material foi vistoriado e entregue em perfeito estado de conservação, 
              conforme verificado pelo comodatário no momento da retirada.
            </Typography>

            <Typography variant="body2" sx={{ textAlign: 'justify', mb: 1 }}>
              <strong>6.3. FORO:</strong> Fica eleito o foro da comarca da instituição para dirimir quaisquer questões 
              decorrentes deste termo de empréstimo.
            </Typography>
          </Box>

          {/* DECLARAÇÃO DE CIÊNCIA */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', border: '2px solid #1976d2' }}>
            <Typography variant="body1" sx={{ textAlign: 'justify', fontWeight: 'bold' }}>
              DECLARAÇÃO DE CIÊNCIA E CONCORDÂNCIA
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'justify', mt: 1 }}>
              Declaro que recebi o material descrito neste termo em perfeito estado de conservação, 
              estou ciente de todas as obrigações e responsabilidades aqui estabelecidas, bem como das 
              penalidades previstas na legislação brasileira para dano, perda ou má conservação de 
              patrimônio público. Comprometo-me a devolver o material na data estipulada e nas mesmas 
              condições em que foi recebido.
            </Typography>
          </Box>

          {/* ASSINATURAS */}
          <Box className="assinaturas">
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 5 }}>
              {tipo === 'branco' ? '__________________, ____ de _____________ de ________.' : 
               `${dados?.instituicaoCidade || '________________'}, ${dataAtual}`}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mt: 6 }}>
              <Box>
                <Box className="assinatura-campo" sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {tipo === 'branco' ? '' : dados?.leitorNome}
                  </Typography>
                  <Typography variant="body2" className="assinatura-info">
                    Comodatário (Leitor)
                  </Typography>
                  <Typography variant="body2" className="assinatura-info">
                    CPF: {tipo === 'branco' ? '___________________' : dados?.leitorCPF}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box className="assinatura-campo" sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {tipo === 'branco' ? '' : dados?.responsavelNome || ''}
                  </Typography>
                  <Typography variant="body2" className="assinatura-info">
                    Responsável pela Instituição
                  </Typography>
                  <Typography variant="body2" className="assinatura-info">
                    Cargo: {tipo === 'branco' ? '___________________' : dados?.responsavelCargo || 'Bibliotecário(a)'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Se for menor de idade, adicionar campo para responsável legal */}
            {tipo !== 'branco' && dados?.leitorMenorIdade && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#d32f2f' }}>
                  * Por ser menor de idade, é necessária a assinatura do responsável legal:
                </Typography>
                <Box className="assinatura-campo" sx={{ maxWidth: '400px', mx: 'auto', textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dados?.responsavelLegalNome || ''}
                  </Typography>
                  <Typography variant="body2" className="assinatura-info">
                    Responsável Legal
                  </Typography>
                  <Typography variant="body2" className="assinatura-info">
                    CPF: {dados?.responsavelLegalCPF || '___________________'}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* RODAPÉ */}
          <Box className="rodape">
            <Typography variant="caption">
              Este documento foi gerado eletronicamente pelo Sistema CEI - Controle Escolar Inteligente
            </Typography>
            <Typography variant="caption" display="block">
              {tipo === 'branco' ? 'Modelo de Termo de Empréstimo' : `Termo: ${dados?.codigoEmprestimo || 'N/A'}`} | 
              Data de emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
              ⚠️ ATENÇÃO: Este termo tem validade jurídica e deve ser arquivado pela instituição conforme 
              Lei de Arquivos (Lei 8.159/91) pelo prazo mínimo de 5 (cinco) anos.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Fechar
        </Button>
        <Button
          variant="contained"
          onClick={handleImprimir}
          startIcon={<Print />}
          color="primary"
        >
          Imprimir Termo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TermoEmprestimo;
