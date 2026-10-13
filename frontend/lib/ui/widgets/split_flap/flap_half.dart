import 'package:flutter/widgets.dart';

import 'flap_face.dart';

// 숫자판 앞면을 위 또는 아래 반쪽만 잘라서 보여준다.
class FlapHalf extends StatelessWidget {
  const FlapHalf({
    super.key,
    required this.char,
    required this.isTop,
    required this.width,
    required this.height,
  });

  final String char;
  final bool isTop;
  final double width; // 칸 전체 너비
  final double height; // 칸 전체 높이 (반쪽이 아니라)

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: Align(
        alignment: isTop ? Alignment.topCenter : Alignment.bottomCenter,
        heightFactor: 0.5,
        child: FlapFace(char: char, width: width, height: height),
      ),
    );
  }
}
