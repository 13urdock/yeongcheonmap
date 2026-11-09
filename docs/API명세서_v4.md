# 영천 홍보지도 앱 — REST API 명세서 (v4)

> DB 설계 v5에 동기화: **시대 제거**, 장소·축제 핀 → 기억 날짜(부분 날짜) 순 타임라인, 기록마다 "그때 이름".

## 문서 정보

| 항목 | 내용 |
|---|---|
| 버전 | v4 |
| Base URL | 개발: `http://localhost:8080/api/v1` (에뮬레이터에서는 `http://10.0.2.2:8080/api/v1`) |
| DB | PostgreSQL / 이미지: 외부 스토리지 |
| 최종 수정일 | 2026-11-10 |

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
| `STORAGE_UNAVAILABLE` | 503 | 사진 저장소(§8) 설정이 서버에 없음 |
| `PLACE_SEARCH_UNAVAILABLE` | 503 | 영천 장소 검색(외부 지도 검색)을 지금 쓸 수 없음 — 키 미설정·외부 오류 |
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

## 3. 인증 / 사용자

> 앱에서 기록을 남기는 사용자를 **수집가**라고 부른다. `name` = 기록 카드에 보이는 수집가 이름.
>
> **전시 운영(현재)**: 서버 `SIGNUP_ENABLED=false`(기본)로 가입을 막는다. 운영진이 전시 기기마다 시드 수집가 계정으로 한 번 로그인해 두고,
> 관람객 기록은 모두 그 계정으로 올라간다. 앱은 전시 모드(`EXHIBITION_MODE`, 기본 true)에서 로그인·가입·로그아웃을 관람객에게 보이지 않는다.
> 플레이스토어 배포 시 둘 다 반대로 켠다.

### 인증 응답 공통 구조 (signup · login · refresh)
```json
{ "success": true, "data": {
  "accessToken": "jwt",          // 1시간. Authorization: Bearer 로 부착
  "refreshToken": "jwt",         // 30일. 앱이 기기 보안 저장소에 보관
  "user": { "userId": "uuid", "email": "collector@example.com", "name": "수집가" }
} }
```

### POST /auth/signup
```json
{ "email": "collector@example.com", "password": "8자이상", "name": "수집가" }
```
| 필드 | 규칙 |
|---|---|
| email | 이메일 형식, ≤255. 서버가 소문자·앞뒤 공백 제거로 저장 |
| password | 8–72자. 서버는 scrypt 해시만 저장 |
| name | 1–50자 |
- 응답 201: 인증 응답. 에러 `DUPLICATE_EMAIL`(409), `INVALID_PARAMETER`(400), `FORBIDDEN`(403 — `SIGNUP_ENABLED=false` 일 때).

### POST /auth/login
```json
{ "email": "collector@example.com", "password": "..." }
```
- 응답 200: 인증 응답. 이메일이 없거나 비밀번호가 틀리면 둘 다 `UNAUTHORIZED`(401, 같은 메시지).

### POST /auth/refresh
```json
{ "refreshToken": "jwt" }
```
- 응답 200: **새** 인증 응답(access·refresh 둘 다 새로). 쓴 refresh 토큰은 바로 무효(회전) — 같은 토큰으로 두 번 갱신 불가.
- 만료·무효·이미 쓴 토큰 → `UNAUTHORIZED`(401). 앱은 이때 로그아웃 상태로 돌아간다.
- 앱 동작: 보호된 요청이 401 이면 refresh 를 한 번 시도하고 성공하면 원래 요청을 한 번 재시도한다.

### (미구현) `GET /users/me`, `PATCH /users/me/profile` — Auth_02 프로필 단계에서 정의

---

## 4. 장소

> 장소 = 좌표 + 지금 이름. 같은 자리의 옛 이름은 각 기록의 `placeNameThen`으로 남는다.

### GET /places
- 지도 핀 목록 · 장소 검색(기록할 곳 고르기).
- Query: `bbox`(선택, `minLng,minLat,maxLng,maxLat`), `usageType`(선택), `q`(선택, ≤50자 — 지금 이름 또는 주소에 포함, 대소문자 무시), `page`, `size`(최대 500)
- 정렬: 이름 오름차순.
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
- 비고: 초기엔 운영자 큐레이션 권장(요구사항 Sys_01). 앱의 기록 흐름은 아래 `POST /places/resolve` 를 쓴다.

