import '../../data/models/anchor_target.dart';
import '../../data/models/story_model.dart';

// 기록 작성(Story_02)·수정 화면 인자. 결과로 true 를 돌려주면 작성·수정·삭제 성공.
class StoryWriteArgs {
  const StoryWriteArgs({this.initialTarget, this.editingStory});

  /// 수정할 기록. 있으면 수정 모드(값을 채워 열고, 기록할 곳은 바꿀 수 없음, 삭제 가능)
  final StoryModel? editingStory;


  /// 미리 정해진 기록 대상(장소/축제 상세에서 들어올 때). 지도에서 바로 들어오면 null → 화면에서 고른다.
  final AnchorTarget? initialTarget;
}
