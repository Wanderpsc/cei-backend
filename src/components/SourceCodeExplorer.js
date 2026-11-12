import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';

const ALL_AREAS = 'Todas as áreas';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function downloadBlob(content, fileName, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SourceCodeExplorer({ open, onClose }) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [area, setArea] = useState(ALL_AREAS);
  const [selectedPath, setSelectedPath] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    setCatalog(null);
    setError('');
    setLoading(true);
    const cacheBust = Date.now();
    fetch(`${process.env.PUBLIC_URL || ''}/source-catalog.json?v=${cacheBust}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Catálogo de fontes não encontrado. Execute novamente o build do sistema.');
        return response.json();
      })
      .then((data) => {
        setCatalog(data);
        setSelectedPath(data.files?.[0]?.path || '');
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, [open]);

  const areas = useMemo(
    () => [ALL_AREAS, ...new Set((catalog?.files || []).map((file) => file.area))],
    [catalog]
  );

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    return (catalog?.files || []).filter((file) => {
      const matchesArea = area === ALL_AREAS || file.area === area;
      const matchesQuery = !normalizedQuery ||
        file.path.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        file.content.toLocaleLowerCase('pt-BR').includes(normalizedQuery);
      return matchesArea && matchesQuery;
    });
  }, [area, catalog, query]);

  const selectedFile = filteredFiles.find((file) => file.path === selectedPath) || filteredFiles[0];

  const handleCopy = async () => {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadCatalog = () => {
    if (!catalog) return;
    downloadBlob(JSON.stringify(catalog, null, 2), 'codigo-fonte-cei.json', 'application/json');
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ gap: 1 }}>
          <Tooltip title="Fechar códigos-fonte">
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Fechar">
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Códigos-fonte do Sistema CEI
          </Typography>
          <Tooltip title="Baixar catálogo completo em JSON">
            <span>
              <IconButton color="inherit" onClick={handleDownloadCatalog} disabled={!catalog} aria-label="Baixar catálogo">
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {loading && (
        <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography>Carregando códigos-fonte...</Typography>
          </Stack>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

      {catalog && (
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ width: { xs: '100%', md: 350 }, maxHeight: { xs: '38vh', md: 'none' }, display: 'flex', flexDirection: 'column', borderRight: { md: 1 }, borderBottom: { xs: 1, md: 0 }, borderColor: 'divider' }}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`${catalog.totalFiles} arquivos`} size="small" color="primary" />
                <Chip label={`${catalog.totalLines.toLocaleString('pt-BR')} linhas`} size="small" />
                <Chip label={formatBytes(catalog.totalBytes)} size="small" />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Atualizado em {new Date(catalog.generatedAt).toLocaleString('pt-BR')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Buscar arquivo ou conteúdo"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                sx={{ mb: 1.5 }}
              />
              <TextField select fullWidth size="small" label="Área" value={area} onChange={(event) => setArea(event.target.value)}>
                {areas.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Box>
            <Divider />
            <List dense sx={{ overflow: 'auto', flex: 1, py: 0 }}>
              {filteredFiles.map((file) => (
                <ListItemButton key={file.path} selected={file.path === selectedFile?.path} onClick={() => setSelectedPath(file.path)}>
                  <ListItemText primary={file.path} secondary={`${file.lines} linhas · ${formatBytes(file.size)}`} primaryTypographyProps={{ fontFamily: 'monospace', fontSize: 12, noWrap: true }} />
                </ListItemButton>
              ))}
              {filteredFiles.length === 0 && <Typography color="text.secondary" sx={{ p: 2 }}>Nenhum código encontrado.</Typography>}
            </List>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#101418' }}>
            {selectedFile ? (
              <>
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#182028', color: '#fff' }}>
                  <Typography sx={{ flexGrow: 1, fontFamily: 'monospace', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile.path}
                  </Typography>
                  <Button size="small" color="inherit" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                  <Tooltip title="Baixar este arquivo">
                    <IconButton color="inherit" size="small" onClick={() => downloadBlob(selectedFile.content, selectedFile.path.split('/').pop(), 'text/plain')} aria-label="Baixar arquivo">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box component="pre" sx={{ m: 0, p: 2.5, flex: 1, overflow: 'auto', color: '#d6deeb', fontFamily: 'Consolas, monospace', fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre', tabSize: 2 }}>
                  {selectedFile.content}
                </Box>
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', color: '#fff' }}>Selecione um arquivo.</Box>
            )}
          </Box>
        </Box>
      )}
    </Dialog>
  );
}