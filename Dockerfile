FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/app/data/nexo.db \
    SEED_DATABASE=false

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
RUN mkdir -p /app/data && chown node:node /app/data

USER node
EXPOSE 3001
CMD ["npm", "start"]
