# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT DE INSTALAÇÃO - SUPABASE + DEPENDÊNCIAS
# © 2026 Wander Pires Silva Coelho
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "║   CEI - CONTROLE ESCOLAR INTELIGENTE                              ║" -ForegroundColor Cyan
Write-Host "║   Instalação de Dependências Supabase                             ║" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "[1/3] Instalando Supabase Client..." -ForegroundColor Yellow
npm install @supabase/supabase-js

Write-Host "`n[2/3] Verificando instalação..." -ForegroundColor Yellow
npm list @supabase/supabase-js

Write-Host "`n[3/3] Criando arquivo de configuração..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Copy-Item "env-template.txt" ".env.local"
    Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Configure suas credenciais em .env.local" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  Arquivo .env.local já existe" -ForegroundColor Cyan
}

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                     INSTALAÇÃO CONCLUÍDA!                         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 PRÓXIMOS PASSOS:`n" -ForegroundColor Cyan
Write-Host "1. Crie conta no Supabase: " -NoNewline; Write-Host "https://supabase.com" -ForegroundColor Blue
Write-Host "2. Crie um novo projeto chamado 'cei-sistema'" -ForegroundColor White
Write-Host "3. Vá em Settings → API" -ForegroundColor White
Write-Host "4. Copie as credenciais para .env.local" -ForegroundColor White
Write-Host "5. Execute o SQL do arquivo IMPLEMENTACAO_SUPABASE.md" -ForegroundColor White
Write-Host "6. Reinicie o servidor: npm start`n" -ForegroundColor White

Write-Host "📖 Documentação completa: " -NoNewline; Write-Host "IMPLEMENTACAO_SUPABASE.md`n" -ForegroundColor Blue

Read-Host "Pressione ENTER para continuar"
