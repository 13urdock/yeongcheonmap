import 'package:flutter/material.dart';

import '../../../core/error/failure.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';

// 실패 안내 + 다시 시도. 화면 공용.
class FailureNotice extends StatelessWidget {
  const FailureNotice({super.key, required this.failure, required this.onRetry});

  final Failure failure;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
      decoration: BoxDecoration(
        color: RetroColors.paperDeep,
        border: Border.all(color: RetroColors.stamp),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          Expanded(child: Text(failure.message, style: RetroTextStyles.body.copyWith(color: RetroColors.stamp))),
          TextButton(onPressed: onRetry, child: const Text('다시 시도')),
        ],
      ),
    );
  }
}
