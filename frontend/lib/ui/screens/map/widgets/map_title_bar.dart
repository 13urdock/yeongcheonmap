import 'package:flutter/material.dart';

import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';

// 지도 위 머리띠: 옛 표지판 같은 제목 + 핀 범례(장소 / 축제)
class MapTitleBar extends StatelessWidget {
  const MapTitleBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: RetroColors.paper,
        border: Border.all(color: RetroColors.ink, width: 1.5),
        borderRadius: BorderRadius.circular(4),
        boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 6, offset: Offset(0, 2))],
      ),
      child: Row(
        children: [
          const Expanded(child: Text('영천 기억 지도', style: RetroTextStyles.title)),
          _legend(RetroColors.ink, '장소'),
          const SizedBox(width: 10),
          _legend(RetroColors.festival, '축제'),
        ],
      ),
    );
  }

  Widget _legend(Color color, String label) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 4),
          Text(label, style: RetroTextStyles.caption),
        ],
      );
}
