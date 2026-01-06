@echo off
title Sistema CEI - Iniciando Servidores
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║          🏫 SISTEMA CEI - Controle Escolar           ║
echo ║          Sistema de Pagamentos Integrado             ║
echo ║                                                       ║
echo ║  Desenvolvido por: Wander Pires Silva Coelho ®      ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo Iniciando servidores...
echo.

REM Verificar se Node.js esta instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se .env existe
if not exist .env (
    echo [AVISO] Arquivo .env nao encontrado!
    echo Criando a partir do .env.example...
    copy .env.example .env >nul 2>&1
)

REM Iniciar Backend em nova janela
echo [1/2] Iniciando Backend na porta 3001...
start "CEI Backend - API de Pagamentos" /min cmd /c "node backend-exemplo.js"
timeout /t 3 /nobreak >nul

REM Iniciar Frontend em nova janela
echo [2/2] Iniciando Frontend na porta 3000...
start "CEI Frontend - React" /min cmd /c "npm start"
timeout /t 3 /nobreak >nul

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║  ✅ Servidores iniciados com sucesso!                ║
echo ║                                                       ║
echo ║  Backend API:  http://localhost:3001                 ║
echo ║  Frontend:     http://localhost:3000                 ║
echo ║                                                       ║
echo ║  Para testar o sistema de pagamento:                 ║
echo ║  1. Acesse: http://localhost:3000/cadastro-escola    ║
echo ║  2. Preencha todos os dados                          ║
echo ║  3. Escolha um plano                                 ║
echo ║  4. Complete o pagamento                             ║
echo ║                                                       ║
echo ║  Pressione qualquer tecla para abrir o navegador...  ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

pause >nul

REM Abrir navegador
start http://localhost:3000

echo.
echo Sistema aberto no navegador!
echo.
echo Para encerrar os servidores, feche as janelas do Backend e Frontend
echo ou pressione Ctrl+C em cada uma delas.
echo.

pause
