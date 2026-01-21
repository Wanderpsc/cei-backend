# Script de Instalação - Scanner Mobile v3.5.2
# CEI - Controle Escolar Inteligente

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CEI - Instalacao Scanner Mobile v3.5.2" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se npm esta instalado
Write-Host "[1/5] Verificando Node.js e npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    
    if ($nodeVersion -and $npmVersion) {
        Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
        Write-Host "  npm: $npmVersion" -ForegroundColor Green
    } else {
        throw "Node.js nao encontrado"
    }
} catch {
    Write-Host "  ERRO: Node.js nao instalado!" -ForegroundColor Red
    Write-Host "  Baixe em: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[2/5] Instalando @zxing/library..." -ForegroundColor Yellow

# Instalar dependencia
try {
    npm install @zxing/library --save
    Write-Host "  @zxing/library instalado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "  ERRO ao instalar dependencia!" -ForegroundColor Red
    Write-Host "  Tente manualmente: npm install @zxing/library" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[3/5] Verificando instalacao..." -ForegroundColor Yellow

# Verificar se foi instalado
$installed = npm list @zxing/library 2>$null
if ($installed -match "@zxing/library") {
    Write-Host "  Verificacao OK!" -ForegroundColor Green
} else {
    Write-Host "  AVISO: Nao foi possivel verificar a instalacao" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/5] Atualizando cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null | Out-Null
Write-Host "  Cache limpo!" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Concluindo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  INSTALACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: npm start" -ForegroundColor White
Write-Host "  2. Acesse a pagina de Livros" -ForegroundColor White
Write-Host "  3. Clique em 'Escanear' (mobile) ou 'Digite o ISBN'" -ForegroundColor White
Write-Host "  4. Teste o scanner com a camera do celular!" -ForegroundColor White
Write-Host ""
Write-Host "Documentacao completa:" -ForegroundColor Cyan
Write-Host "  - MELHORIAS_MOBILE_v3.5.2.md" -ForegroundColor White
Write-Host "  - INSTALAR_SCANNER_MOBILE.md" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
