import '../../core/network/api_client.dart';
import '../models/create_story_request.dart';
import '../models/paged_result_model.dart';
import '../models/story_model.dart';
import '../models/timeline_anchor.dart';
import '../models/timeline_order.dart';

// 스토리 리소스 원격 호출 (HTTP + 파싱만): 장소·축제 타임라인, 작성
class StoryRemoteDataSource {
  StoryRemoteDataSource(this._client);

  final ApiClient _client;

  /// GET /places/{id}/stories 또는 GET /events/{id}/stories
  Future<PagedResultModel<StoryModel>> fetchTimeline({
    required TimelineAnchor anchor,
    required TimelineOrder order,
    int page = 1,
    int size = 20,
  }) async {
    final path = switch (anchor) {
      PlaceAnchor(:final placeId) => '/places/$placeId/stories',
      EventAnchor(:final eventId) => '/events/$eventId/stories',
    };
    final data = await _client.get(path, query: {'order': order.query, 'page': page, 'size': size});
    return PagedResultModel.fromJson(data, StoryModel.fromJson);
  }

  /// POST /stories
  Future<StoryModel> create(CreateStoryRequest request) async {
    final data = await _client.post('/stories', body: request.toJson());
    return StoryModel.fromJson(data);
  }
}
