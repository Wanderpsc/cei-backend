@echo off
echo ========================================
echo   TESTANDO SISTEMA DE PAGAMENTOS
echo   CEI - Controle Escolar Inteligente
echo ========================================
echo.
echo Verificando backend...
echo.

REM Testar se o backend está online
curl -s http://localhost:3001/api/health

if errorlevel 1 (
    echo.
    echo [ERRO] Backend nao esta rodando!
    echo.
    echo Execute primeiro: node server.js
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Backend esta online!
echo.
echo ========================================
echo   CARTOES DE TESTE MERCADO PAGO
echo ========================================
echo.
echo VISA - APROVADO:
echo   Numero: 4509 9535 6623 3704
echo   Nome: APRO
echo   Validade: 11/25
echo   CVV: 123
echo.
echo MASTER - APROVADO:
echo   Numero: 5031 4332 1540 6351
echo   Nome: APRO
echo   Validade: 11/25
echo   CVV: 123
echo.
echo VISA - RECUSADO:
echo   Numero: 4000 0000 0000 0010
echo   Nome: OTHE
echo   Validade: 11/25
echo   CVV: 123
echo.
echo ========================================
echo.
echo Abrindo sistema no navegador...
start http://localhost:3000
echo.
echo Pressione qualquer tecla para sair...
pause > nul
