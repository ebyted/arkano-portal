@echo off
echo ========================================
echo   Arkano-IA Backend
echo ========================================

if not exist venv (
    echo Creando entorno virtual...
    python -m venv venv
)

call venv\Scripts\activate

echo Instalando dependencias...
pip install -r requirements.txt --quiet

if not exist .env (
    copy .env.example .env
    echo Archivo .env creado desde .env.example
)

echo Aplicando migraciones...
python manage.py migrate

echo Cargando datos iniciales...
python setup_initial_data.py

echo.
echo ========================================
echo   Iniciando servidor en puerto 8000
echo ========================================
python manage.py runserver 0.0.0.0:8000
