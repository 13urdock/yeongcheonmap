import 'package:flutter/material.dart';

import '../../../core/memory_date/memory_date_constants.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';

// 숫자판 한 칸의 "앞면 전체"(위·아래 반쪽을 합친 그림). 애니메이션은 flap_tile 이 반쪽씩 잘라 쓴다.
class FlapFace extends StatelessWidget {
  const FlapFace({super.key, required this.char, required this.width, required this.height});

  final String char;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isUnknown = char == unknownDigit;
    return Container(
      width: width,
      height: height,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(height * 0.08),
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [RetroColors.flapBodyLight, RetroColors.flapBody, RetroColors.flapBodyLight],
          stops: [0, 0.5, 1],
        ),
      ),
      child: Text(
        char,
        style: RetroTextStyles.flapGlyph.copyWith(
          fontSize: height * 0.66,
          color: isUnknown ? RetroColors.flapUnknown : RetroColors.flapGlyph,
        ),
      ),
    );
  }
}
