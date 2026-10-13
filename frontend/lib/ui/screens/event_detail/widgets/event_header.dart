import 'package:flutter/material.dart';

import '../../../../data/models/event_detail_model.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';
import '../../../widgets/split_flap/flap_text.dart';

// 축제 상세 머리: 이름 · 소개 · 주최 · 개최 연도(작은 숫자판들)
class EventHeader extends StatelessWidget {
  const EventHeader({super.key, required this.event});

  final EventDetailModel event;

  @override
  Widget build(BuildContext context) {
    final content = event.content;
    final address = event.address;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: RetroColors.ink, width: 1.5))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('FESTIVAL', style: RetroTextStyles.sectionLabel.copyWith(color: RetroColors.festival)),
          const SizedBox(height: 4),
          Text(event.name, style: RetroTextStyles.title),
          if (content != null) ...[
            const SizedBox(height: 10),
            Text(content, style: RetroTextStyles.body),
          ],
          if (event.hosts.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text('주최 · ${event.hosts.map((h) => h.hostName).join(', ')}', style: RetroTextStyles.caption),
          ],
          if (address != null) ...[
            const SizedBox(height: 4),
            Text(address, style: RetroTextStyles.caption),
          ],
          if (event.occurrences.isNotEmpty) ...[
            const SizedBox(height: 14),
            const Text('개최 연도', style: RetroTextStyles.sectionLabel),
            const SizedBox(height: 6),
            Wrap(
              spacing: 10,
              runSpacing: 8,
              children: [
                for (final o in event.occurrences) FlapText('${o.year}', tileWidth: 14, tileHeight: 20, gap: 1.5),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
