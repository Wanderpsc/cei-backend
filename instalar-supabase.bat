@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM SCRIPT DE INSTALAÇÃO - SUPABASE + DEPENDÊNCIAS
REM © 2026 Wander Pires Silva Coelho
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║   CEI - CONTROLE ESCOLAR INTELIGENTE                              ║
echo ║   Instalacao de Dependencias Supabase                             ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

echo [1/3] Instalando Supabase Client...
call npm install @supabase/supabase-js

echo.
echo [2/3] Verificando instalacao...
call npm list @supabase/supabase-js

echo.
echo [3/3] Criando arquivo de configuracao...
if not exist .env.local (
    copy env-template.txt .env.local
    echo ✅ Arquivo .env.local criado!
    echo ⚠️  IMPORTANTE: Configure suas credenciais em .env.local
) else (
    echo ℹ️  Arquivo .env.local ja existe
)

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                     INSTALACAO CONCLUIDA!                         ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo 📋 PROXIMOS PASSOS:
echo.
echo 1. Crie conta no Supabase: https://supabase.com
echo 2. Crie um novo projeto chamado "cei-sistema"
echo 3. Va em Settings -^> API
echo 4. Copie as credenciais para .env.local
echo 5. Execute o SQL do arquivo IMPLEMENTACAO_SUPABASE.md
echo 6. Reinicie o servidor: npm start
echo.
echo 📖 Documentacao completa: IMPLEMENTACAO_SUPABASE.md
echo.
pause
