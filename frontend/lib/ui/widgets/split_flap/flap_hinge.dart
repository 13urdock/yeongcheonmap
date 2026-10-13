import 'package:flutter/widgets.dart';

import '../../theme/retro_colors.dart';

// 숫자판 한가운데 가로 경첩선 + 양옆 경첩 핀. (공항 안내판의 "갈라진" 느낌)
class FlapHinge extends StatelessWidget {
  const FlapHinge({super.key, required this.width, required this.height});

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final pinHeight = height * 0.14;
    final pinWidth = width * 0.08;
    return SizedBox(
      width: width,
      height: pinHeight,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(height: 1.5, color: RetroColors.flapHinge),
          Positioned(left: 0, child: _pin(pinWidth, pinHeight)),
          Positioned(right: 0, child: _pin(pinWidth, pinHeight)),
        ],
      ),
    );
  }

  Widget _pin(double w, double h) => Container(
        width: w,
        height: h,
        decoration: BoxDecoration(color: RetroColors.flapHinge, borderRadius: BorderRadius.circular(w / 2)),
      );
}
