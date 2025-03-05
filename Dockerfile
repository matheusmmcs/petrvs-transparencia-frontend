# Etapa de build do Vue
FROM node:22.14.0-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# O diretório de build será copiado para uma pasta externa
VOLUME /app