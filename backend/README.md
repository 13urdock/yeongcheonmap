# 영천 홍보지도 앱 — 백엔드 (NestJS + Prisma 7 + PostgreSQL)

코딩 규칙은 `CLAUDE.md`, 계약은 `../docs/API명세서_v4.md`, DB는 `prisma/schema.prisma`(정본).

## 현재 구현 범위 (ERD v5 / API v4 — 2026-10-10 시대 제거 반영)
| 엔드포인트 | 상태 |
|---|---|
| `POST /auth/signup`, `/auth/login`, `/auth/refresh` | 구현 (scrypt 해시, access 1h / refresh 30d·회전) |
| `GET /places?bbox=&usageType=&q=&page=&size=` | 구현 (지도 장소 핀 · `q` 이름/주소 검색) |
| `GET /places/{placeId}` | 구현 |
| `GET /places/{placeId}/stories?order=asc\|desc` | 구현 (장소 타임라인, 기억 날짜 순) |
| `POST /places` | 구현 (JWT) |
| `GET /events?q=`, `GET /events/{eventId}` | 구현 (지도 축제 핀·검색·상세) |
| `GET /events/{eventId}/stories?order=asc\|desc` | 구현 (축제 타임라인) |
| `GET /stories/{storyId}`, `POST /stories` | 구현 (작성은 JWT) |
| `PATCH/DELETE /stories`, `GET /users/me` 등 프로필, uploads, achievements | 미구현 |
| ~~eras, map-layers, place-eras~~ | 삭제 |

공통 인프라: 환경변수 검증, `{ success, data }` 인터셉터, `{ success, error }` 예외 필터, JWT 가드, `@CurrentUser()`, 페이지네이션 DTO, **기억 날짜 규칙(`src/common/memory-date/`)**, Prisma 스키마(ERD v5 전체).

### 기억 날짜 · 타임라인 정렬 (핵심 규칙)
- 입력은 `"memoryDate": "199X.XX.XX"` 문자열 하나. 정렬용 파생값은 `memory-date.resolver.ts` 만 만든다.
- 정렬은 `story/story-timeline.order.ts` 한 곳. 시드 데이터 오름차순 예:
  `1990.05.XX → 199X.XX.XX → 1995.XX.XX → 1995.07.15 → 20X5.XX.XX → 2021.03.XX → XXXX.XX.XX`
- 규칙 표·근거: `../docs/ERD_v5.md` §2–3

## 실행
```bash
cp .env.example .env          # DATABASE_URL, JWT_* 채우기
npm install
npm run prisma:generate       # src/generated/prisma 생성 (커밋 안 함)
npm run prisma:migrate        # 첫 실행: prisma/migrations/ 에 초기 마이그레이션 생성 + 적용
                              # (v4 스키마로 이미 migrate 했던 개발 DB라면 `npx prisma migrate reset` 후 다시)
npm run prisma:seed           # 수집가 계정 (SEED_SAMPLE_DATA=true 면 가상 샘플 장소·축제·기록도)
npm run start:dev             # http://localhost:8080/api/v1
```
- 실제 장소: 앱에서 지도의 상표(장소 이름)를 누르거나 '어디의 기억인가요?'에서 영천 장소를 검색해 기록하면, 보관할 때 `POST /places/resolve` 가 장소를 찾거나 만든다. 검색에는 `.env` 의 `NAVER_SEARCH_CLIENT_ID`·`NAVER_SEARCH_CLIENT_SECRET`(네이버 클라우드 NAVER API HUB Application 의 인증 정보, 검색 '지역' 선택)이 필요하다. 지도 키(Maps)와는 다른 키다.
- 예전에 넣은 가상 샘플 지우기: `npm run prisma:clear-samples`(개수 확인) → `npm run prisma:clear-samples -- --yes`(삭제).
- `npm test` — 규칙 단위 테스트(기억 날짜 범위·형식, 스토리 작성 규칙, bbox 파서).
- Prisma 7 은 드라이버 어댑터(`@prisma/adapter-pg`)로 접속한다. 연결 URL은 `prisma.config.ts`(CLI)와 `PrismaService`(런타임)가 각각 `DATABASE_URL`에서 읽는다.

