# syntax=docker/dockerfile:1

# ---- Build stage ------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY app/ ./
# The production bundle calls the API through the same origin ("/api"), which
# nginx proxies to the api container. Set VITE_API_URL to override it.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Runtime stage ----------------------------------------------------------
FROM nginx:alpine AS runtime

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1/ || exit 1
