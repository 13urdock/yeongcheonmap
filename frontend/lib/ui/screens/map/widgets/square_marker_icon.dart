import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

import '../../../theme/retro_colors.dart';

// 지도 표시용 정사각형 아이콘 (핀 모양 대신). 위젯을 이미지로 한 번 구워 두고 마커마다 재사용한다.
// 가장자리에 얇은 종이색 테두리를 둘러 지도 위에서도 또렷하게.
class SquareMarkerIcon {
  SquareMarkerIcon._();

  static const double side = 14;

  static Future<NOverlayImage> build(BuildContext context, Color color) {
    return NOverlayImage.fromWidget(
      context: context,
      size: const Size.square(side),
      widget: Container(
        width: side,
        height: side,
        decoration: BoxDecoration(color: color, border: Border.all(color: RetroColors.paper, width: 1.5)),
      ),
    );
  }
}
