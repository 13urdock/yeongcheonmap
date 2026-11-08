import 'package:flutter/material.dart';

import '../../../theme/retro_text_styles.dart';

// 검색 결과 한 줄: 핀 색 점 · 이름 · (용도/연식 또는 주소) · 기록 수(있을 때)
class AnchorResultTile extends StatelessWidget {
  const AnchorResultTile({
    super.key,
    required this.name,
    required this.detail,
    required this.storyCount,
    required this.dotColor,
    required this.onTap,
  });

  final String name;
  final String? detail;
  /// null 이면 기록 수를 그리지 않는다 (아직 등록 안 된 영천 장소)
  final int? storyCount;

  /// 지도 표시와 같은 색 (장소 = 울트라바이올렛, 축제 = 호박색)
  final Color dotColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Container(width: 12, height: 12, color: dotColor), // 지도 표시와 같은 정사각형
      minLeadingWidth: 12,
      title: Text(name, style: RetroTextStyles.body),
      subtitle: detail == null ? null : Text(detail!, style: RetroTextStyles.caption),
      trailing: storyCount == null ? null : Text('기록 $storyCount', style: RetroTextStyles.caption),
    );
  }
}
