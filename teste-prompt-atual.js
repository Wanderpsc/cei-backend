const axios = require('axios');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/REACT_APP_GEMINI_API_KEY=([^\r\n]+)/);
const GEMINI_API_KEY = keyMatch ? keyMatch[1] : '';

const isbn = '9786589077039';

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

console.log('🧪 TESTE DO PROMPT ATUAL DO SISTEMA');
console.log('ISBN:', isbn);
console.log('Esperado: Zumbi dos Palmares');
console.log('='.repeat(60));

axios.post(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  },
  { timeout: 15000, headers: { 'Content-Type': 'application/json' } }
)
.then(response => {
  const resposta = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('\n📝 RESPOSTA:');
  console.log(resposta);
  
  const jsonMatch = resposta.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    const dados = JSON.parse(jsonMatch[0]);
    console.log('\n📚 LIVRO RETORNADO:');
    console.log('Título:', dados.titulo);
    console.log('Autor:', dados.autor);
    console.log('Editora:', dados.editora);
    
    if (dados.titulo?.toLowerCase().includes('zumbi')) {
      console.log('\n✅ CORRETO!');
    } else {
      console.log('\n❌ ERRADO! O Gemini inventou outro livro!');
    }
  }
})
.catch(error => {
  console.error('❌ ERRO:', error.message);
});
