import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../providers/auth_form_provider.dart';

// 하단 확인 버튼. 성공하면 화면을 닫으며 true 를 돌려준다.
class AuthSubmitBar extends StatelessWidget {
  const AuthSubmitBar({super.key});

  Future<void> _submit(BuildContext context) async {
    final navigator = Navigator.of(context);
    final ok = await context.read<AuthFormProvider>().submit();
    if (ok) navigator.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit = context.select<AuthFormProvider, bool>((p) => p.canSubmit);
    final isSubmitting = context.select<AuthFormProvider, bool>((p) => p.isSubmitting);
    final isSignup = context.select<AuthFormProvider, bool>((p) => p.isSignup);
    final label = isSubmitting ? '확인하는 중…' : (isSignup ? '수집가로 등록하기' : '로그인');

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(16, 8, 16, 12 + MediaQuery.viewInsetsOf(context).bottom),
        child: FilledButton(
          onPressed: canSubmit ? () => _submit(context) : null,
          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
          child: Text(label),
        ),
      ),
    );
  }
}
