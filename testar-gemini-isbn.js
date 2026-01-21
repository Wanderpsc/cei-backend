const axios = require('axios');
const fs = require('fs');

// Ler a API key do .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/REACT_APP_GEMINI_API_KEY=([^\r\n]+)/);
const GEMINI_API_KEY = keyMatch ? keyMatch[1] : '';

const isbn = '9786589077039';

console.log('🤖 BUSCANDO NO GOOGLE GEMINI AI');
console.log('📋 ISBN:', isbn);
console.log('='.repeat(60));

// Prompt mais específico e direto
const prompt = `ISBN: ${isbn}

Por favor, identifique este livro brasileiro. Retorne APENAS as informações reais e verificadas.

Se você conhecer este ISBN, responda em formato JSON:
{
  "titulo": "título exato",
  "autor": "autor exato",
  "editora": "editora exata",
  "ano": "ano de publicação"
}

Se você NÃO conhecer este ISBN, responda apenas: DESCONHECIDO`;

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
    const resposta = response.data.candidates[0].content.parts[0].text;
    console.log('\n📝 RESPOSTA DO GEMINI:');
    console.log(resposta);
    console.log('\n' + '='.repeat(60));
    
    // Tentar extrair JSON
    const jsonMatch = resposta.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const dados = JSON.parse(jsonMatch[0]);
        console.log('\n📚 LIVRO IDENTIFICADO:');
        console.log('   Título:', dados.titulo);
        console.log('   Autor:', dados.autor);
        console.log('   Editora:', dados.editora);
        console.log('   Ano:', dados.ano);
      } catch (e) {
        console.log('\n⚠️ Resposta em formato diferente');
      }
    } else if (resposta.includes('DESCONHECIDO')) {
      console.log('\n❌ Gemini NÃO conhece este ISBN');
    }
  }
})
.catch(error => {
  console.error('\n❌ ERRO:', error.message);
  if (error.response?.data) {
    console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
  }
});
