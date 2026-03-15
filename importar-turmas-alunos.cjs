#!/usr/bin/env node

/**
 * Script de Importação em Lote de Turmas e Alunos
 * CEI - Controle Escolar Inteligente
 * 2026
 */

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Dados completos de turmas e alunos
const dadosCompletos = {
  'turma-1': {
    nome: 'EFR-FUND II ANOS FINAIS INT – 9º ANO – I-A',
    serie: '9º',
    alunos: [
      { nome: 'ALICIA BISPO ALVES', cpf: '084.393.653-30' },
      { nome: 'ANA ROSA GOMES LOUSEIRO', cpf: '089.170.663-13' },
      { nome: 'ANA VITORIA CORREIA SANTOS', cpf: '083.828.973-80' },
      { nome: 'ANNA ALVES OLIVEIRA', cpf: '094.435.303-76' },
      { nome: 'ANNA VITORIA MOREIRA DA SILVA', cpf: '581.510.618-63' },
      { nome: 'ANNE CHRISTINE CARVALHO MARQUES CABRAL', cpf: '066.192.353-36' },
      { nome: 'ARTHUR CALEB SOARES RODRIGUES', cpf: '090.604.193-75' },
      { nome: 'BRUNO VITOR NUNES MORAIS', cpf: '102.271.423-65' },
      { nome: 'CAMILA VITORIA RIBEIRO CAMELO', cpf: '083.137.553-18' },
      { nome: 'DAVY OLIVEIRA GUIMARAES BISPO', cpf: '078.868.283-05' },
      { nome: 'GABRIEL DUARTE MOREIRA', cpf: '120.865.223-04' },
      { nome: 'HUGO RAFAEL FERNANDES CORREIA', cpf: '111.813.363-33' },
      { nome: 'IZABELLA CARVALHO JACOBINA', cpf: '090.703.993-69' },
      { nome: 'KEVILLYN FERNANDES DA SILVA', cpf: '111.956.913-35' },
      { nome: 'LORENA BEZERRA E GAMA', cpf: '073.916.973-46' },
      { nome: 'LORRANY RODRIGUES DA SILVA', cpf: '122.668.283-98' },
      { nome: 'LUIZ OCTAVIO SOUZA AMORIM', cpf: '067.336.243-46' },
      { nome: 'MARIA CLARA SOARES DE CARVALHO', cpf: '097.227.303-47' },
      { nome: 'MARYANE LUSTOSA RODRIGUES', cpf: '069.562.903-40' },
      { nome: 'MATHEUS FELIPE ARAUJO DE FREITAS', cpf: '110.528.383-67' },
      { nome: 'MELODY GONCALVES DE SOUSA', cpf: '124.965.843-85' },
      { nome: 'NAUANNY BARBOSA JACOBINA', cpf: '083.163.163-58' },
      { nome: 'PAMELA FERREIRA DE SOUZA', cpf: '094.077.613-80' },
      { nome: 'REBEKKA GUIMARAES SILVA', cpf: '122.531.793-29' },
      { nome: 'ROMULO MOREIRA DUARTE', cpf: '094.968.221-77' },
      { nome: 'SOPHIA SAYUME SILVA', cpf: '112.045.793-93' },
      { nome: 'THAYLA KAWANY OLIVEIRA DOS SANTOS', cpf: '090.669.043-99' },
      { nome: 'THAYLLA SILVIA QUINTINO GUERRA', cpf: '081.095.523-74' },
      { nome: 'THELMA QUINTINO DE OLIVEIRA', cpf: '084.508.223-00' },
      { nome: 'YASMIN SOUSA SANTANA', cpf: '083.467.493-92' },
    ]
  },
  'turma-2': {
    nome: 'EFR-FUND II ANOS FINAIS INT – 9º ANO – I-B',
    serie: '9º',
    alunos: [
      { nome: 'ANA CAROLINA RODRIGUES BISPO', cpf: '111.998.953-18' },
      { nome: 'ANA LAURA BATISTA RODRIGUES', cpf: '100.104.113-56' },
      { nome: 'ANNAH MELL NOGUEIRA JACOBINA', cpf: '114.530.233-56' },
      { nome: 'CECILIA OLIVEIRA DE SOUSA', cpf: '084.677.363-56' },
      { nome: 'CECILIA SOUZA SANTANA', cpf: '103.646.623-01' },
      { nome: 'DIANDRA GOMES DE SENA', cpf: '083.519.313-65' },
      { nome: 'DOMINYK RIBEIRO DAMASCENO', cpf: '093.961.063-99' },
      { nome: 'ELIANE GOMES JACOBINA', cpf: '083.191.523-48' },
      { nome: 'ELLY MARYA LUSTOSA BRITO', cpf: '090.863.933-30' },
      { nome: 'ESTHER SOUSA SILVA', cpf: '088.091.023-20' },
      { nome: 'EVELLYN ALVES PEIXOTO', cpf: '101.647.673-63' },
      { nome: 'EVILLY DAGUIA MIRANDA SILVA', cpf: '707.928.711-11' },
      { nome: 'JAMILLY DIAS DOS SANTOS', cpf: '094.548.403-80' },
      { nome: 'JORGE PEREIRA VOGADO', cpf: '092.915.903-98' },
      { nome: 'JULYANA GOMES JACOBINA', cpf: '083.303.673-47' },
      { nome: 'KAROLLAINE VOGADO RODRIGUES', cpf: '078.222.033-98' },
      { nome: 'LUAN DA SILVA JACOBINA', cpf: '077.728.653-09' },
      { nome: 'LUCAS ANDRE RODRIGUES GOMES', cpf: '083.328.043-02' },
      { nome: 'LUIZ EDUARDO RIBEIRO DA SILVA', cpf: '083.115.573-65' },
      { nome: 'LUIZ ISIDORIO BATISTA LUSTOSA', cpf: '094.751.533-06' },
      { nome: 'LUIZA VIEIRA JACOBINA ANTUNES', cpf: '083.189.693-08' },
      { nome: 'MARCOS HENRIQUE DE OLIVEIRA FIGUEREDO', cpf: '094.688.473-06' },
      { nome: 'MARIANGELA BATISTA MIRANDA', cpf: '098.937.393-22' },
      { nome: 'MICHELLY PORTAO DE SOUSA', cpf: '080.143.303-74' },
      { nome: 'ROGERIO CARVALHO JACOBINA', cpf: '106.112.143-77' },
      { nome: 'SARA YSYS PEREIRA SILVA', cpf: '073.889.273-44' },
      { nome: 'SARAH JHENNE PEREIRA DA ROCHA', cpf: '126.788.113-52' },
      { nome: 'VICTOR AUGUSTO RIBEIRO DA SILVA', cpf: '083.448.993-70' },
      { nome: 'VICTOR GABRIEL DIAS DUARTE SOUSA', cpf: '109.946.923-66' },
      { nome: 'YASMIN SOUSA GUALBERTO', cpf: '572.375.358-46' },
    ]
  },
  'turma-3': {
    nome: 'EMTPADM-ENF-EMP – 1ª SÉRIE – INTEGRAL – I-B',
    serie: '1ª',
    alunos: [
      { nome: 'ALICE ANDRADE LOBATO', cpf: '094.094.373-50' },
      { nome: 'ANA MEL GAMA CORREIA', cpf: '086.642.333-81' },
      { nome: 'ANA SARA CARVALHO RODRIGUES', cpf: '082.285.183-07' },
      { nome: 'ANHAYA LIANNA DANTAS GUERRA', cpf: '195.685.327-81' },
      { nome: 'BEATRIZ BONFIM SILVA', cpf: '117.559.353-23' },
      { nome: 'BRUNO LIMA RODRIGUES', cpf: '104.234.403-57' },
      { nome: 'CARLOS DANIEL ALVES DOURADO', cpf: '083.191.983-30' },
      { nome: 'CLARA NATALIE ALVES DO NASCIMENTO', cpf: '094.734.793-36' },
      { nome: 'EMILLY FERNANDES DA SILVA', cpf: '110.678.853-23' },
      { nome: 'ENZO GABRIEL ARRAIS RIBEIRO', cpf: '096.178.563-28' },
      { nome: 'ERI FERNANDES BASTOS', cpf: '083.597.893-12' },
      { nome: 'FELIPE ALENCAR JACOBINA BRITO', cpf: '096.999.863-52' },
      { nome: 'GABRIEL RODRIGUES DOS SANTOS', cpf: '122.618.803-67' },
      { nome: 'GENIVALDO RUAN JACOBINA DOS REIS', cpf: '622.370.773-80' },
      { nome: 'GUILHERME RIBEIRO ARAUJO SILVA', cpf: '084.343.993-93' },
      { nome: 'GUSTAVO VIANA DE CARVALHO', cpf: '111.836.653-00' },
      { nome: 'JOAO GABRIEL DE SOUSA LEMOS', cpf: '112.227.233-28' },
      { nome: 'LUIS FELIPE ALVES DOS SANTOS', cpf: '083.295.613-99' },
      { nome: 'LUIS OTAVIO MORAIS DE SOUSA', cpf: '096.007.223-31' },
      { nome: 'LUIZ EDUARDO ARAUJO PEREIRA DA GAMA', cpf: '112.043.093-37' },
      { nome: 'LUIZ OTAVIO DE OLIVEIRA FIGUEREDO', cpf: '103.786.493-02' },
      { nome: 'MARIA EDUARDA BAIAO TANAJURA', cpf: '116.947.453-50' },
      { nome: 'MARIA EDUARDA FERREIRA SALES', cpf: '102.947.683-78' },
      { nome: 'MICHELEY BARBOSA LOBO RODRIGUES', cpf: '117.421.293-40' },
      { nome: 'PATRICIA BRITO DA SILVA', cpf: '074.829.703-04' },
      { nome: 'SERGIO OTVIO VOGADO DE CARVALHO', cpf: '077.266.903-13' },
      { nome: 'VICTOR LUCAS FREIRE RODRIGUES', cpf: '717.663.041-09' },
    ]
  }
};

