import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/config/env.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../providers/story_write_provider.dart';
import '../../../../routing/app_routes.dart';

// 하단 "보관하기".
// - 일반 모드: 로그인 전이면 "로그인하고 보관하기" → 로그인 화면을 거쳐 바로 이어서 보관
//   (적어 둔 내용은 이 화면 provider 에 남아 있어 로그인하고 돌아와도 사라지지 않는다)
// - 전시 모드: 관람객에게 로그인 화면을 보여주지 않는다. 설정 안 된 기기면 버튼을 막고 운영진 안내만.
class StorySubmitBar extends StatelessWidget {
  const StorySubmitBar({super.key});

  Future<void> _submit(BuildContext context, {required bool needsLogin}) async {
    final navigator = Navigator.of(context);
    final write = context.read<StoryWriteProvider>();
    if (needsLogin) {
      final loggedIn = await navigator.pushNamed(AppRoutes.auth);
      if (loggedIn != true) return;
    }
    final created = await write.submit();
    if (created != null) navigator.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit = context.select<StoryWriteProvider, bool>((p) => p.canSubmit);
    final isSubmitting = context.select<StoryWriteProvider, bool>((p) => p.isSubmitting);
    final isUploadingPhotos = context.select<StoryWriteProvider, bool>((p) => p.isUploadingPhotos);
    final isEditing = context.select<StoryWriteProvider, bool>((p) => p.isEditing);
    final needsLogin = context.select<AuthProvider, bool>((p) => !p.isLoggedIn);
    final blockedDevice = Env.exhibitionMode && needsLogin;
    final label = isUploadingPhotos
        ? '사진 올리는 중…'
        : isSubmitting
        ? '보관하는 중…'
        : blockedDevice
            ? '이 기기에서는 보관할 수 없어요 (운영진 문의)'
            : needsLogin
                ? '로그인하고 보관하기'
                : (isEditing ? '고친 기억 보관하기' : '이 기억을 보관하기');

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
        child: FilledButton(
          onPressed: canSubmit && !blockedDevice ? () => _submit(context, needsLogin: needsLogin) : null,
          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
          child: Text(label),
        ),
      ),
    );
  }
}
