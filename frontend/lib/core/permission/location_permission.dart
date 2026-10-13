import 'package:permission_handler/permission_handler.dart';

// Sys_03: 최초 실행 시 위치 권한 요청. 거부돼도 앱은 영천 기본 좌표로 동작한다(호출자가 결과만 보고 판단).
class AppLocationPermission {
  AppLocationPermission._();

  /// 허용되면 true. 거부/영구거부/오류는 모두 false (앱 흐름을 막지 않는다).
  static Future<bool> request() async {
    try {
      final status = await Permission.locationWhenInUse.request();
      return status.isGranted;
    } catch (_) {
      return false;
    }
  }
}
