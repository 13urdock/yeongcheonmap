import 'package:flutter/material.dart';

import '../../../data/models/timeline_order.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';

// 정렬 방향 전환: 옛날부터(오름차순) / 최근부터(내림차순). 기억 날짜 기준.
class TimelineSortToggle extends StatelessWidget {
  const TimelineSortToggle({super.key, required this.order, required this.onChanged, required this.totalCount});

  final TimelineOrder order;
  final ValueChanged<TimelineOrder> onChanged;
  final int totalCount;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Text('기록 $totalCount건', style: RetroTextStyles.sectionLabel),
          const Spacer(),
          _option('옛날부터 ↑', TimelineOrder.asc),
          const SizedBox(width: 6),
          _option('최근부터 ↓', TimelineOrder.desc),
        ],
      ),
    );
  }

  Widget _option(String label, TimelineOrder value) {
    final selected = order == value;
    return InkWell(
      onTap: selected ? null : () => onChanged(value),
      borderRadius: BorderRadius.circular(3),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? RetroColors.ink : Colors.transparent,
          border: Border.all(color: RetroColors.ink),
          borderRadius: BorderRadius.circular(3),
        ),
        child: Text(
          label,
          style: RetroTextStyles.caption.copyWith(
            color: selected ? RetroColors.paper : RetroColors.ink,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
