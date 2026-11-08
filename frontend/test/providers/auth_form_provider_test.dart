import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/network/api_client.dart';
import 'package:yeongcheon_map/data/datasources/auth_local_datasource.dart';
import 'package:yeongcheon_map/data/datasources/auth_remote_datasource.dart';
import 'package:yeongcheon_map/data/repositories/auth_repository.dart';
import 'package:yeongcheon_map/providers/auth_form_provider.dart';
import 'package:yeongcheon_map/providers/auth_mode.dart';

// 입력 확인 규칙 (백엔드 SignupDto 와 같은 기준): 등록은 비밀번호 8자 이상 + 수집가 이름 필수
void main() {
  AuthFormProvider build({bool allowSignup = true}) => AuthFormProvider(
        authRepository: AuthRepository(
          remote: AuthRemoteDataSource(ApiClient(baseUrl: 'http://localhost')),
          local: AuthLocalDataSource(),
        ),
        allowSignup: allowSignup,
      );

  test('로그인: 이메일 형식 + 비밀번호가 있으면 보낼 수 있다', () {
    final form = build()
      ..setEmail('collector@yeongcheon.kr')
      ..setPassword('x');
    expect(form.canSubmit, isTrue);

    form.setEmail('collector');
    expect(form.canSubmit, isFalse);
  });

  test('등록: 비밀번호 8자 미만이거나 이름이 비면 보낼 수 없다', () {
    final form = build()
      ..setMode(AuthMode.signup)
      ..setEmail(' collector@yeongcheon.kr ')
      ..setPassword('1234567');
    expect(form.canSubmit, isFalse);

    form.setPassword('12345678');
    expect(form.canSubmit, isFalse, reason: '수집가 이름이 없음');

    form.setName('   ');
    expect(form.canSubmit, isFalse, reason: '공백 이름');

    form.setName('수집가');
    expect(form.canSubmit, isTrue);
  });

  test('전시 모드(allowSignup=false)에서는 등록 모드로 바꿀 수 없다', () {
    final form = build(allowSignup: false)..setMode(AuthMode.signup);
    expect(form.mode, AuthMode.login);
    expect(form.isSignup, isFalse);
  });
}
