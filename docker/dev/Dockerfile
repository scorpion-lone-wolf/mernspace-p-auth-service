FROM node:trixie-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
# ========================================
FROM node:trixie-slim AS dev

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts


EXPOSE 5501

USER node

CMD ["node" , "src/server.js"]
