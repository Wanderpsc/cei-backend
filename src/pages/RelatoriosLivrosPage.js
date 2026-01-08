import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import {
  MenuBook,
  LibraryBooks,
  Warning,
  CheckCircle,
  Print
} from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RelatoriosLivrosPage() {
  const { livros } = useData();
  const [tabAtiva, setTabAtiva] = useState(0);

  const anoAtual = new Date().getFullYear();

  // Filtrar livros por tipo
  const livrosDidaticos = livros.filter(l => l.tipo === 'Didático' && !l.baixa);
  const livrosParadidaticos = livros.filter(l => l.tipo === 'Paradidático' && !l.baixa);
  const livrosComBaixa = livros.filter(l => l.baixa);

  // Livros didáticos vencidos ou próximos do vencimento
  const livrosVencidos = livrosDidaticos.filter(l => 
    l.anoVigencia && parseInt(l.anoVigencia) < anoAtual
  );
  const livrosVencendoEsteAno = livrosDidaticos.filter(l => 
    l.anoVigencia && parseInt(l.anoVigencia) === anoAtual
  );

  // Estatísticas
  const totalLivros = livros.length;
  const totalDidaticos = livrosDidaticos.length;
  const totalParadidaticos = livrosParadidaticos.length;
  const totalBaixas = livrosComBaixa.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout title="Relatórios de Livros">
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<Print />} onClick={handlePrint} variant="outlined">
          Imprimir Relatório
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total de Livros
                  </Typography>
                  <Typography variant="h4">{totalLivros}</Typography>
                </Box>
                <MenuBook sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Didáticos
                  </Typography>
                  <Typography variant="h4">{totalDidaticos}</Typography>
                </Box>
                <LibraryBooks sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Paradidáticos
                  </Typography>
                  <Typography variant="h4">{totalParadidaticos}</Typography>
                </Box>
                <MenuBook sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Baixas
                  </Typography>
                  <Typography variant="h4">{totalBaixas}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas de Vigência */}
      {livrosVencidos.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>{livrosVencidos.length} livro(s) didático(s) com vigência vencida!</strong>
        </Alert>
      )}

      {livrosVencendoEsteAno.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{livrosVencendoEsteAno.length} livro(s) didático(s) vencem este ano ({anoAtual})!</strong>
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabAtiva} onChange={(e, newValue) => setTabAtiva(newValue)}>
          <Tab label={`Didáticos (${totalDidaticos})`} />
          <Tab label={`Paradidáticos (${totalParadidaticos})`} />
          <Tab label="Vigência" />
          <Tab label={`Baixas (${totalBaixas})`} />
        </Tabs>

        {/* Tab: Livros Didáticos */}
        <TabPanel value={tabAtiva} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>ISBN</TableCell>
                  <TableCell>Editora</TableCell>
                  <TableCell>Ano Publicação</TableCell>
                  <TableCell>Ano Vigência</TableCell>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {livrosDidaticos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">
                        Nenhum livro didático cadastrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  livrosDidaticos.map((livro) => {
                    const vencido = livro.anoVigencia && parseInt(livro.anoVigencia) < anoAtual;
                    const vencendoEsteAno = livro.anoVigencia && parseInt(livro.anoVigencia) === anoAtual;
                    
                    return (
                      <TableRow key={livro.id}>
                        <TableCell>{livro.titulo}</TableCell>
                        <TableCell>{livro.autor}</TableCell>
                        <TableCell>{livro.isbn}</TableCell>
                        <TableCell>{livro.editora}</TableCell>
                        <TableCell>{livro.anoPublicacao}</TableCell>
                        <TableCell>
                          {livro.anoVigencia || 'Não definido'}
                        </TableCell>
                        <TableCell>{livro.quantidade}</TableCell>
                        <TableCell>
                          {vencido ? (
                            <Chip label="Vencido" size="small" color="error" icon={<Warning />} />
                          ) : vencendoEsteAno ? (
                            <Chip label="Vence este ano" size="small" color="warning" icon={<Warning />} />
                          ) : (
                            <Chip label="Vigente" size="small" color="success" icon={<CheckCircle />} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Livros Paradidáticos */}
        <TabPanel value={tabAtiva} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>ISBN</TableCell>
                  <TableCell>Editora</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Localização</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {livrosParadidaticos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        Nenhum livro paradidático cadastrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  livrosParadidaticos.map((livro) => (
                    <TableRow key={livro.id}>
                      <TableCell>{livro.titulo}</TableCell>
                      <TableCell>{livro.autor}</TableCell>
                      <TableCell>{livro.isbn}</TableCell>
                      <TableCell>{livro.editora}</TableCell>
                      <TableCell>
                        <Chip label={livro.categoria} size="small" />
                      </TableCell>
                      <TableCell>{livro.quantidade}</TableCell>
                      <TableCell>{livro.localizacao}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Controle de Vigência */}
        <TabPanel value={tabAtiva} index={2}>
          {livrosVencidos.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="error" gutterBottom>
                ❌ Livros com Vigência Vencida
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Autor</TableCell>
                      <TableCell>Ano Vigência</TableCell>
                      <TableCell>Quantidade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {livrosVencidos.map((livro) => (
                      <TableRow key={livro.id} sx={{ bgcolor: '#ffebee' }}>
                        <TableCell>{livro.titulo}</TableCell>
                        <TableCell>{livro.autor}</TableCell>
                        <TableCell>{livro.anoVigencia}</TableCell>
                        <TableCell>{livro.quantidade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {livrosVencendoEsteAno.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                ⚠️ Livros Vencendo em {anoAtual}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Autor</TableCell>
                      <TableCell>Ano Vigência</TableCell>
                      <TableCell>Quantidade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {livrosVencendoEsteAno.map((livro) => (
                      <TableRow key={livro.id} sx={{ bgcolor: '#fff3e0' }}>
                        <TableCell>{livro.titulo}</TableCell>
                        <TableCell>{livro.autor}</TableCell>
                        <TableCell>{livro.anoVigencia}</TableCell>
                        <TableCell>{livro.quantidade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {livrosVencidos.length === 0 && livrosVencendoEsteAno.length === 0 && (
            <Alert severity="success">
              ✅ Todos os livros didáticos estão com vigência válida!
            </Alert>
          )}
        </TabPanel>

        {/* Tab: Baixas */}
        <TabPanel value={tabAtiva} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Motivo Baixa</TableCell>
                  <TableCell>Data Baixa</TableCell>
                  <TableCell>Donatário</TableCell>
                  <TableCell>Observações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {livrosComBaixa.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        Nenhuma baixa registrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  livrosComBaixa.map((livro) => (
                    <TableRow key={livro.id}>
                      <TableCell>{livro.titulo}</TableCell>
                      <TableCell>{livro.autor}</TableCell>
                      <TableCell>
                        <Chip label={livro.tipo || 'Paradidático'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={livro.baixa.motivo} 
                          size="small" 
                          color={livro.baixa.motivo === 'Doação' ? 'primary' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(livro.baixa.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{livro.baixa.donatario || '-'}</TableCell>
                      <TableCell>{livro.baixa.observacoes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Layout>
  );
}
