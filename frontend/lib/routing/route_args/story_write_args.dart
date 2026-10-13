import '../../data/models/timeline_anchor.dart';

// 기록 작성(Story_02) 화면 인자. 결과로 true 를 돌려주면 작성 성공.
class StoryWriteArgs {
  const StoryWriteArgs({required this.anchor, required this.anchorName});

  final TimelineAnchor anchor;

  /// 화면 제목에 보일 장소/축제 이름
  final String anchorName;
}
