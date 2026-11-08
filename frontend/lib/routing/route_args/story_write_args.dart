import '../../data/models/anchor_target.dart';

// 기록 작성(Story_02) 화면 인자. 결과로 true 를 돌려주면 작성 성공.
class StoryWriteArgs {
  const StoryWriteArgs({this.initialTarget});

  /// 미리 정해진 기록 대상(장소/축제 상세에서 들어올 때). 지도에서 바로 들어오면 null → 화면에서 고른다.
  final AnchorTarget? initialTarget;
}
