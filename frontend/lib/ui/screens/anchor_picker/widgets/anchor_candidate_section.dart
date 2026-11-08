import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../data/models/anchor_target.dart';
import '../../../../data/models/place_candidate_model.dart';
import '../../../../data/models/timeline_anchor.dart';
import '../../../../providers/anchor_search_provider.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';
import 'anchor_result_tile.dart';

// '영천의 장소' 묶음: 지도 회사 검색으로 찾은 실제 장소. 누르면 AnchorTarget 으로 돌려주며 닫힌다.
// 이미 등록된 장소(placeId 있음)는 그 장소로, 아니면 새 장소(보관할 때 확정)로.
class AnchorCandidateSection extends StatelessWidget {
  const AnchorCandidateSection({super.key, required this.onPick});

  final void Function(AnchorTarget target) onPick;

  @override
  Widget build(BuildContext context) {
    final search = context.watch<AnchorSearchProvider>();
    if (!search.searchesCandidates) {
      return const _Hint('이름을 적으면 영천의 가게·건물도 찾아요.');
    }
    final failure = search.candidateFailure;
    if (failure != null) {
      // 이유(서버 메시지)를 같이 보여 준다 — 키 미설정·연결 실패 등을 화면에서 바로 알 수 있게
      return _Hint('영천 장소 검색을 지금 쓸 수 없어요 (${failure.message}). 지도에서 상표를 눌러 기록할 수 있어요.');
    }
    if (search.candidates.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 4),
          child: Text('영천의 장소', style: RetroTextStyles.sectionLabel),
        ),
        for (final c in search.candidates)
          AnchorResultTile(
            name: c.name,
            detail: _detail(c),
            storyCount: null,
            dotColor: RetroColors.inkMuted,
            onTap: () => onPick(_toTarget(c)),
          ),
      ],
    );
  }

  AnchorTarget _toTarget(PlaceCandidateModel c) {
    final placeId = c.placeId;
    return placeId == null ? AnchorTarget.newPlace(c) : AnchorTarget(anchor: PlaceAnchor(placeId), name: c.name);
  }

  String? _detail(PlaceCandidateModel c) {
    final category = c.category?.split('>').last.trim();
    final parts = [if (category != null && category.isNotEmpty) category, if (c.address != null) c.address!];
    return parts.isEmpty ? null : parts.join(' · ');
  }
}

class _Hint extends StatelessWidget {
  const _Hint(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Text(text, style: RetroTextStyles.caption),
    );
  }
}
