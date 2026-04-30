/**
 * push-backup-supabase.cjs
 * Lê o backup CEI e envia todos os dados para o Supabase,
 * garantindo que qualquer dispositivo online veja os dados.
 *
 * Uso: node push-backup-supabase.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Config Supabase (mesma do arquivo public/supabase-runtime-config.js) ──
const SUPABASE_URL  = 'https://tnvjdmdhbpckciqflzcq.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_FlXtiXR_alXHlyTsGCQTgQ_bjlPqtIt';
const INST_ID       = 1;   // Instituição com todos os livros/leitores (CETI Desembargador Amaral)
const BACKUP_FILE   = path.join(__dirname, 'cei-backup-2026-04-30.json');

// ── Helpers ──────────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();

function dedupById(arr) {
  const map = new Map();
  (arr || []).forEach(item => {
    if (!item || item.id == null) return;
    const key = String(item.id);
    const existing = map.get(key);
    if (!existing) { map.set(key, item); return; }
    // Manter o mais recente
    const tsNew = new Date(item.dataAtualizacao || item.dataCadastro || 0).getTime();
    const tsOld = new Date(existing.dataAtualizacao || existing.dataCadastro || 0).getTime();
    if (tsNew >= tsOld) map.set(key, item);
  });
  return Array.from(map.values());
}

// ── Mapeamento item → linha da tabela (espelha o syncService do app) ─────────
function mapLivro(item) {
  return {
    id:             item.id,
    instituicao_id: INST_ID,
    titulo:         item.titulo || item.codigoIdentificacao || `Livro ${item.id}`,
    autor:          item.autor   || null,
    editora:        item.editora || null,
    isbn:           item.isbn    || null,
    ano_publicacao: item.anoPublicacao || null,
    categoria:      item.categoria || null,
    tipo:           item.tipo    || null,
    vigencia:       item.vigencia || null,
    quantidade:     item.quantidade || 1,
    localizacao:    item.localizacao || null,
    status:         item.status  || 'disponivel',
    capa_url:       item.capaUrl || item.capa || null,
    sinopse:        item.sinopse || null,
    dados:          item,
    updated_at:     now(),
    created_at:     item.dataCadastro || now()
  };
}

function mapLeitor(item) {
  return {
    id:             item.id,
    instituicao_id: INST_ID,
    nome:           item.nome || `Leitor ${item.id}`,
    cpf:            item.cpf  || null,
    email:          item.email || null,
    telefone:       item.telefone || null,
    endereco:       item.endereco || null,
    tipo:           item.tipo  || null,
    turma:          item.turma || null,
    matricula:      item.matricula || null,
    foto_url:       item.fotoUrl  || item.foto || null,
    ativo:          item.ativo !== false,
    dados:          item,
    updated_at:     now(),
    created_at:     item.dataCadastro || now()
  };
}

function mapEmprestimo(item) {
  const hojeISO = new Date().toISOString().slice(0, 10);
  const devISO  = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10);
  return {
    id:                    item.id,
    instituicao_id:        INST_ID,
    livro_id:              item.livroId    || item.livro_id    || null,
    leitor_id:             item.clienteId  || item.leitorId    || item.leitor_id || null,
    data_emprestimo:       item.dataEmprestimo          || item.data_emprestimo          || hojeISO,
    data_devolucao_prevista: item.dataDevolucaoPrevista || item.data_devolucao_prevista  || devISO,
    data_devolucao_real:   item.dataDevolucaoReal       || item.data_devolucao_real      || null,
    status:                item.status     || 'ativo',
    observacoes:           item.observacoes || null,
    multa:                 item.multa || 0,
    dados:                 item,
    updated_at:            now(),
    created_at:            item.dataCadastro || now()
  };
}

function mapPatrimonio(item) {
  return {
    id:               item.id,
    instituicao_id:   INST_ID,
    descricao:        item.descricao || item.nome || `Patrimônio ${item.id}`,
    categoria:        item.categoria || null,
    numero_patrimonio: item.numeroPatrimonio || null,
    data_aquisicao:   item.dataAquisicao || null,
    valor:            item.valor || null,
    estado_conservacao: item.estadoConservacao || null,
    localizacao:      item.localizacao || null,
    responsavel:      item.responsavel || null,
    dados:            item,
    updated_at:       now(),
    created_at:       item.dataCadastro || now()
  };
}

function mapInstituicao(item) {
  return {
    id:            item.id,
    nome_instituicao: item.nomeInstituicao || item.nome_instituicao || `Instituição ${item.id}`,
    cnpj:          item.cnpj   || null,
    email:         item.email  || null,
    telefone:      item.telefone || null,
    endereco:      item.endereco || null,
    cidade:        item.cidade || null,
    estado:        item.estado || null,
    cep:           item.cep   || null,
    licenca:       item.licenca || `LIC-${item.id}`,
    status:        item.status  || 'ativo',
    data_cadastro: item.dataCadastro || item.data_cadastro || now(),
    data_expiracao: item.dataExpiracao || item.data_expiracao || null,
    plano:         item.plano  || null,
    dias_licenca:  item.diasLicenca || null,
    valor_mensal:  item.valorMensal || null,
    dados:         item,
    updated_at:    now(),
    created_at:    item.dataCadastro || now()
  };
}

function mapUsuario(item) {
  return {
    id:            item.id,
    instituicao_id: item.instituicaoId || INST_ID,
    nome:          item.nome  || `Usuário ${item.id}`,
    login:         item.login || `user_${item.id}`,
    senha:         item.senha || 'alterar123',
    perfil:        item.perfil || 'Bibliotecário',
    tipo:          item.tipo   || 'comum',
    email:         item.email  || null,
    ativo:         item.status !== 'desativado',
    dados:         item,
    updated_at:    now(),
    created_at:    item.dataCriacao || item.dataCadastro || now()
  };
}

// ── Upload em lotes ──────────────────────────────────────────────────────────
async function upsertBatch(supabase, table, rows, label) {
  if (!rows || rows.length === 0) {
    console.log(`  ⏭  ${label}: nada a enviar`);
    return;
  }

  const CHUNK = 100;
  let total = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict: 'id', returning: 'minimal' });

    if (error) {
      console.error(`  ❌ ${label} [lote ${i}–${i+chunk.length}]:`, error.message);
    } else {
      total += chunk.length;
    }
  }
  console.log(`  ✅ ${label}: ${total}/${rows.length} registros enviados`);
}

// Usuários: upsert individual com fallback por login quando há conflito de chave
async function upsertUsuarios(supabase, rows) {
  if (!rows || rows.length === 0) {
    console.log(`  ⏭  usuarios: nada a enviar`);
    return;
  }

  let ok = 0;
  let updated = 0;
  for (const row of rows) {
    const { error } = await supabase
      .from('usuarios')
      .upsert([row], { onConflict: 'id', returning: 'minimal' });

    if (!error) { ok++; continue; }

    // Conflito de login único → atualizar por login
    if (error.code === '23505') {
      const { error: err2 } = await supabase
        .from('usuarios')
        .update({ dados: row.dados, senha: row.senha, updated_at: row.updated_at })
        .eq('login', row.login)
        .eq('instituicao_id', row.instituicao_id);

      if (!err2) { updated++; }
      else { console.warn(`  ⚠️  usuario "${row.login}": ${err2.message}`); }
    } else {
      console.error(`  ❌ usuario "${row.login}": ${error.message}`);
    }
  }
  console.log(`  ✅ usuarios: ${ok} inseridos, ${updated} atualizados de ${rows.length}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Iniciando push do backup para o Supabase...\n');

  // 1. Carregar backup
  if (!fs.existsSync(BACKUP_FILE)) {
    console.error('❌ Arquivo de backup não encontrado:', BACKUP_FILE);
    process.exit(1);
  }
  const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
  const data   = backup.data || {};
  console.log('📦 Backup carregado - versão:', backup.version, '| data:', backup.exportDate);
  console.log('   livros:', (data.livros||[]).length,
              '| leitores:', (data.clientes||[]).length,
              '| emprestimos:', (data.emprestimos||[]).length,
              '| patrimonio:', (data.patrimonio||[]).length,
              '| usuarios:', (data.usuarios||[]).length);

  // 2. Conectar ao Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('\n🔌 Conectado ao Supabase:', SUPABASE_URL, '\n');

  // 3. Deduplicar e filtrar por instituição
  const instUnica = dedupById(data.instituicoes || []).find(i => i.id === INST_ID);
  if (!instUnica) {
    console.error('❌ Instituição ID', INST_ID, 'não encontrada no backup');
    process.exit(1);
  }
  console.log('🏫 Instituição alvo:', instUnica.nomeInstituicao, '(ID', INST_ID, ')');

  const livros     = dedupById((data.livros     || []).filter(i => i.instituicaoId === INST_ID || !i.instituicaoId));
  const clientes   = dedupById((data.clientes   || []).filter(i => i.instituicaoId === INST_ID || !i.instituicaoId));
  const emprestimos= dedupById((data.emprestimos|| []).filter(i => i.instituicaoId === INST_ID || !i.instituicaoId));
  const patrimonio = dedupById((data.patrimonio || []).filter(i => i.instituicaoId === INST_ID || !i.instituicaoId));
  const usuarios   = dedupById((data.usuarios   || []).filter(i => i.instituicaoId === INST_ID || i.perfil === 'SuperAdmin'));

  console.log('\n📊 Registros a enviar:');
  console.log('   livros:', livros.length);
  console.log('   leitores/clientes:', clientes.length);
  console.log('   empréstimos:', emprestimos.length);
  console.log('   patrimônio:', patrimonio.length);
  console.log('   usuários:', usuarios.length);
  console.log('');

  // 4. Enviar para o Supabase
  await upsertBatch(supabase, 'instituicoes', [mapInstituicao(instUnica)], 'instituicoes');
  await upsertBatch(supabase, 'livros',       livros.map(mapLivro),          'livros');
  await upsertBatch(supabase, 'leitores',     clientes.map(mapLeitor),       'leitores');
  await upsertBatch(supabase, 'emprestimos',  emprestimos.map(mapEmprestimo),'emprestimos');
  await upsertBatch(supabase, 'patrimonio',   patrimonio.map(mapPatrimonio), 'patrimonio');
  await upsertUsuarios(supabase, usuarios.map(mapUsuario));

  console.log('\n✅ Processo concluído!\n');
  console.log('👉 Agora abra o sistema em qualquer dispositivo e faça login.');
  console.log('   Os dados serão puxados automaticamente do Supabase.\n');
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message || err);
  process.exit(1);
});
