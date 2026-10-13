# 영천 홍보지도 앱 — 프론트엔드 (Flutter + Provider + 네이버 지도)

코딩 규칙은 `CLAUDE.md`, 계약은 `../docs/API명세서_v4.md`, 기억 날짜·정렬 규칙은 `../docs/ERD_v5.md` §2–3.

## 현재 구현 범위 (2026-10-10 시대 제거 반영)
- **지도 (Map_01·04)**: 네이버 지도(영천 중심) + 장소 핀(먹색) + 축제 핀(호박색). 위치 권한 요청(Sys_03). 시대 칩은 삭제.
- **장소 상세 (Place_01·02)**: 지금 이름 · `SINCE 1982` 도장 · 소개 + **기억 날짜 순 타임라인**.
- **축제 상세 (Event_01·02)**: 축제 정보 · 개최 연도 숫자판 + 같은 타임라인.
- **타임라인 (Story_01)**: 서버가 기억 날짜로 정렬한 기록을 **연도 묶음**(머리글 = 숫자판 `1995` / `199X` / `XXXX`)으로 표시. `옛날부터 ↑ / 최근부터 ↓` 전환, 무한 스크롤, 당겨서 새로고침.
- **기록 작성 (Story_02)**: 공항 숫자판 `YYYY.MM.DD` — 칸을 위아래로 끌어 돌림(탭 = 다음, 길게 누르기 = X). 월은 12, 일은 31까지만 돈다. 가능한 날짜가 없으면 즉시 안내(예: `2001.02.3X`). 장소일 땐 "그때 이 자리의 이름" 입력.
- **레트로 테마 (Sys_06)**: 종이 바탕·먹색 글씨·숫자판·고무도장 (`lib/ui/theme/`, `lib/ui/widgets/split_flap/`, `lib/ui/widgets/retro/`).
- 아직 없음: 로그인 화면(Auth_01) — 작성은 개발용 토큰으로 테스트, 사진 첨부(Story_03), 핀 클러스터링.

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
```bash
flutter run \
  --dart-define=NAVER_MAP_CLIENT_ID=발급받은_ID \
  --dart-define=API_BASE_URL=http://10.0.2.2:8080/api/v1 \
  --dart-define=DEV_ACCESS_TOKEN=백엔드_README_방법으로_만든_토큰   # 기록 작성 테스트할 때만
```
- 에뮬레이터: `10.0.2.2` = 호스트 PC 이므로 기본값 그대로.
- **실기기(USB 연결)**: 폰은 `10.0.2.2` 로 PC 에 닿지 못한다. USB 로 연결한 채 아래처럼 포트를 이어 주고 `127.0.0.1` 로 실행한다(방화벽·IP 설정 불필요, 케이블을 다시 꽂으면 다시 실행).
  ```powershell
  adb reverse tcp:8080 tcp:8080
  flutter run --dart-define=NAVER_MAP_CLIENT_ID=... --dart-define=API_BASE_URL=http://127.0.0.1:8080/api/v1
  ```
  `adb` 가 안 잡히면 `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe` 로 실행.
- 네이버 지도 401(Unauthorized client) → NCP 콘솔 Maps Application 의 "Android 앱 패키지 이름"에 `com.yeongcheon.yeongcheon_map` 등록, Dynamic Map 체크, 키 ID 오타 확인.
- `flutter analyze` / `flutter test` — 기억 날짜 규칙(백엔드와 같은 사례 표), 연도 묶음, 숫자판 조작 위젯 테스트 포함.

## 검증 체크리스트 (백엔드 시드 기준)
- [ ] 지도에 장소 핀 3개(먹색) + 축제 핀 2개(호박색 ✦)
- [ ] "○○카페" → 타임라인 오름차순: `1990` → `199X`(1990년대) → `1995` → `20X5` → `2021` → `XXXX`(연도 미상, 항상 맨 뒤)
- [ ] "최근부터 ↓" → 정확히 거꾸로, 단 `XXXX` 는 그대로 맨 뒤
- [ ] 기록 카드에 작은 숫자판 날짜, "그때 · 중앙분식" 도장
- [ ] 기억 남기기 → 숫자판을 끌면 플랩이 넘어가며 바뀜, 길게 누르면 X
- [ ] `2001.02.3X` 로 맞추면 "가능한 날짜가 없어요" + 보관 버튼 비활성
- [ ] DEV_ACCESS_TOKEN 없이 보관 → "인증 토큰이 필요합니다" 표시 / 있으면 저장 후 타임라인에 바로 반영
- [ ] 백엔드 꺼짐 → 지도 하단 실패 배너 + 다시 시도

## 폴더
```
lib/main.dart                        SDK 초기화 + runApp
lib/app.dart                         의존성 조립 + 전역 provider + 레트로 테마 + 라우팅
lib/core/config|network|error|permission
lib/core/memory_date/                기억 날짜: 상수 · 패턴(값 객체) · 가능 범위 계산 · 사람 말 라벨
lib/data/models/                     1파일 1모델 (place_pin, place_detail, event_pin, event_detail, story, memory_date …)
lib/data/datasources/                place · event · story(타임라인·작성)
lib/data/repositories/               place · event · story
lib/providers/                       map · place_detail · event_detail · timeline(공용) · story_write
lib/ui/theme/                        retro_colors · retro_text_styles · retro_theme
lib/ui/widgets/split_flap/           flap_face · flap_half · flap_hinge · flap_tile(애니메이션) · flap_digit_wheel(드래그) · flap_date_picker · flap_text · flap_group_frame
lib/ui/widgets/timeline/             timeline_scroll_view · 연도 묶음(grouping/year_group/year_header) · story_card · photo_strip · sort_toggle · footer
lib/ui/widgets/retro/                stamp_badge · failure_notice
lib/ui/screens/map|place_detail|event_detail|story_write
lib/routing/                         app_routes · app_router · route_args/
```
