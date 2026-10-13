# 영천 홍보지도 앱 — 프로젝트 루트

과거와 현재의 장소를 잇는 기억 아카이브 앱. 프론트(Flutter+Provider) / 백엔드(NestJS) / DB(PostgreSQL).

## 폴더 구조
```
yeongcheonmap/
  docs/         설계 문서 (정본 = source of truth)
  frontend/     Flutter 앱 레포 (CLAUDE.md 포함)
  backend/      NestJS 서버 레포 (CLAUDE.md 포함)
```

## 문서 정본 규칙
- 설계 문서의 **정본은 이 레포의 `docs/`** 다. 프로젝트 지식(claude.ai)에 사본을 둘 경우 참고용으로만 쓰고, 변경은 `docs/`에 먼저 반영한다(두 곳이 어긋나는 것을 방지).
- 각 레포 루트의 `CLAUDE.md`는 그 레포에서 AI가 코딩할 때 따르는 규칙 파일이다. (프로젝트 지식이 아니라 레포 루트에 있어야 작동)

## 구현 상태 (2026-10-10 — 시대 제거)
- 컨셉: 장소·축제 핀을 누르면 사람들이 남긴 기록을 **기억 날짜 순(연도별, 오름/내림)** 으로 본다. 날짜는 공항 숫자판 `YYYY.MM.DD`, 모르는 자리는 `X`.
- backend: place / event / story 모듈 + 기억 날짜 규칙(`src/common/memory-date/`) + 타임라인 정렬. 실행법 `backend/README.md`.
- frontend: 레트로 테마 + 지도(장소·축제 핀) + 장소/축제 타임라인 + 숫자판 기록 작성. 실행법 `frontend/README.md`.
- 다음 단계: auth 모듈·로그인 화면 → 사진 업로드(Story_03) → 핀 클러스터링 → 기록 수정/삭제.

## 문서 목록 (docs/)
- 요구사항 정의서 (엑셀) — 무엇을 만들지 ("변경 이력" 시트 포함)
- ERD_v5.md — DB 설계 + 기억 날짜 규칙 + 타임라인 정렬 규칙
- API명세서_v4.md — 프론트·백 계약
- 아키텍처정의서.md — 폴더 구조·파일 분리 규칙(어떻게 만들지)
- (삭제) ERD_v4, API명세서_v3, 과거지도_타일제작_파이프라인 — 2026-10-10 시대·과거 지도 제거로 폐기
