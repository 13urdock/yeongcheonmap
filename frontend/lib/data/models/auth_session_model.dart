import 'auth_user_model.dart';

// POST /auth/signup · /auth/login · /auth/refresh 응답 (API 명세 v4 §3). 기기에도 이 형태로 저장한다.
class AuthSessionModel {
  const AuthSessionModel({required this.accessToken, required this.refreshToken, required this.user});

  factory AuthSessionModel.fromJson(Map<String, dynamic> json) {
    return AuthSessionModel(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: AuthUserModel.fromJson(json['user'] as Map<String, dynamic>),
    );
  }

  final String accessToken;
  final String refreshToken;
  final AuthUserModel user;

  Map<String, dynamic> toJson() => {'accessToken': accessToken, 'refreshToken': refreshToken, 'user': user.toJson()};
}
