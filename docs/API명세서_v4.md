# 영천 홍보지도 앱 — REST API 명세서 (v4)

> DB 설계 v5에 동기화: **시대 제거**, 장소·축제 핀 → 기억 날짜(부분 날짜) 순 타임라인, 기록마다 "그때 이름".

## 문서 정보

| 항목 | 내용 |
|---|---|
| 버전 | v4 |
| Base URL | 개발: `http://localhost:8080/api/v1` (에뮬레이터에서는 `http://10.0.2.2:8080/api/v1`) |
| DB | PostgreSQL / 이미지: 외부 스토리지 |
| 최종 수정일 | 2026-10-10 |

## 1. 공통 규약
- 인증: JWT Bearer, `Authorization: Bearer {accessToken}`, `POST /auth/refresh`로 갱신.
- JSON 필드 camelCase, ID는 UUID 문자열.
- 응답: `{ "success": true, "data": {...} }` / 실패 `{ "success": false, "error": { "code", "message" } }`
- 목록: `?page=1&size=20` → `{ items, page, size, totalCount }`
- 시각 ISO 8601, 날짜 `YYYY-MM-DD`, 좌표 `latitude`/`longitude`.
- 쿼리·바디에 명세에 없는 필드가 오면 400 `INVALID_PARAMETER`.

### 에러 코드
| 코드 | HTTP | 언제 |
|---|---|---|
| `INVALID_PARAMETER` | 400 | 형식·규칙 위반(기억 날짜 포함) |
| `UNAUTHORIZED` | 401 | 토큰 없음/무효 |
| `FORBIDDEN` | 403 | 본인 것이 아님 |
| `PLACE_NOT_FOUND` | 404 | |
| `EVENT_NOT_FOUND` | 404 | |
| `STORY_NOT_FOUND` | 404 | |
| `DUPLICATE_EMAIL` | 409 | |
| `INTERNAL_ERROR` | 500 | |

## 2. 기억 날짜 (memoryDate)

공항 숫자판 입력값. **문자열 `YYYY.MM.DD`, 각 자리는 `0-9` 또는 `X`(모름).** 전부 모르면 `XXXX.XX.XX`.

- 요청: 문자열 하나만 보낸다. 예 `"memoryDate": "199X.XX.XX"` (생략 시 `XXXX.XX.XX`, 소문자 x 허용)
- 응답: 서버가 계산한 범위를 함께 준다.
```json
"memoryDate": {
  "pattern": "1995.0X.1X",
  "from": "1995-01-10",   // 가능한 가장 이른 날
  "to": "1995-09-19",     // 가능한 가장 늦은 날
  "yearFrom": 1995,       // 연도 자리만 본 가능한 연도 범위 → 앱의 "연도 묶음" 기준
  "yearTo": 1995
}
```
- 가능한 날짜 = X를 채워 만든 실제 달력 날짜 중 **1800-01-01 ~ 오늘(KST)**. 하나도 없으면 400 `INVALID_PARAMETER`.
- 사례 표·정렬 규칙 원문: `docs/ERD_v5.md` §2–3.

---

## 3. 인증 / 사용자 (v3과 동일)

`POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `GET /users/me`, `PATCH /users/me/profile` — v3 형식 유지.

---

## 4. 장소

> 장소 = 좌표 + 지금 이름. 같은 자리의 옛 이름은 각 기록의 `placeNameThen`으로 남는다.

### GET /places
- 지도 핀 목록.
- Query: `bbox`(선택, `minLng,minLat,maxLng,maxLat`), `usageType`(선택), `page`, `size`(최대 500)
```json
{ "success": true, "data": { "items": [
  { "placeId": "uuid", "name": "○○카페", "usageType": "카페",
    "latitude": 35.9733, "longitude": 128.9386,
    "sinceYear": 2019, "thumbnailUrl": null, "storyCount": 12 }
], "page": 1, "size": 20, "totalCount": 42 } }
```

### GET /places/{placeId}
```json
{ "success": true, "data": {
  "placeId": "uuid", "name": "○○카페", "usageType": "카페", "intro": "...",
  "latitude": 35.97, "longitude": 128.93, "address": "경북 영천시 ...",
  "sinceYear": 2019, "thumbnailUrl": null, "storyCount": 12
} }
```
- 에러 `PLACE_NOT_FOUND`(404).

### GET /places/{placeId}/stories  ← 장소 타임라인
- Query: `order` = `asc`(기본) | `desc`, `page`, `size`
- 정렬: 기억 날짜 기준(ERD v5 §3). **작성일 순 아님.**
- 응답: 스토리 목록(7절 구조). 에러 `PLACE_NOT_FOUND`(404).

### POST /places  (인증)
```json
{ "name": "○○카페", "usageType": "카페", "intro": "...", "latitude": 35.97, "longitude": 128.93,
  "address": "...", "sinceYear": 2019, "thumbnailUrl": "https://storage/..." }
