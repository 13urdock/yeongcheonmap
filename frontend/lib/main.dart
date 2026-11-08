import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

import 'app.dart';
import 'core/config/env.dart';

// 진입점: 네이버 지도 SDK 초기화 후 앱 실행. 그 외 설정은 app.dart 에 둔다.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  debugPrint('[Env] API_BASE_URL=${Env.apiBaseUrl}');
  for (final key in Env.missingKeys) {
    debugPrint('[Env] $key 가 비어 있어요 — .env 키 이름과 --dart-define-from-file=.env 를 확인해 주세요.');
  }

  await FlutterNaverMap().init(
    clientId: Env.naverMapClientId,
    onAuthFailed: (ex) => debugPrint('네이버 지도 인증 실패: $ex'),
  );

  runApp(const YeongcheonMapApp());
}
