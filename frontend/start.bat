@echo off
cd /d "%~dp0"
echo ========================================
echo   Arkano-IA Frontend
echo ========================================
echo.
echo Iniciando servidor de desarrollo...
echo Abriendo http://localhost:8080/Arkano-IA.html en tu navegador...
echo.
start http://localhost:8080/Arkano-IA.html
python -m http.server 8080
