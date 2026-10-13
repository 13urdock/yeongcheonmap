import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/error/failure.dart';
import '../../../providers/timeline_provider.dart';
import '../../theme/retro_text_styles.dart';
import '../retro/failure_notice.dart';

// 타임라인 맨 아래: 불러오는 중 / 실패(다시 시도) / 비어 있음 / 끝 표시
class TimelineFooter extends StatelessWidget {
  const TimelineFooter({super.key});

  @override
  Widget build(BuildContext context) {
    final isLoading = context.select<TimelineProvider, bool>((p) => p.isLoading);
    final failure = context.select<TimelineProvider, Failure?>((p) => p.failure);
    final isEmpty = context.select<TimelineProvider, bool>((p) => p.items.isEmpty);
    final hasMore = context.select<TimelineProvider, bool>((p) => p.hasMore);

    final Widget child;
    if (failure != null) {
      child = FailureNotice(failure: failure, onRetry: () => context.read<TimelineProvider>().refresh());
    } else if (isLoading) {
      child = const Center(child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2)));
    } else if (isEmpty) {
      child = const Text('아직 남겨진 기억이 없어요.\n첫 기억을 남겨 주세요.', textAlign: TextAlign.center, style: RetroTextStyles.body);
    } else if (!hasMore) {
      child = const Text('— 끝 —', textAlign: TextAlign.center, style: RetroTextStyles.caption);
    } else {
      child = const SizedBox.shrink();
    }

    return Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 96), child: Center(child: child));
  }
}
