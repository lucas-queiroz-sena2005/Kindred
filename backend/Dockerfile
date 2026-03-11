FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
RUN npm run build 

FROM node:20-alpine
WORKDIR /app
RUN chown -R node:node /app 
COPY package*.json ./
RUN npm ci --only=production 
COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/db ./db
USER node
EXPOSE 5000
CMD ["node", "dist/src/server.js"]