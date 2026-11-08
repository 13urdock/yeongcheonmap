# 영천 기억 지도 백엔드 — 배포용 이미지 (deploy/docker-compose.yml 이 빌드한다)
# 한 이미지에 빌드 결과와 prisma CLI·ts-node(devDependencies)를 같이 둔다.
#   - 기동할 때: prisma migrate deploy → node dist/main
#   - 필요할 때: 같은 이미지로 seed 실행 (docker compose exec api npx prisma db seed)
# 전시 규모라 이미지 크기보다 "한 이미지로 다 된다"는 단순함을 택했다.
FROM node:22-bookworm-slim

# Prisma CLI 가 쓰는 openssl
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 의존성 먼저 (package*.json 이 안 바뀌면 이 단계는 캐시로 건너뛴다)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# prisma.config.ts 가 DATABASE_URL 을 읽으므로 빌드 때만 가짜 값을 준다 (generate 는 DB 에 접속하지 않음)
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate \
  && npm run build

ENV NODE_ENV=production
EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
