import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { Print } from '@mui/icons-material';

export default function TermoDoacao({ open, onClose, livro, doador, donatario }) {
  const handlePrint = () => {
    window.print();
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Termo de Doação de Livro</span>
          <Button startIcon={<Print />} onClick={handlePrint} variant="outlined">
            Imprimir
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          id="termo-doacao"
          sx={{
            p: 4,
            bgcolor: 'white',
            fontFamily: 'Times New Roman, serif',
            '@media print': {
              p: 6,
              fontSize: '12pt'
            }
          }}
        >
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            TERMO DE DOAÇÃO DE LIVRO
          </Typography>

          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
            Por este instrumento particular de doação, de um lado, como <strong>DOADOR</strong>:
          </Typography>

          <Box sx={{ ml: 4, mb: 2 }}>
            <Typography><strong>Nome:</strong> {doador?.nome || '___________________________________________'}</Typography>
            <Typography><strong>CPF/CNPJ:</strong> {doador?.cpf || '___________________________________________'}</Typography>
            <Typography><strong>Endereço:</strong> {doador?.endereco || '___________________________________________'}</Typography>
            {doador?.telefone && <Typography><strong>Telefone:</strong> {doador.telefone}</Typography>}
          </Box>

          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
            E de outro lado, como <strong>DONATÁRIO</strong>:
          </Typography>

          <Box sx={{ ml: 4, mb: 2 }}>
            <Typography><strong>Nome:</strong> {donatario?.nome || '___________________________________________'}</Typography>
            <Typography><strong>CPF/CNPJ:</strong> {donatario?.cpf || '___________________________________________'}</Typography>
            <Typography><strong>Endereço:</strong> {donatario?.endereco || '___________________________________________'}</Typography>
            {donatario?.telefone && <Typography><strong>Telefone:</strong> {donatario.telefone}</Typography>}
          </Box>

          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8, mt: 3 }}>
            Têm entre si justo e acordado o seguinte:
          </Typography>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            CLÁUSULA PRIMEIRA - DO OBJETO
          </Typography>
          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
            O DOADOR, neste ato, doa ao DONATÁRIO, que aceita, o(s) seguinte(s) bem(ns):
          </Typography>

          <Box sx={{ ml: 4, mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography><strong>Título:</strong> {livro?.titulo}</Typography>
            <Typography><strong>Autor:</strong> {livro?.autor}</Typography>
            {livro?.isbn && <Typography><strong>ISBN:</strong> {livro.isbn}</Typography>}
            {livro?.editora && <Typography><strong>Editora:</strong> {livro.editora}</Typography>}
            {livro?.anoPublicacao && <Typography><strong>Ano:</strong> {livro.anoPublicacao}</Typography>}
            <Typography><strong>Tipo:</strong> {livro?.tipo || 'Paradidático'}</Typography>
            <Typography><strong>Quantidade:</strong> {livro?.quantidade || 1} exemplar(es)</Typography>
          </Box>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            CLÁUSULA SEGUNDA - DA DOAÇÃO
          </Typography>
          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
            A presente doação é feita de forma pura, simples e irrevogável, sem qualquer ônus ou encargo
            para o DONATÁRIO, transferindo-se desde já a propriedade e a posse do bem doado.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            CLÁUSULA TERCEIRA - DA ACEITAÇÃO
          </Typography>
          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
            O DONATÁRIO aceita a presente doação nos termos e condições estabelecidos neste instrumento,
            comprometendo-se a dar ao bem doado a destinação adequada.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            CLÁUSULA QUARTA - DAS DISPOSIÇÕES GERAIS
          </Typography>
          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
            As partes elegem o foro da comarca de __________________ para dirimir quaisquer dúvidas ou
            controvérsias oriundas do presente termo.
          </Typography>

          <Typography paragraph sx={{ textAlign: 'justify', lineHeight: 1.8, mt: 3 }}>
            E, por estarem assim justos e contratados, assinam o presente instrumento em 2 (duas) vias
            de igual teor e forma, na presença das testemunhas abaixo identificadas.
          </Typography>

          <Typography align="center" sx={{ mt: 4 }}>
            {doador?.cidade || '_______________'}, {dataAtual}
          </Typography>

          <Box sx={{ mt: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Divider sx={{ width: '60%', mx: 'auto', mb: 1 }} />
              <Typography><strong>DOADOR</strong></Typography>
              <Typography variant="body2">{doador?.nome}</Typography>
              <Typography variant="body2">CPF/CNPJ: {doador?.cpf}</Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Divider sx={{ width: '60%', mx: 'auto', mb: 1 }} />
              <Typography><strong>DONATÁRIO</strong></Typography>
              <Typography variant="body2">{donatario?.nome}</Typography>
              <Typography variant="body2">CPF/CNPJ: {donatario?.cpf}</Typography>
            </Box>
          </Box>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Testemunhas:
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">Nome: _______________________</Typography>
              <Typography variant="body2">CPF: _______________________</Typography>
              <Typography variant="body2">Assinatura</Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">Nome: _______________________</Typography>
              <Typography variant="body2">CPF: _______________________</Typography>
              <Typography variant="body2">Assinatura</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button startIcon={<Print />} onClick={handlePrint} variant="contained">
          Imprimir para Assinaturas
        </Button>
      </DialogActions>
    </Dialog>
  );
}
