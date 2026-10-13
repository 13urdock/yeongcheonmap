import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../providers/story_write_provider.dart';
import '../../../theme/retro_text_styles.dart';

// "그때 이 자리의 이름"(장소일 때만) + 기억 글 입력
class StoryTextFields extends StatelessWidget {
  const StoryTextFields({super.key});

  @override
  Widget build(BuildContext context) {
    final asksNameThen = context.select<StoryWriteProvider, bool>((p) => p.asksPlaceNameThen);
    final write = context.read<StoryWriteProvider>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (asksNameThen) ...[
          const Text('그때 이 자리의 이름 (선택)', style: RetroTextStyles.sectionLabel),
          const SizedBox(height: 6),
          TextField(
            maxLength: 150,
            onChanged: write.setPlaceNameThen,
            decoration: const InputDecoration(hintText: '예: 중앙분식', counterText: ''),
          ),
          const SizedBox(height: 16),
        ],
        const Text('기억', style: RetroTextStyles.sectionLabel),
        const SizedBox(height: 6),
        TextField(
          minLines: 5,
          maxLines: 12,
          maxLength: 5000,
          onChanged: write.setContent,
          style: RetroTextStyles.body,
          decoration: const InputDecoration(hintText: '그때 이곳에서 있었던 일을 적어 주세요', counterText: ''),
        ),
      ],
    );
  }
}
