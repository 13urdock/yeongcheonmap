#!/usr/bin/env bash
# 서버 첫 준비 (Lightsail Ubuntu 에서 한 번만): 시간대, 스왑, Docker, rclone
# 실행: bash deploy/scripts/server-setup.sh   → 끝나면 SSH 창을 닫고 다시 접속 (docker 그룹 반영)
set -euo pipefail

echo "[1/4] 시간대를 Asia/Seoul 로"
sudo timedatectl set-timezone Asia/Seoul

echo "[2/4] 스왑 2GB (메모리가 작은 서버에서 이미지 빌드가 멈추지 않게)"
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null
else
  echo "  이미 있음 — 건너뜀"
fi

echo "[3/4] Docker (공식 설치 스크립트)"
if ! command -v docker > /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
else
  echo "  이미 설치됨 — 건너뜀"
fi

echo "[4/4] rclone (DB 백업을 구글 드라이브로 보낼 때 사용)"
if ! command -v rclone > /dev/null; then
  sudo apt-get update
  sudo apt-get install -y rclone
else
  echo "  이미 설치됨 — 건너뜀"
fi

echo
echo "완료. SSH 창을 닫고 다시 접속한 뒤 'docker ps' 가 에러 없이 되는지 확인하세요."
