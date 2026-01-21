# Script de Teste do Backend CEI
# Execute este script para verificar se o backend foi atualizado

Write-Host "`n🔍 TESTANDO BACKEND CEI..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$baseUrl = "https://criador-horario-backend-1.onrender.com/api"

# Teste 1: Health Check
Write-Host "`n[1/3] Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 10
    
    if ($health.service -eq "CEI Payment API") {
        Write-Host "✅ CORRETO! Backend atualizado!" -ForegroundColor Green
        Write-Host "   Service: $($health.service)" -ForegroundColor Gray
    } else {
        Write-Host "❌ INCORRETO! Ainda com código antigo" -ForegroundColor Red
        Write-Host "   Message: $($health.message)" -ForegroundColor Gray
        Write-Host "`n⚠️  AÇÃO NECESSÁRIA:" -ForegroundColor Yellow
        Write-Host "   1. Acesse: https://dashboard.render.com" -ForegroundColor White
        Write-Host "   2. Clique em: criador-horario-backend-1" -ForegroundColor White
        Write-Host "   3. Clique em: Manual Deploy > Clear build cache & deploy" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao conectar: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Endpoint de Notificações
Write-Host "`n[2/3] Testando endpoint /notifications..." -ForegroundColor Yellow
try {
    $notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -TimeoutSec 10
    
    if ($notifications.success) {
        Write-Host "✅ Endpoint funcionando!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Resposta inesperada" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Login
Write-Host "`n[3/3] Testando login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        login = "cetidesamaral"
        senha = "Ceti@2026"
    } | ConvertTo-Json
    
    $loginResult = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 10
    
    if ($loginResult.success) {
        Write-Host "✅ Login funcionando!" -ForegroundColor Green
        Write-Host "   Usuário: $($loginResult.user.nome)" -ForegroundColor Gray
        Write-Host "   Perfil: $($loginResult.user.perfil)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Login falhou" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "✅ TESTES CONCLUÍDOS!" -ForegroundColor Green
Write-Host "`nAgora teste no navegador:" -ForegroundColor Cyan
Write-Host "  https://cei-sistema-biblioteca.surge.sh" -ForegroundColor White
Write-Host "`nCredenciais:" -ForegroundColor Cyan
Write-Host "  Login: cetidesamaral" -ForegroundColor White
Write-Host "  Senha: Ceti@2026" -ForegroundColor White
Write-Host ""
