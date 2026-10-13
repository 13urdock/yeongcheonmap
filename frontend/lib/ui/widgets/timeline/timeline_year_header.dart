import 'package:flutter/material.dart';

import '../../../core/memory_date/memory_date_label.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';
import '../split_flap/flap_text.dart';
import 'timeline_year_group.dart';

// 연도 묶음 머리글: 숫자판 연도 + "1990년대" 같은 설명 + 기록 수
class TimelineYearHeader extends StatelessWidget {
  const TimelineYearHeader({super.key, required this.group});

  final TimelineYearGroup group;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Row(
        children: [
          FlapText(group.yearPattern, tileWidth: 22, tileHeight: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              yearGroupLabel(group.yearPattern, yearFrom: group.yearFrom, yearTo: group.yearTo),
              style: RetroTextStyles.sectionLabel,
            ),
          ),
          Text('${group.stories.length}건', style: RetroTextStyles.caption),
          const SizedBox(width: 4),
          Container(width: 24, height: 1.5, color: RetroColors.ink),
        ],
      ),
    );
  }
}
