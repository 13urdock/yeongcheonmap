import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/error/failure.dart';
import '../../../../providers/auth_form_provider.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';

// 이메일 · 비밀번호 · (등록일 때) 수집가 이름 입력 + 실패 안내
class AuthFormFields extends StatelessWidget {
  const AuthFormFields({super.key});

  @override
  Widget build(BuildContext context) {
    final isSignup = context.select<AuthFormProvider, bool>((p) => p.isSignup);
    final failure = context.select<AuthFormProvider, Failure?>((p) => p.failure);
    final form = context.read<AuthFormProvider>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('이메일', style: RetroTextStyles.sectionLabel),
        const SizedBox(height: 6),
        TextField(
          keyboardType: TextInputType.emailAddress,
          autocorrect: false,
          onChanged: form.setEmail,
          decoration: const InputDecoration(hintText: 'collector@example.com'),
        ),
        const SizedBox(height: 16),
        const Text('비밀번호', style: RetroTextStyles.sectionLabel),
        const SizedBox(height: 6),
        TextField(
          obscureText: true,
          autocorrect: false,
          enableSuggestions: false,
          onChanged: form.setPassword,
          decoration: InputDecoration(
            hintText: isSignup ? '${AuthFormProvider.minPasswordLength}자 이상' : null,
          ),
        ),
        if (isSignup) ...[
          const SizedBox(height: 16),
          const Text('수집가 이름', style: RetroTextStyles.sectionLabel),
          const SizedBox(height: 6),
          TextField(
            maxLength: AuthFormProvider.maxNameLength,
            onChanged: form.setName,
            decoration: const InputDecoration(hintText: '기록에 함께 적힐 이름', counterText: ''),
          ),
        ],
        if (failure != null) ...[
          const SizedBox(height: 16),
          Text(failure.message, style: RetroTextStyles.body.copyWith(color: RetroColors.stamp)),
        ],
      ],
    );
  }
}
