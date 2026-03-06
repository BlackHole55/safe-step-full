FROM nginx:alpine

RUN apk update && apk upgrade

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY public /var/www/public

WORKDIR /var/www