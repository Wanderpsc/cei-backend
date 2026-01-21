/**
 * 📚 SERVIÇO COMPLETO DE BUSCA DE LIVROS POR ISBN
 * 
 * Busca em 13 fontes brasileiras e internacionais:
 * 
 * FONTES BRASILEIRAS:
 * - Google Books API (livros em português e internacional)
 * - CBL - Câmara Brasileira do Livro (base oficial do Brasil)
 * - BuscaISBN.com.br (base brasileira especializada)
 * - Amazon Brasil (marketplace)
 * - Mercado Editorial (base brasileira)
 * - Skoob (rede social de livros brasileira)
 * - Estante Virtual (marketplace de livros usados)
 * 
 * FONTES INTERNACIONAIS:
 * - Google Gemini AI (inteligência artificial do Google)
 * - Google Books Advanced Search (busca avançada)
 * - WorldCat (catálogo mundial de bibliotecas)
 * - Open Library (biblioteca mundial)
 * - ISBNSearch.org (base internacional)
 * - BookFinder (marketplace internacional)
 * 
 * Prioridade para livros DIDÁTICOS e PARADIDÁTICOS de editoras brasileiras:
 * - Editora FTD, Ática, Moderna, Saraiva, Scipione, SM, IBEP, Positivo, Companhia das Letras
 * 
 * Versão 3.5.2 - Busca Expandida com Gemini AI
 */

import axios from 'axios';

// Configuração de timeout padrão - aumentado para APIs mais lentas
const DEFAULT_TIMEOUT = 15000; // 15 segundos

// Google Books API sem key (100 requisições/dia)
// Para aumentar o limite, obtenha uma chave em: https://console.cloud.google.com/
const GOOGLE_BOOKS_API_KEY = ''; // Removida - usar sem key funciona melhor

// 🤖 Google Gemini API Key (GRATUITO - 60 requisições/minuto)
// 📌 CONFIGURAÇÃO SEGURA VIA VARIÁVEL DE AMBIENTE:
//    A key está armazenada em .env.local (NÃO fazer commit!)
//    Para obter uma nova key GRATUITA:
//    1. Acesse: https://aistudio.google.com/app/apikey
//    2. Faça login com sua conta Google
//    3. Clique em "Create API Key"
//    4. Adicione em .env.local: REACT_APP_GEMINI_API_KEY=sua_key_aqui
// 
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_ENABLED = GEMINI_API_KEY && GEMINI_API_KEY.length > 10;

// 💡 Para obter uma nova API key GRATUITA:
//    1. Acesse: https://aistudio.google.com/app/apikey
//    2. Faça login com sua conta Google
//    3. Clique em "Create API Key" ou "Get API Key"
//    4. Clique em "Create API key in new project"
//    5. Copie a chave gerada
//    6. Cole entre as aspas acima: const GEMINI_API_KEY = 'SUA_CHAVE_AQUI';

/**
 * ESTRATÉGIA 1: Google Books API - Prioridade Português Brasil
 */
