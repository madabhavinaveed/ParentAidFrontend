# Debian slim: Prisma engines expect glibc + OpenSSL 3; Alpine/musl often breaks prisma migrate/db push.
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json ./

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && npm run dev"]