## 로그인 (Auth_01) — 전시 기기 전용 운영
- **전시 기간엔 가입을 막는다**: `SIGNUP_ENABLED=false`(기본). 기록할 수 있는 계정은 시드 사용자 **수집가** 하나뿐이고,
  운영진이 각 전시 기기에서 그 계정으로 한 번 로그인해 둔 기기만 기록할 수 있다(앱 지도 머리띠의 자물쇠 → "전시 기기 설정").
- 플레이스토어 배포처럼 일반 사용자가 가입해야 할 때만 `SIGNUP_ENABLED=true`.
- 시드 사용자 비밀번호: `.env` 에 `SEED_USER_PASSWORD=원하는비밀번호` 를 넣고 `npm run prisma:seed` → `seed@yeongcheonmap.local` / 그 비밀번호로 로그인. (비워 두면 로그인 불가 값으로 저장)
- 시드를 다시 돌리면 기존 DB 의 시드 사용자 이름도 `수집가` 로 바뀐다.
- 토큰: access 는 `JWT_ACCESS_SECRET`(payload `{ sub }`, 1시간), refresh 는 `JWT_REFRESH_SECRET`(payload `{ sub, sid }`, 30일). refresh 는 `session` 행에 sha256 해시로 보관하고 쓸 때마다 회전.
- 만료된 `session` 행 정리는 아직 없음(쌓이기만 함) — 필요해지면 정리 작업 추가.
- 전시 기기는 30일 넘게 한 번도 안 켜면 refresh 가 만료돼 자물쇠 상태로 돌아간다 → 운영진이 다시 로그인.
- **기기를 잃어버렸거나 전시가 끝났을 때** (모든 전시 기기 로그아웃):
  1. `.env` 의 `SEED_USER_PASSWORD` 를 바꾸고 `npm run prisma:seed` (옛 비밀번호로는 새로 로그인 불가)
  2. 이미 로그인된 기기 끊기: `DELETE FROM session WHERE user_id = 'b0000000-0000-4000-8000-000000000001';`
  3. 남은 기기에서 새 비밀번호로 다시 설정

## 참고
- 기록이 장소·축제 **둘 다**에 붙는 것을 허용한다(최소 하나). 막으려면 `story-create.service.ts` 의 `assertAnchor` 한 곳만 바꾸면 된다.
- `story_anchor_chk` 같은 CHECK 제약은 Prisma 스키마로 표현되지 않아 서비스에서 검증한다. DB에도 걸고 싶으면 첫 마이그레이션 SQL에 수동으로 추가.
- v3 유지 테이블 중 원문이 없는 `user`/`session`/`event_*`/지표 테이블은 API가 요구하는 최소 컬럼으로 정의했다.

## 폴더
```
prisma/schema.prisma             DB 정본 (ERD v5)
prisma/seed.ts                   개발 시드
prisma.config.ts                 Prisma CLI 설정 (스키마·마이그레이션·시드·URL)
src/config/                      환경변수 로드·검증
src/prisma/                      PrismaService + pg 어댑터 팩토리
src/common/memory-date/          기억 날짜: 형식(pattern) · 범위 계산(range) · 저장값 변환(resolver) · 한국 날짜
src/common/{errors,filters,interceptors,guards,decorators,dto,utils}
src/modules/auth                 가입·로그인·토큰 갱신 (password-hasher · token-issuer · session.repository)
src/modules/user                 회원 조회·생성 (auth 가 사용)
src/modules/place                장소 핀·검색·상세·등록
src/modules/event                축제 핀·검색·상세
src/modules/story                타임라인(장소·축제) · 상세 · 작성 / 정렬 규칙(story-timeline.order.ts)
src/generated/prisma             prisma generate 산출물 (gitignore)
```
