@echo off
echo ========================================
echo   CEI - Deploy para GitHub Pages
echo ========================================
echo.

echo [INFO] Verificando repositorio Git...
git remote -v

echo.
echo [1/2] Construindo projeto otimizado...
call npm run build

echo.
echo [2/2] Fazendo deploy para GitHub Pages...
call npm run deploy

echo.
echo ========================================
echo   Deploy Concluido!
echo ========================================
echo.
echo Acesse: https://Wanderpsc.github.io/cei-backend
echo.
echo Aguarde 1-2 minutos para o GitHub processar.
echo.
pause
