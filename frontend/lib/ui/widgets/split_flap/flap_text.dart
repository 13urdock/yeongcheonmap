import 'package:flutter/material.dart';

import '../../theme/retro_colors.dart';
import 'flap_tile.dart';

// 읽기 전용 숫자판 글자열. 예: 연도 머리글 "199X", 기록 카드의 "1995.0X.1X".
// '.' 은 칸 대신 작은 점으로 그린다.
class FlapText extends StatelessWidget {
  const FlapText(this.text, {super.key, this.tileWidth = 20, this.tileHeight = 30, this.gap = 2});

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

  Widget _dot() => SizedBox(
        width: tileWidth * 0.35,
        height: tileHeight,
        child: Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            width: tileWidth * 0.18,
            height: tileWidth * 0.18,
            margin: EdgeInsets.only(bottom: tileHeight * 0.1),
            decoration: const BoxDecoration(color: RetroColors.ink, shape: BoxShape.circle),
          ),
        ),
      );
}
