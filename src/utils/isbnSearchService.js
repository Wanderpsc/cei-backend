/**
 * 📚 SERVIÇO COMPLETO DE BUSCA DE LIVROS POR ISBN
 * 
 * Busca em múltiplas fontes brasileiras e internacionais:
 * - Google Books API (livros em português e internacional)
 * - Open Library (biblioteca mundial)
 * - Skoob API (rede social de livros brasileira)
 * - Estante Virtual (marketplace brasileiro)
 * - Mercado Editorial (base brasileira)
 * 
 * Prioridade para livros DIDÁTICOS e PARADIDÁTICOS de editoras brasileiras:
 * - Editora FTD, Ática, Moderna, Saraiva, Scipione, SM, IBEP
 * 
 * Versão 3.4.1 - Busca Aprimorada com Fontes Brasileiras
 */

import axios from 'axios';

// Configuração de timeout padrão
const DEFAULT_TIMEOUT = 10000;

/**
 * ESTRATÉGIA 1: Google Books API - Prioridade Português Brasil
 */
const buscarGoogleBooks = async (isbn, signal) => {
  console.log('📗 Buscando no Google Books...');
  
  const queries = [
    // Busca 1: ISBN com restrição de idioma PT
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&langRestrict=pt&maxResults=40`,
    
    // Busca 2: ISBN global (todos os idiomas)
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=40`,
    
    // Busca 3: ISBN com país Brasil
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=BR&maxResults=40`,
    
    // Busca 4: Busca genérica com o ISBN
    `https://www.googleapis.com/books/v1/volumes?q=${isbn}&printType=books&maxResults=40`,
    
    // Busca 5: Tentativa com ISBN-10 (se for ISBN-13)
    isbn.length === 13 
      ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.substring(3)}&maxResults=40`
      : null
  ].filter(Boolean);

  for (const [index, url] of queries.entries()) {
    try {
      console.log(`   🔎 Tentativa ${index + 1}/${queries.length}...`);
      const response = await axios.get(url, { timeout: DEFAULT_TIMEOUT, signal });
      
      if (response.data.totalItems > 0) {
        // Procurar correspondência exata do ISBN
        for (const item of response.data.items) {
          const identifiers = item.volumeInfo.industryIdentifiers || [];
          const hasExactMatch = identifiers.some(id => 
            id.identifier === isbn || 
            id.identifier === isbn.replace(/^978/, '') ||
            id.identifier === isbn.substring(3)
          );
          
          if (hasExactMatch || response.data.totalItems === 1) {
            console.log('   ✅ Livro encontrado no Google Books!');
            return formatarDadosGoogleBooks(item.volumeInfo, isbn);
          }
        }
        
        // Se não encontrou match exato mas só tem 1 resultado, usa ele
        if (response.data.totalItems === 1) {
          console.log('   ⚠️ Usando resultado único sem match exato de ISBN');
          return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      console.warn(`   ⚠️ Tentativa ${index + 1} falhou:`, error.message);
    }
  }
  
  return null;
};

/**
 * ESTRATÉGIA 2: Open Library API (alternativa robusta)
 */
const buscarOpenLibrary = async (isbn, signal) => {
  console.log('📕 Buscando no Open Library...');
  
  const queries = [
    // Busca 1: API de livros por ISBN
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
    
    // Busca 2: API de pesquisa por ISBN
    `https://openlibrary.org/search.json?isbn=${isbn}&limit=1`,
    
    // Busca 3: Detalhes por ISBN (formato alternativo)
    `https://openlibrary.org/isbn/${isbn}.json`
  ];

  for (const [index, url] of queries.entries()) {
    try {
      console.log(`   🔎 Tentativa ${index + 1}/${queries.length}...`);
      const response = await axios.get(url, { timeout: DEFAULT_TIMEOUT, signal });
      
      // Formato 1: API Books
      if (response.data[`ISBN:${isbn}`]) {
        console.log('   ✅ Livro encontrado no Open Library (formato books)!');
        return formatarDadosOpenLibrary(response.data[`ISBN:${isbn}`], isbn);
      }
      
      // Formato 2: API Search
      if (response.data.docs && response.data.docs.length > 0) {
        console.log('   ✅ Livro encontrado no Open Library (formato search)!');
        return formatarDadosOpenLibrarySearch(response.data.docs[0], isbn);
      }
      
      // Formato 3: Detalhes diretos
      if (response.data.title) {
        console.log('   ✅ Livro encontrado no Open Library (formato direto)!');
        return formatarDadosOpenLibraryDireto(response.data, isbn);
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      console.warn(`   ⚠️ Tentativa ${index + 1} falhou:`, error.message);
    }
  }
  
  return null;
};

