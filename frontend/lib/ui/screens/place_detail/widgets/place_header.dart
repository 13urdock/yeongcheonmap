import 'package:flutter/material.dart';

import '../../../../data/models/place_detail_model.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';
import '../../../widgets/retro/stamp_badge.dart';

// 장소 상세 머리: 지금 이름 · 용도 · since 도장 · 소개 · 주소
class PlaceHeader extends StatelessWidget {
  const PlaceHeader({super.key, required this.place});

  final PlaceDetailModel place;

  @override
  Widget build(BuildContext context) {
    final sinceYear = place.sinceYear;
    final usageType = place.usageType;
    final intro = place.intro;
    final address = place.address;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: RetroColors.ink, width: 1.5))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('PLACE · 지금 이름', style: RetroTextStyles.sectionLabel),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(child: Text(place.name, style: RetroTextStyles.title)),
              if (sinceYear != null) StampBadge('SINCE $sinceYear'),
            ],
          ),
          if (usageType != null) ...[
            const SizedBox(height: 4),
            Text(usageType, style: RetroTextStyles.caption),
          ],
          if (intro != null) ...[
            const SizedBox(height: 10),
            Text(intro, style: RetroTextStyles.body),
          ],
          if (address != null) ...[
            const SizedBox(height: 8),
            Text(address, style: RetroTextStyles.caption),
          ],
        ],
      ),
    );
  }
}
