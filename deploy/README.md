# 배포 런북 — 영천 기억 지도 서버 (AWS Lightsail 서울)

> 구성: Lightsail 서버 1대 = `caddy`(HTTPS) + `api`(NestJS) + `db`(PostgreSQL), Docker Compose.
> 주소: `https://map.burdocklab.com/api/v1` · 사진: 외부 스토리지(A안, 별도) · DB 백업: 구글 드라이브(rclone).
> 기간: 전시 포함 1~2달 운영 후 삭제(9단계).

```
deploy/
  docker-compose.yml   서버 구성 (db·api·caddy)
  Caddyfile            HTTPS·역방향 프록시
  .env.example         서버 비밀값 견본 → 서버에서 .env 로 복사 (커밋 금지)
  scripts/
    server-setup.sh    서버 첫 준비 (한 번)
    deploy.sh          배포·업데이트 (코드 받기 → 빌드 → 재기동, 마이그레이션 자동)
    backup.sh          DB 백업 (+ 구글 드라이브)
    restore.sh         DB 복원
backend/Dockerfile     api 이미지
```

---

## 0. 로컬에서 먼저
1. 지금까지 변경을 커밋하고 GitHub(`13urdock/yeongcheonmap`)에 push. **서버는 GitHub 에서 코드를 받는다** — push 안 한 변경은 서버에 안 올라간다.
2. AWS 콘솔 > Billing > **Budgets** 에 월 예산 알림(예: $10) 만들기.

## 1. Lightsail 서버 만들기
1. Lightsail 콘솔 > 인스턴스 생성
   - 리전: **서울 (ap-northeast-2)** — 단, AWS Free plan 계정은 Region을 고를 수 없어 **Sydney (ap-southeast-2)** 로 만들었다(2026-11-09). Seoul로 옮기려면 Upgrade plan 후 인스턴스를 새로 만들어야 한다(Region 변경 불가)
   - 플랫폼 Linux/Unix · 블루프린트 **OS 전용 > Ubuntu (LTS 최신)**
   - 플랜: **메모리 2GB 권장** (1GB 도 스왑으로 버틸 수 있지만 빌드가 느림). 가격은 요금 페이지에서 확인
   - 이름: `yeongcheonmap`
2. 네트워킹 탭 > **고정 IP 생성 → 이 인스턴스에 연결**. (연결 안 된 고정 IP 는 요금이 나간다)
3. 같은 탭 > IPv4 방화벽: **HTTP(80), HTTPS(443)** 규칙이 있는지 확인, 없으면 추가. (SSH 22 는 기본)

## 2. DNS 연결 (Cloudflare)
> `burdocklab.com` 은 Squarespace 에 등록돼 있지만 **Nameserver 가 Cloudflare**(`dara`/`marvin.ns.cloudflare.com`)라서 레코드는 **Cloudflare** 에 넣는다. Squarespace DNS 에 넣으면 적용되지 않는다.
1. dash.cloudflare.com > `burdocklab.com` > **DNS** > **Records** > **Add record**
2. **Type A · Name `map` · IPv4 address = 1단계의 Static IP · Proxy status = DNS only(회색 구름)** — Proxied(주황)면 Cloudflare 가 HTTPS 를 가로채 Caddy 인증서와 꼬일 수 있다
3. 확인 (윈도우 PowerShell): `nslookup map.burdocklab.com 8.8.8.8` → 고정 IP 가 나오면 성공. 몇 분~몇 시간 걸릴 수 있다.
   - **DNS 가 연결되기 전에 5단계를 하면 HTTPS 인증서 발급이 실패한다.** 먼저 확인할 것.

## 3. 서버 접속 · 코드 받기
1. Lightsail 인스턴스 화면 > **Connect using SSH** (브라우저 터미널)
2. 코드 받기
   - 레포가 **공개**면 (2026-11-09 현재 공개): `git clone https://github.com/13urdock/yeongcheonmap.git`
   - 레포가 **비공개**면 (읽기 전용 배포 키):
     ```bash
     ssh-keygen -t ed25519 -f ~/.ssh/yeongcheonmap_deploy -N ""
     cat ~/.ssh/yeongcheonmap_deploy.pub
     ```
     → 출력된 한 줄을 GitHub 레포 > Settings > **Deploy keys** > Add (쓰기 권한 체크 안 함)
     ```bash
     printf 'Host github.com\n  IdentityFile ~/.ssh/yeongcheonmap_deploy\n' >> ~/.ssh/config
     git clone git@github.com:13urdock/yeongcheonmap.git
     ```
