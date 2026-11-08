// 지도 관련 고정값 (Sys_03: 위치 권한 거부 시에도 영천 기본 좌표로 동작)
class MapConstants {
  MapConstants._();

  /// 영천 기본 중심 좌표 (API 명세 v3 예시 좌표 기준. 운영 시 시청/중심가 좌표로 조정)
  static const double yeongcheonLat = 35.9733;
  static const double yeongcheonLng = 128.9386;

  static const double defaultZoom = 14;

  /// 핀은 한 번에 이만큼 가져온다 (bbox 필터·페이지네이션은 이후 단계)
  static const int pinPageSize = 200;

  /// 장소 고르기(검색) 결과는 이만큼만 보여준다 — 더 좁히려면 검색어를 더 적는다
  static const int searchPageSize = 50;
}

// 기록(스토리) 관련 고정값
class StoryConstants {
  StoryConstants._();

  /// 기록 하나에 붙일 수 있는 사진 수 (API 명세 v4 §7 photoUrls ≤5)
  static const int maxPhotos = 5;
}
