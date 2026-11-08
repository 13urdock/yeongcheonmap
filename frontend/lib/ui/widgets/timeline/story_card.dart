import 'package:flutter/material.dart';

import '../../../data/models/story_model.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';
import '../photo/photo_slider.dart';

// 기록 카드 한 장 — 옛 입장권/메모지 느낌.
// 맨 위 "당시 ○○" (그때 이름이 지금 이름과 다를 때만) · 글 · 사진 슬라이드 · 작성자 이름.
// 날짜는 카드 밖 머리(story_date_header)가 보여준다.
class StoryCard extends StatelessWidget {
  const StoryCard({super.key, required this.story, this.currentName});

  final StoryModel story;

  /// 지금 이름. 그때 이름과 같으면 "당시 ○○" 줄을 비운다.
  final String? currentName;

  @override
  Widget build(BuildContext context) {
    final nameThen = story.placeNameThen?.trim();
    final showNameThen = nameThen != null && nameThen.isNotEmpty && nameThen != currentName?.trim();
    final content = story.content;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (showNameThen) ...[
                Text('당시 $nameThen', style: RetroTextStyles.sectionLabel),
                const SizedBox(height: 8),
              ],
              if (content != null) Text(content, style: RetroTextStyles.body),
              if (story.photos.isNotEmpty) ...[
                const SizedBox(height: 10),
                PhotoSlider(images: [for (final p in story.photos) NetworkImage(p.imageUrl)]),
              ],
              const SizedBox(height: 10),
              const Divider(height: 1, color: RetroColors.paperLine),
              const SizedBox(height: 6),
              Text(story.user.name, style: RetroTextStyles.caption),
            ],
          ),
        ),
      ),
    );
  }
}