```
- `name`, `latitude`, `longitude` 필수. 응답 201 `{ placeId }`.
- 비고: 초기엔 운영자 큐레이션 권장(요구사항 Sys_01).

---

## 5. 축제

### GET /events
- 지도 핀 목록. **위치(latitude·longitude)가 있는 축제만.**
```json
{ "success": true, "data": { "items": [
  { "eventId": "uuid", "name": "영천 축제", "latitude": 35.96, "longitude": 128.94,
    "address": "...", "storyCount": 8 }
] } }
```

### GET /events/{eventId}
```json
{ "success": true, "data": {
  "eventId": "uuid", "name": "영천 축제", "content": "...",
  "latitude": 35.96, "longitude": 128.94, "address": "...", "storyCount": 8,
  "hosts": [ { "hostType": "지자체", "hostName": "영천시" } ],
  "occurrences": [ { "occurrenceId": "uuid", "year": 2015, "startDate": "2015-10-02", "endDate": "2015-10-05" } ]
} }
```
- `occurrences`는 개최 정보(언제 열렸나) 표시용. 기록은 회차가 아니라 축제에 붙는다.
- 에러 `EVENT_NOT_FOUND`(404).

### GET /events/{eventId}/stories  ← 축제 타임라인
- Query·정렬은 장소 타임라인과 동일. 에러 `EVENT_NOT_FOUND`(404).

---

## 6. (삭제) 시대
v3의 `GET /eras`, `GET /eras/{eraId}/map-layers`, `GET /place-eras/{id}`, `POST /place-eras` 는 **삭제**.

---

## 7. 스토리 (기록 = 사진 + 글)

### 스토리 공통 구조
```json
{
  "storyId": "uuid",
  "user": { "userId": "uuid", "name": "홍길동", "profileUrl": null },
  "placeId": "uuid",
  "eventId": null,
  "memoryDate": { "pattern": "199X.XX.XX", "from": "1990-01-01", "to": "1999-12-31", "yearFrom": 1990, "yearTo": 1999 },
  "placeNameThen": "중앙분식",
  "content": "그때 이 골목엔...",
  "photos": [ { "storyPhotoId": "uuid", "imageUrl": "https://storage/..." } ],
  "createdAt": "2026-10-10T14:30:00.000Z"
}
```

### GET /stories/{storyId}
- 상세. 에러 `STORY_NOT_FOUND`(404).

### POST /stories  (인증)
```json
{
  "placeId": "uuid",
  "eventId": null,
  "memoryDate": "199X.XX.XX",
  "placeNameThen": "중앙분식",
  "content": "그때 이 골목엔...",
  "photoUrls": ["https://storage/uploaded1.jpg"]
}
```
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| placeId | uuid | 조건부 | eventId 없으면 필수 |
| eventId | uuid | 조건부 | placeId 없으면 필수 (둘 다 가능) |
| memoryDate | string | 아니오 | §2 형식. 생략 시 `XXXX.XX.XX` |
| placeNameThen | string(≤150) | 아니오 | 그때 이 자리의 이름 |
| content | text | 조건부 | photoUrls 없으면 필수 |
| photoUrls | string[] (≤10) | 조건부 | content 없으면 1개 이상 |
- 응답 201: 생성된 스토리. 에러 `INVALID_PARAMETER`(앵커·내용·날짜 규칙), `PLACE_NOT_FOUND`, `EVENT_NOT_FOUND`.
- 부수효과(예정): 작성자 `story_count` 증가 → 뱃지 트리거.

### PATCH /stories/{storyId}  (인증, 본인만) — 바꿀 수 있는 필드: memoryDate, placeNameThen, content, photoUrls. 에러 `FORBIDDEN`(403)
### DELETE /stories/{storyId}  (인증, 본인만)

---

## 8. 이미지 업로드 · 9. 게임화
v3 §7(프리사인 업로드), §8(뱃지)과 동일.

---

## 10. 미정 (TODO)
- UGC 신고/검수 엔드포인트(요구사항 Sys_02).
- 외부 스토리지 종류(S3/R2) 및 프리사인 세부.
- 타임라인에서 특정 연도로 바로 이동(숫자판으로 연도 고르기) — 필요하면 `GET .../stories?fromYear=` 추가.

## 변경 이력
| 날짜 | 버전 | 내용 |
|---|---|---|
| 2026-10-10 | v4 | 시대·과거 지도 API 삭제, 장소/축제 타임라인(`/places/{id}/stories`, `/events/{id}/stories`, order=asc/desc), 기억 날짜(부분 날짜)·placeNameThen, 축제 좌표, 에러 코드 표 |
| 2026-09-10 | v3 | DB v4 동기화: place_era, 10년 시대, 스토리 통합, 프리사인 업로드 |
