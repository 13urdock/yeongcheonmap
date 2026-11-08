import 'package:flutter/material.dart';

import '../split_flap/flap_text.dart';

// 기록 한 건의 머리: 기억 날짜를 숫자판으로 ("1995.07.15", "199X.XX.XX"). 카드 바로 위에 놓인다.
class StoryDateHeader extends StatelessWidget {
  const StoryDateHeader({super.key, required this.pattern});

  final String pattern;

  static const double _tileHeight = 30;
  static const double _tileWidth = _tileHeight / 2;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 6),
      child: Align(
        alignment: Alignment.centerLeft,
        child: FlapText(pattern, tileWidth: _tileWidth, tileHeight: _tileHeight),
      ),
    );
  }
}
