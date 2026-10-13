import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';

// 살짝 비뚤게 찍힌 고무도장 모양 라벨. 예: "SINCE 1982", "그때 · 중앙분식"
class StampBadge extends StatelessWidget {
  const StampBadge(this.text, {super.key, this.tiltDegrees = -3});

  final String text;
  final double tiltDegrees;

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: tiltDegrees * math.pi / 180,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          border: Border.all(color: RetroColors.stampFaded, width: 1.5),
          borderRadius: BorderRadius.circular(3),
        ),
        child: Text(text, style: RetroTextStyles.stamp, maxLines: 1, overflow: TextOverflow.ellipsis),
      ),
    );
  }
}
