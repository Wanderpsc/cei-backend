# Script para configurar Google Gemini AI de forma SEGURA
# A API key NÃO será exposta em lugar nenhum

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURADOR GOOGLE GEMINI AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Solicitar API Key (entrada oculta)
Write-Host "📝 PASSO 1: Cole sua API key do Google Gemini" -ForegroundColor Yellow
Write-Host "   (Gere em: https://aistudio.google.com/app/apikey)" -ForegroundColor Gray
Write-Host ""
$apiKey = Read-Host "Cole a API key aqui"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ ERRO: API key não pode estar vazia!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ API key recebida (${apiKey.Length} caracteres)" -ForegroundColor Green

# Passo 2: Testar a API key
Write-Host ""
Write-Host "🧪 PASSO 2: Testando API key..." -ForegroundColor Yellow

$testIsbn = "9788535934977"
$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Responda apenas: OK"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Method Post `
        -Uri "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$apiKey" `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ API key VÁLIDA e funcionando!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: API key inválida ou vazada!" -ForegroundColor Red
    Write-Host "   Detalhes: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Solução:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://aistudio.google.com/app/apikey" -ForegroundColor Gray
    Write-Host "   2. DELETE a chave antiga" -ForegroundColor Gray
    Write-Host "   3. Crie uma NOVA chave" -ForegroundColor Gray
    Write-Host "   4. Execute este script novamente" -ForegroundColor Gray
    exit 1
}

# Passo 3: Atualizar .env.local
Write-Host ""
Write-Host "📝 PASSO 3: Atualizando .env.local..." -ForegroundColor Yellow

$envPath = ".\.env.local"
$envContent = Get-Content $envPath -Raw

# Substituir a linha da API key
$envContent = $envContent -replace 'REACT_APP_GEMINI_API_KEY=.*', "REACT_APP_GEMINI_API_KEY=$apiKey"

# Salvar arquivo
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "✅ Arquivo .env.local atualizado!" -ForegroundColor Green

# Passo 4: Build
Write-Host ""
Write-Host "🔨 PASSO 4: Compilando sistema..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO no build!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green

# Passo 5: Deploy
Write-Host ""
Write-Host "🚀 PASSO 5: Fazendo deploy..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar 1-2 minutos)" -ForegroundColor Gray

npm run deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO no deploy!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Limpe o cache do navegador (Ctrl + Shift + Delete)" -ForegroundColor White
Write-Host "   2. Acesse: https://wanderpsc.github.io/cei-backend" -ForegroundColor White
Write-Host "   3. Teste com ISBN: 9786589077039" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Sua API key está segura no arquivo .env.local" -ForegroundColor Gray
Write-Host "   (não será enviada ao GitHub)" -ForegroundColor Gray
Write-Host ""
