import 'package:flutter/foundation.dart';

import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../data/models/login_request.dart';
import '../data/models/signup_request.dart';
import '../data/repositories/auth_repository.dart';
import 'auth_mode.dart';

// 로그인 / 수집가 등록 화면 상태: 입력값, 간단한 형식 확인, 전송.
// 성공하면 AuthRepository 가 세션을 저장하고 AuthProvider 가 그 변화를 받는다.
// [allowSignup] 이 false(전시 모드)면 로그인만 — 등록 모드로 바꿀 수 없다.
class AuthFormProvider extends ChangeNotifier {
  AuthFormProvider({required AuthRepository authRepository, this.allowSignup = true})
      : _authRepository = authRepository;

  final AuthRepository _authRepository;
  final bool allowSignup;

  /// 백엔드 SignupDto 와 같은 규칙
  static const int minPasswordLength = 8;
  static const int maxNameLength = 50;

  AuthMode _mode = AuthMode.login;
  String _email = '';
  String _password = '';
  String _name = '';
  bool _isSubmitting = false;
  Failure? _failure;

  AuthMode get mode => _mode;
  bool get isSignup => _mode == AuthMode.signup;
  bool get isSubmitting => _isSubmitting;
  Failure? get failure => _failure;

  bool get _emailLooksValid => RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(_email.trim());
  bool get _passwordOk => isSignup ? _password.length >= minPasswordLength : _password.isNotEmpty;
  bool get _nameOk => !isSignup || _name.trim().isNotEmpty;

  bool get canSubmit => !_isSubmitting && _emailLooksValid && _passwordOk && _nameOk;

  void setMode(AuthMode mode) {
    if (mode == AuthMode.signup && !allowSignup) return;
    _mode = mode;
    _failure = null;
    notifyListeners();
  }

  void setEmail(String value) {
    _email = value;
    notifyListeners();
  }

  void setPassword(String value) {
    _password = value;
    notifyListeners();
  }

  void setName(String value) {
    _name = value;
    notifyListeners();
  }

  /// 성공하면 true (실패 내용은 failure)
  Future<bool> submit() async {
    if (!canSubmit) return false;
    _isSubmitting = true;
    _failure = null;
    notifyListeners();

    final email = _email.trim();
    final result = isSignup
        ? await _authRepository.signup(SignupRequest(email: email, password: _password, name: _name.trim()))
        : await _authRepository.login(LoginRequest(email: email, password: _password));

    _isSubmitting = false;
    final ok = switch (result) {
      Ok() => true,
      Err(failure: final failure) => _remember(failure),
    };
    notifyListeners();
    return ok;
  }

  bool _remember(Failure failure) {
    _failure = failure;
    return false;
  }
}
