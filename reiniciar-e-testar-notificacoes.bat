@echo off
cd /d "%~dp0"
pwsh -ExecutionPolicy Bypass -File ".\reiniciar-e-testar-notificacoes.ps1"
pause
