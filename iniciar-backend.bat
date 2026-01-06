@echo off
title CEI - Backend API
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║     💳 CEI - Backend de Pagamentos                   ║
echo ║     Mercado Pago Integration                         ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version
echo.

REM Verificar se o arquivo .env existe
if not exist .env (
    echo [AVISO] Arquivo .env nao encontrado!
    echo.
    echo Por favor, configure suas credenciais do Mercado Pago no arquivo .env
    echo.
    echo 1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
    echo 2. Copie seu Access Token e Public Key
    echo 3. Edite o arquivo .env e substitua os valores
    echo.
    pause
)

REM Verificar se as dependências estão instaladas
if not exist node_modules\mercadopago (
    echo [AVISO] Dependencias nao instaladas. Instalando...
    call npm install
)

echo.
echo ════════════════════════════════════════════════════════
echo   Iniciando Backend...
echo ════════════════════════════════════════════════════════
echo.

REM Iniciar o servidor
node server.js

pause
