import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/config/env.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../providers/auth_form_provider.dart';
import '../../theme/retro_text_styles.dart';
import 'widgets/auth_form_fields.dart';
import 'widgets/auth_mode_toggle.dart';
import 'widgets/auth_submit_bar.dart';

// Auth_01 수집가 로그인 / 등록. 성공하면 true 를 돌려주며 닫힌다.
// 전시 모드에서는 "전시 기기 설정" — 운영진이 수집가 계정으로 로그인만 한다(등록 탭 없음).
class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (c) => AuthFormProvider(authRepository: c.read<AuthRepository>(), allowSignup: !Env.exhibitionMode),
      child: const _AuthView(),
    );
  }
}

class _AuthView extends StatelessWidget {
  const _AuthView();

  @override
  Widget build(BuildContext context) {
    final isSignup = context.select<AuthFormProvider, bool>((p) => p.isSignup);
    final allowSignup = context.read<AuthFormProvider>().allowSignup;
    final title = !allowSignup ? '전시 기기 설정' : (isSignup ? '수집가 등록' : '수집가 로그인');
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
        children: [
          if (allowSignup) ...const [
            Text('기억을 보관하려면 수집가로 들어와 주세요.', style: RetroTextStyles.body),
            SizedBox(height: 4),
            Text('남긴 기록에는 수집가 이름이 함께 적혀요.', style: RetroTextStyles.caption),
            SizedBox(height: 20),
            AuthModeToggle(),
          ] else ...const [
            Text('운영진 전용 화면이에요.', style: RetroTextStyles.body),
            SizedBox(height: 4),
            Text('수집가 계정으로 한 번 로그인해 두면, 이 기기에서 관람객이 남기는 기록이 모두 수집가 이름으로 보관돼요.',
                style: RetroTextStyles.caption),
          ],
          const SizedBox(height: 20),
          const AuthFormFields(),
        ],
      ),
      bottomNavigationBar: const AuthSubmitBar(),
    );
  }
}