// Função para gerar arquivo JSON com os dados
function gerarArquivoImportacao() {
  const dataExport = {
    timestamp: new Date().toISOString(),
    versao: '3.6.0',
    instituicaoId: 1,
    turmas: [],
    alunos: []
  };

  for (const [turmaId, turmaData] of Object.entries(dadosCompletos)) {
    // Adicionar turma
    dataExport.turmas.push({
      id: turmaId,
      nome: turmaData.nome,
      serie: turmaData.serie,
      instituicaoId: 1,
      dataCriacao: new Date().toISOString(),
      status: 'ativo'
    });

    // Adicionar alunos da turma
    turmaData.alunos.forEach((aluno, index) => {
      dataExport.alunos.push({
        id: `aluno-${turmaId}-${index}`,
        nome: aluno.nome,
        cpf: aluno.cpf.replace(/\D/g, ''),
        turmaId: turmaId,
        instituicaoId: 1,
        tipo: 'leitor',
        status: 'ativo',
        dataCadastro: new Date().toISOString()
      });
    });
  }

  const outputPath = path.join(__dirname, 'dados-importacao-2026.json');
  fs.writeFileSync(outputPath, JSON.stringify(dataExport, null, 2));

  return { dataExport, outputPath };
}

// Função principal
async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   📚 IMPORTADOR DE TURMAS E ALUNOS - CEI 2026              ║', 'cyan');
  log('║   Controle Escolar Inteligente                             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  try {
    // Gerar arquivo
    log('🔄 Processando dados...', 'blue');
    const { dataExport, outputPath } = gerarArquivoImportacao();

    // Estatísticas
    log('\n📊 RESUMO DA IMPORTAÇÃO:', 'bright');
    log(`   Turmas: ${dataExport.turmas.length}`, 'green');
    log(`   Alunos: ${dataExport.alunos.length}`, 'green');
    log(`   Total de registros: ${dataExport.turmas.length + dataExport.alunos.length}`, 'green');

    // Detalhe por turma
    log('\n📋 TURMAS IMPORTADAS:', 'bright');
    dataExport.turmas.forEach(turma => {
      const alunosCount = dataExport.alunos.filter(a => a.turmaId === turma.id).length;
      log(`   ✓ ${turma.nome} (${alunosCount} alunos)`, 'green');
    });

    // Salvar arquivo
    log(`\n💾 Arquivo gerado: ${outputPath}`, 'yellow');
    log('\n✅ SUCESSO! Arquivo pronto para importação.', 'green');
    log('\n📝 Próximas etapas:', 'blue');
    log('   1. Abra o arquivo importar-turmas-alunos-2026.html no navegador', 'cyan');
    log('   2. Ou use a API: POST /api/importar-dados com o arquivo JSON', 'cyan');
    log('   3. Ou copie os dados para localStorage via console', 'cyan');

  } catch (error) {
    log(`\n❌ ERRO: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
