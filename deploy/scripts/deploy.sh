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
docker image prune -f > /dev/null

echo "[3/3] 상태"
docker compose ps
echo
echo "로그 보기: cd deploy && docker compose logs -f api"
echo "확인:     curl -s https://\$(grep ^APP_DOMAIN= .env | cut -d= -f2)/api/v1/events | head -c 300"