3. 서버 준비: `bash ~/yeongcheonmap/deploy/scripts/server-setup.sh`
4. **SSH 창을 닫고 다시 접속** → `docker ps` 가 에러 없이 되면 OK

## 4. 비밀값 채우기
```bash
cd ~/yeongcheonmap/deploy
cp .env.example .env
openssl rand -hex 32     # 한 번 실행할 때마다 새 값 — POSTGRES_PASSWORD, JWT 두 개에 각각 다른 값
nano .env                # 채우고 Ctrl+O 저장, Ctrl+X 나가기
```
- `NAVER_SEARCH_*` 는 로컬 `backend/.env` 와 같은 값.
- `SEED_USER_PASSWORD` = 전시 기기에서 수집가로 로그인할 비밀번호.
- `STORAGE_ACCESS_KEY`·`STORAGE_SECRET_KEY` = 로컬 `backend/.env` 와 같은 NCP 키(사진 업로드). 나머지 `STORAGE_*` 는 견본 값 그대로. 이미 배포한 서버면 `.env` 에 추가 후 `deploy.sh` 다시 실행.

## 5. 첫 배포
```bash
bash ~/yeongcheonmap/deploy/scripts/deploy.sh                   # 첫 빌드는 몇 분 걸림
cd ~/yeongcheonmap/deploy && docker compose exec api npx prisma db seed   # 수집가 계정 (가상 샘플 없음)
curl -s https://map.burdocklab.com/api/v1/events | head -c 300  # {"success":true,...} 면 성공
```
- 문제가 있으면: `docker compose logs api` / `docker compose logs caddy` (인증서 문제는 caddy 로그)

## 6. DB 백업 → 구글 드라이브
1. 서버에서 `rclone config`
   - `n` (새 리모트) → 이름 **`gdrive`** → 종류 `drive` → client_id/secret 비움
   - scope: **`drive.file`** 선택 — rclone 이 만든 파일만 보이는 권한. 서버가 털려도 드라이브 전체(5TB)는 안 보인다
   - 고급 설정 `n` → "Use web browser to automatically authenticate?" **`n`**
   - 화면에 나온 `rclone authorize "drive" "..."` 명령을 복사
2. **윈도우 PC** 에 rclone 설치(rclone.org/downloads) → PowerShell 에서 그 명령 실행 → 브라우저에서 구글 로그인·허용 → 출력된 토큰을 서버 터미널에 붙여넣기 → 나머지 기본값 → `q`
3. 시험: `bash ~/yeongcheonmap/deploy/scripts/backup.sh` → 드라이브에 `yeongcheonmap-backups/` 폴더가 생기면 OK
4. 매일 새벽 4:30 자동: `crontab -e` 에 아래 한 줄
   ```
   30 4 * * * /home/ubuntu/yeongcheonmap/deploy/scripts/backup.sh >> /home/ubuntu/yeongcheonmap/deploy/backups/backup.log 2>&1
   ```
- 복원: `bash deploy/scripts/restore.sh deploy/backups/<파일>.sql.gz` (드라이브 파일은 `rclone copy gdrive:yeongcheonmap-backups/<파일> deploy/backups/` 로 먼저 내려받기)

## 7. 앱(APK)을 서버에 연결
1. `frontend/.env.production` 만들기 (`.env` 복사 후 한 줄만 변경)
   ```
   API_BASE_URL=https://map.burdocklab.com/api/v1
   ```
2. `flutter build apk --release --dart-define-from-file=.env.production`
3. 폰에 설치 → 지도·검색·기록 보관이 되는지 확인 (노트북 서버 꺼 둔 상태로)

## 8. 코드 고친 뒤 다시 배포
**10단계(자동 배포)를 해 뒀다면: `main` 에 push 하면 끝.** GitHub Actions 가 테스트 → 통과하면 서버에서 `deploy.sh` 실행 → `/events` 200 확인까지 한다. 결과는 GitHub 레포 > **Actions** 탭.
- 자동 배포 대상: `backend/`·`deploy/`·워크플로 파일이 바뀐 push 만. 문서(`docs/`)·앱(`frontend/`)만 고친 push 는 배포 안 함.
- 테스트가 실패하면 배포하지 않는다.
- 다시 배포만 하고 싶을 때: Actions > **backend** > **Run workflow**.
- 서버 `deploy/.env`(비밀값)는 git 에 없으므로 **새 환경변수가 생기면 서버에서 직접 추가한 뒤** push 할 것.

