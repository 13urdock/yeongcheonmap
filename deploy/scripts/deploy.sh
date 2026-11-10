#!/usr/bin/env bash
# 배포/업데이트: 최신 코드 받기 → 이미지 다시 빌드 → 재기동 (DB 마이그레이션은 api 가 기동 때 자동 적용)
# 실행: bash deploy/scripts/deploy.sh
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$DEPLOY_DIR/.." && pwd)"

if [ ! -f "$DEPLOY_DIR/.env" ]; then
  echo "deploy/.env 가 없어요. deploy/.env.example 을 복사해 채워 주세요." >&2
  exit 1
fi

echo "[1/3] 최신 코드 받기"
git -C "$REPO_DIR" pull --ff-only

echo "[2/3] 빌드 + 재기동"
cd "$DEPLOY_DIR"
docker compose up -d --build
# Caddyfile 은 파일 하나를 물려 쓰므로 git pull 로 바뀌면 컨테이너를 새로 만들어야 새 파일을 본다(몇 초 끊김).
# web/ 은 폴더째 물려 있어 바로 반영된다.
docker compose up -d --force-recreate --no-deps caddy
docker image prune -f > /dev/null

echo "[3/3] 상태"
docker compose ps
echo
echo "로그 보기: cd deploy && docker compose logs -f api"
echo "확인:     curl -s https://\$(grep ^APP_DOMAIN= .env | cut -d= -f2)/api/v1/events | head -c 300"
