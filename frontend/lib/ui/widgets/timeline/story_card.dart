import 'package:flutter/material.dart';

import '../../../data/models/story_model.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';
import '../retro/stamp_badge.dart';
import '../split_flap/flap_text.dart';
import 'story_photo_strip.dart';

// 기록 카드 한 장 — 옛 입장권/메모지 느낌. 날짜는 작은 숫자판, "그때 이름"은 도장.
class StoryCard extends StatelessWidget {
  const StoryCard({super.key, required this.story});

  final StoryModel story;

  @override
  Widget build(BuildContext context) {
    final nameThen = story.placeNameThen;
    final content = story.content;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  FlapText(story.memoryDate.pattern, tileWidth: 13, tileHeight: 19, gap: 1.5),
                  const SizedBox(width: 12),
                  if (nameThen != null)
                    Expanded(
                      child: Align(alignment: Alignment.centerRight, child: StampBadge('그때 · $nameThen')),
                    ),
                ],
              ),
              if (content != null) ...[
                const SizedBox(height: 10),
                Text(content, style: RetroTextStyles.body),
              ],
              if (story.photos.isNotEmpty) ...[
                const SizedBox(height: 10),
                StoryPhotoStrip(photos: story.photos),
              ],
              const SizedBox(height: 10),
              const Divider(height: 1, color: RetroColors.paperLine),
              const SizedBox(height: 6),
              Text('기록 · ${story.user.name}', style: RetroTextStyles.caption),
            ],
          ),
        ),
      ),
    );
  }
}
