// TESTE LOCAL DO GEMINI AI
const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyCO3qEJbtTNesthQK19EOkvKQEjivl_jy8';
const isbn = '9786589077039'; // Zumbi dos Palmares

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

console.log('🔍 Testando Gemini AI...');
console.log('ISBN:', isbn);
console.log('API Key:', GEMINI_API_KEY.substring(0, 10) + '...');

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
  console.log('\n✅ Resposta recebida!');
  console.log('Status:', response.status);
  
  if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    const textoResposta = response.data.candidates[0].content.parts[0].text;
    console.log('\n📝 Resposta completa:');
    console.log(textoResposta);
    
    // Tentar parsear JSON
    let jsonText = textoResposta.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const dadosLivro = JSON.parse(jsonMatch[0]);
        console.log('\n✅ JSON parseado com sucesso:');
        console.log('Título:', dadosLivro.titulo);
        console.log('Autor:', dadosLivro.autor);
        console.log('Editora:', dadosLivro.editora);
        console.log('Ano:', dadosLivro.anoPublicacao);
      } catch (e) {
        console.error('\n❌ Erro ao parsear JSON:', e.message);
      }
    } else {
      console.warn('\n⚠️ Nenhum JSON encontrado na resposta');
    }
  }
})
.catch(error => {
  console.error('\n❌ Erro na requisição:');
  console.error('Mensagem:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Dados:', error.response.data);
  }
});
