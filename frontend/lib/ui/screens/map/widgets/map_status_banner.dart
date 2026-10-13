import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/error/failure.dart';
import '../../../../providers/map_provider.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';
import '../../../widgets/retro/failure_notice.dart';

// 지도 하단 상태 표시: 로딩 중 / 실패(재시도). 정상일 땐 아무것도 그리지 않는다.
class MapStatusBanner extends StatelessWidget {
  const MapStatusBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final isLoading = context.select<MapProvider, bool>((p) => p.isLoading);
    final failure = context.select<MapProvider, Failure?>((p) => p.failure);

    if (failure != null) {
      return Padding(
        padding: const EdgeInsets.all(12),
        child: FailureNotice(failure: failure, onRetry: () => context.read<MapProvider>().retry()),
      );
    }
    if (!isLoading) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: RetroColors.paper,
          border: Border.all(color: RetroColors.ink),
          borderRadius: BorderRadius.circular(4),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
            SizedBox(width: 10),
            Text('기억을 불러오는 중…', style: RetroTextStyles.caption),
          ],
        ),
      ),
    );
  }
}
