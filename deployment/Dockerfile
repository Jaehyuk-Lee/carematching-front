FROM nginx:alpine

# default.conf 파일 복사
COPY deployment/default.conf /etc/nginx/conf.d/default.conf
COPY deployment/nginx.conf /etc/nginx/nginx.conf

COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
