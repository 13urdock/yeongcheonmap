# 영천 홍보지도 앱 — 백엔드 (NestJS + Prisma 7 + PostgreSQL)

코딩 규칙은 `CLAUDE.md`, 계약은 `../docs/API명세서_v4.md`, DB는 `prisma/schema.prisma`(정본).

## 현재 구현 범위 (ERD v5 / API v4 — 2026-10-10 시대 제거 반영)
| 엔드포인트 | 상태 |
|---|---|
| `GET /places?bbox=&usageType=&page=&size=` | 구현 (지도 장소 핀) |
| `GET /places/{placeId}` | 구현 |
| `GET /places/{placeId}/stories?order=asc\|desc` | 구현 (장소 타임라인, 기억 날짜 순) |
| `POST /places` | 구현 (JWT) |
| `GET /events`, `GET /events/{eventId}` | 구현 (지도 축제 핀·상세) |
| `GET /events/{eventId}/stories?order=asc\|desc` | 구현 (축제 타임라인) |
| `GET /stories/{storyId}`, `POST /stories` | 구현 (작성은 JWT) |
| `PATCH/DELETE /stories`, auth / users / uploads / achievements | 미구현 |
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
npm run prisma:seed           # 샘플 장소 3곳 + 축제 2개 + 다양한 기억 날짜의 기록 10개
npm run start:dev             # http://localhost:8080/api/v1
```
- `npm test` — 규칙 단위 테스트(기억 날짜 범위·형식, 스토리 작성 규칙, bbox 파서).
- Prisma 7 은 드라이버 어댑터(`@prisma/adapter-pg`)로 접속한다. 연결 URL은 `prisma.config.ts`(CLI)와 `PrismaService`(런타임)가 각각 `DATABASE_URL`에서 읽는다.

## 개발용 토큰 (auth 모듈 전까지)
POST 엔드포인트 테스트용 access 토큰은 `JWT_ACCESS_SECRET` 으로 직접 서명한다. payload 계약: `{ sub: userId }` (시드 사용자 `b0000000-0000-4000-8000-000000000001`).
```bash
node -e "console.log(require('jsonwebtoken').sign({sub:'b0000000-0000-4000-8000-000000000001'}, process.env.JWT_ACCESS_SECRET, {expiresIn:'1h'}))"
```

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
src/modules/place                장소 핀·상세·등록
src/modules/event                축제 핀·상세
src/modules/story                타임라인(장소·축제) · 상세 · 작성 / 정렬 규칙(story-timeline.order.ts)
src/generated/prisma             prisma generate 산출물 (gitignore)
```
