import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/memory_date/memory_date_constants.dart';
import 'flap_tile.dart';

// 손으로 돌리는 숫자판 한 칸. 기본 순서: 0 → 1 → … → 9 → X → 0
// symbols 로 돌 수 있는 글자를 좁힐 수 있다(예: 월 첫째 칸은 0, 1, X 만).
// - 위로 끌기: 다음 글자 / 아래로 끌기: 이전 글자 (끄는 거리만큼 여러 칸 넘어감)
// - 탭: 다음 글자
// - 길게 누르기: 바로 X(모름)
class FlapDigitWheel extends StatefulWidget {
  const FlapDigitWheel({
    super.key,
    required this.value,
    required this.onChanged,
    this.symbols = flapSymbols,
    this.semanticLabel,
    this.width = 36,
    this.height = 54,
  });

  final String value;
  final ValueChanged<String> onChanged;

  /// 이 칸이 도는 글자 순서 (마지막은 X 권장 — 길게 누르기가 X 로 보낸다)
  final List<String> symbols;
  final String? semanticLabel; // 예: "연도 셋째 자리"
  final double width;
  final double height;

  @override
  State<FlapDigitWheel> createState() => _FlapDigitWheelState();
}

class _FlapDigitWheelState extends State<FlapDigitWheel> {
  /// 이만큼 끌 때마다 한 칸 넘어간다
  static const double _stepPx = 16;

  late String _current = widget.value;
  double _dragAccum = 0;

  @override
  void didUpdateWidget(covariant FlapDigitWheel oldWidget) {
    super.didUpdateWidget(oldWidget);
    _current = widget.value;
  }

  void _step(int direction) => _set(_neighbor(_current, direction));

  /// from 에서 direction(+1 다음 / -1 이전) 만큼 이동한 글자. 목록에 없는 글자면(드문 경우) 처음 글자.
  String _neighbor(String from, int direction) {
    final symbols = widget.symbols;
    final index = symbols.indexOf(from);
    return index < 0 ? symbols.first : symbols[(index + direction) % symbols.length];
  }

  /// 화면 읽기(TalkBack)용 글자 이름
  static String _spoken(String symbol) => symbol == unknownDigit ? '모름' : symbol;

  void _set(String next) {
    if (next == _current) return;
    _current = next;
    HapticFeedback.selectionClick();
    widget.onChanged(next);
  }

  void _onDragUpdate(DragUpdateDetails details) {
    _dragAccum += details.primaryDelta ?? 0;
    while (_dragAccum <= -_stepPx) {
      _step(1); // 위로 끌기
      _dragAccum += _stepPx;
    }
    while (_dragAccum >= _stepPx) {
      _step(-1); // 아래로 끌기
      _dragAccum -= _stepPx;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: widget.semanticLabel,
      // onIncrease/onDecrease 를 달면 바뀔 값(increasedValue/decreasedValue)도 함께 알려야 한다 (Flutter 규칙)
      value: _spoken(widget.value),
      increasedValue: _spoken(_neighbor(widget.value, 1)),
      decreasedValue: _spoken(_neighbor(widget.value, -1)),
      onIncrease: () => _step(1),
      onDecrease: () => _step(-1),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onVerticalDragStart: (_) => _dragAccum = 0,
        onVerticalDragUpdate: _onDragUpdate,
        onTap: () => _step(1),
        onLongPress: () => _set(unknownDigit),
        child: FlapTile(char: widget.value, width: widget.width, height: widget.height),
      ),
    );
  }
}
