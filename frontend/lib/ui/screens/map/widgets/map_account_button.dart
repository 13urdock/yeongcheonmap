import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/config/env.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../routing/app_routes.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';

// 머리띠 오른쪽 수집가 버튼.
// - 일반 모드: 로그인 전이면 로그인 화면, 로그인 중이면 이름 확인·로그아웃.
// - 전시 모드: 설정 안 된 기기면 자물쇠(운영진 로그인), 설정된 기기면 "전시 기기" 표시만 — 관람객이 로그아웃할 수 없다.
class MapAccountButton extends StatelessWidget {
  const MapAccountButton({super.key});

  Future<void> _showAccount(BuildContext context, String name) async {
    final auth = context.read<AuthProvider>();
    final logout = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: RetroColors.paper,
        title: const Text('수집가', style: RetroTextStyles.sectionLabel),
        content: Text('$name 수집가로 기록하고 있어요.', style: RetroTextStyles.body),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(true), child: const Text('로그아웃')),
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(false), child: const Text('닫기')),
        ],
      ),
    );
    if (logout == true) await auth.logout();
  }

  @override
  Widget build(BuildContext context) {
    final status = context.select<AuthProvider, AuthStatus>((p) => p.status);
    final name = context.select<AuthProvider, String?>((p) => p.user?.name);

    if (status == AuthStatus.restoring) return const SizedBox(width: 40);
    if (Env.exhibitionMode) return _ExhibitionBadge(isSetUp: name != null);

    return IconButton(
      tooltip: name == null ? '수집가 로그인' : '$name 수집가',
      visualDensity: VisualDensity.compact,
      icon: Icon(name == null ? Icons.person_outline : Icons.person, color: RetroColors.ink),
      onPressed: () => name == null
          ? Navigator.of(context).pushNamed(AppRoutes.auth)
          : _showAccount(context, name),
    );
  }
}

// 전시 모드 표시: 설정된 기기 = 누를 수 없는 확인 표시 / 설정 안 된 기기 = 운영진 로그인으로 가는 자물쇠
class _ExhibitionBadge extends StatelessWidget {
  const _ExhibitionBadge({required this.isSetUp});

  final bool isSetUp;

  @override
  Widget build(BuildContext context) {
    if (isSetUp) {
      return const Tooltip(
        message: '전시 기기 · 수집가로 기록 중',
        child: Padding(
          padding: EdgeInsets.all(8),
          child: Icon(Icons.verified_outlined, color: RetroColors.inkMuted, size: 22),
        ),
      );
    }
    return IconButton(
      tooltip: '전시 기기 설정 (운영진)',
      visualDensity: VisualDensity.compact,
      icon: const Icon(Icons.lock_outline, color: RetroColors.stamp),
      onPressed: () => Navigator.of(context).pushNamed(AppRoutes.auth),
    );
  }
}
