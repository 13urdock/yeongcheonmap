#!/usr/bin/env bash
# DB 복원: 백업 파일(.sql.gz) 하나를 지금 DB 에 덮어쓴다. 되돌릴 수 없으니 먼저 backup.sh 로 현재 상태를 백업할 것.
# 실행: bash deploy/scripts/restore.sh deploy/backups/yeongcheonmap-20261120-0430.sql.gz
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FILE="${1:-}"

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "사용법: bash deploy/scripts/restore.sh <백업파일.sql.gz>" >&2
  exit 1
fi

read -r -p "지금 DB 를 '$FILE' 내용으로 덮어씁니다. 계속하려면 yes 입력: " answer
if [ "$answer" != "yes" ]; then
  echo "취소했어요."
  exit 0
fi

gunzip -c "$FILE" | docker compose -f "$DEPLOY_DIR/docker-compose.yml" exec -T db \
  psql -U yeongcheon -d yeongcheonmap -v ON_ERROR_STOP=1 > /dev/null
echo "복원 완료. api 재시작: cd deploy && docker compose restart api"
