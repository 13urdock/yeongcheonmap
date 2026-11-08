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
          // 장소↔축제를 바꿔 이 칸이 사라졌다 다시 생겨도 적어 둔 값이 보이게 initialValue 로 연결
          TextFormField(
            initialValue: write.placeNameThen,
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
          decoration: const InputDecoration(hintText: '그때의 추억을 적어주세요.', counterText: ''),
        ),
      ],
    );
  }
}
