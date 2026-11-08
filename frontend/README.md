# 영천 홍보지도 앱 — 프론트엔드 (Flutter + Provider + 네이버 지도)

코딩 규칙은 `CLAUDE.md`, 계약은 `../docs/API명세서_v4.md`, 기억 날짜·정렬 규칙은 `../docs/ERD_v5.md` §2–3.

## 현재 구현 범위 (2026-10-10 시대 제거 반영)
- **지도 (Map_01·04)**: 네이버 지도(영천 중심) + 장소 핀(먹색) + 축제 핀(호박색). 위치 권한 요청(Sys_03). 시대 칩은 삭제.
- **장소 상세 (Place_01·02)**: 지금 이름 · `SINCE 1982` 도장 · 소개 + **기억 날짜 순 타임라인**.
- **축제 상세 (Event_01·02)**: 축제 정보 · 개최 연도 숫자판 + 같은 타임라인.
- **타임라인 (Story_01)**: 서버가 기억 날짜로 정렬한 기록을 **연도 묶음**(머리글 = 숫자판 `1995` / `199X` / `XXXX`)으로 표시. `옛날부터 ↑ / 최근부터 ↓` 전환, 무한 스크롤, 당겨서 새로고침.
- **기록 작성 (Story_02)**: 공항 숫자판 `YYYY.MM.DD` — 칸을 위아래로 끌어 돌림(탭 = 다음, 길게 누르기 = X). 월은 12, 일은 31까지만 돈다. 가능한 날짜가 없으면 즉시 안내(예: `2001.02.3X`). 장소일 땐 "그때 이 자리의 이름" 입력.
- **레트로 테마 (Sys_06)**: 종이 바탕·먹색 글씨·숫자판·고무도장 (`lib/ui/theme/`, `lib/ui/widgets/split_flap/`, `lib/ui/widgets/retro/`).
- **전시 모드 (`EXHIBITION_MODE`, 기본 true)**: 전시 기기 전용. 관람객 화면엔 로그인·가입·로그아웃이 없다.
  - 기기 설정(운영진, 기기당 한 번): 지도 머리띠 오른쪽 **빨간 자물쇠** → "전시 기기 설정" → 수집가 계정(`seed@yeongcheonmap.local`)으로 로그인 → 자물쇠가 회색 확인 표시로 바뀜.
  - 설정 안 된 기기에서는 작성 버튼이 "이 기기에서는 보관할 수 없어요 (운영진 문의)"로 막힌다.
  - 관람객이 남긴 기록은 모두 작성자 `수집가`로 올라간다.
- **수집가 로그인·등록 (Auth_01, 일반 모드 = `EXHIBITION_MODE=false`)**: 지도 머리띠 오른쪽 사람 아이콘, 또는 작성 화면의 "로그인하고 보관하기". 세션은 기기 보안 저장소(flutter_secure_storage)에 보관해 재실행해도 유지, access 만료(401) 시 refresh 로 자동 갱신 후 한 번 재시도.
- **기록할 곳 고르기**: 작성 화면 맨 위 "어디의 기억인가요?" → 장소·축제 검색(이름·주소) 화면. 지도 하단 "기억 남기기"로 곧바로 작성할 수 있고, 장소/축제 상세에서 들어오면 그곳이 미리 골라져 있다(바꾸기 가능).
- 아직 없음: 사진 서버 업로드(Story_03), 핀 클러스터링, 지도 위에서 핀을 눌러 고르기, 새 장소 등록 화면.

## 처음 한 번: 프로젝트 초기화
이 레포에는 `lib/`·`pubspec.yaml`·`test/` 만 있고 `android/` 는 없다.
```bash
flutter create --platforms=android --org com.yeongcheon --project-name yeongcheon_map .
flutter pub get
```
그 다음 Android 설정 3가지:
1. **minSdk 23 이상** (`android/app/build.gradle(.kts)` 의 `minSdk`) — flutter_naver_map 요구사항.
2. **권한** — `android/app/src/main/AndroidManifest.xml` 의 `<manifest>` 안:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   ```
3. **개발 중 HTTP 허용** — `<application ... android:usesCleartextTraffic="true">` (운영 HTTPS 전환 시 제거)

## 실행
값은 한 번만 적는다: `.env.example` 을 복사해 `.env` 로 만들고 채운다 (`.env` 는 gitignore — 커밋 금지).
```
NAVER_MAP_CLIENT_ID=NCP_클라이언트_ID
API_BASE_URL=http://127.0.0.1:8080/api/v1
EXHIBITION_MODE=true
```
- (예전 `DEV_ACCESS_TOKEN` 은 더 쓰지 않는다. `.env` 에 남아 있어도 무해하니 지워도 된다.)
- 키 이름은 `lib/core/config/env.dart` 와 글자 하나까지 같아야 한다. 틀리면 시작 로그에 `[Env] ... 가 비어 있어요`.
- 주소 끝의 `/api/v1` 까지 적는다. 값에 따옴표·뒤 공백 넣지 않기.

실행은 한 줄 (백엔드 `npm run start:dev` 가 켜져 있어야 함):
```powershell
.\run_dev.ps1
```
- 하는 일: `adb reverse tcp:8080 tcp:8080`(실기기 USB) → `flutter run --dart-define-from-file=.env`.
- 처음에 "스크립트를 실행할 수 없습니다"가 뜨면 한 번만: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- 에뮬레이터: `.env` 의 주소를 `http://10.0.2.2:8080/api/v1` 로 (adb reverse 는 자동으로 건너뜀).
- 직접 실행하려면 `flutter run --dart-define-from-file=.env` (실기기면 그 전에 `adb reverse tcp:8080 tcp:8080`, 케이블 다시 꽂으면 다시).
- 네이버 지도 401(Unauthorized client) → NCP 콘솔 Maps Application 의 "Android 앱 패키지 이름"에 `com.yeongcheon.yeongcheon_map` 등록, Dynamic Map 체크, 키 ID 오타 확인.
- `flutter analyze` / `flutter test` — 기억 날짜 규칙(백엔드와 같은 사례 표), 연도 묶음, 숫자판 조작 위젯 테스트 포함.

