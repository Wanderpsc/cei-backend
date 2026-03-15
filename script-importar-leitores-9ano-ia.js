/*
  Script de importacao em lote de leitores (alunos)
  Como usar:
  1) Abra o sistema no navegador e faca login na escola correta.
  2) Abra o DevTools (F12) > Console.
  3) Cole todo este script e pressione Enter.
  4) Ao final, recarregue a pagina.
*/

(() => {
  const DATA_KEY = 'cei_data';
  const INST_KEY = 'cei_instituicao_ativa';
  const USER_KEY = 'cei_usuario_logado';

  const ALUNOS = [
    { nome: 'ALICIA BISPO ALVES', cpf: '084.393.653-30', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'ANA ROSA GOMES LOUSEIRO', cpf: '089.170.663-13', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'ANA VITORIA CORREIA SANTOS', cpf: '083.828.973-80', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'ANNA ALVES OLIVEIRA', cpf: '094.435.303-76', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'ANNA VITORIA MOREIRA DA SILVA', cpf: '581.510.618-63', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'ANNE CHRISTINE CARVALHO MARQUES CABRAL', cpf: '066.192.353-36', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'ARTHUR CALEB SOARES RODRIGUES', cpf: '090.604.193-75', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'BRUNO VITOR NUNES MORAIS', cpf: '102.271.423-65', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'CAMILA VITORIA RIBEIRO CAMELO', cpf: '083.137.553-18', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'DAVY OLIVEIRA GUIMARAES BISPO', cpf: '078.868.283-05', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'GABRIEL DUARTE MOREIRA', cpf: '120.865.223-04', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'HUGO RAFAEL FERNANDES CORREIA', cpf: '111.813.363-33', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'IZABELLA CARVALHO JACOBINA', cpf: '090.703.993-69', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'KEVILLYN FERNANDES DA SILVA', cpf: '111.956.913-35', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'LORENA BEZERRA E GAMA', cpf: '073.916.973-46', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'LORRANY RODRIGUES DA SILVA', cpf: '122.668.283-98', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'LUIZ OCTAVIO SOUZA AMORIM', cpf: '067.336.243-46', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'MARIA CLARA SOARES DE CARVALHO', cpf: '097.227.303-47', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'MARYANE LUSTOSA RODRIGUES', cpf: '069.562.903-40', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'MATHEUS FELIPE ARAUJO DE FREITAS', cpf: '110.528.383-67', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'MELODY GONCALVES DE SOUSA', cpf: '124.965.843-85', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'NAUANNY BARBOSA JACOBINA', cpf: '083.163.163-58', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'PAMELA FERREIRA DE SOUZA', cpf: '094.077.613-80', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'REBEKKA GUIMARAES SILVA', cpf: '122.531.793-29', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'ROMULO MOREIRA DUARTE', cpf: '094.968.221-77', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'SOPHIA SAYUME SILVA', cpf: '112.045.793-93', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'THAYLA KAWANY OLIVEIRA DOS SANTOS', cpf: '090.669.043-99', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'THAYLLA SILVIA QUINTINO GUERRA', cpf: '081.095.523-74', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'THELMA QUINTINO DE OLIVEIRA', cpf: '084.508.223-00', anoSerieTurma: '9º ANO – I-A' },
    { nome: 'YASMIN SOUSA SANTANA', cpf: '083.467.493-92', anoSerieTurma: '9º ANO – I-A' }
  ];

  const normalizeText = (value) => String(value || '').trim().toLowerCase();
  const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

  const formatCpf = (digits) => {
    const d = onlyDigits(digits);
    if (d.length !== 11) return String(digits || '').trim();
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  };

  const parseSerieTurma = (raw) => {
    const cleaned = String(raw || '')
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();

    const parts = cleaned.split('-').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) {
      return { serie: '', turma: '' };
    }

    if (parts.length === 1) {
      return { serie: parts[0], turma: '' };
    }

    return {
      serie: parts.slice(0, -1).join(' - ').trim(),
      turma: parts[parts.length - 1].trim()
    };
  };

  const parseJson = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  };

  const rawData = localStorage.getItem(DATA_KEY);
  if (!rawData) {
    throw new Error('Nao foi encontrado o localStorage "cei_data". Faca login no sistema e tente novamente.');
  }

  const dados = parseJson(rawData, null);
  if (!dados || typeof dados !== 'object') {
    throw new Error('Formato invalido em "cei_data".');
  }

  if (!Array.isArray(dados.clientes)) dados.clientes = [];
  if (!Array.isArray(dados.seriesAcademicas)) dados.seriesAcademicas = [];
  if (!Array.isArray(dados.turmasAcademicas)) dados.turmasAcademicas = [];

  const usuario = parseJson(localStorage.getItem(USER_KEY) || 'null', null);
  const instituicaoAtivaStorage = localStorage.getItem(INST_KEY);
  const instituicaoAtiva = instituicaoAtivaStorage ? Number(instituicaoAtivaStorage) : Number(usuario?.instituicaoId || 0);

  if (!instituicaoAtiva && usuario?.perfil !== 'SuperAdmin') {
    throw new Error('Instituicao ativa nao encontrada. Entre na escola correta e tente novamente.');
  }

  const instituicaoIdAlvo = instituicaoAtiva || 0;
  const anoLetivo = String(new Date().getFullYear());

  const usedIds = new Set();
  [dados.clientes, dados.seriesAcademicas, dados.turmasAcademicas].forEach((list) => {
    list.forEach((item) => {
      const id = Number(item?.id);
      if (Number.isFinite(id)) usedIds.add(id);
    });
  });

  let sequence = 0;
  const nextId = () => {
    let candidate;
    do {
      sequence += 1;
      const suffix = String(sequence % 1000).padStart(3, '0');
      candidate = Number(`${Date.now()}${suffix}`);
    } while (usedIds.has(candidate));

    usedIds.add(candidate);
    return candidate;
  };

  const alunosDaInstituicao = dados.clientes.filter((c) => Number(c?.instituicaoId) === instituicaoIdAlvo);
  const cpfExistente = new Set(
    alunosDaInstituicao
      .map((c) => onlyDigits(c?.cpf))
      .filter(Boolean)
  );

  const seriesCache = new Map();
  dados.seriesAcademicas
    .filter((s) => Number(s?.instituicaoId) === instituicaoIdAlvo)
    .forEach((serie) => {
      const key = `${normalizeText(serie?.nomeSerie)}|${String(serie?.anoLetivo || '')}`;
      seriesCache.set(key, serie);
    });

  const turmasCache = new Map();
  dados.turmasAcademicas
    .filter((t) => Number(t?.instituicaoId) === instituicaoIdAlvo)
    .forEach((turma) => {
      const key = `${String(turma?.serieId || '')}|${normalizeText(turma?.nomeTurma)}|${String(turma?.anoLetivo || '')}`;
      turmasCache.set(key, turma);
    });

  const skipped = [];
  const inserted = [];

  ALUNOS.forEach((aluno) => {
    const nome = String(aluno.nome || '').trim();
    const cpfOriginal = String(aluno.cpf || '').trim();
    const cpf = onlyDigits(cpfOriginal);

    if (!nome || !cpf) {
      skipped.push({ nome: nome || '(sem nome)', motivo: 'nome/cpf invalido' });
      return;
    }

    if (cpfExistente.has(cpf)) {
      skipped.push({ nome, motivo: 'cpf ja cadastrado' });
      return;
    }

    const { serie, turma } = parseSerieTurma(aluno.anoSerieTurma);

    const serieKey = `${normalizeText(serie)}|${anoLetivo}`;
    let serieObj = seriesCache.get(serieKey);

    if (!serieObj && serie) {
      serieObj = {
        id: nextId(),
        instituicaoId: instituicaoIdAlvo,
        nomeSerie: serie,
        anoLetivo,
        descricao: '',
        ativo: true,
        dataCadastro: new Date().toISOString()
      };

      dados.seriesAcademicas.push(serieObj);
      seriesCache.set(serieKey, serieObj);
    }

    let turmaObj = null;
    if (turma && serieObj) {
      const turmaKey = `${String(serieObj.id)}|${normalizeText(turma)}|${anoLetivo}`;
      turmaObj = turmasCache.get(turmaKey);

      if (!turmaObj) {
        turmaObj = {
          id: nextId(),
          instituicaoId: instituicaoIdAlvo,
          serieId: serieObj.id,
          nomeSerie: serieObj.nomeSerie,
          nomeTurma: turma,
          anoLetivo,
          turno: '',
          ativo: true,
          dataCadastro: new Date().toISOString()
        };

        dados.turmasAcademicas.push(turmaObj);
        turmasCache.set(turmaKey, turmaObj);
      }
    }

    const proximoCodigo = String(dados.clientes.length + 1).padStart(6, '0');

    const novoLeitor = {
      id: nextId(),
      instituicaoId: instituicaoIdAlvo,
      nome,
      cpf: formatCpf(cpfOriginal),
      telefone: '',
      email: '',
      endereco: '',
      tipo: 'Aluno',
      serie: serieObj?.nomeSerie || serie || '',
      serieId: serieObj ? String(serieObj.id) : '',
      turma: turmaObj?.nomeTurma || turma || '',
      turmaId: turmaObj ? String(turmaObj.id) : '',
      matricula: '',
      ativo: true,
      codigoIdentificacao: `LEIT${proximoCodigo}`,
      dataCadastro: new Date().toISOString()
    };

    dados.clientes.push(novoLeitor);
    cpfExistente.add(cpf);
    inserted.push(novoLeitor);
  });

  const backupKey = `cei_data_backup_import_9ano_ia_${Date.now()}`;
  localStorage.setItem(backupKey, rawData);
  localStorage.setItem(DATA_KEY, JSON.stringify(dados));

  if (inserted.length > 0) {
    window.dispatchEvent(new Event('sync-required'));
  }

  console.log('Importacao finalizada.');
  console.log('Backup criado em:', backupKey);
  console.log('Leitores inseridos:', inserted.length);
  console.log('Leitores ignorados:', skipped.length);

  if (skipped.length > 0) {
    console.table(skipped);
  }

  alert(
    `Importacao concluida.\n\n` +
    `Inseridos: ${inserted.length}\n` +
    `Ignorados: ${skipped.length}\n\n` +
    `Backup local: ${backupKey}\n\n` +
    `Recarregue a pagina para visualizar os novos leitores.`
  );
})();
