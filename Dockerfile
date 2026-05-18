FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .

ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_MESSAGE_TIMEOUT
ARG VITE_CURRENCY_SYMBOL
ARG VITE_FTP_TARGET

RUN npm run build

# Production: serve with nginx
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
