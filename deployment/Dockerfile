FROM nginx:alpine

# reverse proxy 설정이 포함된 default.conf 파일 복사
COPY deployment/default.conf /etc/nginx/conf.d/default.conf

COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
