import 'package:flutter/material.dart';

import '../../../data/models/story_photo_model.dart';
import '../../theme/retro_colors.dart';

// 기록 사진 가로 줄 — 흰 테두리 인화지 느낌
class StoryPhotoStrip extends StatelessWidget {
  const StoryPhotoStrip({super.key, required this.photos});

  final List<StoryPhotoModel> photos;

  static const double _size = 96;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: _size,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: photos.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) => Container(
          padding: const EdgeInsets.all(4),
          color: Colors.white,
          child: Image.network(
            photos[i].imageUrl,
            width: _size - 8,
            height: _size - 8,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: _size - 8,
              height: _size - 8,
              color: RetroColors.paperDeep,
              child: const Icon(Icons.image_not_supported_outlined, color: RetroColors.inkMuted),
            ),
          ),
        ),
      ),
    );
  }
}
