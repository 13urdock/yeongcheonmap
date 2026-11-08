// 로그인한 수집가 요약 (API 명세 v4 §3 user)
class AuthUserModel {
  const AuthUserModel({required this.userId, required this.email, required this.name});

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      userId: json['userId'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
    );
  }

  final String userId;
  final String email;
  final String name; // 기록에 표시되는 수집가 이름

  Map<String, dynamic> toJson() => {'userId': userId, 'email': email, 'name': name};
}
