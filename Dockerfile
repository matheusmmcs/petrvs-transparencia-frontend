# Etapa de build do Vue
FROM node:22.14.0-alpine AS build

WORKDIR /app
COPY package.json package-lock.json .env ./
RUN npm install
COPY . .
RUN npm run build

# O diretório de build será copiado para uma pasta externa
VOLUME /app