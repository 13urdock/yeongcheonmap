import 'package:flutter/material.dart';

import '../../../../data/models/place_detail_model.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';

// 장소 상세 머리: PLACE · 지금 이름 · 주소
class PlaceHeader extends StatelessWidget {
  const PlaceHeader({super.key, required this.place});

  final PlaceDetailModel place;

  @override
  Widget build(BuildContext context) {
    final address = place.address;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: RetroColors.ink, width: 1.5))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('PLACE', style: RetroTextStyles.sectionLabel),
          const SizedBox(height: 4),
          Text(place.name, style: RetroTextStyles.title),
          if (address != null) ...[
            const SizedBox(height: 8),
            Text(address, style: RetroTextStyles.caption),
          ],
        ],
      ),
    );
  }
}
