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

# Archivos estáticos del admin (necesario con DEBUG=False)
RUN python manage.py collectstatic --noinput

# Exponer el puerto
EXPOSE 8000

# Migraciones + gunicorn (producción)
CMD python manage.py migrate && python setup_initial_data.py && gunicorn arkano_project.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
