// 빌드 시 주입되는 환경값. 값은 frontend/.env 에 적고 `flutter run --dart-define-from-file=.env` 로 넣는다
// (run_dev.ps1 이 대신 해 줌). 키 이름은 아래 String.fromEnvironment 의 이름과 정확히 같아야 한다.
class Env {
  Env._();

  /// 백엔드 base URL. 기본값은 Android 에뮬레이터에서 호스트 PC 의 localhost.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080/api/v1',
  );

  /// 네이버 클라우드 플랫폼(NCP) Maps 클라이언트 ID. 비어 있으면 지도 인증 실패.
  static const String naverMapClientId = String.fromEnvironment('NAVER_MAP_CLIENT_ID');

  /// 전시 모드(기본 켜짐): 전시 기기 전용. 관람객 화면에 로그인·가입·로그아웃을 보이지 않고,
  /// 운영진이 기기마다 한 번 수집가 계정으로 로그인해 두면 그 기기에서 남긴 기록은 모두 수집가 이름으로 올라간다.
  /// 일반 배포(플레이스토어) 빌드에서만 EXHIBITION_MODE=false 로 끈다.
  static const bool exhibitionMode = bool.fromEnvironment('EXHIBITION_MODE', defaultValue: true);

  /// 비어 있으면 안 되는 값 중 비어 있는 키 이름들 (.env 키 오타·from-file 누락을 시작 시 알리기 위함)
  static List<String> get missingKeys => [
        if (naverMapClientId.isEmpty) 'NAVER_MAP_CLIENT_ID',
      ];
}
