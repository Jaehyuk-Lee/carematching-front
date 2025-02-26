FROM nginx:alpine

# reverse proxy 설정 파일 복사
COPY deployment/reverse-proxy.conf /etc/nginx/conf.d/reverse-proxy.conf

COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
