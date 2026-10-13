import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import 'flap_half.dart';
import 'flap_hinge.dart';

// 숫자판 한 칸(읽기 전용). 글자가 바뀌면 윗판이 앞으로 넘어가고 아랫판이 내려앉는 플랩 애니메이션.
//   0.0~0.5: 이전 글자의 윗판이 0°→90° 로 접힘 (뒤에서 새 글자 윗판이 드러남)
//   0.5~1.0: 새 글자의 아랫판이 90°→0° 로 펴짐 (그동안 이전 글자 아랫판이 보임)
class FlapTile extends StatefulWidget {
  const FlapTile({super.key, required this.char, this.width = 36, this.height = 54});

  final String char;
  final double width;
  final double height;

  @override
  State<FlapTile> createState() => _FlapTileState();
}

class _FlapTileState extends State<FlapTile> with SingleTickerProviderStateMixin {
  static const _flipDuration = Duration(milliseconds: 140);

  late final AnimationController _controller = AnimationController(vsync: this, duration: _flipDuration);
  late String _previous = widget.char;

  @override
  void didUpdateWidget(covariant FlapTile oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.char != widget.char) {
      _previous = oldWidget.char;
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.width;
    final h = widget.height;
    return SizedBox(
      width: w,
      height: h,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final t = _controller.value;
          final flipping = _controller.isAnimating;
          final current = widget.char;
          final previous = flipping ? _previous : current;
          return Stack(
            children: [
              Positioned(top: 0, child: FlapHalf(char: current, isTop: true, width: w, height: h)),
              Positioned(bottom: 0, child: FlapHalf(char: previous, isTop: false, width: w, height: h)),
              if (flipping && t < 0.5)
                Positioned(
                  top: 0,
                  child: _fold(
                    angle: -math.pi * t,
                    pivot: Alignment.bottomCenter,
                    child: FlapHalf(char: previous, isTop: true, width: w, height: h),
                  ),
                ),
              if (flipping && t >= 0.5)
                Positioned(
                  bottom: 0,
                  child: _fold(
                    angle: math.pi * (1 - t),
                    pivot: Alignment.topCenter,
                    child: FlapHalf(char: current, isTop: false, width: w, height: h),
                  ),
                ),
              Positioned(top: (h - h * 0.14) / 2, child: FlapHinge(width: w, height: h)),
            ],
          );
        },
      ),
    );
  }

  // 원근감을 살짝 준 X축 회전
  Widget _fold({required double angle, required Alignment pivot, required Widget child}) {
    return Transform(
      alignment: pivot,
      transform: Matrix4.identity()
        ..setEntry(3, 2, 0.004)
        ..rotateX(angle),
      child: child,
    );
  }
}
