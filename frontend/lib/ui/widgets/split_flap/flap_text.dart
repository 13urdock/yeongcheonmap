import 'package:flutter/material.dart';

import '../../theme/retro_colors.dart';
import 'flap_tile.dart';

// 읽기 전용 숫자판 글자열. 예: 연도 머리글 "199X", 기록 카드의 "1995.0X.1X".
// '.' 은 칸 대신 작은 점으로 그린다.
class FlapText extends StatelessWidget {
  const FlapText(this.text, {super.key, this.tileWidth = 16, this.tileHeight = 32, this.gap = 2});

  final String text;
  final double tileWidth;
  final double tileHeight;
  final double gap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final char in text.split(''))
          Padding(
            padding: EdgeInsets.only(right: gap),
            child: char == '.' ? _dot() : FlapTile(char: char, width: tileWidth, height: tileHeight),
          ),
      ],
    );
  }

  // 점 크기는 칸 높이 기준 (칸이 좁아져도 점이 너무 작아지지 않게)
  Widget _dot() => SizedBox(
        width: tileHeight * 0.22,
        height: tileHeight,
        child: Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            width: tileHeight * 0.1,
            height: tileHeight * 0.1,
            margin: EdgeInsets.only(bottom: tileHeight * 0.08),
            decoration: const BoxDecoration(color: RetroColors.ink, shape: BoxShape.circle),
          ),
        ),
      );
}
