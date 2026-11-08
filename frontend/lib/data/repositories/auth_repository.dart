import 'dart:async';

import '../../core/error/failure_mapper.dart';
import '../../core/error/result.dart';
import '../../core/network/api_exception.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/auth_session_model.dart';
import '../models/auth_user_model.dart';
import '../models/login_request.dart';
import '../models/signup_request.dart';

// 로그인 세션의 단일 보관처: 메모리(현재 토큰) + 기기 저장소(재실행 시 복원).
// api_client 는 accessToken 으로 토큰을 붙이고, 401 이면 refreshSession 으로 갱신을 요청한다(app.dart 에서 연결).
class AuthRepository {
  AuthRepository({required AuthRemoteDataSource remote, required AuthLocalDataSource local})
      : _remote = remote,
        _local = local;

  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;
  final StreamController<AuthUserModel?> _userChanges = StreamController.broadcast();

  AuthSessionModel? _session;
  Future<bool>? _refreshing; // 동시에 여러 요청이 401 을 받아도 갱신은 한 번만

  String? get accessToken => _session?.accessToken;
  AuthUserModel? get currentUser => _session?.user;

  /// 로그인·로그아웃·만료 때마다 현재 사용자(없으면 null)를 흘려보낸다
  Stream<AuthUserModel?> get userChanges => _userChanges.stream;

  /// 앱 시작 시 기기에 저장된 세션을 불러온다
  Future<AuthUserModel?> restore() async {
    _session = await _local.read();
    _userChanges.add(currentUser);
    return currentUser;
  }

  Future<Result<AuthUserModel>> login(LoginRequest request) {
    return runGuarded(() async => _save(await _remote.login(request)));
  }

  Future<Result<AuthUserModel>> signup(SignupRequest request) {
    return runGuarded(() async => _save(await _remote.signup(request)));
  }

  Future<void> logout() => _clear();

  /// access 토큰 재발급. 성공하면 true.
  /// 서버가 거절(만료·회수)하면 세션을 지운다. 네트워크 문제면 세션은 남겨 둔다.
  Future<bool> refreshSession() {
    return _refreshing ??= _refresh().whenComplete(() => _refreshing = null);
  }

  Future<bool> _refresh() async {
    final session = _session;
    if (session == null) return false;
    try {
      await _save(await _remote.refresh(session.refreshToken));
      return true;
    } on ApiException {
      await _clear();
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<AuthUserModel> _save(AuthSessionModel session) async {
    _session = session;
    await _local.write(session);
    _userChanges.add(session.user);
    return session.user;
  }

  Future<void> _clear() async {
    _session = null;
    await _local.clear();
    _userChanges.add(null);
  }
}