### GET /places/candidates  ← 영천의 실제 장소 검색 (기록할 곳 고르기)
- 네이버 검색 '지역'을 NAVER API HUB(`naverapihub.apigw.ntruss.com/search/v1/local`, 헤더 `X-NCP-APIGW-API-KEY-ID`/`X-NCP-APIGW-API-KEY`)로 서버가 대신 불러, **주소가 '영천시'인 곳만** 돌려준다. 키는 서버에만 둔다.
- 네이버 지역 검색은 한 번에 최대 5건이고 위치 범위를 지정할 수 없어서, 검색어에 '영천'이 없으면 앞에 붙여 보낸다("카페" → "영천 카페"). 그래서 결과는 **최대 5곳**이다.
- Query: `q`(필수, 1~50자). 페이지 없음.
- `placeId`: 이미 우리 DB에 있는 장소(같은 이름 · 50m 안)면 그 id, 아니면 `null`.
- 인증 불필요(로그인 전에도 고르기 가능, 로그인은 보관할 때).
```json
{ "success": true, "data": { "items": [
  { "name": "○○카페 영천점", "category": "음식점 > 카페", "address": "경북 영천시 ...",
    "latitude": 35.97, "longitude": 128.93, "placeId": null }
] } }
```
- 에러 `PLACE_SEARCH_UNAVAILABLE`(503) — 앱은 이 칸만 안내하고 우리 DB 장소·축제 검색은 그대로 보여준다.

### POST /places/resolve  (인증)  ← 장소 확정(찾거나 만들기)
- 지도에서 상표(장소 이름)를 눌렀거나 '영천의 장소'에서 고른 곳을, 기록을 **보관하는 순간** 우리 장소로 확정한다. (누르기만 하고 보관하지 않으면 DB에 아무것도 생기지 않는다)
- Body: `{ "name": "○○카페", "latitude": 35.97, "longitude": 128.93, "address": "경북 영천시 ..." }` — `address` 선택.
- 규칙: **같은 이름(공백·대소문자 무시) + 50m 안**의 장소가 있으면 그 장소, 없으면 새로 만든다(만든 사람 = 요청자).
  같은 자리라도 이름이 다르면 다른 장소다(ERD v5 — 같은 자리 장소는 합치지 않는다).
- `address` 가 없으면 서버가 이름으로 지역 검색해 같은 이름·100m 안·영천시인 결과의 주소를 채운다(못 찾으면 비워 둔다. 실패해도 확정은 된다).
- 응답 200 `{ "placeId": "uuid", "created": true }`

---

## 5. 축제

### GET /events
- 지도 핀 목록 · 축제 검색. **위치(latitude·longitude)가 있는 축제만.**
- Query: `q`(선택, ≤50자 — 이름 또는 주소에 포함). 페이지네이션 없음(축제 수가 적음).
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
| photoUrls | string[] (≤5) | 조건부 | content 없으면 1개 이상. §8 `publicUrl` 만 허용 |
- 응답 201: 생성된 스토리. 에러 `INVALID_PARAMETER`(앵커·내용·날짜 규칙), `PLACE_NOT_FOUND`, `EVENT_NOT_FOUND`.
- 부수효과(예정): 작성자 `story_count` 증가 → 뱃지 트리거.

### PATCH /stories/{storyId}  (인증, 본인만) — 바꿀 수 있는 필드: memoryDate, placeNameThen, content, photoUrls. 에러 `FORBIDDEN`(403)
### DELETE /stories/{storyId}  (인증, 본인만)

---

## 8. 이미지 업로드 (프리사인, 2026-11-10 확정)

사진 파일은 **서버를 거치지 않는다.** 서버는 스토리지에 직접 올릴 수 있는 임시 주소(프리사인 URL)만 발급하고, 앱이 그 주소로 파일을 PUT 한 뒤 스토리 저장 때 `publicUrl` 만 `photoUrls` 로 보낸다.

- 스토리지: NCP **Ncloud Storage**(S3 호환, 한국). 버킷 `yeongcheonmap`, 서명 리전 `kr`, 엔드포인트 `https://kr.ncloudstorage.com`. 2026-11-10 시험 스크립트(`backend/scripts/storage-presign-test.mjs`)로 프리사인 PUT·익명 읽기 확인.
- 읽기: 버킷 정책으로 **객체 읽기만 공개**(목록 조회·업로드는 비공개). 앱은 `publicUrl` 을 그대로 이미지로 띄운다.
- 사진 공개 주소의 앞부분은 서버 환경변수 `STORAGE_PUBLIC_BASE_URL` 하나로 둔다(나중에 `photo.burdocklab.com` 으로 바꿔도 앱·API 계약은 그대로. 이미 저장된 주소는 옛 주소로 남으므로 바꿀 땐 옛 주소도 계속 열리게 둘 것).

### POST /uploads/presign  (인증)
```json
{ "files": [ { "contentType": "image/jpeg", "size": 834512 } ] }
```
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| files | object[] (1~5) | 예 | 올릴 사진 목록. 한 기록 최대 5장과 같은 상한 |
| files[].contentType | string | 예 | `image/jpeg` · `image/png` · `image/webp` 중 하나 |
| files[].size | int | 예 | 바이트. 1 ~ 10,485,760(10MB) |

