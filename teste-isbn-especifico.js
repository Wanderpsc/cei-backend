const axios = require('axios');
const fs = require('fs');

// Ler a API key do .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/REACT_APP_GEMINI_API_KEY=([^\r\n]+)/);
const GEMINI_API_KEY = keyMatch ? keyMatch[1] : '';

const isbn = '9786589077039'; // Deveria ser: Zumbi dos Palmares

console.log('🔍 Testando ISBN:', isbn);
console.log('📖 Livro esperado: Zumbi dos Palmares');
console.log('✍️ Autor esperado: Luiz Galdino');
console.log('🏢 Editora esperada: Editorial 25');
console.log('');

// Teste 1: Gemini AI
console.log('=' .repeat(50));
console.log('TESTE 1: GOOGLE GEMINI AI');
console.log('=' .repeat(50));

const prompt = `Você é um especialista em literatura e biblioteconomia. 

TAREFA: Encontre as informações EXATAS do livro com ISBN ${isbn}.

⚠️ REGRAS CRÍTICAS:
1. APENAS retorne dados se você TEM CERTEZA que o ISBN corresponde EXATAMENTE ao livro
2. Se você NÃO CONHECER esse ISBN específico, retorne: null
3. NÃO INVENTE dados ou faça suposições
4. NÃO retorne informações de livros similares ou de outros ISBNs
5. Verifique em suas bases de dados que o ISBN ${isbn} corresponde ao livro que você vai retornar

Se você CONHECER esse ISBN ${isbn} com CERTEZA, retorne um JSON válido (sem markdown, sem \`\`\`):
{
  "titulo": "título EXATO do livro",
  "autor": "autor EXATO",
  "editora": "editora EXATA",
  "anoPublicacao": "ano",
  "isbn": "${isbn}",
  "idioma": "pt",
  "numeroPaginas": "número",
  "descricao": "sinopse completa (mínimo 100 palavras)",
  "categoria": "categoria",
  "edicao": "edição",
  "cidadeEdicao": "cidade"
}

Se você NÃO TEM CERTEZA ou NÃO CONHECE esse ISBN específico, retorne apenas: null`;

axios.post(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  },
  { 
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  }
)
.then(response => {
  if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    const textoResposta = response.data.candidates[0].content.parts[0].text;
    console.log('\n📝 Resposta do Gemini:');
    console.log(textoResposta);
    
    // Tentar parsear JSON
    let jsonText = textoResposta.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const dadosLivro = JSON.parse(jsonMatch[0]);
        console.log('\n📚 DADOS RETORNADOS:');
        console.log('Título:', dadosLivro.titulo);
        console.log('Autor:', dadosLivro.autor);
        console.log('Editora:', dadosLivro.editora);
        console.log('Ano:', dadosLivro.anoPublicacao);
        
        console.log('\n✅ VERIFICAÇÃO:');
        if (dadosLivro.titulo?.toLowerCase().includes('zumbi')) {
          console.log('✅ Título CORRETO!');
        } else {
          console.log('❌ Título ERRADO! Esperado: Zumbi dos Palmares');
        }
        
        if (dadosLivro.autor?.toLowerCase().includes('galdino')) {
          console.log('✅ Autor CORRETO!');
        } else {
          console.log('❌ Autor ERRADO! Esperado: Luiz Galdino');
        }
      } catch (e) {
        console.error('\n❌ Erro ao parsear JSON:', e.message);
      }
    } else {
      console.log('\n⚠️ Gemini retornou null ou não encontrou');
    }
  }
  
  // Teste 2: Google Books
  console.log('\n' + '='.repeat(50));
  console.log('TESTE 2: GOOGLE BOOKS API');
  console.log('='.repeat(50));
  
  return axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=5`);
})
.then(response => {
  console.log('\n📊 Total de resultados:', response.data.totalItems || 0);
  
  if (response.data.totalItems > 0) {
    console.log('\n📚 Primeiros resultados:');
    response.data.items.slice(0, 3).forEach((item, index) => {
      const info = item.volumeInfo;
      console.log(`\n${index + 1}. ${info.title || 'Sem título'}`);
      console.log(`   Autor: ${info.authors?.join(', ') || 'Sem autor'}`);
      console.log(`   Editora: ${info.publisher || 'Sem editora'}`);
      console.log(`   ISBNs: ${info.industryIdentifiers?.map(id => `${id.type}:${id.identifier}`).join(', ') || 'Sem ISBN'}`);
    });
    
    const primeiro = response.data.items[0].volumeInfo;
    console.log('\n✅ VERIFICAÇÃO DO PRIMEIRO RESULTADO:');
    if (primeiro.title?.toLowerCase().includes('zumbi')) {
      console.log('✅ Título CORRETO!');
    } else {
      console.log('❌ Título ERRADO! Google Books retornou:', primeiro.title);
    }
  } else {
    console.log('⚠️ Google Books não encontrou nenhum resultado');
  }
})
.catch(error => {
  console.error('\n❌ Erro:', error.message);
  if (error.response?.data) {
    console.error('Detalhes:', error.response.data);
  }
});