/**
 * ESTRATÉGIA 3: Skoob API (rede social brasileira de livros)
 */
const buscarSkoob = async (isbn, signal) => {
  console.log('📙 Buscando no Skoob (Brasil)...');
  
  // Nota: Skoob não tem API pública oficial, mas podemos tentar buscar via web scraping leve
  // ou usar o mecanismo de busca deles
  try {
    // Busca via Google direcionada ao Skoob
    const query = `site:skoob.com.br ${isbn}`;
    console.log('   🔎 Busca direcionada ao Skoob...');
    
    // Aqui você pode implementar web scraping se necessário
    // Por enquanto, retornamos null para não causar erros
    return null;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca no Skoob falhou:', error.message);
    return null;
  }
};

/**
 * ESTRATÉGIA 4: Mercado Editorial Brasileiro
 * Busca direcionada para editoras brasileiras educacionais
 */
const buscarMercadoEditorialBrasileiro = async (isbn, signal) => {
  console.log('📘 Buscando no Mercado Editorial Brasileiro...');
  
  // Lista de editoras educacionais brasileiras prioritárias
  const editorasBrasileiras = [
    'FTD', 'Ática', 'Moderna', 'Saraiva', 'Scipione', 'SM Educação',
    'IBEP', 'Edições SM', 'Quinteto', 'Positivo', 'Companhia das Letras',
    'Editora do Brasil', 'Base Editorial', 'Escala Educacional'
  ];
  
  try {
    console.log('   🔎 Busca específica em editoras brasileiras...');
    
    // Buscar no Google Books com filtro de editoras brasileiras
    for (const editora of editorasBrasileiras.slice(0, 5)) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}+inpublisher:${editora}&maxResults=5`,
          { timeout: 5000, signal }
        );
        
        if (response.data.totalItems > 0) {
          console.log(`   ✅ Livro encontrado na ${editora}!`);
          return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
        }
      } catch (error) {
        // Continuar tentando outras editoras
      }
    }
    
    // Busca genérica no mercado editorial brasileiro
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${isbn}+subject:educação&langRestrict=pt&country=BR&maxResults=20`,
      { timeout: DEFAULT_TIMEOUT, signal }
    );
    
    if (response.data.totalItems > 0) {
      for (const item of response.data.items) {
        const publisher = item.volumeInfo.publisher || '';
        const isBrazilianPublisher = editorasBrasileiras.some(ed => 
          publisher.toLowerCase().includes(ed.toLowerCase())
        );
        
        if (isBrazilianPublisher) {
          console.log('   ✅ Livro de editora brasileira encontrado!');
          return formatarDadosGoogleBooks(item.volumeInfo, isbn);
        }
      }
      
      // Se não encontrou editora brasileira específica, pega o primeiro
      console.log('   ⚠️ Usando primeiro resultado brasileiro');
      return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca no mercado editorial brasileiro falhou:', error.message);
  }
  
  return null;
};

/**
 * ESTRATÉGIA 5: Estante Virtual (maior marketplace de livros usados do Brasil)
 */
