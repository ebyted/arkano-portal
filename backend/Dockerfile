FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema si fueran necesarias para Pillow/Postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar migraciones, cargar datos e iniciar el servidor
# En producción sería mejor usar gunicorn, pero para mantener la consistencia con start.bat:
CMD python manage.py migrate && python setup_initial_data.py && python manage.py runserver 0.0.0.0:8000
