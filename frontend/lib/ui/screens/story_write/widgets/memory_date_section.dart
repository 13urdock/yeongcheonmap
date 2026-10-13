import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/memory_date/memory_date_label.dart';
import '../../../../core/memory_date/memory_date_pattern.dart';
import '../../../../core/memory_date/memory_date_range.dart';
import '../../../../providers/story_write_provider.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';
import '../../../widgets/split_flap/flap_date_picker.dart';

// "언제의 기억인가요?" — 숫자판 + 가능한 날짜 범위 안내 + 전부 모름으로 되돌리기
class MemoryDateSection extends StatelessWidget {
  const MemoryDateSection({super.key});

  @override
  Widget build(BuildContext context) {
    final pattern = context.select<StoryWriteProvider, MemoryDatePattern>((p) => p.pattern);
    final range = context.select<StoryWriteProvider, MemoryDateRange?>((p) => p.range);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('언제의 기억인가요?', style: RetroTextStyles.title),
        const SizedBox(height: 4),
        const Text('칸을 위아래로 밀어 숫자를 맞추세요. 모르는 자리는 X 로 두면 돼요. (길게 누르면 X)', style: RetroTextStyles.caption),
        const SizedBox(height: 16),
        Center(
          child: FlapDatePicker(
            pattern: pattern,
            onDigitChanged: (i, d) => context.read<StoryWriteProvider>().setDigit(i, d),
          ),
        ),
        const SizedBox(height: 12),
        _RangeHint(range: range, pattern: pattern),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: pattern.isFullyUnknown ? null : () => context.read<StoryWriteProvider>().resetDate(),
            child: const Text('전부 모름으로 (XXXX.XX.XX)'),
          ),
        ),
      ],
    );
  }
}

class _RangeHint extends StatelessWidget {
  const _RangeHint({required this.range, required this.pattern});

  final MemoryDateRange? range;
  final MemoryDatePattern pattern;

  @override
  Widget build(BuildContext context) {
    final r = range;
    if (r == null) {
      return Text('이 조합으로는 가능한 날짜가 없어요. (예: 2월 30일, 미래의 날짜)',
          textAlign: TextAlign.center, style: RetroTextStyles.caption.copyWith(color: RetroColors.stamp));
    }
    final groupLabel = yearGroupLabel(pattern.year, yearFrom: r.yearFrom, yearTo: r.yearTo);
    final detail = pattern.isYearUnknown ? '언제든 괜찮아요' : rangeLabel(r);
    return Text('$groupLabel · $detail', textAlign: TextAlign.center, style: RetroTextStyles.caption);
  }
}
