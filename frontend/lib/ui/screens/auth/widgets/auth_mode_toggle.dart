import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../providers/auth_form_provider.dart';
import '../../../../providers/auth_mode.dart';

// 로그인 ↔ 수집가 등록 전환
class AuthModeToggle extends StatelessWidget {
  const AuthModeToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final mode = context.select<AuthFormProvider, AuthMode>((p) => p.mode);
    return SegmentedButton<AuthMode>(
      segments: const [
        ButtonSegment(value: AuthMode.login, label: Text('로그인')),
        ButtonSegment(value: AuthMode.signup, label: Text('수집가 등록')),
      ],
      selected: {mode},
      showSelectedIcon: false,
      onSelectionChanged: (selected) => context.read<AuthFormProvider>().setMode(selected.first),
    );
  }
}
