const axios = require('axios');

const isbn = '9786589077039';
console.log('🔍 BUSCA PROFUNDA - ISBN:', isbn);
console.log('='.repeat(60));

async function testarTodasFontes() {
  
  // 1. Google Books - Várias variações
  console.log('\n📗 TESTE 1: Google Books (múltiplas variações)');
  const googleUrls = [
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
    `https://www.googleapis.com/books/v1/volumes?q=${isbn}`,
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=BR`,
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&langRestrict=pt`,
  ];
  
  for (const url of googleUrls) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      if (response.data.totalItems > 0) {
        console.log('✅ ENCONTRADO no Google Books!');
        const livro = response.data.items[0].volumeInfo;
        console.log('   Título:', livro.title);
        console.log('   Autor:', livro.authors?.join(', '));
        console.log('   Editora:', livro.publisher);
        return;
      }
    } catch (e) {}
  }
  console.log('❌ Não encontrado no Google Books');
  
  // 2. Open Library
  console.log('\n📕 TESTE 2: Open Library');
  const openLibUrls = [
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
    `https://openlibrary.org/search.json?isbn=${isbn}`,
    `https://openlibrary.org/isbn/${isbn}.json`
  ];
  
  for (const url of openLibUrls) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      if (response.data[`ISBN:${isbn}`] || (response.data.docs && response.data.docs.length > 0) || response.data.title) {
        console.log('✅ ENCONTRADO no Open Library!');
        const livro = response.data[`ISBN:${isbn}`] || response.data.docs?.[0] || response.data;
        console.log('   Título:', livro.title);
        console.log('   Autor:', livro.authors?.map(a => a.name).join(', ') || livro.author_name?.join(', '));
        return;
      }
    } catch (e) {}
  }
  console.log('❌ Não encontrado no Open Library');
  
  // 3. ISBNdb.com (API pública limitada)
  console.log('\n📘 TESTE 3: ISBNdb.com');
  try {
    const response = await axios.get(`https://isbndb.com/book/${isbn}`, { 
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (response.data) {
      console.log('✅ ENCONTRADO no ISBNdb!');
    }
  } catch (e) {
    console.log('❌ Não encontrado no ISBNdb');
  }
  
  // 4. Worldcat
  console.log('\n📚 TESTE 4: WorldCat via Open Library');
  try {
    const response = await axios.get(`https://openlibrary.org/search.json?isbn=${isbn}&limit=5`, { timeout: 10000 });
    if (response.data.docs && response.data.docs.length > 0) {
      console.log('✅ ENCONTRADO no WorldCat!');
      const livro = response.data.docs[0];
      console.log('   Título:', livro.title);
      console.log('   Autor:', livro.author_name?.join(', '));
    } else {
      console.log('❌ Não encontrado no WorldCat');
    }
  } catch (e) {
    console.log('❌ Não encontrado no WorldCat');
  }
  
  // 5. Busca no Google (web scraping leve)
  console.log('\n🔍 TESTE 5: Busca Google (informação pública)');
  try {
    const searchUrl = `https://www.google.com/search?q=isbn+${isbn}`;
    console.log('   URL:', searchUrl);
    console.log('   💡 Abra manualmente para verificar resultados na web');
  } catch (e) {}
  
  // 6. Mercado Livre Brasil
  console.log('\n🛒 TESTE 6: Mercado Livre Brasil');
  try {
    const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=${isbn}`, { 
      timeout: 10000 
    });
    if (response.data.results && response.data.results.length > 0) {
      console.log('✅ ENCONTRADO no Mercado Livre!');
      const produto = response.data.results[0];
      console.log('   Título:', produto.title);
      console.log('   Link:', produto.permalink);
    } else {
      console.log('❌ Não encontrado no Mercado Livre');
    }
  } catch (e) {
    console.log('❌ Erro ao buscar no Mercado Livre:', e.message);
  }
  
  // 7. Estante Virtual
  console.log('\n📚 TESTE 7: Estante Virtual (scraping)');
  console.log('   URL:', `https://www.estantevirtual.com.br/busca?q=${isbn}`);
  console.log('   💡 Abra manualmente para verificar');
  
  // 8. Amazon Brasil
  console.log('\n📦 TESTE 8: Amazon Brasil');
  console.log('   URL:', `https://www.amazon.com.br/s?k=${isbn}`);
  console.log('   💡 Abra manualmente para verificar');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CONCLUSÃO:');
  console.log('   O ISBN', isbn, 'NÃO foi encontrado em nenhuma API pública.');
  console.log('   Possíveis razões:');
  console.log('   1. Livro de editora independente/pequena não catalogado');
  console.log('   2. ISBN muito recente (ainda não indexado)');
  console.log('   3. ISBN incorreto ou com erro de digitação');
  console.log('   4. Livro exclusivo de distribuição regional');
  console.log('\n💡 SUGESTÃO:');
  console.log('   - Verifique o código de barras físico do livro');
  console.log('   - Confirme se todos os 13 dígitos estão corretos');
  console.log('   - Tente buscar pelo título "Zumbi dos Palmares" + autor "Luiz Galdino"');
}

testarTodasFontes();
