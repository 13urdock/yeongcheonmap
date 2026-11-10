import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../providers/story_write_provider.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';

// 수정 화면 오른쪽 위 "삭제": 한 번 더 묻고 지운 뒤 true 를 돌려주며 닫는다 (타임라인이 새로고침).
class StoryDeleteButton extends StatelessWidget {
  const StoryDeleteButton({super.key});

  Future<void> _confirmAndDelete(BuildContext context) async {
    final navigator = Navigator.of(context);
    final write = context.read<StoryWriteProvider>();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: RetroColors.paper,
        title: const Text('이 기억을 지울까요?', style: RetroTextStyles.title),
        content: const Text('지운 기억은 되돌릴 수 없어요.', style: RetroTextStyles.body),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(false), child: const Text('그대로 두기')),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            style: TextButton.styleFrom(foregroundColor: RetroColors.stamp),
            child: const Text('지우기'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    if (await write.delete()) navigator.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final isDeleting = context.select<StoryWriteProvider, bool>((p) => p.isDeleting);
    final isSubmitting = context.select<StoryWriteProvider, bool>((p) => p.isSubmitting);
    if (isDeleting) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }
    return IconButton(
      tooltip: '이 기억 지우기',
      icon: const Icon(Icons.delete_outline, color: RetroColors.stamp),
      onPressed: isSubmitting ? null : () => _confirmAndDelete(context),
    );
  }
}
