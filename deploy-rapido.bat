@echo off
echo.
echo ====================================
echo   DEPLOY RAPIDO - CEI SISTEMA
echo ====================================
echo.

echo [1/3] Parando processos Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] Fazendo build...
call npm run build
if errorlevel 1 (
    echo.
    echo ERRO no build!
    pause
    exit /b 1
)

echo [3/3] Fazendo deploy para GitHub Pages...
call npx gh-pages -d build -m "Update: Demo account with limits"

echo.
echo ====================================
echo   DEPLOY CONCLUIDO!
echo ====================================
echo.
echo Sistema atualizado em:
echo https://wanderpsc.github.io/cei-backend
echo.
echo Aguarde 1-2 minutos e teste com:
echo Login: demo
echo Senha: demo2026
echo.
pause
