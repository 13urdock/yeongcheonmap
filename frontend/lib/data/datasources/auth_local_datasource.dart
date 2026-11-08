import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/auth_session_model.dart';

// 로그인 세션을 기기 보안 저장소에 보관 (앱을 껐다 켜도 로그인 유지).
// 플러그인 의존을 이 파일 한 곳에 가둔다. 읽기 실패·형식 오류는 "저장된 세션 없음"으로 본다.
class AuthLocalDataSource {
  AuthLocalDataSource([FlutterSecureStorage? storage]) : _storage = storage ?? FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const String _key = 'auth_session';

  Future<AuthSessionModel?> read() async {
    try {
      final raw = await _storage.read(key: _key);
      if (raw == null) return null;
      return AuthSessionModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> write(AuthSessionModel session) {
    return _storage.write(key: _key, value: jsonEncode(session.toJson()));
  }

  Future<void> clear() => _storage.delete(key: _key);
}
