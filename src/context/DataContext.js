import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import apiService from '../utils/apiService';
import { initDataProtection, createBackup } from '../utils/dataProtection';
import { isCloudEnabled } from '../services/supabaseClient';
import { syncFromCloud, syncToCloud, deleteFromCloud } from '../services/syncService';

// Versão do sistema - IMPORTANTE: Incrementar a cada atualização significativa
const SYSTEM_VERSION = '3.5.2';
const DATA_VERSION_KEY = 'cei_data_version';
const LAST_UPDATE_KEY = 'cei_last_update';
const GLOBAL_IDS_MIGRATION_KEY = 'cei_global_ids_migrated_v1';
const LEGACY_STORAGE_MIGRATION_KEY = 'cei_legacy_storage_migrated_v1';
const LEGACY_CLIENTES_KEY = 'cei_clientes';
const LEGACY_TURMAS_KEY = 'cei_turmas_academicas';
const STORAGE_PRESTADOR = 'cei_nf_prestador_config';
const STORAGE_PREFEITURA = 'cei_nf_prefeitura_config';
const DEMO_DEVICE_ID_KEY = 'cei_demo_device_id';
const DEMO_CONTACT_KEY = 'cei_demo_contact';

const DEFAULT_PREFEITURA_CURIMATA = {
  razaoSocial: 'PREFEITURA MUNICIPAL DE CURIMATÁ',
  cnpj: '06.554.273/0001-64',
  endereco: 'Praça Abdias Albuquerque, 427 - Centro',
  cep: '64960-000',
  municipio: 'Curimatá',
  uf: 'PI',
  telefone: '(89) 3574-1198',
  email: 'prefeituradecurimata@gmail.com'
};