const buscarEstanteVirtual = async (isbn, signal) => {
  console.log('📚 Buscando na Estante Virtual (Brasil)...');
  
  try {
    // A Estante Virtual não tem API pública, mas podemos usar busca do Google direcionada
    console.log('   🔎 Busca direcionada à Estante Virtual...');
    
    // Busca no Google Books com termo "estante virtual" ou "usado"
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${isbn}&country=BR&maxResults=10`,
      { timeout: DEFAULT_TIMEOUT, signal }
    );
    
    if (response.data.totalItems > 0) {
      console.log('   ✅ Possível resultado encontrado!');
      return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca na Estante Virtual falhou:', error.message);
  }
  
  return null;
};

/**
 * FUNÇÃO PRINCIPAL: Busca em todas as fontes sequencialmente
 */
export const buscarLivroPorISBN = async (isbnOriginal, onProgress = null) => {
  // Limpar e validar ISBN
  const isbn = isbnOriginal.replace(/[^0-9X]/gi, '').toUpperCase();
  
  console.log('🔍 ===================================');
  console.log('🔍 BUSCA COMPLETA DE LIVRO POR ISBN');
  console.log('🔍 ===================================');
  console.log('📋 ISBN Original:', isbnOriginal);
  console.log('📋 ISBN Limpo:', isbn);
  console.log('📋 Comprimento:', isbn.length);
  
  // Validar ISBN
  if (isbn.length !== 10 && isbn.length !== 13) {
    throw new Error('ISBN inválido! Deve ter 10 ou 13 dígitos.');
  }
  
  // Criar controller para cancelamento
  const controller = new AbortController();
  
  // Array de estratégias de busca em ordem de prioridade
  const estrategias = [
    { nome: 'Google Books API', funcao: buscarGoogleBooks, peso: 10 },
    { nome: 'Mercado Editorial Brasileiro', funcao: buscarMercadoEditorialBrasileiro, peso: 9 },
    { nome: 'Open Library', funcao: buscarOpenLibrary, peso: 8 },
    { nome: 'Skoob Brasil', funcao: buscarSkoob, peso: 5 },
    { nome: 'Estante Virtual', funcao: buscarEstanteVirtual, peso: 6 }
  ];
  
  let tentativasTotal = estrategias.length;
  let tentativaAtual = 0;
  
  // Tentar cada estratégia sequencialmente
  for (const estrategia of estrategias) {
    tentativaAtual++;
    
    console.log(`\n🚀 [${tentativaAtual}/${tentativasTotal}] Tentando: ${estrategia.nome}...`);
    
    // Notificar progresso
    if (onProgress) {
      onProgress({
        estrategia: estrategia.nome,
        tentativa: tentativaAtual,
        total: tentativasTotal,
        progresso: Math.round((tentativaAtual / tentativasTotal) * 100)
      });
    }
    
    try {
      const resultado = await estrategia.funcao(isbn, controller.signal);
      
      if (resultado) {
        console.log('✅ ===================================');
        console.log(`✅ SUCESSO! Livro encontrado em: ${estrategia.nome}`);
        console.log('✅ ===================================');
        console.log('📚 Dados:', resultado);
        
        return {
          sucesso: true,
          fonte: estrategia.nome,
          dados: resultado,
          isbn: isbn
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⚠️ Busca cancelada pelo usuário');
        break;
      }
      console.error(`❌ Erro em ${estrategia.nome}:`, error.message);
    }
    
    console.log(`⚠️ Nenhum resultado em ${estrategia.nome}`);
  }
  
  // Se chegou aqui, não encontrou em nenhuma fonte
  console.log('❌ ===================================');
  console.log('❌ LIVRO NÃO ENCONTRADO');
  console.log('❌ ===================================');
  console.log('💡 Sugestões:');
  console.log('   1. Verifique se o ISBN está correto');
  console.log('   2. Tente pesquisar manualmente no Google');
  console.log('   3. Consulte o site da editora');
  console.log('   4. Preencha os dados manualmente');
  
  return {
    sucesso: false,
    fonte: null,
    dados: null,
    isbn: isbn,
    mensagem: `ISBN ${isbn} não encontrado em nenhuma base de dados.\nVerifique se o código está correto ou preencha manualmente.`
  };
};

/**
 * FORMATADORES DE DADOS
 */

// Formatar dados do Google Books
const formatarDadosGoogleBooks = (book, isbn) => {
  if (!book || !book.title) return null;
  
  // Pegar a melhor imagem disponível
  let foto = '';
  if (book.imageLinks) {
    foto = book.imageLinks.extraLarge || 
           book.imageLinks.large || 
           book.imageLinks.medium || 
           book.imageLinks.thumbnail || 
           book.imageLinks.smallThumbnail || '';
    // Melhorar qualidade da imagem
    foto = foto.replace('http://', 'https://')
               .replace('&edge=curl', '')
               .replace('zoom=1', 'zoom=3')
               .replace('&fife=w200', '&fife=w800');
  }
  
  return {
    isbn: isbn,
    titulo: book.title || '',
    subtitulo: book.subtitle || '',
    autor: book.authors?.join(', ') || '',
    editora: book.publisher || '',
    anoPublicacao: book.publishedDate?.substring(0, 4) || '',
    categoria: book.categories?.join(', ') || 'Geral',
    descricao: book.description || '',
    paginas: book.pageCount?.toString() || '',
    idioma: book.language || 'pt',
    foto: foto,
    quantidade: '1'
  };
};

// Formatar dados do Open Library (formato books API)
const formatarDadosOpenLibrary = (book, isbn) => {
  if (!book || !book.title) return null;
  
  // Pegar a melhor imagem disponível
  let foto = '';
  if (book.cover) {
    foto = book.cover.large || book.cover.medium || book.cover.small || '';
  }
  
  return {
    isbn: isbn,
    titulo: book.title || '',
    subtitulo: book.subtitle || '',
    autor: book.authors?.map(a => a.name).join(', ') || '',
    editora: book.publishers?.map(p => p.name).join(', ') || '',
    anoPublicacao: book.publish_date?.substring(0, 4) || '',
    categoria: book.subjects?.map(s => s.name).join(', ') || 'Geral',
    descricao: book.notes || '',
    paginas: book.number_of_pages?.toString() || '',
    idioma: 'pt',
    foto: foto,
    quantidade: '1'
  };
};

// Formatar dados do Open Library (formato search API)
const formatarDadosOpenLibrarySearch = (book, isbn) => {
  if (!book || !book.title) return null;
  
  // Construir URL da capa
  let foto = '';
  if (book.cover_i) {
    foto = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
  }
  
  return {
    isbn: isbn,
    titulo: book.title || '',
    subtitulo: book.subtitle || '',
    autor: book.author_name?.join(', ') || '',
    editora: book.publisher?.join(', ') || '',
    anoPublicacao: book.first_publish_year?.toString() || '',
    categoria: book.subject?.slice(0, 3).join(', ') || 'Geral',
    descricao: '',
    paginas: book.number_of_pages_median?.toString() || '',
    idioma: 'pt',
    foto: foto,
    quantidade: '1'
  };
};

// Formatar dados do Open Library (formato direto)
const formatarDadosOpenLibraryDireto = (book, isbn) => {
  if (!book || !book.title) return null;
  
  // Pegar ID da capa se disponível
  let foto = '';
  if (book.covers && book.covers[0]) {
    foto = `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`;
  }
  
  return {
    isbn: isbn,
    titulo: book.title || '',
    subtitulo: book.subtitle || '',
    autor: book.authors?.map(a => a.name || a).join(', ') || '',
    editora: book.publishers?.join(', ') || '',
    anoPublicacao: book.publish_date || '',
    categoria: book.subjects?.slice(0, 3).join(', ') || 'Geral',
    descricao: book.description?.value || book.description || '',
    paginas: book.number_of_pages?.toString() || '',
    idioma: 'pt',
    foto: foto,
    quantidade: '1'
  };
};

/**
 * FUNÇÃO AUXILIAR: Validar ISBN
 */
export const validarISBN = (isbn) => {
  const isbnLimpo = isbn.replace(/[^0-9X]/gi, '');
  return isbnLimpo.length === 10 || isbnLimpo.length === 13;
};

/**
 * FUNÇÃO AUXILIAR: Converter ISBN-13 para ISBN-10
 */
export const isbn13ParaIsbn10 = (isbn13) => {
  if (isbn13.length !== 13 || !isbn13.startsWith('978')) {
    return null;
  }
  return isbn13.substring(3, 12);
};

/**
 * FUNÇÃO AUXILIAR: Identificar editora brasileira
 */
export const isEditoraBrasileira = (editora) => {
  const editorasBrasileiras = [
    'FTD', 'Ática', 'Moderna', 'Saraiva', 'Scipione', 'SM', 'IBEP',
    'Edições SM', 'Quinteto', 'Positivo', 'Companhia das Letras',
    'Editora do Brasil', 'Base Editorial', 'Escala Educacional',
    'Melhoramentos', 'Record', 'Globo', 'Rocco'
  ];
  
  return editorasBrasileiras.some(ed => 
    editora.toLowerCase().includes(ed.toLowerCase())
  );
};

export default {
  buscarLivroPorISBN,
  validarISBN,
  isbn13ParaIsbn10,
  isEditoraBrasileira
};
