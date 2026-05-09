# Arkano Portal

Arkano Portal es una plataforma integral compuesta por un frontend en React (sin compilación) y un backend en Django para la gestión de proyectos, casos, contactos y más de Arkano.

## Estructura del Proyecto

El repositorio está dividido en dos partes principales:

- `frontend/`: Aplicación frontend construida con React puro usando Babel standalone. No requiere Node.js ni procesos de compilación complejos.
- `backend/`: API y panel de administración construidos con Django.

## Requisitos Previos

- **Para el Backend:** Python 3.8+ y pip.
- **Para el Frontend:** Cualquier servidor web estático moderno (Live Server, http.server de Python, etc.) o simplemente un navegador web para abrir los archivos HTML directamente.

## Instrucciones de Instalación y Ejecución

### 1. Backend (Django)

El backend cuenta con un script que automatiza la creación del entorno virtual, la instalación de dependencias, las migraciones y la carga de datos iniciales.

**Usando el script automático (Windows):**
```bash
cd backend
start.bat
```

**De forma manual:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python setup_initial_data.py
python manage.py runserver 0.0.0.0:8000
```
El backend estará disponible en `http://localhost:8000/`.

### 2. Frontend (React Standalone)

El frontend está diseñado para ejecutarse sin procesos de build.

Simplemente sirve los archivos estáticos desde la carpeta `frontend/`:

**Usando Python:**
```bash
cd frontend
python -m http.server 8080
```
Luego abre `http://localhost:8080/Arkano-IA.html` o `http://localhost:8080/admin.html` en tu navegador.

O usando extensiones como **Live Server** en VSCode.

## Contribución

Por favor, asegúrate de no comitear los archivos del entorno virtual (`venv/`), base de datos local (`db.sqlite3`), o archivos de configuración privada (`.env`). Estos ya están incluidos en el `.gitignore`.
