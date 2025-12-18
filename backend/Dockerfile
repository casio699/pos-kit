FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
