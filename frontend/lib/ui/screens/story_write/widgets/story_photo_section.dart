import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/config/constants.dart';
import '../../../../providers/story_write_provider.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';
import '../../../widgets/photo/photo_slider.dart';

// "사진" — 고른 사진을 슬라이드로 보고 빼기 + 사진 추가 버튼 (최대 StoryConstants.maxPhotos 장)
class StoryPhotoSection extends StatelessWidget {
  const StoryPhotoSection({super.key});

  @override
  Widget build(BuildContext context) {
    final paths = context.select<StoryWriteProvider, List<String>>((p) => p.photoPaths);
    final canAdd = context.select<StoryWriteProvider, bool>((p) => p.canAddPhoto);
    final write = context.read<StoryWriteProvider>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const Text('사진', style: RetroTextStyles.sectionLabel),
            const Spacer(),
            Text('${paths.length} / ${StoryConstants.maxPhotos}', style: RetroTextStyles.caption),
          ],
        ),
        const SizedBox(height: 6),
        if (paths.isNotEmpty) ...[
          PhotoSlider(
            images: [for (final path in paths) FileImage(File(path))],
            onRemove: write.removePhotoAt,
          ),
          const SizedBox(height: 8),
        ],
        OutlinedButton.icon(
          onPressed: canAdd ? write.pickPhotos : null,
          icon: const Icon(Icons.add_photo_alternate_outlined),
          label: Text(canAdd ? '사진 추가' : '사진은 ${StoryConstants.maxPhotos}장까지'),
          style: OutlinedButton.styleFrom(
            foregroundColor: RetroColors.ink,
            side: const BorderSide(color: RetroColors.ink),
            minimumSize: const Size.fromHeight(44),
          ),
        ),
      ],
    );
  }
}
