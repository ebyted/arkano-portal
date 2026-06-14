FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/
RUN mv /usr/share/nginx/html/Arkano-IA.html /usr/share/nginx/html/index.html

EXPOSE 80
