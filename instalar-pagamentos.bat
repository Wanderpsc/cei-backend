@echo off
echo ========================================
echo   Sistema CEI - Instalacao de Pagamentos
echo   Desenvolvido por Wander Pires Silva Coelho
echo ========================================
echo.

REM Verifica se Node.js esta instalado
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

REM Verifica se npm esta instalado
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)

echo [OK] npm encontrado
npm --version
echo.

echo ========================================
echo   Instalando dependencias do Backend
echo ========================================
echo.

REM Instalar dependencias do backend
call npm install express cors body-parser dotenv nodemon

if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [OK] Dependencias instaladas com sucesso!
echo.

REM Criar arquivo .env se nao existir
if not exist .env (
    echo Criando arquivo .env...
    copy .env.example .env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Arquivo .env criado
    ) else (
        echo [AVISO] Nao foi possivel criar .env automaticamente
        echo Por favor, copie .env.example para .env manualmente
    )
) else (
    echo [OK] Arquivo .env ja existe
)

echo.
echo ========================================
echo   Instalacao concluida!
echo ========================================
echo.
echo Para iniciar o backend, execute:
echo   node backend-exemplo.js
echo.
echo Para iniciar o frontend, execute em outro terminal:
echo   npm start
echo.
echo O backend rodara em: http://localhost:3001
echo O frontend rodara em: http://localhost:3000
echo.
echo ========================================
echo   Testando o Sistema
echo ========================================
echo.
echo 1. Acesse: http://localhost:3000/cadastro-escola
echo 2. Preencha todos os dados do cadastro
echo 3. Escolha um plano
echo 4. Finalize o cadastro
echo 5. Sera redirecionado para a pagina de pagamento
echo 6. Teste PIX ou Cartao de Credito
echo 7. Aguarde a confirmacao
echo.
echo ========================================
echo.

pause
