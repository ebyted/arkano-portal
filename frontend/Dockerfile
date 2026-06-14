FROM nginx:alpine

# Configuración de nginx con proxy al backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar todos los archivos del frontend a la carpeta pública de Nginx
COPY . /usr/share/nginx/html/

# Renombrar Arkano-IA.html a index.html para que sea la página por defecto
RUN mv /usr/share/nginx/html/Arkano-IA.html /usr/share/nginx/html/index.html

EXPOSE 80
