import '../../core/error/failure_mapper.dart';
import '../../core/error/result.dart';
import '../datasources/story_remote_datasource.dart';
import '../models/create_story_request.dart';
import '../models/paged_result_model.dart';
import '../models/story_model.dart';
import '../models/timeline_anchor.dart';
import '../models/timeline_order.dart';

// 스토리 데이터 제공: 타임라인 페이지, 작성. 예외를 Failure 로 바꿔 Result 로 돌려준다.
class StoryRepository {
  StoryRepository(this._remote);

  final StoryRemoteDataSource _remote;

  static const int pageSize = 20;

  Future<Result<PagedResultModel<StoryModel>>> getTimelinePage({
    required TimelineAnchor anchor,
    required TimelineOrder order,
    required int page,
  }) {
    return runGuarded(() => _remote.fetchTimeline(anchor: anchor, order: order, page: page, size: pageSize));
  }

  Future<Result<StoryModel>> create(CreateStoryRequest request) {
    return runGuarded(() => _remote.create(request));
  }
}