## 검증 체크리스트 (백엔드 시드 기준)
- [ ] 지도에 장소 핀 3개(먹색) + 축제 핀 2개(호박색 ✦)
- [ ] "○○카페" → 타임라인 오름차순: `1990` → `199X`(1990년대) → `1995` → `20X5` → `2021` → `XXXX`(연도 미상, 항상 맨 뒤)
- [ ] "최근부터 ↓" → 정확히 거꾸로, 단 `XXXX` 는 그대로 맨 뒤
- [ ] 기록 카드에 작은 숫자판 날짜, "그때 · 중앙분식" 도장
- [ ] 기억 남기기 → 숫자판을 끌면 플랩이 넘어가며 바뀜, 길게 누르면 X
- [ ] `2001.02.3X` 로 맞추면 "가능한 날짜가 없어요" + 보관 버튼 비활성
- [ ] (전시 모드) 처음 켜면 머리띠에 빨간 자물쇠, 작성 버튼은 "이 기기에서는 보관할 수 없어요" → 자물쇠로 수집가 로그인 → 회색 확인 표시, 보관 가능, 로그아웃 메뉴 없음
- [ ] (전시 모드) 로그인 화면에 "수집가 등록" 탭이 없음
- [ ] (일반 모드) 로그아웃 상태에서 보관 → 버튼이 "로그인하고 보관하기" → 로그인/등록 후 적어 둔 내용 그대로 바로 보관 → 타임라인에 반영
- [ ] 지도 "기억 남기기" → "고르기" → `카페` 검색 → ○○카페 선택 → 보관 → 지도로 돌아오면 핀 기록 수 갱신
- [ ] 장소 상세에서 들어오면 그 장소가 미리 골라져 있고, 축제로 바꾸면 "그때 이름" 칸이 사라짐
- [ ] 앱을 껐다 켜도 로그인(전시 기기 설정) 유지 / (일반 모드) 사람 아이콘 → "○○ 수집가로 기록하고 있어요", 로그아웃 가능
- [ ] 기록 카드 작성자 이름이 `수집가`(시드) 또는 등록한 수집가 이름
- [ ] 백엔드 꺼짐 → 지도 하단 실패 배너 + 다시 시도

## 폴더
```
lib/main.dart                        SDK 초기화 + runApp
lib/app.dart                         의존성 조립 + 전역 provider + 레트로 테마 + 라우팅
lib/core/config|network|error|permission
lib/core/memory_date/                기억 날짜: 상수 · 패턴(값 객체) · 가능 범위 계산 · 사람 말 라벨
lib/data/models/                     1파일 1모델 (place_pin, place_detail, event_pin, event_detail, story, memory_date …)
lib/data/datasources/                place · event · story(타임라인·작성) · auth(원격) · auth_local(기기 보안 저장소)
lib/data/repositories/               place · event · story · auth(세션 단일 보관처 + 토큰 갱신)
lib/providers/                       map · place_detail · event_detail · timeline(공용) · story_write · anchor_search · auth(전역) · auth_form
lib/ui/theme/                        retro_colors · retro_text_styles · retro_theme
lib/ui/widgets/split_flap/           flap_face · flap_half · flap_hinge · flap_tile(애니메이션) · flap_digit_wheel(드래그) · flap_date_picker · flap_text · flap_group_frame
lib/ui/widgets/timeline/             timeline_scroll_view · 연도 묶음(grouping/year_group/year_header) · story_card · photo_strip · sort_toggle · footer
lib/ui/widgets/retro/                stamp_badge · failure_notice
lib/ui/screens/map|place_detail|event_detail|story_write|anchor_picker|auth
lib/routing/                         app_routes · app_router · route_args/
```
