FROM node:trixie-slim as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
# ========================================
FROM node:trixie-slim as dev

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY --from=builder --chown=node:node  /app/dist ./

EXPOSE 5501

USER node

CMD ["node" , "src/server.js"]
