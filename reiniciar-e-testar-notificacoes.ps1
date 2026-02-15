$ErrorActionPreference = 'Stop'

Write-Host '=== CEI | Reiniciar e Testar Notificações ===' -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$serverUrl = 'http://localhost:3001'

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Uri,
        [hashtable]$Body
    )

    try {
        $jsonBody = $null
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
        }

        $response = Invoke-RestMethod -Uri $Uri -Method Post -ContentType 'application/json' -Body $jsonBody
        return [pscustomobject]@{
            Nome = $Name
            Sucesso = $true
            Resposta = ($response | ConvertTo-Json -Depth 10)
        }
    }
    catch {
        $details = $_.Exception.Message
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $details = $_.ErrorDetails.Message
        }

        return [pscustomobject]@{
            Nome = $Name
            Sucesso = $false
            Resposta = $details
        }
    }
}

# 1) Encerrar processos antigos do backend (server.js)
Write-Host '1) Encerrando instâncias antigas do backend...' -ForegroundColor Yellow
$nodeProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object { $_.CommandLine -match 'server\.js' }

foreach ($proc in $nodeProcesses) {
    try {
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
        Write-Host "   - Encerrado PID $($proc.ProcessId)" -ForegroundColor DarkYellow
    }
    catch {
        Write-Host "   - Não foi possível encerrar PID $($proc.ProcessId): $($_.Exception.Message)" -ForegroundColor DarkRed
    }
}

# 2) Iniciar backend
Write-Host '2) Iniciando backend...' -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath 'node' -ArgumentList 'server.js' -PassThru

# 3) Aguardar subida
Write-Host '3) Aguardando backend ficar online...' -ForegroundColor Yellow
$online = $false
for ($i = 1; $i -le 20; $i++) {
    try {
        $health = Invoke-RestMethod -Uri "$serverUrl/api/health" -Method Get
        if ($health) {
            $online = $true
            break
        }
    }
    catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $online) {
    Write-Host '❌ Backend não ficou online em tempo hábil.' -ForegroundColor Red
    Write-Host "PID iniciado: $($backendProcess.Id)" -ForegroundColor DarkYellow
    exit 1
}

Write-Host '✅ Backend online.' -ForegroundColor Green

# 4) Rodar testes
Write-Host '4) Executando testes de notificações...' -ForegroundColor Yellow

$results = @()
$results += Test-Endpoint -Name 'Teste SMTP' -Uri "$serverUrl/api/test-smtp" -Body @{ email = 'wanderpsc@gmail.com' }
$results += Test-Endpoint -Name 'Teste Compra (Email+WhatsApp)' -Uri "$serverUrl/api/test-email" -Body @{
    compradorEmail = 'wanderpsc@gmail.com'
    compradorNome = 'Wander Teste'
    instituicaoNome = 'CEI Teste'
    planoNome = 'Plano Teste'
    valor = 97
}
$results += Test-Endpoint -Name 'Teste Acesso (WhatsApp)' -Uri "$serverUrl/api/notify-access" -Body @{
    usuario = 'Wander Teste'
    perfil = 'SuperAdmin'
    instituicao = 'CEI'
    origem = 'script-automatico'
}

# 5) Resumo
Write-Host '5) Resumo:' -ForegroundColor Yellow
foreach ($result in $results) {
    if ($result.Sucesso) {
        Write-Host "✅ $($result.Nome)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $($result.Nome)" -ForegroundColor Red
    }
    Write-Host $result.Resposta -ForegroundColor Gray
    Write-Host '----------------------------------------' -ForegroundColor DarkGray
}

$allOk = ($results | Where-Object { -not $_.Sucesso }).Count -eq 0
if ($allOk) {
    Write-Host '🎉 Todos os testes concluídos com sucesso.' -ForegroundColor Green
}
else {
    Write-Host '⚠️ Alguns testes falharam. Verifique o resumo acima.' -ForegroundColor Yellow
}

Write-Host "Backend permanece rodando (PID $($backendProcess.Id))." -ForegroundColor Cyan
Write-Host 'Para parar manualmente: Stop-Process -Id <PID> -Force' -ForegroundColor Cyan
