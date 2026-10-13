import 'package:flutter/material.dart';

import '../../../core/memory_date/memory_date_digit_rules.dart';
import '../../../core/memory_date/memory_date_pattern.dart';
import '../../theme/retro_colors.dart';
import 'flap_digit_wheel.dart';
import 'flap_group_frame.dart';

// 기억 날짜 입력용 공항 숫자판: [Y][Y][Y][Y] . [M][M] . [D][D]
// 각 칸을 위아래로 끌어 돌린다. 모르는 자리는 X 로 둔다. 월·일 칸은 상한선 안의 숫자만 돈다(memory_date_digit_rules).
// 상태는 갖지 않고 부모(provider)에 위임.
class FlapDatePicker extends StatelessWidget {
  const FlapDatePicker({
    super.key,
    required this.pattern,
    required this.onDigitChanged,
    this.tileWidth = 36,
    this.tileHeight = 54,
  });

  final MemoryDatePattern pattern;
  final void Function(int index, String digit) onDigitChanged;
  final double tileWidth;
  final double tileHeight;

  static const _digitNames = ['연도 첫째', '연도 둘째', '연도 셋째', '연도 넷째', '월 첫째', '월 둘째', '일 첫째', '일 둘째'];

  @override
  Widget build(BuildContext context) {
    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FlapGroupFrame(label: 'YEAR', children: _wheels(0, 4)),
          _dot(),
          FlapGroupFrame(label: 'MONTH', children: _wheels(4, 6)),
          _dot(),
          FlapGroupFrame(label: 'DAY', children: _wheels(6, 8)),
        ],
      ),
    );
  }

  List<Widget> _wheels(int start, int end) => [
        for (var i = start; i < end; i++)
          FlapDigitWheel(
            value: pattern.digits[i],
            symbols: allowedSymbolsAt(pattern, i),
            onChanged: (digit) => onDigitChanged(i, digit),
            semanticLabel: '${_digitNames[i]} 자리',
            width: tileWidth,
            height: tileHeight,
          ),
      ];

  // 그룹 사이 마침표
  Widget _dot() => SizedBox(
        width: tileWidth * 0.5,
        height: tileHeight + 10,
        child: Align(
          alignment: const Alignment(0, 0.75),
          child: Container(
            width: tileWidth * 0.16,
            height: tileWidth * 0.16,
            decoration: const BoxDecoration(color: RetroColors.ink, shape: BoxShape.circle),
          ),
        ),
      );
}
