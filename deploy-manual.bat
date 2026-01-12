@echo off
echo ========================================
echo   CEI - Deploy GitHub Pages SIMPLIFICADO
echo ========================================
echo.

REM Garantir que estamos na branch main
git checkout main
echo.

echo [1/4] Limpando build antigo...
if exist build rmdir /s /q build

echo [2/4] Construindo projeto (isso pode demorar)...
call npm run build
if errorlevel 1 (
    echo ERRO no build!
    pause
    exit /b 1
)

echo [3/4] Preparando branch gh-pages...
git branch -D gh-pages 2>nul
git checkout --orphan gh-pages

echo [4/4] Publicando no GitHub...
git --work-tree build add --all
git --work-tree build commit -m "Deploy CEI v3.3.1"
git push origin HEAD:gh-pages --force

git checkout main

echo.
echo ========================================
echo   DEPLOY CONCLUIDO!
echo ========================================
echo.
echo Acesse: https://Wanderpsc.github.io/cei-backend
echo.
echo Configure no GitHub:
echo 1. Acesse: https://github.com/Wanderpsc/cei-backend/settings/pages
echo 2. Em Source/Branch, selecione: gh-pages
echo 3. Clique em Save
echo.
pause
