#!/usr/bin/env bash
# DB 백업: pg_dump → deploy/backups/*.sql.gz (14일 보관) → rclone 리모트 'gdrive' 가 있으면 구글 드라이브로 복사
# 수동 실행: bash deploy/scripts/backup.sh
# 매일 자동: crontab -e 에 한 줄 (경로는 서버에 맞게)
#   30 4 * * * /home/ubuntu/yeongcheonmap/deploy/scripts/backup.sh >> /home/ubuntu/yeongcheonmap/deploy/backups/backup.log 2>&1
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$DEPLOY_DIR/backups"
GDRIVE_REMOTE="gdrive"
GDRIVE_FOLDER="yeongcheonmap-backups"
KEEP_DAYS=14

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M)"
FILE="$BACKUP_DIR/yeongcheonmap-$STAMP.sql.gz"

echo "[$(date '+%F %T')] 백업 시작 → $FILE"
docker compose -f "$DEPLOY_DIR/docker-compose.yml" exec -T db \
  pg_dump -U yeongcheon -d yeongcheonmap --no-owner --clean --if-exists \
  | gzip > "$FILE"

# 비어 있는 백업(덤프 실패)은 남기지 않는다
if [ ! -s "$FILE" ]; then
  rm -f "$FILE"
  echo "백업 실패: 덤프가 비어 있어요" >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'yeongcheonmap-*.sql.gz' -mtime +"$KEEP_DAYS" -delete

if rclone listremotes 2>/dev/null | grep -qx "${GDRIVE_REMOTE}:"; then
  rclone copy "$FILE" "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}/"
  echo "구글 드라이브 복사 완료 (${GDRIVE_FOLDER}/)"
else
  echo "rclone 리모트 '${GDRIVE_REMOTE}' 가 없어 서버에만 저장했어요 (deploy/README.md 6단계)"
fi
echo "[$(date '+%F %T')] 백업 끝"