const DEFAULT_PRESTADOR = {
  razaoSocial: 'Wander Pires Silva Coelho',
  nomeFantasia: 'CEI - Controle Escolar Inteligente',
  tipoDocumento: 'CPF',
  documento: '036.236.556-35',
  inscricaoMunicipal: '',
  endereco: '',
  cep: '',
  municipio: '',
  uf: 'PI',
  telefone: '',
  email: ''
};

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const validarSenhaForte = (senha) => {
    if (!senha || senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
    if (!/[A-Z]/.test(senha)) return 'A senha deve conter pelo menos 1 letra maiúscula.';
    if (!/[a-z]/.test(senha)) return 'A senha deve conter pelo menos 1 letra minúscula.';
    if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos 1 número.';
    if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha deve conter pelo menos 1 caractere especial.';
    return '';
  };

  const permissoesPadraoEscola = [
    '/configuracoes',
    '/gerenciar-usuarios',
    '/relatorio-usuarios',
    '/financeiro',
    '/livros',
    '/relatorios-livros',
    '/patrimonio',
    '/clientes',
    '/series-turmas',
    '/emprestimos',
    '/emprestimos-didaticos-lote',
    '/devolucoes',
    '/clube-leitura',
    '/busca',
    '/relatorios'
  ];

  // Instituições pré-cadastradas
  const instituicoesPadrao = [
    {
      id: 1,
      nomeInstituicao: 'CETI Desembargador Amaral',
      cnpj: '00.000.000/0001-00',
      email: 'contato@cetidesamaral.edu.br',
      telefone: '(86) 3221-0000',
      endereco: 'Rua exemplo, 123',
      cidade: 'Teresina',
      estado: 'PI',
      cep: '64000-000',
      nomeResponsavel: 'Wander Pires Silva Coelho',
      cargoResponsavel: 'Diretor',
      emailResponsavel: 'wander@cetidesamaral.edu.br',
      telefoneResponsavel: '(86) 99999-0000',
      loginAdmin: 'cetidesamaral',
      senhaAdmin: 'Ceti@2026',
      plano: '1 Ano (365 dias)',
      diasLicenca: 365,
      valorMensal: 970.00,
      status: 'ativo',
      dataCadastro: new Date('2024-01-01T00:00:00').toISOString(),
      dataAtivacao: new Date('2024-01-01T00:00:00').toISOString(),
      dataExpiracao: new Date('2027-01-01T23:59:59').toISOString(), // Válido até 2027
      licenca: 'CETI-2024-AMAR-AL01',
      statusFinanceiro: 'em_dia'
    },
    {
      id: 999,
      nomeInstituicao: 'Escola Teste - Versão Demonstração',
      cnpj: '00.000.000/0000-00',
      email: 'teste@cei-demo.com.br',
      telefone: '(00) 0000-0000',
      endereco: 'Teste Demonstração',
      cidade: 'Demo',
      estado: 'TE',
      cep: '00000-000',
      nomeResponsavel: 'Conta Teste',
      cargoResponsavel: 'Demonstração',
      emailResponsavel: 'teste@cei-demo.com.br',
      telefoneResponsavel: '(00) 00000-0000',
      loginAdmin: 'demo',
      senhaAdmin: 'demo2026',
      plano: 'Teste - Limitado',
      diasLicenca: 30,
      valorMensal: 0,
      status: 'ativo',
      dataCadastro: new Date().toISOString(),
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      licenca: 'DEMO-TESTE-LIMITADO',
      statusFinanceiro: 'teste',
      contaTeste: true,
      limites: {
        maxLivros: 20,
        maxLeitores: 20
      }
    }
  ];

  // Usuários padrão - SUPER ADMIN DA MATRIZ + Admin da CETI + Conta Teste
  const usuariosPadrao = [
    {
      id: 1,
      nome: 'Super Administrador',
      login: 'superadmin',
      senha: 'matriz@2025',
      perfil: 'SuperAdmin', // Controle total da matriz
      tipo: 'master',
      instituicaoId: 0 // 0 = Matriz
    },
    {
      id: 2,
      nome: 'Wander Pires Silva Coelho',
      login: 'cetidesamaral',
      senha: 'Ceti@2026',
      perfil: 'Admin',
      tipo: 'master', // Usuário master da instituição
      permissoes: permissoesPadraoEscola,
      instituicaoId: 1, // CETI Desembargador Amaral
      email: 'wander@cetidesamaral.edu.br',
      cargo: 'Diretor',
      status: 'ativo',
      dataCriacao: new Date('2024-01-01').toISOString()
    },
    {
      id: 3,
      nome: 'Michaela - Biblioteca CETI',
      login: 'michaela@ceti.com',
      senha: 'Biblio@2027',
      perfil: 'Bibliotecário',
      tipo: 'operacional',
      permissoes: permissoesPadraoEscola,
      instituicaoId: 1,
      email: 'michaela@ceti.com',
      cargo: 'Bibliotecária',
      status: 'ativo',
      dataCriacao: new Date().toISOString()
    },
    {
      id: 999,
      nome: 'Usuário Demonstração',
      login: 'demo',
      senha: 'demo2026',
      perfil: 'Admin',
      tipo: 'teste',
      permissoes: permissoesPadraoEscola,
      instituicaoId: 999, // Instituição de teste
      email: 'teste@cei-demo.com.br',
      cargo: 'Teste',
      status: 'ativo',
      dataCriacao: new Date().toISOString(),
      contaTeste: true
    }
  ];

  // Planos padrão
  const planosPadrao = [
    { id: 1, nome: '1 Mês (30 dias)', dias: 30, valor: 97.00, ativo: true },
    { id: 2, nome: '3 Meses (90 dias)', dias: 90, valor: 270.00, ativo: true },
    { id: 3, nome: '6 Meses (180 dias)', dias: 180, valor: 520.00, ativo: true },
    { id: 4, nome: '1 Ano (365 dias)', dias: 365, valor: 970.00, ativo: true },
    { id: 5, nome: '2 Anos (730 dias)', dias: 730, valor: 1800.00, ativo: true }
  ];

  // Estados
  const [instituicoes, setInstituicoes] = useState([]);
  const [livros, setLivros] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [seriesAcademicas, setSeriesAcademicas] = useState([]);
  const [turmasAcademicas, setTurmasAcademicas] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    // Restaurar usuário logado do localStorage
    const usuarioSalvo = localStorage.getItem('cei_usuario_logado');
    console.log('🔐 [INIT] Tentando restaurar usuário do localStorage');
    console.log('🔐 [INIT] localStorage.getItem("cei_usuario_logado"):', usuarioSalvo);
    
    if (usuarioSalvo) {
      try {
        const parsed = JSON.parse(usuarioSalvo);
        console.log('✅ [INIT] Usuário restaurado com sucesso:', parsed.nome);
        return parsed;
      } catch (error) {
        console.error('❌ [INIT] Erro ao fazer parse do usuário:', error);
        return null;
      }
    } else {
      console.log('⚠️ [INIT] Nenhum usuário salvo no localStorage');
      return null;
    }
  });
  const [instituicaoAtiva, setInstituicaoAtiva] = useState(() => {
    // Restaurar instituição ativa do localStorage
    const instituicaoSalva = localStorage.getItem('cei_instituicao_ativa');
    console.log('🏢 [INIT] instituicaoAtiva restaurada:', instituicaoSalva);
    return instituicaoSalva ? parseInt(instituicaoSalva) : null;
  });
  // Marcar como true imediatamente porque a restauração do localStorage acima é síncrona
  const [autenticacaoCarregada, setAutenticacaoCarregada] = useState(true);
  const [planos, setPlanos] = useState(planosPadrao);
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [logAtividades, setLogAtividades] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [dadosCarregados, setDadosCarregados] = useState(false);
  const cloudPullingRef = useRef(false);
  const cloudPushingRef = useRef(false);
  const instituicoesRef = useRef([]);
  const usuariosRef = useRef([]);
  const livrosRef = useRef([]);
  const clientesRef = useRef([]);
  const patrimonioRef = useRef([]);
  const emprestimosRef = useRef([]);

  const dataTypesSync = ['instituicoes', 'usuarios', 'livros', 'clientes', 'patrimonio', 'emprestimos'];
  const localAcademicDataTypes = ['seriesAcademicas', 'turmasAcademicas'];

  const normalizeInstitutionId = (value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericId = Number(value);
    return Number.isFinite(numericId) ? numericId : null;
  };

  const getItemInstitutionRaw = (item) => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    if (item.instituicaoId !== undefined && item.instituicaoId !== null && item.instituicaoId !== '') {
      return item.instituicaoId;
    }

    if (item.instituicao_id !== undefined && item.instituicao_id !== null && item.instituicao_id !== '') {
      return item.instituicao_id;
    }

    return null;
  };

  const getLegacyInstitutionFallback = () => {
    const activeInstitutionId = normalizeInstitutionId(instituicaoAtiva);
    if (activeInstitutionId !== null) {
      return activeInstitutionId;
    }

    const institutionIds = (instituicoes || [])
      .map((institution) => normalizeInstitutionId(institution?.id))
      .filter((id) => id !== null && id !== 0);

    return institutionIds.length === 1 ? institutionIds[0] : null;
  };

  const resolveInstitutionId = (value, fallbackValue = null) => {
    const normalized = normalizeInstitutionId(value);
    if (normalized !== null) {
      return normalized;
    }

    return normalizeInstitutionId(fallbackValue);
  };

  const normalizeInstitutionText = (value) => String(value || '').trim().toLowerCase();

  const normalizeInstitutionDocument = (value) => String(value || '').replace(/\D/g, '');

  const getInstitutionAliasIds = (targetInstitutionId) => {
    const targetId = normalizeInstitutionId(targetInstitutionId);
    if (targetId === null) {
      return [targetInstitutionId];
    }

    const targetInstitution = (instituicoes || []).find(
      (institution) => normalizeInstitutionId(institution?.id) === targetId
    );

    if (!targetInstitution) {
      return [targetId];
    }

    const targetName = normalizeInstitutionText(targetInstitution.nomeInstituicao);
    const targetDocument = normalizeInstitutionDocument(targetInstitution.cnpj);
    const aliasIds = new Set([targetId]);

    (instituicoes || []).forEach((institution) => {
      const institutionId = normalizeInstitutionId(institution?.id);
      if (institutionId === null || institutionId === 0) {
        return;
      }

      const sameName =
        targetName &&
        normalizeInstitutionText(institution?.nomeInstituicao) === targetName;
      const sameDocument =
        targetDocument &&
        normalizeInstitutionDocument(institution?.cnpj) === targetDocument;

      if (sameName || sameDocument) {
        aliasIds.add(institutionId);
      }
    });

    return Array.from(aliasIds);
  };

  const belongsToInstitution = (item, targetInstitutionId, options = {}) => {
    const {
      includeLegacyWithoutInstitution = false,
      includeInstitutionAliases = false
    } = options;

    const targetId = normalizeInstitutionId(targetInstitutionId);
    if (targetId === null) {
      return false;
    }

    const targetIds = includeInstitutionAliases
      ? new Set(getInstitutionAliasIds(targetId))
      : new Set([targetId]);

    const itemInstitutionId = normalizeInstitutionId(getItemInstitutionRaw(item));
    if (itemInstitutionId === null) {
      if (!includeLegacyWithoutInstitution) {
        return false;
      }

      const legacyFallback = getLegacyInstitutionFallback();
      return legacyFallback !== null && targetIds.has(legacyFallback);
    }

    return targetIds.has(itemInstitutionId);
  };

  const normalizeCollectionInstitutionIds = (items = [], fallbackInstitutionId = null) => {
    const fallbackId = normalizeInstitutionId(fallbackInstitutionId);

    return (items || []).map((item) => {
      if (!item || typeof item !== 'object') {
        return item;
      }

      const institutionRaw = getItemInstitutionRaw(item);
      const normalizedInstitutionId = resolveInstitutionId(institutionRaw, fallbackId);
      const normalizedCurrent = normalizeInstitutionId(institutionRaw);

      if (normalizedInstitutionId === null || normalizedCurrent === normalizedInstitutionId) {
        return item;
      }

      return {
        ...item,
        instituicaoId: normalizedInstitutionId
      };
    });
  };

  const inferFallbackInstitutionId = (data = {}) => {
    const storedInstitutionId = normalizeInstitutionId(localStorage.getItem('cei_instituicao_ativa'));
    if (storedInstitutionId !== null) {
      return storedInstitutionId;
    }

    const institutionIds = (data.instituicoes || [])
      .map((institution) => normalizeInstitutionId(institution?.id))
      .filter((id) => id !== null && id !== 0);

    if (institutionIds.length === 1) {
      return institutionIds[0];
    }

    const userInstitutionIds = (data.usuarios || [])
      .filter((user) => user?.perfil !== 'SuperAdmin')
      .map((user) => normalizeInstitutionId(getItemInstitutionRaw(user)))
      .filter((id) => id !== null && id !== 0);

    return userInstitutionIds.length === 1 ? userInstitutionIds[0] : null;
  };

  const normalizeAcademicText = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const extractAcademicSeriesTurma = (value) => {
    const normalized = String(value || '')
      .replace(/[–—]/g, ' - ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalized) {
      return { serie: '', turma: '' };
    }

    const parts = normalized
      .split(' - ')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length > 1) {
      return {
        serie: parts.slice(0, -1).join(' - ').trim(),
        turma: parts[parts.length - 1].trim()
      };
    }

    const tokens = normalized.split(' ').map((token) => token.trim()).filter(Boolean);
    if (tokens.length >= 2) {
      const turmaSuffix = tokens[tokens.length - 1];
      const serieBase = tokens.slice(0, -1).join(' ').trim();
      const normalizedSerieBase = normalizeAcademicText(serieBase);
      const looksLikeTurmaSuffix = /^[IVXLCDM]{1,4}-[A-Z]$/i.test(turmaSuffix) || /^[A-Z]$/i.test(turmaSuffix);
      const looksLikeAcademicSerie = /\d/.test(serieBase)
        || normalizedSerieBase.includes('ano')
        || normalizedSerieBase.includes('serie');

      if (looksLikeTurmaSuffix && looksLikeAcademicSerie) {
        return {
          serie: serieBase,
          turma: turmaSuffix.toUpperCase()
        };
      }
    }

    return { serie: normalized, turma: '' };
  };

  const getReaderAcademicFields = (reader) => {
    const serieDireta = String(reader?.serie || reader?.nomeSerie || '').trim();
    const turmaDireta = String(reader?.turma || reader?.nomeTurma || '').trim();
    const parsedSerieDireta = serieDireta
      ? extractAcademicSeriesTurma(serieDireta)
      : { serie: '', turma: '' };
    const parsedSerieTemTurma = Boolean(parsedSerieDireta.turma);
    const turmaDiretaConfereComSerie = parsedSerieTemTurma
      && normalizeAcademicText(turmaDireta) === normalizeAcademicText(parsedSerieDireta.turma);

    if (serieDireta || turmaDireta) {
      return {
        serie: parsedSerieTemTurma && (!turmaDireta || turmaDiretaConfereComSerie)
          ? parsedSerieDireta.serie
          : serieDireta,
        turma: turmaDireta || parsedSerieDireta.turma || ''
      };
    }

    const combinedField = String(
      reader?.anoSerieTurma
      || reader?.serieTurma
      || reader?.turmaSerie
      || reader?.serie_turma
      || ''
    ).trim();

    return extractAcademicSeriesTurma(combinedField);
  };

  const isReaderAcademicStudent = (reader) => {
    const tipoNormalizado = normalizeAcademicText(reader?.tipo);
    const categoriaNormalizada = normalizeAcademicText(reader?.categoria);
    const academicFields = getReaderAcademicFields(reader);

    const hasAcademicLink = Boolean(
      String(reader?.turmaId || '').trim()
      || String(reader?.serieId || '').trim()
      || String(academicFields.serie || '').trim()
      || String(academicFields.turma || '').trim()
    );

    const nonStudentProfiles = new Set([
      'professor',
      'funcionario',
      'funcionario administrativo',
      'bibliotecario',
      'bibliotecario(a)',
      'coordenador',
      'diretor',
      'gestor',
      'servidor',
      'admin',
      'administrador',
      'comunidade'
    ]);

    if (tipoNormalizado === 'aluno' || categoriaNormalizada === 'estudante') {
      return true;
    }

    if (tipoNormalizado === 'leitor') {
      return hasAcademicLink;
    }

    if (hasAcademicLink) {
      return !nonStudentProfiles.has(tipoNormalizado) && !nonStudentProfiles.has(categoriaNormalizada);
    }

    return false;
  };

  const normalizeAllInstitutionData = (data = {}, fallbackInstitutionId = null) => {
    const fallbackId = normalizeInstitutionId(fallbackInstitutionId);
    const clientesLegacy = Array.isArray(data.clientes)
      ? data.clientes
      : Array.isArray(data.leitores)
        ? data.leitores
        : [];

    return {
      ...data,
      usuarios: normalizeCollectionInstitutionIds(data.usuarios, fallbackId).map((user) => {
        if (!user || user.perfil === 'SuperAdmin') {
          return user;
        }

        const institutionRaw = getItemInstitutionRaw(user);
        const institutionId = resolveInstitutionId(institutionRaw, fallbackId);
        const normalizedCurrent = normalizeInstitutionId(institutionRaw);

        if (institutionId === null || normalizedCurrent === institutionId) {
          return user;
        }

        return {
          ...user,
          instituicaoId: institutionId
        };
      }),
      livros: normalizeCollectionInstitutionIds(data.livros, fallbackId),
      patrimonio: normalizeCollectionInstitutionIds(data.patrimonio, fallbackId),
      clientes: normalizeCollectionInstitutionIds(clientesLegacy, fallbackId),
      seriesAcademicas: normalizeCollectionInstitutionIds(data.seriesAcademicas, fallbackId),
      turmasAcademicas: normalizeCollectionInstitutionIds(data.turmasAcademicas, fallbackId),
      emprestimos: normalizeCollectionInstitutionIds(data.emprestimos, fallbackId),
      notasFiscais: normalizeCollectionInstitutionIds(data.notasFiscais, fallbackId)
    };
  };

  const unwrapDataSnapshot = (parsedSnapshot) => {
    if (!parsedSnapshot || typeof parsedSnapshot !== 'object') {
      return null;
    }

    if (typeof parsedSnapshot.data === 'string') {
      try {
        return JSON.parse(parsedSnapshot.data);
      } catch (_error) {
        return null;
      }
    }

    if (
      parsedSnapshot.data &&
      typeof parsedSnapshot.data === 'object' &&
      (parsedSnapshot.version || parsedSnapshot.exportDate || parsedSnapshot.checksum)
    ) {
      return parsedSnapshot.data;
    }

    return parsedSnapshot;
  };

  const parseDataSnapshot = (rawSnapshot) => {
    if (!rawSnapshot) {
      return null;
    }

    try {
      const parsedSnapshot = JSON.parse(rawSnapshot);
      return unwrapDataSnapshot(parsedSnapshot);
    } catch (_error) {
      return null;
    }
  };

  const getInstitutionAliasIdsFromData = (data = {}, targetInstitutionId) => {
    const targetId = normalizeInstitutionId(targetInstitutionId);
    if (targetId === null) {
      return [];
    }

    const institutions = Array.isArray(data.instituicoes) ? data.instituicoes : [];
    const targetInstitution = institutions.find(
      (institution) => normalizeInstitutionId(institution?.id) === targetId
    );

    if (!targetInstitution) {
      return [targetId];
    }

    const targetName = normalizeInstitutionText(targetInstitution.nomeInstituicao);
    const targetDocument = normalizeInstitutionDocument(targetInstitution.cnpj);
    const aliasIds = new Set([targetId]);

    institutions.forEach((institution) => {
      const institutionId = normalizeInstitutionId(institution?.id);
      if (institutionId === null || institutionId === 0) {
        return;
      }

      const sameName =
        targetName &&
        normalizeInstitutionText(institution?.nomeInstituicao) === targetName;
      const sameDocument =
        targetDocument &&
        normalizeInstitutionDocument(institution?.cnpj) === targetDocument;

      if (sameName || sameDocument) {
        aliasIds.add(institutionId);
      }
    });

    return Array.from(aliasIds);
  };

  const countReadersForInstitutionInData = (data = {}, targetInstitutionId) => {
    const readers = Array.isArray(data.clientes)
      ? data.clientes
      : Array.isArray(data.leitores)
        ? data.leitores
        : [];

    if (readers.length === 0) {
      return 0;
    }

    const targetId = normalizeInstitutionId(targetInstitutionId);
    if (targetId === null) {
      return readers.length;
    }

    const aliasIds = getInstitutionAliasIdsFromData(data, targetId);
    const aliasSet = new Set(aliasIds);
    const fallbackInstitutionId = aliasIds.length === 1 ? aliasIds[0] : null;

    return readers.filter((reader) => {
      const institutionId = resolveInstitutionId(getItemInstitutionRaw(reader), fallbackInstitutionId);
      return institutionId !== null && aliasSet.has(institutionId);
    }).length;
  };

  const countStudentsForInstitutionInData = (data = {}, targetInstitutionId) => {
    const readers = Array.isArray(data.clientes)
      ? data.clientes
      : Array.isArray(data.leitores)
        ? data.leitores
        : [];

    if (readers.length === 0) {
      return 0;
    }

    const targetId = normalizeInstitutionId(targetInstitutionId);
    const aliasIds = targetId === null
      ? []
      : getInstitutionAliasIdsFromData(data, targetId);
    const aliasSet = new Set(aliasIds);
    const fallbackInstitutionId = aliasIds.length === 1 ? aliasIds[0] : null;

    return readers.filter((reader) => {
      const isAluno = String(reader?.tipo || '').trim().toLowerCase() === 'aluno';
      if (!isAluno) {
        return false;
      }

      if (targetId === null) {
        return true;
      }

      const institutionId = resolveInstitutionId(getItemInstitutionRaw(reader), fallbackInstitutionId);
      return institutionId !== null && aliasSet.has(institutionId);
    }).length;
  };

  const getReadersCollection = (data = {}) => {
    if (Array.isArray(data.clientes)) {
      return data.clientes;
    }

    if (Array.isArray(data.leitores)) {
      return data.leitores;
    }

    return [];
  };

  const mergeCollectionsPreservingCurrent = (currentItems = [], recoveredItems = []) => {
    const currentList = Array.isArray(currentItems) ? currentItems : [];
    const recoveredList = Array.isArray(recoveredItems) ? recoveredItems : [];

    const currentIds = new Set(
      currentList
        .map((item) => item?.id)
        .filter((id) => id !== undefined && id !== null && id !== '')
        .map((id) => String(id))
    );

    const recoveredMissing = recoveredList.filter((item) => {
      const itemId = item?.id;

      if (itemId === undefined || itemId === null || itemId === '') {
        return true;
      }

      return !currentIds.has(String(itemId));
    });

    return [...currentList, ...recoveredMissing];
  };

  const parseStorageArray = (storageKey) => {
    try {
      const rawSnapshot = localStorage.getItem(storageKey);
      if (!rawSnapshot) {
        return [];
      }

      const parsedSnapshot = JSON.parse(rawSnapshot);
      return Array.isArray(parsedSnapshot) ? parsedSnapshot : [];
    } catch (_error) {
      return [];
    }
  };

  const buildReaderIdentityKey = (reader) => {
    if (!reader || typeof reader !== 'object') {
      return '';
    }

    const nome = normalizeInstitutionText(reader?.nome || reader?.nomeCompleto || '');
    const matricula = normalizeInstitutionText(reader?.matricula || '');
    const cpf = String(reader?.cpf || '').replace(/\D/g, '');
    const nascimento = String(reader?.dataNascimento || reader?.nascimento || '').trim();

    if (!nome && !matricula && !cpf) {
      return '';
    }

    return `${nome}|${matricula}|${cpf}|${nascimento}`;
  };

  const buildTurmaIdentityKey = (turma) => {
    if (!turma || typeof turma !== 'object') {
      return '';
    }

    const nomeTurma = normalizeInstitutionText(turma?.nomeTurma || turma?.nome || turma?.turma || '');
    const nomeSerie = normalizeInstitutionText(turma?.nomeSerie || turma?.serie || '');
    const anoLetivo = String(turma?.anoLetivo || turma?.ano || '').trim();

    if (!nomeTurma) {
      return '';
    }

    return `${nomeSerie}|${nomeTurma}|${anoLetivo}`;
  };

  const mergeReadersPreservingCurrent = (currentReaders = [], recoveredReaders = []) => {
    const currentList = Array.isArray(currentReaders) ? currentReaders : [];
    const recoveredList = Array.isArray(recoveredReaders) ? recoveredReaders : [];

    const merged = [...currentList];
    const idSet = new Set(
      currentList
        .map((item) => item?.id)
        .filter((id) => id !== undefined && id !== null && id !== '')
        .map((id) => String(id))
    );
    const identitySet = new Set(
      currentList
        .map((item) => buildReaderIdentityKey(item))
        .filter(Boolean)
    );

    recoveredList.forEach((item) => {
      if (!item || typeof item !== 'object') {
        return;
      }

      const itemId = item?.id;
      const itemIdKey = itemId !== undefined && itemId !== null && itemId !== ''
        ? String(itemId)
        : '';
      const identityKey = buildReaderIdentityKey(item);

      if ((itemIdKey && idSet.has(itemIdKey)) || (identityKey && identitySet.has(identityKey))) {
        return;
      }

      merged.push(item);

      if (itemIdKey) {
        idSet.add(itemIdKey);
      }

      if (identityKey) {
        identitySet.add(identityKey);
      }
    });

    return merged;
  };

  const mergeTurmasPreservingCurrent = (currentTurmas = [], recoveredTurmas = []) => {
    const currentList = Array.isArray(currentTurmas) ? currentTurmas : [];
    const recoveredList = Array.isArray(recoveredTurmas) ? recoveredTurmas : [];

    const merged = [...currentList];
    const idSet = new Set(
      currentList
        .map((item) => item?.id)
        .filter((id) => id !== undefined && id !== null && id !== '')
        .map((id) => String(id))
    );
    const identitySet = new Set(
      currentList
        .map((item) => buildTurmaIdentityKey(item))
        .filter(Boolean)
    );

    recoveredList.forEach((item) => {
      if (!item || typeof item !== 'object') {
        return;
      }

      const itemId = item?.id;
      const itemIdKey = itemId !== undefined && itemId !== null && itemId !== ''
        ? String(itemId)
        : '';
      const identityKey = buildTurmaIdentityKey(item);

      if ((itemIdKey && idSet.has(itemIdKey)) || (identityKey && identitySet.has(identityKey))) {
        return;
      }

      merged.push(item);

      if (itemIdKey) {
        idSet.add(itemIdKey);
      }

      if (identityKey) {
        identitySet.add(identityKey);
      }
    });

    return merged;
  };

  const normalizeLegacyAcademicStorage = (fallbackInstitutionId = null) => {
    const legacyTurmasRaw = parseStorageArray(LEGACY_TURMAS_KEY);
    const legacyClientesRaw = parseStorageArray(LEGACY_CLIENTES_KEY);

    if (legacyTurmasRaw.length === 0 && legacyClientesRaw.length === 0) {
      return { turmas: [], clientes: [] };
    }

    const fallbackId = normalizeInstitutionId(fallbackInstitutionId);
    const defaultSchoolYear = String(new Date().getFullYear());
    const turmasBySourceId = new Map();

    const turmas = legacyTurmasRaw
      .map((turmaRaw, index) => {
        if (!turmaRaw || typeof turmaRaw !== 'object') {
          return null;
        }

        const nomeTurma = String(turmaRaw?.nomeTurma || turmaRaw?.nome || turmaRaw?.turma || '').trim();
        if (!nomeTurma) {
          return null;
        }

        const nomeSerie = String(
          turmaRaw?.nomeSerie
          || turmaRaw?.serie
          || turmaRaw?.anoSerie
          || turmaRaw?.serieNome
          || ''
        ).trim();

        const resolvedInstitutionId = resolveInstitutionId(getItemInstitutionRaw(turmaRaw), fallbackId);
        const originalId = turmaRaw?.id;
        const turmaId = originalId !== undefined && originalId !== null && originalId !== ''
          ? originalId
          : `legacy-turma-${index + 1}`;

        const normalizedTurma = {
          ...turmaRaw,
          id: turmaId,
          nomeTurma,
          nomeSerie,
          anoLetivo: String(turmaRaw?.anoLetivo || turmaRaw?.ano || defaultSchoolYear).trim(),
          instituicaoId: resolvedInstitutionId ?? fallbackId ?? 0,
          ativo: turmaRaw?.ativo !== false && normalizeInstitutionText(turmaRaw?.status) !== 'inativo'
        };

        const sourceId = String(originalId || '').trim();
        if (sourceId) {
          turmasBySourceId.set(sourceId, normalizedTurma);
        }

        return normalizedTurma;
      })
      .filter(Boolean);

    const clientes = legacyClientesRaw
      .map((clienteRaw, index) => {
        if (!clienteRaw || typeof clienteRaw !== 'object') {
          return null;
        }

        const sourceTurmaId = String(clienteRaw?.turmaId || clienteRaw?.turma_id || '').trim();
        const turmaAssociada = sourceTurmaId ? turmasBySourceId.get(sourceTurmaId) : null;

        const turmaNome = String(
          clienteRaw?.turma
          || clienteRaw?.nomeTurma
          || turmaAssociada?.nomeTurma
          || turmaAssociada?.nome
          || ''
        ).trim();

        const serieNome = String(
          clienteRaw?.serie
          || clienteRaw?.nomeSerie
          || turmaAssociada?.nomeSerie
          || turmaAssociada?.serie
          || ''
        ).trim();

        const resolvedInstitutionId = resolveInstitutionId(
          getItemInstitutionRaw(clienteRaw),
          resolveInstitutionId(getItemInstitutionRaw(turmaAssociada), fallbackId)
        );

        const hasAcademicLink = Boolean(
          sourceTurmaId
          || String(clienteRaw?.serieId || '').trim()
          || turmaNome
          || serieNome
        );

        const tipoBase = String(clienteRaw?.tipo || '').trim().toLowerCase();
        const tipoNormalizado = tipoBase === 'leitor' && hasAcademicLink
          ? 'aluno'
          : (String(clienteRaw?.tipo || '').trim() || (hasAcademicLink ? 'aluno' : 'leitor'));

        const originalId = clienteRaw?.id;
        const clienteId = originalId !== undefined && originalId !== null && originalId !== ''
          ? originalId
          : `legacy-cliente-${index + 1}`;

        return {
          ...clienteRaw,
          id: clienteId,
          tipo: tipoNormalizado,
          categoria: clienteRaw?.categoria || (tipoNormalizado === 'aluno' ? 'estudante' : ''),
          instituicaoId: resolvedInstitutionId ?? fallbackId ?? 0,
          turmaId: turmaAssociada?.id ?? (sourceTurmaId || clienteRaw?.turmaId || ''),
          turma: turmaNome,
          nomeTurma: turmaNome,
          serie: serieNome,
          nomeSerie: serieNome,
          ativo: clienteRaw?.ativo !== false && normalizeInstitutionText(clienteRaw?.status) !== 'inativo'
        };
      })
      .filter(Boolean);

    return { turmas, clientes };
  };

  const mergeLegacyStandaloneAcademicStorage = (currentData = {}, fallbackInstitutionId = null) => {
    const currentReaders = getReadersCollection(currentData);
    const currentTurmas = Array.isArray(currentData.turmasAcademicas) ? currentData.turmasAcademicas : [];
    const { turmas: legacyTurmas, clientes: legacyClientes } = normalizeLegacyAcademicStorage(fallbackInstitutionId);

    if (legacyTurmas.length === 0 && legacyClientes.length === 0) {
      return { data: currentData, merged: false, stats: null };
    }

    const mergedReaders = mergeReadersPreservingCurrent(currentReaders, legacyClientes);
    const mergedTurmas = mergeTurmasPreservingCurrent(currentTurmas, legacyTurmas);

    const readersImproved = mergedReaders.length > currentReaders.length;
    const turmasImproved = mergedTurmas.length > currentTurmas.length;

    const stats = {
      legacyReaders: legacyClientes.length,
      legacyTurmas: legacyTurmas.length,
      mergedReaders: mergedReaders.length,
      mergedTurmas: mergedTurmas.length
    };

    if (!readersImproved && !turmasImproved) {
      return { data: currentData, merged: false, stats };
    }

    const mergedData = {
      ...currentData,
      clientes: mergedReaders,
      leitores: mergedReaders,
      turmasAcademicas: mergedTurmas
    };

    const institutionHint = resolveInstitutionId(
      localStorage.getItem('cei_instituicao_ativa'),
      resolveInstitutionId(fallbackInstitutionId, inferFallbackInstitutionId(mergedData))
    );

    const currentSnapshot = normalizeAllInstitutionData(
      {
        ...currentData,
        clientes: currentReaders,
        turmasAcademicas: currentTurmas
      },
      fallbackInstitutionId
    );

    const mergedSnapshot = normalizeAllInstitutionData(mergedData, fallbackInstitutionId);

    const currentStudents = countStudentsForInstitutionInData(currentSnapshot, institutionHint);
    const mergedStudents = countStudentsForInstitutionInData(mergedSnapshot, institutionHint);

    const shouldApplyMerge =
      mergedStudents >= currentStudents
      || currentReaders.length === 0
      || currentTurmas.length === 0
      || localStorage.getItem(LEGACY_STORAGE_MIGRATION_KEY) !== 'true';

    if (!shouldApplyMerge) {
      return { data: currentData, merged: false, stats };
    }

    localStorage.setItem(LEGACY_STORAGE_MIGRATION_KEY, 'true');

    return {
      data: mergedData,
      merged: true,
      stats: {
        ...stats,
        currentStudents,
        mergedStudents
      }
    };
  };

  const mergeRecoveredReadersIntoCurrentData = (currentData = {}, recoveredData = {}) => {
    const recoveredReaders = getReadersCollection(recoveredData);
    const mergedSeries = mergeCollectionsPreservingCurrent(
      currentData.seriesAcademicas,
      recoveredData.seriesAcademicas
    );
    const mergedTurmas = mergeCollectionsPreservingCurrent(
      currentData.turmasAcademicas,
      recoveredData.turmasAcademicas
    );

    if (!Array.isArray(recoveredReaders) || recoveredReaders.length === 0) {
      return {
        ...currentData,
        seriesAcademicas: mergedSeries,
        turmasAcademicas: mergedTurmas
      };
    }

    return {
      ...currentData,
      clientes: recoveredReaders,
      leitores: recoveredReaders,
      seriesAcademicas: mergedSeries,
      turmasAcademicas: mergedTurmas
    };
  };

  const mergeRecoveredAcademicIntoCurrentData = (currentData = {}, recoveredData = {}) => {
    const mergedSeries = mergeCollectionsPreservingCurrent(
      currentData.seriesAcademicas,
      recoveredData.seriesAcademicas
    );
    const mergedTurmas = mergeCollectionsPreservingCurrent(
      currentData.turmasAcademicas,
      recoveredData.turmasAcademicas
    );

    return {
      ...currentData,
      seriesAcademicas: mergedSeries,
      turmasAcademicas: mergedTurmas
    };
  };

  const countAcademicStructuresForInstitutionInData = (data = {}, targetInstitutionId) => {
    const series = Array.isArray(data.seriesAcademicas) ? data.seriesAcademicas : [];
    const turmas = Array.isArray(data.turmasAcademicas) ? data.turmasAcademicas : [];

    const targetId = normalizeInstitutionId(targetInstitutionId);
    if (targetId === null) {
      return {
        seriesCount: series.length,
        turmasCount: turmas.length,
        score: (turmas.length * 1000) + series.length
      };
    }

    const aliasIds = getInstitutionAliasIdsFromData(data, targetId);
    const aliasSet = new Set(aliasIds);
    const fallbackInstitutionId = aliasIds.length === 1 ? aliasIds[0] : null;

    const belongsToTargetInstitution = (item) => {
      const institutionId = resolveInstitutionId(getItemInstitutionRaw(item), fallbackInstitutionId);
      return institutionId !== null && aliasSet.has(institutionId);
    };

    const seriesCount = series.filter(belongsToTargetInstitution).length;
    const turmasCount = turmas.filter(belongsToTargetInstitution).length;

    return {
      seriesCount,
      turmasCount,
      score: (turmasCount * 1000) + seriesCount
    };
  };

  const chooseBestAcademicStructureSnapshot = (currentData, targetInstitutionId) => {
    const candidates = buildRecoverySnapshotCandidates(currentData);

    const evaluate = (snapshotData) => {
      const fallbackInstitutionId = inferFallbackInstitutionId(snapshotData);
      const normalizedData = normalizeAllInstitutionData(snapshotData, fallbackInstitutionId);
      const academicStats = countAcademicStructuresForInstitutionInData(normalizedData, targetInstitutionId);

      return {
        ...academicStats,
        normalizedData
      };
    };

    const currentStats = evaluate(currentData);
    let bestCandidate = {
      source: 'cei_data',
      data: currentStats.normalizedData,
      stats: currentStats
    };

    candidates.forEach((candidate) => {
      if (!candidate?.data) {
        return;
      }

      const stats = evaluate(candidate.data);
      if (stats.score > bestCandidate.stats.score) {
        bestCandidate = {
          source: candidate.source,
          data: stats.normalizedData,
          stats
        };
      }
    });

    const improvedTurmas = bestCandidate.stats.turmasCount > currentStats.turmasCount;
    const improvedSeries = bestCandidate.stats.seriesCount > currentStats.seriesCount;

    if ((improvedTurmas || improvedSeries) && bestCandidate.source !== 'cei_data') {
      return bestCandidate;
    }

    return null;
  };

  const rebuildAcademicStructuresFromReaders = (data = {}, fallbackInstitutionId = null) => {
    const readers = getReadersCollection(data);
    if (!Array.isArray(readers) || readers.length === 0) {
      return data;
    }

    const seriesList = Array.isArray(data.seriesAcademicas) ? [...data.seriesAcademicas] : [];
    const turmasList = Array.isArray(data.turmasAcademicas) ? [...data.turmasAcademicas] : [];

    const usedIds = new Set();
    [seriesList, turmasList, readers].forEach((list) => {
      list.forEach((item) => {
        const numericId = Number(item?.id);
        if (Number.isFinite(numericId) && numericId > 0) {
          usedIds.add(numericId);
        }
      });
    });

    let generatedCounter = 0;
    const generateUniqueId = () => {
      let candidateId;

      do {
        generatedCounter += 1;
        const suffix = String(generatedCounter % 1000).padStart(3, '0');
        candidateId = Number(`${Date.now()}${suffix}`);
      } while (usedIds.has(candidateId));

      usedIds.add(candidateId);
      return candidateId;
    };

    const buildSeriesKey = (institutionId, seriesName, schoolYear) => {
      const normalizedInstitutionId = normalizeInstitutionId(institutionId);
      const normalizedName = normalizeInstitutionText(seriesName);
      const normalizedSchoolYear = String(schoolYear || '').trim();
      return `${normalizedInstitutionId ?? 'null'}|${normalizedName}|${normalizedSchoolYear}`;
    };

    const buildTurmaKey = (institutionId, seriesId, turmaName, schoolYear) => {
      const normalizedInstitutionId = normalizeInstitutionId(institutionId);
      const normalizedTurmaName = normalizeInstitutionText(turmaName);
      const normalizedSchoolYear = String(schoolYear || '').trim();
      return `${normalizedInstitutionId ?? 'null'}|${String(seriesId || '')}|${normalizedTurmaName}|${normalizedSchoolYear}`;
    };

    const seriesById = new Map();
    const seriesByKey = new Map();

    seriesList.forEach((seriesItem) => {
      const seriesId = seriesItem?.id;
      if (seriesId !== undefined && seriesId !== null && seriesId !== '') {
        seriesById.set(String(seriesId), seriesItem);
      }

      const key = buildSeriesKey(
        getItemInstitutionRaw(seriesItem),
        seriesItem?.nomeSerie,
        seriesItem?.anoLetivo
      );

      seriesByKey.set(key, seriesItem);
    });

    const turmasById = new Map();
    const turmasByKey = new Map();

    turmasList.forEach((turmaItem) => {
      const turmaId = turmaItem?.id;
      if (turmaId !== undefined && turmaId !== null && turmaId !== '') {
        turmasById.set(String(turmaId), turmaItem);
      }

      const key = buildTurmaKey(
        getItemInstitutionRaw(turmaItem),
        turmaItem?.serieId,
        turmaItem?.nomeTurma,
        turmaItem?.anoLetivo
      );

      turmasByKey.set(key, turmaItem);
    });

    const nowIso = new Date().toISOString();
    const defaultSchoolYear = String(new Date().getFullYear());
    let hasReaderUpdates = false;

    const updatedReaders = readers.map((reader) => {
      const isStudent = isReaderAcademicStudent(reader);
      if (!isStudent) {
        return reader;
      }

      const institutionId = resolveInstitutionId(getItemInstitutionRaw(reader), fallbackInstitutionId);
      const academicFields = getReaderAcademicFields(reader);
      const seriesName = String(academicFields.serie || '').trim();
      const turmaName = String(academicFields.turma || '').trim();
      const schoolYear = String(reader?.anoLetivo || defaultSchoolYear).trim();

      let seriesRecord = null;
      let turmaRecord = null;
      let readerChanged = false;

      const currentSeriesId =
        reader?.serieId !== undefined && reader?.serieId !== null && reader?.serieId !== ''
          ? String(reader.serieId)
          : '';

      if (currentSeriesId && seriesById.has(currentSeriesId)) {
        seriesRecord = seriesById.get(currentSeriesId);
      }

      if (!seriesRecord && seriesName) {
        const seriesKey = buildSeriesKey(institutionId, seriesName, schoolYear);
        seriesRecord = seriesByKey.get(seriesKey) || null;
      }

      if (!seriesRecord && seriesName) {
        const newSeries = {
          id: generateUniqueId(),
          instituicaoId: institutionId ?? 0,
          nomeSerie: seriesName,
          anoLetivo: schoolYear,
          descricao: '',
          ativo: true,
          dataCadastro: nowIso
        };

        seriesList.push(newSeries);
        seriesById.set(String(newSeries.id), newSeries);
        seriesByKey.set(buildSeriesKey(institutionId, newSeries.nomeSerie, newSeries.anoLetivo), newSeries);
        seriesRecord = newSeries;
      }

      const currentTurmaId =
        reader?.turmaId !== undefined && reader?.turmaId !== null && reader?.turmaId !== ''
          ? String(reader.turmaId)
          : '';

      if (currentTurmaId && turmasById.has(currentTurmaId)) {
        turmaRecord = turmasById.get(currentTurmaId);
      }

      if (!turmaRecord && turmaName) {
        const turmaKey = buildTurmaKey(
          institutionId,
          seriesRecord?.id || '',
          turmaName,
          schoolYear
        );

        turmaRecord = turmasByKey.get(turmaKey) || null;
      }

      if (!turmaRecord && turmaName) {
        const newTurma = {
          id: generateUniqueId(),
          instituicaoId: institutionId ?? 0,
          serieId: seriesRecord?.id || null,
          nomeSerie: seriesRecord?.nomeSerie || seriesName || '',
          nomeTurma: turmaName,
          anoLetivo: schoolYear,
          turno: '',
          ativo: true,
          dataCadastro: nowIso
        };

        turmasList.push(newTurma);
        turmasById.set(String(newTurma.id), newTurma);
        turmasByKey.set(
          buildTurmaKey(institutionId, newTurma.serieId, newTurma.nomeTurma, newTurma.anoLetivo),
          newTurma
        );
        turmaRecord = newTurma;
      }

      const nextSeriesId = seriesRecord ? String(seriesRecord.id) : '';
      const nextTurmaId = turmaRecord ? String(turmaRecord.id) : '';
      const nextSeriesName = seriesRecord?.nomeSerie || seriesName;
      const nextTurmaName = turmaRecord?.nomeTurma || turmaName;
      const currentSeriesName = String(reader?.serie || '').trim();
      const currentSeriesLabel = String(reader?.nomeSerie || '').trim();
      const currentTurmaName = String(reader?.turma || '').trim();
      const currentTurmaLabel = String(reader?.nomeTurma || '').trim();
      const currentCombinedAcademic = String(
        reader?.anoSerieTurma
        || reader?.serieTurma
        || reader?.turmaSerie
        || reader?.serie_turma
        || ''
      ).trim();
      const nextCombinedAcademic = nextTurmaName ? `${nextSeriesName} - ${nextTurmaName}` : nextSeriesName;
      const nextTipo = normalizeAcademicText(reader?.tipo) === 'aluno'
        ? String(reader?.tipo || '').trim() || 'aluno'
        : 'aluno';
      const nextCategoria = String(reader?.categoria || '').trim() || 'estudante';

      if (nextSeriesId && currentSeriesId !== nextSeriesId) {
        readerChanged = true;
      }

      if (nextTurmaId && currentTurmaId !== nextTurmaId) {
        readerChanged = true;
      }

      if (nextSeriesName && (currentSeriesName !== nextSeriesName || currentSeriesLabel !== nextSeriesName)) {
        readerChanged = true;
      }

      if (nextTurmaName && (currentTurmaName !== nextTurmaName || currentTurmaLabel !== nextTurmaName)) {
        readerChanged = true;
      }

      if (nextCombinedAcademic && !currentCombinedAcademic) {
        readerChanged = true;
      }

      if (String(reader?.tipo || '').trim() !== nextTipo) {
        readerChanged = true;
      }

      if (String(reader?.categoria || '').trim() !== nextCategoria) {
        readerChanged = true;
      }

      if (!readerChanged) {
        return reader;
      }

      hasReaderUpdates = true;

      return {
        ...reader,
        tipo: nextTipo,
        categoria: nextCategoria,
        serie: nextSeriesName,
        nomeSerie: nextSeriesName,
        serieId: nextSeriesId,
        turma: nextTurmaName,
        nomeTurma: nextTurmaName,
        turmaId: nextTurmaId,
        anoSerieTurma: currentCombinedAcademic || nextCombinedAcademic
      };
    });

    const seriesChanged = seriesList.length !== (Array.isArray(data.seriesAcademicas) ? data.seriesAcademicas.length : 0);
    const turmasChanged = turmasList.length !== (Array.isArray(data.turmasAcademicas) ? data.turmasAcademicas.length : 0);

    if (!hasReaderUpdates && !seriesChanged && !turmasChanged) {
      return data;
    }

    return {
      ...data,
      clientes: updatedReaders,
      leitores: updatedReaders,
      seriesAcademicas: seriesList,
      turmasAcademicas: turmasList
    };
  };

  const buildRecoverySnapshotCandidates = (currentData) => {
    const candidates = [{ source: 'cei_data', data: currentData }];

    const pushCandidate = (source, rawSnapshot) => {
      const parsed = parseDataSnapshot(rawSnapshot);
      if (!parsed) {
        return;
      }

      candidates.push({ source, data: parsed });
    };

    pushCandidate('cei_data_backup', localStorage.getItem('cei_data_backup'));
    pushCandidate('cei_data_emergency', localStorage.getItem('cei_data_emergency'));

    const versionBackupKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith('cei_backup_v'))
      .sort()
      .reverse()
      .slice(0, 20);

    const importBackupKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith('cei_data_backup_import_'))
      .sort()
      .reverse()
      .slice(0, 20);

    versionBackupKeys.forEach((key) => {
      pushCandidate(key, localStorage.getItem(key));
    });

    importBackupKeys.forEach((key) => {
      pushCandidate(key, localStorage.getItem(key));
    });

    return candidates;
  };

  const chooseBestRecoverySnapshot = (currentData, targetInstitutionId) => {
    const candidates = buildRecoverySnapshotCandidates(currentData);

    const evaluate = (snapshotData) => {
      const fallbackInstitutionId = inferFallbackInstitutionId(snapshotData);
      const normalizedData = normalizeAllInstitutionData(snapshotData, fallbackInstitutionId);
      const readersCount = countReadersForInstitutionInData(normalizedData, targetInstitutionId);
      const studentsCount = countStudentsForInstitutionInData(normalizedData, targetInstitutionId);

      return {
        readersCount,
        studentsCount,
        score: (studentsCount * 1000) + readersCount,
        normalizedData
      };
    };

    const currentStats = evaluate(currentData);
    let bestCandidate = {
      source: 'cei_data',
      data: currentStats.normalizedData,
      stats: currentStats
    };

    candidates.forEach((candidate) => {
      if (!candidate?.data) {
        return;
      }

      const stats = evaluate(candidate.data);
      if (stats.score > bestCandidate.stats.score) {
        bestCandidate = {
          source: candidate.source,
          data: stats.normalizedData,
          stats
        };
      }
    });

    const improvedStudents = bestCandidate.stats.studentsCount > currentStats.studentsCount;
    const improvedReaders = bestCandidate.stats.readersCount >= currentStats.readersCount + 5;

    if ((improvedStudents || improvedReaders) && bestCandidate.source !== 'cei_data') {
      return bestCandidate;
    }

    return null;
  };

  const gerarIdUnico = () => {
    const sufixo = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const candidate = Number(`${Date.now()}${sufixo}`);
    return Number.isSafeInteger(candidate) ? candidate : Date.now();
  };

  const gerarIdUnicoComSet = (usedIdsSet) => {
    let novoId = gerarIdUnico();
    while (usedIdsSet.has(novoId)) {
      novoId = gerarIdUnico();
    }
    usedIdsSet.add(novoId);
    return novoId;
  };

  const migrarIdsLegados = (dadosOriginais) => {
    if (!dadosOriginais || localStorage.getItem(GLOBAL_IDS_MIGRATION_KEY) === 'true') {
      return dadosOriginais;
    }

    const dados = {
      ...dadosOriginais,
      usuarios: [...(dadosOriginais.usuarios || [])],
      livros: [...(dadosOriginais.livros || [])],
      clientes: [...(dadosOriginais.clientes || dadosOriginais.leitores || [])],
      patrimonio: [...(dadosOriginais.patrimonio || [])],
      emprestimos: [...(dadosOriginais.emprestimos || [])]
    };

    const usedIds = new Set();
    [dados.usuarios, dados.livros, dados.clientes, dados.patrimonio, dados.emprestimos].forEach((lista) => {
      (lista || []).forEach((item) => {
        if (item?.id !== undefined && item?.id !== null) {
          usedIds.add(Number(item.id));
        }
      });
    });

    const livroIdMap = new Map();
    const clienteIdMap = new Map();

    const isLegacy = (id) => {
      const numericId = Number(id);
      return Number.isFinite(numericId) && numericId > 0 && numericId < 1000000000000;
    };

    dados.livros = dados.livros.map((livro) => {
      if (!isLegacy(livro.id)) return livro;
      const novoId = gerarIdUnicoComSet(usedIds);
      livroIdMap.set(Number(livro.id), novoId);
      return { ...livro, id: novoId };
    });

    dados.clientes = dados.clientes.map((cliente) => {
      if (!isLegacy(cliente.id)) return cliente;
      const novoId = gerarIdUnicoComSet(usedIds);
      clienteIdMap.set(Number(cliente.id), novoId);
      return { ...cliente, id: novoId };
    });

    dados.patrimonio = dados.patrimonio.map((bem) => {
      if (!isLegacy(bem.id)) return bem;
      const novoId = gerarIdUnicoComSet(usedIds);
      return { ...bem, id: novoId };
    });

    dados.emprestimos = dados.emprestimos.map((emprestimo) => {
      const novoEmprestimoId = isLegacy(emprestimo.id)
        ? gerarIdUnicoComSet(usedIds)
        : emprestimo.id;

      const livroIdAtualizado = livroIdMap.get(Number(emprestimo.livroId)) || emprestimo.livroId;
      const clienteIdAtualizado = clienteIdMap.get(Number(emprestimo.clienteId)) || emprestimo.clienteId;

      return {
        ...emprestimo,
        id: novoEmprestimoId,
        livroId: livroIdAtualizado,
        clienteId: clienteIdAtualizado
      };
    });

    dados.usuarios = dados.usuarios.map((usuario) => {
      if (usuario?.perfil === 'SuperAdmin') return usuario;
      if (!isLegacy(usuario?.id)) return usuario;

      const novoId = gerarIdUnicoComSet(usedIds);
      return { ...usuario, id: novoId };
    });

    localStorage.setItem(GLOBAL_IDS_MIGRATION_KEY, 'true');
    return dados;
  };

  const getItemTimestamp = (item) => {
    const timestamp = new Date(
      item?.dataAtualizacao ||
      item?.updated_at ||
      item?.dataCadastro ||
      item?.created_at ||
      0
    ).getTime();

    return Number.isFinite(timestamp) ? timestamp : 0;
  };

  const getMergeKeyById = (rawId) => {
    if (rawId === undefined || rawId === null || rawId === '') {
      return null;
    }

    const numericId = Number(rawId);
    if (Number.isFinite(numericId)) {
      return `n:${numericId}`;
    }

    return `s:${String(rawId).trim()}`;
  };

  const mergeByIdPreferLatest = (localItems = [], cloudItems = []) => {
    const mergedMap = new Map();

    localItems.forEach((item) => {
      const mergeKey = getMergeKeyById(item?.id);
      if (item && mergeKey) {
        mergedMap.set(mergeKey, item);
      }
    });

    cloudItems.forEach((cloudItem) => {
      const mergeKey = getMergeKeyById(cloudItem?.id);
      if (!cloudItem || !mergeKey) return;

      const localItem = mergedMap.get(mergeKey);
      if (!localItem) {
        mergedMap.set(mergeKey, cloudItem);
        return;
      }

      const localTs = getItemTimestamp(localItem);
      const cloudTs = getItemTimestamp(cloudItem);
      mergedMap.set(mergeKey, cloudTs > localTs ? cloudItem : localItem);
    });

    return Array.from(mergedMap.values());
  };

  const replaceInstitutionSlice = (allItems = [], institutionItems = [], targetInstitutionId) => {
    const otherItems = allItems.filter((item) => !belongsToInstitution(item, targetInstitutionId));
    return [...otherItems, ...institutionItems];
  };

  const getInstitutionSlices = (institutionId) => ({
    instituicoes: instituicoesRef.current.filter((item) => normalizeInstitutionId(item?.id) === normalizeInstitutionId(institutionId)),
    usuarios: usuariosRef.current.filter((item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true }) && item.perfil !== 'SuperAdmin'),
    livros: livrosRef.current.filter((item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true })),
    clientes: clientesRef.current.filter((item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true })),
    seriesAcademicas: seriesAcademicasRef.current.filter((item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true })),
    turmasAcademicas: turmasAcademicasRef.current.filter((item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true })),
    patrimonio: patrimonioRef.current.filter((item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true })),
    emprestimos: emprestimosRef.current.filter((item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true }))
  });

  const aplicarDadosNuvemNaInstituicao = (institutionId, cloudDataByType) => {
    const localSlices = getInstitutionSlices(institutionId);

    // Guard: if localStorage has more items than the stale in-memory refs for a data type,
    // use the localStorage items as local source. This protects against stale React state
    // after a direct localStorage import (e.g. bulk import script) being overwritten by
    // the 20-second periodic pull before React state is updated.
    try {
      const rawLocal = localStorage.getItem('cei_data');
      if (rawLocal) {
        const parsedLocal = JSON.parse(rawLocal);
        if (parsedLocal && typeof parsedLocal === 'object') {
          [...dataTypesSync, ...localAcademicDataTypes].forEach((dataType) => {
            const lsAll = parsedLocal[dataType];
            if (!Array.isArray(lsAll)) return;
            const lsForInstitution = lsAll.filter(
              (item) => belongsToInstitution(item, institutionId, { includeLegacyWithoutInstitution: true })
            );
            if (lsForInstitution.length > (localSlices[dataType] || []).length) {
              localSlices[dataType] = lsForInstitution;
            }
          });
        }
      }
    } catch (_e) { /* ignore localStorage read errors */ }

    const mergedData = {};
    dataTypesSync.forEach((dataType) => {
      const localList = localSlices[dataType] || [];
      const cloudList = cloudDataByType[dataType] || [];
      mergedData[dataType] = mergeByIdPreferLatest(localList, cloudList);
    });

    const mergedAcademicData = rebuildAcademicStructuresFromReaders(
      {
        instituicoes: mergedData.instituicoes || localSlices.instituicoes || [],
        clientes: mergedData.clientes || [],
        leitores: mergedData.clientes || [],
        seriesAcademicas: localSlices.seriesAcademicas || [],
        turmasAcademicas: localSlices.turmasAcademicas || []
      },
      institutionId
    );

    mergedData.clientes = Array.isArray(mergedAcademicData.clientes)
      ? mergedAcademicData.clientes
      : (mergedData.clientes || []);
    mergedData.leitores = mergedData.clientes;
    mergedData.seriesAcademicas = Array.isArray(mergedAcademicData.seriesAcademicas)
      ? mergedAcademicData.seriesAcademicas
      : (localSlices.seriesAcademicas || []);
    mergedData.turmasAcademicas = Array.isArray(mergedAcademicData.turmasAcademicas)
      ? mergedAcademicData.turmasAcademicas
      : (localSlices.turmasAcademicas || []);

    setInstituicoes((prev) => {
      const normalizedTargetInstitutionId = normalizeInstitutionId(institutionId);
      const outras = prev.filter(
        (item) => normalizeInstitutionId(item?.id) !== normalizedTargetInstitutionId
      );
      return [...outras, ...(mergedData.instituicoes || [])];
    });

    setUsuarios((prev) => {
      const preservados = prev.filter((item) => !belongsToInstitution(item, institutionId) || item.perfil === 'SuperAdmin');
      return [...preservados, ...(mergedData.usuarios || [])];
    });

    setLivros((prev) => replaceInstitutionSlice(prev, mergedData.livros, institutionId));
    setClientes((prev) => replaceInstitutionSlice(prev, mergedData.clientes, institutionId));
    setSeriesAcademicas((prev) => replaceInstitutionSlice(prev, mergedData.seriesAcademicas, institutionId));
    setTurmasAcademicas((prev) => replaceInstitutionSlice(prev, mergedData.turmasAcademicas, institutionId));
    setPatrimonio((prev) => replaceInstitutionSlice(prev, mergedData.patrimonio, institutionId));
    setEmprestimos((prev) => replaceInstitutionSlice(prev, mergedData.emprestimos, institutionId));

    return mergedData;
  };

  const baixarDadosNuvemInstituicao = async (institutionId) => {
    const cloudDataByType = {};

    for (const dataType of dataTypesSync) {
      const result = await syncFromCloud(dataType, institutionId);
      cloudDataByType[dataType] = result.success ? (result.data || []) : [];
    }

    return cloudDataByType;
  };

  const enviarDadosInstituicaoParaNuvem = async (institutionId, slices = null) => {
    if (!isCloudEnabled || !institutionId || institutionId === 0) return;
    if (cloudPushingRef.current) return;

    cloudPushingRef.current = true;
    try {
      const payload = slices || getInstitutionSlices(institutionId);

      for (const dataType of dataTypesSync) {
        await syncToCloud(dataType, payload[dataType] || [], institutionId);
      }

      localStorage.setItem('cei_last_sync', new Date().toISOString());
    } catch (error) {
      console.error('❌ Erro ao enviar dados da instituição para nuvem:', error);
    } finally {
      cloudPushingRef.current = false;
    }
  };

  const sincronizarInstituicaoComNuvem = async (institutionId, pushAfterMerge = false) => {
    if (!isCloudEnabled || !institutionId || institutionId === 0) return;
    if (cloudPullingRef.current) return;

    // Se uma importação em lote ocorreu nos últimos 15 segundos, bloquear o PULL
    // para evitar que os dados do Supabase (desatualizados) sobrescrevam o lote local.
    // O push de 1.5s (enviarDadosInstituicaoParaNuvem) se encarrega de subir os dados.
    const importFlagVal = localStorage.getItem('cei_lote_import_flag');
    const isRecentBatchImport = importFlagVal && (Date.now() - Number(importFlagVal)) < 15000;
    if (isRecentBatchImport && !pushAfterMerge) {
      console.log('⏳ [SYNC] Pull da nuvem ignorado - importação em lote recente em andamento');
      return;
    }

    cloudPullingRef.current = true;
    try {
      const cloudDataByType = await baixarDadosNuvemInstituicao(institutionId);
      const merged = aplicarDadosNuvemNaInstituicao(institutionId, cloudDataByType);

      if (pushAfterMerge) {
        await enviarDadosInstituicaoParaNuvem(institutionId, merged);
      } else {
        localStorage.setItem('cei_last_sync', new Date().toISOString());
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar instituição com nuvem:', error);
    } finally {
      cloudPullingRef.current = false;
    }
  };

  const rehidratarEstadoDoLocalStorageSeNecessario = () => {
    try {
      const rawSnapshot = localStorage.getItem('cei_data');
      if (!rawSnapshot) {
        return false;
      }

      const parsedSnapshot = JSON.parse(rawSnapshot);
      if (!parsedSnapshot || typeof parsedSnapshot !== 'object') {
        return false;
      }

      const fallbackInstitutionId = resolveInstitutionId(
        localStorage.getItem('cei_instituicao_ativa'),
        inferFallbackInstitutionId(parsedSnapshot)
      );

      const snapshotData = normalizeAllInstitutionData(parsedSnapshot, fallbackInstitutionId);
      const targetInstitutionId = resolveInstitutionId(instituicaoAtiva, fallbackInstitutionId);

      const currentData = {
        instituicoes,
        usuarios,
        livros,
        patrimonio,
        clientes,
        seriesAcademicas,
        turmasAcademicas,
        emprestimos,
        planos,
        notasFiscais,
        logAtividades
      };

      const snapshotReaders = countReadersForInstitutionInData(snapshotData, targetInstitutionId);
      const currentReaders = countReadersForInstitutionInData(currentData, targetInstitutionId);
      const snapshotStudents = countStudentsForInstitutionInData(snapshotData, targetInstitutionId);
      const currentStudents = countStudentsForInstitutionInData(currentData, targetInstitutionId);

      const shouldHydrateSnapshot =
        snapshotStudents > currentStudents ||
        snapshotReaders >= currentReaders + 5;

      if (!shouldHydrateSnapshot) {
        return false;
      }

      const snapshotUsers = snapshotData.usuarios || [];
      const hasSuperAdmin = snapshotUsers.some((user) => user?.perfil === 'SuperAdmin');
      const mergedUsers = hasSuperAdmin
        ? snapshotUsers
        : [...usuariosPadrao, ...snapshotUsers.filter((user) => user?.perfil !== 'SuperAdmin')];

      setInstituicoes(snapshotData.instituicoes || []);
      setUsuarios(mergedUsers);
      setLivros(snapshotData.livros || []);
      setPatrimonio(snapshotData.patrimonio || []);
      setClientes(snapshotData.clientes || []);
      setSeriesAcademicas(snapshotData.seriesAcademicas || []);
      setTurmasAcademicas(snapshotData.turmasAcademicas || []);
      setEmprestimos(snapshotData.emprestimos || []);
      setPlanos(snapshotData.planos || planosPadrao);
      setNotasFiscais(snapshotData.notasFiscais || []);
      setLogAtividades(snapshotData.logAtividades || []);

      console.log(
        `🧰 [SYNC] Snapshot local reaplicado antes da sincronização (${currentStudents} → ${snapshotStudents} alunos).`
      );

      return true;
    } catch (error) {
      console.error('❌ [SYNC] Falha ao reidratar estado local antes da sincronização:', error);
      return false;
    }
  };

  // Função para sincronizar dados com o servidor
  const sincronizarDados = async () => {
    if (sincronizando || !dadosCarregados) {
      console.log('⏸️ Sincronização ignorada:', sincronizando ? 'Já sincronizando' : 'Dados ainda não carregados');
      return;
    }
    
    try {
      setSincronizando(true);
      window.dispatchEvent(new Event('sync-start'));
      
      const dadosAtuais = {
        instituicoes,
        livros,
        patrimonio,
        clientes,
        seriesAcademicas,
        turmasAcademicas,
        emprestimos,
        usuarios,
        planos,
        notasFiscais
      };

      const dadosSincronizados = await apiService.sincronizarDados(dadosAtuais);

      // Atualizar estados com dados sincronizados
      if (dadosSincronizados) {
        const dadosNormalizados = normalizeAllInstitutionData(
          dadosSincronizados,
          instituicaoAtiva
        );
        const hasSeriesPayload = Object.prototype.hasOwnProperty.call(dadosSincronizados, 'seriesAcademicas');
        const hasTurmasPayload = Object.prototype.hasOwnProperty.call(dadosSincronizados, 'turmasAcademicas');

        setInstituicoes(dadosNormalizados.instituicoes || []);
        setLivros(dadosNormalizados.livros || []);
        setPatrimonio(dadosNormalizados.patrimonio || []);
        setClientes(dadosNormalizados.clientes || []);
        if (hasSeriesPayload) {
          setSeriesAcademicas(dadosNormalizados.seriesAcademicas || []);
        }
        if (hasTurmasPayload) {
          setTurmasAcademicas(dadosNormalizados.turmasAcademicas || []);
        }
        setEmprestimos(dadosNormalizados.emprestimos || []);
        setPlanos(dadosNormalizados.planos || planosPadrao);
        setNotasFiscais(dadosNormalizados.notasFiscais || []);
        
        // Manter usuários com SuperAdmin
        if (dadosNormalizados.usuarios) {
          const temSuperAdmin = dadosNormalizados.usuarios.some(u => u.perfil === 'SuperAdmin');
          if (temSuperAdmin) {
            setUsuarios(dadosNormalizados.usuarios);
          } else {
            setUsuarios([...usuariosPadrao, ...dadosNormalizados.usuarios.filter(u => u.perfil !== 'SuperAdmin')]);
          }
        }
      }
      
      console.log('Sincronização concluída com sucesso');
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setSincronizando(false);
      window.dispatchEvent(new Event('sync-end'));
    }
  };

  useEffect(() => {
    instituicoesRef.current = instituicoes;
    usuariosRef.current = usuarios;
    livrosRef.current = livros;
    clientesRef.current = clientes;
    patrimonioRef.current = patrimonio;
    emprestimosRef.current = emprestimos;
  }, [instituicoes, usuarios, livros, clientes, patrimonio, emprestimos]);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const carregarDados = async () => {
      console.log('🔄 [INIT] Iniciando carregamento de dados...');
      
      // � PASSO 0: Verificar atualização do sistema e criar backup de segurança
      const versaoAtual = localStorage.getItem(DATA_VERSION_KEY);
      const ultimaAtualizacao = localStorage.getItem(LAST_UPDATE_KEY);

      const limparBackupsAntigos = (maxBackups = 5) => {
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith('cei_backup_v')).sort().reverse();
        if (backupKeys.length > maxBackups) {
          backupKeys.slice(maxBackups).forEach(key => {
            localStorage.removeItem(key);
            console.log('🗑️ [UPDATE] Backup antigo removido:', key);
          });
        }
      };
      
      if (versaoAtual !== SYSTEM_VERSION) {
        console.log('🔄 [UPDATE] Detectada atualização do sistema!');
        console.log(`📊 [UPDATE] Versão anterior: ${versaoAtual || 'inicial'} → Nova versão: ${SYSTEM_VERSION}`);
        
        // Criar backup de segurança ANTES de qualquer alteração
        console.log('💾 [UPDATE] Criando backup de segurança antes da atualização...');
        try {
          const dadosAtuais = localStorage.getItem('cei_data');
          if (dadosAtuais) {
            // Limpar antes de criar para evitar erro por limite de armazenamento
            limparBackupsAntigos(4);

            // Backup da versão anterior
            localStorage.setItem(`cei_backup_v${versaoAtual || 'old'}_${Date.now()}`, dadosAtuais);
            console.log('✅ [UPDATE] Backup criado com sucesso!');
            
            // Criar backup adicional em formato legível
            createBackup();
            
            // Limpar backups antigos (manter apenas os 5 mais recentes)
            limparBackupsAntigos(5);
          }
        } catch (error) {
          console.error('❌ [UPDATE] Erro ao criar backup:', error);
          limparBackupsAntigos(2);
          console.warn('⚠️ [UPDATE] Não foi possível criar backup automático antes da atualização. O sistema continuará normalmente.');
        }
        
        // Atualizar versão
        localStorage.setItem(DATA_VERSION_KEY, SYSTEM_VERSION);
        localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
        
        console.log('✅ [UPDATE] Sistema atualizado com sucesso!');
        console.log('📅 [UPDATE] Data da atualização:', new Date().toLocaleString('pt-BR'));
      }
      
      // �🛡️ PASSO 1: Inicializar sistema de proteção de dados
      console.log('🛡️ [INIT] Inicializando proteção de dados...');
      const protectionResult = initDataProtection();
      
      if (protectionResult.migrated) {
        console.log('✅ [INIT] Dados migrados com sucesso!');
        if (protectionResult.stats) {
          console.log('📊 [INIT] Dados preservados:', protectionResult.stats);
        }
      }
      
      if (!protectionResult.success) {
        console.error('❌ [INIT] Erro na proteção de dados:', protectionResult.error);
        alert('⚠️ Erro ao carregar dados. Seu backup será restaurado.');
      }
      
      // PASSO 2: Carregar dados (agora já migrados se necessário)
      let dadosSalvos = localStorage.getItem('cei_data');

      if (!dadosSalvos) {
        const fallbackLegacyInstitutionId = resolveInstitutionId(
          localStorage.getItem('cei_instituicao_ativa'),
          null
        );

        const legadoBootstrap = mergeLegacyStandaloneAcademicStorage({}, fallbackLegacyInstitutionId);
        const leitoresLegados = getReadersCollection(legadoBootstrap.data).length;
        const turmasLegadas = Array.isArray(legadoBootstrap.data?.turmasAcademicas)
          ? legadoBootstrap.data.turmasAcademicas.length
          : 0;

        if (legadoBootstrap.merged && (leitoresLegados > 0 || turmasLegadas > 0)) {
          dadosSalvos = JSON.stringify(legadoBootstrap.data);
          localStorage.setItem('cei_data', dadosSalvos);
          console.log(
            `🧩 [LEGACY] Snapshot criado a partir de chaves legadas: ${leitoresLegados} leitores e ${turmasLegadas} turmas.`
          );
        }
      }

      console.log('🔄 Carregando dados...', dadosSalvos ? 'Dados encontrados' : 'Sem dados salvos');
      
      // 🔧 Sistema de recuperação: tentar restaurar backup se dados corrompidos
      let tentativaRecuperacao = false;
      
      if (dadosSalvos) {
        try {
          // Testar se os dados são válidos
          JSON.parse(dadosSalvos);
        } catch (parseError) {
          console.error('❌ [RECOVERY] Dados corrompidos detectados!', parseError);
          tentativaRecuperacao = true;
          
          // Tentar recuperar do backup mais recente
          const allKeys = Object.keys(localStorage);
          const backupKeys = allKeys.filter(key => key.startsWith('cei_backup_v')).sort().reverse();
          
          if (backupKeys.length > 0) {
            console.log('🔄 [RECOVERY] Tentando recuperar do backup:', backupKeys[0]);
            const backupData = localStorage.getItem(backupKeys[0]);
            if (backupData) {
              try {
                JSON.parse(backupData); // Validar backup
                dadosSalvos = backupData;
                localStorage.setItem('cei_data', backupData); // Restaurar
                console.log('✅ [RECOVERY] Dados recuperados com sucesso do backup!');
                alert('✅ Sistema recuperado! Seus dados foram restaurados do backup mais recente.');
              } catch (backupError) {
                console.error('❌ [RECOVERY] Backup também corrompido:', backupError);
              }
            }
          }
          
          if (tentativaRecuperacao && !dadosSalvos) {
            alert('❌ Erro crítico: Não foi possível recuperar seus dados. O sistema será reiniciado com dados padrão.');
            dadosSalvos = null;
          }
        }
      }
      
      if (dadosSalvos) {
        const dadosSemMigracao = JSON.parse(dadosSalvos);
        const fallbackLegacyInstitutionId = resolveInstitutionId(
          localStorage.getItem('cei_instituicao_ativa'),
          inferFallbackInstitutionId(dadosSemMigracao)
        );

        const legadoMesclado = mergeLegacyStandaloneAcademicStorage(
          dadosSemMigracao,
          fallbackLegacyInstitutionId
        );

        const dadosComCompatibilidadeLegada = legadoMesclado.data;
        const dadosMigrados = migrarIdsLegados(dadosComCompatibilidadeLegada);
        const institutionIdHint = resolveInstitutionId(
          localStorage.getItem('cei_instituicao_ativa'),
          inferFallbackInstitutionId(dadosMigrados)
        );

        if (legadoMesclado.merged && legadoMesclado.stats) {
          console.log(
            `🧩 [LEGACY] Dados legados integrados ao snapshot principal: ` +
            `${legadoMesclado.stats.legacyReaders} leitores e ${legadoMesclado.stats.legacyTurmas} turmas detectados.`
          );
        }

        // Only run aggressive recovery from backups when corruption recovery was triggered.
        // This avoids reintroducing intentionally deleted readers from old snapshots.
        const podeRecuperarDeBackup = tentativaRecuperacao === true;
        const melhorSnapshot = podeRecuperarDeBackup
          ? chooseBestRecoverySnapshot(dadosMigrados, institutionIdHint)
          : null;
        const melhorSnapshotAcademico = podeRecuperarDeBackup
          ? chooseBestAcademicStructureSnapshot(dadosMigrados, institutionIdHint)
          : null;

        const dadosComLeitores = melhorSnapshot
          ? mergeRecoveredReadersIntoCurrentData(dadosMigrados, melhorSnapshot.data)
          : dadosMigrados;
        const dadosComEstrutura = melhorSnapshotAcademico
          ? mergeRecoveredAcademicIntoCurrentData(dadosComLeitores, melhorSnapshotAcademico.data)
          : dadosComLeitores;
        const dadosBase = rebuildAcademicStructuresFromReaders(dadosComEstrutura, institutionIdHint);

        if (melhorSnapshot) {
          console.log(
            `🧰 [RECOVERY] Leitores restaurados de ${melhorSnapshot.source}: ` +
            `${melhorSnapshot.stats.studentsCount} alunos e ${melhorSnapshot.stats.readersCount} leitores. ` +
            'Turmas e séries atuais foram preservadas.'
          );
        }

        if (melhorSnapshotAcademico) {
          console.log(
            `🧰 [RECOVERY] Estrutura acadêmica restaurada de ${melhorSnapshotAcademico.source}: ` +
            `${melhorSnapshotAcademico.stats.seriesCount} séries e ${melhorSnapshotAcademico.stats.turmasCount} turmas.`
          );
        }

        const fallbackInstitutionId = inferFallbackInstitutionId(dadosBase);
        const dados = normalizeAllInstitutionData(dadosBase, fallbackInstitutionId);
        console.log('📦 Dados parseados:', {
          instituicoes: dados.instituicoes?.length || 0,
          usuarios: dados.usuarios?.length || 0,
          livros: dados.livros?.length || 0,
          clientes: dados.clientes?.length || 0
        });
        
        // Priorizar dados salvos e adicionar padrões apenas se não existirem
        const instituicoesMerged = dados.instituicoes ? [...dados.instituicoes] : [];
        const agora = Date.now();
        const trintaDiasMs = 30 * 24 * 60 * 60 * 1000;
        instituicoesPadrao.forEach(instPadrao => {
          const indiceExistente = instituicoesMerged.findIndex(i => i.id === instPadrao.id);
          if (indiceExistente === -1) {
            instituicoesMerged.push(instPadrao);
            console.log('➕ Adicionando instituição padrão:', instPadrao.nomeInstituicao);
          } else if (instPadrao.contaTeste) {
            const instituicaoExistente = instituicoesMerged[indiceExistente];
            const expirada = !instituicaoExistente.dataExpiracao || new Date(instituicaoExistente.dataExpiracao).getTime() < agora;

            instituicoesMerged[indiceExistente] = {
              ...instituicaoExistente,
              ...instPadrao,
              dataCadastro: instituicaoExistente.dataCadastro || instPadrao.dataCadastro,
              dataAtivacao: instituicaoExistente.dataAtivacao || new Date().toISOString(),
              dataExpiracao: expirada
                ? new Date(agora + trintaDiasMs).toISOString()
                : instituicaoExistente.dataExpiracao,
              diasLicenca: 30,
              status: 'ativo',
              statusFinanceiro: 'teste',
              limites: {
                maxLivros: 20,
                maxLeitores: 20
              }
            };
            console.log('♻️ Atualizando configuração da conta de demonstração para 20/20 e 30 dias');
          }
        });
        setInstituicoes(instituicoesMerged);
        console.log('✅ Total de instituições carregadas:', instituicoesMerged.length);
        
        setLivros(dados.livros || []);
        setPatrimonio(dados.patrimonio || []);
        setClientes(dados.clientes || []);
        setSeriesAcademicas(dados.seriesAcademicas || []);
        setTurmasAcademicas(dados.turmasAcademicas || []);
        setEmprestimos(dados.emprestimos || []);
        setPlanos(dados.planos || planosPadrao);
        setNotasFiscais(dados.notasFiscais || []);
        setLogAtividades(dados.logAtividades || []);
        
        // Priorizar usuários salvos e garantir que padrões existam
        const usuariosMerged = dados.usuarios && dados.usuarios.length > 0 ? [...dados.usuarios] : [];
        usuariosPadrao.forEach(userPadrao => {
          if (!usuariosMerged.find(u => u.id === userPadrao.id)) {
            usuariosMerged.push(userPadrao);
            console.log('➕ Adicionando usuário padrão:', userPadrao.login);
          }
        });
        setUsuarios(usuariosMerged);
        console.log('✅ Total de usuários carregados:', usuariosMerged.length);
        
        // Verificar licenças expiradas ao carregar
        verificarLicencasExpiradas(instituicoesMerged);
      } else {
        // Se não há dados salvos, inicializar com dados padrão
        console.log('🆕 Inicializando com dados padrão...');
        setInstituicoes(instituicoesPadrao);
        setUsuarios(usuariosPadrao);
        console.log('✅ Instituições padrão:', instituicoesPadrao.length);
        console.log('✅ Usuários padrão:', usuariosPadrao.length);
      }

      // Marcar que dados foram carregados
      setDadosCarregados(true);
      console.log('✅ Dados carregados e prontos para sincronizar');

      // Tentar sincronizar com servidor se online
      if (apiService.checkOnlineStatus()) {
        setTimeout(() => sincronizarDados(), 1000);
      }
    };

    carregarDados();
  }, []);

  // Sincronização automática periódica (a cada 5 minutos se online)
  useEffect(() => {
    const interval = setInterval(() => {
      if (apiService.checkOnlineStatus()) {
        sincronizarDados();
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [instituicoes, livros, patrimonio, clientes, seriesAcademicas, turmasAcademicas, emprestimos, usuarios, planos, notasFiscais]);

  // Sincronizar quando voltar online
  useEffect(() => {
    const handleSyncRequired = async () => {
      console.log('Sincronização solicitada após reconexão');

      const snapshotReaplicado = rehidratarEstadoDoLocalStorageSeNecessario();

      if (isCloudEnabled && instituicaoAtiva && instituicaoAtiva !== 0 && usuarioLogado?.perfil !== 'SuperAdmin') {
        if (snapshotReaplicado) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        await sincronizarInstituicaoComNuvem(instituicaoAtiva, true);
        return;
      }

      sincronizarDados();
    };

    window.addEventListener('sync-required', handleSyncRequired);
    window.addEventListener('online', handleSyncRequired);

    return () => {
      window.removeEventListener('sync-required', handleSyncRequired);
      window.removeEventListener('online', handleSyncRequired);
    };
  }, [instituicoes, livros, patrimonio, clientes, seriesAcademicas, turmasAcademicas, emprestimos, usuarios, planos, notasFiscais, logAtividades, instituicaoAtiva, usuarioLogado?.perfil]);

  // Sincronização inicial da instituição com a nuvem (merge seguro sem perda)
  useEffect(() => {
    if (!dadosCarregados || !isCloudEnabled) return;
    if (!instituicaoAtiva || instituicaoAtiva === 0) return;
    if (usuarioLogado?.perfil === 'SuperAdmin') return;

    sincronizarInstituicaoComNuvem(instituicaoAtiva, true);
  }, [dadosCarregados, instituicaoAtiva, usuarioLogado?.perfil]);

  // Pull periódico para refletir alterações feitas por outros computadores/usuários da mesma escola
  useEffect(() => {
    if (!dadosCarregados || !isCloudEnabled) return undefined;
    if (!instituicaoAtiva || instituicaoAtiva === 0) return undefined;
    if (usuarioLogado?.perfil === 'SuperAdmin') return undefined;

    const interval = setInterval(() => {
      sincronizarInstituicaoComNuvem(instituicaoAtiva, false);
    }, 20000);

    return () => clearInterval(interval);
  }, [dadosCarregados, instituicaoAtiva, usuarioLogado?.perfil]);

  // Push automático com debounce para nuvem
  useEffect(() => {
    if (!dadosCarregados || !isCloudEnabled) return undefined;
    if (!instituicaoAtiva || instituicaoAtiva === 0) return undefined;
    if (usuarioLogado?.perfil === 'SuperAdmin') return undefined;

    const timeout = setTimeout(() => {
      enviarDadosInstituicaoParaNuvem(instituicaoAtiva);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [instituicoes, usuarios, livros, clientes, patrimonio, emprestimos, instituicaoAtiva, dadosCarregados, usuarioLogado?.perfil]);

  // Verificar licenças periodicamente (a cada hora)
  useEffect(() => {
    const interval = setInterval(() => {
      verificarLicencasExpiradas(instituicoes);
    }, 3600000); // 1 hora

    return () => clearInterval(interval);
  }, [instituicoes]);

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    if (!dadosCarregados) {
      return;
    }

    // 🛡️ Criar backup antes de salvar (a cada 10 salvamentos ou 1 hora)
    const lastBackup = localStorage.getItem('cei_last_backup');
    const shouldBackup = !lastBackup || 
      (Date.now() - new Date(lastBackup).getTime()) > 60 * 60 * 1000; // 1 hora
    
    if (shouldBackup && dadosCarregados) {
      console.log('📦 [BACKUP] Criando backup automático...');
      createBackup();
    }
    
    const dados = {
      instituicoes,
      livros,
      patrimonio,
      clientes,
      seriesAcademicas,
      turmasAcademicas,
      emprestimos,
      usuarios,
      planos,
      notasFiscais,
      logAtividades
    };
    
    try {
      // Validar dados antes de salvar
      const dadosString = JSON.stringify(dados);
      const dadosSize = new Blob([dadosString]).size;
      const dadosSizeMB = (dadosSize / (1024 * 1024)).toFixed(2);
      
      // Verificar se há espaço suficiente (limite típico: 5-10MB)
      if (dadosSize > 9 * 1024 * 1024) { // 9MB de limite
        console.warn('⚠️ [SAVE] Tamanho dos dados próximo do limite:', dadosSizeMB, 'MB');
        alert(`⚠️ ATENÇÃO: Seus dados estão ocupando ${dadosSizeMB}MB. Considere fazer uma limpeza ou exportar dados antigos.`);
      }
      
      // Salvar dados com registro de versão
      const dadosComVersao = {
        ...dados,
        _metadata: {
          version: SYSTEM_VERSION,
          savedAt: new Date().toISOString(),
          dataSize: dadosSize
        }
      };
      
      localStorage.setItem('cei_data', JSON.stringify(dadosComVersao));
      
      console.log('💾 Dados salvos no localStorage:', {
        version: SYSTEM_VERSION,
        size: dadosSizeMB + ' MB',
        instituicoes: instituicoes.length,
        usuarios: usuarios.length,
        livros: livros.length,
        clientes: clientes.length,
        seriesAcademicas: seriesAcademicas.length,
        turmasAcademicas: turmasAcademicas.length,
        emprestimos: emprestimos.length,
        logs: logAtividades.length,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    } catch (error) {
      console.error('❌ [SAVE] Erro ao salvar dados:', error);
      
      // Tentar salvar em backup de emergência
      try {
        localStorage.setItem('cei_data_emergency', JSON.stringify(dados));
        console.log('🚨 [SAVE] Dados salvos em backup de emergência');
        alert('⚠️ Erro ao salvar dados principais. Backup de emergência criado. Verifique o espaço de armazenamento do navegador.');
      } catch (emergencyError) {
        console.error('❌ [SAVE] Erro crítico ao salvar backup de emergência:', emergencyError);
        alert('❌ ERRO CRÍTICO: Não foi possível salvar seus dados. Exporte seus dados imediatamente!');
      }
    }
  }, [instituicoes, livros, patrimonio, clientes, seriesAcademicas, turmasAcademicas, emprestimos, usuarios, planos, notasFiscais, logAtividades, dadosCarregados]);

  // ==================== VERIFICAÇÃO DE LICENÇAS EXPIRADAS ====================
  
  const verificarLicencasExpiradas = (listaInstituicoes) => {
    const hoje = new Date();
    let houveAlteracao = false;
    
    const instituicoesAtualizadas = listaInstituicoes.map(inst => {
      // Ignorar instituições pendentes ou bloqueadas manualmente
      if (inst.status === 'pendente' || inst.status === 'bloqueado') {
        return inst;
      }
      
      // Verificar se tem data de expiração
      if (!inst.dataExpiracao) {
        return inst;
      }
      
      const dataExpiracao = new Date(inst.dataExpiracao);
      const diasDesdeExpiracao = Math.floor((hoje - dataExpiracao) / (1000 * 60 * 60 * 24));
      
      // Licença ainda válida
      if (dataExpiracao > hoje) {
        // Se estava expirada e renovou, reativar
        if (inst.status === 'expirado') {
          houveAlteracao = true;
          return {
            ...inst,
            status: 'ativo',
            dataExpiracaoReal: null,
            avisoExpiracaoEnviado: false
          };
        }
        return inst;
      }
      
      // Licença expirou
      if (inst.status === 'ativo') {
        houveAlteracao = true;
        console.log(`⚠️ Licença expirada: ${inst.nomeInstituicao} - Período de graça de 30 dias iniciado`);
        
        return {
          ...inst,
          status: 'expirado',
          dataExpiracaoReal: inst.dataExpiracaoReal || hoje.toISOString(), // Marca quando expirou pela primeira vez
          avisoExpiracaoEnviado: true,
          statusFinanceiro: 'expirado'
        };
      }
      
      // Já está expirada - verificar se passou 30 dias (período de graça)
      if (inst.status === 'expirado' && inst.dataExpiracaoReal) {
        const dataExpiracaoReal = new Date(inst.dataExpiracaoReal);
        const diasExpirado = Math.floor((hoje - dataExpiracaoReal) / (1000 * 60 * 60 * 24));
        
        if (diasExpirado >= 30) {
          // Passou o período de graça - limpar dados mas manter instituição
          console.log(`🗑️ Período de graça expirado (${diasExpirado} dias): ${inst.nomeInstituicao} - Limpando dados`);
          houveAlteracao = true;
          limparDadosInstituicaoExpirada(inst.id);
          
          return {
            ...inst,
            status: 'dados_removidos',
            dataRemocaoDados: hoje.toISOString(),
            avisoRemocaoEnviado: true,
            // Manter dados básicos para contato
            dadosBasicosPreservados: {
              nomeInstituicao: inst.nomeInstituicao,
              email: inst.email,
              telefone: inst.telefone,
              cidade: inst.cidade,
              estado: inst.estado,
              cnpj: inst.cnpj,
              nomeResponsavel: inst.nomeResponsavel,
              emailResponsavel: inst.emailResponsavel,
              telefoneResponsavel: inst.telefoneResponsavel,
              plano: inst.plano,
              valorMensal: inst.valorMensal,
              historicoLicencas: inst.historicoLicencas || []
            }
          };
        }
      }
      
      return inst;
    });
    
    if (houveAlteracao) {
      setInstituicoes(instituicoesAtualizadas);
    }
  };

  const limparDadosInstituicaoExpirada = (instituicaoId) => {
    // Remove todos os dados da instituição, mas mantém a instituição básica
    console.log(`🗑️ Limpando dados da instituição ID ${instituicaoId} após expiração de licença`);
    
    setLivros(prev => prev.filter(l => l.instituicaoId !== instituicaoId));
    setPatrimonio(prev => prev.filter(p => p.instituicaoId !== instituicaoId));
    setClientes(prev => prev.filter(c => c.instituicaoId !== instituicaoId));
    setSeriesAcademicas(prev => prev.filter(s => s.instituicaoId !== instituicaoId));
    setTurmasAcademicas(prev => prev.filter(t => t.instituicaoId !== instituicaoId));
    setEmprestimos(prev => prev.filter(e => e.instituicaoId !== instituicaoId));
    setNotasFiscais(prev => prev.filter(n => n.instituicaoId !== instituicaoId));
    
    // Manter o usuário admin mas desativar
    setUsuarios(prev => prev.map(u => 
      u.instituicaoId === instituicaoId 
        ? { ...u, status: 'desativado', motivoDesativacao: 'Licença expirada - dados removidos' }
        : u
    ));
  };

  const calcularDiasRestantesLicenca = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao || !instituicao.dataExpiracao) return null;
    
    // Criar datas sem considerar horário (apenas dia/mês/ano)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const expiracao = new Date(instituicao.dataExpiracao);
    expiracao.setHours(0, 0, 0, 0);
    
    console.log('📅 Calculando dias restantes:', {
      instituicao: instituicao.nomeInstituicao,
      hoje: hoje.toISOString().split('T')[0],
      expiracao: expiracao.toISOString().split('T')[0],
      dataExpiracaoOriginal: instituicao.dataExpiracao
    });
    
    const dias = Math.ceil((expiracao - hoje) / (1000 * 60 * 60 * 24));
    console.log('📅 Dias calculados:', dias);
    
    return dias;
  };

  const calcularDiasGracaRestantes = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao || instituicao.status !== 'expirado' || !instituicao.dataExpiracaoReal) return null;
    
    const hoje = new Date();
    const dataExpiracaoReal = new Date(instituicao.dataExpiracaoReal);
    const diasExpirado = Math.floor((hoje - dataExpiracaoReal) / (1000 * 60 * 60 * 24));
    const diasRestantes = 30 - diasExpirado;
    
    return diasRestantes > 0 ? diasRestantes : 0;
  };

  // ==================== FUNÇÕES DE INSTITUIÇÕES ====================
  
  const adicionarInstituicao = (instituicaoData) => {
    // Verificar se já existe uma instituição com o mesmo CNPJ ou Email
    const jaExiste = instituicoes.find(
      i => i.cnpj === instituicaoData.cnpj || 
           i.email === instituicaoData.email ||
           i.loginAdmin === instituicaoData.loginAdmin
    );
    
    if (jaExiste) {
      console.warn('Instituição já cadastrada:', jaExiste);
      return jaExiste; // Retorna a instituição existente ao invés de criar duplicada
    }
    
    const novaInstituicao = {
      ...instituicaoData,
      id: gerarIdUnico(),
      dataCadastro: new Date().toISOString(),
      status: instituicaoData.status || 'pendente', // Usar status fornecido ou pendente
      dataExpiracao: instituicaoData.dataExpiracao || null,
      licenca: gerarCodigoLicenca(),
      // FINANCEIRO - Usar valores do plano selecionado se existirem
      plano: instituicaoData.plano || 'mensal',
      diasLicenca: instituicaoData.diasLicenca || 30,
      valorMensal: instituicaoData.valorMensal ?? 97.00,
      diaVencimento: 10, // dia do mês para vencimento
      statusFinanceiro: 'em_dia', // em_dia, pendente, atrasado, bloqueado_financeiro
      pagamentos: [] // histórico de pagamentos
    };
    
    // Atualizar lista de instituições
    const novasInstituicoes = [...instituicoes, novaInstituicao];
    setInstituicoes(novasInstituicoes);
    console.log('Instituição adicionada:', novaInstituicao);
    console.log('Total de instituições:', novasInstituicoes.length);
    
    // Criar usuário admin para a instituição
    const adminInstituicao = {
      id: gerarIdUnico(),
      nome: instituicaoData.nomeResponsavel,
      login: instituicaoData.loginAdmin,
      senha: instituicaoData.senhaAdmin,
      perfil: 'Admin',
      tipo: 'master',
      permissoes: permissoesPadraoEscola,
      instituicaoId: novaInstituicao.id,
      dataCadastro: new Date().toISOString()
    };
    setUsuarios([...usuarios, adminInstituicao]);
    console.log('Usuário admin criado:', adminInstituicao);
    
    return novaInstituicao;
  };

  const atualizarInstituicao = (id, dadosAtualizados) => {
    setInstituicoes(instituicoes.map(i => 
      i.id === id ? { ...i, ...dadosAtualizados, dataAtualizacao: new Date().toISOString() } : i
    ));
  };

  const ativarInstituicao = (id, diasValidade = 365) => {
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + diasValidade);
    
    const instituicao = instituicoes.find(i => i.id === id);
    const historicoLicencas = instituicao?.historicoLicencas || [];
    
    // Adicionar ao histórico
    historicoLicencas.push({
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: dataExpiracao.toISOString(),
      diasValidade: diasValidade,
      renovacao: instituicao?.status === 'expirado' || instituicao?.status === 'dados_removidos'
    });
    
    atualizarInstituicao(id, {
      status: 'ativo',
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: dataExpiracao.toISOString(),
      dataExpiracaoReal: null, // Limpar data de expiração real
      avisoExpiracaoEnviado: false,
      statusFinanceiro: 'em_dia',
      historicoLicencas: historicoLicencas
    });
    
    // Se estava com dados removidos, reativar usuário
    if (instituicao?.status === 'dados_removidos') {
      setUsuarios(prev => prev.map(u => 
        u.instituicaoId === id 
          ? { ...u, status: 'ativo', motivoDesativacao: null }
          : u
      ));
    }
  };

  const bloquearInstituicao = (id, motivo = '') => {
    atualizarInstituicao(id, {
      status: 'bloqueado',
      dataBloqueio: new Date().toISOString(),
      motivoBloqueio: motivo
    });
  };

  const removerInstituicao = (id) => {
    if (window.confirm('Remover instituição apagará TODOS os dados relacionados. Continuar?')) {
      // Remover todos os dados da instituição
      setLivros(livros.filter(l => l.instituicaoId !== id));
      setPatrimonio(patrimonio.filter(p => p.instituicaoId !== id));
      setClientes(clientes.filter(c => c.instituicaoId !== id));
      setSeriesAcademicas(seriesAcademicas.filter(s => s.instituicaoId !== id));
      setTurmasAcademicas(turmasAcademicas.filter(t => t.instituicaoId !== id));
      setEmprestimos(emprestimos.filter(e => e.instituicaoId !== id));
      setUsuarios(usuarios.filter(u => u.instituicaoId !== id));
      setInstituicoes(instituicoes.filter(i => i.id !== id));
    }
  };

  // Remove todas as instituições dos ids fornecidos (sem confirm interno - a UI confirma antes)
  const removerTodasInstituicoes = (ids) => {
    const idsSet = new Set(ids.map(String));
    setLivros((prev) => prev.filter(l => !idsSet.has(String(l.instituicaoId))));
    setPatrimonio((prev) => prev.filter(p => !idsSet.has(String(p.instituicaoId))));
    setClientes((prev) => prev.filter(c => !idsSet.has(String(c.instituicaoId))));
    setSeriesAcademicas((prev) => prev.filter(s => !idsSet.has(String(s.instituicaoId))));
    setTurmasAcademicas((prev) => prev.filter(t => !idsSet.has(String(t.instituicaoId))));
    setEmprestimos((prev) => prev.filter(e => !idsSet.has(String(e.instituicaoId))));
    setUsuarios((prev) => prev.filter(u => !idsSet.has(String(u.instituicaoId))));
    setInstituicoes((prev) => prev.filter(i => !idsSet.has(String(i.id))));
  };

  const gerarCodigoLicenca = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      if (i < 3) codigo += '-';
    }
    return codigo;
  };

  // ==================== FUNÇÕES FINANCEIRAS ====================
  
  const registrarPagamento = (instituicaoId, valor, metodoPagamento = 'manual') => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao) return;

    const pagamento = {
      id: Date.now(),
      valor: valor,
      dataPagamento: new Date().toISOString(),
      metodoPagamento: metodoPagamento,
      referenciaMes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      status: 'confirmado'
    };

    const pagamentosAtualizados = [...(instituicao.pagamentos || []), pagamento];
    
    atualizarInstituicao(instituicaoId, {
      pagamentos: pagamentosAtualizados,
      statusFinanceiro: 'em_dia',
      ultimoPagamento: pagamento.dataPagamento
    });
  };

  const verificarInadimplencia = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao || instituicao.status === 'pendente') return false;

    const hoje = new Date();
    const diaVencimento = instituicao.diaVencimento || 10;
    const ultimoPagamento = instituicao.ultimoPagamento ? new Date(instituicao.ultimoPagamento) : new Date(instituicao.dataAtivacao);
    
    // Calcular se está inadimplente (mais de 30 dias sem pagamento)
    const diasSemPagamento = Math.floor((hoje - ultimoPagamento) / (1000 * 60 * 60 * 24));
    
    if (diasSemPagamento > 35) {
      // Bloquear por inadimplência
      atualizarInstituicao(instituicaoId, {
        statusFinanceiro: 'bloqueado_financeiro',
        status: 'bloqueado',
        motivoBloqueio: 'Inadimplência - Pagamento não identificado'
      });
      return true;
    } else if (diasSemPagamento > 30) {
      // Marcar como atrasado
      atualizarInstituicao(instituicaoId, {
        statusFinanceiro: 'atrasado'
      });
      return false;
    }
    
    return false;
  };

  const calcularProximoVencimento = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao) return null;

    // Para planos anuais ou semestrais, usar dataExpiracao como vencimento
    if (instituicao.dataExpiracao && (instituicao.diasLicenca >= 180 || 
        instituicao.plano?.includes('Ano') || 
        instituicao.plano?.includes('ano') ||
        instituicao.plano?.includes('Semestral') ||
        instituicao.plano?.includes('semestral'))) {
      return new Date(instituicao.dataExpiracao);
    }

    // Para planos mensais, usar sistema de vencimento mensal
    const hoje = new Date();
    const diaVencimento = instituicao.diaVencimento || 10;
    
    // Se há último pagamento, calcular a partir dele
    if (instituicao.ultimoPagamento) {
      const dataUltimoPagamento = new Date(instituicao.ultimoPagamento);
      
      // Próximo vencimento é sempre no dia 10 do MÊS SEGUINTE ao pagamento
      let proximoVencimento = new Date(dataUltimoPagamento);
      proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      proximoVencimento.setDate(diaVencimento);
      
      return proximoVencimento;
    }
    
    // Se não há pagamento, calcular a partir de hoje
    let proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
    
    if (proximoVencimento < hoje) {
      proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, diaVencimento);
    }
    
    return proximoVencimento;
  };

  const obterHistoricoPagamentos = (instituicaoId) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    return instituicao?.pagamentos || [];
  };

  // ==================== VERIFICAÇÃO DE LIMITES ====================
  
  const verificarLimitesConta = () => {
    if (!usuarioLogado?.contaTeste) {
      return { permitido: true };
    }
    
    const instituicao = instituicoes.find(i => i.id === instituicaoAtiva);
    if (!instituicao?.limites) {
      return { permitido: true };
    }
    
    const livrosInstituicao = livros.filter((l) =>
      belongsToInstitution(l, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
    const leitoresInstituicao = clientes.filter((c) =>
      belongsToInstitution(c, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
    
    return {
      permitido: true,
      limites: instituicao.limites,
      livrosAtual: livrosInstituicao.length,
      leitoresAtual: leitoresInstituicao.length,
      livrosLimiteAtingido: livrosInstituicao.length >= instituicao.limites.maxLivros,
      leitoresLimiteAtingido: leitoresInstituicao.length >= instituicao.limites.maxLeitores
    };
  };

  // ==================== FUNÇÕES CRUD PARA LIVROS ====================
  
  const adicionarLivro = (livro) => {
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return null;
    }
    
    // Verificar limites da conta teste
    const verificacao = verificarLimitesConta();
    if (verificacao.livrosLimiteAtingido) {
      const linkCadastro = window.location.origin + '/cadastro-escola';
      const mensagem = `⚠️ LIMITE ATINGIDO - VERSÃO DEMONSTRAÇÃO\n\n` +
        `Você cadastrou ${verificacao.livrosAtual} de ${verificacao.limites.maxLivros} livros permitidos na versão de teste.\n\n` +
        `Para cadastrar mais livros e ter acesso completo, faça o cadastro completo da sua escola:\n\n` +
        `🔗 ${linkCadastro}\n\n` +
        `Com a versão completa você terá:\n` +
        `✅ Livros ilimitados\n` +
        `✅ Leitores ilimitados\n` +
        `✅ Suporte técnico completo\n` +
        `✅ Backup automático\n` +
        `✅ Sem limitações\n\n` +
        `Valor: R$ 970,00/ano`;
      
      alert(mensagem);
      return null;
    }
    
    const novoLivro = {
      ...livro,
      id: gerarIdUnico(),
      instituicaoId: usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva,
      dataCadastro: new Date().toISOString()
    };
    setLivros([...livros, novoLivro]);
    registrarLog('adicionar', 'livros', `Livro "${novoLivro.titulo || novoLivro.codigoIdentificacao || novoLivro.id}" cadastrado`, {
      livroId: novoLivro.id
    });
    return novoLivro;
  };

  const atualizarLivro = (id, dadosAtualizados) => {
    setLivros(livros.map(l => l.id === id ? { ...l, ...dadosAtualizados } : l));
    registrarLog('editar', 'livros', `Livro ID ${id} editado`, { livroId: id });
  };

  const removerLivro = (id) => {
    const livro = livros.find(l => l.id === id);
    setLivros(livros.filter(l => l.id !== id));

    const instituicaoIdAlvo = livro?.instituicaoId || instituicaoAtiva;
    if (isCloudEnabled && instituicaoIdAlvo && instituicaoIdAlvo !== 0) {
      deleteFromCloud('livros', id, instituicaoIdAlvo);
    }

    registrarLog('excluir', 'livros', `Livro "${livro?.titulo || id}" excluído`, { livroId: id });
  };

  const darBaixaLivro = (id, motivo, detalhes = {}) => {
    const livro = livros.find(l => l.id === id);
    if (!livro) return null;

    const baixa = {
      ...livro,
      baixa: {
        data: new Date().toISOString(),
        motivo, // 'Doação' ou 'Término de Vigência'
        ...detalhes // donatario, cpfDonatario, etc
      }
    };

    // Atualizar livro com informações de baixa
    setLivros(livros.map(l => l.id === id ? baixa : l));
    registrarLog('editar', 'livros', `Baixa registrada no livro "${livro?.titulo || id}"`, {
      livroId: id,
      motivo
    });
    return baixa;
  };

  const getLivrosFiltrados = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return livros; // Super admin vê tudo
    }
    return livros.filter((l) =>
      belongsToInstitution(l, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
  };

  // ==================== FUNÇÕES CRUD PARA PATRIMÔNIO ====================
  
  const adicionarPatrimonio = (bem) => {
    const novoBem = {
      ...bem,
      id: gerarIdUnico(),
      instituicaoId: usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva,
      dataCadastro: new Date().toISOString()
    };
    setPatrimonio([...patrimonio, novoBem]);
    registrarLog('adicionar', 'patrimonio', `Bem patrimonial "${novoBem.descricao || novoBem.numeroPatrimonio || novoBem.id}" cadastrado`, {
      patrimonioId: novoBem.id
    });
    return novoBem;
  };

  const atualizarPatrimonio = (id, dadosAtualizados) => {
    setPatrimonio(patrimonio.map(p => p.id === id ? { ...p, ...dadosAtualizados } : p));
    registrarLog('editar', 'patrimonio', `Patrimônio ID ${id} editado`, { patrimonioId: id });
  };

  const removerPatrimonio = (id) => {
    const bem = patrimonio.find(p => p.id === id);
    setPatrimonio(patrimonio.filter(p => p.id !== id));

    const instituicaoIdAlvo = bem?.instituicaoId || instituicaoAtiva;
    if (isCloudEnabled && instituicaoIdAlvo && instituicaoIdAlvo !== 0) {
      deleteFromCloud('patrimonio', id, instituicaoIdAlvo);
    }

    registrarLog('excluir', 'patrimonio', `Patrimônio "${bem?.descricao || id}" excluído`, { patrimonioId: id });
  };

  const getPatrimonioFiltrado = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return patrimonio;
    }
    return patrimonio.filter((p) =>
      belongsToInstitution(p, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
  };

  // ==================== FUNÇÕES CRUD PARA CLIENTES ====================

  const exibirMensagemLimiteLeitores = (verificacao) => {
    const linkCadastro = window.location.origin + '/cadastro-escola';
    const mensagem = `⚠️ LIMITE ATINGIDO - VERSÃO DEMONSTRAÇÃO\n\n` +
      `Você cadastrou ${verificacao.leitoresAtual} de ${verificacao.limites.maxLeitores} leitores permitidos na versão de teste.\n\n` +
      `Para cadastrar mais leitores e ter acesso completo, faça o cadastro completo da sua escola:\n\n` +
      `🔗 ${linkCadastro}\n\n` +
      `Com a versão completa você terá:\n` +
      `✅ Livros ilimitados\n` +
      `✅ Leitores ilimitados\n` +
      `✅ Suporte técnico completo\n` +
      `✅ Backup automático\n` +
      `✅ Sem limitações\n\n` +
      `Valor: R$ 970,00/ano`;

    alert(mensagem);
  };
  
  const adicionarCliente = (cliente) => {
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return null;
    }
    
    // Verificar limites da conta teste
    const verificacao = verificarLimitesConta();
    if (verificacao.leitoresLimiteAtingido) {
      exibirMensagemLimiteLeitores(verificacao);
      return null;
    }
    
    const novoCliente = {
      ...cliente,
      id: gerarIdUnico(),
      instituicaoId: usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva,
      dataCadastro: new Date().toISOString()
    };
    setClientes((clientesAtuais) => [...clientesAtuais, novoCliente]);
    registrarLog('adicionar', 'clientes', `Leitor "${novoCliente.nome || novoCliente.id}" cadastrado`, {
      clienteId: novoCliente.id
    });
    return novoCliente;
  };

  const adicionarClientesEmLote = (listaClientes = []) => {
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return {
        inseridos: 0,
        ignorados: Array.isArray(listaClientes) ? listaClientes.length : 0,
        detalhesIgnorados: []
      };
    }

    const candidatos = Array.isArray(listaClientes)
      ? listaClientes.filter((item) => item && typeof item === 'object')
      : [];

    if (candidatos.length === 0) {
      return {
        inseridos: 0,
        ignorados: 0,
        detalhesIgnorados: []
      };
    }

    const verificacao = verificarLimitesConta();
    if (verificacao.leitoresLimiteAtingido) {
      exibirMensagemLimiteLeitores(verificacao);
      return {
        inseridos: 0,
        ignorados: candidatos.length,
        detalhesIgnorados: candidatos.map((cliente) => ({
          nome: cliente?.nome || '(sem nome)',
          motivo: 'limite da conta atingido'
        }))
      };
    }

    const limiteMaximo = Number.isFinite(verificacao?.limites?.maxLeitores)
      ? Number(verificacao.limites.maxLeitores)
      : Number.POSITIVE_INFINITY;

    const leitoresAtuais = Number(verificacao?.leitoresAtual || 0);
    const vagasRestantes = Number.isFinite(limiteMaximo)
      ? Math.max(limiteMaximo - leitoresAtuais, 0)
      : Number.POSITIVE_INFINITY;

    const instituicaoIdAlvo = usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva;

    const clientesDaInstituicao = usuarioLogado?.perfil === 'SuperAdmin'
      ? clientes
      : clientes.filter((clienteExistente) =>
          belongsToInstitution(clienteExistente, instituicaoAtiva, {
            includeLegacyWithoutInstitution: true,
            includeInstitutionAliases: true
          })
        );

    const cpfExistente = new Set(
      clientesDaInstituicao
        .map((clienteExistente) => String(clienteExistente?.cpf || '').replace(/\D/g, ''))
        .filter(Boolean)
    );

    const cpfLote = new Set();
    const novosClientes = [];
    const detalhesIgnorados = [];

    candidatos.forEach((cliente) => {
      const nome = String(cliente?.nome || '').trim();
      const cpf = String(cliente?.cpf || '').trim();
      const cpfDigitos = cpf.replace(/\D/g, '');

      if (!nome || cpfDigitos.length !== 11) {
        detalhesIgnorados.push({ nome: nome || '(sem nome)', motivo: 'cpf inválido' });
        return;
      }

      if (cpfExistente.has(cpfDigitos)) {
        detalhesIgnorados.push({ nome, motivo: 'cpf já cadastrado' });
        return;
      }

      if (cpfLote.has(cpfDigitos)) {
        detalhesIgnorados.push({ nome, motivo: 'cpf repetido no lote' });
        return;
      }

      if (novosClientes.length >= vagasRestantes) {
        detalhesIgnorados.push({ nome, motivo: 'limite da conta atingido' });
        return;
      }

      const numeroSequencial = String(clientesDaInstituicao.length + novosClientes.length + 1).padStart(6, '0');

      const novoCliente = {
        ...cliente,
        id: gerarIdUnico(),
        instituicaoId: instituicaoIdAlvo,
        codigoIdentificacao: cliente.codigoIdentificacao || `LEIT${numeroSequencial}`,
        dataCadastro: new Date().toISOString()
      };

      novosClientes.push(novoCliente);
      cpfLote.add(cpfDigitos);
    });

    if (novosClientes.length > 0) {
      // 1) Persistir SINCRONAMENTE no localStorage antes de atualizar o estado React.
      //    O callback do setClientes no React 18 é chamado de forma assíncrona (batched),
      //    então não podemos depender dele para escrever no localStorage a tempo.
      try {
        const dadosStorage = parseJson(localStorage.getItem(DATA_KEY), {});
        if (dadosStorage && typeof dadosStorage === 'object') {
          const clientesStorage = Array.isArray(dadosStorage.clientes) ? dadosStorage.clientes : [];
          dadosStorage.clientes = [...clientesStorage, ...novosClientes];
          localStorage.setItem(DATA_KEY, JSON.stringify(dadosStorage));
        }
      } catch (_e) { /* se localStorage estiver cheio, continua mesmo assim */ }

      // 2) Marcar que uma importação em lote está em andamento.
      //    Isso bloqueia o pull periódico da nuvem pelos próximos 15 segundos,
      //    impedindo que os 20 do Supabase sobrescrevam os recém-inseridos.
      localStorage.setItem('cei_lote_import_flag', String(Date.now()));

      setClientes((clientesAtuais) => [...clientesAtuais, ...novosClientes]);
      registrarLog('adicionar', 'clientes', `${novosClientes.length} leitores cadastrados em lote`, {
        quantidade: novosClientes.length
      });
    }

    return {
      inseridos: novosClientes.length,
      ignorados: detalhesIgnorados.length,
      detalhesIgnorados
    };
  };

  const atualizarCliente = (id, dadosAtualizados) => {
    setClientes((clientesAtuais) =>
      clientesAtuais.map(c => c.id === id ? { ...c, ...dadosAtualizados } : c)
    );
    registrarLog('editar', 'clientes', `Leitor ID ${id} editado`, { clienteId: id });
  };

  const removerCliente = async (id) => {
    const idNormalizado = String(id);
    const cliente = clientes.find(c => String(c.id) === idNormalizado);

    if (!cliente) {
      return false;
    }

    const possuiHistoricoEmprestimos = emprestimos.some((emp) => {
      const clienteIdEmprestimo = emp.clienteId ?? emp.leitorId;
      return clienteIdEmprestimo !== undefined && clienteIdEmprestimo !== null && String(clienteIdEmprestimo) === idNormalizado;
    });

    if (possuiHistoricoEmprestimos) {
      alert(
        'Não é possível excluir este leitor porque há empréstimos vinculados ao cadastro.\n\n' +
        'Para preservar o histórico da biblioteca, mantenha o leitor como inativo em vez de excluir.'
      );
      return false;
    }

    const clientesAntesDaExclusao = clientes;
    setClientes((clientesAtuais) => clientesAtuais.filter(c => String(c.id) !== idNormalizado));

    const instituicaoIdAlvo = cliente.instituicaoId || instituicaoAtiva;
    if (isCloudEnabled && instituicaoIdAlvo && instituicaoIdAlvo !== 0) {
      const cloudResult = await deleteFromCloud('clientes', cliente.id, instituicaoIdAlvo);

      if (!cloudResult?.success) {
        setClientes(clientesAntesDaExclusao);
        alert(
          'Não foi possível concluir a exclusão do leitor na nuvem.\n\n' +
          'Nenhum dado foi perdido. Tente novamente em alguns instantes.'
        );
        return false;
      }
    }

    registrarLog('excluir', 'clientes', `Leitor "${cliente.nome || id}" excluído`, { clienteId: cliente.id });
    return true;
  };

  const normalizarCampoAcademico = (valor) => String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  const clientePertenceTurma = (cliente, turmaAlvo = {}) => {
    const turmaIdAlvo = String(turmaAlvo?.id || turmaAlvo?.turmaId || '').trim();
    const clienteTurmaId = String(cliente?.turmaId || '').trim();

    if (turmaIdAlvo && clienteTurmaId && clienteTurmaId === turmaIdAlvo) {
      return true;
    }

    // Fallback por nome somente quando o leitor ainda nao possui turmaId.
    // Assim evitamos mover/remover leitores vinculados a outra turma por ID.
    if (clienteTurmaId) {
      return false;
    }

    const nomeTurmaAlvo = normalizarCampoAcademico(turmaAlvo?.nomeTurma || turmaAlvo?.turma);
    if (!nomeTurmaAlvo) {
      return false;
    }

    const nomeTurmaCliente = normalizarCampoAcademico(cliente?.turma || cliente?.nomeTurma);
    if (!nomeTurmaCliente || nomeTurmaCliente !== nomeTurmaAlvo) {
      return false;
    }

    const nomeSerieAlvo = normalizarCampoAcademico(turmaAlvo?.nomeSerie || turmaAlvo?.serie);
    const nomeSerieCliente = normalizarCampoAcademico(cliente?.serie || cliente?.nomeSerie);

    return !nomeSerieAlvo || !nomeSerieCliente || nomeSerieCliente === nomeSerieAlvo;
  };

  const removerTodosClientes = async () => {
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return { removidos: 0 };
    }

    const clientesDaInstituicao = usuarioLogado?.perfil === 'SuperAdmin'
      ? clientes
      : clientes.filter((c) =>
          belongsToInstitution(c, instituicaoAtiva, {
            includeLegacyWithoutInstitution: true,
            includeInstitutionAliases: true
          })
        );

    const semEmprestimo = clientesDaInstituicao.filter((c) => {
      const idStr = String(c.id);
      return !emprestimos.some((e) => {
        const eid = e.clienteId ?? e.leitorId;
        return eid !== undefined && eid !== null && String(eid) === idStr;
      });
    });

    if (semEmprestimo.length === 0) {
      return { removidos: 0 };
    }

    const clientesAntesDaExclusao = clientes;
    const idsRemover = new Set(semEmprestimo.map((c) => String(c.id)));
    setClientes((prev) => prev.filter((c) => !idsRemover.has(String(c.id))));

    let falhasNuvem = [];

    if (isCloudEnabled && instituicaoAtiva && instituicaoAtiva !== 0) {
      for (const c of semEmprestimo) {
        const cloudResult = await deleteFromCloud('clientes', c.id, c.instituicaoId || instituicaoAtiva);
        if (!cloudResult?.success) {
          falhasNuvem.push(c);
        }
      }
    }

    if (falhasNuvem.length > 0) {
      const falhaIds = new Set(falhasNuvem.map((c) => String(c.id)));

      setClientes((prev) => {
        const idsAtuais = new Set(prev.map((c) => String(c.id)));
        const restaurar = clientesAntesDaExclusao.filter(
          (c) => falhaIds.has(String(c.id)) && !idsAtuais.has(String(c.id))
        );
        return [...prev, ...restaurar];
      });

      const removidosComSucesso = semEmprestimo.length - falhasNuvem.length;

      alert(
        `Exclusão em lote concluída com ressalvas.\n\n` +
        `Excluídos com sucesso: ${removidosComSucesso}\n` +
        `Não excluídos na nuvem: ${falhasNuvem.length}\n\n` +
        `Os leitores com falha foram restaurados para evitar retorno inesperado.`
      );

      registrarLog('excluir', 'clientes', `${removidosComSucesso} leitores excluídos em massa (${falhasNuvem.length} falhas na nuvem)`, {
        quantidade: removidosComSucesso,
        falhasNuvem: falhasNuvem.length
      });

      return { removidos: removidosComSucesso, falhas: falhasNuvem.length };
    }

    registrarLog('excluir', 'clientes', `${semEmprestimo.length} leitores excluídos em massa`, { quantidade: semEmprestimo.length });
    return { removidos: semEmprestimo.length, falhas: 0 };
  };

  const removerClientesPorTurma = async (turmaAlvo = {}) => {
    if (!instituicaoAtiva && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada');
      return { totalTurma: 0, removidos: 0, preservadosHistorico: 0, falhas: 0 };
    }

    const turmaIdAlvo = String(turmaAlvo?.id || turmaAlvo?.turmaId || '').trim();
    const nomeTurmaAlvo = String(turmaAlvo?.nomeTurma || turmaAlvo?.turma || '').trim();

    if (!turmaIdAlvo && !nomeTurmaAlvo) {
      alert('Selecione uma turma válida para excluir os leitores.');
      return { totalTurma: 0, removidos: 0, preservadosHistorico: 0, falhas: 0 };
    }

    const clientesDaInstituicao = usuarioLogado?.perfil === 'SuperAdmin'
      ? clientes
      : clientes.filter((c) =>
          belongsToInstitution(c, instituicaoAtiva, {
            includeLegacyWithoutInstitution: true,
            includeInstitutionAliases: true
          })
        );

    const clientesDaTurma = clientesDaInstituicao.filter((cliente) => clientePertenceTurma(cliente, turmaAlvo));

    if (clientesDaTurma.length === 0) {
      return { totalTurma: 0, removidos: 0, preservadosHistorico: 0, falhas: 0 };
    }

    const semEmprestimo = clientesDaTurma.filter((c) => {
      const idStr = String(c.id);
      return !emprestimos.some((e) => {
        const eid = e.clienteId ?? e.leitorId;
        return eid !== undefined && eid !== null && String(eid) === idStr;
      });
    });

    const preservadosHistorico = Math.max(clientesDaTurma.length - semEmprestimo.length, 0);

    if (semEmprestimo.length === 0) {
      return {
        totalTurma: clientesDaTurma.length,
        removidos: 0,
        preservadosHistorico,
        falhas: 0
      };
    }

    const clientesAntesDaExclusao = clientes;
    const idsRemover = new Set(semEmprestimo.map((c) => String(c.id)));
    setClientes((prev) => prev.filter((c) => !idsRemover.has(String(c.id))));

    const falhasNuvem = [];

    if (isCloudEnabled) {
      for (const c of semEmprestimo) {
        const instituicaoIdCliente = c.instituicaoId || instituicaoAtiva;
        if (!instituicaoIdCliente || instituicaoIdCliente === 0) {
          continue;
        }

        const cloudResult = await deleteFromCloud('clientes', c.id, instituicaoIdCliente);
        if (!cloudResult?.success) {
          falhasNuvem.push(c);
        }
      }
    }

    const nomeTurmaLog = nomeTurmaAlvo || 'turma selecionada';

    if (falhasNuvem.length > 0) {
      const falhaIds = new Set(falhasNuvem.map((c) => String(c.id)));

      setClientes((prev) => {
        const idsAtuais = new Set(prev.map((c) => String(c.id)));
        const restaurar = clientesAntesDaExclusao.filter(
          (c) => falhaIds.has(String(c.id)) && !idsAtuais.has(String(c.id))
        );
        return [...prev, ...restaurar];
      });

      const removidosComSucesso = semEmprestimo.length - falhasNuvem.length;

      registrarLog('excluir', 'clientes', `${removidosComSucesso} leitores excluídos da turma "${nomeTurmaLog}" (${falhasNuvem.length} falhas na nuvem)`, {
        quantidade: removidosComSucesso,
        falhasNuvem: falhasNuvem.length,
        turma: nomeTurmaLog
      });

      return {
        totalTurma: clientesDaTurma.length,
        removidos: removidosComSucesso,
        preservadosHistorico,
        falhas: falhasNuvem.length
      };
    }

    registrarLog('excluir', 'clientes', `${semEmprestimo.length} leitores excluídos da turma "${nomeTurmaLog}"`, {
      quantidade: semEmprestimo.length,
      turma: nomeTurmaLog
    });

    return {
      totalTurma: clientesDaTurma.length,
      removidos: semEmprestimo.length,
      preservadosHistorico,
      falhas: 0
    };
  };

  const getClientesFiltrados = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return clientes;
    }
    return clientes.filter((c) =>
      belongsToInstitution(c, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
  };

  // ==================== FUNÇÕES PARA SÉRIES E TURMAS ====================

  const getSeriesAcademicasFiltradas = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return seriesAcademicas;
    }
    return seriesAcademicas.filter((serie) =>
      belongsToInstitution(serie, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
  };

  const getTurmasAcademicasFiltradas = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return turmasAcademicas;
    }
    return turmasAcademicas.filter((turma) =>
      belongsToInstitution(turma, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
  };

  const adicionarSerieAcademica = (serieData) => {
    if (!serieData?.nomeSerie) {
      alert('Informe o nome da série.');
      return null;
    }

    const instituicaoIdAlvo = usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva;
    if (!instituicaoIdAlvo && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada.');
      return null;
    }

    const nomeNormalizado = String(serieData.nomeSerie).trim().toLowerCase();
    const anoLetivoNormalizado = String(serieData.anoLetivo || '').trim();

    const duplicada = seriesAcademicas.some((serie) => {
      return (
        serie.instituicaoId === instituicaoIdAlvo &&
        String(serie.nomeSerie || '').trim().toLowerCase() === nomeNormalizado &&
        String(serie.anoLetivo || '').trim() === anoLetivoNormalizado
      );
    });

    if (duplicada) {
      alert('Já existe uma série com esse nome e ano letivo.');
      return null;
    }

    const novaSerie = {
      id: gerarIdUnico(),
      instituicaoId: instituicaoIdAlvo,
      nomeSerie: String(serieData.nomeSerie).trim(),
      anoLetivo: String(serieData.anoLetivo || '').trim(),
      descricao: serieData.descricao || '',
      ativo: serieData.ativo !== false,
      dataCadastro: new Date().toISOString()
    };

    setSeriesAcademicas((prev) => [...prev, novaSerie]);
    registrarLog('adicionar', 'series-turmas', `Série "${novaSerie.nomeSerie}" cadastrada`, {
      serieId: novaSerie.id
    });
    return novaSerie;
  };

  const atualizarSerieAcademica = (id, dadosAtualizados) => {
    const serieAtual = seriesAcademicas.find((serie) => String(serie.id) === String(id));
    if (!serieAtual) return;

    const serieAtualizada = {
      ...serieAtual,
      ...dadosAtualizados,
      nomeSerie: String(dadosAtualizados?.nomeSerie || serieAtual.nomeSerie || '').trim(),
      anoLetivo: String(dadosAtualizados?.anoLetivo || serieAtual.anoLetivo || '').trim(),
      dataAtualizacao: new Date().toISOString()
    };

    setSeriesAcademicas((prev) => prev.map((serie) => String(serie.id) === String(id) ? serieAtualizada : serie));

    if (serieAtualizada.nomeSerie !== serieAtual.nomeSerie) {
      setClientes((prev) => prev.map((cliente) => {
        if (String(cliente.serieId || '') !== String(id)) return cliente;
        return { ...cliente, serie: serieAtualizada.nomeSerie };
      }));
    }

    registrarLog('editar', 'series-turmas', `Série "${serieAtualizada.nomeSerie}" atualizada`, {
      serieId: serieAtualizada.id
    });
  };

  const removerSerieAcademica = (id) => {
    const serie = seriesAcademicas.find((item) => String(item.id) === String(id));
    if (!serie) return false;

    const possuiTurmasVinculadas = turmasAcademicas.some((turma) => String(turma.serieId || '') === String(id));
    if (possuiTurmasVinculadas) {
      alert('Não é possível excluir a série porque existem turmas vinculadas.');
      return false;
    }

    setSeriesAcademicas((prev) => prev.filter((item) => String(item.id) !== String(id)));

    setClientes((prev) => prev.map((cliente) => {
      if (String(cliente.serieId || '') !== String(id)) return cliente;
      return { ...cliente, serieId: null };
    }));

    registrarLog('excluir', 'series-turmas', `Série "${serie.nomeSerie}" removida`, {
      serieId: serie.id
    });
    return true;
  };

  const adicionarTurmaAcademica = (turmaData) => {
    if (!turmaData?.nomeTurma) {
      alert('Informe o nome da turma.');
      return null;
    }

    const instituicaoIdAlvo = usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva;
    if (!instituicaoIdAlvo && usuarioLogado?.perfil !== 'SuperAdmin') {
      alert('Instituição não selecionada.');
      return null;
    }

    const serieSelecionada = seriesAcademicas.find((serie) => String(serie.id) === String(turmaData.serieId));
    const serieFallbackValida = turmaData?.serieFallback
      && String(turmaData.serieFallback.id) === String(turmaData.serieId)
      ? turmaData.serieFallback
      : null;
    const serieResolvida = serieSelecionada || serieFallbackValida;

    if (!serieResolvida) {
      alert('Selecione uma série válida para a turma.');
      return null;
    }

    const nomeTurmaNormalizado = String(turmaData.nomeTurma).trim().toLowerCase();
    const anoLetivoNormalizado = String(turmaData.anoLetivo || serieResolvida.anoLetivo || '').trim();

    const duplicada = turmasAcademicas.some((turma) => {
      return (
        turma.instituicaoId === instituicaoIdAlvo &&
        String(turma.nomeTurma || '').trim().toLowerCase() === nomeTurmaNormalizado &&
        String(turma.serieId || '') === String(serieResolvida.id) &&
        String(turma.anoLetivo || '').trim() === anoLetivoNormalizado
      );
    });

    if (duplicada) {
      alert('Já existe uma turma com esses dados.');
      return null;
    }

    const novaTurma = {
      id: gerarIdUnico(),
      instituicaoId: instituicaoIdAlvo,
      serieId: serieResolvida.id,
      nomeSerie: serieResolvida.nomeSerie,
      nomeTurma: String(turmaData.nomeTurma).trim(),
      anoLetivo: anoLetivoNormalizado,
      turno: turmaData.turno || '',
      ativo: turmaData.ativo !== false,
      dataCadastro: new Date().toISOString()
    };

    setTurmasAcademicas((prev) => [...prev, novaTurma]);
    registrarLog('adicionar', 'series-turmas', `Turma "${novaTurma.nomeTurma}" cadastrada`, {
      turmaId: novaTurma.id,
      serieId: serieResolvida.id
    });
    return novaTurma;
  };

  const atualizarTurmaAcademica = (id, dadosAtualizados) => {
    const turmaAtual = turmasAcademicas.find((turma) => String(turma.id) === String(id));
    if (!turmaAtual) return;

    const serieSelecionada = seriesAcademicas.find((serie) => String(serie.id) === String(dadosAtualizados?.serieId || turmaAtual.serieId));
    if (!serieSelecionada) {
      alert('Série vinculada não encontrada.');
      return;
    }

    const turmaAtualizada = {
      ...turmaAtual,
      ...dadosAtualizados,
      nomeTurma: String(dadosAtualizados?.nomeTurma || turmaAtual.nomeTurma || '').trim(),
      serieId: serieSelecionada.id,
      nomeSerie: serieSelecionada.nomeSerie,
      anoLetivo: String(dadosAtualizados?.anoLetivo || turmaAtual.anoLetivo || serieSelecionada.anoLetivo || '').trim(),
      dataAtualizacao: new Date().toISOString()
    };

    setTurmasAcademicas((prev) => prev.map((turma) => String(turma.id) === String(id) ? turmaAtualizada : turma));

    const turmaIdAtual = String(id);
    const nomeTurmaAnterior = normalizarCampoAcademico(turmaAtual.nomeTurma);
    const nomeSerieAnterior = normalizarCampoAcademico(turmaAtual.nomeSerie);

    setClientes((prev) => prev.map((cliente) => {
      const clienteTurmaId = String(cliente.turmaId || '').trim();
      const vinculoPorId = clienteTurmaId === turmaIdAtual;

      const nomeTurmaCliente = normalizarCampoAcademico(cliente.turma || cliente.nomeTurma);
      const nomeSerieCliente = normalizarCampoAcademico(cliente.serie || cliente.nomeSerie);
      const vinculoLegacyPorNome = (
        !clienteTurmaId
        && nomeTurmaAnterior.length > 0
        && nomeTurmaCliente === nomeTurmaAnterior
        && (!nomeSerieAnterior || !nomeSerieCliente || nomeSerieCliente === nomeSerieAnterior)
      );

      if (!vinculoPorId && !vinculoLegacyPorNome) {
        return cliente;
      }

      return {
        ...cliente,
        turmaId: turmaAtualizada.id,
        turma: turmaAtualizada.nomeTurma,
        nomeTurma: turmaAtualizada.nomeTurma,
        serie: turmaAtualizada.nomeSerie,
        nomeSerie: turmaAtualizada.nomeSerie,
        serieId: turmaAtualizada.serieId
      };
    }));

    registrarLog('editar', 'series-turmas', `Turma "${turmaAtualizada.nomeTurma}" atualizada`, {
      turmaId: turmaAtualizada.id
    });
  };

  const removerTurmaAcademica = (id) => {
    const turma = turmasAcademicas.find((item) => String(item.id) === String(id));
    if (!turma) return false;

    const turmaId = String(id);
    const nomeTurmaNormalizado = normalizarCampoAcademico(turma.nomeTurma);
    const nomeSerieNormalizado = normalizarCampoAcademico(turma.nomeSerie);

    setTurmasAcademicas((prev) => prev.filter((item) => String(item.id) !== String(id)));

    setClientes((prev) => prev.map((cliente) => {
      const clienteTurmaId = String(cliente.turmaId || '').trim();
      const vinculoPorId = clienteTurmaId === turmaId;

      const nomeTurmaCliente = normalizarCampoAcademico(cliente.turma || cliente.nomeTurma);
      const nomeSerieCliente = normalizarCampoAcademico(cliente.serie || cliente.nomeSerie);
      const vinculoPorNome = (
        !clienteTurmaId
        && nomeTurmaNormalizado.length > 0
        && nomeTurmaCliente === nomeTurmaNormalizado
        && (!nomeSerieNormalizado || !nomeSerieCliente || nomeSerieCliente === nomeSerieNormalizado)
      );

      if (!vinculoPorId && !vinculoPorNome) {
        return cliente;
      }

      const turmaTexto = String(cliente.turma || cliente.nomeTurma || turma.nomeTurma || '').trim();
      const serieTexto = String(cliente.serie || cliente.nomeSerie || turma.nomeSerie || '').trim();

      return {
        ...cliente,
        turmaId: '',
        turma: '',
        nomeTurma: '',
        serie: serieTexto,
        nomeSerie: serieTexto
      };
    }));

    registrarLog('excluir', 'series-turmas', `Turma "${turma.nomeTurma}" removida`, {
      turmaId: turma.id
    });
    return true;
  };

  // ==================== FUNÇÕES PARA EMPRÉSTIMOS ====================
  
  const adicionarEmprestimo = (emprestimoData) => {
    const emprestimoId = gerarIdUnico();
    const numeroSequencial = emprestimoId.toString().padStart(6, '0');
    const codigoEmprestimo = `EMP${numeroSequencial}`;
    
    // Buscar dados do livro
    const livro = livros.find(l => l.id === emprestimoData.livroId);
    
    // Buscar dados do leitor
    const leitor = clientes.find(c => c.id === emprestimoData.clienteId);

    // Resolver vínculo acadêmico (turma/série) para rastreabilidade de lotes e relatórios
    const turmaIdBruto = emprestimoData?.turmaId ?? leitor?.turmaId ?? null;
    const turmaVinculada = turmasAcademicas.find((turma) => {
      if (turmaIdBruto === null || turmaIdBruto === undefined) return false;
      return String(turma.id) === String(turmaIdBruto);
    });

    const turmaIdResolvida = turmaVinculada?.id
      ?? (String(turmaIdBruto || '').trim().length > 0 ? turmaIdBruto : null);
    const turmaNomeResolvida = String(
      emprestimoData?.turmaNome
      || turmaVinculada?.nomeTurma
      || leitor?.turma
      || leitor?.nomeTurma
      || ''
    ).trim();
    const serieNomeResolvida = String(
      emprestimoData?.serieNome
      || turmaVinculada?.nomeSerie
      || leitor?.serie
      || leitor?.nomeSerie
      || ''
    ).trim();
    
    // Buscar dados da instituição
    const instituicaoIdAtual = usuarioLogado?.perfil === 'SuperAdmin' ? 0 : instituicaoAtiva;
    const instituicao = instituicoes.find(i => i.id === instituicaoIdAtual);
    
    // Gerar dados completos do termo de empréstimo
    const dadosTermoEmprestimo = {
      codigoEmprestimo: codigoEmprestimo,
      dataEmprestimo: emprestimoData.dataEmprestimo || new Date().toISOString(),
      dataDevolucao: emprestimoData.dataDevolucaoPrevista,
      
      // Dados do Livro
      livroCodigo: livro?.codigoIdentificacao || 'N/A',
      livroTitulo: livro?.titulo || 'N/A',
      livroAutor: livro?.autor || 'N/A',
      livroISBN: livro?.isbn || 'N/A',
      livroEditora: livro?.editora || 'N/A',
      livroTipo: livro?.tipo || 'N/A',
      
      // Dados do Leitor
      leitorCodigo: leitor?.codigoIdentificacao || 'N/A',
      leitorNome: leitor?.nome || 'N/A',
      leitorCPF: leitor?.cpf || 'N/A',
      leitorTelefone: leitor?.telefone || 'N/A',
      leitorEmail: leitor?.email || 'N/A',
      leitorEndereco: leitor?.endereco || 'N/A',
      leitorMatricula: leitor?.matricula || '',
      leitorTurma: turmaNomeResolvida || 'N/A',
      leitorSerie: serieNomeResolvida || 'N/A',
      
      // Dados da Instituição
      instituicaoNome: instituicao?.nomeInstituicao || 'N/A',
      instituicaoCidade: instituicao?.cidade || 'N/A',
      responsavelNome: instituicao?.nomeResponsavel || usuarioLogado?.nome || 'N/A',
      responsavelCargo: instituicao?.cargoResponsavel || usuarioLogado?.cargo || 'Responsável',
      
      // Observações
      observacoes: emprestimoData.observacoes || ''
    };
    
    const novoEmprestimo = {
      ...emprestimoData,
      id: emprestimoId,
      codigoEmprestimo: codigoEmprestimo,
      instituicaoId: instituicaoIdAtual,
      turmaId: turmaIdResolvida,
      turmaNome: turmaNomeResolvida,
      serieNome: serieNomeResolvida,
      dataEmprestimo: emprestimoData.dataEmprestimo || new Date().toISOString(),
      dadosTermoEmprestimo: dadosTermoEmprestimo
    };
    setEmprestimos((prev) => [...prev, novoEmprestimo]);
    registrarLog('emprestimo', 'emprestimos', `Empréstimo "${codigoEmprestimo}" criado`, {
      emprestimoId: novoEmprestimo.id,
      livroId: emprestimoData.livroId,
      clienteId: emprestimoData.clienteId
    });
    return novoEmprestimo;
  };

  const atualizarEmprestimo = (id, dadosAtualizados) => {
    setEmprestimos((prev) => prev.map(e => e.id === id ? { ...e, ...dadosAtualizados } : e));
    registrarLog('editar', 'emprestimos', `Empréstimo ID ${id} editado`, { emprestimoId: id });
  };

  const devolverLivro = (emprestimoId) => {
    const emprestimo = emprestimos.find(e => e.id === emprestimoId);
    if (emprestimo) {
      atualizarEmprestimo(emprestimoId, {
        status: 'devolvido',
        dataDevolucaoReal: new Date().toISOString()
      });
      registrarLog('devolucao', 'emprestimos', `Empréstimo "${emprestimo.codigoEmprestimo || emprestimoId}" devolvido`, {
        emprestimoId
      });
    }
  };

  const renovarEmprestimo = (emprestimoId, diasAdicionais = 7) => {
    const emprestimo = emprestimos.find(e => e.id === emprestimoId);
    if (emprestimo && emprestimo.status === 'ativo') {
      const novaDataDevolucao = new Date(emprestimo.dataDevolucao);
      novaDataDevolucao.setDate(novaDataDevolucao.getDate() + diasAdicionais);
      
      atualizarEmprestimo(emprestimoId, {
        dataDevolucao: novaDataDevolucao.toISOString(),
        renovado: true,
        dataRenovacao: new Date().toISOString()
      });
      registrarLog('editar', 'emprestimos', `Empréstimo "${emprestimo.codigoEmprestimo || emprestimoId}" renovado`, {
        emprestimoId,
        diasAdicionais
      });
    }
  };

  const getEmprestimosFiltrados = () => {
    if (usuarioLogado?.perfil === 'SuperAdmin') {
      return emprestimos;
    }
    return emprestimos.filter((e) =>
      belongsToInstitution(e, instituicaoAtiva, {
        includeLegacyWithoutInstitution: true,
        includeInstitutionAliases: true
      })
    );
  };

  // ==================== FUNÇÕES DE NOTAS FISCAIS ====================
  
  const adicionarNotaFiscal = (notaData) => {
    const proximoNumero = notasFiscais.length > 0 
      ? Math.max(...notasFiscais.map(n => n.numero)) + 1 
      : 1;
    
    const novaNota = {
      ...notaData,
      id: notasFiscais.length > 0 ? Math.max(...notasFiscais.map(n => n.id)) + 1 : 1,
      numero: proximoNumero,
      dataEmissao: new Date().toISOString()
    };
    
    setNotasFiscais([...notasFiscais, novaNota]);
    return novaNota;
  };

  const gerarNotaFiscalAutomaticaPagamento = ({
    instituicaoId,
    valor,
    plano,
    transacaoId,
    metodoPagamento,
    dataPagamento
  }) => {
    const instituicao = instituicoes.find(i => i.id === instituicaoId);
    if (!instituicao) return null;

    const notaDuplicada = notasFiscais.find((nota) => {
      if (transacaoId && nota.transacaoIdPagamento) {
        return nota.transacaoIdPagamento === transacaoId;
      }
      return false;
    });

    if (notaDuplicada) {
      return notaDuplicada;
    }

    let prestador = DEFAULT_PRESTADOR;
    let prefeituraBeneficiada = DEFAULT_PREFEITURA_CURIMATA;

    try {
      const prestadorSalvo = localStorage.getItem(STORAGE_PRESTADOR);
      if (prestadorSalvo) {
        const parsedPrestador = JSON.parse(prestadorSalvo);
        const documentoMigrado = parsedPrestador.documento || parsedPrestador.cnpj || '';
        const tipoMigrado = parsedPrestador.tipoDocumento || ((documentoMigrado || '').replace(/\D/g, '').length === 11 ? 'CPF' : 'CNPJ');
        prestador = {
          ...DEFAULT_PRESTADOR,
          ...parsedPrestador,
          tipoDocumento: tipoMigrado,
          documento: documentoMigrado
        };
      }

      const prefeituraSalva = localStorage.getItem(STORAGE_PREFEITURA);
      if (prefeituraSalva) {
        prefeituraBeneficiada = {
          ...DEFAULT_PREFEITURA_CURIMATA,
          ...JSON.parse(prefeituraSalva)
        };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações fiscais para emissão automática:', error);
    }

    const valorServico = Number(valor || instituicao.valorMensal || 0);
    const aliquotaISS = 2;
    const valorISS = (valorServico * aliquotaISS) / 100;
    const valorLiquido = valorServico - valorISS;
    const competenciaBase = dataPagamento ? new Date(dataPagamento) : new Date();
    const competencia = `${competenciaBase.getFullYear()}-${String(competenciaBase.getMonth() + 1).padStart(2, '0')}`;
    const descricaoPlano = plano || instituicao.plano || 'Licenciamento CEI';

    const nota = {
      instituicaoClienteId: instituicao.id,
      serie: 'A1',
      competencia,
      codigoServico: '1.05',
      naturezaOperacao: 'Prestação de serviço de licenciamento de software',
      descricaoServico: `Licença do sistema CEI referente ao plano ${descricaoPlano}.`,
      valorServico,
      aliquotaISS,
      observacoes: `Nota gerada automaticamente após confirmação do pagamento (${(metodoPagamento || 'pix').toUpperCase()}).`,
      status: 'emitida',
      chaveControle: `AUTO-${Date.now()}-${instituicao.id}`,
      clienteNome: instituicao.nomeInstituicao,
      clienteCnpj: instituicao.cnpj || 'Não informado',
      clienteEndereco: instituicao.endereco || 'Não informado',
      clienteCidade: instituicao.cidade,
      clienteEstado: instituicao.estado,
      clienteCep: instituicao.cep || '',
      valorISS,
      valorLiquido,
      instituicaoId: instituicao.id,
      prestadorNome: prestador.razaoSocial,
      prestadorNomeFantasia: prestador.nomeFantasia,
      prestadorDocumentoTipo: prestador.tipoDocumento,
      prestadorDocumento: prestador.documento,
      prestadorCnpj: prestador.tipoDocumento === 'CNPJ' ? prestador.documento : '',
      prestadorInscricaoMunicipal: prestador.inscricaoMunicipal,
      prestadorEndereco: prestador.endereco,
      prestadorCep: prestador.cep,
      prestadorCidade: prestador.municipio,
      prestadorEstado: prestador.uf,
      prestadorTelefone: prestador.telefone,
      prestadorEmail: prestador.email,
      beneficiarioRazaoSocial: prefeituraBeneficiada.razaoSocial,
      beneficiarioCnpj: prefeituraBeneficiada.cnpj,
      beneficiarioEndereco: prefeituraBeneficiada.endereco,
      beneficiarioCep: prefeituraBeneficiada.cep,
      beneficiarioCidade: prefeituraBeneficiada.municipio,
      beneficiarioEstado: prefeituraBeneficiada.uf,
      beneficiarioTelefone: prefeituraBeneficiada.telefone,
      beneficiarioEmail: prefeituraBeneficiada.email,
      origemEmissao: 'pagamento_automatico',
      transacaoIdPagamento: transacaoId || null,
      metodoPagamento: metodoPagamento || 'pix'
    };

    return adicionarNotaFiscal(nota);
  };

  // ==================== FUNÇÕES DE LOG DE ATIVIDADES ====================
  
  const registrarLog = (acao, modulo, descricao, detalhes = {}) => {
    const novoLog = {
      id: logAtividades.length > 0 ? Math.max(...logAtividades.map(l => l.id)) + 1 : 1,
      usuarioId: usuarioLogado?.id,
      usuarioNome: usuarioLogado?.nome,
      instituicaoId: instituicaoAtiva,
      acao, // adicionar, editar, excluir, emprestimo, devolucao, etc
      modulo, // livros, leitores, emprestimos, etc
      descricao,
      detalhes,
      dataHora: new Date().toISOString()
    };
    
    setLogAtividades([...logAtividades, novoLog]);
    return novoLog;
  };

  const registrarAcessoPagina = (path, titulo = '') => {
    if (!usuarioLogado) return null;

    const ultimoLog = logAtividades.length > 0 ? logAtividades[logAtividades.length - 1] : null;
    const agora = new Date();

    if (
      ultimoLog &&
      ultimoLog.acao === 'acesso' &&
      ultimoLog.modulo === 'navegacao' &&
      ultimoLog.usuarioId === usuarioLogado.id &&
      ultimoLog.detalhes?.path === path
    ) {
      const dataUltimoLog = new Date(ultimoLog.dataHora);
      const diferencaSegundos = Math.floor((agora - dataUltimoLog) / 1000);
      if (diferencaSegundos <= 15) {
        return null;
      }
    }

    return registrarLog('acesso', 'navegacao', `Acesso à página ${titulo || path}`, {
      path,
      titulo
    });
  };

  // ==================== FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS ====================
  
  const adicionarUsuario = (usuarioData) => {
    const novoUsuario = {
      ...usuarioData,
      id: gerarIdUnico(),
      dataCriacao: new Date().toISOString()
    };
    
    setUsuarios([...usuarios, novoUsuario]);
    registrarLog('adicionar', 'usuarios', `Usuário "${novoUsuario.nome}" adicionado`, { usuarioId: novoUsuario.id });
    return novoUsuario;
  };

  const editarUsuario = (id, dadosAtualizados) => {
    const usuariosAtualizados = usuarios.map(u => {
      if (u.id !== id) return u;

      const usuarioAtualizado = {
        ...u,
        ...dadosAtualizados,
        dataAtualizacao: new Date().toISOString()
      };

      if (usuarioLogado?.id === id) {
        setUsuarioLogado(usuarioAtualizado);
        localStorage.setItem('cei_usuario_logado', JSON.stringify(usuarioAtualizado));
      }

      return usuarioAtualizado;
    });
    setUsuarios(usuariosAtualizados);
    registrarLog('editar', 'usuarios', `Usuário "${dadosAtualizados.nome}" editado`, { usuarioId: id });
  };

  const excluirUsuario = (id) => {
    const usuario = usuarios.find(u => u.id === id);
    setUsuarios(usuarios.filter(u => u.id !== id));

    const instituicaoIdAlvo = usuario?.instituicaoId || instituicaoAtiva;
    if (isCloudEnabled && instituicaoIdAlvo && instituicaoIdAlvo !== 0 && usuario?.perfil !== 'SuperAdmin') {
      deleteFromCloud('usuarios', id, instituicaoIdAlvo);
    }

    registrarLog('excluir', 'usuarios', `Usuário "${usuario?.nome}" excluído`, { usuarioId: id });
  };

  // ==================== AUTENTICAÇÃO ====================

  const gerarDemoDeviceId = () => {
    const existente = localStorage.getItem(DEMO_DEVICE_ID_KEY);
    if (existente) return existente;

    const novo = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(DEMO_DEVICE_ID_KEY, novo);
    return novo;
  };

  const hashNumerico = (texto) => {
    let hash = 0;
    for (let i = 0; i < texto.length; i += 1) {
      hash = ((hash << 5) - hash) + texto.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const prepararContaDemoPorDispositivo = () => {
    const baseInstituicaoDemo = instituicoes.find(i => i.contaTeste) || instituicoesPadrao.find(i => i.contaTeste);
    const baseUsuarioDemo = usuarios.find(u => u.contaTeste) || usuariosPadrao.find(u => u.contaTeste);

    if (!baseInstituicaoDemo || !baseUsuarioDemo) {
      console.error('❌ Conta demo base não encontrada para provisionamento por dispositivo');
      return null;
    }

    const deviceId = gerarDemoDeviceId();
    const hash = hashNumerico(deviceId);
    const sufixo = hash.toString(36).slice(0, 6).padEnd(6, '0');
    const loginDemo = `demo_${sufixo}`;
    const instituicaoIdDemo = 900000 + (hash % 90000);
    const usuarioIdDemo = 1900000 + (hash % 900000);
    const agora = Date.now();
    const trintaDiasMs = 30 * 24 * 60 * 60 * 1000;

    let contatoDemo = null;
    try {
      const contatoSalvo = localStorage.getItem(DEMO_CONTACT_KEY);
      contatoDemo = contatoSalvo ? JSON.parse(contatoSalvo) : null;
    } catch (error) {
      console.warn('⚠️ Não foi possível ler os dados de contato da demo:', error);
    }

    const nomeResponsavelContato = String(contatoDemo?.nomeResponsavel || '').trim();
    const telefoneContato = String(contatoDemo?.telefoneCelular || contatoDemo?.telefone || '').trim();
    const emailContato = String(contatoDemo?.email || '').trim().toLowerCase();
    const cidadeContato = String(contatoDemo?.cidade || '').trim();
    const estadoContato = String(contatoDemo?.estado || '').trim().toUpperCase().slice(0, 2);
    const contatoDemoValido = Boolean(
      nomeResponsavelContato && telefoneContato && emailContato && cidadeContato && estadoContato
    );

    const instituicaoExistente = instituicoes.find(
      i => i.id === instituicaoIdDemo || i.loginAdmin === loginDemo || i.demoDeviceId === deviceId
    );

    const instituicaoDemoBase = instituicaoExistente || {
      ...baseInstituicaoDemo,
      id: instituicaoIdDemo,
      nomeInstituicao: `Escola Demo ${sufixo.toUpperCase()}`,
      nomeResponsavel: `Usuário Demo ${sufixo.toUpperCase()}`,
      email: `${loginDemo}@cei-demo.com.br`,
      emailResponsavel: `${loginDemo}@cei-demo.com.br`,
      loginAdmin: loginDemo,
      senhaAdmin: 'demo2026',
      dataCadastro: new Date().toISOString(),
      dataAtivacao: new Date().toISOString(),
      dataExpiracao: new Date(agora + trintaDiasMs).toISOString(),
      status: 'ativo',
      statusFinanceiro: 'teste',
      contaTeste: true,
      demoDeviceId: deviceId,
      limites: {
        maxLivros: 20,
        maxLeitores: 20
      }
    };

    const instituicaoDemo = contatoDemoValido
      ? {
          ...instituicaoDemoBase,
          nomeResponsavel: nomeResponsavelContato,
          telefone: telefoneContato,
          email: emailContato,
          telefoneResponsavel: telefoneContato,
          emailResponsavel: emailContato,
          cidade: cidadeContato,
          estado: estadoContato,
          origemCadastro: 'demo_login',
          contatoDemoCapturado: true,
          contatoDemoCapturadoEm: contatoDemo?.capturadoEm || instituicaoDemoBase.contatoDemoCapturadoEm || new Date().toISOString()
        }
      : instituicaoDemoBase;

    if (!instituicaoExistente) {
      setInstituicoes(prev => [...prev, instituicaoDemo]);
    } else if (contatoDemoValido) {
      setInstituicoes(prev => prev.map((inst) => {
        if (String(inst.id) !== String(instituicaoExistente.id)) return inst;
        return { ...inst, ...instituicaoDemo };
      }));
    }

    const usuarioExistente = usuarios.find(
      u => u.id === usuarioIdDemo || u.login === loginDemo || u.demoDeviceId === deviceId
    );

    const usuarioDemo = usuarioExistente || {
      ...baseUsuarioDemo,
      id: usuarioIdDemo,
      nome: contatoDemoValido ? nomeResponsavelContato : `Usuário Demo ${sufixo.toUpperCase()}`,
      login: loginDemo,
      senha: 'demo2026',
      email: contatoDemoValido ? emailContato : `${loginDemo}@cei-demo.com.br`,
      instituicaoId: instituicaoDemo.id,
      contaTeste: true,
      demoDeviceId: deviceId,
      status: 'ativo',
      dataCriacao: new Date().toISOString()
    };

    if (!usuarioExistente) {
      setUsuarios(prev => [...prev, usuarioDemo]);
    } else if (contatoDemoValido) {
      setUsuarios(prev => prev.map((u) => {
        if (String(u.id) !== String(usuarioExistente.id)) return u;
        return {
          ...u,
          nome: nomeResponsavelContato,
          email: emailContato,
          dataAtualizacao: new Date().toISOString()
        };
      }));
    }

    return {
      usuarioDemo,
      instituicaoDemo
    };
  };
  
  const login = (loginData, senha) => {
    console.log('=== TENTATIVA DE LOGIN ===');
    console.log('Login fornecido:', loginData);
    console.log('Senha fornecida (length):', senha?.length);
    console.log('Total de usuários cadastrados:', usuarios.length);
    
    // Fazer trim nos dados de entrada
    const loginTrim = loginData?.trim();
    const senhaTrim = senha?.trim();
    
    console.log('Usuários disponíveis:');
    usuarios.forEach(u => {
      console.log(`  - Login: "${u.login}" | Senha (length): ${u.senha?.length} | Perfil: ${u.perfil} | InstituicaoId: ${u.instituicaoId}`);
    });
    
    let usuario = null;

    if (loginTrim?.toLowerCase() === 'demo' && senhaTrim === 'demo2026') {
      const contaDemoProvisionada = prepararContaDemoPorDispositivo();
      if (contaDemoProvisionada?.usuarioDemo) {
        usuario = contaDemoProvisionada.usuarioDemo;
      }
    }

    if (!usuario) {
      usuario = usuarios.find(u => {
        const loginUsuario = u.login?.trim()?.toLowerCase();
        const emailUsuario = u.email?.trim()?.toLowerCase();
        const entradaLogin = loginTrim?.toLowerCase();
        return (
          (loginUsuario === entradaLogin || emailUsuario === entradaLogin) &&
          u.senha?.trim() === senhaTrim
        );
      });
    }

    if (!usuario) {
      const credenciaisAlternativas = [
        { login: 'cetidesamaral', senha: 'Ceti@2727', targetId: 2 },
        { login: 'michaela@ceti.com', senha: 'Biblio@2027', targetId: 3 }
      ];

      const alternativa = credenciaisAlternativas.find(
        (cred) => cred.login.toLowerCase() === loginTrim?.toLowerCase() && cred.senha === senhaTrim
      );

      if (alternativa) {
        usuario = usuarios.find(u => u.id === alternativa.targetId) || usuariosPadrao.find(u => u.id === alternativa.targetId);
      }
    }
    
    if (usuario) {
      console.log('✅ Usuário encontrado:', usuario.nome);
      
      // Verificar se a instituição está ativa (exceto super admin)
      if (usuario.perfil !== 'SuperAdmin' && usuario.instituicaoId !== 0) {
        const instituicao = instituicoes.find(i => i.id === usuario.instituicaoId);
        
        if (!instituicao) {
          console.log('❌ Instituição não encontrada');
          return false;
        }
        
        if (instituicao.status === 'bloqueado') {
          alert('Sua instituição está bloqueada. Entre em contato com o suporte.');
          return false;
        }
        
        if (instituicao.status === 'pendente') {
          alert('Sua instituição está aguardando aprovação.');
          return false;
        }
        
        // Verificar expiração da licença
        if (instituicao.dataExpiracao) {
          const dataExp = new Date(instituicao.dataExpiracao);
          if (dataExp < new Date()) {
            alert('Licença expirada. Entre em contato com o suporte.');
            return false;
          }
        }
        
        setInstituicaoAtiva(usuario.instituicaoId);
      }
      
      console.log('✅ Login bem-sucedido!');
      setUsuarioLogado(usuario);
      // Persistir usuário logado no localStorage
      const usuarioParaSalvar = JSON.stringify(usuario);
      console.log('💾 [LOGIN] Salvando usuário no localStorage:', usuarioParaSalvar);
      localStorage.setItem('cei_usuario_logado', usuarioParaSalvar);
      
      if (usuario.perfil !== 'SuperAdmin' && usuario.instituicaoId !== 0) {
        console.log('💾 [LOGIN] Salvando instituicaoAtiva:', usuario.instituicaoId);
        localStorage.setItem('cei_instituicao_ativa', usuario.instituicaoId.toString());
      }
      
      // Verificar se salvou corretamente
      const verificacao = localStorage.getItem('cei_usuario_logado');
      console.log('✔️ [LOGIN] Verificação - localStorage após salvar:', verificacao ? 'OK' : 'FALHOU');

      const logLogin = {
        id: logAtividades.length > 0 ? Math.max(...logAtividades.map(l => l.id)) + 1 : 1,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        instituicaoId: usuario.instituicaoId,
        acao: 'login',
        modulo: 'autenticacao',
        descricao: `Login realizado por ${usuario.nome}`,
        detalhes: {
          perfil: usuario.perfil,
          login: usuario.login
        },
        dataHora: new Date().toISOString()
      };
      setLogAtividades([...logAtividades, logLogin]);
      
      return true;
    }
    
    console.log('❌ Credenciais inválidas - usuário não encontrado');
    return false;
  };

  const logout = () => {
    if (usuarioLogado) {
      registrarLog('logout', 'autenticacao', `Logout realizado por ${usuarioLogado.nome}`, {
        perfil: usuarioLogado.perfil,
        login: usuarioLogado.login
      });
    }

    setUsuarioLogado(null);
    setInstituicaoAtiva(null);
    // Remover do localStorage
    localStorage.removeItem('cei_usuario_logado');
    localStorage.removeItem('cei_instituicao_ativa');
  };

  const recuperarSenha = (email, novaSenha = null) => {
    // Etapa 1: Verificar se o email existe
    const instituicao = instituicoes.find(i => 
      i.email?.toLowerCase() === email.toLowerCase() ||
      i.emailResponsavel?.toLowerCase() === email.toLowerCase()
    );

    if (!instituicao) {
      return {
        sucesso: false,
        mensagem: 'Email não encontrado. Verifique se digitou corretamente.'
      };
    }

    // Se novaSenha foi fornecida, é a etapa 2: redefinir senha
    if (novaSenha) {
      const erroSenhaForte = validarSenhaForte(novaSenha);
      if (erroSenhaForte) {
        return {
          sucesso: false,
          mensagem: erroSenhaForte
        };
      }

      // Encontrar o usuário admin da instituição
      const usuarioAdmin = usuarios.find(u => 
        u.instituicaoId === instituicao.id && 
        (u.perfil === 'Admin' || u.perfil === 'AdminEscola')
      );

      if (!usuarioAdmin) {
        return {
          sucesso: false,
          mensagem: 'Erro ao localizar usuário da instituição.'
        };
      }

      // Atualizar a senha
      setUsuarios(prev => prev.map(u => 
        u.id === usuarioAdmin.id 
          ? { ...u, senha: novaSenha }
          : u
      ));

      return {
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso!'
      };
    }

    // Etapa 1: Apenas verificação do email
    return {
      sucesso: true,
      escola: instituicao.nomeInstituicao,
      mensagem: 'Email encontrado!'
    };
  };

  // ==================== BUSCA ====================
  
  const buscar = (termo) => {
    const termoLower = termo.toLowerCase();
    const livrosFiltrados = getLivrosFiltrados();
    const patrimonioFiltrado = getPatrimonioFiltrado();
    const clientesFiltrados = getClientesFiltrados();
    
    const livrosEncontrados = livrosFiltrados.filter(l => 
      l.titulo?.toLowerCase().includes(termoLower) ||
      l.autor?.toLowerCase().includes(termoLower) ||
      l.isbn?.includes(termo)
    );
    
    const patrimonioEncontrado = patrimonioFiltrado.filter(p => 
      p.descricao?.toLowerCase().includes(termoLower) ||
      p.numeroPatrimonio?.includes(termo) ||
      p.localizacao?.toLowerCase().includes(termoLower)
    );
    
    const clientesEncontrados = clientesFiltrados.filter(c => 
      c.nome?.toLowerCase().includes(termoLower) ||
      c.matricula?.includes(termo)
    );
    
    return {
      livros: livrosEncontrados,
      patrimonio: patrimonioEncontrado,
      clientes: clientesEncontrados
    };
  };

  // ==================== FUNÇÕES DE BACKUP E RECUPERAÇÃO ====================
  
  const exportarDados = () => {
    try {
      const dadosExportacao = {
        version: SYSTEM_VERSION,
        exportDate: new Date().toISOString(),
        data: {
          instituicoes,
          usuarios,
          livros,
          patrimonio,
          clientes,
          seriesAcademicas,
          turmasAcademicas,
          emprestimos,
          planos,
          notasFiscais,
          logAtividades
        }
      };
      
      const dataStr = JSON.stringify(dadosExportacao, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cei-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ [EXPORT] Dados exportados com sucesso!');
      registrarLog('Sistema', 'Backup', 'Exportação manual de dados realizada', {
        dataSize: new Blob([dataStr]).size,
        itemCount: {
          instituicoes: instituicoes.length,
          usuarios: usuarios.length,
          livros: livros.length,
          clientes: clientes.length,
          seriesAcademicas: seriesAcademicas.length,
          turmasAcademicas: turmasAcademicas.length,
          emprestimos: emprestimos.length
        }
      });
      
      return { sucesso: true, mensagem: 'Dados exportados com sucesso!' };
    } catch (error) {
      console.error('❌ [EXPORT] Erro ao exportar dados:', error);
      return { sucesso: false, mensagem: 'Erro ao exportar dados: ' + error.message };
    }
  };
  
  const importarDados = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const dadosImportados = JSON.parse(e.target.result);
          
          // Validar estrutura dos dados
          if (!dadosImportados.data || !dadosImportados.version) {
            throw new Error('Arquivo de backup inválido');
          }
          
          // Criar backup antes de importar
          console.log('📦 [IMPORT] Criando backup de segurança antes da importação...');
          createBackup();
          
          // Importar dados
          const fallbackInstitutionId = inferFallbackInstitutionId(dadosImportados.data || {});
          const data = normalizeAllInstitutionData(dadosImportados.data || {}, fallbackInstitutionId);
          
          if (data.instituicoes) setInstituicoes(data.instituicoes);
          if (data.usuarios) setUsuarios(data.usuarios);
          if (data.livros) setLivros(data.livros);
          if (data.patrimonio) setPatrimonio(data.patrimonio);
          if (data.clientes) setClientes(data.clientes);
          if (data.seriesAcademicas) setSeriesAcademicas(data.seriesAcademicas);
          if (data.turmasAcademicas) setTurmasAcademicas(data.turmasAcademicas);
          if (data.emprestimos) setEmprestimos(data.emprestimos);
          if (data.planos) setPlanos(data.planos);
          if (data.notasFiscais) setNotasFiscais(data.notasFiscais);
          if (data.logAtividades) setLogAtividades(data.logAtividades);
          
          console.log('✅ [IMPORT] Dados importados com sucesso!');
          registrarLog('Sistema', 'Backup', 'Importação manual de dados realizada', {
            sourceVersion: dadosImportados.version,
            exportDate: dadosImportados.exportDate,
            itemCount: {
              instituicoes: data.instituicoes?.length || 0,
              usuarios: data.usuarios?.length || 0,
              livros: data.livros?.length || 0,
              clientes: data.clientes?.length || 0,
              seriesAcademicas: data.seriesAcademicas?.length || 0,
              turmasAcademicas: data.turmasAcademicas?.length || 0,
              emprestimos: data.emprestimos?.length || 0
            }
          });
          
          resolve({ 
            sucesso: true, 
            mensagem: `Dados importados com sucesso! Versão do backup: ${dadosImportados.version}` 
          });
        } catch (error) {
          console.error('❌ [IMPORT] Erro ao importar dados:', error);
          reject({ sucesso: false, mensagem: 'Erro ao importar dados: ' + error.message });
        }
      };
      
      reader.onerror = () => {
        reject({ sucesso: false, mensagem: 'Erro ao ler arquivo' });
      };
      
      reader.readAsText(file);
    });
  };
  
  const limparDadosAntigos = (diasRetencao = 365) => {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasRetencao);
      
      // Limpar empréstimos antigos devolvidos
      const emprestimosAtualizados = emprestimos.filter(emp => {
        if (emp.status === 'devolvido' && emp.dataDevolucaoReal) {
          const dataDevolucao = new Date(emp.dataDevolucaoReal);
          return dataDevolucao > dataLimite;
        }
        return true; // Manter empréstimos ativos
      });
      
      // Limpar logs antigos
      const logsAtualizados = logAtividades.filter(log => {
        const dataLog = new Date(log.data);
        return dataLog > dataLimite;
      });
      
      const removidos = {
        emprestimos: emprestimos.length - emprestimosAtualizados.length,
        logs: logAtividades.length - logsAtualizados.length
      };
      
      setEmprestimos(emprestimosAtualizados);
      setLogAtividades(logsAtualizados);
      
      console.log('🧹 [CLEANUP] Limpeza realizada:', removidos);
      registrarLog('Sistema', 'Manutenção', 'Limpeza de dados antigos realizada', {
        diasRetencao,
        removidos
      });
      
      return { 
        sucesso: true, 
        mensagem: `Limpeza concluída! Removidos: ${removidos.emprestimos} empréstimos e ${removidos.logs} logs antigos.`,
        removidos 
      };
    } catch (error) {
      console.error('❌ [CLEANUP] Erro ao limpar dados:', error);
      return { sucesso: false, mensagem: 'Erro ao limpar dados: ' + error.message };
    }
  };

  // ==================== FUNÇÕES DE PLANOS ====================
  
  const adicionarPlano = (planoData) => {
    const novoPlano = {
      ...planoData,
      id: planos.length > 0 ? Math.max(...planos.map(p => p.id)) + 1 : 1,
      ativo: true
    };
    setPlanos([...planos, novoPlano]);
    return novoPlano;
  };

  const atualizarPlano = (id, dadosAtualizados) => {
    setPlanos(planos.map(plano => 
      plano.id === id ? { ...plano, ...dadosAtualizados } : plano
    ));
  };

  const removerPlano = (id) => {
    setPlanos(planos.filter(plano => plano.id !== id));
  };

  const getPlanosAtivos = () => {
    return planos.filter(p => p.ativo);
  };

  const value = {
    // Estados
    instituicoes,
    livros: getLivrosFiltrados(),
    patrimonio: getPatrimonioFiltrado(),
    clientes: getClientesFiltrados(),
    seriesAcademicas: getSeriesAcademicasFiltradas(),
    turmasAcademicas: getTurmasAcademicasFiltradas(),
    emprestimos: getEmprestimosFiltrados(),
    usuarios,
    usuarioLogado,
    instituicaoAtiva,
    autenticacaoCarregada, // Novo: indica se autenticação foi carregada do localStorage
    planos,
    notasFiscais,
    sincronizando,
    
    // Funções Instituições
    adicionarInstituicao,
    atualizarInstituicao,
    ativarInstituicao,
    bloquearInstituicao,
    removerInstituicao,
    removerTodasInstituicoes,
    
    // Funções Licenças
    calcularDiasRestantesLicenca,
    calcularDiasGracaRestantes,
    verificarLicencasExpiradas,
    
    // Funções Livros
    adicionarLivro,
    atualizarLivro,
    removerLivro,
    darBaixaLivro,
    
    // Funções Patrimônio
    adicionarPatrimonio,
    atualizarPatrimonio,
    removerPatrimonio,
    
    // Funções Clientes
    adicionarCliente,
    adicionarClientesEmLote,
    atualizarCliente,
    removerCliente,
    removerTodosClientes,
    removerClientesPorTurma,

    // Funções Séries e Turmas
    adicionarSerieAcademica,
    atualizarSerieAcademica,
    removerSerieAcademica,
    adicionarTurmaAcademica,
    atualizarTurmaAcademica,
    removerTurmaAcademica,
    
    // Funções Empréstimos
    adicionarEmprestimo,
    atualizarEmprestimo,
    devolverLivro,
    renovarEmprestimo,
    
    // Funções Notas Fiscais
    adicionarNotaFiscal,
    gerarNotaFiscalAutomaticaPagamento,
    
    // Funções Log de Atividades
    registrarLog,
    registrarAcessoPagina,
    logAtividades,
    
    // Funções Gerenciamento de Usuários
    adicionarUsuario,
    editarUsuario,
    excluirUsuario,
    
    // Funções Financeiras
    registrarPagamento,
    verificarInadimplencia,
    calcularProximoVencimento,
    obterHistoricoPagamentos,
    
    // Funções Planos
    adicionarPlano,
    atualizarPlano,
    removerPlano,
    getPlanosAtivos,
    
    // Verificação de Limites
    verificarLimitesConta,
    
    // Autenticação
    login,
    logout,
    recuperarSenha,
    
    // Sincronização
    sincronizarDados,
    
    // Backup e Recuperação
    exportarDados,
    importarDados,
    limparDadosAntigos,
    
    // Busca
    buscar
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
