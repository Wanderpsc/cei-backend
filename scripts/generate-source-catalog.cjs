const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputPath = path.join(projectRoot, 'public', 'source-catalog.json');
const diagramOutputPath = path.join(projectRoot, 'public', 'system-diagram.json');
const allowedExtensions = new Set(['.js', '.jsx', '.cjs', '.mjs', '.css', '.html', '.json', '.sql', '.ps1', '.bat']);
const excludedDirectories = new Set(['.git', 'build', 'node_modules', 'static', 'tmp']);
const excludedNames = new Set([
  'source-catalog.json',
  'system-diagram.json',
  'package-lock.json',
  'asset-manifest.json',
]);
const excludedFilePatterns = [
  /^backup.*\.json$/i,
  /^cei-backup-.*\.json$/i,
  /^dados-importacao.*\.json$/i,
  /^codigo-fonte-cei\.json$/i,
];

function collectFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return excludedDirectories.has(entry.name) ? [] : collectFiles(entryPath);
    }
    if (excludedNames.has(entry.name)) return [];
    if (excludedFilePatterns.some((pattern) => pattern.test(entry.name))) return [];
    return allowedExtensions.has(path.extname(entry.name).toLowerCase()) ? [entryPath] : [];
  });
}

function redactSecrets(content) {
  return content
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[CHAVE_REMOVIDA]')
    .replace(/sb_(?:publishable|secret)_[0-9A-Za-z_-]+/g, '[CHAVE_SUPABASE_REMOVIDA]')
    .replace(
      /((?:api[_-]?key|secret|password|senha|access[_-]?token|auth[_-]?token)\s*[:=]\s*["'`])([^"'`\r\n]+)(["'`])/gi,
      '$1[VALOR_CONFIDENCIAL_REMOVIDO]$3'
    );
}

function getArea(relativePath) {
  const parts = relativePath.split('/');
  if (parts[0] === 'src') return parts.length > 2 ? `Frontend / ${parts[1]}` : 'Frontend / Núcleo';
  if (parts[0] === 'public') return 'Frontend / Arquivos públicos';
  if (parts[0] === 'scripts') return 'Automação e manutenção';
  if (relativePath.endsWith('.sql')) return 'Banco de dados';
  if (relativePath.includes('server') || relativePath.includes('backend')) return 'Backend / API';
  return 'Configuração e serviços';
}

function buildDirectoryTree(filePaths, version) {
  const tree = {};

  filePaths.forEach((filePath) => {
    const parts = filePath.split('/');
    let branch = tree;
    parts.forEach((part, index) => {
      branch[part] = branch[part] || (index === parts.length - 1 ? null : {});
      if (branch[part]) branch = branch[part];
    });
  });

  const lines = [`CEI - CONTROLE ESCOLAR INTELIGENTE v${version}`];
  const renderBranch = (branch, prefix = '') => {
    const entries = Object.entries(branch);
    entries.forEach(([name, children], index) => {
      const isLast = index === entries.length - 1;
      lines.push(`${prefix}${isLast ? '└── ' : '├── '}${name}${children ? '/' : ''}`);
      if (children) renderBranch(children, `${prefix}${isLast ? '    ' : '│   '}`);
    });
  };

  renderBranch(tree);
  return lines.join('\n');
}

const uniqueFiles = [...new Set(collectFiles(projectRoot))]
  .sort((left, right) => left.localeCompare(right, 'pt-BR'));

const files = uniqueFiles.map((filePath) => {
  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  const content = redactSecrets(fs.readFileSync(filePath, 'utf8'));
  return {
    path: relativePath,
    area: getArea(relativePath),
    language: path.extname(filePath).slice(1) || 'text',
    lines: content.split(/\r?\n/).length,
    size: Buffer.byteLength(content, 'utf8'),
    content,
  };
});

const catalog = {
  generatedAt: new Date().toISOString(),
  notice: 'Catálogo técnico. Arquivos de ambiente, dados pessoais, backups, dependências e artefatos compilados não são incluídos.',
  totalFiles: files.length,
  totalLines: files.reduce((total, file) => total + file.lines, 0),
  totalBytes: files.reduce((total, file) => total + file.size, 0),
  files,
};

const packageData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const systemVersion = packageData.systemVersion || packageData.version || 'sem versão';
const areas = Array.from(
  files.reduce((areaMap, file) => {
    const current = areaMap.get(file.area) || { name: file.area, files: 0, lines: 0 };
    current.files += 1;
    current.lines += file.lines;
    areaMap.set(file.area, current);
    return areaMap;
  }, new Map()).values()
).sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));

const diagram = {
  generatedAt: catalog.generatedAt,
  version: systemVersion,
  totalFiles: catalog.totalFiles,
  totalLines: catalog.totalLines,
  totalBytes: catalog.totalBytes,
  totalPages: files.filter((file) => file.path.startsWith('src/pages/')).length,
  totalComponents: files.filter((file) => file.path.startsWith('src/components/')).length,
  areas,
  directoryTree: buildDirectoryTree(files.map((file) => file.path), systemVersion),
};

fs.writeFileSync(outputPath, JSON.stringify(catalog), 'utf8');
fs.writeFileSync(diagramOutputPath, JSON.stringify(diagram), 'utf8');
console.log(`Catálogo de fontes gerado: ${files.length} arquivos em public/source-catalog.json`);
console.log('Metadados do diagrama gerados em public/system-diagram.json');