10단계 전이거나 Actions 가 안 될 때(손으로): 로컬에서 커밋·push → 서버에서 `bash ~/yeongcheonmap/deploy/scripts/deploy.sh`
- 스키마를 바꿨다면 로컬에서 `prisma migrate dev` 로 만든 마이그레이션 파일까지 커밋할 것 (서버는 `migrate deploy` 만 한다)

## 9. 운영 종료 (전시 후 1~2달)
1. 마지막 백업: `backup.sh` → 드라이브에 있는지 확인
2. Lightsail: **인스턴스 삭제 + 고정 IP 해제(삭제)** — 고정 IP 만 남겨 두면 요금이 계속 나간다
3. Cloudflare DNS 에서 `map` 레코드 삭제

## 10. 자동 배포 (GitHub Actions) 설정 — 1회
워크플로: `.github/workflows/backend.yml`. GitHub 이 서버에 SSH 로 들어와 `deploy.sh` 를 실행하므로, **배포 전용 키**를 하나 만들어 서버에 등록하고 GitHub 에 맡긴다.

1. 배포 전용 키를 **윈도우 PC** 에서 만든다 (브라우저 SSH 창에서 긴 개인키를 복사하면 줄이 깨져 `error in libcrypto` 가 난다)
   - PowerShell:
     ```powershell
     ssh-keygen -t ed25519 -f $HOME\gh_actions_deploy -C github-actions-deploy   # 암호 묻는 두 번은 그냥 Enter
     Get-Content $HOME\gh_actions_deploy.pub | Set-Clipboard                       # 공개키(한 줄) 복사
     ```
   - 서버(Connect using SSH)에 붙여넣어 등록 — 예전에 만든 배포 키 줄은 지우고 새로 넣는다:
     ```bash
     sed -i '/github-actions-deploy/d' ~/.ssh/authorized_keys
     echo '여기에 붙여넣기' >> ~/.ssh/authorized_keys
     ssh-keyscan -t eld25519 localhost 2>/dev/null | sed "s/^localhost/$(curl -s ifconfig.me)/"   # 호스트 키 한 줄 → DEPLOY_HOST_KEY
     ```
     마지막 출력이 `13.55.192.211 ssh-ed25519 AAAA...` 형태인지 확인 (IP 가 다르면 맨 앞을 Static IP 로)
   - 개인키는 PC 에서 클립보드로: `Get-Content $HOME\gh_actions_deploy -Raw | Set-Clipboard` → 3번 `DEPLOY_SSH_KEY` 에 붙여넣기 (`-----BEGIN` ~ `-----END ...-----` 전부)
   - 다 넣었으면 PC 의 키 파일 두 개는 지워도 된다 (다시 필요하면 새로 만들면 됨)
2. GitHub 레포 > **Settings** > **Environments** > **New environment** → 이름 `production`
3. 같은 `production` 환경 > **Environment secrets** > **Add environment secret** 4개
   | Name | Value |
   |---|---|
   | `DEPLOY_HOST` | `13.55.192.211` |
   | `DEPLOY_USER` | `ubuntu` |
   | `DEPLOY_SSH_KEY` | 1번의 개인키 전체 (PC 에서 Set-Clipboard 로 복사한 것) |
   | `DEPLOY_HOST_KEY` | 1번 마지막 줄 |
4. 워크플로 파일을 커밋·push → **Actions** 탭에서 `test` → `deploy` 가 초록색이면 완료.

- 레포가 공개여도 Secrets 는 남에게 안 보이고, 다른 사람의 PR(포크)에서는 `deploy` 가 돌지 않는다(`main` push 만 배포).
- 운영 종료(9단계) 때: GitHub Secrets 4개 삭제, 또는 워크플로 파일 삭제.
- 키가 샜다고 의심되면: 서버 `~/.ssh/authorized_keys` 에서 `github-actions-deploy` 줄 삭제 → 1번부터 다시.
