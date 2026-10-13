// 빌드 시 --dart-define 으로 주입되는 환경값. (.env 파일 대신 dart-define 사용 → 별도 패키지 불필요)
// 예) flutter run --dart-define=NAVER_MAP_CLIENT_ID=xxx --dart-define=API_BASE_URL=http://10.0.2.2:8080/api/v1
class Env {
  Env._();

  /// 백엔드 base URL. 기본값은 Android 에뮬레이터에서 호스트 PC 의 localhost.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080/api/v1',
  );

  /// 네이버 클라우드 플랫폼(NCP) Maps 클라이언트 ID. 비어 있으면 지도 인증 실패.
  static const String naverMapClientId = String.fromEnvironment('NAVER_MAP_CLIENT_ID');

  /// 로그인(Auth_01) 구현 전 개발용 access 토큰. 비어 있으면 비로그인 호출.
  /// 백엔드 README "개발용 토큰" 방법으로 만들어 --dart-define=DEV_ACCESS_TOKEN=... 로 넘긴다. 릴리즈 빌드에 넣지 말 것.
  static const String devAccessToken = String.fromEnvironment('DEV_ACCESS_TOKEN');
}
