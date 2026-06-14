FROM nginx:alpine

# URL del backend (se inyecta en build time para nginx.conf)
ARG BACKEND_URL=http://localhost:8000
ENV BACKEND_URL=$BACKEND_URL

# Configuración nginx con proxy dinámico al backend
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copiar archivos del frontend
COPY . /usr/share/nginx/html/

# Renombrar Arkano-IA.html a index.html
RUN mv /usr/share/nginx/html/Arkano-IA.html /usr/share/nginx/html/index.html

# Sustituir la variable BACKEND_URL en nginx.conf al arrancar
CMD sh -c "envsubst '\$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

EXPOSE 80
