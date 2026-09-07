# =============================================================
# ToubibBO (doctor back-office) — single multi-stage Dockerfile
#
#   dev  -> Vite dev server (hot reload), used by
#           docker-compose.override.yml (target: dev)
#   prod -> static build served by nginx (default target)
# =============================================================

FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# -------------------------------------------------------------
# Development
# -------------------------------------------------------------
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -------------------------------------------------------------
# Build (production assets)
# -------------------------------------------------------------
FROM base AS builder
RUN npm ci --production=false
COPY . .

ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_MESSAGE_TIMEOUT
ARG VITE_CURRENCY_SYMBOL
ARG VITE_FTP_TARGET

RUN npm run build

# -------------------------------------------------------------
# Production (default target)
# -------------------------------------------------------------
FROM nginx:1.27-alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
