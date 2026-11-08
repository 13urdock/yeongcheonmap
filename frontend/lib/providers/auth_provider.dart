import 'dart:async';

import 'package:flutter/foundation.dart';

import '../data/models/auth_user_model.dart';
import '../data/repositories/auth_repository.dart';

enum AuthStatus { restoring, loggedIn, loggedOut }

// 앱 전역 로그인 상태: 지금 누가(어느 수집가가) 로그인해 있나. 위젯을 모른다.
// 로그인·가입 입력 상태는 화면 전용 AuthFormProvider 가 따로 맡는다.
class AuthProvider extends ChangeNotifier {
  AuthProvider({required AuthRepository authRepository}) : _authRepository = authRepository {
    _subscription = _authRepository.userChanges.listen(_onUserChanged);
  }

  final AuthRepository _authRepository;
  late final StreamSubscription<AuthUserModel?> _subscription;

  AuthStatus _status = AuthStatus.restoring;
  AuthUserModel? _user;

  AuthStatus get status => _status;
  AuthUserModel? get user => _user;
  bool get isLoggedIn => _status == AuthStatus.loggedIn;

  /// 앱 시작 시 한 번: 기기에 저장된 로그인 복원
  Future<void> restore() => _authRepository.restore();

  Future<void> logout() => _authRepository.logout();

  void _onUserChanged(AuthUserModel? user) {
    _user = user;
    _status = user == null ? AuthStatus.loggedOut : AuthStatus.loggedIn;
    notifyListeners();
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
