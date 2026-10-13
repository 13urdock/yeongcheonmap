import 'package:flutter/material.dart';

import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';

// 숫자판 칸 여러 개를 감싸는 검은 베젤 + 아래 라벨(YEAR / MONTH / DAY).
class FlapGroupFrame extends StatelessWidget {
  const FlapGroupFrame({super.key, required this.children, this.label, this.gap = 3});

  final List<Widget> children;
  final String? label;
  final double gap;

  @override
  Widget build(BuildContext context) {
    final spaced = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      if (i > 0) spaced.add(SizedBox(width: gap));
      spaced.add(children[i]);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: RetroColors.flapFrame,
            borderRadius: BorderRadius.circular(6),
            boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 4, offset: Offset(0, 2))],
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: spaced),
        ),
        if (label != null) ...[
          const SizedBox(height: 6),
          Text(label!, style: RetroTextStyles.flapLabel),
        ],
      ],
    );
  }
}
