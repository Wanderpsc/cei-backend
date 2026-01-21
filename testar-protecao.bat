@echo off
echo ========================================
echo  TESTANDO PROTECAO DO CONSOLE - CEI
echo ========================================
echo.
echo 1. Iniciando servidor de desenvolvimento...
echo.

start cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo.
echo 2. Aguarde o navegador abrir...
echo 3. Quando a pagina carregar, pressione F12
echo 4. Tente usar o console - deve estar bloqueado!
echo.
echo ========================================
echo  COMO DESBLOQUEAR:
echo ========================================
echo.
echo No console, digite:
echo unlockConsole("CEI@Wander2026#Seguro")
echo.
echo ========================================
echo  ARQUIVO DE TESTE:
echo ========================================
echo.
echo Tambem criamos um arquivo de teste em:
echo testar-protecao-console.html
echo.
echo Voce pode abri-lo diretamente no navegador!
echo.
pause
