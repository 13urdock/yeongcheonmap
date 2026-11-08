import 'place_candidate_model.dart';
import 'timeline_anchor.dart';

// 기록을 남길 곳 + 화면에 보일 이름. (장소 고르기 화면의 결과, 작성 화면의 대상)
// 둘 중 하나:
// - 등록된 장소/축제: [anchor] 가 있다
// - 아직 등록 안 된 실제 장소(지도 상표, '영천의 장소' 검색): [newPlace] 가 있다 → 보관할 때 장소로 확정
class AnchorTarget {
  const AnchorTarget({required TimelineAnchor this.anchor, required this.name}) : newPlace = null;

  AnchorTarget.newPlace(PlaceCandidateModel this.newPlace)
      : anchor = null,
        name = newPlace.name;

  final TimelineAnchor? anchor;
  final PlaceCandidateModel? newPlace;
  final String name;

  /// 장소(등록됐든 아니든)인지 — 축제가 아닌지
  bool get isPlace => newPlace != null || anchor is PlaceAnchor;
}
