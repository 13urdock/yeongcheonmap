// POST /auth/signup 요청 본문 (API 명세 v4 §3). name = 수집가 이름
class SignupRequest {
  const SignupRequest({required this.email, required this.password, required this.name});

  final String email;
  final String password;
  final String name;

  Map<String, dynamic> toJson() => {'email': email, 'password': password, 'name': name};
}
