import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { Search, MenuBook, Inventory } from '@mui/icons-material';
import { useData } from '../context/DataContext';

function BuscaPage() {
  const { livros, patrimonio } = useData();
  const [busca, setBusca] = useState('');
  const [tabAtiva, setTabAtiva] = useState(0);

  const livrosFiltrados = livros.filter(livro =>
    livro.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    livro.autor.toLowerCase().includes(busca.toLowerCase()) ||
    livro.isbn.includes(busca) ||
    livro.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const patrimonioFiltrado = patrimonio.filter(bem =>
    bem.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    bem.numeroPatrimonio.includes(busca) ||
    bem.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout title="Busca Geral">
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar em toda a biblioteca..."
          variant="outlined"
          fullWidth
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ mb: 2 }}
        />

        <Tabs value={tabAtiva} onChange={(e, newValue) => setTabAtiva(newValue)}>
          <Tab label={`Livros (${livrosFiltrados.length})`} />
          <Tab label={`Patrimônio (${patrimonioFiltrado.length})`} />
        </Tabs>
      </Box>

      {tabAtiva === 0 && (
        <Grid container spacing={2}>
          {livrosFiltrados.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center">
                {busca ? 'Nenhum livro encontrado' : 'Digite algo para buscar'}
              </Typography>
            </Grid>
          ) : (
            livrosFiltrados.map((livro) => (
              <Grid item xs={12} md={6} key={livro.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <MenuBook sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {livro.titulo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {livro.autor}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip label={livro.categoria} size="small" color="primary" />
                          <Chip 
                            label={`${livro.quantidade} disponível(is)`} 
                            size="small" 
                            color={livro.quantidade > 0 ? 'success' : 'error'}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>ISBN:</strong> {livro.isbn || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Editora:</strong> {livro.editora || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Ano:</strong> {livro.anoPublicacao || 'N/A'}
                    </Typography>
                    {livro.localizacao && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Localização:</strong> {livro.localizacao}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {tabAtiva === 1 && (
        <Grid container spacing={2}>
          {patrimonioFiltrado.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center">
                {busca ? 'Nenhum bem encontrado' : 'Digite algo para buscar'}
              </Typography>
            </Grid>
          ) : (
            patrimonioFiltrado.map((bem) => (
              <Grid item xs={12} md={6} key={bem.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Inventory sx={{ mr: 2, color: 'success.main', fontSize: 40 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {bem.descricao}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Patrimônio: {bem.numeroPatrimonio}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip label={bem.categoria} size="small" color="primary" />
                          <Chip 
                            label={bem.estado} 
                            size="small" 
                            color={bem.estado === 'Bom' || bem.estado === 'Novo' ? 'success' : 'warning'}
                          />
                        </Box>
                      </Box>
                    </Box>
                    {bem.marca && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Marca:</strong> {bem.marca}
                      </Typography>
                    )}
                    {bem.modelo && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Modelo:</strong> {bem.modelo}
                      </Typography>
                    )}
                    {bem.localizacao && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Localização:</strong> {bem.localizacao}
                      </Typography>
                    )}
                    {bem.valorAquisicao && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Valor:</strong> R$ {bem.valorAquisicao}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Layout>
  );
}

export default BuscaPage;
