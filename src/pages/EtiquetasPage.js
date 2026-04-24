import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Checkbox,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Print, SelectAll, Search, Label } from '@mui/icons-material';

function gerarCodigosUnitarios(item, tipo) {
  const codigos = [];
  const quantidade = Number(item.quantidade) || 1;
  const codigoBase = tipo === 'livro'
    ? (item.codigoIdentificacao || `LIV${String(item.id).slice(0, 6)}`)
    : (item.numeroPatrimonio || `PAT${String(item.id).slice(0, 6)}`);

  for (let i = 1; i <= quantidade; i++) {
    codigos.push({
      codigoUnitario: `${codigoBase}-${String(i).padStart(2, '0')}`,
      codigoBase,
      exemplar: i,
      totalExemplares: quantidade,
      titulo: tipo === 'livro' ? item.titulo : item.descricao,
      autor: tipo === 'livro' ? (item.autor || '') : '',
      isbn: tipo === 'livro' ? (item.isbn || '') : '',
      tipoItem: tipo === 'livro' ? (item.tipo || 'Livro') : 'Patrimônio',
      categoria: tipo === 'livro' ? (item.categoria || '') : (item.categoria || ''),
      localizacao: item.localizacao || '',
      itemId: item.id
    });
  }
  return codigos;
}

