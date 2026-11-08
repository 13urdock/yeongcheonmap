import '../../core/network/api_client.dart';
import '../models/auth_session_model.dart';
import '../models/login_request.dart';
import '../models/signup_request.dart';

// 인증 원격 호출 (HTTP + 파싱만): 가입 · 로그인 · 토큰 갱신
class AuthRemoteDataSource {
  AuthRemoteDataSource(this._client);

  final ApiClient _client;

  /// POST /auth/signup
  Future<AuthSessionModel> signup(SignupRequest request) async {
    final data = await _client.post('/auth/signup', body: request.toJson(), retryOnUnauthorized: false);
    return AuthSessionModel.fromJson(data);
  }

  /// POST /auth/login
  Future<AuthSessionModel> login(LoginRequest request) async {
    final data = await _client.post('/auth/login', body: request.toJson(), retryOnUnauthorized: false);
    return AuthSessionModel.fromJson(data);
  }

  /// POST /auth/refresh — 401 이어도 다시 갱신을 시도하지 않는다(무한 반복 방지)
  Future<AuthSessionModel> refresh(String refreshToken) async {
    final data = await _client.post(
      '/auth/refresh',
      body: {'refreshToken': refreshToken},
      retryOnUnauthorized: false,
    );
    return AuthSessionModel.fromJson(data);
  }
}