응답 200 (`items` 는 요청 `files` 와 같은 순서):
```json
{
  "items": [
    {
      "uploadUrl": "https://yeongcheonmap.kr.ncloudstorage.com/stories/2026-11/9f1c...e2.jpg?X-Amz-Algorithm=...",
      "method": "PUT",
      "headers": { "Content-Type": "image/jpeg" },
      "publicUrl": "https://yeongcheonmap.kr.ncloudstorage.com/stories/2026-11/9f1c...e2.jpg",
      "expiresAt": "2026-11-10T01:30:00.000Z"
    }
  ]
}
```
- 앱은 `uploadUrl` 로 `method` 와 `headers` 를 **그대로** 써서 파일 바이트를 보낸다(헤더가 다르면 서명 불일치 403). 유효 시간 **10분**.
- 객체 키: `stories/{YYYY-MM}/{uuid}.{jpg|png|webp}` — 서버가 정한다(앱은 파일 이름을 정하지 않는다).
- 에러: `INVALID_PARAMETER`(형식·크기·개수), `UNAUTHORIZED`, `STORAGE_UNAVAILABLE`(503, 서버에 저장소 설정 없음).
- 한계: 프리사인 PUT 은 실제 파일 크기를 강제하지 못한다. 앱이 올리기 전에 jpeg 로 줄여서(긴 변 ~2000px) 보내는 것으로 지킨다.

### 순서 (앱)
1. 사진 고르기 → (압축) → `POST /uploads/presign`
2. 받은 `uploadUrl` 들에 PUT (전부 2xx 여야 다음 단계)
3. `POST /stories` 의 `photoUrls` 에 `publicUrl` 들을 고른 순서대로
- 업로드는 됐는데 3에서 실패하면 스토리지에 주인 없는 파일이 남는다 — 전시 규모라 허용(필요하면 나중에 정리).

### photoUrls 검증 (POST·PATCH /stories)
- 각 주소는 `{STORAGE_PUBLIC_BASE_URL}/stories/` 로 시작해야 한다. 아니면 `INVALID_PARAMETER`. (다른 사이트 이미지 주소를 넣지 못하게)
- 스토리 수정·삭제 때 스토리지의 파일은 지우지 않는다(현재 범위 밖).

## 9. 게임화
v3 §8(뱃지)과 동일.

---

## 10. 미정 (TODO)
- UGC 신고/검수 엔드포인트(요구사항 Sys_02).
- 타임라인에서 특정 연도로 바로 이동(숫자판으로 연도 고르기) — 필요하면 `GET .../stories?fromYear=` 추가.

## 변경 이력
| 날짜 | 버전 | 내용 |
|---|---|---|
| 2026-11-10 | v4.6 | §8 이미지 업로드 확정: Ncloud Storage, `POST /uploads/presign`(1~5장, jpeg/png/webp, ≤10MB, 10분), photoUrls 는 저장소 공개 주소만, 에러 `STORAGE_UNAVAILABLE`(503) |
| 2026-11-08 | v4.5.1 | 지역 검색 호출을 NAVER API HUB 로 이관(주소·헤더 변경, 앱 계약은 그대로) |
| 2026-11-08 | v4.5 | 영천 장소 검색을 카카오 → **네이버 지역 검색**으로 교체(지도와 같은 네이버 데이터). candidates 는 최대 5곳·페이지 없음(옛 앱이 보내는 `page` 는 받기만 하고 무시) |
| 2026-11-07 | v4.4 | §4 `GET /places/candidates`(영천 실제 장소 검색), `POST /places/resolve`(찾거나 만들기), 에러 `PLACE_SEARCH_UNAVAILABLE`(503) |
| 2026-11-07 | v4.3 | 전시 운영: `SIGNUP_ENABLED`(기본 false)면 signup 403 `FORBIDDEN` |
| 2026-10-20 | v4.2 | §3 인증 확정(signup·login·refresh 요청/응답, refresh 회전), `GET /places`·`GET /events` 에 검색어 `q` 추가 |
| 2026-10-14 | v4.1 | 스토리 사진 photoUrls 최대 10 → 5장 |
| 2026-10-10 | v4 | 시대·과거 지도 API 삭제, 장소/축제 타임라인(`/places/{id}/stories`, `/events/{id}/stories`, order=asc/desc), 기억 날짜(부분 날짜)·placeNameThen, 축제 좌표, 에러 코드 표 |
| 2026-09-10 | v3 | DB v4 동기화: place_era, 10년 시대, 스토리 통합, 프리사인 업로드 |