export default function EtiquetasPage() {
  const { livros, patrimonio } = useData();
  const [busca, setBusca] = useState('');
  const [selecionados, setSelecionados] = useState(new Set());
  const [incluirPatrimonio, setIncluirPatrimonio] = useState(false);
  const [tamanhoEtiqueta, setTamanhoEtiqueta] = useState('pequena'); // pequena, media, grande

  const todosOsCodigos = useMemo(() => {
    const codigos = [];

    livros.filter(l => !l.baixa).forEach(livro => {
      codigos.push(...gerarCodigosUnitarios(livro, 'livro'));
    });

    if (incluirPatrimonio) {
      patrimonio.forEach(bem => {
        codigos.push(...gerarCodigosUnitarios(bem, 'patrimonio'));
      });
    }

    return codigos;
  }, [livros, patrimonio, incluirPatrimonio]);

  const codigosFiltrados = useMemo(() => {
    if (!busca.trim()) return todosOsCodigos;
    const termo = busca.toLowerCase();
    return todosOsCodigos.filter(c =>
      c.codigoUnitario.toLowerCase().includes(termo) ||
      c.titulo.toLowerCase().includes(termo) ||
      c.autor.toLowerCase().includes(termo) ||
      c.isbn.toLowerCase().includes(termo) ||
      c.codigoBase.toLowerCase().includes(termo)
    );
  }, [todosOsCodigos, busca]);

  const toggleSelecionado = (codigo) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(codigo)) {
        next.delete(codigo);
      } else {
        next.add(codigo);
      }
      return next;
    });
  };

  const selecionarTodos = () => {
    if (selecionados.size === codigosFiltrados.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(codigosFiltrados.map(c => c.codigoUnitario)));
    }
  };

  const selecionarPorItem = (itemId) => {
    const codigosDoItem = codigosFiltrados.filter(c => c.itemId === itemId);
    const todosJaSelecionados = codigosDoItem.every(c => selecionados.has(c.codigoUnitario));

    setSelecionados(prev => {
      const next = new Set(prev);
      codigosDoItem.forEach(c => {
        if (todosJaSelecionados) {
          next.delete(c.codigoUnitario);
        } else {
          next.add(c.codigoUnitario);
        }
      });
      return next;
    });
  };

  const etiquetasSelecionadas = codigosFiltrados.filter(c => selecionados.has(c.codigoUnitario));

  const dimensoes = {
    pequena: { w: 50, h: 25, fontSize: 7, titleSize: 6, codeSize: 9 },
    media: { w: 70, h: 35, fontSize: 8, titleSize: 7, codeSize: 11 },
    grande: { w: 90, h: 45, fontSize: 9, titleSize: 8, codeSize: 13 }
  };

  const handleImprimirEtiquetas = () => {
    const items = etiquetasSelecionadas.length > 0 ? etiquetasSelecionadas : codigosFiltrados;
    if (items.length === 0) {
      alert('Nenhuma etiqueta para imprimir.');
      return;
    }

    const dim = dimensoes[tamanhoEtiqueta];
    const colsPerRow = Math.floor(210 / (dim.w + 4)); // A4 width ~210mm

    const win = window.open('', '_blank');
    if (!win) {
      alert('Popup bloqueado. Permita popups para imprimir etiquetas.');
      return;
    }

    const etiquetasHtml = items.map(item => `
      <div class="etiqueta">
        <div class="titulo">${item.titulo.length > 30 ? item.titulo.substring(0, 28) + '...' : item.titulo}</div>
        ${item.autor ? `<div class="autor">${item.autor.length > 25 ? item.autor.substring(0, 23) + '...' : item.autor}</div>` : ''}
        <div class="codigo">${item.codigoUnitario}</div>
        <div class="tipo">${item.tipoItem}${item.isbn ? ` | ${item.isbn}` : ''}</div>
      </div>
    `).join('');

    win.document.write(`<!DOCTYPE html>
<html><head><title>Etiquetas - CEI Biblioteca</title>
<style>
  @page { margin: 5mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; }
  .container {
    display: flex; flex-wrap: wrap; gap: 2mm;
    justify-content: flex-start;
  }
  .etiqueta {
    width: ${dim.w}mm; height: ${dim.h}mm;
    border: 0.5px solid #999; border-radius: 2px;
    padding: 1.5mm 2mm;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    text-align: center; overflow: hidden;
    page-break-inside: avoid;
  }
  .titulo {
    font-size: ${dim.titleSize}pt; font-weight: bold;
    line-height: 1.1; max-height: ${dim.h * 0.3}mm;
    overflow: hidden;
  }
  .autor {
    font-size: ${dim.fontSize - 1}pt; color: #555;
    line-height: 1; margin-top: 0.5mm;
  }
  .codigo {
    font-size: ${dim.codeSize}pt; font-weight: bold;
    font-family: 'Courier New', monospace;
    margin-top: 1mm; letter-spacing: 0.5px;
    border: 1px solid #333; padding: 0.5mm 2mm;
    border-radius: 2px; background: #f9f9f9;
  }
  .tipo {
    font-size: ${dim.fontSize - 2}pt; color: #777;
    margin-top: 0.5mm;
  }
  @media print {
    .etiqueta { border-color: #ccc; }
  }
</style>
</head><body>
<div class="container">${etiquetasHtml}</div>
</body></html>`);

    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  // Group by item for display
  const itensPorId = useMemo(() => {
    const map = new Map();
    codigosFiltrados.forEach(c => {
      if (!map.has(c.itemId)) {
        map.set(c.itemId, {
          titulo: c.titulo,
          codigoBase: c.codigoBase,
          autor: c.autor,
          tipoItem: c.tipoItem,
          isbn: c.isbn,
          codigos: []
        });
      }
      map.get(c.itemId).codigos.push(c);
    });
    return Array.from(map.values());
  }, [codigosFiltrados]);

  const totalLivros = livros.filter(l => !l.baixa).length;
  const totalExemplares = livros.filter(l => !l.baixa).reduce((sum, l) => sum + (Number(l.quantidade) || 1), 0);
  const totalPatrimonio = patrimonio.length;

  return (
    <Layout title="Etiquetas e Códigos Unitários">
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="caption" color="text.secondary">Títulos</Typography>
              <Typography variant="h5" fontWeight={700}>{totalLivros}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="caption" color="text.secondary">Exemplares</Typography>
              <Typography variant="h5" fontWeight={700}>{totalExemplares}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="caption" color="text.secondary">Etiquetas Geradas</Typography>
              <Typography variant="h5" fontWeight={700}>{todosOsCodigos.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Selecionadas</Typography>
              <Typography variant="h5" fontWeight={700}>{selecionados.size}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 2 }}>
        Cada exemplar recebe um código unitário único (ex: <strong>LIV000001-01</strong>, <strong>LIV000001-02</strong>).
        Selecione as etiquetas e clique em "Imprimir Etiquetas" para gerar folha pronta para impressão.
      </Alert>

      {/* Controles */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por título, autor, ISBN ou código..."
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControlLabel
          control={<Switch checked={incluirPatrimonio} onChange={(e) => setIncluirPatrimonio(e.target.checked)} size="small" />}
          label="Incluir Patrimônio"
        />
        <TextField
          select
          size="small"
          label="Tamanho"
          value={tamanhoEtiqueta}
          onChange={(e) => setTamanhoEtiqueta(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 120 }}
        >
          <option value="pequena">Pequena (50×25mm)</option>
          <option value="media">Média (70×35mm)</option>
          <option value="grande">Grande (90×45mm)</option>
        </TextField>
        <Button variant="outlined" startIcon={<SelectAll />} onClick={selecionarTodos} size="small">
          {selecionados.size === codigosFiltrados.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </Button>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handleImprimirEtiquetas}
          disabled={codigosFiltrados.length === 0}
        >
          Imprimir Etiquetas {selecionados.size > 0 ? `(${selecionados.size})` : `(${codigosFiltrados.length})`}
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Tabela agrupada por item */}
      {itensPorId.map((item, idx) => (
        <Paper key={idx} sx={{ mb: 2, overflow: 'hidden' }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2,
            p: 1.5, bgcolor: 'grey.100', cursor: 'pointer'
          }}
            onClick={() => selecionarPorItem(item.codigos[0]?.itemId)}
          >
            <Checkbox
              checked={item.codigos.every(c => selecionados.has(c.codigoUnitario))}
              indeterminate={item.codigos.some(c => selecionados.has(c.codigoUnitario)) && !item.codigos.every(c => selecionados.has(c.codigoUnitario))}
              size="small"
            />
            <Label fontSize="small" color="action" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {item.titulo}
                {item.autor && <Typography component="span" variant="body2" color="text.secondary"> — {item.autor}</Typography>}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Código: {item.codigoBase} | Tipo: {item.tipoItem}
                {item.isbn && ` | ISBN: ${item.isbn}`}
                {' | '}{item.codigos.length} exemplar(es)
              </Typography>
            </Box>
            <Chip label={`${item.codigos.length} etiqueta(s)`} size="small" color="primary" variant="outlined" />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Código Unitário</TableCell>
                  <TableCell>Exemplar</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Localização</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item.codigos.map((c) => (
                  <TableRow
                    key={c.codigoUnitario}
                    hover
                    selected={selecionados.has(c.codigoUnitario)}
                    onClick={() => toggleSelecionado(c.codigoUnitario)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={selecionados.has(c.codigoUnitario)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.codigoUnitario}
                        size="small"
                        color="primary"
                        variant={selecionados.has(c.codigoUnitario) ? 'filled' : 'outlined'}
                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{c.exemplar} de {c.totalExemplares}</TableCell>
                    <TableCell>{c.tipoItem}</TableCell>
                    <TableCell>{c.categoria || '-'}</TableCell>
                    <TableCell>{c.localizacao || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      {codigosFiltrados.length === 0 && (
        <Alert severity="warning">
          Nenhum item encontrado. Cadastre livros ou patrimônio para gerar etiquetas.
        </Alert>
      )}
    </Layout>
  );
}
