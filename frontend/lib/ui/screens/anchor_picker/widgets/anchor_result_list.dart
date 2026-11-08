import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/error/failure.dart';
import '../../../../data/models/anchor_target.dart';
import '../../../../data/models/event_pin_model.dart';
import '../../../../data/models/place_pin_model.dart';
import '../../../../data/models/timeline_anchor.dart';
import '../../../../providers/anchor_search_provider.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';
import '../../../widgets/retro/failure_notice.dart';
import 'anchor_candidate_section.dart';
import 'anchor_result_tile.dart';

// 검색 결과: "장소"(기록이 쌓인 곳) + "축제" + "영천의 장소"(실제 장소 검색). 누르면 AnchorTarget 으로 돌려주며 닫힌다.
class AnchorResultList extends StatelessWidget {
  const AnchorResultList({super.key});

  @override
  Widget build(BuildContext context) {
    final search = context.watch<AnchorSearchProvider>();
    final Failure? failure = search.failure;

    if (search.isLoading && search.places.isEmpty && search.events.isEmpty && search.candidates.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (search.hasNoResult) {
      final message = search.searchesCandidates
          ? '찾는 곳이 없어요. 다른 이름으로 찾아보세요.'
          : '가게·건물 이름을 적으면 영천의 장소를 찾아요.';
      return Center(child: Text(message, style: RetroTextStyles.caption));
    }

    void pick(AnchorTarget target) => Navigator.of(context).pop(target);

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        if (search.isLoading) const LinearProgressIndicator(minHeight: 2),
        if (failure != null)
          Padding(
            padding: const EdgeInsets.all(16),
            child: FailureNotice(failure: failure, onRetry: search.search),
          ),
        if (search.places.isNotEmpty) ...[
          const _SectionLabel('장소'),
          for (final p in search.places)
            AnchorResultTile(
              name: p.name,
              detail: _placeDetail(p),
              storyCount: p.storyCount,
              dotColor: RetroColors.place,
              onTap: () => pick(AnchorTarget(anchor: PlaceAnchor(p.placeId), name: p.name)),
            ),
        ],
        if (search.events.isNotEmpty) ...[
          const _SectionLabel('축제'),
          for (final e in search.events)
            AnchorResultTile(
              name: e.name,
              detail: _eventDetail(e),
              storyCount: e.storyCount,
              dotColor: RetroColors.festival,
              onTap: () => pick(AnchorTarget(anchor: EventAnchor(e.eventId), name: e.name)),
            ),
        ],
        AnchorCandidateSection(onPick: pick),
      ],
    );
  }

  String? _placeDetail(PlacePinModel p) {
    final parts = [if (p.usageType != null) p.usageType!, if (p.sinceYear != null) 'since ${p.sinceYear}'];
    return parts.isEmpty ? null : parts.join(' · ');
  }

  String? _eventDetail(EventPinModel e) => e.address;
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(label, style: RetroTextStyles.sectionLabel),
    );
  }
}
