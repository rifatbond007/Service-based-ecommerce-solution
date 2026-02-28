FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY ../../libs/common ./libs/common
RUN cd libs/common && npm ci && npm run build && cd ../..
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

RUN addgroup -S nestjs && adduser -S nestjs -G nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

USER nestjs

EXPOSE 3005

CMD ["node", "dist/main"]