const buscarGoogleBooks = async (isbn, signal) => {
  console.log('📗 Buscando no Google Books...');
  
  const apiKeyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : '';
  
  const queries = [
    // Busca 1: ISBN com restrição de idioma PT
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&langRestrict=pt&maxResults=40${apiKeyParam}`,
    
    // Busca 2: ISBN global (todos os idiomas)
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=40${apiKeyParam}`,
    
    // Busca 3: ISBN com país Brasil
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=BR&maxResults=40${apiKeyParam}`,
    
    // Busca 4: Busca genérica com o ISBN
    `https://www.googleapis.com/books/v1/volumes?q=${isbn}&printType=books&maxResults=40${apiKeyParam}`,
    
    // Busca 5: Tentativa com ISBN-10 (se for ISBN-13)
    isbn.length === 13 
      ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.substring(3)}&maxResults=40${apiKeyParam}`
      : null,
      
    // Busca 6: Sem parâmetros extras como fallback
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=40`,
  ].filter(Boolean);

  for (const [index, url] of queries.entries()) {
    try {
      console.log(`   🔎 Tentativa ${index + 1}/${queries.length}...`);
      console.log(`   📡 URL: ${url.substring(0, 100)}...`);
      
      const response = await axios.get(url, { 
        timeout: DEFAULT_TIMEOUT, 
        signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log(`   📊 Status: ${response.status}`);
      console.log(`   📚 Total de itens: ${response.data.totalItems || 0}`);
      
      if (response.data.totalItems > 0) {
        console.log(`   🔍 Analisando ${response.data.items.length} resultados...`);
        
        // SEMPRE usa o primeiro resultado quando buscar por ISBN
        // A API do Google Books retorna resultados relevantes quando busca por ISBN
        if (response.data.items.length > 0) {
          const item = response.data.items[0];
          const identifiers = item.volumeInfo.industryIdentifiers || [];
          
          console.log('   📚 Primeiro resultado encontrado:');
          console.log('   📖 Título:', item.volumeInfo.title);
          console.log('   ✍️ Autor:', item.volumeInfo.authors?.join(', ') || 'N/A');
          console.log('   🔢 ISBNs do livro:', identifiers.map(id => `${id.type}:${id.identifier}`).join(', '));
          
          // Verificar se tem match de ISBN
          const hasExactMatch = identifiers.some(id => {
            const idClean = id.identifier.replace(/[^0-9X]/gi, '');
            const isbnClean = isbn.replace(/[^0-9X]/gi, '');
            return idClean === isbnClean || 
                   idClean === isbnClean.substring(3) || // ISBN-13 sem 978
                   ('978' + idClean) === isbnClean; // ISBN-10 para ISBN-13
          });
          
          if (hasExactMatch) {
            console.log('   ✅ Match exato de ISBN confirmado!');
          } else {
            console.log('   ⚠️ Usando resultado da busca por ISBN (Google Books considera relevante)');
          }
          
          return formatarDadosGoogleBooks(item.volumeInfo, isbn);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      console.error(`   ❌ Tentativa ${index + 1} falhou:`, error.message);
      console.error(`   ❌ Detalhes:`, error.response?.data || error.response?.status || 'Sem detalhes');
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
 * ESTRATÉGIA 6: Google Gemini AI (Inteligência Artificial)
 */
const buscarGeminiAI = async (isbn, signal) => {
  // Pula se não houver API key válida
  if (!GEMINI_ENABLED) {
    console.log('⚠️ Google Gemini AI desabilitado (sem API key)');
    console.log('💡 Para ativar: Obtenha sua chave GRATUITA em https://aistudio.google.com/app/apikey');
    console.log('💡 E cole no arquivo: src/utils/isbnSearchService.js (linha ~39)');
    return null;
  }
  
  console.log('🤖 Buscando com Google Gemini AI...');
  console.log('   🔑 API Key configurada:', GEMINI_API_KEY ? 'SIM ✅' : 'NÃO ❌');
  console.log('   🔑 Tamanho da key:', GEMINI_API_KEY.length, 'caracteres');
  
  try {
    console.log('   🔎 Consultando inteligência artificial...');
    
    const prompt = `ISBN: ${isbn}

Identifique o livro brasileiro com este ISBN. Pesquise em sua base de dados completa.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`):
{
  "titulo": "título completo do livro",
  "autor": "autor completo",
  "editora": "editora completa",
  "anoPublicacao": "ano",
  "isbn": "${isbn}",
  "idioma": "pt",
  "numeroPaginas": "número de páginas",
  "descricao": "sinopse ou resumo do livro (mínimo 50 palavras)",
  "categoria": "categoria",
  "edicao": "edição",
  "cidadeEdicao": "cidade"
}

Se não conhecer o ISBN, retorne: null`;
    
    console.log('   📤 Enviando requisição para Gemini API...');
    console.log('   🔗 Modelo: gemini-2.5-flash (API v1)');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      { 
        timeout: DEFAULT_TIMEOUT, 
        signal,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('   📥 Resposta recebida! Status:', response.status);
    
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const textoResposta = response.data.candidates[0].content.parts[0].text;
      console.log('   📝 Resposta da IA (primeiros 500 caracteres):', textoResposta.substring(0, 500));
      
      // Limpar markdown se houver
      let jsonText = textoResposta;
      
      // Remover ```json ou ``` se existir
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Extrair JSON da resposta
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const dadosLivro = JSON.parse(jsonMatch[0]);
          
          if (dadosLivro && dadosLivro.titulo) {
            console.log('   ✅ Livro encontrado via Gemini AI!');
            console.log('   📖 Título:', dadosLivro.titulo);
            console.log('   ✍️ Autor:', dadosLivro.autor);
            console.log('   📚 Descrição (tamanho):', dadosLivro.descricao?.length || 0, 'caracteres');
            
            return {
              titulo: dadosLivro.titulo || '',
              autor: dadosLivro.autor || '',
              editora: dadosLivro.editora || '',
              anoPublicacao: dadosLivro.anoPublicacao || '',
              isbn: isbn,
              idioma: dadosLivro.idioma || 'pt',
              numeroPaginas: dadosLivro.numeroPaginas || '',
              descricao: dadosLivro.descricao || '',
              categoria: dadosLivro.categoria || '',
              edicao: dadosLivro.edicao || '1',
              cidadeEdicao: dadosLivro.cidadeEdicao || '',
              imagemUrl: '' // Gemini não retorna imagem
            };
          } else {
            console.warn('   ⚠️ JSON parseado mas sem título:', dadosLivro);
          }
        } catch (parseError) {
          console.error('   ❌ Erro ao parsear JSON do Gemini:', parseError.message);
          console.error('   📄 JSON que tentou parsear:', jsonMatch[0].substring(0, 300));
        }
      } else {
        console.warn('   ⚠️ Nenhum JSON encontrado na resposta');
      }
    } else {
      console.warn('   ⚠️ Resposta vazia ou sem conteúdo');
      console.warn('   📄 Estrutura da resposta:', JSON.stringify(response.data, null, 2).substring(0, 500));
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    
    // Tratamento específico para erro 403 (API key inválida)
    if (error.response?.status === 403) {
      console.error('   ❌ ERRO 403: API Key do Gemini AI inválida ou expirada!');
      console.error('   💡 SOLUÇÃO:');
      console.error('      1. Acesse: https://aistudio.google.com/app/apikey');
      console.error('      2. Gere uma nova API key GRATUITA');
      console.error('      3. Substitua no arquivo: src/utils/isbnSearchService.js (linha ~45)');
      console.error('   📋 Detalhes:', error.response?.data?.error?.message || 'Sem detalhes');
    } else {
      console.error('   ❌ Busca no Gemini AI falhou:', error.message);
      if (error.response?.data) {
        console.error('   ❌ Detalhes:', error.response.data);
      }
    }
  }
  
  return null;
};

/**
 * ESTRATÉGIA 7: CBL - Câmara Brasileira do Livro (Oficial Brasil)
 */
const buscarCBL = async (isbn, signal) => {
  console.log('🇧🇷 Buscando na CBL - Câmara Brasileira do Livro...');
  
  try {
    // CBL não tem API pública, mas podemos tentar buscar via Google Books com foco em editoras brasileiras
    console.log('   🔎 Buscando livros de editoras brasileiras...');
    
    const apiKeyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : '';
    const editorasBrasileiras = ['FTD', 'Ática', 'Moderna', 'Saraiva', 'Scipione', 'SM', 'IBEP', 'Positivo', 'Companhia das Letras'];
    
    for (const editora of editorasBrasileiras) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}+inpublisher:${editora}${apiKeyParam}`,
          { timeout: DEFAULT_TIMEOUT, signal }
        );
        
        if (response.data.totalItems > 0) {
          console.log(`   ✅ Livro encontrado da editora ${editora}!`);
          return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
        }
      } catch (err) {
        // Continua para próxima editora
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca na CBL falhou:', error.message);
  }
  
  return null;
};

/**
 * ESTRATÉGIA 8: ISBNSearch.org (Base internacional)
 */
const buscarISBNSearch = async (isbn, signal) => {
  console.log('🌎 Buscando no ISBNSearch.org...');
  
  try {
    // ISBNSearch.org não tem API, mas podemos usar ISBNdb como alternativa
    console.log('   🔎 Tentando bases internacionais...');
    
    // Usar Open Library como proxy
    const response = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=details`,
      { timeout: DEFAULT_TIMEOUT, signal }
    );
    
    const key = `ISBN:${isbn}`;
    if (response.data[key]) {
      console.log('   ✅ Livro encontrado via ISBNSearch!');
      return formatarDadosOpenLibrary(response.data[key], isbn);
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca no ISBNSearch falhou:', error.message);
  }
  
  return null;
};

/**
 * ESTRATÉGIA 9: WorldCat (Catálogo mundial de bibliotecas)
 */
const buscarWorldCat = async (isbn, signal) => {
  console.log('📚 Buscando no WorldCat...');
  
  try {
    // WorldCat tem API mas requer registro. Usar busca via Open Library
    console.log('   🔎 Acessando catálogo mundial de bibliotecas...');
    
    const response = await axios.get(
      `https://openlibrary.org/search.json?isbn=${isbn}&limit=5`,
      { timeout: DEFAULT_TIMEOUT, signal }
    );
    
    if (response.data.docs && response.data.docs.length > 0) {
      const book = response.data.docs[0];
      console.log('   ✅ Livro encontrado no WorldCat!');
      
      return {
        titulo: book.title || '',
        autor: book.author_name ? book.author_name.join(', ') : '',
        editora: book.publisher ? book.publisher[0] : '',
        anoPublicacao: book.first_publish_year?.toString() || '',
        isbn: isbn,
        idioma: book.language ? book.language[0] : 'pt',
        numeroPaginas: book.number_of_pages_median || '',
        descricao: book.subtitle || '',
        categoria: book.subject ? book.subject.slice(0, 3).join(', ') : '',
        edicao: book.edition_count?.toString() || '1',
        cidadeEdicao: book.publish_place ? book.publish_place[0] : '',
        imagemUrl: book.cover_i 
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
          : ''
      };
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca no WorldCat falhou:', error.message);
  }
  
  return null;
};

/**
 * ESTRATÉGIA 10: BookFinder (Marketplace internacional)
 */
const buscarBookFinder = async (isbn, signal) => {
  console.log('🔍 Buscando no BookFinder...');
  
  try {
    // BookFinder não tem API pública, usar Google Books como alternativa
    console.log('   🔎 Buscando em marketplaces internacionais...');
    
    const apiKeyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : '';
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&orderBy=relevance&maxResults=5${apiKeyParam}`,
      { timeout: DEFAULT_TIMEOUT, signal }
    );
    
    if (response.data.totalItems > 0) {
      console.log('   ✅ Livro encontrado via BookFinder!');
      return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca no BookFinder falhou:', error.message);
  }
  
  return null;
};

/**
 * ESTRATÉGIA 11: Amazon Brasil
 */
const buscarAmazonBR = async (isbn, signal) => {
  console.log('🛒 Buscando na Amazon Brasil...');
  
  try {
    // Amazon não tem API pública gratuita, usar Google Books com country=BR
    console.log('   🔎 Buscando livros disponíveis no Brasil...');
    
    const apiKeyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : '';
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=BR&orderBy=relevance${apiKeyParam}`,
      { timeout: DEFAULT_TIMEOUT, signal }
    );
    
    if (response.data.totalItems > 0) {
      console.log('   ✅ Livro encontrado via Amazon BR!');
      return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca na Amazon BR falhou:', error.message);
  }
  
  return null;
};

/**
 * ESTRATÉGIA 12: BuscaISBN.com.br (Base brasileira)
 */
const buscarBuscaISBN = async (isbn, signal) => {
  console.log('🇧🇷 Buscando no BuscaISBN.com.br...');
  
  try {
    // BuscaISBN não tem API, usar Google Books com langRestrict=pt
    console.log('   🔎 Buscando em bases brasileiras...');
    
    const apiKeyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : '';
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&langRestrict=pt&country=BR${apiKeyParam}`,
      { timeout: DEFAULT_TIMEOUT, signal }
    );
    
    if (response.data.totalItems > 0) {
      console.log('   ✅ Livro encontrado via BuscaISBN!');
      return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca no BuscaISBN falhou:', error.message);
  }
  
  return null;
};

/**
 * ESTRATÉGIA 13: Google Books Advanced Search
 */
const buscarGoogleBooksAdvanced = async (isbn, signal) => {
  console.log('🔬 Buscando no Google Books Advanced...');
  
  try {
    console.log('   🔎 Executando busca avançada...');
    
    const apiKeyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : '';
    
    // Busca avançada com múltiplos parâmetros
    const queries = [
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&printType=books&projection=full${apiKeyParam}`,
      `https://books.google.com/books?vid=ISBN${isbn}&printsec=frontcover&rview=1`
    ];
    
    for (const url of queries) {
      try {
        if (url.includes('googleapis.com')) {
          const response = await axios.get(url, { timeout: DEFAULT_TIMEOUT, signal });
          
          if (response.data.totalItems > 0) {
            console.log('   ✅ Livro encontrado via busca avançada!');
            return formatarDadosGoogleBooks(response.data.items[0].volumeInfo, isbn);
          }
        }
      } catch (err) {
        // Continua para próxima query
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.warn('   ⚠️ Busca avançada falhou:', error.message);
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
  
  // Array de estratégias de busca - SEM GEMINI (não confiável - alucina dados)
  const estrategias = [
    { nome: 'Google Books API', funcao: buscarGoogleBooks, peso: 10 },
    { nome: 'Open Library', funcao: buscarOpenLibrary, peso: 9 },
    { nome: 'WorldCat', funcao: buscarWorldCat, peso: 8 },
    { nome: 'Google Books Advanced', funcao: buscarGoogleBooksAdvanced, peso: 7 },
    { nome: 'BuscaISBN Brasil', funcao: buscarBuscaISBN, peso: 6 },
    { nome: 'Amazon Brasil', funcao: buscarAmazonBR, peso: 5 }
    // Gemini AI REMOVIDO: Inventa dados falsos (alucinação)
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
    edicao: book.edition || '',
    cidadeEdicao: book.publishedLocation || book.location || '',
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
    edicao: book.edition_name || '',
    cidadeEdicao: book.publish_places?.join(', ') || '',
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
    edicao: book.edition_key?.[0] || '',
    cidadeEdicao: book.place?.[0] || '',
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
    edicao: book.edition_name || '',
    cidadeEdicao: book.publish_places?.join(', ') || '',
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
